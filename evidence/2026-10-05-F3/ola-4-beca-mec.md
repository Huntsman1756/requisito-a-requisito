# Hoja de revisión — ola 4: Becas generales MEFPD, enseñanzas universitarias (curso 2026-2027)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## becas-mec-universidad-2026-2027 (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — el slug del encargo no existe en `data/catalog/benefits/`;
G2 se satisface con fuentes de rango 1 propias (RD 1721/2007 consolidado +
RD 179/2026 + tres extractos BOE de convocatoria).

> **Nota para el verificador — solape con el catálogo.** Existe la ficha
> importada `becas-generales-mefp-2026-2027` (la-ayuda, `revisada`), que cubre
> la convocatoria general completa (universitarias **y** no universitarias).
> Este RuleSet, por encargo, corta solo el subconjunto **universitario**
> (grado + máster) bajo su propio slug. Si el verificador prefiere ligar la
> regla a la ficha, la alternativa sería renombrar el slug a
> `becas-generales-mefp-2026-2027` y ampliar las enseñanzas citadas; con el
> encargo actual se deja `standalone` para no tocar el catálogo.
>
> **Convocatoria 2026-2027 cerrada.** El extracto BOE-B-2026-9261 (BOE núm.
> 74, de 25/03/2026) fija la ventana **07/04/2026 8:00 → 18/05/2026 15:00**:
> cerrada a la fecha de evaluación (2026-10-05). Con `recurrence: "annual"` y
> dos convocatorias anuales consecutivas en `previousCalls`
> (2025-2026: 24/03→14/05/2025; 2024-2025: 19/03→10/05/2024) ⇒ el golden
> espera `CLOSED_RECURRING` (docs/14 §2, ADR-038).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| aviso: Cursar enseñanzas universitarias (grado o máster) en 2026-2027 | studentStatus eq "si" | «Enseñanzas universitarias conducentes a títulos oficiales de grado y de máster, incluidos los estudios de grado y máster cursados en los centros universitarios de la defensa y de la guardia civil, así como los cursados en el Centro Universitario de Formación de la Policía Nacional, O.A.» | Extracto, «Segundo. Beneficiarios», 2.b) | https://www.boe.es/buscar/doc.php?id=BOE-B-2026-9261 |

**No comprobables con nuestras preguntas (⚠):**

- **Umbral de renta familiar** — tabla por número de miembros computables;
  en la convocatoria general el MEFPD financia el **extremo inferior** de los
  intervalos de umbrales 1 y 3 (art. 8.2 RD 179/2026). Para 1 miembro:
  u1 8.843 €, u2 13.898 €, u3 14.818 €; para 4: 22.107 / 38.242 / 40.773 €;
  para 8: 36.255 / 52.850 / 56.348 € — «Los umbrales de renta para el curso
  2026-2027 en las convocatorias a las que se refiere el artículo 2 serán los
  contenidos en la tabla siguiente» (art. 8.1)
- **La renta no son los ingresos del hogar** — es la renta familiar del
  **ejercicio 2025** (agregación IRPF de miembros computables con deducciones)
  — «se computará el ejercicio 2025» (art. 9.1). La banda `incomeAnnual` del
  orientador no equivale ⇒ U, nunca F.
- **Umbral distinto por componente** — renta ⇒ umbral 1; residencia,
  excelencia y variable ⇒ umbrales 1-2; beca de matrícula ⇒ hasta umbral 3 —
  «superen el umbral 2 y no superen el umbral 3 … podrán obtener la cuantía
  fija ligada a la excelencia en el rendimiento académico y la beca de
  matrícula.» (art. 3, párrafo de enseñanzas universitarias y EAS)
- **Miembros computables** — padres/sustentadores, solicitante, hermanos
  solteros <25 convivientes, ascendientes residentes; reglas de divorcio e
  independencia familiar (art. 14) — no hay pregunta que los determine.
