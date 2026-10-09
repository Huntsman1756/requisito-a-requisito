/**
 * visual-layout.spec.ts — detector de defectos de maquetación (F10-VISUAL).
 *
 * Recorre TODAS las páginas del export (portada, listados, las fichas del
 * nivel 1, /comprobar/ en pasos y resultados con personas golden, páginas
 * informativas y la 404) en una matriz de anchos × tema × zoom de texto, y
 * en cada combinación comprueba:
 *   a) scroll horizontal del documento;
 *   b) solapes >2 px entre hojas de texto visibles (excluye ancestro/
 *      descendiente y elementos ocultos);
 *   c) columnas de texto demasiado estrechas (una palabra por línea) o
 *      palabras que salen de su caja;
 *   d) objetivos táctiles <44 px en móvil (WCAG 2.5.8: 24 px mínimo legal);
 *   e) texto cortado (overflow:hidden con scrollWidth>clientWidth) y texto
 *      sobre iconos/imágenes;
 *   f) contraste axe (color-contrast) en claro y en oscuro;
 *   g) slugs técnicos como texto visible;
 *   h) errores de consola y peticiones de recursos con 404.
 *
 * Los hallazgos se acumulan en test-results/visual-findings-<run>.jsonl
 * (scripts/visual-report.ts los convierte en el informe) y las capturas de
 * las combinaciones con fallo en test-results/visual/.
 *
 * Matriz: por defecto se auditan todos los anchos × claro+oscuro;
 * VISUAL_MATRIX=ci acota a los anchos de CI. El zoom 200 % se audita a
 * 390 px en ambos temas y 400 % a 320 px (reflow WCAG).
 */

import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import type {
	CitizenProfile,
	RuleSet,
} from "../../src/lib/eligibility-engine/schema";

/* ---------- datos reales ---------- */

const rules = [
	...new Map(
		(
			JSON.parse(readFileSync("out/datos/elegibilidad/bundle.json", "utf8")) as {
				rulesets: RuleSet[];
			}
		).rulesets.map((r) => [r.benefitSlug, r]),
	).values(),
];

