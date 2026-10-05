/**
 * Claves de explicación (docs/07 §7, ADR-024). Solo claves i18n `elig_*` y
 * parámetros que ya están en la evaluación (I10 lo verifica). El texto final
 * lo renderiza la UI en F4, en español claro (≤20 palabras, sin jerga).
 */

import type { TFU } from "./interval";
import type { Uncertainty } from "./operators";

export function reasonKeyFor(status: TFU, uncertainty?: Uncertainty): string {
	if (status === "T") return "elig_req_pass";
	if (status === "F") return "elig_req_fail";
	const suffix =
		uncertainty === "range_straddles"
			? "range"
			: uncertainty === "territory_partial"
				? "territory"
				: uncertainty === "declined"
					? "declined"
					: uncertainty === "conflict"
						? "conflict"
						: uncertainty === "unknown"
							? "unknown"
							: "unasked";
	return `elig_req_unknown_${suffix}`;
}

export function evaluationKeys(e: {
	verdict: string;
	missing: unknown[];
	blockers: unknown[];
	futureEligibility?: unknown;
	deadline: { state: string; urgent?: boolean; conflict?: boolean };
	staleness?: string;
	uncovered: unknown[];
}): string[] {
	const keys = [`elig_verdict_${e.verdict}`];
	if (e.missing.length > 0) keys.push("elig_missing_n");
	if (e.blockers.length > 0) keys.push("elig_blockers_n");
	if (e.futureEligibility) keys.push("elig_future");
	keys.push(`elig_deadline_${e.deadline.state.toLowerCase()}`);
	if (e.deadline.urgent) keys.push("elig_deadline_urgent");
	if (e.deadline.conflict) keys.push("elig_deadline_conflict");
	if (e.staleness === "aging") keys.push("elig_stale_aging");
	if (e.staleness === "stale") keys.push("elig_stale_stale");
	if (e.uncovered.length > 0) keys.push("elig_uncovered_n");
	return keys;
}
