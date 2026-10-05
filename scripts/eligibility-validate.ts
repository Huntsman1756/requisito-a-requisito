/**
 * eligibility-validate.ts — F1-4 (docs/02 §3, docs/07 §5)
 *
 * Gates G1–G10 sobre data/eligibility/rules/*.json. Fail-closed: un error en
 * cualquier gate excluye el RuleSet del bundle (el motor jamás ve reglas que
 * no los pasan). G10 solo bloquea en build estricto (release/demo).
 *
 * Uso: tsx scripts/eligibility-validate.ts [--strict] [--today YYYY-MM-DD]
 */

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { rankAllowed } from "../src/lib/eligibility-engine/domains";
import {
	parametersSchema,
	ruleSetSchema,
	sourceSnapshotSchema,
	type Citation,
	type Condition,
	type RuleSet,
	type SourceRegistry,
} from "../src/lib/eligibility-engine/schema";
import { normalizeText } from "../src/lib/eligibility-engine/text-normalize";

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const DAY = 86_400_000;
const STALE_DAYS = 90;

export interface ValidateOptions {
	rulesDir: string;
	sourcesDir: string;
	catalogDir: string;
	parametersPath: string;
	registry: SourceRegistry;
	today: string;
	strictHumanReview: boolean;
}

export interface ValidationError {
	code: string;
	ruleset: string;
	message: string;
}

export interface ValidateResult {
	ok: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
	rulesets: RuleSet[];
}

interface Cit {
	where: string;
	c: Citation;
}

function citationsOf(rs: RuleSet): Cit[] {
	const out: Cit[] = [];
	const conditionCitations = (
		c: Condition,
		where: string,
	): void => {
		if ("all" in c) {
			if (c.citation) out.push({ where: `${where}.all`, c: c.citation });
			c.all.forEach((x, i) => conditionCitations(x, `${where}.all.${i}`));
		} else if ("any" in c) {
			if (c.citation) out.push({ where: `${where}.any`, c: c.citation });
			c.any.forEach((x, i) => conditionCitations(x, `${where}.any.${i}`));
		} else if ("not" in c) {
			if (c.citation) out.push({ where: `${where}.not`, c: c.citation });
			conditionCitations(c.not, `${where}.not`);
		} else {
			if (c.citation) out.push({ where, c: c.citation });
			if (c.where) conditionCitations(c.where, `${where}.where`);
		}
	};
	for (const r of rs.requirements) {
		out.push({ where: `requirements.${r.id}`, c: r.citation });
		conditionCitations(r.condition, `requirements.${r.id}.condition`);
	}
	for (const r of rs.uncoveredRequirements)
		out.push({ where: `uncoveredRequirements.${r.id}`, c: r.citation });
	out.push({ where: "application.window", c: rs.application.window.citation });
	out.push({ where: "application.channel", c: rs.application.channel.citation });
	for (const d of rs.application.documents)
		out.push({ where: `application.documents.${d.id}`, c: d.citation });
	if (rs.amount) out.push({ where: "amount", c: rs.amount.citation });
	if (rs.referenceDateCitation)
		out.push({ where: "referenceDateCitation", c: rs.referenceDateCitation });
	if (rs.application.officialSimulator)
		out.push({
			where: "application.officialSimulator",
			c: rs.application.officialSimulator.citation,
		});
	return out;
}

