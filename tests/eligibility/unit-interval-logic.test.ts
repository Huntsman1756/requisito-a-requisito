import { describe, expect, it } from "vitest";
import {
	intervalBetween,
	intervalGt,
	intervalGte,
	intervalLt,
	intervalLte,
} from "../../src/lib/eligibility-engine/interval";
import type { TFU } from "../../src/lib/eligibility-engine/interval";
import {
	kleeneAll,
	kleeneAny,
	kleeneNot,
} from "../../src/lib/eligibility-engine/logic";

const band = (min: number | null, max: number | null) => ({ min, max });

describe("interval vs umbral (§3.1)", () => {
	it("lt: dentro T, fuera F, frontera según borde", () => {
		expect(intervalLt(band(20, 24), 26)).toBe("T");
		expect(intervalLt(band(26, 30), 26)).toBe("F");
		expect(intervalLt(band(25, 27), 26)).toBe("U"); // cruza
		expect(intervalLt({ min: 26, max: 26, maxExclusive: false }, 26)).toBe("F"); // punto = t
		expect(intervalLt({ min: 24, max: 26 }, 26)).toBe("T"); // [24,26) < 26
		expect(intervalLt({ min: null, max: 26 }, 26)).toBe("T");
		expect(intervalLt({ min: 20, max: null }, 26)).toBe("U");
	});

	it("lte: frontera exacta cuenta como T si está incluida", () => {
		expect(intervalLte(band(20, 26), 26)).toBe("T"); // [20,26) ≤ 26
		expect(intervalLte({ min: 26, max: 26, maxExclusive: false }, 26)).toBe("T"); // punto = t ≤ t
		expect(intervalLte({ min: 27, max: 27, maxExclusive: false }, 26)).toBe("F");
		expect(intervalLte(band(24, 30), 26)).toBe("U");
	});

	it("gt/gte simétricos", () => {
		expect(intervalGte(band(26, 30), 26)).toBe("T");
		expect(intervalGte(band(20, 25), 26)).toBe("F");
		expect(intervalGte(band(24, 30), 26)).toBe("U");
		expect(intervalGt({ min: 27, max: 30 }, 26)).toBe("T");
		expect(intervalGt({ min: 26, max: 26, maxExclusive: false }, 26)).toBe("F");
		expect(intervalGt(band(26, 40), 26)).toBe("U"); // [26,40) tiene >26
		expect(intervalGt(band(20, 24), 26)).toBe("F");
	});

	it("between con inclusive", () => {
		expect(intervalBetween(band(10, 14), 10, 15)).toBe("T");
		expect(intervalBetween({ min: 5, max: 5, maxExclusive: false }, 10, 15)).toBe("F");
		expect(intervalBetween(band(5, 12), 10, 15)).toBe("U");
		// borde izquierdo exclusivo: (10,15]
		expect(intervalBetween({ min: 10, max: 10, maxExclusive: false }, 10, 15, [false, true])).toBe("F");
		expect(intervalBetween(band(10, 14), 10, 15, [false, true])).toBe("U"); // incluye 10
	});
});

describe("Kleene (§3.2)", () => {
	const cases: [TFU, TFU, TFU, TFU][] = [
		// a, b, all, any
		["T", "T", "T", "T"],
		["T", "U", "U", "T"],
		["T", "F", "F", "T"],
		["U", "T", "U", "T"],
		["U", "U", "U", "U"],
		["U", "F", "F", "U"],
		["F", "T", "F", "T"],
		["F", "U", "F", "U"],
		["F", "F", "F", "F"],
	];
	it.each(cases)("all/any de %s,%s", (a, b, all, any) => {
		expect(kleeneAll([a, b])).toBe(all);
		expect(kleeneAny([a, b])).toBe(any);
	});
	it("not", () => {
		expect(kleeneNot("T")).toBe("F");
		expect(kleeneNot("F")).toBe("T");
		expect(kleeneNot("U")).toBe("U");
	});
	it("n-arios", () => {
		expect(kleeneAll(["T", "T", "T"])).toBe("T");
		expect(kleeneAll(["T", "U", "T"])).toBe("U");
		expect(kleeneAny(["F", "F", "U"])).toBe("U");
		expect(kleeneAny(["F", "F", "F"])).toBe("F");
	});
});
