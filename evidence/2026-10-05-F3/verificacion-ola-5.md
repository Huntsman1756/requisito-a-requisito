# Verificación independiente — ola 5 (ADR-040/044)

Verificador independiente: no participé en la redacción ni en el merge.
Fecha: 2026-10-05. Ámbito: los 5 RuleSet de la ola 5 en `main` (commit
`61982ea` + `276a618`), sus fuentes snapshot, sus goldens y sus hojas.

**Método.** (1) `F:\Temp\datawardsmadrid-verif5\check-citas.ts` (tsx, repo
real): recorre las 118 citas de los 5 rulesets con la `normalizeText` **real
del motor** (no una réplica); comprueba `sha256(normalizeText(excerpt))` ===
`excerptSha256` e inclusión literal en
`data/eligibility/sources/<sourceId>.txt` normalizado; comprueba G11
(ninguna cita de rango >2 en `requirements`/`uncoveredRequirements`/`amount`)
y metadatos de snapshot (existencia + URL). (2)
`F:\Temp\datawardsmadrid-verif5\run-golden.ts`: `ruleSetSchema` +
`goldenPersonaSchema` + `evaluateRuleSet` con `ctx {today: gp.today, catalog:
public/datos/elegibilidad/questions.json, parameters:
data/eligibility/parameters.json, invariantsEnabled: false}`; compara
veredicto, `deadline.state`, `blockers`, `missingFields` y el pin
`expectations[0].rulesVersion`. (3) `F:\Temp\datawardsmadrid-verif5\probes.ts`:
contraejemplos sobre requisitos hard (falsos negativos). (4) Lectura de
afinidad claim↔extracto en los `.txt` (extracto presente pero sobre otra cosa
= KO). (5) Diff worktree→main por cada regla. (6)
`tsx scripts/eligibility-validate.ts --today 2026-10-05` en el repo real.

**Resultado global**: 118 citas → **0 extractos ausentes, 0 hashes
incorrectos, 0 violaciones G11**. `eligibility-validate --today 2026-10-05` →
**0 errores** en los 31 rulesets (los errores G1/G4/G11 que el verificador de
la ola 4 vio en WIP ya están resueltos); todos los `humanReview` quedan en
`pending` (correcto: son avisos, no errores). Los 5 goldens reproducen
veredicto y `deadlineState` esperados; **2 goldens llevan el pin
`rulesVersion` desactualizado**. `git status` limpio; las 5 reglas están en
`main`.

| Ayuda | Dictamen | Motivo principal |
|---|---|---|
| pension-no-contributiva | **KO** | `residencia-espana-2y` (hard) produce `no_cumple` falso reproducido a quien se mudó de municipio hace <2 años pese a residir legalmente en España décadas (la norma cuenta residencia en España, no padrón en el municipio actual); `declaracion-anual-ingresos` afirma plazos («antes del 1 de abril», «30 días») que no están en la fuente citada (solo en la sede, rango 3, incitable en zona normativa) |
| subsidio-desempleo | **OK** (con observaciones) | 20 citas íntegras y afines; todo soft ⇒ no puede excluir falsamente (probado); identidad correcta frente a `subsidio-mayores-52` |
| asignacion-hijo-a-cargo | **KO** | Pin del golden v1 vs fichero v3 (recitación G11 merge sin re-pinear); `causante-con-discapacidad` (hard) excluye a huérfanos absolutos <18 con discapacidad que el propio art. 352.2.a admite como beneficiarios directos — `no_cumple` falso reproducido y en contradicción con su propio `uncoveredRequirements`; exención de límite de ingresos y «45 días» no probados por los extractos citados |
| pension-viudedad | **KO** | `edad-65-cuantia`: el extracto citado (Dto. 3158/1966, art. 31) solo contiene 52 %/70 % — el «60 % desde los 65» del label no está en esa norma consolidada (solo en la página seg-social, rango 3, prohibida en `requirements`); pin del golden v1 vs fichero v2 |
| madrid-ayudas-alquiler-plan-estatal | **OK** (con observaciones) | Golden reproduce `posible` + `CLOSED_RECURRING`; el hard `ingresos-max-5iprem` no puede excluir falsamente (con las bandas reales nunca da F, solo T/U); dos extractos cortados a media palabra y un «n.º de BOCM» erróneo (245 vs 246) en el título de una fuente, introducido en el merge |

---

## 1. pension-no-contributiva — KO

