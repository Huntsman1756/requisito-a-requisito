# Verificación independiente — ola 4 (ADR-040/044)

Verificador independiente: no participé en la redacción ni en el merge.
Fecha: 2026-10-05. Ámbito: los 5 RuleSet de la ola 4 tal como quedaron en `main`
(commit e6ff01f), sus fuentes snapshot, sus goldens y sus hojas.

**Método.** (1) `F:\Temp\datawardsmadrid-verif4\check-citas.mjs`: recorre las 99
citas de los 5 rulesets; recalcula `sha256(normalize(excerpt))` y comprueba
inclusión literal en `data/eligibility/sources/<id>.txt` (espacios y cortes
«pala- bra» tolerados). (2) `F:\Temp\datawardsmadrid-verif4\run-golden.ts` (tsx,
repo real): parsea ruleset + golden con los esquemas Zod y ejecuta
`evaluateRuleSet` con `ctx {today: gp.today, catalog:
public/datos/elegibilidad/questions.json, parameters:
data/eligibility/parameters.json, invariantsEnabled: false}`; compara veredicto,
deadline, blockers, missingFields y el pin `rulesVersion`. (3)
`F:\Temp\datawardsmadrid-verif4\probes.ts`: casos frontera sobre los hard.
(4) Inspección de fidelidad claim↔extracto en los `.txt` (una cita presente
pero sobre otra cosa = KO). (5) Diff estructural worktree→main por cada regla
(`F:\Temp\datawardsmadrid-verif4\diff-rules.mjs`) para detectar alteraciones del
merge. (6) `standalone` vs `data/catalog/benefits/` (244 fichas).

**Resultado global**: 99 citas → **0 extractos ausentes, 0 hashes incorrectos**.
Los 5 goldens reproducen veredicto y deadline esperados; **2 goldens llevan el
pin `rulesVersion` desactualizado** (atestiguan una versión que ya no es la del
fichero). `eligibility-validate --today 2026-10-05` → **5 errores, todos en
ficheros de la ola 5 (WIP sin commitear)** (`asignacion-hijo-a-cargo` G1,
`pension-viudedad` G4+G11): ninguno de la ola 4. `git status` confirma que esos
ficheros son `??` (no tracked): ajenos a esta ola, pero tumban el gate si se
construye con ellos presentes.

| Ayuda | Dictamen | Motivo principal |
|---|---|---|
| prestacion-desempleo-contributiva | **KO** | Recitación G11 del merge dejó `casos-especiales-cotizacion` con extracto no probatorio para sus cifras (el 720 agrario sí está en el art. 287.1; el «360 días/6 años/EEE-Suiza» del emigrante no está en la LGSS) + «15 días hábiles» no cubierto por el extracto (el LGSS dice «quince días») + golden pin v1 vs v2 |
| madrid-ayudas-urgencia-social | **OK** (con observaciones) | Las 13 citas probatorias; la exclusión de Madrid capital como `hard` es fiel a la ficha 060502 («Proveedor… excepto Madrid capital») y la vía municipal queda documentada |
| madrid-abono-transporte-infantil | **KO** | El merge añadió a `uncoveredRequirements` 2 afirmaciones que el autor documentó que **no pueden ir ahí** por falta de fuente rango ≤2, con extracto no probatorio; el doc `ttp-infantil` se degradó (el label sigue afirmando «hasta cumplir 7» tras recortar el extracto que lo probaba); golden pin v1 vs v3 y banda de ingresos no producible; **la hoja no llegó a main** |
| becas-mec-universidad-2026-2027 | **OK** (con observaciones) | 19 citas íntegras; fechas 07/04→18/05/2026 literales; `standalone:false` + slug `becas-generales-mefp-2026-2027` correcto (ficha existe). El label «universitarias» queda estrecho tras el renombrado |
| prestacion-cuidador-no-profesional | **OK** (con observaciones) | 29 citas íntegras y probatorias en lo esencial; Ley 39/2006 arts. 5/14.4/18/20 y Dto. 54/2015 arts. 41–47 verificados; varios extractos cortos dejan cláusulas del label sin cubrir directamente |

## 1. prestacion-desempleo-contributiva — KO

