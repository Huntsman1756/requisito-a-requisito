# Hoja de revisión — ola-6-incapacidad (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## pension-incapacidad-permanente (rulesVersion 1, verificado 2026-10-05)

**Pensión de incapacidad permanente, modalidad contributiva** — Régimen
General de la Seguridad Social: RDL 8/2015 (LGSS), arts. 165.1 y 194–200 +
disposición transitoria 26.ª (los grados «para la profesión habitual» siguen
vigentes mientras no se desarrolle reglamentariamente el nuevo art. 194);
Orden de 15/04/1969 (BOE-A-1969-575, arts. 15.2 y 17: porcentajes de las
pensiones vitalicias) y Decreto 1646/1972 (art. 9: indemnización de la
parcial); RD 241/2026, Anexo I (mínimos 2026). Gestión: INSS (ISM en el
Régimen Especial del Mar; el pago puede corresponder a la Mutua en
contingencias profesionales). Permanente, a instancia de parte.

`standalone: true` — no existe ficha `pension-incapacidad-permanente` en
`data/catalog/benefits/`; se acredita con fuentes de rango 1 propias (G2):
LGSS consolidada + Orden 1969 + Decreto 1646/1972 + RD 241/2026, todas BOE.

**Diseño deliberado**: esta ayuda se decide con una valoración médico-legal y
la vida laboral — casi nada se puede comprobar con ≤ 10 preguntas
(UNKNOWN≠NO). Solo hay **1 requisito evaluable y es soft**: el resto va a
`uncoveredRequirements` (16). Consecuencia: el veredicto máximo posible es
«posible» — nunca «probable» — porque el núcleo (grado declarado por el
INSS, alta y cotización) siempre queda ⚠.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **AVISO (soft)**: Si la incapacidad deriva de enfermedad común o accidente no laboral: no tener la edad de la pensión de jubilación (67 años, o 65 con 38 años y 6 meses cotizados) o no reunir los requisitos para jubilarte — por accidente de trabajo o enfermedad profesional no hay límite de edad | age lt 67 | «No se reconocerá el derecho a las prestaciones de incapacidad permanente derivada de contingencias comunes cuando el beneficiario, en la fecha del hecho causante, tenga la edad prevista en el artículo 205.1.a) y reúna los requisitos para acceder a la pensión de jubilación» | LGSS art. 195.1, párrafo 2.º | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **Grado declarado por el INSS** — parcial / total / absoluta / gran
  incapacidad, con dictamen del EVI; no autodeclarable — «Corresponde al
  Instituto Nacional de la Seguridad Social […] declarar la situación de
  incapacidad permanente» (LGSS art. 200.1; definiciones de los grados en la
  DT 26.ª, que mantiene vigente la redacción anterior del art. 194)
- **Alta o asimilada** (afiliación + alta al sobrevenir la contingencia;
  paro, IT o excedencia cuentan; AT/EP = pleno derecho; absoluta/GI comunes
  sin alta con 15 años) — «estar afiliadas y en alta en dicho Régimen o en
  situación asimilada a la de alta al sobrevenir la contingencia o situación
  protegida» (LGSS art. 165.1)
- **Cotización de las pensiones (comunes)**: <31 años ⇒ ⅓ del tiempo desde
  los 16; ≥31 ⇒ ¼ del tiempo desde los 20, mínimo 5 años, con ⅕ del período
  dentro de los últimos 10 — «la cuarta parte del tiempo transcurrido entre
  la fecha en que cumplió los veinte años y la del hecho causante de la
  pensión, con un mínimo, en todo caso, de cinco años» (LGSS art. 195.3)
- **Cotización de la parcial (comunes)**: 1.800 días en los 10 años
  anteriores a la extinción de la IT — LGSS art. 195.2
- **Sin cotización en AT/EP/accidente** — «no será exigido ningún período
  previo de cotización» (LGSS art. 195.1)
- **Absoluta/GI sin alta**: 15 años cotizados — LGSS art. 195.4
- **La otra mitad de la edad**: a los 67 (o 65 + 38,5 años) solo se cierra
  la IP de comunes si ADEMÁS cumples requisitos de jubilación — vida laboral
  — LGSS art. 195.1
- **Cuantía — parcial**: indemnización a tanto alzado = 24 mensualidades de
  la BR de la IT — «veinticuatro mensualidades de la base reguladora que
  haya servido para determinar la prestación económica por incapacidad
  laboral transitoria» (Decreto 1646/1972, art. 9)
- **Cuantía — total**: pensión vitalicia del **55 % de la BR** — «pensión
  vitalicia de cuantía equivalente al 55 por 100 de la base reguladora»
  (Orden 15/04/1969, art. 15.2); sustituible excepcionalmente por indemnización
  a tanto alzado <60 años (LGSS art. 196.2) e incrementable con un porcentaje
  reglamentario para mayores de 55 años cuando se presuma la dificultad de
  empleo (IPT cualificada — el +20 % exacto lo recoge la página de cuantía de
  la Seguridad Social, rango 3: no citable en la regla por G11)
