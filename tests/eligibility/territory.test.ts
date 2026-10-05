import { describe, expect, it } from "vitest";
import {
	ccaaOfProvince,
	municipalityExists,
	withinTerritory,
} from "../../src/lib/eligibility-engine/territory";

const MADRID = { ccaa: "13" };

describe("territory.json (F1-7)", () => {
	it("tiene CCAA, provincias y municipios del INE", () => {
		expect(ccaaOfProvince("28")).toBe("13");
		expect(municipalityExists("28079")).toBe(true); // Madrid
		expect(municipalityExists("99999")).toBe(false);
	});
});

describe("withinTerritory (docs/07 §3.3)", () => {
	it("regla autonómica: usuario Madrid T, otra CCAA F", () => {
		expect(withinTerritory(MADRID, { ccaa: "13" })).toBe("T");
		expect(withinTerritory({ ccaa: "09" }, { ccaa: "13" })).toBe("F");
		expect(withinTerritory({}, { ccaa: "13" })).toBe("U");
	});

	it("regla autonómica: municipio deriva CCAA", () => {
		expect(withinTerritory({ municipality: "28079" }, { ccaa: "13" })).toBe("T");
		expect(withinTerritory({ municipality: "08019" }, { ccaa: "13" })).toBe("F");
	});

	it("regla municipal: CCAA que la contiene ⇒ U, otra ⇒ F", () => {
		expect(withinTerritory(MADRID, { municipality: "28079" })).toBe("U");
		expect(withinTerritory({ ccaa: "09" }, { municipality: "28079" })).toBe("F");
		expect(withinTerritory({ municipality: "28079" }, { municipality: "28079" })).toBe("T");
		expect(withinTerritory({ municipality: "28080" }, { municipality: "28079" })).toBe("F");
	});

	it("regla provincial: provincia distinta ⇒ F; solo CCAA correcta ⇒ U", () => {
		expect(withinTerritory(MADRID, { province: "28" })).toBe("U");
		expect(withinTerritory({ province: "28" }, { province: "28" })).toBe("T");
		expect(withinTerritory({ province: "41" }, { province: "28" })).toBe("F");
	});

	it("regla sin restricción ⇒ T", () => {
		expect(withinTerritory({ ccaa: "09" }, {})).toBe("T");
	});

	it("regla estatal: municipio de otra CCAA dentro de regla ccaa distinta ⇒ F temprano", () => {
		// Usuario en Barcelona (ccaa 09) vs regla municipal madrileña: F.
		expect(
			withinTerritory({ ccaa: "09", municipality: "08019" }, { municipality: "28079" }),
		).toBe("F");
	});
});
