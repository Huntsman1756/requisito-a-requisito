# Hoja de revisión — ola-7-alquiler-ayto (F3)

Tarea encargada: «Ayudas al alquiler de vivienda del Ayuntamiento de Madrid
(Plan Municipal de Vivienda / convocatoria municipal en madrid.es)» —
distinta de `madrid-ayudas-alquiler-plan-estatal` (estatal, gestionada por
la CM).

## Veredicto del autor: **NO ENTRA** (a nivel 1) — motivo G2/G11, no vigencia

El programa **está vigente y admite inscripciones hoy** (ADR-045 superado),
pero **no es modelable con la política de fuentes actual**: no existe ninguna
fuente de rango ≤ 2 que publique sus requisitos ni sus cuantías. G2 exige
fuente de rango 1 para un RuleSet `standalone` sin ficha de catálogo y G11
exige rango ≤ 2 en `requirements`, `uncoveredRequirements`, `amount` y
`referenceDateCitation`. Idéntica situación a `madrid-teleasistencia-domiciliaria`
(evidence/2026-10-05-F3/ola-1-teleasistencia.md), que se resolvió
**DESCARTADA → nivel 2** (muestreo-ola-1.md).

## Identidad del programa (corrección respecto al enunciado)

No existe una «convocatoria municipal abierta de ayudas al alquiler del Plan
Municipal de Vivienda» en sentido clásico (subvención directa sobre un
alquiler de mercado libre). La ayuda municipal al pago del alquiler vigente
es el **Bono Vivienda del programa ReViVa Madrid**, gestionado por **EMVS
Madrid** (sociedad mercantil municipal, órgano gestor): una **reducción de
renta** que solo se concede a personas **inscritas en la Bolsa de
Demandantes de Vivienda de ReViVa** que lleguen a residir en una vivienda
incorporada al programa (viviendas vacías cedidas en usufructo por sus
propietarios a EMVS). No subvenciona contratos de mercado libre ajenos a
ReViVa. No confundir con:

- `madrid-ayudas-alquiler-plan-estatal` — Orden de convocatoria CM
  (subvención sobre el alquiler, Plan Estatal; ya modelada).
- `madrid-bono-alquiler-joven` — RD 42/2022, concesión directa CM.
- **Registro Permanente de Solicitantes de Vivienda (RPSV)** de EMVS —
  registro para vivienda protegida/sorteos, programa distinto.
- Plan Rehabilita / Plan Adapta / Plan Transforma tu Barrio —
  subvenciones de rehabilitación, no de alquiler.
- El «alquiler asequible» de promociones EMVS (Iberia Loreto, Cañaveral…)
  — adjudicación de vivienda pública, no ayuda económica.

## Vigencia (ADR-045): ACTIVO — inscripción continua (ROLLING)

- Bases vigentes: «Bases por las que se regirá la adquisición del derecho
  de usufructo temporal de viviendas en la ciudad de Madrid y su cesión
  en arrendamiento para el programa "REVIVA MADRID"», **aprobadas por el
  Consejo de Administración de la EMVS en fecha 22 de enero de 2021**,
  con **modificación aprobada en sesión de 16 de abril de 2026** (texto
  del propio documento: «Modificación 16/04/2026» en cabecera de página y
  disposición transitoria primera). Snapshot: `emvs-reviva-bases-2026`.
- La página operativa de EMVS (snapshot `emvs-reviva-vivienda`, capturada
  el 06/10/2026) lista los requisitos y los pasos de inscripción
  («Solicitud de inscripción para inquilinos», «Accede al formulario de
  inscripción») y enlaza «Bases reguladoras del Programa ReViVa Madrid
  (16 abr 2026)».
- Base 20ª: «EMVS anunciará en su página Web el inicio del plazo para la
  presentación de solicitudes en la Bolsa de Demandantes de Vivienda del
  programa " REVIVA MADRID ", que podrá finalizar en los siguientes
  casos: Ejecución de la totalidad del presupuesto destinado a esta
  finalidad. Acuerdo del órgano de contratación de EMVS.» — el plazo de
  inscripción está abierto a 06/10/2026; no consta cierre.
- Advertencia operativa real (útil para un eventual nivel 2): «Es posible
  que en algunos momentos de vida del programa no haya viviendas
  disponibles en función de tus necesidades.» — la inscripción no
  garantiza oferta inmediata.

## Fuentes y rangos (por qué NO ENTRA)

