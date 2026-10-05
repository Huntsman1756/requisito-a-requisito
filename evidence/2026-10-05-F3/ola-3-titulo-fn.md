# Hoja de revisión — ola 3: título oficial de familia numerosa (CM)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-titulo-familia-numerosa (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `madrid-titulo-familia-numerosa` en
`data/catalog/benefits/` (la ficha cercana `madrid-beneficios-familias-numerosas`
es un hub de beneficios, no este trámite); G2 se satisface con fuentes de rango 1
propias (Ley 40/2003 + RD 1621/2005 en BOE; Decretos 141/2014 y 30/2023 en BOCM).

### Hallazgos frente al encargo

- **Edad de los hijos: 21 / 25, no 21 / 26.** El encargo decía «menores de
  21/26», pero el texto consolidado de la Ley 40/2003 (BOE, última
  actualización 09/05/2023; comprobado también en vivo) dice literalmente
  «menores de 21 años de edad» y «se ampliará hasta los 25 años de edad, cuando
  cursen estudios» (art. 3.1.a); el RD 1621/2005 dice «hasta los 25 años
  incluidos» (art. 1.1.a). Los **26 años** existen en la norma, pero como
  *vigencia máxima del título* en la CM (Decreto 30/2023, nuevo art. 10.1.a:
  «hasta que el último de los hijos cumpla los 26»), no como límite de
  cómputo. Se ha modelado el umbral real (`age lte 25`) y la vigencia hasta
  los 26 queda documentada en `uncoveredRequirements` (vigencia-titulo).
- **≥2 hijos como suelo, no ≥3.** Con `count >= 3` como requisito hard se
  excluiría falsamente a supuestos equiparados reales (viudo/a con 2 hijos,
  hermanos huérfanos, 2 hijos con discapacidad…). Se modela: suelo hard de
  `count_where_gte(2)` + hard de cómputo por edad/discapacidad + aviso soft
  «caso general = 3 o más» con vía alternativa «2 computables y al menos uno
  con discapacidad confirmada». El resto de equiparaciones (viudedad,
  orfandad, ascendientes discapacitados ≥65 %, progenitor no custodio) no es
  comprobable con nuestras preguntas y va a `uncovered` — UNKNOWN ≠ NO.
- **`dependents.disability` es un literal** (`yes|no|unknown|declined`), no un
  estado: en la subcondición de `edad-hijos` se cuentan como potencialmente
  computables los hijos con `yes`, `unknown` o `declined` a cualquier edad
  (no podemos excluirlos sin saberlo), mientras que la vía de equiparación
  del aviso soft exige `eq "yes"` (confirmada) para no avisar de más.
- **«Empadronamiento CM»** se modela como `within_territory { ccaa: "13" }`
  (la ley exige *residencia* del solicitante en la CM; el empadronamiento
  ≤3 meses de todos los miembros es documento obligatorio, art. 6.2.c del
  Decreto 141/2014). No hay duración mínima de empadronamiento.
- **Citations del Decreto 141/2014** se toman del texto originario
  (BOCM-20141230-10) solo en artículos **no tocados** por el Decreto 30/2023
  (que modificó art. 6.3, 7, 8, 9 y 10). Lo modificado (presentación, lista
  6.3 vigente, vigencia) se cita del propio Decreto 30/2023
  (BOCM-20230413-25), que recoge la nueva redacción literal.
- **Sin tasa**: la sede marca «No requiere pago de tasas» y «En plazo:
  permanente»; el antiguo justificante de tasa (art. 6.2.g originario) no se
  lista como documento.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Residir en la Comunidad de Madrid | `territory` within_territory { ccaa: "13" } | «Corresponde a la comunidad autónoma de residencia del solicitante la competencia para el reconocimiento de la condición de familia numerosa» | Art. 5.2 | https://www.boe.es/eli/es/l/2003/11/18/40/con |
