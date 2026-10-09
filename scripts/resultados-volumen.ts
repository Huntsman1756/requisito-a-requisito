/**
 * resultados-volumen.ts — «veo pocas ayudas»: mide cuántas ayudas salen en
 * resultados por categoría para las personas golden y para perfiles típicos
 * de Madrid, y cuántas fichas del catálogo de nivel 2 casaría matchLevel2.
 *
 *   npx tsx scripts/resultados-volumen.ts > evidence/<fecha>-F10/resultados-volumen.md
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { evaluateRuleSet } from "../src/lib/eligibility-engine/evaluate";
import { pickValidVersions } from "../src/lib/eligibility-engine/versions";
import type { CitizenProfile } from "../src/lib/eligibility-engine/schema";
import { matchLevel2 } from "../src/lib/level2";
import { positive, readInputs } from "./completeness";

const inputs = readInputs(process.cwd(), "out/datos/elegibilidad/bundle.json");
const level2 = JSON.parse(
	readFileSync("out/datos/elegibilidad/nivel-2.json", "utf8"),
).items;

type A = CitizenProfile["answers"];
const V = (value: unknown) => ({ state: "value", value }) as never;
const U = { state: "unknown" } as never;

/** Perfil base madrid capital, todo desconocido salvo lo indicado. */
const base = (over: Partial<A>): A => ({
	territory: V({ ccaa: "13", province: "28", municipality: "28079" }),
	residenceSince: U,
	age: U,
	birthYear: U,
	dependents: U,
	familyType: U,
	employmentStatus: U,
	studentStatus: U,
	incomeAnnual: U,
	disability: U,
	dependency: U,
	housingStatus: U,
	...over,
});

const TIPICOS: [string, A][] = [
	[
		"familia con dos menores (Getafe)",
		base({
			territory: V({ ccaa: "13", province: "28", municipality: "28065" }),
			age: V({ min: 35, max: 35 }),
			dependents: V([{ ageMin: 5, ageMax: 5 }, { ageMin: 9, ageMax: 9 }]),
			employmentStatus: V("asalariado"),
			incomeAnnual: V({ min: 8400, max: 16800 }),
			housingStatus: V("alquiler"),
		}),
	],
	[
		"mayor de 65 con pensión baja",
		base({
			age: V({ min: 68, max: 68 }),
			employmentStatus: V("jubilado"),
			incomeAnnual: V({ min: 8400, max: 16800 }),
			housingStatus: V("propiedad"),
		}),
	],
	[
		"joven 18–30 que alquila",
		base({
			age: V({ min: 26, max: 26 }),
			employmentStatus: V("asalariado"),
			incomeAnnual: V({ min: 8400, max: 16800 }),
			housingStatus: V("alquiler"),
		}),
	],
	[
		"desempleado de larga duración",
		base({
			age: V({ min: 47, max: 47 }),
			employmentStatus: V("desempleado"),
			incomeAnnual: V({ min: 0, max: 8400 }),
			housingStatus: V("alquiler"),
		}),
	],
	[
		"persona con discapacidad ≥33 %",
		base({
			age: V({ min: 40, max: 40 }),
			employmentStatus: V("asalariado"),
			disability: V("gte33"),
			incomeAnnual: V({ min: 8400, max: 16800 }),
			housingStatus: V("propiedad"),
		}),
	],
	[
		"monoparental con un hijo",
		base({
			territory: V({ ccaa: "13", province: "28", municipality: "28079" }),
			age: V({ min: 38, max: 38 }),
			dependents: V([{ ageMin: 4, ageMax: 4 }]),
			familyType: V("monoparental"),
			employmentStatus: V("asalariado"),
			incomeAnnual: V({ min: 8400, max: 16800 }),
			housingStatus: V("alquiler"),
		}),
	],
	[
		"estudiante universitario",
		base({
			age: V({ min: 20, max: 20 }),
			birthYear: V(2006),
			employmentStatus: V("general"),
			studentStatus: V("si"),
			incomeAnnual: V({ min: 0, max: 8400 }),
			housingStatus: V("general"),
		}),
	],
	[
		"autónomo",
		base({
			age: V({ min: 44, max: 44 }),
			employmentStatus: V("autonomo"),
			incomeAnnual: V({ min: 16800, max: 25200 }),
			housingStatus: V("propiedad"),
		}),
	],
	[
		"mujer víctima de violencia de género (perfil ciudadano neutro)",
		base({
			age: V({ min: 34, max: 34 }),
			dependents: V([{ ageMin: 2, ageMax: 2 }]),
			employmentStatus: V("desempleado"),
			incomeAnnual: V({ min: 0, max: 8400 }),
			housingStatus: V("general"),
		}),
	],
	[
		"persona sin ingresos",
		base({
			territory: V({ ccaa: "13", province: "28", municipality: "28079" }),
			age: V({ min: 33, max: 33 }),
			employmentStatus: V("desempleado"),
			incomeAnnual: V({ min: 0, max: 8400 }),
			housingStatus: V("general"),
		}),
	],
];

