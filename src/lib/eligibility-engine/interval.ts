/**
 * Intervalos y comparación con umbral (docs/07 §3.1).
 * Un dato impreciso ES un intervalo; los límites `null` son abiertos.
 * `maxExclusive` (por defecto true) = el valor max no pertenece.
 */

export interface Interval {
	min: number | null;
	max: number | null;
	maxExclusive?: boolean;
}

export type TFU = "T" | "F" | "U";

const NEG = Number.NEGATIVE_INFINITY;
const POS = Number.POSITIVE_INFINITY;

function lo(i: Interval): number {
	return i.min === null ? NEG : i.min;
}

function hi(i: Interval): number {
	return i.max === null ? POS : i.max;
}

function hiExclusive(i: Interval): boolean {
	return i.maxExclusive !== false;
}

export function isExact(i: Interval): boolean {
	return i.min !== null && i.max === i.min && !hiExclusive(i);
}

/**
 * ¿Todo el intervalo está estrictamente por debajo de t?
 * [lo,hi) < t  ⇔  hi < t  ∨  (hi == t ∧ exclusivo)
 */
export function intervalLt(i: Interval, t: number): TFU {
	if (hi(i) < t || (hi(i) === t && hiExclusive(i))) return "T";
	if (lo(i) >= t) return "F";
	return "U";
}

/** Todo el intervalo ≤ t: hi < t ∨ hi == t (da igual el borde). */
export function intervalLte(i: Interval, t: number): TFU {
	if (hi(i) <= t) return "T";
	if (lo(i) > t || (lo(i) === t && hiExclusive(i))) return "F";
	return "U";
}

/** Todo el intervalo > t: lo > t. Si lo == t, los valores > t existen salvo punto exacto. */
export function intervalGt(i: Interval, t: number): TFU {
	if (lo(i) > t) return "T";
	if (isExact(i) && i.min === t) return "F";
	if (hi(i) <= t || (hi(i) === t && hiExclusive(i))) return "F";
	return "U";
}

/** Todo el intervalo ≥ t: lo ≥ t. */
export function intervalGte(i: Interval, t: number): TFU {
	if (lo(i) >= t) return "T";
	if (hi(i) < t || (hi(i) === t && hiExclusive(i))) return "F";
	return "U";
}

/**
 * Intervalo dentro de [a,b] (o (a,b) según `inclusive`).
 * `inclusive: [true,false]` => la cita dice "más de a y hasta b".
 */
export function intervalBetween(
	i: Interval,
	a: number,
	b: number,
	inclusive: [boolean, boolean] = [true, true],
): TFU {
	const lower = inclusive[0] ? intervalGte(i, a) : intervalGt(i, a);
	const upper = inclusive[1] ? intervalLte(i, b) : intervalLt(i, b);
	if (lower === "F" || upper === "F") return "F";
	if (lower === "T" && upper === "T") return "T";
	return "U";
}
