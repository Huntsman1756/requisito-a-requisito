# Verificación independiente — ola 1 (ADR-040)

Verificador que **no** ha participado en la producción. Método:

1. `npx tsx scripts/eligibility-validate.ts --today 2026-10-05` (gate oficial
   G1–G11): **10 rulesets, 0 errores, 10 avisos** (todos `ELIG_G10_HUMAN_REVIEW`,
   `humanReview.status = pending` — esperado antes de la revisión de Daniel).
   Es decir: **todos los extractos están literalmente en el `.txt` normalizado
   de su fuente y todos los `excerptSha256` cuadran** (G4), todos los dominios
   están en el registry y ninguna cita normativa usa rango > 2 (G11).
2. Verificación semántica manual: cada condición comparada con el texto de la
   fuente en torno al localizador citado (posición del extracto comprobada
   contra las cabeceras de artículo del `.txt`); umbrales, plazos y fechas
   recomputados o contrastados con la sede y con hechos externos.
3. Personas golden ejecutadas con el motor real (`evaluateRuleSet`, tsx, motor
   y datos del repo sin tocar nada) — resultados en cada sección.

Ámbito: `imv`, `madrid-cheque-escuela-infantil`, `madrid-beca-comedor-escolar`,
`madrid-bono-alquiler-joven`. El quinto candidato (`beca-6000`) **no existe**;
en su lugar hay `teleasistencia-descartada.json` + `ola-1-teleasistencia.md`,
descartada correctamente: sus `requirements` citan `transparencia.madrid.es`
(rango 4) y no pasaría G11.

---

## imv — VERDICT: OK

Ejecución golden `gp-imv-joven-solo` (today 2026-10-05): `verdict=no_cumple` ✓,
`deadline=ROLLING` ✓, hard-F = `edad-minima` ✓, soft `ingresos` = T
(0–8.400 < 8.803,20) ✓, `selfCheck` sin fallos.

- Extractos: todos presentes y en el artículo citado (comprobada la posición de
  cada excerpt frente a las cabeceras «Artículo N.» del snapshot: 4.1.b, 4.2,
  5.2, 5.2 in fine, 10.1.a, 10.1.a fin, 10.2, 10.3, 11.2–11.6, 13.1, 14.1,
  21.1–21.4, 27.1 — todos correctos).
- Números: 8.803,20 € = PNC 2026 (RD 241/2026, art. 21.1: «queda establecida en
  8.803,20 euros anuales») ✓; renta garantizada individual = 100 % PNC
  (Ley 19/2021, art. 13.2.a) ⇒ condición `incomeAnnual < 8803.2` equivale al
  test legal de promedio mensual ✓; patrimonio 3× = 26.409,60 € coincide con la
  tabla oficial de la Seguridad Social ✓ (los 52.819,20 € son la tabla de
  activos no societarios, 6× — la regla no la confunde); maxEur
  1.613,92 = 733,60 × 2,2 (escala 220 %, art. 13.2.b) ✓; mínimo 10 € (art.
  13.1) ✓.
- Ventana: `rolling` con cita del art. 14.1 ✓.

Erratas (menores, ninguna bloqueante):

1. `uncoveredRequirements.excepciones-edad-18-22`: el label incluye «huérfanos
   absolutos» entre las excepciones para quien **vive solo/a**. En el art. 5.2
   el supuesto de huérfanos absolutos está redactado para unidades de
   convivencia formadas solo por huérfanos; para el titular individual las
   excepciones listadas son violencia de género, trata, extutela y prisión
   >6 meses. Imprecisión menor (en la práctica un huérfano de 18–22 suele
   venir de tutela, pero tal como está escrito el label sobre-incluye).
2. `amount.citation`: el excerpt solo respalda el mínimo de 10 €; el
   `maxEur` 1.613,92 es una derivación (733,60 × 220 %) documentada en la hoja
   del autor pero no presente en el extracto citado. Aceptable por estar
   explicado; idealmente el excerpt o una segunda cita cubriría el tope del
   220 % o la cifra literal de la Seguridad Social… ojo: segss-imv es rango 3
   y no puede citarse en `amount` (G11); la derivación con rango 1 ya está
   bien acreditada vía arts. 13.1+13.2.b.
3. `edad-minima.label` dice «ser mayor de edad con hijos o menores a cargo»
   y omite «menores emancipados» que sí aparecen en el extracto; no hay
   pregunta que lo capture, pero el label no debería estrechar la cita.
