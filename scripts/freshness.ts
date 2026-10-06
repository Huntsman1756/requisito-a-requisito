/**
 * freshness.ts — F9: revalidación diaria de fuentes + detección de leads.
 *
 * 1. Re-descarga cada fuente de data/eligibility/sources/*.json.
 *    - sha de bytes y texto iguales ⇒ sin cambios.
 *    - Texto distinto pero todos los extractos citados siguen presentes ⇒
 *      snapshot actualizado (cosmético) + nota en el run.
 *    - Algún extracto ausente ⇒ la fuente va a data/freshness/stale.json y los
 *      rulesets que la citan quedan excluidos del bundle por el build (fail-closed).
 *      Nunca se reescribe una regla automáticamente.
 * 2. Descubre novedades (sede CM "En plazo" + BDNS) y las guarda en
 *    data/catalog/leads-new.json como pendientes de revisión. No se publican.
 * 3. Escribe una línea en data/freshness/runs.jsonl.
 *
 * Uso: npx tsx scripts/freshness.ts [--today YYYY-MM-DD] [--dry-run]
 *      [--sources-dir <d>] [--out <dir>]
 */

import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
	appendFileSync,
} from "node:fs";
import { join } from "node:path";
import { extractText } from "./eligibility-snapshot";
import { normalizeText } from "../src/lib/eligibility-engine/text-normalize";

const root = process.cwd();
const args = process.argv.slice(2);
const argValue = (k: string) => {
	const i = args.indexOf(k);
	return i >= 0 ? args[i + 1] : undefined;
};
const TODAY = argValue("--today") ?? new Date().toISOString().slice(0, 10);
const DRY = args.includes("--dry-run");
const SOURCES_DIR = argValue("--sources-dir") ?? join(root, "data/eligibility/sources");
const RULES_DIR = join(root, "data/eligibility/rules");
const FRESH_DIR = join(root, "data/freshness");
const sha256 = (b: Buffer | string) => createHash("sha256").update(b).digest("hex");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface SourceMeta {
	id: string;
	url: string;
	sha256: string;
	textSha256: string;
	contentType: string;
	rank: number;
	fetchedAt: string;
}

interface RunRecord {
	date: string;
	checked: number;
	unchanged: number;
	cosmetic: string[];
	stale: string[];
	fetchErrors: string[];
	skipped?: string[];
	leads: number;
	bundleDigest: string | null;
	deployOk: boolean;
}

async function get(url: string): Promise<{ bytes: Buffer; contentType: string }> {
	const r = await fetch(url, {
		headers: { "user-agent": "requisito-a-requisito-freshness/1.0" },
	});
	if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
	const ct = r.headers.get("content-type") ?? "text/plain";
	const bytes = Buffer.from(await r.arrayBuffer());
	return { bytes, contentType: ct };
}

function excerptsForSource(sourceId: string): string[] {
	const out: string[] = [];
	for (const f of readdirSync(RULES_DIR).filter((x) => x.endsWith(".json"))) {
		const rs = JSON.parse(readFileSync(join(RULES_DIR, f), "utf8"));
		const walk = (o: unknown): void => {
			if (Array.isArray(o)) return void o.forEach(walk);
			if (o && typeof o === "object") {
				const d = o as Record<string, unknown>;
				if (d.sourceId === sourceId && typeof d.excerpt === "string") {
					out.push(normalizeText(d.excerpt));
				}
				for (const v of Object.values(d)) walk(v);
			}
		};
		walk(rs);
	}
	return out;
}

// Dominios no verificables desde el entorno de CI (GitHub Actions):
// seg-social.es devuelve desde IPs de datacenter una página de bloqueo
// que llega con HTTP 200 y vocabulario plausible pero sin el contenido
// real. Contarían como stale falsos; se verifican en corridas locales.
const CI_UNREACHABLE_HOSTS = new Set([
	"www.seg-social.es",
	"prestaciones.seg-social.es",
	"sede.seg-social.gob.es",
]);
const unreachableHosts = new Set(
	process.env.FRESHNESS_LOCAL === "1" ? [] : [...CI_UNREACHABLE_HOSTS],
);