18 citas íntegras (literal + hash). Golden `gp-paro-alcala` reproduce `posible`
+ `ROLLING` con el único requisito (soft) en T; el razonamiento del golden es
correcto (los decisivos quedan ⚠). `standalone` correcto (sin ficha en
catálogo). Verificado en el consolidado LGSS: art. 262.3 (parcial 10 %–70 %),
266.a-e, 267.1, 268.1-2 (quince días + pérdida de días fuera de plazo), escala
269.1 completa (360→120 … ≥2.160→720), 270.2 (70 %/60 %), 287.1 (720 días
agrario ex-autónomo), DA 57 (subsidio retornados: 12 meses/6 años). El 10-70 %
del label está en art. 262.3 del mismo documento.

**Defectos (probanza de las citas recitadas por G11).** El merge
(`e6ff01f`, worktree→main) recitó 3 uncovered de la página SEPE (rango 3,
prohibida en uncovered por G11) al LGSS (rango 1). El movimiento era obligado,
pero los extractos elegidos son pobres:

1. **`casos-especiales-cotizacion` — extracto no probatorio para el detalle.**
   El label afirma tres cifras: emigrante retornada «360 días en los 6 años
   anteriores a la emigración y no percibir desempleo de otro Estado del EEE o
   Suiza» y agraria ex-autónoma «720 días». El extracto citado (art. 264.c) solo
   enumera los colectivos. Hechos comprobados: el 720 agrario **sí** está literal
   en el mismo documento (art. 287.1 «setecientos veinte días»); la regla del
   retornado en el LGSS es otra (art. 267.1.e «acrediten cotización suficiente
   antes de salir de España» + 266.b; el «360/6 años» y «EEE o Suiza» del label
   vienen de la página SEPE, rango 3 incitable aquí; «Suiza» y «EEE» ni siquiera
   aparecen en el `.txt`). → Recitar a arts. 267.1.e + 287.1 y rebajar el label
   a lo que la norma dice (o mover el detalle SEPE a una zona que admita rango 3).
2. **`incompatibilidades` — extracto-cabecera.** «El derecho… se suspenderá por
   la entidad gestora en los siguientes casos: a) Durante el periodo que
   corresponda» corta a media frase y no dice qué se suspende ni por qué. El
   localizador (arts. 271-272) sí contiene el contenido (271.1.d trabajo cuenta
   ajena/propia; la pensión incompatible en 272). → Ampliar el extracto a
   271.1.d o ajustar el label.
3. **`plazo-solicitud-15-dias` — label/extracto desalineados.** El label dice
   «15 días hábiles»; el extracto (art. 268.1) dice «quince días siguientes»
   (sin calificativo). El matiz «hábiles» solo consta en la fuente rango 3
   (SEPE, ya citada en `application.window`, donde es legal). En zona normativa
   el label debe decir «quince días» como la norma. El resto del claim (fuera de
   plazo ⇒ nace desde la solicitud, pierdes días) sí está probado por 268.1-2.
4. **Pin del golden desactualizado**: `gp-paro-alcala` atestigua
   `rulesVersion: 1`; el fichero es v2 (la recitación es el cambio). El veredicto
   reproduce, pero el oráculo jurídico (docs/07 §9) ya no señala la versión
   vigente → re-ejecutar y re-pinear a 2.

Observaciones menores: (a) `doc-libro-familia` dispara con **cualquier**
dependiente (`count_where_gte` sin `where`), pero el label dice «hijos/as» —
un mayor dependiente a cargo también la mostraría (sobre-listado, sin efecto en
veredicto). (b) `situacion-legal-desempleo` soft es correcto (cubre ERTE;
documentado en la hoja); (c) `causa-involuntaria` cita la cabecera del 267.1 —
aceptable porque la lista va pegada.

## 2. madrid-ayudas-urgencia-social — OK (con observaciones)

13 citas íntegras y probatorias. Verificado en `bocm-20230801-18-cartera-ss.txt`
(pág. 273, ficha 060502 completa): ámbito CM, proveedor «excepto Madrid
capital», «Carecer de recursos…», «Condicionada», «Compatible», «Inmediato»,
«pago único». Ley 12/2022: art. 10.3 (definición de urgencia social) y art.
11.1.e (competencia municipal en prestaciones económicas individuales de
urgencia/emergencia) — ambos literales y afines. Golden `gp-urgencia-mostoles`
reproduce `posible` + `ROLLING` (2 hard T + soft T). `standalone` correcto.

