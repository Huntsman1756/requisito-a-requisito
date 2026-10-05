/**
 * Resolución de dominios oficiales contra el registro (docs/08 §1).
 * Exacto antes que sufijo (".gob.es"); el sufijo más largo gana.
 */

export interface RegistryDomain {
	host: string;
	maxRank: 1 | 2 | 3 | 4;
	label: string;
}

export function hostOf(url: string): string | null {
	try {
		return new URL(url).hostname.toLowerCase();
	} catch {
		return null;
	}
}

export function matchDomain(
	host: string,
	domains: RegistryDomain[],
): RegistryDomain | null {
	const h = host.toLowerCase();
	const exact = domains.find((d) => d.host === h);
	if (exact) return exact;
	let best: RegistryDomain | null = null;
	for (const d of domains) {
		if (!d.host.startsWith(".")) continue;
		if (h.endsWith(d.host) && (best === null || d.host.length > best.host.length)) {
			best = d;
		}
	}
	return best;
}

/**
 * G3: la fuente debe tener dominio registrado y su rango declarado no puede
 * superar (ser mejor que) el rango máximo que el dominio puede acreditar:
 * `rank >= domain.maxRank`. Una fuente puede declararse más débil que el techo
 * (p. ej. una página BOE como rango 3), nunca más fuerte.
 */
export function rankAllowed(
	url: string,
	rank: number,
	domains: RegistryDomain[],
): { ok: boolean; host: string | null; domain: RegistryDomain | null } {
	const host = hostOf(url);
	if (!host) return { ok: false, host: null, domain: null };
	const domain = matchDomain(host, domains);
	if (!domain) return { ok: false, host, domain: null };
	return { ok: rank >= domain.maxRank, host, domain };
}
