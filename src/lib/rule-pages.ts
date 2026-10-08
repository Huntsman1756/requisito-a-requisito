/**
 * rule-pages.ts — resolución slug → RuleSet para las fichas /ayudas/<slug>/.
 *
 * El identificador público es `benefitSlug`, que NO tiene por qué coincidir
 * con el nombre del fichero (p. ej. `becas-mec-universidad-2026-2027.json`
 * publica `becas-generales-mefp-2026-2027`). Un mismo slug puede tener varias
 * versiones temporales (`__v-AAAA-MM-DD` en el nombre, R8-VIG).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const RULES_DIR = join(process.cwd(), "data/eligibility/rules");

export interface RuleSetLike {
	benefitSlug: string;
	validFrom?: string;
	validUntil?: string;
}

let cache: { dir: string; rules: RuleSetLike[] } | null = null;

function readAll(dir: string): RuleSetLike[] {
	if (cache?.dir === dir) return cache.rules;
	const rules: RuleSetLike[] = [];
	for (const f of readdirSync(dir)) {
		if (!f.endsWith(".json")) continue;
		try {
			const rs = JSON.parse(readFileSync(join(dir, f), "utf8")) as RuleSetLike;
			if (typeof rs.benefitSlug === "string") rules.push(rs);
		} catch {
			// archivo ilegible: se ignora
		}
	}
	cache = { dir, rules };
	return rules;
}

/** Todos los RuleSets del directorio (parseados una vez por proceso). */
export function allRuleSets<T extends RuleSetLike>(dir = RULES_DIR): T[] {
	return readAll(dir) as T[];
}

/** Slugs que publican página: los `benefitSlug` reales, no los nombres de fichero. */
export function listBenefitSlugs(dir = RULES_DIR): string[] {
	return [...new Set(readAll(dir).map((r) => r.benefitSlug))].sort();
}

/** Versiones de un slug (todas las que comparten `benefitSlug`). */
export function versionsOf<T extends RuleSetLike>(
	slug: string,
	dir = RULES_DIR,
): T[] {
	return allRuleSets<T>(dir).filter((r) => r.benefitSlug === slug);
}

/** La versión vigente en `today`, o la más estable si ninguna lo está. */
export function loadVersion<T extends RuleSetLike>(
	slug: string,
	today: string,
	dir = RULES_DIR,
): { rs: T; other: T[] } | null {
	const all = versionsOf<T>(slug, dir);
	if (all.length === 0) return null;
	const valid = all.filter(
		(r) =>
			(!r.validFrom || r.validFrom <= today) &&
			(!r.validUntil || r.validUntil >= today),
	);
	const rs = valid[0] ?? all.find((r) => !r.validFrom) ?? all[0];
	return { rs, other: all.filter((r) => r !== rs) };
}
