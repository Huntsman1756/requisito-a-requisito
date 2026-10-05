/**
 * Estimación de esfuerzo (ADR-009): fórmula propia versionada, nunca dato oficial.
 * v1 = base + páginas de formulario + certificado.
 * Entradas incompletas ⇒ sin estimación.
 */

export const EFFORT_FORMULA_VERSION = "v1.0";

export interface EffortInput {
	requiresCertificate?: boolean;
	formPages?: number;
}

export function effortOf(
	input: EffortInput,
): { minMinutes: number; maxMinutes: number; formulaVersion: string } | undefined {
	const { requiresCertificate, formPages } = input;
	if (requiresCertificate === undefined || formPages === undefined) {
		return undefined;
	}
	const base = 10 + formPages * 5 + (requiresCertificate ? 30 : 0);
	return {
		minMinutes: Math.max(5, Math.round(base * 0.8 / 5) * 5),
		maxMinutes: Math.round(base * 1.5 / 5) * 5,
		formulaVersion: EFFORT_FORMULA_VERSION,
	};
}
