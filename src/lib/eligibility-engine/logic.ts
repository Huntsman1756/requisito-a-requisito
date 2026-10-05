/**
 * Lógica de Kleene sobre T/F/U (docs/07 §3.2).
 *   all: algún F ⇒ F; si no, algún U ⇒ U; si no T
 *   any: algún T ⇒ T; si no, algún U ⇒ U; si no F
 *   not: T↔F, U⇒U
 * Monotonía garantizada: completar una U nunca cambia T/F.
 */

import type { TFU } from "./interval";

export function kleeneAll(results: TFU[]): TFU {
	if (results.includes("F")) return "F";
	if (results.includes("U")) return "U";
	return "T";
}

export function kleeneAny(results: TFU[]): TFU {
	if (results.includes("T")) return "T";
	if (results.includes("U")) return "U";
	return "F";
}

export function kleeneNot(r: TFU): TFU {
	return r === "T" ? "F" : r === "F" ? "T" : "U";
}