const fixtures = JSON.parse(
	execFileSync(
		process.execPath,
		["node_modules/tsx/dist/cli.mjs", "scripts/completeness-web-data.ts"],
		{ encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
	),
) as {
	persons: {
		slug: string;
		today: string;
		goldenId: string;
		answers: CitizenProfile["answers"];
	}[];
};

const base = process.env.BASE_PATH ?? "";
const url = (p: string) => `${base}${p}`;

const FINDINGS_DIR = "test-results/visual";
const findingsFile = join(
	"test-results",
	`visual-findings-${process.env.VISUAL_RUN ?? "local"}.jsonl`,
);
mkdirSync(FINDINGS_DIR, { recursive: true });

/* ---------- matriz ---------- */

const FULL_WIDTHS = [320, 360, 375, 390, 412, 768, 1024, 1366, 1920];
const CI_WIDTHS = [320, 390, 1366];
const WIDTHS = process.env.VISUAL_MATRIX === "ci" ? CI_WIDTHS : FULL_WIDTHS;
const THEMES = ["light", "dark"] as const;

type Severity = "alta" | "media" | "baja";
interface Finding {
	page: string;
	width: number;
	theme: string;
	type: string;
	severity: Severity;
	detail: string;
}

/* ---------- auditoría en página ---------- */

type RawFinding = Pick<Finding, "type" | "severity" | "detail">;

// Todo el barrido se hace en una sola evaluate por combinación.
async function audit(page: Page): Promise<RawFinding[]> {
	return page.evaluate(() => {
		type F = { type: string; severity: "alta" | "media" | "baja"; detail: string };
		const out: F[] = [];
		const vw = document.documentElement.clientWidth;

		// La cabecera es sticky: si el test dejó la página desplazada, sus
		// rects solapan con el contenido en coordenadas de viewport aunque el
		// layout sea correcto. Se mide siempre con scroll a 0, sin la
		// animación de scroll-behavior:smooth (mediaríamos a mitad de viaje).
		window.scrollTo({ top: 0, left: 0, behavior: "instant" });

		// a) scroll horizontal (+ qué elementos lo provocan)
		const sw = document.documentElement.scrollWidth;
		if (sw > vw + 1) {
			const culprits: string[] = [];
			for (const el of [...document.body.querySelectorAll("*")]) {
				const r = el.getBoundingClientRect();
				if (r.right > vw + 1 && r.width > 0) {
					const id =
						`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""}`;
					culprits.push(`${id} right=${Math.round(r.right)}`);
					if (culprits.length >= 5) break;
				}
			}
			out.push({
				type: "scroll-x",
				severity: "alta",
				detail: `scrollWidth ${sw} > viewport ${vw} — ${culprits.join(" | ")}`,
			});
		}

		const skipTags = new Set([
			"SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "META", "LINK", "HEAD",
			"TITLE", "BR", "WBR", "OPTION",
		]);
		const visible = (el: Element) => {
			const s = getComputedStyle(el);
			if (s.display === "none" || s.visibility !== "visible") return false;
			const r = el.getBoundingClientRect();
			return r.width > 0.5 && r.height > 0.5;
		};
		const directText = (el: Element) =>
			[...el.childNodes].some(
				(c) => c.nodeType === 3 && (c.textContent ?? "").trim().length > 0,
			);
		// Hoja de texto: tiene texto directo y ningún hijo de bloque visible.
		const isLeaf = (el: Element) => {
			if (!directText(el)) return false;
			for (const c of [...el.children]) {
				const d = getComputedStyle(c).display;
				if (
					!d.startsWith("inline") &&
					d !== "contents" &&
					!["SVG", "IMG", "INPUT"].includes(c.tagName)
				)
					return false;
			}
			return true;
		};

		// Rects por línea: un <a> que parte línea devuelve una caja envolvente
		// que «solapa» falsamente con sus vecinos; los fragmentos de Range
		// dan una caja por línea real.
		const lineRects = (el: Element): DOMRect[] => {
			const range = document.createRange();
			range.selectNodeContents(el);
			return [...range.getClientRects()].filter(
				(r) => r.width > 0.5 && r.height > 0.5,
			);
		};

		const leaves: { el: Element; r: DOMRect; lines: DOMRect[]; text: string }[] = [];
		const boxes: { el: Element; r: DOMRect; text: string }[] = [];
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_ELEMENT,
		);
		let n = walker.nextNode();
		while (n) {
			const el = n as Element;
			// Contenido de <details> cerrado y texto solo-lector: Chromium
			// conserva sus rects de layout aunque no se pinten — falsos
			// positivos de solape/overflow si se miden.
			const skipped =
				el.closest("details:not([open])") !== null ||
				el.closest(".sr-only, [hidden]") !== null;
			if (
				!skipped &&
				!skipTags.has(el.tagName) &&
				visible(el)
			) {
				if (isLeaf(el)) {
					const r = el.getBoundingClientRect();
					leaves.push({
						el,
						r,
						lines: lineRects(el),
						text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60),
					});
				} else if (["SVG", "IMG", "VIDEO", "IFRAME"].includes(el.tagName)) {
					// texto sobre iconos/imágenes (e)
					boxes.push({ el, r: el.getBoundingClientRect(), text: el.tagName });
				}
			}
			n = walker.nextNode();
		}

		// b) solapes entre hojas por fragmento de línea (buckets verticales)
		const byTop = new Map<number, { el: Element; r: DOMRect; text: string }[]>();
		const addBox = (el: Element, r: DOMRect, text: string) => {
			const k = Math.floor(r.top / 40);
			for (const kk of [k - 1, k, k + 1]) {
				const arr = byTop.get(kk) ?? [];
				arr.push({ el, r, text });
				byTop.set(kk, arr);
			}
		};
		for (const l of leaves) for (const r of l.lines) addBox(l.el, r, l.text);
		for (const b of boxes) addBox(b.el, b.r, b.text);
		const seenPair = new Set<Element>();
		for (const arr of byTop.values()) {
			for (let i = 0; i < arr.length; i++) {
				const a = arr[i];
				if (seenPair.has(a.el)) continue;
				for (let j = i + 1; j < arr.length; j++) {
					const b = arr[j];
					if (
						a.el === b.el ||
						a.el.contains(b.el) ||
						b.el.contains(a.el)
					)
						continue;
					const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
					const oy =
						Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
					if (ox > 2 && oy > 2) {
						seenPair.add(a.el);
						seenPair.add(b.el);
						out.push({
							type: "solape",
							severity: "alta",
							detail: `«${a.text}» x «${b.text}» (${Math.round(ox)}×${Math.round(oy)} px)`,
						});
						break;
					}
				}
			}
		}

		// c) columna estrecha / palabra fuera de la caja  e) texto cortado
		for (const { el, r, text } of leaves) {
			const cs = getComputedStyle(el);
			const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
			const lines = r.height / lh;
			// columna de una palabra por línea: muchas líneas en muy poco ancho
			if (text.length > 24 && r.width < 110 && lines >= 4)
				out.push({
					type: "columna-estrecha",
					severity: "alta",
					detail: `«${text.slice(0, 40)}…» ${Math.round(r.width)} px de ancho, ~${Math.round(lines)} líneas`,
				});
			// texto cortado
			if (
				el.scrollWidth > el.clientWidth + 1 &&
				["hidden", "clip"].includes(cs.overflowX)
			)
				out.push({
					type: "texto-cortado",
					severity: "alta",
					detail: `«${text.slice(0, 40)}…» scrollWidth ${el.scrollWidth} > ${el.clientWidth}`,
				});
			// palabra fuera de la caja (texto que desborda a la derecha)
			if (el.scrollWidth > el.clientWidth + 4 && cs.overflowX === "visible") {
				const range = document.createRange();
				for (const c of [...el.childNodes]) {
					if (c.nodeType !== 3 || !(c.textContent ?? "").trim()) continue;
					range.selectNodeContents(c);
					for (const rect of [...range.getClientRects()]) {
						if (rect.right > r.right + 4 || rect.left < r.left - 4)
							out.push({
								type: "palabra-fuera",
								severity: "alta",
								detail: `«${text.slice(0, 40)}…» desborda ${Math.round(rect.right - r.right)} px`,
							});
					}
				}
			}
		}

		// d) objetivos táctiles en móvil (<44 px; <24 incumple WCAG 2.5.8).
		// Excepción WCAG: los enlaces inline dentro de un flujo de texto no son
		// objetivos — solo se miden controles «standalone» (display no-inline,
		// nav, botones, campos, summary…).
		if (vw <= 820 || navigator.maxTouchPoints > 0) {
			const touch = document.querySelectorAll(
				"a, button, input, select, textarea, summary, [role=button], [role=link], label[for]",
			);
			for (const el of [...touch]) {
				if (!visible(el) || el.closest("details:not([open])")) continue;
				// WCAG 2.5.8 inline-in-text: enlaces dentro de párrafos/celdas.
				if (el.tagName === "A" && el.closest("p, li, dd, blockquote")) continue;
				// radios/checkboxes: el objetivo táctil real es la etiqueta.
				if (
					el.tagName === "INPUT" &&
					["radio", "checkbox"].includes(
						(el as HTMLInputElement).type,
					) &&
					el.closest("label")
				)
					continue;
				const r = el.getBoundingClientRect();
				if (r.width > 0.5 && r.height > 0.5 && (r.width < 44 || r.height < 44)) {
					const severe = r.width < 24 || r.height < 24;
					out.push({
						type: "tactil-pequeno",
						severity: severe ? "alta" : "media",
						detail: `${el.tagName.toLowerCase()} «${(el.textContent ?? "").trim().slice(0, 30)}» ${Math.round(r.width)}×${Math.round(r.height)}`,
					});
				}
			}
		}

		// i) estilos por defecto del navegador dentro de <main> — la misma
		// clase de fallo que dejó /ayudas/ sin maquetar (dl mono+40 px, h3
		// enormes, marca suelta). Comprobaciones de estilo CALCULADO, no de
		// markup: funcionan aunque el elemento no lleve clase.
		const main = document.querySelector("main");
		if (main) {
			// i.1) ul/ol con la sangría del navegador. La UA da 40 px
			// ABSOLUTOS (no escala con el zoom de texto); la nuestra es rem
			// — se detecta exactamente 40, no «mucho».
			for (const el of [...main.querySelectorAll("ul, ol")]) {
				if (!visible(el) || el.closest("details:not([open])")) continue;
				const s = getComputedStyle(el);
				if (Math.abs(parseFloat(s.paddingInlineStart) - 40) < 0.5)
					out.push({
						type: "lista-sin-estilo",
						severity: "alta",
						detail: `${el.tagName.toLowerCase()} con sangría UA ${s.paddingInlineStart} — «${(el.textContent ?? "").trim().slice(0, 40)}»`,
					});
			}
			// i.2) dd/blockquote con la sangría del navegador
			for (const el of [...main.querySelectorAll("dd, blockquote")]) {
				if (!visible(el) || el.closest("details:not([open])")) continue;
				const s = getComputedStyle(el);
				if (Math.abs(parseFloat(s.marginInlineStart) - 40) < 0.5)
					out.push({
						type: "sangria-navegador",
						severity: "alta",
						detail: `${el.tagName.toLowerCase()} con sangría UA ${s.marginInlineStart} — «${(el.textContent ?? "").trim().slice(0, 40)}»`,
					});
			}
			// i.3) tabla sin estilo propio (border-spacing del navegador)
			for (const el of [...main.querySelectorAll("table")]) {
				if (!visible(el)) continue;
				const s = getComputedStyle(el);
				if (s.borderCollapse === "separate" && parseFloat(s.borderSpacing) >= 1.5)
					out.push({
						type: "tabla-sin-estilo",
						severity: "media",
						detail: `table con border-spacing ${s.borderSpacing} (UA)`,
					});
			}
			// i.4) escala de titulares: el título de una tarjeta nunca puede
			// igualar o superar al h1 de página; y ningún h1-h4 queda con el
			// tamaño mínimo del navegador.
			const h1Size = Math.max(
				...[...main.querySelectorAll("h1")].map((h) =>
					parseFloat(getComputedStyle(h).fontSize),
				),
				0,
			);
			if (h1Size > 0) {
				for (const el of [...main.querySelectorAll(".card h2, .aid-card h2, .dossier h3")]) {
					if (!visible(el)) continue;
					const s = parseFloat(getComputedStyle(el).fontSize);
					if (s >= h1Size)
						out.push({
							type: "titulo-tarjeta-grande",
							severity: "alta",
							detail: `${el.tagName.toLowerCase()} de tarjeta a ${s}px ≥ h1 ${h1Size}px — «${(el.textContent ?? "").trim().slice(0, 40)}»`,
						});
				}
				// .question__title es el título de cada paso del asistente
				// (22-29 px por diseño), no el h1 de página.
				if (h1Size < 26 && !main.querySelector("h1.question__title"))
					out.push({
						type: "h1-pequeno",
						severity: "media",
						detail: `h1 de página a ${h1Size}px (<26 px)`,
					});
			}
			// i.5) texto en monoespaciada fuera de los sitios de docs/16 §3
			// (citas, localizadores, contadores, <code>): señal de elemento sin
			// estilo propio.
			const MONO_OK =
				"code, pre, .mono, .cite, .card-foot, .specimen, .seal, .progress, .events, .explorer-meta, .step-n, .verify-step, .matrix, .matrix-mobile, .legend, .log, .combobox, .dep-row, .obs";
			for (const { el, text } of leaves) {
				const cs = getComputedStyle(el);
				if (
					/mono|consolas|courier/i.test(cs.fontFamily) &&
					main.contains(el) &&
					!el.closest(MONO_OK)
				)
					out.push({
						type: "mono-fuera-de-sitio",
						severity: "media",
						detail: `«${text.slice(0, 40)}» en ${cs.fontFamily.slice(0, 50)}`,
					});
			}
			// i.6) color de texto fuera de los tokens de :root (docs/16 §2).
			// Se resuelven todos los --* a su rgb() y se admite además el
			// blanco/#0E141C de los botones primarios.
			const probe = document.createElement("i");
			probe.style.display = "none";
			document.body.appendChild(probe);
			const allowed = new Set(["rgb(255, 255, 255)", "rgb(14, 20, 28)", "rgb(14, 32, 47)"]);
			for (const prop of [
				"--ink", "--ink-2", "--seal", "--ok", "--doubt", "--no", "--na",
				"--lvl-estado", "--lvl-cm", "--lvl-ayto", "--sheet",
			]) {
				probe.style.color = `var(${prop})`;
				allowed.add(getComputedStyle(probe).color);
			}
			probe.remove();
			for (const { el, text } of leaves) {
				if (!main.contains(el)) continue;
				// El color lavado de un control deshabilitado es deliberado.
				if (el.closest("[disabled], [aria-disabled=true]")) continue;
				const c = getComputedStyle(el).color;
				if (!allowed.has(c))
					out.push({
						type: "color-fuera-paleta",
						severity: "media",
						detail: `«${text.slice(0, 40)}» color ${c}`,
					});
			}
		}

		// g) slugs técnicos como texto visible (fuera de code/pre y de URLs)
		const slugRe = /\b[a-z0-9]+(?:-[a-z0-9]+){2,}\b/g;
		const twalker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
		);
		let tn = twalker.nextNode();
		while (tn) {
			const t = tn.textContent ?? "";
			const parent = tn.parentElement;
			if (
				parent &&
				!parent.closest(
					"code, pre, a[href], script, style, noscript, details:not([open]), .sr-only",
				) &&
				/[a-z]/.exec(t)
			) {
				for (const m of t.matchAll(slugRe)) {
					const w = m[0];
					// Teléfonos/referencias solo-numéricas no son slugs.
					if (!/[a-z]/.test(w)) continue;
					if (/^\d{4}-\d{2}-\d{2}/.test(w) || /^sha/.test(w)) continue;
					out.push({
						type: "slug-visible",
						severity: "media",
						detail: `«${w}» en «${t.trim().slice(0, 50)}»`,
					});
				}
			}
			tn = twalker.nextNode();
		}
		return out;
	});
}