| **OBLIGATORIO**: Al menos 2 hijos a cargo | `dependents` count_where_gte ≥ 2 (cuenta total) | «Uno o dos ascendientes con dos hijos, sean o no comunes, siempre que al menos uno de éstos sea discapacitado o esté incapacitado para trabajar» | Art. 2.2.a | https://www.boe.es/eli/es/l/2003/11/18/40/con |
| **OBLIGATORIO**: Al menos 2 hijos en edad de computar (≤25, o cualquier edad con discapacidad/incapacidad) | `dependents` count_where_gte ≥ 2, where (edad ≤ 25) OR (discapacidad ∈ yes/unknown/declined) | «Ser solteros y menores de 21 años de edad, o ser discapacitados o estar incapacitados para trabajar, cualquiera que fuese su edad» | Art. 3.1.a | https://www.boe.es/eli/es/l/2003/11/18/40/con |
| aviso: caso general = 3 o más hijos computables; con 2 solo por equiparación | any[ ≥3 computables, all[ ≥2 computables, ≥1 con discapacidad "yes" ] ] | «se entiende por familia numerosa la integrada por uno o dos ascendientes con tres o más hijos, sean o no comunes» | Art. 2.1 | https://www.boe.es/eli/es/l/2003/11/18/40/con |

**No comprobables con nuestras preguntas (⚠):**

- **Equiparaciones con 2 hijos** (detalle completo): hijo discapacitado/incapacitado; los dos ascendientes discapacitados o uno ≥65 % o incapacitados; progenitor fallecido; hermanos huérfanos — «Se equiparan a familia numerosa, a los efectos de esta ley, las familias constituidas por» (art. 2.2)
- **Viudedad con 2 hijos** — «El padre o la madre con dos hijos, cuando haya fallecido el otro progenitor» (art. 2.2)
- **Soltería de los hijos** — «Ser solteros y menores de 21 años de edad» (art. 3.1.a)
- **Convivencia** (salvo separación transitoria por estudios, trabajo, tratamiento médico…) — «Convivir con el ascendiente o ascendientes» (art. 3.1.b)
- **Dependencia económica**: ingresos anuales del hijo ≤ SMI (con reglas especiales por incapacidad, un único ascendiente no en activo, ascendientes jubilados/>65/incapacitados) — «El hijo obtenga unos ingresos no superiores, en cómputo anual, al salario mínimo interprofesional vigente, incluidas las pagas extraordinarias» (art. 3.1.c.1.º)
- **Hijos de 21 a 25 solo si estudian** — «cuando cursen estudios que se consideren adecuados a su edad y titulación o encaminados a la obtención de un puesto de trabajo» (art. 3.1.a, párrafo 2.º)
- **Nacionalidad/residencia** — «Los miembros de la unidad familiar deberán ser españoles o nacionales de un Estado miembro de la Unión Europea» (art. 3.2)
- **Prohibido el doble cómputo** — «Nadie podrá ser computado, a los efectos de esta ley, en dos unidades familiares al mismo tiempo» (art. 3.3)
- **Categoría general/especial** la fija la administración (5+ hijos; 4 con parto/adopción/acogimiento múltiple; 4 con renta per cápita ≤75 % SMI; cada hijo con discapacidad computa por 2) — art. 4
- **Vigencia del título** en la CM hasta que el último hijo cumpla 26 años si se mantienen los requisitos; obligación de comunicar variaciones en 3 meses — «El cumplimiento de los veintiséis años de edad del último de los hijos» (Decreto 30/2023, nuevo art. 10.1.a)

- **Plazo**: permanente/rolling — «En plazo: permanente» (ficha de la sede CM)
- **Canal**: Comunidad de Madrid — Consejería de Familia, Juventud y Asuntos
  Sociales (DG de Infancia, Familia y Fomento de la Natalidad). Electrónico
  (sede, firma electrónica reconocida) o presencial (registros art. 16.4 Ley
  39/2015): «Las solicitudes podrán presentarse electrónicamente por registro
  electrónico a través de la sede electrónica de la Comunidad de Madrid o
  presencialmente» (Decreto 30/2023, nuevo art. 7.1). Plazo de expedición
  3 meses con silencio estimatorio (art. 9 nuevo).
- **Importe**: `null` — el título es una acreditación gratuita («No requiere
  pago de tasas»), no una cuantía.
- **Doc (obligatoria)**: solicitud Anexo I; libro de familia; DNI de los
  mayores de 14 (la CM lo consulta si autorizas); volante de empadronamiento
  ≤3 meses de todos los miembros.
- **Doc (condicional)**: discapacidad (condición modelada: ≥1 dependiente con
  disability ∈ yes/unknown/declined); certificado de estudios para hijos
  21–25 (condición modelada: age between [21,25]); defunción;
  separación/divorcio + medidas paternofiliales; tutela/guarda/acogimiento;
  residencia legal (no comunitarios); certificaciones de rentas (dependencia
  económica / categoría especial).

OK / KO por requisito: ☐ ☐ ☐ ☐

