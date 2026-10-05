# Hoja de revisión — ola-1-beca-6000

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## ⚠ Aviso previo para el revisor (bloquea la aprobación)

1. **«Beca 6000» NO existe en la Comunidad de Madrid.** Es un programa de la
   Junta de Andalucía (BOJA; convocatoria 2025-2026 por Resolución de
   27/11/2025, ~6.000 €/año para 1º/2º de Bachillerato y CFGM presencial).
   Ninguna fuente oficial ni periodística usa ese nombre en la CM.
2. **Decisión de mapeo tomada por el agente** (pendiente de validación humana):
   el slug `madrid-beca-6000` se ha modelado sobre el programa autonómico más
   cercano en propósito y difusión: **becas para el estudio de Bachillerato en
   centros docentes privados autorizados de la Comunidad de Madrid** (becas de
   continuidad postobligatoria, 43,5 M€ y >15.000 alumnos por curso, en
   convocatoria anual desde 2019-2020). Su objetivo declarado —«facilitar a los
   estudiantes que continúen sus estudios postobligatorios»— coincide con la
   descripción de la tarea («alumnado que termina la enseñanza obligatoria y
   sigue estudiando»).
3. **Posible solape de catálogo**: el catálogo importado ya contiene la ficha
   `madrid-becas-bachillerato-centros-privados` para este mismo programa
   (data/catalog, descargado de comunidad.madrid). El rule-set se ha marcado
   `"standalone": true` porque `madrid-beca-6000` no figura en el catálogo.
   **Dudas para el verificador:**
   - ¿Se acepta el mapeo o se bloquea la tarea por identidad equivocada?
   - Si se acepta: ¿renombrar el slug a `madrid-becas-bachillerato-centros-privados`
     (fusionando con la ficha existente) o mantener `madrid-beca-6000` como
     standalone documentado?
   - La mención de la tarea a «FP grado medio/GM» no aplica a esta beca (solo
     cubre Bachillerato); el programa análogo para FP es el de Grado D
     (ficha `madrid-becas-fp-grado-d`), que sería otra regla distinta.
4. **`referenceDate`**: la norma evalúa los requisitos «a la fecha de
   finalización del plazo de presentación de solicitudes» ⇒ se ha fijado a
   `2026-05-26` con `referenceDateCitation`.

## Fuentes verificadas (todas HTTP 200 el 05/10/2026)

| Uso | URL | Tipo | Bytes | sha256 (bytes PDF) |
|---|---|---|---|---|
| Convocatoria 2026-2027 | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/05/04/BOCM-20260504-52.PDF | extracto BOCM nº 104 (rango 1) | 92.202 | 7f3c436938fd54df… |
| Bases reguladoras | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/04/28/BOCM-20250428-19.PDF | Orden 1435/2025, BOCM nº 100 (rango 1) | 235.217 | 32e16d7fd7b9a049… |
| Convocatoria 2025-2026 | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/06/16/BOCM-20250616-26.PDF | extracto BOCM nº 142 (rango 1) | 98.982 | 6175eb1ed057c2f4… |
| Convocatoria 2024-2025 | https://www.bocm.es/boletin/CM_Orden_BOCM/2024/04/23/BOCM-20240423-27.PDF | extracto BOCM nº 96 (rango 1) | 89.898 | 89f5486058cf960f… |
| Ficha del trámite (solo canal) | https://sede.comunidad.madrid/ayudas-becas-subvenciones/becas-bachillerato-2026-2027 | sede CM, trámite A967 (rango 3) | HTML | — |

