import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * R7-HONEST: la web pública no puede prometer una frescura que el pipeline
 * no cumple. Mientras haya fuentes `skipped` en el último run (páginas de
 * sedes que el CI no alcanza), ninguna página pública puede afirmar una
 * revisión diaria universal, y el Observatorio debe mostrar los recuentos
 * reales de revisadas vs. periódicas.
 */

const ROOT = join(__dirname, "..", "..");

function lastRun(): {
	date: string;
	checked: number;
	skipped?: string[];
	stale: string[];
} {
	const lines = readFileSync(join(ROOT, "data/freshness/runs.jsonl"), "utf8")
		.trim()
		.split("\n");
	return JSON.parse(lines[lines.length - 1]);
}

const PUBLIC_FILES = [
	join(ROOT, "src/app/page.tsx"),
	join(ROOT, "src/app/como-funciona/page.tsx"),
	join(ROOT, "src/app/observatorio/page.tsx"),
];

// Afirmaciones que solo serían ciertas con skipped = 0.
const UNIVERSAL_DAILY = [
	/revisamos\s+(?:las\s+)?fuentes\s+cada\s+d[ií]a/i,
	/lo\s+revisamos\s+cada\s+d[ií]a(?!\s+las\s+normas)/i,
	/todas\s+las\s+fuentes\s+cada\s+d[ií]a/i,
	/cada\s+fuente.{0,30}cada\s+d[ií]a/is,
];

describe("R7-HONEST — la frescura pública dice la verdad", () => {
	it("runs.jsonl es legible y tiene la forma esperada", () => {
		const r = lastRun();
		expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(r.checked).toBeGreaterThan(0);
		expect(Array.isArray(r.stale)).toBe(true);
	});

	it("si hay fuentes skipped, ninguna página pública promete revisión diaria universal", () => {
		const r = lastRun();
		const skipped = r.skipped?.length ?? 0;
		for (const f of PUBLIC_FILES) {
			const src = readFileSync(f, "utf8");
			for (const re of UNIVERSAL_DAILY) {
				if (skipped > 0) {
					expect(src, `${f} afirma cobertura universal con ${skipped} skipped`).not.toMatch(re);
				}
			}
		}
	});

	it("los ids skipped apuntan a hosts del conjunto conocido (sedes que bloquean el CI)", () => {
		const r = lastRun();
		const skipped = r.skipped ?? [];
		if (skipped.length === 0) return;
		const allowed = /seg-social|comunidad\.madrid/;
		const sourcesDir = join(ROOT, "data/eligibility/sources");
		for (const id of skipped) {
			const meta = JSON.parse(
				readFileSync(join(sourcesDir, `${id}.json`), "utf8"),
			) as { url: string };
			expect(
				allowed.test(new URL(meta.url).host),
				`${id} (${meta.url}) está skipped pero no es un host bloqueado conocido`,
			).toBe(true);
		}
	});

	it("el Observatorio muestra recuentos reales de revisadas vs periódicas", () => {
		const src = readFileSync(
			join(ROOT, "src/app/observatorio/page.tsx"),
			"utf8",
		);
		expect(src).toContain("runs.jsonl");
		expect(src).toMatch(/revisión periódica|periódic/);
		expect(src).toMatch(/cada día/);
	});

	it("los textos públicos distinguen normas diarias y sedes periódicas", () => {
		const src = readFileSync(join(ROOT, "src/app/como-funciona/page.tsx"), "utf8");
		expect(src).toMatch(/cada día las normas/);
		expect(src).toMatch(/periódic/);
	});
});
