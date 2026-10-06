/**
 * versions.ts — R8-VIG: selección de la versión vigente de una regla.
 *
 * Varias entradas del bundle pueden compartir `benefitSlug` cuando la norma
 * tiene una reforma publicada con fecha de vigencia distinta (p. ej. la Ley
 * 4/2026 publicada el 03/10/2026 pero vigente el 23/10/2026). Cada versión
 * declara `validFrom`/`validUntil` (fechas incluidas; ausente = sin cota).
 *
 * Regla: para cada fecha, exactamente una versión es vigente.
 *  - 0 versiones vigentes en la fecha ⇒ la ayuda no se evalúa
 *    («No podemos evaluar» — fail closed, nunca se muestra una versión
 *    que no rige).
 *  - >1 ⇒ defecto de datos (ventanas solapadas) ⇒ tampoco se evalúa.
 */

import type { RuleSet } from "./schema";

export type VersionPick =
	| { ok: true; ruleset: RuleSet }
	| { ok: false; reason: "none" | "ambiguous"; slug: string };

/** true si la ventana de vigencia de `rs` cubre `date` (ambas incluidas). */
export function validOn(rs: RuleSet, date: string): boolean {
	if (rs.validFrom && date < rs.validFrom) return false;
	if (rs.validUntil && date > rs.validUntil) return false;
	return true;
}

/**
 * Selecciona para cada benefitSlug la única versión vigente en `date`.
 * Devuelve las elegidas y los slugs sin versión vigente o ambiguos.
 */
export function pickValidVersions(
	rulesets: RuleSet[],
	date: string,
): { evaluable: RuleSet[]; unavailable: { slug: string; reason: "none" | "ambiguous" }[] } {
	const bySlug = new Map<string, RuleSet[]>();
	for (const rs of rulesets) {
		const arr = bySlug.get(rs.benefitSlug) ?? [];
		arr.push(rs);
		bySlug.set(rs.benefitSlug, arr);
	}
	const evaluable: RuleSet[] = [];
	const unavailable: { slug: string; reason: "none" | "ambiguous" }[] = [];
	for (const [slug, versions] of bySlug) {
		const valid = versions.filter((v) => validOn(v, date));
		if (valid.length === 1) evaluable.push(valid[0]);
		else unavailable.push({ slug, reason: valid.length === 0 ? "none" : "ambiguous" });
	}
	return { evaluable, unavailable };
}

/**
 * Resultado sintético «No podemos evaluar» para un slug sin versión
 * vigente (o con ventanas solapadas) en `date`. selfCheck.passed=false
 * lo coloca en la lista de no evaluables; solo lleva los campos que la
 * vista toca (benefitSlug, deadline.state, missing, selfCheck).
 */
export function notEvaluableNow(slug: string, date: string) {
	return {
		benefitSlug: slug,
		rulesVersion: 0,
		today: date,
		verdict: "posible",
		requirements: [],
		missing: [],
		blockers: [],
		whyShown: [],
		verifiedAt: date,
		explanationKeys: [],
		deadline: { state: "CLOSED" },
		selfCheck: { passed: false, failed: ["I11"] },
	} as never;
}

/**
 * Versión futura de la misma ayuda (para el aviso «esta ayuda cambia el …»):
 * la versión con `validFrom` posterior a `date`, si existe.
 */
export function nextVersion(
	rulesets: RuleSet[],
	slug: string,
	date: string,
): RuleSet | undefined {
	return rulesets
		.filter((r) => r.benefitSlug === slug && r.validFrom && r.validFrom > date)
		.sort((a, b) => a.validFrom!.localeCompare(b.validFrom!))[0];
}
