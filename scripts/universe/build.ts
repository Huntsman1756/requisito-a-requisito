/**
 * build.ts — F0-U/R2-REPRO: genera data/universe/programs.json.
 *
 * Fuentes:
 *  1. Sede CM (listados HTML paginados por estado)
 *  2. API pública BDNS (parámetros reales: page, pageSize, vpd, regiones,
 *     tiposBeneficiario, fechaDesde/fechaHasta)
 *  3. Catálogo la-ayuda ya importado (data/catalog/benefits)
 *  4. Candidatos BOCM del pipeline de la-ayuda (candidates.jsonl)
 *  5. Semilla de programas permanentes
 *
 * Uso: npm run universe:build
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import {
	bdnsUrl,
	mapBdnsRecord,
	mergePrograms,
	type RawItem,
} from "./lib";

const ROOT = process.cwd();
const OUT = join(ROOT, "data/universe/programs.json");
const LA_AYUDA = "F:/_Proyectos/la-ayuda";
const TODAY = process.env.TODAY ?? new Date().toISOString().slice(0, 10);
const DDMMYYYY = (() => {
	const [y, m, d] = TODAY.split("-");
	return `${d}/${m}/${y}`;
})();

async function get(url: string): Promise<string> {
	const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
	if (!r.ok) throw new Error(`${r.status} ${url}`);
	return r.text();
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- sede CM ----------
async function sedeList(statusPath: string): Promise<RawItem[]> {
	const base = `https://sede.comunidad.madrid/buscador/tipo/Ayudas%2C%20Becas%20y%20Subvenciones/TipoEstadoDinamico/${statusPath}`;
	const items: RawItem[] = [];
	const seen = new Set<string>();
	for (let page = 0; page < 40; page++) {
		const html = await get(`${base}?t=&items_per_page=10&page=${page}`);
		const links = [
			...html.matchAll(/<h3><a href="([^"]+)" title="([^"]*)"[^>]*>/g),
		];
		const fresh = links.filter(([href]) => !seen.has(href));
		if (!fresh.length) break;
		for (const [href, title] of fresh) {
			seen.add(href);
			items.push({
				title,
				url: `https://sede.comunidad.madrid${href}`,
				sourceKind: "sede-cm",
				scope: "comunidad-madrid",
				accessState:
					statusPath === "En%20plazo"
						? "OPEN"
						: statusPath === "Pendiente%20apertura%20plazo"
							? "UPCOMING"
							: "CLOSED",
			});
		}
		await sleep(300);
	}
	return items;
}

// ---------- BDNS ----------
interface BdnsItem {
	id: number;
	numeroConvocatoria: string;
	descripcion: string;
	fechaRecepcion: string;
	nivel1: string;
	nivel2: string;
	nivel3: string;
}

async function bdnsAll(): Promise<RawItem[]> {
	const first = JSON.parse(await get(bdnsUrl(0, DDMMYYYY)));
	const pages = first.totalPages as number;
	const ids = new Set<string>();
	const items: RawItem[] = [];
	for (let page = 0; page < pages; page++) {
		const d = page === 0 ? first : JSON.parse(await get(bdnsUrl(page, DDMMYYYY)));
		for (const c of (d.content ?? []) as BdnsItem[]) {
			if (ids.has(c.numeroConvocatoria)) continue;
			ids.add(c.numeroConvocatoria);
			items.push(mapBdnsRecord(c));
		}
		if (page > 0) await sleep(250);
	}
	return items;
}

// ---------- la-ayuda catalog ----------
function fichasItems(): RawItem[] {
	const dir = join(ROOT, "data/catalog/benefits");
	if (!existsSync(dir)) return [];
	const out: RawItem[] = [];
	for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
		const raw = JSON.parse(readFileSync(join(dir, f), "utf8"));
		const madrid = (raw.eligibilityFactors?.residencyRegion ?? []).includes("madrid");
		out.push({
			id: `la-ayuda-${raw.slug ?? f.replace(/\.json$/, "")}`,
			title: raw.displayTitle ?? raw.title ?? f.replace(/\.json$/, ""),
			url: raw.officialSourceUrl,
			sourceKind: "la-ayuda",
			scope: madrid ? "comunidad-madrid" : "estatal",
			accessState:
				{ open: "OPEN", rolling: "ROLLING", closed: "CLOSED", permanent: "ROLLING" }[
					raw.applicationStatus as string
				] ?? "UNKNOWN",
		});
	}
	return out;
}

// ---------- BOCM pipeline ----------
function bocmItems(): RawItem[] {
	const cand = join(LA_AYUDA, "data/pipeline/candidates.jsonl");
	if (!existsSync(cand)) return [];
	const out: RawItem[] = [];
	for (const line of readFileSync(cand, "utf8").split("\n")) {
		if (!line.trim()) continue;
		try {
			const c = JSON.parse(line);
			const oid = c.officialIdentifier ?? "";
			if (!oid.startsWith("BOCM") || !c.title) continue;
			out.push({
				id: `bocm-${oid.split(":")[1]}`,
				title: c.title,
				url: c.officialUrl,
				sourceKind: "pipeline-bocm",
				scope: "comunidad-madrid",
				accessState: "UNKNOWN",
				extra: { hint: true },
			});
		} catch {
			/* línea corrupta */
		}
	}
	return out;
}

