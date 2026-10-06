# Verificación independiente — ola 6 (ADR-040/044)

Verificador independiente: no participé en la redacción ni en el merge.
Fecha: 2026-10-05. Ámbito: los 5 RuleSet de la ola 6 **en worktrees** (no
mergeados a `main` en el momento de la verificación), sus fuentes snapshot,
sus goldens y sus hojas:

- `ola-6-jubilacion` → `pension-jubilacion-contributiva.json` +
  `gp-jubilacion-leganes.json`
- `ola-6-orfandad` → `pension-orfandad.json` + `gp-orfandad-getafe`,
  `gp-orfandad-madre-mostoles`, `gp-orfandad-trabajador-parla`
- `ola-6-incapacidad` → `pension-incapacidad-permanente.json` +
  `gp-incapacidad-alcala`, `gp-incapacidad-getafe`
- `ola-6-cese-autonomos` → `cese-actividad-autonomos.json` +
  `gp-cese-autonomo-leganes`
- `ola-6-rai` → `renta-activa-insercion.json` + `gp-rai-mostoles`

**Método.** (1) `F:\Temp\datawardsmadrid-verif6\check-citas.ts` (tsx, repo
real): recorre las **117 citas** de los 5 rulesets con la `normalizeText`
**real del motor** (no una réplica); comprueba `sha256(normalizeText(excerpt))`
=== `excerptSha256` e inclusión literal en
`data/eligibility/sources/<sourceId>.txt` normalizado del worktree; comprueba
G11 (ninguna cita de rango >2 en `requirements`/`uncoveredRequirements`/
`amount`/`referenceDateCitation`) y los metadatos de snapshot (existencia,
`url` coincidente, `textSha256` = sha256 del `.txt`, y **bytes reales** en
`F:\AgentState\datawardsmadrid\snapshots\<sha256>.<ext>` con sha256
coincidente). (2) `F:\Temp\datawardsmadrid-verif6\run-golden.ts`:
`ruleSetSchema` + `goldenPersonaSchema` + `evaluateRuleSet` con ctx
`{today: gp.today, catalog: questions.json, parameters: parameters.json}` del
propio worktree (ambos byte-idénticos a `main`); compara veredicto,
`deadline.state`, `blockers`, `missingFields`, pin `rulesVersion` y
`selfCheck` I1–I10. (3) `F:\Temp\datawardsmadrid-verif6\probes.ts`:
contraejemplos sobre requisitos hard (falsos negativos) y softs. (4)
`F:\Temp\datawardsmadrid-verif6\boundaries.ts`: detección de extractos
cortados a media palabra (el defecto visto en la ola 5). (5) Lectura de
afinidad claim↔extracto en los `.txt` (extracto presente pero sobre otra cosa
= KO) verificando en contexto los arts. citados. (6)
`tsx scripts/eligibility-validate.ts --today 2026-10-05` con
`--rules-dir`/`--sources-dir`/`--catalog-dir`/`--parameters` apuntando a cada
worktree. (7) Comparación de alias de fuentes (`…-orfandad` vs original
`-viudedad`).

**Resultado global**: 117 citas → **0 extractos ausentes, 0 hashes
incorrectos, 0 violaciones G11, 0 cortes a media palabra**. Todos los
snapshots nuevos tienen bytes reales en el store con `sha256` coincidente y
`textSha256` = sha256 del `.txt`. `eligibility-validate --today 2026-10-05`
→ **0 errores** en los 32 rulesets de cada worktree (los 32 avisos son G10
`humanReview: pending`, esperado en esta fase). Los **8 goldens reproducen**
veredicto y `deadlineState` esperados, con `selfCheck` PASS y pins
`rulesVersion` = 1 = fichero v1 en los 5 casos. `questions.json` y
`parameters.json` son byte-idénticos a `main` en los 5 worktrees (ninguna ola
modificó el catálogo). Ningún slug colisiona con reglas existentes en `main`;
`renta-activa-insercion` sí tiene ficha en `data/catalog/benefits/` (correcto:
sin `standalone`), las otras 4 son `standalone: true` con fuente rango 1
(G2). Todas las reglas llevan `verification` ausente o `pending` ⇒ G12 las
mantiene fuera del bundle hasta este dictamen (correcto).

