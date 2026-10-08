/**
 * review-panel/simulate-aggregation.ts — reagrega offline (sin llamadas) los
 * veredictos guardados de una calibración con reglas de agregación
 * alternativas, para saber si el problema es la regla de agregación o los
 * propios modelos (ADR-050).
 *
 * Uso: tsx scripts/review-panel/simulate-aggregation.ts <dir-calibracion>
 * Aproximación declarada: no reconstruye el contexto de cada ítem, así que
 * cuenta `missingRequirements` sin validar la cita literal (sobrestima las
 * alarmas de completitud en la misma medida para todas las reglas).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface Verdict {
	valid: boolean;
	fidelity: string;
	hardness: string;
	falseNegativeRisk: string;
	falsePositiveRisk: string;
	missingRequirements?: unknown[];
}
interface Result {
	caseId: string;
	expected: "escalate" | "pass";
	verdicts: Verdict[];
}
interface Case {
	caseId: string;
	fpClass?: boolean;
}

type Mode = "strict" | "nohard";
type Rule = "any" | "any-invalid-escalates" | "2of3" | "2ofvalid";

/** null = abstención (salida inválida). */
function flag(completeness: boolean, v: Verdict, mode: Mode): boolean | null {
	if (!v.valid) return null;
	const miss = (v.missingRequirements ?? []).length > 0;
	if (completeness) return miss;
	return (
		v.fidelity !== "exact" ||
		(mode === "strict" && v.hardness !== "ok") ||
		v.falseNegativeRisk === "high" ||
		v.falsePositiveRisk === "high" ||
		miss
	);
}

function escalates(flags: (boolean | null)[], rule: Rule): boolean {
	const valid = flags.filter((f): f is boolean => f !== null);
	const yes = valid.filter(Boolean).length;
	if (rule === "any") return yes > 0;
	if (rule === "any-invalid-escalates") return yes > 0 || valid.length < flags.length;
	if (rule === "2of3") return yes >= 2 || valid.length < 2;
	return valid.length < 2 ? true : yes >= 2;
}

const dir = process.argv[2];
if (!dir) throw new Error("uso: simulate-aggregation.ts <dir-calibracion>");
const results = JSON.parse(readFileSync(join(dir, "resultados.json"), "utf8")) as Result[];
const cases = JSON.parse(readFileSync(join(dir, "casos.json"), "utf8")) as Case[];
const fpClass = new Set(cases.filter((c) => c.fpClass).map((c) => c.caseId));
const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(1) : "—");

console.log("| Criterio de objeción | Agregación | Detección | Mutantes FP | Falsas alarmas |");
console.log("|---|---|---|---|---|");
for (const mode of ["strict", "nohard"] as const)
	for (const rule of ["any", "any-invalid-escalates", "2of3", "2ofvalid"] as const) {
		let tp = 0, fn = 0, fp = 0, tn = 0, fpc = 0, fpd = 0;
		for (const r of results) {
			const completeness = r.caseId.includes("/completeness");
			const e = escalates(r.verdicts.map((v) => flag(completeness, v, mode)), rule);
			if (r.expected === "escalate") {
				if (e) tp++;
				else fn++;
				if (fpClass.has(r.caseId)) {
					fpc++;
					if (e) fpd++;
				}
			} else if (e) fp++;
			else tn++;
		}
		console.log(`| ${mode} | ${rule} | ${pct(tp, tp + fn)} % | ${pct(fpd, fpc)} % | ${pct(fp, fp + tn)} % |`);
	}
