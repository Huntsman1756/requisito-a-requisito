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

// Nombres ciudadanos: el INE lista «Madrid, Comunidad de» → «Comunidad de Madrid».
const citizenName = (n: string) =>
	n.includes(", ") ? `${n.split(", ")[1]} ${n.split(", ")[0]}` : n;

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
	.map((m: { code: string; name: string }) => ({
		code: m.code,
		name: citizenName(m.name),
	}))
	.sort((a: { name: string }, b: { name: string }) =>
		a.name.localeCompare(b.name, "es"),
	);
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
	displayTitle?: string;
	title?: string;
	managingBody?: string;
	officialSourceUrl?: string;
	applicationStatus?: string;
	estimatedValueText?: string;
	residencyRegion?: string[];
	eligibilityFactors?: Record<string, unknown>;
}

/** Limpieza determinista del título oficial para uso ciudadano (F4-L2). */
function citizenTitle(raw: Ficha): string | null {
	let t = raw.displayTitle ?? raw.title ?? "";
	t = t.replace(/\s+/g, " ").trim();
	// Quitar envoltura formal («Extracto de la Orden … por la que…»)
	t = t
		.replace(/^(extracto|anuncio|corrección de errores)\s+de(l|\s+la|\s+los|\s+las)?\s+/i, "")
		.replace(/^(la\s+)?(orden|resolución|acuerdo|convocatoria|instrucción|decreto)\s+(\S+\s+)?(por\s+(la|el)\s+que\s+se|que)?\s*/i, "")
		.trim();
	if (!t) return null;
	t = t[0].toUpperCase() + t.slice(1);
	if (t.length > 160) t = `${t.slice(0, 157).replace(/\s+\S*$/, "")}…`;
	return t;
}

const skipped: { f: string; reason: string }[] = [];
// L2-ALL: el nivel 2 es el universo clasificado de data/universe/programs.json,
// más los campos del catálogo la-ayuda cuando existen.
const universe = JSON.parse(
	readFileSync(join(root, "data/universe/programs.json"), "utf8"),
).programs as {
	id: string;
	title: string;
	scope: string;
	accessState: string;
	officialSourceUrl?: string;
	themes: string[];
	lifeEvents: string[];
	source: { kind: string; url?: string };
}[];
const fichasByUrl = new Map<string, Ficha>();
for (const f of readdirSync(benefitsDir).filter((x) => x.endsWith(".json"))) {
	const raw = JSON.parse(readFileSync(join(benefitsDir, f), "utf8")) as Ficha;
	if (raw.officialSourceUrl) fichasByUrl.set(raw.officialSourceUrl, raw);
}
// Ola-10: un programa con regla propia no se repite como ficha de nivel 2 —
// la deduplicación es por URL oficial (canal de la regla o de sus fuentes).
const rulesDir = join(root, "data/eligibility/rules");
const ruleUrls = new Set<string>();
for (const f of readdirSync(rulesDir).filter((x) => x.endsWith(".json"))) {
	const rs = JSON.parse(readFileSync(join(rulesDir, f), "utf8")) as {
		application?: { channel?: { url?: string } };
		sources?: { url?: string }[];
	};
	if (rs.application?.channel?.url) ruleUrls.add(rs.application.channel.url);
	for (const s of rs.sources ?? []) if (s.url) ruleUrls.add(s.url);
}

const level2 = universe
	.filter((p) => {
		if (!p.officialSourceUrl) {
			skipped.push({ f: p.id, reason: "sin officialSourceUrl" });
			return false;
		}
		if (ruleUrls.has(p.officialSourceUrl)) {
			skipped.push({ f: p.id, reason: "ya tiene regla (deduplicado por URL oficial)" });
			return false;
		}
		// L2-ALL: todo el universo apto se publica, incluidas las CLOSED — el
		// explorador las muestra con su estado («Cerrada») y las ordena al final.
		return true;
	})
	.map((p) => {
		const ficha = p.officialSourceUrl ? fichasByUrl.get(p.officialSourceUrl) : undefined;
		return {
			slug: p.id,
			displayTitle: citizenTitle(p as unknown as Ficha) ?? p.title,
			managingBody: undefined,
			officialSourceUrl: p.officialSourceUrl as string,
			applicationStatus: undefined,
			accessState: p.accessState,
			scope: p.scope,
			themes: p.themes,
			lifeEvents: p.lifeEvents,
			eligibilityFactors: ficha?.eligibilityFactors ?? {},
		};
	});
writeFileSync(
	join(OUT, "nivel-2.json"),
	`${JSON.stringify({ items: level2 })}\n`,
);
// F4-L2: informe de incluidas/excluidas con motivo.
writeFileSync(
	join(OUT, "nivel-2-informe.json"),
	`${JSON.stringify(
		{ incluidas: level2.length, excluidas: skipped },
		null,
		2,
	)}\n`,
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
