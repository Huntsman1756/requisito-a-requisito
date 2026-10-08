/**
 * Estado del plazo (docs/07 §6).
 * OPEN / UPCOMING / CLOSED / ROLLING / UNKNOWN. El último día cuenta completo;
 * urgente < 5 días. Fechas ISO, día entero (zona Europe/Madrid = misma fecha).
 */

import { diffDays } from "./derived";
import type { DeadlineState } from "./schema";

export interface DeadlineResult {
	state: DeadlineState;
	opensAt?: string;
	closesAt?: string;
	daysLeft?: number;
	urgent?: boolean;
	conflict?: boolean;
	nextOpeningEstimate?: string;
}

export interface WindowLike {
	opensAt?: string;
	closesAt?: string;
	rolling: boolean;
	conflict?: boolean;
	recurrence?: "none" | "annual";
	previousCalls?: { opensAt: string; closesAt: string }[];
}

export const URGENT_DAYS = 5;

export function deadlineState(w: WindowLike, today: string): DeadlineResult {
	if (w.conflict === true) {
		return { state: "UNKNOWN", conflict: true };
	}
	if (w.rolling) return { state: "ROLLING" };
	if (!w.opensAt && !w.closesAt) return { state: "UNKNOWN" };
	if (w.opensAt && today < w.opensAt) {
		return {
			state: "UPCOMING",
			opensAt: w.opensAt,
			closesAt: w.closesAt,
			daysLeft: diffDays(today, w.opensAt),
		};
	}
	if (w.closesAt && today > w.closesAt) {
		// CLOSED_RECURRING: convocatoria cerrada pero anual con ≥2 ediciones
		// anuales consecutivas citadas (ADR-038). Estimación: la última
		// apertura conocida (incluida la de la ventana vigente) + ~1 año. Si el
		// resultado ya pasó, se omite la fecha: nunca se muestra una estimación
		// en el pasado ni se encadenan +1 año sobre un programa que pudo dejar
		// de convocarse (F10-FIAB).
		if (w.recurrence === "annual") {
			const calls = [...(w.previousCalls ?? [])].sort((a, b) =>
				a.opensAt.localeCompare(b.opensAt),
			);
			const years = calls.map((c) => c.opensAt.slice(0, 4));
			const consecutive =
				calls.length >= 2 &&
				years.every((y, i) => i === 0 || Number(y) === Number(years[i - 1]) + 1);
			if (consecutive) {
				const lastKnown = [w.opensAt, calls[calls.length - 1].opensAt]
					.filter((x): x is string => x !== undefined)
					.sort()
					.at(-1) as string;
				const [y, m, d] = lastKnown.split("-").map(Number);
				const estimate = `${y + 1}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
				return {
					state: "CLOSED_RECURRING",
					closesAt: w.closesAt,
					nextOpeningEstimate: estimate > today ? estimate : undefined,
				};
			}
		}
		return { state: "CLOSED", closesAt: w.closesAt };
	}
	// Abierta: el último día (today == closesAt) cuenta completo.
	const daysLeft = w.closesAt ? diffDays(today, w.closesAt) : undefined;
	return {
		state: "OPEN",
		opensAt: w.opensAt,
		closesAt: w.closesAt,
		daysLeft,
		urgent: daysLeft !== undefined && daysLeft < URGENT_DAYS ? true : undefined,
	};
}
