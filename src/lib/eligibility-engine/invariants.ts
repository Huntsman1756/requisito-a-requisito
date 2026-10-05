/**
 * Invariantes I1–I10 (docs/07 §5). Se ejecutan ANTES de mostrar cualquier
 * veredicto; una violación ⇒ la ayuda muestra «No podemos evaluar esta ayuda
 * ahora» y se emite `invariant_failed` (solo slug+código, nada del perfil).
 */

import { diffDays } from "./derived";
import { resolveParam } from "./params";
import type {
	Condition,
	EvaluationResult,
	Parameters,
	RuleSet,
} from "./schema";
import { oracleVerdict } from "./verdict-oracle";

export interface InvariantCtx {
	parameters: Parameters;
	/** Digest del bundle cargado (I7); si falta, I7 no aplica. */
	bundleDigest?: string;
	/** Digest embebido en el HTML (I7); si falta, I7 no aplica. */
	expectedBundleDigest?: string;
}

const STALE_DAYS = 90;

function* citationsOf(rs: RuleSet) {
	for (const r of rs.requirements) yield r.citation;
	for (const u of rs.uncoveredRequirements) yield u.citation;
	yield rs.application.window.citation;
	yield rs.application.channel.citation;
	for (const d of rs.application.documents) yield d.citation;
	if (rs.amount) yield rs.amount.citation;
	if (rs.referenceDateCitation) yield rs.referenceDateCitation;
}

function conditionCitations(c: Condition): { sourceId: string }[] {
	if ("all" in c) return c.all.flatMap(conditionCitations);
	if ("any" in c) return c.any.flatMap(conditionCitations);
	if ("not" in c) return conditionCitations(c.not);
	return c.citation ? [c.citation] : [];
}

function collectNumbers(v: unknown, out: Set<number> = new Set()): Set<number> {
	if (typeof v === "number") out.add(v);
	else if (Array.isArray(v)) for (const x of v) collectNumbers(x, out);
	else if (v && typeof v === "object") {
		for (const x of Object.values(v)) collectNumbers(x, out);
	}
	return out;
}

export function assertEvaluationInvariants(
	ev: EvaluationResult,
	rs: RuleSet,
	ctx: InvariantCtx,
): string[] {
	const failed: string[] = [];
	const srcIds = new Set(rs.sources.map((s) => s.id));

	// I1: cada requisito del RuleSet aparece exactamente una vez en la evaluación
	const ids = ev.requirements.map((r) => r.id);
	const expected = rs.requirements.map((r) => r.id);
	if (
		ids.length !== expected.length ||
		new Set(ids).size !== ids.length ||
		!expected.every((id) => ids.includes(id))
	) {
		failed.push("I1");
	}

	// I2: veredicto por segunda implementación
	if (
		oracleVerdict(
			ev.requirements.map((r) => ({ hard: r.hard, status: r.status })),
			rs.uncoveredRequirements.length,
		) !== ev.verdict
	) {
		failed.push("I2");
	}

	// I3: toda cita mostrada tiene sourceId existente, url https y locator
	for (const c of citationsOf(rs)) {
		if (!srcIds.has(c.sourceId) || !c.locator) {
			failed.push("I3");
			break;
		}
	}
	if (!failed.includes("I3")) {
		for (const c of citationsOf(rs)) {
			const s = rs.sources.find((x) => x.id === c.sourceId);
			if (s && !/^https:\/\//.test(s.url)) {
				failed.push("I3");
				break;
			}
		}
	}
	// Citas dentro de condiciones (vías)
	if (!failed.includes("I3")) {
		for (const r of rs.requirements) {
			if (conditionCitations(r.condition).some((c) => !srcIds.has(c.sourceId))) {
				failed.push("I3");
				break;
			}
		}
	}

	// I4: probable ⇒ hardU == 0 && hardF == 0
	if (ev.verdict === "probable") {
		const hardF = ev.requirements.filter((r) => r.hard && r.status === "F").length;
		const hardU = ev.requirements.filter((r) => r.hard && r.status === "U").length;
		if (hardF > 0 || hardU > 0) failed.push("I4");
	}

	// I5: futureEligibility.from > today && (≤ closesAt || rolling || recurrente)
	if (ev.futureEligibility) {
		const w = rs.application.window;
		const ok =
			ev.futureEligibility.from > ev.today &&
			(w.rolling === true ||
				w.recurrence === "annual" ||
				(w.closesAt !== undefined && ev.futureEligibility.from <= w.closesAt));
		if (!ok) failed.push("I5");
	}

	// I6: total_budget no se renderiza como importe por persona
	if (ev.amount?.type === "total_budget" && ev.amount.displayAsPersonal) {
		failed.push("I6");
	}

	// I7: digest del bundle == digest del manifiesto
	if (ctx.bundleDigest !== undefined || ctx.expectedBundleDigest !== undefined) {
		if (!ctx.bundleDigest || ctx.bundleDigest !== ctx.expectedBundleDigest) {
			failed.push("I7");
		}
	}

	// I8: frescura ≤ 90 días
	if (diffDays(rs.verifiedAt, ev.today) > STALE_DAYS) failed.push("I8");

	// I9: parámetros resueltos con vigencia que cubre referenceDate
	const refDate = rs.referenceDate === "application" ? ev.today : rs.referenceDate;
	for (const p of rs.parametersUsed ?? []) {
		if (resolveParam(ctx.parameters, p, refDate) === undefined) {
			failed.push("I9");
			break;
		}
	}

	// I10: ningún número en las explicaciones que no esté en la evaluación.
	// Permitidos: números del resultado (plazo, importe, esfuerzo, unlocks) y
	// umbrales/contadores de las condiciones del RuleSet.
	const allowed = collectNumbers({
		deadline: ev.deadline,
		amount: ev.amount,
		effort: ev.effort,
		missing: ev.missing.map((m) => m.unlocks),
	});
	for (const r of rs.requirements) collectNumbers(r.condition, allowed);
	for (const r of ev.requirements) {
		for (const v of Object.values(r.reasonParams ?? {})) {
			if (typeof v === "number" && !allowed.has(v)) {
				failed.push("I10");
				break;
			}
		}
	}

	return failed;
}
