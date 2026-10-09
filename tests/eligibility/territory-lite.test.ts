/**
 * territory-lite — el índice que viaja al navegador (F10-PERF) debe estar
 * al día con territory.json y con las reglas. Si una regla cita un
 * municipio nuevo o se regenera el INE, este test falla y hay que ejecutar
 * `npm run territory:lite` (fail-closed, no degradación silenciosa).
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { withinTerritory as withinLite } from "../../src/lib/eligibility-engine/territory-lite";
import { withinTerritory as withinFull } from "../../src/lib/eligibility-engine/territory";

const root = process.cwd();
const full = JSON.parse(
	readFileSync(join(root, "data/eligibility/territory.json"), "utf8"),
);
const lite = JSON.parse(
	readFileSync(join(root, "data/eligibility/territory-lite.json"), "utf8"),
);

const walk = function* (x: unknown): Generator<Record<string, unknown>> {
	if (!x || typeof x !== "object") return;
	if (Array.isArray(x)) {
		for (const v of x) yield* walk(v);
		return;
	}
	const o = x as Record<string, unknown>;
	if (o.op === "within_territory") yield o;
	for (const v of Object.values(o)) yield* walk(v);
};

const ruleMunis = new Set<string>();
for (const f of readdirSync(join(root, "data/eligibility/rules")).filter((x) =>
	x.endsWith(".json"),
)) {
	const rs = JSON.parse(
		readFileSync(join(root, "data/eligibility/rules", f), "utf8"),
	);
	for (const c of walk(rs)) {
		const m = (c.value as { municipality?: string })?.municipality;
		if (m) ruleMunis.add(m);
	}
}

describe("territory-lite (índice del navegador)", () => {
	it("está al día con territory.json y las reglas", () => {
		const expected = {
			source: lite.source,
			ccaa: full.ccaa,
			provinces: full.provinces,
			municipalities: full.municipalities.filter(
				(m: { province: string; code: string }) =>
					m.province === "28" || ruleMunis.has(m.code),
			),
		};
		expect(lite.municipalities).toEqual(expected.municipalities);
		expect(lite.ccaa).toEqual(expected.ccaa);
		expect(lite.provinces).toEqual(expected.provinces);
	});

	it("todo municipio citado por una regla existe en el INE y está en el lite", () => {
		expect(ruleMunis.size).toBeGreaterThan(0);
		const fullSet = new Set(
			full.municipalities.map((m: { code: string }) => m.code),
		);
		const liteSet = new Set(
			lite.municipalities.map((m: { code: string }) => m.code),
		);
		for (const code of ruleMunis) {
			expect(fullSet.has(code), `${code} no existe en el INE`).toBe(true);
			expect(liteSet.has(code), `${code} falta en territory-lite`).toBe(true);
		}
	});

	it("withinTerritory coincide con el INE completo para lo que la UI puede producir", () => {
		// Municipios de Madrid, provincia 28, CCAA 13 y «sin municipio» — los
		// únicos valores que el asistente puede escribir.
		const users = [
			{ ccaa: "13", province: "28", municipality: "28079" },
			{ municipality: "28065" },
			{ province: "28" },
			{ ccaa: "13" },
			{ ccaa: "09" },
			{},
		];
		const rules = [
			{ municipality: "28079" },
			{ municipality: "28058" },
			{ municipality: "28074" },
			{ municipality: "28092" },
			{ province: "28" },
			{ ccaa: "13" },
			{ ccaa: "17" },
			{},
		];
		for (const u of users)
			for (const r of rules)
				expect(
					withinLite(u, r),
					`${JSON.stringify(u)} ⊂ ${JSON.stringify(r)}`,
				).toBe(withinFull(u, r));
	});
});
