# Hoja de revisión — ola-6-orfandad (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## pension-orfandad (rulesVersion 1, verificado 2026-10-05)

**Pensión de orfandad** — RDL 8/2015 (LGSS), arts. 217, 219.1 (2.º párrafo),
224 y 225 (derecho y beneficiarios) y 229–230 (límite e imprescriptibilidad);
Decreto 3158/1966, arts. 36–38 (cuantía e incrementos por orfandad absoluta);
RD 241/2026, anexo I (cuantías mínimas 2026). Gestionada por el **INSS**
(ISM en el Régimen Especial del Mar). Permanente: el derecho de reconocimiento
es imprescriptible, con efectos retroactivos de hasta 3 meses desde la
solicitud (LGSS art. 230). La prestación de orfandad por violencia contra la
mujer (art. 224.1, tercer párrafo) es una prestación distinta citada como ⚠.

`standalone: true` — no existe ficha `pension-orfandad` en
`data/catalog/benefits/`; se acredita con fuentes de rango 1 propias (G2):
LGSS consolidada (BOE), Decreto 3158/1966 (BOE) y RD 241/2026 (BOE).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **SOFT (aviso, nunca excluye)**: edad del huérfano en la fecha del fallecimiento — < 21 en general o incapacitado para el trabajo sin límite; hasta 25 si no trabaja o gana < SMI anual (prórroga al inicio del siguiente curso si cumple 25 durante el curso) | any: [age lt 25] \| [disability neq "no"] \| [≥1 persona a cargo con age lt 25 o disability "yes"] | «siempre que, en el momento de la muerte, sean menores de veintiún años o estén incapacitados para el trabajo» | LGSS art. 224.1 y 224.3 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **Filiación con el causante** — ser hijo/a del fallecido «cualquiera que sea
  la naturaleza de su filiación» (LGSS art. 224.1). La página oficial del INSS
  añade los hijos del cónyuge superviviente aportados al matrimonio (matrimonio
  ≥ 2 años antes del fallecimiento, convivencia a sus expensas, sin derecho a
  otra pensión ni familiares obligados a alimentarlos) — no citado en la regla
  porque solo figura en rango 3.
- **Situación del causante** — en alta o asimilada al alta al fallecer, o
  pensionista de jubilación/incapacidad permanente (LGSS art. 224.1, remite a
  217.1.c).
- **Cotización del causante** — por remisión al 2.º párrafo del art. 219.1:
  500 días en los 5 años anteriores si estaba en alta o asimilada; 15 años si
  no lo estaba; nada si la muerte fue por accidente (sea o no de trabajo) o
  enfermedad profesional.
- **Tramo 21–24 años** — solo si no trabaja por cuenta ajena o propia, o con
  ingresos < SMI anual; nuestra banda de ingresos (corte en 16.800 €) no decide
  el umbral SMI 2026 (17.094 €) y no preguntamos trabajo del huérfano menor
  de edad ni la fecha del fallecimiento.
- **Quién solicita** — si el huérfano es menor, pide y cobra quien lo tenga a
  su cargo (LGSS art. 224.4); nuestro cuestionario describe al respondente.
- **Orfandad absoluta** — sin progenitor superviviente (asimilado: un solo
  progenitor conocido): la pensión se incrementa con la cuantía de viudedad
  que correspondería (+52 % de la base reguladora si no hay beneficiario de
  viudedad), repartida entre huérfanos (Decreto 3158/1966, art. 38).
- **Prestación de orfandad por violencia contra la mujer** — 70 % de la base
  reguladora con límite de rendimientos de la unidad del 75 % del SMI cuando no
  se reúnen los requisitos de la pensión (LGSS art. 224.1, tercer párrafo).
- **Compatibilidad con el trabajo del huérfano** — cualquier renta < 21 años o
  incapacitado; entre 21 y 25 exige ingresos < 100 % del SMI anual (LGSS art.
  225.1 con la condición del 224.3; la suspensión por superar el SMI figura en
  la página oficial de compatibilidades, rango 3).
- **Complemento a mínimos** — mínimos 2026: 4.011,00 €/año por beneficiario;
  7.882,00 €/año si < 18 con discapacidad ≥ 65 %; en orfandad absoluta el
  mínimo se incrementa en 9.931,60 €/año repartidos entre beneficiarios (RD
  241/2026, anexo I).
- **Límite conjunto** — la suma de pensiones de muerte y supervivencia ≤ 100 %
  de la base reguladora; las de orfandad tienen preferencia (LGSS art. 229).

- **Plazo**: permanente/imprescriptible — «El derecho al reconocimiento de las
  prestaciones por muerte y supervivencia, con excepción del auxilio por
  defunción, será imprescriptible…» (LGSS art. 230). Efectos: día siguiente al
  fallecimiento si se pide en 3 meses; retroactividad máxima 3 meses.
