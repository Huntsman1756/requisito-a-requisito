/**
 * B4.1 (F10-FRONT-4-F): cada ficha muestra la regla en lenguaje claro generada
 * DESDE el RuleSet — condText() produce texto no vacío ni "condición no
 * traducible" para los 50 programas (52 RuleSets) del nivel 1.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ruleSetSchema } from "../src/lib/eligibility-engine/schema";
import { condText } from "../src/lib/rule-text";

const DIR = join(process.cwd(), "data/eligibility/rules");
const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
const slugs = new Set(
	files.map((f) => {
		const rs = ruleSetSchema.parse(
			JSON.parse(readFileSync(join(DIR, f), "utf8")),
		);
		return rs.benefitSlug;
	}),
);

describe("regla legible generada desde el RuleSet", () => {
	it("hay 50 programas en el nivel 1", () => {
		expect(slugs.size).toBe(50);
	});
	it("cada requisito de cada programa produce texto legible", () => {
		const huecos: string[] = [];
		for (const f of files) {
			const rs = ruleSetSchema.parse(
				JSON.parse(readFileSync(join(DIR, f), "utf8")),
			);
			for (const r of rs.requirements) {
				const t = condText(r.condition);
				// Solo el fallback «nombreDeCampo» o el literal no traducible cuentan;
				// los «…» del label propio son lícitos.
				if (!t || t.includes("condición no traducible") || /«[a-z][a-zA-Z-]*»/.test(t))
					huecos.push(`${rs.benefitSlug}/${r.id}: ${t.slice(0, 60)}`);
			}
		}
		expect(huecos).toEqual([]);
	});
});
