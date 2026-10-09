/**
 * rule-pages.ts — resolución slug → RuleSet para las fichas /ayudas/<slug>/.
 *
 * ÚNICA fuente: el bundle generado (data/eligibility/bundle/). En build
 * normal lleva todos los RuleSets; en `--strict` solo las reglas con
 * humanReview aprobado (ADR-050/G12) — así ninguna página publica una regla
 * que el bundle no incluye.
 *
 * El identificador público es `benefitSlug`, que NO tiene por qué coincidir
 * con el nombre del fichero fuente (p. ej. `becas-mec-universidad-2026-2027`
 * publica `becas-generales-mefp-2026-2027`). Un mismo slug puede tener varias
 * versiones temporales (R8-VIG: `validFrom`/`validUntil` en el bundle).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const BUNDLE_PATH = join(
	process.cwd(),
	"data/eligibility/bundle/eligibility-bundle.json",
);

export interface RuleSetLike {
	benefitSlug: string;
	validFrom?: string;
	validUntil?: string;
}

let cache: RuleSetLike[] | null = null;

function readAll(): RuleSetLike[] {
	if (cache) return cache;
	const bundle = JSON.parse(readFileSync(BUNDLE_PATH, "utf8")) as {
		rulesets?: RuleSetLike[];
	};
	cache = (bundle.rulesets ?? []).filter(
		(r) => typeof r.benefitSlug === "string",
	);
	return cache;
}

/** Todos los RuleSets del bundle (una sola lectura por proceso). */
export function allRuleSets<T extends RuleSetLike>(): T[] {
	return readAll() as T[];
}

/** Slugs publicados: los `benefitSlug` del bundle (no los nombres de fichero). */
export function listBenefitSlugs(): string[] {
	return [...new Set(readAll().map((r) => r.benefitSlug))].sort();
}

/** Versiones de un slug (todas las que comparten `benefitSlug` en el bundle). */
export function versionsOf<T extends RuleSetLike>(slug: string): T[] {
	return allRuleSets<T>().filter((r) => r.benefitSlug === slug);
}

/** La versión vigente en `today`, o la más estable si ninguna lo está. */
export function loadVersion<T extends RuleSetLike>(
	slug: string,
	today: string,
): { rs: T; other: T[] } | null {
	const all = versionsOf<T>(slug);
	if (all.length === 0) return null;
	const valid = all.filter(
		(r) =>
			(!r.validFrom || r.validFrom <= today) &&
			(!r.validUntil || r.validUntil >= today),
	);
	const rs = valid[0] ?? all.find((r) => !r.validFrom) ?? all[0];
	return { rs, other: all.filter((r) => r !== rs) };
}