## Fuentes (HTTP 200 verificadas, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| boe-ley-40-2003-fn | 1 | https://www.boe.es/eli/es/l/2003/11/18/40/con | 200 | a51427181acb… |
| boe-rd-1621-2005-reglamento-fn | 1 | https://www.boe.es/eli/es/rd/2005/12/30/1621/con | 200 | 0482d9b06a21… |
| bocm-20141230-10-decreto-141-fn | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2014/12/30/BOCM-20141230-10.PDF | 200 | 7b06960acd20… |
| bocm-20230413-25-decreto-30-fn | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2023/04/13/BOCM-20230413-25.PDF | 200 | e88daef4f40f… |
| sede-titulo-familia-numerosa | 3 | https://sede.comunidad.madrid/autorizaciones-licencias-permisos-carnes/titulo-familia-numerosa | 200 | 1beb5fdbcbbc… |

Notas: la versión consolidada del Decreto 141/2014 en `bocm.es/eli/…/con` es una
app JS (Atlas) que no expone el texto en el HTML inicial; se citan el PDF
originario del BOCM (2014) para los artículos no modificados y el PDF del
Decreto 30/2023 para la redacción vigente de los modificados. Snapshot bytes en
`F:\AgentState\datawardsmadrid\snapshots\`; texto normalizado commiteado en
`data/eligibility/sources/`.

## Decisiones

1. **`standalone: true`**: sin ficha en `data/catalog/benefits/`; rango 1
   propio (Ley 40/2003 + RD 1621/2005 + Decretos CM).
2. **Umbral de edad real: 21 general / 25 estudiantes** (no 21/26 del
   encargo); 26 es la vigencia máxima del título en la CM, documentada en ⚠.
   Condición `age lte 25` (incluido), que coincide con ambas lecturas.
3. **Suelo hard de 2 dependientes** (no 3) para no excluir equiparaciones
   (UNKNOWN ≠ NO); el «3 o más» del caso general es requisito **soft** con
   vía alternativa «2 computables + ≥1 con discapacidad confirmada».
4. **Cómputo por edad/discapacidad** en una sola subcondición
   `any[age lte 25, disability in (yes,unknown,declined)]`: los valores
   `unknown`/`declined` cuentan como potencialmente computables porque un
   hijo adulto con discapacidad computa a cualquier edad y no podemos
   descartarlo (asimetría ADR-017).
5. **Documentos con `condition`**: discapacidad y certificado de estudios
   solo se muestran cuando el perfil puede necesitarlos; el filtro del motor
   conserva los documentos cuya condición no evalúa F (U incluida).
6. **`amount: null`**: el trámite es una acreditación gratuita, no una
   cuantía («No requiere pago de tasas», ficha sede).
7. **`excerptSha256` reales** calculados como sha256 UTF-8 del extracto
   (equivalente a `ruleset-fill-hashes.ts`); los 26 extractos verificados
   presentes en su `.txt` y hash comprobado (equivalente G4). Ningún «FILL».
8. **Snapshots sin npm**: bytes con curl (HTTP 200), sha256 con `sha256sum`,
   texto con `pdftotext -enc UTF-8` (BOCM) o réplica exacta de
   `htmlToText`/`normalizeText` (sede HTML); misma normalización que
   `eligibility-snapshot.ts` (NFC, comillas, guiones de corte, blancos).
   PDFs extraídos con pdftotext en vez de pdfjs-dist: extractos de prosa
   continua, sin tablas.
9. **Dominio `gestiona.comunidad.madrid` no añadido al registry**: solo se
   citan `bocm.es` (rango 1) y `sede.comunidad.madrid` (rango 3), ambos ya
   registrados.

## Notas para el verificador independiente

- Recalcular `sha256` UTF-8 de cada `excerpt` y comprobar inclusión literal
  en `<sourceId>.txt` (26 citas; comprobado con script en
  `F:\Temp\datawardsmadrid-titulo-fn\`).
- Comprobar en la Ley consolidada que el límite para estudiantes es «25
  años», y en el Decreto 30/2023 (art. 10.1.a nuevo) que la vigencia del
  título llega a los 26 del último hijo.
- Pendiente de revisión humana: `humanReview.status = pending` y
  `review.status = pending` en el golden.
- Golden `gp-titulo-fn-vallecas`: espera `posible` + `ROLLING` (residencia,
  ≥2 hijos y edad = T hard; vía general 3+ = T soft; 9 ⚠ no comprobables).
- No se ha ejecutado `npm run eligibility:validate` ni tests (encargo «sin
  npm»); validación prevista en el gate de la ola.
