/**
 * review-apply.ts — F10-REV-1 / F10-FIX-1 (ADR-040)
 *
 * `npm run review:apply -- <hoja.md>` aplica la hoja de muestreo marcada por
 * Daniel sobre la ola a la que pertenece:
 *
 *   - La pertenencia sale de la PROPIA hoja: filas de la tabla «Tu turno»
 *     (primera celda = benefitSlug) o, en `lote-N.md`, sus cabeceras
 *     `## <slug>`. `verificacion-ola-N.md` solo comprueba que existe.
 *   - Marcas: `☑ OK ☐ KO` o `☐ OK ☑ KO` por fila (o `— ☑ OK`/`— ☑ KO` en las
 *     cabeceras de lote-N). Una fila con OK y KO a la vez cuenta como KO.
 *   - ≥2 OK de slugs DISTINTOS y 0 KO ⇒ `humanReview.status = approved` en
 *     todas las reglas de la ola. Cualquier KO ⇒ no se escribe nada.
 *   - Precedencia (evidence/muestreo-indice.json): si un slug aparece en
 *     varias hojas solo la vigente lo aprueba; aplicando una hoja anterior,
 *     esos slugs se saltan con aviso («se aprueba con <hoja>»).
 *   - Idempotente: las ya aprobadas se informan como `skipped`.
 *
 * `hoja.md` = `muestreo-ola-N.md` | `lote-N.md` (patrón de nombre obligatorio).
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

export interface ApplyResult {
	sheet: string;
	wave: string;
	waveSlugs: string[];
	okMarks: number;
	koMarks: number;
	approved: string[];
	skipped: string[];
	deferredTo: Record<string, string>; // slug → hoja vigente que manda
	action: "approved" | "nothing" | "error";
	reason?: string;
}

const MARKED = /[☑☒✓✔🗹]|\[[xX]\]/u;

/** Token → slug: quita backticks/negrita y el descriptor « (…)». */
function cellToSlug(cell: string): string {
	return cell
		.replace(/[*`]/g, "")
		.replace(/\s*\(.*$/, "")
		.trim();
}

/**
 * Slugs que una hoja declara suyos: filas cuya primera celda es un slug
 * conocido (muestreo-ola) o cabeceras `## <slug>` (lote).
 */
export function sheetSlugs(
	sheetText: string,
	knownSlugs: Set<string>,
): string[] {
	const found = new Set<string>();
	for (const line of sheetText.split(/\r?\n/)) {
		const h = line.match(/^##\s+([a-z0-9][a-z0-9-]*)\b/);
		if (h && knownSlugs.has(h[1])) found.add(h[1]);
		if (!line.trim().startsWith("|")) continue;
		const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
		if (!cells.length) continue;
		const slug = cellToSlug(cells[0]);
		if (knownSlugs.has(slug)) found.add(slug);
	}
	return [...found].sort();
}

/** Celdas marcadas por fila/cabecera: {slug, ok, ko}. OK+KO juntos ⇒ ko. */
export function parseMarks(
	sheetText: string,
): { slug: string; ok: boolean; ko: boolean }[] {
	const rows: { slug: string; ok: boolean; ko: boolean }[] = [];
	const hasMark = (t: string, m: "OK" | "KO") =>
		new RegExp(`(?:${MARKED.source})\\s*${m}`, "u").test(t);
	for (const line of sheetText.split(/\r?\n/)) {
		const h = line.match(/^##\s+([a-z0-9][a-z0-9-]*)\b(.*)$/);
		if (h) {
			const ok = hasMark(h[2], "OK");
			const ko = hasMark(h[2], "KO");
			if (ok || ko) rows.push({ slug: h[1], ok, ko });
			continue;
		}
		if (!line.trim().startsWith("|")) continue;
		const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
		if (cells.length < 2) continue;
		const slug = cellToSlug(cells[0]);
		const joined = cells.slice(1).join(" | ");
		const ok = hasMark(joined, "OK");
		const ko = hasMark(joined, "KO");
		if (ok || ko) rows.push({ slug, ok, ko });
	}
	return rows;
}

/** Índice de precedencia (muestreo-indice.json): slug → hoja vigente. */
export interface MuestreoIndice {
	hojas: {
		sheet: string;
		wave: string;
		order?: number;
		slugs: string[];
		vigenteSlugs: string[];
		deferredSlugs: { slug: string; a: string }[];
	}[];
	vigente: Record<string, string>; // slug → sheet path
	generatedAt?: string;
}

export function loadIndice(path = "evidence/muestreo-indice.json"): MuestreoIndice {
	if (!existsSync(path)) return { hojas: [], vigente: {} };
	return JSON.parse(readFileSync(path, "utf8"));
}

/** Ruta canónica relativa POSIX (para comparar con muestreo-indice.json). */
export function relSheet(p: string): string {
	return relative(process.cwd(), resolve(p)).split(sep).join("/");
}

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

export function applySheet(
	sheetPath: string,
	opts: {
		rulesDirs: string[];
		today?: string;
		indicePath?: string;
		sheetsDirText?: string; // para tests: texto alternativo de la hoja
	},
): ApplyResult {
	const date = opts.today ?? today();
	const res: ApplyResult = {
		sheet: sheetPath, wave: "", waveSlugs: [], okMarks: 0, koMarks: 0,
		approved: [], skipped: [], deferredTo: {}, action: "nothing",
	};
	// Dos formatos: `muestreo-ola-N.md` (necesita verificacion-ola-N.md en el
	// mismo directorio) y `lote-N.md` (el fichero es a la vez hoja e informe).
	const mOla = basename(sheetPath).match(/^muestreo-ola-(\d+)\.md$/);
	const mLote = basename(sheetPath).match(/^lote-(\d+)\.md$/);
	if (!mOla && !mLote) {
		res.action = "error";
		res.reason = `el nombre no es muestreo-ola-<N>.md ni lote-<N>.md: ${sheetPath}`;
		return res;
	}
	res.wave = mOla ? `ola-${mOla[1]}` : `lote-${mLote?.[1] ?? "?"}`;
	const verPath = mOla
		? join(dirname(sheetPath), `verificacion-ola-${mOla[1]}.md`)
		: sheetPath;
	if (!existsSync(verPath)) {
		res.action = "error";
		res.reason = `no existe ${verPath}: la verificación de la ola debe existir`;
		return res;
	}
	// Catálogo de slugs válidos (benefitSlug → ficheros de regla).
	const slugToFiles = new Map<string, string[]>();
	for (const dir of opts.rulesDirs) {
		if (!existsSync(dir)) continue;
		for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
			try {
				const rs = JSON.parse(readFileSync(join(dir, f), "utf8"));
				const list = slugToFiles.get(rs.benefitSlug) ?? [];
				list.push(join(dir, f));
				slugToFiles.set(rs.benefitSlug, list);
			} catch { /* fichero no parseable: no es un ruleset */ }
		}
	}
	const sheetText = opts.sheetsDirText ?? readFileSync(sheetPath, "utf8");
	res.waveSlugs = sheetSlugs(sheetText, new Set(slugToFiles.keys()));
	if (res.waveSlugs.length === 0) {
		res.action = "error";
		res.reason = "la hoja no contiene ningún slug conocido en su tabla ni cabeceras";
		return res;
	}

	const marks = parseMarks(sheetText);
	const okSlugs = [...new Set(marks.filter((x) => x.ok && !x.ko).map((x) => x.slug))];
	const koSlugs = marks.filter((x) => x.ko);
	res.okMarks = okSlugs.length;
	res.koMarks = koSlugs.length;

	if (marks.length === 0) {
		res.reason = "sin marcas: no se hace nada";
		return res;
	}
	for (const m of marks) {
		if (!res.waveSlugs.includes(m.slug)) {
			res.action = "error";
			res.reason = `marca sobre una ayuda que no pertenece a la ola: ${m.slug}`;
			return res;
		}
	}
	if (koSlugs.length > 0) {
		res.reason = `${koSlugs.length} marca(s) KO — se reabre la ola entera, no se aprueba nada`;
		return res;
	}
	if (okSlugs.length < 2) {
		res.reason = `solo ${okSlugs.length} OK — hacen falta 2 de slugs distintos (ADR-040)`;
		return res;
	}
	// Precedencia: un slug de esta hoja cuya vigente sea otra hoja más reciente
	// se salta aquí y se aprueba allá.
	const indice = loadIndice(opts.indicePath);
	const me = relSheet(sheetPath);
	const vigenteSlugs = res.waveSlugs.filter(
		(s) => !indice.vigente[s] || relSheet(indice.vigente[s]) === me,
	);
	const deferred = res.waveSlugs.filter(
		(s) => indice.vigente[s] && relSheet(indice.vigente[s]) !== me,
	);
	for (const s of deferred) res.deferredTo[s] = indice.vigente[s];

	for (const slug of vigenteSlugs) {
		for (const file of slugToFiles.get(slug) ?? []) {
			const rs = JSON.parse(readFileSync(file, "utf8"));
			const hr = rs.humanReview;
			if (hr.status === "approved") {
				res.skipped.push(slug);
				continue; // idempotente
			}
			rs.humanReview = {
				status: "approved",
				by: "daniel",
				at: date,
				notes: `muestreo ADR-040; revisadas: ${okSlugs.join(", ")}; hoja: ${sheetPath}`,
			};
			writeFileSync(file, `${JSON.stringify(rs, null, "\t")}\n`);
			res.approved.push(`${slug}@${rs.rulesVersion}`);
		}
	}
	res.action = res.approved.length > 0 ? "approved" : "nothing";
	if (res.approved.length === 0 && deferred.length === 0)
		res.reason = "todo ya estaba aprobado (idempotente)";
	if (res.approved.length === 0 && deferred.length > 0)
		res.reason = "todos los slugs de esta hoja mandan en hojas más recientes";
	return res;
}

// --- CLI ---
if (process.argv[1]?.endsWith("review-apply.ts")) {
	const sheet = process.argv.slice(2).find((a) => !a.startsWith("--"));
	if (!sheet) {
		console.error("uso: npm run review:apply -- <hoja.md>");
		process.exit(1);
	}
	const r = applySheet(sheet, {
		rulesDirs: [join(process.cwd(), "data", "eligibility", "rules")],
	});
	console.log(
		`review:apply ${r.sheet} → ${r.action}` +
			(r.reason ? ` (${r.reason})` : ""),
	);
	if (r.approved.length)
		console.log(`  aprobadas: ${r.approved.join(", ")}`);
	if (r.skipped.length)
		console.log(`  ya aprobadas: ${[...new Set(r.skipped)].join(", ")}`);
	for (const [slug, dest] of Object.entries(r.deferredTo))
		console.log(`  ${slug}: se aprueba con ${dest}`);
	process.exit(r.action === "error" ? 1 : 0);
}
