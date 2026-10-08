# fuenlabrada-fuenlacarenet-2026

## Análisis

**1. Requisitos `hard: true`.** Dos.

- `empadronado-fuenlabrada` (`within_territory municipality 28058`). La base
  exige «Estar empadronadas en el municipio de Fuenlabrada **con anterioridad a
  la aprobación de las presentes bases** y tener residencia efectiva durante el
  periodo de participación» (apartado segundo.a; bases aprobadas el 15/04/2026).
  La condición solo comprueba el municipio, no la anterioridad: una familia
  empadronada en junio de 2026 da T (falso positivo, dirección inocua), nunca F
  indebido. No hay falso negativo.
- `menores-a-cargo` (`dependents` con `age lt 18` ≥ 1). La base pide «unidad
  familiar con menores de edad a cargo que se encuentren en situación de riesgo
  leve, moderado o grave, debidamente valorado por los Servicios Sociales
  municipales» (segundo.b). La parte «a cargo» encaja con la pregunta del
  cuestionario («personas a tu cargo»); la valoración de riesgo por SS y la
  derivación están —correctamente— en `uncoveredRequirements`. Borde
  `lt 18` = «menores de edad»: correcto e inclusivo.

**2. Dato del cuestionario más estricto que la norma.** No: `territory` y
`dependents` miden lo que pide la norma. La anterioridad del empadronamiento no
se pregunta, pero su omisión produce T de más, no F.

**3. Honestidad de label y uncoveredRequirements.** Buena. El label del
requisito de empadronamiento incluye la cláusula de anterioridad que la
condición no verifica (declarado en el propio label). `uncoveredRequirements`
declara lo esencial: entrada **solo por derivación** de SS («la entrada al
programa es por derivación, no por solicitud libre», segundo.c), aceptación de
condiciones, corriente de obligaciones y el tope de 200 unidades con
condicionamiento a crédito. La ventana solo modela el segundo periodo
(01/10/2026–30/09/2027); el primero («Desde el día siguiente a la publicación de
las presentes bases en el BOCM y hasta el 30 de septiembre de 2026») ya
transcurrió, así que no afecta a evaluaciones actuales.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| empadronado-fuenlabrada | bajo | «empadronadas en el municipio de Fuenlabrada con anterioridad a la aprobación de las presentes bases» (segundo.a) | Opcional: añadir a la condición `residenceMonths ≥` meses desde 15/04/2026 para no dar T a empadronamientos posteriores; no es falso negativo, solo precisión |
| menores-a-cargo | ninguno | — | — |
