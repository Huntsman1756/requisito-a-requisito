// R4-AZUL: las reglas que usan IPREM deben declarar de forma probatoria
// qué IPREM aplica la norma (12 o 14 pagas). IPREM_ANUAL_14P solo se admite
// en las reglas cuya norma cita literalmente «14 pagas» o cuyo criterio oficial
// publicado usa el IPREM anual con pagas (Plan Estatal de Vivienda, bono social).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DIR = join(process.cwd(), "data/eligibility/rules");

// Uso autorizado de IPREM_ANUAL_14P y su justificación literal:
// - bono-social-{electrico,termico}: la norma dice «IPREM de 14 pagas»
// - *alquiler*|*alquiler-joven*: Plan Estatal (RD 42/2022) — criterio oficial
//   publicado: IPREM anual con pagas extraordinarias
const ALLOWED_14P = new Set([
	"bono-social-electrico",
	"bono-social-termico",
	"madrid-ayudas-alquiler-plan-estatal",
	"madrid-bono-alquiler-joven",
]);

function* paramsOf(node: unknown): Generator<string> {
	if (Array.isArray(node)) for (const x of node) yield* paramsOf(x);
	else if (node && typeof node === "object")
		for (const v of Object.values(node)) yield* paramsOf(v);
	else if (typeof node === "string" && node.startsWith("IPREM_")) yield node;
}

describe("R4-AZUL · IPREM nunca más laxo que la norma", () => {
	for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
		it(f, () => {
			const d = JSON.parse(readFileSync(join(DIR, f), "utf8"));
			const params = new Set(paramsOf(d));
			if (params.has("IPREM_ANUAL_14P")) {
				expect(
					ALLOWED_14P.has(d.benefitSlug),
					`${d.benefitSlug}: IPREM_ANUAL_14P requiere justificación «14 pagas» en la norma`,
				).toBe(true);
			}
		});
	}
});