**Sobre `fuera-madrid-capital` como `hard` (pregunta 5 del encargo): razonable
y correcto.** La ficha 060502 dice literalmente «Proveedor del servicio
Comunidad de Madrid (excepto Madrid capital)» y «(Madrid capital cuenta con un
dispositivo propio de emergencia social)» — esta prestación autonómica no se
provee en la ciudad de Madrid, y la Ley 12/2022 art. 11.1.e atribuye la
equivalente a las entidades locales. Un `no_cumple` es fiel al objeto modelado
(y el propio label + `madrid-capital-municipal` en ⚠ dirigen al canal
municipal/SAMUR Social). Pasarlo a soft produciría «posible» para una
prestación que el proveedor no cubre allí: sería menos fiel. Además la
semántica es segura: municipio desconocido ⇒ `not U` = U ⇒ `posible` (nunca
`no_cumple` con territorio parcial), verificado con probe: {ccaa:13} ⇒
`posible`; 28079 ⇒ `no_cumple`; ccaa 09 ⇒ `no_cumple`.

Observaciones (no bloquean):

1. `comunidad-emergencia-social` es **rango 4** citado en
   `application.channel`. La tabla de docs/08 asigna «canal» al rango 3 y el
   rango 4 a «contexto y texto divulgativo; nunca umbrales». El extracto es
   divulgativo sobre el servicio (no un umbral) y la hoja documenta que no hay
   ficha de trámite en `sede.comunidad.madrid` (404 probados) — no existe fuente
   mejor. Aceptable de hecho, pero queda fuera de la letra de la tabla;
   convendría anotar la excepción en docs/08 o en la decisión.
2. El label de `ambito-territorial-cm` («debes vivir **o encontrarte**») es algo
   más laxo que la ficha («Ámbito territorial de atención»); la matización es
   razonable para emergencias pero es añadido editorial.
3. `sin-recursos-basicos` usa 1×IPREM como referencia **declarada** en el label
   («la Cartera no publica umbral; como referencia orientativa…») — honesto y
   correcto como soft. `lte` vs «por debajo de» no cambia nada a nivel de banda.
4. `documents: []` deliberado y correcto (sin lista pública; mejor vacío que
   inventado).

## 3. madrid-abono-transporte-infantil — KO

20 citas íntegras (literal + hash) y G11 se cumple en zonas normativas.
Verificado en las fuentes: «Gratuidad para abonos y títulos infantiles (niños
nacidos entre 2012 y 2026)» (BOCM-20251231-2, pág. 65) y 50 % jóvenes
(2000-2011); «TARJETA INFANTIL Gratuita» y fila «JOVEN 20,00 €…» (tabla de
tarifas, pág. 70); «Tarjeta Transporte Público Personal 4,00 €»; el Anuncio de
residencia completo (CM ∪ E1/E2 ∪ convenio CLM, acreditación por certificado de
empadronamiento, excepción FN, **y el párrafo de Castilla y León que también
existe**); y las Condiciones TTP (consulta DNI/NIE/Registro Civil, fotografía).
Golden reproduce `posible` + `ROLLING`. El motor se comporta bien: dep. de 15 ⇒
`no_cumple`; dependents sin responder ⇒ `insuficiente` + `missing:dependents`;
Toledo ⇒ soft F no excluye (`posible`, correcto por E1/E2/CLM).

**Defectos introducidos por el merge (worktree→main; el worktree tenía v1 con 5
uncovered, main tiene v3 con 8):**

1. **`menores-4-sin-titulo` y `validez-infantil-hasta-7`: extracto presente
   pero no probatorio.** Ambos citan «Gratuidad para abonos y títulos
   infantiles (niños nacidos entre 2012 y 2026).», que no dice ni que los <4 no
   necesiten título ni que el infantil valga hasta cumplir 7. Esos hechos solo
   existen en `crtm-billetes-tarifas` (rango 3): «Permite viajar por toda la
   Comunidad de Madrid desde los 4 años y hasta el día en que se cumplan 7.
   Para los menores de 4 años, el transporte público madrileño es gratuito y no
   requiere la adquisición de título alguno» — y **la propia hoja del autor lo
   documenta**: «la banda <4 sin título y la validez hasta cumplir 7 solo
   figuran en la web del CRTM (rango 3): van en el documento `ttp-infantil`,
   no en `uncoveredRequirements` (G11 exige rango ≤ 2)». El merge los añadió a
   uncovered con una cita que no los cubre: violación de probanza creada en la
   integración. → Retirar ambos de `uncoveredRequirements` (el dato ya viaja,
   citado, en `documents.ttp-infantil` donde rango 3 es legal) o rebajar los
   labels a lo que el extracto sostiene.
