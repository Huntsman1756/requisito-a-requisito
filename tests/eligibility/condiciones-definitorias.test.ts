/**
 * condiciones-definitorias (F10-RES-2 §1.1) — la capa de presentación
 * «solo si…» validada contra los datos REALES del repo (regla 11):
 *
 *   - cada slug del bundle tiene entrada (los duplicados por versión se
 *     resuelven contra TODAS sus versiones);
 *   - cada id de `req` existe en su RuleSet — como requisito comprobable
 *     o como requisito no cubierto (uncoveredRequirements);
 *   - cada texto empieza en positivo («si…», «cuando…», «con…», «tras…»)
 *     y NO dice «condiciones del trámite» — una definitoria no es trámite;
 *   - el fichero no declara slugs que no existen en el bundle.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ruleSetSchema } from "../../src/lib/eligibility-engine/schema";

const root = process.cwd();
const bundle = JSON.parse(
	readFileSync(
		join(root, "data/eligibility/bundle/eligibility-bundle.json"),
		"utf8",
	),
) as { rulesets: { benefitSlug: string }[] };
const condFile = JSON.parse(
	readFileSync(
		join(root, "data/presentation/condiciones-definitorias.json"),
		"utf8",
	),
) as {
	rules: Record<
		string,
		{ condiciones?: { req: string; texto: string }[]; nota?: string }
	>;
};

const slugs = [...new Set(bundle.rulesets.map((r) => r.benefitSlug))];

const reqIdsOf = (slug: string) => {
	const ids = new Set<string>();
	for (const rs of bundle.rulesets) {
		if (rs.benefitSlug !== slug) continue;
		const parsed = ruleSetSchema.parse(rs);
		for (const r of parsed.requirements) ids.add(r.id);
		for (const u of parsed.uncoveredRequirements) ids.add(u.id);
	}
	return ids;
};

describe("condiciones-definitorias.json sobre el bundle real", () => {
	it("cubre las 50 ayudas del bundle (un slug = una entrada)", () => {
		expect(slugs.length).toBe(50);
		for (const slug of slugs)
			expect(
				condFile.rules[slug],
				`falta entrada de presentación para «${slug}»`,
			).toBeDefined();
	});

	it("cada id de condición existe en su RuleSet (comprobado o uncovered)", () => {
		for (const [slug, def] of Object.entries(condFile.rules)) {
			const ids = reqIdsOf(slug);
			for (const c of def.condiciones ?? [])
				expect(
					ids.has(c.req),
					`${slug}: «${c.req}» no es un requisito de su RuleSet`,
				).toBe(true);
		}
	});

	it("los textos son cortos, en positivo y no hablan de trámite", () => {
		for (const [slug, def] of Object.entries(condFile.rules)) {
			for (const c of def.condiciones ?? []) {
				expect(
					/^(si |cuando |con |tras )/.test(c.texto),
					`${slug}: texto no en positivo «${c.texto}»`,
				).toBe(true);
				expect(c.texto.length, `${slug}: texto demasiado largo`).toBeLessThan(220);
				expect(
					/trámite|procedimiento|burocr/i.test(c.texto),
					`${slug}: una definitoria no es «trámite»`,
				).toBe(false);
			}
		}
	});

	it("no declara slugs que no existen en el bundle", () => {
		const set = new Set(slugs);
		for (const slug of Object.keys(condFile.rules))
			expect(set.has(slug), `slug fantasma «${slug}»`).toBe(true);
	});
});