// ---------- semilla ----------
const SEED: RawItem[] = [
	{ title: "Ingreso Mínimo Vital", scope: "estatal", url: "https://www.boe.es/eli/es/l/2020/12/29/20/con", sourceKind: "seed", accessState: "ROLLING", extra: { seedNote: "Prestación del Sistema de la Seguridad Social para hogares en vulnerabilidad económica" } },
	{ title: "Prestación contributiva por desempleo", scope: "estatal", url: "https://www.boe.es/eli/es/rdlg/2015/10/30/8/con", sourceKind: "seed", accessState: "ROLLING", extra: { seedNote: "LGSS arts. 264–271" } },
	{ title: "Subsidio por desempleo (asistencial)", scope: "estatal", url: "https://www.boe.es/eli/es/rdlg/2015/10/30/8/con", sourceKind: "seed", accessState: "ROLLING", extra: { seedNote: "LGSS arts. 274–282" } },
	{ title: "Complemento de Ayuda para la Infancia", scope: "estatal", url: "https://www.boe.es/eli/es/l/2020/12/29/20/con", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Renta Mínima de Inserción (Comunidad de Madrid)", scope: "comunidad-madrid", url: "https://www.comunidad.madrid/servicios/servicios-sociales-y-voluntariado/renta-minima", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Permiso y prestación por nacimiento y cuidado del menor", scope: "estatal", url: "https://www.boe.es/eli/es/rdlg/2015/10/30/8/con", sourceKind: "seed", accessState: "ROLLING", extra: { seedNote: "16 semanas por progenitor (LGSS arts. 331–345)" } },
	{ title: "Prestación por cuidado de menores con cáncer u otra enfermedad grave", scope: "estatal", url: "https://www.boe.es/eli/es/l/2015/06/02/48/con", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Reconocimiento de la situación de dependencia (SAAD)", scope: "estatal", url: "https://www.boe.es/eli/es/l/2006/12/14/39/con", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Pensiones no contributivas (jubilación e invalidez)", scope: "estatal", url: "https://www.boe.es/eli/es/rdlg/2015/10/30/8/con", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Título de familia numerosa", scope: "estatal", url: "https://www.boe.es/eli/es/l/2003/11/18/40/con", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Bono social térmico", scope: "estatal", url: "https://www.boe.es/eli/es/rd/2017/10/06/897/con", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Becas del Ministerio (generales y MEFP)", scope: "estatal", url: "https://www.educacionfpydeportes.gob.es/servicios-al-ciudadano/catalogo-general/04/040050.html", sourceKind: "seed", accessState: "UNKNOWN" },
	{ title: "Abono transporte joven (Comunidad de Madrid)", scope: "comunidad-madrid", url: "https://www.comunidad.madrid/transportes/abono-joven", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Abono transporte para mayores de 65 (tarjeta azul)", scope: "comunidad-madrid", url: "https://www.comunidad.madrid/transportes/tarjeta-transporte-publico", sourceKind: "seed", accessState: "ROLLING" },
	{ title: "Bono Alquiler Joven (Comunidad de Madrid)", scope: "comunidad-madrid", url: "https://www.comunidad.madrid/vivienda/atencion-inquilino/bono-alquiler-joven", sourceKind: "seed", accessState: "UNKNOWN" },
	{ title: "Cheque de escuela infantil (Comunidad de Madrid)", scope: "comunidad-madrid", url: "https://www.comunidad.madrid/educacion/ayudas-becas-subvenciones", sourceKind: "seed", accessState: "UNKNOWN" },
	{ title: "Becas de comedor escolar (Comunidad de Madrid)", scope: "comunidad-madrid", url: "https://www.comunidad.madrid/educacion/ayudas-becas-subvenciones", sourceKind: "seed", accessState: "UNKNOWN" },
	{ title: "Ayudas a víctimas de violencia de género", scope: "estatal", url: "https://www.boe.es/eli/es/lo/2004/12/28/1/con", sourceKind: "seed", accessState: "ROLLING" },
];

async function main() {
	console.log("[universe] sede CM…");
	const sede = [
		...(await sedeList("En%20plazo")),
		...(await sedeList("En%20tramitaci%C3%B3n")),
		...(await sedeList("Pendiente%20apertura%20plazo")),
	];
	console.log("[universe] sede:", sede.length);
	console.log("[universe] BDNS…");
	const bdns = await bdnsAll();
	console.log("[universe] bdns:", bdns.length);
	const fichas = fichasItems();
	const bocm = bocmItems();
	console.log(`[universe] la-ayuda:${fichas.length} bocm:${bocm.length} seed:${SEED.length}`);

	const { programs, rejected } = mergePrograms([
		...sede,
		...bdns,
		...fichas,
		...bocm,
		...SEED,
	]);
	mkdirSync(join(ROOT, "data/universe"), { recursive: true });
	writeFileSync(
		OUT,
		`${JSON.stringify({ generatedAt: TODAY, programs }, null, 1)}\n`,
	);
	writeFileSync(
		join(ROOT, "data/universe/rejected.json"),
		`${JSON.stringify(rejected, null, 1)}\n`,
	);
	console.log(`[universe] ${programs.length} programas · ${rejected.length} rechazados → ${OUT}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