4. (Contrato, no defecto de datos) El golden escribe `blockers` con **ids**
   (`"edad-minima"`) mientras `evaluateRuleSet` devuelve `blockers` con
   **labels**. El schema de golden no lo aclara y aún no existe el runner
   `tests/eligibility/golden/`; conviene fijar el contrato antes de que el
   runner falle.

## madrid-cheque-escuela-infantil — VERDICT: OK (con erratas)

Ejecución golden `gp-cheque-madre-torrejon`: `verdict=posible` ✓,
`deadline=CLOSED_RECURRING` ✓, sin blockers ✓.

- Ventana: 19/05/2026 → 08/06/2026 — **confirmada literal** en la ficha de la
  sede («Fecha de inicio: 19/05/2026 Fecha de fin: 08/06/2026») ✓.
- `previousCalls`: 30/04–23/05/2024 (verificado fuera: el plazo real fue
  «30 de abril al 23 de mayo, ambos inclusive») y 04/06–24/06/2025
  (consistente con 15 días hábiles desde el 03/06/2025) ✓ — años consecutivos
  en orden ascendente ⇒ CLOSED_RECURRING funciona.
- `35.913 €`: literal en el extracto de la convocatoria («la renta per cápita
  familiar no podrá superar el límite de 35.913 euros») ✓; modelado como soft
  sobre ingresos del hogar (condición suficiente: total <35.913 ⇒ rpc <35.913)
  correctamente marcado con ⚠ `renta-per-capita-calculo`.
- `amount` 177–283 €/mes: el extracto citado (bases art. 16.4) dice
  «límite mínimo de 177 euros mensuales hasta un límite máximo de 283 euros
  mensuales»; el «Cuarto» de la convocatoria confirma que 283 € solo aplica
  con 5 puntos del criterio de ingresos — el range es fiel.
- Temas/eventos canónicos ✓; `humanReview: pending` ✓.

Erratas:

1. **Cita que no cubre el dato**: `hijo-menor-3` (label) y `nacido-antes-2027`
   (label) afirman el corte «antes del 1 de enero de 2027», pero ni la
   convocatoria 2026-2027 ni las bases citadas contienen esa fecha (el
   extracto de la convocatoria es abreviado y no lo incluye; la base dice solo
   «la fecha que se determine en cada orden de convocatoria»). La fecha figura
   en la ficha de la sede — **rango 3**, no usable en requisitos/uncovered por
   G11. El dato es verdadero y tiene fuente oficial, pero la cita adosada no
   lo respalda literalmente. Recomendación: mover la fecha concreta fuera del
   label («nacido antes de la fecha que fije la convocatoria») o snapshot de
   la Orden 1644/2026 completa (BDNS 902503) como rango 2.
2. Mismo patrón en `renta-per-capita-calculo`: «la renta consultada es el IRPF
   2024» solo se sostiene con la sede (rango 3, sección de documentación).
   El resto del label (división por miembros, cómputo por dos con
   discapacidad/violencia de género) sí está cubierto por art. 6 de las bases.
3. Menor: el golden justifica la renta citando `sede-infantil-2026-2027`
   («Apartado Requisitos, punto 3» — donde efectivamente está «No superar el
   límite de renta per cápita familiar de 35.913 euros»). En justificaciones
   de golden el rango 3 no está vedado por G11, pero para coherencia con la
   jerarquía probatoria convendría citar la convocatoria (rango 1).

## madrid-beca-comedor-escolar — VERDICT: KO en la primera pasada; RESUELTO tras corregir el motor

Ejecución golden `gp-beca-comedor-fuencarral`: `verdict=posible` ✓ y todos los
requisitos como se espera (`hijo-en-edad-escolar` T, `centro` T,
`via-economica` T por la rama de renta), pero en la primera pasada
`deadline.state = CLOSED` frente al `CLOSED_RECURRING` esperado.

**Causa raíz (reproducida)**: `deadline.ts` hacía `(w.previousCalls ??
[]).slice().sort()` — el comparador por defecto sobre objetos era un no-op, se
conservaba el orden de inserción y el chequeo exigía años ascendentes. Esta
ruleset lista las convocatorias en orden descendente (2025 antes que 2024) ⇒
`CLOSED`. **Corregido después en el working tree**
(`git diff` muestra `sort((a,b) => a.opensAt.localeCompare(b.opensAt))`) y
re-ejecutado el golden: **`deadline.state = CLOSED_RECURRING` ✓**. La
corrección es del lado del motor, no del dato; queda constancia de que la
convención «orden cronológico» no era exigible porque el propio código no
ordenaba. Con el motor corregido, el KO desaparece y la ruleset queda OK.

