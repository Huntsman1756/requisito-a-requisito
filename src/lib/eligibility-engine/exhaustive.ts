/**
 * Generador exhaustivo de perfiles (docs/07 §8.3, F2-14).
 * Dominio discretizado por campo: cada opción + unknown + declined (si el
 * catálogo lo permite); para numéricos, t−1/t/t+1 de cada umbral + una banda
 * que lo cruza. Producto cartesiano con tope de 200.000: si se supera,
 * cobertura por pares + fronteras (se reporta el recorte).
 */

import type { Answer } from "./operators";
import { evaluateRuleSet, type EvaluateCtx } from "./evaluate";
import type { CitizenProfile, QuestionCatalog, RuleSet } from "./schema";
import { assertEvaluationInvariants } from "./invariants";

export const MAX_PROFILES = 200_000;

const DERIVED_TO_SOURCE: Record<string, string> = {
	residenceMonths: "residenceSince",
};

interface Leaf {
	field: string;
	op: string;
	thresholds: number[];
	where?: Leaf[];
}

function leavesOf(cond: unknown): Leaf[] {
	if (!cond || typeof cond !== "object") return [];
	const c = cond as Record<string, unknown>;
	if (Array.isArray(c.all)) return (c.all as unknown[]).flatMap(leavesOf);
	if (Array.isArray(c.any)) return (c.any as unknown[]).flatMap(leavesOf);
	if (c.not !== undefined) return leavesOf(c.not);
	const leaf: Leaf = {
		field: String(c.field),
		op: String(c.op),
		thresholds: [],
	};
	if (typeof c.value === "number") leaf.thresholds.push(c.value);
	if (Array.isArray(c.value)) {
		for (const v of c.value) if (typeof v === "number") leaf.thresholds.push(v);
	}
	if (typeof c.count === "number") leaf.thresholds.push(c.count);
	if (c.where !== undefined) leaf.where = leavesOf(c.where);
	return [leaf, ...(leaf.where ?? [])];
}

export function fieldsOf(rs: RuleSet): string[] {
	const fields = new Set<string>();
	for (const r of rs.requirements) {
		for (const l of leavesOf(r.condition)) {
			fields.add(DERIVED_TO_SOURCE[l.field] ?? l.field);
		}
	}
	for (const d of rs.application.documents) {
		for (const l of leavesOf(d.condition)) {
			fields.add(DERIVED_TO_SOURCE[l.field] ?? l.field);
		}
	}
	return [...fields].sort();
}

export function thresholdsOf(rs: RuleSet): Map<string, number[]> {
	const map = new Map<string, number[]>();
	for (const r of rs.requirements) {
		for (const l of leavesOf(r.condition)) {
			if (!l.thresholds.length) continue;
			const f = DERIVED_TO_SOURCE[l.field] ?? l.field;
			map.set(f, [...(map.get(f) ?? []), ...l.thresholds]);
		}
	}
	for (const d of rs.application.documents) {
		for (const l of leavesOf(d.condition)) {
			if (!l.thresholds.length) continue;
			const f = DERIVED_TO_SOURCE[l.field] ?? l.field;
			map.set(f, [...(map.get(f) ?? []), ...l.thresholds]);
		}
	}
	for (const [k, v] of map) map.set(k, [...new Set(v)].sort((a, b) => a - b));
	return map;
}

const value = (v: unknown): Answer => ({ state: "value", value: v });

function domainFor(
	field: string,
	catalog: QuestionCatalog,
	thresholds: number[],
): Answer[] {
	const q = catalog.questions.find((x) => x.field === field);
	const domain: Answer[] = [];
	const type = q?.type ?? "single";

	switch (type) {
		case "single":
			for (const o of q?.options ?? []) domain.push(value(o.value));
			break;
		case "multi": {
			const vals = (q?.options ?? []).map((o) => o.value);
			for (const v of vals) domain.push(value([v]));
			domain.push(value(vals));
			domain.push(value([]));
			break;
		}
		case "age":
		case "money_band":
		case "integer": {
			for (const t of thresholds) {
				for (const p of [t - 1, t, t + 1]) {
					domain.push(value({ min: p, max: p, maxExclusive: false }));
				}
				domain.push(value({ min: t - 1, max: t + 1 })); // banda que cruza
			}
			if (thresholds.length === 0) {
				domain.push(value({ min: 0, max: 0, maxExclusive: false }));
			}
			break;
		}
		case "month_year":
			for (const t of thresholds) {
				domain.push(value({ year: 2026 - Math.ceil(t / 12), month: 1 }));
			}
			if (thresholds.length === 0) domain.push(value({ year: 2020, month: 1 }));
			break;
		case "territory":
			domain.push(value({ ccaa: "13" }));
			domain.push(value({ ccaa: "09" }));
			domain.push(value({ municipality: "28079" }));
			domain.push(value({ municipality: "08019" }));
			domain.push(value({ ccaa: "13", province: "28" }));
			break;
		case "dependents":
			for (const t of thresholds) {
				for (const p of [t - 1, t, t + 1]) {
					if (p < 0) continue;
					domain.push(
						value([{ age: { min: p, max: p, maxExclusive: false } }]),
					);
					domain.push(
						value([
							{ age: { min: p, max: p, maxExclusive: false } },
							{ age: { min: t - 1, max: t + 1 } },
						]),
					);
				}
			}
			domain.push(value([]));
			break;
	}
	if (q?.allowUnknown ?? true) domain.push({ state: "unknown" });
	if (q?.allowDecline ?? true) domain.push({ state: "declined" });
	if (q === undefined) domain.push({ state: "unasked" });
	return domain;
}

