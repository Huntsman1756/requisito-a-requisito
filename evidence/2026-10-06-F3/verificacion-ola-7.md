# Verificación independiente — ola 7 (ADR-040/044/045, R5-VERIF)

Verificador independiente: no participé en la redacción ni en el merge.
Fecha: 2026-10-06. Ámbito: los 4 RuleSet de la ola 7 **en worktrees** (no
mergeados a `main`), sus fuentes snapshot, sus goldens y sus hojas:

- `ola-7-emergencia-social` → `ayto-emergencia-social.json` +
  `gp-emergencia-madrid` (`evidence/2026-10-06-F3/ola-7-emergencia.md`)
- `ola-7-escuela-infantil` → `ayto-escuela-infantil.json` +
  `gp-escuela-infantil-madrid` (`ola-7-escuela-infantil.md`)
- `ola-7-ibi-familia-numerosa` → `ayto-ibi-familia-numerosa.json` +
  `gp-ibi-fn-madrid` (`ola-7-ibi-fn.md`)
- `ola-7-cheque-servicio` → `ayto-tarjeta-azul-discapacidad.json` +
  `gp-tarjeta-azul-vallecas` (`ola-7-tarjeta-azul-discapacidad.md` +
  `ola-7-cheque-servicio.md`, veredicto NO ENTRA del slot original)

Quinto slot: `ola-7-alquiler-ayto` — el autor dictaminó **NO ENTRA** por
G2/G11 (Bono Vivienda ReViVa/EMVS vigente pero sin fuente de rango ≤ 2 que
publique requisitos ni cuantías; patrón teleasistencia). Sin RuleSet que
verificar; la decisión es coherente con las fuentes capturadas (EMVS es
sociedad mercantil, sus bases no son diario oficial).

**Método.** (1) `F:\Temp\datawardsmadrid-verif7\check-citas.ts` (tsx, repo
real): recorre las **76 citas** de los 4 rulesets con la `normalizeText`
**real del motor**; comprueba `sha256(normalizeText(excerpt))` ===
`excerptSha256` e inclusión literal en `data/eligibility/sources/
<sourceId>.txt` normalizado del worktree; comprueba G11 (ninguna cita de
rango >2 en `requirements`/`uncoveredRequirements`/`amount`/
`referenceDateCitation`) y los metadatos de snapshot (existencia, `url`
coincidente, `textSha256` = sha256 del `.txt`, y bytes reales en
`F:\AgentState\datawardsmadrid\snapshots\<sha256>.<ext>` con sha256
coincidente). (2) `run-golden.ts`: `ruleSetSchema` + `goldenPersonaSchema` +
`evaluateRuleSet` con ctx `{today: gp.today, catalog: questions.json,
parameters: parameters.json}` del propio worktree (ambos **byte-idénticos a
`main`** en los 4 casos); compara veredicto, `deadline.state`, `blockers`,
pin `rulesVersion` y `selfCheck` I1–I10. (3) `probes.ts`: 36 contraejemplos
sobre requisitos hard/soft con la semántica real del cuestionario
(`maxExclusive` replicado de `QuestionStep.tsx`). (4) `boundaries.ts`:
detección de extractos cortados a media palabra. (5) Lectura de afinidad
claim↔extracto en los `.txt` en contexto (extracto presente pero sobre otra
cosa = KO). (6) `node node_modules/tsx/dist/cli.mjs
scripts/eligibility-validate.ts --today 2026-10-06` ejecutado **en cada
worktree**. (7) Comprobaciones R5-VERIF: vigencia del programa (ADR-045),
IPREM 12/14 pagas, nivel administrativo municipal y solapes con reglas
existentes.

