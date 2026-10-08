/**
 * muestreo-indice.ts — F10-FIX-1 (ADR-040)
 *
 * `npm run muestreo:indice` regenera `evidence/muestreo-indice.json`: el índice
 * EXPLÍCITO de qué hoja aprueba a qué regla.
 *
 *   - Escanea `evidence/*\/muestreo-ola-N.md` y `evidence/*\/lote-N.md`.
 *   - Los slugs de cada hoja salen de la propia hoja (tabla «Tu turno» o
 *     cabeceras `## slug`), nunca del informe de verificación.
 *   - Precedencia explícita por número de ola (no por fechas): lote-N tiene
 *     orden -1 (más antiguo), muestreo-ola-N orden N; la hoja de orden mayor
 *     manda sobre los slugs que comparte con anteriores.
 *   - `vigente[slug] = <hoja>` es lo que usa review:apply para decidir quién
 *     aprueba qué.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sheetSlugs } from "./review-apply";

const root = process.cwd();

interface Hoja {
	sheet: string;
	wave: string;
	order: number;
	slugs: string[];
	vigenteSlugs: string[];
	deferredSlugs: { slug: string; a: string }[];
}

function knownSlugs(): Set<string> {
	const set = new Set<string>();
	for (const f of readdirSync(join(root, "data/eligibility/rules")).filter(
		(x) => x.endsWith(".json") && !x.includes("__"),
	)) {
		try {
			set.add(
				JSON.parse(readFileSync(join(root, "data/eligibility/rules", f), "utf8"))
					.benefitSlug,
			);
		} catch { /* no es ruleset */ }
	}
	return set;
}

export function buildIndice(): {
	hojas: Hoja[];
	vigente: Record<string, string>;
	generatedAt: string;
} {
	const known = knownSlugs();
	const hojas: Hoja[] = [];
	const evDir = join(root, "evidence");
	for (const dir of readdirSync(evDir).filter((d) =>
		existsSync(join(evDir, d)) &&
		statSync(join(evDir, d)).isDirectory(),
	)) {
		for (const f of readdirSync(join(evDir, dir))) {
			// Las olas pueden partirse con sufijo de letra (ola-12a…12e): el orden
			// es el número de la ola madre (las partes mandan igual que ella).
			const mOla = f.match(/^muestreo-ola-(\d+)([a-z]?)\.md$/);
			const mLote = f.match(/^lote-(\d+)\.md$/);
			if (!mOla && !mLote) continue;
			const sheet = `evidence/${dir}/${f}`;
			const text = readFileSync(join(evDir, dir, f), "utf8");
			hojas.push({
				sheet,
				wave: mOla ? `ola-${mOla[1]}${mOla[2]}` : `lote-${mLote?.[1] ?? "?"}`,
				// Orden explícito: los lotes son más antiguos que cualquier ola.
				order: mOla ? Number(mOla[1]) : -1,
				slugs: sheetSlugs(text, known),
				vigenteSlugs: [],
				deferredSlugs: [],
			});
		}
	}
	hojas.sort((a, b) => a.order - b.order || a.sheet.localeCompare(b.sheet));

	const vigente: Record<string, string> = {};
	for (const h of hojas) for (const s of h.slugs) vigente[s] = h.sheet;
	for (const h of hojas) {
		h.vigenteSlugs = h.slugs.filter((s) => vigente[s] === h.sheet);
		h.deferredSlugs = h.slugs
			.filter((s) => vigente[s] !== h.sheet)
			.map((s) => ({ slug: s, a: vigente[s] }));
	}
	return {
		hojas,
		vigente,
		generatedAt: new Date().toISOString().slice(0, 10),
	};
}

/**
 * Reescribe el bloque «Cómo marcarla» de cada hoja para que Daniel vea cuántas
 * reglas aprueba esa hoja y cuáles mandan en otra más reciente. El bloque va
 * entre `**Cómo marcarla` y el primer doble salto de línea tras él.
 */
export function updateSheetHeaders(idx: ReturnType<typeof buildIndice>): string[] {
	const touched: string[] = [];
	for (const h of idx.hojas) {
		const abs = join(root, h.sheet);
		if (!existsSync(abs)) continue;
		const text = readFileSync(abs, "utf8");
		const isLote = /^lote-\d+\.md$/.test(h.sheet.split("/").pop() ?? "");
		const markHow = isLote
			? "al final de cada cabecera `## <ayuda>` añade `— ☑ OK` o `— ☑ KO <motivo>`"
			: "en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`";
		const deferred = h.deferredSlugs.length
			? `\nEn otra hoja se aprueban: ${h.deferredSlugs.map((d) => `${d.slug} → ${d.a}`).join("; ")}.`
			: "";
		const block =
			`**Cómo marcarla (Daniel):** ${markHow}.\n` +
			`Esta hoja aprueba **${h.vigenteSlugs.length} regla(s)**: ${h.vigenteSlugs.join(", ")}.${deferred}\n` +
			`Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.\n` +
			`Cuando acabes, ejecuta \`npm run review:apply -- ${h.sheet}\` — es la única vía que pone humanReview=approved.`;
		// Sustituye el bloque «Cómo marcarla» existente o lo inserta tras el
		// primer párrafo de cabecera.
		const re = /\*\*Cómo marcarla \(Daniel\):\*\*[\s\S]*?(?=\n\n)/;
		const next = re.test(text)
			? text.replace(re, block)
			: text.replace(/\n\n/, `\n\n${block}\n\n`);
		if (next !== text) {
			writeFileSync(abs, next);
			touched.push(h.sheet);
		}
	}
	return touched;
}

if (process.argv[1]?.endsWith("muestreo-indice.ts")) {
	const idx = buildIndice();
	writeFileSync(
		join(root, "evidence", "muestreo-indice.json"),
		`${JSON.stringify(idx, null, 2)}\n`,
	);
	const touched = updateSheetHeaders(idx);
	console.log(`muestreo-indice.json: ${idx.hojas.length} hojas, ${Object.keys(idx.vigente).length} slugs`);
	for (const h of idx.hojas) {
		console.log(
			`  ${h.sheet}: ${h.vigenteSlugs.length} vigentes` +
				(h.deferredSlugs.length
					? ` · difieren a ${h.deferredSlugs.length} (${h.deferredSlugs.map((d) => d.slug).join(", ")})`
					: ""),
		);
	}
}