- **Cuantía — absoluta**: pensión vitalicia del **100 %** de la base
  reguladora — «pensión vitalicia equivalente al 100 por 100 del salario real
  del trabajador» (Orden 15/04/1969, art. 17; el texto dice «salario real»
  computado con las reglas de la BR)
- **Cuantía — gran incapacidad**: pensión + complemento para quien te
  atiende = 45 % de la base mínima + 30 % de la última base, nunca < 45 % de
  la pensión — LGSS art. 196.4
- **Base reguladora**: en común, cociente bases 96 meses /112 con escala por
  años cotizados (computan como cotizados los años que falten hasta la edad
  ordinaria; mínimo 50 %) — LGSS art. 197.1; en profesionales, retribuciones
  reales — todo depende de la vida laboral
- **Mínimos 2026** (anuales, cónyuge a cargo / sin cónyuge / cónyuge no a
  cargo): GI 26.385,80/19.660,20/18.662,00 €; absoluta y total ≥65
  17.592,40/13.106,80/12.441,80 €; total 60–64 17.592,40/12.262,60/11.590,60
  €; total EC <60 9.662,80/9.662,80/9.580,20 € — RD 241/2026 Anexo I
- **Compatibilidad con el trabajo**: total compatible con salario en
  funciones distintas; absoluta/GI admiten actividades compatibles pero se
  suspende el pago si te incorporas a un régimen — LGSS art. 198
- **Hecho causante y efectos**: IT extinguida ⇒ HC = extinción y efectos en
  la resolución del Director Provincial (retrotraíbles al fin del subsidio
  si la pensión es mayor); sin IT ⇒ HC = dictamen EVI — segss (rango 3) +
  LGSS art. 196.6
- **Revisión y cambio de nombre a los 67**: revisable por agravación/mejoría
  hasta la edad de jubilación; a los 67 pasa a denominarse pensión de
  jubilación — LGSS arts. 200.2 y 200.4

- **Plazo**: permanente — prestación a instancia de parte; los efectos se
  fijan en la resolución del Director Provincial del INSS
  (segss-ip-beneficiarios)
- **Canal**: INSS (ISM en el RE del Mar; pago por la Mutua en profesionales).
  Online: «Prestación de incapacidad permanente nacional» en la sede
  electrónica de la SS — «Este servicio permite solicitar, por Registro
  electrónico, la pensión de incapacidad permanente nacional»
  (sede-incapacidad-permanente). Presencial: CAISS/Dirección Provincial —
  «Esta documentación puede presentarse en cualquiera de los Centros de
  Atención e Información de la Seguridad Social» (segss-ip-solicitud)
- **Importe**: `variable`, `monthly` — la forma depende del grado (tanto
  alzado en parcial; pensión vitalicia en total/absoluta/GI) — LGSS art.
  196.2
- **Doc**: modelo oficial de solicitud (sede; obligatorio)
- **Doc**: identidad del interesado y representante — DNI / pasaporte+NIE
  (obligatorio)
- **Doc**: representación legal o emancipación (condicionado a firmar otro)
- **Doc**: justificantes de cotizaciones de los últimos 3 meses (solo EC si
  eras el obligado a ingresarlas)
- **Doc**: parte administrativo de AT/EP + certificado de salarios reales del
  año anterior (solo contingencias profesionales)
- **Doc**: historial clínico del servicio público de salud (si está en tu
  poder; recomendado, no imprescindible)

OK / KO por requisito: ☐

### Notas para el verificador

- **Fuentes verificadas por HTTP 200 el 06/10/2026:**
  `https://www.boe.es/eli/es/rdlg/2015/10/30/8/con` (LGSS, última
  actualización consolidada 03/10/2026),
  `https://www.boe.es/eli/es/o/1969/04/15/(1)/con` (Orden 15/04/1969),
  `https://www.boe.es/eli/es/d/1972/06/23/1646/con` (Decreto 1646/1972),
  `https://www.boe.es/eli/es/rd/2026/03/25/241` (RD 241/2026),
  `https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10960/28750/28680/28700/28703?changeLanguage=es`,
  `…/28754?changeLanguage=es`,
  `…/32454?changeLanguage=es` (páginas de prestación de IP del RG) y
  `https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/Incapacidad/201979?changeLanguage=es`
  (trámite online «Prestación de incapacidad permanente nacional»).
