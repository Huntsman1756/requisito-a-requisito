/**
 * review-apply.ts — F10-REV-1
 *
 * `npm run review:apply -- <hoja.md>` aplica la hoja de muestreo que Daniel
 * marcó (`muestreo-ola-N.md`, en `evidence/<fecha>-Fx/`):
 *
 * - La ola se define por `verificacion-ola-N.md` en el MISMO directorio: los
 *   slugs de la ola son los tokens `en-código` que coinciden con el benefitSlug
 *   de un RuleSet de `data/eligibility/rules/` o `rules-hold/`.
 * - En cada fila de la tabla «Tu turno» Daniel deja marcado `☑ OK` o `☑ KO`
 *   (también se aceptan `☒`, `✓`, `✔`, `[x]`/`[X]` delante de OK/KO).
 * - Hoja vacía (sin marcas) ⇒ no hace nada, exit 0.
 * - Una o más KO ⇒ no hace nada, exit 0 (la ola se reabre; decisión humana).
 * - ≥2 OK y ninguna KO ⇒ aprueba la ola ENTERA: `humanReview.status =
 *   "approved", by: "daniel", at: <hoy>` en todos los RuleSets de la ola
 *   (incluidas las versiones con vigencia solapada de un mismo slug).
 * - Idempotente: una segunda corrida no cambia nada.
 * - Un slug marcado que no pertenece a la ola ⇒ error (exit 1, sin escrituras).
 *
 * Solo Daniel aprueba: este script es la única vía mecánica; jamás escribe
 * `approved` sin leer la marca de una hoja (ADR-040/044).
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface ApplyResult {
	sheet: string;
	wave: string;
	waveSlugs: string[];
	okMarks: number;
	koMarks: number;
	approved: string[];
	skipped: string[];
	action: "approved" | "nothing" | "error";
	reason?: string;
}

const MARKED = /[☑☒✓✔🗹]|\[[xX]\]/u;

/** Celdas marcadas por fila: {slug, ok, ko} desde la tabla de la hoja. */
export function parseMarks(sheetText: string): { slug: string; ok: boolean; ko: boolean }[] {
		const rows: { slug: string; ok: boolean; ko: boolean }[] = [];
	for (const line of sheetText.split(/\r?\n/)) {
		// Marcas en cabecera de programa (formato lote): `## slug … — ☑ OK`.
		const h = line.match(/^##\s+([a-z0-9][a-z0-9-]*)\b(.*)$/);
		if (h) {
			const ok = new RegExp(`(?:${MARKED.source})\\s*OK`).test(h[2]);
			const ko = new RegExp(`(?:${MARKED.source})\\s*KO`).test(h[2]);
			if (ok || ko) rows.push({ slug: h[1], ok, ko });
			continue;
		}
		if (!line.trim().startsWith("|")) continue;
		const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
		if (cells.length < 2) continue;
		// La última celda (o cualquiera) puede llevar «☐ OK ☐ KO» con marcas.
		const joined = cells.join(" | ");
		const ok = new RegExp(`(?:${MARKED.source})\\s*OK`).test(joined);
		const ko = new RegExp(`(?:${MARKED.source})\\s*KO`).test(joined);
		if (!ok && !ko) continue;
		// Slug = primera celda hasta « (» o fin.
		const slug = cells[0].replace(/\*\*/g, "").split(" (")[0].trim();
		rows.push({ slug, ok, ko });
	}
	return rows;
}

/** Slugs de la ola = tokens `code` del verificacion-ola-N.md que son slugs de RuleSet. */
export function waveSlugs(verificacionText: string, allSlugs: Set<string>): string[] {
	const found = new Set<string>();
	for (const m of verificacionText.matchAll(/`([a-z0-9][a-z0-9-]*)`/g)) {
		if (allSlugs.has(m[1])) found.add(m[1]);
	}
	return [...found].sort();
}

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

export function applySheet(
	sheetPath: string,
	opts: { rulesDirs: string[]; today?: string },
): ApplyResult {
	const date = opts.today ?? today();
	const res: ApplyResult = {
		sheet: sheetPath, wave: "", waveSlugs: [], okMarks: 0, koMarks: 0,
		approved: [], skipped: [], action: "nothing",
	};
	// Dos formatos: `muestreo-ola-N.md` (ola definida por verificacion-ola-N.md)
	// y `lote-N.md` (el fichero es a la vez hoja e informe: la ola son sus
	// cabeceras `## <slug>`; Daniel marca `— ☑ OK` / `— ☑ KO` en la cabecera).
	const mOla = sheetPath.match(/muestreo-ola-(\d+)\.md$/);
	const mLote = sheetPath.match(/lote-(\d+)\.md$/);
	if (!mOla && !mLote) {
		res.action = "error";
		res.reason = `el nombre no es muestreo-ola-<N>.md ni lote-<N>.md: ${sheetPath}`;
		return res;
	}
	res.wave = mOla ? `ola-${mOla[1]}` : `lote-${mLote![1]}`;
	const verPath = mOla
		? join(dirname(sheetPath), `verificacion-ola-${mOla[1]}.md`)
		: sheetPath;
	if (!existsSync(verPath)) {
		res.action = "error";
		res.reason = `no existe ${verPath}: la pertenencia a la ola sale de ahí`;
		return res;
	}
	// Catálogo de slugs válidos (benefitSlug → ficheros).
	const slugToFiles = new Map<string, string[]>();
	for (const dir of opts.rulesDirs) {
		if (!existsSync(dir)) continue;
		for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
			const p = join(dir, f);
			try {
				const rs = JSON.parse(readFileSync(p, "utf8"));
				const list = slugToFiles.get(rs.benefitSlug) ?? [];
				list.push(p);
				slugToFiles.set(rs.benefitSlug, list);
			} catch { /* fichero no parseable: no es un ruleset */ }
		}
	}
	const verText = readFileSync(verPath, "utf8");
	res.waveSlugs = mOla
		? waveSlugs(verText, new Set(slugToFiles.keys()))
		: // lote: las cabeceras `## <slug>` del propio informe
			[...verText.matchAll(/^##\s+([a-z0-9][a-z0-9-]*)/gm)]
				.map((x) => x[1])
				.filter((s) => slugToFiles.has(s))
				.sort();

	const marks = parseMarks(readFileSync(sheetPath, "utf8"));
	res.okMarks = marks.filter((x) => x.ok).length;
	res.koMarks = marks.filter((x) => x.ko).length;

	// Regla ajena a la ola ⇒ error antes de tocar nada.
	const foreign = marks.filter((x) => !res.waveSlugs.includes(x.slug));
	if (foreign.length > 0) {
		res.action = "error";
		res.reason = `marcas sobre reglas ajenas a la ola ${res.wave}: ${foreign.map((f) => f.slug).join(", ")}`;
		return res;
	}
	if (res.koMarks > 0) {
		res.reason = `${res.koMarks} KO: la ola se reabre, nada se aprueba`;
		return res;
	}
	if (res.okMarks < 2) {
		res.reason = res.okMarks === 0 ? "hoja sin marcas" : "1 solo OK: se necesitan ≥2 (muestra de 2 por ola)";
		return res;
	}

	for (const slug of res.waveSlugs) {
		for (const file of slugToFiles.get(slug) ?? []) {
			const rs = JSON.parse(readFileSync(file, "utf8"));
			const hr = rs.humanReview ?? {};
			if (hr.status === "approved") {
				res.skipped.push(slug);
				continue; // idempotente
			}
			rs.humanReview = { status: "approved", by: "daniel", at: date };
			writeFileSync(file, `${JSON.stringify(rs, null, "\t")}\n`);
			res.approved.push(`${slug}@${rs.rulesVersion}`);
		}
	}
	res.action = res.approved.length > 0 ? "approved" : "nothing";
	if (res.approved.length === 0) res.reason = "todo ya estaba aprobado (idempotente)";
	return res;
}

if (process.argv[1]?.endsWith("review-apply.ts") || process.argv[1]?.endsWith("review-apply.js")) {
	const sheet = process.argv.slice(2).find((a) => !a.startsWith("--"));
	if (!sheet) {
		console.error("uso: npm run review:apply -- evidence/<fecha>-Fx/muestreo-ola-<N>.md");
		process.exit(2);
	}
	const r = applySheet(sheet, {
		rulesDirs: ["data/eligibility/rules", "data/eligibility/rules-hold"],
	});
	console.log(`ola ${r.wave || "?"}: ${r.action}${r.reason ? ` — ${r.reason}` : ""}`);
	if (r.approved.length) console.log(`  aprobadas: ${r.approved.join(", ")}`);
	if (r.skipped.length) console.log(`  ya estaban: ${r.skipped.join(", ")}`);
	process.exit(r.action === "error" ? 1 : 0);
}
