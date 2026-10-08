# madrid-accede-prestamo-libros

## Análisis

Reglas evaluadas (`data/eligibility/rules/madrid-accede-prestamo-libros.json`):

- El RuleSet tiene **un único requisito** y es `hard: false`. Por la semántica del motor (`verdict-oracle.ts`: `no_cumple` solo si `hardF>0`), este programa **no puede producir un falso negativo duro**: como mucho observación/U.
- `alumno-centro-sostenido` (soft): `studentStatus eq "si"`. La norma (Decreto 168/2018, art. 1-2.1, `bocm-20181214-decreto-168-accede.txt`) exige cursar «Educación Primaria, Educación Secundaria Obligatoria, Formación Profesional Básica y Educación Especial… en los centros docentes sostenidos con fondos públicos en la Comunidad de Madrid». El label lo reproduce fielmente, incluyendo alumnado NEAE («que en lugar de libro de texto utilice un material curricular adaptado»).
- Matiz de cuestionario: el campo `studentStatus` pregunta «¿Estudias ahora mismo?» (i18n `q.studentStatus.label`), referido al **respondente**, mientras el beneficio es para escolares (6–16 años, típicamente hijos del usuaria/o). Un progenitor que responde «no» (él no estudia) obtendría F **blando** en este requisito — no bloquea el veredicto, pero puede atenuar el resultado. Al ser soft, el riesgo de falso negativo real es nulo; es una señal imperfecta, no una barrera. En sentido contrario, un estudiante universitario responde «sí» y la regla daría T blando aunque no sea beneficiario (falso positivo, fuera de alcance de esta revisión).
- Lo que no se comprueba está bien declarado en `uncoveredRequirements`: adhesión previa del centro concertado («los representantes de dichos centros deberán manifestar previamente, de forma expresa, su adhesión» — art. 2.2), entrega en junio de los libros del curso anterior con sus excepciones (1.º/2.º Primaria, NEAE, repetidores/asignaturas pendientes, materiales propios, renovación por orden — art. 5.1), fianza 5–60 € y obligaciones de devolución. Las excepciones normativas relevantes están recogidas.
- Fecha de referencia: `application`, coherente (programa continuo por curso escolar).

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| alumno-centro-sostenido | ninguno | «podrán ser beneficiarios… siempre que soliciten su participación a través del modelo que figura en el anexo I» (art. 2.1); requisito soft, nunca F | (opcional) Si el cuestionario llega a distinguir «hijos escolarizados», usar ese campo en vez de `studentStatus` |
