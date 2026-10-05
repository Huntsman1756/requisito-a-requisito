# Hoja de revisión — ola-2-dependencia (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-dependencia-saad (rulesVersion 1, verificado 2026-10-05)

**Reconocimiento de la situación de dependencia y acceso al SAAD en la
Comunidad de Madrid** — procedimiento permanente a instancia de la persona
afectada o de su representante (Ley 39/2006, art. 28.1; Decreto 54/2015,
art. 12). `standalone: true` — no existe ficha `madrid-dependencia-saad` en
`data/catalog/benefits/`; se acredita con fuentes de rango 1 propias (G2):
Ley 39/2006 (BOE consolidado) + Decreto 54/2015 (BOCM), que es la norma de
desarrollo del procedimiento en la CM. **⚠ Identidad:** ya existe la ficha
`prestaciones-dependencia-saad` en el catálogo importado (mismo procedimiento,
ámbito estatal). Se ha seguido el encargo (`madrid-dependencia-saad`,
versión CM con requisito de residencia/empadronamiento CM), pero conviene que
Daniel decida si el RuleSet debe elevar la ficha estatal en lugar de crear una
segunda identidad — mismo patrón que el KO de `beca-6000` en la verificación
de la ola 1.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Residir y estar empadronado en un municipio de la Comunidad de Madrid en la fecha de la solicitud | territorio within_territory {"ccaa":"13"} | «residan en la Comunidad de Madrid en la fecha en que presenten la solicitud» | Decreto 54/2015, art. 2 «Titulares de derechos» | https://www.bocm.es/boletin/CM_Orden_BOCM/2015/05/26/BOCM-20150526-1.PDF |
| aviso: Llevar residiendo en España 5 años, de los cuales 2 inmediatamente anteriores — la fecha de alta en el municipio actual es solo una pista (si antes estabas empadronado en otro municipio español, también cuenta) | meses de residencia gte 24 | «Residir en territorio español y haberlo hecho durante cinco años, de los cuales dos deberán ser inmediatamente anteriores a la fecha de presentación de la solicitud» | Ley 39/2006, art. 5.1.c | https://www.boe.es/eli/es/l/2006/12/14/39/con |
| aviso: No tener ya la dependencia reconocida ni en trámite — este trámite es el reconocimiento inicial; si ya la tienes, procede la revisión de grado o el PIA (y puede iniciarlo un representante) | dependencia eq "no" | «El procedimiento se iniciará a instancia de la persona que pueda estar afectada por algún grado de dependencia o de quien ostente su representación» | Ley 39/2006, art. 28.1 (y 30.1 revisión) | https://www.boe.es/eli/es/l/2006/12/14/39/con |

**No comprobables con nuestras preguntas (⚠):**

- **Estar realmente en situación de dependencia en algún grado (I moderada, II severa, III gran dependencia) — no se puede autodeclarar** — «Encontrarse en situación de dependencia en alguno de los grados establecidos» (Ley 39/2006, art. 5.1.a y art. 26.1)
- **El grado lo decide una valoración oficial: profesional sociosanitario, en tu entorno habitual, con el Baremo de Valoración de la Dependencia (BVD)** — «No será posible determinar el grado de dependencia mediante otros procedimientos distintos a los establecidos por este baremo» (Ley 39/2006, art. 27.2 y 27.5; Dto. 54/2015, art. 17)
- **La regla de residencia completa: 5 años en total + 2 inmediatamente anteriores; en menores de 5 años se exige a quien tenga la guarda y custodia; emigrantes retornados con condiciones propias** — «Para los menores de cinco años el periodo de residencia se exigirá a quien ejerza su guarda y custodia» (Ley 39/2006, art. 5.1.c y 5.4)
- **Sin nacionalidad española: residencia legal según LO 4/2000, tratados y convenios; no comunitarios acreditan con certificado del Ministerio del Interior** — «carezcan de la nacionalidad española se regirán por lo establecido en la Ley Orgánica 4/2000» (Ley 39/2006, art. 5.2)
- **Menores de 3 años: régimen propio con escala de valoración específica (en la CM, el CRECOVI)** — «el Sistema para la Autonomía y Atención a la Dependencia atenderá las necesidades de ayuda a domicilio y, en su caso, prestaciones económicas vinculadas y para cuidados en el entorno familiar a favor de los menores de 3 años acreditados en situación de dependencia» (Ley 39/2006, DA 13.ª.1)
- **El reconocimiento no concede dinero por sí solo: el PIA determina después el servicio o la prestación económica según el grado** — «establecerán un programa individual de atención en el que se determinarán las modalidades de intervención más adecuadas» (Ley 39/2006, art. 29.1)
- **La capacidad económica (renta + patrimonio del último ejercicio) se determina en el expediente: decide cuantías de prestaciones económicas y la participación en el coste de los servicios (copago)** — «La determinación de la capacidad económica personal del beneficiario se hará en atención a su renta y patrimonio» (Dto. 54/2015, art. 18.2-3)
- **La prestación por cuidados en el entorno familiar (familiar no profesional) es excepcional: exige condiciones de convivencia y habitabilidad, que el PIA la establezca y que la cuidadora cotice a la Seguridad Social** — «El beneficiario podrá, excepcionalmente, recibir una prestación económica para ser atendido por cuidadores no profesionales» (Ley 39/2006, art. 14.4 y 18.1-3)
- **Plazo máximo de resolución: 6 meses desde la entrada de la solicitud** — «el plazo máximo, entre la fecha de entrada de la solicitud y la de resolución de reconocimiento de la prestación de dependencia será de seis meses» (Ley 39/2006, disposición final primera, apdo. 2)

