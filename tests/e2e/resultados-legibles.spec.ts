/**
 * resultados-legibles.spec.ts — F10-RES-3: el caso de referencia
 * (Daniel) por la ruta real. Fija los objetivos medidos:
 *
 *   - Página de resultados ≤ 8.000 px a 390 px con todo plegado.
 *   - Ninguna tarjeta abierta pasa de 700 px.
 *   - La ayuda al alquiler es lo primero que se ve tras el resumen.
 *   - «Pregunta N de N» no aparece en resultados (ni visible ni en la
 *     región aria-live; solo como cambio de vista = «Tus resultados»).
 *   - «Solo si…» es lista compacta de una línea, plegada a partir de
 *     la 5.ª fila.
 *   - El resumen superior lo dice en lenguaje claro y sus contadores
 *     coinciden con los grupos.
 */
import { expect, test } from "@playwright/test";
import { completarCasoDaniel } from "./helpers";

// Mismo flujo real de 10 pasos que caso-daniel.spec: margen x2.
test.setTimeout(90_000);

test("caso Daniel: la página de resultados cabe en 8.000 px a 390 px", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await completarCasoDaniel(page);
	await page.evaluate(() => document.fonts.ready);
	const height = await page.evaluate(
		() => document.documentElement.scrollHeight,
	);
	expect(
		height,
		`página de resultados a 390 px: ${height} px`,
	).toBeLessThanOrEqual(8000);
});

test("caso Daniel: ninguna tarjeta abierta pasa de 700 px", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await completarCasoDaniel(page);
	for (const card of await page.locator(".aid-card").all()) {
		const box = await card.boundingBox();
		if (!box) continue; // display:none (details plegado)
		const title = await card.locator("h2").first().textContent();
		expect(
			box.height,
			`tarjeta «${title?.slice(0, 60)}»: ${Math.round(box.height)} px`,
		).toBeLessThanOrEqual(700);
	}
});

test("caso Daniel: la ayuda al alquiler es lo primero tras el resumen", async ({
	page,
}) => {
	await completarCasoDaniel(page);
	// Sin «Encaja»: el grupo no se pinta…
	await expect(
		page.getByRole("heading", { name: "Encajan contigo", exact: true }),
	).toHaveCount(0);
	// …y «Podría encajar» abre con la ayuda al alquiler.
	await expect(
		page.getByRole("heading", { name: "Podría encajar", exact: true }),
	).toBeVisible();
	await expect(page.locator(".aid-card").first()).toContainText("alquiler");
	await expect(page.locator(".aid-card").first()).toContainText(
		"Plan Estatal de Vivienda",
	);
});

test("caso Daniel: «Pregunta N de N» no aparece en resultados", async ({
	page,
}) => {
	await completarCasoDaniel(page);
	await expect(page.getByText(/Pregunta \d+ de \d+/)).toHaveCount(0);
	for (const el of await page.locator("[aria-live]").all())
		expect(
			await el.textContent(),
			"región aria-live anunciando una pregunta",
		).not.toMatch(/Pregunta \d+ de \d+/);
});

test("caso Daniel: «Solo si…» es lista compacta, plegada a partir de la 5.ª", async ({
	page,
}) => {
	await completarCasoDaniel(page);
	const heading = page.getByRole("heading", {
		name: /Solo si se da lo que define/,
	});
	await expect(heading).toBeVisible();
	// Una línea por ayuda con enlace a la ficha; nunca tarjetas.
	const open = heading.locator("xpath=following-sibling::ul[1]").locator("li");
	expect(await open.count()).toBe(5);
	await expect(open.first().getByRole("link")).toBeVisible();
	for (const li of await open.all())
		expect(await li.locator(".aid-card").count()).toBe(0);
	// Daniel tiene 8 «solo si…»: las 3 restantes van plegadas.
	const folded = page.locator(".results-closed--inline .solosi-list .row-line");
	expect(await folded.count()).toBe(3);
});

test("caso Daniel: el resumen lo dice en lenguaje claro y cuadra con los grupos", async ({
	page,
}) => {
	await completarCasoDaniel(page);
	const sentence = page.locator(".results-sentence");
	await expect(sentence).toContainText("podría encajarte");
	await expect(sentence).toContainText("solo si se da una situación");
	// Los contadores coinciden con los grupos pintados.
	const tally = page.locator(".tally");
	await expect(tally).toContainText("podrían encajar");
	await expect(tally).toContainText("«solo si…»");
	const solosiRows = await page.locator(".solosi-list .row-line").count();
	const solosiCounter = tally.locator("div", {
		hasText: "«solo si…»",
	});
	await expect(solosiCounter.locator("b")).toHaveText(String(solosiRows));
});
