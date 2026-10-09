/**
 * visual-report.ts — convierte test-results/visual-findings-*.jsonl en un
 * informe markdown agrupado por causa + índice HTML de las capturas.
 *
 * Uso: npx tsx scripts/visual-report.ts <salida.md> [dirCapturas]
 *   npx tsx scripts/visual-report.ts evidence/2026-10-09-F10/visual-inicial.md
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const out = process.argv[2] ?? "test-results/visual-report.md";
const shotsDir = process.argv[3] ?? "test-results/visual";

interface Row {
	page: string;
	width: number;
	theme: string;
	type: string;
	severity: "alta" | "media" | "baja";
	detail: string;
}

const rows: Row[] = [];
const dir = "test-results";
for (const f of readdirSync(dir)) {
	if (!f.startsWith("visual-findings-") || !f.endsWith(".jsonl")) continue;
	for (const line of readFileSync(join(dir, f), "utf8").split("\n")) {
		if (line.trim()) rows.push(JSON.parse(line) as Row);
	}
}

// Deduplicar por (type, texto citado) conservando la matriz afectada —
// las variaciones de px del mismo patrón no deben crear grupos nuevos.
const coarse = (d: string) => d.replace(/\d+/g, "N").replace(/«([^»]*)».*$/, "«$1»");
const groups = new Map<string, { sev: string; pages: Set<string>; combos: Set<string>; sample: Row }>();
for (const r of rows) {
	const key = `${r.type}|${coarse(r.detail)}`;
	const g = groups.get(key) ?? {
		sev: r.severity,
		pages: new Set<string>(),
		combos: new Set<string>(),
		sample: r,
	};
	g.pages.add(r.page);
	g.combos.add(`${r.width}px·${r.theme}`);
	if (r.severity === "alta") g.sev = "alta";
	groups.set(key, g);
}

const order = { alta: 0, media: 1, baja: 2 };
const sorted = [...groups.values()].sort(
	(a, b) =>
		order[a.sev as keyof typeof order] - order[b.sev as keyof typeof order] ||
		b.pages.size - a.pages.size,
);

const counts = { alta: 0, media: 0, baja: 0 };
for (const g of sorted) counts[g.sev as keyof typeof counts]++;

const shots = existsSync(shotsDir)
	? readdirSync(shotsDir).filter((f) => f.endsWith(".png"))
	: [];

let md = `# Informe visual — ${new Date().toISOString().slice(0, 10)}

Generado por scripts/visual-report.ts sobre ${rows.length} hallazgos brutos
(${groups.size} patrones únicos).

**Resumen: ${counts.alta} alta · ${counts.media} media · ${counts.baja} baja**

| Sev | Tipo | Detalle | Páginas | Combinaciones |
|---|---|---|---|---|
`;
for (const g of sorted) {
	const r = g.sample;
	md += `| ${g.sev} | ${r.type} | ${r.detail.replaceAll("|", "\\|")} | ${[...g.pages].slice(0, 6).join(", ")}${g.pages.size > 6 ? ` (+${g.pages.size - 6})` : ""} | ${[...g.combos].slice(0, 5).join(", ")}${g.combos.size > 5 ? ` (+${g.combos.size - 5})` : ""} |\n`;
}

writeFileSync(out, md);
console.log(`${out}: ${rows.length} hallazgos → ${groups.size} patrones (alta ${counts.alta}, media ${counts.media}, baja ${counts.baja})`);

if (shots.length) {
	const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Capturas visuales</title><body style="font-family:system-ui"><h1>Capturas con hallazgos (${shots.length})</h1>${shots
		.map(
			(f) =>
				`<figure style="display:inline-block;max-width:420px;margin:8px"><a href="${f}"><img src="${f}" style="width:100%;border:1px solid #ccc"></a><figcaption style="font:12px monospace">${f}</figcaption></figure>`,
		)
		.join("")}</body></html>`;
	writeFileSync(join(dirname(out), "visual-index.html"), html);
	console.log(`índice: ${join(dirname(out), "visual-index.html")} (${shots.length} capturas)`);
}
