/** matrix.ts — agrupa requisitos por dimensión del perfil (R2-MAT/R3-MAT). */

import type {
	Condition,
	EvaluationResult,
	RuleSet,
} from "./eligibility-engine/schema";

type EvReq = EvaluationResult["requirements"][number];

export function fieldsIn(c: Condition, out: Set<string>): void {
	if ("all" in c) for (const x of c.all) fieldsIn(x, out);
	else if ("any" in c) for (const x of c.any) fieldsIn(x, out);
	else if ("not" in c) fieldsIn(c.not, out);
	else {
		out.add(c.field);
		if (c.where) fieldsIn(c.where, out);
	}
}

/** Columnas de la matriz (máx. 7 dimensiones de perfil). */
export const DIMENSIONS: { id: string; label: string; fields: string[] }[] = [
	{ id: "emp", label: "Empadronamiento", fields: ["territory"] },
	{ id: "edad", label: "Edad", fields: ["age", "birthYear"] },
	{ id: "hijos", label: "Hijos", fields: ["dependents"] },
	{ id: "ing", label: "Ingresos", fields: ["incomeAnnual"] },
	{ id: "fam", label: "Situación familiar", fields: ["familyType"] },
	{
		id: "empleo",
		label: "Empleo",
		fields: ["employmentStatus", "studentStatus"],
	},
	{ id: "otros", label: "Otros", fields: [] }, // discapacidad, dependencia, …
];

export function dimOf(field: string): string {
	for (const d of DIMENSIONS) if (d.fields.includes(field)) return d.id;
	return "otros";
}

/** Peor estado: F > U > W > T (W = no comprobable con nuestras preguntas). */
export function worstOf(statuses: string[]): string {
	for (const s of ["F", "U", "W", "T"]) if (statuses.includes(s)) return s;
	return "na";
}

/** Requisitos de una ayuda que caen en una dimensión. El campo que falta
 *  decide la dimensión del U (R3-MAT a). */
export function cellReqs(
	rs: RuleSet,
	ev: EvaluationResult,
	dimId: string,
): EvReq[] {
	return ev.requirements.filter((r) => {
		const src = rs.requirements.find((x) => x.id === r.id);
		const fs = new Set<string>();
		if (src) fieldsIn(src.condition, fs);
		for (const f of r.missingFields ?? []) fs.add(f);
		const dims = [...fs].map(dimOf);
		if (dimId === "otros")
			return fs.size === 0 || dims.every((d) => d === "otros");
		return dims.includes(dimId);
	});
}

/** Conteo de requisitos no comprobables con nuestras preguntas (⚠). */
export function uncoveredCount(rs: RuleSet): number {
	return rs.uncoveredRequirements?.length ?? 0;
}
