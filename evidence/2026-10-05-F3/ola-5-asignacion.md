# Hoja de revisión — ola-5-apoyo-joven: asignación por hijo a cargo (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## asignacion-hijo-a-cargo (rulesVersion 1, verificado 2026-10-05)

**Asignación económica por hijo o menor acogido a cargo** — prestación
familiar de la Seguridad Social (modalidad no contributiva; LGSS RDL 8/2015,
Título VI, capítulo I, arts. 351–356; cuantías 2026 en RD 241/2026, art. 24).
Permanente, a instancia de parte; la reconoce el INSS o el régimen de SS del
progenitor incluido en él.

`standalone: true` — no existe ficha `asignacion-hijo-a-cargo` en
`data/catalog/benefits/` (la asignación solo se menciona de pasada en el
RuleSet `complemento-ayuda-infancia`, incompatibilidad DA 10.ª Ley 19/2021);
se acredita con tres fuentes de rango 1 propias (G2): LGSS consolidada + RD
241/2026 (cuantías/límites 2026) + Ley 19/2021 (DT 6.ª, cierre de la vía sin
discapacidad).

**Corrección del encargo**: el brief la describe como «prestación familiar
contributiva … para familias con rentas bajas». La norma consolidada dice
otra cosa: vive en el Título VI (**no contributivas**) y desde el 01/06/2020
(RDL 20/2020, recogido en la DT 6.ª de la Ley 19/2021) **no admite
solicitudes nuevas sin discapacidad o con discapacidad <33 %** — esa vía
quedó a extinguir y hoy su papel lo hace el IMV + complemento de ayuda para
la infancia (ya tenemos ambos RuleSets). Las familias con rentas bajas e
hijos sin discapacidad NO deben pasar esta puerta: el requisito hard exige
discapacidad del causante, y la historia completa queda en
`regimen-transitorio-extinguida`.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: tener a tu cargo un hijo o menor acogido con discapacidad reconocida (≥33 % si <18; ≥65 % si ≥18) — o ser tú el hijo mayor de 18 con discapacidad sin medida de apoyo a tu capacidad | `count_where_gte(dependents ≥1, where disability ∈ {yes, unknown, declined})` **o** `age ≥18 && disability eq "gte33"` | «Una asignación económica por cada hijo menor de dieciocho años de edad y afectado por una discapacidad en un grado igual o superior al 33 por ciento, o mayor de dicha edad cuando el grado de discapacidad sea igual o superior al 65 por ciento, a cargo del beneficiario…» | LGSS, art. 351.a | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **«A cargo» = convivir + depender económicamente del beneficiario; si el
  causante trabaja, sus rendimientos ≤ 100 % SMI anual (17.094 € en 2026)** —
  «que convivan y dependan económicamente del beneficiario… los ingresos por
  su trabajo no superen el 100% del SMI vigente» (seg-social, «Causantes»)
- **Residencia legal en territorio español del beneficiario y residencia del
  causante** — «Residan legalmente en territorio español.» (art. 352.1.a-b)
- **Ni padre ni madre con derecho a prestación equivalente en otro régimen
  público de protección social** — «No tengan derecho, ni el padre ni la
  madre, a prestaciones de esta misma naturaleza en cualquier otro régimen
  público de protección social.» (art. 352.1.c)
- **Grado exacto por baremo oficial: ≥33 % (<18) / ≥65 % (≥18); ≥75 % +
  necesidad de concurso da la cuantía superior** — «se determinarán mediante
  la aplicación del baremo aprobado por el Gobierno mediante real decreto.»
  (art. 354). Nuestro campo `dependents[].disability` solo tiene
  yes/no/unknown/declined — sin porcentaje.
- **Umbral de renta**: para solicitudes nuevas por hijo con discapacidad **no
  se exige límite de ingresos del beneficiario** («No se exige límite de
  ingresos para el reconocimiento de la condición de beneficiario por hijo o
  menor acogido a cargo con discapacidad.», ficha seg-social). El límite
  vigente 2026 — **15.356,00 €/año; 23.109,00 € si familia numerosa, +3.745,00
  € por hijo a partir del cuarto** — solo sigue aplicando al régimen
  transitorio sin discapacidad/<33 % (RD 241/2026, art. 24.2).
- **Vía sin discapacidad a extinguir (DT 6.ª Ley 19/2021)** — «no podrán
  presentarse nuevas solicitudes de la asignación económica por hijo o menor
  a cargo sin discapacidad o con discapacidad inferior al 33 por ciento del
  sistema de la Seguridad Social, que quedará a extinguir». Quien la cobraba
  la mantiene mientras concurran los requisitos; para solicitudes nuevas con
  rentas bajas el camino es IMV + complemento de ayuda para la infancia.
- **Beneficiarios especiales (art. 352.2)**: huérfanos absolutos (<18 con
  ≥33 % o mayores con ≥65 %), menores abandonados no acogidos y **hijos con
  discapacidad >18 sin medida de apoyo a su capacidad, que cobran la
  asignación que correspondería a sus padres** — por eso el requisito hard
  tiene una segunda vía `age ≥18 && disability "gte33"` para quien responde
  por sí mismo.
- **Separación/divorcio**: el percibo lo conserva quien tiene a los hijos a
  su cargo (art. 352.1.b, párrafo 2.º).
- **Gestión por régimen de afiliación**: la reconoce el INSS, pero si un
  progenitor está incluido en un régimen público de SS la asignación se
  reconoce por ese régimen (ficha seg-social, «Entidad competente»).
