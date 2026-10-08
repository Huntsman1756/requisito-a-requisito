# cm-reintegro-accidentes-trabajo

## Análisis

**1. Requisitos `hard: true`.** Uno solo: `empleado-publico-cm`, con condición
`employmentStatus eq empleado-publico`. La norma cubre a «empleados públicos de
la Comunidad de Madrid incluidos en el campo de aplicación del régimen general
de la Seguridad Social» (sede) / «empleados públicos incluidos en el Régimen
General de la Seguridad Social cuya protección corresponde a la Comunidad de
Madrid como empresa colaboradora» (Resolución de 19/01/2021).

El cuestionario ofrece como opciones distintas «Empleo público», «Docencia»,
«Investigación» y «Carrera militar». Los **funcionarios docentes de la Comunidad
de Madrid** son empleados públicos incluidos en el RGSS (los docentes no son
mutualistas de MUFACE) y están protegidos por la CM como empresa colaboradora,
pero ante la pregunta «¿Cuál es tu situación laboral?» elegirán «Docencia» → la
condición da F → veredicto `no_cumple` para alguien que la norma admite. Lo mismo
le ocurre al personal laboral de la CM que se autoetiquete «Trabajo por cuenta
ajena». Es un falso negativo real y probable, no un caso esquinado.

A la inversa (falso positivo, menos dañino pero también incorrecto): un
funcionario del Estado mutualista de MUFACE, un empleado público de otro
ayuntamiento o de la Administración General responde «Empleo público» → T, aunque
la norma lo excluye porque su protección no corresponde a la CM. Ningún
`uncoveredRequirement` advierte de que la condición no comprueba ni el empleador
(debe ser la CM) ni el régimen (RGSS, no mutualismo): el label lo dice, pero la
fila quedará marcada como cumplida.

**2. Dato del cuestionario más estricto que la norma.** Sí: `employmentStatus`
proxyea «empleado público **de la CM en RGSS**» con una categoría laboral
genérica de opción única. Falla en los dos sentidos (estricto hacia docentes y
personal laboral que se clasifiquen de otro modo; laxo hacia mutualistas y
empleados de otras administraciones).

**3. Honestidad de label y uncoveredRequirements.** El label es correcto («de la
Comunidad de Madrid incluido en el RGSS», empresa colaboradora) pero la condición
no puede verificar ni la administración empleadora ni el régimen — y no hay
ningún ⚠ que lo compense. `uncoveredRequirements` solo recoge «asistencia por
accidente»; falta declarar que la fila no distingue empleador ni mutualismo.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| empleado-publico-cm | alto | «empleados públicos de la Comunidad de Madrid incluidos en el campo de aplicación del régimen general de la Seguridad Social» (sede); los docentes responden «Docencia» → F | Modelar como `any` [empleado-publico, docente] o, mejor, añadir un `uncoveredRequirement` «la comprobación es por categoría laboral: si eres docente o personal laboral de la CM estás cubierto igualmente» y degradar a `hard: false` si no se puede preguntar el empleador |
| empleado-publico-cm (sobreinclusión) | bajo | «…cuya protección corresponde a la Comunidad de Madrid como empresa colaboradora de la Seguridad Social» | Añadir ⚠: «dará por cumplido a cualquier empleado público (Estado, mutualistas MUFACE/ISFAS, otras administraciones); la norma solo cubre a empleados de la CM en RGSS» |
