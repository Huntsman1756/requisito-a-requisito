/**
 * territory-core.ts — jerarquía territorial INE (docs/07 §3.3), pura.
 * Los datos se inyectan: el INE completo lo usan tests y scripts
 * (territory.ts, ~734 KB); el navegador usa territory-lite.ts
 * (CCAA + provincias + municipios de la CM — lo único que la UI puede
 * producir: el asistente sale del flujo si el usuario no es de Madrid).
 */

export interface TerritoryData {
	source?: Record<string, unknown>;
	ccaa: { code: string; name: string }[];
	provinces: { code: string; name: string; ccaa: string }[];
	municipalities: { code: string; name: string; province: string }[];
}

export interface Territory {
	ccaa?: string;
	province?: string;
	municipality?: string;
}

type TFU = "T" | "F" | "U";

export function createTerritoryApi(territory: TerritoryData) {
	const provCcaa = new Map(territory.provinces.map((p) => [p.code, p.ccaa]));
	const munSet = new Set(territory.municipalities.map((m) => m.code));
	const provSet = new Set(territory.provinces.map((p) => p.code));
	const ccaaSet = new Set(territory.ccaa.map((c) => c.code));

	function ccaaOfProvince(province: string): string | null {
		return provCcaa.get(province) ?? null;
	}
	function municipalityExists(code: string): boolean {
		return munSet.has(code);
	}
	function provinceExists(code: string): boolean {
		return provSet.has(code);
	}
	function ccaaExists(code: string): boolean {
		return ccaaSet.has(code);
	}
	function territoryName(t: Territory): string | null {
		if (t.municipality) {
			return (
				territory.municipalities.find((m) => m.code === t.municipality)?.name ??
				null
			);
		}
		if (t.province) {
			return territory.provinces.find((p) => p.code === t.province)?.name ?? null;
		}
		if (t.ccaa) {
			return territory.ccaa.find((c) => c.code === t.ccaa)?.name ?? null;
		}
		return null;
	}

	/** Deriva el nivel más fino disponible del usuario. */
	function resolve(t: Territory): {
		ccaa: string | null;
		province: string | null;
		municipality: string | null;
	} {
		const municipality =
			t.municipality && munSet.has(t.municipality) ? t.municipality : null;
		const province =
			(t.province && provSet.has(t.province) ? t.province : null) ??
			(municipality ? municipality.slice(0, 2) : null);
		const ccaa =
			(t.ccaa && ccaaSet.has(t.ccaa) ? t.ccaa : null) ??
			(province ? ccaaOfProvince(province) : null);
		return { ccaa, province, municipality };
	}

	/**
	 * ¿El territorio del usuario está dentro del de la regla?
	 * La regla pide un nivel concreto (ccaa/province/municipality); el usuario da
	 * lo que sabe. Si el dato del usuario es más grueso que lo pedido y podría
	 * contener o no el territorio exigido ⇒ U.
	 */
	function withinTerritory(user: Territory, rule: Territory): TFU {
		const u = resolve(user);

		// La regla exige el nivel que declara y todos sus ancestros: un municipio
		// implica su provincia y su CCAA; una provincia, su CCAA.
		const ruleProv =
			rule.province ?? (rule.municipality ? rule.municipality.slice(0, 2) : undefined);
		const ruleCcaa =
			rule.ccaa ?? (ruleProv !== undefined ? ccaaOfProvince(ruleProv) : null);

		if (!ruleCcaa && !ruleProv && !rule.municipality) return "T";
		if (rule.municipality && !munSet.has(rule.municipality)) return "F";

		if (ruleCcaa) {
			if (u.ccaa === null) return "U";
			if (u.ccaa !== ruleCcaa) return "F";
		}
		if (ruleProv) {
			if (u.province === null) return "U";
			if (u.province !== ruleProv) return "F";
		}
		if (rule.municipality) {
			// El usuario sabe su provincia/CCAA pero no el municipio:
			// el municipio exigido puede o no ser el suyo.
			if (u.municipality === null) return "U";
			if (u.municipality !== rule.municipality) return "F";
		}
		return "T";
	}

	return {
		ccaaOfProvince,
		municipalityExists,
		provinceExists,
		ccaaExists,
		territoryName,
		withinTerritory,
	};
}