26 citas íntegras (literal + sha256). Golden `gp-pnc-carabanchel` reproduce
`posible` + `ROLLING` + `blockers []` + `missing []` con pin v1 = fichero v1
✓. Verificado en fuentes: RD 241/2026 art. 21.1 («8.803,20 euros anuales»,
literal) y art. 21.2 (complemento alquiler 525 €); ficha 020101 de la Cartera
(«Ámbito territorial… Comunidad de Madrid, para los beneficiarios residentes
en la misma. La prestación PNC abarca todo el territorio español»; «Plazo de
concesión 90 días»; declaración anual como causa de suspensión); LGSS arts.
363 (18–64, 5 años, 65 %, carencia + acumulación con ×2,5 en 363.3),
364 (mínimo 25 %), 367 (baremo), 369.1 (65 años, 10 años, 2 inmediatos),
371 (efectos día 1 del mes siguiente). `standalone: true` correcto (sin ficha
en catálogo). Ventana rolling citada a la sede (rango 3, papel legal según
docs/08). Identidad: gestión autonómica bien acotada y el label avisa que la
pensión existe en todo el Estado — patrón aceptado (mismo que
`prestacion-cuidador-no-profesional`).

**Defectos:**

1. **`residencia-espana-2y` (hard) — falso negativo reproducido.** La norma
   exige residencia legal **en España** (10 años desde los 16 en jubilación / 5
   en incapacidad, con 2 consecutivos e inmediatamente anteriores — en
   **cualquier** municipio). La condición usa `residenceMonths ≥ 24`, derivado
   de `q-residenceSince` («¿Desde cuándo estás empadronado **ahí**?», municipio
   actual). Reproducido: perfil 70 años, `residenceSince` 09/2025 (se mudó a
   Madrid tras 30 años en otro municipio español) ⇒ `residencia-espana-2y=F`
   ⇒ **`no_cumple`**, siendo plenamente elegible. El label no advierte que el
   tiempo en otros municipios cuenta. El propio autor lo anticipa en la hoja y
   ofrece bajarlo a `hard: false`. **Por el criterio del encargo («ningún
   requisito hard puede descartar a alguien que la norma sí admite»), es KO.**
   Mismo patrón que `residencia-un-ano` de la RMI (ola 2, marcada como errata)
   y `residencia-espana-1a` del IMV (ola 1, aceptada): si el patrón se
   considera aceptable por precedencia, que quede como deuda explícita del
   catálogo; si no, la corrección aquí es `hard: false` (cambio de una línea,
   el autor ya lo autorizó como admisible).
2. **`declaracion-anual-ingresos` — probanza insuficiente para los plazos.**
   El label afirma «declaración anual de ingresos **antes del 1 de abril** cada
   año y comunicar cualquier cambio de convivencia o ingresos en **30
   días**». El extracto citado (ficha 020101, «Causas de suspensión») solo
   sostiene la obligación anual y la de comunicar variaciones — **ni «1 de
   abril» ni «30 días» aparecen en el `.txt` de la Cartera** (verificado por
   búsqueda directa). Esos plazos solo constan en la sede de la CM (rango 3) y
   la página informativa (rango 4): incitables en `uncoveredRequirements` por
   G11. → Recortar el label a lo que la cita sostiene, o añadir la Orden
   PRE/3113/2009 (rango 1) como fuente.
3. **`edad-65-o-discapacidad` — falso negativo de borde (errata).** La norma
   admite «discapacidad **o enfermedad crónica** ≥65 %» (art. 363.1.c, citado);
   la pregunta `q-disability` solo recoge discapacidad. Quien tiene enfermedad
   crónica reconocida sin certificado de discapacidad y responde «no» ⇒ F ⇒
   `no_cumple`. Caso raro; anotar en label/uncovered si se retoca el fichero.

Observaciones menores: `residencia-legal-extranjeros` y
`doc-padrones-historicos` mezclan un dato (5 años en incapacidad) que está en
el art. 363.1.b citado, aunque el extracto puntual de documents viene de la
sede de jubilación (que solo menciona «los 10 años») — aceptable pero el
extracto de documento no cubre la mitad del label. Los dos pagas extra de
junio/noviembre del label `efectos-mes-siguiente` tampoco están en el extracto
del art. 371 (sí en la ficha: «Periodicidad Mensual, con dos pagas
extraordinarias»).

## 2. subsidio-desempleo — OK (con observaciones)

