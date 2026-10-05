import { expect, test } from "@playwright/test";

// Recorrido feliz del asistente piloto: introducción → preguntas → resultados.
test("comprobar: flujo completo hasta resultados", async ({ page }) => {
	const failedRequests: string[] = [];
	page.on("requestfailed", (r) => failedRequests.push(r.url()));
	await page.goto("/comprobar/");
	await expect(
		page.getByRole("heading", { name: /Descubre qué ayudas/ }),
	).toBeVisible({ timeout: 15000 });

	await page.getByRole("button", { name: "Empezar" }).click();
	// Pregunta 1: municipio (combobox)
	const box = page.getByRole("combobox");
	await box.fill("Madrid");
	await page.getByRole("option", { name: "Madrid" }).first().click();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// Edad
	await page.getByRole("spinbutton").fill("35");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// Dependientes
	await page.getByRole("spinbutton").fill("0");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// Familia
	await page.getByLabel("Familia numerosa").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// Empleo
	await page.getByLabel("Trabajo por cuenta ajena").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// Ingresos
	await page.getByLabel("De 8.400 € a 16.800 €").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// Discapacidad
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();

	// Revisión
	await expect(
		page.getByRole("heading", { name: "Revisa tus respuestas" }),
	).toBeVisible();
	await page.getByRole("button", { name: "Ver mis resultados" }).click();

	// Resultados
	await expect(page.getByRole("heading", { name: "Tus resultados" })).toBeVisible();
	await expect(page.getByText("Familia numerosa").first()).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /Descuento de tren para familias numerosas/ }),
	).toBeVisible();
	// Guardia I7: si el self-check cae, todas las tarjetas serían «No evaluable».
	await expect(page.getByText("No evaluable")).toHaveCount(0);
	await expect(page.getByText(/Posible|Probable/).first()).toBeVisible();
	expect(failedRequests).toEqual([]);
});

test("comprobar: quien vive fuera de la CM recibe salida honesta", async ({
	page,
}) => {
	await page.goto("/comprobar/");
	await page.getByRole("button", { name: "Empezar" }).click();
	await page
		.getByRole("button", { name: /Vivo fuera de la Comunidad de Madrid/ })
		.click();
	await expect(
		page.getByRole("heading", {
			name: /solo para la Comunidad de Madrid/,
		}),
	).toBeVisible();
	await expect(page.getByText(/ayudas estatales/)).toBeVisible();
});

test("comprobar: sin JS el enlace al catálogo está", async ({ page, context }) => {
	await context.addInitScript(() => {});
	const response = await page.request.get("/comprobar/");
	const html = await response.text();
	expect(html).toContain("ver las ayudas y sus fuentes");
});

test("sin números repetidos en los textos visibles (R2-I18N)", async ({ page }) => {
	await page.goto("/comprobar/?ejemplo=familia-getafe");
	await page.waitForSelector(".result-card, .card, [class*=card]", { timeout: 15000 });
	const text = await page.evaluate(() => document.body.innerText);
	expect(text).not.toMatch(/\b(\d+) \1\b/);
});
