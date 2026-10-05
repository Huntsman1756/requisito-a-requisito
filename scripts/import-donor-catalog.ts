/**
 * import-donor-catalog.ts — F0-9 (docs/13 §2)
 *
 * Importa el catálogo de la-ayuda en un commit fijado, leyendo con
 * `git show` (nunca el working tree del donante). Filtro:
 *   ámbito   = scopeRegion "madrid"  |  scopeLevel "state" sin residencia
 *              incompatible con Madrid
 *   calidad  = status "active" && reviewStatus "revisada"
 *   exclusión= type "tax_deduction"
 * Los no vigentes de Madrid salen aparte como pistas (leads.json).
 *
 * Salida (determinista: mismo commit ⇒ mismos bytes):
 *   data/catalog/benefits/<slug>.json · leads.json · provenance.json
 *
 * Uso: npm run catalog:import -- --donor F:\_Proyectos\la-ayuda --commit <sha>
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";

const BENEFITS_DIR = "src/content/benefits";
const REGION_MADRID = "madrid";

// Campos que se conservan de la ficha del donante (subconjunto de
// src/content/types.ts). Solo lo que el producto necesita para el nivel 2.
const KEEP_FIELDS = [
	"title",
	"displayTitle",
	"summary",
	"category",
	"type",
	"scopeLevel",
	"scopeRegion",
	"targetGroups",
	"eligibilityFactors",
	"requirementsText",
	"documentsNeeded",
	"applicationWindow",
	"managingBody",
	"officialSourceUrl",
	"officialSourceLabel",
	"estimatedValueText",
	"whyItMatters",
	"lastReviewedAt",
	"referencePeriod",
	"applicationStatus",
	"availability",
	"status",
	"reviewStatus",
] as const;

interface ImportOptions {
	donor: string;
	commit: string;
	outDir: string;
}

interface ImportResult {
	imported: number;
	leads: number;
	excluded: number;
}

function git(donor: string, args: string[]): Buffer {
	return execFileSync("git", ["-C", donor, ...args], { maxBuffer: 64 << 20 });
}

function sha256(buf: Buffer): string {
	return createHash("sha256").update(buf).digest("hex");
}

function frontmatter(raw: string): Record<string, unknown> | null {
	const m = raw.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return null;
	return (load(m[1]) ?? {}) as Record<string, unknown>;
}

function sortKeys(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(sortKeys);
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([k, v]) => [k, sortKeys(v)]),
		);
	}
	return value;
}

function residencyRegions(fm: Record<string, unknown>): string[] {
	const ef = fm.eligibilityFactors as Record<string, unknown> | undefined;
	const rr = ef?.residencyRegion;
	return Array.isArray(rr) ? rr.filter((x): x is string => typeof x === "string") : [];
}

function inMadridScope(fm: Record<string, unknown>): boolean {
	if (fm.scopeRegion === REGION_MADRID) return true;
	if (fm.scopeLevel !== "state") return false;
	// Estatal con residencia exigible fuera de Madrid => incompatible.
	const rr = residencyRegions(fm);
	if (rr.length > 0 && !rr.includes(REGION_MADRID) && !rr.includes("state")) {
		return false;
	}
	return true;
}

export function importDonorCatalog(opts: ImportOptions): ImportResult {
	const { donor, commit, outDir } = opts;

	const listing = git(donor, [
		"ls-tree",
		"-r",
		"--name-only",
		commit,
		"--",
		BENEFITS_DIR,
	])
		.toString("utf8")
		.split("\n")
		.filter((p) => p.endsWith(".md"));

	const commitDate = git(donor, [
		"show",
		"-s",
		"--format=%cI",
		commit,
	]).toString("utf8").trim();
	let repoUrl = "";
	try {
		repoUrl = git(donor, ["config", "--get", "remote.origin.url"])
			.toString("utf8")
			.trim();
	} catch {
		repoUrl = "";
	}

	mkdirSync(join(outDir, "benefits"), { recursive: true });

	const provenanceFiles: Record<string, { path: string; sha256: string }> = {};
	const leads: Array<Record<string, unknown>> = [];
	let imported = 0;
	let excluded = 0;

	for (const path of listing.sort()) {
		const bytes = git(donor, ["show", `${commit}:${path}`]);
		const fm = frontmatter(bytes.toString("utf8"));
		const slug = path.slice(BENEFITS_DIR.length + 1, -3);
		if (!fm) {
			excluded++;
			continue;
		}
		const vigente = fm.status === "active" && fm.reviewStatus === "revisada";
		const scope = inMadridScope(fm);
		const fiscal = fm.type === "tax_deduction";

		if (vigente && scope && !fiscal) {
			const ficha: Record<string, unknown> = { slug };
			for (const k of KEEP_FIELDS) {
				if (fm[k] !== undefined) ficha[k] = fm[k];
			}
			writeFileSync(
				join(outDir, "benefits", `${slug}.json`),
				`${JSON.stringify(sortKeys(ficha), null, 2)}\n`,
			);
			provenanceFiles[slug] = { path, sha256: sha256(bytes) };
			imported++;
		} else if (fm.scopeRegion === REGION_MADRID && !vigente) {
			leads.push(
				sortKeys({
					slug,
					title: fm.title ?? null,
					category: fm.category ?? null,
					type: fm.type ?? null,
					status: fm.status ?? null,
					reviewStatus: fm.reviewStatus ?? null,
					officialSourceUrl: fm.officialSourceUrl ?? null,
					path,
					sha256: sha256(bytes),
				}) as Record<string, unknown>,
			);
		} else {
			excluded++;
		}
	}

	writeFileSync(
		join(outDir, "leads.json"),
		`${JSON.stringify(
			sortKeys({ leads: leads.sort((a, b) => String(a.slug).localeCompare(String(b.slug))) }),
			null,
			2,
		)}\n`,
	);

	writeFileSync(
		join(outDir, "provenance.json"),
		`${JSON.stringify(
			sortKeys({
				donor,
				repoUrl: repoUrl || null,
				commit,
				commitDate,
				importedAt: commitDate,
				files: provenanceFiles,
			}),
			null,
			2,
		)}\n`,
	);

	return { imported, leads: leads.length, excluded };
}

// --- CLI ---------------------------------------------------------------------

function argValue(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1] && process.argv[1].endsWith("import-donor-catalog.ts")) {
	const donor = argValue("donor");
	const commit = argValue("commit");
	const outDir = argValue("out") ?? join(process.cwd(), "data", "catalog");
	if (!donor || !commit) {
		console.error(
			"uso: tsx scripts/import-donor-catalog.ts --donor <ruta> --commit <sha> [--out <dir>]",
		);
		process.exit(2);
	}
	const r = importDonorCatalog({ donor, commit, outDir });
	console.log(
		`catalog:import → ${r.imported} importadas · ${r.leads} pistas · ${r.excluded} excluidas → ${outDir}`,
	);
}
