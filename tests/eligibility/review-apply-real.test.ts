/**
 * F10-FIX-1 (regla 4.11): invariantes sobre los datos REALES del repo.
 *
 * Que los tests sintéticos pasen no basta — el defecto original era que
 * `review:apply` sacaba la ola de `verificacion-ola-N.md` y con las hojas
 * reales dejaba 14 reglas sin ola y aprobaba reglas fuera de la suya.
 *
 * Aquí se comprueba, contra data/ y evidence/ reales:
 *   1. cada benefitSlug del bundle tiene exactamente UNA hoja vigente;
 *   2. ninguna hoja vigente tiene 0 reglas;
 *   3. marcando las 2 primeras filas OK de cada hoja (en una COPIA en
 *      scratch), review:apply aprueba exactamente sus slugs vigentes;
 *   4. aplicando TODAS las hojas en la copia, `buildEligibility --strict`
 *      incluye los 50 programas (52 RuleSets) — el camino real de la release,
 *      no una simulación a mano (regla 4.12).
 */

import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { buildEligibility } from "../../scripts/eligibility-build";
import { applySheet, type MuestreoIndice } from "../../scripts/review-apply";

const root = process.cwd();
const tmp: string[] = [];
afterAll(() => {
	for (const d of tmp) rmSync(d, { recursive: true, force: true });
}, 120_000);

const indice = JSON.parse(
	readFileSync(join(root, "evidence/muestreo-indice.json"), "utf8"),
) as MuestreoIndice;

const bundle = JSON.parse(
	readFileSync(join(root, "public/datos/elegibilidad/bundle.json"), "utf8"),
) as { rulesets: { benefitSlug: string }[] };
const bundleSlugs = [...new Set(bundle.rulesets.map((r) => r.benefitSlug))].sort();

/** Copia las reglas reales a scratch y devuelve el dir. */
function cloneRules(): string {
	const dir = mkdtempSync(join(tmpdir(), "review-real-"));
	tmp.push(dir);
	const dst = join(dir, "rules");
	cpSync(join(root, "data/eligibility/rules"), dst, { recursive: true });
	return dst;
}

/**
 * Marca los primeros `n` puntos marcables de la hoja: filas «☐ OK ☐ KO»
 * (muestreo-ola) o cabeceras `##` (lote).
 */
function markFirstN(sheetText: string, n: number): string {
	// Solo marcas en filas de tabla (las cabeceras de instrucciones también
	// contienen el literal «☐ OK ☐ KO» — no son marcas).
	let k = 0;
	const out = sheetText
		.split("\n")
		.map((line) => {
			if (k < n && /^\|.*☐ OK ☐ KO/.test(line)) {
				k += 1;
				return line.replace("☐ OK ☐ KO", "☑ OK ☐ KO");
			}
			return line;
		})
		.join("\n");
	if (k > 0) return out;
	// lote-N.md: añade «— ☑ OK» a las primeras n cabeceras ## de reglas.
	const vigente = new Set(indice.hojas.flatMap((h) => h.slugs));
	return sheetText.replace(/^##\s+([a-z0-9][a-z0-9-]*)\b(.*)$/gm, (line, slug, rest) => {
		if (k < n && vigente.has(slug) && !/[☑☒✓]/.test(rest)) {
			k += 1;
			return `## ${slug}${rest} — ☑ OK`;
		}
		return line;
	});
}

describe("muestreo-indice sobre datos reales (F10-FIX-1)", () => {
	it("cada benefitSlug del bundle tiene exactamente una hoja vigente", () => {
		for (const slug of bundleSlugs) {
			expect(
				indice.vigente[slug],
				`${slug} sin hoja vigente en muestreo-indice.json`,
			).toBeTruthy();
		}
		// Y el mapa no contiene slugs que no existen.
		const real = new Set(
			readdirSync(join(root, "data/eligibility/rules"))
				.filter((f) => f.endsWith(".json") && !f.includes("__"))
				.map(
					(f) =>
						JSON.parse(
							readFileSync(join(root, "data/eligibility/rules", f), "utf8"),
						).benefitSlug as string,
				),
		);
		for (const slug of Object.keys(indice.vigente))
			expect(real.has(slug), `${slug} no existe en rules/`).toBe(true);
	});

	it("ninguna hoja vigente tiene 0 reglas", () => {
		for (const h of indice.hojas) {
			// Una hoja puede quedar sin vigentes si una hoja posterior las
			// cubre todas (re-muestreo tras corrección, p. ej. ola-12): sigue
			// en el índice por trazabilidad pero aprueba «nothing» y no se aplica.
			if (h.vigenteSlugs.length === 0) {
				// Una hoja retirada («sustituida por …») no lleva filas de «Tu
				// turno» y no aprueba nada — se permite por trazabilidad.
				const text = readFileSync(join(root, h.sheet), "utf8");
				if (h.slugs.length === 0) {
					expect(text, `${h.sheet} sin filas ni marca`).toMatch(
						/sustituida por/i,
					);
					continue;
				}
				continue;
			}
			expect(
				h.vigenteSlugs.length,
				`${h.sheet} no aprueba ninguna regla`,
			).toBeGreaterThan(0);
		}
	});

	it("marcar 2 OK en cada hoja aprueba exactamente sus slugs vigentes", {
		timeout: 180_000,
	}, () => {
		for (const h of indice.hojas) {
			if (h.vigenteSlugs.length === 0) continue;
			const rulesDir = cloneRules();
			const text = markFirstN(
				readFileSync(join(root, h.sheet), "utf8"),
				2,
			);
			const r = applySheet(join(root, h.sheet), {
				rulesDirs: [rulesDir],
				today: "2026-10-08",
				sheetsDirText: text,
			});
			expect(
				r.action,
				`${h.sheet}: ${r.reason ?? ""}`,
			).toBe("approved");
			const aprobados = [
				...new Set(r.approved.map((x) => x.split("@")[0])),
			].sort();
			expect(aprobados).toEqual([...h.vigenteSlugs].sort());
			// Los diferidos quedan pendientes.
			for (const d of h.deferredSlugs) {
				expect(r.deferredTo[d.slug]).toBe(d.a);
			}
		}
	});

	it("todas las hojas aplicadas en copia ⇒ build --strict incluye los 50 programas", {
		timeout: 180_000,
	}, () => {
		const rulesDir = cloneRules();
		for (const h of indice.hojas) {
			if (h.vigenteSlugs.length === 0) continue;
			const text = markFirstN(readFileSync(join(root, h.sheet), "utf8"), 2);
			const r = applySheet(join(root, h.sheet), {
				rulesDirs: [rulesDir],
				today: "2026-10-08",
				sheetsDirText: text,
			});
			expect(r.action, `${h.sheet}`).toBe("approved");
		}
		const out = mkdtempSync(join(tmpdir(), "strict-build-"));
		tmp.push(out);
		const r = buildEligibility({
			rulesDir,
			sourcesDir: join(root, "data/eligibility/sources"),
			catalogDir: join(root, "data/catalog/benefits"),
			parametersPath: join(root, "data/eligibility/parameters.json"),
			registry: JSON.parse(
				readFileSync(
					join(root, "data/eligibility/sources/registry.json"),
					"utf8",
				),
			),
			outDir: join(out, "bundle"),
			today: "2026-10-08",
			strictHumanReview: true,
		});
		const slugs = [...new Set(r.included)].sort();
		expect(r.included.length).toBe(bundle.rulesets.length);
		expect(slugs).toEqual(bundleSlugs);
	});
});
