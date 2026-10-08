# Personas positivas nuevas — pendientes de revisión humana

Se detectaron seis programas sin golden positivo. Los siguientes perfiles
ficticios se derivan de requisitos citados en sus normas y esperan `posible`,
no derecho confirmado. Todos conservan `review.status: pending`.
Los goldens no cambian ni aprueban ninguna regla.

| Golden nuevo | Perfil y vía citada | Fuente / localizador | Daniel |
|---|---|---|---|
| gp-completitud-bono-cultural-joven | Nacimiento en 2008, 18 años en 2026 | boe-bono-cultural-2026, Primero. Beneficiarios | ☐ Revisado |
| gp-completitud-bono-social-electrico | Familia numerosa con título; vía de art. 3.2.b, sin depender de sumar rentas del hogar | boe-rd-897-2017-bono-social, art. 3.2.b | ☐ Revisado |
| gp-completitud-descuento-transporte-familia-numerosa | Titular de familia numerosa | boe-rd-1621-2005-reglamento-fn, art. 11.4 | ☐ Revisado |
| gp-completitud-madrid-ayudas-nacimiento-adopcion-multiple | Residente empadronado en Madrid, dos recién nacidos del mismo parto, renta individual 12.000 €; quedan por comprobar la renta per cápita y demás condiciones | bocm-20231228-18-nacimiento-multiple, arts. 5.1 y 6.b/c | ☐ Revisado |
| gp-completitud-prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad | Familia monoparental, recién nacido, ingresos declarados 0 €; quedan condiciones del nacimiento y trámite | boe-lgss-prestacion-familia, art. 357.1–2 | ☐ Revisado |
| gp-completitud-subsidio-mayores-52 | 55 años y desempleo total; quedan cotización, rentas y demás condiciones legales | boe-lgss-prestacion-familia, arts. 280.1 y 274.1.b | ☐ Revisado |

Cada JSON incluye los localizadores, extractos en la justificación y el perfil
exacto. La descripción del caso múltiple incluye un mismo parto como supuesto
del autor; el perfil del navegador solo mide número de personas a cargo. Esa
limitación se conserva en la regla y no se presenta como verificada por el motor.

La comprobación de cobertura exige que el resultado positivo siga coincidiendo
con el motor actual y la versión concreta. Los porcentajes del barrido son
cobertura de un dominio discretizado; no son probabilidades de elegibilidad.
