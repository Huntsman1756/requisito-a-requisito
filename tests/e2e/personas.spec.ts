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

import { expect, type Page, test } from "@playwright/test";

import { PERSONAS } from "../fixtures/personas.mjs";

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
			JSON.stringify({
				answers: a,
				step: 0,
				savedAt: new Date().toISOString(),
			}),
		);
	}, answers);
	await page.goto("/comprobar/");
	await page.getByRole("button", { name: "Empezar", exact: true }).click();
	for (let i = 0; i < 18; i++) {
		if (
			await page.getByRole("heading", { name: "Revisa tus respuestas" }).count()
		)
			break;
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
	await page.getByRole("button", { name: "Ver mis resultados" }).click();
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
