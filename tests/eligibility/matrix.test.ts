import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import type { RuleSet } from "../../src/lib/eligibility-engine/schema";
import { EXAMPLES } from "../../src/lib/examples";
import { cellReqs, dimOf, worstOf } from "../../src/lib/matrix";

const root = join(__dirname, "..", "..");
const catalog = JSON.parse(
	readFileSync(join(root, "data/eligibility/questions.json"), "utf8"),
);
const parameters = JSON.parse(
	readFileSync(join(root, "data/eligibility/parameters.json"), "utf8"),
);
const rulesets: RuleSet[] = readdirSync(join(root, "data/eligibility/rules"))
	.filter((f) => f.endsWith(".json"))
	.map((f) =>
		JSON.parse(readFileSync(join(root, "data/eligibility/rules", f), "utf8")),
	);

const ctx = (today: string) => ({
	today,
	catalog,
	bundleDigest: "test",
	invariantsEnabled: false,
	parameters: parameters,
});

describe("matriz por dimensiones (R3-MAT)", () => {
	it("los campos de perfil se mapean a una dimensión conocida", () => {
		expect(dimOf("territory")).toBe("emp");
		expect(dimOf("incomeAnnual")).toBe("ing");
		expect(dimOf("birthYear")).toBe("edad");
		expect(dimOf("dependents")).toBe("hijos");
		expect(dimOf("nunca-comprobable")).toBe("otros");
	});

	it("si falta un dato, la celda de su dimensión muestra U", () => {
		// familia sin incomeAnnual => al menos una U en "ing" para las
		// ayudas cuyo requisito de renta queda sin resolver
		const ans = { ...EXAMPLES[0].answers };
		delete ans.incomeAnnual;
		const ev = evaluateRuleSet(
			rulesets.find((r) => r.benefitSlug === "bono-social-electrico")!,
			{ catalogVersion: 1, answers: ans } as never,
			ctx("2026-10-05") as never,
		);
		const ing = cellReqs(
			rulesets.find((r) => r.benefitSlug === "bono-social-electrico")!,
			ev,
			"ing",
		);
		expect(worstOf(ing.map((r) => r.status))).toBe("U");
	});

	it("todas las respuestas resueltas: ninguna fila muestra U", () => {
		const bono = rulesets.find(
			(r) => r.benefitSlug === "bono-social-electrico",
		)!;
		const ev = evaluateRuleSet(
			bono,
			{ catalogVersion: 1, answers: EXAMPLES[0].answers } as never,
			ctx("2026-10-05") as never,
		);
		const u = ev.requirements.filter((r) => r.status === "U");
		expect(u.map((r) => r.id)).toEqual([]);
	});
});
