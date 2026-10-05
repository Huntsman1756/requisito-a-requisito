import { describe, expect, it } from "vitest";
import { runExhaustive } from "../../src/lib/eligibility-engine/exhaustive";
import type {
	Condition,
	QuestionCatalog,
	RuleSet,
} from "../../src/lib/eligibility-engine/schema";

const cit = { sourceId: "bocm", locator: "Art. 3", excerpt: "extracto literal", excerptSha256: "0".repeat(64) };

function rs(slug: string, requirements: RuleSet["requirements"]): RuleSet {
	return {
		benefitSlug: slug,
		rulesVersion: 1,
		verifiedAt: "2026-10-01",
		humanReview: { status: "approved" },
		referenceDate: "application",
		sources: [{ id: "bocm", rank: 1, documentType: "call", url: "https://www.bocm.es/x" }],
		requirements,
		uncoveredRequirements: [],
		application: {
			window: { rolling: true, citation: cit },
			channel: { managingBody: "CM", url: "https://sede.comunidad.madrid/x", online: true, citation: cit },
			documents: [],
		},
		amount: null,
	};
}

const req = (id: string, condition: Condition, hard = true): RuleSet["requirements"][0] => ({
	id, hard, label: id, citation: cit, condition,
});

const CATALOG: QuestionCatalog = {
	catalogVersion: 1,
	questions: [
		{ id: "q-territory", field: "territory", type: "territory", order: 1, labelKey: "l", whyKey: "w", allowUnknown: true, allowDecline: false, sensitivity: "normal" },
		{ id: "q-age", field: "age", type: "age", order: 2, labelKey: "l", whyKey: "w", allowUnknown: true, allowDecline: true, sensitivity: "normal" },
		{ id: "q-emp", field: "employmentStatus", type: "single", order: 3, labelKey: "l", whyKey: "w", options: [
			{ value: "asalariado", labelKey: "a" }, { value: "desempleado", labelKey: "b" },
		], allowUnknown: true, allowDecline: true, sensitivity: "normal" },
		{ id: "q-dep", field: "dependents", type: "dependents", order: 4, labelKey: "l", whyKey: "w", allowUnknown: false, allowDecline: true, sensitivity: "special" },
	],
	consistencyChecks: [],
};

const CTX = { parameters: { parameters: [] }, today: "2026-10-08" };

const RULESETS = [
	rs("rs-a", [
		req("terr", { field: "territory", op: "within_territory", value: { ccaa: "13" } }),
		req("edad", { field: "age", op: "lt", value: 26 }),
	]),
	rs("rs-b", [
		req("edad", { field: "age", op: "gte", value: 65 }),
		req("emp", { field: "employmentStatus", op: "eq", value: "desempleado" }),
	]),
	rs("rs-c", [
		req("hijos", {
			field: "dependents",
			op: "count_where_gte",
			count: 2,
			where: { field: "age", op: "lt", value: 18 },
		}),
		req("terr", { field: "territory", op: "within_territory", value: { municipality: "28079" } }),
	]),
];

describe("generador exhaustivo (F2-14)", () => {
	it("3 RuleSets: invariantes + monotonía + determinismo sin violaciones", () => {
		for (const ruleset of RULESETS) {
			const r = runExhaustive(ruleset, CATALOG, CTX);
			expect(r.determinismViolations, ruleset.benefitSlug).toBe(0);
			expect(r.monotonicityViolations, ruleset.benefitSlug).toEqual([]);
			// Los errores de perfil (U) no son violaciones de invariantes;
			// selfCheck debe pasar para todos los perfiles.
			const inv = r.violations.filter((v) => !["I8"].includes(v.code));
			expect(inv, ruleset.benefitSlug).toEqual([]);
		}
	});

	it("recorta con pares+fronteras si se supera el tope", () => {
		const many: RuleSet = rs("rs-muchas", [
			req("e1", { field: "age", op: "lt", value: 26 }),
			req("e2", { field: "employmentStatus", op: "eq", value: "x" }),
			req("e3", { field: "territory", op: "within_territory", value: { ccaa: "13" } }),
			req("e4", { field: "dependents", op: "count_where_gte", count: 1, where: { field: "age", op: "lt", value: 3 } }),
		]);
		const r = runExhaustive(many, CATALOG, CTX, 200);
		expect(r.truncated).toBe(true);
		expect(r.strategy).toBe("pairs+boundary");
	});
});