/* ---------- captura y registro ---------- */

function record(
	page: string,
	width: number,
	theme: string,
	found: RawFinding[],
) {
	for (const f of found)
		appendFileSync(
			findingsFile,
			JSON.stringify({ page, width, theme, ...f }) + "\n",
		);
	return found;
}

async function shot(page: Page, name: string) {
	const file = `${name.replace(/[^a-z0-9]+/gi, "_").slice(0, 120)}.png`;
	await page.screenshot({
		path: join(FINDINGS_DIR, file),
		fullPage: true,
	});
	return file;
}

async function auditAt(
	page: Page,
	name: string,
	widths: number[],
	opts: { shotOnFail?: boolean; axe?: boolean } = {},
): Promise<Finding[]> {
	const all: Finding[] = [];
	const theme = (await page.evaluate(() =>
		getComputedStyle(document.documentElement).colorScheme.includes("dark")
			? "dark"
			: "light",
	)) as string;
	for (const w of widths) {
		await page.setViewportSize({ width: w, height: 844 });
		await page.waitForTimeout(120);
		const f = await audit(page);
		record(name, w, theme, f);
		all.push(...f.map((x) => ({ page: name, width: w, theme, ...x })));
		if (f.length && opts.shotOnFail !== false)
			await shot(page, `${name}-${w}-${theme}`);
	}
	if (opts.axe !== false) {
		const res = await new AxeBuilder({ page })
			.withRules(["color-contrast"])
			.analyze();
		for (const v of res.violations)
			for (const node of v.nodes.slice(0, 8))
				record(name, 0, theme, [
					{
						type: "contraste",
						severity: "media",
						detail: `${node.target.join(" ")} — ${v.help}`,
					},
				]);
	}
	return all;
}