**Resultado global**: 76 citas → **0 extractos ausentes, 0 hashes
incorrectos, 0 violaciones G11, 0 cortes a media palabra** (los guiones
internos «di- seño», «in- cluidos», «vi- vienda», «residen- cial», «fa-
milia», «em- padronado» son los cortes tipográficos del propio PDF del
BOCM, documentados por los autores en locator/hoja — excepción prevista en
el checklist). Todos los snapshots nuevos tienen bytes reales en el store
con `sha256` coincidente y `textSha256` = sha256 del `.txt`. `eligibility-
validate --today 2026-10-06` → **36 rulesets, 0 errores, 36 avisos** en cada
worktree (los avisos son G10 `humanReview: pending`, esperado). Los **4
goldens reproducen** veredicto y `deadlineState` esperados, `selfCheck`
PASS, pin `rulesVersion` = 1 = fichero v1. `questions.json` y
`parameters.json` byte-idénticos a `main` en los 4 worktrees. Ningún slug
colisiona con reglas ni fichas existentes; los 4 son `standalone: true` con
fuente rango 1 (G2). `verification` ausente o `pending` en los 4 ⇒ G12 los
mantiene fuera del bundle hasta este dictamen (correcto).

| Ayuda | Dictamen | Motivo principal |
|---|---|---|
| ayto-emergencia-social | **OK** (con corrección sugerida) | 18 citas íntegras y afines; arts. 12.1-12.5, 8.1, 4.b-c («90 por 100»), 6.2 con excepción, 14.1-14.6, 15.a/e y DA+anexo verificados en contexto; vigencia acreditada (ANM 2021\337, desarrollo 2025); golden reproduce `posible`+`ROLLING`. Corrección sugerida: canal y documentos citan hoy el consolidado ANM de **rango 4** pudiendo citar los mismos textos en las fuentes BOCM **rango 1 ya capturadas** (art. 14 en BOCM-2013, art. 15.a en BOCM-2021 — comprobado que el texto está presente en ambas) |
| ayto-escuela-infantil | **OK** (con observaciones) | 23 citas íntegras; bases 26/27 íntegras en contexto (destinatarios 2.1.a-e, extraordinario 15.3 con cierre 30/05/2027, baremo 13, única solicitud 21.1/9.5, docs 10); proceso extraordinario VIVO ⇒ `OPEN` correcto; golden reproduce `posible`+`OPEN`. Registry `sede.madrid.es`→maxRank 1 justificado (aloja el BOAM, diario oficial municipal) con efecto colateral acotado que queda anotado |
| ayto-ibi-familia-numerosa | **OK** (con observaciones) | 17 citas íntegras; art. 12 completo verificado (titularidad FN en devengo, empadronamiento municipal, de oficio, tabla 12.4 exacta 90/90·50/80·10/30, porcentaje por sujetos, cambio de domicilio); redacción post-TSJM del 12.1 (Ord. 4/2024) citada correctamente; vigencia confirmada (Ord. 9/2025 no toca el art. 12 — comprobado art. por art.); golden reproduce `posible`+`ROLLING` |
| ayto-tarjeta-azul-discapacidad | **OK** (con corrección sugerida) | 18 citas íntegras; **IPREM 14 pagas VERIFICADO**: la tabla oficial de la Resolución computa el tope anual ×14 (INGRESOS MES 1.597,53 → INGRESOS AÑO 22.365,42 = 42 × 532,51) ⇒ `IPREM_ANUAL_14P` justificado por la propia norma; nivel municipal correcto; golden reproduce `posible`+`ROLLING`. Corrección sugerida: el extracto de `renta-max-3-iprem` no incluye la columna «INGRESOS AÑO» que prueba el cómputo a 14 pagas — ampliarlo o añadir la cita del cuadro |

---

## 1. ayto-emergencia-social — OK (con corrección sugerida)

