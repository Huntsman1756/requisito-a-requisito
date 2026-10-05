# Hoja de revisión — ola-5-pnc (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## pension-no-contributiva (rulesVersion 1, verificado 2026-10-05)

**Pensión no contributiva (PNC) de jubilación o invalidez/incapacidad** —
RDL 8/2015 (LGSS), arts. 363–372; RD 357/1991 y Orden PRE/3113/2009
(desarrollo); RD 241/2026, art. 21 (cuantía 2026). **Gestionada por la
Comunidad de Madrid** (servicios transferidos del IMSERSO; ficha 020101 de la
Cartera de Servicios Sociales, Orden 2372/2023): el reconocimiento lo hace la
Dirección General de Servicios Sociales e Integración y el pago la TGSS. Dos
trámites en la sede: **incapacidad (ref. 34369)** y **jubilación (ref.
34370)**. Permanente, a instancia de parte.

`standalone: true` — no existe ficha `pension-no-contributiva` en
`data/catalog/benefits/` (el universo la recoge como semilla estatal
`seed-7e23f16d8b`); se acredita con dos fuentes de rango 1 propias (G2): LGSS
consolidada (BOE) + Cartera de Servicios Sociales (BOCM), que contiene la
regulación y la ficha específica de la PNC en la CM.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Vivir en la Comunidad de Madrid (la gestión es autonómica: en otra CCAA la solicitas ante tu administración — la pensión existe en todo el Estado) | territory within_territory {"ccaa":"13"} | «Comunidad de Madrid, para los beneficiarios residentes en la misma. La prestación PNC abarca todo el territorio español» | Orden 2372/2023, ficha 020101 «Ámbito territorial de atención», pág. 127 | https://www.bocm.es/boletin/CM_Orden_BOCM/2023/08/01/BOCM-20230801-18.PDF |
| **OBLIGATORIO**: Tener 65 años o más (jubilación), o entre 18 y 64 con discapacidad o enfermedad crónica reconocida (incapacidad — exige ≥ 65 %; nuestra pregunta solo distingue ≥ 33 %, ver ⚠) | any: [age gte 65] \| all: [age gte 18, age lt 65, disability eq "gte33"] | «habiendo cumplido sesenta y cinco años de edad» (jub.) / «Estar afectadas por una discapacidad o por una enfermedad crónica, en un grado igual o superior al 65 por ciento» (incap.) | LGSS art. 369.1 y art. 363.1.a y c | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| **OBLIGATORIO**: Residir legalmente en España los 2 años seguidos e inmediatamente anteriores a la solicitud (el total exigido varía: 10 desde los 16 en jubilación, 5 en incapacidad — ver ⚠) | residenceMonths gte 24 | «dos deberán ser consecutivos e inmediatamente anteriores a la solicitud de la prestación» | LGSS art. 369.1 (en incapacidad, art. 363.1.b) | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **Carencia de rentas o ingresos suficientes**: ingresos anuales propios
  < importe anual de la pensión (8.803,20 € en 2026) y, en unidad económica,
  suma de todos los convivientes < límite de acumulación (pensión + 70 % por
  conviviente; ×2,5 con ascendientes/descendientes de 1.er grado) — «si
  convive con otras personas en una misma unidad económica, únicamente se
  entenderá cumplido el requisito de carencia de rentas o ingresos
  suficientes cuando la suma de los de todos los integrantes de aquella sea
  inferior al límite de acumulación de recursos» (LGSS art. 363.1.d, 363.2-5
  y 364.2-4)
- **No tener derecho a pensión contributiva** (vida laboral) — «aun cuando no
  hayan cotizado nunca o el tiempo suficiente para alcanzar las prestaciones
  contributivas del Sistema de Seguridad Social» (Orden 2372/2023, ficha
  020101 «Descripción»)
- **Grado de discapacidad real ≥ 65 % por baremo oficial** (solo incapacidad;
  ≥ 75 % + necesidad de otra persona ⇒ complemento del 50 %) — «se
  determinará mediante la aplicación de un baremo, aprobado por el Gobierno»
  (LGSS art. 367.1 y 364.6)
