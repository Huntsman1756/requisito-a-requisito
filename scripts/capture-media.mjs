// F6-1/F6-2 — captura de medios para la memoria.
// SUSTITUIDO por scripts/anexos.ts (F10-B7): aquel usa los nombres definitivos
// (recorrido-<dispositivo>.webm, <dispositivo>-<esquema>-NN-<página>.png). Este
// deja la numeración antigua (03-resultados, 04-ficha, 05-explorar,
// 06-observatorio), que la limpieza de `npm run anexos` borra. No se usa para el
// paquete; se conserva como historia de F6.
//  - vídeo 2-3 min del recorrido: home → comprobar → preguntas → resultados → ficha
//  - capturas por dispositivo (desktop 1366, móvil 390) × claro/oscuro
// Sirve el export local de out/ con scripts/serve-export.mjs.
// Uso: node scripts/capture-media.mjs [--out submission/anexos]
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const OUT = process.argv.includes("--out")
	? process.argv[process.argv.indexOf("--out") + 1]
	: join(root, "submission/anexos");
const PORT = 4433;
const BASE = `http://localhost:${PORT}`;

mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, "capturas"), { recursive: true });
mkdirSync(join(OUT, "video"), { recursive: true });

const server = spawn("node", ["scripts/serve-export.mjs", "--port", String(PORT)], {
	cwd: root,
	stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 1500));

async function shot(page, path, name) {
	await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
	await page.waitForTimeout(400);
	await page.screenshot({ path: join(OUT, "capturas", `${name}.png`), fullPage: true });
}

async function completeFlow(page, slowMo = 0) {
	await page.goto(`${BASE}/comprobar/`, { waitUntil: "networkidle" });
	await page.waitForTimeout(700);
	await page.getByRole("button", { name: "Empezar" }).click();
	const box = page.getByRole("combobox");
	await box.fill("Madrid");
	await page.waitForTimeout(500);
	await page.getByRole("option", { name: "Madrid" }).first().getByRole("button").click();
	await page.waitForTimeout(400 + slowMo);
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.locator('input[type="month"]').fill("2020-01");
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByRole("spinbutton").fill("35");
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByRole("spinbutton").fill("0");
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("Familia numerosa").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("Trabajo por cuenta ajena").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("De 8.400 € a 16.800 €").check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel("No", { exact: true }).check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.getByLabel(/propiedad|situaci.n/i).first().check();
	await page.getByRole("button", { name: "Siguiente" }).click();
	await page.waitForTimeout(600 + slowMo);
	await page.getByRole("button", { name: "Ver mis resultados" }).click();
	await page.waitForSelector("text=Tus resultados", { timeout: 15000 });
	await page.waitForTimeout(1200);
}

const browser = await chromium.launch();
try {
	// --- capturas ---
	for (const [dev, vp] of [
		["desktop", { width: 1366, height: 768 }],
		["movil", { width: 390, height: 844 }],
	]) {
		for (const scheme of ["light", "dark"]) {
			const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme });
			const page = await ctx.newPage();
			await shot(page, "/", `${dev}-${scheme}-01-portada`);
			await shot(page, "/como-funciona/", `${dev}-${scheme}-02-como-funciona`);
			await completeFlow(page);
			await page.screenshot({
				path: join(OUT, "capturas", `${dev}-${scheme}-03-resultados.png`),
				fullPage: true,
			});
			await shot(page, "/ayudas/prestaciones-dependencia-saad/", `${dev}-${scheme}-04-ficha`);
			await shot(page, "/explorar/", `${dev}-${scheme}-05-explorar`);
			await shot(page, "/observatorio/", `${dev}-${scheme}-06-observatorio`);
			await ctx.close();
			console.log(`capturas ${dev}-${scheme} OK`);
		}
	}

	// --- vídeo del recorrido (móvil emulado) ---
	const vctx = await browser.newContext({
		viewport: { width: 390, height: 844 },
		recordVideo: { dir: join(OUT, "video"), size: { width: 390, height: 844 } },
		colorScheme: "light",
	});
	const vpage = await vctx.newPage();
	await vpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
	await vpage.waitForTimeout(1500);
	await completeFlow(vpage, 700);
	await vpage.waitForTimeout(1500);
	// abre una ficha con cita oficial (la nav móvil colapsa los enlaces de ayudas)
	await vpage.goto(`${BASE}/ayudas/prestaciones-dependencia-saad/`, {
		waitUntil: "networkidle",
	});
	await vpage.waitForTimeout(2000);
	await vpage.evaluate(() => window.scrollTo(0, 400));
	await vpage.waitForTimeout(1500);
	await vctx.close(); // cierra → guarda el vídeo
	console.log("vídeo grabado");

	// --- vídeo escritorio ---
	const dctx = await browser.newContext({
		viewport: { width: 1366, height: 768 },
		recordVideo: { dir: join(OUT, "video"), size: { width: 1366, height: 768 } },
		colorScheme: "dark",
	});
	const dpage = await dctx.newPage();
	await dpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
	await dpage.waitForTimeout(1200);
	await completeFlow(dpage, 600);
	await dpage.waitForTimeout(1200);
	await dctx.close();
	console.log("vídeo escritorio grabado");
} finally {
	await browser.close();
	server.kill();
}
console.log(`Medios en ${OUT}`);