| Fuente | URL | Rango asignable | Por qué no vale para G2/G11 |
|---|---|---|---|
| Bases ReViVa (PDF, 39 p., mod. 16/04/2026) | https://www.emvs.es/Vivienda/Reviva/Documents/Bases%20reguladoras%20del%20Programa%20Reviva%20Madrid%20(16%20abr%202026).pdf | 3 (sitio del órgano gestor, `emvs.es` añadido al registry con `maxRank: 3`, por analogía con CRTM) | Es un instrumento interno aprobado por el Consejo de Administración de EMVS S.A.; **no es norma ni convocatoria publicada en boletín oficial** (rango 1) ni registro BDNS (rango 2). |
| Página operativa ReViVa | https://www.emvs.es/Vivienda/Reviva | 3 | Informativa/operativa; replica las bases. |
| Trámite «Ayuda Bono Vivienda» (sede electrónica Ayto.) | https://sede.madrid.es/portal/site/tramites/menuitem.62876cb64654a55e2dbd7003a8a409a0/?vgnextchannel=171737c190180210VgnVCM100000c90da8c0RCRD&vgnextfmt=pd&vgnextoid=894fcace7f847710VgnVCM1000001d4a900aRCRD | 4 (`.madrid.es`, techo registry) | Además el snapshot solo capturó la envoltura del portal (820 caracteres, contenido del trámite inyectado por JS); ver «Snapshots». |
| BOAM | sede.madrid.es (Publicaciones Oficiales) | 4 bajo `.madrid.es` | No se ha localizado publicación BOAM de las bases ReViVa ni decreto de convocatoria: son actos del Consejo de Administración de la sociedad mercantil, no disposiciones de órgano municipal. Búsquedas «BOAM ReViVa / bono vivienda / pago del alquiler 2025-2026»: solo Plan Rehabilita y otras convocatorias no relacionadas. Y aun existiendo, el techo de dominio actual la dejaría en rango 4. |
| BDNS | www.pap.hacienda.gob.es / www.infosubvenciones.es | 2 | ReViVa **no figura** en BDNS: es una reducción de renta vinculada a una relación arrendaticia gestionada por EMVS, no una convocatoria LGS 38/2003 registrada. |
| BOE / BOCM | — | 1 | Las bases internas de una sociedad municipal no se publican en BOE ni BOCM. Nada encontrado. |

Conclusión: **todo requisito y toda cuantía descansa exclusivamente en
fuentes de rango 3–4**. Modelar el RuleSet exigiría una de estas salidas
decididas por el mantenedor (no por el autor):

- (a) Elevar en `registry.json` el techo de las publicaciones oficiales
  municipales (BOAM en sede.madrid.es) o reconocer las bases del órgano
  gestor como citables para requisitos — decisión de política, ADR;
- (b) admitir citas de rango 3–4 en posiciones normativas para programas
  municipales gestionados por sociedades públicas (relajaría G11);
- (c) relegar a **nivel 2** (ficha orientativa con fuente oficial, sin
  RuleSet determinista) — recomendación del autor, igual que
  teleasistencia.

## Requisitos que se modelarían (si se desbloquea la fuente)

De Base 19ª/20ª (Sección Segunda, «De la cesión en arrendamiento»),
snapshot `emvs-reviva-bases-2026`:

- **a) Empadronamiento**: «El demandante de vivienda deberá estar
  empadronado por un período de, al menos, un año, en la ciudad de
  Madrid.» → candidato a `residenceMonths >= 12` + `territory` Madrid
  capital (28079).
- **b) Inscrito en la Bolsa de Demandantes ReViVa** y **c) solicitud de
  reserva de vivienda** → no medible por el cuestionario ⇒
  `uncoveredRequirements`.
- **d) Ingresos ponderados entre 3 y 7,5 veces el IPREM** («EMVS podrá
  ofrecer viviendas a personas con ingresos inferiores a 3 veces el IPREM
  cuando el pago del alquiler … no le suponga un esfuerzo superior al 30%
  de su renta disponible») → `incomeAnnual` es banda, no renta ponderada
  ⇒ soft/uncovered salvo bandas extremas.
- **e) Solvencia**: «Acreditar una solvencia económica de, al menos, el
  30% de sus ingresos netos familiares para el abono de la renta» ⇒
  uncovered (no medimos renta neta ni renta de la vivienda).
- **f) No titularidad**: «No ser titular de pleno dominio o de un derecho
  real de uso o disfrute sobre otra vivienda en la Comunidad de Madrid»
  (con excepciones: separación/divorcio sin uso atribuido, proindiviso ≤
  50% por herencia o liquidación de gananciales, vivienda inadecuada) ⇒
  uncovered (no medimos titularidad).
- **g) Exclusión**: «Quedan excluidos los arrendatarios de una vivienda
  gestionada por EMVS.» ⇒ uncovered.
- `housingStatus: alquiler` **no** es requisito de acceso al programa: el
  demandante puede vivir en cualquier situación; lo relevante es la
  no-titularidad de otra vivienda en la CM. Como mucho serviría de
  señal soft.

## Bono Vivienda (Base 24ª) — mecánica e importe