- **Total de años de residencia**: 10 entre los 16 y el devengo (jubilación)
  / 5 (incapacidad), en cualquier municipio español — «residan legalmente en
  territorio español y lo hayan hecho durante diez años entre la edad de
  dieciséis años y la edad de devengo de la pensión» (LGSS art. 369.1)
- **Residencia legal** (extranjeros/nacionalizados acreditan con certificado
  de la DG de la Policía, movimientos migratorios o pasaportes y certificado
  consular de no pensión) — «Residir legalmente en territorio español y
  haberlo hecho durante cinco años, de los cuales dos deberán ser
  inmediatamente anteriores a la fecha de solicitud de la pensión» (LGSS
  art. 363.1.b; en jubilación, art. 369.1)
- **Unidad económica de convivencia** (cónyuge o parientes por
  consanguinidad ≤ 2.º que convivan contigo): computa entera para el límite
  de recursos — «Existirá unidad económica en todos los casos de convivencia
  de un beneficiario con otras personas, sean o no beneficiarias, unidas con
  aquel por matrimonio o por lazos de parentesco de consanguinidad hasta el
  segundo grado» (LGSS art. 363.4)
- **Obligaciones del pensionista**: declaración anual de ingresos (la sede
  concreta: antes del 1 de abril) + comunicar cambios de
  convivencia/ingresos en 30 días — si no, suspensión preventiva del pago —
  «No cumplir con la obligación de presentar anualmente una declaración de
  renta o ingresos y de los de su unidad familiar de convivencia» (Orden
  2372/2023, ficha 020101 «Causas de suspensión», pág. 127)
- **Plazo de resolución: 90 días** — «Plazo de concesión 90 días» (ficha
  020101); la sede lo detalla «desde la entrada en registro»
- **Efectos**: día 1 del mes siguiente a la solicitud; cobro mensual a mes
  vencido + 2 pagas extra (junio y noviembre) — «se producirán a partir del
  día primero del mes siguiente a aquel en que se presente la solicitud»
  (LGSS art. 371; en incapacidad, art. 365)
- **Complemento de alquiler**: 525 €/año para pensionistas sin vivienda en
  propiedad que residan en alquiler (RD 1191/2012) — «tendrá un importe de
  525,00 euros anuales el complemento de pensión establecido en favor de la
  persona pensionista que acredite fehacientemente carecer de vivienda en
  propiedad» (RD 241/2026, art. 21.2)

- **Plazo**: permanente — «En plazo: permanente Referencia: 34370» (sede CM,
  ficha del trámite de jubilación; la de incapacidad, 34369, dice lo mismo)
- **Canal**: Comunidad de Madrid — Consejería de Familia, Juventud y Asuntos
  Sociales / DG de Servicios Sociales e Integración (gestión transferida;
  pago TGSS). Online con firma electrónica o presencial — «La tramitación de
  la solicitud puede realizarse por medios electrónicos o de forma
  presencial.» (sede 34369). URL de la tarjeta: página PNC de
  comunidad.madrid, que enlaza los dos trámites —
  https://www.comunidad.madrid/servicios/asuntos-sociales/pensiones-no-contributivas
- **Importe**: variable, mensual — la cuantía íntegra 2026 es 8.803,20 €/año
  («la cuantía de las pensiones de jubilación e incapacidad, en su modalidad
  no contributiva, queda establecida en 8.803,20 euros anuales», RD 241/2026
  art. 21.1), pero la individual se reduce según rentas y unidad económica
  (LGSS art. 364.2-4; mínimo del 25 %) y sube un 50 % con el complemento de
  gran invalidez — por eso `variable`, sin min/max
- **Doc**: Solicitud en el formulario oficial (online o PDF para presencial)
  (obligatorio)
- **Doc**: NIF/NIE en vigor del solicitante y del representante — lo consulta
  la CM salvo oposición (obligatorio)
- **Doc**: Padrón colectivo + declaración responsable de parentesco de cada
  conviviente (unidad económica; en Madrid capital no hace falta aportarlo)
  (obligatorio)
