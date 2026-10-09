/**
 * results-plan (F10-RES-3) — plan de acción y tarjeta resumida sobre los
 * datos REALES del repo y las 26 personas del barrido
 * (tests/fixtures/personas.mjs, la misma fuente que la ruta real):
 *
 *   1. La suma «Podrías pedir hasta…» == suma de las cuantías de las
 *      ayudas de los grupos 1 (Encaja) y 2 (Podría encajar); nunca
 *      «Solo si…» ni «Faltan datos».
 *   2. En la lista de documentos del plan no entra ningún documento
 *      condicionado a una situación no declarada (condición en U) ni
 *      descartada (F).
 *   3. La tarjeta resumida enseña ≤ 3 ✓ y ≤ 3 ⚠, con las definitorias
 *      y las de acceso primero y nunca líneas de cuantía,
 *      compatibilidad ni cálculo de la base.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readInputs } from "../../scripts/completeness";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import { evalCondition } from "../../src/lib/eligibility-engine/operators";
import type {
	CitizenProfile,
	RuleSet,
} from "../../src/lib/eligibility-engine/schema";
import { pickValidVersions } from "../../src/lib/eligibility-engine/versions";
import {
	type CondMap,
	definingU,
	groupResults,
	isEncaja,
	MAX_OPEN_UNKNOWNS,
} from "../../src/lib/results-order";
import {
	cardSummary,
	isSecondaryReq,
	MAX_SUMMARY_LINES,
	planDocuments,
	planEntries,
	planTotal,
} from "../../src/lib/results-plan";
import { PERSONAS } from "../fixtures/personas.mjs";

const inputs = readInputs(process.cwd());
const TODAY = "2026-10-10";

const COND: CondMap = Object.fromEntries(
	Object.entries(
		(
			JSON.parse(
				readFileSync(
					join(
						process.cwd(),
						"data/presentation/condiciones-definitorias.json",
					),
					"utf8",
				),
			) as {
				rules: Record<
					string,
					{ condiciones?: { req: string; texto: string }[] }
				>;
			}
		).rules,
	).map(([slug, r]) => [slug, r.condiciones ?? []]),
);

function evalAll(answers: CitizenProfile["answers"]) {
	const profile = { answers } as CitizenProfile;
	const { evaluable } = pickValidVersions(inputs.rules, TODAY);
	return evaluable.map((rs: RuleSet) => ({
		rs,
		ev: evaluateRuleSet(rs, profile, {
			catalog: inputs.catalog,
			parameters: inputs.parameters,
			today: TODAY,
		}),
	}));
}

const PERSONA_ENTRIES = Object.entries(PERSONAS) as [
	string,
	CitizenProfile["answers"],
][];

describe("plan de acción (F10-RES-3 §3, bundle real × 26 personas)", () => {
	it("la suma == cuantías de los grupos 1 y 2 solamente", () => {
		for (const [name, answers] of PERSONA_ENTRIES) {
			const evals = evalAll(answers);
			const g = groupResults(evals, false, COND);
			const entries = planEntries(g);
			// Recomposición independiente de «Encaja» + «Podría encajar»:
			// abierta, selfCheck ok, o encaja con lo dicho o es posible con
			// ≤2 incógnitas y sin definitoria en U (= no «solo si…» ni
			// «sin descartar» plegada).
			const esperadas = evals.filter(
				(x) =>
					x.ev.selfCheck.passed &&
					x.ev.deadline.state !== "CLOSED" &&
					(isEncaja(x.rs, x.ev, COND[x.ev.benefitSlug]) ||
						(x.ev.verdict === "posible" &&
							!x.ev.requirements.some((r) => r.status === "F") &&
							x.ev.requirements.filter((r) => r.status === "U").length <=
								MAX_OPEN_UNKNOWNS &&
							definingU(x.rs, x.ev, COND[x.ev.benefitSlug]).length === 0)),
			);
			expect(
				entries.map((x) => x.ev.benefitSlug).sort(),
				`${name}: entries del plan`,
			).toEqual(esperadas.map((x) => x.ev.benefitSlug).sort());

			let min = 0;
			let max = 0;
			let n = 0;
			for (const { ev } of esperadas) {
				const a = ev.amount;
				if (!a || a.type === "variable") continue;
				if (a.minEur !== undefined && a.maxEur !== undefined) {
					min += a.minEur;
					max += a.maxEur;
					n++;
				}
			}
			const total = planTotal(entries);
			if (n === 0) {
				expect(total, `${name}: planTotal no debería existir`).toBeNull();
			} else {
				expect(total, `${name}: planTotal`).not.toBeNull();
				expect(total!.n, `${name}: n`).toBe(n);
				// La suma en coma flotante depende del orden: compara el valor.
				expect(total!.min, `${name}: min`).toBeCloseTo(min, 6);
				expect(total!.max, `${name}: max`).toBeCloseTo(max, 6);
			}
			// Ninguna «solo si…», «faltan datos» ni «sin descartar» plegada
			// puede entrar en la suma.
			for (const s of [...g.soloSi, ...g.faltanDatos, ...g.noDescartar])
				expect(
					entries.some((x) => x.ev.benefitSlug === s.ev.benefitSlug),
					`${name}: ${s.ev.benefitSlug} no debería contar`,
				).toBe(false);
		}
	});

	it("ningún documento condicionado a una situación no declarada (U) ni descartada (F)", () => {
		for (const [name, answers] of PERSONA_ENTRIES) {
			const profile = { answers } as CitizenProfile;
			const g = groupResults(evalAll(answers), false, COND);
			const entries = planEntries(g);
			const docs = planDocuments(entries, profile, inputs.parameters, TODAY);
			const bySlug = new Map(entries.map((x) => [x.ev.benefitSlug, x.rs]));
			for (const d of docs) {
				for (const slug of d.slugs) {
					const rs = bySlug.get(slug)!;
					const doc = rs.application.documents.find((x) => x.label === d.label);
					expect(
						doc,
						`${name}: doc «${d.label}» existe en ${slug}`,
					).toBeDefined();
					if (doc!.condition) {
						const ctx = {
							parameters: inputs.parameters,
							referenceDate:
								rs.referenceDate === "application" ? TODAY : rs.referenceDate,
							today: TODAY,
						};
						expect(
							evalCondition(doc!.condition, profile, ctx).status,
							`${name}: «${d.label}» (${slug}) con condición no declarada`,
						).toBe("T");
					}
				}
			}
		}
	});

	it("caso Daniel: ningún documento condicionado a discapacidad (no declarada)", () => {
		const answers = PERSONA_ENTRIES.find(([n]) => n === "daniel")![1];
		const profile = { answers } as CitizenProfile;
		const entries = planEntries(groupResults(evalAll(answers), false, COND));
		const docs = planDocuments(entries, profile, inputs.parameters, TODAY);
		const labels = new Set(docs.map((d) => d.label));
		// Todo documento de una ayuda del plan cuya condición mire la
		// discapacidad tiene que haber quedado FUERA (Daniel no declaró
		// ninguna para él ni para la persona a su cargo).
		for (const { rs, ev } of entries)
			for (const d of rs.application.documents)
				if (d.condition && JSON.stringify(d.condition).includes("disability"))
					expect(
						labels.has(d.label),
						`«${d.label}» (${ev.benefitSlug}) condicionado a discapacidad`,
					).toBe(false);
	});
});

describe("tarjeta resumida (F10-RES-3 §1, bundle real × 26 personas)", () => {
	it("máximo 3 ✓ y 3 ⚠; ⚠ nunca de cuantía, compatibilidad ni base", () => {
		for (const [name, answers] of PERSONA_ENTRIES) {
			const g = groupResults(evalAll(answers), false, COND);
			for (const { rs, ev } of [...g.encajas, ...g.posiblesPocas]) {
				const defIds = new Set(
					(COND[ev.benefitSlug] ?? [])
						.filter((c) =>
							ev.requirements.some((r) => r.id === c.req && r.status === "U"),
						)
						.map((c) => c.req),
				);
				const s = cardSummary(rs, ev, defIds);
				expect(
					s.cumple.length,
					`${name}/${ev.benefitSlug}: >3 ✓`,
				).toBeLessThanOrEqual(MAX_SUMMARY_LINES);
				expect(
					s.falta.length,
					`${name}/${ev.benefitSlug}: >3 ⚠`,
				).toBeLessThanOrEqual(MAX_SUMMARY_LINES);
				for (const w of s.falta)
					expect(
						isSecondaryReq("", w.label),
						`${name}/${ev.benefitSlug}: «${w.label}» no es de acceso`,
					).toBe(false);
				// Las ✓ del resumen son requisitos realmente en T.
				const tLabels = new Set(
					ev.requirements
						.filter((r) => r.status === "T")
						.map((r) => rs.requirements.find((x) => x.id === r.id)?.label),
				);
				for (const l of s.cumple)
					expect(
						tLabels.has(l),
						`${name}/${ev.benefitSlug}: «${l}» no está en T`,
					).toBe(true);
				// Las definitorias en U van primero en «lo que falta».
				const firstDef = s.falta.findIndex((w) =>
					[...defIds].some((id) => {
						const req = rs.requirements.find((r) => r.id === id);
						return req?.label === w.label;
					}),
				);
				if (firstDef > 0)
					expect(
						firstDef,
						`${name}/${ev.benefitSlug}: definitoria no va primera`,
					).toBe(0);
			}
		}
	});

	it("caso Daniel: la ayuda al alquiler encabeza «Podría encajar»", () => {
		const answers = PERSONA_ENTRIES.find(([n]) => n === "daniel")![1];
		const g = groupResults(evalAll(answers), false, COND);
		expect(g.encajas).toHaveLength(0);
		expect(g.posiblesPocas[0]?.ev.benefitSlug).toBe(
			"madrid-ayudas-alquiler-plan-estatal",
		);
		expect(g.soloSi.length).toBe(8);
	});
});
