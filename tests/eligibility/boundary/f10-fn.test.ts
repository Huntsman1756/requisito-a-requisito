/**
 * Frontera y regresión de la segunda ronda de falsos negativos
 * (evidence/2026-10-08-F10/falsos-negativos/, 50/50 programas revisados por
 * verificadores independientes).
 *
 * Patrón fijado (docs/07 §2.3): un requisito cuya excepción legal no se puede
 * medir con el cuestionario NO puede producir un F que bloquee — se degrada a
 * soft o se le añade una rama `any`/`in` cuando el campo existe.
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
const CTX = { parameters: PARAMETERS, catalog: CATALOG, today: "2026-10-08" };

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
const bySlug = new Map([...rules.values()].map((r) => [r.benefitSlug, r]));
const rs = (slug: string, file?: string): RuleSet => {
	const r = file ? rules.get(file) : bySlug.get(slug);
	if (!r) throw new Error(`RuleSet ${slug} no encontrado`);
	return r;
};
type AnswerValue = CitizenProfile["answers"][string];
const val = (v: unknown): AnswerValue =>
	({ state: "value", value: v }) as AnswerValue;
const prof = (answers: CitizenProfile["answers"]): CitizenProfile => ({
	catalogVersion: CATALOG.catalogVersion,
	answers,
});
const evOf = (r: RuleSet, answers: CitizenProfile["answers"]) =>
	evaluateRuleSet(r, prof(answers), CTX);
const statusOf = (slug: string, answers: CitizenProfile["answers"], reqId: string, file?: string) =>
	evOf(rs(slug, file), answers).requirements.find((r) => r.id === reqId)?.status;
const dep = (o: { age?: number; disability?: string }) => ({
	...(o.age !== undefined
		? { age: { min: o.age, max: o.age, maxExclusive: false } }
		: {}),
	...(o.disability ? { disability: o.disability } : {}),
});
const depList = (...ds: ReturnType<typeof dep>[]) => val(ds);

describe("FN — sermas: territory eq «cm» sobre un objeto nunca es T (defecto)", () => {
	it("residente en la CM ⇒ T (antes: F sistemático para todos)", () => {
		const terr = val({ ccaa: "13" });
		expect(
			statusOf("sermas-ortoprotesica-desplazamiento", { territory: terr }, "derecho-asistencia-sermas"),
		).toBe("T");
		expect(
			statusOf("sermas-reintegro-gastos-sanitarios", { territory: terr }, "titular-tarjeta-sermas"),
		).toBe("T");
	});
	it("residente fuera de la CM ⇒ F", () => {
		expect(
			statusOf("sermas-ortoprotesica-desplazamiento", { territory: val({ ccaa: "08" }) }, "derecho-asistencia-sermas"),
		).toBe("F");
	});
});

describe("FN — complemento-ayuda-infancia (bloqueante)", () => {
	// Empadronada 6 meses en el municipio pero >1 año residiendo en España:
	// la norma mide residencia legal en España, no el padrón municipal.
	it("residencia en España ≥1a no puede dar F con padrón municipal reciente", () => {
		const ev = evOf(rs("complemento-ayuda-infancia"), { residenceMonths: val(6) });
		expect(ev.requirements.find((r) => r.id === "residencia-espana-1a")?.hard).toBe(false);
	});
	it("menor en la unidad de convivencia aunque no figure «a tu cargo»", () => {
		const ev = evOf(rs("complemento-ayuda-infancia"), { dependents: depList() });
		expect(ev.requirements.find((r) => r.id === "menor-en-unidad")?.hard).toBe(false);
	});
});

describe("FN — requisitos con excepciones no medibles ⇒ soft (docs/07 §2.3)", () => {
	const casos: [string, string, string][] = [
		["imv", "edad-minima", "extuteladas, liberados de prisión, VG, trata y huérfanos absolutos"],
		["ayto-emergencia-social", "empadronado-madrid", "situaciones excepcionales del informe social (art. 12.2)"],
		["ayto-emergencia-social", "mayor-edad", "menor emancipado"],
		["fuenlabrada-prestaciones-sociales", "empadronado-fuenlabrada", "VG último año, transeúntes, LO 1/1996 arts. 10.3/11.1"],
		["leganes-prestaciones-especial-necesidad", "empadronado-leganes-6m", "VG/intrafamiliar, protección de menores, transeúntes"],
		["madrid-renta-minima-insercion", "residencia-un-ano", "residencia en la CM ≠ padrón municipal; cómputos del art. 7.3"],
		["madrid-renta-minima-insercion", "edad-25-65", "vías 18–24 tasadas, +65 solos con PNC denegada, emancipados"],
		["madrid-titulo-familia-numerosa", "edad-hijos", "unidades de ≥3 hermanos huérfanos adultos (art. 2.2.e)"],
		["mostoles-prestaciones-sociales", "empadronado-mostoles", "violencia doméstica, calle, art. 4.1.b"],
		["mostoles-prestaciones-sociales", "mayor-edad", "menor emancipado"],
		["madrid-ayudas-urgencia-social", "ambito-territorial-cm", "presencia en la CM, no empadronamiento"],
		["madrid-bono-alquiler-joven", "vivienda-en-madrid", "«vaya a constituir» domicilio habitual — vía pre-contractual"],
		["madrid-cheque-escuela-infantil", "hijo-menor-3", "NEE que repite 1er ciclo; nacimiento previsto <1/1/2027"],
		["madrid-ayudas-nacimiento-adopcion-multiple", "dos-o-mas-personas-cargo", "menores de parto múltiple sin custodia declarada"],
	];
	it.each(casos)("%s/%s — excepción no medible ⇒ requisito no puede ser hard", (slug, reqId) => {
		expect(rs(slug).requirements.find((r) => r.id === reqId)?.hard).toBe(false);
	});
});

describe("FN — colisiones de opciones del cuestionario", () => {
	it("anticipos-docentes-cm: funcionario docente que marca «empleo público» ⇒ T", () => {
		expect(
			statusOf("anticipos-docentes-cm", { employmentStatus: val("empleado-publico") }, "funcionario-docente-activo"),
		).toBe("T");
	});
	it("cm-reintegro-accidentes-trabajo: docente de la CM ⇒ T", () => {
		expect(
			statusOf("cm-reintegro-accidentes-trabajo", { employmentStatus: val("docente") }, "empleado-publico-cm"),
		).toBe("T");
	});
	it("descuento-transporte-FN: monoparental con título ⇒ T", () => {
		expect(
			statusOf("descuento-transporte-familia-numerosa", { familyType: val("monoparental") }, "titulo-familia-numerosa"),
		).toBe("T");
	});
	it("ayto-ibi-familia-numerosa: monoparental con título ⇒ T", () => {
		expect(
			statusOf("ayto-ibi-familia-numerosa", { familyType: val("monoparental") }, "titulo-familia-numerosa"),
		).toBe("T");
	});
	it("prestacion-nacimiento-FN-mono-disc: quien adquiere la condición con el nacimiento ⇒ T", () => {
		expect(
			statusOf(
				"prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad",
				{ familyType: val("general"), dependents: depList(dep({ age: 2 }), dep({ age: 0 })) },
				"colectivo-familiar",
			),
		).toBe("T");
	});
	it("prestacion-cuidado-menor-enfermedad-grave: personal laboral público ⇒ T", () => {
		expect(
			statusOf("prestacion-cuidado-menor-enfermedad-grave", { employmentStatus: val("empleado-publico") }, "trabajadora-afiliada-alta"),
		).toBe("T");
	});
});

describe("FN — Tarjeta Azul / abono 65: vías alternativas comprobables", () => {
	it("ayto-tarjeta-azul: pensionista jubilado ⇒ T aunque sin discapacidad declarada", () => {
		expect(
			statusOf("ayto-tarjeta-azul-discapacidad", { disability: val("no"), employmentStatus: val("jubilado") }, "discapacidad-min-33"),
		).toBe("T");
	});
	it("ayto-tarjeta-azul: dependiente reconocido ⇒ T", () => {
		expect(
			statusOf("ayto-tarjeta-azul-discapacidad", { disability: val("no"), dependency: val("reconocida") }, "discapacidad-min-33"),
		).toBe("T");
	});
	it("madrid-abono-65: menor de 65 pensionista/dependiente ⇒ no F en edad-65", () => {
		expect(
			statusOf("madrid-abono-transporte-65", { age: val(50), dependency: val("reconocida") }, "edad-65"),
		).not.toBe("F");
	});
});

describe("FN — umbrales y datos", () => {
	it("mostoles: el baremo usa IPREM anual a 14 pagas (8.400 €), no 12", () => {
		const r = rs("mostoles-prestaciones-sociales").requirements.find(
			(x) => x.id === "carencia-ingresos",
		);
		expect(JSON.stringify(r?.condition)).toContain("IPREM_ANUAL_14P");
	});
	it("fuenlabrada: límite neto mensual 665,33 € ⇒ 7.984 €/año, no 6.400", () => {
		const r = rs("fuenlabrada-prestaciones-sociales").requirements.find(
			(x) => x.id === "carencia-ingresos",
		);
		expect(JSON.stringify(r?.condition)).not.toContain('"value":6400');
	});
});
