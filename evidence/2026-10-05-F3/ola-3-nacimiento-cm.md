# Hoja de revisión — ola 3: ayuda general de natalidad CM (pago mensual)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-ayudas-nacimiento-general (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `madrid-ayudas-nacimiento-general` en
`data/catalog/benefits/` ni pista en `leads.json`; G2 se satisface con las
fuentes de rango 1 propias (Acuerdo 9/12/2021 + dos Acuerdos modificadores).

> **Programa autonómico encontrado — NO se usa el fallback estatal.** El
> encargo pedía la «ayuda general de natalidad de la CM» y, en su defecto, la
> prestación estatal por nacimiento y cuidado del menor. El programa **sí
> existe**: «Ayudas económicas de pago mensual por gestación, nacimiento de
> hijo o adopción de menores en la Comunidad de Madrid» (500 €/mes/hijo, de
> la semana 21 de gestación hasta los 24 meses del menor; trámite sede
> **A76**, «En plazo: permanente»). Es distinto de
> `madrid-ayudas-nacimiento-adopcion-multiple` (pago único 1.800 €/hijo por
> nacimiento/adopción múltiple, Acuerdo 27/12/2023). La prestación estatal
> LGSS arts. 331-345 queda para otra ola si conviene (slug propuesto
> `prestacion-nacimiento-cuidado-menor`).

**Marco normativo vigente** (las tres piezas se citan como fuentes de rango 1):

- Acuerdo de 9/12/2021 (BOCM n.º 308, 27/12/2021) — normas reguladoras.
- Acuerdo de 16/02/2022 (BOCM n.º 46, 23/02/2022) — baja el empadronamiento
  exigido de 10 a 5 años ininterrumpidos; rehace art. 8.2.b/c.
- Acuerdo de 21/12/2022 (BOCM n.º 310, 29/12/2022) — **redacción vigente del
  art. 6.c**: 5 años de empadronamiento **dentro de los 10 anteriores** (ya no
  necesariamente continuados); rehace arts. 7.4 y 8.2.b/f.
- Vigencia 2026: Orden 3017/2025 (BOCM 10/10/2025) declara el crédito
  presupuestario plurianual del ejercicio 2026 y Orden 741/2026 (BOCM
  06/04/2026) lo amplía — ambas capturadas como fuentes de rango 2.

URLs verificadas HTTP 200 el 2026-10-05 (curl -L, UA Mozilla):

- https://www.bocm.es/boletin/CM_Orden_BOCM/2021/12/27/BOCM-20211227-25.PDF → 200
- https://www.bocm.es/boletin/CM_Orden_BOCM/2022/02/23/BOCM-20220223-13.PDF → 200
- https://www.bocm.es/boletin/CM_Orden_BOCM/2022/12/29/BOCM-20221229-28.PDF → 200
- https://www.bocm.es/boletin/CM_Orden_BOCM/2025/10/10/BOCM-20251010-19.PDF → 200
- https://www.bocm.es/boletin/CM_Orden_BOCM/2026/04/06/BOCM-20260406-14.PDF → 200
- https://sede.comunidad.madrid/ayudas-becas-subvenciones/ayudas-economicas-natalidad → 200

