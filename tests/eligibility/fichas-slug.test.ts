/**
 * F10-COMP: la ficha pública se genera por `benefitSlug`, que puede diferir
 * del nombre del fichero (becas-mec-universidad-2026-2027.json publica
 * becas-generales-mefp-2026-2027). Test sobre los datos reales del repo
 * (regla 4.11): si un slug del bundle no tiene página, el enlace de la
 * tarjeta lleva a un 404.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	allRuleSets,
	listBenefitSlugs,
	loadVersion,
	RULES_DIR,
	versionsOf,
} from "../../src/lib/rule-pages";

describe("fichas: cada benefitSlug tiene página (datos reales)", () => {
	const files = readdirSync(RULES_DIR).filter((f) => f.endsWith(".json"));
	const slugs = new Set(listBenefitSlugs());

	it("todo fichero de reglas aporta su benefitSlug a generateStaticParams", () => {
		const missing: string[] = [];
		for (const f of files) {
			const rs = JSON.parse(readFileSync(join(RULES_DIR, f), "utf8")) as {
				benefitSlug: string;
			};
			if (!slugs.has(rs.benefitSlug)) missing.push(`${f} → ${rs.benefitSlug}`);
		}
		expect(missing).toEqual([]);
	});

	it("cada benefitSlug del bundle publicado resuelve una ficha", () => {
		const bundle = JSON.parse(
			readFileSync(
				join(
					process.cwd(),
					"data/eligibility/bundle/eligibility-bundle.json",
				),
				"utf8"),
		) as { rulesets: { benefitSlug: string }[] };
		const today = new Date().toISOString().slice(0, 10);
		const errors: string[] = [];
		for (const { benefitSlug } of bundle.rulesets) {
			const loaded = loadVersion(benefitSlug, today);
			if (!loaded) {
				errors.push(`${benefitSlug}: sin versiones`);
				continue;
			}
			if (loaded.rs.benefitSlug !== benefitSlug)
				errors.push(
					`${benefitSlug}: resuelve a ${loaded.rs.benefitSlug}`,
				);
		}
		expect(errors).toEqual([]);
	});

	it("las versiones de un slug comparten benefitSlug (R8-VIG)", () => {
		const errors: string[] = [];
		for (const rs of allRuleSets()) {
			if (!versionsOf(rs.benefitSlug).includes(rs))
				errors.push(rs.benefitSlug);
		}
		expect(errors).toEqual([]);
	});
});
