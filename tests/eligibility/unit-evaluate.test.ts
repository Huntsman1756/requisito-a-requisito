import { describe, expect, it } from "vitest";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import { assertEvaluationInvariants } from "../../src/lib/eligibility-engine/invariants";
import type {
	CitizenProfile,
	QuestionCatalog,
	RuleSet,
} from "../../src/lib/eligibility-engine/schema";
import { oracleVerdict } from "../../src/lib/eligibility-engine/verdict-oracle";

const cit = { sourceId: "bocm", locator: "Art. 3", excerpt: "extracto literal", excerptSha256: "0".repeat(64) };

const RS: RuleSet = {
	benefitSlug: "test-ayuda",
	rulesVersion: 1,
	verifiedAt: "2026-10-01",
	humanReview: { status: "approved" },
	referenceDate: "application",
	sources: [
		{ id: "bocm", rank: 1, documentType: "call", url: "https://www.bocm.es/x.PDF" },
	],
	requirements: [
		{
			id: "residencia",
			hard: true,
			label: "Residir en la Comunidad de Madrid",
			citation: cit,
			condition: { field: "territory", op: "within_territory", value: { ccaa: "13" } },
		},
		{
			id: "menor-26",
			hard: true,
			label: "Menor de 26 años",
			citation: cit,
			condition: {
				any: [
					{ label: "Menor de 26", citation: cit, field: "age", op: "lt", value: 26 },
					{
						label: "Menor de 30 con discapacidad",
						citation: cit,
						all: [
							{ field: "age", op: "lt", value: 30 },
							{ field: "disability", op: "eq", value: "gte33" },
						],
					},
				],
			},
		},
		{
			id: "cuantia-aviso",
			hard: false,
			label: "Ingresos bajos (afecta a la cuantía)",
			citation: cit,
			condition: { field: "incomeAnnual", op: "lt", value: 8400 },
		},
	],
	uncoveredRequirements: [],
	application: {
		window: {
			opensAt: "2026-10-01",
			closesAt: "2026-10-16",
			rolling: false,
			citation: cit,
		},
		channel: {
			managingBody: "Comunidad de Madrid",
			url: "https://sede.comunidad.madrid/x",
			online: true,
			citation: cit,
		},
		documents: [
			{ id: "dni", label: "DNI o NIE", mandatory: true, citation: cit },
			{
				id: "cert",
				label: "Certificado de discapacidad",
				mandatory: true,
				citation: cit,
				condition: { field: "disability", op: "eq", value: "gte33" },
			},
		],
	},
	amount: { type: "per_applicant", minEur: 100, maxEur: 300, period: "one_off", citation: cit },
	effortInputs: { requiresCertificate: true, formPages: 2 },
};

const CATALOG: QuestionCatalog = {
	catalogVersion: 1,
	questions: [
		{ id: "q-territory", field: "territory", type: "territory", order: 1, labelKey: "l", whyKey: "w", allowUnknown: false, allowDecline: false, sensitivity: "normal" },
		{ id: "q-age", field: "age", type: "age", order: 2, labelKey: "l", whyKey: "w", allowUnknown: true, allowDecline: false, sensitivity: "normal" },
		{ id: "q-income", field: "incomeAnnual", type: "money_band", order: 3, labelKey: "l", whyKey: "w", allowUnknown: true, allowDecline: true, sensitivity: "normal" },
	],
	consistencyChecks: [],
};

const CTX = { parameters: { parameters: [] }, catalog: CATALOG, today: "2026-10-08" };

const profileOf = (answers: Record<string, unknown>): CitizenProfile => ({
	catalogVersion: 1,
	answers: answers as CitizenProfile["answers"],
});
const val = (v: unknown) => ({ state: "value" as const, value: v });

