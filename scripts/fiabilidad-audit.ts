/**
 * fiabilidad-audit.ts — F10-FIAB-A: auditoría de fiabilidad del producto.
 *
 * Responde con datos a «¿puede alguien en Madrid fiarse de lo que le dice la
 * web hoy?». Solo mide; no toca reglas ni datos. Salida:
 *   evidence/<fecha>-F10/fiabilidad-audit.json  + resumen por consola.
 *
 * Cubre:
 *  1. Vigencia y plazos: estado de plazo que muestra la web hoy por regla, y
 *     muestra determinista de fichas de nivel 2 frente a su fuente oficial
 *     (sede CM: el campo cf-presenta-solicitud dice «ha finalizado»).
 *  2. Frescura: corridas de freshness, fuentes saltadas/errores, snapshots
 *     sin revisar hace >48 h.
 *  3. Parámetros: resolución a hoy, vigencia que cubre la fecha, citas.
 *  5. Asimetría: tabla de requisitos hard (¿pueden dar F con dato impreciso?
 *     ¿referencian campos que el cuestionario nunca pregunta?).
 *  Extra: edad de verifiedAt por regla (I8).
 *
 * Uso: npx tsx scripts/fiabilidad-audit.ts [--today YYYY-MM-DD] [--out <ruta>]
 *      [--skip-net]  (sin red: se omite la muestra de nivel 2)
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deadlineState } from "../src/lib/eligibility-engine/deadline";
import { resolveParam } from "../src/lib/eligibility-engine/params";
import {
	parametersSchema,
	questionCatalogSchema,
	ruleSetSchema,
	type Condition,
	type RuleSet,
} from "../src/lib/eligibility-engine/schema";

const root = process.cwd();
const args = process.argv.slice(2);
const argValue = (k: string) => {
	const i = args.indexOf(k);
	return i >= 0 ? args[i + 1] : undefined;
};
const TODAY = argValue("--today") ?? new Date().toISOString().slice(0, 10);
const OUT =
	argValue("--out") ??
	join(root, "evidence", `${TODAY}-F10`, "fiabilidad-audit.json");
const SKIP_NET = args.includes("--skip-net");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const RULES_DIR = join(root, "data/eligibility/rules");
const rules: { file: string; rs: RuleSet }[] = readdirSync(RULES_DIR)
	.filter((f) => f.endsWith(".json"))
	.sort()
	.map((f) => ({
		file: f,
		rs: ruleSetSchema.parse(
			JSON.parse(readFileSync(join(RULES_DIR, f), "utf8")),
		),
	}));

// ---------- 1a. Plazos del nivel 1 ----------
const DAY = 86_400_000;
const ageDays = (iso: string) =>
	Math.floor(
		(new Date(`${TODAY}T00:00:00Z`).getTime() -
			new Date(`${iso}T00:00:00Z`).getTime()) /
			DAY,
	);

const deadlines = rules.map(({ file, rs }) => {
	const w = rs.application.window;
	const d = deadlineState(w, TODAY);
	const flags: string[] = [];
	if (d.state === "OPEN" && w.closesAt && w.closesAt < TODAY)
		flags.push("OPEN_CON_CIERRE_VENCIDO");
	if (d.state === "CLOSED" && w.closesAt && w.closesAt >= TODAY)
		flags.push("CLOSED_CON_CIERRE_FUTURO");
	if (
		d.state === "CLOSED_RECURRING" &&
		d.nextOpeningEstimate &&
		d.nextOpeningEstimate <= TODAY
	)
		flags.push("ESTIMACION_REAPERTURA_EN_PASADO");
	if (w.closesAt && w.closesAt < TODAY && d.state !== "CLOSED_RECURRING" && d.state !== "CLOSED")
		flags.push("CIERRE_VENCIDO_SIN_ESTADO_CERRADO");
	return {
		file,
		slug: rs.benefitSlug,
		rulesVersion: rs.rulesVersion,
		validFrom: rs.validFrom,
		validUntil: rs.validUntil,
		verifiedAt: rs.verifiedAt,
		ageVerifiedAtDays: ageDays(rs.verifiedAt),
		state: d.state,
		opensAt: w.opensAt,
		closesAt: w.closesAt,
		recurrence: w.recurrence,
		previousCalls: w.previousCalls?.length ?? 0,
		nextOpeningEstimate: d.nextOpeningEstimate,
		humanReview: rs.humanReview.status,
		flags,
	};
});

// ---------- 1b. Muestra determinista de nivel 2 ----------
interface L2Item {
	slug: string;
	displayTitle?: string;
	officialSourceUrl?: string;
	accessState?: string;
}
const l2 = JSON.parse(
	readFileSync(join(root, "public/datos/elegibilidad/nivel-2.json"), "utf8"),
) as { items: L2Item[] };
const items = [...l2.items].sort((a, b) => a.slug.localeCompare(b.slug));
const N = Math.min(40, items.length);
const sample: L2Item[] = [];
for (let i = 0; i < N; i++) sample.push(items[Math.floor((i * items.length) / N)]);

function sedeStateFromHtml(html: string): "CLOSED" | "OPEN_OR_UNKNOWN" {
	// La sede CM escribe en el campo cf-presenta-solicitud «El plazo para
	// presentar esta solicitud ha finalizado.» cuando la convocatoria cerró.
	const i = html.indexOf("cf-presenta-solicitud");
	if (i < 0) return "OPEN_OR_UNKNOWN";
	const block = html.slice(i, i + 3000);
	return /ha finalizado/i.test(block) ? "CLOSED" : "OPEN_OR_UNKNOWN";
}

async function checkL2(): Promise<unknown[]> {
	const out: unknown[] = [];
	for (const it of sample) {
		const url = it.officialSourceUrl;
		if (!url) {
			out.push({ slug: it.slug, accessState: it.accessState, check: "sin url" });
			continue;
		}
		try {
			const r = await fetch(url, {
				headers: { "user-agent": "requisito-a-requisito-fiabilidad/1.0" },
				redirect: "follow",
			});
			const html = await r.text();
			const host = new URL(url).host;
			let observed: string = r.status < 400 ? "alive" : `http_${r.status}`;
			let mismatch = false;
			if (host.endsWith("comunidad.madrid") && r.status === 200) {
				const s = sedeStateFromHtml(html);
				if (s === "CLOSED") {
					observed = "sede:plazo_finalizado";
					mismatch = it.accessState === "OPEN" || it.accessState === "ROLLING";
				} else {
					observed = "sede:sin_marca_cierre";
					mismatch = it.accessState === "CLOSED"; // cerrada en nivel 2 sin marca de cierre
				}
			}
			out.push({
				slug: it.slug,
				accessState: it.accessState,
				url,
				observed,
				mismatch: mismatch || r.status >= 400,
			});
		} catch (e) {
			out.push({
				slug: it.slug,
				accessState: it.accessState,
				url,
				observed: `error: ${String(e).slice(0, 80)}`,
				mismatch: true,
			});
		}
		await sleep(350);
	}
	return out;
}

// ---------- 2. Frescura ----------
const runs = readFileSync(join(root, "data/freshness/runs.jsonl"), "utf8")
	.trim()
	.split("\n")
	.map((l) => JSON.parse(l));
const lastCi = [...runs].reverse().find((r) => (r.runner ?? "ci") === "ci");
const lastLocal = [...runs].reverse().find((r) => r.runner === "local");
// «Sin revisar hace >48 h» = fuentes que el último CI se saltó (no las puede
// verificar) y cuya última corrida local que las cubre tiene >48 h.
const lastLocalDate = lastLocal?.date as string | undefined;
const localTooOld =
	lastLocalDate === undefined || ageDays(lastLocalDate) > 2;
const unverified48h = localTooOld ? (lastCi?.skipped ?? []) : [];
const staleFile = join(root, "data/eligibility/freshness-stale.json");
const staleNow = existsSync(staleFile)
	? (JSON.parse(readFileSync(staleFile, "utf8")).stale as string[])
	: [];

// ---------- 3. Parámetros ----------
const parameters = parametersSchema.parse(
	JSON.parse(readFileSync(join(root, "data/eligibility/parameters.json"), "utf8")),
);
const paramsReport = parameters.parameters.map((p) => {
	const value = resolveParam(parameters, p.id, TODAY);
	const covering = p.periods.find(
		(per) => per.from <= TODAY && (per.to === undefined || per.to >= TODAY),
	);
	return {
		id: p.id,
		label: p.label,
		valueToday: value,
		periodFrom: covering?.from,
		periodTo: covering?.to,
		coversToday: covering !== undefined,
		citationSource: covering?.citation.sourceId,
		citationLocator: covering?.citation.locator,
	};
});
const paramsUsed = new Map<string, string[]>();
for (const { rs } of rules)
	for (const p of rs.parametersUsed ?? [])
		paramsUsed.set(p, [...(paramsUsed.get(p) ?? []), rs.benefitSlug]);

const amounts = rules
	.filter(({ rs }) => rs.amount)
	.map(({ rs }) => ({
		slug: rs.benefitSlug,
		type: rs.amount?.type,
		minEur: rs.amount?.minEur,
		maxEur: rs.amount?.maxEur,
		period: rs.amount?.period,
		source: rs.amount?.citation.sourceId,
		locator: rs.amount?.citation.locator,
		excerpt: rs.amount?.citation.excerpt.slice(0, 140),
	}));

// ---------- 5. Asimetría de errores ----------
const catalog = questionCatalogSchema.parse(
	JSON.parse(readFileSync(join(root, "data/eligibility/questions.json"), "utf8")),
);
const askedFields = new Set([
	...catalog.questions.map((q) => q.field),
	...catalog.questions.flatMap((q) => q.derives ?? []),
]);

interface LeafInfo {
	field: string;
	op: string;
}
function leaves(cond: Condition): LeafInfo[] {
	if ("all" in cond) return cond.all.flatMap(leaves);
	if ("any" in cond) return cond.any.flatMap(leaves);
	if ("not" in cond) return leaves(cond.not);
	const leaf = cond as { field?: string; op?: string; where?: Condition };
	const out: LeafInfo[] = [{ field: String(leaf.field), op: String(leaf.op) }];
	if (leaf.where) out.push(...leaves(leaf.where).map((l) => ({ ...l, field: `${leaf.field}.*.${l.field}` })));
	return out;
}

const asymmetry: unknown[] = [];
for (const { rs } of rules) {
	for (const req of rs.requirements) {
		if (!req.hard) continue;
		const ls = leaves(req.condition);
		const fields = [...new Set(ls.map((l) => l.field))];
		const unasked = fields.filter(
			(f) => !askedFields.has(f) && !f.includes(".*."),
		);
		// En este motor, dato ausente/impreciso ⇒ U en todas las hojas; F solo
		// sale de valores respondidos que contradicen la condición. El riesgo
		// real es una condición más estrecha que la norma (falso negativo) o
		// un campo que el cuestionario no puede responder con precisión.
		asymmetry.push({
			slug: rs.benefitSlug,
			reqId: req.id,
			label: req.label,
			fields,
			ops: [...new Set(ls.map((l) => l.op))],
			fieldsNotAsked: unasked,
			dependsOn: ls.map((l) => `${l.op}(${l.field})`).join(" + "),
		});
	}
}

// ---------- informe ----------
async function main() {
	const l2checks = SKIP_NET ? "omitido (--skip-net)" : await checkL2();
	const report = {
		date: TODAY,
		level1: {
			ruleFiles: rules.length,
			deadlines,
			flagged: deadlines.filter((d) => d.flags.length > 0),
		},
		level2Sample: {
			total: items.length,
			sampled: sample.length,
			checks: l2checks,
		},
		freshness: {
			totalRuns: runs.length,
			lastCiRun: lastCi
				? {
						date: lastCi.date,
						checked: lastCi.checked,
						stale: lastCi.stale,
						fetchErrors: lastCi.fetchErrors,
						skippedCount: lastCi.skipped?.length ?? 0,
					}
				: null,
			lastLocalRun: lastLocal
				? { date: lastLocal.date, checked: lastLocal.checked, stale: lastLocal.stale }
				: null,
			lastLocalIsOlderThan48h: localTooOld,
			skippedByCiNotRecheckedIn48h: unverified48h,
			staleNow,
		},
		parameters: {
			report: paramsReport,
			usedBy: Object.fromEntries(paramsUsed),
			uncoveredByToday: paramsReport.filter((p) => !p.coversToday),
		},
		amounts,
		asymmetry,
	};
	mkdirSync(join(OUT, ".."), { recursive: true });
	writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

	// resumen
	console.log(`[fiabilidad] ${TODAY} — reglas: ${rules.length}`);
	for (const d of deadlines)
		console.log(
			`  ${d.slug}@v${d.rulesVersion} ${d.state}${d.closesAt ? ` cierra ${d.closesAt}` : ""}${d.nextOpeningEstimate ? ` reabre~${d.nextOpeningEstimate}` : ""}${d.flags.length ? `  ⚑ ${d.flags.join(",")}` : ""}`,
		);
	console.log(
		`[fiabilidad] nivel2 muestra ${sample.length}/${items.length}: ${SKIP_NET ? "omitida" : "ver JSON"}`,
	);
	console.log(
		`[fiabilidad] frescura: última CI ${lastCi?.date} (${lastCi?.checked} comprobadas, ${lastCi?.fetchErrors?.length ?? 0} errores, ${lastCi?.skipped?.length ?? 0} saltadas); local ${lastLocal?.date ?? "—"}${localTooOld ? " (>48 h)" : ""}; stale ahora: ${staleNow.length}; sin revalidar >48h: ${unverified48h.length}`,
	);
	console.log(
		`[fiabilidad] parámetros sin vigencia hoy: ${paramsReport.filter((p) => !p.coversToday).length}`,
	);
	console.log(`[fiabilidad] informe → ${OUT}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
