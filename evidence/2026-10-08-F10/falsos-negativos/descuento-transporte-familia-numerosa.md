# descuento-transporte-familia-numerosa

## Análisis

**1. Requisitos `hard: true`.** Uno: `titulo-familia-numerosa`, condición
`familyType eq familia-numerosa`. La norma (art. 11.1 RD 1621/2005) da derecho a
«los miembros de familias numerosas **que tengan reconocida esta condición y lo
acrediten oficialmente**», acreditable con «el correspondiente título oficial de
familia numerosa o documento que acredite fehacientemente tal condición» (art.
11.4). Es decir, el requisito real es **ser titular de un título FN vigente**, no
«que tu unidad familiar sea de tipo familia numerosa».

El cuestionario pregunta «¿Cómo es tu familia?» con opción única: `general` /
`familia-numerosa` / `monoparental`. Dos falsos negativos claros:

- **Familia monoparental con título de FN.** La Comunidad de Madrid expide
  títulos de familia numerosa a familias monoparentales; Renfe acepta títulos
  monoparentales (su propia página precisa el matiz territorial: «títulos de
  familia numerosa emitidos por la Generalitat de Catalunya para familias
  monoparentales solo serán aceptados como tales en los trenes de Rodalies…»).
  Ante opción única, una madre/padre monoparental con título vigente elegirá
  «Familia monoparental», que describe mejor su situación → F → `no_cumple`.
- **Titular individual de FN.** El descuento es del **miembro** titular, no de la
  unidad: un hijo de 20 años (menor de 21, o hasta 26 estudiando, o cualquier
  edad con discapacidad) que vive solo y conserva su título individual vigente
  describirá su familia como «Otra situación» → F → `no_cumple`, pese a que la
  norma le reconoce el derecho personal.

A la inversa, quien responde «familia numerosa» sin tener el título obtiene T
(falso positivo, inocuo: el título se exige al comprar y a bordo).

**2. Dato del cuestionario más estricto que la norma.** Sí: `familyType`
describe la composición de la unidad, mientras la norma exige **titularidad
acreditable**. Son conceptos distintos; el proxy descarta a titulares cuya
unidad actual no es «familia numerosa» y a monoparentales titulares.

**3. Honestidad de label y uncoveredRequirements.** El label «Ser titular de
familia numerosa» es literalmente correcto, pero la condición no comprueba la
titularidad — comprueba el tipo de unidad. No hay `uncoveredRequirement` que lo
advierta; `categoria-fn` solo cubre el porcentaje (20 %/50 %). Falta declarar que
la fila evalúa «tipo de familia», no «tener título».

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| titulo-familia-numerosa | alto | «Los miembros de familias numerosas que tengan reconocida esta condición y lo acrediten oficialmente tendrán derecho a reducciones» (art. 11.1); «título oficial de familia numerosa o documento que acredite fehacientemente tal condición» (art. 11.4) | Modelar como `any` [familia-numerosa, monoparental] con label por rama y un ⚠ «vale si tienes el título aunque vivas solo/a o seas familia monoparental»; idealmente una pregunta de titularidad («¿tienes título de familia numerosa vigente?») |