Snapshots generados con `scripts/eligibility-snapshot.ts` (tsx del repo
principal, `--sources-dir` apuntando al worktree): 6 pares `.json`/`.txt` en
`data/eligibility/sources/` y bytes en `F:\AgentState\datawardsmadrid\snapshots\`.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Residir y estar empadronado/a en un municipio de la CM en el momento de la solicitud | territory within_territory {"ccaa":"13"} | «Residir y estar empadronada/o en algún municipio de la Comunidad de Madrid, en el momento de la solicitud» | Art. 6.c (redacción Acuerdo 21/12/2022) | https://www.bocm.es/boletin/CM_Orden_BOCM/2022/12/29/BOCM-20221229-28.PDF |
| **OBLIGATORIO**: Tener 30 años o menos a la fecha de solicitud | age lte 30 | «Tener treinta años o menos.» | Art. 6.b | https://www.bocm.es/boletin/CM_Orden_BOCM/2021/12/27/BOCM-20211227-25.PDF |
| aviso: Al menos 5 años de empadronamiento en la CM dentro de los 10 anteriores (proxy conservador: antigüedad continuada; la norma admite no continuados) | residenceMonths gte 60 | «al menos durante cinco años, dentro de los diez años» | Art. 6.c (redacción Acuerdo 21/12/2022) | https://www.bocm.es/boletin/CM_Orden_BOCM/2022/12/29/BOCM-20221229-28.PDF |
| aviso: Renta anual < 30.000 € (tributación individual) o < 36.200 € (conjunta), IRPF último período vencido (comprobamos el límite más estricto por bandas) | incomeAnnual lt 30000 | «No superar los 30.000 euros anuales de renta en tributación individual o los 36.200 euros anuales de renta en tributación conjunta» | Art. 6.d | https://www.bocm.es/boletin/CM_Orden_BOCM/2021/12/27/BOCM-20211227-25.PDF |

**Decisiones de modelado (honestidad UNKNOWN ≠ NO):**

- `empadronamiento-5-en-10` es **aviso (hard:false)**, no obligatorio: nuestra
  pregunta `residenceSince` mide la antigüedad continuada actual, pero la
  norma admite 5 años **no continuados** dentro de los últimos 10. Un F del
  proxy no implica incumplimiento real.
- `renta-irpf` es **aviso**: los límites dependen de tributación individual vs
  conjunta (que no preguntamos) y se miden sobre el IRPF del último período
  vencido; solo comprobamos que la banda de ingresos queda bajo el límite más
  estricto (30.000 €).
- `edad-max-30` lleva `timeDependent: "decreasing"` (el tiempo puede
  convertir T en F al cumplir 31).
- La situación beneficiaria (gestante ≥ semana 21 / madre de hijo nacido desde
  1/1/2022 / adoptante desde 1/1/2022) **no es comprobable** con el catálogo
  de preguntas: queda en uncoveredRequirements. Deliberadamente NO se exige
  un dependiente < 2 años como requisito, porque la vía gestación/adopción no
  lo implica (un F sería falso).

**No comprobables con nuestras preguntas (⚠):**

- **Situación beneficiaria: gestante desde la semana 21 de gestación** — «Gestantes desde la semana 21 de gestación, a partir de 1 de enero de 2022» (art. 5.1.a)
- **Alternativa: madre de hijo nacido desde el 1/1/2022 (solicitable mientras el menor tenga < 24 meses) o adoptante de menor desde el 1/1/2022** — «Madres que hayan tenido un hijo o más hijos en caso de parto múltiple, a partir de 1 de enero de 2022» (art. 5.1.b; c en la misma línea para adopción)
- **Nacionalidad española o residencia legal en España** — «Ser español/a o extranjera/o con residencia legal en España» (art. 6.a)
- **Regla exacta de empadronamiento: 5 años dentro de los 10 inmediatamente anteriores, no necesariamente continuados, + mantener la residencia en la CM durante la percepción** — «al menos durante cinco años, dentro de los diez años inmediatamente anteriores a la fecha de presentación» (art. 6.c vigente)
- **No incurso en prohibiciones del art. 13 de la Ley 38/2003 (declaración responsable, Anexo 2; AEAT/SS exoneradas de acreditación en fase de pago)** — «No estar incurso en alguna de las prohibiciones establecidas en el artículo 13 de la Ley 38/2003» (art. 6.e)
- **No privación de patria potestad ni tutela asumida por protección de menores de la CM** — «No podrán ser beneficiarios las personas privadas total o parcialmente de la patria potestad de sus hijos» (art. 5.5)
- **Renta exacta: IRPF del último período impositivo vencido; si no hay retenciones, certificado negativo de renta** — «la situación económica deberá acreditarse mediante Certificado negativo de Renta» (art. 8.2.c vigente)
- **Concesión sujeta a crédito presupuestario anual por orden riguroso de entrada** — «se declara el importe del crédito presupuestario» (Orden 3017/2025, ejercicio 2026)
- **Si se solicita por gestación: certificado de nacimiento en ≤ 3 meses tras el parto** — «En este supuesto debe presentarse el certificado de nacimiento en el plazo máximo de tres meses» (art. 8.2.f vigente)

- **Plazo**: rolling — «este plazo de presentación permanecerá abierto de forma continuada desde el 1 de enero hasta el 31 de diciembre de cada ejercicio anual» (art. 9.1; sede A76: «En plazo: permanente»)
- **Canal**: Comunidad de Madrid — Consejería de Familia, Juventud y Asuntos Sociales (DG Infancia, Familia y Fomento de la Natalidad) — online y presencial — «Las solicitudes podrán presentarse telemáticamente por registro electrónico» (art. 9.2) — https://sede.comunidad.madrid/ayudas-becas-subvenciones/ayudas-economicas-natalidad
- **Importe**: 500 €/mes por hijo (variable: en gestación/parto/adopción múltiple, 500 € adicionales por cada hijo/feto adicional), hasta que el menor cumpla 24 meses — «el importe de la subvención será de 500 euros mensuales por hijo» (art. 4)
- **Doc**: DNI o documento identificativo válido en España (obligatorio)
- **Doc**: Certificado de empadronamiento actual + histórico ≥ 5 años dentro de los últimos 10 (obligatorio)
- **Doc**: Declaración IRPF último período o certificado negativo de renta — solo si no se autoriza la consulta a la AEAT (obligatorio en ese caso)
- **Doc**: Declaración responsable Anexo 2 (obligatorio)
- **Doc**: Informe médico de semana 21 de gestación (solo solicitud por gestación)
- **Doc**: Certificación registral individual / libro de familia / certificado de inscripción de adopción (solo nacimiento o adopción)
- **Doc**: Tarjeta de residente (TIE) o solicitud de renovación (solo extranjeros)

**Golden**: `gp-nacimiento-getafe` — madre 27 años, Getafe, empadronada desde
2014, hijo de 1 año, ingresos 0–8.400 € ⇒ los 2 requisitos duros T + 2 avisos
T; veredicto esperado «posible», deadlineState ROLLING.

**Validación**: `eligibility-validate.ts` (tsx del repo principal, cwd =
worktree, `--today 2026-10-05`) → 17 rulesets, **0 errores**, 17 avisos G10
(humanReview pending, esperado).