| Ayuda | Dictamen | Motivo principal |
|---|---|---|
| pension-jubilacion-contributiva | **OK** (con observaciones) | 29 citas íntegras y afines; DT 7ª (66a10m/65+38a3m en 2026), art. 206 bis.2 (suelo 52), arts. 205–215 y RD 241/2026 verificados en contexto; golden reproduce `posible`+`ROLLING`. El hard `edad-minima-52` es defendible: en el Régimen General —ámbito declarado por la ficha— el suelo es absoluto (verificado); el residuo <52 pertenece a regímenes especiales fuera de la ficha y está avisado en el propio label/blocker |
| pension-orfandad | **OK** (con observaciones) | 22 citas íntegras; <21/incapacitado/<25-SMI, +52 % orfandad absoluta, prestación violencia 70 % BR + límite 75 % SMI, 20 % BR, mínimos RD 241, límite 100 % y preferencia — todo en contexto; alias Decreto 3158 byte-idéntico al original `-viudedad`; 3 goldens reproducen (rama `dependents` y U de `unasked` incluidas); todo soft ⇒ ningún falso negativo posible (probado) |
| pension-incapacidad-permanente | **OK** (con observaciones) | 27 citas íntegras; 24 mensualidades (Dto 1646/1972 art. 9), 55 % (Orden 1969 art. 15.2), 100 % (art. 17), GI 45 %+30 % (art. 196.4), bandas art. 195.3, BR 96/112, renombre a los 67 (art. 200.4) — todo en contexto; 2 goldens reproducen (el de 70 años demuestra soft F ⇒ `posible`); todo soft ⇒ sin falsos negativos |
| cese-actividad-autonomos | **OK** | 18 citas íntegras y afines; 70 % BR con excepción 50 %, topes 175/200/225 % IPREM, mínimos 107/80 %, 12-en-24 dentro de 48, escala art. 338.1 literal, «último día del mes siguiente», mutua (art. 337.1), voluntariedad (331.2.a) — todo en contexto; golden reproduce `posible`+`ROLLING`; único requisito evaluable es soft (probado: asalariado/desempleado ⇒ `posible`, nunca `no_cumple`) |
| renta-activa-insercion | **OK** (con observaciones) | 21 citas íntegras; derogación confirmada — DD única.4 RDL 2/2024 + DF 14.ª.2 (en vigor 01/11/2024) y DT 3.ª.1 (derechos conservados) — ⇒ `window` CLOSED correcto (no recurrente); colectivos del art. 2 verificados: ≥45 + 12 m inscripción, discapacidad ≥33 %, emigrante retornado, víctima VG/doméstica — **sin terrorismo/trata/ex-presos** (el encargo los pedía; el texto del RD no los tiene); 80 % IPREM y carencia 75 % SMI confirmados; golden reproduce `posible`+`CLOSED` |

---

## 1. pension-jubilacion-contributiva — OK (con observaciones)

29 citas íntegras (literal + sha256 + bytes). Verificado en el consolidado
LGSS: cuadro de la DT 7ª («2026 38 años y 3 meses o más. 65 años. Menos de 38
años y 3 meses. 66 años y 10 meses. A partir del año 2027 38 años y 6 meses o
más. 65 años. Menos de 38 años y 6 meses. 67 años.» — literal), art. 205.1.b
(15 años / 2 en los 15 previos), 205.3 (sin alta con edad+cotización), 206.1
(penosos) y 206 bis (discapacidad ≥65 % o ≥45 % patologías; **206 bis.2:
«en ningún caso… edad inferior a la de cincuenta y dos años»** — leído en
contexto), 207.1 (involuntaria −4a/33a/6 m demanda/causas tasadas), 208.1
(voluntaria −2a/35a), 210.1 (50 % primeros 15 años) y 210.2.a (+4 %/año
demorada), 212 (imprescriptible, 3 meses), 213.1 (incompatible) y 214.1
(activa); RD 241/2026: cuadro Anexo I (17.592,40/13.106,80/12.441,80 ≥65;
17.592,40/12.262,60/11.590,60 <65; 26.385,80 procedente de GI), art. 10.1.b
(11.013,00 €/año límite rentas del complemento) y art. 3.1 (3.359,60 €/mes ·
47.034,40 €/año máxima) — todo literal y afín. `standalone: true` correcto
(sin ficha en catálogo). Golden `gp-jubilacion-leganes` reproduce `posible` +
`ROLLING` + `blockers []` + `missing []` + pin v1 ✓. Simulador oficial citado
a `sede-segss-pensiones` (rango 3, papel correcto).