18 citas íntegras (literal + sha256 + bytes). Verificado en contexto en el
BOCM-20130704-64 (Acuerdo del Pleno de 26/06/2013, texto vigente de la
Ordenanza de prestaciones económicas del SPSS del Ayuntamiento de Madrid):
art. 12.1 «Ser mayor de edad o menor emancipado», art. 12.2 (empadronado en
el distrito de la solicitud o en el municipio + «salvo… situaciones
excepcionales justificadas en el informe social municipal»), art. 12.3
«Acreditar la situación de necesidad», art. 12.5 (aceptación del «di- seño»
de intervención — artefacto del PDF, documentado), art. 8.1 (emergencia
social = necesidad coyuntural y urgente, carácter extraordinario no
periódico), art. 4.b (valoración del trabajador social), **art. 4.c («cubrirá
como máximo el 90 por 100 del coste… excepto en ayudas de emergencia social
o situaciones especialmente graves» — el claim del label ES verdadero y está
en la fuente)**, art. 6.2 con su excepción («Se exceptuará este requisito si
la ayuda concedida no solventase la necesidad, pudiendo en este caso
complementarse por el Ayuntamiento de Madrid» — leído entero), art. 14.6
(«con carácter previo a la propuesta de resolución» — misma frase que el
extracto, leído completo), art. 15.a (Registro Municipal / medios del art.
38 OAACE — también presente en BOCM-2021) y art. 15.e (resolución en «cinco
días naturales» para emergencia social). La consolidada ANM 2021\337
(última actualización 19/04/2021) confirma vigencia; el baremo del anexo
(máx. 10 puntos, 5 apartados, los dos últimos excluyentes) existe en ella.

**Vigencia (ADR-045)**: ordenanza vigente, prestación permanente
(rolling), desarrollo reglamentario hasta 2025. Complementariedad
comprobada: `madrid-ayudas-urgencia-social` (ola 4) excluye
explícitamente el municipio 28079 — esta regla cubre justo Madrid capital.
Nivel administrativo: municipal puro, sin mezcla CM/Estado. ✓

**IPREM**: `IPREM_ANUAL_12P` (7.200 €) correcto — la ordenanza no fija
umbral; la referencia es orientativa, `hard: false` y el label lo dice
literalmente. ✓

**Falsos negativos (sondas ejecutadas)**: territorio F solo si municipio ≠
28079 (Móstoles/Getafe ⇒ `no_cumple`); solo CCAA o `unknown` ⇒ U ⇒
`posible`; ingresos altos ⇒ `carencia-recursos=F` pero **soft** ⇒ `posible`
(nunca excluye); `mayor-edad` hard con edad 17 ⇒ `no_cumple` — el menor
emancipado no es medible (caso marginal, avisado en el propio label;
mismo criterio aceptado para `edad-minima-52` de la ola 6); la excepción
de empadronamiento por informe social queda documentada en `uncovered` +
label, y quien vive en Madrid sin empadronar respondería municipio Madrid
⇒ T. Aceptable.

**Golden**: `gp-emergencia-madrid` reproduce `posible` + `ROLLING` +
`carencia-recursos=U` (straddle 0–8.400/7.200) + pin v1 + selfCheck PASS.

Corrección sugerida (no bloquea):

1. **Canal y los 4 documentos citan el consolidado ANM (rango 4)**. El
   mismo texto está en fuentes de rango 1 ya capturadas en el propio
   worktree: art. 14.1.a/b, 14.2 y 14.3.a en `bocm-20130704-64`
   (comprobado literal a literal) y art. 15.a en
   `bocm-20210419-56-ordenanza-5-2021` (declarada pero hoy sin citar).
   Recitar desde rango 1 deja todos los soportes ≤ rango 2 y da uso a la
   fuente huérfana. (docs/08 §1 asigna documentos/canal a rango 3; el
   gate no lo bloquea y el contenido citado es la propia ordenanza —
   desviación de forma, no de fondo.)
2. `cuantia-y-plazo-por-resolucion`: el extracto (art. 15.c) no cubre la
   cifra «90 % / total en emergencia» del label — ampliar el extracto al
   art. 4.c («90 por 100») o añadir segunda cita. El hecho es verdadero y
   está en la misma fuente rango 1.
3. `incompatibilidad-mismo-concepto`: la excepción que el label afirma
   está en la continuación del mismo párrafo (art. 6.2) — extracto
   ampliable unas líneas.
4. `documentacion-emergencia-flexible`: «antes de la propuesta de
   resolución» continúa la misma frase — extracto ampliable.
5. `baremo-sin-umbral-fijo`: el paréntesis «hasta 10 puntos» solo consta
   en el anexo de la consolidada (rango 4); el extracto prueba el baremo
   («escala validada y estandarizada»). Afinidad parcial del detalle.
