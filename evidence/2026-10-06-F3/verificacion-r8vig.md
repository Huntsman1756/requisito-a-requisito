# Verificación R8-VIG — versiones con vigencia de las reglas de dependencia

**Fecha:** 2026-10-06 · **Detonante:** la Ley 4/2026 (BOE-A-2026-20528) se
publicó el 03/10/2026 pero **entra en vigor el 23/10/2026**. Entre el 06/10
y el 22/10 la web mostraba la redacción nueva como vigente — error visible
en producción.

## Diseño

- `RuleSet` admite `validFrom` / `validUntil` (ISO, fechas incluidas) y
  `versionNote` (Zod + `schemas/rule-set.schema.json`).
- `src/lib/eligibility-engine/versions.ts`: `pickValidVersions` elige la
  única versión vigente por `benefitSlug`; 0 ó >1 ⇒ «No podemos evaluar»
  (fail-closed, selfCheck I11).
- Invariante **I11**: la versión evaluada debe cubrir la fecha de consulta
  (`referenceDate` si la convocatoria la fija; si no, `today`). Violación ⇒
  la ayuda sale en «no podemos evaluar», nunca con veredicto.
- `eligibility:validate`: `ELIG_VERSION_OVERLAP` si dos versiones del mismo
  slug se solapan.
- Ficha `/ayudas/<slug>`: elige la versión vigente en la fecha del build y
  muestra «Esta ayuda cambia el 23 de octubre de 2026 (Ley 4/2026)» con
  enlace al texto vigente y al de la nueva versión. La tarjeta de resultados
  muestra la misma nota.

## Las dos reglas, dos versiones

| Regla | Versión A (vigente hoy) | Versión B |
|---|---|---|
| `prestaciones-dependencia-saad` | `…json`, validUntil 2026-10-22 | `…__v-2026-10-23.json`, validFrom 2026-10-23 |
| `prestacion-cuidador-no-profesional` | ídem | ídem |

- **Versión A**: recuperada del git (commit 14b8f3a, texto previo a la
  reforma) con las citas reapuntadas a la fuente
  `boe-ley-39-2006-dependencia-pre-ley4` — snapshot de la versión
  consolidada del BOE con `p=20251022` (última versión anterior a la
  reforma), tomado el 2026-10-07.
- **Versión B**: el contenido re-autorizado contra la Ley 4/2026 más el
  ítem `reactivacion-suspendidas` citando la **disposición adicional
  décima de la Ley 4/2026** (prestaciones suspendidas recuperan vigencia
  y cuantía — nueva fuente `boe-ley-4-2026-dependencia`).

## Comprobaciones

1. 55 citas de la versión A resuelven literalmente contra el snapshot
   pre-ley4 + decreto CM (comprobación programática).
2. 55 citas de la versión B resuelven contra los snapshots actuales.
3. `eligibility:validate` → 47 rulesets, 0 errores (los avisos son los de
   `humanReview: pending` de siempre).
4. Tests en `tests/eligibility/versions.test.ts`: frontera 22/10 vs 23/10,
   sin-versión ⇒ «No podemos evaluar», solape ⇒ I11/overlap.
5. Goldens: `gp-cuidadora-64-carabanchel` y `gp-dependencia-cuidadora`
   evalúan `posible` + ROLLING en la versión A (vigente hoy) y la B
   (referencia `today` fijada al 2026-10-23 en copia del golden).

## Decisión

HECHO. En producción, hasta el 22/10 se evalúa la redacción anterior; el
23/10 cambia sola (el despliegue diario de frescura re-publica la ficha y
el bundle la selecciona en runtime).

**No verificado:** que la sede de la CM aplique ya la interpretación nueva;
las etiquetas «en revisión» de la versión B lo reflejan.