- **Snapshots nuevos creados SIN npm** (`segss-ip-beneficiarios`,
  `segss-ip-solicitud`, `segss-ip-gestion`, `sede-incapacidad-permanente`,
  `boe-orden-15041969-invalidez`, `boe-decreto-1646-1972-incapacidad`):
  réplica exacta en Python de `eligibility-snapshot.ts` (mismo `htmlToText`
  + `normalizeText`): bytes en `F:\AgentState\datawardsmadrid\snapshots\
  <sha256>.html`, `.txt` normalizado y `.json` en `data/eligibility/sources/`.
  **Fidelidad comprobada**: la réplica regenera byte a byte el `.txt` y el
  `textSha256` de cuatro snapshots existentes (`segss-viudedad-gestion`,
  `segss-imv`, `sede-rmi`, `boe-lgss-prestacion-familia`). Si el integrador
  prefiere, puede regenerarlos con `npm run eligibility:snapshot` y comparar.
- **`excerptSha256` todos reales**: cada extracto verificado presente en el
  `.txt` normalizado de su fuente y hash `sha256(normalizeText(excerpt))`
  computado con la misma normalización que
  `src/lib/eligibility-engine/text-normalize.ts` (réplica en Python).
  Comprobación automatizada sobre el JSON final: **27 citas, 0 errores**
  (extracto presente + sha + sourceId declarado + snapshot/meta-url +
  dominio registrado con rango dentro del techo + **G11: 0 citas de rango > 2
  en requirements/uncovered/amount** — las páginas segss y la sede solo
  sustentan window/channel/documents, que es su papel según G11).
- **LGSS se reutiliza como `boe-lgss-prestacion-familia`** (misma convención
  que olas 1–5: un único snapshot del texto consolidado; el `title` indica
  los arts. 165.1 y 194–200 para esta ficha). Ojo al **doble art. 194** en el
  consolidado: el articulado muestra la redacción nueva (lista de
  enfermedades pendiente de desarrollo) y la DT 26.ª mantiene la anterior
  (los grados «para la profesión habitual», incluido el umbral del 33 % de
  la parcial) hasta que entre en vigor el reglamento — se citan ambas según
  corresponda.
- **`edad-inferior-jubilacion-comunes` es soft, no hard**: la exclusión del
  art. 195.1 exige edad de jubilación **y** cumplir los requisitos de
  jubilación (vida laboral, no evaluable) y no aplica a AT/EP — un F en
  `age < 67` sería un falso negativo, así que queda como aviso y la parte
  no evaluable va a `no-jubilacion-comunes`. La edad de referencia del
  art. 205.1.a) es 67 años (65 con 38 años y 6 meses cotizados), texto
  vigente del consolidado.
- **La pregunta `disability` no se usa**: el certificado de discapacidad
  (≥33 %) y la incapacidad permanente son instrumentos distintos (la IPP
  exige una reducción del rendimiento ≥33 % pero se declara por el INSS, no
  por el certificado) — usarla como condición produciría falsos positivos y
  negativos; el grado queda en `grado-declarado-inss`.
- **Porcentajes por grado con cita de rango 1**: 24 mensualidades (parcial)
  → Decreto 1646/1972 art. 9 (vigente); 55 % (total) → Orden 15/04/1969
  art. 15.2; 100 % (absoluta) → Orden art. 17 (el texto dice «salario real»,
  señalado en el label); complemento de GI → LGSS art. 196.4 (la fórmula
  45 % + 30 % del texto vigente, no el 50 % antiguo del art. 18 de la Orden).
  El +20 % de la IPT cualificada solo consta en la página de cuantía de la
  Seguridad Social (rango 3): se describe cualitativamente con cita a LGSS
  art. 196.2 («incrementada en el porcentaje que reglamentariamente se
  determine»), sin afirmar la cifra en el campo citado.
- **Ámbito**: regla redactada para el Régimen General; los regímenes
  especiales tienen particularidades (mencionado en `alta-o-asimilada` y en
  la gestión ISM). La prestación es estatal: no hay requisito de territorio
  (mismo criterio que viudedad/IMV).
- **Goldens asociados**: `gp-incapacidad-getafe` (44 años, asalariado,
  discapacidad ≥33 % → `posible`, ROLLING) y `gp-incapacidad-alcala`
  (70 años, jubilada → el soft evalúa F pero el veredicto sigue `posible`:
  demuestra UNKNOWN≠NO y que el aviso no excluye). Trazado a mano a
  2026-10-05: 0 hard F, 0 hard U, uncovered > 0 ⇒ `posible`; `blockers` [],
  `missingFields` []. Pendiente de ejecución con el motor cuando el
  integrador corra la validación completa.
- **`amount: variable + monthly`** sin min/max: la parcial es tanto alzado y
  las pensiones son vitalicias con cuantía = % × BR según grado,
  contingencia y carrera — min/max fijos falsearían; los mínimos 2026 van en
  `minimos-2026` con su cuadro literal del Anexo I.
- **`effortInputs`**: `requiresCertificate` true (registro electrónico con
  Cl@ve/certificado; presencial en CAISS) y `formPages` 3 (estimación propia,
  no dato oficial).