- **Patrimonio familiar** — deniega aunque la renta no supere el umbral:
  valores catastrales urbanos (sin vivienda habitual) ≤ 47.200 € y resto de
  umbrales del art. 11 RD 179/2026 — «no podrá superar los 47.200 euros.»
- **Requisito académico (grado)** — 1.º: nota 5,00 en PAU/acceso; 2.º+:
  % de créditos superados por rama (90 % A&H y CSJ, 80 % Salud, 65 % Ciencias
  y Técnicas) — «se requerirá una nota de 5,00 puntos en la calificación de
  acceso a la universidad.» (art. 23.1; tabla art. 23.2)
- **Requisito académico (máster)** — nota media ponderada 5,00 en los
  estudios de acceso (×1,17 en enseñanzas técnicas); en 2.º, todo aprobado
  con media 5,00 — art. 27.1.
- **Matrícula mínima** — ≥60 créditos (grado y máster); 30-59 es parcial con
  efectos reducidos — «mínimo de 60 créditos.» (arts. 22.1-2, 26)
- **Novedad 48-59 créditos 2026-2027** — 350 € por renta y 350 € por
  residencia para universitarios/EAS con matrícula de 48-59 — extracto
  «Cuarto», 1 (párrafo final).
- **No título del mismo nivel** — quien tiene grado solo beca de máster;
  título universitario excluye enseñanzas no universitarias — art. 4.1.a.
- **Nacionalidad/residencia** — español; UE residente permanente o
  trabajador; extracomunitario según normativa de extranjería; no exigible
  para beca de matrícula — art. 4.1.d.
- **Años máximos de becario / cambio de estudios** — plan +1 año (+2
  técnicas, +1 parcial o no presencial); con cambio cursado con beca, ≥30
  créditos más que los becados — art. 24.1-2 y 24.4.

- **Plazo**: ventana cerrada (ver nota); recurrence annual; la solicitud fue
  telemática exclusiva (firma electrónica aceptada por la sede) — extracto
  «Tercero».
- **Canal**: MEFPD — Secretaría de Estado de Educación; formulario en
  https://sede.educacion.gob.es (o www.educacionyfp.gob.es) — «La solicitud
  se deberá cumplimentar mediante el formulario accesible por vía telemática
  a través de la sede electrónica del Departamento» (extracto «Tercero»).
  Seguimiento en «Mis expedientes» y unidad de becas de la administración
  educativa o universidad («Sexto»). `inPerson: false` — el extracto solo
  prevé presentación telemática.
- **Importe**: `variable`, `per_course`. Beca de matrícula = importe de los
  créditos de primera matrícula (variable según universidad/créditos);
  cuantías fijas 1.700 € (renta) + 2.700 € (residencia) + 50-125 €
  (excelencia) + variable mínimo 60 € — extracto «Cuarto». No hay cifra
  única citable ⇒ `variable`.
- **Doc**: ninguna se aporta con la solicitud según el extracto; solo el
  **resguardo telemático** que acredita la presentación ⇒ `mandatory: false`.
  La consulta de datos de renta es de oficio con autorización en la solicitud
  (RD 1721/2007 art. 15.4).

OK / KO por requisito: ☐

## Fuentes (HTTP 200 verificadas, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| boe-rd-1721-2007-becas | 1 | https://www.boe.es/eli/es/rd/2007/12/21/1721/con | 200 | 4f5281d2756d… |
| boe-rd-179-2026-umbrales-2627 | 1 | https://www.boe.es/eli/es/rd/2026/03/11/179/con | 200 | 88ba1a2210ea… |
| boe-b-2026-9261-becas-generales-2627 | 1 | https://www.boe.es/buscar/doc.php?id=BOE-B-2026-9261 | 200 | fef2af2e4b63… |
| boe-b-2025-10203-becas-generales-2526 | 1 | https://www.boe.es/buscar/doc.php?id=BOE-B-2025-10203 | 200 | 61189f1335eb… |
| boe-b-2024-9036-becas-generales-2425 | 1 | https://www.boe.es/buscar/doc.php?id=BOE-B-2024-9036 | 200 | 9cccfa5278c3… |

