/**
 * Cobertura F2-COV: bordes de derived.ts, territory.ts, missing.ts,
 * deadline.ts y helpers no tocados por las suites de dominio.
 */

import { describe, expect, it } from "vitest";
import { runExhaustive } from "../../src/lib/eligibility-engine/exhaustive";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import { assertEvaluationInvariants } from "../../src/lib/eligibility-engine/invariants";
import type { RuleSet } from "../../src/lib/eligibility-engine/schema";
import { deadlineState } from "../../src/lib/eligibility-engine/deadline";
import {
	addDays,
	addMonths,
	ageFromBirthDate,
	ageIntervalFromMonthYear,
	diffDays,
	monthsBetween,
	residenceMonthsInterval,
} from "../../src/lib/eligibility-engine/derived";
import {
	blockersOf,
	futureEligibilityOf,
	missingOf,
	type ReqResult,
} from "../../src/lib/eligibility-engine/missing";
import type { QuestionCatalog } from "../../src/lib/eligibility-engine/schema";
import {
	ccaaExists,
	ccaaOfProvince,
	municipalityExists,
	provinceExists,
	territoryName,
	withinTerritory,
} from "../../src/lib/eligibility-engine/territory";

describe("derived", () => {
	it("ageFromBirthDate: cumpleaños pasado y no pasado", () => {
		expect(ageFromBirthDate("1990-06-01", "2026-10-05")).toBe(36);
		expect(ageFromBirthDate("1990-12-31", "2026-10-05")).toBe(35);
		expect(ageFromBirthDate("2008-10-05", "2026-10-05")).toBe(18);
	});

	it("ageIntervalFromMonthYear: incluye año bisiesto (feb)", () => {
		const i = ageIntervalFromMonthYear({ year: 2008, month: 2 }, "2026-06-15");
		// nacido feb-2008: a jun-2026 tiene 18 seguro
		expect(i.min).toBe(18);
		expect(i.max).toBe(18);
	});

	it("addDays y diffDays son inversos", () => {
		expect(addDays("2026-10-05", 30)).toBe("2026-11-04");
		expect(addDays("2026-01-30", 1)).toBe("2026-01-31");
		expect(addDays("2024-02-28", 1)).toBe("2024-02-29"); // bisiesto
		expect(addDays("2025-02-28", 1)).toBe("2025-03-01"); // no bisiesto
		expect(diffDays("2026-10-05", "2026-11-04")).toBe(30);
		expect(diffDays("2026-01-01", "2026-01-01")).toBe(0);
	});

	it("addMonths ajusta fin de mes", () => {
		expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
		expect(addMonths("2026-10-05", 12)).toBe("2027-10-05");
	});

	it("monthsBetween y residenceMonthsInterval", () => {
		expect(monthsBetween("2026-01-01", "2026-10-01")).toBe(9);
		const r = residenceMonthsInterval({ year: 2026, month: 3 }, "2026-10-05");
		expect(r.min).toBeGreaterThanOrEqual(6);
		expect(r.max).toBeLessThanOrEqual(8);
	});
});

describe("territory", () => {
	it("exists helpers", () => {
		expect(ccaaExists("13")).toBe(true);
		expect(ccaaExists("99")).toBe(false);
		expect(provinceExists("28")).toBe(true);
		expect(provinceExists("99")).toBe(false);
		expect(municipalityExists("28079")).toBe(true);
		expect(municipalityExists("00000")).toBe(false);
		expect(ccaaOfProvince("28")).toBe("13");
		expect(ccaaOfProvince("99")).toBeNull();
	});

	it("territoryName por nivel", () => {
		expect(territoryName({ municipality: "28079" })).toBe("Madrid");
		expect(territoryName({ province: "28" })).toBe("Madrid");
		expect(territoryName({ ccaa: "13" })).toContain("Madrid");
		expect(territoryName({})).toBeNull();
		expect(territoryName({ municipality: "99999" })).toBeNull();
	});

	it("withinTerritory por nivel y mismatch", () => {
		expect(
			withinTerritory({ ccaa: "13", province: "28", municipality: "28079" }, { ccaa: "13" }),
		).toBe("T");
		expect(withinTerritory({ ccaa: "09" }, { ccaa: "13" })).toBe("F");
		expect(withinTerritory({ municipality: "28079" }, { province: "28" })).toBe("T");
		expect(withinTerritory({ municipality: "03121" }, { province: "28" })).toBe("F");
	});
});

