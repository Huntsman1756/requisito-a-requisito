/**
 * F10-RES-2 §5.3 — regresión de las 25 personas reales.
 *
 * Mismos perfiles que `scripts/barrido-personas.mjs` (evidencia
 * `resultados-personas.md`). Para cada una, por la ruta real del
 * formulario:
 *
 *   1. La tarjeta de «Encaja contigo» nunca lleva la marca «— solo si…»
 *      (una condición definitoria en U nunca es Encaja).
 *   2. «Te faltan datos» no repite una pregunta ya respondida.
 *   3. La página de resultados carga y muestra grupos.
 */

import { expect, test, type Page } from "@playwright/test";

const V = (value: unknown) => ({ state: "value", value });
const T = (m: string) => V({ ccaa: "13", province: "28", municipality: m });
const AGE = (n: number) => V({ min: n, max: n, maxExclusive: false });
const DEP = (...ages: number[]) =>
	V(ages.map((a) => ({ age: { min: a, max: a, maxExclusive: false } })));
const INC = (a: number, b: number | null) => V({ min: a, max: b });
const BY = (y: number) => V({ min: y, max: y, maxExclusive: false });

const BASE_ANSWERS = {
	residenceSince: V({ year: 2000, month: 1 }),
	familyType: V("general"),
	studentStatus: V("no"),
	disability: V("no"),
	dependency: V("no"),
};

