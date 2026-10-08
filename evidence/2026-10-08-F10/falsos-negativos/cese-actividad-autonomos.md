# cese-actividad-autonomos

## Análisis

**1. Requisitos `hard: true`.** El RuleSet tiene un único requisito y está marcado
`hard: false` (`autonomo-alta-reta`, condición `employmentStatus eq autonomo`).
Por tanto ningún fallo produce `no_cumple`: a lo sumo la fila muestra F como aviso
(«puede afectar»). No hay riesgo de falso negativo de veredicto.

Matices de interpretación del campo (solo afectan a la fila, no al veredicto):

- La norma cubre a SETA, TRADE, socios de cooperativas de trabajo asociado y
  autónomos societarios (art. 330.1.a: «Estar afiliadas y en alta en el Régimen
  Especial de Trabajadores por Cuenta Propia o Autónomos o en el Régimen Especial
  de los Trabajadores del Mar, en su caso»). El label lo enumera con honestidad,
  pero un socio de cooperativa o un autónomo societario puede autodefinirse como
  «Trabajo por cuenta ajena» u «Otra situación» en el cuestionario → fila F
  indebida. Como es `hard: false`, el impacto es un aviso engañoso, no un bloqueo.
- Quien ya ha cesado (solicita a posteriori, dentro del plazo del art. 337.4:
  «hasta el último día del mes siguiente al que se produjo el cese de
  actividad») puede responder «En desempleo» porque ya no está en alta → fila F.
  La norma exige alta **en el momento del cese**, no a fecha de solicitud; el
  cuestionario pregunta la situación «ahora». El label dice «afiliado/a y en
  alta», sin la precisión temporal.

**2. Dato del cuestionario más estricto que la norma.** `employmentStatus` es de
opción única y no recoge las subcategorías (TRADE, societario, cooperativista,
mar), ni distingue «estoy en alta» de «cesé recientemente». Estricto en la fila;
inocuo para el veredicto por ser requisito soft.

**3. Honestidad de label y uncoveredRequirements.** Buena: 10
`uncoveredRequirements` cubren cotización mínima 12/24/48 meses, situación legal
de cese (con umbrales del art. 333: «pérdidas > 10 % de ingresos en un año
completo, ejecuciones ≥ 30 %…»), cesación voluntaria, acuerdo de actividad,
corriente de cuotas (con la invitación al pago de 30 días), edad de jubilación en
cese definitivo, mutua competente, plazo, escala de duración, garantías laborales
e incompatibilidades (art. 342: «es incompatible con el trabajo por cuenta
propia»). El requisito modelado declara correctamente su alcance.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| autonomo-alta-reta | bajo | «Estar afiliadas y en alta en el Régimen Especial de Trabajadores por Cuenta Propia o Autónomos o en el Régimen Especial de los Trabajadores del Mar, en su caso» (art. 330.1.a) | Añadir al label la precisión temporal («alta en el momento del cese, aunque ahora ya estés de baja») y recordar que TRADE/cooperativistas/societarios suelen estar en RETA aunque no se llamen «autónomos» a sí mismos |
