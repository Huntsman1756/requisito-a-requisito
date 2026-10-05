import { describe, expect, it } from "vitest";
import {
	type EvalCtx,
	evalCondition,
} from "../../src/lib/eligibility-engine/operators";
import type { Condition, Parameters } from "../../src/lib/eligibility-engine/schema";

const params: Parameters = {
	parameters: [
		{
			id: "IPREM_ANUAL_14P",
			label: "IPREM",
			unit: "EUR_YEAR",
			periods: [
				{
					from: "2023-01-01",
					value: 8400,
					citation: { sourceId: "s", locator: "xx", excerpt: "extracto x", excerptSha256: "0".repeat(64) },
				},
			],
		},
	],
};

const ctx: EvalCtx = { parameters: params, referenceDate: "2026-10-08", today: "2026-10-08" };
const ctxOld: EvalCtx = { ...ctx, referenceDate: "2020-01-01" };

const prof = (field: string, answer: { state: "unknown" | "declined" | "unasked" } | { state: "value"; value: unknown }) => ({
	answers: { [field]: answer },
});
const val = (v: unknown) => ({ state: "value" as const, value: v });

describe("operadores §2.2", () => {
	it("eq/neq/in/not_in sobre tokens", () => {
		const c = (op: string, value: unknown): Condition =>
			({ field: "employmentStatus", op, value }) as Condition;
		expect(evalCondition(c("eq", "desempleado"), prof("employmentStatus", val("desempleado")), ctx).status).toBe("T");
		expect(evalCondition(c("eq", "desempleado"), prof("employmentStatus", val("asalariado")), ctx).status).toBe("F");
		expect(evalCondition(c("neq", "desempleado"), prof("employmentStatus", val("asalariado")), ctx).status).toBe("T");
		expect(evalCondition(c("in", ["a", "b"]), prof("employmentStatus", val("b")), ctx).status).toBe("T");
		expect(evalCondition(c("not_in", ["a"]), prof("employmentStatus", val("b")), ctx).status).toBe("T");
	});

	it("includes_any/includes_all sobre multi", () => {
		const c: Condition = { field: "colectivos", op: "includes_any", value: ["fn", "mono"] } as Condition;
		expect(evalCondition(c, prof("colectivos", val(["fn"])), ctx).status).toBe("T");
		expect(evalCondition(c, prof("colectivos", val(["otro"])), ctx).status).toBe("F");
		const all: Condition = { field: "colectivos", op: "includes_all", value: ["a", "b"] } as Condition;
		expect(evalCondition(all, prof("colectivos", val(["a", "b", "c"])), ctx).status).toBe("T");
		expect(evalCondition(all, prof("colectivos", val(["a"])), ctx).status).toBe("F");
	});

	it("comparaciones sobre intervalos (age, incomeAnnual)", () => {
		const lt26: Condition = { field: "age", op: "lt", value: 26 } as Condition;
		expect(evalCondition(lt26, prof("age", val({ min: 20, max: 25 })), ctx).status).toBe("T");
		expect(evalCondition(lt26, prof("age", val({ min: 24, max: 28 })), ctx).status).toBe("U");
		expect(evalCondition(lt26, prof("age", val({ min: 26, max: 26, maxExclusive: false })), ctx).status).toBe("F");
	});

	it("param + multiplier resuelve por vigencia de referenceDate", () => {
		const c: Condition = { field: "incomeAnnual", op: "lt", param: "IPREM_ANUAL_14P", multiplier: 2 } as Condition;
		expect(evalCondition(c, prof("incomeAnnual", val({ min: 0, max: 16000 })), ctx).status).toBe("T"); // <16800
		expect(evalCondition(c, prof("incomeAnnual", val({ min: 0, max: 17000 })), ctx).status).toBe("U");
		// Fuera de vigencia ⇒ U (I9 la marcará en la evaluación)
		expect(evalCondition(c, prof("incomeAnnual", val({ min: 0, max: 16000 })), ctxOld).status).toBe("U");
	});

	it("between con param", () => {
		const c: Condition = { field: "incomeAnnual", op: "between", value: [0, 8400], inclusive: [true, false] } as Condition;
		expect(evalCondition(c, prof("incomeAnnual", val({ min: 100, max: 8399 })), ctx).status).toBe("T");
	});

	it("within_territory delega en territory.ts", () => {
		const c: Condition = { field: "territory", op: "within_territory", value: { ccaa: "13" } } as Condition;
		expect(evalCondition(c, prof("territory", val({ ccaa: "13" })), ctx).status).toBe("T");
		expect(evalCondition(c, prof("territory", val({ ccaa: "09" })), ctx).status).toBe("F");
	});

	it("count_where_gte sobre dependents", () => {
		const c: Condition = {
			field: "dependents",
			op: "count_where_gte",
			count: 2,
			where: { field: "age", op: "lt", value: 18 },
		} as Condition;
		expect(evalCondition(c, prof("dependents", val([
			{ age: { min: 3, max: 3, maxExclusive: false } },
			{ age: { min: 5, max: 5, maxExclusive: false } },
		])), ctx).status).toBe("T");
		expect(evalCondition(c, prof("dependents", val([
			{ age: { min: 3, max: 3, maxExclusive: false } },
		])), ctx).status).toBe("F");
		expect(evalCondition(c, prof("dependents", val([
			{ age: { min: 16, max: 19 } }, // cruza 18
			{ age: { min: 3, max: 3, maxExclusive: false } },
		])), ctx).status).toBe("U");
	});

	it("exists", () => {
		const c: Condition = { field: "disability", op: "exists" } as Condition;
		expect(evalCondition(c, prof("disability", val("gte33")), ctx).status).toBe("T");
		expect(evalCondition(c, { answers: {} }, ctx).status).toBe("U");
	});

	it("residenceMonths derivado de residenceSince", () => {
		const c: Condition = { field: "residenceMonths", op: "gte", value: 6 } as Condition;
		expect(evalCondition(c, prof("residenceSince", val({ year: 2026, month: 1 })), ctx).status).toBe("T"); // ≥8 meses
		expect(evalCondition(c, prof("residenceSince", val({ year: 2026, month: 7 })), ctx).status).toBe("F"); // [2,3]
		expect(evalCondition(c, prof("residenceSince", val({ year: 2026, month: 4 })), ctx).status).toBe("U"); // [5,6] cruza
	});
});