2. **`documents.ttp-infantil` degradado**: el label sigue afirmando «vale hasta
   que el menor cumple 7 años» pero el extracto se recortó perdiendo justo la
   frase que lo probaba (el worktree citaba el párrafo completo que incluye
   «hasta el día en que se cumplan 7» y el caso <4). Restaurar el extracto
   largo (está en el `.txt`, hash anterior `450a30e7…`).
3. **`autorizacion-acompanante` (id obsoleto, label confuso)**: el label mezcla
   «documentación para menores sin DNI» con «recogida de datos por la
   Administración competente». El extracto prueba que para menores sin documento
   de identidad se consulta el Registro Civil, **pero** la cláusula de recabado
   de datos es para verificar discapacidad/familia numerosa — irrelevante para
   esta ayuda. Además el id quedó de su vida anterior («acompañante»). → Renombrar
   el id, quedarse solo con la parte «menor sin documento → Registro Civil».
4. **Pin del golden**: `gp-abono-infantil-getafe` atestigua `rulesVersion: 1`;
   el fichero es v3 (el merge cambió labels y documentos). Re-pinear a 3.
5. **`incomeAnnual {min:8400, max:20000}` del golden no es producible**: las
   bandas reales del cuestionario son [0,8400] / [8400,16800] / [16800,25200] /
   [25200,null]. No afecta al veredicto (la regla no lee ingresos) pero el
   golden debe ser producible por el cuestionario real (mismo defecto que el
   verificador de la ola 3 marcó en el térmico).
6. **La hoja `ola-4-abono-infantil.md` no está en
   `evidence/2026-10-05-F3/` de main** — existe y es buena en
   `F:\AgentState\worktrees\datawardsmadrid\ola-4-abono-infantil\evidence\2026-10-05-F3\ola-4-abono-infantil.md`.
   Sin ella no hay trazabilidad de la revisión humana ni de la decisión G11 que
   el merge contradijo. Copiarla.

Observaciones: (a) `menor-0-14-a-cargo` usa `age lt 15` sobre el dependiente,
pero la cohorte bonificada es «nacidos 2012-2026»: un menor de 14 nacido en
2011 (cumple 15 en 2026) queda **fuera** de la gratuidad infantil (le toca el
50 % joven) — con `age` en años no es distinguible; limitación del catálogo
(documentar en ⚠). (b) `soporte-ttp-personal`: el extracto solo prueba la
naturaleza «TTP personal»; el «4 €» y el «infantil gratis» del label están
cubiertos por otras citas del mismo ruleset — aceptable pero el extracto propio
es débil. (c) `autorizacion-tutores` quedó más conservador que el worktree
(eliminó el caso <7 con acompañante) — correcto y consistente con su extracto.

## 4. becas-mec-universidad-2026-2027 — OK (con observaciones)

19 citas íntegras y afines. Verificado en fuentes: plazo literal «7 de abril de
2026, a las 8,00 … hasta el día 18 de mayo de 2026, a las 15,00 … ambos
inclusive» (BOE-B-2026-9261) ⇒ ventana correcta y `CLOSED_RECURRING` con dos
`previousCalls` citadas (2025: 24/03→14/05; 2024: 19/03→10/05, ambas literales).
Umbrales de la tabla del art. 8.1 del RD 179/2026 comprobados en el `.txt`
(8.843/36.255 u1; 13.898/52.850 u2; 14.818/56.348 u3); «ejercicio 2025» (art.
9.1); 47.200 € catastrales (art. 11.1.a); 48-59 créditos → 350 € por concepto
(extracto «Cuarto», literal); tabla de ramas del art. 23.2 (90/90/80/65)
comprobada — el label es exacto. `amount: variable` honesto (componentes
citados, sin total).