- Extractos: todos presentes y localizadores verificados contra el anexo
  (art. 4.1, 4.2 —el excerpt aparece dos veces y la segunda ocurrencia cae en
  4.2—, 5.1, 5.2, 5.2.c, 5.2.k vía modificación, 8.1, 8.2, 10.c, 10.h, 12.2,
  16.5). ✓
- Números: rpc <8.400 (art. 5.2.c), FN 8.400–10.000 (letra k añadida por el
  Acuerdo de 30/04/2025) ✓; cuantías 2026-2027 (979/445/295) ✓ en el extracto
  Orden 1696/2026; `minEur` 295 por curso ✓.
- Ventana: 29/04–28/05/2026, **literal** en la ficha del trámite A958 ✓.
- `previousCalls` factualmente correctos (21/05–17/06/2024 verificado
  externamente; 18/06–15/07/2025 consistente con 20 hábiles desde 17/06/2025).

Otras erratas (menores):

1. `via-economica-o-colectivo`, rama FN: `familyType = familia-numerosa`
   da T aunque la renta supere 10.000 € per cápita (la letra k exige
   rpc ∈ [8.400, 10.000)). Es soft y el label lo explicita, pero es una
   sobre-aproximación: una familia numerosa rica marcaría «vía cumplida».
2. `hijo-en-edad-escolar` usa `age ≤ 18` como proxy de «cursa EI/Primaria/
   ESO»: puede dar T a un hijo de 17–18 en Bachillerato (no elegible) y F a
   un repetidor de 19 en ESO (sí elegible). Razonable y declarado en el label
   + ⚠ `etapa-y-centro`; se anota por transparencia.
3. `otras-vias-sin-renta` menciona «protección temporal por Ucrania»: el
   art. 5.2.h dice «protección internacional, en cualquiera de sus
   modalidades»; la mención a Ucrania no está en el extracto citado (aparece
   en convocatorias/ejercicios, no en las normas). Matiz menor de label.
4. Documentado por el autor: `referenceDate: "application"` aunque la norma
   ata los requisitos al fin del plazo (art. 5). Cubierto por ⚠
   `requisitos-a-fin-de-plazo`; aceptable pero conviene que Daniel lo vea.

## madrid-bono-alquiler-joven — VERDICT: OK (con erratas)

Ejecución golden `gp-alquiler-joven-mostoles`: `verdict=posible` ✓,
`deadline=ROLLING` ✓, todos los hard en T (18≤30≤35, CCAA 13, ingresos
[16.800,25.200] ≤ 3×IPREM=25.200 al borde, vivienda `alquiler`).

- Extractos: presentes y en el artículo correcto (art. 6.1, 6.1.a–d, 6.2.a–c,
  6.7, 7, 8, 10, 11 del RD 42/2022; comprobado contra las cabeceras del texto
  consolidado).
- Números: IPREM_ANUAL_14P = 8.400 € (parámetro vigente; el bono es 2026 y el
  periodo cubre) ⇒ 3× = 25.200 € ✓; 250 €/mes (art. 11) ✓; 600/300 € y
  900/450 € por Anexo II ✓ (Móstoles confirmado en la lista municipal de la
  sede).
- Ventana: `opensAt` 03/02/2025 (extracto Quinto) + `rolling:true`; la sede
  marca «En plazo: permanente» ⇒ ROLLING justificado ✓.
- Temas/eventos canónicos ✓; `humanReview: pending` ✓.

Erratas:

1. `renta-maxima` (uncovered): el label enumera «Madrid, Móstoles, Getafe,
   Alcorcón…». El extracto citado (RD, art. 8) sostiene la elevación a 900 €
   pero no la lista; el extracto BOCM del Acuerdo (rango 1, ya declarado como
   fuente) sí dice «hasta 900 euros y 450 euros en una serie de municipios
   incluidos en el Anexo II» — sería la cita natural para la elevación; la
   enumeración concreta de Móstoles solo está en la sede (rango 3). Brecha de
   cobertura de cita, menor.
2. `application.documents.irpf`: `mandatory: true` pero es condicional
   («solo si no autorizas la consulta») — incoherente con
   `permiso-residencia` que sí va `mandatory: false`. Debería llevar
   `mandatory: false` o una `condition`.
3. Menor: la justificación del golden escribe la banda como «[16.800, 25.200)»
   pero el perfil no fija `maxExclusive` (es inclusivo). Sin efecto en el
   resultado (el umbral lte incluye 25.200 de todos modos).
