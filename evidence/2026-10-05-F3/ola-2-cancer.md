# Hoja de revisión — ola 2 · prestacion-cuidado-menores-cancer

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## ⚠ Correcciones al encargo que debe validar el revisor

1. **«Ley 48/2015» no contiene esta prestación.** Ley 48/2015 es la de
   Presupuestos Generales del Estado 2016 (BOE-A-2015-11644): se descargó y
   verificó que no menciona ni cáncer ni la reducción de jornada por cuidado
   (0 coincidencias de «cáncer», «enfermedad grave», «caso asimilado»).
   La base normativa real es la **LGSS (RDL 8/2015), capítulo X, arts.
   190–192** (la prestación la creó la disposición final 21.ª de la Ley
   39/2010, PGE 2011) y su **desarrollo es el RD 1148/2011**, de 29 de julio,
   modificado por el **RD 677/2023** — por eso se ha snapshotteado el **texto
   consolidado** (`/con`), no el original de 2011. Ambas fuentes son rango 1.
2. **La URL de seg-social de la ficha importada está apuntando a otra página.**
   `data/catalog/benefits/prestacion-cuidado-menor-enfermedad-grave.json` cita
   `…/InformacionUtil/44539/44084`, que devuelve la ficha de «Obtención del
   Número de la Seguridad Social / Afiliación» (verificado en el texto
   extraído). Se ha usado en su lugar la página oficial de servicios
   `…/Pensionistas/Servicios/34887/40968/1951` (rango 3, solo canal y
   formularios). La ficha del catálogo queda con la URL incorrecta; valorar
   corregirla.
3. **Slug distinto al del catálogo.** El encargo fija
   `benefitSlug: prestacion-cuidado-menores-cancer`, pero la ficha importada
   se llama `prestacion-cuidado-menor-enfermedad-grave`. Para pasar el gate G2
   sin renombrar nada del catálogo, el RuleSet va con `standalone: true`
   (tiene dos fuentes de rango 1). Decisión pendiente: alinear slugs
   (renombrar la ficha o el RuleSet) en una unidad posterior.

## Fuentes snapshotteadas (HTTP 200 el 05/10/2026)

| sourceId | URL | sha256 bytes | textSha256 |
|---|---|---|---|
| boe-lgss-prestacion-familia | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con | fa5a4efe… (ya existía, reutilizada) | 17cab0ec… |
| boe-rd-1148-2011-cancer | https://www.boe.es/eli/es/rd/2011/07/29/1148/con | 5c1d72ad0f44… | 41e6873bf787… |
| segss-cuidado-menor-cancer | https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Servicios/34887/40968/1951 | 25d27b9c73ad… | c740368e2935… |

Bytes en `F:\AgentState\datawardsmadrid\snapshots\<sha256>.html`; metadatos en
`data/eligibility/sources/<id>.json`. Snapshot reproducido a mano con Node
(misma normalización que `eligibility-snapshot.ts`) porque el encargo
prohibía `npm`; todos los `excerptSha256` verificados contra los `.txt`.

## prestacion-cuidado-menores-cancer (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener a tu cargo un hijo, hija o menor en guarda/acogimiento permanente menor de 18 años (extensión hasta 23/26 — ver ⚠) | `any`: dependents `count_where_gte` age<18; dependents `count_where_gte` age<26 | «cuidado de hijos o personas sujetas a guarda con fines de adopción o acogida con carácter permanente, menores de 18 años, afectados por cáncer u otra enfermedad grave» | LGSS Art. 190.1 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| **OBLIGATORIO**: Trabajar por cuenta ajena o propia, afiliada/o y en alta en un régimen de la Seguridad Social | employmentStatus `in` [asalariado, autonomo] | «las personas trabajadoras, por cuenta ajena y por cuenta propia y asimiladas… que reduzcan su jornada de trabajo en, al menos, un 50 por 100…, siempre que reúnan la condición general de estar afiliadas y en alta en algún régimen del sistema de la Seguridad Social» | RD 1148/2011 Art. 4.1 | https://www.boe.es/eli/es/rd/2011/07/29/1148/con |

**No comprobables con nuestras preguntas (⚠):**

- **Enfermedad grave acreditada** — cáncer (tumores malignos, melanomas y
  carcinomas) o enfermedad del listado del anexo del RD, con ingreso larga
  duración (incluido tratamiento/cuidado en domicilio tras hospitalización)
  y cuidado directo, continuo y permanente, mediante declaración del
  facultativo del SPS u órgano sanitario autonómico (Arts. 2–3 RD).
- **Reducción de jornada ≥ 50 %** con disminución proporcional del salario
  (Art. 4.1 RD; cómputo sobre jornada a tiempo completo comparable; en
  autónomos sobre 40 h/semana; no da derecho si la jornada parcial es ≤ 25 %).