**Pregunta del encargo — `edad-minima-52` hard (falsos negativos):**
reproducido: `age 45/51/30` ⇒ `edad-minima-52=F` ⇒ **`no_cumple`** con
`futureEligibility` (turnos a los 52: 2033/2027/2048-10-05); bandas que cruzan
52 ⇒ `insuficiente` (U); `unknown` ⇒ `insuficiente`. ¿Es el F falso para
alguien admitido por la norma? **Análisis: dentro del ámbito declarado, no.**
En el Régimen General el suelo de 52 es absoluto: el art. 206 bis.2 lo fija
para la reducida por discapacidad, y la propia Seguridad Social (gestor) lo
aplica a **todos** los coeficientes reductores del RG desde el 01/01/2008 —
la única excepción vigente son trabajadores de los **regímenes especiales**
(REMC Minería del Carbón, REM Mar) con coeficientes reconocidos antes de esa
fecha, que conservan la normativa anterior. La ficha declara explícitamente
«esta ficha describe el Régimen General» (`regimen-cotizacion`, ⚠) — el
colectivo que puede jubilarse <52 pertenece a una pensión de otro régimen, no
a la modelada. Además el label (que el motor muestra como blocker en el
`no_cumple`) avisa: «solo colectivos con coeficientes por penosidad (minería
y similares) pueden rebajarla aún más — ver ⚠». **Resolución del autor:
suficiente.** Diferencia relevante con los KO de la ola 5: allí la norma del
mismo beneficio admitía al excluido (residencia en España ≠ padrón en el
municipio; huérfano absoluto admitido por el propio art. 352.2); aquí el
<52 no existe en la pensión descrita. Si Daniel quiere riesgo residual cero,
`hard: false` cuesta una línea y el aviso seguiría apareciendo; no lo exijo.

Observaciones (no bloquean):

1. El label de `edad-minima-52` podría precisar que la excepción <52 vive en
   los regímenes especiales con coeficientes reconocidos pre-2008 (hoy dice
   «minería y similares» sin distinguir RG/RE). También `colectivos-penosos`
   lista «minería» sin notar que el carbón es régimen especial — mejora
   editorial menor.
2. `doc-anticipada-involuntaria`: el label menciona «indemnización percibida
   o demanda judicial si no la hubo» — está en el mismo bloque de la página
   pero no en el extracto citado («Documentación que acredite que el tipo de
   cese ha sido involuntario.»); extracto ampliable unas líneas. Rango 3 en
   zona de documentos: legal, solo probanza parcial.
3. `residencia-legal-extranjeros` (⚠): el label («períodos UE/convenio pueden
   sumar») excede el extracto del art. 2.1 (solo ámbito subjetivo). El resto
   está en el mismo artículo/norma; aceptable.
4. La ventana cita art. 212 LGSS (imprescriptible + retroactividad 3 meses) —
   afín y rango 1. Correcto.

## 2. pension-orfandad — OK (con observaciones)

22 citas íntegras. Verificado en contexto: art. 224.1 (<21 o incapacitado
para el trabajo **sin límite de edad y sin umbral de grado** — el encargo
decía «≥75 %» y el autor corrigió bien: eso no está en la norma), remisión al
2.º párrafo del 219.1 (cotización del causante: 500 días/5 años en alta, 15
años fuera, nada en accidente/EP), 224.3 (21–24 años: sin trabajo lucrativo o
ingresos < SMI anual; prórroga si cumple 25 en curso escolar), 224.4 (paga a
quien tiene a cargo), 224.1 3er párrafo (prestación por violencia contra la
mujer: **70 % BR** + rendimientos unidad ≤ **75 % SMI** — el autor corrigió
bien que el encargo atribuía el 70 % a la pensión), 225.1 (compatible con
renta de trabajo), 229.1-2 (suma ≤ 100 % BR; orfandad preferente — literal),
230 (imprescriptible); Decreto 3158/1966 arts. 36.1 (**20 % BR** por
huérfano) y 38 (+52 % BR si no hay beneficiario de viudedad, reparto a partes
iguales — ambos confirmados); RD 241/2026 Anexo I orfandad (4.011,00 /
7.882,00 <18 con ≥65 % / +9.931,60 absoluta repartidos — literal). La única
condición evaluable es **soft** (`edad-en-fallecimiento`): los probes
confirman que ni todo-F ni todo-U excluyen — siempre `posible`.

