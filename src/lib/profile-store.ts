/**
 * profile-store.ts — persistencia del perfil del ciudadano (F4-9/14).
 *
 * Contrato: las respuestas NUNCA van a la URL, cookies ni servidores.
 * - sessionStorage (`handoff`): paso actual + respuestas de esta pestaña.
 * - localStorage (`profile`, opcional): solo si el usuario marca «recordar».
 * «Borrar mis respuestas» limpia ambos.
 */

import type { CitizenProfile } from "./eligibility-engine/schema";

export const HANDOFF_KEY = "rr_check_handoff";
export const PROFILE_KEY = "rr_profile";

export interface Handoff {
	step: number;
	answers: CitizenProfile["answers"];
	savedAt: string;
}

const isBrowser = () => typeof window !== "undefined";

export function readHandoff(): Handoff | null {
	if (!isBrowser()) return null;
	try {
		const raw = window.sessionStorage.getItem(HANDOFF_KEY);
		return raw ? (JSON.parse(raw) as Handoff) : null;
	} catch {
		return null;
	}
}

export function writeHandoff(h: Handoff): void {
	if (!isBrowser()) return;
	window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(h));
}

export function readProfile(): CitizenProfile["answers"] | null {
	if (!isBrowser()) return null;
	try {
		const raw = window.localStorage.getItem(PROFILE_KEY);
		return raw ? (JSON.parse(raw) as Handoff).answers : null;
	} catch {
		return null;
	}
}

export function writeProfile(h: Handoff): void {
	if (!isBrowser()) return;
	window.localStorage.setItem(PROFILE_KEY, JSON.stringify(h));
}

export function clearAll(): void {
	if (!isBrowser()) return;
	window.sessionStorage.removeItem(HANDOFF_KEY);
	window.localStorage.removeItem(PROFILE_KEY);
}
