# Hoja de muestreo — Ola 12c (ADR-040) · correcciones de falsos negativos

Fecha: 2026-10-08 · Programas: 6 · Parte de la ola 12, dividida
en cinco hojas (12a–12e) para que un KO solo detenga su parte — ver
`verificacion-ola-12c.md`.

**Regla ADR-040**: revisa 2 de esta hoja; si alguna sale KO, **solo esta hoja
se bloquea** — las demás siguen su curso.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **6 regla(s)**: ayto-escuela-infantil, madrid-ayudas-nacimiento-adopcion-multiple, madrid-bono-alquiler-joven, madrid-cheque-escuela-infantil, madrid-titulo-familia-numerosa, prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-08-F10/muestreo-ola-12c.md` — es la única vía que pone humanReview=approved.

## Tema de esta hoja — excepciones de infancia/familia/vivienda → soft o rama

Menores no nacidos aún, NEE que repite ciclo, parto múltiple (nacimiento ≠ personas a cargo), equiparación a familia numerosa, vía pre-contractual del bono alquiler: excepciones reales en la fuente que el cuestionario no mide → aviso; cuando sí la mide (adquiere condición FN con 2+ menores) se añadió la rama.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| `ayto-escuela-infantil` | OK | ☐ OK ☐ KO |
| `madrid-ayudas-nacimiento-adopcion-multiple` | OK | ☐ OK ☐ KO |
| `madrid-bono-alquiler-joven` | OK | ☐ OK ☐ KO |
| `madrid-cheque-escuela-infantil` | OK | ☐ OK ☐ KO |
| `madrid-titulo-familia-numerosa` | OK | ☐ OK ☐ KO |
| `prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad` | OK | ☐ OK ☐ KO |

## Dictamen del verificador (extracto de `verificacion-ola-12.md`)

- `ayto-escuela-infantil` — ****OK****: Soft justificado: la fuente (apdo. 2.1) contiene las dos vías no medibles: «(nacidos en 2024, 2025 y 2026 o de 2023 que precisen continuar en el primer ciclo de educación infantil por causas acreditadas)» y «los menores cuyo nacimiento se prevea para fecha anterior al 1 de enero de 2027» (2.1.b, además del uncovered `nacimiento-previsto-2027`).
- `madrid-ayudas-nacimiento-adopcion-multiple` — ****OK****: Soft + label «múltiple»: art. 5.1 «los progenitores que hayan tenido dos o más hijos de nacimiento o adopción múltiple». El cuestionario cuenta personas a cargo pero no puede saber si nacieron en el mismo parto → soft correcto; la condición `dependents count_where_gte 2` no genera F indebida al beneficiario real (2+ hijos del parto múltiple = 2+ dependents).
- `madrid-bono-alquiler-joven` — ****OK****: Soft + `documents.contrato` ya no `mandatory`: la fuente BOCM dice «una vivienda que constituya o vaya a constituir su domicilio habitual y permanente» y la sede «Ser titular de uno de los siguientes tipos de contratos **o estar en disposición de firmarlo**» → la vía pre-contractual existe y no es medible.
- `madrid-cheque-escuela-infantil` — ****OK****: Soft: NEE que repite está en el extracto «los niños mayores de tres años que deban permanecer escolarizados un año más en el primer ciclo… por necesidades educativas especiales» y los no-nacidos se apoyan en uncovered `nacido-antes-2027` (bases art. 4.1.a: «Haber nacido o estar previsto el nacimiento con anterioridad a la fecha que se determine»).
- `madrid-titulo-familia-numerosa` — ****OK****: Soft: la excepción está en art. 2.2.e «Tres o más hermanos huérfanos de padre y madre, mayores de 18 años, o dos, si uno de ellos es discapacitado, que convivan y tengan una dependencia económica entre ellos» — no medible por `dependents`. Recogida en uncovered `equiparaciones-2-hijos`.
- `prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad` — ****OK****: Nueva rama `dependents count_where_gte 2 (age<18)` dentro del `any`: implementa «en una familia numerosa **o que, con tal motivo, adquiera dicha condición**» (art. 357.1, presente en el extracto citado) — quien ya tiene 2 menores adquiere la condición de FN general con el tercer nacimiento. Solo ensancha un `any`: no introduce F.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre SOLO esta hoja y se corrige
antes de aprobar el resto.
