# madrid-titulo-familia-numerosa

## Análisis

1. `hijos-minimo` (hard:true) exige `dependents count ≥ 2` sin subcondición. Como suelo es correcto: ninguna vía del art. 2 de la Ley 40/2003 constituye familia numerosa con menos de dos hijos/miembros («tres o más hijos» en general; equiparaciones con «dos hijos»). Ojo al sentido contrario: `dependents` recoge «hijas, hijos u **otras personas** que dependan de ti», así que un ascendiente o pareja a cargo también cuenta → puede dar T indebido (falso positivo), nunca F por este motivo.

2. `edad-hijos` (hard:true) cuenta ≥2 dependientes con `age ≤ 25` **o** `disability ∈ {yes, unknown, declined}`. Es deliberadamente permisivo respecto a la norma (hijos de 21–25 que **no** estudian computan igualmente → T indebido, dirección falso positivo; declarado en `estudios-21-25` y `solteros` como no comprobables). Falsos negativos que sí produce:
   - **Hermanos huérfanos adultos**: el art. 2.2 equipara a FN a «Tres o más hermanos huérfanos de padre y madre, mayores de 18 años, o dos, si uno de ellos es discapacitado, que convivan y tengan una dependencia económica entre ellos». Tres hermanos huérfanos de 26, 28 y 30 años sin discapacidad no pasan el filtro de edad ni el de discapacidad → count 0 → F aunque la norma los cubre. Está mencionado en `equiparaciones-2-hijos`, pero el hard no lo recoge. Supuesto estrecho pero real.
   - **Hijos que no conviven (separado/divorciado)**: «El padre o la madre separados o divorciados, con tres o más hijos, sean o no comunes, aunque estén en distintas unidades familiares, siempre que se encuentren bajo su dependencia económica, aunque no vivan en el domicilio conyugal» (art. 2.2.c). Si el usuario interpreta «a tu cargo» como convivientes y no declara a los hijos que viven con el otro progenitor (pese a pagar alimentos), `hijos-minimo`/`edad-hijos` dan F → falso negativo por interpretación del dato, no por la regla en sí.

3. `residencia-cm` (hard, ccaa 13): correcto — la competencia es de la CCAA de residencia («Corresponde a la comunidad autónoma de residencia del solicitante la competencia»); quien reside fuera pide el título a su CCAA, no pierde la prestación.

4. `caso-general-3-hijos` (hard:false): bien modelado como soft — avisa de que con 2 hijos hace falta equiparación sin bloquear. Cubre discapacidad de un hijo; las demás equiparaciones (dos ascendientes discapacitados/≥65 %, progenitor fallecido, hermanos huérfanos) están en `equiparaciones-2-hijos`. Honesto.

5. Laguna de honestidad en `convivencia` (uncovered): dice «Los hijos deben convivir contigo; la separación transitoria por estudios, trabajo… no rompe la convivencia» — cierto por el art. 3.1.b, pero **omite** la excepción del art. 2.2.c (hijos no convivientes de separados/divorciados con dependencia económica sí computan). La afirmación es incompleta en el sentido estricto.

6. Bordes: «menores de 21… hasta los 25 cuando cursen estudios» ↔ `lte 25`: correcto e inclusivo (a los 25 cumplidos computan). «Discapacitados o incapacitados para trabajar, cualquiera que fuese su edad»: el enum de `dependents.disability` (yes/no) no distingue ≥33 % ni incapacidad laboral; contar `unknown`/`declined` como computables es la opción correcta contra FN (hacia T, no hacia F).

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| edad-hijos (hermanos huérfanos adultos) | alto | «Tres o más hermanos huérfanos de padre y madre, mayores de 18 años, o dos, si uno de ellos es discapacitado, que convivan y tengan una dependencia económica entre ellos» (art. 2.2.e) | Añadir vía `any` «unidad de hermanos huérfanos» (no comprobable → U, nunca F) o degradar `edad-hijos` a soft |
| hijos-minimo / edad-hijos (hijos no convivientes del separado) | bajo | «con tres o más hijos ... aunque estén en distintas unidades familiares, siempre que se encuentren bajo su dependencia económica, aunque no vivan en el domicilio conyugal» (art. 2.2.c) | Aclarar en la pregunta de dependientes que cuentan también hijos que no conviven pero dependen económicamente |
| convivencia (uncovered) | bajo | mismo art. 2.2.c — la regla afirma «los hijos deben convivir contigo» sin la excepción | Añadir al label la excepción 2.2.c |
| residencia-cm | ninguno | «Corresponde a la comunidad autónoma de residencia del solicitante la competencia» (art. 5.2) | — |
| edad-hijos (21–25 sin estudios, soltería) | bajo | «cuando cursen estudios que se consideren adecuados a su edad y titulación» (art. 3.1.a) | Sobreinclusión declarada (falso positivo, no falso negativo): aceptable, mantener aviso |