- **Canal**: INSS en general, ISM en el Régimen Especial del Mar — «Gestión: El
  Instituto Nacional de la Seguridad Social (INSS), con carácter general.»
  (página común de muerte y supervivencia). Online en la sede electrónica
  (sede.seg-social.gob.es) y presencial.
- **Importe**: `variable`, `monthly` — 20 % de la base reguladora por huérfano
  (Decreto 3158/1966, art. 36.1); orfandad absoluta +52 %; indemnización
  especial de 1 mensualidad de la base reguladora si el fallecimiento fue por
  AT/EP (art. 37). Pago mensual con 2 extras (junio y noviembre). Sin min/max
  en el objeto: el resultado depende de la base reguladora, los incrementos y
  los complementos a mínimos.
- **Doc**: Solicitud en el modelo oficial (obligatorio)
- **Doc**: Identidad del solicitante/representante/personas de la solicitud
  (obligatorio)
- **Doc**: Certificación del acta de defunción del causante (obligatorio)
- **Doc**: Libro de familia o actas de nacimiento que acrediten la filiación
  (obligatorio)
- **Doc**: Acta de defunción del otro cónyuge — solo orfandad absoluta
- **Doc**: Resguardo de matriculación en centro oficial — solo huérfanos
  estudiantes de 24 o más años
- **Doc**: Documentos de la circunstancia de violencia contra la mujer — solo
  si aplica (sentencia firme, resolución judicial o informe del Fiscal)
- **Doc**: Certificado del Registro Central de Extranjeros o TIE — solo
  extranjeros residentes (posible prestación de orfandad)

OK / KO por requisito: ☐

### Notas para el verificador

- **Correcciones al encargo** («el encargo es una pista, no una verdad»):
  - El encargo decía «sin límite con discapacidad ≥ 75 % si muerte posterior a
    18». El art. 224.1 LGSS dice «incapacitados para el trabajo» **sin límite
    de edad y sin umbral de porcentaje**; la página oficial de beneficiarios lo
    precisa como «reducida su capacidad de trabajo en un porcentaje valorado en
    grado de incapacidad permanente absoluta o gran incapacidad» (rango 3). La
    discapacidad ≥ 33 % solo aparece como condición para ampliar la edad a 25
    años (junto a orfandad absoluta y la condición de no trabajar/ganar < SMI).
    No se encontró el «75 %» ni el «muerte posterior a 18» en las fuentes
    citadas: no entra en la regla.
  - El encargo decía «huérfano absoluto con incremento 70 %». El **70 % es la
    cuantía de la prestación de orfandad por violencia contra la mujer** (art.
    224.1, tercer párrafo), no de la pensión. En la pensión, la orfandad
    absoluta incrementa el 20 % con la cuantía de viudedad que correspondería
    (+52 % si no hay beneficiario de viudedad), repartida entre huérfanos
    (Decreto 3158/1966, art. 38.1.º).
  - El encargo decía «arts. 224-225»: el derecho y beneficiarios están en el
    224 (4 apartados) y la compatibilidad en el 225; la imprescriptibilidad es
    el art. 230 y el límite conjunto el 229. El decreto de cuantía es el
    3158/1966, arts. 36–38.
- **`edad-en-fallecimiento` es `hard: false`** (aviso): la norma mide la edad
  **en la fecha del fallecimiento**, que no preguntamos, y un huérfano que ya
  pasó el límite puede conservar casos residuales (p. ej. solicitud tardía con
  derecho en el hecho causante: la sede prevé un pago único de hasta 12
  mensualidades — solo rango 3, por eso va en la hoja y no en la regla). Un
  hard F sería un falso negativo posible ⇒ nunca se excluye por edad.
  `timeDependent: decreasing`: el paso del tiempo convierte T en F.
- **Ramas de la condición soft**: `age < 25` (respondente huérfano dentro del
  límite ampliable), `disability ≠ no` (posible incapacitado sin límite; la
  banda ≥ 33 % no equivale a IPA/GI, pero UNKNOWN ≠ NO) y `≥ 1 dependiente
  < 25 o con discapacidad` (el respondente puede ser quien tiene a cargo a un
  huérfano menor — art. 224.4). El requisito solo queda F si nada de eso
  encaja.
- **Sin requisito de territorio**: es una pensión estatal gestionada por el
  INSS/ISM; mismo criterio que `pension-viudedad` (ola 5).