function cartesian(domains: Answer[][]): Answer[][] {
	return domains.reduce<Answer[][]>(
		(acc, d) => acc.flatMap((prefix) => d.map((x) => [...prefix, x])),
		[[]],
	);
}

export interface ExhaustiveReport {
	slug: string;
	fields: string[];
	profiles: number;
	truncated: boolean;
	strategy: "cartesian" | "pairs+boundary";
	violations: { profile: string; code: string }[];
	monotonicityViolations: { profile: string; field: string; detail: string }[];
	determinismViolations: number;
}

/**
 * Dominio de sustitución para monotonía: para un answer no-value se prueban
 * los valores concretos del dominio del campo.
 */
function valueDomain(domain: Answer[]): Answer[] {
	return domain.filter((a) => a.state === "value");
}

export function runExhaustive(
	rs: RuleSet,
	catalog: QuestionCatalog,
	evalCtx: Omit<EvaluateCtx, "catalog">,
	maxProfiles = MAX_PROFILES,
): ExhaustiveReport {
	const fields = fieldsOf(rs);
	const thresholds = thresholdsOf(rs);
	const domains = fields.map((f) =>
		domainFor(f, catalog, thresholds.get(f) ?? []),
	);
	const total = domains.reduce((acc, d) => acc * Math.max(1, d.length), 1);

	let combos: Answer[][];
	let truncated = false;
	let strategy: ExhaustiveReport["strategy"] = "cartesian";
	if (total <= maxProfiles) {
		combos = cartesian(domains);
	} else {
		truncated = true;
		strategy = "pairs+boundary";
		// Cobertura por pares: para cada par de campos, todas las combinaciones
		// con el resto en su primer valor.
		combos = [];
		const base = domains.map((d) => d[0]);
		combos.push(base);
		for (let i = 0; i < fields.length; i++) {
			for (const x of domains[i]) {
				const c = [...base];
				c[i] = x;
				combos.push(c);
			}
			for (let j = i + 1; j < fields.length; j++) {
				for (const x of domains[i]) {
					for (const y of domains[j]) {
						const c = [...base];
						c[i] = x;
						c[j] = y;
						combos.push(c);
					}
				}
			}
		}
	}

	const violations: ExhaustiveReport["violations"] = [];
	const monotonicityViolations: ExhaustiveReport["monotonicityViolations"] = [];
	let determinismViolations = 0;

	for (const combo of combos) {
		const answers: CitizenProfile["answers"] = {};
		for (let i = 0; i < fields.length; i++) {
			answers[fields[i]] = combo[i] as CitizenProfile["answers"][string];
		}
		const profile: CitizenProfile = { catalogVersion: catalog.catalogVersion, answers };
		const pKey = JSON.stringify(answers);

		const ev1 = evaluateRuleSet(rs, profile, { ...evalCtx, catalog });
		const ev2 = evaluateRuleSet(rs, profile, { ...evalCtx, catalog });
		if (JSON.stringify(ev1) !== JSON.stringify(ev2)) {
			determinismViolations++;
		}
		for (const code of ev1.selfCheck.failed) {
			violations.push({ profile: pKey, code });
		}
		const extra = assertEvaluationInvariants(ev1, rs, evalCtx);
		for (const code of extra) {
			if (!ev1.selfCheck.failed.includes(code)) {
				violations.push({ profile: pKey, code });
			}
		}

		// Monotonía: completar una respuesta no-value nunca cambia T/F.
		for (let i = 0; i < fields.length; i++) {
			const a = combo[i];
			if (a.state === "value") continue;
			const field = fields[i];
			const baseStatuses = new Map(
				ev1.requirements.map((r) => [r.id, r.status]),
			);
			for (const sub of valueDomain(domains[i])) {
				const answers2 = { ...answers, [field]: sub as CitizenProfile["answers"][string] };
				const evSub = evaluateRuleSet(
					rs,
					{ catalogVersion: catalog.catalogVersion, answers: answers2 },
					{ ...evalCtx, catalog },
				);
				for (const r of evSub.requirements) {
					const before = baseStatuses.get(r.id);
					if (before !== "U" && before !== r.status) {
						monotonicityViolations.push({
							profile: pKey,
							field,
							detail: `${r.id}: ${before} → ${r.status} con ${JSON.stringify(sub)}`,
						});
					}
				}
			}
		}
	}

	return {
		slug: rs.benefitSlug,
		fields,
		profiles: combos.length,
		truncated,
		strategy,
		violations,
		monotonicityViolations,
		determinismViolations,
	};
}
