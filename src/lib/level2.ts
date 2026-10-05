/**
 * level2.ts — «También podrían interesarte» (ADR-016).
 * Filtro determinista sobre las fichas importadas: solo compatibilidad
 * factor a factor; NUNCA afirma requisitos cumplidos.
 */

import type { Level2Item } from "./check-data";
import type { CitizenProfile } from "./eligibility-engine/schema";

type Answers = CitizenProfile["answers"];

function rawValue(a: Answers[string] | undefined): unknown {
	return a?.state === "value" ? a.value : undefined;
}

/** Conjunto de categorías posibles del usuario por factor. */
function userFactorSet(answers: Answers): Record<string, Set<string>> {
	const set: Record<string, Set<string>> = {
		residencyRegion: new Set<string>(),
		familyType: new Set<string>(),
		employmentStatus: new Set<string>(),
		studentStatus: new Set<string>(),
		disability: new Set<string>(),
		dependency: new Set<string>(),
		housingStatus: new Set<string>(),
		ageGroup: new Set<string>(),
		incomeBandHint: new Set<string>(),
		hasChildren: new Set<string>(),
	};

	const terr = rawValue(answers.territory) as
		| { ccaa?: string; municipality?: string }
		| undefined;
	if (terr?.ccaa === "13" || terr?.municipality?.startsWith("28"))
		set.residencyRegion.add("madrid");

	const fam = rawValue(answers.familyType);
	if (typeof fam === "string") {
		set.familyType.add(fam);
		if (fam === "familia-numerosa") set.familyType.add("numerosa");
	}

	const emp = rawValue(answers.employmentStatus);
	if (typeof emp === "string") {
		set.employmentStatus.add(emp);
		if (emp === "empleado-publico") set.employmentStatus.add("funcionario");
	}

	const stu = rawValue(answers.studentStatus);
	if (stu === "si") set.studentStatus.add("True");
	if (stu === "no") set.studentStatus.add("False");

	const dis = rawValue(answers.disability);
	if (dis === "gte33" || dis === "lt33") set.disability.add("True");
	if (dis === "no") set.disability.add("False");

	const dep = rawValue(answers.dependency);
	if (dep === "reconocida" || dep === "en_tramite") set.dependency.add("True");
	if (dep === "no") set.dependency.add("False");

	const hou = rawValue(answers.housingStatus);
	if (typeof hou === "string") set.housingStatus.add(hou);

	const age = rawValue(answers.age) as { min?: number; max?: number } | undefined;
	if (age?.min !== undefined && age?.max !== undefined) {
		for (let y = age.min; y <= Math.min(age.max, 100); y++) {
			if (y <= 26) set.ageGroup.add("joven");
			if (y < 40) set.ageGroup.add("menores_40");
			if (y >= 18) set.ageGroup.add("adulto");
			if (y >= 65) {
				set.ageGroup.add("mayor");
				set.ageGroup.add("senior");
			}
			set.ageGroup.add("general");
		}
	} else if (age) {
		for (const g of ["joven", "adulto", "mayor", "menores_40", "senior", "general"])
			set.ageGroup.add(g);
	}

	const inc = rawValue(answers.incomeAnnual) as { min?: number; max?: number | null } | undefined;
	if (inc?.min !== undefined) {
		if (inc.min < 8400) set.incomeBandHint.add("bajo");
		if (inc.max === null || inc.max === undefined || inc.max > 8400)
			set.incomeBandHint.add("medio");
		if (inc.max === null || inc.max === undefined || inc.max > 25200)
			set.incomeBandHint.add("alto");
		set.incomeBandHint.add("general");
	}

	const kids = rawValue(answers.dependents);
	if (Array.isArray(kids) && kids.length > 0) set.hasChildren.add("True");

	return set;
}

function factorList(v: unknown): string[] {
	if (v === null || v === undefined) return [];
	if (Array.isArray(v)) return v.map(String);
	return [String(v)];
}

export interface Level2Match {
	item: Level2Item;
	matchedFactors: number;
}

/**
 * Compatibilidad: si la ficha declara un factor poblado, el conjunto de
 * posibilidades del usuario debe tocarlo. Lo no respondido no excluye.
 */
/** Temas inferidos de las respuestas (mapa determinista answer→theme). */
function userThemes(answers: Answers): Set<string> {
	const t = new Set<string>();
	const fam = rawValue(answers.familyType);
	if (fam === "familia-numerosa" || fam === "monoparental")
		t.add("familia_infancia");
	const emp = rawValue(answers.employmentStatus);
	if (emp === "desempleado") t.add("empleo");
	if (rawValue(answers.studentStatus) === "si") t.add("educacion");
	const hou = rawValue(answers.housingStatus);
	if (hou === "alquiler" || hou === "independizarse") t.add("vivienda");
	const dis = rawValue(answers.disability);
	if (dis === "gte33" || dis === "lt33") t.add("dependencia_discapacidad");
	const dep = rawValue(answers.dependency);
	if (dep === "reconocida" || dep === "en_tramite")
		t.add("dependencia_discapacidad");
	const age = rawValue(answers.age) as { min?: number } | undefined;
	if ((age?.min ?? 0) >= 65) t.add("mayores");
	const kids = rawValue(answers.dependents);
	if (Array.isArray(kids) && kids.length > 0) t.add("familia_infancia");
	const inc = rawValue(answers.incomeAnnual) as { min?: number } | undefined;
	if (inc && (inc.min ?? Infinity) < 16800) t.add("ingresos_minimos");
	return t;
}

export function matchLevel2(items: Level2Item[], answers: Answers): Level2Match[] {
	const uf = userFactorSet(answers);
	const ut = userThemes(answers);
	const out: Level2Match[] = [];
	for (const item of items) {
		if (item.applicationStatus === "closed" || item.accessState === "CLOSED")
			continue;
		const ef = item.eligibilityFactors ?? {};
		let matched = 0;
		let ok = true;
		for (const [field, list] of Object.entries(ef)) {
			const vals = factorList(list).filter((v) => v !== "general");
			if (vals.length === 0) continue;
			const mine = uf[field];
			if (mine === undefined) continue;
			const intersects = vals.some((v) => mine.has(v));
			if (mine.size === 0) continue; // factor no respondido: no filtra
			if (!intersects) {
				ok = false;
				break;
			}
			matched++;
		}
		// L2-ALL: las afines por tema no excluyen; solo suman relevancia.
		const themeHit = (item.themes ?? []).filter((x) => ut.has(x)).length;
		if (ok) out.push({ item, matchedFactors: matched + themeHit });
	}
	return out.sort(
		(a, b) =>
			b.matchedFactors - a.matchedFactors ||
			(a.item.displayTitle ?? a.item.slug).localeCompare(
				b.item.displayTitle ?? b.item.slug,
				"es",
			),
	);
}