describe("estados de respuesta", () => {
	const c: Condition = { field: "age", op: "lt", value: 26 } as Condition;
	it("unknown/declined/unasked ⇒ U, nunca F", () => {
		for (const state of ["unknown", "declined", "unasked"] as const) {
			const r = evalCondition(c, prof("age", { state }), ctx);
			expect(r.status).toBe("U");
			expect(r.uncertainty).toBe(state === "unasked" ? "unasked" : state);
		}
		const r = evalCondition(c, { answers: {} }, ctx);
		expect(r.status).toBe("U");
	});
	it("declined no se propone en missing", () => {
		const r = evalCondition(c, prof("age", { state: "declined" }), ctx);
		expect(r.missingFields).toEqual([]);
	});
	it("unasked/unknown sí se proponen", () => {
		expect(evalCondition(c, prof("age", { state: "unasked" }), ctx).missingFields).toEqual(["age"]);
		expect(evalCondition(c, prof("age", { state: "unknown" }), ctx).missingFields).toEqual(["age"]);
	});
});

describe("vías alternativas §2.3", () => {
	const cit = { sourceId: "s", locator: "a", excerpt: "eeeeeeee", excerptSha256: "0".repeat(64) };
	const via: Condition = {
		any: [
			{ label: "Menor de 26 años", citation: cit, field: "age", op: "lt", value: 26 },
			{
				label: "Menor de 30 con discapacidad",
				citation: cit,
				all: [
					{ field: "age", op: "lt", value: 30 },
					{ field: "disability", op: "eq", value: "gte33" },
				],
			},
		],
	};

	it("cumple por la vía base", () => {
		const r = evalCondition(via, { answers: { age: val(20) } }, ctx);
		expect(r.status).toBe("T");
		expect(r.via?.label).toBe("Menor de 26 años");
	});
	it("cumple por la excepción", () => {
		const r = evalCondition(via, {
			answers: { age: val(28), disability: val("gte33") },
		}, ctx);
		expect(r.status).toBe("T");
		expect(r.via?.label).toBe("Menor de 30 con discapacidad");
	});
	it("U con dos vías: missing elige la de menos datos", () => {
		const r = evalCondition(via, {
			answers: { age: val(28) }, // vía1 F (28≥26); vía2 U por disability
		}, ctx);
		expect(r.status).toBe("U");
		expect(r.via?.label).toBe("Menor de 30 con discapacidad");
		expect(r.missingFields).toEqual(["disability"]);
	});
});
