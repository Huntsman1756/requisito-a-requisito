/**
 * review-panel/calibrate.ts — calibración del panel con errores inyectados
 * (docs/17 §6). Genera mutantes + controles + casos históricos de forma
 * determinista, ejecuta el panel SOLO sobre ese conjunto y escribe el informe
 * en evidence/<fecha>-panel/calibracion.md.
 *
 * Uso: npm run panel:calibrate [-- --prompt panel-v1] [-- --out <dir>]
 *
 * Criterio de aceptación (nunca se relaja):
 *   detección de mutantes ≥ 95 % · 100 % en mutantes de falso positivo ·
 *   falsas alarmas sobre controles ≤ 20 %.
 *
 * Este script NO escribe panelReview en ninguna regla ni lanza panel:run.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildCalibrationSet, type CalibCase } from "./mutants";
import type { PanelItem } from "./items";
import { reviewItems, type ItemResult, type PanelVerdict } from "./run";

const MODELS = ["deepseek-v4-flash", "qwen3.8-flash", "mimo-v2.6-flash"];
const MIN_DETECTION = 0.95;
const MAX_FALSE_ALARM = 0.2;

const args = process.argv.slice(2);
const opt = (name: string, dflt: string) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : dflt;
};
const PROMPT = opt("prompt", "panel-v1");
const DATE = opt("date", new Date().toISOString().slice(0, 10));
const OUT = opt("out", join(process.cwd(), `evidence/${DATE}-panel`));

/** ¿Este veredicto individual levantaría una objeción (misma lógica que aggregate)? */
function flagged(item: PanelItem, v: PanelVerdict): boolean {
	const miss = (v.missingRequirements ?? []).filter((m) => item.context?.includes(m.quote));
	return (
		v.fidelity !== "exact" ||
		v.hardness !== "ok" ||
		v.falseNegativeRisk === "high" ||
		v.falsePositiveRisk === "high" ||
		miss.length > 0
	);
}

interface Confusion {
	tp: number; // mutante detectado
	fn: number; // mutante no detectado
	fp: number; // control marcado
	tn: number; // control limpio
}

function confuse(pred: (c: CalibCase, r: ItemResult) => boolean, cases: CalibCase[], results: ItemResult[]): Confusion {
	const m: Confusion = { tp: 0, fn: 0, fp: 0, tn: 0 };
	cases.forEach((c, i) => {
		const flag = pred(c, results[i]);
		if (c.expected === "escalate") flag ? m.tp++ : m.fn++;
		else flag ? m.fp++ : m.tn++;
	});
	return m;
}