20 citas íntegras y afines. Golden `gp-subsidio-getafe` reproduce `posible` +
`ROLLING` con pin v1 = v1 ✓. Verificado en el consolidado LGSS: art. 274.1
(beneficiarios; 274.1.a «agotado la prestación», «menor de 45 sin
responsabilidades ⇒ prestación ≥360 días», 274.1.b «situación legal de
desempleo… noventa días», la cláusula de tiempo parcial in fine), 274.2 (sin
derecho a contributiva + incompatibilidad + carencia), 274.3 (remisión al
art. 280), 274.4 (inscripción + acuerdo), 275.1-2 (75 % SMI propio y per
cápita de la unidad), 276.1 (6 meses ⇒ denegación; nacimiento del derecho),
277 (trimestres prorrogables) y 278 (**95 %/90 %/80 % del IPREM por tramos de
días** — la nota del encargo «80 % IPREM» queda mejorada por el dato real
tramos). Cifras del label: 915,75 €/mes = 1.221 × 0,75 ✓ y ≈10.989 €/año = 9 ×
SMI_MENSUAL (parámetro vigente RD 126/2026) ✓.

- **Ningún falso negativo posible**: ambos requisitos son soft; probado
  `autónomo + banda [25200,∞)` ⇒ `posible` (nunca `no_cumple`). Coherente con
  UNKNOWN ≠ NO y con la vía alternativa de responsabilidades familiares.
- **Identidad**: `subsidio-desempleo` (art. 274.1 general: agotamiento +
  cotizaciones insuficientes) vs `subsidio-mayores-52` (art. 280) — prestaciones
  distintas, con remisión explícita en `remision-mayores-52`. No hay solape
  incorrecto; la ficha de catálogo `subsidio-cotizaciones-insuficientes` (nivel
  2) queda cubierta por este RuleSet genérico sin renombrado — decisión
  documentada y razonable.
- `window.rolling: true` + `businessDays: true`: correcto (prestación
  permanente; el plazo de 6 meses regula el derecho, no una convocatoria).
  `businessDays` es metadato inerte en `deadlineState`.

Observaciones (no bloquean): (a) `hecho-causante` cita «274.1.a y b» pero el
extracto solo cubre la vía (b); la (a) está en el mismo artículo — ampliar el
extracto a «a) Haber agotado la prestación por desempleo.» sería más probatorio.
(b) `doc-irpf` `mandatory: true` corresponde a la lista de la sede — OK.
(c) El golden omite `blockers`/`missingFields` (opcionales en el esquema) — sin
efecto.

## 3. asignacion-hijo-a-cargo — KO

17 citas íntegras (literal + sha256) y G11 formal cumplido (el merge recitó las
tres citas de rango 3 a la LGSS — correcto como movimiento). Verificado: Ley
19/2021 DT 6.ª («no podrán presentarse nuevas solicitudes… quedará a
extinguir», literal); RD 241/2026 art. 24 (1.000,00 / 5.962,80 / 8.942,40 €/año
y límites 15.356,00 / 23.109,00 / +3.745,00 «por cada hija o hijo a cargo a
partir del cuarto, este incluido» — todo literal); LGSS arts. 351.a (≥33 % <18,
≥65 % ≥18, «a cargo» + 100 % SMI), 352.1.a-c y .2, 354, 355, 361.2 — todos
confirmados en el `.txt`. Golden reproduce `posible` + `ROLLING`.

**Defectos:**

1. **Pin del golden desactualizado**: `gp-asignacion-mostoles` atestigua
   `rulesVersion: 1`; el fichero es **v3** (nació ya recitado en `2f44a8f`; el
   diff worktree→main muestra la recitación G11 segss→LGSS como causa del
   bump). El veredicto reproduce igualmente, pero el oráculo ya no señala la
   versión vigente → re-pinear a 3 tras corregir lo demás.
2. **`causante-con-discapacidad` (hard) — falso negativo reproducido.**
   Reproducido: perfil de 16 años con discapacidad propia (`gte33`), sin
   dependientes ⇒ F ⇒ **`no_cumple`**. Pero el art. 352.2.a LGSS reconoce a los
   **huérfanos de padre y madre** (<18 con ≥33 %) como beneficiarios directos,
   y el 352.2.b a los menores abandonados no acogidos — ambos documentados en
   el propio `uncoveredRequirements.beneficiarios-especiales` de la regla.
   Contradicción interna: el texto admite lo que la condición excluye. → Una
   vía adicional `all(age <18? — el catálogo no distingue huérfano) ...` no es
   modelable con las preguntas actuales; la alternativa honesta es quitar el
   hard o advertirlo — como está, excluye a personas admitidas por la norma.
