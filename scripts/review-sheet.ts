/**
 * review-sheet.ts — F3-9
 * Genera la hoja de revisión humana de un lote de RuleSets:
 * tabla por requisito (label | condición | extracto | localizador | enlace),
 * uncovered, plazo, importe, documentos y canal.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Condition, RuleSet } from "../src/lib/eligibility-engine/schema";

const RULES = "data/eligibility/rules";

const FIELD_NAMES: Record<string, string> = {
	territory: "territorio",
	residenceSince: "alta padrón",
	residenceMonths: "meses empadronado",
	age: "edad",
	dependents: "personas a cargo",
	familyType: "tipo de familia",
	employmentStatus: "situación laboral",
	studentStatus: "estudios",
	incomeAnnual: "ingresos anuales",
	disability: "discapacidad",
	dependency: "dependencia",
	housingStatus: "vivienda",
};

function legible(c: Condition): string {
	if ("all" in c) return `TODO: ${c.all.map(legible).join(" Y ")}`;
	if ("any" in c) return `ALGUNA VÍA: ${c.any.map(legible).join(" O ")}`;
	if ("not" in c) return `NO(${legible(c.not)})`;
	const f = FIELD_NAMES[c.field] ?? c.field;
	const v =
		c.param !== undefined
			? `${c.multiplier ?? 1}×${c.param}`
			: JSON.stringify(c.value);
	const parts = [`${f} ${c.op} ${v}`];
	if (c.count !== undefined) parts.push(`≥${c.count}`);
	if (c.where !== undefined) parts.push(`donde ${legible(c.where)}`);
	return parts.join(" ");
}

function row(cells: (string | undefined)[]): string {
	return `| ${cells.map((c) => (c ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

function cite(rs: RuleSet, c: { sourceId: string; locator: string; excerpt: string }): { url: string; locator: string; excerpt: string } {
	const s = rs.sources.find((x) => x.id === c.sourceId);
	return { url: s?.url ?? c.sourceId, locator: c.locator, excerpt: c.excerpt };
}

function section(rs: RuleSet): string {
	const out: string[] = [];
	out.push(`\n## ${rs.benefitSlug} (rulesVersion ${rs.rulesVersion}, verificado ${rs.verifiedAt})\n`);
	out.push(`| Requisito | Condición | Extracto oficial | Localizador | Enlace |`);
	out.push(`|---|---|---|---|---|`);
	for (const r of rs.requirements) {
		const c = cite(rs, r.citation);
		out.push(row([`${r.hard ? "**OBLIGATORIO**" : "aviso"}: ${r.label}`, legible(r.condition), `«${c.excerpt}»`, c.locator, c.url]));
	}
	out.push(`\n**No comprobables con nuestras preguntas (⚠):**\n`);
	for (const u of rs.uncoveredRequirements) {
		const c = cite(rs, u.citation);
		out.push(`- **${u.label}** — «${c.excerpt}» (${c.locator})`);
	}
	out.push(
		`\n- **Plazo**: ${rs.application.window.rolling ? "permanente/continuo" : `${rs.application.window.opensAt ?? "?"} → ${rs.application.window.closesAt ?? "?"}`}`,
	);
	out.push(
		`- **Canal**: ${rs.application.channel.managingBody} — ${rs.application.channel.url} (${rs.application.channel.online ? "online" : "presencial/otro"})`,
	);
	if (rs.amount) {
		out.push(
			`- **Importe**: ${rs.amount.type} ${rs.amount.minEur ?? ""}–${rs.amount.maxEur ?? ""} € ${rs.amount.period ?? ""} («${rs.amount.citation.excerpt}»)`,
		);
	}
	for (const d of rs.application.documents) {
		out.push(`- **Doc**: ${d.label}${d.mandatory ? " (obligatorio)" : ""}${d.condition ? " [condicional]" : ""}`);
	}
	out.push(`\nOK / KO por requisito: ☐ ☐ ☐ ☐ ☐`);
	return out.join("\n");
}

if (process.argv[1]?.endsWith("review-sheet.ts")) {
	const out = process.argv[process.argv.indexOf("--out") + 1] ?? "evidence/F3/lote.md";
	const files = readdirSync(RULES).filter((f) => f.endsWith(".json")).sort();
	const parts = [
		"# Hoja de revisión — lote de reglas F3",
		"",
		"Revisar cada requisito: label comprensible, condición fiel a la norma,",
		"extracto literal presente en la fuente, localizador correcto, enlace oficial.",
		"Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.",
	];
	for (const f of files) {
		parts.push(section(JSON.parse(readFileSync(join(RULES, f), "utf8"))));
	}
	mkdirSync(join(out, ".."), { recursive: true });
	writeFileSync(out, `${parts.join("\n")}\n`);
	console.log(`hoja de revisión: ${out} (${files.length} ayudas)`);
}