- **Efectos y obligaciones**: derecho desde el 1.er día del trimestre natural
  siguiente a la solicitud (art. 355.2.a); resolución máx. 45 días; el
  beneficiario comunica variaciones familiares al INSS en 30 días (ficha,
  «Plazos»).

- **Plazo**: permanente/rolling — sin convocatoria; cita de la ventana en
  art. 355.2.a LGSS (nacimiento del derecho por trimestre siguiente a la
  solicitud).
- **Canal**: INSS — solicitud y documentación en cualquier CAISS y online en
  el portal de prestaciones (`https://prestaciones.seg-social.es/`, HTTP
  200); online + presencial.
- **Importe 2026** (RD 241/2026, art. 24.1): rango anual 1.000,00 € (<18 con
  ≥33 %, abono semestral enero/julio) – 5.962,80 € (≥18 con ≥65 %, mensual a
  mes vencido) – 8.942,40 € (≥75 % + necesidad de concurso de otra persona).
  Exenta de IRPF (ficha). `amount.type: range`, `period: annual`.
- **Doc**: Solicitud en modelo oficial (ficha, «Impresos») (obligatorio)
- **Doc**: Documentos de identidad y de las circunstancias determinantes del
  derecho; no exigible acreditar lo que la Administración deba conocer por sí
  misma (ficha, «Documentación») (obligatorio)
- **Doc**: Acreditación del grado de discapacidad (resolución/certificado del
  IMSERSO u órgano autonómico; baremo oficial) (art. 354) (obligatorio)

OK / KO por requisito: ☐

### Notas para el verificador

- **Fuentes verificadas por HTTP 200 el 05/10/2026 (curl, GET):**
  `https://www.boe.es/eli/es/rdlg/2015/10/30/8/con` (snapshot previo, última
  actualización consolidada 03/10/2026),
  `https://www.boe.es/eli/es/rd/2026/03/25/241` (snapshot previo),
  `https://www.boe.es/eli/es/l/2021/12/20/19/con` (snapshot previo) y
  `https://www.seg-social.es/wps/portal/wss/internet/InformacionUtil/44539/44999/44850`
  (200; ficha «Asignación económica por hijo o menor acogido a cargo»,
  Información útil → Prestaciones familiares). Canal:
  `https://prestaciones.seg-social.es/` (200) y
  `https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/prestaciones`
  (200).
- **Snapshot nuevo**: `segss-asignacion-hijo-cargo` creado a mano replicando
  `eligibility-snapshot.ts` (no hay node_modules en este worktree — «sin
  npm»): bytes en
  `F:\AgentState\datawardsmadrid\snapshots\ae15a35dc2c47b342f4ab3aaca12788850ef6e7471c99122cbb48ed16c80a7e6.html`,
  `.txt` normalizado con el mismo `htmlToText`+`normalizeText` (código
  copiado literal del repo, `F:\Temp\datawardsmadrid-ola5-asignacion\toText.mjs`).
  La página contiene tokens volátiles: dos GET seguidos dan bytes distintos
  pero **el texto normalizado es idéntico** (`textSha256
  ebf34eed…b2535`, verificado con dos descargas). El propio `<id>.txt`
  **ES** el texto normalizado, así que la verificación G4 es estable.
  Nota: HEAD da 403 en seg-social.es (el GET da 200).
- **`excerptSha256` todos reales**: cada extracto verificado presente en el
  `.txt` de su fuente y hash `sha256(utf8(excerpt))` calculado con la misma
  réplica de `ruleset-fill-hashes.ts` (salida «excerptSha256 rellenados y
  verificados contra snapshots», 0 fallos, 17 citas).
- **Discrepancia resuelta en la ficha de seg-social**: el párrafo «Objeto»
  conserva la fórmula antigua «menor de 18 años o mayor afectado por una
  discapacidad ≥65 %», pero la misma ficha corrige a continuación: «A partir
  del 1 de junio de 2020 esta prestación solo podrá solicitarse por hijos a
  cargo acogidos menores de 18 años, afectados de una discapacidad de al
  menos un 33% o mayores afectados de una discapacidad del 65%». Manda la
  norma de rango 1 (art. 351.a + DT 6.ª Ley 19/2021): discapacidad exigible
  en ambas ramas.
- **Por qué `disability ∈ {yes, unknown, declined}` en el `where`**:
  convención de `madrid-titulo-familia-numerosa` — solo el «no» explícito
  descarta; «unknown»/«declined»/ausente cuentan como posibles (UNKNOWN ≠
  NO). El grado exacto (33/65/75 %) se delega a
  `grado-discapacidad-baremo` porque el perfil no guarda porcentaje. La
  segunda vía (`age ≥18 && disability "gte33"`) cubre el art. 352.2.c:
  hijos adultos con discapacidad que cobran la asignación que correspondería
  a sus padres.
- **`effortInputs.requiresCertificate: true`**: la solicitud telemática en
  sede/portal de prestaciones pide certificado o Cl@ve; presencial por CAISS
  no lo exige (estimación propia, no dato oficial — convención de otras
  olas).
- **Golden asociado**: `gp-asignacion-mostoles` — padre de 40 en Móstoles
  (28092), hijo de 9 con discapacidad «yes», ingresos 8.400–16.800 €.
  Trazado a mano: vía dependents T (1 ≥1), vía propia F ⇒ requisito hard T;
  0 hard F + 0 hard U + uncovered 10 ⇒ `posible`; `window.rolling` ⇒
  `ROLLING`; `blockers`/`missingFields` vacíos. Pendiente de ejecución con
  el motor cuando el integrador corra la validación completa.
- **Pendiente**: `ruleset-fill-hashes.ts` y `eligibility:validate` completos
  los corre el integrador (este worktree no tiene node_modules; «sin npm»).
