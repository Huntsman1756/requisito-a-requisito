# fuenlabrada-prestaciones-sociales

## Análisis

**1. Requisitos `hard: true`.** Dos, ambos con excepciones legales no modeladas.

### `empadronado-fuenlabrada` (`hard: true`, `within_territory 28058`)

El art. 4.2 exceptúa expresamente el empadronamiento: «se exceptúa este
requisito para las prestaciones dirigidas a transeúntes, mujeres que han sufrido
o están sufriendo en el último año violencia de género» y lo previsto en los
arts. 10.3 y 11.1 de la L.O. 1/1996 (protección del menor). El cuestionario no
captura ninguna de esas circunstancias (la pregunta de territorio es obligatoria
y ofrece «Vivo fuera de la Comunidad de Madrid»): una mujer víctima de violencia
de género no empadronada en Fuenlabrada recibe F → `no_cumple`, cuando la
ordenanza la admite. Además el art. 4 in fine abre una vía general: «podrán ser
beneficiarias de estas prestaciones aquellas mujeres que … aun no cumpliendo los
requisitos aquí exigidos, han padecido o están padeciendo en el último año
violencia de género». Según docs/07 §2.3, una excepción favorable no modelable no
debe poder descartar a nadie: este requisito no debería ser `hard: true` sin más.

### `mayor-edad` (`hard: true`, `age gte 18`)

El art. 4.1 exige «Ser mayor de edad» y la condición lo reproduce fielmente
(`gte 18`, inclusivo). La misma cláusula excepcional de violencia de género
puede dispensar «los requisitos aquí exigidos», lo que en teoría incluye la
edad; supuesto muy improbable pero existente (menor víctima de violencia de
género en grave necesidad). Lo mismo para las prestaciones cuyo destinatario
final es un menor (la ordenanza contempla supuestos de los arts. 10.3/11.1 LO
1/1996, gestionados por la unidad familiar). Riesgo bajo pero no nulo.

### `carencia-ingresos` (`hard: false`, `incomeAnnual lte 6400`)

El baremo real del art. 7 da como máximo de ingresos para persona sola
**665,33 €/mes** («INGRESOS NETOS MENSUALES PERSONA SOLA … 665,33 y más 0»), es
decir ≈ 7.984 €/año — y el propio label del requisito dice «Como referencia
orientativa usamos el límite de persona sola: 7.984 €/año». La condición usa
**6.400 €**, un valor más estricto que no coincide ni con el baremo ni con el
propio label (inconsistencia interna). Al ser soft no cambia el veredicto, pero
la fila puede mostrar F («no cumples») a quien gana entre 6.400 y 7.984 €/año y
sí estaría dentro del baremo; además el límite real crece con el tamaño de la
unidad (hasta 1.147,95 €/mes para 7+). Con las bandas del cuestionario
(0–8.400 € straddles el umbral) lo normal es U, no F — el daño real es la
incoherencia label/condición.

**2. Dato del cuestionario más estricto que la norma.** `territory` es binario
respecto al municipio y no admite las excepciones legales; `incomeAnnual` con el
valor 6.400 queda por debajo del baremo real y del anunciado.

**3. Honestidad de label y uncoveredRequirements.** Los labels recogen las
excepciones (bien redactados), pero mantener `hard: true` sobre condiciones que
la propia ordenanza deja sin efecto para transeúntes, víctimas de violencia de
género y protección de menores hace que la excepción declarada no evite el
`no_cumple`. `uncoveredRequirements` es completo (valoración de grave necesidad,
excepción VG, justificación de prestación anterior, extranjería, nueva ordenanza
en trámite — bien documentado el expediente 2025).

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| empadronado-fuenlabrada | alto | «se exceptúa este requisito para las prestaciones dirigidas a transeúntes, mujeres que han sufrido o están sufriendo en el último año violencia de género» (art. 4.2) | Degradar a `hard: false` o modelar `any` con rama «exceptuado (violencia de género, transeúnte, protección de menores)» — como no hay campo para ello, docs/07 §2.3 manda no descartar por esta regla |
| mayor-edad | bajo | «podrán ser beneficiarias … aun no cumpliendo los requisitos aquí exigidos, han padecido o están padeciendo en el último año violencia de género» (art. 4, in fine) | Aceptable mantener `hard: true` (supuesto marginal); opcionalmente degradar junto con el anterior por la misma excepción |
| carencia-ingresos | bajo | «665,33 y más 0» (art. 7, baremo persona sola) vs condición `lte 6400` y label que anuncia 7.984 € | Unificar: usar 7.984 € (665,33 × 12) o el baremo por tamaño de unidad; corregir la discrepancia label/condición |
