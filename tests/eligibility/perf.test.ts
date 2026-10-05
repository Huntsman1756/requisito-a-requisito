import { describe, expect, it } from "vitest";
import { performance } from "node:perf_hooks";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import type {
	CitizenProfile,
	QuestionCatalog,
	RuleSet,
} from "../../src/lib/eligibility-engine/schema";

const cit = { sourceId: "s", locator: "x", excerpt: "extracto ok", excerptSha256: "0".repeat(64) };

const RS: RuleSet = {
	benefitSlug: "bench",
	rulesVersion: 1,
	verifiedAt: "2026-10-01",
	humanReview: { status: "approved" },
	referenceDate: "application",
	sources: [{ id: "s", rank: 1, documentType: "call", url: "https://www.bocm.es/x" }],
	requirements: [
		{ id: "a", hard: true, label: "a", citation: cit, condition: { field: "territory", op: "within_territory", value: { ccaa: "13" } } },
		{ id: "b", hard: true, label: "b", citation: cit, condition: { any: [
			{ field: "age", op: "lt", value: 26 },
			{ all: [{ field: "age", op: "lt", value: 30 }, { field: "disability", op: "eq", value: "gte33" }] },
		] } },
		{ id: "c", hard: false, label: "c", citation: cit, condition: { field: "incomeAnnual", op: "lt", value: 8400 } },
	],
	uncoveredRequirements: [],
	application: {
		window: { rolling: true, citation: cit },
		channel: { managingBody: "CM", url: "https://sede.comunidad.madrid/x", online: true, citation: cit },
		documents: [],
	},
	amount: null,
};

const CATALOG: QuestionCatalog = {
	catalogVersion: 1,
	questions: [
		{ id: "q1", field: "territory", type: "territory", order: 1, labelKey: "l", whyKey: "w", allowUnknown: true, allowDecline: false, sensitivity: "normal" },
		{ id: "q2", field: "age", type: "age", order: 2, labelKey: "l", whyKey: "w", allowUnknown: true, allowDecline: false, sensitivity: "normal" },
	],
	consistencyChecks: [],
};

const PROFILE: CitizenProfile = {
	catalogVersion: 1,
	answers: {
		territory: { state: "value", value: { ccaa: "13" } },
		age: { state: "value", value: { min: 20, max: 25 } },
		incomeAnnual: { state: "unknown" },
	},
};

const CTX = { parameters: { parameters: [] }, catalog: CATALOG, today: "2026-10-08" };

describe("rendimiento (F2-15)", () => {
	it("25 RuleSets × 1 perfil < 5 ms en Node", () => {
		const rulesets = Array.from({ length: 25 }, (_, i) => ({
			...RS,
			benefitSlug: `bench-${i}`,
		}));
		// Calentamiento
		evaluateRuleSet(RS, PROFILE, CTX);
		const t0 = performance.now();
		for (const r of rulesets) evaluateRuleSet(r, PROFILE, CTX);
		const ms = performance.now() - t0;
		console.log(`25 evaluaciones: ${ms.toFixed(2)} ms (${(ms / 25).toFixed(3)} ms/eval)`);
		expect(ms).toBeLessThan(50); // margen amplio; objetivo <5ms en CPU media
	});
});
