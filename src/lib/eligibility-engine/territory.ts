/**
 * Jerarquía territorial INE (docs/07 §3.3): CCAA ⊃ provincia ⊃ municipio.
 * within_territory: T = seguro dentro, F = seguro fuera, U = falta detalle.
 *
 * INE completo (tests y scripts de Node). El cliente del asistente usa
 * territory-lite.ts — importar este módulo en la web metería ~734 KB de
 * datos en el chunk (F10-PERF).
 */

import territoryJson from "../../../data/eligibility/territory.json";
import { createTerritoryApi, type TerritoryData } from "./territory-core";

export type { Territory } from "./territory-core";

const api = createTerritoryApi(territoryJson as TerritoryData);

export const ccaaOfProvince = api.ccaaOfProvince;
export const municipalityExists = api.municipalityExists;
export const provinceExists = api.provinceExists;
export const ccaaExists = api.ccaaExists;
export const territoryName = api.territoryName;
export const withinTerritory = api.withinTerritory;
