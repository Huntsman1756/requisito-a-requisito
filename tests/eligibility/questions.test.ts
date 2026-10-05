import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { questionCatalogSchema } from "../../src/lib/eligibility-engine/schema";

const catalog = questionCatalogSchema.parse(
	JSON.parse(
		readFileSync(join(__dirname, "../../data/eligibility/questions.json"), "utf8"),
	),
);

describe("questions.json (F1-8)", () => {
	it("valida contra questionCatalogSchema", () => {
		expect(catalog.questions.length).toBeGreaterThanOrEqual(8);
	});

	it("como mucho 10 preguntas visibles a la vez (las demás llevan showIf)", () => {
		const unconditional = catalog.questions.filter((q) => !q.showIf);
		expect(unconditional.length).toBeLessThanOrEqual(10);
	});

	it("las opciones de single son tokens del donante (eligibilityFactors)", () => {
		const emp = catalog.questions.find((q) => q.field === "employmentStatus");
		const tokens = emp?.options?.map((o) => o.value) ?? [];
		for (const t of ["asalariado", "autonomo", "desempleado"]) {
			expect(tokens).toContain(t);
		}
	});

	it("las categorías especiales están marcadas sensitivity=special", () => {
		for (const f of ["dependents", "disability", "dependency"]) {
			const q = catalog.questions.find((x) => x.field === f);
			expect(q?.sensitivity, f).toBe("special");
			expect(q?.allowDecline ?? q?.allowUnknown).toBe(true);
		}
	});

	it("toda pregunta tiene whyKey (por qué se pregunta)", () => {
		for (const q of catalog.questions) expect(q.whyKey.length).toBeGreaterThan(0);
	});

	it("las bandas de ingresos son intervalos con límites (no bandas del donante)", () => {
		const inc = catalog.questions.find((q) => q.field === "incomeAnnual");
		for (const o of inc?.options ?? []) {
			expect(o.interval, o.value).toBeDefined();
			expect(o.interval?.[0]).not.toBeNull();
		}
	});
});
