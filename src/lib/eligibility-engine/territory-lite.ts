/**
 * territory-lite.ts — índice territorial para el navegador (F10-PERF).
 * El INE completo (734 KB, 8.132 municipios) no entra en el chunk del
 * asistente: la UI solo admite municipios de la Comunidad de Madrid (si no,
 * se sale a la pantalla «fuera del ámbito») y las reglas solo citan
 * municipios de la provincia 28 — territory-lite.test.ts lo garantiza.
 * CCAA y provincias van completas (pesan nada).
 */

import liteJson from "../../../data/eligibility/territory-lite.json";
import { createTerritoryApi, type TerritoryData } from "./territory-core";

const api = createTerritoryApi(liteJson as TerritoryData);

export const ccaaOfProvince = api.ccaaOfProvince;
export const municipalityExists = api.municipalityExists;
export const provinceExists = api.provinceExists;
export const ccaaExists = api.ccaaExists;
export const territoryName = api.territoryName;
export const withinTerritory = api.withinTerritory;
