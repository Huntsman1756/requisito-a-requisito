/**
 * veredicto por tabla de verdad literal (I2): segunda implementación
 * independiente de verdict.ts — NO comparte código.
 *
 * Tabla completa sobre (hardF>0, hardU==0, covered, hardU<=satisfied):
 * se escribe explícita a partir de docs/07 §4.
 */

import type { TFU } from "./interval";
import type { Verdict } from "./schema";

// [hardF>0, hardU==0, covered, hardU<=satisfied] -> veredicto
const TABLE: Record<string, Verdict> = {
	// hardF>0: 8 filas, siempre no_cumple
	"1-0-0-0": "no_cumple",
	"1-0-0-1": "no_cumple",
	"1-0-1-0": "no_cumple",
	"1-0-1-1": "no_cumple",
	"1-1-0-0": "no_cumple",
	"1-1-0-1": "no_cumple",
	"1-1-1-0": "no_cumple",
	"1-1-1-1": "no_cumple",
	// hardF==0, hardU==0
	"0-1-1-0": "probable",
	"0-1-1-1": "probable",
	"0-1-0-0": "posible",
	"0-1-0-1": "posible",
	// hardF==0, hardU>0
	"0-0-0-0": "insuficiente",
	"0-0-1-0": "insuficiente",
	"0-0-0-1": "posible",
	"0-0-1-1": "posible",
};

export function oracleVerdict(
	requirements: { hard: boolean; status: TFU }[],
	uncoveredCount: number,
): Verdict {
	let hardF = 0;
	let hardU = 0;
	let satisfied = 0;
	for (const r of requirements) {
		if (!r.hard) continue;
		if (r.status === "F") hardF++;
		else if (r.status === "U") hardU++;
		else if (r.status === "T") satisfied++;
	}
	const key = [
		hardF > 0 ? 1 : 0,
		hardU === 0 ? 1 : 0,
		uncoveredCount === 0 ? 1 : 0,
		hardU <= satisfied ? 1 : 0,
	].join("-");
	const v = TABLE[key];
	if (!v) throw new Error(`oracle: combinación imposible ${key}`);
	return v;
}