- **Plazo**: permanente/continuo — «En plazo: permanente Referencia: S13» (sede CM, ficha del trámite)
- **Canal**: Comunidad de Madrid — Dirección General de Atención al Mayor y la Dependencia; solicitud preferente en los servicios sociales del municipio de empadronamiento (Dto. 54/2015, art. 12.2) y online en la sede — https://sede.comunidad.madrid/prestacion-social/reconocimiento-dependencia-0 (online + presencial)
- **Importe**: variable («Las prestaciones de atención a la dependencia podrán tener la naturaleza de servicios y de prestaciones económicas», art. 14.1 — el reconocimiento no concede cuantía por sí solo; la sede indica «No requiere pago de tasas»)
- **Doc**: Solicitud en modelo normalizado (Dto. 54/2015, art. 12.2) (obligatorio)
- **Doc**: Copia del DNI/NIE del solicitante o autorización de consulta (art. 13.1.a) (obligatorio)
- **Doc**: Certificados de empadronamiento: 5 años en España (2 inmediatamente anteriores) + municipio CM a fecha de solicitud (art. 13.1.c) (obligatorio)
- **Doc**: Informe de salud normalizado, médico colegiado, ≤ 3 meses (art. 13.1.e) (obligatorio)
- **Doc**: Declaración responsable de capacidad económica y patrimonial (art. 13.1.g) (obligatorio)
- **Doc**: Autorización de comprobación de datos o copia del IRPF (art. 13.1.h) (alternativa)
- **Doc**: Certificado del Ministerio del Interior de residencia legal (solo extranjeros no comunitarios, art. 13.1.d)
- **Doc**: Acreditación de la representación (solo si solicita un tercero) (sede)
- **Doc**: Informe social de los Servicios Sociales de Atención Social Primaria (sede)
- **Doc**: Libro de familia / custodia y consentimiento del otro progenitor (solo menores) (sede)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

### Notas para el verificador

- **Fuentes verificadas por HTTP 200 el 05/10/2026 (curl):**
  `https://www.boe.es/eli/es/l/2006/12/14/39/con` (200, consolidada, última
  actualización publicada 22/10/2025; sha256 bytes `ab2bb827…0b3bc10f`),
  `https://www.bocm.es/boletin/CM_Orden_BOCM/2015/05/26/BOCM-20150526-1.PDF`
  (200, PDF íntegro del Decreto 54/2015; sha256 `678c7c01…d205`) y
  `https://sede.comunidad.madrid/prestacion-social/reconocimiento-dependencia-0`
  (200, trámite «Reconocimiento de la dependencia», ref. S13; sha256
  `1e3aa225…6181`). También 200: `https://www.boe.es/eli/es-md/l/2022/12/21/12/con`
  (Ley 12/2022 de Servicios Sociales CM — no citada, solo verificación de
  vigencia del marco).