describe("missing / futureEligibility", () => {
	const catalog = {
		catalogVersion: 1,
		questions: [
			{
				id: "q-age",
				field: "age",
				type: "age",
				order: 1,
				labelKey: "x",
				whyKey: "y",
				allowUnknown: true,
				allowDecline: false,
				sensitivity: "normal",
			},
		],
	} as unknown as QuestionCatalog;

	const req = (over: Partial<ReqResult>): ReqResult => ({
		id: "r1",
		label: "requisito",
		hard: true,
		status: "U",
		condition: { field: "age", op: "gte", value: 18 },
		...over,
	});

	it("missingOf agrega campos desbloqueantes", () => {
		const m = missingOf(
			[
				req({ status: "U", missingFields: ["age", "incomeAnnual"] }),
				req({ id: "r2", status: "U", missingFields: ["age"] }),
				req({ id: "r3", status: "T" }),
			],
			catalog,
		);
		expect(m[0]).toMatchObject({ field: "age", unlocks: 2 });
	});

	it("blockersOf solo cuenta hard-F", () => {
		const b = blockersOf([
			req({ status: "F" }),
			req({ id: "r2", hard: false, status: "F" }),
			req({ id: "r3", status: "T" }),
		]);
		expect(b).toEqual(["requisito"]);
	});

	it("futureEligibility: sin hard-F no promete; increasing + resto T sí", () => {
		const none = futureEligibilityOf(
			[req({ status: "T" })],
			{ rolling: true } as never,
			"2026-10-05",
			{ answers: {} },
		);
		expect(none).toBeUndefined();

		const inc = req({
			status: "F",
			timeDependent: "increasing",
			condition: { field: "age", op: "gte", value: 52 },
		});
		const res = futureEligibilityOf(
			[inc, req({ id: "r2", status: "T" })],
			{ rolling: true } as never,
			"2026-10-05",
			{ answers: { age: { state: "value", value: { min: 40, max: 40 } } } },
		);
		expect(res).toBeDefined();
		expect(res?.becauseOf).toEqual(["r1"]);
	});

	it("futureEligibility: nada si el resto hard no es T, ni con 'all' incompleto", () => {
		const inc = req({
			status: "F",
			timeDependent: "increasing",
			condition: { field: "age", op: "gte", value: 52 },
		});
		const withU = futureEligibilityOf(
			[inc, req({ id: "r2", status: "U" })],
			{ rolling: true } as never,
			"2026-10-05",
			{ answers: {} },
		);
		expect(withU).toBeUndefined();

		const composite = req({
			status: "F",
			timeDependent: "increasing",
			condition: {
				all: [
					{ field: "age", op: "gte", value: 52 },
					{ field: "age", op: "gte", value: 55 },
				],
			},
		});
		const res = futureEligibilityOf(
			[composite],
			{ rolling: true } as never,
			"2026-10-05",
			{ answers: { age: { state: "value", value: { min: 40, max: 40 } } } },
		);
		expect(res).toBeDefined();
	});
});

describe("deadline", () => {
	it("estados y urgencia", () => {
		expect(deadlineState({ rolling: true } as never, "2026-10-05").state).toBe("ROLLING");
		expect(
			deadlineState({ closesAt: "2026-10-09" } as never, "2026-10-05"),
		).toMatchObject({ state: "OPEN", urgent: true });
		expect(deadlineState({ closesAt: "2026-10-01" } as never, "2026-10-05").state).toBe("CLOSED");
		expect(deadlineState({ opensAt: "2026-11-01" } as never, "2026-10-05").state).toBe("UPCOMING");
	});
});

describe("cobertura extra: territory dentro de regla y I3", () => {
	it("withinTerritory: municipio exigido con usuario sin municipio → U; mal municipio → F", () => {
		expect(
			withinTerritory({ ccaa: "13" }, { municipality: "28079" }),
		).toBe("U");
		expect(
			withinTerritory(
				{ ccaa: "13", province: "28", municipality: "28101" },
				{ municipality: "28079" },
			),
		).toBe("F");
		expect(withinTerritory({}, {})).toBe("T");
		expect(
			withinTerritory(
				{ ccaa: "13", province: "28" },
				{ province: "03" },
			),
		).toBe("F");
	});
});