Nota sobre textos: los extractos citados son literales sobre el texto
normalizado **pdfjs-dist + `normalizeText`** (el mismo pipeline de
`eligibility:snapshot`), incluidos los artefactos de separación silábica
(`esco- lar`, `fami- liar`…). Los PDF se guardaron en
`F:\Temp\datawardsmadrid-beca6000\` y el texto verificador en
`*-pdfjs.txt`; no se crearon ficheros en `data/eligibility/sources/` porque el
snapshot oficial debe ejecutarlo el pipeline (`npm run eligibility:snapshot`)
en el repo con node_modules.

## madrid-beca-6000 (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Estar matriculado o tener reserva de plaza para un curso completo de Bachillerato | estudios eq "si" | «Estar matriculado o tener reserva de plaza para el curso completo del año esco- lar 2026-2027, en cualquiera de los dos cursos de Bachillerato del sistema educa- tivo español, en régimen privado, en un centro privado autorizado por la Conseje- ría de Educación, Ciencia y Universidades, ubicado en el ámbito territorial de la Comunidad de Madrid.» | Extracto, «Segundo. Beneficiarios», a) | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/05/04/BOCM-20260504-52.PDF |
| aviso: Renta per cápita de la unidad familiar por debajo de 35.913 € | ingresos anuales lt 35913 | «No superar el límite de renta per cápita familiar de 35.913 euros.» | Extracto, «Segundo. Beneficiarios», c) | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/05/04/BOCM-20260504-52.PDF |

**No comprobables con nuestras preguntas (⚠):**

- **La beca solo cubre Bachillerato en régimen privado en un centro privado autorizado por la Consejería ubicado en la CM (no centros públicos ni otras enseñanzas como FP); el orientador no pregunta la modalidad de estudios ni el tipo de centro** — «Becas para el estudio de Bachillerato del sistema educativo español para alumnos es- colarizados en centros autorizados por la Consejería de Educación, Ciencia y Universida- des, con el nivel de Bachillerato establecido en la Ley Orgánica 2/2006, de 3 de mayo, de Educación, en régimen privado para el curso 2026-2027, ubicados en el territorio de la Co- munidad de Madrid.» (Extracto, «Primero. Objeto»)
- **La matrícula o reserva debe ser del curso completo y el alumno no puede ser repetidor del curso para el que pide la beca; ambos extremos se acreditan con certificado del centro** — «No ser alumno repetidor del curso para el que se solicita la beca.» (Extracto, «Segundo. Beneficiarios», b))
- **El límite es de renta per cápita de la unidad familiar (ingresos ÷ miembros computables), no los ingresos anuales totales del hogar que pregunta el orientador** — «se entiende por renta per cápita fami- liar los ingresos de la unidad familiar, tal y como se definen en el artículo 5 anterior, divi- didos entre el número de miembros computables de la unidad familiar» (Orden 1435/2025, art. 6.1)
- **La renta que se evalúa es la del ejercicio económico 2024 (casillas IRPF 420+432-433+424+429-446-436-595), no la del año en curso** — «Se considerará la renta anual del ejercicio económico del 2024.» (Extracto, «Cuarto. Criterios de baremación», punto 1)
- **Cada miembro con discapacidad ≥33 %, víctima de violencia de género o de terrorismo, con protección internacional o en acogimiento familiar computa por dos en la renta per cápita** — «se computará por dos todo miembro de la unidad familiar con una discapacidad, debidamente acreditada, igual o superior al 33 por 100» (Orden 1435/2025, art. 6.2)
- **Aun cumpliendo todos los requisitos no hay derecho automático: concurrencia competitiva por puntuación hasta agotar el crédito (43.497.750 €)** — «las becas se concederán en función de la puntuación obtenida hasta agotar la totalidad del crédito.» (Extracto, «Cuarto. Criterios de baremación»)
- **La nota final del último curso académico finalizado suma de 0 a 2 puntos en la baremación (la renta per cápita puntúa de 0 a 8)** — «La puntuación será de 0 a 2 puntos en función de la califica- ción final obtenida en el último curso académico finalizado a la fecha de finaliza- ción del plazo de presentación de solicitudes.» (Extracto, «Cuarto», punto 2)
- **Los requisitos deben mantenerse a lo largo de todo el curso escolar 2026-2027** — «Estos requisitos deberán mantenerse a lo largo de todo el curso escolar 2026-2027.» (Extracto, «Segundo. Beneficiarios»)
- **La beca nunca supera el coste total del curso (matrícula + reserva + escolaridad); si el curso cuesta menos se reduce** — «el importe de la beca se reducirá hasta el límite de dicho coste.» (Extracto, «Quinto. Cuantía de la beca»)
- **La solicitud la firma al menos un progenitor/tutor/acogedor; para las consultas de datos firman la autorización todos los miembros mayores de 18 años incluidos en la solicitud** — «La solicitud deberá ser firmada al menos por uno de los progenitores, tutores o acogedores del alumno.» (Orden 1435/2025, art. 7.2)

- **Plazo**: 2026-05-05 → 2026-05-26 (15 días hábiles desde la publicación del extracto el 04/05/2026; fechas de calendario confirmadas por la ficha sede A967 —«Fecha de inicio: 05/05/2026 Fecha de fin: 26/05/2026»— y por prensa autonómica). Recurrencia anual: previousCalls 2025-06-17 → 2025-07-07 (Orden 2176/2025) y 2024-04-24 → 2024-05-17 (Orden 1837/2024) ⇒ `CLOSED_RECURRING` a fecha de evaluación.
- **Canal**: Comunidad de Madrid — Consejería de Educación, Ciencia y Universidades — https://sede.comunidad.madrid/ayudas-becas-subvenciones/becas-bachillerato-2026-2027 (online + presencial en oficinas de registro; cita en art. 9 de las bases, rango 1)
- **Importe**: range 2000–3750 € per_course («La cuantía total de la beca será de 3.750 euros anuales … hasta 10.000 euros y de 2.000 euros anuales … entre 10.000,01 y 35.913 euros.»)
- **Doc**: Certificado del centro docente de matrícula o reserva de plaza (obligatorio)
- **Doc**: Documento acreditativo de la nota final del último curso académico finalizado (obligatorio)
- **Doc**: Certificado del Registro Civil de la filiación del alumno y de los miembros de la unidad familiar (o Libro de Familia completo) (obligatorio)
- **Doc**: DNI o NIE en vigor (o pasaporte si no hay NIE), solo si se manifiesta oposición a la consulta de datos
- **Doc**: Certificado de la renta de la AEAT con código seguro de verificación, solo si algún miembro mayor de edad no autoriza la consulta tributaria

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## Lo que se ha verificado y NO se ha modelado (a propósito)

- **No hay requisito de empadronamiento ni de residencia en la CM** para el
  alumno (lo exige el centro, no la persona). Por eso no hay condición
  `territory` — un no residente en Madrid que estudie en un centro privado
  autorizado de la CM también puede ser beneficiario. El empadronamiento solo
  aparece como documentación en supuestos concretos (progenitor no consignado,
  alumno mayor emancipado, art. 5.5).
- **No hay límite de edad ni requisito de nota mínima** (la nota solo puntúa).
- **No se exige estar al corriente con Hacienda/SS** (art. 4.2 de las bases:
  «La condición de beneficiario podrá obtenerse, aunque no se cumplan los
  requisitos establecidos en el artículo 13.2 de la Ley 38/2003»).
- La solicitud de un alumno menor de edad la firman los progenitores/tutores
  (ver ⚠ «firma-solicitud») — relevante para el golden de 16-17 años.
- `dependents`/`familyType` del catálogo miden la situación del **solicitante**,
  no la composición de la unidad familiar necesaria para el per cápita: de ahí
  que la renta se modele solo como aviso (`hard: false`).

## Golden persona `gp-beca-6000-parla`

- Perfil: 16–17 años (nacimiento 2009), Parla 28106 (INE), empadronada desde
  2009, estudia («si»), ingresos del hogar 0–8.400 €, sin discapacidad,
  vivienda en alquiler; `dependents` sin preguntar (el router no aplica a una
  menor estudiante).
- Esperado: **veredicto `posible`** (hard T + requisitos no comprobables) y
  **deadline `CLOSED_RECURRING`** a `today = 2026-10-05`.
- Justificaciones citadas a rango 1 (extracto + bases).

## Pendiente del pipeline (fuera del alcance de esta tarea)

- `npm run eligibility:snapshot` para materializar `data/eligibility/sources/<id>.json|.txt` de las 5 fuentes.
- `npm run eligibility:validate` / `eligibility:build` — no ejecutados (worktree sin node_modules; prohibido `npm install` en esta tarea).
- Regenerar la hoja con `npm run review:sheet` si se quiere el formato exacto del generador.
