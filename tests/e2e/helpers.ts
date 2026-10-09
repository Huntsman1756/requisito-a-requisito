import { expect, type Page } from "@playwright/test";

/** El perfil real de Daniel por la ruta real del formulario (F10-RES-2):
 *  Ajalvir, empadronado 07/2026, 56 años, 1 persona a cargo de 18,
 *  «otra situación», cuenta propia, no estudia, ingresos >25.200 €,
 *  alquiler. Comparten el helper caso-daniel.spec y
 *  resultados-legibles.spec. */
export async function completarCasoDaniel(page: Page) {
	await page.goto("/comprobar/");
	await page.getByRole("button", { name: "Empezar" }).click();
	// municipio: Ajalvir
	const box = page.getByRole("combobox");
	await box.fill("Ajalvir");
	await page
		.getByRole("option", { name: /Ajalvir/ })
		.first()
		.getByRole("button")
		.click();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// empadronamiento: julio de 2026
	await page.locator('input[type="month"]').fill("2026-07");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// edad: 56
	await page.getByRole("spinbutton").fill("56");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// personas a cargo: 1, de 18 años
	const depCount = page.getByLabel(/personas tienes a tu cargo/i);
	await depCount.fill("1");
	const depAge = page.getByLabel(/Edad de la persona 1/i);
	await depAge.fill("18");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// familia: otra situación
	await page.getByLabel("Otra situación").first().check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// empleo: cuenta propia
	await page.getByLabel("Trabajo por cuenta propia").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// estudios: no
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// ingresos: más de 25.200 €
	await page.getByLabel(/Más de 25\.200/).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// discapacidad: no ⇒ sin pregunta de dependencia
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// vivienda: alquiler
	await page
		.getByLabel(/alquiler/i)
		.first()
		.check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await expect(
		page.getByRole("heading", { name: "Revisa tus respuestas" }),
	).toBeVisible({ timeout: 15000 });
	await page.getByRole("button", { name: "Ver mis resultados" }).click();
	await expect(
		page.getByRole("heading", { name: "Tus resultados" }),
	).toBeVisible({ timeout: 20000 });
}
