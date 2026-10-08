/**
 * qa-strict.ts — F10-QA: ensayo de la release estricta por la RUTA REAL.
 *
 * 1. Copia data/eligibility/rules → <scratch>/rules.
 * 2. Marca las 2 primeras marcas de cada hoja vigente de
 *    evidence/muestreo-indice.json como ☑ OK (SOBRE LA COPIA — nunca toca
 *    las reglas reales ni escribe humanReview en ellas).
 * 3. Aplica cada hoja con applySheet (la misma función de `review:apply`).
 * 4. Ejecuta buildEligibility --strict con rulesDir=<scratch>/rules y
 *    escribe el bundle + manifest en <scratch>/bundle/.
 *
 * Uso: npx tsx scripts/qa-strict.ts [scratchDir]   (por defecto
 *      F:/Temp/datawardsmadrid-cierre/strict)
 *
 * Las aprobaciones son SIMULADAS — se declara así en el informe (regla 4.12).
 * El resultado lo usa el flujo real: copiar bundle+manifest a
 * data/eligibility/bundle/, `npm run datos:public`, `npm run build`.
 */

import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildEligibility } from "./eligibility-build";
import { applySheet, type MuestreoIndice } from "./review-apply";

const root = process.cwd();
const positional = process.argv.filter((a) => !a.startsWith("--"));
const scratch = positional[2] ?? "F:/Temp/datawardsmadrid-cierre/strict";
// --ko=<fichero de hoja>: simula un KO en esa hoja (todas las demás reciben
// 2 OK); el informe debe declararlo como simulado (regla 4.12).
const koSheet = process.argv
	.find((a) => a.startsWith("--ko="))
	?.slice("--ko=".length);
const rulesOut = join(scratch, "rules");
const bundleOut = join(scratch, "bundle");

const indice = JSON.parse(
	readFileSync(join(root, "evidence/muestreo-indice.json"), "utf8"),
) as MuestreoIndice;

cpSync(join(root, "data/eligibility/rules"), rulesOut, { recursive: true });

// Igual que markFirstN del test: solo filas de tabla / cabeceras ##.
function mark(text: string, ko: boolean): string {
	let k = 0;
	const out = text
		.split("\n")
		.map((line) => {
			if (/^\|.*☐ OK ☐ KO/.test(line)) {
				k += 1;
				return ko && k === 1
					? line.replace("☐ OK ☐ KO", "☐ OK ☑ KO")
					: k <= 2
						? line.replace("☐ OK ☐ KO", "☑ OK ☐ KO")
						: line;
			}
			return line;
		})
		.join("\n");
	if (k > 0) return out;
	const all = new Set(indice.hojas.flatMap((h) => h.slugs));
	return text.replace(/^##\s+([a-z0-9][a-z0-9-]*)\b(.*)$/gm, (line, slug, rest) => {
		if (k < 2 && all.has(slug) && !/[☑☒✓]/.test(rest)) {
			k += 1;
			return `## ${slug}${rest} — ☑ OK`;
		}
		return line;
	});
}

for (const h of indice.hojas) {
	// Hoja sin vigentes (todos sus slugs mandan en una más reciente, p. ej.
	// re-muestreo ola-12): no se aplica, pero queda trazada.
	if (h.vigenteSlugs.length === 0) {
		console.log(`${h.sheet}: sin vigentes — todos sus slugs mandan en otra hoja`);
		continue;
	}
	const isKo = koSheet !== undefined && h.sheet.endsWith(`/${koSheet}`);
	const text = mark(readFileSync(join(root, h.sheet), "utf8"), isKo);
	const r = applySheet(join(root, h.sheet), {
		rulesDirs: [rulesOut],
		today: "2026-10-08",
		sheetsDirText: text,
	});
	if (r.action !== "approved") {
		if (isKo) {
			console.log(`${h.sheet}: ${r.action} — ${r.reason}`);
			continue;
		}
		console.error(`${h.sheet}: ${r.action} — ${r.reason}`);
		process.exit(1);
	}
	console.log(`${h.sheet}: ${r.approved.length} reglas aprobadas en la copia`);
}

const res = await buildEligibility({
	rulesDir: rulesOut,
	sourcesDir: join(root, "data/eligibility/sources"),
	catalogDir: join(root, "data/catalog/benefits"),
	parametersPath: join(root, "data/eligibility/parameters.json"),
	registry: JSON.parse(
		readFileSync(
			join(root, "data/eligibility/sources/registry.json"),
			"utf8",
		),
	),
	outDir: bundleOut,
	today: "2026-10-08",
	strictHumanReview: true,
});
console.log(
	`strict: ${res.included.length} incluidas, ${res.excluded.length} excluidas, digest ${res.bundleDigest.slice(0, 16)}…`,
);
if (res.excluded.length > 0) {
	console.error(
		`excluidas: ${res.excluded.map((e) => (typeof e === "string" ? e : (e as { slug?: string }).slug)).join(", ")}`,
	);
	// Con --ko se espera que la hoja KO deje sus reglas fuera: no es fallo.
	if (!koSheet) process.exit(1);
}
mkdirSync(bundleOut, { recursive: true });
console.log(`bundle → ${bundleOut}`);