`sede.educacion.gob.es` responde 302 → 200 en `/portada.html`; no se registra
como fuente porque el canal se cita del extracto BOE (rango 1) y el dominio
solo cabe por `.gob.es` (rango 4, insuficiente para G11).

## Decisiones

1. **`standalone: true` + slug del encargo**: la ficha
   `becas-generales-mefp-2026-2027` existe pero cubre también las enseñanzas
   no universitarias; el RuleSet se limita a universidad (grado/máster).
2. **`estudiante-universitario` hard:false** como en
   `madrid-becas-bachillerato-centros-privados`: `studentStatus` es proxy
   tosco («¿estudias?»); una F solo avisa, no excluye — quien aún no esté
   matriculado puede estarlo para el curso de la beca.
3. **Umbrales, nota y patrimonio ⇒ `uncoveredRequirements`**: la renta de
   beca es familiar-IRPF-2025 por miembros computables (no la banda
   `incomeAnnual`) y no hay preguntas de nota media, créditos ni patrimonio.
   UNKNOWN ≠ NO: ninguno puede dar F.
4. **Ventana cerrada + `CLOSED_RECURRING`**: plazo 07/04→18/05/2026
   (extracto «Tercero»); `previousCalls` con 2025-2026 (BOE-B-2025-10203)
   y 2024-2025 (BOE-B-2024-9036), ambas con extracto literal del plazo.
5. **`amount: variable` + `per_course`**: beca de matrícula = coste de
   créditos (variable) + cuantías fijas citadas; no hay total único.
6. **Documentos**: solo resguardo telemático (`mandatory: false`); el
   extracto no lista documentación y la consulta tributaria es de oficio
   (art. 15.4 RD).
7. **`excerptSha256` reales**: sha256 UTF-8 del extracto (equivalente a
   `ruleset-fill-hashes.ts`); los 19 extractos verificados presentes en su
   `.txt`. Ningún «FILL».
8. **Snapshots sin npm**: bytes con curl (200), sha256 con `sha256sum`,
   HTML→texto con réplica de `htmlToText`+`normalizeText`
   (`F:\Temp\datawardsmadrid-becamec\norm.mjs`). Bytes en
   `F:\AgentState\datawardsmadrid\snapshots\<sha256>.html`; metadatos en
   `data/eligibility/sources/<id>.json`.
9. **`referenceDate: "application"`**: ninguna regla computa edad ni
   residencia; la renta es del ejercicio 2025 por norma, no por fecha de
   referencia.

## Notas para el verificador independiente

- Comprobar en `boe-rd-179-2026-umbrales-2627.txt` la tabla del art. 8.1:
  columnas u1 (intervalo), u2, u3 (intervalo) y u1-NEAE por n.º de miembros;
  el extremo inferior es lo que financia el MEFPD (art. 8.2) — aplicable al
  residente en Madrid porque la convocatoria general la gestiona el
  Ministerio salvo País Vasco y Cataluña (extracto «Quinto»).
- La Resolución completa está en BDNS 894743 (el extracto BOE es la fuente
  citada; BDNS es página JS sin texto extractable). Los umbrales detallados
  y bases completos quedan cubiertos por RD 179/2026 + RD 1721/2007.
- El extracto de 2024 usa «; hasta» y «09:00»; el de 2025 «8:00» y el de
  2026 «8,00»: los extractos del plazo se copiaron literales de cada `.txt`.
- Pendiente de revisión humana: `humanReview.status = pending`.
- Golden `gp-beca-mec-alcala`: espera `posible` + `CLOSED_RECURRING`
  (estudia = T; renta familiar, nota, créditos, patrimonio, título y
  nacionalidad = U no excluyentes).
