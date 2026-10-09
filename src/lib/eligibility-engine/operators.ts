/**
 * Evaluación de condiciones (docs/07 §2.2, §3).
 * Hojas: respuesta no-`value` ⇒ U. Intervalos: T/F/U por cruce de umbral.
 * `any` con vías (label+citation): la vía T se reporta; en U, `missing`
 * propone la vía con menos datos pendientes.
 */

import {
	type Interval,
	type TFU,
	intervalBetween,
	intervalGt,
	intervalGte,
	intervalLt,
	intervalLte,
} from "./interval";
import { kleeneAll, kleeneAny, kleeneNot } from "./logic";
import { residenceMonthsInterval } from "./derived";
import { resolveParam } from "./params";
import type {
	Citation,
	Condition,
	ConditionLeaf,
	Parameters,
} from "./schema";
import { withinTerritory } from "./territory-lite";
import type { Territory } from "./territory-core";

export type Uncertainty =
	| "unasked"
	| "unknown"
	| "declined"
	| "range_straddles"
	| "territory_partial"
	| "conflict";

export interface CondResult {
	status: TFU;
	via?: { label?: string; citation?: Citation };
	missingFields: string[];
	uncertainty?: Uncertainty;
}

export interface EvalCtx {
	parameters: Parameters;
	referenceDate: string;
	today: string;
}

export type Answer =
	| { state: "unknown" | "declined" | "unasked" }
	| { state: "value"; value: unknown };

interface MiniProfile {
	answers: Record<string, Answer | undefined>;
}

// Campos derivados: se calculan de otra respuesta, nunca se preguntan.
const DERIVED: Record<
	string,
	{ from: string; derive: (v: unknown, ref: string) => Interval | undefined }
> = {
	residenceMonths: {
		from: "residenceSince",
		derive: (v, ref) =>
			isMonthYear(v) ? residenceMonthsInterval(v, ref) : undefined,
	},
	// F10-RES-2 §2.1: la edad respondida fija el año de nacimiento en un
	// rango de 2 años (el cumpleaños puede caer a cualquier lado de la
	// fecha de referencia). Una respuesta directa a «año de nacimiento»
	// siempre manda (ver answerOf).
	birthYear: {
		from: "age",
		derive: (v, ref) => {
			const iv = toInterval(v);
			if (!iv || iv.min === null || iv.max === null) return undefined;
			const y = Number(ref.slice(0, 4));
			if (!Number.isFinite(y)) return undefined;
			// Edad E a fecha Y ⇒ nació entre Y-E-1 y Y-E inclusive
			// (maxExclusive false: el año alto sí pertenece al rango).
			return { min: y - iv.max - 1, max: y - iv.min, maxExclusive: false };
		},
	},
};

function isMonthYear(v: unknown): v is { year: number; month: number } {
	return (
		typeof v === "object" &&
		v !== null &&
		typeof (v as { year?: unknown }).year === "number" &&
		typeof (v as { month?: unknown }).month === "number"
	);
}

function isInterval(v: unknown): v is Interval {
	return (
		typeof v === "object" &&
		v !== null &&
		"min" in v &&
		"max" in v &&
		((v as Interval).min === null || typeof (v as Interval).min === "number")
	);
}

function toInterval(v: unknown): Interval | undefined {
	if (typeof v === "number") return { min: v, max: v, maxExclusive: false };
	if (isInterval(v)) return v;
	return undefined;
}

function threshold(leaf: ConditionLeaf, ctx: EvalCtx): number | undefined {
	const base =
		leaf.param !== undefined
			? resolveParam(ctx.parameters, leaf.param, ctx.referenceDate)
			: typeof leaf.value === "number"
				? leaf.value
				: undefined;
	return base === undefined ? undefined : base * (leaf.multiplier ?? 1);
}

function answerOf(profile: MiniProfile, field: string, ctx: EvalCtx): Answer | undefined {
	// La respuesta directa siempre manda (p. ej. birthYear preguntado a
	// menores de 21 cuando la edad no basta para decidir).
	const direct = profile.answers[field];
	if (direct?.state === "value") return direct;
	const derived = DERIVED[field];
	if (derived) {
		const a = profile.answers[derived.from];
		if (a?.state === "value") {
			const v = derived.derive(a.value, ctx.referenceDate);
			if (v !== undefined) return { state: "value", value: v };
		}
	}
	return direct;
}

