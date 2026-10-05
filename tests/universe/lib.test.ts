import { describe, expect, it } from "vitest";
import {
	bdnsPublicUrl,
	bdnsUrl,
	classify,
	mergePrograms,
	progKey,
	tagsFor,
	type RawItem,
} from "../../scripts/universe/lib";

describe("bdns (R2-BDNS)", () => {
	it("la URL de API lleva los parámetros reales (page, pageSize, fechaDesde, fechaHasta)", () => {
		const u = bdnsUrl(0, "05/10/2026");
		expect(u).toContain("page=0");
		expect(u).toContain("pageSize=100");
		expect(u).toContain("regiones=25");
		expect(u).toContain("tiposBeneficiario=1");
		expect(u).toContain("fechaDesde=01%2F01%2F2026");
		expect(u).toContain("fechaHasta=05%2F10%2F2026");
	});
	it("la URL pública usa numeroConvocatoria, no el id interno", () => {
		expect(bdnsPublicUrl("931872")).toContain("/convocatoria/931872");
		expect(bdnsPublicUrl("931872")).not.toContain("1133433");
	});
});

describe("classify", () => {
	it("descarta trámites internos y ayudas a entidades", () => {
		for (const [t, shouldReject] of [
			["Subvenciones para planes de formación", false],
			["Justificación de la subvención de X", true],
			["Subvención nominativa Asociación Y", true],
			["Ayudas para contratar personas jóvenes", true],
			["Bono Cultural Joven 2026", false],
			["Convocatoria de premios 2026", true],
			["Ayudas a familias con pacientes a su cargo", false],
		] as const) {
			expect(classify(t).ok).toBe(!shouldReject);
		}
	});
});

describe("progKey (dedupe por programa)", () => {
	it("fusiona ediciones anuales del mismo programa", () => {
		// Misma convocatoria anual → un solo programa (ADR-038)
		expect(progKey("Bono Social Térmico (2024)")).toBe(progKey("Bono Social Térmico (2025)"));
		expect(progKey("Ayudas natalidad 2026")).toBe(progKey("Ayudas natalidad 2027"));
		// Programas distintos no fusionan
		expect(progKey("Ayudas natalidad")).not.toBe(progKey("Ayudas vivienda"));
	});
});

describe("mergePrograms", () => {
	const items: RawItem[] = [
		{ title: "Ayuda A (2025)", sourceKind: "bdns", scope: "estatal", url: "u1" },
		{ title: "Ayuda A (2026)", sourceKind: "sede-cm", scope: "comunidad-madrid", url: "u2" },
		{ title: "Premio X", sourceKind: "sede-cm", scope: "comunidad-madrid", url: "u3" },
	];
	it("dedupe prioriza la sede y rechaza premios", () => {
		const { programs, rejected } = mergePrograms(items);
		expect(programs).toHaveLength(1);
		expect(programs[0].source.kind).toBe("sede-cm");
		expect(programs[0].dedupedWith).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect(rejected[0].reason).toContain("premio");
	});
});

describe("tagsFor", () => {
	it("asigna temas y eventos canónicos", () => {
		const { themes, lifeEvents } = tagsFor("Ayudas de pago único por nacimiento de hijo");
		expect(themes).toContain("familia_infancia");
		expect(lifeEvents).toContain("tener_hijo");
	});
});