6. `situacion-emergencia-social`: el paréntesis «(alimentación,
   alojamiento, salud, vestido, higiene u otras)» es glosa editorial — la
   lista del art. 9 es otra (alojamiento, alimentos, comedor para
   mayores/escolar, medicinas/gafas/audífonos…). Alinear a la lista del
   art. 9.
7. `excepcion-empadronamiento`: «SAMUR Social» es puntero editorial (0
   apariciones en ambas fuentes). Aceptable como contexto, pero
   distinguible de la cita.
8. `bocm-20210419-56` declarada sin citas (prueba de vigencia — quedaría
   usada si se aplica la corrección 1).

## 2. ayto-escuela-infantil — OK (con observaciones)

23 citas íntegras. Verificado en contexto en las bases 26/27 (BOAM
nº 10092/1031, anexo BASES): destinatarios 2.1.a (residentes en el
municipio «o que prevean residir»), 2.1.b (no nacidos con parto previsto
<01/01/2027 + informe médico), 2.1.c (adopción/acogimiento condicionado a
filiación en matrícula), 2.1.d-e (hermano escolarizado en la red «únicamente
para dichas escuelas» + mejora de gratuidad del art. 72 del XII Convenio),
2.2 (incorporación a las 16 semanas, reserva hasta 6 meses), 10.1.a-c +
10.2 (documentos), 13.1 (baremo cuando solicitudes > vacantes — con los
criterios leídos: renta per cápita IRPF, hermanos, proximidad, FN/
monoparental, discapacidad, parto múltiple, acogimiento), 15.3
(extraordinario: riguroso orden de entrega, sin baremo, solo se llama
«agotada la lista de no admitidos», cierre **30 de mayo de 2027**),
21.1 + 9.5 (única solicitud, máx. 4 escuelas — ambos apartados verificados),
calendario NEE (listas definitivas NEE 1 de junio de 2026). Cuotas 24/25:
comedor 96 €/mes, horario ampliado 12 €/mes por tramo de media hora
(7:30–9:00 / 16:00–17:30), FN especial exenta, FN general −50 %,
exenciones por vulnerabilidad (RMI/IMV, intervención social, VG).
Gratuidad de escolaridad confirmada dos veces (instrucción 2.1 +
exposición de motivos de la Resolución).

**Vigencia (ADR-045)**: hoy solo cabe el proceso extraordinario, pero
admite solicitudes nuevas hasta el 30/05/2027 ⇒ `closesAt` +
`recurrence: annual` correctos (post-cierre degrada a CLOSED_RECURRING,
no CLOSED); `previousCalls` con los 3 plazos ordinarios citados. El
corrector de la consigna (escolaridad gratuita desde 2019/20, no precios
escalados) está verificado — el label no vende requisitos de renta que no
existen.

**Registry**: `sede.madrid.es` → `maxRank: 1`. Necesario y correcto: el
BOAM (diario oficial municipal, rango 1 por definición de docs/08 §1) se
publica en la sección «Publicaciones Oficiales / Búsqueda BOAM» de la sede
— comprobado en el snapshot. Efecto colateral: el techo cubre **todo el
host**, así que una ficha de trámite de la misma sede podría declararse
rango 1 en el futuro sin que G3 lo frene; la verificación por regla
sigue controlando el rango declarado de cada fuente. Anotar al merger:
si en el futuro se quiere precisión por ruta, el registry solo admite
host/sufijo — la disciplina actual es por-declaración. La ficha de
trámite `sede-ayto-admision-eim-2627` se mantiene honestamente en rango 3.