function leafResult(
	leaf: ConditionLeaf,
	profile: MiniProfile,
	ctx: EvalCtx,
): CondResult {
	const field = leaf.field;
	const answer = answerOf(profile, field, ctx);
	if (answer?.state !== "value") {
		// declined: no insistir — no se propone en «qué te falta» (docs/07 §1).
		return {
			status: "U",
			missingFields: answer?.state === "declined" ? [] : [field],
			uncertainty:
				answer?.state === "declined"
					? "declined"
					: answer?.state === "unknown"
						? "unknown"
						: "unasked",
		};
	}
	const v = answer.value;

	switch (leaf.op) {
		case "exists":
			return ok("T", field);
		case "eq":
			return ok(v === leaf.value ? "T" : "F", field);
		case "neq":
			return ok(v !== leaf.value ? "T" : "F", field);
		case "in":
			return ok(
				Array.isArray(leaf.value) && leaf.value.includes(v) ? "T" : "F",
				field,
			);
		case "not_in":
			return ok(
				Array.isArray(leaf.value) && !leaf.value.includes(v) ? "T" : "F",
				field,
			);
		case "includes_any": {
			const want = leaf.value;
			const got = Array.isArray(v) ? v : [];
			return ok(
				Array.isArray(want) && want.some((x) => got.includes(x)) ? "T" : "F",
				field,
			);
		}
		case "includes_all": {
			const want = leaf.value;
			const got = Array.isArray(v) ? v : [];
			return ok(
				Array.isArray(want) && want.every((x) => got.includes(x)) ? "T" : "F",
				field,
			);
		}
		case "within_territory": {
			const r = withinTerritory(v as Territory, leaf.value as Territory);
			return {
				status: r,
				missingFields: r === "U" ? [field] : [],
				uncertainty: r === "U" ? "territory_partial" : undefined,
			};
		}
		case "count_where_gte": {
			const deps = Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
			const where = leaf.where;
			const count = leaf.count ?? 1;
			if (!where) {
				// Sin subcondición: cuenta total de personas a cargo.
				return ok(deps.length >= count ? "T" : "F", field);
			}
			let t = 0;
			let u = 0;
			for (const dep of deps) {
				const sub: MiniProfile = { answers: {} };
				for (const [k, val] of Object.entries(dep)) {
					sub.answers[k] =
						val === undefined ? undefined : { state: "value", value: val };
				}
				const r = evalCondition(where, sub, ctx);
				if (r.status === "T") t++;
				else if (r.status === "U") u++;
			}
			const status: TFU = t >= count ? "T" : t + u < count ? "F" : "U";
			return {
				status,
				missingFields: status === "U" ? [field] : [],
				uncertainty: status === "U" ? "range_straddles" : undefined,
			};
		}
		case "between": {
			const iv = toInterval(v);
			const vals = leaf.value;
			if (iv === undefined || !Array.isArray(vals) || vals.length !== 2) {
				return ok("U", field, "unasked");
			}
			const a = leaf.param !== undefined ? threshold(leaf, ctx) : vals[0];
			const b = vals[1];
			if (typeof a !== "number" || typeof b !== "number") {
				return { status: "U", missingFields: [], uncertainty: "conflict" };
			}
			const r = intervalBetween(iv, a, b, leaf.inclusive ?? [true, true]);
			return {
				status: r,
				missingFields: r === "U" ? [field] : [],
				uncertainty: r === "U" ? "range_straddles" : undefined,
			};
		}
		case "lt":
		case "lte":
		case "gt":
		case "gte": {
			const iv = toInterval(v);
			const t = threshold(leaf, ctx);
			if (iv === undefined || t === undefined) {
				return { status: "U", missingFields: [], uncertainty: "conflict" };
			}
			const r =
				leaf.op === "lt"
					? intervalLt(iv, t)
					: leaf.op === "lte"
						? intervalLte(iv, t)
						: leaf.op === "gt"
							? intervalGt(iv, t)
							: intervalGte(iv, t);
			return {
				status: r,
				missingFields: r === "U" ? [field] : [],
				uncertainty: r === "U" ? "range_straddles" : undefined,
			};
		}
	}
}

function ok(
	status: TFU,
	field: string,
	uncertainty?: Uncertainty,
): CondResult {
	return {
		status,
		missingFields: status === "U" ? [field] : [],
		uncertainty,
	};
}

function withVia(r: CondResult, leaf: ConditionLeaf): CondResult {
	return leaf.label
		? { ...r, via: { label: leaf.label, citation: leaf.citation } }
		: r;
}

export function evalCondition(
	cond: Condition,
	profile: MiniProfile,
	ctx: EvalCtx,
): CondResult {
	if ("all" in cond) {
		const rs = cond.all.map((c) => evalCondition(c, profile, ctx));
		const status = kleeneAll(rs.map((r) => r.status));
		const missing = [...new Set(rs.flatMap((r) => r.missingFields))];
		return {
			status,
			via: cond.label ? { label: cond.label, citation: cond.citation } : undefined,
			missingFields: status === "U" ? missing : [],
			uncertainty: status === "U" ? rs.find((r) => r.status === "U")?.uncertainty : undefined,
		};
	}
	if ("any" in cond) {
		const rs = cond.any.map((c) => evalCondition(c, profile, ctx));
		const status = kleeneAny(rs.map((r) => r.status));
		if (status === "T") {
			const winner = rs.find((r) => r.status === "T");
			return {
				status,
				via: winner?.via?.label
					? winner.via
					: cond.label
						? { label: cond.label, citation: cond.citation }
						: undefined,
				missingFields: [],
			};
		}
		// U o F: missing propone la vía con menos datos pendientes.
		const best = rs
			.filter((r) => r.status !== "F")
			.sort((a, b) => a.missingFields.length - b.missingFields.length)[0];
		return {
			status,
			via: best?.via ?? (cond.label ? { label: cond.label, citation: cond.citation } : undefined),
			missingFields: status === "U" ? [...new Set(best?.missingFields ?? [])] : [],
			uncertainty: status === "U" ? best?.uncertainty : undefined,
		};
	}
	if ("not" in cond) {
		const r = evalCondition(cond.not, profile, ctx);
		return { status: kleeneNot(r.status), via: r.via, missingFields: r.status === "U" ? r.missingFields : [], uncertainty: r.uncertainty };
	}
	return withVia(leafResult(cond, profile, ctx), cond);
}
