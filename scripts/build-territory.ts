/**
 * build-territory.ts — F1-7
 *
 * Genera data/eligibility/territory.json (CCAA + provincias + municipios)
 * desde los snapshots oficiales del INE:
 *   - diccionario26.xlsx  (CODAUTO→CPRO→CMUN, todo el país)
 *   - cod_provincia.txt   (nombres de provincia, snapshot ine-cod-provincia)
 *   - 26codmun.xlsx       (control: nº de municipios por provincia)
 * Determinista: mismos snapshots ⇒ mismo fichero.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { xlsxRows, xlsxSheetList } from "./xlsx-lite";

const SNAPSHOTS = "F:/AgentState/datawardsmadrid/snapshots";
const COD_PROV_TXT = "data/eligibility/sources/ine-cod-provincia.txt";

const CCAA_NAMES: Record<string, string> = {
	"01": "Andalucía",
	"02": "Aragón",
	"03": "Asturias, Principado de",
	"04": "Balears, Illes",
	"05": "Canarias",
	"06": "Cantabria",
	"07": "Castilla y León",
	"08": "Castilla-La Mancha",
	"09": "Cataluña",
	"10": "Comunitat Valenciana",
	"11": "Extremadura",
	"12": "Galicia",
	"13": "Madrid, Comunidad de",
	"14": "Murcia, Región de",
	"15": "Navarra, Comunidad Foral de",
	"16": "País Vasco",
	"17": "Rioja, La",
	"18": "Ceuta",
	"19": "Melilla",
};

function sha256File(p: string): string {
	return createHash("sha256").update(readFileSync(p)).digest("hex");
}

export function buildTerritory(opts?: {
	diccionario?: string;
	codmun?: string;
	codProvTxt?: string;
	out?: string;
}): { ccaa: number; provinces: number; municipalities: number } {
	const dicPath = opts?.diccionario ?? join(SNAPSHOTS, "diccionario26.xlsx");
	const codPath = opts?.codmun ?? join(SNAPSHOTS, "26codmun.xlsx");
	const txtPath = opts?.codProvTxt ?? COD_PROV_TXT;
	const outPath = opts?.out ?? "data/eligibility/territory.json";

	// Nombres de provincia del snapshot HTML normalizado: pares "NN Nombre".
	const txt = readFileSync(txtPath, "utf8");
	const provNames = new Map<string, string>();
	for (const m of txt.matchAll(/\b(\d{2}) ([A-ZÁÉÍÓÚÑÜ][^0-9]*?)(?= \d{2} [A-ZÁÉÍÓÚÑÜ]| Código Literal| Contacto|$)/g)) {
		provNames.set(m[1], m[2].trim());
	}

	// diccionario26.xlsx: una hoja plana CODAUTO,CPRO,CMUN,DC,NOMBRE
	const dRows = xlsxRows(dicPath, "xl/worksheets/sheet1.xml");
	const municipalities: { code: string; name: string; province: string }[] = [];
	const provCcaa = new Map<string, string>();
	for (const r of dRows.slice(2)) {
		const [ccaa, cpro, cmun, , nombre] = r;
		if (!/^\d{2}$/.test(ccaa ?? "") || !/^\d{2}$/.test(cpro ?? "") || !/^\d{3}$/.test(cmun ?? "")) {
			continue;
		}
		provCcaa.set(cpro, ccaa);
		municipalities.push({
			code: `${cpro}${cmun}`,
			name: (nombre ?? "").trim(),
			province: cpro,
		});
	}

	// Control: nº de municipios por provincia según 26codmun.xlsx
	const sheets = xlsxSheetList(codPath);
	const perProvince = new Map<string, number>();
	for (const s of sheets) {
		const rows = xlsxRows(codPath, s.path);
		perProvince.set(s.name, rows.filter((r) => /^\d{3}$/.test(r[1] ?? "")).length);
	}
	const expected = new Map<string, number>();
	for (const m of municipalities) {
		expected.set(m.province, (expected.get(m.province) ?? 0) + 1);
	}
	for (const [prov, n] of expected) {
		if (perProvince.get(prov) !== n) {
			throw new Error(
				`control codmun: provincia ${prov} esperada ${n}, hoja dice ${perProvince.get(prov)}`,
			);
		}
	}

	const ccaa = [...new Set(provCcaa.values())]
		.sort()
		.map((code) => ({ code, name: CCAA_NAMES[code] ?? `CCAA ${code}` }));
	const provinces = [...provCcaa.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([code, c]) => ({
			code,
			name: provNames.get(code) ?? `Provincia ${code}`,
			ccaa: c,
		}));

	const out = {
		source: {
			id: "ine-codmun-2026",
			url: "https://www.ine.es/daco/daco42/codmun/diccionario26.xlsx",
			urlMunicipios: "https://www.ine.es/daco/daco42/codmun/26codmun.xlsx",
			urlProvincias: "https://www.ine.es/daco/daco42/codmun/cod_provincia.htm",
			snapshotId: "ine-cod-provincia",
			diccionarioSha256: sha256File(dicPath),
			codmunSha256: sha256File(codPath),
			asOf: "2026-01-01",
		},
		ccaa,
		provinces,
		municipalities: municipalities.sort((a, b) => a.code.localeCompare(b.code)),
	};
	writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
	return {
		ccaa: ccaa.length,
		provinces: provinces.length,
		municipalities: municipalities.length,
	};
}

if (process.argv[1]?.endsWith("build-territory.ts")) {
	const r = buildTerritory();
	console.log(
		`territory.json: ${r.ccaa} CCAA, ${r.provinces} provincias, ${r.municipalities} municipios`,
	);
}
