# madrid-becas-bachillerato-centros-privados

## Análisis

Reglas evaluadas (`data/eligibility/rules/madrid-becas-bachillerato-centros-privados.json`, Orden 1435/2025 + convocatoria Orden 1534/2026):

- **No hay requisitos `hard: true`** en el RuleSet → el programa no puede producir veredicto «no cumple». Diseño seguro frente a falsos negativos.
- `estudiante-bachillerato` (soft): `studentStatus eq "si"`. La convocatoria exige «estar matriculado o tener reserva de plaza para el curso completo del año escolar 2026-2027, en cualquiera de los dos cursos de Bachillerato… en régimen privado, en un centro privado autorizado… en la Comunidad de Madrid». La pregunta «¿Estudias ahora mismo?» no distingue ni etapa ni titularidad del centro ni quién estudia (el beneficiario es el alumno, habitualmente hijo del respondente): un padre que no estudia responde «no» → F **blando**, sin bloqueo; un estudiante universitario responde «sí» → T blando (falso positivo, fuera de alcance). Como soft, contenido.
- `renta-familiar-baja` (soft): `incomeAnnual lt 35913`. Norma: «No superar el límite de renta per cápita familiar de 35.913 euros». El campo es ingresos del respondente en bandas; la banda superior (25.200+) cruza 35.913 → U, nunca F. El desfase per cápita vs. hogar vs. personal está declarado honestamente en `renta-es-per-capita` y `renta-ejercicio-2024` (la renta evaluada es la del ejercicio 2024, con casillas IRPF citadas). Correcto.
- Fecha de referencia: `referenceDate` fijada al fin de plazo 26/05/2026 con cita propia («a la fecha de finalización del plazo de presentación de solicitudes», Segundo. Beneficiarios) — ejemplar: coincide con la norma y queda citado.
- `uncoveredRequirements` completo y honesto: régimen privado + centro autorizado CM (declara explícitamente que el orientador no pregunta la modalidad), curso completo y no repetidor, definición de unidad familiar y cómputo doble por discapacidad/VG/terrorismo/PI/acogimiento (art. 6.2), concurrencia competitiva con crédito agotable (¡matiz clave: cumplir requisitos no da derecho automático!), nota que puntúa, mantenimiento de requisitos todo el curso, tope al coste real.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| estudiante-bachillerato | ninguno | «Estar matriculado o tener reserva de plaza… en régimen privado, en un centro privado autorizado… Comunidad de Madrid» — soft; el desfase «quien estudia = hijo, quien responde = padre» no bloquea | — |
| renta-familiar-baja | ninguno | «No superar el límite de renta per cápita familiar de 35.913 euros» — soft + bandas ⇒ solo T/U; divergencias declaradas | — |
