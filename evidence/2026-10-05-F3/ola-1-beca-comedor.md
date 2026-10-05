# Hoja de revisión — ola 1, beca de comedor escolar CM

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-beca-comedor-escolar (rulesVersion 1, verificado 2026-10-05)

**standalone: true** — no existe ficha `madrid-beca-comedor-escolar` en
`data/catalog/benefits/` (solo hay ayudas municipales de comedor de Alcobendas y
San Sebastián de los Reyes); G2 queda cubierto por la fuente de rango 1 propia
(Acuerdo 24/04/2024, BOCM).

Fuentes verificadas (HTTP 200 el 05/10/2026):

- Normas reguladoras — Acuerdo 24/04/2024, Consejo de Gobierno (BOCM nº 98):
  https://www.bocm.es/boletin/CM_Orden_BOCM/2024/04/25/BOCM-20240425-37.PDF
- Modificación — Acuerdo 30/04/2025 (BOCM nº 109): añade la letra k) de familia
  numerosa, amplía letra e) a Fuerzas Armadas y baja la cuantía mínima a 295 €:
  https://www.bocm.es/boletin/CM_Orden_BOCM/2025/05/08/BOCM-20250508-28.PDF
- Convocatoria 2026-2027 — extracto acumulado Orden 1696/2026 (BOCM nº 99,
  28/04/2026): https://www.bocm.es/boletin/CM_Orden_BOCM/2026/04/28/BOCM-20260428-24.PDF
- Convocatoria 2025-2026 — extracto acumulado Orden 2170/2025 (BOCM nº 143,
  17/06/2025): https://www.bocm.es/boletin/CM_Orden_BOCM/2025/06/17/BOCM-20250617-34.PDF
- Convocatoria 2024-2025 — extracto Orden 2232/2024 (BOCM nº 121, 20/05/2024):
  https://www.bocm.es/boletin/CM_Orden_BOCM/2024/05/20/BOCM-20240520-22.PDF
- Ficha del trámite A958 (sede electrónica CM):
  https://sede.comunidad.madrid/ayudas-becas-subvenciones/becas-comedor-escolar-2026-2027
- Portal informativo (contexto, rango 4): https://www.comunidad.madrid/educacion/becas-comedor-escolar

Nota: no hay «convocatoria» con artículos propios; cada curso se abre mediante
una **orden de declaración de créditos** cuyo extracto fija el plazo (20 días
hábiles desde su publicación en el BOCM). Las normas reguladoras son las del
Acuerdo 24/04/2024 con la modificación de 30/04/2025. Vigente para el curso
2026-2027 (disposición final única de la modificación: se aplica a 2025-2026 y
siguientes).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener al menos un hijo o hija de 18 años o menos a tu cargo (la beca es para alumnado de Infantil, Primaria o ESO) | personas a cargo count_where_gte ≥1 donde edad lte 18 | «vayan a cursar estudios en las etapas educativas de Educación Infantil, Educación Primaria y Educación Secundaria Obligatoria en los siguientes tipos de centros» | Anexo, art. 4.1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2024/04/25/BOCM-20240425-37.PDF |
| aviso: El colegio debe estar en la Comunidad de Madrid (lo aproximamos por tu municipio; si el colegio está en la CM aunque viváis fuera, también vale) | territorio within_territory {"ccaa":"13"} | «ubicados en el territorio de la Comunidad de Madrid y contar con servicio de comedor debidamente autorizado» | Anexo, art. 4.2 | https://www.bocm.es/boletin/CM_Orden_BOCM/2024/04/25/BOCM-20240425-37.PDF |
| aviso: Encajar en alguna vía que podemos comprobar: ingresos del hogar bajo 8.400 € al año o familia numerosa (hay más vías en los avisos) | ALGUNA VÍA: ingresos anuales lt 8400 O tipo de familia eq "familia-numerosa" | «deberán pertenecer a familias que se encuentren en alguna de las si- guientes circunstancias» | Anexo, art. 5.2 | https://www.bocm.es/boletin/CM_Orden_BOCM/2024/04/25/BOCM-20240425-37.PDF |