function measure(name: string, answers: A, today: string) {
	const profile = { answers } as CitizenProfile;
	const { evaluable, unavailable } = pickValidVersions(inputs.rules, today);
	const counts: Record<string, number> = {};
	for (const rs of evaluable) {
		const ev = evaluateRuleSet(rs, profile, {
			catalog: inputs.catalog,
			parameters: inputs.parameters,
			today,
		});
		counts[ev.verdict] = (counts[ev.verdict] ?? 0) + 1;
	}
	const l2 = matchLevel2(level2, answers);
	return {
		name,
		encajaPosible: (counts.probable ?? 0) + (counts.posible ?? 0),
		insuficiente: counts.insuficiente ?? 0,
		noCumple: counts.no_cumple ?? 0,
		noVigente: unavailable.length,
		nivel2: l2.length,
	};
}

const fixtures = JSON.parse(
	execFileSync(
		process.execPath,
		["node_modules/tsx/dist/cli.mjs", "scripts/completeness-web-data.ts"],
		{ encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
	),
) as { persons: { slug: string; today: string; answers: A }[] };

const today = "2026-10-09";

let md = `# Volumen de resultados — ${today}

Motor real sobre el bundle exportado (52 RuleSets / 50 programas vigentes,
modo normal). «Encaja/posible» = verdicts probable+posible; «insuficiente»
= faltan datos; «nivel 2» = catálogo relacionado por matchLevel2 (sin
veredicto — ADR-052).

## Personas golden (perfil positivo de cada programa)

| Persona | Encaja/posible | Insuficiente | No cumple | Nivel 2 |
|---|---|---|---|---|
`;

for (const p of fixtures.persons) {
	const r = measure(p.slug, p.answers, p.today);
	md += `| ${p.slug} | ${r.encajaPosible} | ${r.insuficiente} | ${r.noCumple} | ${r.nivel2} |\n`;
}

md += `\n## Perfiles típicos de Madrid (respuestas completas a lo indicado, resto unknown)\n\n| Perfil | Encaja/posible | Insuficiente | No cumple | Nivel 2 |\n|---|---|---|---|---|\n`;
for (const [name, a] of TIPICOS) {
	const r = measure(name, a, today);
	md += `| ${name} | ${r.encajaPosible} | ${r.insuficiente} | ${r.noCumple} | ${r.nivel2} |\n`;
}

const low = TIPICOS.map(([n, a]) => ({ n, r: measure(n, a, today) })).filter(
	(x) => x.r.encajaPosible + x.r.insuficiente <= 3,
);
md += `\n## Lectura\n\n${
	low.length
		? `Perfiles típicos con ≤3 ayudas útiles (encaja/posible + insuficiente): ${low
				.map((x) => `**${x.n}** (${x.r.encajaPosible}+${x.r.insuficiente}, nivel 2: ${x.r.nivel2})`)
				.join(", ")}.`
		: "Ningún perfil típico queda con ≤3 ayudas útiles."
}\n\nLa sección «También podrían interesarte» (nivel 2 filtrado por perfil,
máximo 10 + «ver más») ya existe en resultados (results.level2.*) — este
informe mide su volumen real.\n`;

process.stdout.write(md);