«La ayuda para el pago del alquiler de vivienda consiste en una
reducción de la renta que se concederá a aquellos solicitantes inscritos
en la Bolsa de Demandantes de Vivienda del programa " REVIVA MADRID "»:

- Requiere «empadronado en la ciudad de Madrid por un plazo igual o
  superior a **cinco años**» **y** al menos una circunstancia general:
  <35 años, >65 años, discapacidad ≥33%, familia con dependientes grado
  II/III, hijos <25 dependientes o embarazadas, hijos dependientes con
  discapacidad ≥33% cualquier edad, separados/divorciados con hijos.
- Circunstancias especiales que incrementan la ayuda: familia numerosa,
  monoparental, discapacidad ≥65%, dependencia grado III, víctima de
  terrorismo, violencia de género/pareja.
- «Cada característica específica implicará una reducción de **150,00
  euros**. En ningún caso podrá superar la cantidad de **300,00 euros**
  (máximo, se tendrán en cuenta dos circunstancias).»
- Importe total «en función del número de miembros de la unidad familiar,
  del nivel de esfuerzo para el abono de la renta y de las circunstancias
  generales y/o especiales, sin que el importe máximo a percibir exceda
  de **900,00 euros mensuales**» (Anexo VI: tabla renta−IPREM × esfuerzo
  × bonificación por tamaño de familia).
- Restricción de esfuerzo: «Los arrendatarios destinarán hasta un máximo
  del **30%** de sus ingresos netos familiares para abonar el importe de
  la renta y la cuota ordinaria de la comunidad de propietarios, siendo
  el importe mínimo de la renta a abonar de, al menos, **450,00 euros
  mensuales**.»
- «La reducción concedida se revisará anualmente atendiendo a la
  variación de los ingresos anuales de la unidad familiar», condicionada
  a la relación arrendaticia y a la disponibilidad presupuestaria.

Nota de discrepancia menor: la página del trámite en sede.madrid.es habla
de «discapacidad igual o superior a un 66%» como circunstancia especial y
las bases dicen «65%»; prima el texto de las bases (documento regulador).

## Canal y documentos (rango 3 admisible para canal/documentos)

- Solicitud de inscripción inquilino (PDF) + formulario web de carga en
  emvs.es; firma de autorizaciones por todos los mayores de 18 incluidos.
- «Las solicitudes se podrán presentar a través de los siguientes medios:
  Registro General de EMVS, sito en calle Palos de la Frontera, nº 13,
  Madrid, en horario de 08:30 a 14:00. Mediante página web: www.emvs.es»
- Consultas: `solicitantesrevivamadrid@emvs.es`.
- Tras la inscripción, EMVS facilita número de registro y contraseña para
  acceder a las viviendas adecuadas a preferencias/ingresos.

## Snapshots realizados

- `emvs-reviva-vivienda` (rank 3) — HTTP 200, text/html, sha256
  1e7e92e0… / textSha256 8870a4b6… — página operativa completa.
- `emvs-reviva-bases-2026` (rank 3) — HTTP 200, application/pdf,
  1 447 441 bytes, sha256 78c1c880… / textSha256 e5722704… — texto
  extraído limpio con pdfjs-dist (92 157 caracteres, 39 páginas).
- `sede-madrid-bono-vivienda` (rank 4) — HTTP 200 pero solo envoltura del
  portal (820 caracteres; el contenido del trámite se inyecta por JS y no
  es snapshot-able por fetch). Documentado; no aporta extractos.
- Registro: añadidos `www.emvs.es` y `emvs.es` con `maxRank: 3` en
  `data/eligibility/sources/registry.json` (órgano gestor, coherente con
  `crtm.es`).

## Validación

`npx tsx scripts/eligibility-validate.ts` — ejecutado sin reglas nuevas
(no se creó `ayto-ayuda-alquiler.json` ni golden: NO ENTRA). Los snapshots
huérfanos no provocan errores (G3 solo exige snapshot para fuentes
citadas por un RuleSet).

## Recomendación

1. **Nivel 2** en el catálogo orientativo (la-ayuda donante): ficha
   «Ayuda Bono Vivienda — Programa ReViVa Madrid (EMVS)» con fuentes
   oficiales emvs.es + sede.madrid.es, matizando que exige inscripción en
   la Bolsa y vivienda ReViVa (no es ayuda al alquiler de mercado libre).
2. Si se decide modelarla en nivel 1 hace falta primero una decisión de
   política de fuentes (ADR) que fije el tratamiento de documentos
   normativos de organismos/sociedades municipales (BOAM/emvs.es) —
   mismo debate abierto por teleasistencia.
3. `housingStatus: alquiler` no debe modelarse como requisito: el
   programa no exige ser ya inquilino; exige no-titularidad (no medida).
