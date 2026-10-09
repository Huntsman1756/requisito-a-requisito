/**
 * results-order (F10-RES) — el orden de la pantalla de resultados, sobre los
 * datos reales del repo: los 10 perfiles típicos respondiendo TODAS las
 * preguntas, y la regla «ninguna ayuda claramente absurda en las 10
 * primeras».
 */

import { describe, expect, it } from "vitest";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import { pickValidVersions } from "../../src/lib/eligibility-engine/versions";
import { groupResults, isEncaja, nU } from "../../src/lib/results-order";
import type {
	CitizenProfile,
	RuleSet,
} from "../../src/lib/eligibility-engine/schema";
import { readInputs } from "../../scripts/completeness";

const inputs = readInputs(process.cwd());
const TODAY = "2026-10-09";

type A = CitizenProfile["answers"];
const V = (value: unknown) => ({ state: "value", value }) as never;
const T = (m: string) => V({ ccaa: "13", province: "28", municipality: m });
const RS = (y: number) => V({ year: y, month: 1 });
const AGE = (n: number) => V({ min: n, max: n, maxExclusive: false });
const DEP = (...ages: number[]) =>
	V(ages.map((a) => ({ age: { min: a, max: a, maxExclusive: false } })));
const INC = (a: number, b: number) => V({ min: a, max: b });

const base = (over: Partial<A>): A => ({
	territory: T("28079"),
	residenceSince: RS(2010),
	age: AGE(40),
	birthYear: { state: "unasked" } as never,
	dependents: DEP(),
	familyType: V("general"),
	employmentStatus: V("general"),
	studentStatus: V("no"),
	incomeAnnual: INC(8400, 16800),
	disability: V("no"),
	dependency: V("no"),
	housingStatus: V("general"),
	...over,
});

const TIPICOS: [string, A][] = [
	[
		"familia-2-menores-getafe",
		base({
			territory: T("28065"), residenceSince: RS(2013), age: AGE(35),
			dependents: DEP(5, 9), employmentStatus: V("asalariado"),
			housingStatus: V("alquiler"),
		}),
	],
	[
		"mayor-65-pension-baja",
		base({
			residenceSince: RS(1995), age: AGE(68), employmentStatus: V("jubilado"),
			housingStatus: V("propiedad"),
		}),
	],
	[
		"joven-26-alquila",
		base({ residenceSince: RS(2023), age: AGE(26), employmentStatus: V("asalariado"), housingStatus: V("alquiler") }),
	],
	[
		"desempleado-larga-47",
		base({ residenceSince: RS(2000), age: AGE(47), employmentStatus: V("desempleado"), incomeAnnual: INC(0, 8400), housingStatus: V("alquiler") }),
	],
	[
		"discapacidad-40",
		base({ employmentStatus: V("asalariado"), disability: V("gte33"), housingStatus: V("propiedad") }),
	],
	[
		"monoparental-38",
		base({ residenceSince: RS(2015), age: AGE(38), dependents: DEP(4), familyType: V("monoparental"), employmentStatus: V("asalariado"), housingStatus: V("alquiler") }),
	],
	[
		"estudiante-20",
		base({ residenceSince: RS(2006), age: AGE(20), birthYear: V(2006), employmentStatus: V("general"), studentStatus: V("si"), incomeAnnual: INC(0, 8400) }),
	],
	[
		"autonomo-44",
		base({ residenceSince: RS(2005), age: AGE(44), employmentStatus: V("autonomo"), incomeAnnual: INC(16800, 25200), housingStatus: V("propiedad") }),
	],
	[
		"vg-34",
		base({ age: AGE(34), dependents: DEP(2), familyType: V("monoparental"), employmentStatus: V("desempleado"), incomeAnnual: INC(0, 8400) }),
	],
	[
		"sin-ingresos-33",
		base({ residenceSince: RS(2015), age: AGE(33), employmentStatus: V("desempleado"), incomeAnnual: INC(0, 8400) }),
	],
];

