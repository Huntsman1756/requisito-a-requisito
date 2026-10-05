/**
 * Campos derivados (docs/07 §3.4, F2-6).
 * `today`/`referenceDate` siempre inyectados: nada de Date.now().
 */

import type { Interval } from "./interval";

export interface MonthYear {
	year: number;
	month: number;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeap(y: number): boolean {
	return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m: number): number {
	return m === 2 ? (isLeap(y) ? 29 : 28) : DAYS_IN_MONTH[m - 1];
}

function parseDate(d: string): { y: number; m: number; day: number } {
	const [y, m, day] = d.split("-").map(Number);
	return { y, m, day };
}

function daysSinceEpoch(y: number, m: number, day: number): number {
	// Días desde 0000-03-01 (algoritmo civil)
	const yy = m <= 2 ? y - 1 : y;
	const era = Math.floor(yy / 400);
	const yoe = yy - era * 400;
	const mp = (m + 9) % 12;
	const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
	const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
	return era * 146097 + doe;
}

export function addDays(isoDate: string, days: number): string {
	const { y, m, day } = parseDate(isoDate);
	const z = daysSinceEpoch(y, m, day) + days;
	const era = Math.floor(z / 146097);
	const doe = z - era * 146097;
	const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
	const yy = yoe + era * 400;
	const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
	const mp = Math.floor((5 * doy + 2) / 153);
	const dd = doy - Math.floor((153 * mp + 2) / 5) + 1;
	const mm = mp + (mp < 10 ? 3 : -9);
	const yyyy = mm <= 2 ? yy + 1 : yy;
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${yyyy}-${pad(mm)}-${pad(dd)}`;
}

export function diffDays(fromIso: string, toIso: string): number {
	const a = parseDate(fromIso);
	const b = parseDate(toIso);
	return daysSinceEpoch(b.y, b.m, b.day) - daysSinceEpoch(a.y, a.m, a.day);
}

/**
 * Meses enteros transcurridos entre dos fechas completas.
 * monthsBetween("2026-03-05","2026-10-08") = 7.
 */
export function monthsBetween(fromIso: string, toIso: string): number {
	const a = parseDate(fromIso);
	const b = parseDate(toIso);
	let months = (b.y - a.y) * 12 + (b.m - a.m);
	if (b.day < a.day) months -= 1;
	return months;
}

/**
 * Mes/año de alta en padrón → intervalo de meses de residencia a refDate.
 * El día exacto es desconocido: [meses hasta fin de mes, meses desde día 1].
 * residenceMonths(2026-08) a 2026-10-08 = [1,2].
 */
export function residenceMonthsInterval(
	monthYear: MonthYear,
	refDate: string,
): Interval {
	const last = daysInMonth(monthYear.year, monthYear.month);
	const lo = monthsBetween(
		`${monthYear.year}-${String(monthYear.month).padStart(2, "0")}-${String(last).padStart(2, "0")}`,
		refDate,
	);
	const hi = monthsBetween(
		`${monthYear.year}-${String(monthYear.month).padStart(2, "0")}-01`,
		refDate,
	);
	return { min: Math.max(0, Math.min(lo, hi)), max: Math.max(0, Math.max(lo, hi)), maxExclusive: false };
}

/**
 * Fecha de nacimiento (o su intervalo) → edad en años cumplidos a refDate,
 * como intervalo [min,max] entero.
 */
export function ageFromBirthDate(birthIso: string, refDate: string): number {
	const b = parseDate(birthIso);
	const r = parseDate(refDate);
	let age = r.y - b.y;
	if (r.m < b.m || (r.m === b.m && r.day < b.day)) age -= 1;
	return age;
}

/**
 * Nacimiento conocido solo por mes/año → edad ∈ [a,a+1] a refDate.
 */
export function ageIntervalFromMonthYear(
	birth: MonthYear,
	refDate: string,
): Interval {
	const last = daysInMonth(birth.year, birth.month);
	const youngest = ageFromBirthDate(
		`${birth.year}-${String(birth.month).padStart(2, "0")}-01`,
		refDate,
	);
	const oldest = ageFromBirthDate(
		`${birth.year}-${String(birth.month).padStart(2, "0")}-${String(last).padStart(2, "0")}`,
		refDate,
	);
	return { min: Math.min(youngest, oldest), max: Math.max(youngest, oldest), maxExclusive: false };
}

export function addMonths(isoDate: string, months: number): string {
	const { y, m, day } = parseDate(isoDate);
	const total = y * 12 + (m - 1) + months;
	const yy = Math.floor(total / 12);
	const mm = (total % 12) + 1;
	const dd = Math.min(day, daysInMonth(yy, mm));
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${yy}-${pad(mm)}-${pad(dd)}`;
}