`standalone: false` + `benefitSlug: becas-generales-mefp-2026-2027` es correcto
tras el renombrado del merge: la ficha existe en `data/catalog/benefits/`
(active, revisada, cubre la misma convocatoria BOE-B-2026-9261). El cambio es
una mejora de G2. Golden `gp-beca-mec-alcala` reproduce `posible` +
`CLOSED_RECURRING` con pin v2 correcto. Todos sus answers son producibles por
el cuestionario (banda 16.800-25.200 real; `dependents: unasked` legítimo).

Observaciones (no bloquean):

1. **Label del requisito quedó estrecho tras el renombrado**: dice «enseñanzas
   universitarias» pero el slug/ficha ahora es la convocatoria general, que
   también cubre enseñanzas **no universitarias** (el propio extracto del plazo
   lo dice: «tanto para estudios universitarios como no universitarios»). La
   condición (`studentStatus eq "si"`) no excluye a nadie, así que el sentido
   es seguro, pero el label debería pasar a «enseñanzas comprendidas en la
   convocatoria general» para casar con la ficha ligada.
2. `nota-y-aprobados-grado`: el extracto solo cubre la nota 5,00 de acceso; los
   porcentajes del label están en la tabla del mismo art. 23.2 (verificados
   literales: A&H 90, CSJ 90, Salud 80, Ciencias 65, Técnicas 65) — ampliar el
   extracto para cubrirlos.
3. La hoja (`ola-4-beca-mec.md`) quedó desincronizada en dos detalles:
   declara `rulesVersion 1` y `standalone: true` con el slug antiguo; el fichero
   mergeado es v2, standalone false. Actualizar cabecera/decisión 1 de la hoja
   para reflejar el estado en main (la decisión está bien tomada; la hoja la
   documenta como opción y el merge la ejecutó).

## 5. prestacion-cuidador-no-profesional — OK (con observaciones)

29 citas íntegras, ruleset idéntico al worktree (merge limpio). Golden
`gp-cuidadora-64-carabanchel` reproduce `posible` + `ROLLING` + `blockers []` +
`missingFields [dependency]` — todo lo esperado, incluida la U soft por
`dependency unasked` (coherente con el `showIf` de q-dependency sobre
`disability`). Verificado en fuentes: Dto. 54/2015 art. 2 («residan en la
Comunidad de Madrid…»), art. 8.1.e (incompatibilidad salvo teleasistencia/
prevención — literal), art. 41 (propuesta por Atención Social Primaria), art.
42.1.b (cónyuge/pariente 3.er grado + convivencia + «período previo a un año» +
asimilados parejas de hecho/tutores/acogimiento/órdenes religiosas — todo en el
mismo párrafo), art. 44 (grado II/III con capacidad ≤ IPREM ⇒ cuantía máxima;
si no, fórmula CPE — literal), art. 46 (efectos desde resolución o a los 6
meses de entrada — literal) y art. 47.1 (plazo suspensivo ≤ 2 años — literal);
Ley 39/2006: art. 5.1.c (5 años / 2 inmediatamente anteriores), 5.2 (LO 4/2000),
5.4 (menores de 5 → guarda y custodia), 14.4 (convivencia/habitabilidad + PIA),
18.1-3, 20 (cuantía por Consejo Territorial), 27.2/27.5 (baremo) y DF 1.ª.2
(6 meses de resolución). `standalone` correcto (la ficha
`prestaciones-dependencia-saad` es el procedimiento general, no la PECF).

**`dependencia-reconocida` como soft es la decisión correcta**: la pregunta va
sobre quien responde y el sujeto de la prestación es la persona dependiente —
documentado, y el golden lo ejerce.

Observaciones (no bloquean):

1. `empadronado-cm`: el label dice «residir **y estar empadronado**»; el
   extracto (art. 2) solo prueba «residan». El empadronamiento sí está en la
   misma norma (art. 13.1.c, citado en `documents.doc-empadronamiento`) —
   ampliar el extracto o el localizador (arts. 2 + 13.1.c).
2. `nacionalidad-extranjeria`: el añadido «los no comunitarios acreditan la
   residencia legal con certificado del Ministerio del Interior» está en el
   Dto. 54/2015 art. 13.1.d (verificado @27027 del `.txt`), no en la Ley citada —
   el extracto (art. 5.2) prueba la regla general. Recitar el detalle a
   `bocm-20150526-1-dependencia`.