- **Doc**: Padrones históricos que acrediten la residencia exigida (10 años
  jubilación / 5 incapacidad; 2 inmediatamente anteriores) (obligatorio)
- **Doc**: Certificado del grado de discapacidad (consulta electrónica; si no
  está en vigor, sentencia de incapacitación judicial en grado absoluto) —
  condicionado a la vía de incapacidad (age < 65 ∧ disability = gte33)
- **Doc**: Acreditación de recursos propios y de la unidad no consultables
  por vía electrónica (nóminas, certificados de pensiones ajenos a la SS,
  becas…) (obligatorio)
- **Doc**: Solo extranjeros/nacionalizados: certificado DG Policía +
  movimientos migratorios o pasaportes + certificado consular de no pensión
- **Doc**: Acreditación de la representación legal (solo si firma un tercero)

OK / KO por requisito: ☐ ☐ ☐

### Notas para el verificador

- **Fuentes verificadas por HTTP 200 el 05/10/2026 (curl -s -o /dev/null -w
  "%{http_code}" -L):**
  `https://www.boe.es/eli/es/rdlg/2015/10/30/8/con` (200, LGSS consolidada),
  `https://www.boe.es/eli/es/rd/2026/03/25/241` (200),
  `https://www.bocm.es/boletin/CM_Orden_BOCM/2023/08/01/BOCM-20230801-18.PDF`
  (200),
  `https://sede.comunidad.madrid/prestacion-social/pension-no-contributiva-invalidez`
  (200, trámite 34369),
  `https://sede.comunidad.madrid/prestacion-social/pension-no-contributiva-jubilacion`
  (200, trámite 34370) y
  `https://www.comunidad.madrid/servicios/asuntos-sociales/pensiones-no-contributivas`
  (200, página de aterrizaje con enlaces a ambos trámites).
- **Snapshots nuevos creados SIN npm** (`sede-pnc-invalidez`,
  `sede-pnc-jubilacion`, `cm-pensiones-no-contributivas`): réplica exacta en
  Python de `eligibility-snapshot.ts` (mismo `htmlToText` +
  `normalizeText`): bytes descargados por HTTPS →
  `F:\AgentState\datawardsmadrid\snapshots\<sha256>.html`, `.txt` normalizado
  y `.json` de metadatos en `data/eligibility/sources/`. **Fidelidad
  comprobada**: la réplica regenera byte a byte el `.txt` y el `textSha256`
  de dos snapshots existentes (`sede-reconocimiento-dependencia` —
  textSha256 `7af6020b…` y `boe-rd-241-2026-pensiones` — `2cf1178a…`). Si el
  integrador prefiere, puede regenerarlos con `npm run eligibility:snapshot`
  y comparar (el `fetchedAt` es manual, lo demás es determinista).
- **`excerptSha256` todos reales**: cada extracto verificado presente en el
  `.txt` normalizado de su fuente y hash `sha256(normalizeText(excerpt))`
  computado con la misma normalización que
  `src/lib/eligibility-engine/text-normalize.ts` (réplica exacta en Python;
  mismos criterios que `scripts/ruleset-fill-hashes.ts`). Comprobación
  automatizada sobre el JSON final: 20 citas, 0 errores (extracto presente +
  sha + sourceId declarado + snapshot/meta-url + **G11: 0 citas de rango > 2
  en requirements/uncovered/amount** — las tres citas normativas que la sede
  sustentaba (residencia legal, declaración anual, complemento alquiler) se
  re-anclaron a rango 1: LGSS 363.1.b, ficha 020101 y RD 241/2026 art. 21.2;
  la sede queda solo en window/channel/documents, que es su papel según
  G11).
- **LGSS se reutiliza como `boe-lgss-prestacion-familia`** (misma convención
  que olas 1–4: un único snapshot del texto consolidado; el `title` indica
  los arts. 363–372 para esta ficha). La Cartera BOCM se reutiliza como
  `bocm-20230801-18-cartera-ss` (ficha 020101).
