/**
 * rule-text — B4.1: texto legible de una condición generado DESDE el RuleSet.
 * Nada de prosa escrita a mano: lo que se muestra es la condición que evalúa
 * el motor, traducida a lenguaje claro. Si una condición no se puede
 * traducir, el generador lo dice (nunca se inventa).
 */

import territory from "../../data/eligibility/territory.json";
import parametersJson from "../../data/eligibility/parameters.json";
import type { Condition } from "./eligibility-engine/schema";

const MUNICIPALITY = new Map(
	territory.municipalities.map((m) => [m.code, m.name]),
);
const CCAA = new Map(territory.ccaa.map((c) => [c.code, c.name]));
const PARAM_LABEL = new Map(
	parametersJson.parameters.map((p) => [p.id, p.label]),
);

const EUR = new Intl.NumberFormat("es-ES", {
	style: "currency",
	currency: "EUR",
	maximumFractionDigits: 2,
});
/** Campos cuyos valores numéricos son euros. */
const MONEY_FIELDS = new Set(["incomeAnnual"]);
/** Campos cuyo sujeto es plural («tus ingresos son…», «las personas…»). */
const PLURAL_FIELDS = new Set(["incomeAnnual", "dependents", "residenceMonths"]);

const FIELD_LABEL: Record<string, string> = {
	territory: "tu lugar de empadronamiento",
	residenceSince: "desde cuándo estás empadronado/a",
	residenceMonths: "los meses que llevas empadronado/a",
	age: "tu edad",
	birthYear: "tu año de nacimiento",
	dependents: "las personas a tu cargo",
	familyType: "tu tipo de familia",
	employmentStatus: "tu situación laboral",
	studentStatus: "tus estudios",
	incomeAnnual: "tus ingresos anuales",
	disability: "tu discapacidad reconocida",
	dependency: "tu dependencia reconocida",
	housingStatus: "tu situación de vivienda",
};

const VALUE_LABEL: Record<string, Record<string, string>> = {
	familyType: {
		general: "familia general",
		"familia-numerosa": "familia numerosa",
		monoparental: "familia monoparental",
	},
	employmentStatus: {
		asalariado: "empleado/a por cuenta ajena",
		autonomo: "autónomo/a",
		"empleado-publico": "empleo público",
		docente: "docencia",
		investigador: "investigación",
		militar: "militar",
		desempleado: "en desempleo",
		jubilado: "jubilado/a o pensionista",
		general: "otra situación laboral",
	},
	studentStatus: { si: "estudias", no: "no estudias" },
	disability: {
		gte33: "discapacidad del 33 % o más",
		lt33: "discapacidad menor del 33 %",
		no: "sin discapacidad reconocida",
		yes: "con discapacidad",
		unknown: "discapacidad sin precisar",
		declined: "sin declarar",
	},
	dependency: {
		reconocida: "dependencia reconocida",
		en_tramite: "dependencia en trámite",
		no: "sin dependencia",
	},
	housingStatus: {
		alquiler: "en alquiler",
		propiedad: "vivienda en propiedad",
		general: "otra situación de vivienda",
	},
};

const OP_TEXT: Record<string, [string, string]> = {
	eq: ["es", "son"],
	gte: ["es al menos", "son al menos"],
	lte: ["es como máximo", "son como máximo"],
	gt: ["es más de", "son más de"],
	lt: ["es menos de", "son menos de"],
	in: ["está entre", "están entre"],
	neq: ["no es", "no son"],
};

const FIELD_OF: Record<string, string> = {
	age: "edad",
	disability: "discapacidad",
};

function valueText(field: string, v: unknown): string {
	const lab = VALUE_LABEL[field]?.[String(v)];
	if (lab) return lab;
	if (typeof v === "number")
		return MONEY_FIELDS.has(field) ? EUR.format(v) : String(v);
	if (field === "territory" && v && typeof v === "object") {
		const t = v as { ccaa?: string; province?: string; municipality?: string };
		if (t.municipality)
			return `en ${MUNICIPALITY.get(t.municipality) ?? `el municipio ${t.municipality}`}`;
		if (t.province)
			return t.province === "28" ? "en la provincia de Madrid" : `en la provincia ${t.province}`;
		if (t.ccaa) return t.ccaa === "13" ? "en la Comunidad de Madrid" : `en ${CCAA.get(t.ccaa) ?? `la CCAA ${t.ccaa}`}`;
	}
	return JSON.stringify(v);
}

function leaf(c: Extract<Condition, { field: string }>): string {
	const f = FIELD_LABEL[c.field] ?? `«${c.field}»`;
	// Sub-label del propio RuleSet, si lo hay, manda sobre la traducción.
	if (c.label) return String(c.label);
	if (c.op === "within_territory") return `${f} está ${valueText(c.field, c.value)}`;
	if (c.op === "count_where_gte") {
		const n = c.count ?? 1;
		const dir = "al menos";
		const sub = c.where ? `, donde ${condText(c.where)}` : "";
		return `${f} cuentan ${dir} ${n} que cumplan${sub}`;
	}
	const pair = OP_TEXT[c.op];
	const op = pair
		? pair[PLURAL_FIELDS.has(c.field) ? 1 : 0]
		: String(c.op);
	const v =
		c.param !== undefined
			? (c.multiplier ?? 1) === 1
				? `el ${PARAM_LABEL.get(c.param) ?? c.param}`
				: `${c.multiplier} × ${PARAM_LABEL.get(c.param) ?? c.param}`
			: Array.isArray(c.value)
				? c.value.map((x) => valueText(c.field, x)).join(" o ")
				: valueText(c.field, c.value);
	return `${f} ${op} ${v}`;
}

/** Texto legible de cualquier condición del RuleSet. */
export function condText(c: Condition): string {
	if ("all" in c) return `todas a la vez: ${c.all.map(condText).join("; ")}`;
	if ("any" in c) return `basta una de: ${c.any.map(condText).join("; ")}`;
	if ("not" in c) return `no se cumple que ${condText(c.not)}`;
	if ("field" in c) return leaf(c);
	return "condición no traducible";
}
