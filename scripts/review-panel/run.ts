/**
 * review-panel/run.ts — ejecuta el panel multimodelo (docs/17).
 * Solo llamadas reales con NAN_API_KEY; los tests usan `callModel` inyectado.
 * `reviewItems` devuelve el resultado por ítem; `runPanel` lo agrega por regla.
 */
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { extractJson, mapPool, NanClient } from "./client";
import { extractAll, type PanelItem } from "./items";

export const panelVerdictSchema = z.strictObject({
	fidelity: z.enum(["exact", "too_strict", "too_lax", "wrong", "cannot_tell"]),
	hardness: z.enum(["ok", "should_be_soft", "should_be_hard"]),
	falseNegativeRisk: z.enum(["none", "low", "high"]),
	falsePositiveRisk: z.enum(["none", "low", "high"]),
	missingRequirements: z
		.array(z.strictObject({ quote: z.string(), why: z.string() }))
		.default([]),
	explanation: z.string(),
});
export type PanelVerdict = z.infer<typeof panelVerdictSchema>;

export type Aggregate = "pass" | "escalate";

/** Agregación determinista (docs/17 §5). */
export function aggregate(item: PanelItem, verdicts: PanelVerdict[]): {
	result: Aggregate;
	reason?: string;
} {
	// descartar missingRequirements cuya quote no está literal en el contexto
	const clean = verdicts.map((v) => ({
		...v,
		missingRequirements: (v.missingRequirements ?? []).filter(
			(m) => item.context && item.context.includes(m.quote),
		),
	}));
	for (const v of clean) {
		if (v.fidelity === "too_lax" || v.falsePositiveRisk === "high")
			return { result: "escalate", reason: "falso positivo" };
		if (v.fidelity === "too_strict" || v.falseNegativeRisk === "high")
			return { result: "escalate", reason: "falso negativo" };
	}
	for (const v of clean) {
		// En ítems de completitud no hay condición/extracto que juzgar: solo
		// escala un requisito ausente declarado por el modelo (la quote se ha
		// validado contra el contexto arriba).
		if (item.kind === "completeness") {
			if (v.missingRequirements.length > 0)
				return { result: "escalate", reason: "missingRequirements" };
			continue;
		}
		if (v.fidelity === "wrong" || v.fidelity === "cannot_tell")
			return { result: "escalate", reason: `fidelity=${v.fidelity}` };
		if (v.hardness !== "ok") return { result: "escalate", reason: `hardness=${v.hardness}` };
		if (v.missingRequirements.length > 0)
			return { result: "escalate", reason: "missingRequirements" };
	}
	return { result: "pass" };
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Huella del contenido revisable del ítem (lo que ve el modelo). */
export function itemFingerprint(item: PanelItem): string {
	return sha256(
		JSON.stringify({
			label: item.label,
			hard: item.hard,
			condition: item.condition,
			conditionPlain: item.conditionPlain,
			excerpt: item.excerpt,
			context: item.context,
			modelled: item.modelledIds,
			uncovered: item.uncoveredIds,
		}),
	).slice(0, 16);
}

export type CallModel = (input: {
	model: string;
	prompt: string;
	item: PanelItem;
}) => Promise<string>;

export interface CallResult {
	raw: string;
	ms?: number;
	usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

type CallModelFull = (input: {
	model: string;
	prompt: string;
	item: PanelItem;
}) => Promise<CallResult>;

let sharedClient: NanClient | null = null;

const defaultCallFull: CallModelFull = async ({ model, prompt, item }) => {
	const key = process.env.NAN_API_KEY;
	if (!key) throw new Error("NAN_API_KEY no definida");
	sharedClient ??= new NanClient(key, { concurrency: 6, rpm: 50 });
	const res = await sharedClient.call({
		model,
		system: prompt,
		user: JSON.stringify({
			label: item.label,
			hard: item.hard,
			condition: item.condition,
			conditionPlain: item.conditionPlain,
			excerpt: item.excerpt,
			context: item.context,
			modelled: item.modelledIds,
			uncovered: item.uncoveredIds,
		}),
	});
	return { raw: res.content, ms: res.latencyMs, usage: res.usage };
};

/** Veredicto de un modelo sobre un ítem. */
export interface ModelVerdict {
	model: string;
	verdict: PanelVerdict;
	/** false si la salida no pasó el Zod ni en el reintento */
	valid: boolean;
}

export interface ItemResult {
	item: PanelItem;
	verdicts: ModelVerdict[];
	agg: { result: Aggregate; reason?: string };
}

export interface RunOptions {
	models: string[];
	promptVersion: string;
	outDir: string;
	cacheDir: string;
	callModel?: CallModel;
	concurrency?: number;
}

export function parseVerdict(raw: string): PanelVerdict | null {
	const json = extractJson(raw);
	if (!json) return null;
	try {
		const p = panelVerdictSchema.safeParse(JSON.parse(json));
		return p.success ? p.data : null;
	} catch {
		return null;
	}
}

const INVALID_VERDICT: PanelVerdict = {
	fidelity: "cannot_tell",
	hardness: "ok",
	falseNegativeRisk: "none",
	falsePositiveRisk: "none",
	missingRequirements: [],
	explanation: "salida inválida",
};

/**
 * Revisa cada ítem con todos los modelos (pool acotado, caché por huella,
 * registro crudo en outDir/raw/calls.jsonl). Devuelve un ItemResult por ítem,
 * en el mismo orden de entrada.
 */
export async function reviewItems(items: PanelItem[], opts: RunOptions): Promise<ItemResult[]> {
	mkdirSync(opts.cacheDir, { recursive: true });
	mkdirSync(join(opts.outDir, "raw"), { recursive: true });
	const prompt = readFileSync(
		join(process.cwd(), `prompts/${opts.promptVersion}.md`),
		"utf8",
	);
	const promptHash = sha256(prompt).slice(0, 8);
	const log = (entry: object) =>
		appendFileSync(join(opts.outDir, "raw", "calls.jsonl"), `${JSON.stringify(entry)}\n`);

	interface Task {
		itemIndex: number;
		model: string;
	}
	const tasks: Task[] = [];
	items.forEach((_, itemIndex) => {
		for (const model of opts.models) tasks.push({ itemIndex, model });
	});

	const verdictGrid: (ModelVerdict | null)[][] = items.map(() =>
		opts.models.map(() => null),
	);

	const call: CallModelFull = opts.callModel
		? async (i) => ({ raw: await opts.callModel!(i) })
		: defaultCallFull;
	await mapPool(tasks, opts.concurrency ?? 6, async ({ itemIndex, model }) => {
		const item = items[itemIndex];
		const modelIndex = opts.models.indexOf(model);
		const key = sha256(`${model}|${opts.promptVersion}|${promptHash}|${item.ruleSlug}|${item.itemId}|${itemFingerprint(item)}`);
		const cacheFile = join(opts.cacheDir, `${key}.json`);
		const ref = `${item.ruleSlug}/${item.itemId}`;
		let res: CallResult | null = existsSync(cacheFile)
			? { raw: readFileSync(cacheFile, "utf8") }
			: null;
		let v = res ? parseVerdict(res.raw) : null;
		if (res && !v) res = null; // la caché solo guarda respuestas válidas
		for (let attempt = 0; !v && attempt < 2; attempt++) {
			try {
				res = await call({ model, prompt, item });
			} catch (e) {
				log({ model, item: ref, at: new Date().toISOString(), error: String(e) });
				res = null;
				continue;
			}
			v = parseVerdict(res.raw);
			if (v) {
				writeFileSync(cacheFile, res.raw);
				log({ model, item: ref, at: new Date().toISOString(), ms: res.ms, usage: res.usage, raw: res.raw });
			} else {
				log({ model, item: ref, at: new Date().toISOString(), ms: res.ms, valid: false, raw: res.raw });
			}
		}
		verdictGrid[itemIndex][modelIndex] = { model, verdict: v ?? INVALID_VERDICT, valid: v !== null };
	});

	return items.map((item, i) => {
		const verdicts = verdictGrid[i].filter((x): x is ModelVerdict => x !== null);
		return { item, verdicts, agg: aggregate(item, verdicts.map((v) => v.verdict)) };
	});
}

export async function runPanel(
	items: PanelItem[],
	opts: RunOptions,
): Promise<{ slug: string; status: "approved" | "escalated" }[]> {
	const results = await reviewItems(items, opts);
	const bySlug = new Map<string, ItemResult[]>();
	for (const r of results) {
		const list = bySlug.get(r.item.ruleSlug) ?? [];
		list.push(r);
		bySlug.set(r.item.ruleSlug, list);
	}
	return [...bySlug.entries()].map(([slug, rows]) => ({
		slug,
		status: rows.every((r) => r.agg.result === "pass") ? ("approved" as const) : ("escalated" as const),
	}));
}

// CLI
if (process.argv[1]?.endsWith("run.ts") || process.argv[1]?.endsWith("run.js")) {
	const root = process.cwd();
	const items = extractAll(root);
	const res = await runPanel(items, {
		models: ["deepseek-v4-flash", "qwen3.8-flash", "mimo-v2.6-flash"],
		promptVersion: "panel-v1",
		outDir: join(root, "evidence/2026-10-06-panel"),
		cacheDir: join(root, ".cache/panel"),
	});
	for (const r of res) console.log(r.status === "approved" ? "PASS" : "ESCALA", r.slug);
}