3. `doc-informe-salud`: el label afirma «antigüedad máxima de 3 meses»; el
   extracto se corta justo antes de «Dicho informe … no podrá tener una
   antigüedad superior a tres meses» (está en el mismo párrafo del art. 13.1.e).
   Ampliar el extracto.
4. `capacidad-economica`: extracto genérico; la parte dura del label (≤ IPREM ⇒
   cuantía máxima; si no, fórmula) está literal en el art. 44 del mismo documento
   citado — ampliar extracto o añadir la fórmula.
5. `missingFields [dependency]` propone una pregunta (`q-dependency`) que la UI
   **no muestra** cuando `disability = "no"` (`showIf`); es coherente con el
   golden y documentado por el autor, pero el «qué te falta» dirigirá a una
   pregunta no mostrada — limitación estructural del catálogo, conviene anotarla
   como deuda.

## Tabla de muestreo — 2 puntos críticos por ayuda

| Ayuda | Punto muestreado | Fuente / lugar | Resultado |
|---|---|---|---|
| Paro | Escala 360→120 … ≥2.160→720 días | `boe-lgss-prestacion-familia.txt` @571049: tabla del art. 269.1 literal | OK |
| Paro | `casos-especiales-cotizacion`: «agraria ex-autónoma 720 días», «retornado 360/6 años/EEE-Suiza» | Extracto citado = art. 264.c (solo enumera colectivos); el 720 está en el art. 287.1 («setecientos veinte días» @628150); «EEE/Suiza» ausente del `.txt` | **KO**: cita no probatoria para las cifras |
| Urgencia | `fuera-madrid-capital` hard ⇒ `no_cumple` en 28079 | Ficha 060502 @541899: «Proveedor del servicio Comunidad de Madrid (excepto Madrid capital)» + Ley 12/2022 art. 11.1.e (municipal) | OK: fiel; vía municipal en ⚠ y en el label |
| Urgencia | `sin-recursos-basicos` soft con IPREM orientativo | Ficha: «Carecer de recursos económicos…» (sin umbral publicado); label lo declara orientativo | OK |
| Infantil | `menores-4-sin-titulo` y `validez-infantil-hasta-7` en uncovered | Extracto citado no menciona <4 ni «hasta cumplir 7»; el texto probatorio solo existe en `crtm-billetes-tarifas` (rango 3, incitable en uncovered); el autor lo documentó | **KO**: dos afirmaciones sin respaldo de la cita |
| Infantil | `menor-0-14-a-cargo` hard + `amount` 0 € | «Gratuidad … (niños nacidos entre 2012 y 2026)» @2702; fila «JOVEN 20,00 €…» y «TARJETA INFANTIL Gratuita» | OK con matiz: menor de 14 nacido en 2011 queda fuera de la cohorte (50 % joven) — arista no modelable con `age` |
| Beca MEC | Plazo 07/04→18/05/2026 + CLOSED_RECURRING | Extracto literal BOE-B-2026-9261 + previousCalls 2025/2024 literales | OK |
| Beca MEC | Umbrales u1/u2/u3 y «ejercicio 2025» | Tabla art. 8.1 RD 179/2026: cifras literales en el `.txt` (@38912…) | OK |
| Cuidador | Vínculo + convivencia + 1 año de cuidados | Dto. 54/2015 art. 42.1.b: «tercer grado…, cuando convivan en el mismo domicilio…, lo estén atendiendo y lo hayan hecho por un período previo a un año…» @72800 | OK (texto del decreto, lectura «al menos 1 año» correcta) |
| Cuidador | `empadronado-cm` label vs extracto | Art. 2 dice «residan»; el empadronamiento está en art. 13.1.c | Observación: extracto corto, cláusula del label cubierta en otro punto del mismo decreto |

## Acciones para cerrar la ola

1. **Infantil**: quitar `menores-4-sin-titulo` y `validez-infantil-hasta-7` de
   `uncoveredRequirements` (o rebajar labels a lo probado); restaurar el extracto
   largo de `documents.ttp-infantil` (el que prueba «hasta cumplir 7» y <4 sin
   título); arreglar id/label de `autorizacion-acompanante`; re-pinear el golden
   a v3 y corregir `incomeAnnual` a una banda real (`{8400,16800}`); copiar
   `ola-4-abono-infantil.md` desde el worktree.
