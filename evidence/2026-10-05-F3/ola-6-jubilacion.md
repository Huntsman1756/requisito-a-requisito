# Hoja de revisión — ola-6-jubilacion (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## pension-jubilacion-contributiva (rulesVersion 1, verificado 2026-10-05)

**Pensión de jubilación contributiva del Régimen General** — RDL 8/2015
(LGSS), arts. **205–215** (la pista del encargo decía «arts. 205-214»; el
capítulo completo llega al 215, jubilación parcial) y **disposición
transitoria séptima** (aplicación paulatina de la edad y la cotización);
RD 241/2026 (límite inicial + cuantías mínimas 2026). Gestión: **INSS**
(ISM si el trabajador está en el Régimen Especial del Mar). Permanente
(derecho imprescriptible, art. 212); a instancia de parte.

**Corrección al encargo**: la edad ordinaria en **2026 es 66 años y
10 meses** (no «66y6m»), o 65 con ≥ 38 años y 3 meses cotizados; desde
2027: 67 / 65 con 38 y 6 meses (DT 7ª, literal en el `.txt`).

`standalone: true` — no existe ficha de la jubilación contributiva ni en
`data/catalog/benefits/` (244 fichas; solo `subsidio-mayores-52` menciona
«jubilación» de refilón) ni en `data/universe/programs.json` (lo más
cercano: `seed-7e23f16d8b` PNC jubilación e invalidez — no contributiva —
y `sede-cm-17c1873c91` «Ayudas previas a la jubilación ordinaria», ayuda
CM previa, no la pensión). Acreditado con fuentes de rango 1 propias
(G2): LGSS consolidada + RD 241/2026.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener 52 años cumplidos — suelo absoluto de cualquier vía reducida por discapacidad; la edad ordinaria real en 2026 es 66a10m (o 65 con ≥38a3m) y las anticipadas la sitúan en ~61–65 (ver ⚠) | age gte 52 (intervalo: T si lo ≥ 52; F si hi < 52; U si lo cruza) | Req: «2026 38 años y 3 meses o más. 65 años. Menos de 38 años y 3 meses. 66 años y 10 meses.» · Hoja: «en ningún caso dará lugar a que el interesado pueda acceder a la pensión de jubilación con una edad inferior a la de cincuenta y dos años» | DT 7ª cuadro (2026) · art. 206 bis.2 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **Cotización mínima: 15 años, 2 dentro de los 15 anteriores** — «Tener
  cubierto un período mínimo de cotización de quince años, de los cuales
  al menos dos deberán estar comprendidos dentro de los quince años
  inmediatamente anteriores al momento de causar el derecho» (art.
  205.1.b). Es el requisito decisivo y el catálogo no pregunta años
  cotizados ⇒ nunca `probable`.
- **Edad ordinaria exigible según cotizaciones**: 66a10m en 2026 (65 con
  ≥38a3m); 67 desde 2027 (65 con ≥38a6m) — «2026 38 años y 3 meses o
  más…» (DT 7ª, cuadro completo 2026/2027).
- **Alta o situación asimilada** (desempleo, excedencia forzosa,
  convenio especial, IT…), aunque puede causarse sin alta si hay edad y
  cotización — art. 205.3.
- **Régimen**: la ficha describe el Régimen General; RETA, mar (REM) y
  funcionarios de carrera (Clases Pasivas, MUGEJU, ISFAS) tienen norma
  propia análoga — art. 205.1 («las personas incluidas en el Régimen
  General…»).
- **Extranjeros**: residir o estar legalmente en España y haber cotizado
  aquí — art. 2.1.
- **Anticipada involuntaria**: hasta 4 años antes de la ordinaria con
  ≥33 años cotizados + 6 meses como demandante de empleo antes de
  solicitarla + cese por causa tasada (despido colectivo/objetivo,
  resolución judicial, fuerza mayor, muerte del empresario individual,
  violencia de género…) — arts. 207.1.a-c y 207.1.d.