**Falsos negativos (sondas ejecutadas)**: `residir-madrid` hard — F solo
si municipio ≠ 28079 (Móstoles ⇒ `no_cumple`); solo CCAA ⇒ U; las
excepciones (prevean residir, hermano en la red, convenio) quedan en ⚠ +
label — misma tolerancia que los hards territoriales de todas las olas.
`hijo-primer-ciclo` (`dependents` con `age lt 3` ≥1): hijo 3/4 años ⇒ F ⇒
`no_cumple` (correcto: 2.º ciclo); hijo 2 nacido oct–dic 2023 ⇒ T
(sobreinclusivo, seguro — el borde con permanencia acreditada queda en
⚠); **sin dependientes ⇒ F ⇒ `no_cumple`** — el supuesto «no nacidos» no
es medible por el cuestionario (ninguna respuesta puede expresarlo); es el
mismo patrón que `madrid-cheque-escuela-infantil` (ola 1, ya verificada) y
queda documentado en `nacimiento-previsto-2027`; `dependents` sin
respuesta ⇒ U ⇒ `posible`. Aceptable.

**Golden**: `gp-escuela-infantil-madrid` reproduce `posible` + `OPEN`
(cierra 2027-05-30) + pin v1 + selfCheck PASS.

Observaciones (no bloquean):

1. `solicitud-unica`: el extracto citado es del apdo. 21.1 (capítulo III,
   vía NEE); la regla general es apdo. 9.5 — el locator lo declara
   honestamente y la sustancia es la misma. Mínimo.
2. `via-nee`: «(listas NEE el 01/06/2026)» verificado en el calendario —
   la cita del extracto es la remisión de solicitudes, la fecha está en
   el mismo capítulo. Aceptable.
3. `excepciones-residencia`: «(p. ej. progenitores que trabajan en la
   escuela)» es glosa del art. 72 del XII Convenio — la cita cubre la
   excepción, no el ejemplo. Editorial menor.
4. `boam-20260324-instrucciones-eim-2627` declarada sin citas (material
   de apoyo del autor).
5. `cuotas-comedor-horario`: la cuota citada es la instrucción 24/25 (la
   última publicada localizada) — el label lo advierte («la de 2026/2027
   puede variar»). Declaración honesta, correcta.

## 3. ayto-ibi-familia-numerosa — OK (con observaciones)

17 citas íntegras. Verificado en contexto en BOCM-20231228-42 (Ordenanza
5/2023, art. 12 íntegro): 12.1 (sujeto pasivo titular de FN en el devengo,
Ley 40/2003), 12.2 (valor catastral individualizado), 12.3 (empadronado en
el municipio + de oficio + ejercicio siguiente + «podrá solicitarse por la
persona interesada» + carné vigente + no reiterar en renovaciones), 12.4
(**tabla literal**: 90 %/90 % ≤204.000 € · 50 %/80 % (204.000, 408.000] ·
10 %/30 % >408.000 € — idéntica al label), 12.5 (porcentaje por sujetos
incluidos en el título + nulidad/separación/divorcio cubre ambos
cónyuges), 12.6 (cambio de domicilio ⇒ pérdida + aplicación a la nueva
vivienda al ejercicio siguiente). En BOCM-20241227-61: **comprobado el
cumplimiento de la STJM 329/2024** — el último párrafo del 12.1 queda
«…la necesidad permanente de vivienda **de la familia numerosa**» (anulado
«del sujeto pasivo y de su familia»); la cita usa la redacción vigente. En
BOCM-20251226-63 (Ord. 9/2025, en vigor 01/01/2026 — comprobado en la DF):
**los artículos modificados son 4, 7, 8, 9, 13 y 15 bis; el art. 12 no
aparece** ⇒ la redacción citada es la vigente. ATM (rango 3) confirma el
operativo: no hace falta solicitud si el título lo expidió la CM, «Se
mantendrá mientras se mantenga la condición», carné, escritura si no hay
catastro, devengo 1 de enero, empadronada en el municipio, «Tramitar en
línea» con firma electrónica + presencial en registros.

**Vigencia (ADR-045)**: tributo periódico, bonificación de aplicación de
oficio cada ejercicio ⇒ admite solicitudes nuevas hoy (y de hecho ni
siquiera hace falta en el caso común). ✓ Registry: `agenciatributaria.
madrid.es` maxRank 3 — correcto (órgano gestor tributario; el wildcard
`.madrid.es` lo habría limitado a 4).

