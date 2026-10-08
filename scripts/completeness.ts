import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateRuleSet } from "../src/lib/eligibility-engine/evaluate";
import { profileCombos } from "../src/lib/eligibility-engine/exhaustive";
import {
	type CitizenProfile,
	citizenProfileSchema,
	type GoldenPersona,
	goldenPersonaSchema,
	parametersSchema,
	questionCatalogSchema,
	type RuleSet,
	ruleSetSchema,
} from "../src/lib/eligibility-engine/schema";

export const positive = (v: string) => v === "probable" || v === "posible";
const json = (p: string) => JSON.parse(readFileSync(p, "utf8"));
export function readInputs(root = process.cwd(), bundlePath?: string) {
	const dir = join(root, "data/eligibility");
	const bundle = bundlePath ? json(bundlePath) : null;
	return {
		rules: (
			bundle?.rulesets ??
			readdirSync(join(dir, "rules"))
				.filter((f) => f.endsWith(".json"))
				.sort()
				.map((f) => json(join(dir, "rules", f)))
		).map((r: unknown) => ruleSetSchema.parse(r)) as RuleSet[],
		catalog: questionCatalogSchema.parse(json(join(dir, "questions.json"))),
		parameters: parametersSchema.parse(
			bundle?.parameters ?? json(join(dir, "parameters.json")),
		),
		goldens: readdirSync(join(dir, "golden"))
			.filter((f) => f.endsWith(".json"))
			.sort()
			.map((f) => goldenPersonaSchema.parse(json(join(dir, "golden", f)))),
	};
}

export function positiveGolden(
	rs: RuleSet,
	inputs: ReturnType<typeof readInputs>,
) {
	return inputs.goldens.find((g) => {
		const expected = g.expectations.find(
			(e) =>
				e.benefitSlug === rs.benefitSlug &&
				e.rulesVersion === rs.rulesVersion &&
				positive(e.verdict),
		);
		if (
			!expected ||
			(rs.validFrom && g.today < rs.validFrom) ||
			(rs.validUntil && g.today > rs.validUntil)
		)
			return false;
		const result = evaluateRuleSet(rs, g.profile, {
			catalog: inputs.catalog,
			parameters: inputs.parameters,
			today: g.today,
		});
		return result.verdict === expected.verdict && result.selfCheck.passed;
	});
}

export function reachability(
	rs: RuleSet,
	inputs: ReturnType<typeof readInputs>,
	today: string,
) {
	// Future versions are evaluated in their own validity window, never silently omitted.
	const date =
		rs.validFrom && rs.validFrom > today
			? rs.validFrom
			: rs.validUntil && rs.validUntil < today
				? rs.validUntil
				: today;
	const { fields, combos, strategy, truncated } = profileCombos(
		rs,
		inputs.catalog,
		undefined,
		date,
	);
	const counts = { probable: 0, posible: 0, no_cumple: 0, insuficiente: 0 };
	let witness: CitizenProfile | undefined;
	let invalid = 0;
	let invalidProfiles = 0;
	let validPositive = 0;
	for (const combo of combos) {
		const profile = {
			catalogVersion: inputs.catalog.catalogVersion,
			answers: Object.fromEntries(fields.map((f, i) => [f, combo[i]])),
		} as CitizenProfile;
		const validProfile = citizenProfileSchema.safeParse(profile).success;
		if (!validProfile) invalidProfiles++;
		const result = evaluateRuleSet(rs, profile, {
			catalog: inputs.catalog,
			parameters: inputs.parameters,
			today: date,
		});
		counts[result.verdict]++;
		if (!result.selfCheck.passed) invalid++;
		if (validProfile && positive(result.verdict) && result.selfCheck.passed) {
			validPositive++;
			witness ??= profile;
		}
	}
	return {
		slug: rs.benefitSlug,
		version: rs.rulesVersion,
		today: date,
		profiles: combos.length,
		strategy,
		truncated,
		counts,
		invalid,
		invalidProfiles,
		validPositive,
		witness,
	};
}

export function goldenCoverage(inputs: ReturnType<typeof readInputs>) {
	return [...new Set(inputs.rules.map((r) => r.benefitSlug))].map((slug) => {
		const group = inputs.rules.filter((r) => r.benefitSlug === slug);
		return {
			slug,
			golden:
				group.map((r) => positiveGolden(r, inputs)).find(Boolean)?.id ?? null,
		};
	});
}

export function makeGolden(
	rs: RuleSet,
	profile: CitizenProfile,
	today: string,
	inputs: ReturnType<typeof readInputs>,
): GoldenPersona {
	const ev = evaluateRuleSet(rs, profile, {
		catalog: inputs.catalog,
		parameters: inputs.parameters,
		today,
	});
	if (!positive(ev.verdict) || !ev.selfCheck.passed)
		throw new Error(`${rs.benefitSlug}: perfil no positivo`);
	return goldenPersonaSchema.parse({
		id: `gp-completitud-${rs.benefitSlug}`,
		today,
		profile,
		description: `Perfil ficticio positivo de cobertura para ${rs.benefitSlug}. Derivado de requisitos citados; no acredita derecho ni aprobación humana. Ver hoja de goldens de completitud.`,
		expectations: [
			{
				benefitSlug: rs.benefitSlug,
				rulesVersion: rs.rulesVersion,
				verdict: ev.verdict,
				blockers: [],
				justification: rs.requirements.map((r) => ({
					sourceId: r.citation.sourceId,
					locator: r.citation.locator,
					reasoning: `${r.label}. Condición ${JSON.stringify(r.condition)}; perfil ${JSON.stringify(profile.answers)}. Extracto de la norma: ${r.citation.excerpt}. No se afirma que los requisitos no comprobables se cumplan.`,
				})),
			},
		],
		review: { status: "pending" },
	});
}