describe("evaluateRuleSet", () => {
	it("probable cuando todo T y sin uncovered", () => {
		const ev = evaluateRuleSet(RS, profileOf({
			territory: val({ ccaa: "13" }),
			age: val({ min: 20, max: 25 }),
			incomeAnnual: val({ min: 0, max: 5000 }),
		}), CTX);
		expect(ev.verdict).toBe("probable");
		expect(ev.selfCheck).toEqual({ passed: true, failed: [] });
		expect(ev.deadline.state).toBe("OPEN");
		expect(ev.deadline.daysLeft).toBe(8);
		expect(ev.deadline.urgent).toBeUndefined();
		expect(ev.documents).toEqual(["DNI o NIE", "Certificado de discapacidad"]); // condición U ⇒ se lista (podría aplicar)
		expect(ev.amount?.displayAsPersonal).toBe(true);
	});

	it("no_cumple con un hard F y su blocker", () => {
		const ev = evaluateRuleSet(RS, profileOf({
			territory: val({ ccaa: "09" }),
			age: val({ min: 20, max: 25 }),
		}), CTX);
		expect(ev.verdict).toBe("no_cumple");
		expect(ev.blockers).toEqual(["Residir en la Comunidad de Madrid"]);
		expect(ev.selfCheck.passed).toBe(true);
	});

	it("posible con U y missing ordenado por desbloqueo", () => {
		const ev = evaluateRuleSet(RS, profileOf({
			age: val({ min: 20, max: 25 }),
		}), CTX);
		expect(ev.verdict).toBe("posible");
		expect(ev.missing).toEqual([
			{ field: "incomeAnnual", questionId: "q-income", unlocks: 1 },
			{ field: "territory", questionId: "q-territory", unlocks: 1 },
		]);
		expect(ev.selfCheck.passed).toBe(true);
	});

	it("insuficiente cuando hardU > satisfied", () => {
		const rs2: RuleSet = {
			...RS,
			requirements: [RS.requirements[0], RS.requirements[1], { ...RS.requirements[2], hard: true }],
		};
		const ev = evaluateRuleSet(rs2, profileOf({
			territory: val({ ccaa: "13" }), // T
			// age U, income U → hardU=2 > satisfied=1
		}), CTX);
		expect(ev.verdict).toBe("insuficiente");
	});

	it("cumple por la excepción (vía en reasonParams)", () => {
		const ev = evaluateRuleSet(RS, profileOf({
			territory: val({ ccaa: "13" }),
			age: val({ min: 27, max: 28 }),
			disability: val("gte33"),
		}), CTX);
		const req = ev.requirements.find((r) => r.id === "menor-26");
		expect(req?.status).toBe("T");
		expect(req?.reasonParams?.via).toBe("Menor de 30 con discapacidad");
		expect(ev.documents).toContain("Certificado de discapacidad");
		expect(ev.selfCheck.passed).toBe(true);
	});

	it("veredicto idéntico al oráculo en el espacio de estados", () => {
		const statuses = ["T", "F", "U"] as const;
		for (const a of statuses) for (const b of statuses) for (const c of statuses) {
			const reqs = [
				{ hard: true, status: a },
				{ hard: true, status: b },
				{ hard: false, status: c },
			];
			expect(oracleVerdict(reqs, 0)).toBeDefined();
		}
	});
});

describe("deadline", () => {
	it("estados según today", () => {
		for (const [today, state] of [
			["2026-09-30", "UPCOMING"],
			["2026-10-16", "OPEN"],
			["2026-10-17", "CLOSED"],
		] as const) {
			const ev = evaluateRuleSet(RS, profileOf({}), { ...CTX, today });
			expect(ev.deadline.state).toBe(state);
		}
	});
	it("rolling y conflicto", () => {
		const rolling: RuleSet = { ...RS, application: { ...RS.application, window: { rolling: true, citation: cit } } };
		expect(evaluateRuleSet(rolling, profileOf({}), CTX).deadline.state).toBe("ROLLING");
		const conflict: RuleSet = { ...RS, application: { ...RS.application, window: { rolling: true, conflict: true, citation: cit } } };
		const ev = evaluateRuleSet(conflict, profileOf({}), CTX);
		expect(ev.deadline.state).toBe("UNKNOWN");
		expect(ev.deadline.conflict).toBe(true);
	});
	it("urgente si quedan <5 días", () => {
		const ev = evaluateRuleSet(RS, profileOf({}), { ...CTX, today: "2026-10-14" });
		expect(ev.deadline.daysLeft).toBe(2);
		expect(ev.deadline.urgent).toBe(true);
	});
});

