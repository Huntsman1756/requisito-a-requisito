# Verificación ola 12c — correcciones de falsos negativos (extracto)

Extracto de `verificacion-ola-12.md` para los 6 programas de
esta hoja. Método, gates y resultado global: ver el informe matriz. Los 2 KO
que señalaba el informe global (`prestamos-personal-publico-cm` y
`subsidio-mayores-52`) ya están subsanados: extractos ampliados a la cláusula
completa y catálogo del convenio recortado a lo que prueba el art. 139.

| slug | OK/KO | justificación (cita literal de la fuente citada o del `.txt`) |
|---|---|---|
| ayto-escuela-infantil | **OK** | Soft justificado: la fuente (apdo. 2.1) contiene las dos vías no medibles: «(nacidos en 2024, 2025 y 2026 o de 2023 que precisen continuar en el primer ciclo de educación infantil por causas acreditadas)» y «los menores cuyo nacimiento se prevea para fecha anterior al 1 de enero de 2027» (2.1.b, además del uncovered `nacimiento-previsto-2027`). |
| madrid-ayudas-nacimiento-adopcion-multiple | **OK** | Soft + label «múltiple»: art. 5.1 «los progenitores que hayan tenido dos o más hijos de nacimiento o adopción múltiple». El cuestionario cuenta personas a cargo pero no puede saber si nacieron en el mismo parto → soft correcto; la condición `dependents count_where_gte 2` no genera F indebida al beneficiario real (2+ hijos del parto múltiple = 2+ dependents). |
| madrid-bono-alquiler-joven | **OK** | Soft + `documents.contrato` ya no `mandatory`: la fuente BOCM dice «una vivienda que constituya o vaya a constituir su domicilio habitual y permanente» y la sede «Ser titular de uno de los siguientes tipos de contratos **o estar en disposición de firmarlo**» → la vía pre-contractual existe y no es medible. |
| madrid-cheque-escuela-infantil | **OK** | Soft: NEE que repite está en el extracto «los niños mayores de tres años que deban permanecer escolarizados un año más en el primer ciclo… por necesidades educativas especiales» y los no-nacidos se apoyan en uncovered `nacido-antes-2027` (bases art. 4.1.a: «Haber nacido o estar previsto el nacimiento con anterioridad a la fecha que se determine»). |
| madrid-titulo-familia-numerosa | **OK** | Soft: la excepción está en art. 2.2.e «Tres o más hermanos huérfanos de padre y madre, mayores de 18 años, o dos, si uno de ellos es discapacitado, que convivan y tengan una dependencia económica entre ellos» — no medible por `dependents`. Recogida en uncovered `equiparaciones-2-hijos`. |
| prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad | **OK** | Nueva rama `dependents count_where_gte 2 (age<18)` dentro del `any`: implementa «en una familia numerosa **o que, con tal motivo, adquiera dicha condición**» (art. 357.1, presente en el extracto citado) — quien ya tiene 2 menores adquiere la condición de FN general con el tercer nacimiento. Solo ensancha un `any`: no introduce F. |