const PERSONAS: Record<string, unknown> = {
	daniel: {
		...BASE_ANSWERS, territory: T("28002"), residenceSince: V({ year: 2026, month: 7 }),
		age: AGE(56), dependents: DEP(18), employmentStatus: V("autonomo"),
		incomeAnnual: INC(25200, null), housingStatus: V("alquiler"),
	},
	"jubilada-70-pension-baja": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(70), dependents: DEP(), employmentStatus: V("jubilado"),
		incomeAnnual: INC(8400, 16800), housingStatus: V("propiedad"),
	},
	"madre-sola-30-2hijos": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2015, month: 1 }),
		age: AGE(30), dependents: DEP(3, 6), familyType: V("monoparental"),
		employmentStatus: V("asalariado"), incomeAnnual: INC(8400, 16800), housingStatus: V("alquiler"),
	},
	"joven-22-alquila": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2022, month: 1 }),
		age: AGE(22), dependents: DEP(), employmentStatus: V("asalariado"),
		incomeAnnual: INC(8400, 16800), housingStatus: V("alquiler"),
	},
	"parado-45": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2005, month: 1 }),
		age: AGE(45), dependents: DEP(), employmentStatus: V("desempleado"),
		incomeAnnual: INC(0, 8400), housingStatus: V("alquiler"),
	},
	"estudiante-21": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2005, month: 1 }),
		age: AGE(21), birthYear: BY(2005), dependents: DEP(),
		employmentStatus: V("general"), studentStatus: V("si"),
		incomeAnnual: INC(0, 8400), housingStatus: V("general"),
	},
	"discapacidad-45": {
		...BASE_ANSWERS, territory: T("28079"),
		age: AGE(45), dependents: DEP(), employmentStatus: V("asalariado"),
		incomeAnnual: INC(16800, 25200), disability: V("gte33"), housingStatus: V("propiedad"),
	},
	"cuidadora-60-coslada": {
		...BASE_ANSWERS, territory: T("28040"),
		age: AGE(60), dependents: DEP(), employmentStatus: V("general"),
		incomeAnnual: INC(8400, 16800), housingStatus: V("propiedad"),
	},
	"fnumerosa-mostoles": {
		...BASE_ANSWERS, territory: T("28092"), residenceSince: V({ year: 2010, month: 1 }),
		age: AGE(45), dependents: DEP(7, 10, 14, 17), familyType: V("familia-numerosa"),
		employmentStatus: V("asalariado"), incomeAnnual: INC(16800, 25200), housingStatus: V("propiedad"),
	},
	"autonoma-35": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2018, month: 1 }),
		age: AGE(35), dependents: DEP(), employmentStatus: V("autonomo"),
		incomeAnnual: INC(16800, 25200), housingStatus: V("alquiler"),
	},
	"pareja-40-bebe": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2008, month: 1 }),
		age: AGE(40), dependents: DEP(0), employmentStatus: V("asalariado"),
		incomeAnnual: INC(16800, 25200), housingStatus: V("propiedad"),
	},
	"viudo-75": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(75), dependents: DEP(), employmentStatus: V("jubilado"),
		incomeAnnual: INC(8400, 16800), housingStatus: V("propiedad"),
	},
	"migrante-residencia-2a": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2024, month: 6 }),
		age: AGE(33), dependents: DEP(), employmentStatus: V("asalariado"),
		incomeAnnual: INC(8400, 16800), housingStatus: V("alquiler"),
	},
	"docente-50": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1998, month: 1 }),
		age: AGE(50), dependents: DEP(15), employmentStatus: V("docente"),
		incomeAnnual: INC(16800, 25200), housingStatus: V("propiedad"),
	},
	"parado-larga-54": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1995, month: 1 }),
		age: AGE(54), dependents: DEP(), employmentStatus: V("desempleado"),
		incomeAnnual: INC(0, 8400), housingStatus: V("propiedad"),
	},
	"pensionista-66-sin-cotizacion": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(66), dependents: DEP(), employmentStatus: V("general"),
		incomeAnnual: INC(0, 8400), housingStatus: V("propiedad"),
	},
	"pareja-26-hijo": {
		...BASE_ANSWERS, territory: T("28092"), residenceSince: V({ year: 2020, month: 1 }),
		age: AGE(26), dependents: DEP(1), employmentStatus: V("asalariado"),
		incomeAnnual: INC(8400, 16800), housingStatus: V("alquiler"),
	},
	"bico-19-universidad": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2015, month: 1 }),
		age: AGE(19), birthYear: BY(2007), dependents: DEP(),
		employmentStatus: V("general"), studentStatus: V("si"),
		incomeAnnual: INC(0, 8400), housingStatus: V("general"),
	},
	"incapacidad-58": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1998, month: 1 }),
		age: AGE(58), dependents: DEP(), employmentStatus: V("general"),
		incomeAnnual: INC(8400, 16800), disability: V("gte33"), housingStatus: V("propiedad"),
	},
	"alquiler-vallecas-30": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2019, month: 1 }),
		age: AGE(30), dependents: DEP(), employmentStatus: V("asalariado"),
		incomeAnnual: INC(16800, 25200), housingStatus: V("alquiler"),
	},
	"viudo-65-hijos": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(65), dependents: DEP(17, 20), employmentStatus: V("jubilado"),
		incomeAnnual: INC(16800, 25200), housingStatus: V("propiedad"),
	},
	"empleada-publica-44": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2005, month: 1 }),
		age: AGE(44), dependents: DEP(), employmentStatus: V("empleado-publico"),
		incomeAnnual: INC(16800, 25200), housingStatus: V("propiedad"),
	},
	"joven-18-bono": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 2015, month: 1 }),
		age: AGE(18), birthYear: BY(2008), dependents: DEP(),
		employmentStatus: V("general"), studentStatus: V("si"),
		incomeAnnual: INC(0, 8400), housingStatus: V("general"),
	},
	"mayor-80-dependencia": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1980, month: 1 }),
		age: AGE(80), dependents: DEP(), employmentStatus: V("jubilado"),
		incomeAnnual: INC(8400, 16800), dependency: V("reconocida"), housingStatus: V("propiedad"),
	},
	"familia-alquiler-3hijos": {
		...BASE_ANSWERS, territory: T("28065"), residenceSince: V({ year: 2012, month: 1 }),
		age: AGE(38), dependents: DEP(2, 5, 9), familyType: V("familia-numerosa"),
		employmentStatus: V("asalariado"), incomeAnnual: INC(8400, 16800), housingStatus: V("alquiler"),
	},
	"autonomo-62-baja": {
		...BASE_ANSWERS, territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(62), dependents: DEP(), employmentStatus: V("autonomo"),
		incomeAnnual: INC(8400, 16800), housingStatus: V("propiedad"),
	},
	"discap-33-alquiler": {
		...BASE_ANSWERS, territory: T("28092"), residenceSince: V({ year: 2010, month: 1 }),
		age: AGE(36), dependents: DEP(4), employmentStatus: V("asalariado"),
		incomeAnnual: INC(8400, 16800), disability: V("gte33"), housingStatus: V("alquiler"),
	},
};