- **Cobertura del catálogo de preguntas**: la orfandad casi no es evaluable con
  nuestras 10 preguntas (no hay fallecimiento de progenitor, filiación, ni
  cotización del causante) ⇒ todas las condiciones decisivas están en
  `uncoveredRequirements` y el veredicto máximo es `posible`. Diseño a propósito
  (UNKNOWN ≠ NO); si el verificador prefiere eliminar la soft por "ruido", el
  resto de la regla no cambia.
- **Fuentes verificadas por HTTP 200:** snapshots previos del 05/10/2026 —
  `https://www.boe.es/eli/es/rdlg/2015/10/30/8/con` (LGSS),
  `https://www.boe.es/eli/es/d/1966/12/23/3158/con` (Decreto 3158/1966),
  `https://www.boe.es/eli/es/rd/2026/03/25/241` (RD 241/2026) — y las siete
  páginas de seg-social.es descargadas con respuesta 200 el 06/10/2026 UTC
  (`fetchedAt` de cada `.json`; bytes en
  `F:\AgentState\datawardsmadrid\snapshots\<sha>.html`).
- **Snapshots nuevos creados SIN npm** (réplica exacta en Python de
  `eligibility-snapshot.ts`, mismo `htmlToText` + `normalizeText`; fidelidad
  comprobada regenerando byte a byte el `.txt` y `textSha256` de
  `segss-viudedad-beneficiarios`, `segss-viudedad-solicitud` y
  `boe-rd-241-2026-pensiones`):
  `segss-orfandad-beneficiarios` (28522), `segss-orfandad-cuantia` (28523),
  `segss-orfandad-compatibilidad` (28528), `segss-orfandad-extincion` (28530),
  `segss-orfandad-solicitud`, `segss-orfandad-gestion` y `segss-orfandad-efectos`
  (rango 3, dominio registrado). Si el integrador prefiere, puede regenerarlos
  con `npm run eligibility:snapshot` y comparar (solo `fetchedAt` es manual).
- **Páginas compartidas de muerte y supervivencia**: «Hecho causante / Efectos
  económicos» (28489/28493), «Gestión / Pago» (28489/29611) y «Solicitudes»
  (28489/28498) son enlazadas tal cual desde el menú de la página de orfandad
  (28520); su breadcrumb dice «Pensión de viudedad» porque el INSS comparte la
  página. `segss-orfandad-solicitud` reproduce el mismo texto normalizado que
  `segss-viudedad-solicitud` (textSha256 `31359bf3…`).
- **`boe-decreto-3158-1966-orfandad`** es un alias del mismo snapshot que
  `boe-decreto-3158-1966-viudedad` (idénticos bytes, sha256 `581789c6…`,
  textSha256 `25fb3604…` y `fetchedAt` heredado): el Decreto regula la cuantía
  de TODAS las prestaciones del Régimen General; la sección 4.ª (arts. 36–38)
  cubre orfandad. El alias evita citas con sourceId «…-viudedad» dentro de la
  regla de orfandad.
- **Snapshots capturados pero no declarados en `sources`** (la G11 no permite
  citarlos en requisitos/importes): beneficiarios, cuantía, compatibilidades,
  extinción y efectos. Sirven de material de revisión — el verificador puede
  contrastar contra ellos — y quedan como pistas (p. ej. documentación del
  límite 100 % SMI del tramo 21–25, la extinción por matrimonio/adopción y la
  regla de las 12 mensualidades).
- **`excerptSha256` todos reales**: cada extracto está presente en el `.txt`
  normalizado de su fuente y el sha se calculó con la misma normalización que
  `text-normalize.ts` (réplica en Python de `ruleset-fill-hashes.ts`).
  Comprobación automatizada sobre el JSON final: **22 citas, 0 errores**
  (extracto presente + sha cuadra + sourceId declarado) y **G11: 0 citas de
  rango > 2** en `requirements`/`uncoveredRequirements`/`amount`.
- **Goldens asociados** (3, trazados a mano a 2026-10-05):
  - `gp-orfandad-getafe`: huérfana estudiante de 19 años → soft T por edad,
    uncovered > 0 ⇒ `posible` / `ROLLING`.
  - `gp-orfandad-madre-mostoles`: madre de 43 con hijo de 14 a cargo → soft T
    por la rama de dependientes (ella pediría la pensión del menor) ⇒ `posible`.
  - `gp-orfandad-trabajador-parla`: 30 años, discapacidad «no», dependientes
    sin responder ⇒ soft U (ni el aviso se afirma: UNKNOWN ≠ NO) ⇒ `posible`.
  Pendientes de ejecución con el motor cuando el integrador corra la validación
  completa.
- **Ambigüedad documentada** (misma familia que otras olas): el sujeto de la
  pensión es el huérfano; quien responde puede ser el propio huérfano mayor o
  quien tiene a cargo al menor. Las preguntas describen al respondente; la
  rama de `dependents` de la soft cubre el caso del guardador.
