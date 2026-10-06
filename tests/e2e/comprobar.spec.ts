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
	// 1 · Municipio (combobox)
	const box = page.getByRole("combobox");
	await box.fill("Madrid");
	await page.getByRole("option", { name: "Madrid" }).first().getByRole("button").click();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// 2 · Desde cuándo empadronado (month)
	await page.locator('input[type="month"]').fill("2020-01");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// 3 · Edad
	await page.getByRole("spinbutton").fill("35");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// (el año de nacimiento solo se pregunta a los 15–20 años; la dependencia,
	// solo si hay discapacidad)
	// 4 · Personas a cargo
	await page.getByRole("spinbutton").fill("0");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// 6 · Familia
	await page.getByLabel("Familia numerosa").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// 7 · Empleo
	await page.getByLabel("Trabajo por cuenta ajena").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// 8 · Estudios
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// 9 · Ingresos
	await page.getByLabel("De 8.400 € a 16.800 €").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// 10 · Discapacidad
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// 10 · Vivienda
	await page.getByLabel(/propiedad|situaci.n/i).first().check();
	await page.getByRole("button", { name: "Siguiente" }).click();

	// Revisión
	await expect(
		page.getByRole("heading", { name: "Revisa tus respuestas" }),
	).toBeVisible({ timeout: 15000 });
	await page.getByRole("button", { name: "Ver mis resultados" }).click();

	// Resultados
	await expect(page.getByRole("heading", { name: "Tus resultados" })).toBeVisible({ timeout: 15000 });
	await expect(page.getByText("Familia numerosa").first()).toBeVisible();
	// Guardia I7: si el self-check cae, todas las tarjetas serían «No evaluable».
	await expect(page.getByText("No evaluable")).toHaveCount(0);
	await expect(page.getByText(/Posible|Probable|Encaja/).first()).toBeVisible();
	expect(failedRequests).toEqual([]);
});

test("comprobar: quien vive fuera de la CM recibe salida honesta", async ({ page }) => {
	await page.goto("/comprobar/");
	await page.getByRole("button", { name: "Empezar" }).click();
	await page.getByRole("combobox").fill("Sevilla");
	await expect(page.getByText(/fuera de la Comunidad de Madrid/)).toBeVisible();
});

test("comprobar: sin JS el enlace al catálogo está", async ({ browser }) => {
	const ctx = await browser.newContext({ javaScriptEnabled: false });
	const page = await ctx.newPage();
	await page.goto("/comprobar/");
	await expect(page.getByRole("link", { name: /explorar|ayudas/i }).first()).toBeVisible();
	await ctx.close();
});

test("sin números repetidos en los textos visibles (R2-I18N)", async ({ page }) => {
	await page.goto("/");
	const body = await page.locator("body").innerText();
	expect(body).not.toMatch(/\b(\d+) \1\b/);
});
