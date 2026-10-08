/**
 * F10-META-MOSTOLES (regla 4.11): sobre las 52 reglas reales, los parámetros
 * usados en las condiciones tienen que cuadrar con `parametersUsed`, en las
 * dos direcciones — ningún `param` sin declarar y ningún declarado sin uso.
 * Además, todo `param` usado existe en data/eligibility/parameters.json.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ruleSetSchema } from "../../src/lib/eligibility-engine/schema";

const RULES = join(process.cwd(), "data/eligibility/rules");
const params = JSON.parse(
	readFileSync(join(process.cwd(), "data/eligibility/parameters.json"), "utf8"),
);
const paramNames = new Set<string>(
	(params.parameters ?? []).map((p: { id: string }) => p.id),
);

function paramsOf(cond: unknown, acc = new Set<string>()): Set<string> {
	if (Array.isArray(cond)) {
		for (const c of cond) paramsOf(c, acc);
		return acc;
	}
	if (cond && typeof cond === "object") {
		const o = cond as Record<string, unknown>;
		if (typeof o.param === "string") acc.add(o.param);
		for (const k of ["any", "all", "not", "where"]) {
			if (o[k] !== undefined) paramsOf(o[k], acc);
		}
	}
	return acc;
}

describe("parametersUsed ⇄ condiciones (todas las reglas reales)", () => {
	const files = readdirSync(RULES).filter((f) => f.endsWith(".json"));
	it("cada param usado está declarado, cada declarado se usa y existe", () => {
		const errores: string[] = [];
		for (const f of files) {
			const rs = ruleSetSchema.parse(
				JSON.parse(readFileSync(join(RULES, f), "utf8")),
			);
			const usados = new Set<string>();
			for (const r of rs.requirements) paramsOf(r.condition, usados);
			// Los documentos condicionales también pueden llevar `param`.
			for (const d of rs.application.documents ?? [])
				paramsOf(d.condition, usados);
			const declarados = new Set(rs.parametersUsed ?? []);
			for (const p of usados) {
				if (!declarados.has(p))
					errores.push(`${rs.benefitSlug}: usa ${p} sin declararlo`);
				if (!paramNames.has(p))
					errores.push(`${rs.benefitSlug}: ${p} no existe en parameters.json`);
			}
			for (const p of declarados) {
				if (!usados.has(p))
					errores.push(`${rs.benefitSlug}: declara ${p} sin usarlo`);
			}
		}
		expect(errores).toEqual([]);
	});
});
