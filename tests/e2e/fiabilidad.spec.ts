/**
 * fiabilidad.spec.ts — F10-FIAB: lo que la web promete, comprobado.
 *
 * 1. Una tarjeta «no parece aplicarte» muestra QUÉ requisito falla Y su cita
 *    con enlace a la fuente oficial (ADR-017: el no_cumple siempre con motivo
 *    y vía de consulta; F10-FRONT-1).
 * 2. Las tarjetas del nivel 1 llevan la etiqueta de revisión honesta
 *    («Comprobada con la fuente · revisión final pendiente» mientras falte la
 *    aprobación de Daniel — ADR-044).
 * 3. Privacidad (ADR-007, bloqueante): ninguna respuesta del perfil sale en la
 *    URL, en peticiones a la red, ni en cookies; el almacenamiento solo usa las
 *    claves propias del asistente.
 *
 * Las rutas se construyen con BASE = E2E_BASE_URL sin barra final, de modo que
 * el mismo spec corre en local (out/) y en producción
 * (…/requisito-a-requisito).
 */
import { expect, test, type Page } from "@playwright/test";

const BASE = (process.env.E2E_BASE_URL ?? "").replace(/\/$/, "");
const url = (p: string) => `${BASE}${p}`;

/** Recorrido mínimo: perfil de 40 años, sin cargas, familia «otra situación».
 *  Produce al menos un no_cumple hard (descuento transporte FN, título FN). */
async function completarAsistente(page: Page) {
	await page.goto(url("/comprobar/"));
	await page.getByRole("button", { name: "Empezar" }).click();
	// municipio
	const box = page.getByRole("combobox");
	await box.fill("Madrid");
	await page
		.getByRole("option", { name: "Madrid" })
		.first()
		.getByRole("button")
		.click();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// empadronamiento
	await page.locator('input[type="month"]').fill("2020-01");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// edad
	await page.getByRole("spinbutton").fill("40");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// personas a cargo
	await page.getByRole("spinbutton").fill("0");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// familia — otra situación ⇒ FN no aplica
	await page.getByLabel("Otra situación").first().check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// empleo
	await page.getByLabel("Trabajo por cuenta ajena").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// estudios
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// ingresos
	await page.getByLabel("De 8.400 € a 16.800 €").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// discapacidad: no ⇒ no se pregunta dependencia
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	// vivienda
	await page.getByLabel(/propiedad|situaci.n/i).first().check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await expect(
		page.getByRole("heading", { name: "Revisa tus respuestas" }),
	).toBeVisible({ timeout: 15000 });
	await page.getByRole("button", { name: "Ver mis resultados" }).click();
	await expect(
		page.getByRole("heading", { name: "Tus resultados" }),
	).toBeVisible({ timeout: 15000 });
}

test("fiabilidad: la tarjeta no_cumple muestra el requisito que falla con su cita y enlace a la fuente", async ({
	page,
}) => {
	await completarAsistente(page);
	// Abrir la sección «No parece aplicarte»
	const toggle = page.getByRole("button", { name: /No parece aplicarte/ });
	await expect(toggle).toBeVisible();
	await toggle.click();
	const card = page.locator(".nocumple .aid-card").first();
	await expect(card).toBeVisible();
	// El motivo nombra el requisito que falla
	await expect(card).toContainText("no cumples:");
	// La cita del requisito fallado, con extracto literal y enlace a la fuente
	const cite = card.locator("details.cite").first();
	await expect(cite).toBeVisible();
	await cite.locator("summary").click();
	await expect(cite.locator("blockquote")).toBeVisible();
	const srcLink = cite.locator('a[href^="http"]');
	await expect(srcLink).toBeVisible();
	const href = await srcLink.getAttribute("href");
	expect(href).toMatch(
		/boe\.es|bocm\.es|comunidad\.madrid|seg-social\.es|sepe\.es|madrid\.es|infosubvenciones\.es/,
	);
	// Y siempre un camino a la ficha completa
	await expect(
		card.getByRole("link", { name: /Ficha completa|ficha completa/ }),
	).toBeVisible();
});

test("fiabilidad: la etiqueta de revisión de cada tarjeta refleja el estado real del bundle", async ({
	page,
}) => {
	await completarAsistente(page);
	// El mapa slug → humanReview.status del bundle servido es el oráculo:
	// una tarjeta solo puede decir «revisada» si su regla está aprobada.
	const bundle = await (
		await page.request.get(url("/datos/elegibilidad/bundle.json"))
	).json();
	const pendientes = new Set(
		(bundle.rulesets as { benefitSlug: string; humanReview?: { status?: string } }[])
			.filter((r) => r.humanReview?.status !== "approved")
			.map((r) => r.benefitSlug),
	);
	// Solo las tarjetas con motor llevan .review-state (las «no evaluable» no).
	const states = page.locator(".aid-card:has(.review-state)");
	const n = await states.count();
	expect(n).toBeGreaterThan(0);
	for (let i = 0; i < n; i++) {
		const card = states.nth(i);
		await expect(card.locator(".review-state")).toContainText(
			"Comprobada con la fuente",
		);
		const ficha = card.locator('a[href*="/ayudas/"]').first();
		const href = await ficha.getAttribute("href").catch(() => null);
		const slug = href?.match(/\/ayudas\/([^/]+)/)?.[1];
		if (slug && pendientes.has(slug)) {
			await expect(card.locator(".review-state")).toContainText(
				"revisión final pendiente",
			);
		}
	}
	// En el bundle público actual todo está pendiente: ninguna tarjeta puede
	// decir «revisada». En una copia con aprobaciones simuladas sí puede.
	if (pendientes.size === (bundle.rulesets as unknown[]).length) {
		await expect(page.getByText("revisada por")).toHaveCount(0);
	}
});

test("fiabilidad: privacidad — el perfil no sale del navegador", async ({
	page,
}) => {
	const seen: { url: string; method: string; body: string }[] = [];
	page.on("request", (r) => {
		seen.push({
			url: r.url(),
			method: r.method(),
			body: r.postData() ?? "",
		});
	});
	await completarAsistente(page);
	// 1. Ninguna petición sale del propio sitio (ni telemetría ni terceros).
	const externos = seen.filter((r) => !r.url.startsWith(BASE || "http://localhost"));
	// en local BASE="" → filtramos por el origin real de la página
	const origin = new URL(page.url()).origin;
	const fueraDelSitio = seen.filter(
		(r) => !r.url.startsWith(origin) && !r.url.startsWith(BASE || origin),
	);
	expect(fueraDelSitio.map((r) => r.url)).toEqual([]);
	expect(externos.length >= 0).toBe(true);
	// 2. Ninguna URL ni cuerpo contiene respuestas del perfil.
	const perfil = ["28079", '"age"', "banda-8400-16800", "asalariado", "familia"];
	for (const r of seen) {
		for (const p of perfil) {
			expect(r.url).not.toContain(p);
			expect(r.body).not.toContain(p);
		}
	}
	// 3. La URL visible no lleva el perfil.
	expect(page.url()).not.toMatch(/28079|asalariado|banda-|age=/);
	// 4. Cookies: ninguna.
	expect(await page.context().cookies()).toEqual([]);
	// 5. Almacenamiento: solo las claves propias y en el navegador.
	const storage = await page.evaluate(() => ({
		local: Object.keys(localStorage),
		session: Object.keys(sessionStorage),
	}));
	for (const k of [...storage.local, ...storage.session]) {
		expect(k).toMatch(/^rr_/);
	}
});
