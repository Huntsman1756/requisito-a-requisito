/**
 * results-order — orden y agrupado de la pantalla de resultados (F10-RES).
 * Regla de negocio de PRESENTACIÓN (los veredictos no cambian):
 *
 *   1. «Encaja» (probable, o posible con todo lo comprobable en T y nada en F)
 *   2. «Posible» con pocas incógnitas (≤2 U y ninguna blanda en F)
 *   3. «No se puede descartar»: posible con muchas incógnitas o alguna
 *      blanda ya en F — se muestra plegado con su número
 *   4. «Faltan datos» (insuficiente), al final
 *   5. «No aplica» (no_cumple) va aparte y plegada (ya lo era)
 *
 * Dentro de cada grupo: más requisitos cumplidos primero; a igualdad,
 * menos incógnitas primero; a igualdad, título alfabético.
 */

import type {
	EvaluationResult,
	RuleSet,
} from "./eligibility-engine/schema";
import { aidTitle } from "./aid-titles";

/** «Encaja»: veredicto probable, o posible con todos los duros
 *  comprobables en T y NINGÚN requisito en F (ni duro ni blando). */
export function isEncaja(ev: EvaluationResult): boolean {
	return (
		ev.verdict === "probable" ||
		(ev.verdict === "posible" &&
			ev.requirements.every(
				(r) => (!r.hard || r.status === "T") && r.status !== "F",
			) &&
			ev.requirements.some((r) => r.hard && r.status === "T"))
	);
}

export const nT = (ev: EvaluationResult) =>
	ev.requirements.filter((r) => r.status === "T").length;
export const nU = (ev: EvaluationResult) =>
	ev.requirements.filter((r) => r.status === "U").length;

/** Pocas incógnitas por resolver ⇒ la tarjeta va abierta; si no, plegada. */
export const MAX_OPEN_UNKNOWNS = 2;

export interface ResultEntry {
	rs: RuleSet;
	ev: EvaluationResult;
}
export interface ResultGroups {
	encajas: ResultEntry[];
	posiblesPocas: ResultEntry[];
	noDescartar: ResultEntry[];
	faltanDatos: ResultEntry[];
	noCumple: ResultEntry[];
	notEvaluable: ResultEntry[];
}

export function groupResults(
	evaluations: ResultEntry[],
	showClosed: boolean,
): ResultGroups {
	const ok = ({ ev }: ResultEntry) => ev.selfCheck.passed;
	const open = ({ ev }: ResultEntry) =>
		showClosed || ev.deadline.state !== "CLOSED";
	const byFit = (a: ResultEntry, b: ResultEntry) =>
		nT(b.ev) - nT(a.ev) ||
		nU(a.ev) - nU(b.ev) ||
		aidTitle(a.ev.benefitSlug).localeCompare(
			aidTitle(b.ev.benefitSlug),
			"es",
		);
	const verdict = (v: string) =>
		evaluations.filter((x) => x.ev.verdict === v && ok(x));

	const hasF = (ev: EvaluationResult) =>
		ev.requirements.some((r) => r.status === "F");

	return {
		encajas: evaluations
			.filter((x) => ok(x) && open(x) && isEncaja(x.ev))
			.sort(byFit),
		posiblesPocas: verdict("posible")
			.filter((x) => !isEncaja(x.ev) && !hasF(x.ev) && nU(x.ev) <= MAX_OPEN_UNKNOWNS)
			.filter(open)
			.sort(byFit),
		noDescartar: verdict("posible")
			.filter(
				(x) => !isEncaja(x.ev) && (hasF(x.ev) || nU(x.ev) > MAX_OPEN_UNKNOWNS),
			)
			.filter(open)
			.sort(byFit),
		faltanDatos: verdict("insuficiente").filter(open).sort(byFit),
		noCumple: verdict("no_cumple").sort(byFit),
		notEvaluable: evaluations.filter((x) => !ok(x)),
	};
}