- **Anticipada voluntaria**: hasta 2 años antes con ≥35 años cotizados y
  pensión resultante > mínima a los 65 — art. 208.1.
- **Discapacidad**: coeficientes con grado ≥ 65 %, o ≥ 45 % en patologías
  tasadas (RD 1851/2009); suelo absoluto 52 — art. 206 bis.
- **Colectivos penosos** (minería, vuelo, ferroviarios, artistas,
  taurinos, bomberos, Ertzaintza…): rebaja por RD, puede quedar < 52 —
  art. 206.1.
- **Jubilación demorada**: complemento a elección (+4 %/año completo,
  cheque único o mixta) — art. 210.2.
- **Incompatibilidad con el trabajo** salvo modalidades previstas — art.
  213.1; **jubilación activa** (≥1 año tras la edad ordinaria + mínimo
  cotizado ⇒ compatible con cualquier trabajo) — art. 214.1.
- **Mínimas 2026** (complemento a mínimos): 65+ → 17.592,40 / 13.106,80
  / 12.441,80 €/año según cónyuge; <65 → 17.592,40 / 12.262,60 /
  11.590,60 — RD 241/2026 Anexo I. Límite de rentas del complemento:
  < 11.013,00 €/año (rentas del pensionista y del cónyuge a cargo) +
  residir en España — art. 10.1.b y 10.4. **Máxima inicial 2026**:
  3.359,60 €/mes (47.034,40 €/año) — art. 3.1.

- **Plazo**: permanente — «El derecho al reconocimiento de la pensión de
  jubilación es imprescriptible, sin perjuicio de que… los efectos… se
  produzcan a partir de los tres meses anteriores a la fecha en que se
  presente la correspondiente solicitud» (LGSS art. 212).
- **Canal**: INSS (o ISM en el Régimen del Mar) — «La gestión y el
  reconocimiento del derecho corresponden al Instituto Nacional de la
  Seguridad Social (INSS) o… al Instituto Social de la Marina (ISM)»
  (página SS «Gestión / Solicitudes»). URL: sede electrónica
  https://sede.seg-social.gob.es/ (servicio «Jubilación nacional» en
  nombre propio, representación o apoderamiento; y vía «sin certificado»).
- **Simulador oficial** (CTA primaria): `Simulador de Jubilación` —
  «permite simular la edad con la que se puede jubilar y la cuantía
  aproximada» (sede Pensiones) →
  https://prestaciones.seg-social.es/simulador-servicio/simulador-pension-jubilacion.html
- **Importe**: `variable`, mensual — base reguladora × porcentaje («Por
  los primeros quince años cotizados, el 50 por ciento», art. 210.1);
  cotas en ⚠ (mínimas/máxima 2026 citadas).
- **Doc**: solicitud «Jubilación nacional» (obligatoria).
- **Doc**: DNI / pasaporte+NIE en vigor del solicitante (y representante)
  — basta exhibir el original (obligatoria).
- **Doc**: representación legal si firma un tercero (opcional).
- **Doc**: certificado de empresa con categoría y períodos para
  anticipada con bonificación por penosidad (opcional).
- **Doc**: informe médico + certificado de discapacidad (IMSERSO) para
  anticipada por discapacidad — solo si `disability ≠ "no"` (opcional).
- **Doc**: acreditación del cese involuntario (despido/indemnización o
  demanda) — solo si `employmentStatus = "desempleado"` (opcional).
- **Doc**: certificado Registro Central de Extranjeros/TIE + libro de
  familia para complemento a mínimos de extranjeros residentes
  (opcional).

OK / KO por requisito: ☐

### Notas para el verificador

- **Fuentes HTTP 200 el 06/10/2026** (curl -L):
  `boe.es/eli/es/rdlg/2015/10/30/8/con` (LGSS consolidada),
  `boe.es/eli/es/rd/2026/03/25/241`,
  `seg-social.es/…/28393/28396/28482` («Gestión / Solicitudes»),
  `sede.seg-social.gob.es/…/Ciudadanos/Pensiones` y el simulador
  `prestaciones.seg-social.es/simulador-servicio/simulador-pension-jubilacion.html`.
