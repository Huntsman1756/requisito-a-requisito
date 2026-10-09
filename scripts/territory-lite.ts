/**
 * territory-lite.ts (script) — F10-PERF
 *
 * Genera data/eligibility/territory-lite.json: el índice territorial que
 * viaja al navegador. CCAA y provincias completas; municipios solo los de
 * la provincia 28 MÁS cualquier municipio que cite una regla (para que
 * `within_territory` no dé nunca un F espurio por código desconocido).
 *
 * Determinista: territory.json + rules/*.json ⇒ mismo fichero.
 * Falla si una regla cita un municipio que no existe en el INE.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const full = JSON.parse(
	readFileSync(join(root, "data/eligibility/territory.json"), "utf8"),
) as {
	ccaa: { code: string; name: string }[];
	provinces: { code: string; name: string; ccaa: string }[];
	municipalities: { code: string; name: string; province: string }[];
};

// Municipios citados por alguna regla (cualquier condición within_territory).
const ruleMunis = new Set<string>();
const walk = (x: unknown): void => {
	if (!x || typeof x !== "object") return;
	if (Array.isArray(x)) {
		for (const v of x) walk(v);
		return;
	}
	const o = x as Record<string, unknown>;
	if (o.op === "within_territory" && o.value && typeof o.value === "object") {
		const m = (o.value as { municipality?: unknown }).municipality;
		if (typeof m === "string") ruleMunis.add(m);
	}
	for (const v of Object.values(o)) walk(v);
};
for (const f of readdirSync(join(root, "data/eligibility/rules")).filter((x) =>
	x.endsWith(".json"),
)) {
	walk(JSON.parse(readFileSync(join(root, "data/eligibility/rules", f), "utf8")));
}

const munSet = new Set(full.municipalities.map((m) => m.code));
for (const code of ruleMunis) {
	if (!munSet.has(code)) {
		console.error(`la regla cita el municipio ${code}, ausente del INE`);
		process.exit(1);
	}
}

const municipalities = full.municipalities.filter(
	(m) => m.province === "28" || ruleMunis.has(m.code),
);

const out = {
	source: {
		derivedFrom: "data/eligibility/territory.json",
		note: "Índice para el navegador (F10-PERF): CCAA y provincias completas; municipios solo provincia 28 + los citados por reglas. Regenerar: npm run territory:lite",
	},
	ccaa: full.ccaa,
	provinces: full.provinces,
	municipalities,
};

writeFileSync(
	join(root, "data/eligibility/territory-lite.json"),
	`${JSON.stringify(out)}\n`,
);
console.log(
	`territory-lite.json: ${municipalities.length} municipios (${ruleMunis.size} citados por reglas), ${full.provinces.length} provincias, ${full.ccaa.length} CCAA`,
);
