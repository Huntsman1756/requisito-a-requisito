# becas-mec-universidad-2026-2027

## Análisis

El único requisito modelado (`estudiante-universitario`, `studentStatus eq "si"`)
es `hard: false` → **ningún `F` puede producir `no_cumple`** (softF solo aviso,
docs/07 §4).

Además la condición es *más amplia* que el label: la convocatoria general
2026-2027 cubre también enseñanzas no universitarias (extracto «Segundo.
Beneficiarios»: «los estudiantes… que se encuentren cursando algunas de las
siguientes enseñanzas: 1. Enseñanzas postobligatorias y superiores no
universitarias…: a) Bachillerato. b) Ciclos de Formación Profesional…»). Todo
estudiante que responda «sí» obtiene `T`: dirección permisiva, sin falso
negativo posible. El label avisa del límite «no valen títulos propios ni
doctorado — ver ⚠» y hay uncovered `solo-titulos-oficiales-centro-espanol` con
el extracto literal («No se incluyen en esta convocatoria las becas para la
realización de estudios correspondientes al tercer ciclo o doctorado, estudios
de especialización ni títulos propios de las universidades»).

Honestidad de `uncoveredRequirements`: exhaustivo y literal — renta familiar
ejercicio 2025 («se computará el ejercicio 2025», art. 9.1 RD 179/2026),
umbrales 1–3 por componente, miembros computables, patrimonio (47.200 € fincas
urbanas), requisitos académicos grado/máster, mínimo 60 créditos y la novedad
48–59 créditos (350 €), título de igual nivel, nacionalidad, máximo de años de
becario. La ventana (07/04–18/05/2026) y `previousCalls` están citadas; hoy el
estado es `CLOSED_RECURRING`, no un veredicto falso.

Observación de mantenimiento (no afecta al ciudadano): el fichero se llama
`becas-mec-universidad-2026-2027.json` pero `benefitSlug` es
`becas-generales-mefp-2026-2027`. El bundle indexa por `benefitSlug`, así que
funciona, pero el nombre de fichero no coincide con el slug.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| (naming) fichero vs `benefitSlug` | bajo | — | renombrar el fichero a `becas-generales-mefp-2026-2027.json` para que file = slug |
| requisitos | ninguno | — | — |
