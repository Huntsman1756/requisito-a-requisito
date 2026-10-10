/** format.ts — fechas y cuantías en lenguaje ciudadano (nada de ISO ni enums). */

const MONTHS = [
	"enero",
	"febrero",
	"marzo",
	"abril",
	"mayo",
	"junio",
	"julio",
	"agosto",
	"septiembre",
	"octubre",
	"noviembre",
	"diciembre",
];

export function formatDateEs(iso: string): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) return iso;
	const [, y, mo, d] = m;
	return `${Number(d)} de ${MONTHS[Number(mo) - 1]} de ${y}`;
}

/** Variante corta («5 oct 2026») para metadatos en espacios estrechos
 *  (pie de las tarjetas de resultados). */
export function formatDateEsShort(iso: string): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) return iso;
	const [, y, mo, d] = m;
	return `${Number(d)} ${MONTHS[Number(mo) - 1].slice(0, 3)} ${y}`;
}

export function formatWindow(w: {
	rolling: boolean;
	opensAt?: string;
	closesAt?: string;
}): string {
	if (w.rolling) return "Plazo continuo";
	if (w.opensAt && w.closesAt)
		return `Del ${formatDateEs(w.opensAt)} al ${formatDateEs(w.closesAt)}`;
	if (w.closesAt) return `Hasta el ${formatDateEs(w.closesAt)}`;
	if (w.opensAt) return `Desde el ${formatDateEs(w.opensAt)}`;
	return "Plazo por confirmar";
}

const PERIOD: Record<string, string> = {
	one_off: "pago único",
	monthly: "al mes",
	annual: "al año",
	one_time: "pago único",
};

export function formatAmount(a: {
	type: string;
	minEur?: number;
	maxEur?: number;
	period?: string;
}): string {
	const eur = (v?: number) =>
		v !== undefined ? `${v.toLocaleString("es-ES")} €` : "";
	const period = a.period && PERIOD[a.period] ? ` (${PERIOD[a.period]})` : "";
	if (a.type === "variable") return "Variable (ver fuente)";
	if (a.minEur !== undefined && a.maxEur !== undefined && a.minEur === a.maxEur)
		return `${eur(a.minEur)}${period}`;
	if (a.minEur !== undefined && a.maxEur !== undefined)
		return `${eur(a.minEur)} a ${eur(a.maxEur)}${period}`;
	return `${eur(a.minEur) || eur(a.maxEur)}${period}`;
}
