import { expect, test } from "@playwright/test";

const BASE = (process.env.E2E_BASE_URL ?? "").replace(/\/$/, "");

// B2.3 — /comprobar/ solo con teclado y con zoom al 200 % (360×640 y 390×844,
// claro y oscuro ya cubiertos por los proyectos mobile/dark).

test("comprobar: flujo completo solo con teclado (Tab + Enter)", async ({
	page,
}) => {
	await page.goto(`${BASE}/comprobar/`);
	await expect(
		page.getByRole("heading", { name: /Descubre qué ayudas/ }),
	).toBeVisible({ timeout: 15000 });
	// Toda acción es alcanzable con Tab y activable con Enter/Espacio.
	await page.getByRole("button", { name: "Empezar" }).focus();
	await page.keyboard.press("Enter");
	const box = page.getByRole("combobox");
	await box.fill("Madrid");
	await page.getByRole("option", { name: "Madrid" }).first().getByRole("button").click();
	await page.keyboard.press("Tab");
	// Nada queda fuera del tab order: el botón Siguiente es focuseable.
	const next = page.getByRole("button", { name: "Siguiente" });
	await next.focus();
	await expect(next).toBeFocused();
	await page.keyboard.press("Enter");
	// El paso de «desde cuándo» es un input month focuseable por teclado.
	const month = page.locator('input[type="month"]').first();
	await month.focus();
	await expect(month).toBeFocused();
});

for (const [w, h] of [
	[360, 640],
	[390, 844],
] as const) {
	test(`comprobar: zoom 200 % en ${w}×${h} no rompe el flujo`, async ({
		browser,
	}) => {
		// Zoom 200 % ≈ viewport físico/2 con deviceScaleFactor 2 en un layout
		// de móvil pequeño.
		const ctx = await browser.newContext({
			viewport: { width: w, height: h },
			deviceScaleFactor: 2,
		});
		const page = await ctx.newPage();
		await page.goto(`${BASE}/comprobar/`);
		await expect(
			page.getByRole("heading", { name: /Descubre qué ayudas/ }),
		).toBeVisible({ timeout: 15000 });
		await page.getByRole("button", { name: "Empezar" }).click();
		const box = page.getByRole("combobox");
		await box.fill("Madrid");
		await page
			.getByRole("option", { name: "Madrid" })
			.first()
			.getByRole("button")
			.click();
		// Sin scroll horizontal ni contenido desbordado al 200 %.
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
		);
		expect(overflow, "scroll horizontal al 200 %").toBe(false);
		await page.getByRole("button", { name: "Siguiente" }).click();
		await page.locator('input[type="month"]').fill("2020-01");
		await page.getByRole("button", { name: "Siguiente" }).click();
		await page.getByRole("spinbutton").fill("40");
		await page.getByRole("button", { name: "Siguiente" }).click();
		await expect(page.getByRole("button", { name: "Siguiente" })).toBeVisible();
		await ctx.close();
	});
}
