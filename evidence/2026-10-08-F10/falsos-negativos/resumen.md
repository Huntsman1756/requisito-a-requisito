# Segunda verificación de falsos negativos — resumen (F10, 08/10)

50/50 programas revisados por **5 verificadores independientes** (ninguno es el
autor de las reglas), con cita literal de la fuente en cada informe
(`falsos-negativos/<slug>.md`). Pregunta central: ¿puede un requisito `hard` o
una fila de la ficha dar F a alguien que la norma admite? (ADR-017: el peor
fallo del producto es decir «no» a quien tiene derecho.)

## Correcciones aplicadas (regla de la sesión: lo que el cuestionario no puede
## medir no puede producir F duro ⇒ soft o rama `any`/`in`)

| slug | riesgo | requisito | corrección |
|---|---|---|---|
| complemento-ayuda-infancia | bloqueante | residencia-espana-1a | soft + label (mide padrón municipal, norma pide residencia en España con exenciones) |
| sermas-ortoprotesica-desplazamiento | alto | derecho-asistencia-sermas | defecto `eq "cm"` → `within_territory {ccaa:13}` (era F para el 100 % de perfiles) |
| sermas-reintegro-gastos-sanitarios | alto | titular-tarjeta-sermas | idem |
| anticipos-docentes-cm | alto | funcionario-docente-activo | `eq "docente"` → `in [docente, empleado-publico]` |
| cm-reintegro-accidentes-trabajo | alto | empleado-publico-cm | `eq` → `in [empleado-publico, docente]` |
| descuento-transporte-familia-numerosa | alto | titulo-familia-numerosa | `eq` → `in [familia-numerosa, monoparental]` (monoparental con título) |
| ayto-ibi-familia-numerosa | alto | titulo-familia-numerosa | idem |
| prestacion-cuidado-menor-enfermedad-grave | alto | trabajadora-afiliada-alta | añadido `empleado-publico` (laboral público sí cotiza; solo funcionarios de régimen propio fuera) |
| prestacion-nacimiento-adopcion-fn-mono-disc | alto | colectivo-familiar | rama `any` nueva: quien adquiere la condición con el nacimiento (2+ menores ya a cargo) |
| ayto-tarjeta-azul-discapacidad | alto | discapacidad-min-33 | `any` [discapacidad ≥33, pensionista, dependiente] — categorías II/III/V de la norma |
| madrid-abono-transporte-65 | alto | edad-65 | `any` [65+, pensionista, dependiente] — Tarjeta Azul cubre sin la edad |
| ayto-emergencia-social | alto | empadronado-madrid, mayor-edad | ambos soft: excepciones (informe social, emancipado) no medibles |
| ayto-escuela-infantil | alto | hijo-primer-ciclo | soft: nacidos 2023 con continuidad + no-nacidos (FPP < 1/1/2027) no medibles |
| complemento-ayuda-infancia | alto | menor-en-unidad | soft: «miembros de la unidad» ≠ «personas a tu cargo» |
| imv | alto | edad-minima | soft: excepciones art. 5.2 (extutela, prisión, VG, trata, huérfanos) no medibles |
| leganes-prestaciones-especial-necesidad | alto | empadronado-leganes-6m | soft: excepciones VG/intrafamiliar/protección/transeúntes |
| fuenlabrada-prestaciones-sociales | alto | empadronado-fuenlabrada | soft: excepciones VG, transeúntes, LO 1/1996 |
| mostoles-prestaciones-sociales | alto | empadronado-mostoles, mayor-edad | ambos soft; y umbral corregido a IPREM_ANUAL_14P (8.400 €, la ordenanza dice 14 pagas) |
| madrid-renta-minima-insercion | alto | residencia-un-ano, edad-25-65 | ambos soft: vías 18–24, +65 sin pensión, emancipados y cómputos del art. 7.3 |
| madrid-titulo-familia-numerosa | alto | edad-hijos | soft: unidades de 3+ hermanos huérfanos adultos (art. 2.2.e) |
| madrid-ayudas-urgencia-social | alto | ambito-territorial-cm | soft: la norma pide presencia, no empadronamiento |
| madrid-bono-alquiler-joven | alto | vivienda-en-madrid | soft: la vía «vaya a constituir domicilio» existe |
| madrid-cheque-escuela-infantil | alto | hijo-menor-3 | soft: NEE que repite 1er ciclo y no-nacidos no medibles |
| madrid-ayudas-nacimiento-adopcion-multiple | alto | dos-o-mas-personas-cargo | soft + label «múltiple»; art. 5.3 declarado en uncovered |
| subsidio-desempleo | alto | carencia-rentas | label aclara: norma mide mes natural anterior, nosotros proxy anual |
| prestacion-cuidador-no-profesional (__v-2026-10-23) | alto | residencia-regla-completa | añadida exención art. 5.1.c (asilo, protección subsidiaria/temporal) al uncovered de la versión nueva |
| prestaciones-dependencia-saad (__v-2026-10-23) | alto | residencia-regla-completa | idem |
| prestamos-personal-publico-cm | bajo→corregido | personal-laboral-cm | soft + catálogo completo de colectivos en uncovered |
| pension-jubilacion-contributiva | bajo→corregido | label edad-minima-52 | corregido: el art. 206.6 impide bajar de 52 |
| subsidio-mayores-52 | bajo→corregido | — | añadida vía de acceso diferido (art. 280.1) a uncovered |
| madrid-bono-alquiler-joven | bajo→corregido | documents.contrato | ya no es `mandatory` (vía pre-contractual) |

## Reglas sin cambio relevante (revisadas, informe individual con cita)

asignacion-hijo-a-cargo, becas-generales-mefp-2026-2027 (renombrado del fichero
pendiente, no urgente), bono-cultural-joven, bono-social-electrico,
bono-social-termico, cese-actividad-autonomos, fuenlabrada-fuenlacarenet-2026,
madrid-abono-transporte-infantil, madrid-abono-transporte-joven,
madrid-accede-prestamo-libros, madrid-ayuda-pago-unico-vg,
madrid-ayudas-alquiler-plan-estatal, madrid-ayudas-nacimiento-general
(subrogación art. 5.2 comprobada: el subrogado **sí** debe cumplir el art. 6 —
informe inicial matizado en la revisión del extracto literal), madrid-beca-
comedor-escolar, madrid-becas-bachillerato-centros-privados, pension-*,
prestacion-desempleo-contributiva, prestacion-nacimiento-cuidado-menor,
prestacion-cuidador-no-profesional (versión base), prestaciones-dependencia-
saad (versión base).

## Evidencia de la corrección

- `tests/eligibility/boundary/f10-fn.test.ts` — 29 tests que reproducen cada
  falso negativo (en rojo antes del fix, en verde después).
- `eligibility:validate` — 52 rulesets, 0 errores.
- Goldens: 44 personas / 47 expectativas, 0 diferencias (re-pin de versión
  + expectativa de `gp-imv-joven-solo` actualizada: edad-minima ya no es hard).
- Exhaustivo: 259.391 perfiles, 0 violaciones de invariantes.
- Las 29 reglas tocadas pasan a `muestreo-ola-12.md` (re-muestreo para Daniel)
  y `humanReview` permanece `pending`; `muestreo-indice.json` regenerado.