- **`reside-cm` hard**: la PNC existe en todo el Estado, pero el
  reconocimiento y el trámite que describe esta tarjeta son los de la CM
  (transferencia de servicios; ficha 020101 y refs. 34369/34370). Mismo
  criterio que `empadronado-cm` de `prestacion-cuidador-no-profesional`: el
  label dice que en otra CCAA se pide ante su administración. El extracto de
  la ficha («La prestación PNC abarca todo el territorio español») deja claro
  que es un alcance de gestión, no una exclusión del derecho.
- **`residencia-espana-2y` hard con `residenceMonths ≥ 24`**, siguiendo el
  precedente `residencia-espana-1a` del IMV (misma pregunta
  `residenceSince`, mismo proxy de empadronamiento ≈ residencia en España).
  Ojo: la norma cuenta residencia en **cualquier** municipio español, no solo
  el actual — un F aquí puede ser falso negativo para quien se mudó hace < 2
  años; va explicitado en el label y el total de años queda en ⚠. Si el
  verificador lo ve débil, bajar a `hard: false` (aviso) como en
  `residencia-espana-5y2` de cuidadores es admisible sin tocar nada más.
- **`edad-65-o-discapacidad` hard con `any`** (patrón Catala, docs/07 §2.3):
  la vía de jubilación no exige discapacidad y la de incapacidad exige
  18–64 + discapacidad declarada. La pregunta `q-disability` solo distingue
  ≥ 33 %, así que el umbral legal real (≥ 65 %) queda en ⚠
  `grado-discapacidad-65` — un `gte33` no acredita el 65 % pero tampoco lo
  descarta (UNKNOWN ≠ NO); `lt33`/`no` sí excluye la vía de incapacidad.
  `timeDependent: increasing` en ambos requisitos de edad/residencia.
- **`carencia-rentas` en uncovered** (encargo): la prueba de renta es triple
  (rentas propias < pensión; suma de la unidad < límite; rendimientos de
  bienes computables por IRPF) y nuestra banda de ingresos es personal y
  gruesa. Alternativa si el verificador la prefiere: un requisito **soft**
  `incomeAnnual lt 8803.2` al estilo `ingresos-inferiores-renta-garantizada`
  del IMV (banda 0–8.400 ⇒ T; 8.400–16.800 ⇒ U; ≥ 25.200 ⇒ aviso F), sin que
  cambie el veredicto. Se deja decidido al verificador.
- **`amount: variable + monthly`** sin cifras en el objeto: la íntegra
  (8.803,20 €/año en 2026, art. 21.1 RD 241/2026) va en el extracto; la
  cuantía individual se minora por rentas (mín. 25 %) y puede subir +50 %
  (gran invalidez) o +525 €/año (alquiler) — min/max fijos falsearían.
  `period: monthly` por la ficha («Periodicidad Mensual, con dos pagas
  extraordinarias»).
- **Extractos con artefactos de PDF evitados**: la ficha 020101 tiene bullets
  `\x02` en el texto pdfjs (p. ej. `Modalidades \x02 Invalidez`); se eligieron
  spans limpios. En las sedes, comillas tipográficas normalizadas a rectas.
- **Golden asociado**: `gp-pnc-carabanchel` — mujer de 69 años, Carabanchel
  (28079), empadronada desde 06/1995, jubilada sin cotización suficiente,
  disability «no», banda 0–8.400 €. Trazado a mano a 2026-10-05: territory
  28079 ⊂ CM ⇒ T hard; age ≥ 65 ⇒ T hard por vía jubilación (2.ª vía F, any
  ⇒ T); residenceMonths ≈ 376 ≥ 24 ⇒ T hard; 0 hard F + 0 hard U + uncovered
  > 0 ⇒ `posible`; rolling ⇒ `ROLLING`; `blockers` [], `missingFields` [].
  Pendiente de ejecución con el motor cuando el integrador corra la
  validación completa.
- **Ambigüedad documentada** (misma familia que otras olas): el sujeto de la
  PNC es quien responde — si alguien consulta «por un familiar», nuestras
  preguntas describen al respondente; la tarjeta resultante describe a quien
  responde, no al familiar. Decisión de catálogo, no de esta regla.
