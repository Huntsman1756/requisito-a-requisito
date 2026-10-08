/**
 * anexos — B5.3: regenera las capturas de `submission/anexos/` desde el
 * export estático de out/ (el del build; en la release será el --strict).
 * Se ejecuta el 14/10 contra la release; hoy se prueba con el export actual.
 *
 * Uso: E2E_PORT=4690 npx tsx scripts/anexos.ts
 *
 * Requiere `npm run build` antes. Capturas: desktop/móvil × claro/oscuro
 * × {portada, como-funciona, resultados, ficha, explorar, observatorio}.
 * Vídeo: grabación Playwright del flujo completo de /comprobar/ (webm).
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, devices, type Browser, type Page } from "playwright";

const PORT = Number(process.env.E2E_PORT ?? 4690);
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = "submission/anexos";

async function completarAsistente(page: Page) {
	await page.goto(`${BASE}/comprobar/`);
	await page.getByRole("button", { name: "Empezar" }).click();
	await page.getByRole("combobox").fill("Getafe");
	await page
		.getByRole("option", { name: "Getafe" })
		.first()
		.getByRole("button")
		.click();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.locator('input[type="month"]').fill("2021-05");
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByRole("spinbutton").fill("33");
	await page.getByRole("button", { name: "Siguiente" }).click();
	// personas a cargo: 1 → edad 4
	await page.getByRole("spinbutton").fill("1");
	await page.getByRole("button", { name: "Siguiente" }).click();
	const edadDep = page.getByRole("spinbutton").first();
	if (await edadDep.isVisible()) {
		await edadDep.fill("4");
		await page.getByRole("button", { name: "Siguiente" }).click();
	}
	await page.getByLabel("Familia monoparental").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("En desempleo").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("Hasta 8.400 €").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel(/alquiler/i).first().check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByRole("button", { name: "Ver mis resultados" }).click();
	await page.getByRole("heading", { name: "Tus resultados" }).waitFor({
		timeout: 15000,
	});
}

const PAGINAS = [
	["portada", "/"],
	["como-funciona", "/como-funciona/"],
	["ficha", "/ayudas/complemento-ayuda-infancia/"],
	["explorar", "/explorar/"],
	["observatorio", "/observatorio/"],
	["datos", "/datos/"],
	["como-verificamos", "/como-verificamos/"],
] as const;
// «resultados» va con la numeración 08 (después de las páginas estáticas).

const DISPOSITIVOS = [
	["desktop", { width: 1366, height: 768 }],
	["movil", { width: 390, height: 844 }],
] as const;

async function main() {
	if (!existsSync("out/index.html")) {
		console.error("anexos: falta out/ — ejecuta `npm run build` antes");
		process.exit(1);
	}
	const server = spawn(
		"node",
		["scripts/serve-export.mjs", "--port", String(PORT)],
		{ stdio: "ignore" },
	);
	process.on("exit", () => server.kill());
	// espera a que sirva
	for (let i = 0; i < 50; i++) {
		try {
			const r = await fetch(`${BASE}/`);
			if (r.ok) break;
		} catch {}
		await new Promise((r) => setTimeout(r, 300));
	}

	mkdirSync(join(OUT_DIR, "capturas"), { recursive: true });
	mkdirSync(join(OUT_DIR, "video"), { recursive: true });

	const browser: Browser = await chromium.launch();
	for (const [disp, vp] of DISPOSITIVOS) {
		for (const scheme of ["light", "dark"] as const) {
			const ctx = await browser.newContext({
				viewport: vp,
				colorScheme: scheme,
				...(disp === "movil" ? { ...devices["iPhone 14"] } : {}),
			});
			const page = await ctx.newPage();
			let i = 0;
			for (const [nombre, path] of PAGINAS) {
				i++;
				await page.goto(`${BASE}${path}`);
				await page.waitForLoadState("networkidle");
				await page.screenshot({
					path: join(
						OUT_DIR,
						"capturas",
						`${disp}-${scheme}-${String(i).padStart(2, "0")}-${nombre}.png`,
					),
					fullPage: true,
				});
			}
			// resultados: flujo completo → captura
			await completarAsistente(page);
			await page.screenshot({
				path: join(OUT_DIR, "capturas", `${disp}-${scheme}-08-resultados.png`),
				fullPage: true,
			});
			await ctx.close();
			console.log(`${disp}/${scheme}: ${PAGINAS.length} capturas`);
		}
	}

	// Vídeos del flujo /comprobar/ — nombres fijos; los page@*.webm intermedios
	// se borran tras renombrar.
	for (const [nombre, vp, extra] of [
		["recorrido-desktop", { width: 1366, height: 768 }, {}],
		["recorrido-movil", { width: 390, height: 844 }, { ...devices["iPhone 14"] }],
	] as const) {
		const ctx = await browser.newContext({
			viewport: vp,
			...extra,
			recordVideo: { dir: join(OUT_DIR, "video"), size: vp },
		});
		const page = await ctx.newPage();
		await completarAsistente(page);
		await page.getByRole("link", { name: "Ver ficha completa" }).first().click();
		await page.waitForLoadState("networkidle");
		await ctx.close(); // cierra y escribe el webm
		const { readdirSync, renameSync } = await import("node:fs");
		const webms = readdirSync(join(OUT_DIR, "video")).filter((f) =>
			f.startsWith("page@") && f.endsWith(".webm"),
		);
		// El último webm escrito es el de esta pasada.
		const ultimo = webms.sort().at(-1);
		if (ultimo) {
			renameSync(
				join(OUT_DIR, "video", ultimo),
				join(OUT_DIR, "video", `${nombre}.webm`),
			);
			console.log(`vídeo → ${OUT_DIR}/video/${nombre}.webm`);
		}
	}

	await browser.close();
	server.kill();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