const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(1)} %` : "—");

async function main() {
	const root = process.cwd();
	mkdirSync(join(OUT, "raw"), { recursive: true });
	const cases = buildCalibrationSet(root);
	const mutants = cases.filter((c) => c.expected === "escalate");
	const controls = cases.filter((c) => c.expected === "pass");
	console.log(
		`Calibración: ${mutants.length} mutantes+históricos, ${controls.length} controles, ` +
			`${cases.length * MODELS.length} llamadas potenciales (modelos: ${MODELS.join(", ")}, prompt ${PROMPT})`,
	);

	writeFileSync(
		join(OUT, "casos.json"),
		JSON.stringify(
			cases.map((c) => ({
				caseId: c.caseId,
				kind: c.kind,
				mutantType: c.mutantType,
				fpClass: c.fpClass,
				expected: c.expected,
				note: c.note,
			})),
			null,
			1,
		),
	);

	const results = await reviewItems(
		cases.map((c) => c.item),
		{
			models: MODELS,
			promptVersion: PROMPT,
			outDir: OUT,
			cacheDir: join(root, ".cache/panel"),
			concurrency: 6,
		},
	);

	writeFileSync(
		join(OUT, "resultados.json"),
		JSON.stringify(
			results.map((r, i) => ({
				caseId: cases[i].caseId,
				expected: cases[i].expected,
				panel: r.agg,
				verdicts: r.verdicts.map((v) => ({ model: v.model, valid: v.valid, ...v.verdict })),
			})),
			null,
			1,
		),
	);

	// --- métricas ---
	const panel = confuse((_c, r) => r.agg.result === "escalate", cases, results);
	const perModel = MODELS.map((model) => ({
		model,
		m: confuse(
			(_c, r) => {
				const mv = r.verdicts.find((v) => v.model === model);
				return mv ? flagged(r.item, mv.verdict) : true; // salida inválida cuenta como objeción
			},
			cases,
			results,
		),
		invalid: results.reduce(
			(n, r) => n + (r.verdicts.find((v) => v.model === model && !v.valid) ? 1 : 0),
			0,
		),
	}));

	const detection = panel.tp / Math.max(1, panel.tp + panel.fn);
	const falseAlarms = panel.fp / Math.max(1, panel.fp + panel.tn);
	const fpCases = cases.map((c, i) => ({ c, r: results[i] })).filter(({ c }) => c.expected === "escalate" && c.fpClass);
	const fpDetected = fpCases.filter(({ r }) => r.agg.result === "escalate").length;
	const fpRate = fpCases.length ? fpDetected / fpCases.length : 1;
	const pass = detection >= MIN_DETECTION && fpRate >= 1 && falseAlarms <= MAX_FALSE_ALARM;

	// detección por tipo de mutante
	const byType = new Map<string, { n: number; det: number }>();
	cases.forEach((c, i) => {
		if (c.expected !== "escalate") return;
		const t = c.mutantType ?? "?";
		const e = byType.get(t) ?? { n: 0, det: 0 };
		e.n++;
		if (results[i].agg.result === "escalate") e.det++;
		byType.set(t, e);
	});

	const missed = cases
		.map((c, i) => ({ c, r: results[i] }))
		.filter(({ c, r }) => c.expected === "escalate" && r.agg.result !== "escalate");
	const alarms = cases
		.map((c, i) => ({ c, r: results[i] }))
		.filter(({ c, r }) => c.expected === "pass" && r.agg.result === "escalate");

	// --- informe ---
	const L: string[] = [];
	L.push(`# Calibración del panel multimodelo — ${DATE}`);
	L.push("");
	L.push(`- Prompt: \`${PROMPT}\` · modelos: ${MODELS.join(", ")}`);
	L.push(`- Ítems: ${mutants.length} con defecto (mutantes + históricos) · ${controls.length} controles`);
	L.push(`- Registro crudo: \`raw/calls.jsonl\` · casos: \`casos.json\` · veredictos: \`resultados.json\``);
	L.push("");
	L.push(`## Criterio de aceptación (docs/17 §6) — **${pass ? "CUMPLE" : "NO CUMPLE"}**`);
	L.push("");
	L.push("| Criterio | Umbral | Medido | Resultado |");
	L.push("|---|---|---|---|");
	L.push(`| Detección de mutantes | ≥ 95 % | ${pct(panel.tp, panel.tp + panel.fn)} | ${detection >= MIN_DETECTION ? "OK" : "KO"} |`);
	L.push(`| …en mutantes de falso positivo | 100 % | ${pct(fpDetected, fpCases.length)} | ${fpRate >= 1 ? "OK" : "KO"} |`);
	L.push(`| Falsas alarmas en controles | ≤ 20 % | ${pct(panel.fp, panel.fp + panel.tn)} | ${falseAlarms <= MAX_FALSE_ALARM ? "OK" : "KO"} |`);
	L.push("");
	L.push("## Matriz de confusión");
	L.push("");
	L.push("| | Detectado | No detectado | Alarma | Limpio | Inválidas |");
	L.push("|---|---|---|---|---|---|");
	for (const pm of perModel)
		L.push(`| ${pm.model} | ${pm.m.tp} | ${pm.m.fn} | ${pm.m.fp} | ${pm.m.tn} | ${pm.invalid} |`);
	L.push(`| **Panel (agregado)** | **${panel.tp}** | **${panel.fn}** | **${panel.fp}** | **${panel.tn}** | — |`);
	L.push("");
	L.push("## Detección por tipo de defecto");
	L.push("");
	L.push("| Tipo | n | Detectados | Tasa |");
	L.push("|---|---|---|---|");
	for (const [t, e] of [...byType.entries()].sort())
		L.push(`| ${t} | ${e.n} | ${e.det} | ${pct(e.det, e.n)} |`);
	L.push("");
	if (missed.length) {
		L.push(`## Mutantes NO detectados (${missed.length})`);
		L.push("");
		for (const { c, r } of missed.slice(0, 15)) {
			L.push(`- \`${c.caseId}\` — ${c.note}`);
			for (const v of r.verdicts)
				L.push(`  - ${v.model}: ${v.verdict.fidelity}/${v.verdict.hardness} fn=${v.verdict.falseNegativeRisk} fp=${v.verdict.falsePositiveRisk} — ${v.verdict.explanation.slice(0, 160)}`);
		}
		L.push("");
	}
	if (alarms.length) {
		L.push(`## Falsas alarmas sobre controles (${alarms.length})`);
		L.push("");
		for (const { c, r } of alarms.slice(0, 15)) {
			L.push(`- \`${c.caseId}\` — ${r.agg.reason ?? ""}`);
			for (const v of r.verdicts.filter((x) => flagged(r.item, x.verdict)))
				L.push(`  - ${v.model}: ${v.verdict.fidelity}/${v.verdict.hardness} — ${v.verdict.explanation.slice(0, 160)}`);
		}
		L.push("");
	}
	writeFileSync(join(OUT, "calibracion.md"), `${L.join("\n")}\n`);

	console.log(`\nDetección: ${pct(panel.tp, panel.tp + panel.fn)} · FP-mutantes: ${pct(fpDetected, fpCases.length)} · Falsas alarmas: ${pct(panel.fp, panel.fp + panel.tn)}`);
	console.log(`Criterio: ${pass ? "CUMPLE" : "NO CUMPLE"} — informe en ${join(OUT, "calibracion.md")}`);
	process.exitCode = pass ? 0 : 2;
}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
