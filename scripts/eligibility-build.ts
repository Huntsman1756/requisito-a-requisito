/**
 * eligibility-build.ts — F1-5 (docs/11 §1)
 *
 * Ejecuta eligibility:validate y emite:
 *   outDir/eligibility-bundle.json   rulesets válidos + parámetros + metas de fuentes
 *   outDir/manifest.json             digest del bundle (contenido, no fecha)
 *   outDir/eligibility-report.json   incluidas / excluidas con códigos de gate
 *
 * Determinista: mismos datos ⇒ mismos bytes ⇒ mismo bundleDigest.
 * Un RuleSet con errores de gate NUNCA entra en el bundle (fail-closed).
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	parametersSchema,
	sourceSnapshotSchema,
} from "../src/lib/eligibility-engine/schema";
import {
	type ValidateOptions,
	validateEligibility,
} from "./eligibility-validate";

export interface BuildOptions extends ValidateOptions {
	outDir: string;
}

export interface BuildResult {
	ok: boolean;
	included: string[];
	excluded: { slug: string; codes: string[] }[];
	bundleDigest: string;
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

export function buildEligibility(opts: BuildOptions): BuildResult {
	const v = validateEligibility(opts);
	const errorsBySlug = new Map<string, string[]>();
	for (const e of v.errors) {
		errorsBySlug.set(e.ruleset, [...(errorsBySlug.get(e.ruleset) ?? []), e.code]);
	}
	// G1: ficheros que no parsean aparecen como errores con su nombre de fichero;
	// no hay ruleset que incluir para ellos.
	const g12 = (rs: (typeof v.rulesets)[number]): boolean => {
		if (rs.verification?.status !== "ok") return false;
		if (!rs.verification.report) return false;
		// El informe debe existir en el repo (evidence/…).
		try {
			return existsSync(join(process.cwd(), rs.verification.report));
		} catch {
			return false;
		}
	};
	const included = v.rulesets.filter(
		(rs) => !errorsBySlug.has(rs.benefitSlug) && g12(rs),
	);
	const g12Out = v.rulesets
		.filter((rs) => !errorsBySlug.has(rs.benefitSlug) && !g12(rs))
		.map((rs) => rs.benefitSlug);
	if (g12Out.length > 0) {
		console.log(
			`eligibility:build · G12 fuera del bundle (sin verification ok): ${g12Out.join(", ")}`,
		);
	}
	const excluded = [
		...new Set([...errorsBySlug.keys(), ...g12Out]),
	]
		.sort()
		.map((slug) => ({
			slug,
			codes: [
				...new Set([
					...(errorsBySlug.get(slug) ?? []),
					...(g12Out.includes(slug) ? ["ELIG_G12_NO_VERIFICATION"] : []),
				]),
			].sort(),
		}));

	const parameters = parametersSchema.parse(
		JSON.parse(readFileSync(opts.parametersPath, "utf8")),
	);

	const sourceIds = new Set(included.flatMap((rs) => rs.sources.map((s) => s.id)));
	const sources = [...sourceIds].sort().map((id) => {
		const meta = sourceSnapshotSchema.parse(
			JSON.parse(readFileSync(join(opts.sourcesDir, `${id}.json`), "utf8")),
		);
		return {
			id: meta.id,
			url: meta.url,
			sha256: meta.sha256,
			textSha256: meta.textSha256,
			contentType: meta.contentType,
			rank: meta.rank,
		};
	});

	const bundle = {
		bundleVersion: 1,
		referenceDate: opts.today,
		rulesets: included
			.slice()
			.sort((a, b) => a.benefitSlug.localeCompare(b.benefitSlug)),
		parameters,
		sources,
	};
	const bundleJson = `${JSON.stringify(sortKeys(bundle), null, 2)}\n`;
	const bundleDigest = createHash("sha256").update(bundleJson, "utf8").digest("hex");

	mkdirSync(opts.outDir, { recursive: true });
	writeFileSync(join(opts.outDir, "eligibility-bundle.json"), bundleJson);
	writeFileSync(
		join(opts.outDir, "manifest.json"),
		`${JSON.stringify(
			sortKeys({
				bundleDigest,
				generatedAt: new Date().toISOString(),
				included: included.map((r) => r.benefitSlug),
				excluded,
				warnings: v.warnings.length,
			}),
			null,
			2,
		)}\n`,
	);
	writeFileSync(
		join(opts.outDir, "eligibility-report.json"),
		`${JSON.stringify(
			sortKeys({
				included: included.map((r) => r.benefitSlug),
				excluded,
				errors: v.errors,
				warnings: v.warnings,
			}),
			null,
			2,
		)}\n`,
	);

	return { ok: v.ok, included: included.map((r) => r.benefitSlug), excluded, bundleDigest };
}

// --- CLI ------------------------------------------------------------------------

function argValue(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1]?.endsWith("eligibility-build.ts")) {
	const root = process.cwd();
	const r = buildEligibility({
		rulesDir: argValue("rules-dir") ?? join(root, "data", "eligibility", "rules"),
		sourcesDir:
			argValue("sources-dir") ?? join(root, "data", "eligibility", "sources"),
		catalogDir:
			argValue("catalog-dir") ?? join(root, "data", "catalog", "benefits"),
		parametersPath:
			argValue("parameters") ??
			join(root, "data", "eligibility", "parameters.json"),
		registry: JSON.parse(
			readFileSync(
				join(root, "data", "eligibility", "sources", "registry.json"),
				"utf8",
			),
		),
		outDir: argValue("out") ?? join(root, "data", "eligibility", "bundle"),
		today: argValue("today") ?? new Date().toISOString().slice(0, 10),
		strictHumanReview: process.argv.includes("--strict"),
	});
	console.log(
		`eligibility:build → ${r.included.length} incluidas, ${r.excluded.length} excluidas, digest ${r.bundleDigest.slice(0, 16)}…`,
	);
	if (r.excluded.length) {
		for (const e of r.excluded) {
			console.log(`  excluida ${e.slug}: ${e.codes.join(", ")}`);
		}
	}
	process.exit(r.ok ? 0 : 1);
}