3. **`limite-ingresos` — probanza parcial.** El label afirma «para solicitudes
   nuevas por hijo o menor con discapacidad NO se exige límite de ingresos» —
   **verdadero** («No se exige límite de ingresos para el reconocimiento de la
   condición de beneficiario por hijo o menor acogido a cargo con discapacidad»
   — está literal en `segss-asignacion-hijo-cargo.txt`), pero la cita es RD
   241/2026 art. 24.2, cuyo extracto solo prueba las cifras del límite (que
   sí están), no la exención. La exención solo tiene fuente rango 3
   (incitable). → Mantener las cifras citadas y mover/atemperar la frase de
   exención (p. ej. como parte del label del `amount` o con fuente rango ≤2 que
   la contenga — el art. 352.1 consolidado ya no contiene el requisito de
   rentas para esta modalidad, lo que es una prueba negativa aceptable si se
   formula así).
4. **`efectos-y-variaciones` — probanza parcial.** «Resolución máxima de 45
   días» y «comunicar variaciones en 30 días»: el extracto citado (art. 355.1)
   solo prueba la obligación de declarar variaciones; los plazos concretos
   están en la ficha seg-social (rango 3) y en el reglamento — no en el
   extracto. Recortar el label o citar la norma que los fija.
5. **La hoja `ola-5-asignacion.md` no está en `evidence/2026-10-05-F3/` de
   main** — existe y es buena en
   `F:\AgentState\worktrees\datawardsmadrid\ola-5-apoyo-joven\evidence\2026-10-05-F3\ola-5-asignacion.md`
   (documenta la vía del hijo adulto y la convención
   `disability ∈ {yes,unknown,declined}`). Copiarla a main para trazabilidad.

Observaciones: `convivencia-dependencia-economica` — el extracto se corta antes
de «y que los ingresos anuales del causante… no superen el 100 por cien del
SMI», que **sí está** en el mismo art. 351.a (verificado); ampliar el extracto
para cubrir el umbral del label (el «17.094 €» = 1.221 × 14 es correcto). La
vía propia `age ≥18 && disability gte33` cubre 352.2.c (hijo adulto) — correcta
aunque laxa en el grado (cubierto por `grado-discapacidad-baremo`).

## 4. pension-viudedad — KO

17 citas íntegras. Golden reproduce `posible` + `ROLLING` (ambas soft T).
Verificado en el consolidado LGSS: art. 219.1 (cónyuge superviviente; 500 días
/5 años en alta, 15 años fuera de alta, exento por accidente o EP — completo y
literal), 219.2 (1 año de matrimonio o hijos comunes), 220.1 (pensión
compensatoria + vía violencia de género — ambas en el artículo citado), 221.2
(convivencia ≥5 años + inscripción/documento ≥2 años — todo en el artículo),
222 (prestación temporal 2 años), 223.2 (extinción por nuevo vínculo, con
remisión a excepciones reglamentarias), 230 (imprescriptibilidad + 3 meses de
retroactividad) y el cuadro «Viudedad» del Anexo I del RD 241/2026
(9.931,60 / 12.262,60 / 13.106,80 / 17.592,40 €/año — literal). Todo soft ⇒
nadie es excluido (probado). Ventana rolling por imprescriptibilidad: afín.

**Defectos:**

1. **`edad-65-cuantia` — extracto no probatorio para el claim distintivo.**
   El label afirma «desde los 65 puede subir al **60 %** si además no tienes
   otra pensión pública, no trabajas y tus rentas no superan el límite». La
   cita es al Decreto 3158/1966, art. 31 — cuyo texto consolidado (snapshot,
   última actualización 21/03/2009) contiene **solo** el 52 % general y el 70 %
   con cargas familiares; el 60 %/≥65 años no está en esa norma (regla vigente
   desde 01/01/2019; su única fuente citada posible es la página seg-social,
   rango 3 prohibido en `requirements`, o la norma que la creó — la recitación
   G11 del merge eligió un documento que no la contiene). Hecho real pero sin
   probanza de rango ≤2 → el label debe rebajarse a «52 % general; 70 % con
   cargas familiares» (que sí está en el art. 31) o citarse la fuente
   normativa correcta.
2. **Pin del golden**: `gp-viuda-vallecas` atestigua v1; el fichero es **v2**
   (el bump corresponde a la recitación). Re-pinear a 2.