**Alias de fuente (encargo, punto 7):** `boe-decreto-3158-1966-orfandad` =
mismo snapshot que `boe-decreto-3158-1966-viudedad` de `main`: sha256
`581789c6…`, textSha256 `25fb3604…`, `fetchedAt` y `url` idénticos, `.txt`
byte a byte igual. Además `segss-orfandad-solicitud` comparte
`textSha256` (`31359bf3…`) con `segss-viudedad-solicitud` — son la página
común de muerte y supervivencia (documentado por el autor; el breadcrumb
dice «viudedad» pero el contenido lista los documentos de orfandad — las
citaciones a «SI SE SOLICITA PENSIÓN DE ORFANDAD…» están en contexto).

**Goldens (3, todos reproducen):** getafe (19 años ⇒ rama edad T ⇒ `posible`),
madre-mostoles (43 años, dependiente de 14 ⇒ T por la rama `dependents` —
verificado que es la rama de personas a cargo la que dispara T, coherente con
el sujeto «quien tiene a cargo al huérfano» de art. 224.4), trabajador-parla
(30 años + disability «no» + dependents `unasked` ⇒ F∨F∨U = **U** —
demuestra UNKNOWN≠NO en soft). Pins v1 = v1 ✓.

Observaciones (no bloquean):

1. `quien-solicita` (⚠): el label añade «el huérfano mayor o emancipado la
   solicita él mismo» — el art. 224.4 citado solo cubre «se abonará a quien
   tenga a su cargo». Probanza parcial (la cláusula es procedimental y de
   sentido común, pero no está en el extracto).
2. `cotizacion-causante` (⚠): el extracto es solo la remisión al 219.1; las
   cifras del label (500 días/5 años, 15 años, exención en accidente/EP) están
   en el art. 219.1 del **mismo snapshot** — extracto ampliable si se quiere
   que el solo extracto sostenga las cifras.
3. `compatibilidad-trabajo` (⚠): la restricción del tramo 21–25 («solo se
   mantiene si no trabaja o gana < SMI») viene del 224.3, no del 225.1 citado
   — el extracto prueba la compatibilidad general; matiz en el mismo título.
4. 5 snapshots capturados (`segss-orfandad-beneficiarios`, `-cuantia`,
   `-compatibilidad`, `-efectos`, `-extincion`) no declarados en `sources[]`:
   son material de revisión del autor; inertes para los gates (G3/G4 solo
   miran los declarados). Al mergear quedan huérfanos en `sources/` —
   aceptable como evidencia, pero sería más limpio dejarlos fuera del repo o
   notarlos en la hoja.
5. `doc-matricula-estudiante`: label «24 o más años» — el extracto dice
   exactamente eso (la página oficial) ✓.

## 3. pension-incapacidad-permanente — OK (con observaciones)

27 citas íntegras. Verificado en contexto: Orden 15/04/1969 art. 15.2
(**55 %** «pensión vitalicia de cuantía equivalente al 55 por 100 de la base
reguladora») y art. 17 (**100 %** «del salario real del trabajador» — el
label advierte honestamente que la norma dice «salario real»); Decreto
1646/1972 art. 9 (**24 mensualidades** a tanto alzado de la BR de la IT);
LGSS arts. 165.1 (alta/asimilada), 195.1 2º párrafo (no IP de comunes con
edad de jubilación **y** requisitos reunidos — conjunción), 195.2 (1.800 días
en 10 años), 195.3 (**bandas: <31 ⇒ ⅓ desde los 16; ≥31 ⇒ ¼ desde los 20,
mínimo 5 años, ⅕ en los 10 previos** — leídas en contexto), 195.4 (absoluta/
GI sin alta con 15 años), 196.2 (total sustituible <60), 196.4 (GI:
45 % base mínima + 30 % última base), 197.1.a (BR = bases 96 meses/112),
198.1 (total compatible si funciones no coinciden), 200.1 (el INSS declara),
200.4 (a los 67 pasa a llamarse jubilación); RD 241/2026 Anexo I IP
(26.385,80/19.660,20/18.662,00 GI; 17.592,40/13.106,80/12.441,80 absoluta y
total ≥65; 17.592,40/12.262,60/11.590,60 total 60–64; 9.662,80/9.662,80/
9.580,20 total EC <60 — todo literal). Todo soft ⇒ imposible excluir
falsamente (probado: 80 años jubilado ⇒ `posible`).

