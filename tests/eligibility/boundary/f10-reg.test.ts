/**
 * Frontera y regresión de los sospechosos F10-REG-1..7
 * (evidence/2026-10-06-panel-v2/tria-defectos-v1.md).
 *
 * Cada caso fija la decisión tomada: borde inclusivo del abono infantil,
 * no_cumple prohibido para residencia «prevista» (EIM), edad ≥67 en
 * incapacidad permanente (la exclusión es solo por contingencias comunes),
 * y declaración en uncovered de lo que el cuestionario no mide.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateRuleSet } from "../../../src/lib/eligibility-engine/evaluate";
import {
	type CitizenProfile,
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
const TODAY = "2026-10-08";
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
// Clave por benefitSlug (nombre de fichero ≠ slug en una regla: becas-mec-*).
const bySlug = new Map([...rules.values()].map((r) => [r.benefitSlug, r]));

const rs = (slug: string): RuleSet => {
	const r = bySlug.get(slug);
	if (!r) throw new Error(`RuleSet ${slug} no encontrado`);
	return r;
};
type AnswerValue = CitizenProfile["answers"][string];
const val = (v: unknown): AnswerValue => ({ state: "value", value: v }) as AnswerValue;
const prof = (answers: CitizenProfile["answers"]): CitizenProfile => ({
	catalogVersion: CATALOG.catalogVersion,
	answers,
});
const evOf = (slug: string, answers: CitizenProfile["answers"]) =>
	evaluateRuleSet(rs(slug), prof(answers), CTX);
const statusOf = (slug: string, answers: CitizenProfile["answers"], reqId: string) =>
	evOf(slug, answers).requirements.find((r) => r.id === reqId)?.status;

const depAges = (...ages: number[]) =>
	val(ages.map((a) => ({ age: { min: a, max: a, maxExclusive: false } })));

describe("F10-REG-2 · madrid-abono-transporte-infantil: borde 0–14 años inclusivo", () => {
	// Convocatoria 2026: «niños nacidos entre 2012 y 2026» ⇒ edades 0–14.
	it("menor de 14 años a cargo ⇒ T; de 15 ⇒ F", () => {
		expect(
			statusOf("madrid-abono-transporte-infantil", { dependents: depAges(14) }, "menor-0-14-a-cargo"),
		).toBe("T");
		expect(
			statusOf("madrid-abono-transporte-infantil", { dependents: depAges(15) }, "menor-0-14-a-cargo"),
		).toBe("F");
	});
	it("edad del menor sin precisar ⇒ U, nunca F (UNKNOWN ≠ NO)", () => {
		// El cuestionario solo pregunta cuántas personas a cargo hay.
		const unkn = val([{ age: { min: 0, max: 130, maxExclusive: false } }]);
		expect(
			statusOf("madrid-abono-transporte-infantil", { dependents: unkn }, "menor-0-14-a-cargo"),
		).toBe("U");
	});
	it("0 personas a cargo ⇒ F (respuesta definida)", () => {
		expect(
			statusOf("madrid-abono-transporte-infantil", { dependents: val([]) }, "menor-0-14-a-cargo"),
		).toBe("F");
	});
});

describe("F10-REG-4 · pension-incapacidad-permanente: ≥67 no es no_cumple", () => {
	// La exclusión aplica solo a contingencias comunes (accidente de trabajo y
	// enfermedad profesional dan derecho a cualquier edad): requisito soft.
	it("con 67 o más años el veredicto nunca es no_cumple", () => {
		const ev = evOf("pension-incapacidad-permanente", {
			age: val({ min: 68, max: 68, maxExclusive: false }),
		});
		expect(ev.verdict).not.toBe("no_cumple");
		expect(ev.requirements.find((r) => r.id === "edad-inferior-jubilacion-comunes")?.hard).toBe(false);
	});
	it("con menos de 67 el requisito es T", () => {
		expect(
			statusOf("pension-incapacidad-permanente",
				{ age: val({ min: 60, max: 60, maxExclusive: false }) },
				"edad-inferior-jubilacion-comunes"),
		).toBe("T");
	});
});

describe("F10-REG-6 · ayto-escuela-infantil: «prever residir» no puede dar no_cumple", () => {
	// La norma admite a quien «prevea residir» en Madrid antes del curso; el
	// cuestionario solo pregunta el empadronamiento actual ⇒ requisito soft.
	it("empadronada en otro municipio ⇒ soft F (⚠), nunca no_cumple", () => {
		const ev = evOf("ayto-escuela-infantil", {
			territory: val({ ccaa: "13", province: "28", municipality: "28065" }), // Getafe
		});
		expect(ev.requirements.find((r) => r.id === "residir-madrid")?.hard).toBe(false);
		expect(ev.requirements.find((r) => r.id === "residir-madrid")?.status).toBe("F");
		expect(ev.verdict).not.toBe("no_cumple");
	});
	it("empadronada en Madrid ⇒ T", () => {
		expect(
			statusOf("ayto-escuela-infantil",
				{ territory: val({ ccaa: "13", province: "28", municipality: "28079" }) },
				"residir-madrid"),
		).toBe("T");
	});
	it("la excepción está declarada en uncovered", () => {
		expect(rs("ayto-escuela-infantil").uncoveredRequirements.some((u) => u.id === "prever-residir")).toBe(true);
	});
});

describe("F10-REG-1/3/5 · lo no medible queda declarado en uncovered", () => {
	it("asignacion-hijo-a-cargo: grado de discapacidad de personas a cargo", () => {
		expect(
			rs("asignacion-hijo-a-cargo").uncoveredRequirements.some(
				(u) => u.id === "grado-discapacidad-no-preguntado",
			),
		).toBe(true);
		// y el requisito es soft: con cargas sin edad/discapacidad ⇒ U, nunca F
		const st = statusOf("asignacion-hijo-a-cargo",
			{ dependents: val([{ age: { min: 0, max: 130, maxExclusive: false } }]) },
			"causante-con-discapacidad");
		expect(st).toBe("U");
	});
	it("subsidio-desempleo: supuesto de tiempo parcial declarado", () => {
		expect(
			rs("subsidio-desempleo").uncoveredRequirements.some(
				(u) => u.id === "trabajo-tiempo-parcial",
			),
		).toBe(true);
	});
	it("becas-generales-mefp-2026-2027: solo títulos oficiales en centro español", () => {
		expect(
			rs("becas-generales-mefp-2026-2027").uncoveredRequirements.some(
				(u) => u.id === "solo-titulos-oficiales-centro-espanol",
			),
		).toBe(true);
	});
});

describe("F10-REG-7 · tarjeta azul: residente vs empadronado declarado", () => {
	it("la divergencia norma/pregunta está en uncovered", () => {
		expect(
			rs("ayto-tarjeta-azul-discapacidad").uncoveredRequirements.some(
				(u) => u.id === "residente-vs-empadronado",
			),
		).toBe(true);
	});
	it("empadronada en Madrid ⇒ T; en otro municipio CM ⇒ F (respuesta definida)", () => {
		expect(
			statusOf("ayto-tarjeta-azul-discapacidad",
				{ territory: val({ ccaa: "13", province: "28", municipality: "28079" }) },
				"empadronado-municipio-madrid"),
		).toBe("T");
		expect(
			statusOf("ayto-tarjeta-azul-discapacidad",
				{ territory: val({ ccaa: "13", province: "28", municipality: "28065" }) },
				"empadronado-municipio-madrid"),
		).toBe("F");
	});
});