**Falsos negativos (sondas ejecutadas)**: territorio F solo si municipio
≠ 28079 (Leganés ⇒ `no_cumple`); solo CCAA ⇒ U; `familyType` general o
monoparental ⇒ F ⇒ `no_cumple` (correcto: sin título FN no hay
bonificación); unasked ⇒ U; `housingStatus` alquiler ⇒ F ⇒ `no_cumple`
(el inquilino no es sujeto pasivo del IBI de esa vivienda — el extracto
del 12.6 prueba el anclaje sujeto pasivo ↔ vivienda habitual; la
inferencia es sólida aunque el extracto es indirecto); `housing` general
⇒ T (el usufructo habitual SÍ puede ser sujeto pasivo — decisión
conservadora correcta, la titularidad catastral queda en ⚠); unasked ⇒ U.

**Golden**: `gp-ibi-fn-madrid` reproduce `posible` + `ROLLING` +
`blockers []` + pin v1 + selfCheck PASS.

Observaciones (no bloquean):

1. `solicitud-si-no-oficio` (⚠): el detalle «si tu título no lo expidió la
   Comunidad de Madrid» solo consta en la página ATM (rango 3) — citada
   en el documento `instancia-solicitud`; el extracto del 12.3 prueba la
   solicitud. Afinidad combinada correcta; la hoja lo documenta (§8).
2. `porcentaje-categoria-valor` (⚠): el extracto prueba el mecanismo; la
   tabla completa está citada en `amount` (mismo art. 12.4) — la afinidad
   se sostiene combinando ambas citas.
3. `bocm-20251226-63-ibi` declarada sin citas (prueba de vigencia
   ADR-035/045 — documentada en la hoja; inerte para los gates).
4. `familyType eq "familia-numerosa"` hereda la ambigüedad de la pregunta
   única («¿Cómo es tu familia?» — general/FN/monoparental): una familia
   **monoparental numerosa** que elija «Familia monoparental» sale F ⇒
   `no_cumple`. No es defecto nuevo de esta regla: el mismo patrón hard
   fue aceptado en `descuento-transporte-familia-numerosa` (ola 2). Se
   sugiere, a nivel de producto, aclarar en la opción que elija
   «familia numerosa» quien tenga el título (la Ley 40/2003 incluye las
   monoparentales con ≥2 hijos). Anotación transversal, no KO.

## 4. ayto-tarjeta-azul-discapacidad — OK (con corrección sugerida)

18 citas íntegras. Verificado en contexto en BOCM-20110525 (Resolución
11/04/2011): expositivo («…a propuesta de la Junta de Gobierno de la
Ciudad de Madrid» — base del nivel municipal), Anexo A) chapeau
(«residentes en Madrid» — el CRTM y la sede lo interpretan como
«empadronados en el municipio de Madrid», comprobado en ambas páginas),
A) Cuarta (≥33 % + tope 3×IPREM + certificado CTC), A) Tercera (cónyuge/
pareja sin ingresos), A) Quinta (dependencia >18, tope 1×IPREM), A) Sexta
(escala de cargas **que excluye expresamente la condición cuarta** — el
label lo afirma y es literal), A) Séptima (menores dependientes: renta del
padre/madre/tutor con escala ×1,16499/×1,37294/×1,76500), B).1-B).4
(documentos + autorización de comprobación), C) (revisión periódica),
Disposición Segundo (recepción desde el 16/05/2011). En BOCM-20090316:
creación del título y alcance cerrado «MetroMadrid zona A + ML-1 + EMT»
(la inferencia «no Cercanías ni interurbanos» es directa de la lista
cerrada). En BOCM-20251231-2 y -3: «TARJETA AZUL 3,70 €» con descuento y
«TARJETA AZUL 6,30 €» tarifa oficial — y la sede confirma el «descuento
temporal del 40 %». En BOCM-20260122-20: fotografía tamaño pasaporte
(cláusula 4). CRTM: canal presencial Línea Madrid sin cita (excepto
auxiliares) + electrónico solo para «Persona con discapacidad mayor de 18
años», emisión/envío/gestión a cargo del CRTM, caducidad 5 años.
Sede-ayto: trámite vivo con «Tramitar en línea».

