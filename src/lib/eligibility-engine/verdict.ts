/**
 * Veredicto (docs/07 §4):
 *   hardF>0 → no_cumple · hardU==0 && covered → probable
 *   hardU==0 && !covered → posible · hardU<=satisfied → posible · si no insuficiente
 * softF nunca cambia el veredicto.
 */

import type { TFU } from "./interval";
import type { Verdict } from "./schema";

export interface VerdictInput {
	hard: boolean;
	status: TFU;
}

export function verdictOf(
	requirements: VerdictInput[],
	uncoveredCount: number,
): Verdict {
	const hardF = requirements.filter((r) => r.hard && r.status === "F").length;
	const hardU = requirements.filter((r) => r.hard && r.status === "U").length;
	const satisfied = requirements.filter(
		(r) => r.hard && r.status === "T",
	).length;
	const covered = uncoveredCount === 0;

	if (hardF > 0) return "no_cumple";
	if (hardU === 0 && covered) return "probable";
	if (hardU === 0) return "posible";
	if (hardU <= satisfied) return "posible";
	return "insuficiente";
}
