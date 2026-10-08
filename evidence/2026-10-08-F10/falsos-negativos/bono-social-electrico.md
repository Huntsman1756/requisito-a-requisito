# bono-social-electrico

## Análisis

El único requisito modelado (`alguna-via-vulnerable`) es `hard: false` →
**ningún `F` puede producir `no_cumple`** (softF solo aviso).

La condición es un `any` con dos vías — título de familia numerosa
(`familyType eq "familia-numerosa"`, art. 3.2.b: «Estar en posesión del título
de familia numerosa») y renta (`incomeAnnual lte 1,5 × IPREM_ANUAL_14P`, art.
3.2.a: «sea igual o inferior a 1,5 veces el Indicador Público de Renta de
Efectos Múltiples (IPREM) de 14 pagas»). Las demás vías del art. 3.2
(pensionistas con cuantía mínima, IMV) y los multiplicadores por miembros están
en `uncoveredRequirements`, con extracto — honestidad correcta.

Matiz que puede dar `F` *de fila* (no de veredicto):

- **La norma mide la renta CONJUNTA de la unidad de convivencia y la pregunta
  recoge ingresos INDIVIDUALES** («Que su renta o, en caso de formar parte de
  una unidad de convivencia, la renta conjunta anual de la unidad de
  convivencia…» vs `q.income.label`: «¿Cuántos ingresos anuales tienes?»). Con el
  multiplicador (+0,3 por adulto adicional, +0,5 por menor), hogares que la
  norma admite pueden fallar la vía renta: solicitante con 20.000 €/año y dos
  menores → umbral real 2,5×IPREM = 21.000 € → la norma lo admite; nuestra
  vía da `F`. Como es soft, el efecto es solo un aviso «puede afectar» y no el
  veredicto, pero la fila puede mostrar «no cumples» donde la norma dice lo
  contrario. La vía familia numerosa también puede dar `F` a una familia
  monoparental+numerosa que elija «monoparental» en la pregunta de opción única
  (misma colisión que en `ayto-ibi-familia-numerosa`, pero aquí sin efecto en el
  veredicto por ser soft y estar en un `any`).
- El label de la vía dice «Renta conjunta anual ≤ 1,5 veces el IPREM» — describe
  bien la norma, pero el campo medido es la renta individual del solicitante:
  el usuario puede leer «cumples» cuando solo se comprobó su renta, no la
  conjunta (dirección falso positivo) o «no cumples» en el caso anterior.

El resto (PVPC/titularidad, vulnerable severo, vigencia 2026 de los descuentos
42,5 %/57,5 % según RDL 7/2026) está en `uncoveredRequirements` con extracto
literal, correctamente declarado.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| alguna-via-vulnerable (vía renta, soft) | bajo | «la renta conjunta anual de la unidad de convivencia… igual o inferior a 1,5 veces el IPREM de 14 pagas» + «el multiplicador… se incrementará en 0,3 por cada miembro adicional mayor de edad… y 0,5 por cada menor» (art. 3.2.a y 3.3) | aclarar en el label que se mide la renta individual del solicitante como cota inferior (la conjunta y los multiplicadores solo pueden ampliar el derecho) o mover la vía renta a uncovered |
| alguna-via-vulnerable (vía FN, soft) | bajo | «Estar en posesión del título de familia numerosa» (art. 3.2.b) | misma propuesta que IBI: que el cuestionario no obligue a elegir entre «monoparental» y «familia numerosa» |
| resto | ninguno | — | — |