2. **Paro**: recitar `casos-especiales-cotizacion` (art. 287.1 para agrario;
   rebajar la parte de retornado a art. 267.1.e/266.b, quitando «EEE o Suiza» y
   «360/6 años» si solo se cita rango ≤2); ampliar el extracto de
   `incompatibilidades` a art. 271.1.d; quitar «hábiles» del label de
   `plazo-solicitud-15-dias` (el LGSS dice «quince días») o dejar el matiz solo
   en `application.window` (SEPE rango 3, ya citado allí); re-pinear el golden
   a v2.
3. **Beca MEC**: re-etiquetar `estudiante-universitario` a la convocatoria
   general (o documentar el subconjunto); ampliar el extracto de
   `nota-y-aprobados-grado` a la tabla del art. 23.2; actualizar la hoja
   (rulesVersion/standalone/slug).
4. **Cuidador** (opcional): ampliar extractos de `empadronado-cm`,
   `nacionalidad-extranjeria`, `doc-informe-salud` y `capacidad-economica` a las
   cláusulas que el label afirma (todas existen en los `.txt` citados o en el
   otro documento ya declarado).
5. **Proceso** (no bloquea pero es la causa raíz de los KO de esta ola): el
   merge re-escribe citas para cumplir G11 — que es obligado — pero debe (a)
   re-ejecutar/re-pinear los goldens a la nueva `rulesVersion`, (b) no crear
   citas «literales pero no probatorias» (mejor rebajar el label o mover el dato
   a una zona que admita el rango), y (c) copiar la hoja de evidencia. Los tres
   fallos se repiten ya en dos olas (ola 3: térmico y permiso; ola 4: infantil
   y paro).
6. **Fuera de ámbito pero visible**: `eligibility:validate` falla hoy por los
   ficheros WIP de la ola 5 presentes sin commitear en main
   (`asignacion-hijo-a-cargo`, `pension-viudedad`, `subsidio-desempleo` +
   sources). No es de esta ola, pero el gate repo-completo está roto mientras
   convivan con las reglas ya cerradas.

## Evidencia de ejecución

- `node F:\Temp\datawardsmadrid-verif4\check-citas.mjs` → 99 citas, 0 extractos
  ausentes, 0 hash incorrectos; únicos rangos >2 confinados a `application.*`
  (window/channel/documents/officialSimulator — zonas permitidas) + 1 rango 4
  en `channel` de urgencia (ver observación).
- `tsx F:\Temp\datawardsmadrid-verif4\run-golden.ts` → 5/5 reproducen veredicto
  + deadline (+ blockers/missingFields donde esperados); diffs solo por pin
  `rulesVersion` (paro 2≠1, infantil 3≠1).
- `tsx F:\Temp\datawardsmadrid-verif4\probes.ts` → fronteras correctas:
  urgencia 28079 ⇒ `no_cumple`, {ccaa:13} ⇒ `posible` (U≠F), fuera-CM ⇒
  `no_cumple`; infantil dep-15 ⇒ `no_cumple`, dependents unasked ⇒
  `insuficiente`+missing, Toledo ⇒ `posible` (soft no excluye); paro vacío ⇒
  `posible`; beca no-estudia ⇒ `posible`; cuidador fuera-CM ⇒ `no_cumple`,
  dep=no ⇒ `posible`.
- `tsx scripts/eligibility-validate.ts --today 2026-10-05` → 29 rulesets,
  **5 errores todos en ficheros WIP de la ola 5** (ninguno de esta ola), 29
  avisos G10 (pending, esperado).
- `node F:\Temp\datawardsmadrid-verif4\diff-rules.mjs` → diff worktree→main:
  paro 13 cambios (recitaciones G11), infantil 10 (años+labels+docs), beca 3
  (slug/standalone/v2), urgencia 0, cuidador 0.
- Catálogo `data/catalog/benefits/` (244 fichas): `becas-generales-mefp-2026-2027`
  existe (active+revisada) ⇒ `standalone:false` correcto; ninguna coincide con
  los otros 4 slugs ⇒ `standalone:true` correcto.