4. Nota de contexto: el trámite sigue titulándose «Bono Alquiler Joven
   (2024)» (A688); la sede lo mantiene «En plazo: permanente» y el RD es el
   marco vigente — correcto, pero el título 2024 puede confundir a futuros
   revisores.

---

## madrid-beca-6000 — VERDICT: KO de identidad (normativa OK)

*(Añadido en la misma sesión: el quinto ruleset llegó después de la primera
pasada; se verifica con los mismos criterios.)*

**Lo técnico está bien.** Re-ejecutado `eligibility:validate` con el ruleset
presente: **11 rulesets, 0 errores** (G4 extractos+sha, G11 rangos, dominios).
Localizadores comprobados contra las cabeceras de artículo de las bases
(Orden 1435/2025): art. 6.1, 6.2, 7.2, 8.1.a/b/d/k/l y 9 — todos correctos.
Ventana 05/05–26/05/2026 **literal en la ficha A967 de la sede** («Fecha de
inicio: 05/05/2026 Fecha de fin: 26/05/2026») y consistente con 15 días
hábiles desde el 04/05/2026 contando los inhábiles de la CM (1, 2 y 15 de
mayo — la misma convención que explica los plazos de infantil y comedor).
`previousCalls` 2025 (17/06–07/07) y 2024 (24/04–17/05) reales, consecutivos
y coherentes con la misma regla de 15 hábiles; `recurrence: "annual"` ✓.
`referenceDate: "2026-05-26"` (= fin de plazo) está bien modelado con
`referenceDateCitation` (los requisitos se evalúan «a la fecha de
finalización del plazo», Extracto Segundo). Importe 2.000–3.750 €/curso
literal en el Extracto Quinto ✓. Golden `gp-beca-6000-parla` ejecutado con el
motor (ya con el sort corregido): **`posible` + `CLOSED_RECURRING`, tal como
se espera** ✓.

**Lo que falla es la identidad, no las reglas:**

1. **El nombre público es fabricado.** `src/lib/aid-titles.ts` mapea el slug
   a «Beca 6000 (Comunidad de Madrid)» — nombre que **no existe en la CM**:
   «Beca 6000» es el programa de la Junta de Andalucía (~6.000 €/año para
   Bachillerato y CFGM). Mostrar a usuarios de Madrid una ayuda con un nombre
   inexistente contradice el contrato «sin fuente no hay afirmación» en la
   capa más visible del producto y puede inducir a buscar/confundirse con la
   convocatoria andaluza, cuyo alcance y cuantía son distintos (la andaluza
   cubre también CFGM y da ~6.000 €; esta solo Bachillerato y máx. 3.750 €).
   El nombre ciudadano debe ser el oficial: «Becas para el estudio de
   Bachillerato en centros docentes privados autorizados (CM)».
2. **Identidad duplicada con el catálogo.** Ya existe la ficha
   `data/catalog/benefits/madrid-becas-bachillerato-centros-privados.json`
   (`active` + `revisada`, título «Becas de Bachillerato 2026-2027 en centros
   privados de la Comunidad de Madrid», cuantías hasta 3.750 € — el **mismo
   programa**). Con `benefitSlug: "madrid-beca-6000"` + `standalone: true`
   convivirán dos identidades para la misma ayuda: la ficha importada en
   nivel 2 y el RuleSet propio en nivel 1 ⇒ la misma beca puede aparecer dos
   veces. La corrección correcta es `benefitSlug:
   "madrid-becas-bachillerato-centros-privados"` y quitar `standalone` (G2 ya
   queda cubierto por la ficha del catálogo); el RuleSet eleva la ficha al
   nivel 1 en vez de crear una ayuda fantasma.

Sobre el mapeo en sí: usar «beca-6000» como **alias interno del encargo**
mientras el producto muestra el programa real es aceptable solo como nota de
trabajo; como identidad publicada no lo es. Recomendación: aceptar el
programa elegido (es efectivamente el equivalente CM más cercano — beca de
continuidad postobligatoria, ~43,5 M€, convocatoria anual desde 2019-2020),
pero **renombrar slug y título al programa real y fusionar con la ficha**.

Erratas menores:

- `concurrencia-competitiva`: el label afirma «43.497.750 €» y el localizador
  dice «Cuarto», pero la cifra está en el apartado **«Quinto»** de la misma
  fuente (mismo documento; localizador impreciso).
- `renta-ejercicio-2024`: el label detalla las casillas IRPF
  «420+432-433+424+429-446-436-595» que **no** están en el extracto citado
  ni en el extracto de la convocatoria (vienen de la Orden completa o del
  año anterior); el extracto solo dice «Se considerará la renta anual del
  ejercicio económico del 2024». Mismo patrón de sobre-extensión de label.
