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
}

export interface WindowLike {
	opensAt?: string;
	closesAt?: string;
	rolling: boolean;
	conflict?: boolean;
	recurrence?: "none" | "annual";
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
