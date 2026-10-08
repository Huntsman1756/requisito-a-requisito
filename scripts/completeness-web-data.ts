import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { evaluateRuleSet } from "../src/lib/eligibility-engine/evaluate";
import type { CitizenProfile } from "../src/lib/eligibility-engine/schema";
import { pickValidVersions } from "../src/lib/eligibility-engine/versions";
import { positive, positiveGolden, readInputs } from "./completeness";

const bundlePath = "out/datos/elegibilidad/bundle.json";
const inputs = readInputs(process.cwd(), bundlePath);
const persons = [...new Set(inputs.rules.map((r) => r.benefitSlug))].map(
	(slug) => {
		const rs = inputs.rules.find(
			(r) => r.benefitSlug === slug && positiveGolden(r, inputs),
		);
		const golden = rs && positiveGolden(rs, inputs);
		if (!rs || !golden)
			throw new Error(`${slug}: falta golden positivo del bundle`);
		const answers: CitizenProfile["answers"] = {};
		for (const q of inputs.catalog.questions)
			answers[q.field] = {
				state: q.allowUnknown
					? "unknown"
					: q.allowDecline
						? "declined"
						: "unknown",
			};
		answers.territory = {
			state: "value",
			value: { ccaa: "13", province: "28", municipality: "28079" },
		};
		Object.assign(answers, structuredClone(golden.profile.answers));
		const territory = answers.territory;
		if (
			territory?.state === "value" &&
			territory.value &&
			typeof territory.value === "object" &&
			"ccaa" in territory.value
		) {
			territory.value = {
				...territory.value,
				province: "28",
				municipality: territory.value.municipality ?? "28079",
			};
		}
		const { evaluable } = pickValidVersions(inputs.rules, golden.today);
		const current = evaluable.find((r) => r.benefitSlug === slug);
		if (!current || current.rulesVersion !== rs.rulesVersion)
			throw new Error(`${slug}: golden de versión no vigente`);
		const ev = evaluateRuleSet(
			current,
			{ catalogVersion: inputs.catalog.catalogVersion, answers },
			{
				catalog: inputs.catalog,
				parameters: inputs.parameters,
				today: golden.today,
			},
		);
		if (!positive(ev.verdict) || !ev.selfCheck.passed)
			throw new Error(`${slug}: perfil para formulario no positivo válido`);
		return {
			slug,
			goldenId: golden.id,
			today: golden.today,
			version: rs.rulesVersion,
			answers,
			verdict: ev.verdict,
		};
	},
);
console.log(
	JSON.stringify(
		{
			bundleDigest: createHash("sha256")
				.update(readFileSync(bundlePath))
				.digest("hex"),
			questionCount: inputs.catalog.questions.length,
			persons,
		},
		null,
		2,
	),
);
