# Hoja de revisión — ola-4-cuidadores (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## prestacion-cuidador-no-profesional (rulesVersion 1, verificado 2026-10-05)

**Prestación económica para cuidados en el entorno familiar y apoyo a
cuidadores no profesionales (PECF)** — Ley 39/2006, arts. 14.4 y 18–20;
Decreto 54/2015 (CM), arts. 41–47. Prestación **excepcional**: la reconoce el
órgano de dependencia, a propuesta de los servicios sociales de Atención
Social Primaria, cuando el PIA la determina como modalidad más adecuada y no
existe un servicio más adecuado. La solicita la persona dependiente (o su
representante); la persona cuidadora cotiza a la Seguridad Social (convenio
especial). `standalone: true` — no existe ficha
`prestacion-cuidador-no-profesional` en `data/catalog/benefits/` (solo la
ficha genérica `prestaciones-dependencia-saad` menciona esta modalidad entre
sus ⚠); se acredita con dos fuentes de rango 1 propias (G2): Ley 39/2006 (BOE
consolidado) + Decreto 54/2015 (BOCM), que contiene la regulación específica
de la PECF en la CM (arts. 41–47, antes Orden 626/2010, derogada por el
Decreto).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Residir y estar empadronado en un municipio de la Comunidad de Madrid en la fecha de la solicitud (la persona dependiente; en otra CCAA se pide la equivalente ante su administración) | territorio within_territory {"ccaa":"13"} | «residan en la Comunidad de Madrid en la fecha en que presenten la solicitud» | Decreto 54/2015, art. 2 «Titulares de derechos» | https://www.bocm.es/boletin/CM_Orden_BOCM/2015/05/26/BOCM-20150526-1.PDF |
| aviso: La persona que necesita los cuidados tiene la dependencia reconocida oficialmente, en cualquier grado (si respondes por un familiar dependiente, marca su situación; en trámite ⇒ aún no procede) | dependencia eq "reconocida" | «se establecerán las condiciones de acceso a esta prestación, en función del grado reconocido a la persona en situación de dependencia y de su capacidad económica» | Ley 39/2006, art. 18.1-2 | https://www.boe.es/eli/es/l/2006/12/14/39/con |
| aviso: La persona dependiente lleva residiendo en España 5 años, de los cuales 2 inmediatamente anteriores — la fecha de alta en el municipio actual es solo una pista (si antes había empadronamiento en otro municipio español, también cuenta) | meses de residencia gte 24 | «Residir en territorio español y haberlo hecho durante cinco años, de los cuales dos deberán ser inmediatamente anteriores a la fecha de presentación de la solicitud» | Ley 39/2006, art. 5.1.c | https://www.boe.es/eli/es/l/2006/12/14/39/con |

**No comprobables con nuestras preguntas (⚠):**

- **El grado de dependencia (I, II, III) solo lo declara la valoración oficial con el BVD — condiciona la cuantía** — «No será posible determinar el grado de dependencia mediante otros procedimientos distintos a los establecidos por este baremo» (Ley 39/2006, art. 27.2 y 27.5)
- **Es excepcional: el PIA la establece como modalidad más adecuada, a propuesta de los servicios sociales de Atención Social Primaria y cuando no haya un servicio más adecuado — no se elige a la carta** — «Podrá reconocerse, a propuesta de los servicios sociales de Atención Social Primaria, la prestación económica para cuidados en el entorno familiar» (Dto. 54/2015, art. 41)
- **Vínculo: el cuidador debe ser cónyuge o pariente por consanguinidad, afinidad o adopción hasta el 3.er grado — asimilados: parejas de hecho, tutores, acogedores y miembros de órdenes religiosas** — «Ser cónyuge o pariente por consanguinidad, afinidad o adopción, hasta el tercer grado de parentesco» (Dto. 54/2015, art. 42.1.b)
- **Convivencia en el mismo domicilio y condiciones adecuadas de convivencia y habitabilidad de la vivienda — se acredita con el certificado de empadronamiento conjunto** — «siempre que se den condiciones adecuadas de convivencia y de habitabilidad de la vivienda y así lo establezca su Programa Individual de Atención» (Ley 39/2006, art. 14.4)
- **Cuidados efectivos: prestados en el entorno familiar con al menos 1 año de anterioridad a la solicitud (salvo revisión de PIA) — lo comprueba el órgano de dependencia en la valoración** — «lo estén atendiendo y lo hayan hecho por un período previo a un año a la fecha de presentación de la solicitud» (Dto. 54/2015, arts. 41 y 42.1.b)
- **Condiciones del cuidador: mayor de 18, capacidad física/mental/intelectual suficiente, sin dependencia ni discapacidad ≥ 75 %, asume compromisos y formación; máx. 2 personas dependientes por cuidador** — «así como no tener reconocida la situación de dependencia o tener reconocido un grado de discapacidad igual o superior a un 75 por 100» (Dto. 54/2015, art. 42.1-2)
- **Capacidad económica (renta + patrimonio): en grados II-III, ≤ IPREM da la cuantía máxima del grado; si no, fórmula** — «La determinación de la capacidad económica personal del beneficiario se hará en atención a su renta y patrimonio» (Dto. 54/2015, arts. 18.2-3 y 44)
- **El cuidador debe afiliarse, darse de alta y cotizar a la Seguridad Social (convenio especial de cuidadores no profesionales)** — «El cuidador deberá ajustarse a las normas sobre afiliación, alta y cotización a la Seguridad Social que se determinen reglamentariamente» (Ley 39/2006, art. 18.3)
- **Incompatible con todos los servicios y prestaciones del SAAD salvo teleasistencia y prevención — hay que causar baja en lo incompatible** — «será incompatible con todos los servicios y prestaciones» (Dto. 54/2015, art. 8.1.e)
- **Plazo suspensivo: hasta 2 años desde la resolución; efectos desde la resolución o, a más tardar, a los 6 meses de la solicitud** — «quedarán sujetas a un plazo suspensivo máximo de dos años» (Dto. 54/2015, arts. 46 y 47.1)
- **Plazo máximo de resolución: 6 meses desde la entrada de la solicitud** — «el plazo máximo, entre la fecha de entrada de la solicitud y la de resolución de reconocimiento de la prestación de dependencia será de seis meses» (Ley 39/2006, DF 1.ª.2)
- **Regla de residencia completa: 5 años en total + 2 inmediatamente anteriores; en menores de 5 se exige a quien tenga la guarda y custodia; emigrantes retornados con condiciones propias** — «Para los menores de cinco años el periodo de residencia se exigirá a quien ejerza su guarda y custodia» (Ley 39/2006, art. 5.1.c y 5.4)
- **Sin nacionalidad española: residencia legal según LO 4/2000, tratados y convenios; no comunitarios acreditan con certificado del Ministerio del Interior** — «carezcan de la nacionalidad española se regirán por lo establecido en la Ley Orgánica 4/2000» (Ley 39/2006, art. 5.2)

