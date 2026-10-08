/**
 * F7-6 / regla 4.13: cero cifras huérfanas en la memoria.
 *
 * Extrae cada número de `submission/memoria.md` y exige que aparezca en el
 * `veracidad.json` vigente (el más reciente de `evidence/*\/veracidad.json`)…
 * o en la lista de números estructurales de esta suite (referencias legales,
 * fechas, pesos de la rúbrica, ADR): esos no son cifras medidas, son citas del
 * texto. Si mañana aparece en la memoria un número nuevo sin medida, este test
 * falla.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const memoria = readFileSync(join(root, "submission/memoria.md"), "utf8");

/** Último veracidad.json (los directorios de evidencia ordenan por fecha). */
function veracidadVigente(): { path: string; text: string } {
	const files: string[] = [];
	for (const d of readdirSync(join(root, "evidence"))) {
		const p = join(root, "evidence", d, "veracidad.json");
		if (existsSync(p)) files.push(`${d}/veracidad.json`);
	}
	files.sort();
	const p = files[files.length - 1];
	return { path: `evidence/${p}`, text: readFileSync(join(root, "evidence", p), "utf8") };
}

// Números que no son cifras de impacto/rendimiento sino citas del texto:
// años, la Orden 566/2026, BOE-A-2026-20528, RDL 2/2024, Ley 39/2006, Ley
// 4/2026, ADR-0xx, art. 16.2, pesos de la rúbrica (50/30/20), plazos de fechas
// (01/11, 22/23 de octubre, días del calendario 08-16), conteos pequeños
// documentales (≤10 preguntas, escala 1–5, 3–10 sesiones, 2 de cada ola…).
const ESTRUCTURALES = new Set([
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "10", "11", "12", "13", "14",
	"15", "16", "17", "20", "22", "23", "30", "040", "044", "045", "047",
	"050", "051", "566", "2006", "2024", "2025", "2026", "20528", "05", "06",
	"08", "01",
]);

function normaliza(n: string): string {
	return n.replace(/[.,]/g, "");
}

const nums = new Set<string>();
for (const m of memoria.matchAll(/\b\d+(?:[.,]\d+)*\b/g)) {
	const t = m[0];
	if (ESTRUCTURALES.has(t)) continue;
	nums.add(t);
}

describe("veracidad (F7-6 / regla 4.13)", () => {
	it("toda cifra de la memoria aparece en el veracidad vigente", () => {
		const { path, text } = veracidadVigente();
		const norm = normaliza(text);
		const huerfanas = [...nums].filter(
			(n) => !text.includes(n) && !norm.includes(normaliza(n)),
		);
		expect(huerfanas, `${path} no cubre: ${huerfanas.join(", ")}`).toEqual([]);
	});

	it("el veracidad vigente existe y sus afirmaciones van marcadas ok", () => {
		const { path } = veracidadVigente();
		const doc = JSON.parse(readFileSync(join(root, "evidence", path.split("/").slice(1).join("/")), "utf8"));
		expect(doc.claims.length).toBeGreaterThan(0);
		for (const c of doc.claims) {
			expect(c.ok, `claim sin verificar: ${c.texto}`).toBe(true);
			expect(c.evidencia?.length ?? 0).toBeGreaterThan(0);
		}
	});
});
