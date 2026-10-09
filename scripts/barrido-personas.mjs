// F10-RES-2 §5.1: 25 personas realistas por la ruta real del formulario.
// Captura grupos, tarjetas abiertas, «faltan datos» y relacionadas.

import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { PERSONAS as P } from "../tests/fixtures/personas.mjs";

const BASE = process.env.BASE ?? "http://localhost:4399";
const OUT = "evidence/2026-10-09-F10/personas";
mkdirSync(OUT, { recursive: true });

async function run(browser, name, answers, vp, takeShot) {
	const page = await browser.newPage({ viewport: vp });
	await page.addInitScript((p) => {
		sessionStorage.setItem(
			"rr_check_handoff",
			JSON.stringify({
				answers: p,
				step: 0,
				savedAt: new Date().toISOString(),
			}),
		);
	}, answers);
	await page.goto(`${BASE}/comprobar/`);
	await page.getByRole("button", { name: "Empezar", exact: true }).click();
	for (let i = 0; i < 18; i++) {
		if (await page.getByText("Revisa tus respuestas").count()) break;
		const before = await page.evaluate(
			() => document.querySelector("fieldset, .question")?.textContent ?? "",
		);
		const btn = page.getByRole("button", { name: "Siguiente", exact: true });
		if (!(await btn.count())) break;
		await btn.click();
		await page.waitForTimeout(180);
		const after = await page.evaluate(
			() => document.querySelector("fieldset, .question")?.textContent ?? "",
		);
		if (after === before) {
			// Paso que exige dato sin valor sembrado → salidas alternativas.
			const alt = page.getByRole("button", { name: "No lo sé", exact: true });
			const dec = page.getByRole("button", {
				name: "Prefiero no decirlo",
				exact: true,
			});
			if (await alt.isVisible().catch(() => false)) await alt.click();
			else if (await dec.isVisible().catch(() => false)) await dec.click();
			await page.waitForTimeout(150);
		}
	}
	await page.getByRole("button", { name: "Ver mis resultados" }).click();
	await page
		.getByRole("heading", { name: "Tus resultados" })
		.waitFor({ timeout: 20000 });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(300);
	const data = await page.evaluate(() => {
		const groups = [...document.querySelectorAll("h2.results-group")].map((h) =>
			h.textContent.trim(),
		);
		// Solo tarjetas realmente abiertas (fuera del <details> plegado).
		const openCards = [
			...document.querySelectorAll(".results-list > .aid-card"),
		].filter((c) => !c.closest("#no-descartar") && !c.closest(".nocumple"));
		const open = openCards.map((c) =>
			c.querySelector("h2")?.textContent.trim(),
		);
		const cardMax = Math.round(
			Math.max(0, ...openCards.map((c) => c.getBoundingClientRect().height)),
		);
		const missing = [...document.querySelectorAll(".missing-panel li")].map(
			(l) => l.textContent.trim(),
		);
		const related = document.querySelectorAll(".level2-list li").length;
		// F10-RES-3: altura total de la página y filas compactas «solo si…».
		const height = document.documentElement.scrollHeight;
		const solosi = document.querySelectorAll(".solosi-list .row-line").length;
		const folded = document.querySelectorAll("#no-descartar .row-line").length;
		const sentence =
			document.querySelector(".results-sentence")?.textContent.trim() ?? "";
		return {
			groups,
			open,
			cardMax,
			missing,
			related,
			height,
			solosi,
			folded,
			sentence,
		};
	});
	if (takeShot) {
		const tag = vp.width === 390 ? "_m" : "_d";
		await page.screenshot({ path: `${OUT}/${name}${tag}.png` });
	}
	await page.close();
	return data;
}

const browser = await chromium.launch();
const results = {};
for (const [name, answers] of Object.entries(P)) {
	try {
		const d = await run(
			browser,
			name,
			answers,
			{ width: 1366, height: 900 },
			true,
		);
		const m = await run(
			browser,
			name,
			answers,
			{ width: 390, height: 844 },
			true,
		);
		results[name] = { desktop: d, mobile: m };
		console.log(
			name,
			"| open:",
			d.open.length,
			"| h390:",
			m.height,
			"| cardMax:",
			m.cardMax,
			"| solosi:",
			m.solosi,
			"| related:",
			d.related,
		);
	} catch (e) {
		console.error("FALLO", name, String(e).slice(0, 120));
		results[name] = { error: String(e).slice(0, 200) };
	}
}
writeFileSync(`${OUT}/barrido.json`, JSON.stringify(results, null, 1));
await browser.close();
