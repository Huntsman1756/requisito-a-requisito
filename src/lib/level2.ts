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
/** Temas inferidos de las respuestas (mapa determinista answer→theme).
 *  Los temas vecinos se suman para no sobre-filtrar (ADR-017): salud va
 *  con dependencia, cultura_juventud con estudios/juventud, energía con
 *  vivienda o renta baja, transporte para todos. */
function userThemes(answers: Answers): Set<string> {
	const t = new Set<string>();
	const fam = rawValue(answers.familyType);
	if (fam === "familia-numerosa" || fam === "monoparental")
		t.add("familia_infancia");
	const emp = rawValue(answers.employmentStatus);
	// autónomo también entra en «empleo»: cese de actividad, programas de
	// autoempleo y ayudas a la actividad viven en ese tema.
	if (emp === "desempleado" || emp === "autonomo") t.add("empleo");
	if (emp === "jubilado") t.add("mayores");
	if (rawValue(answers.studentStatus) === "si") {
		t.add("educacion");
		t.add("cultura_juventud");
	}
	const hou = rawValue(answers.housingStatus);
	if (hou === "alquiler" || hou === "independizarse" || hou === "propiedad") {
		t.add("vivienda");
		t.add("energia_suministros");
	}
	const dis = rawValue(answers.disability);
	if (dis === "gte33" || dis === "lt33") {
		t.add("dependencia_discapacidad");
		t.add("salud");
	}
	const dep = rawValue(answers.dependency);
	if (dep === "reconocida" || dep === "en_tramite") {
		t.add("dependencia_discapacidad");
		t.add("salud");
	}
	const age = rawValue(answers.age) as { min?: number; max?: number } | undefined;
	if ((age?.min ?? 0) >= 65) t.add("mayores");
	if ((age?.max ?? 100) <= 30) {
		t.add("juventud");
		t.add("cultura_juventud");
	}
	const kids = rawValue(answers.dependents);
	if (Array.isArray(kids) && kids.length > 0) t.add("familia_infancia");
	const inc = rawValue(answers.incomeAnnual) as { min?: number } | undefined;
	if (inc && (inc.min ?? Infinity) < 16800) {
		t.add("ingresos_minimos");
		t.add("energia_suministros");
	}
	// El transporte público toca a todo el mundo en la CM.
	t.add("transporte");
	return t;
}

/** Títulos que delimitan una ayuda a un suceso concreto (catástrofe). */
const DISASTER_RE =
	/incendi|inundaci|\bdana\b|terremoto|se[ií]sm|erupci|volc[aá]n|cat[aá]strofe/i;

/** Normaliza para comparar nombres de municipio en títulos. */
const norm = (s: string) =>
	s
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();

/**
 * Municipio citado en el título/organismo de una ficha municipal, contra la
 * lista oficial de municipios de la CM (F10-RES-2 §4). Devuelve el código
 * encontrado, "" si la ficha no nombra ninguno, o undefined si el scope no
 * es municipal.
 */
function municipalityOf(
	item: Level2Item,
	municipalities: { code: string; name: string }[],
): string | "" | undefined {
	if (item.scope !== "municipal") return undefined;
	const text = norm(`${item.managingBody ?? ""} ${item.displayTitle}`);
	let best: { code: string; name: string } | undefined;
	for (const m of municipalities) {
		const n = norm(m.name);
		// Nombres muy cortos («Rascafría» no; «Torre» sí daría falsos
		// positivos) — exigimos límite de palabra.
		if (n.length < 6) continue;
		if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "u").test(text)) {
			if (!best || m.name.length > best.name.length) best = m;
		}
	}
	return best?.code ?? "";
}

export interface Level2Match {
	item: Level2Item;
	matchedFactors: number;
}

export function matchLevel2(
	items: Level2Item[],
	answers: Answers,
	municipalities?: { code: string; name: string }[],
	lifeEvent?: string | null,
): Level2Match[] {
	const uf = userFactorSet(answers);
	const ut = userThemes(answers);
	const terr = rawValue(answers.territory) as { municipality?: string } | undefined;
	const out: Level2Match[] = [];
	for (const item of items) {
		if (item.applicationStatus === "closed" || item.accessState === "CLOSED")
			continue;
		// §4 ámbito: una ficha municipal de otro municipio no es relevante.
		// Sin municipio identificable en el título no se excluye (fail-open,
		// ADR-017) pero tampoco puntúa.
		const muni = municipalities ? municipalityOf(item, municipalities) : undefined;
		if (muni !== undefined && muni !== "") {
			if (!terr?.municipality || terr.municipality !== muni) continue;
		}
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
		if (!ok) continue;
		// §4 tema / evento vital: si la ficha declara temas y ninguno toca
		// el perfil, queda fuera — salvo que el evento vital elegido en la
		// intro la marque explícitamente.
		const themes = item.themes ?? [];
		const themeHit = themes.filter((x) => ut.has(x)).length;
		const lifeHit = lifeEvent
			? (item.lifeEvents ?? []).includes(lifeEvent)
			: false;
		if (themes.length > 0 && themeHit === 0 && !lifeHit) continue;
		// §4 evento acotado: ayudas ligadas a una catástrofe concreta
		// (incendios de la Sierra Oeste, DANA…) no son relevantes para
		// quien no declara ese suceso; el título las identifica.
		if (!lifeHit && DISASTER_RE.test(item.displayTitle)) continue;
		// §4 edad por título cuando la ficha no trae factor: «joven» pide
		// juventud, «mayores de 65» pide el grupo mayor.
		const title = norm(item.displayTitle);
		if (!lifeHit) {
			const age = rawValue(answers.age) as
				| { min?: number; max?: number }
				| undefined;
			if (/joven|juvenil|juventud/.test(title) && (age?.min ?? 0) > 35)
				continue;
			if (/mayor(es)? de 6[05]|tercera edad/.test(title) && (age?.max ?? 100) < 60)
				continue;
		}
		out.push({
			item,
			matchedFactors: matched + themeHit + (lifeHit ? 2 : 0),
		});
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