function wireConsole(page: Page, name: string) {
	page.on("console", (msg) => {
		if (msg.type() !== "error") return;
		// La página 404 produce el error «Failed to load resource…» para el
		// documento principal — es su respuesta, no un recurso roto.
		if (
			msg.location().url &&
			page.url() &&
			msg.location().url === page.url() &&
			/Failed to load resource/.test(msg.text())
		)
			return;
		record(name, -1, "-", [
			{
				type: "consola",
				severity: "media",
				detail: msg.text().slice(0, 160),
			},
		]);
	});
	page.on("response", (res) => {
		if (res.status() === 404 && res.request().resourceType() !== "document")
			record(name, -1, "-", [
				{
					type: "recurso-404",
					severity: "media",
					detail: res.url().slice(-120),
				},
			]);
	});
}

/* ---------- páginas ---------- */

const STATIC_PAGES: [string, string][] = [
	["portada", "/"],
	["ayudas", "/ayudas/"],
	["explorar", "/explorar/"],
	["observatorio", "/observatorio/"],
	["datos", "/datos/"],
	["como-funciona", "/como-funciona/"],
	["como-verificamos", "/como-verificamos/"],
	["pagina-404", "/__404_inexistente__/"],
];

/* Estados de /comprobar/: intro, paso de dependientes con edades y
 * resultados con 5 personas golden distintas. */
