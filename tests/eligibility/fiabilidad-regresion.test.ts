/**
 * Regresión de fiabilidad (F10-FIAB, 2026-10-08).
 *
 * - Una regla «abierta» nunca tiene closesAt vencido; una CLOSED_RECURRING
 *   nunca anuncia una reapertura estimada en el pasado.
 * - Con el perfil vacío (sin ninguna respuesta) ningún requisito hard cae en F:
 *   el dato ausente es U, nunca NO (ADR-017, UNKNOWN ≠ NO).
 * - Todo parámetro referenciado tiene vigencia que cubre hoy (I9).
 * - Las 44 personas golden se evalúan aquí: el oráculo jurídico queda dentro
 *   de `npm test` (antes se ejecutaba con scripts ad-hoc fuera del repo).
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { deadlineState } from "../../src/lib/eligibility-engine/deadline";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import {
	goldenPersonaSchema,
	parametersSchema,
	questionCatalogSchema,
	ruleSetSchema,
	type RuleSet,
} from "../../src/lib/eligibility-engine/schema";
import { resolveParam } from "../../src/lib/eligibility-engine/params";
import { validOn } from "../../src/lib/eligibility-engine/versions";

const root = join(__dirname, "../..");
const TODAY = new Date().toISOString().slice(0, 10);
const CATALOG = questionCatalogSchema.parse(
	JSON.parse(readFileSync(join(root, "data/eligibility/questions.json"), "utf8")),
);
const PARAMETERS = parametersSchema.parse(
	JSON.parse(readFileSync(join(root, "data/eligibility/parameters.json"), "utf8")),
);
const CTX = { parameters: PARAMETERS, catalog: CATALOG, today: TODAY };

const rules: RuleSet[] = readdirSync(join(root, "data/eligibility/rules"))
	.filter((f) => f.endsWith(".json"))
	.map((f) =>
		ruleSetSchema.parse(
			JSON.parse(readFileSync(join(root, "data/eligibility/rules", f), "utf8")),
		),
	);

describe("plazos honestos (regresión)", () => {
	it("ninguna regla evalúa OPEN/UPCOMING con closesAt vencido", () => {
		for (const rs of rules) {
			const d = deadlineState(rs.application.window, TODAY);
			if (d.state === "OPEN" || d.state === "UPCOMING") {
				expect(
					!(rs.application.window.closesAt && rs.application.window.closesAt < TODAY),
					`${rs.benefitSlug} dice abierta con cierre ${rs.application.window.closesAt}`,
				).toBe(true);
			}
		}
	});
	it("ninguna CLOSED_RECURRING anuncia reapertura estimada en el pasado", () => {
		for (const rs of rules) {
			const d = deadlineState(rs.application.window, TODAY);
			if (d.state === "CLOSED_RECURRING" && d.nextOpeningEstimate) {
				expect(
					d.nextOpeningEstimate > TODAY,
					`${rs.benefitSlug} estima reapertura ${d.nextOpeningEstimate} ≤ ${TODAY}`,
				).toBe(true);
			}
		}
	});
});

describe("asimetría: sin datos no hay NO (regresión)", () => {
	it("perfil vacío ⇒ 0 requisitos hard en F en todas las reglas", () => {
		const empty = { catalogVersion: CATALOG.catalogVersion, answers: {} };
		for (const rs of rules) {
			if (!validOn(rs, TODAY)) continue;
			const ev = evaluateRuleSet(rs, empty, CTX);
			const hardF = ev.requirements.filter((r) => r.hard && r.status === "F");
			expect(hardF.map((r) => r.id), rs.benefitSlug).toEqual([]);
		}
	});
	it("todo parámetro usado resuelve a hoy", () => {
		for (const rs of rules) {
			for (const p of rs.parametersUsed ?? []) {
				expect(
					resolveParam(PARAMETERS, p, TODAY),
					`${rs.benefitSlug}: param ${p}`,
				).not.toBeUndefined();
			}
		}
	});
});

describe("personas golden (todas, en npm test)", () => {
	const dir = join(root, "data/eligibility/golden");
	const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
	it(`hay ≥ 12 personas golden (docs/07 §8.4)`, () => {
		expect(files.length).toBeGreaterThanOrEqual(12);
	});
	for (const f of files) {
		it(`${f} reproduce sus expectativas`, () => {
			const raw = JSON.parse(readFileSync(join(dir, f), "utf8"));
			delete raw.benefitSlug;
			delete raw.rulesVersion;
			if (
				raw.review &&
				!["pending", "approved", "rejected"].includes(raw.review.status)
			)
				raw.review.status = "pending";
			if (raw.review) delete raw.review.report;
			const gp = goldenPersonaSchema.parse(raw);
			for (const exp of gp.expectations) {
				const cands = rules.filter(
					(r) => r.benefitSlug === exp.benefitSlug && r.rulesVersion === exp.rulesVersion,
				);
				const valid = cands.filter((r) => validOn(r, gp.today));
				const rs = valid.length === 1 ? valid[0] : cands.length === 1 ? cands[0] : undefined;
				expect(rs, `${gp.id}: sin ruleset ${exp.benefitSlug}@v${exp.rulesVersion}`).toBeDefined();
				const ev = evaluateRuleSet(rs as RuleSet, gp.profile, {
					parameters: PARAMETERS,
					catalog: CATALOG,
					today: gp.today,
				});
				expect(ev.selfCheck.failed, `${gp.id} ${exp.benefitSlug}`).toEqual([]);
				expect(ev.verdict, `${gp.id} ${exp.benefitSlug} verdict`).toBe(exp.verdict);
				if (exp.deadlineState !== undefined)
					expect(ev.deadline.state).toBe(exp.deadlineState);
				if (exp.blockers !== undefined)
					expect([...ev.blockers].sort()).toEqual([...exp.blockers].sort());
				if (exp.futureFrom !== undefined)
					expect(ev.futureEligibility?.from).toBe(exp.futureFrom);
			}
		});
	}
});
