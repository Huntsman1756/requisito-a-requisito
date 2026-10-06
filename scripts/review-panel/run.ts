/**
 * review-panel/run.ts — ejecuta el panel multimodelo (docs/17).
 * Solo llamadas reales con NAN_API_KEY; los tests usan `callModel` inyectado.
 */
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
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
		if (v.fidelity === "wrong" || v.fidelity === "cannot_tell")
			return { result: "escalate", reason: `fidelity=${v.fidelity}` };
		if (v.hardness !== "ok") return { result: "escalate", reason: `hardness=${v.hardness}` };
		if (v.missingRequirements.length > 0)
			return { result: "escalate", reason: "missingRequirements" };
	}
	return { result: "pass" };
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export type CallModel = (input: {
	model: string;
	prompt: string;
	item: PanelItem;
}) => Promise<string>;

async function defaultCall({ model, prompt, item }: { model: string; prompt: string; item: PanelItem }): Promise<string> {
	const key = process.env.NAN_API_KEY;
	if (!key) throw new Error("NAN_API_KEY no definida");
	const r = await fetch("https://api.nan.builders/v1/chat/completions", {
		method: "POST",
		headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
		body: JSON.stringify({
			model,
			temperature: 0,
			max_tokens: 600,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: prompt },
				{ role: "user", content: JSON.stringify({ label: item.label, condition: item.condition, conditionPlain: item.conditionPlain, excerpt: item.excerpt, context: item.context, modelled: item.modelledIds, uncovered: item.uncoveredIds }) },
			],
		}),
	});
	if (!r.ok) throw new Error(`NAN ${r.status}`);
	const j = (await r.json()) as { choices: { message: { content: string } }[] };
	return j.choices[0].message.content;
}

export interface RunOptions {
	models: string[];
	promptVersion: string;
	outDir: string;
	cacheDir: string;
	callModel?: CallModel;
	concurrency?: number;
}

export async function runPanel(
	items: PanelItem[],
	opts: RunOptions,
): Promise<{ slug: string; status: "approved" | "escalated" }[]> {
	mkdirSync(opts.cacheDir, { recursive: true });
	mkdirSync(join(opts.outDir, "raw"), { recursive: true });
	const prompt = readFileSync(
		join(process.cwd(), `prompts/${opts.promptVersion}.md`),
		"utf8",
	);
	const bySlug = new Map<string, { item: PanelItem; agg: ReturnType<typeof aggregate> }[]>();
	for (const item of items) {
		const verdicts: PanelVerdict[] = [];
		for (const model of opts.models) {
			const key = sha256(`${model}|${opts.promptVersion}|${item.ruleSlug}|${item.itemId}|${item.excerpt ?? ""}`);
			const cacheFile = join(opts.cacheDir, `${key}.json`);
			const parse = (s: string): PanelVerdict | null => {
				try {
					const p = panelVerdictSchema.safeParse(JSON.parse(s));
					return p.success ? p.data : null;
				} catch {
					return null;
				}
			};
			const record = (raw: string): void => {
				writeFileSync(cacheFile, raw);
				appendFileSync(
					join(opts.outDir, "raw", "calls.jsonl"),
					`${JSON.stringify({ model, item: `${item.ruleSlug}/${item.itemId}`, at: new Date().toISOString(), raw })}\n`,
				);
			};
			// solo se cachea una respuesta válida; una inválida se reintenta y,
			// si sigue mal, cuenta como cannot_tell sin ensuciar la caché
			let v = existsSync(cacheFile)
				? parse(readFileSync(cacheFile, "utf8"))
				: null;
			if (!v) {
				const raw = await (opts.callModel ?? defaultCall)({ model, prompt, item });
				v = parse(raw);
				if (v) record(raw);
				else {
					const retry = await (opts.callModel ?? defaultCall)({ model, prompt, item });
					v = parse(retry);
					if (v) record(retry);
				}
			}
			verdicts.push(
				v ?? {
					fidelity: "cannot_tell",
					hardness: "ok",
					falseNegativeRisk: "none",
					falsePositiveRisk: "none",
					missingRequirements: [],
					explanation: "salida inválida",
				},
			);
		}
		const agg = aggregate(item, verdicts);
		const list = bySlug.get(item.ruleSlug) ?? [];
		list.push({ item, agg });
		bySlug.set(item.ruleSlug, list);
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
