/**
 * freshness.ts — lectura de las corridas de frescura (data/freshness/runs.jsonl).
 *
 * Compartido por scripts/freshness.ts (productor), publish-public-data.ts
 * (publica frescura.json) y las páginas (textos «revisada automáticamente»).
 * Nada se inventa: cada fecha sale de una corrida registrada.
 */

/** Hosts que el CI no puede revalidar (WAF ante IPs de datacenter): los
 *  cubre la revalidación local (--only-skipped, FRESHNESS_LOCAL=1). */
export const CI_UNREACHABLE_HOSTS = new Set([
	"www.seg-social.es",
	"prestaciones.seg-social.es",
	"sede.seg-social.gob.es",
	"www.comunidad.madrid",
	"sede.comunidad.madrid",
	"comunidad.madrid",
]);

export interface FreshnessRun {
	date: string;
	runner?: "ci" | "local";
	onlySkipped?: boolean;
	checked: number;
	unchanged?: number;
	cosmetic?: string[];
	stale?: string[];
	fetchErrors?: string[];
	skipped?: string[];
	leads?: number;
	bundleDigest?: string | null;
	deployOk?: boolean;
}

const errId = (e: string) => e.split(":")[0];

/** La corrida cubrió esa fuente (la descargó y comprobó). */
export function coveredBy(
	run: FreshnessRun,
	source: { id: string; url: string },
): boolean {
	if (run.onlySkipped) {
		// Una corrida --only-skipped solo ve los hosts que el CI se salta.
		try {
			return CI_UNREACHABLE_HOSTS.has(new URL(source.url).host);
		} catch {
			return false;
		}
	}
	return !(run.skipped ?? []).includes(source.id);
}

/** Cubierta y con resultado correcto: no stale ni error en esa corrida. */
export function okIn(
	run: FreshnessRun,
	source: { id: string; url: string },
): boolean {
	if (!coveredBy(run, source)) return false;
	if ((run.stale ?? []).includes(source.id)) return false;
	if ((run.fetchErrors ?? []).some((e) => errId(e) === source.id)) return false;
	return true;
}

/** Última revalidación correcta por fuente: se recorren las corridas de la
 *  más reciente a la más antigua y queda la primera correcta de cada una. */
export function lastOkBySource(
	runs: FreshnessRun[],
	sources: { id: string; url: string }[],
): Record<string, string> {
	const out: Record<string, string> = {};
	for (const run of [...runs].reverse()) {
		for (const s of sources) {
			if (out[s.id]) continue;
			if (okIn(run, s)) out[s.id] = run.date;
		}
	}
	return out;
}

/** Última corrida con trabajo hecho (checked > 0), de cualquier runner. */
export function lastAutoRun(runs: FreshnessRun[]): FreshnessRun | null {
	for (const run of [...runs].reverse()) {
		if ((run.checked ?? 0) > 0) return run;
	}
	return null;
}
