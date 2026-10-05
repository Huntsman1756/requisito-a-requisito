/** examples.ts — perfiles de ejemplo de un clic (demos; NO se guardan). */

import type { CitizenProfile } from "./eligibility-engine/schema";

type Answers = CitizenProfile["answers"];
const v = (value: unknown) => ({ state: "value" as const, value }) as Answers[string];

export interface ExampleProfile {
	id: string;
	label: string;
	blurb: string;
	answers: Answers;
}

export const EXAMPLES: ExampleProfile[] = [
	{
		id: "familia-getafe",
		label: "Familia monoparental en Getafe",
		blurb: "Madre sola, dos hijos, ingresos modestos",
		answers: {
			territory: v({ ccaa: "13", province: "28", municipality: "28065" }),
			age: v({ min: 41, max: 41 }),
			dependents: v([
				{ birthYear: 2015 },
				{ birthYear: 2018 },
			]),
			familyType: v("monoparental"),
			employmentStatus: v("asalariado"),
			incomeAnnual: v({ min: 8400, max: 16800 }),
			studentStatus: v("no"),
		},
	},
	{
		id: "estudiante-alcala",
		label: "Estudiante de 18 años en Alcalá",
		blurb: "Primero de carrera, sin ingresos, empadronado",
		answers: {
			territory: v({ ccaa: "13", province: "28", municipality: "28005" }),
			age: v({ min: 18, max: 18 }),
			birthYear: v(2008),
			dependents: v([]),
			familyType: v("general"),
			studentStatus: v("si"),
			incomeAnnual: v({ min: 0, max: 8400 }),
		},
	},
	{
		id: "mayor-55-vallecas",
		label: "Persona de 55 en paro en Vallecas",
		blurb: "Empleo perdido, sin hijos a cargo",
		answers: {
			territory: v({ ccaa: "13", province: "28", municipality: "28079" }),
			age: v({ min: 55, max: 55 }),
			dependents: v([]),
			familyType: v("general"),
			employmentStatus: v("desempleado"),
			incomeAnnual: v({ min: 0, max: 8400 }),
			studentStatus: v("no"),
		},
	},
];