**IPREM 12 vs 14 (R5-VERIF) — VERIFICADO**: la propia Resolución lleva la
tabla «INGRESOS MÁXIMOS PARA TENER DERECHO A LA TARJETA AZUL» con
columnas **INGRESOS MES** (supuesto 3, discapacidad ≥33 %: **1.597,53 €**
= 3 × 532,51) e **INGRESOS AÑO** (**22.365,42 €** = 42 × 532,51 = 3 ×
7.455,14). La norma computa el tope anual a 14 pagas ⇒ `IPREM_ANUAL_14P`
(8.400 €) × 3 = **25.200 €/año** es el umbral correcto, no el laxo. ✓

**Nivel administrativo (R5-VERIF)**: managingBody «Ayuntamiento de Madrid
— Oficinas Línea Madrid y sede electrónica (emisión/gestión CRTM)» —
correcto: la tarjeta es municipal (solicitud al Ayto.), emitida por el
CRTM a propuesta de la Junta de Gobierno de la Ciudad; el reparto de
roles coincide con la propia ficha del trámite. ✓

**Falsos negativos (sondas ejecutadas)**: territorio F solo si municipio
≠ 28079; solo CCAA ⇒ U; `disability` lt33/no ⇒ F ⇒ `no_cumple` (correcto
para **esta** categoría; las otras categorías quedan en ⚠ y en la regla
`madrid-abono-transporte-65`); declined ⇒ U ⇒ `posible`; `incomeAnnual`
— en la práctica la banda 25200-inf produce U (borde inclusivo), nunca F
desde el cuestionario: dirección conservadora, UNKNOWN≠NO preservado, y el
tope 25.200 € queda informado en el label; banda 16800-25200 ⇒ T.

**Golden**: `gp-tarjeta-azul-vallecas` reproduce `posible` + `ROLLING` +
pin v1 + selfCheck PASS.

Corrección sugerida (no bloquea):

1. **`renta-max-3-iprem`**: el extracto citado prueba «3 × IPREM» pero el
   paréntesis del label («la tabla oficial de la Resolución computa el
   tope anual con el IPREM de 14 pagas») no queda cubierto por el
   extracto. La tabla «INGRESOS AÑO: … 22.365,42» está en el mismo
   snapshot rango 1 — ampliar el extracto para incluirla (o añadir una
   segunda cita del cuadro). El hecho es verdadero y verificado; es la
   afinidad del extracto la que queda corta (punto 4 del encargo).
2. `revision-periodica` (⚠): «caduca a los 5 años» no está en la
   Resolución (0 apariciones) — solo en la página CRTM (rango 3,
   incitable en uncovered por G11). El extracto prueba la revisión; la
   caducidad queda como contexto editorial — atenuar el label o aceptar
   como está (el hecho es correcto).
3. `otras-categorias-beneficiarias` (⚠): el extracto cubre la Quinta; las
   demás categorías enumeradas están en el mismo Anexo A) (verificadas) —
   afinidad parcial, propósito de señalización correcto.
4. **Solape de producto (nota al merger/Daniel, no de la regla)**: es la
   misma Tarjeta Azul física que `madrid-abono-transporte-65` (categoría
   ≥65). Una persona de 70 años con discapacidad ≥33 % verá **dos
   entradas del mismo título**. La hoja lo documenta como modelado por
   categorías; decidir en UI/catálogo si conviene fusionar o aclarar.

Observaciones menores:

5. `sede-ayto-tarjeta-azul` declarada (rango 4) sin citas — evidencia del
   trámite vivo.
6. 4 ficheros de fuente **huérfanos** del camino «cheque servicio»
   abandonado (`ayto-ordenanza-prestac-econ`, `bocm-20220714-42-ordenanza-
   sad`, `sede-ayto-ayudas-economicas`, `sede-ayto-sad-mayores`): no
   declarados en el ruleset, inertes para los gates; al mergear quedan
   colgados en `sources/` — misma observación que la ola 6 (sería más
   limpio retirarlos del commit o notarlos como evidencia del NO ENTRA).

