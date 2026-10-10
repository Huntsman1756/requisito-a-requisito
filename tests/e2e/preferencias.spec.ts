import { expect, test } from "@playwright/test";

const BASE = (process.env.E2E_BASE_URL ?? "").replace(/\/$/, "");

/**
 * preferencias.spec.ts — feedback 10/10: selector de tema, continuación de
 * una comprobación anterior y «Limpiar filtros» del explorador.
 */

test.describe("tema claro / oscuro / automático", () => {
	// En móvil el selector vive dentro del menú «Menú» (details cerrado);
	// en escritorio está en la cabecera.
	const abrirMenuSiMovil = async (page: import("@playwright/test").Page) => {
		const vp = page.viewportSize();
		if (vp && vp.width <= 640)
			await page.locator(".nav-menu > summary").click();
	};

	test("el selector fuerza el tema y lo recuerda al recargar", async ({
		page,
	}) => {
		await page.goto(`${BASE}/`);
		await abrirMenuSiMovil(page);
		const picker = page.getByRole("group", { name: "Tema de color" }).first();
		await expect(picker).toBeVisible();

		await page.getByRole("button", { name: /Oscuro/ }).first().click();
		await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
		expect(
			await page.evaluate(() => localStorage.getItem("rr_theme")),
		).toBe("dark");

		// Persiste entre cargas (script inline, sin parpadeo).
		await page.reload();
		await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
		await abrirMenuSiMovil(page);

		await page.getByRole("button", { name: /Claro/ }).first().click();
		await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

		await page.getByRole("button", { name: /Automático/ }).first().click();
		await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
		expect(
			await page.evaluate(() => localStorage.getItem("rr_theme")),
		).toBeNull();
	});

	test("el tema oscuro por selector colorea la página", async ({ page }) => {
		await page.goto(`${BASE}/`);
		await abrirMenuSiMovil(page);
		await page.getByRole("button", { name: /Oscuro/ }).first().click();
		const bg = await page.evaluate(
			() => getComputedStyle(document.body).backgroundColor,
		);
		// --paper oscuro #0E141C.
		expect(bg).toBe("rgb(14, 20, 28)");
	});
});

test.describe("continuar o empezar de cero", () => {
	const seed = (page: import("@playwright/test").Page) =>
		page.addInitScript(() =>
			sessionStorage.setItem(
				"rr_check_handoff",
				JSON.stringify({
					answers: {
						birthYear: { state: "value", value: 1970 },
					},
					step: 0,
					savedAt: new Date().toISOString(),
				}),
			),
		);

	test("con respuestas guardadas pregunta antes de reutilizarlas", async ({
		page,
	}) => {
		await seed(page);
		await page.goto(`${BASE}/comprobar/`);
		await expect(
			page.getByText("¿Seguir con tus respuestas o empezar de cero?"),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Seguir con mis respuestas" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Empezar de cero" }),
		).toBeVisible();
	});

	test("«Empezar de cero» borra el perfil del navegador", async ({ page }) => {
		await seed(page);
		await page.goto(`${BASE}/comprobar/`);
		await page
			.getByRole("button", { name: "Empezar de cero" })
			.click();
		expect(
			await page.evaluate(() => ({
				local: Object.keys(localStorage).filter((k) => k !== "rr_theme"),
				session: Object.keys(sessionStorage),
			})),
		).toEqual({ local: [], session: [] });
		// El flujo sigue adelante, sin respuestas previas.
		await expect(
			page.getByRole("button", { name: "Siguiente" }),
		).toBeVisible();
	});

	test("«Seguir con mis respuestas» retoma donde quedó", async ({ page }) => {
		await page.addInitScript(() =>
			sessionStorage.setItem(
				"rr_check_handoff",
				JSON.stringify({
					answers: {
						birthYear: { state: "value", value: 1970 },
					},
					step: 2,
					savedAt: new Date().toISOString(),
				}),
			),
		);
		await page.goto(`${BASE}/comprobar/`);
		await page
			.getByRole("button", { name: "Seguir con mis respuestas" })
			.click();
		// Paso 3 sembrado: no vuelve a la primera pregunta.
		await expect(
			page.getByRole("progressbar"),
		).toHaveAttribute("aria-valuenow", "3");
	});
});

test.describe("explorar: filtros", () => {
	test("«Limpiar filtros» solo aparece con filtros activos y los quita", async ({
		page,
	}) => {
		await page.goto(`${BASE}/explorar/`);
		const clear = page.getByRole("button", { name: "Limpiar filtros" });
		const count = page.locator(".explorer-count");
		await expect(clear).toHaveCount(0);
		// El catálogo carga por fetch: esperar a que salga de «Cargando…»
		// (en despliegues con latencia puede tardar unos segundos).
		await expect(count).not.toHaveText("Cargando…", { timeout: 20000 });
		const total = await count.innerText();

		// Filtro de búsqueda: la etiqueta visible existe y filtra.
		await page.getByLabel("Buscar por nombre o palabra").fill("alquiler");
		await expect(clear).toBeVisible();
		const filtered = await count.innerText();
		expect(filtered).not.toBe(total);
		await clear.click();
		await expect(
			page.getByLabel("Buscar por nombre o palabra"),
		).toHaveValue("");
		await expect(clear).toHaveCount(0);
		await expect(count).toHaveText(total);
	});

	test("los filtros se pliegan en «Filtrar (N activos)» en móvil", async ({
		page,
	}) => {
		const vp = page.viewportSize();
		test.skip(!vp || vp.width > 860, "solo móvil");
		await page.goto(`${BASE}/explorar/`);
		const summary = page.locator(".explorer-advanced > summary");
		await expect(summary).toBeVisible();
		await page.getByLabel("Buscar por nombre o palabra").fill("alquiler");
		await summary.click();
		await page.getByLabel("Ámbito").selectOption("municipal");
		await expect(summary).toContainText("2 activos");
	});
});