const RESULT_PERSONAS = [
	"imv",
	"bono-cultural-joven",
	"madrid-abono-transporte-infantil",
	"madrid-renta-minima-insercion",
	"prestaciones-dependencia-saad",
];

async function seedAndGoto(
	page: Page,
	answers: CitizenProfile["answers"],
	step: number,
) {
	await page.addInitScript(
		({ answers0, step0 }) =>
			sessionStorage.setItem(
				"rr_check_handoff",
				JSON.stringify({
					answers: answers0,
					step: step0,
					savedAt: new Date().toISOString(),
				}),
			),
		{ answers0: answers, step0: step },
	);
	await page.goto(url("/comprobar/"));
	await page.getByRole("button", { name: "Empezar", exact: true }).click();
}

/** Avanza con «Siguiente» hasta la revisión y abre resultados. Si la
 * respuesta sembrada es unknown/declined, «Siguiente» no avanza (valida el
 * valor) — entonces toca pulsar «No lo sé» / «Prefiero no decirlo». */
async function reachResults(page: Page, maxClicks = 18) {
	for (let i = 0; i < maxClicks; i++) {
		const ver = page.getByRole("button", {
			name: "Ver mis resultados",
			exact: true,
		});
		if (await ver.isVisible().catch(() => false)) break;
		const heading = await page
			.evaluate(() => document.querySelector("fieldset, .question")?.textContent?.slice(0, 80) ?? "");
		await page
			.getByRole("button", { name: "Siguiente", exact: true })
			.click();
		await page.waitForTimeout(140);
		const after = await page
			.evaluate(() => document.querySelector("fieldset, .question")?.textContent?.slice(0, 80) ?? "");
		if (after === heading) {
			// Paso sin valor posible: probar las salidas alternativas.
			const alt = page.getByRole("button", { name: "No lo sé", exact: true });
			const decline = page.getByRole("button", { name: "Prefiero no decirlo", exact: true });
			if (await alt.isVisible().catch(() => false)) await alt.click();
			else if (await decline.isVisible().catch(() => false)) await decline.click();
			await page.waitForTimeout(140);
		}
	}
	await page
		.getByRole("button", { name: "Ver mis resultados", exact: true })
		.click();
	await page.getByRole("heading", { name: "Tus resultados" }).waitFor({
		timeout: 15_000,
	});
}



