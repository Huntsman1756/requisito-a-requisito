/**
 * memoria-pdf.ts — F10-DEV-2
 *
 * `npm run memoria:pdf` regenera `submission/memoria.pdf` desde
 * `submission/memoria.md` de forma versionada y reproducible:
 *
 *   pandoc (md → html) + Chromium headless (print to PDF)
 *
 * No hay LaTeX en el entorno; el camino HTML+print usa solo dependencias que
 * ya existen (pandoc instalado, playwright instalado). La tipografía es la de
 * sistema y el estilo es sobrio — lo que vale es el contenido medido.
 *
 * Uso: npx tsx scripts/memoria-pdf.ts [--md submission/memoria.md]
 *                                    [--out submission/memoria.pdf]
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const arg = (n: string, d: string) => {
	const i = process.argv.indexOf(`--${n}`);
	return i >= 0 ? process.argv[i + 1] : join(root, d);
};

const MD = arg("md", "submission/memoria.md");
const OUT = arg("out", "submission/memoria.pdf");

const CSS = `
@page { size: A4; margin: 2.4cm 2.2cm; }
body { font-family: "Segoe UI", system-ui, sans-serif; font-size: 10.5pt;
  line-height: 1.55; color: #1a1a1a; max-width: none; }
h1 { font-size: 17pt; border-bottom: 2px solid #7a2020; padding-bottom: .3em; }
h2 { font-size: 13pt; margin-top: 1.4em; border-bottom: 1px solid #ddd;
  padding-bottom: .2em; }
h3 { font-size: 11pt; }
table { border-collapse: collapse; width: 100%; font-size: 9.5pt; }
th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left;
  vertical-align: top; }
th { background: #f4f1ea; }
code { font-family: Consolas, monospace; font-size: 9pt; background: #f6f4ef;
  padding: 0 .2em; }
blockquote { border-left: 3px solid #7a2020; margin-left: 0;
  padding-left: 1em; color: #444; }
a { color: #7a2020; }
hr { border: none; border-top: 1px solid #ccc; margin: 1.5em 0; }
`;

async function main() {
	const body = execFileSync(
		"pandoc",
		[MD, "-f", "gfm", "-t", "html5", "--wrap=none"],
		{ encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
	);
	const tmp = mkdtempSync(join(tmpdir(), "memoria-"));
	try {
		const html = join(tmp, "memoria.html");
		writeFileSync(
			html,
			`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`,
		);
		const browser = await chromium.launch();
		const page = await browser.newPage();
		await page.goto(`file:///${html.replace(/\\/g, "/")}`);
		await page.pdf({
			path: OUT,
			format: "A4",
			printBackground: true,
			displayHeaderFooter: true,
			headerTemplate: "<span></span>",
			footerTemplate:
				'<div style="font-size:7pt;width:100%;text-align:center;color:#888">Requisito a Requisito — memoria · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
		});
		await browser.close();
		console.log(`memoria.pdf ← ${MD}`);
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}
}

if (existsSync(MD)) {
	main().catch((e) => {
		console.error(e);
		process.exit(1);
	});
} else {
	console.error(`no existe ${MD}`);
	process.exit(1);
}
