// Origen: la-ayuda@6595a533 (rama feat/premio-gtl-elegibilidad, MIT, codigo propio). Portado segun docs/13.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	citizenProfileSchema,
	evaluationResultSchema,
	goldenPersonaSchema,
	parametersSchema,
	questionCatalogSchema,
	ruleSetSchema,
	sourceRegistrySchema,
	sourceSnapshotSchema,
} from "../../src/lib/eligibility-engine/schema";

const FIXTURES = join(__dirname, "fixtures");
const ruleSetExample = JSON.parse(
	readFileSync(join(FIXTURES, "rule-set.example.json"), "utf8"),
);
const goldenExample = JSON.parse(
	readFileSync(join(FIXTURES, "golden-persona.example.json"), "utf8"),
);

// biome-ignore lint/suspicious/noExplicitAny: los mutantes rompen el contrato a propósito
function clone<T>(v: T): any {
	return JSON.parse(JSON.stringify(v));
}

describe("ruleSetSchema", () => {
	it("accepts the normative template example", () => {
		const r = ruleSetSchema.safeParse(ruleSetExample);
		expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
	});

	it("rejects a requirement without citation", () => {
		const m = clone(ruleSetExample);
		delete m.requirements[0].citation;
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("rejects unknown top-level properties (additionalProperties:false)", () => {
		const m = { ...clone(ruleSetExample), unexpected: true };
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a source rank outside 1-4", () => {
		const m = clone(ruleSetExample);
		m.sources[0].rank = 5;
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a non-https source url", () => {
		const m = clone(ruleSetExample);
		m.sources[0].url = "http://www.bocm.es/x.pdf";
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a malformed excerptSha256", () => {
		const m = clone(ruleSetExample);
		m.requirements[0].citation.excerptSha256 = "zz";
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("rejects empty requirements", () => {
		const m = clone(ruleSetExample);
		m.requirements = [];
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a bad benefitSlug", () => {
		const m = { ...clone(ruleSetExample), benefitSlug: "Mayuscula Mal" };
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("rejects an unknown condition op", () => {
		const m = clone(ruleSetExample);
		m.requirements[0].condition = { field: "age", op: "about", value: 3 };
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("rejects referenceDate that is neither a date nor 'application'", () => {
		const m = { ...clone(ruleSetExample), referenceDate: "hoy" };
		expect(ruleSetSchema.safeParse(m).success).toBe(false);
	});

	it("accepts amount:null", () => {
		const m = clone(ruleSetExample);
		m.amount = null;
		expect(ruleSetSchema.safeParse(m).success).toBe(true);
	});
});

describe("goldenPersonaSchema", () => {
	it("accepts the normative template example", () => {
		const r = goldenPersonaSchema.safeParse(goldenExample);
		expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
	});

	it("rejects an unknown verdict", () => {
		const m = clone(goldenExample);
		m.expectations[0].verdict = "quizas";
		expect(goldenPersonaSchema.safeParse(m).success).toBe(false);
	});

	it("rejects empty justification (the oracle needs a legal reason)", () => {
		const m = clone(goldenExample);
		m.expectations[0].justification = [];
		expect(goldenPersonaSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a profile answer with a foreign property", () => {
		const m = clone(goldenExample);
		m.profile.answers.territory.hack = true;
		expect(goldenPersonaSchema.safeParse(m).success).toBe(false);
	});
});

describe("citizenProfileSchema", () => {
	it("accepts the golden profile", () => {
		expect(citizenProfileSchema.safeParse(goldenExample.profile).success).toBe(
			true,
		);
	});

	it("rejects an answer state outside the four allowed", () => {
		const p = {
			catalogVersion: 1,
			answers: { age: { state: "quiza", value: 30 } },
		};
		expect(citizenProfileSchema.safeParse(p).success).toBe(false);
	});

	it("rejects a value-state answer without value", () => {
		const p = {
			catalogVersion: 1,
			answers: { age: { state: "value" } },
		};
		expect(citizenProfileSchema.safeParse(p).success).toBe(false);
	});

	it("rejects a malformed ccaa code", () => {
		const p = {
			catalogVersion: 1,
			answers: { territory: { state: "value", value: { ccaa: "1" } } },
		};
		expect(citizenProfileSchema.safeParse(p).success).toBe(false);
	});

	it("accepts unknown/declined/unasked answers", () => {
		const p = {
			catalogVersion: 1,
			answers: {
				a: { state: "unknown" },
				b: { state: "declined" },
				c: { state: "unasked" },
			},
		};
		expect(citizenProfileSchema.safeParse(p).success).toBe(true);
	});
});

const minimalCitation = {
	sourceId: "s1",
	locator: "Art. 1",
	excerpt: "extracto literal suficientemente largo",
	excerptSha256: "a".repeat(64),
};

describe("parametersSchema", () => {
	const valid = {
		parameters: [
			{
				id: "IPREM_ANUAL_14P",
				label: "IPREM anual 14 pagas",
				unit: "EUR_YEAR",
				periods: [
					{ from: "2026-01-01", value: 10151.2, citation: minimalCitation },
				],
			},
		],
	};

	it("accepts a valid parameter set", () => {
		expect(parametersSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects an unknown unit", () => {
		const m = clone(valid);
		m.parameters[0].unit = "EUR";
		expect(parametersSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a period without citation", () => {
		const m = clone(valid);
		delete m.parameters[0].periods[0].citation;
		expect(parametersSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a lowercase parameter id", () => {
		const m = clone(valid);
		m.parameters[0].id = "iprem";
		expect(parametersSchema.safeParse(m).success).toBe(false);
	});
});

describe("questionCatalogSchema", () => {
	const q = (i: number) => ({
		id: `q-test-${i}`,
		field: `field${i}`,
		type: "single",
		order: i,
		labelKey: `q${i}_label`,
		whyKey: `q${i}_why`,
		allowUnknown: true,
		allowDecline: true,
		sensitivity: "normal",
	});
	const valid = { catalogVersion: 1, questions: [q(1)], consistencyChecks: [] };

	it("accepts a valid catalog", () => {
		expect(questionCatalogSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects more than 14 questions", () => {
		const m = {
			...valid,
			questions: Array.from({ length: 15 }, (_, i) => q(i + 1)),
		};
		expect(questionCatalogSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a question without whyKey", () => {
		const m = clone(valid);
		delete m.questions[0].whyKey;
		expect(questionCatalogSchema.safeParse(m).success).toBe(false);
	});

	it("rejects sensitivity outside normal|special", () => {
		const m = clone(valid);
		m.questions[0].sensitivity = "high";
		expect(questionCatalogSchema.safeParse(m).success).toBe(false);
	});

	it("accepts showIf conditions referencing the condition tree", () => {
		const m = clone(valid);
		m.questions[0].showIf = { field: "hasChildren", op: "eq", value: "yes" };
		expect(questionCatalogSchema.safeParse(m).success).toBe(true);
	});
});

describe("sourceRegistrySchema + sourceSnapshotSchema", () => {
	it("accepts a valid registry", () => {
		const r = {
			domains: [
				{ host: "www.boe.es", maxRank: 1, label: "BOE" },
				{ host: ".comunidad.madrid", maxRank: 2, label: "Comunidad de Madrid" },
			],
		};
		expect(sourceRegistrySchema.safeParse(r).success).toBe(true);
	});

	it("rejects maxRank outside 1-4", () => {
		const r = { domains: [{ host: "x", maxRank: 0, label: "x" }] };
		expect(sourceRegistrySchema.safeParse(r).success).toBe(false);
	});

	it("rejects a snapshot over http or without hashes", () => {
		const s = {
			id: "s1",
			url: "http://inseguro.example/x",
			fetchedAt: "2026-10-05T10:00:00Z",
			sha256: "a".repeat(64),
			textSha256: "b".repeat(64),
			contentType: "application/pdf",
			rank: 1,
		};
		expect(sourceSnapshotSchema.safeParse(s).success).toBe(false);
	});
});

describe("evaluationResultSchema", () => {
	const valid = {
		benefitSlug: "x",
		rulesVersion: 1,
		today: "2026-10-05",
		verdict: "posible",
		requirements: [
			{
				id: "r1",
				hard: true,
				status: "T",
				reasonKey: "elig_req_pass",
				citation: minimalCitation,
			},
		],
		missing: [],
		blockers: [],
		uncovered: ["al-corriente"],
		deadline: { state: "OPEN", closesAt: "2026-10-30", daysLeft: 25 },
		documents: ["dni"],
		channel: { managingBody: "X", url: "https://x.es", online: true },
		whyShown: ["r1"],
		verifiedAt: "2026-10-01",
		explanationKeys: ["elig_req_pass"],
		selfCheck: { passed: true, failed: [] },
	};

	it("accepts a valid evaluation result", () => {
		expect(evaluationResultSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects a verdict outside the four values", () => {
		const m = { ...clone(valid), verdict: "seguro" };
		expect(evaluationResultSchema.safeParse(m).success).toBe(false);
	});

	it("rejects an invariant code outside I1-I11", () => {
		const m = clone(valid);
		m.selfCheck = { passed: false, failed: ["I12"] };
		expect(evaluationResultSchema.safeParse(m).success).toBe(false);
	});

	it("rejects a requirement row without citation", () => {
		const m = clone(valid);
		delete m.requirements[0].citation;
		expect(evaluationResultSchema.safeParse(m).success).toBe(false);
	});
});