// Etiquetas exactas de las preguntas que TODOS los perfiles responden —
// ninguna puede reaparecer en «Te faltan datos». (La pregunta de precisión
// de ingresos «…pasan de X €» es una pregunta NUEVA y sí puede salir.)
const ANSWERED_LABELS = [
	"¿En qué municipio de la Comunidad de Madrid estás empadronado?",
	"¿Desde cuándo estás empadronado ahí?",
	"¿Qué edad tienes?",
	"¿Cuántas personas tienes a tu cargo?",
	"¿Cómo es tu familia?",
	"¿Cuál es tu situación laboral?",
	"¿Cuántos ingresos anuales tienes?",
	"¿Tienes una discapacidad reconocida?",
	"¿Tienes reconocida la dependencia?",
	"¿Cómo es tu vivienda?",
];

async function completar(page: Page, answers: unknown) {
	await page.addInitScript((a) => {
		sessionStorage.setItem(
			"rr_check_handoff",
			JSON.stringify({ answers: a, step: 0, savedAt: new Date().toISOString() }),
		);
	}, answers);
	await page.goto("/comprobar/");
	await page.getByRole("button", { name: "Empezar", exact: true }).click();
	for (let i = 0; i < 18; i++) {
		if (await page.getByText("Revisa tus respuestas").count()) break;
		const before = await page.evaluate(
			() => document.querySelector("fieldset, .question")?.textContent ?? "",
		);
		const btn = page.getByRole("button", { name: "Siguiente", exact: true });
		if (!(await btn.count())) break;
		await btn.click();
		await page.waitForTimeout(160);
		const after = await page.evaluate(
			() => document.querySelector("fieldset, .question")?.textContent ?? "",
		);
		if (after === before) {
			const alt = page.getByRole("button", { name: "No lo sé", exact: true });
			const dec = page.getByRole("button", {
				name: "Prefiero no decirlo",
				exact: true,
			});
			if (await alt.isVisible().catch(() => false)) await alt.click();
			else if (await dec.isVisible().catch(() => false)) await dec.click();
			await page.waitForTimeout(140);
		}
	}
	await page
		.getByRole("button", { name: "Ver mis resultados" })
		.click();
	await page
		.getByRole("heading", { name: "Tus resultados" })
		.waitFor({ timeout: 20_000 });
}

for (const [name, answers] of Object.entries(PERSONAS)) {
	test(`persona ${name}: sin «solo si…» en Encaja ni preguntas repetidas`, async ({
		page,
	}) => {
		await completar(page, answers);
		// 1. El grupo Encaja (si existe) no puede llevar «— solo si…».
		const encHeading = page.getByRole("heading", {
			name: "Encajan contigo",
			exact: true,
		});
		if ((await encHeading.count()) > 0) {
			const list = encHeading.locator("xpath=following-sibling::div[1]");
			await expect(list).not.toContainText(/— solo (si|cuando|con|tras)/);
		}
		// 2. «Te faltan datos» no repite una pregunta ya respondida.
		const items = page.locator(".missing-panel li");
		for (const label of ANSWERED_LABELS)
			expect(await items.filter({ hasText: label }).count(), label).toBe(0);
	});
}
