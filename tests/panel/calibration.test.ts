import { describe, expect, it } from "vitest";
import { extractJson } from "../../scripts/review-panel/client";
import { buildCalibrationSet } from "../../scripts/review-panel/mutants";

const root = process.cwd();

describe("calibración: conjunto determinista (docs/17 §6)", () => {
	it("es determinista: dos construcciones idénticas", () => {
		const a = buildCalibrationSet(root);
		const b = buildCalibrationSet(root);
		expect(JSON.stringify(a)).toBe(JSON.stringify(b));
	});

	it("tiene mutantes con expected=escalate, controles con expected=pass y ≥5 históricos", () => {
		const cases = buildCalibrationSet(root);
		const mut = cases.filter((c) => c.kind === "mutant");
		const ctl = cases.filter((c) => c.kind === "control");
		const hist = cases.filter((c) => c.kind === "historical");
		expect(mut.length).toBeGreaterThan(50);
		expect(ctl.length).toBeGreaterThan(30);
		expect(hist.length).toBeGreaterThanOrEqual(5);
		for (const c of mut) expect(c.expected).toBe("escalate");
		for (const c of ctl) expect(c.expected).toBe("pass");
		for (const c of hist) expect(c.expected).toBe("escalate");
	});

	it("cubre todos los tipos de mutante de docs/17 §6.1", () => {
		const types = new Set(
			buildCalibrationSet(root)
				.filter((c) => c.kind === "mutant")
				.map((c) => c.mutantType),
		);
		for (const t of [
			"umbral_lax",
			"umbral_pct",
			"op_swap",
			"hard_soft",
			"invert",
			"field",
			"iprem",
			"removed_req",
		])
			expect(types, `falta ${t}`).toContain(t);
	});

	it("los mutantes difieren del original y los ítems llevan contexto", () => {
		const cases = buildCalibrationSet(root);
		for (const c of cases) {
			if (c.kind === "control") continue;
			const orig = c.item.itemId.split("#")[0];
			if (c.kind === "mutant" && orig.endsWith("completeness") === false) {
				// todo mutante de requisito lleva cita y contexto
				expect(c.item.excerpt, c.caseId).toBeTruthy();
				expect(c.item.context, c.caseId).toBeTruthy();
			}
		}
		// los mutantes de completitud tienen contexto (necesario para missingRequirements)
		const compMut = cases.filter((c) => c.mutantType === "removed_req");
		expect(compMut.length).toBeGreaterThan(10);
		for (const c of compMut) expect(c.item.context?.length ?? 0).toBeGreaterThan(500);
	});

	it("cada mutante de requisito cambia hard, condition o la lista modelada", () => {
		const cases = buildCalibrationSet(root);
		const controls = new Map(
			cases.filter((c) => c.kind === "control").map((c) => [`${c.ruleSlug}|${c.item.itemId.split("#")[0]}`, c]),
		);
		for (const c of cases.filter((x) => x.kind === "mutant")) {
			const base = controls.get(`${c.ruleSlug}|${c.item.itemId.split("#")[0]}`);
			if (!base) continue; // mutante de completitud sin control emparejado ya probado arriba
			const changed =
				base.item.hard !== c.item.hard ||
				JSON.stringify(base.item.condition) !== JSON.stringify(c.item.condition) ||
				JSON.stringify(base.item.modelledIds) !== JSON.stringify(c.item.modelledIds);
			expect(changed, c.caseId).toBe(true);
		}
	});
});

describe("extractJson (adaptador de salidas envueltas, p. ej. gemma4)", () => {
	it("extrae JSON de cercas markdown y texto previo", () => {
		expect(extractJson('```json\n{"a":1}\n```')).toBe('{"a":1}');
		expect(extractJson('Aquí va: {"a":{"b":"}"}} gracias')).toBe('{"a":{"b":"}"}}');
		expect(extractJson("sin json")).toBeNull();
	});
});