async function revalidateSources(): Promise<{
	unchanged: number;
	cosmetic: string[];
	stale: string[];
	fetchErrors: string[];
	skipped: string[];
}> {
	const metas = readdirSync(SOURCES_DIR)
		.filter((f) => f.endsWith(".json") && f !== "registry.json")
		.map((f) => JSON.parse(readFileSync(join(SOURCES_DIR, f), "utf8")) as SourceMeta);
	const unchanged: string[] = [];
	const cosmetic: string[] = [];
	const stale: string[] = [];
	const fetchErrors: string[] = [];
	const skipped: string[] = [];
	for (const meta of metas) {
		if (unreachableHosts.has(new URL(meta.url).host)) {
			skipped.push(meta.id);
			continue;
		}
		try {
			const { bytes, contentType } = await get(meta.url);
			const newText = await extractText(bytes, contentType);
			const newSha = sha256(bytes);
			const newTextSha = sha256(newText);
			if (newSha === meta.sha256 || newTextSha === meta.textSha256) {
				unchanged.push(meta.id);
				continue;
			}
			// Guard contra falsos stale: una página de bloqueo/challenge o una
			// respuesta truncada llega con 200 pero mucho menos texto que el
			// snapshot. Una reforma real no reduce la fuente a menos del 25 %.
			const oldText = readFileSync(join(SOURCES_DIR, `${meta.id}.txt`), "utf8");
			if (newText.length < Math.max(500, oldText.length * 0.25)) {
				fetchErrors.push(
					`${meta.id}: respuesta sospechosa (${newText.length} < ${Math.round(oldText.length * 0.25)} chars)`,
				);
				continue;
			}
			// Segunda guard: el texto nuevo debe compartir el vocabulario propio
			// del snapshot. Una WAF/página de bloqueo con 200 (p. ej. segss.es
			// desde IPs del CI) tiene tamaño plausible pero vocabulario ajeno;
			// una reforma real conserva casi todo el léxico de la norma.
			const longWords = new Set(
				oldText.toLowerCase().split(/\s+/).filter((w) => w.length > 12),
			);
			if (longWords.size > 0) {
				const lower = newText.toLowerCase();
				let hits = 0;
				for (const w of longWords) if (lower.includes(w)) hits++;
				if (hits / longWords.size < 0.3) {
					fetchErrors.push(
						`${meta.id}: contenido inverosímil (vocabulario ${hits}/${longWords.size})`,
					);
					continue;
				}
			}
			// texto distinto: ¿siguen presentes los extractos citados?
			const missing = excerptsForSource(meta.id).filter(
				(ex) => !newText.includes(ex),
			);
			if (missing.length === 0) {
				// cosmético: actualizar snapshot (bytes no se guardan fuera del repo
				// en el job; en CI se pierde el byte, pero el texto + sha quedan
				// registrados — el byte se re-captura en la próxima corrida manual)
				if (!DRY) {
					writeFileSync(join(SOURCES_DIR, `${meta.id}.txt`), newText);
					meta.sha256 = newSha;
					meta.textSha256 = newTextSha;
					meta.fetchedAt = new Date().toISOString();
					writeFileSync(
						join(SOURCES_DIR, `${meta.id}.json`),
						`${JSON.stringify(meta, null, 2)}\n`,
					);
				}
				cosmetic.push(meta.id);
			} else {
				stale.push(meta.id);
				console.log(`[freshness] STALE ${meta.id}: ${missing.length} extractos ausentes`);
			}
		} catch (e) {
			fetchErrors.push(`${meta.id}: ${String(e).slice(0, 120)}`);
		}
		await sleep(400);
	}
	return { unchanged: unchanged.length, cosmetic, stale, fetchErrors };
}

// ---------- descubrimiento de novedades (leads) ----------
interface Program { title: string; officialSourceUrl?: string }

