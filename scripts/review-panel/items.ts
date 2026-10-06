/**
 * review-panel/items.ts — extracción de ítems revisables (docs/17 §3).
 * Un ítem por requisito, amount, window, documento citado y uncovered;
 * más un ítem de completitud por regla.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Condition, RuleSet } from "../../src/lib/eligibility-engine/schema";

export interface PanelItem {
	ruleSlug: string;
	itemId: string;
	kind: "requirement" | "amount" | "window" | "document" | "uncovered" | "completeness";
	label: string;
	hard?: boolean;
	condition?: Condition;
	conditionPlain?: string;
	excerpt?: string;
	context?: string;
	locator?: string;
	sourceId?: string;
	// completeness
	modelledIds?: string[];
	uncoveredIds?: string[];
}

const sha = async (s: string) =>
	Array.from(
		new Uint8Array(
			await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
		),
	)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

export function conditionPlain(c: Condition): string {
	if ("all" in c) return `todo: ${c.all.map(conditionPlain).join(" Y ")}`;
	if ("any" in c) return `alguna: ${c.any.map(conditionPlain).join(" O ")}`;
	if ("not" in c) return `no: ${conditionPlain(c.not)}`;
	const v = c.value;
	if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number")
		return `${c.field} entre ${v[0]} y ${v[1]} (${c.op})`;
	if (v && typeof v === "object" && "min" in (v as object)) {
		const iv = v as { min?: number | null; max?: number | null };
		return `${c.field} entre ${iv.min ?? "−∞"} y ${iv.max ?? "+∞"}`;
	}
	return `${c.field} ${c.op} ${JSON.stringify(v)}`;
}

function ctxAround(
	sourceText: string,
	excerpt: string,
	radius = 1200,
): string {
	const i = sourceText.indexOf(excerpt);
	if (i < 0) return sourceText.slice(0, radius * 2);
	return sourceText.slice(
		Math.max(0, i - radius),
		Math.min(sourceText.length, i + excerpt.length + radius),
	);
}

export function extractItems(
	rs: RuleSet,
	readSource: (sourceId: string) => string,
): PanelItem[] {
	const out: PanelItem[] = [];
	const pushCited = (
		kind: PanelItem["kind"],
		itemId: string,
		label: string,
		citation: { sourceId: string; locator: string; excerpt: string } | undefined,
		extra?: Partial<PanelItem>,
	) => {
		const it: PanelItem = { ruleSlug: rs.benefitSlug, itemId, kind, label, ...extra };
		if (citation) {
			it.sourceId = citation.sourceId;
			it.locator = citation.locator;
			it.excerpt = citation.excerpt;
			const t = readSource(citation.sourceId);
			if (t) it.context = ctxAround(t, citation.excerpt);
		}
		out.push(it);
	};

	for (const r of rs.requirements) {
		pushCited("requirement", `req:${r.id}`, r.label, r.citation, {
			hard: r.hard,
			condition: r.condition,
			conditionPlain: conditionPlain(r.condition),
		});
	}
	for (const u of rs.uncoveredRequirements) {
		pushCited("uncovered", `uc:${u.id}`, u.label, u.citation);
	}
	if (rs.amount?.citation) {
		pushCited(
			"amount",
			"amount",
			`Importe: ${JSON.stringify(rs.amount).slice(0, 300)}`,
			rs.amount.citation,
		);
	}
	if (rs.application.window?.citation) {
		pushCited(
			"window",
			"window",
			`Plazo: rolling=${rs.application.window.rolling} abre=${rs.application.window.opensAt ?? "—"} cierra=${rs.application.window.closesAt ?? "—"}`,
			rs.application.window.citation,
		);
	}
	for (const doc of rs.application.documents) {
		if (doc.citation) pushCited("document", `doc:${doc.id}`, doc.label, doc.citation);
	}
	// ítem de completitud: la lista modelada + sección de requisitos de la fuente
	out.push({
		ruleSlug: rs.benefitSlug,
		itemId: "completeness",
		kind: "completeness",
		label: "¿Falta algún requisito que la norma exija al solicitante?",
		modelledIds: rs.requirements.map((r) => `${r.id} (${r.hard ? "hard" : "soft"}): ${r.label}`),
		uncoveredIds: rs.uncoveredRequirements.map((u) => `${u.id}: ${u.label}`),
	});
	return out;
}

/** Reglas + fuentes desde disco (uso en CLI). */
export function extractAll(root: string): PanelItem[] {
	const { readdirSync } = require("node:fs") as typeof import("node:fs");
	const rulesDir = join(root, "data/eligibility/rules");
	const srcDir = join(root, "data/eligibility/sources");
	const items: PanelItem[] = [];
	for (const f of readdirSync(rulesDir).filter((x) => x.endsWith(".json"))) {
		const rs = JSON.parse(readFileSync(join(rulesDir, f), "utf8")) as RuleSet;
		const cache = new Map<string, string>();
		items.push(
			...extractItems(rs, (id) => {
				if (!cache.has(id)) {
					const p = join(srcDir, `${id}.txt`);
					try {
						cache.set(id, readFileSync(p, "utf8"));
					} catch {
						cache.set(id, "");
					}
				}
				return cache.get(id)!;
			}),
		);
	}
	return items;
}

export { sha };
