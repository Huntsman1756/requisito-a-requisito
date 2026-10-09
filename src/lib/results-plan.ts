/**
 * results-plan — qué entra en el plan de acción y qué se ve en la
 * tarjeta resumida (F10-RES-3). Capa de PRESENTACIÓN: ni veredictos
 * ni reglas cambian.
 *
 *   - La suma «Podrías pedir hasta…» y la lista de documentos solo
 *     cuentan los grupos 1 (Encaja) y 2 (Podría encajar): posibles sin
 *     condición definitoria en U. Nunca «Solo si…» ni «Te faltan
 *     datos».
 *   - Un documento condicionado a una situación NO declarada (su
 *     condición da U) o descartada (F) no entra en la lista del plan:
 *     es «lo que necesitarías tú», no el anexo completo de la norma.
 *   - La tarjeta resumida muestra hasta 3 ✓ y hasta 3 ⚠; los ⚠ se
 *     priorizan: definitorias en U → duras en U → «también exige» →
 *     blandas en U. Nunca líneas de cuantía, compatibilidad ni cálculo
 *     de la base (es contexto, no acceso).
 */

import { type EvalCtx, evalCondition } from "./eligibility-engine/operators";
import type {
	CitizenProfile,
	EvaluationResult,
	Parameters,
	RuleSet,
} from "./eligibility-engine/schema";
import type { ResultEntry, ResultGroups } from "./results-order";

/** Grupos 1 + 2 tal como se pintan abiertas: «Encaja contigo» y
 *  «Podría encajar». Las plegadas «no se pueden descartar» no entran en
 *  la suma ni en los documentos: prometer su cuantía con datos que no
 *  se pueden comprobar sería inflar el plan. «Solo si…» y
 *  «Faltan datos», nunca. */
export function planEntries(g: ResultGroups): ResultEntry[] {
	return [...g.encajas, ...g.posiblesPocas];
}

/** Suma de cuantías con min y max publicados (las «variable» no se
 *  suman: no hay cifra que ofrecer). */
export function planTotal(
	entries: ResultEntry[],
): { min: number; max: number; n: number } | null {
	let min = 0;
	let max = 0;
	let n = 0;
	for (const { ev } of entries) {
		const a = ev.amount;
		if (!a || a.type === "variable") continue;
		if (a.minEur !== undefined && a.maxEur !== undefined) {
			min += a.minEur;
			max += a.maxEur;
			n++;
		}
	}
	return n ? { min, max, n } : null;
}

const ctxFor = (
	rs: RuleSet,
	parameters: Parameters,
	today: string,
): EvalCtx => ({
	parameters,
	referenceDate: rs.referenceDate === "application" ? today : rs.referenceDate,
	today,
});

/** Documentos del plan de acción, deduplicados por etiqueta. Entra un
 *  documento si no tiene condición o si su condición es T con lo
 *  declarado; nunca si queda en U (situación no declarada) ni en F. */
export function planDocuments(
	entries: ResultEntry[],
	profile: CitizenProfile,
	parameters: Parameters,
	today: string,
): { label: string; count: number; slugs: string[] }[] {
	const byLabel = new Map<string, Set<string>>();
	for (const { rs, ev } of entries) {
		if (!ev.selfCheck.passed) continue;
		const ctx = ctxFor(rs, parameters, today);
		for (const d of rs.application.documents) {
			if (
				d.condition &&
				evalCondition(d.condition, profile, ctx).status !== "T"
			)
				continue;
			const set = byLabel.get(d.label) ?? new Set<string>();
			set.add(ev.benefitSlug);
			byLabel.set(d.label, set);
		}
	}
	return (
		[...byLabel.entries()]
			.map(([label, slugs]) => ({
				label,
				count: slugs.size,
				slugs: [...slugs],
			}))
			// Los que cubren más ayudas primero — es la lista «qué necesito».
			.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"))
	);
}

/** Requisitos de contexto (cuantía, compatibilidad, cálculo de la
 *  base): nunca ocupan una de las 3 líneas ⚠ de la tarjeta. */
const SECONDARY =
	/cuant[ií]a|porcentaje|coeficiente|base[ -]?reguladora|pensi[oó]n[ -]?(m[ií]nima|m[aá]xima|inicial)|complemento[ -]?(a[ -])?m[ií]nimos|compatib|incompatib/i;

export function isSecondaryReq(id: string, label: string): boolean {
	return SECONDARY.test(id) || SECONDARY.test(label);
}

export interface WarnLine {
	/** "?": requisito comprobable en U · "warn": «también exige» (uncovered). */
	kind: "u" | "warn";
	label: string;
}

export interface CardSummary {
	cumple: string[];
	cumpleRest: number;
	falta: WarnLine[];
	faltaRest: number;
}

export const MAX_SUMMARY_LINES = 3;

/** Las 3 ✓ y las 3 ⚠ que se ven plegada. `definingIds`: ids de
 *  requisitos definitorios en U (prioridad máxima). */
export function cardSummary(
	rs: RuleSet,
	ev: EvaluationResult,
	definingIds: Set<string> = new Set(),
): CardSummary {
	const labelOf = new Map(rs.requirements.map((r) => [r.id, r.label]));

	const ok = ev.requirements.filter((r) => r.status === "T");
	const cumple = ok
		.slice(0, MAX_SUMMARY_LINES)
		.map((r) => labelOf.get(r.id) ?? r.id);

	const u = ev.requirements.filter((r) => r.status === "U");
	const defU = u.filter((r) => definingIds.has(r.id));
	const hardU = u.filter((r) => !definingIds.has(r.id) && r.hard);
	const softU = u.filter(
		(r) =>
			!definingIds.has(r.id) &&
			!r.hard &&
			!isSecondaryReq(r.id, labelOf.get(r.id) ?? ""),
	);
	const uncovered = rs.uncoveredRequirements.filter(
		(x) => !isSecondaryReq(x.id, x.label),
	);
	const falta: WarnLine[] = [
		...defU.map(
			(r): WarnLine => ({ kind: "u", label: labelOf.get(r.id) ?? r.id }),
		),
		...hardU.map(
			(r): WarnLine => ({ kind: "u", label: labelOf.get(r.id) ?? r.id }),
		),
		...uncovered.map((x): WarnLine => ({ kind: "warn", label: x.label })),
		...softU.map(
			(r): WarnLine => ({ kind: "u", label: labelOf.get(r.id) ?? r.id }),
		),
	];
	return {
		cumple,
		cumpleRest: Math.max(0, ok.length - cumple.length),
		falta: falta.slice(0, MAX_SUMMARY_LINES),
		faltaRest: Math.max(0, falta.length - MAX_SUMMARY_LINES),
	};
}
