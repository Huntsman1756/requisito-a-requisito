/**
 * «¿Qué me falta?» (docs/07 §4.1): missing, blockers, futureEligibility.
 */

import { addMonths } from "./derived";
import type { TFU } from "./interval";
import type {
	Condition,
	EvaluationResult,
	QuestionCatalog,
} from "./schema";
import { deadlineState, type WindowLike } from "./deadline";

export interface ReqResult {
	id: string;
	hard: boolean;
	status: TFU;
	label: string;
	missingFields?: string[];
	timeDependent?: "increasing" | "decreasing" | "none";
	condition: Condition;
}

const DERIVED_TO_SOURCE: Record<string, string> = {
	residenceMonths: "residenceSince",
};

/**
 * missing[]: campos que resolverían cada U, deduplicados y ordenados por
 * nº de requisitos que desbloquean (§4.1).
 */
export function missingOf(
	reqs: ReqResult[],
	catalog: QuestionCatalog,
): EvaluationResult["missing"] {
	const unlocks = new Map<string, number>();
	for (const r of reqs) {
		if (r.status !== "U") continue;
		for (const f of r.missingFields ?? []) {
			unlocks.set(f, (unlocks.get(f) ?? 0) + 1);
		}
	}
	return [...unlocks.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([field, n]) => {
			const source = DERIVED_TO_SOURCE[field] ?? field;
			const q = catalog.questions.find((x) => x.field === source);
			return { field, questionId: q?.id ?? `q-${source}`, unlocks: n };
		});
}

/** blockers[]: requisitos hard con F (§4.1). */
export function blockersOf(reqs: ReqResult[]): string[] {
	return reqs.filter((r) => r.hard && r.status === "F").map((r) => r.label);
}

/**
 * futureEligibility: solo si TODOS los hard-F son timeDependent increasing
 * y el resto hard es T. Primera fecha en que todos pasan (§4.1).
 * `decreasing` (edad máxima, etc.) nunca produce elegibilidad futura.
 */
export function futureEligibilityOf(
	reqs: ReqResult[],
	window: WindowLike,
	today: string,
	profile: { answers: Record<string, { state: string; value?: unknown } | undefined> },
): EvaluationResult["futureEligibility"] | undefined {
	const hardF = reqs.filter((r) => r.hard && r.status === "F");
	const othersHard = reqs.filter((r) => r.hard && r.status !== "F");
	if (hardF.length === 0) return undefined;
	if (!hardF.every((r) => r.timeDependent === "increasing")) return undefined;
	// Solo con requisitos hard restantes T (los U bloquearían igualmente en el futuro
	// salvo que se respondan — la fecha se refiere a que el campo temporal madure).
	if (!othersHard.every((r) => r.status === "T")) return undefined;

	const dates: { from: string; to?: string; id: string }[] = [];
	for (const r of hardF) {
		const d = whenSatisfied(r, today, profile);
		if (!d) return undefined;
		dates.push({ ...d, id: r.id });
	}
	const sorted = dates.map((d) => d.from).sort();
	const from = sorted[sorted.length - 1];
	if (from === undefined) return undefined;
	const sortedTo = dates
		.map((d) => d.to)
		.filter((x): x is string => x !== undefined)
		.sort();
	const to =
		sortedTo.length === dates.length && sortedTo.length > 0
			? sortedTo[sortedTo.length - 1]
			: undefined;

	// Solo si la fecha cae dentro del plazo (o rolling/recurrente citado).
	const dl = deadlineState(window, today);
	const within =
		window.rolling === true ||
		window.recurrence === "annual" ||
		(window.closesAt !== undefined && from <= window.closesAt);
	if (!within) return undefined;
	if (dl.state === "CLOSED" && window.recurrence !== "annual") return undefined;

	return { from, to, becauseOf: dates.map((d) => d.id), withinWindow: true };
}

type IntervalLike = { min: number | null; max: number | null; maxExclusive?: boolean };

/**
 * Fecha en que un requisito `increasing` pasa a T, para condiciones hoja
 * gte/gt sobre un campo temporal (residenceMonths, age en años → meses/días).
 * Intervalo del usuario ⇒ rango de fechas (§4.1 «entre el X y el Y»).
 */
function whenSatisfied(
	req: ReqResult,
	today: string,
	profile: { answers: Record<string, { state: string; value?: unknown } | undefined> },
): { from: string; to?: string } | undefined {
	const c = req.condition;
	if ("all" in c || "any" in c || "not" in c) {
		// Solo se soporta hoja o all de hojas (todas increasing ya está garantizado por el RuleSet? no: basta con hoja).
		if (!("all" in c)) return undefined;
		const parts = c.all
			.map((sub) => whenSatisfied({ ...req, condition: sub }, today, profile))
			.filter((x): x is { from: string; to?: string } => x !== undefined);
		if (parts.length !== c.all.length) return undefined;
		const sortedParts = parts.map((p) => p.from).sort();
		const last = sortedParts[sortedParts.length - 1];
		if (last === undefined) return undefined;
		const tos = parts
			.map((p) => p.to)
			.filter((x): x is string => x !== undefined)
			.sort();
		return {
			from: last,
			to: tos.length === parts.length ? tos[tos.length - 1] : undefined,
		};
	}
	const leaf = c;
	if (leaf.op !== "gte" && leaf.op !== "gt") return undefined;
	const t = typeof leaf.value === "number" ? leaf.value : undefined;
	if (t === undefined) return undefined;

	const sourceField = DERIVED_TO_SOURCE[leaf.field] ?? leaf.field;
	const answer = profile.answers[sourceField];
	const iv = answer?.value as IntervalLike | undefined;
	if (!iv || typeof iv !== "object") return undefined;

	// El campo crece 1/mes (residenceMonths) o 1/año (age).
	const unitMonths = leaf.field === "age" ? 12 : 1;
	const thresh = t + (leaf.op === "gt" ? 1 : 0);
	const reach = (edge: number | null) =>
		edge === null
			? undefined
			: addMonths(today, Math.max(0, Math.ceil(thresh - edge)) * unitMonths);

	// from: cuando el hi alcanza el umbral; to: cuando el lo lo alcanza.
	const from = reach(iv.max);
	if (from === undefined) return undefined;
	return { from, to: reach(iv.min) };
}
