/**
 * F10-COMP: la ficha pública se genera por `benefitSlug`, que puede diferir
 * del nombre del fichero (becas-mec-universidad-2026-2027.json publica
 * becas-generales-mefp-2026-2027). Test sobre los datos reales del repo
 * (regla 4.11): si un slug del bundle no tiene página, el enlace de la
 * tarjeta lleva a un 404.
 *
 * F10-SINGLE-SOURCE: las páginas solo pueden leer el bundle generado
 * (data/eligibility/bundle/), nunca el directorio de reglas — en --strict el
 * bundle lleva solo las aprobadas (ADR-050/G12).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	allRuleSets,
	BUNDLE_PATH,
	listBenefitSlugs,
	loadVersion,
	versionsOf,
} from "../../src/lib/rule-pages";

describe("fichas: cada benefitSlug del bundle tiene página (datos reales)", () => {
	const slugs = new Set(listBenefitSlugs());
	const bundle = JSON.parse(readFileSync(BUNDLE_PATH, "utf8")) as {
		rulesets: { benefitSlug: string }[];
	};

	it("todo RuleSet del bundle publica página con su benefitSlug", () => {
		const missing: string[] = [];
		for (const rs of bundle.rulesets) {
			if (!slugs.has(rs.benefitSlug)) missing.push(rs.benefitSlug);
		}
		expect(missing).toEqual([]);
	});

	it("cada benefitSlug del bundle resuelve una ficha (versión vigente)", () => {
		const today = new Date().toISOString().slice(0, 10);
		const errors: string[] = [];
		for (const { benefitSlug } of bundle.rulesets) {
			const loaded = loadVersion(benefitSlug, today);
			if (!loaded) {
				errors.push(`${benefitSlug}: sin versiones`);
				continue;
			}
			if (loaded.rs.benefitSlug !== benefitSlug)
				errors.push(`${benefitSlug}: resuelve a ${loaded.rs.benefitSlug}`);
		}
		expect(errors).toEqual([]);
	});

	it("las versiones de un slug comparten benefitSlug (R8-VIG)", () => {
		const errors: string[] = [];
		for (const rs of allRuleSets()) {
			if (!versionsOf(rs.benefitSlug).includes(rs)) errors.push(rs.benefitSlug);
		}
		expect(errors).toEqual([]);
	});
});

describe("fuente única: ningún fichero de src/ lee data/eligibility/rules", () => {
	const SRC = join(process.cwd(), "src");

	function* sources(dir: string): Generator<string> {
		for (const f of readdirSync(dir, { withFileTypes: true })) {
			const p = join(dir, f.name);
			if (f.isDirectory()) {
				if (f.name !== "node_modules") yield* sources(p);
			} else if (/\.(ts|tsx|js|jsx)$/.test(f.name)) {
				yield p;
			}
		}
	}

	it("grep: 0 referencias a data/eligibility/rules en src/", () => {
		const offenders: string[] = [];
		for (const p of sources(SRC)) {
			const text = readFileSync(p, "utf8");
			if (/data\/eligibility\/rules/.test(text))
				offenders.push(p.slice(SRC.length + 1));
		}
		expect(offenders).toEqual([]);
	});
});
