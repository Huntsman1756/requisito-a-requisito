import { describe, expect, it } from "vitest";
import {
	goldenCoverage,
	positive,
	reachability,
	readInputs,
} from "../../scripts/completeness";
import { profileCombos } from "../../src/lib/eligibility-engine/exhaustive";

const inputs = readInputs();
const today = "2026-10-08";
describe("F10 completitud sobre reglas y goldens reales", () => {
	it("cada versión tiene al menos un perfil positivo válido", () => {
		const rows = inputs.rules.map((r) => reachability(r, inputs, today));
		expect(
			rows
				.filter((r) => r.validPositive === 0 || r.invalid > 0)
				.map((r) => `${r.slug}@${r.version}`),
		).toEqual([]);
	}, 120_000);
	it("cada programa tiene un golden positivo que aún coincide con el motor", () => {
		expect(goldenCoverage(inputs).filter((r) => !r.golden)).toEqual([]);
	});
	it("una condición imposible se detecta aunque tenga citas correctas", () => {
		const original = inputs.rules.find(
			(r) => r.benefitSlug === "bono-cultural-joven",
		);
		if (!original)
			throw new Error("falta bono-cultural-joven en los datos reales");
		const rule = structuredClone(original);
		rule.requirements[0].condition = {
			all: [
				{ field: "birthYear", op: "lt", value: 2008 },
				{ field: "birthYear", op: "gte", value: 2008 },
			],
		};
		const row = reachability(rule, inputs, today);
		expect(row.counts.probable + row.counts.posible).toBe(0);
	});
	it("informa el recorte por pares sin llamarlo cartesiano", () => {
		const generated = profileCombos(inputs.rules[0], inputs.catalog, 1, today);
		expect(generated.strategy).toBe("pairs+boundary");
		expect(generated.truncated).toBe(true);
	});
	it("un golden negativo nunca cuenta como persona positiva", () => {
		expect(positive("no_cumple")).toBe(false);
		expect(positive("insuficiente")).toBe(false);
	});
});
