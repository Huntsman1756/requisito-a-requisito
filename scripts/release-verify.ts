/**
 * release-verify — puerta posterior a `build:release` (F10, REL-2).
 *
 * Comprueba que el export en out/ es EXACTAMENTE la release estricta:
 *   1. out/datos/elegibilidad/bundle.json existe y su sha256 coincide con
 *      data/eligibility/bundle/eligibility-bundle.json (el que acaba de
 *      generar eligibility:build:release — sin pisarlo).
 *   2. TODAS las reglas del bundle tienen humanReview.status "approved".
 *   3. Hay más de 0 reglas incluidas.
 *   4. Hay al menos 20 programas (benefitSlug distintos) — D-12.
 *   5. FUENTE ÚNICA (ADR-050/G12): el conjunto de fichas /ayudas/<slug>/
 *      exportadas == benefitSlugs del bundle; nivel-1.json == ese mismo
 *      conjunto; y ningún HTML de out/ enlaza o nombra como ficha de
 *      nivel 1 un slug que no esté en el bundle (puede aparecer como
 *      catálogo de nivel 2 con enlace oficial, ADR-052).
 *
 * Falla cerrado: cualquier incumplimiento sale con código 1 y mensaje claro.
 *
 * Uso: npx tsx scripts/release-verify.ts [outDir] [bundleDir]
 */

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export interface ReleaseCheck {
	ok: boolean;
	errors: string[];
	rulesets: number;
	programas: number;
	noAprobadas: string[];
	shaOk: boolean;
}

const sha256 = (buf: Buffer) =>
	createHash("sha256").update(buf).digest("hex");

export function verifyRelease(
	outDir = "out",
	bundleDir = "data/eligibility/bundle",
): ReleaseCheck {
	const errors: string[] = [];
	const pubPath = join(outDir, "datos/elegibilidad/bundle.json");
	const srcPath = join(bundleDir, "eligibility-bundle.json");

	if (!existsSync(pubPath)) errors.push(`falta ${pubPath}`);
	if (!existsSync(srcPath)) errors.push(`falta ${srcPath}`);
	if (errors.length)
		return { ok: false, errors, rulesets: 0, programas: 0, noAprobadas: [], shaOk: false };

	const pub = readFileSync(pubPath);
	const src = readFileSync(srcPath);
	const shaOk = sha256(pub) === sha256(src);
	if (!shaOk)
		errors.push(
			`el bundle publicado en out/ NO coincide con el bundle estricto generado (sha256 distinto) — probablemente lo pisó un build normal`,
		);

	const bundle = JSON.parse(pub.toString("utf8")) as {
		rulesets: { benefitSlug: string; humanReview?: { status?: string } }[];
	};
	const rulesets = bundle.rulesets ?? [];
	if (rulesets.length === 0)
		errors.push("el bundle estricto no incluye ninguna regla (0)");

	const programas = new Set(rulesets.map((r) => r.benefitSlug)).size;
	if (programas < 20)
		errors.push(`solo ${programas} programas — el mínimo D-12 es 20`);

	const noAprobadas = rulesets
		.filter((r) => r.humanReview?.status !== "approved")
		.map((r) => r.benefitSlug);
	if (noAprobadas.length > 0)
		errors.push(
			`${noAprobadas.length} regla(s) sin humanReview=approved: ${noAprobadas.join(", ")}`,
		);

	// --- 5. Fuente única: el export solo publica lo que el bundle incluye ---
	const bundleSlugs = new Set(rulesets.map((r) => r.benefitSlug));

	const ayudasDir = join(outDir, "ayudas");
	if (!existsSync(ayudasDir)) {
		errors.push("falta out/ayudas/: no hay fichas exportadas");
	} else {
		const fichas = readdirSync(ayudasDir).filter(
			(d) =>
				statSync(join(ayudasDir, d)).isDirectory() &&
				existsSync(join(ayudasDir, d, "index.html")),
		);
		for (const s of fichas)
			if (!bundleSlugs.has(s))
				errors.push(`ficha fuera del bundle: /ayudas/${s}/ (regla no aprobada)`);
		for (const s of bundleSlugs)
			if (!fichas.includes(s))
				errors.push(`el bundle incluye ${s} pero falta su ficha /ayudas/${s}/`);

		// El listado /ayudas/ muestra exactamente una tarjeta por programa del
		// bundle (núcleo duro: ni reglas no aprobadas ni programas que faltan).
		const indexPath = join(ayudasDir, "index.html");
		if (!existsSync(indexPath)) {
			errors.push("falta out/ayudas/index.html (listado)");
		} else {
			const cards =
				readFileSync(indexPath, "utf8").match(/class="aid-card"/g) ?? [];
			if (cards.length !== bundleSlugs.size)
				errors.push(
					`/ayudas/ muestra ${cards.length} tarjetas; el bundle tiene ${bundleSlugs.size} programas`,
				);
		}
	}

	const nivel1Path = join(outDir, "datos/elegibilidad/nivel-1.json");
	if (!existsSync(nivel1Path)) {
		errors.push(`falta ${nivel1Path}`);
	} else {
		const n1 = JSON.parse(readFileSync(nivel1Path, "utf8")) as {
			items?: { slug?: string }[];
		};
		const n1Slugs = new Set(
			(n1.items ?? [])
				.map((i) => i.slug)
				.filter((s): s is string => typeof s === "string"),
		);
		for (const s of n1Slugs)
			if (!bundleSlugs.has(s))
				errors.push(`nivel-1.json lista ${s}, que no está en el bundle`);
		for (const s of bundleSlugs)
			if (!n1Slugs.has(s))
				errors.push(`nivel-1.json no lista ${s}, que sí está en el bundle`);
	}

	// Ningún HTML exportado enlaza una ficha de nivel 1 fuera del bundle.
	const htmlFiles: string[] = [];
	const walk = (dir: string) => {
		for (const f of readdirSync(dir, { withFileTypes: true })) {
			const p = join(dir, f.name);
			if (f.isDirectory()) walk(p);
			else if (f.name.endsWith(".html")) htmlFiles.push(p);
		}
	};
	if (existsSync(outDir)) walk(outDir);
	for (const file of htmlFiles) {
		const html = readFileSync(file, "utf8");
		for (const m of html.matchAll(/\/ayudas\/([a-z0-9][a-z0-9-]*)\//g)) {
			if (!bundleSlugs.has(m[1]))
				errors.push(
					`${file.slice(outDir.length + 1)}: enlace a ficha fuera del bundle /ayudas/${m[1]}/`,
				);
		}
	}

	return {
		ok: errors.length === 0,
		errors,
		rulesets: rulesets.length,
		programas,
		noAprobadas,
		shaOk,
	};
}

if (process.argv[1]?.endsWith("release-verify.ts")) {
	const res = verifyRelease(process.argv[2], process.argv[3]);
	console.log(
		`release-verify: ${res.rulesets} rulesets / ${res.programas} programas, sha256 ${res.shaOk ? "ok" : "DISTINTO"}`,
	);
	if (res.ok) {
		console.log("release-verify: OK — el export es la release estricta");
	} else {
		for (const e of res.errors) console.error(`  ✗ ${e}`);
		process.exit(1);
	}
}
