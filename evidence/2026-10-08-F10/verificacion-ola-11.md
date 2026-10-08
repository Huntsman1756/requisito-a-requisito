# Verificación ola 11 — re-autorías F10-REG (corrección de sospechosos)

**Fecha:** 2026-10-08 · **Autor:** agente (sesión F10-FIAB) · **Verificador
independiente:** subagente distinto con `templates/verificador-checklist.md` ·
**Detonante:** tria de defectos `evidence/2026-10-06-panel-v2/tria-defectos-v1.md`
(F10-REG-1..7).

## Ámbito (pertenencia a la ola)

`asignacion-hijo-a-cargo` (v5→v6), `subsidio-desempleo` (v1→v2),
`becas-generales-mefp-2026-2027` (v2→v3), `ayto-escuela-infantil` (v1→v2),
`ayto-tarjeta-azul-discapacidad` (v1→v2).

F10-REG-2 (`madrid-abono-transporte-infantil`) y F10-REG-4
(`pension-incapacidad-permanente`) resultaron **correctos tal cual**: el borde
`age < 15` equivale a «0–14 años» (convocatoria 2026: nacidos 2012–2026) y el
requisito de edad de IP ya era `soft` con las excepciones en el label/uncovered.
Sin cambio de regla; fijados con tests de frontera en
`tests/eligibility/boundary/f10-reg.test.ts`.

## Cambios y dictamen del verificador

| Regla | Cambio | Verificador |
|---|---|---|
| `asignacion-hijo-a-cargo` v6 | uncovered `grado-discapacidad-no-preguntado` (extracto art. 351.a LGSS verificado literal) | OK |
| `subsidio-desempleo` v2 | uncovered `trabajo-tiempo-parcial` (art. 274.1 in fine, literal) | OK |
| `becas-generales-mefp-2026-2027` v3 | label «centro español» + uncovered `solo-titulos-oficiales-centro-espanol` (extracto literal del extracto BDNS) | OK (matiz: el «centro español» se apoya además en el «Primero» de la convocatoria — declarado en el propio uncovered) |
| `ayto-escuela-infantil` v2 | `residir-madrid` hard→soft («prevean residir» no es medible por el cuestionario; hard F era un falso negativo) + uncovered `prever-residir` | OK |
| `ayto-tarjeta-azul-discapacidad` v2 | label residente/empadronado + uncovered `residente-vs-empadronado` | OK |

Comprobaciones del verificador: los 5 extractos nuevos están literalmente en
los `.txt` normalizados (sha256 recalculados), las afinidades label↔extracto
son correctas, la dirección de asimetría (ADR-017) no empeora en ningún caso
(el único cambio semántico va de hard a soft), no hay cambios ajenos en el diff
y las 5 reglas quedan con `humanReview: pending` para re-muestreo.

## Gates

- `npm run eligibility:validate`: 52 rulesets, **0 errores**, 52 avisos
  (todos `ELIG_G10_HUMAN_REVIEW` — esperado).
- `npm run eligibility:exhaustive`: 175.451 perfiles, 0 violaciones.
- `npm test`: 469 tests, incluidos los 44 goldens (ahora en
  `tests/eligibility/fiabilidad-regresion.test.ts`) y los tests de frontera
  F10-REG.