**Goldens (2, reproducen):** `gp-incapacidad-getafe` (44 años ⇒ soft T ⇒
`posible`) y `gp-incapacidad-alcala` (70 años ⇒ **soft F** ⇒ `posible` —
demuestra que el aviso no excluye, justo el diseño correcto para la
conjunción del 195.1). Pins v1 = v1 ✓.

Observaciones (no bloquean):

1. `cuantia-total-55` (⚠): el label dice «incrementable… para **mayores de
   55 años** cuando se presuma la dificultad de obtener otro empleo (IPT
   cualificada)». El extracto citado solo prueba el 55 %. El aumento «cuando
   se presuma la dificultad de obtener empleo» sí está en la propia LGSS
   (art. 196.2, in fine — mismo snapshot) **pero sin el umbral de 55 años**:
   ese umbral solo consta en la página seg-social de cuantía (rango 3,
   incitable en zona normativa) — mismo patrón que el «60 %» de viudedad en
   la ola 5, aunque aquí el label no afirma la cifra del incremento.
   Opciones: citar el 196.2 como segunda fuente del mismo label, o atenuar a
   «cuando por edad y circunstancias se presuma la dificultad» (la propia
   redacción legal).
2. `edad-inferior-jubilacion-comunes` (soft): el label usa el estado
   estacionario «67 años, o 65 con 38a6m»; hoy (oct-2026) la edad exigible
   por el art. 205.1.a) es **66a10m** (DT 7ª). Consecuencia práctica nula —
   el requisito es aviso y la banda 66a10m–67 es un resquicio de semanas —
   pero la precisión ayudaría (o ligar a `edad-ordinaria-exigible`-style).
3. `efectos-hecho-causante` (⚠): el label remite el detalle a «la ficha
   oficial» — la fecha del HC/efectos vive en la página segss (rango 3) y no
   se cita por G11. Correcto como está.
4. La ventana cita la página segss (rango 3) para el carácter a-instancia-de-
   parte — G11 lo permite (la ventana no es zona normativa) y el hecho es
   correcto.

## 4. cese-actividad-autonomos — OK

18 citas íntegras y afines; verificado en contexto en el Título V LGSS
(arts. 327–350): 330.1.a (afiliado y en alta RETA/REM), 330.1.b (cotización
mínima remitida al 338), 330.1.c (acuerdo de actividad Ley 3/2023 +
disponibilidad), 330.1.d (edad ordinaria solo si cese definitivo, salvo sin
cotización suficiente), 330.1.e (al corriente de cuotas, regularización 30
días naturales), 330.2 (garantías laborales con trabajadores a cargo),
331.1 (situación legal de cese — causas), 331.2.a (no cese voluntario, salvo
333.1.b), 332.1 (declaración jurada + documentos de la causa), 337.1
(solicitud a la mutua/ISM), 337.4-5 (último día del mes siguiente; fuera de
plazo se descuentan días, no se pierde el derecho), **338.1 escala literal**
(12–17 m → 4; 18–23 → 6; 24–29 → 8; 30–35 → 10; 36–42 → 12; 43–47 → 16;
≥48 → 24 — tabla presente en el `.txt`), **339.2 (70 % BR; 50 % en
331.1.a).4.º-5.º y suspensión parcial por fuerza mayor)**, **339.3 (topes
175 %, 200 % con 1 hijo, 225 % con 2+ del IPREM; mínimos 107 % con hijos /
80 % sin)** y 342.1 (incompatible con trabajo por cuenta propia). El único
requisito evaluable (`autonomo-alta-reta`, `employmentStatus eq "autonomo"`)
es **soft** — correcto: quien ya cesó se declara «desempleado» y no se le
puede excluir (probado: asalariado/desempleado ⇒ F ⇒ `posible`, nunca
`no_cumple`). Ventana `rolling` + cita rango 3 al plazo operativo — correcto
(G11 permite rango 3 en window; el requisito `plazo-solicitud` cita el 337.4
de rango 1). `standalone: true` correcto. Golden reproduce `posible` +
`ROLLING` + pin v1 ✓.

