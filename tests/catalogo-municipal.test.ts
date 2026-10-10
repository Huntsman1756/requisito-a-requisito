/**
 * catalogo-municipal.test.ts — F10-CAT-MUNI: invariantes del catálogo
 * municipal de nivel 2 sobre los DATOS REALES del repo (regla 4.11:
 * no basta un fixture; cada entrada tiene que llevar municipio conocido,
 * enlace oficial https y huella de procedencia cuando es seed curado).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { municipalityFromBody } from "../scripts/universe/lib";

const root = process.cwd();
const read = (p: string) => JSON.parse(readFileSync(join(root, p), "utf8"));

const territory = read("public/datos/elegibilidad/territorio-madrid.json") as {
	municipalities: { code: string; name: string }[];
};
const muniNames = new Set(territory.municipalities.map((m) => m.name));

describe("municipalityFromBody (fixtures)", () => {
	it("invierte el artículo sufijo del INE", () => {
		expect(municipalityFromBody("ESCORIAL, EL")).toBe("El Escorial");
		expect(municipalityFromBody("BOADILLA DEL MONTE")).toBe(
			"Boadilla del Monte",
		);
		expect(municipalityFromBody("RIVAS-VACIAMADRID")).toBe(
			"Rivas-Vaciamadrid",
		);
		expect(municipalityFromBody("ALCALÁ DE HENARES")).toBe(
			"Alcalá de Henares",
		);
		expect(municipalityFromBody("POZUELO DE ALARCÓN")).toBe(
			"Pozuelo de Alarcón",
		);
	});
});

describe("seed municipal verificado", () => {
	const seed = read("data/universe/municipal-seed.json") as {
		items: {
			title: string;
			url: string;
			municipality: string;
			httpStatus: number | null;
			sha256: string | null;
			fetchedAt: string;
		}[];
	};

	it("cada entrada es de un municipio de la CM con URL https oficial", () => {
		for (const it of seed.items) {
			expect(muniNames.has(it.municipality), it.municipality).toBe(true);
			expect(it.url, it.title).toMatch(/^https:\/\//);
		}
	});

	it("toda entrada publicable tiene huella sha256 y fecha", () => {
		for (const it of seed.items.filter((i) => (i.httpStatus ?? 999) < 400)) {
			expect(it.sha256, it.title).toMatch(/^[0-9a-f]{64}$/);
			expect(it.fetchedAt, it.title).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		}
	});
});

describe("programas municipales del universo", () => {
	const universe = read("data/universe/programs.json") as {
		programs: {
			id: string;
			title: string;
			scope: string;
			municipality?: string;
			officialSourceUrl?: string;
			source: { kind: string };
		}[];
	};
	const muni = universe.programs.filter((p) => p.scope === "municipal");

	it("hay más ayudas municipales que las 22 del punto de partida", () => {
		expect(muni.length).toBeGreaterThan(22);
	});

	it("toda entrada municipal tiene enlace https y municipio", () => {
		for (const p of muni) {
			expect(p.officialSourceUrl, p.title).toMatch(/^https:\/\//);
			expect(p.municipality, p.title).toBeTruthy();
			if (!/^mancomunidad/i.test(p.municipality!))
				expect(muniNames.has(p.municipality!), p.municipality).toBe(true);
		}
	});

	it("no hay duplicados por título+municipio", () => {
		const keys = muni.map(
			(p) => `${p.title.toLowerCase().trim()}|${p.municipality}`,
		);
		expect(new Set(keys).size).toBe(keys.length);
	});
});