- `nota-final-puntua`: el añadido «la renta per cápita puntúa de 0 a 8» no
  está en el excerpt (está en el punto 1 del mismo apartado Cuarto).
- `estudiante-bachillerato` como **hard** sobre `studentStatus = "si"`
  («¿Estudias ahora mismo?»): un alumno que terminó la ESO, no estudia «ahora
  mismo» pero **tiene reserva de plaza** para septiembre respondería «no» ⇒
  F ⇒ `no_cumple`, siendo potencialmente beneficiario. Falso negativo en un
  requisito excluyente; es el requisito más dudoso del ruleset (mitigable con
  soft o con una nota, pero como hard corta).
- `sede-becas-bachillerato-2026-2027` está declarada en `sources` pero **no
  se cita en ninguna parte** (canal y docs citan rango 1). Higiene menor.
- `gp-beca-6000-parla`: `birthYear` 2009 con edad 16–17 a 05/10/2026 es
  coherente; `dependents: "unasked"` bien usado (la pregunta no aplica).

## Resumen para el muestreo de Daniel (2 filas por ayuda)

| Ayuda | Requisito más crítico | Requisito más dudoso |
|---|---|---|
| imv | `edad-minima` — los 23 años del titular individual (art. 5.2/4.1.b) es el hard que decide el golden y la regla más discutible del IMV | `ingresos-inferiores-renta-garantizada` — el umbral 8.803,20 € es persona sola; sube por unidad y solo va como aviso |
| madrid-cheque-escuela-infantil | `hijo-menor-3` — hard; además su label cita una fecha (1/1/2027) que solo está en fuente rango 3 | `renta-limite` — soft porque el límite real es per cápita; total <35.913 € es condición suficiente, no necesaria |
| madrid-beca-comedor-escolar | `via-economica-o-colectivo` — decide la mayoría de casos; la rama FN da T sin mirar renta (rpc ≥10.000 queda mal cubierto) | `hijo-en-edad-escolar` — `age ≤ 18` como proxy de etapa; el golden falló en la primera pasada (CLOSED vs CLOSED_RECURRING) por el sort no-op del motor, ya corregido |
| madrid-bono-alquiler-joven | `ingresos-3iprem` — hard sobre ingresos propios aunque la norma suma convivientes (el autor lo justifica: exceder solo ⇒ exceder en unidad) | `alquiler-o-condiciones` — `housingStatus ∈ {alquiler, general}` acepta «otra situación» como «en condiciones de firmar»; muy laxo, aunque es soft |
| madrid-beca-6000 | `estudiante-bachillerato` — hard con `studentStatus=si` como proxy de «matriculado/reserva de curso completo de Bachillerato»; un no-estudiante con reserva de plaza da F ⇒ no_cumple siendo elegible | **La identidad**: slug/título «Beca 6000 (CM)» es un nombre inexistente en la CM (es andaluz) y el programa ya existe en catálogo como `madrid-becas-bachillerato-centros-privados` ⇒ renombrar slug y fusionar |

## Resultado global

- 4 de 5 rulesets normativamente OK. **`madrid-beca-6000` KO de identidad**:
  reglas correctas pero publica un nombre de programa que no existe en la CM
  y duplica una ficha de catálogo (`madrid-becas-bachillerato-centros-privados`);
  corrección: renombrar `benefitSlug` y quitar `standalone`.
- **`madrid-beca-comedor-escolar` fue KO** en la primera pasada (motor daba
  CLOSED por el sort no-op sobre `previousCalls`); **corregido en el working
  tree** (`deadline.ts` ordena por `opensAt`) y re-verificado en verde.
- Ningún extracto ausente ni `excerptSha256` incorrecto (G4 verde en los 5).
- G11 limpio: rango 3 solo en canal/documentos/simulador.
- Erratas menores recurrentes: labels de `uncovered` que afirman datos que el
  excerpt citado no contiene (fecha 1/1/2027, IRPF 2024, casillas IRPF,
  lista de municipios del Anexo II, cifra de crédito en apartado «Cuarto») —
  todos verdaderos en fuente oficial, pero sin respaldo literal en la cita
  adosada.
- Contrato golden↔motor por fijar: `blockers` se expresan como ids en los
  goldens y como labels en `EvaluationResult`.
- Ojo con `estudiante-bachillerato` hard sobre «¿estudias ahora mismo?»:
  falso negativo posible para quien tiene reserva de plaza sin estar cursando.