function knownTitles(): Set<string> {
	const p = join(root, "data/universe/programs.json");
	if (!existsSync(p)) return new Set();
	const list = JSON.parse(readFileSync(p, "utf8")) as { programs: Program[] };
	const norm = (s: string) =>
		s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
	return new Set(list.programs.map((x) => norm(x.title)));
}

async function discoverLeads(): Promise<{ title: string; url: string; source: string }[]> {
	const known = knownTitles();
	const norm = (s: string) =>
		s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
	const leads: { title: string; url: string; source: string }[] = [];
	// sede CM «En plazo»
	try {
		for (let page = 0; page < 5; page++) {
			const { bytes } = await get(
				`https://sede.comunidad.madrid/buscador/tipo/Ayudas%2C%20Becas%20y%20Subvenciones/TipoEstadoDinamico/En%20plazo?t=&items_per_page=10&page=${page}`,
			);
			const html = bytes.toString("utf8");
			for (const m of html.matchAll(/<h3>\s*<a\s+([^>]+)>/g)) {
				const attrs = m[1];
				const href = /href="([^"]+)"/.exec(attrs)?.[1] ?? "";
				const title = /title="([^"]*)"/.exec(attrs)?.[1] ?? "";
				if (title && href && !known.has(norm(title))) {
					leads.push({
						title,
						url: `https://sede.comunidad.madrid${href}`,
						source: "sede-cm",
					});
				}
			}
			await sleep(300);
		}
	} catch (e) {
		console.log("[freshness] leads sede:", String(e).slice(0, 100));
	}
	if (!DRY) {
		mkdirSync(join(root, "data/catalog"), { recursive: true });
		writeFileSync(
			join(root, "data/catalog/leads-new.json"),
			`${JSON.stringify(
				{ date: TODAY, pending: leads },
				null,
				2,
			)}\n`,
		);
	}
	return leads;
}

async function main() {
	console.log(`[freshness] ${TODAY}${DRY ? " (dry-run)" : ""}`);
	const res = await revalidateSources();
	console.log(
		`[freshness] fuentes: ${res.unchanged} iguales, ${res.cosmetic.length} cosméticas, ${res.stale.length} STALE, ${res.fetchErrors.length} errores, ${res.skipped.length} no verificables desde este entorno`,
	);
	// En una corrida anómala (red degradada, bloqueos masivos de IP) no se
	// toca el stale acumulado: el gate verifica contra el último estado
	// fiable, no contra una lista fabricada por una corrida rota.
	// Umbral relativo: algunas fuentes (segss.es) devuelven bloqueos
	// persistentes desde las IPs del CI; si cada error contara igual, el
	// job nunca actualizaría el stale acumulado.
	const checked =
		res.unchanged + res.cosmetic.length + res.stale.length + res.fetchErrors.length;
	const anomalous = res.fetchErrors.length > Math.max(10, checked * 0.2);
	if (!DRY) mkdirSync(FRESH_DIR, { recursive: true });
	if (!DRY && !anomalous) {
		// stale.json: el build las excluirá (fail-closed vía G12/stale)
		writeFileSync(
			join(SOURCES_DIR, "..", "freshness-stale.json"),
			`${JSON.stringify({ date: TODAY, stale: res.stale }, null, 2)}\n`,
		);
	}
	const leads = await discoverLeads();
	console.log(`[freshness] leads nuevos: ${leads.length}`);
	const rec: RunRecord = {
		date: TODAY,
		checked: res.unchanged + res.cosmetic.length + res.stale.length + res.fetchErrors.length,
		unchanged: res.unchanged,
		cosmetic: res.cosmetic,
		stale: res.stale,
		fetchErrors: res.fetchErrors,
		skipped: res.skipped,
		leads: leads.length,
		bundleDigest: null,
		deployOk: false,
	};
	if (!DRY) appendFileSync(join(FRESH_DIR, "runs.jsonl"), `${JSON.stringify(rec)}\n`);
	// código de salida: anomalía → 2 (la corrida queda señalada); el gate
	// real es validate:full antes de hacer commit/push
	if (anomalous) {
		console.error("[freshness] demasiados errores de red — run anómalo");
		process.exitCode = 2;
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