- **Corrección normativa frente al encargo** (importante): la norma de la CM
  aplicable es el **Decreto 54/2015, de 21 de mayo** (procedimiento de
  reconocimiento de la dependencia y derecho a las prestaciones del SAAD en la
  CM), no «Decreto 20/2017» — el único Decreto 20/2017 localizado es el Real
  Decreto 20/2017 estatal de vehículos al final de su vida útil (derogado).
  Tampoco existe «Ley 3/2016 de Servicios Sociales CM»: la ley de servicios
  sociales vigente es la **Ley 12/2022** (que derogó la Ley 11/2003; el Dto.
  54/2015 subsiste por no ser contrario — sigue citado en la guía oficial de
  dependencia de la CM y en la ficha normativa `nmnorma=8914`). La corrección
  de errores del Dto. 54/2015 (BOCM-20150624-1) solo renumeró el catálogo de
  servicios (art. 3) — no afecta a los artículos citados.
- **Snapshots pendientes del integrador** (esta ola corre sin npm en el
  worktree): los tres `sources` necesitan
  `npm run eligibility:snapshot -- --url <url> --id <id> --rank <r>` con
  `--expect` al sha256 de bytes de arriba. Los `excerptSha256` ya son reales:
  cada extracto está verificado literalmente presente en el texto normalizado
  (`extractText`+`normalizeText`: el PDF del BOCM con pdfjs-dist 6.4.299 del
  checkout principal, BOE/sede con la extracción HTML idéntica al script) y el
  hash es `sha256(normalizeText(excerpt))`, como exige G4.
- **Requisitos `hard` mínimos a propósito** (asimetría de errores, ADR-017):
  solo `empadronado-cm` es excluyente (quien reside en otra CCAA tiene el mismo
  trámite ante su administración — lo dice el label). `residencia-espana-5y2`
  es soft porque `residenceSince` mide el alta en el municipio actual: un F
  computable no puede excluir a quien vivía antes empadronado en otro municipio
  español (falso negativo seguro). `sin-reconocimiento-previo` es soft: con
  «reconocida» o «en trámite» el aviso orienta (PIA/revisión) sin penalizar.
- **Campo `dependency` y cuidadores**: la pregunta es «¿Tienes reconocida la
  dependencia?» sobre quien responde, y solo se muestra si `disability` ≠ «no»
  (`showIf`). Una persona que solicita **por un familiar dependiente** (caso
  típico del programa: hija que cuida a su madre) responderá sobre sí misma —
  el perfil no puede expresar «la persona a mi cargo es dependiente». Por eso
  el golden `gp-dependencia-cuidadora` espera `posible` con `dependency` en
  `missing`: la tarjeta sigue siendo útil (el representante puede iniciar el
  trámite, art. 28.1/12.1) pero el letrero asume esa ambigüedad. Si se quiere
  cubrir mejor, haría falta una pregunta tipo «¿cuidas a alguien que podría
  ser dependiente?» — decisión de catálogo, no de esta regla.
- **`lifeEvents`**: el esquema no tiene `dependencia`; se usan
  `cuidar_familiar`, `discapacidad` y `mayor_65` (cobertura del supuesto
  típico: cuidador de mayor/discapacitado). `themes`: `dependencia_discapacidad`
  + `mayores`.
- **`amount: variable`** sin cifras: el reconocimiento no concede cuantía por
  sí solo (art. 14.1) y las cuantías concretas se fijan por acuerdos del
  Consejo Territorial + grado + capacidad económica — nada importe-comprobable
  en rango ≤ 2 sin abrir más fuentes.
- **`window.rolling: true` con cita de sede (rango 3)**: «En plazo: permanente»;
  G11 no se aplica a la ventana. No hay `opensAt` (procedimiento en vigor desde
  2007, sin apertura datable).
- **Extractos con artefactos de PDF evitados** donde fue posible; el texto
  pdfjs del BOCM conserva cortes tipo «pres- taciones», «domici- lio» — se
  eligieron spans limpios (misma convención que la ola 1: el literal se respeta
  tal cual queda tras la normalización).
- **Golden asociado**: `gp-dependencia-cuidadora` — verdict esperado `posible`,
  `deadlineState` `ROLLING`, `blockers` [], `missingFields` [`dependency`]
  a 2026-10-05 (trazado a mano: territory 28079 ⊂ CM ⇒ T; residenceSince
  06/2015 ⇒ ≈135 meses ≥ 24 ⇒ T; dependency unasked ⇒ U soft; 0 hard F ⇒
  posible; rolling ⇒ ROLLING). Pendiente de ejecución con el motor cuando el
  integrador incorpore snapshots + npm.