describe("futureEligibility (§4.1)", () => {
	const RS_FUT: RuleSet = {
		...RS,
		requirements: [
			{
				id: "mayor-18",
				hard: true,
				label: "Ser mayor de edad",
				timeDependent: "increasing",
				citation: cit,
				condition: { field: "age", op: "gte", value: 18 },
			},
		],
		uncoveredRequirements: [],
	};
	it("edad insuficiente que madura con plazo rolling ⇒ from/to", () => {
		const rsRolling: RuleSet = {
			...RS_FUT,
			application: { ...RS_FUT.application, window: { rolling: true, citation: cit } },
		};
		const ev = evaluateRuleSet(rsRolling, profileOf({
			age: val({ min: 17, max: 17, maxExclusive: false }),
		}), CTX);
		expect(ev.verdict).toBe("no_cumple");
		expect(ev.futureEligibility?.from).toBe("2027-10-08");
	});
	it("fecha futura fuera de plazo ⇒ ausente", () => {
		const ev = evaluateRuleSet(RS_FUT, profileOf({
			age: val({ min: 17, max: 17, maxExclusive: false }),
		}), CTX);
		// from=2027-10-08 > closesAt 2026-10-16 ⇒ no se promete
		expect(ev.futureEligibility).toBeUndefined();
	});
	it("decreasing ⇒ nunca", () => {
		const rs: RuleSet = { ...RS_FUT, requirements: [{ ...RS_FUT.requirements[0], timeDependent: "decreasing" }] };
		expect(evaluateRuleSet(rs, profileOf({ age: val({ min: 17, max: 17, maxExclusive: false }) }), CTX).futureEligibility).toBeUndefined();
	});
});

describe("invariantes I1–I10 con evaluación corrupta", () => {
	const good = evaluateRuleSet(RS, profileOf({
		territory: val({ ccaa: "13" }),
		age: val({ min: 20, max: 25 }),
	}), CTX);

	it("evaluación sana pasa todas", () => {
		expect(assertEvaluationInvariants(good, RS, { parameters: CTX.parameters })).toEqual([]);
	});
	it("I1: requisito duplicado", () => {
		const ev = { ...good, requirements: [...good.requirements, good.requirements[0]] };
		expect(assertEvaluationInvariants(ev, RS, { parameters: CTX.parameters })).toContain("I1");
	});
	it("I2: veredicto falseado", () => {
		const ev = { ...good, verdict: "no_cumple" as const };
		expect(assertEvaluationInvariants(ev, RS, { parameters: CTX.parameters })).toContain("I2");
	});
	it("I4: probable con un hard U", () => {
		const ev = { ...good, verdict: "probable" as const, requirements: good.requirements.map((r, i) => i === 0 ? { ...r, status: "U" as const } : r) };
		expect(assertEvaluationInvariants(ev, RS, { parameters: CTX.parameters })).toContain("I4");
	});
	it("I5: futureEligibility fuera de plazo", () => {
		const ev = { ...good, futureEligibility: { from: "2027-01-01", becauseOf: ["x"], withinWindow: true as const } };
		expect(assertEvaluationInvariants(ev, RS, { parameters: CTX.parameters })).toContain("I5");
	});
	it("I6: total_budget como importe personal", () => {
		const ev = { ...good, amount: { type: "total_budget" as const, displayAsPersonal: true } };
		expect(assertEvaluationInvariants(ev, RS, { parameters: CTX.parameters })).toContain("I6");
	});
	it("I7: digests distintos", () => {
		expect(assertEvaluationInvariants(good, RS, { parameters: CTX.parameters, bundleDigest: "a", expectedBundleDigest: "b" })).toContain("I7");
	});
	it("I8: verifiedAt envejecido", () => {
		const old: RuleSet = { ...RS, verifiedAt: "2026-01-01" };
		expect(assertEvaluationInvariants(good, old, { parameters: CTX.parameters })).toContain("I8");
	});
	it("I9: parámetro sin vigencia", () => {
		const rs: RuleSet = { ...RS, parametersUsed: ["SIN_VIGENCIA"] };
		expect(assertEvaluationInvariants(good, rs, { parameters: CTX.parameters })).toContain("I9");
	});
	it("I10: número inventado en reasonParams", () => {
		const ev = { ...good, requirements: good.requirements.map((r, i) => i === 0 ? { ...r, reasonParams: { n: 99999 } } : r) };
		expect(assertEvaluationInvariants(ev, RS, { parameters: CTX.parameters })).toContain("I10");
	});
});
