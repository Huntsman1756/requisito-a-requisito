/**
 * eligibility-exhaustive.ts — F2-14 (docs/07 §8.3)
 *
 * Ejecuta el generador exhaustivo sobre los RuleSets de data/eligibility/rules
 * (o un directorio dado) y reporta perfiles evaluados, recortes y violaciones.
 * Falla si hay violaciones de invariantes, monotonía o determinismo.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runExhaustive } from "../src/lib/eligibility-engine/exhaustive";
import {
	parametersSchema,
	questionCatalogSchema,
	ruleSetSchema,
} from "../src/lib/eligibility-engine/schema";

function argValue(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1]?.endsWith("eligibility-exhaustive.ts")) {
	const root = process.cwd();
	const rulesDir = argValue("rules-dir") ?? join(root, "data", "eligibility", "rules");
	const catalog = questionCatalogSchema.parse(
		JSON.parse(
			readFileSync(join(root, "data", "eligibility", "questions.json"), "utf8"),
		),
	);
	const parameters = parametersSchema.parse(
		JSON.parse(
			readFileSync(join(root, "data", "eligibility", "parameters.json"), "utf8"),
		),
	);
	const files = readdirSync(rulesDir).filter((f) => f.endsWith(".json")).sort();
	let totalProfiles = 0;
	let violations = 0;
	for (const f of files) {
		const rs = ruleSetSchema.parse(
			JSON.parse(readFileSync(join(rulesDir, f), "utf8")),
		);
		const r = runExhaustive(rs, catalog, {
			parameters,
			today: argValue("today") ?? new Date().toISOString().slice(0, 10),
		});
		totalProfiles += r.profiles;
		const bad =
			r.violations.length +
			r.monotonicityViolations.length +
			r.determinismViolations;
		violations += bad;
		console.log(
			`${r.slug}: ${r.profiles} perfiles (${r.strategy}${r.truncated ? ", RECORTE" : ""}) — ` +
				`${r.violations.length} invariantes · ${r.monotonicityViolations.length} monotonía · ${r.determinismViolations} determinismo`,
		);
		for (const v of r.violations.slice(0, 5)) console.log(`  inv ${v.code}: ${v.profile.slice(0, 120)}`);
		for (const v of r.monotonicityViolations.slice(0, 5)) console.log(`  mono ${v.field}: ${v.detail}`);
	}
	console.log(`total: ${totalProfiles} perfiles, ${violations} violaciones`);
	process.exit(violations === 0 ? 0 : 1);
}