**No comprobables con nuestras preguntas (⚠):**

- **El hijo o hija cursa Infantil, Primaria o ESO en un centro sostenido con fondos públicos (público o concertado) de la Comunidad de Madrid — no vale Bachillerato ni FP** — «vayan a cursar estudios en las etapas educativas de Educación Infantil, Educación Primaria y Educación Secundaria Obligatoria en los siguientes tipos de centros» (Anexo, art. 4.1)
- **El niño o niña tiene (o tendrá) plaza en el servicio de comedor del centro; la Administración lo comprueba de oficio** — «Tener plaza de comedor escolar en centro debidamente autorizado» (Anexo, art. 5.1)
- **El límite real es de renta POR PERSONA: ingresos de la unidad familiar del ejercicio 2024 ÷ miembros computables < 8.400 €; familia numerosa: entre 8.400 y 10.000 €** — «divididos entre el número de miembros computables de la unidad familiar» (Anexo, art. 8.1; ejercicio 2024 según Orden 1696/2026, apdo. Tercero: «se tendrá en cuenta la renta del ejercicio 2024»)
- **Cada miembro de la unidad familiar con discapacidad ≥ 33 % cuenta por dos al dividir los ingresos (baja la renta por persona)** — «computará por dos todo miembro de la unidad familiar con una discapacidad, debidamente acreditada, igual o superior al 33 por 100» (Anexo, art. 8.2)
- **Otras vías sin límite de renta: familia con RMI o con IMV, víctima de violencia de género o del terrorismo, miembro de FCSE o Fuerzas Armadas destinado en la CM, acogimiento familiar o residencial, escolarizado de oficio en concertado con transporte, protección internacional o protección temporal por Ucrania** — «Familia beneficiaria de la Renta Mínima de Inserción o beneficiaria del Ingreso Mínimo Vital a la que se le ha extinguido la Renta Mínima de Inserción» (Anexo, art. 5.2, letras a–j; letra k añadida por Acuerdo 30/04/2025)
- **Los requisitos se comprueban a la fecha de fin del plazo de solicitudes, no a la de hoy** — «deberán reunir los siguientes requisitos a la fecha de finalización del pla- zo de presentación de solicitudes» (Anexo, art. 5, párrafo inicial)
- **Para mantener la beca hay que usar el comedor al menos el 50 % de los días lectivos de cada mes del curso** — «al menos el 50% de los días lectivos de cada uno de los meses del curso» (Anexo, art. 16.5)
- **No se exige estar empadronado en la CM; el volante de empadronamiento solo se pide para acreditar la convivencia si te opones a que la Administración consulte los datos** — «certificado o volante de empadronamiento en el que consten to- dos los residentes que figuran en el domicilio» (Anexo, art. 10.h)

- **Plazo**: 2026-04-29 → 2026-05-28 (20 días hábiles desde el día siguiente a la
  publicación del extracto, 28/04/2026; fechas literales en la ficha del trámite:
  «Fecha de inicio: 29/04/2026 Fecha de fin: 28/05/2026»). Recurrencia anual.
  Plazos extraordinarios para nuevas escolarizaciones: 1–15 de noviembre y 14–28
  de febrero (disposición adicional primera y Acuerdo 30/04/2025, punto Ocho) —
  no modelados en la ventana.
- **previousCalls**: 2025-2026 (18/06/2025 → 15/07/2025, Orden 2170/2025, BOCM
  17/06/2025) y 2024-2025 (21/05/2024 → 17/06/2024, Orden 2232/2024, BOCM
  20/05/2024). Fechas derivadas de la regla de 20 días hábiles citada en cada
  extracto y contrastadas con las fichas de la sede y circulares de centros.
- **Canal**: Comunidad de Madrid — Consejería de Educación, Ciencia y
  Universidades (Dirección General de Educación Concertada, Becas y Ayudas al
  Estudio) — https://sede.comunidad.madrid/ayudas-becas-subvenciones/becas-comedor-escolar-2026-2027
  (online + presencial; también se entrega en la secretaría del centro, art. 12.1)
