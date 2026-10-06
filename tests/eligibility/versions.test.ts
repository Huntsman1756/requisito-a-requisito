import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import {
	notEvaluableNow,
	pickValidVersions,
	validOn,
} from "../../src/lib/eligibility-engine/versions";
import type { RuleSet } from "../../src/lib/eligibility-engine/schema";

const ROOT = join(__dirname, "..", "..");
const bundle = JSON.parse(
	readFileSync(join(ROOT, "data/eligibility/bundle/eligibility-bundle.json"), "utf8"),
);
const catalog = JSON.parse(
	readFileSync(join(ROOT, "data/eligibility/questions.json"), "utf8"),
);

const VSLUGS = [
	"prestacion-cuidador-no-profesional",
	"prestaciones-dependencia-saad",
];

describe("R8-VIG — versiones de regla con vigencia", () => {
	it("el bundle contiene dos versiones de cada regla de dependencia con ventanas disjuntas", () => {
		for (const slug of VSLUGS) {
			const vs = bundle.rulesets.filter((r: RuleSet) => r.benefitSlug === slug);
			expect(vs.length, slug).toBe(2);
			const a = vs.find((r: RuleSet) => r.validUntil === "2026-10-22");
			const b = vs.find((r: RuleSet) => r.validFrom === "2026-10-23");
			expect(a, `${slug} versión A`).toBeTruthy();
			expect(b, `${slug} versión B`).toBeTruthy();
		}
	});

	it("el 22/10 se evalúa la redacción anterior; el 23/10 la de la Ley 4/2026", () => {
		for (const slug of VSLUGS) {
			const before = pickValidVersions(bundle.rulesets, "2026-10-22");
			const after = pickValidVersions(bundle.rulesets, "2026-10-23");
			const a = before.evaluable.find((r) => r.benefitSlug === slug);
			const b = after.evaluable.find((r) => r.benefitSlug === slug);
			expect(a?.validUntil).toBe("2026-10-22");
			expect(b?.validFrom).toBe("2026-10-23");
			expect(before.unavailable.map((u) => u.slug)).not.toContain(slug);
			expect(after.unavailable.map((u) => u.slug)).not.toContain(slug);
		}
	});

	it("sin versión vigente ⇒ «No podemos evaluar» (fail-closed)", () => {
		const fake: RuleSet[] = [
			{
				benefitSlug: "demo-futura",
				rulesVersion: 1,
				validFrom: "2030-01-01",
				verifiedAt: "2026-01-01",
				humanReview: { status: "pending" },
				referenceDate: "application",
				sources: [],
				requirements: [],
				uncoveredRequirements: [],
				application: {},
				amount: null,
			} as never,
		];
		const out = pickValidVersions(fake, "2026-10-06");
		expect(out.unavailable).toEqual([
			{ slug: "demo-futura", reason: "none" },
		]);
		const ev = notEvaluableNow("demo-futura", "2026-10-06") as never as {
			selfCheck: { passed: boolean; failed: string[] };
		};
		expect(ev.selfCheck.passed).toBe(false);
		expect(ev.selfCheck.failed).toContain("I11");
	});

	it("ventanas solapadas ⇒ ambigua, nunca se evalúa", () => {
		const a = { benefitSlug: "x", validFrom: "2026-01-01", validUntil: "2026-10-25" } as RuleSet;
		const b = { benefitSlug: "x", validFrom: "2026-10-23" } as RuleSet;
		const out = pickValidVersions([a, b], "2026-10-24");
		expect(out.unavailable[0].reason).toBe("ambiguous");
	});

	it("I11: una versión evaluada fuera de su vigencia suspende el veredicto", () => {
		const rs = bundle.rulesets.find(
			(r: RuleSet) => r.benefitSlug === "prestacion-cuidador-no-profesional" && r.validUntil,
		);
		// la versión A evaluada a fecha futura debe fallar el self-check
		const ev = evaluateRuleSet(
			rs,
			{ catalogVersion: 1, answers: {} } as never,
			{
				parameters: bundle.parameters,
				catalog,
				today: "2026-10-30",
			} as never,
		);
		expect(ev.selfCheck.passed).toBe(false);
		expect(ev.selfCheck.failed).toContain("I11");
	});

	it("goldens: posible + ROLLING en la versión vigente de cada fecha", () => {
		const gp = JSON.parse(
			readFileSync(join(ROOT, "data/eligibility/golden/gp-cuidadora-64-carabanchel.json"), "utf8"),
		);
		for (const exp of gp.expectations) {
			for (const today of ["2026-10-22", "2026-10-23"]) {
				const { evaluable } = pickValidVersions(bundle.rulesets, today);
				const rs = evaluable.find((r) => r.benefitSlug === exp.benefitSlug);
				expect(rs, `${exp.benefitSlug} en ${today}`).toBeTruthy();
				const ev = evaluateRuleSet(rs!, gp.profile, {
					parameters: bundle.parameters,
					catalog,
					today,
				} as never);
				expect(ev.verdict).toBe("posible");
				expect(ev.deadline.state).toBe("ROLLING");
			}
		}
	});

	it("validOn respeta fechas incluidas", () => {
		const rs = {
			validFrom: "2026-10-23",
			validUntil: "2027-01-01",
		} as RuleSet;
		expect(validOn(rs, "2026-10-22")).toBe(false);
		expect(validOn(rs, "2026-10-23")).toBe(true);
		expect(validOn(rs, "2027-01-01")).toBe(true);
		expect(validOn(rs, "2027-01-02")).toBe(false);
	});
});
