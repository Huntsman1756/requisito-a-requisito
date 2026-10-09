/**
 * Tests de frontera F3-5: un caso por umbral, escritos desde la cita.
 * «Con 17 cumple, con 16 no» — cada límite de cada regla del lote 1.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateRuleSet } from "../../../src/lib/eligibility-engine/evaluate";
import {
	parametersSchema,
	questionCatalogSchema,
	ruleSetSchema,
	type RuleSet,
} from "../../../src/lib/eligibility-engine/schema";

const root = join(__dirname, "../../..");
const CATALOG = questionCatalogSchema.parse(
	JSON.parse(readFileSync(join(root, "data/eligibility/questions.json"), "utf8")),
);
const PARAMETERS = parametersSchema.parse(
	JSON.parse(readFileSync(join(root, "data/eligibility/parameters.json"), "utf8")),
);
const TODAY = "2026-10-05";
const CTX = { parameters: PARAMETERS, catalog: CATALOG, today: TODAY };

const rules = new Map(
	readdirSync(join(root, "data/eligibility/rules"))
		.filter((f) => f.endsWith(".json"))
		.map((f) => [
			f.replace(/\.json$/, ""),
			ruleSetSchema.parse(
				JSON.parse(readFileSync(join(root, "data/eligibility/rules", f), "utf8")),
			) as RuleSet,
		]),
);

const rs = (slug: string): RuleSet => {
	const r = rules.get(slug);
	if (!r) throw new Error(`RuleSet ${slug} no encontrado`);
	return r;
};

type AnswerValue = CitizenProfile["answers"][string];
import type { CitizenProfile } from "../../../src/lib/eligibility-engine/schema";
const val = (v: unknown): AnswerValue => ({ state: "value", value: v as CitizenProfile["answers"][string] extends { state: "value"; value: infer T } ? T : never }) as AnswerValue;
const age = (n: number) => val({ min: n, max: n, maxExclusive: false });
const band = (lo: number, hi: number) => val({ min: lo, max: hi, maxExclusive: false });
const prof = (answers: CitizenProfile["answers"]): CitizenProfile => ({
	catalogVersion: CATALOG.catalogVersion,
	answers,
});
const statusOf = (slug: string, answers: CitizenProfile["answers"], reqId: string) =>
	evaluateRuleSet(rs(slug), prof(answers), CTX).requirements.find(
		(r) => r.id === reqId,
	)?.status;
const verdictOf = (slug: string, answers: CitizenProfile["answers"]) =>
	evaluateRuleSet(rs(slug), prof(answers), CTX);

describe("frontera: bono-cultural-joven", () => {
	// Cita: «cumplan 18 años en 2026» = haber nacido en 2008 (F3-FIX: se pregunta el año).
	const year = (y: number) => val({ min: y, max: y, maxExclusive: false });
	it("nacido en 2008 ⇒ T; 2007 o 2009 ⇒ F", () => {
		expect(statusOf("bono-cultural-joven", { birthYear: year(2008) }, "nacido-en-2008")).toBe("T");
		expect(statusOf("bono-cultural-joven", { birthYear: year(2007) }, "nacido-en-2008")).toBe("F");
		expect(statusOf("bono-cultural-joven", { birthYear: year(2009) }, "nacido-en-2008")).toBe("F");
	});
	it("intervalo que cruza 2008 ⇒ U", () => {
		expect(statusOf("bono-cultural-joven", { birthYear: band(2007, 2009) }, "nacido-en-2008")).toBe("U");
	});
	it("«18 años» sin año de nacimiento ⇒ U, nunca probable", () => {
		const ev = verdictOf("bono-cultural-joven", { age: age(18) });
		expect(ev.requirements[0].status).toBe("U");
		expect(ev.verdict).not.toBe("probable");
		expect(ev.verdict).toBe("insuficiente");
	});
	// F10-RES-2 §2.1: la edad respondida fija el año de nacimiento en un
	// rango de 2 años (cumpleaños a ambos lados de la fecha de referencia).
	it("edad ⇒ año de nacimiento derivado: 56 años ⇒ 1969–1970 ⇒ F", () => {
		expect(statusOf("bono-cultural-joven", { age: age(56) }, "nacido-en-2008")).toBe("F");
	});
	it("18 años a 05/10/2026 ⇒ nació en 2007 u 2008 ⇒ U (sigue preguntando el año)", () => {
		expect(statusOf("bono-cultural-joven", { age: age(18) }, "nacido-en-2008")).toBe("U");
	});
	it("19 años a 05/10/2026 ⇒ 2006–2007 ⇒ F", () => {
		expect(statusOf("bono-cultural-joven", { age: age(19) }, "nacido-en-2008")).toBe("F");
	});
	it("el año respondido directo manda sobre el derivado de la edad", () => {
		expect(
			statusOf(
				"bono-cultural-joven",
				{ age: age(56), birthYear: year(2008) },
				"nacido-en-2008",
			),
		).toBe("T");
	});
	it("nacido en nov-2007 ⇒ no_cumple (golden F3-FIX)", () => {
		const ev = verdictOf("bono-cultural-joven", { birthYear: year(2007) });
		expect(ev.verdict).toBe("no_cumple");
	});
	it("nacionalidad ⚠: con 2008 el veredicto máximo es posible", () => {
		const ev = verdictOf("bono-cultural-joven", { birthYear: year(2008) });
		expect(ev.verdict).toBe("posible");
		expect(ev.uncovered.length).toBeGreaterThan(0);
	});
	it("plazo abierto hoy (cierre 31/10/2026)", () => {
		const ev = verdictOf("bono-cultural-joven", {});
		expect(ev.deadline.state).toBe("OPEN");
	});
});

describe("frontera: madrid-ayudas-nacimiento-adopcion-multiple", () => {
	const deps = (n: number) =>
		val(
			Array.from({ length: n }, () => ({ age: { min: 1, max: 1, maxExclusive: false } })),
		);
	it("≥2 personas a cargo necesario; 1 no vale", () => {
		expect(
			statusOf("madrid-ayudas-nacimiento-adopcion-multiple",
				{ dependents: deps(2) }, "dos-o-mas-personas-cargo"),
		).toBe("T");
		expect(
			statusOf("madrid-ayudas-nacimiento-adopcion-multiple",
				{ dependents: deps(1) }, "dos-o-mas-personas-cargo"),
		).toBe("F");
	});
	it("empadronado en CAM vs otra CCAA", () => {
		expect(
			statusOf("madrid-ayudas-nacimiento-adopcion-multiple",
				{ territory: val({ ccaa: "13" }) }, "empadronado-madrid"),
		).toBe("T");
		expect(
			statusOf("madrid-ayudas-nacimiento-adopcion-multiple",
				{ territory: val({ ccaa: "09" }) }, "empadronado-madrid"),
		).toBe("F");
	});
	it("ingresos <30k en requisito soft (per cápita queda ⚠)", () => {
		expect(
			statusOf("madrid-ayudas-nacimiento-adopcion-multiple",
				{ incomeAnnual: band(25200, 35000) }, "ingresos-referencia"),
		).toBe("U"); // cruza el umbral
		expect(
			statusOf("madrid-ayudas-nacimiento-adopcion-multiple",
				{ incomeAnnual: val({ min: 0, max: 25200 }) }, "ingresos-referencia"),
		).toBe("T");
	});
});

describe("frontera: prestacion-nacimiento-fn-monoparental-discapacidad", () => {
	const slug = "prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad";
	it("vía familia numerosa", () => {
		expect(statusOf(slug, { familyType: val("familia-numerosa") }, "colectivo-familiar")).toBe("T");
	});
	it("vía monoparental", () => {
		expect(statusOf(slug, { familyType: val("monoparental") }, "colectivo-familiar")).toBe("T");
	});
	it("vía discapacidad (≥33 en la pregunta; la norma exige ≥65 ⇒ ⚠ en uncovered)", () => {
		const ev = verdictOf(slug, { disability: val("gte33"), familyType: val("general") });
		expect(ev.requirements[0].status).toBe("T");
		expect(ev.uncovered.some((u) => u.includes("≥65 %"))).toBe(true);
	});
	it("sin ninguna vía ⇒ F ⇒ no_cumple", () => {
		// dependents respondido ([]) para que la rama «adquiere la condición»
		// evalúe F y no U (UNKNOWN ≠ NO).
		const ev = verdictOf(slug, {
			familyType: val("general"),
			disability: val("no"),
			dependents: val([]),
		});
		expect(ev.requirements[0].status).toBe("F");
		expect(ev.verdict).toBe("no_cumple");
	});
});

describe("frontera: bono-social-electrico", () => {
	// Cita: renta ≤ 1,5 × IPREM 14p = 12.600 € (IPREM_ANUAL_14P = 8.400)
	it("0–8.400 ⇒ T; banda 8.400–16.800 cruza ⇒ U", () => {
		expect(
			statusOf("bono-social-electrico",
				{ incomeAnnual: val({ min: 0, max: 8400 }) }, "alguna-via-vulnerable"),
		).toBe("T");
		expect(
			statusOf("bono-social-electrico",
				{ incomeAnnual: val({ min: 8400, max: 16800 }) }, "alguna-via-vulnerable"),
		).toBe("U");
	});
	it("familia numerosa ⇒ T por esa vía", () => {
		expect(
			statusOf("bono-social-electrico",
				{ familyType: val("familia-numerosa") }, "alguna-via-vulnerable"),
		).toBe("T");
	});
	it("el veredicto nunca es no_cumple (todo soft + ⚠): siempre posible", () => {
		const ev = verdictOf("bono-social-electrico", {
			familyType: val("general"),
			incomeAnnual: val({ min: 25200, max: 25200, maxExclusive: false }),
		});
		expect(ev.verdict).toBe("posible");
	});
});

describe("frontera: subsidio-mayores-52", () => {
	it("52 cumple; 51 no; frontera exacta incluida", () => {
		expect(statusOf("subsidio-mayores-52", { age: age(52) }, "edad-52")).toBe("T");
		expect(statusOf("subsidio-mayores-52", { age: age(51) }, "edad-52")).toBe("F");
		expect(statusOf("subsidio-mayores-52", { age: band(51, 52) }, "edad-52")).toBe("U");
	});
	it("futuro: con 51 años y plazo rolling ⇒ futureEligibility a los 52", () => {
		const ev = verdictOf("subsidio-mayores-52", { age: age(51) });
		expect(ev.futureEligibility?.from).toBe("2027-10-05");
	});
	it("desempleado ⇒ T (soft); autónomo ⇒ F (soft, no cambia el veredicto)", () => {
		expect(
			statusOf("subsidio-mayores-52",
				{ employmentStatus: val("desempleado") }, "desempleo"),
		).toBe("T");
		expect(
			statusOf("subsidio-mayores-52",
				{ employmentStatus: val("autonomo") }, "desempleo"),
		).toBe("F");
	});
});

describe("frontera: descuento-transporte-familia-numerosa", () => {
	it("familia numerosa ⇒ T; no FN ⇒ F ⇒ no_cumple", () => {
		expect(
			statusOf("descuento-transporte-familia-numerosa",
				{ familyType: val("familia-numerosa") }, "titulo-familia-numerosa"),
		).toBe("T");
		const ev = verdictOf("descuento-transporte-familia-numerosa", { familyType: val("general") });
		expect(ev.requirements[0].status).toBe("F");
		expect(ev.verdict).toBe("no_cumple");
	});
	it("categoría general/especial queda ⚠", () => {
		const ev = verdictOf("descuento-transporte-familia-numerosa", { familyType: val("familia-numerosa") });
		expect(ev.uncovered.length).toBeGreaterThan(0);
	});
});

describe("self-check en cada evaluación del lote", () => {
	it("todos los perfiles del borde pasan los invariantes", () => {
		const perfiles: CitizenProfile["answers"][] = [
			{},
			{ age: age(18) },
			{ territory: val({ ccaa: "13" }) },
		];
		for (const slug of rules.keys()) {
			// R8-VIG: las versiones con vigencia fuera de `today` no se evalúan
			// (fail-closed por diseño); solo se exige pasar el self-check a la
			// versión vigente.
			const r = rs(slug);
			if ((r.validFrom && r.validFrom > TODAY) || (r.validUntil && r.validUntil < TODAY)) {
				continue;
			}
			for (const a of perfiles) {
				const ev = verdictOf(slug, a);
				expect(ev.selfCheck.failed, `${slug} ${JSON.stringify(a)}`).toEqual([]);
			}
		}
	});
});