for (const theme of THEMES) {
	test.describe(`tema ${theme}`, () => {
		test.use({ colorScheme: theme });
		// 9 anchos × auditoría + axe por página: holgura frente a los 45 s.
		test.setTimeout(120_000);

		for (const [name, path] of STATIC_PAGES) {
			test(`layout ${name} (${theme})`, async ({ page }) => {
				wireConsole(page, name);
				// networkidle nunca se resuelve tras un 404 en Firefox; la
				// página 404 es estática y con load basta.
				const wait =
					name === "pagina-404" ? "load" : "networkidle";
				await page.goto(url(path), { waitUntil: wait });
				await page.waitForLoadState(wait);
				const all = await auditAt(page, `${name}-${theme}`, WIDTHS);
				expect(all.filter((f) => f.severity !== "baja")).toEqual([]);
			});
		}

		for (const rs of rules) {
			test(`layout ficha ${rs.benefitSlug} (${theme})`, async ({ page }) => {
				wireConsole(page, `ficha-${rs.benefitSlug}`);
				await page.goto(url(`/ayudas/${rs.benefitSlug}/`));
				await page.waitForLoadState("networkidle");
				const all = await auditAt(
					page,
					`ficha-${rs.benefitSlug}-${theme}`,
					WIDTHS,
				);
				expect(all.filter((f) => f.severity !== "baja")).toEqual([]);
			});
		}

		// Funcional: a ≤640 px existe el botón «Menú», abre la nav y sus
		// enlaces son táctiles. (El 09/10 el summary llevaba display:none —
		// el móvil quedaba sin navegación y ningún chequeo lo vio.)
		test(`nav móvil accesible (${theme})`, async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 640 });
			await page.goto(url("/"));
			// <summary> no expone role=button en Chromium: es el disparador
			// del <details> nativo.
			const menu = page.locator(".nav-menu summary");
			await expect(menu).toBeVisible();
			const box = await menu.boundingBox();
			expect(box && box.height).toBeGreaterThanOrEqual(44);
			await menu.click();
			const nav = page.locator(".nav-menu .site-nav");
			await expect(nav).toBeVisible();
			const first = nav.getByRole("link").first();
			const fb = await first.boundingBox();
			expect(fb && fb.height).toBeGreaterThanOrEqual(44);
		});

		test(`layout comprobar-intro (${theme})`, async ({ page }) => {
			wireConsole(page, "comprobar-intro");
			await page.goto(url("/comprobar/"));
			// El botón existe desde el SSR pero está deshabilitado hasta que
			// cargan las preguntas: auditar con la página ya habilitada.
			await expect(
				page.getByRole("button", { name: "Empezar", exact: true }),
			).toBeEnabled();
			const all = await auditAt(page, `comprobar-intro-${theme}`, WIDTHS);
			expect(all.filter((f) => f.severity !== "baja")).toEqual([]);
		});

		test(`layout comprobar-dependientes (${theme})`, async ({ page }) => {
			wireConsole(page, "comprobar-dependientes");
			// Todas las respuestas sembradas menos «dependents»: la navegación
			// real llega a ese paso y escribe 2 personas → filas de edad.
			const persona = fixtures.persons.find(
				(p) => p.slug === "madrid-abono-transporte-infantil",
			);
			if (!persona) throw new Error("persona madrid-abono-transporte-infantil no encontrada");
			const answers = structuredClone(persona.answers);
			delete answers.dependents;
			await page.clock.install({
				time: new Date(`${persona.today}T12:00:00Z`),
			});
			await seedAndGoto(page, answers, 0);
			for (let i = 0; i < 15; i++) {
				if (
					await page.getByText(/personas a tu cargo/i).first().isVisible()
				)
					break;
				await page
					.getByRole("button", { name: "Siguiente", exact: true })
					.click();
				await page.waitForTimeout(120);
			}
			// Dos personas a cargo ⇒ dos campos de edad en el mismo paso.
			const count = page.locator('input[type="number"]').first();
			await count.fill("2");
			await page.waitForTimeout(150);
			const all = await auditAt(
				page,
				`comprobar-dependientes-${theme}`,
				WIDTHS,
			);
			expect(all.filter((f) => f.severity !== "baja")).toEqual([]);
		});

		for (const slug of RESULT_PERSONAS) {
			test(`layout resultados ${slug} (${theme})`, async ({ page }) => {
				wireConsole(page, `resultados-${slug}`);
				const persona = fixtures.persons.find((p) => p.slug === slug);
				test.skip(!persona, `sin fixture para ${slug}`);
				if (!persona) return;
				await page.clock.install({
					time: new Date(`${persona.today}T12:00:00Z`),
				});
				await seedAndGoto(page, persona.answers, 0);
				await reachResults(page);
				const all = await auditAt(
					page,
					`resultados-${slug}-${theme}`,
					WIDTHS,
				);
				expect(all.filter((f) => f.severity !== "baja")).toEqual([]);
			});
		}

		// Zoom de texto 200 % (a 390 px) y 400 % a 320 px (reflow WCAG 1.4.10).
		test(`layout zoom-200 portada+ficha (${theme})`, async ({ page }) => {
			wireConsole(page, "zoom200");
			for (const [name, path] of [
				["portada", "/"],
				["ficha-imv", "/ayudas/imv/"],
				["explorar", "/explorar/"],
			] as const) {
				await page.goto(url(path));
				await page.waitForLoadState("networkidle");
				await page.setViewportSize({ width: 390, height: 844 });
				await page.evaluate(
					() => (document.documentElement.style.fontSize = "200%"),
				);
				await page.waitForTimeout(150);
				const all = await audit(page);
				record(`${name}-zoom200`, 390, theme, all);
				expect(
					all.filter((f) => f.severity !== "baja"),
					`${name} zoom 200 %`,
				).toEqual([]);
			}
		});

		test(`layout zoom-400 reflow 320 (${theme})`, async ({ page }) => {
			wireConsole(page, "zoom400");
			await page.goto(url("/"));
			await page.waitForLoadState("networkidle");
			await page.setViewportSize({ width: 320, height: 640 });
			await page.evaluate(
				() => (document.documentElement.style.fontSize = "400%"),
			);
			await page.waitForTimeout(150);
			const all = await audit(page);
			record("portada-zoom400", 320, theme, all);
			// A 400 % los solapes puntuales quedan como media; el scroll-x sigue
			// siendo alta (reflow).
			expect(
				all.filter(
					(f) => f.severity === "alta" || f.type === "scroll-x",
				),
			).toEqual([]);
		});
	});
}