- **Plazo**: permanente/continuo — «En plazo: permanente Referencia: S13» (sede CM, ficha del trámite)
- **Canal**: Comunidad de Madrid — órgano competente en materia de dependencia; la prestación se acuerda en el PIA dentro del trámite S13, preferentemente vía servicios sociales municipales (a propuesta de Atención Social Primaria) y online en la sede — https://sede.comunidad.madrid/prestacion-social/reconocimiento-dependencia-0 (online + presencial)
- **Importe**: variable, mensual — «La cuantía de las prestaciones económicas reguladas en los artículos de esta Sección se acordará por el Consejo Territorial del Sistema para la Autonomía y Atención a la Dependencia, para su aprobación posterior por el Gobierno mediante Real Decreto» (Ley 39/2006, art. 20; fórmula y deducciones en Dto. 54/2015, arts. 44-45)
- **Doc**: Solicitud en modelo normalizado (Dto. 54/2015, art. 12.2) (obligatorio)
- **Doc**: Copia del DNI/NIE del solicitante o autorización de consulta (art. 13.1.a) (obligatorio)
- **Doc**: Certificados de empadronamiento: 5 años en España (2 inmediatamente anteriores) + municipio CM a fecha de solicitud (art. 13.1.c) (obligatorio)
- **Doc**: Informe de salud normalizado, médico colegiado, ≤ 3 meses (art. 13.1.e) (obligatorio)
- **Doc**: Declaración responsable de capacidad económica y patrimonial (art. 13.1.g) (obligatorio)
- **Doc**: DNI/NIE de la persona cuidadora o autorización (art. 43.a) (obligatorio)
- **Doc**: Certificado de empadronamiento conjunto (art. 43.b) (obligatorio)
- **Doc**: Declaraciones responsables en modelo normalizado: cuidados actuales del beneficiario + cumplimiento de requisitos del cuidador (art. 43.c-d) (obligatorio)
- **Doc**: Acreditación de la representación (solo si solicita un tercero) (sede)
- **Doc**: Informe social de los Servicios Sociales de Atención Social Primaria (sede)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

### Notas para el verificador

- **Fuentes verificadas por HTTP 200 el 05/10/2026 (curl):**
  `https://www.boe.es/eli/es/l/2006/12/14/39/con` (200, consolidada, última
  actualización publicada 22/10/2025),
  `https://www.bocm.es/boletin/CM_Orden_BOCM/2015/05/26/BOCM-20150526-1.PDF`
  (200, PDF íntegro del Decreto 54/2015) y
  `https://sede.comunidad.madrid/prestacion-social/reconocimiento-dependencia-0`
  (200, trámite «Reconocimiento de la dependencia», ref. S13; la propia ficha
  lista «Prestación económica para cuidados en el entorno familiar» entre las
  prestaciones accesibles tras la valoración). Los tres snapshots
  (`*.json` + `*.txt`) ya existen en `data/eligibility/sources/` desde la ola
  2 — no hacen falta nuevos snapshots.