- **Snapshots nuevos con el script real** (`eligibility-snapshot.ts`
  ejecutado desde `F:\_Proyectos\datawardsmadrid` — código byte-idéntico
  al del worktree, comprobado por sha256 — con `--sources-dir` apuntando
  al worktree): `segss-jubilacion-gestion` (sha `9eaf964d…`, textSha
  `7e8abae8…`) y `sede-segss-pensiones` (sha `c5d46967…`, textSha
  `b3986999…`). Bytes en `F:\AgentState\datawardsmadrid\snapshots\`.
- **`excerptSha256` todos reales**: 29 citas, cada extracto literal en el
  `.txt` normalizado y `excerptSha256 = sha256(excerpt)` verificado por
  el script del repo (`ruleset-fill-hashes.ts`, ejecutado con tsx del
  repo principal: «excerptSha256 rellenados y verificados contra
  snapshots», 0 errores) y por una réplica Python de
  `normalizeText`/`htmlToText` validada byte a byte contra
  `sede-pnc-jubilacion`.
- **`eligibility-validate --today 2026-10-05`** sobre el worktree: 32
  rulesets, **0 errores**, 32 avisos (todos G10 `humanReview: pending`,
  esperado). `pension-jubilacion-contributiva` pasa G1–G11 (G11: todas
  las citas normativas a rango 1 — BOE; las de rango 3 solo en
  `window`/`channel`/`documents`/`officialSimulator`).
- **`verification.status: pending`**: queda fuera del bundle público
  (G12) hasta el dictamen del verificador independiente — ADR-044.
- **`edad-minima-52` como hard** (decisión de diseño): es el único dato
  inequívoco que la pregunta de edad da. La ley fija 52 como suelo
  absoluto para la reducida por discapacidad (art. 206 bis.2 «en ningún
  caso»); por debajo solo quedan coeficientes por penosidad por real
  decreto (p. ej. minería de interior ~45) — falso negativo residual
  documentado y cubierto por `colectivos-penosos` en ⚠. Los umbrales
  reales (65/66a10m en 2026, anticipadas ~61–65) dependen de los años
  cotizados y del motivo del cese, que no se preguntan ⇒ quedan en ⚠,
  nunca hard. `timeDependent: increasing` activa `futureEligibility`.
- **Sin requisito territorial**: pensión estatal gestionada por el INSS;
  residir en la CM no es requisito (mismo criterio que viudedad/subsidio
  >52).
- **`doc-anticipada-discapacidad` / `doc-anticipada-involuntaria` con
  `condition`**: solo se listan si el perfil declara discapacidad / está
  desempleado — el motor las oculta en F (probado).
- **Golden asociado**: `gp-jubilacion-leganes` — hombre de 66 años,
  Leganés (28074), asalariado, sin cargas, banda 16.800–25.200.
  **Ejecutado con el motor real** (`evaluateRuleSet`, tsx desde el repo
  principal; motor byte-idéntico al del worktree por sha256): `posible` +
  `ROLLING` + `blockers []` + `missing []` + selfCheck PASS, como
  esperaba el golden. Sondas: 52 ⇒ posible; 51/45 ⇒ `no_cumple` con
  `futureEligibility` (turno a los 52: 2027-10-05 y 2033-10-05); bandas
  50–55 y 45–53 ⇒ `insuficiente` (hard U). Pin `rulesVersion: 1`.
- **Ambigüedad documentada**: «la jubilación» del encargo también tiene
  modalidades parcial/flexible/activa que aquí van en ⚠; la tarjeta
  describe el acceso a la pensión, no la modalidad de cobro. El
  mutualista pre-1967 a los 60 años existe (DT 4ª, 2.ª: «Quienes tuvieran
  la condición de mutualista el 1 de enero de 1967 podrán causar el
  derecho… a partir de los sesenta años») pero el colectivo hoy tiene
  ~75+ años: no añade requisito comprobable nuevo y queda cubierto por la
  nota de modalidades.
