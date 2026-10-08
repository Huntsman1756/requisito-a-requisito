/**
 * piloto-agregados.ts — F10-IMP-2
 *
 * `npx tsx scripts/piloto-agregados.ts <piloto.json>` calcula los agregados del
 * piloto **solo con lo medido**: mediana del tiempo, sesiones completadas,
 * ayudas descubiertas, intención de solicitar, comprensión y contraste con la
 * web oficial. Con n < 10 se dan cifras absolutas, nunca porcentajes
 * (reglas de honestidad del piloto, F10 §2.3).
 */

import { readFileSync } from "node:fs";

type Session = {
	id: string;
	date: string;
	channel?: string;
	profile?: string;
	consent?: boolean;
	timeSeconds?: number;
	taskCompleted?: string;
	comprehension1to5?: number;
	foundAidsUnknown?: number;
	foundAidsUnknownSlugs?: string[];
	intendsToApply?: string;
	officialSiteContrast?: string;
	quote?: { permitted?: boolean; text?: string; attribution?: string };
};

function median(xs: number[]): number | null {
	if (xs.length === 0) return null;
	const s = [...xs].sort((a, b) => a - b);
	const m = Math.floor(s.length / 2);
	return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function mmss(sec: number): string {
	return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
}

function main() {
	const path = process.argv[2];
	if (!path) {
		console.error("uso: npx tsx scripts/piloto-agregados.ts <piloto.json>");
		process.exit(1);
	}
	const doc = JSON.parse(readFileSync(path, "utf8")) as {
		sessions?: Session[];
	};
	const ses = (doc.sessions ?? []).filter((s) => s.date && !s.date.includes("XX"));

	if (ses.length === 0) {
		console.log("piloto: 0 sesiones registradas (declarado así en la memoria)");
		return;
	}

	const times = ses
		.map((s) => s.timeSeconds)
		.filter((t): t is number => typeof t === "number" && t > 0);
	const completed = ses.filter((s) => s.taskCompleted === "si");
	const withHelp = ses.filter((s) => s.taskCompleted === "con-ayuda");
	const comp = ses
		.map((s) => s.comprehension1to5)
		.filter((c): c is number => typeof c === "number" && c > 0);
	const discovered = ses.reduce(
		(acc, s) => acc + (s.foundAidsUnknown ?? 0),
		0,
	);
	const intend = ses.filter((s) => s.intendsToApply === "si");
	const contrast = ses.filter(
		(s) => s.officialSiteContrast && s.officialSiteContrast !== "no-hecha",
	);
	const contrastOk = contrast.filter((s) => s.officialSiteContrast === "si");
	const quotes = ses.filter((s) => s.quote?.permitted && s.quote.text);

	const n = ses.length;
	console.log(`Sesiones: ${n}`);
	const med = median(times);
	if (times.length && med !== null)
		console.log(
			`Tiempo a resultados: mediana ${mmss(med)} (${times.length} medidas)`,
		);
	console.log(
		`Tarea completada: ${completed.length} sola, ${withHelp.length} con ayuda, ${n - completed.length - withHelp.length} no`,
	);
	if (comp.length)
		console.log(
			`Comprensión 1–5: mediana ${median(comp)} (${comp.length}/${n} respondieron)`,
		);
	console.log(`Ayudas descubiertas que no conocían: ${discovered} en total`);
	console.log(`Piensa solicitar alguna: ${intend.length} de ${n}`);
	if (contrast.length)
		console.log(
			`Contraste web oficial: ${contrastOk.length} de ${contrast.length} encontró la ayuda sola`,
		);
	console.log(`Testimonios con permiso: ${quotes.length}`);
	if (n < 10)
		console.log(
			"Nota: n < 10 — cifras absolutas en la memoria, nunca porcentajes ni «representativo».",
		);
}

main();