- **Ambas personas progenitoras afiliadas y en alta** en la unidad familiar
  (o mutualidad de previsión obligatoria de colegio profesional, o Convenio
  Especial en país sin instrumento internacional; en monoparentales basta la
  de quien cuida) — Art. 4.2 RD.
- **Excepciones nulidad/separación/divorcio/extinción de pareja de hecho y
  violencia de género**: el derecho es de quien convive con la persona
  enferma aunque el otro no trabaje — Art. 4.4 RD.
- **Solo un beneficiario** aunque ambos tengan derecho (común acuerdo; si
  no, quien solicita primero; alternable por periodos ≥ 1 mes) — Art. 4.3 RD.
- **Periodos mínimos de cotización** según edad al iniciar la reducción:
  0 si <21; 90 días/7 años (o 180 vida laboral) si 21–25; 180 días/7 años
  (o 360) si ≥26 — Art. 5 RD.
- **Funcionarios excluidos**: se rigen por el EBEP art. 49.e) y sus
  mutualidades (MUFACE, ISFAS, MUGEJU), no por esta prestación — LGSS 191.4.
- **Duración y extensión de edad**: 1 mes + prórrogas de 2 y luego 4 meses
  con nueva declaración médica; máximo hasta los 23 años del causante, o 26
  con discapacidad ≥ 65 % — Art. 7.1 RD y LGSS 190.3/192.2.
- **Plazo para efectos plenos**: solicitar dentro de 3 meses del inicio de la
  reducción para cobrar desde el primer día; después, retroactividad máx.
  3 meses — Art. 7.1 RD.

- **Plazo**: permanente/rolling (prestación continua; el «plazo» real es la
  ventana de 3 meses para efectos desde el inicio).
- **Canal**: mutua colaboradora o INSS — online en el Portal de Prestaciones
  (https://prestaciones.seg-social.es/), presencial en CAISS con cita previa o
  correo ordinario a la Dirección Provincial (página seg-social.es, rango 3).
- **Importe**: `variable`, mensual — subsidio de devengo diario = 100 % de la
  base reguladora de IT (contingencias profesionales o comunes) × % de
  reducción de jornada — Art. 6.1 RD.
- **Doc**: solicitud modelo oficial (143115; modelo propio para el Mar) — Art. 9.1.
- **Doc**: certificado de empresa con fecha e inicio y % de reducción — Art. 9.2.a
  (condición: employmentStatus ≠ autonomo).
- **Doc**: autónomos: declaración propia de % de reducción sobre 40 h — Art. 9.2.a
  (condición: employmentStatus = autonomo).
- **Doc**: declaración médica del SPS/órgano sanitario autonómico — Art. 9.2.b.
- **Doc**: libro de familia / certificación registral / resolución judicial
  o administrativa de guarda-adopción-acogimiento — Art. 9.2.c.
- **Doc**: certificado de empresa de la base de cotización del mes previo
  (3 meses si tiempo parcial) — Art. 9.2.d (condición: ≠ autonomo).

OK / KO por requisito: ☐ ☐

## Decisiones de modelado y dudas para el revisor

1. **`persona-a-cargo` con doble rama (age<18 o age<26).** La prestación se
   mantiene hasta los 23 (o 26 con ≥ 65 % discapacidad) si la enfermedad se
   diagnosticó antes de los 18. Exigir `<18` produciría `no_cumple` falso en
   ese supuesto; `<26` solo sobreincluye y el veredicto queda capado en
   «posible» por los uncovered. Dirección fail-safe (UNKNOWN ≠ NO).
2. **`employmentStatus in [asalariado, autonomo]` excluye a funcionarios,
   docentes, investigadores y militares.** Fiel a LGSS 191.4 (funcionarios →
   EBEP 49.e)) y al `eligibilityFactors` de la ficha importada. El aviso
   `funcionarios-regimen-propio` queda visible. Riesgo: docente/investigador
   *laboral* (no funcionario) quedaría en F — caso borde, aceptable.
3. **Nada de cuantía fija**: `amount.type = variable` (no hay cifra: es 100 %
   de la base reguladora × % de reducción).
4. **`channel.url` = `https://prestaciones.seg-social.es/`** (Portal de
   Prestaciones, enlazado desde la propia página oficial de servicios).
   La fuente de rango 3 solo alimenta el canal, no requisitos.
5. **`standalone: true`** por la divergencia de slug descrita arriba.
6. **`themes: [familia_infancia, dependencia_discapacidad]`,
   `lifeEvents: [cuidar_familiar, discapacidad]`** según encargo.

## Golden `gp-cancer-padre-vallecas`

Padre 38 años, Villa de Vallecas (28079), hijo de 6 años con cáncer,
asalariado que reduce jornada al 50 %: requisitos comprobables T,
veredicto esperado **«posible»** (los decisivos — enfermedad acreditada,
reducción ≥ 50 %, alta de ambos progenitores, cotizaciones — son
incognoscibles con ≤ 10 preguntas), deadline **ROLLING**, sin blockers.