export function validateEligibility(opts: ValidateOptions): ValidateResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationError[] = [];
	const rulesets: RuleSet[] = [];
	const err = (code: string, ruleset: string, message: string) =>
		errors.push({ code, ruleset, message });
	const warn = (code: string, ruleset: string, message: string) =>
		warnings.push({ code, ruleset, message });

	const catalogSlugs = new Set(
		existsSync(opts.catalogDir)
			? readdirSync(opts.catalogDir)
					.filter((f) => f.endsWith(".json"))
					.map((f) => f.slice(0, -5))
			: [],
	);

	const parameters = existsSync(opts.parametersPath)
		? parametersSchema.parse(
				JSON.parse(readFileSync(opts.parametersPath, "utf8")),
			)
		: { parameters: [] };

	const files = existsSync(opts.rulesDir)
		? readdirSync(opts.rulesDir).filter((f) => f.endsWith(".json")).sort()
		: [];

	for (const file of files) {
		const name = file.slice(0, -5);
		const raw = JSON.parse(readFileSync(join(opts.rulesDir, file), "utf8"));

		// G5 (antes que G1): la regla debe declarar explícitamente qué no cubre.
		if (!Array.isArray(raw.uncoveredRequirements)) {
			err("ELIG_G5_UNCOVERED_MISSING", name, "falta uncoveredRequirements");
		}

		// G1 Zod
		const parsed = ruleSetSchema.safeParse(raw);
		if (!parsed.success) {
			err(
				"ELIG_G1_SCHEMA",
				name,
				parsed.error.issues
					.map((i) => `${i.path.join(".")}: ${i.message}`)
					.join("; "),
			);
			continue;
		}
		const rs = parsed.data;
		const slug = rs.benefitSlug;

		// G2 autoridad: ficha en catálogo importado o standalone con fuente rango 1
		const hasRank1 = rs.sources.some((s) => s.rank === 1);
		if (!catalogSlugs.has(slug) && !(rs.standalone === true && hasRank1)) {
			err(
				"ELIG_G2_NO_CATALOG_ENTRY",
				slug,
				`sin ficha en catálogo ni standalone con fuente rango 1`,
			);
		}

		// G3 citas: sourceId declarado, snapshot presente, dominio y rango válidos
		const sourceIds = new Set(rs.sources.map((s) => s.id));
		const sourceById = new Map(rs.sources.map((s) => [s.id, s]));
		for (const s of rs.sources) {
			const metaPath = join(opts.sourcesDir, `${s.id}.json`);
			const txtPath = join(opts.sourcesDir, `${s.id}.txt`);
			if (!existsSync(metaPath) || !existsSync(txtPath)) {
				err("ELIG_G3_NO_SNAPSHOT", slug, `snapshot ausente para ${s.id}`);
				continue;
			}
			const meta = sourceSnapshotSchema.safeParse(
				JSON.parse(readFileSync(metaPath, "utf8")),
			);
			if (meta.success && meta.data.url !== s.url) {
				err("ELIG_G3_URL_MISMATCH", slug, `snapshot ${s.id} apunta a otra url`);
			}
			const r = rankAllowed(s.url, s.rank, opts.registry.domains);
			if (!r.domain) {
				err("ELIG_G3_DOMAIN", slug, `dominio no registrado: ${r.host ?? s.url}`);
			} else if (!r.ok) {
				err(
					"ELIG_G3_RANK",
					slug,
					`rango ${s.rank} supera el techo ${r.domain.maxRank} de ${r.domain.host}`,
				);
			}
		}
		for (const { where, c } of citationsOf(rs)) {
			if (!sourceIds.has(c.sourceId)) {
				err("ELIG_G3_UNKNOWN_SOURCE", slug, `${where}: sourceId ${c.sourceId} no declarado`);
			}
		}

		// G4 extracto literal en el .txt normalizado + sha del extracto
		for (const { where, c } of citationsOf(rs)) {
			const src = sourceById.get(c.sourceId);
			if (!src) continue;
			const txtPath = join(opts.sourcesDir, `${c.sourceId}.txt`);
			if (!existsSync(txtPath)) continue;
			const text = normalizeText(readFileSync(txtPath, "utf8"));
			const excerptNorm = normalizeText(c.excerpt);
			if (!text.includes(excerptNorm)) {
				err("ELIG_G4_EXCERPT_NOT_FOUND", slug, `${where}: extracto no presente`);
			}
			if (sha256(excerptNorm) !== c.excerptSha256) {
				err("ELIG_G4_EXCERPT_SHA", slug, `${where}: excerptSha256 no cuadra`);
			}
		}

		// G4 también sobre las citas de los parámetros que la regla usa.
		// (Los parámetros son hechos citados; misma regla de extracto literal.)
		for (const p of rs.parametersUsed ?? []) {
			const param = parameters.parameters.find((x) => x.id === p);
			for (const per of param?.periods ?? []) {
				const c = per.citation;
				const txtPath = join(opts.sourcesDir, `${c.sourceId}.txt`);
				if (!existsSync(txtPath)) {
					err("ELIG_G3_NO_SNAPSHOT", slug, `param ${p}: snapshot ausente para ${c.sourceId}`);
					continue;
				}
				const text = normalizeText(readFileSync(txtPath, "utf8"));
				const excerptNorm = normalizeText(c.excerpt);
				if (!text.includes(excerptNorm)) {
					err("ELIG_G4_EXCERPT_NOT_FOUND", slug, `param ${p}: extracto no presente`);
				}
				if (sha256(excerptNorm) !== c.excerptSha256) {
					err("ELIG_G4_EXCERPT_SHA", slug, `param ${p}: excerptSha256 no cuadra`);
				}
			}
		}

		// G6 frescura
		const ageDays =
			(new Date(`${opts.today}T00:00:00Z`).getTime() -
				new Date(`${rs.verifiedAt}T00:00:00Z`).getTime()) /
			DAY;
		if (ageDays > STALE_DAYS) {
			err("ELIG_G6_STALE", slug, `verifiedAt ${rs.verifiedAt} > ${STALE_DAYS} días`);
		}

		// G7 conflicto declarado en la ventana ⇒ fuera
		if (rs.application.window.conflict === true) {
			err("ELIG_G7_CONFLICT", slug, "application.window.conflict = true");
		}

		// G8 referenceDate modelada si la cita la fija
		if (rs.referenceDateCitation && rs.referenceDate === "application") {
			err(
				"ELIG_G8_REFERENCE_DATE",
				slug,
				"hay referenceDateCitation pero referenceDate = 'application'",
			);
		}

		// G9 parámetros: existen y cubren la fecha de referencia
		const refDate = rs.referenceDate === "application" ? opts.today : rs.referenceDate;
		for (const p of rs.parametersUsed ?? []) {
			const param = parameters.parameters.find((x) => x.id === p);
			const period = param?.periods.find(
				(per) => per.from <= refDate && (per.to === undefined || per.to >= refDate),
			);
			if (!param || !period) {
				err(
					"ELIG_G9_PARAM",
					slug,
					`parámetro ${p} sin vigencia que cubra ${refDate}`,
				);
			}
		}

		// G11 (ADR-034): requisitos, umbrales e importes solo de rango 1–2.
		// El rango 3 queda reservado a channel, documents, officialSimulator
		// y el estado operativo del plazo.
		for (const { where, c } of citationsOf(rs)) {
			const rank = sourceById.get(c.sourceId)?.rank;
			if (rank === undefined) continue;
			const isNormative =
				where.startsWith("requirements.") ||
				where.startsWith("uncoveredRequirements.") ||
				where === "amount" ||
				where === "referenceDateCitation";
			if (isNormative && rank > 2) {
				err(
					"ELIG_G11_RANK",
					slug,
					`${where}: cita de rango ${rank} (requisitos e importes exigen rango ≤ 2)`,
				);
			}
		}

		// G10 revisión humana
		if (rs.humanReview.status !== "approved") {
			const msg = `humanReview.status = ${rs.humanReview.status}`;
			if (opts.strictHumanReview) {
				err("ELIG_G10_HUMAN_REVIEW", slug, msg);
			} else {
				warn("ELIG_G10_HUMAN_REVIEW", slug, msg);
			}
		}

		rulesets.push(rs);
	}

	return { ok: errors.length === 0, errors, warnings, rulesets };
}

// --- CLI ----------------------------------------------------------------------

function argValue(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1]?.endsWith("eligibility-validate.ts")) {
	const root = process.cwd();
	const r = validateEligibility({
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
		today: argValue("today") ?? new Date().toISOString().slice(0, 10),
		strictHumanReview: process.argv.includes("--strict"),
	});
	for (const w of r.warnings) console.warn(`AVISO ${w.code} ${w.ruleset}: ${w.message}`);
	for (const e of r.errors) console.error(`${e.code} ${e.ruleset}: ${e.message}`);
	console.log(
		`eligibility:validate → ${r.rulesets.length} rulesets, ${r.errors.length} errores, ${r.warnings.length} avisos`,
	);
	process.exit(r.ok ? 0 : 1);
}
