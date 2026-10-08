/**
 * B3.4: el JSON Schema normativo (schemas/rule-set.schema.json) y el ejemplo
 * mínimo (tests/eligibility/fixtures/rule-set.example.json) no se pueden
 * divorciar: el ejemplo pasa el contrato Zod, y aquí comprobamos contra el
 * JSON Schema publicado sus required y additionalProperties=false.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const schema = JSON.parse(
	readFileSync(
		join(process.cwd(), "schemas/rule-set.schema.json"),
		"utf8",
	),
);
const example = JSON.parse(
	readFileSync(
		join(process.cwd(), "tests/eligibility/fixtures/rule-set.example.json"),
		"utf8",
	),
);

describe("schemas/rule-set.schema.json (documento normativo)", () => {
	it("es JSON Schema 2020-12 y declara el contrato cerrado", () => {
		expect(schema.$schema).toContain("2020-12");
		expect(schema.type).toBe("object");
		expect(schema.additionalProperties).toBe(false);
	});

	it("el ejemplo mínimo cumple los required del JSON Schema", () => {
		for (const k of schema.required as string[]) {
			expect(example, `falta ${k}`).toHaveProperty(k);
		}
	});

	it("el ejemplo no lleva propiedades ajenas al esquema", () => {
		const allowed = new Set(Object.keys(schema.properties));
		const extra = Object.keys(example).filter((k) => !allowed.has(k));
		expect(extra).toEqual([]);
	});

	it("todos los RuleSets reales respetan required + propiedades cerradas", async () => {
		const { readdirSync } = await import("node:fs");
		const dir = join(process.cwd(), "data/eligibility/rules");
		for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
			const rs = JSON.parse(readFileSync(join(dir, f), "utf8"));
			for (const k of schema.required as string[]) {
				expect(rs, `${f} sin ${k}`).toHaveProperty(k);
			}
			const extra = Object.keys(rs).filter(
				(k) => !(k in schema.properties),
			);
			expect(extra, `${f}: ${extra.join()}`).toEqual([]);
		}
	});
});
