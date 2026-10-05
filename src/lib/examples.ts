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
		label: "Madre sola con un bebé · Getafe",
		blurb: "monoparental, una hija de meses, ingresos modestos",
		answers: {
			territory: v({ ccaa: "13", province: "28", municipality: "28065" }),
			age: v({ min: 34, max: 34 }),
			birthYear: v(1992),
			dependents: v([{ birthYear: 2026, disability: false }]),
			familyType: v("monoparental"),
			employmentStatus: v("desempleado"),
			incomeAnnual: v({ min: 0, max: 8400 }),
			disability: v("no"),
			studentStatus: v("no"),
			housingStatus: v("alquiler"),
			residenceSince: v({ year: 2020, month: 1 }),
			dependency: v("no"),
		},
	},
	{
		id: "estudiante-alcala",
		label: "Estudiante de 18 años · Alcalá de Henares",
		blurb: "primero de carrera, sin ingresos propios",
		answers: {
			territory: v({ ccaa: "13", province: "28", municipality: "28005" }),
			age: v({ min: 18, max: 18 }),
			birthYear: v(2008),
			dependents: v([]),
			familyType: v("general"),
			employmentStatus: v("estudiante"),
			studentStatus: v("si"),
			incomeAnnual: v({ min: 0, max: 8400 }),
			disability: v("no"),
			housingStatus: v("general"),
			residenceSince: v({ year: 2008, month: 6 }),
			dependency: v("no"),
		},
	},
	{
		id: "mayor-55-vallecas",
		label: "55 años y en paro · Puente de Vallecas",
		blurb: "empleo perdido, sin hijos a cargo",
		answers: {
			territory: v({ ccaa: "13", province: "28", municipality: "28079" }),
			age: v({ min: 55, max: 55 }),
			birthYear: v(1971),
			dependents: v([]),
			familyType: v("general"),
			employmentStatus: v("desempleado"),
			studentStatus: v("no"),
			incomeAnnual: v({ min: 0, max: 8400 }),
			disability: v("no"),
			housingStatus: v("propiedad"),
			residenceSince: v({ year: 1995, month: 3 }),
			dependency: v("no"),
		},
	},
];
