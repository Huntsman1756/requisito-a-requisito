# madrid-abono-transporte-infantil

## Análisis

**1. Requisitos `hard: true`.** Uno: `menor-0-14-a-cargo`
(`dependents count_where_gte 1` con `age lt 15`).

- Borde de edad correcto: la oferta CRTM distingue «7 a 14 años» (abono 7-14) e
  infantil «hasta el día en que cumples 7»; `lt 15` = «hasta los 14 cumplidos»
  ✓ inclusivo como la norma.
- «A tu cargo» vs realidad: el título es del menor y cualquier menor 4–14 con
  TTP lo usa; modelarlo como «tienes un menor a cargo» razona desde la unidad
  familiar — aceptable para un orientador de hogar. Un menor de 15 en adelante
  sale por edad (F correcto: corresponde al abono joven 15–25, que es otro
  programa).
- Matiz de gratuidad: «Gratuidad para abonos y títulos infantiles (niños nacidos
  entre 2012 y 2026)». Un menor de 14 nacido en 2011 da T pero no entra en la
  gratuidad bonificada (es falso **positivo** de precio, no negativo) — fuera del
  alcance de esta revisión, aunque la propia tarifa oficial lista «JOVEN
  20,00 €» y la gratuitidad es bonificación anual (declarado en
  `gratuidad-7-14-bonificada`).

### `residencia-municipio-crtm` (`hard: false`)

Bien degradado: la condición `within_territory ccaa 13` no puede cubrir los
municipios E1/E2 ni los del convenio con Castilla-La Mancha, así que un perfil
fuera de la CM solo produce aviso de fila, nunca `no_cumple`. La excepción de
familia numerosa («se mantendrá la posibilidad de expedición de la TTP Personal
para los titulares de título acreditativo de familia numerosa») está declarada en
`uncoveredRequirements`. Es el patrón correcto: al ser soft, un F del campo no
descarta a nadie indebidamente.

**2. Dato del cuestionario más estricto que la norma.** `dependents` con
`age lt 15` encaja con la norma; `territory` por CCAA es más estricto que el
perímetro real (CM + E1/E2 + convenio CLM) pero al ser soft no produce
`no_cumple` — diseño correcto.

**3. Honestidad de label y uncoveredRequirements.** Honesto y completo:
residencia TTP completa con acreditación, excepción FN, soporte TTP personal,
gratuidad de la infantil por tarifa (no por bonificación) y carácter anual de la
bonificación del 7-14 (JOVEN 20 € oficial). La documentación distingue
correctamente infantil (< 7) y personal (7–14) con condiciones por edad del
dependiente. El label del requisito hard explica las tres franjas (< 4 sin
título, 4–6 infantil, 7–14 abono) con fidelidad a la fuente.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| menor-0-14-a-cargo | ninguno | «niños nacidos entre 2012 y 2026» / «7 a 14 años» | — |
| residencia-municipio-crtm | ninguno | «municipio de la Comunidad de Madrid o en alguno de los municipios integrados en las zonas tarifarias E1 y E2… convenio… Castilla-La Mancha» — correctamente degradado a soft | — |
