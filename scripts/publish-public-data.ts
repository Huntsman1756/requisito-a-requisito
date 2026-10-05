/**
 * publish-public-data.ts — F4-12
 * Copia al área pública los datos abiertos que consume el asistente:
 *  - public/datos/elegibilidad/bundle.json      (rulesets+params+fuentes)
 *  - public/datos/elegibilidad/questions.json   (catálogo de preguntas)
 *  - public/datos/elegibilidad/manifest.json    (digest + fecha + licencia)
 *  - public/datos/elegibilidad/territorio-madrid.json (municipios CM)
 *  - public/datos/elegibilidad/nivel-2.json     (catálogo donante, campos mínimos)
 * Todo regenerable; fail-closed si falta el bundle.
 */

import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const OUT = join(root, "public/datos/elegibilidad");
const BUNDLE = join(root, "data/eligibility/bundle/eligibility-bundle.json");

if (!existsSync(BUNDLE)) {
	console.error("falta eligibility-bundle.json — ejecuta eligibility:build antes");
	process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const bundle = readFileSync(BUNDLE, "utf8");
writeFileSync(join(OUT, "bundle.json"), bundle);

const questions = readFileSync(
	join(root, "data/eligibility/questions.json"),
	"utf8",
);
writeFileSync(join(OUT, "questions.json"), questions);

// Municipios de la provincia de Madrid para el selector de territorio.
const territory = JSON.parse(
	readFileSync(join(root, "data/eligibility/territory.json"), "utf8"),
);
const madridMunis = territory.municipalities
	.filter((m: { province: string }) => m.province === "28")
	.map((m: { code: string; name: string }) => ({ code: m.code, name: m.name }))
	.sort((a: { name: string }, b: { name: string }) =>
		a.name.localeCompare(b.name, "es"),
	);
// Nombres ciudadanos: el INE lista «Madrid, Comunidad de» → «Comunidad de Madrid».
const citizenName = (n: string) =>
	n.includes(", ") ? `${n.split(", ")[1]} ${n.split(", ")[0]}` : n;
const ccaa = territory.ccaa
	.map((c: { code: string; name: string }) => ({
		code: c.code,
		name: citizenName(c.name),
	}))
	.sort((a: { name: string }, b: { name: string }) =>
		a.name.localeCompare(b.name, "es"),
	);
writeFileSync(
	join(OUT, "territorio-madrid.json"),
	`${JSON.stringify({ municipalities: madridMunis, ccaa })}\n`,
);

// Nivel 2: fichas del catálogo donante con los campos mínimos para "relacionadas".
const benefitsDir = join(root, "data/catalog/benefits");
interface Ficha {
	slug?: string;
	displayTitle: string;
	managingBody?: string;
	officialSourceUrl?: string;
	applicationStatus?: string;
	estimatedValueText?: string;
	residencyRegion?: string[];
	eligibilityFactors?: Record<string, unknown>;
}
const level2 = readdirSync(benefitsDir)
	.filter((f) => f.endsWith(".json"))
	.map((f) => ({ f, raw: JSON.parse(readFileSync(join(benefitsDir, f), "utf8")) as Ficha }))
	// Sin título ciudadano la ficha no se puede presentar → fuera de nivel 2.
	.filter(({ raw }) => !!raw.displayTitle)
	.map(({ f, raw }) => {
		return {
			slug: raw.slug ?? f.replace(/\.json$/, ""),
			displayTitle: raw.displayTitle ?? raw.slug ?? f.replace(/\.json$/, ""),
			managingBody: raw.managingBody,
			officialSourceUrl: raw.officialSourceUrl,
			applicationStatus: raw.applicationStatus,
			estimatedValueText: raw.estimatedValueText,
			eligibilityFactors: raw.eligibilityFactors ?? {},
		};
	});
writeFileSync(
	join(OUT, "nivel-2.json"),
	`${JSON.stringify({ items: level2 })}\n`,
);

const manifest = JSON.parse(
	readFileSync(
		join(root, "data/eligibility/bundle/manifest.json"),
		"utf8",
	),
);
// I7: digest embebido en el JS (la página servida lo compara con el manifiesto).
mkdirSync(join(root, "src/generated"), { recursive: true });
writeFileSync(
	join(root, "src/generated/bundle-digest.ts"),
	`// Generado por publish-public-data.ts — no editar.\nexport const BUNDLE_DIGEST = ${JSON.stringify(manifest.bundleDigest)};\n`,
);
writeFileSync(
	join(OUT, "manifest.json"),
	`${JSON.stringify(
		{
			...manifest,
			license:
				"Datos abiertos del proyecto Requisito a Requisito — uso libre con atribución; las citas apuntan a sus fuentes oficiales.",
		},
		null,
		2,
	)}\n`,
);

console.log(
	`datos públicos: bundle (${bundle.length} B), preguntas, ${madridMunis.length} municipios, ${level2.length} fichas nivel 2`,
);