3. **Hoja ausente en main**: `ola-5-viudedad.md` existe en
   `F:\AgentState\worktrees\datawardsmadrid\ola-5-subsidio-paro-parcial\evidence\2026-10-05-F3\ola-5-viudedad.md`
   y **desincronizada** respecto al fichero (documenta las citas rango 3 del
   worktree; main ya cita rango 1). Copiar + actualizar la tabla para reflejar
   el estado mergeado.
4. Observación: `cargas-familiares-70` — el extracto corta en el inicio del
   apartado; el label (70 %, principal ingreso, unidad ≤75 % SMI, hijos <26 o
   incapacitados) está completo en el mismo art. 31.2 — extracto ampliable.
   `extincion-nuevo-vinculo` («p. ej. mayores de 61 años») es detalle
   reglamentario no contenido en el 223.2 citado — el extracto cubre la
   extinción y la remisión «excepciones reglamentarias», suficiente.

## 5. madrid-ayudas-alquiler-plan-estatal — OK (con observaciones)

38 citas íntegras. Golden `gp-alquiler-vallecas` reproduce `posible` +
`CLOSED_RECURRING` ✓ con pin v1 = v1. Verificado: RD 42/2022 art. 27.1
(mayores de edad; contrato LAU/cesión/habitación ya firmado; suma de rentas de
la unidad ≤3×IPREM, 4× FN general/discapacidad/terrorismo, 5× FN especial o
discapacidad ≥33 %; renta ≤600 €/300 €), art. 27.2 (no propiedad, sin vínculo
con el arrendador), art. 30 («hasta el 50 % de la renta»); Orden 3479/2022
arts. 2 (gestión CM), 6.1 a–g (los 7 sectores, literales: FN, monoparental con
cargas, VG, terrorismo, discapacidad, desempleo agotado de todos, todos ≥65),
6.2 (nacionalidad, titularidad, residencia habitual, 0,5×IPREM con exenciones
b/c/f — **la lectura del label es correcta**: el mínimo aplica a a/d/e/g), 7
(incompatibilidades incl. Renta Básica + excepciones de vulnerabilidad/PNC/IMV
— presentes en el artículo); convocatorias 2023/2024/2025 con plazos literales
(1/11–15/12, 1/11–15/12, 4/11–15/12) ⇒ CLOSED_RECURRING correcto con ≥2
convocatorias anuales consecutivas.

- **`ingresos-max-5iprem` (hard) no excluye falsamente — verificado.** Con las
  bandas reales de `q-income` ([0,8400]/[8400,16800]/[16800,25200]/[25200,∞))
  la condición solo puede dar T o U (la banda abierta [25200,∞) ⇒ U por
  `range_straddles`, nunca F: probado ⇒ `posible`, no `no_cumple`). Incluso si
  existiera una banda >42.000 €, un F sería seguro (ingresos propios >5×IPREM ⇒
  la unidad también los supera). Conservador en la dirección correcta; el
  detalle de umbrales por supuesto queda en `uncovered`. Cumple el punto 8 del
  encargo.
- **Identidad**: frente a `madrid-bono-alquiler-joven` (concesión directa,
  ≤35 años, ≤3×IPREM, rolling desde 03/02/2025) son programas claramente
  distintos (este es la línea general por sectores preferentes del mismo
  convenio, en convocatoria anual). Sin solape incorrecto; ambos pueden
  aparecer para un joven con sector — correcto.
- `vivienda-en-madrid` hard y `mayoria-edad` hard: F seguros (fuera de CM ⇒
  `no_cumple`; 17 años ⇒ `no_cumple` — reproducidos).

**Observaciones (no bloquean):**

1. **Título de fuente erróneo introducido en el merge**:
   `bocm-20231016-8-alquiler-2023` dice «BOCM n.º 245»; el boletín real es
   **n.º 246** (cabecera del PDF: «B.O.C.M. Núm. 246»; el worktree lo tenía
   bien). Metadato descriptivo, no extracto — corregir el `title`.
2. Extractos cortados a media palabra, justo antes de la cláusula probatoria:
   `sectores-restantes` («…edades iguales o **su**» — corta antes de
   «periores a 65 años», por la separación «su- periores» del PDF) y
   `incompatible-otras-ayudas` («Renta Básica de **Eman**…» — corta antes de
   las excepciones). Literales pero pobres: ampliar unos caracteres los deja
   probatorios.