---

## Resumen

- **Citas comprobadas: 76** (emergencia 18 · escuela 23 · ibi 17 ·
  tarjeta-azul 18) — **0 extractos ausentes, 0 sha256 incorrectos, 0
  violaciones G11, 0 cortes a media palabra** (los guiones internos son
  cortes del PDF del BOCM, documentados).
- **G4 paramétrica**: `IPREM_ANUAL_12P` e `IPREM_ANUAL_14P` existen y
  cubren 2026-10-06; sus citas también pasan el gate.
- **Vigencias**: las 4 admiten solicitudes nuevas hoy (emergencia:
  permanente; escuela: extraordinario hasta 30/05/2027; ibi: de oficio
  permanente; tarjeta azul: trámite vivo sede + CRTM). Ningún régimen
  solo transitorio.
- **Nivel administrativo**: los 4 son Ayuntamiento de Madrid (órgano
  gestor, fuentes y canal coherentes; la Tarjeta Azul con reparto
  Ayto./CRTM correctamente descrito).
- **IPREM**: 12P en emergencia (orientativo, sin umbral normativo —
  correcto); 14P en tarjeta-azul **justificado por la tabla de la propia
  Resolución** (verificado numéricamente).
- **Goldens**: 4/4 reproducen con el motor real (veredicto + plazo +
  pin v1 + selfCheck PASS); valores de respuesta existentes en
  `questions.json` (byte-idéntico a `main` en los 4 worktrees).
- **Validate**: `36 rulesets, 0 errores, 36 avisos` (todo G10 pending) en
  cada worktree, ejecutado con `--today 2026-10-06`.
- **Falsos negativos**: ninguno nuevo respecto al criterio del checklist;
  los hards solo producen F sobre datos medidos exactamente (territorio
  por municipio, disability eq gte33, familyType, housingStatus, edad,
  dependientes por edad). Bordes residuales documentados por los autores:
  menor emancipado (emergencia), no-nacidos 2027 (escuela), monoparental
  numerosa (IBI — ambigüedad heredada del cuestionario, precedente
  aceptado en ola 2), excepciones de residencia (escuela) y de
  empadronamiento (emergencia).
- **Fuentes declaradas no citadas**: 1 por ruleset (prueba de vigencia;
  la de emergencia quedaría usada si se aplica la corrección de canal/
  documentos). **Huérfanas no declaradas**: 4 en `ola-7-cheque-servicio`
  (material del slot «cheque servicio» descartado; inertes).
- **Registry**: dos worktrees añaden dominios (`sede.madrid.es` maxRank 1
  — justificado por el BOAM, con nota de alcance; `agenciatributaria.
  madrid.es` maxRank 3). Aditivos, sin conflicto de edición entre sí.

## Dictamen de la ola

| Ruleset | Veredicto |
|---|---|
| ayto-emergencia-social | **OK** (con corrección sugerida — recitar canal/docs desde rango 1; ampliar extractos art. 4.c, 6.2, 14.6) |
| ayto-escuela-infantil | **OK** (con observaciones) |
| ayto-ibi-familia-numerosa | **OK** (con observaciones) |
| ayto-tarjeta-azul-discapacidad | **OK** (con corrección sugerida — ampliar extracto de `renta-max-3-iprem` al cuadro INGRESOS AÑO que prueba el cómputo a 14 pagas) |

**Ola 7: apta para merge** según ADR-040/044. Ningún KO. Las correcciones
sugeridas son de afinidad editorial (extractos ampliables) y de forma de
cita (rango 4 → rango 1 ya presente), no de veracidad: todos los hechos
afirmados están en las fuentes oficiales citadas o en la misma norma.
Para que cada regla entre en el bundle público bastará
`verification: {status:"ok", by:"verificador-ola-7", at:"2026-10-06",
report:"evidence/2026-10-06-F3/verificacion-ola-7.md"}` al mergear
(G12), más la aprobación humana/panel correspondiente para la release
`--strict` del 14/10.