Observación menor (no bloquea): `incompatibilidades` (⚠) describe el tope SMI
de la pluriactividad que está en el art. 342.3, no en el 342.1 citado — mismo
artículo, extracto puntual solo de la primera frase. El detalle está en la
hoja del autor; extracto ampliable.

## 5. renta-activa-insercion — OK (con observaciones)

21 citas íntegras. Verificado en los `.txt`:

- **Derogación**: `boe-rdl-2-2024-asistencial` contiene la DD única.4
  («Queda derogado el Real Decreto 1369/2006…», literal) y la DF 14.ª.2
  fija la entrada en vigor de «los apartados dos y cuatro de la disposición
  derogatoria» el **1 de noviembre de 2024**; la DT 3.ª.1 conserva los
  derechos de quien a esa fecha la hubiera solicitado, la percibiera o la
  tuviera suspendida. El propio consolidado del RD 1369/2006 lleva el aviso
  «Norma derogada, con efectos desde el 1 de noviembre de 2024». ⇒
  `closesAt 2024-10-31` + `recurrence "none"` ⇒ **CLOSED definitivo**
  (correcto: no es una ventana anual, no volverá a abrir — distinto del
  `CLOSED_RECURRING` de las convocatorias). La página SEPE lo confirma:
  «A partir del 1 de noviembre de 2024 se suprime el acceso a la Renta Activa
  de Inserción» + derechos conservados + reincorporación 15 días hábiles.
- **Colectivos (punto 6 del encargo)**: el art. 2 del RD 1369/2006 contiene
  exactamente ≥45 años + 12 meses de inscripción ininterrumpida (2.1.a-b),
  minusvalía ≥33 % (2.2.a), emigrante retornado <12 m + ≥6 m trabajados fuera
  (2.2.b) y víctima de violencia de género o doméstica sin convivir con el
  agresor (2.2.c). **No contiene terrorismo, trata ni ex-presos** (búsqueda
  directa en el `.txt`: cero menciones; el autor corrigió bien el encargo).
- **Carencia**: 75 % del SMI mensual sin extras (2.1.d) + variante per cápita
  de la unidad (mismo apartado). La condición usa el proxy
  `incomeAnnual ≤ SMI_MENSUAL × 9` (75 % × 12 = 1.221 × 9 = 10.989 €/año en
  2026 — parámetro vigente RD 126/2026 cubre 2026-10-05, I9 PASS) — soft,
  coherente con UNKNOWN≠NO.
- 80 % IPREM (art. 4.2), solicitud+compromiso+documentación (art. 11.1),
  límites 365 días/3 derechos (art. 2.4), reincorporación y consumo de días
  (art. 9.4-5) — todo literal.
- Ficha de catálogo existente (`renta-activa-insercion`, importada) ⇒ sin
  `standalone`, G2 satisfecho además por dos fuentes rango 1 propias.

Todo soft ⇒ ningún perfil puede dar `no_cumple` (probado: asalariado 30 años
con ingresos medios ⇒ los 4 requisitos en F ⇒ `posible` + CLOSED). Golden
`gp-rai-mostoles` reproduce `posible` + `CLOSED` + pin v1 ✓.

Observaciones (no bloquean):

1. `colectivo` (requirements, soft): el label incluye «violencia … **sexual**
   …» — el art. 2.2.c citado solo dice «de género o doméstica»; la violencia
   sexual la añade la sede SEPE (y el nuevo subsidio del RDL 2/2024, otra
   figura). Es label de aviso con divulgación explícita en el uncovered
   `victima-violencia` («la sede del SEPE incluye también la violencia
   sexual»), así que queda documentada; si se quiere pureza, «género o
   doméstica (y sexual, según la sede SEPE)» es la formulación exacta.
2. `doc-solicitud-compromiso`: el label dice «15 días **hábiles**» — el RD
   dice «15 días» (art. 9.4-5) y «hábiles» es la formulación de la sede SEPE.
   Trivial.
3. La ventana cita el precepto derogatorio (rango 1) — ejemplar: el `CLOSED`
   descansa en norma, no en la página del SEPE.

## Hallazgos transversales

- **`verification` ausente/pending en las 5 reglas + `humanReview: pending`**:
  G12 las excluye del bundle hasta `verification.ok` + informe —
  comportamiento esperado; al aprobar este informe, `verification.report`
  debe apuntar a `evidence/2026-10-05-F3/verificacion-ola-6.md`.