describe("invariants I3 / exhaustive", () => {
	const base: RuleSet = {
		benefitSlug: "x",
		rulesVersion: 1,
		verifiedAt: "2026-10-05",
		humanReview: { status: "approved", by: "t", at: "2026-10-05" },
		referenceDate: "application",
		sources: [
			{
				id: "s1",
				rank: 1,
				documentType: "regulatory_base",
				url: "https://www.boe.es/x",
				title: "t",
			},
		],
		requirements: [
			{
				id: "r",
				hard: true,
				label: "edad",
				citation: { sourceId: "s1", locator: "a", excerpt: "e", excerptSha256: "x" },
				condition: { field: "age", op: "gte", value: 18 },
			},
		],
		uncoveredRequirements: [],
		application: {
			window: {
				rolling: true,
				citation: { sourceId: "s1", locator: "a", excerpt: "e", excerptSha256: "x" },
			},
			channel: {
				managingBody: "m",
				url: "https://x",
				online: true,
				citation: { sourceId: "s1", locator: "a", excerpt: "e", excerptSha256: "x" },
			},
			documents: [],
		},
		amount: null,
		effortInputs: {},
	} as RuleSet;

	const evalBad = (rs: RuleSet) =>
		assertEvaluationInvariants(
			evaluateRuleSet(rs, { catalogVersion: 1, answers: {} }, {
				parameters: { parameters: [] },
				catalog: { catalogVersion: 1, questions: [], consistencyChecks: [] },
				today: "2026-10-05",
			}),
			rs,
			{ parameters: { parameters: [] } },
		);

	it("I3: cita a sourceId inexistente, url no https y cita en condición", () => {
		const badSrc = structuredClone(base);
		badSrc.requirements[0].citation.sourceId = "no-existe";
		expect(evalBad(badSrc)).toContain("I3");

		const badUrl = structuredClone(base);
		badUrl.sources[0].url = "http://insegura";
		expect(evalBad(badUrl)).toContain("I3");

		const badLeaf = structuredClone(base);
		(badLeaf.requirements[0].condition as { citation?: unknown }).citation = {
			sourceId: "fantasma",
			locator: "l",
			excerpt: "e",
			excerptSha256: "h",
		};
		expect(evalBad(badLeaf)).toContain("I3");
	});

	it("runExhaustive sobre regla mínima no viola invariantes", () => {
		const rep = runExhaustive(
			base,
			{ catalogVersion: 1, questions: [], consistencyChecks: [] } as never,
			{ parameters: { parameters: [] }, today: "2026-10-05" },
		);
		expect(rep.violations).toEqual([]);
		expect(rep.determinismViolations).toBe(0);
	});
});

describe("CLOSED_RECURRING (ADR-038)", () => {
	it("recurrence=annual + ≥2 convocatorias consecutivas → CLOSED_RECURRING", () => {
		const w = {
			opensAt: "2025-05-06",
			closesAt: "2025-06-06",
			rolling: false,
			recurrence: "annual" as const,
			previousCalls: [
				{ opensAt: "2024-05-02", closesAt: "2024-06-03" },
				{ opensAt: "2025-05-06", closesAt: "2025-06-06" },
			],
		};
		const r = deadlineState(w, "2026-10-05");
		expect(r.state).toBe("CLOSED_RECURRING");
		expect(r.nextOpeningEstimate).toBe("2026-05-06");
	});
	it("ordena previousCalls aunque vengan descendientes (regresión sort no-op)", () => {
		const w = {
			opensAt: "2025-05-06",
			closesAt: "2025-06-06",
			rolling: false,
			recurrence: "annual" as const,
			previousCalls: [
				{ opensAt: "2025-05-06", closesAt: "2025-06-06" },
				{ opensAt: "2024-05-02", closesAt: "2024-06-03" },
			],
		};
		const r = deadlineState(w, "2026-10-05");
		expect(r.state).toBe("CLOSED_RECURRING");
		expect(r.nextOpeningEstimate).toBe("2026-05-06");
	});
	it("sin ≥2 anuales consecutivas sigue CLOSED", () => {
		const w = {
			closesAt: "2025-06-06",
			rolling: false,
			recurrence: "annual" as const,
			previousCalls: [{ opensAt: "2023-05-02", closesAt: "2023-06-03" }],
		};
		expect(deadlineState(w, "2026-10-05").state).toBe("CLOSED");
	});
});
