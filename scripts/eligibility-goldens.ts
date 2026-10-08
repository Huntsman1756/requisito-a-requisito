/**
 * eligibility-goldens.ts — ejecuta TODAS las personas golden de
 * data/eligibility/golden/ contra las reglas (directorio de reglas o un
 * bundle ya construido) y compara veredicto, estado de plazo, blockers,
 * missingFields y futureFrom con lo esperado.
 *
 * Hasta ahora los goldens se ejecutaban con scripts ad-hoc en F:\Temp por
 * cada verificación de ola; este runner los hace reproducibles y sirve para
 * comprobar el bundle desplegado (A.4 de la auditoría de fiabilidad).
 *
 * Uso: npx tsx scripts/eligibility-goldens.ts [--rules-dir <d>]
 *      [--bundle <ruta a bundle.json>] [--golden-dir <d>] [--today YYYY-MM-DD]
 *      [--json <ruta salida>]
 * Salida 0 si todas las expectativas coinciden.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateRuleSet } from "../src/lib/eligibility-engine/evaluate";
import {
	goldenPersonaSchema,
	parametersSchema,
	questionCatalogSchema,
	ruleSetSchema,
	type GoldenPersona,
	type Parameters,
	type RuleSet,
} from "../src/lib/eligibility-engine/schema";

const root = process.cwd();
const args = process.argv.slice(2);
const argValue = (k: string) => {
	const i = args.indexOf(k);
	return i >= 0 ? args[i + 1] : undefined;
};

const GOLDEN_DIR = argValue("golden-dir") ?? join(root, "data/eligibility/golden");
const BUNDLE = argValue("bundle");
const RULES_DIR = argValue("rules-dir") ?? join(root, "data/eligibility/rules");
const JSON_OUT = argValue("--json".slice(2)) ?? argValue("json");

const catalog = questionCatalogSchema.parse(
	JSON.parse(readFileSync(join(root, "data/eligibility/questions.json"), "utf8")),
);

// Con --bundle las reglas y parámetros salen del bundle (p. ej. el desplegado);
// si no, del directorio de reglas + parameters.json del repo.
let rulesets: RuleSet[];
let parameters: Parameters;
if (BUNDLE) {
	const b = JSON.parse(readFileSync(BUNDLE, "utf8"));
	rulesets = (b.rulesets as unknown[]).map((r) => ruleSetSchema.parse(r));
	parameters = parametersSchema.parse(b.parameters);
} else {
	rulesets = readdirSync(RULES_DIR)
		.filter((f) => f.endsWith(".json"))
		.map((f) =>
			ruleSetSchema.parse(
				JSON.parse(readFileSync(join(RULES_DIR, f), "utf8")),
			),
		);
	parameters = parametersSchema.parse(
		JSON.parse(readFileSync(join(root, "data/eligibility/parameters.json"), "utf8")),
	);
}

import { validOn } from "../src/lib/eligibility-engine/versions";

const bySlugVersion = new Map<string, RuleSet[]>();
for (const rs of rulesets) {
	const key = `${rs.benefitSlug}@${rs.rulesVersion}`;
	bySlugVersion.set(key, [...(bySlugVersion.get(key) ?? []), rs]);
}
/** De los candidatos slug@version, el vigente en la fecha del golden. */
function pickRs(slug: string, version: number, today: string): RuleSet | undefined {
	const cands = bySlugVersion.get(`${slug}@${version}`) ?? [];
	const valid = cands.filter((rs) => validOn(rs, today));
	return valid.length === 1 ? valid[0] : cands.length === 1 ? cands[0] : undefined;
}

interface Diff {
	golden: string;
	benefitSlug: string;
	rulesVersion: number;
	field: string;
	expected: unknown;
	actual: unknown;
}

const diffs: Diff[] = [];
let personas = 0;
let expectations = 0;
const missingRules: string[] = [];

const files = readdirSync(GOLDEN_DIR)
	.filter((f) => f.endsWith(".json"))
	.sort();

for (const f of files) {
	const raw = JSON.parse(readFileSync(join(GOLDEN_DIR, f), "utf8"));
	// Algunos goldens llevan benefitSlug/rulesVersion a nivel raíz (anotación
	// del autor duplicada de expectations[0]); se ignoran para el parseo.
	delete raw.benefitSlug;
	delete raw.rulesVersion;
	// Ola 10 dejó review.status="ok" (fuera del enum) + clave report: se trata
	// como pendiente de Daniel, que es lo que es.
	if (raw.review && !["pending", "approved", "rejected"].includes(raw.review.status))
		raw.review.status = "pending";
	if (raw.review) delete raw.review.report;
	const gp: GoldenPersona = goldenPersonaSchema.parse(raw);
	personas++;
	for (const exp of gp.expectations) {
		expectations++;
		const rs = pickRs(exp.benefitSlug, exp.rulesVersion, gp.today);
		const key = `${gp.id} → ${exp.benefitSlug}@v${exp.rulesVersion}`;
		if (!rs) {
			missingRules.push(key);
			diffs.push({
				golden: gp.id,
				benefitSlug: exp.benefitSlug,
				rulesVersion: exp.rulesVersion,
				field: "ruleset",
				expected: "presente",
				actual: "ausente del conjunto evaluado",
			});
			continue;
		}
		const ev = evaluateRuleSet(rs, gp.profile, {
			parameters,
			catalog,
			today: gp.today,
		});
		const check = (field: string, expected: unknown, actual: unknown) => {
			if (JSON.stringify(expected) !== JSON.stringify(actual))
				diffs.push({
					golden: gp.id,
					benefitSlug: exp.benefitSlug,
					rulesVersion: exp.rulesVersion,
					field,
					expected,
					actual,
				});
		};
		check("verdict", exp.verdict, ev.verdict);
		if (exp.deadlineState !== undefined)
			check("deadlineState", exp.deadlineState, ev.deadline.state);
		if (exp.blockers !== undefined)
			check("blockers", [...exp.blockers].sort(), [...ev.blockers].sort());
		if (exp.missingFields !== undefined)
			check(
				"missingFields",
				[...exp.missingFields].sort(),
				[...(ev.missing ?? []).map((m: { field?: string } | string) =>
					typeof m === "string" ? m : m.field,
				)].sort(),
			);
		if (exp.futureFrom !== undefined)
			check("futureFrom", exp.futureFrom, ev.futureEligibility?.from);
		if (!ev.selfCheck.passed)
			diffs.push({
				golden: gp.id,
				benefitSlug: exp.benefitSlug,
				rulesVersion: exp.rulesVersion,
				field: "selfCheck",
				expected: "passed",
				actual: ev.selfCheck.failed,
			});
	}
}

console.log(
	`[goldens] ${personas} personas, ${expectations} expectativas, ${diffs.length} diferencias`,
);
for (const d of diffs)
	console.log(
		`  ✗ ${d.golden} · ${d.benefitSlug}@v${d.rulesVersion} · ${d.field}: esperado ${JSON.stringify(d.expected)} ≠ obtenido ${JSON.stringify(d.actual)}`,
	);
if (JSON_OUT) {
	writeFileSync(
		JSON_OUT,
		`${JSON.stringify({ personas, expectations, diffs, missingRules }, null, 2)}\n`,
	);
}
process.exit(diffs.length === 0 ? 0 : 1);
