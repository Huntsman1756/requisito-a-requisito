/**
 * anexos — B5.3: regenera los anexos de `submission/anexos/` desde el export
 * estático de out/ (el del build; en la release será el --strict). Se ejecuta
 * el 14/10 contra la release; hoy se prueba con el export actual.
 *
 * Uso: E2E_PORT=4690 npx tsx scripts/anexos.ts
 *
 * Requiere `npm run build` antes. Capturas: desktop/móvil × claro/oscuro
 * × {portada, como-funciona, ficha, explorar, observatorio, datos,
 * como-verificamos} + resultados. Vídeo: grabación Playwright del flujo
 * completo de /comprobar/ (webm), uno por dispositivo.
 *
 * F10-REL-2: antes de generar, `limpiarAnexos` borra de esas dos carpetas todo
 * lo que esta corrida no vaya a regenerar (los vídeos del 06/10 con otro
 * nombre, las capturas con la numeración antigua, cualquier extensión). Al
 * final, `verificarAnexos` exige el recuento exacto y el script sale con error
 * si falta o sobra algún fichero. Los nombres esperados están en
 * `scripts/anexos-catalogo.ts`, que es la única fuente de verdad.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium, devices, type Browser, type Page } from "playwright";
import {
	DIR_CAPTURAS,
	DIR_VIDEO,
	DISPOSITIVOS,
	limpiarAnexos,
	nombresCapturas,
	nombresVideo,
	PAGINA_RESULTADOS,
	PAGINAS,
	verificarAnexos,
} from "./anexos-catalogo";

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

	mkdirSync(join(OUT_DIR, DIR_CAPTURAS), { recursive: true });
	mkdirSync(join(OUT_DIR, DIR_VIDEO), { recursive: true });
	// Limpieza: solo deben quedar los anexos de ESTA corrida (release estricta
	// del 14/10) — fuera los vídeos del 06/10, las capturas con la numeración
	// antigua y cualquier otro fichero de estas carpetas.
	for (const borrado of limpiarAnexos(OUT_DIR)) {
		console.log(`borrado anexo antiguo: ${borrado}`);
	}

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
						DIR_CAPTURAS,
						`${disp}-${scheme}-${String(i).padStart(2, "0")}-${nombre}.png`,
					),
					fullPage: true,
				});
			}
			// resultados: flujo completo → captura
			await completarAsistente(page);
			await page.screenshot({
				path: join(
					OUT_DIR,
					DIR_CAPTURAS,
					`${disp}-${scheme}-${PAGINA_RESULTADOS}.png`,
				),
				fullPage: true,
			});
			await ctx.close();
			console.log(`${disp}/${scheme}: ${PAGINAS.length} capturas`);
		}
	}

	// Vídeos del flujo /comprobar/ — nombres fijos, los mismos que exige
	// `nombresVideo()`: uno por dispositivo. El page@*.webm intermedio se
	// renombra; si Playwright no deja ninguno, el script falla en vez de enviar
	// el paquete sin vídeo.
	for (const [disp, vp] of DISPOSITIVOS) {
		const ctx = await browser.newContext({
			viewport: vp,
			...(disp === "movil" ? { ...devices["iPhone 14"] } : {}),
			recordVideo: { dir: join(OUT_DIR, DIR_VIDEO), size: vp },
		});
		const page = await ctx.newPage();
		await completarAsistente(page);
		await page.getByRole("link", { name: "Ver ficha completa" }).first().click();
		await page.waitForLoadState("networkidle");
		await ctx.close(); // cierra y escribe el webm
		const ultimo = readdirSync(join(OUT_DIR, DIR_VIDEO))
			.filter((f) => f.startsWith("page@") && f.endsWith(".webm"))
			// Si hubiera más de uno, el de esta pasada es el más reciente.
			.sort(
				(a, b) =>
					statSync(join(OUT_DIR, DIR_VIDEO, a)).mtimeMs -
					statSync(join(OUT_DIR, DIR_VIDEO, b)).mtimeMs,
			)
			.at(-1);
		if (!ultimo) {
			throw new Error(`anexos: no se grabó el vídeo recorrido-${disp}.webm`);
		}
		const destino = `recorrido-${disp}.webm`;
		renameSync(join(OUT_DIR, DIR_VIDEO, ultimo), join(OUT_DIR, DIR_VIDEO, destino));
		console.log(`vídeo → ${OUT_DIR}/${DIR_VIDEO}/${destino}`);
	}

	await browser.close();
	server.kill();

	// Fail-closed: si falta o sobra un anexo, no hay paquete que valga.
	const { faltan, sobran } = verificarAnexos(OUT_DIR);
	if (faltan.length > 0 || sobran.length > 0) {
		console.error(
			`anexos: recuento incorrecto — faltan [${faltan.join(", ")}], sobran [${sobran.join(", ")}]`,
		);
		process.exit(1);
	}
	console.log(
		`anexos: OK — ${nombresCapturas().length} capturas y ${nombresVideo().length} vídeos en ${OUT_DIR}`,
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
