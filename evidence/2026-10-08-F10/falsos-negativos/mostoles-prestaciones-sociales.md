# mostoles-prestaciones-sociales

## Análisis

1. `empadronado-mostoles` (hard:true) exige `territory` dentro del municipio 28092. La propia ordenanza exceptúa el requisito en tres supuestos que el hard convierte en F: «Se exceptúa este requisito para las víctimas de violencia doméstica y lo previsto en los artículos 10.3 y 11.1 de la ley 1/1996 de Protección Jurídica del Menor. Se exceptúa este requisito a las prestaciones dirigidas a personas en situación de calle» (art. 4.1.b). Una víctima de violencia doméstica empadronada en otro municipio, un menor protegido o una persona sin techo de Móstoles obtienen F aunque la norma los admite → falso negativo. Declarado tanto en el label como en `excepciones-empadronamiento`, pero el veredicto hard sigue siendo F.

2. `mayor-edad` (hard:true) exige `age ≥ 18`; la norma dice «Ser mayor de dieciocho años **o menor emancipado**» (art. 4.1.a). Un menor emancipado obtiene F → falso negativo. El propio label lo declara («la condición de menor emancipado no podemos comprobarla aquí»), pero la honestidad del texto no evita el F. Supuesto estrecho.

3. `carencia-ingresos` (hard:false) usa `param: IPREM_ANUAL_12P` (7.200 €). La ordenanza dice literalmente «IPREM (Indicador Público de Renta de Efectos Múltiples) anual, **calculado a 14 pagas**» y repite «IPREM anual en 14 pagas». El parámetro correcto es `IPREM_ANUAL_14P` (8.400 €): el umbral usado es un 14 % más estricto que el legal **incluso antes** de los multiplicadores por tamaño de unidad (1× / 1,5× / 1,8× / 2× / 2,2× según miembros, con unipersonales computando 1,5 miembros y discapacidad ≥65 %/dependencia grado II+ computando doble — todo ello visible en la ordenanza). Para una unidad unipersonal el límite real es 1,5 × 8.400 = 12.600 €/año frente a los 7.200 € evaluados. Al ser soft no bloquea, pero produce F/U indebidos respecto a la norma (banda 8.400–16.800 → F pese a que una persona sola con 10.000 € sí está por debajo del límite legal). El label lo declara como «referencia orientativa», sin mencionar el error de parámetro.

4. Operador: «no obtiene unos ingresos económicos superiores a los recogidos en la presente ordenanza» ↔ `lte` es correcto (superar el límite descarta, igualar no).

5. Honestidad: labels y `uncoveredRequirements` declaran las excepciones de empadronamiento, la subsidiariedad («No poder solicitar la ayuda de otros organismos»), la valoración técnica no automática, requisitos específicos por modalidad y la incompatibilidad por incumplimiento. Honesto; el fallo es que las excepciones documentadas no modifican los dos requisitos hard.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| empadronado-mostoles | alto | «Se exceptúa este requisito para las víctimas de violencia doméstica y lo previsto en los artículos 10.3 y 11.1 de la ley 1/1996 ... a las prestaciones dirigidas a personas en situación de calle» (art. 4.1.b) | Convertir el requisito en `any` [empadronado en Móstoles **o** supuesto exceptuado no comprobable → U]; si no hay vía U posible, degradar a soft |
| mayor-edad | alto | «Ser mayor de dieciocho años o menor emancipado» (art. 4.1.a) | Añadir vía «menor emancipado» (no comprobable → U) o degradar a soft; hoy un emancipado obtiene F seco |
| carencia-ingresos | bajo | «IPREM (Indicador Público de Renta de Efectos Múltiples) anual, calculado a 14 pagas» (ordenanza) | Cambiar el parámetro a `IPREM_ANUAL_14P`; idealmente aplicar el multiplicador por tamaño de unidad (1,5× unipersonal, hasta 2,2× ≥6) |
| — (labels/uncovered) | ninguno | — | Honestos y completos; el fallo es solo de modelado del hard |
