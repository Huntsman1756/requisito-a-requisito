import { describe, expect, it } from "vitest";
import {
	aggregate,
	runPanel,
	type PanelVerdict,
} from "../../scripts/review-panel/run";
import {
	conditionPlain,
	extractItems,
	type PanelItem,
} from "../../scripts/review-panel/items";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { RuleSet } from "../../src/lib/eligibility-engine/schema";

const ok: PanelVerdict = {
	fidelity: "exact",
	hardness: "ok",
	falseNegativeRisk: "none",
	falsePositiveRisk: "none",
	missingRequirements: [],
	explanation: "ok",
};

const item: PanelItem = {
	ruleSlug: "test",
	itemId: "req:x",
	kind: "requirement",
	label: "Tener 18 años",
	excerpt: "mayores de 18 años",
	context: "…ser mayores de 18 años en la fecha…",
};

describe("panel: agregación determinista (docs/17 §5)", () => {
	it("3×exact + ok ⇒ pass", () => {
		expect(aggregate(item, [ok, ok, ok]).result).toBe("pass");
	});
	it("too_lax ⇒ escala (falso positivo)", () => {
		expect(
			aggregate(item, [ok, { ...ok, fidelity: "too_lax" }, ok]).result,
		).toBe("escalate");
	});
	it("falseNegativeRisk high ⇒ escala", () => {
		expect(
			aggregate(item, [{ ...ok, falseNegativeRisk: "high" }, ok, ok]).result,
		).toBe("escalate");
	});
	it("cannot_tell ⇒ escala", () => {
		expect(
			aggregate(item, [{ ...ok, fidelity: "cannot_tell" }, ok, ok]).result,
		).toBe("escalate");
	});
	it("desacuerdo en hardness ⇒ escala", () => {
		expect(
			aggregate(item, [{ ...ok, hardness: "should_be_soft" }, ok, ok]).result,
		).toBe("escalate");
	});
	it("missingRequirement con quote fuera del contexto se descarta", () => {
		const v: PanelVerdict = {
			...ok,
			missingRequirements: [{ quote: "no está en el contexto", why: "x" }],
		};
		expect(aggregate(item, [v, ok, ok]).result).toBe("pass");
	});
	it("missingRequirement con quote literal ⇒ escala", () => {
		const v: PanelVerdict = {
			...ok,
			missingRequirements: [{ quote: "ser mayores de 18 años", why: "x" }],
		};
		expect(aggregate(item, [v, ok, ok]).result).toBe("escalate");
	});
});

describe("panel: runPanel con respuestas simuladas (sin red)", () => {
	it("todas PASS ⇒ ruleset aprobado; una duda ⇒ escalado", async () => {
		const items: PanelItem[] = [
			{ ...item, ruleSlug: "buena", itemId: "r1" },
			{ ...item, ruleSlug: "dudosa", itemId: "r1" },
		];
		const callModel = async ({ item: it }: { item: PanelItem }) =>
			JSON.stringify(
				it.ruleSlug === "dudosa"
					? { ...ok, falseNegativeRisk: "high" }
					: ok,
			);
		const res = await runPanel(items, {
			models: ["a", "b", "c"],
			promptVersion: "panel-v1",
			outDir: join(process.cwd(), "node_modules/.cache/panel-test"),
			cacheDir: join(process.cwd(), "node_modules/.cache/panel-test-c"),
			callModel,
		});
		expect(res.find((r) => r.slug === "buena")?.status).toBe("approved");
		expect(res.find((r) => r.slug === "dudosa")?.status).toBe("escalated");
	});
	it("salida inválida se reintenta; si falla cuenta cannot_tell ⇒ escala", async () => {
		let calls = 0;
		const callModel = async () => {
			calls++;
			return calls === 1 ? "no-json" : JSON.stringify(ok);
		};
		// el primer modelo da basura → retry ok; segundos ok → pass
		const res = await runPanel([{ ...item, ruleSlug: "x" }], {
			models: ["a", "b", "c"],
			promptVersion: "panel-v1",
			outDir: join(process.cwd(), "node_modules/.cache/panel-test2"),
			cacheDir: join(process.cwd(), "node_modules/.cache/panel-test2-c"),
			callModel,
		});
		expect(res[0].status).toBe("approved");
	});
});

describe("panel: extracción de ítems de una regla real", () => {
	it("saca requisitos + amount + documents + completitud con contexto", () => {
		const rs = JSON.parse(
			readFileSync(
				join(process.cwd(), "data/eligibility/rules/bono-cultural-joven.json"),
				"utf8",
			),
		) as RuleSet;
		const srcDir = join(process.cwd(), "data/eligibility/sources");
		const items = extractItems(rs, (id) => {
			try {
				return readFileSync(join(srcDir, `${id}.txt`), "utf8");
			} catch {
				return "";
			}
		});
		expect(items.length).toBeGreaterThan(5);
		expect(items.some((i) => i.kind === "completeness")).toBe(true);
		const withCtx = items.filter((i) => i.excerpt && i.context);
		expect(withCtx.length).toBeGreaterThan(0);
		for (const i of withCtx) {
			expect(i.context).toContain(i.excerpt);
		}
	});
});

describe("panel: conditionPlain", () => {
	it("renderiza between y eq legiblemente", () => {
		expect(
			conditionPlain({ field: "age", op: "between", value: [18, 35] }),
		).toContain("18");
	});
});