3. El label de `incompatible-otras-ayudas` conserva una autocorrección sin
   pulir («salvo Renta Básica… no: ni siquiera; solo se exceptúan…») — texto
   visible de usuario; reformular.
4. `window.previousCalls` incluye la propia convocatoria 2025 además de
   2023/2024 — convención distinta a `madrid-beca-comedor-escolar` (que no la
   incluye), pero deliberada y con mejor estimación (04/11/2026); ambas formas
   producen CLOSED_RECURRING. Homogeneizar en un ADR menor o aceptar.
5. `doc-libro-familia`-equivalente: ningún documento condicional tiene campo
   en el catálogo para VG/terrorismo/SEPE-agotados — correctamente
   `mandatory: false` sin `condition`; los labels lo explican.

---

## Hoja de muestreo para Daniel (2 puntos por ayuda)

| Ayuda | Punto a comprobar | Dónde |
|---|---|---|
| pension-no-contributiva | Cuantía 2026 «8.803,20 euros anuales» | RD 241/2026, art. 21.1 — https://www.boe.es/eli/es/rd/2026/03/25/241 |
| pension-no-contributiva | Gestión CM + «Plazo de concesión 90 días» + suspensión por no declarar renta | Orden 2372/2023, ficha 020101, pág. 126-127 — https://www.bocm.es/boletin/CM_Orden_BOCM/2023/08/01/BOCM-20230801-18.PDF |
| subsidio-desempleo | Cuantía 95 %/90 %/80 % del IPREM por tramos | LGSS (RDL 8/2015), art. 278 — https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| subsidio-desempleo | Solicitud fuera de los 6 meses ⇒ denegada | LGSS, art. 276.1 (mismo enlace consolidado) |
| asignacion-hijo-a-cargo | Cuantías 2026: 1.000,00 / 5.962,80 / 8.942,40 € y límites 15.356 / 23.109 / +3.745 € | RD 241/2026, art. 24.1-2 — https://www.boe.es/eli/es/rd/2026/03/25/241 |
| asignacion-hijo-a-cargo | Cierre de solicitudes nuevas sin discapacidad desde el 1/06/2020 | Ley 19/2021, Disposición transitoria sexta — https://www.boe.es/eli/es/l/2021/12/20/19/con |
| pension-viudedad | Porcentajes 52 % (general) y 70 % (cargas familiares) — y confirmar que el «60 % a los 65» **no** está en el art. 31 | Decreto 3158/1966, art. 31 — https://www.boe.es/eli/es/d/1966/12/23/3158/con |
| pension-viudedad | Mínimos 2026 por tramo (9.931,60 / 12.262,60 / 13.106,80 / 17.592,40 €) | RD 241/2026, Anexo I, cuadro «Viudedad» — mismo enlace BOE |
| madrid-ayudas-alquiler-plan-estatal | Umbrales ≤3×/4×/5× IPREM y renta ≤600 €/300 € | RD 42/2022, art. 27.1.c-d — https://www.boe.es/eli/es/rd/2022/01/18/42/con |
| madrid-ayudas-alquiler-plan-estatal | Plazo 2025: 4/11/2025–15/12/2025 | Extracto BOCM 28/10/2025, Quinto — https://www.bocm.es/boletin/CM_Orden_BOCM/2025/10/28/BOCM-20251028-25.PDF |

## Anexos de ejecución

- `check-citas.ts` → `pension-no-contributiva 26 citas / subsidio-desempleo 20
  / asignacion-hijo-a-cargo 17 / pension-viudedad 17 / alquiler 38`; 0 fallos,
  0 violaciones de rango; metas de snapshot presentes y URL coincidente.
- `run-golden.ts` → 5/5 veredictos y deadlines reproducen
  (`posible+ROLLING` ×4, `posible+CLOSED_RECURRING` ×1); 2 KOs de pin
  (`asignacion` v1≠v3, `viudedad` v1≠v2).
- `probes.ts` → FN reproducidos listados arriba; casos de control T donde
  corresponde.
- `eligibility-validate.ts --today 2026-10-05` → 31 rulesets, 0 errores, 31
  avisos (todos G10 `humanReview: pending`, esperado).
- Hojas del autor: en main solo `ola-5-pnc.md`, `ola-5-subsidio.md`,
  `ola-5-alquiler.md`; las de asignación y viudedad están en worktrees
  (`ola-5-apoyo-joven`, `ola-5-subsidio-paro-parcial`) sin copiar a main.