- **Importe**: variable 295 € – coste íntegro del servicio, por curso
  («de 295 euros para todo el curso, hasta una cuantía que cubra la totalidad
  del coste del servicio de comedor»). Cuantías fijas del curso 2026-2027
  (Orden 1696/2026, apdo. Cuarto): 979 € (RMI / IMV con rpc < 3.000 €),
  445 € (rpc < 8.400 € y otros colectivos), 295 € (familia numerosa, rpc
  8.400–10.000 €); para escolarizados de oficio, protección internacional,
  acogimiento residencial y convenios, el coste completo del comedor del centro.
- **Doc**: Solicitud oficial firmada por progenitores/tutores y por todos los
  mayores de 18 años incluidos (obligatorio)
- **Doc**: Libro de familia completo, certificado del Registro Civil o partida
  de nacimiento de los menores (sustituible por declaración responsable)
- **Doc**: Certificado de la Agencia Tributaria con la renta de 2024 (solo si te
  opones a que la Administración consulte la renta)
- **Doc**: DNI o NIE en vigor del firmante y de los mayores de edad incluidos
  (solo si te opones a la consulta de datos)
- **Doc**: Documento que acredita la vía por la que solicitas (título FN en
  vigor, justificante IMV, certificado FCSE/FAS…)
- **Doc**: Volante de empadronamiento familiar del municipio si no es Madrid
  capital (solo si la convivencia no queda acreditada de otro modo)

OK / KO por requisito: ☐ ☐ ☐

## Golden

- `gp-beca-comedor-fuencarral.json`: familia Madrid capital (28079), hijo 7
  años, ingresos 0–8.400 €, `today` 2026-10-05 ⇒ veredicto esperado `posible`,
  plazo `CLOSED_RECURRING`. Sin blockers ni missingFields.

## Dudas para el revisor

1. **La renta per cápita no es comprobable**: nuestra pregunta recoge ingresos
   anuales del hogar, no el nº de miembros computables de la unidad familiar.
   Por eso la vía económica va como requisito **no hard** con vía suficiente
   (ingresos < 8.400 € ⇒ rpc < 8.400 € seguro) y el cálculo exacto queda en ⚠.
   Un hard sobre `incomeAnnual` produciría falsos negativos masivos (una familia
   de 4 con 20.000 € tiene rpc de 5.000 € y sí cumple).
2. **Territorio modelado como aviso, no excluyente**: la norma exige que el
   **centro** esté en la CM, no la residencia. Si vives fuera de la CM pero el
   colegio está dentro, también puedes acceder ⇒ `within_territory` queda como
   proxy no-hard y el requisito exacto va a ⚠. No hay requisito de
   empadronamiento.
3. **Edad como proxy de etapa**: la norma lista etapas (EI, EP, ESO), no edades.
   Usamos `age lte 18` para no dar falsos negativos (un repetidor de 18 años en
   ESO cabe); la etapa concreta queda en ⚠.
4. **`referenceDate: "application"`**: la norma ata los requisitos a la fecha de
   fin del plazo (art. 5). En una convocatoria anual recurrente la fecha cambia
   cada curso; se documenta en ⚠ `requisitos-a-fin-de-plazo`.
5. **Los extractos BOCM incluyen guiones de corte de línea** («si- guiente»,
   «pla- zo», «Cuer- pos», «to- dos», «acce- so»), como en el precedente
   `bocm-20231228-18` («soli- citudes»). Re-verificar al generar los
   `data/eligibility/sources/*.txt` con el extractor oficial (pdfjs-dist).
6. **La ficha de la sede (rank 3) se usa solo para canal y documentos** (G11);
   los umbrales y plazos citan rango 1.
7. El Ayuntamiento de Madrid aporta un complemento propio (7,39 M€, BDNS
   901414) dentro del mismo trámite; queda fuera del alcance de esta regla.
