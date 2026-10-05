/**
 * Resolución de parámetros por vigencia (docs/07 §2.1, patrón OpenFisca).
 * El valor vigente es el del periodo que cubre `referenceDate`, no `today`.
 * Sin vigencia que la cubra ⇒ undefined (I9 lo detecta y no hay veredicto).
 */

import type { Parameters } from "./schema";

export function resolveParam(
	parameters: Parameters,
	id: string,
	referenceDate: string,
): number | undefined {
	const p = parameters.parameters.find((x) => x.id === id);
	const period = p?.periods.find(
		(per) =>
			per.from <= referenceDate &&
			(per.to === undefined || per.to >= referenceDate),
	);
	return period?.value;
}