// Ayudas claramente absurdas para el perfil (la persona sensata del §2.2):
// pensión de jubilación o subsidio +52 para menores de 52; ayudas por
// nacimiento/escuela infantil/hijo a cargo para quien respondió 0 personas
// a cargo.
const JUBILACION_52 = [
	"pension-jubilacion-contributiva",
	"subsidio-mayores-52",
];
const SIN_DEPENDENTES = [
	"madrid-ayudas-nacimiento-adopcion-multiple",
	"ayto-escuela-infantil",
	"madrid-cheque-escuela-infantil",
	"asignacion-hijo-a-cargo",
	"complemento-ayuda-infancia",
	"prestacion-nacimiento-cuidado-menor",
	"prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad",
];
const ABSURDAS: Record<string, string[]> = {
	"familia-2-menores-getafe": [...JUBILACION_52],
	"mayor-65-pension-baja": [
		"bono-cultural-joven",
		"madrid-bono-alquiler-joven",
		"madrid-abono-transporte-joven",
		"becas-mec-universidad-2026-2027",
		"madrid-accede-prestamo-libros",
	],
	"joven-26-alquila": [...JUBILACION_52, ...SIN_DEPENDENTES, "pension-orfandad", "bono-cultural-joven"],
	"desempleado-larga-47": [...JUBILACION_52, ...SIN_DEPENDENTES, "bono-cultural-joven", "madrid-bono-alquiler-joven"],
	// asignacion-hijo-a-cargo tiene vía propia para la persona adulta con
	// discapacidad (art. 352.2.c LGSS), y la prestación por nacimiento tiene
	// rama por discapacidad: no son absurdas aquí.
	"discapacidad-40": [
		...JUBILACION_52,
		...SIN_DEPENDENTES.filter(
			(s) =>
				s !== "asignacion-hijo-a-cargo" &&
				s !==
					"prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad",
		),
		"bono-cultural-joven",
	],
	"monoparental-38": [...JUBILACION_52, "bono-cultural-joven"],
	"estudiante-20": [...JUBILACION_52, "pension-orfandad", "pension-viudedad"],
	"autonomo-44": [...JUBILACION_52, ...SIN_DEPENDENTES, "bono-cultural-joven", "prestacion-desempleo-contributiva"],
	"vg-34": [...JUBILACION_52, "bono-cultural-joven"],
	// bono-alquiler-joven llega hasta los 35: con 33 no es absurdo.
	"sin-ingresos-33": [...JUBILACION_52, ...SIN_DEPENDENTES, "bono-cultural-joven"],
};

function evalAll(answers: A) {
	const profile = { answers } as CitizenProfile;
	const { evaluable } = pickValidVersions(inputs.rules, TODAY);
	return evaluable.map((rs: RuleSet) => ({
		rs,
		ev: evaluateRuleSet(rs, profile, {
			catalog: inputs.catalog,
			parameters: inputs.parameters,
			today: TODAY,
		}),
	}));
}

describe("orden de resultados (F10-RES, datos reales)", () => {
	it("encaja antes que posible-pocas, posible antes que plegadas y faltan datos", () => {
		for (const [name, a] of TIPICOS) {
			const g = groupResults(evalAll(a), false);
			const open = [...g.encajas, ...g.posiblesPocas];
			// abierto: sin ningún requisito en F
			for (const { ev } of open)
				expect(
					ev.requirements.every((r) => r.status !== "F"),
					`${name}: ${ev.benefitSlug} abierto con requisito en F`,
				).toBe(true);
			// plegadas: solo posibles con F blanda o muchas U
			for (const { ev } of g.noDescartar)
				expect(
					ev.verdict === "posible" &&
						!isEncaja(ev) &&
						(ev.requirements.some((r) => r.status === "F") || nU(ev) > 2),
					`${name}: ${ev.benefitSlug} plegada sin motivo`,
				).toBe(true);
		}
	});

	it("una blanda en F no puede salir como «Encaja»", () => {
		const g = groupResults(evalAll(base({ age: AGE(44), dependents: DEP() })), false);
		const nacimiento = evalAll(base({ age: AGE(44), dependents: DEP() })).find(
			(x) => x.ev.benefitSlug === "madrid-ayudas-nacimiento-adopcion-multiple",
		);
		expect(nacimiento).toBeDefined();
		// 0 personas a cargo ⇒ la blanda «2 o más a cargo» da F ⇒ no «Encaja».
		expect(isEncaja(nacimiento!.ev)).toBe(false);
		expect(
			g.noDescartar.some(
				(x) => x.ev.benefitSlug === "madrid-ayudas-nacimiento-adopcion-multiple",
			),
		).toBe(true);
	});

	it("ninguna ayuda claramente absurda en las 10 primeras (perfiles típicos)", () => {
		for (const [name, a] of TIPICOS) {
			const g = groupResults(evalAll(a), false);
			const top10 = [...g.encajas, ...g.posiblesPocas]
				.slice(0, 10)
				.map((x) => x.ev.benefitSlug);
			for (const slug of ABSURDAS[name] ?? []) {
				expect(
					top10.includes(slug),
					`${name}: «${slug}» en top-10 abierto`,
				).toBe(false);
			}
		}
	});

	it("dentro de cada grupo abierto: más requisitos cumplidos primero", () => {
		for (const [name, a] of TIPICOS) {
			const g = groupResults(evalAll(a), false);
			for (const grp of [g.encajas, g.posiblesPocas, g.noDescartar]) {
				const ts = grp.map(
					(x) => x.ev.requirements.filter((r) => r.status === "T").length,
				);
				expect(
					[...ts].sort((x, y) => y - x),
					`${name}: grupo desordenado`,
				).toEqual(ts);
			}
		}
	});
});