- **`excerptSha256` todos reales**: cada extracto verificado literalmente
  presente en el `.txt` normalizado del snapshot y hash
  `sha256(normalizeText(excerpt))` computado con la misma normalización que
  `src/lib/eligibility-engine/text-normalize.ts` (réplica exacta en Python:
  NFC, comillas tipográficas, unión de cortes `-\n`, espacios no separadores,
  colapso de blancos). Los extractos reutilizados del RuleSet
  `prestaciones-dependencia-saad` conservan sus hashes ya verificados.
- **Identidad standalone** (misma cuestión que `madrid-dependencia-saad` en la
  ola 2): no hay ficha propia en el catálogo; `prestaciones-dependencia-saad`
  es la ficha del procedimiento general y cita esta modalidad como ⚠. La PECF
  es una prestación con regulación específica propia (Dto. 54/2015, arts.
  41–47; ex-Orden 626/2010 derogada): merece identidad propia como nivel 1 —
  decisión pendiente de Daniel si prefiere subsumirla en la ficha SAAD.
- **«Comprobable» = solo `dependencia reconocida`** (y territorio/residencia,
  heredados del SAAD): el encargo pide como comprobable la dependencia
  reconocida y deja «convivencia con el cuidador» y «vínculo familiar» como
  uncovered — ninguno tiene campo en el perfil (`dependents` solo mide edad y
  discapacidad de las personas a cargo; no hay vínculo ni convivencia), así
  que ambos quedan en `uncoveredRequirements` con cita a art. 14.4 Ley +
  art. 42.1.b Dto.
- **`dependencia-reconocida` es soft a propósito** (asimetría de errores,
  ADR-017; mismo criterio que `sin-reconocimiento-previo` del SAAD): la
  pregunta `q-dependency` («¿Tienes reconocida la dependencia?») describe a
  quien responde, pero el sujeto de la prestación es la persona dependiente —
  que suele ser un familiar del que contesta (la cuidadora que explora ayudas
  para su madre). Un `hard: true` produciría un falso negativo seguro sobre la
  audiencia principal del programa. Con soft: «en trámite»/«no» muestran el
  requisito incumplido sin expulsar la tarjeta y `unasked` alimenta «qué te
  falta».
- **`empadronado-cm` hard** (único): quien reside en otra CCAA solicita la
  prestación equivalente ante su administración — el label lo dice. La PECF
  existe en todo el SAAD estatal; el territorio computado es el de la persona
  dependiente (que convive empadronada con el cuidador, art. 42.1.b).
- **`window.rolling: true` con cita de sede (rango 3)**: «En plazo:
  permanente»; procedimiento a instancia de parte sin convocatoria (G11 no se
  aplica a la ventana). Ojo: aunque la entrada es continua, el cobro está
  sujeto al plazo suspensivo de ≤ 2 años (art. 47) — queda en uncovered, no en
  la ventana (la ventana describe plazos de solicitud, no de efectos).
- **`amount: variable` + `monthly` sin cifras**: la cuantía se fija por
  acuerdo del Consejo Territorial aprobado por RD (art. 20 Ley) y se calcula
  por grado y capacidad económica (arts. 44-45 Dto.) — nada importe-comprobable
  en rango ≤ 2 sin abrir más fuentes. `period: monthly` se apoya en art. 46
  («a partir del día primero del mes siguiente»); si el verificador lo ve
  débil, quitar `period` no cambia nada.
- **Documentos del cuidador (art. 43) marcados obligatorios**: se aportan «en
  el momento del trámite de consulta y, en todo caso, con carácter previo al
  dictamen» de la Comisión Técnica de Valoración — van ligados a esta
  prestación, no al reconocimiento base; los del reconocimiento general
  (13.1.a/e/g) también se listan porque el acceso es a través del mismo
  expediente.
- **Extractos con artefactos de PDF evitados**: el texto pdfjs del BOCM
  conserva cortes tipo «pro- fesionales», «ne- cesidades», «fami- liar»,
  «sal- vo» — se eligieron spans limpios del art. 41/42 (misma convención que
  olas 1-3; el literal se respeta tal cual queda tras la normalización).
- **Golden asociado**: `gp-cuidadora-64-carabanchel` — cuidadora de 64 años,
  jubilada, Carabanchel (28079), madre de 88 a su cargo con discapacidad y
  dependencia reconocida. Responde por sí misma: disability «no» ⇒
  q-dependency no se muestra ⇒ `dependency` unasked ⇒ U en requisito soft ⇒
  verdict `posible`, `deadlineState` `ROLLING`, `blockers` [],
  `missingFields` [`dependency`] a 2026-10-05 (trazado a mano: territory
  28079 ⊂ CM ⇒ T único hard; residenceSince 03/1998 ⇒ ≈342 meses ≥ 24 ⇒ T
  soft; dependency unasked ⇒ U soft; 0 hard F + 0 hard U + uncovered > 0 ⇒
  posible; rolling ⇒ ROLLING). Misma ambigüedad documentada que
  `gp-dependencia-cuidadora`: el perfil no puede expresar «la persona que
  cuido es dependiente» — decisión de catálogo, no de esta regla. Pendiente
  de ejecución con el motor cuando el integrador corra la validación completa.