- **Hojas del autor presentes** en cada worktree
  (`evidence/2026-10-05-F3/ola-6-*.md`): correctas y honestas — documentan
  las correcciones al encargo (edad 66a10m vs «66y6m»; orfandad sin «75 %»;
  RAI derogada no convocatoria; 52 y penosos) — copiar a `main` con el merge.
- Las 4 reglas nuevas estatales (`standalone`) no exigen territorio —
  consistente con el precedente viudedad/subsidio-52/PNC (gestión estatal
  INSS/SEPE disponible a residentes en la CM).
- Ningún `parametersUsed` fuera de `SMI_MENSUAL` (RAI); cubre 2026-10-05.

---

## Hoja de muestreo para Daniel (2 puntos por ayuda)

| Ayuda | Punto a comprobar | Dónde |
|---|---|---|
| pension-jubilacion-contributiva | Edad ordinaria 2026 = 66 años y 10 meses (65 con ≥38a3m); y «en ningún caso… edad inferior a la de cincuenta y dos años» | LGSS consolidada, DT 7ª (cuadro) y art. 206 bis.2 — https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| pension-jubilacion-contributiva | Pensión inicial máxima 2026 = 3.359,60 €/mes (47.034,40 €/año); mínimas de jubilación ≥65 = 17.592,40/13.106,80/12.441,80 € | RD 241/2026, art. 3.1 y Anexo I — https://www.boe.es/eli/es/rd/2026/03/25/241 |
| pension-orfandad | Beneficiarios: <21 o incapacitados; 21–24 solo sin trabajo lucrativo o con ingresos < SMI | LGSS arts. 224.1 y 224.3 — https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| pension-orfandad | Cuantía 20 % BR por huérfano; orfandad absoluta +52 % si no hay viudedad | Decreto 3158/1966, arts. 36.1 y 38 — https://www.boe.es/eli/es/d/1966/12/23/3158/con |
| pension-incapacidad-permanente | Parcial = 24 mensualidades a tanto alzado; total = 55 % BR; absoluta = 100 % | Decreto 1646/1972 art. 9 (https://www.boe.es/eli/es/d/1972/06/23/1646/con) y Orden 15/04/1969 arts. 15.2 y 17 (https://www.boe.es/eli/es/o/1969/04/15/(1)/con) |
| pension-incapacidad-permanente | Cotización: <31 años ⇒ ⅓ desde los 16; ≥31 ⇒ ¼ desde los 20 (mín. 5 años, ⅕ en los últimos 10) | LGSS art. 195.3 — https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| cese-actividad-autonomos | 70 % de la BR (50 % en 331.1.a.4.º-5.º), topes 175/200/225 % IPREM, mínimos 107/80 % | LGSS art. 339 — https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| cese-actividad-autonomos | 12 meses cotizados por cese dentro de los 24 previos (ventana de 48) y escala de duración | LGSS arts. 330.1.b + 338.1 — https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| renta-activa-insercion | Derogada con efectos 01/11/2024; derechos conservados a quien la solicitó/percibía/suspendía | RDL 2/2024, DD única.4 + DT 3.ª — https://www.boe.es/eli/es/rdl/2024/05/21/2/con |
| renta-activa-insercion | Colectivos reales del art. 2 (≥45 + 12 m inscritos; discapacidad ≥33 %; emigrante retornado; víctima VG/doméstica) — sin terrorismo/ex-presos | RD 1369/2006, art. 2 — https://www.boe.es/eli/es/rd/2006/11/24/1369/con |

**Comandos reproducibles** (cwd `F:\_Proyectos\datawardsmadrid`):

```
npx tsx F:/Temp/datawardsmadrid-verif6/check-citas.ts
npx tsx F:/Temp/datawardsmadrid-verif6/run-golden.ts
npx tsx F:/Temp/datawardsmadrid-verif6/probes.ts
npx tsx F:/Temp/datawardsmadrid-verif6/boundaries.ts
npx tsx scripts/eligibility-validate.ts --rules-dir <wt>/data/eligibility/rules \
  --sources-dir <wt>/data/eligibility/sources --catalog-dir <wt>/data/catalog/benefits \
  --parameters <wt>/data/eligibility/parameters.json --today 2026-10-05
```
