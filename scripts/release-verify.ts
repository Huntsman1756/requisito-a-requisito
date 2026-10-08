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
 *
 * Falla cerrado: cualquier incumplimiento sale con código 1 y mensaje claro.
 *
 * Uso: npx tsx scripts/release-verify.ts [outDir] [bundleDir]
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
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
