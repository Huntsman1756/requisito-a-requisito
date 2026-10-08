# Verificación ola 12 — correcciones de falsos negativos (F10-FN)

**Fecha:** 2026-10-08 · **Autor de las correcciones:** agente (sesión F10-FN,
`falsos-negativos/resumen.md`) · **Verificador independiente:** subagente
distinto, con `templates/verificador-checklist.md`. No he tocado reglas ni
`src/`; solo lectura, `git diff`, greps sobre `data/eligibility/sources/*.txt`
y ejecución de gates.

## Ámbito

Los 29 rulesets modificados en `data/eligibility/rules/` (diff contra HEAD,
`rulesVersion` incrementado y `verifiedAt: 2026-10-08` en todos). Patrón de la
corrección (docs/07 §2.3): lo que el cuestionario no puede medir no puede
descartar → `hard:true`→`false`, ramas `in`/`any`, defecto
`territory eq "cm"`→`within_territory {ccaa:"13"}`, umbrales y labels.

## Comprobaciones globales (antes de la tabla)

- `npm run eligibility:validate` → **52 rulesets, 0 errores** (52 avisos
  `ELIG_G10_HUMAN_REVIEW`, esperado: la ola queda `pending` para muestreo de
  Daniel, `muestreo-ola-12.md`). Es decir: **todos los extractos —tocados o no—
  aparecen literalmente en el `.txt` normalizado y su `excerptSha256` cuadra**
  (G4 comprobado por la máquina, no a ojo).
- `vitest run tests/eligibility/boundary/f10-fn.test.ts` → **29/29 verde**.
- Pinea de goldens: **47/47** expectativas con `rulesVersion` igual al del
  ruleset vigente (script propio sobre `data/eligibility/golden/*.json`).
- Campos usados en las 29 reglas ⊆ campos de `questions.json` + derivados
  (`residenceMonths`): **ninguno desconocido**. Opciones citadas
  (`docente`, `empleado-publico`, `familia-numerosa`, `monoparental`,
  `gte33`, `reconocida`, `jubilado`) existen en las opciones del cuestionario.
- Operadores nuevos en el diff (`in`, `any`, `within_territory`,
  `count_where_gte`) existen en `src/lib/eligibility-engine/operators.ts`
  (líneas ~170-190) y en `schemas/rule-set.schema.json`; `label` es propiedad
  válida tanto en `leaf` como en nodos `any`/`all`/`not`.
- `within_territory {ccaa:"13"}`: código 13 = «Madrid, Comunidad de» y
  municipios 28079 (Madrid), 28058 (Fuenlabrada), 28074 (Leganés), 28092
  (Móstoles) confirmados en `data/eligibility/territory.json`.
- Parámetros: `IPREM_ANUAL_14P = 8400` y `IPREM_ANUAL_12P = 7200` existen en
  `parameters.json` con cita propia; `SMI_MENSUAL = 1221` (×9 = 10.989 €).
- Los 2 tests fallidos de `tests/eligibility/review-apply-real.test.ts`
  esperaban la existencia de **este** fichero (`verificacion-ola-12.md`
  emparejado con `muestreo-ola-12.md`); quedan resueltos al escribirlo.

## Tabla slug | veredicto | justificación + cita

| slug | OK/KO | justificación (cita literal de la fuente citada o del `.txt`) |
|---|---|---|
| anticipos-docentes-cm | **OK** (obs. FP) | `employmentStatus in [docente, empleado-publico]`: el docente que marcó «Empleo público» ya no recibe F. Extracto (base 15ª.1): «Ser funcionario, de carrera o en prácticas, de cuerpos docentes no universitarios y estar en situación de servicio activo». Prueba el requisito; el label indica «marca Docencia o Empleo público». Obs.: empleados públicos **no docentes** obtienen T en un requisito hard → falso positivo residual irreducible con el cuestionario actual (no distingue docencia dentro de empleo público). No introduce F nuevo. |
| ayto-emergencia-social | **OK** | Ambos degradados a soft con excepción real en la norma: art. 12.2 «Estar empadronado en el Distrito… salvo, en ambos supuestos, en situaciones excepcionales justificadas en el informe social municipal» (no medible) y art. 12.1 «Ser mayor de edad o menor emancipado» (emancipación no medible). |
| ayto-escuela-infantil | **OK** | Soft justificado: la fuente (apdo. 2.1) contiene las dos vías no medibles: «(nacidos en 2024, 2025 y 2026 o de 2023 que precisen continuar en el primer ciclo de educación infantil por causas acreditadas)» y «los menores cuyo nacimiento se prevea para fecha anterior al 1 de enero de 2027» (2.1.b, además del uncovered `nacimiento-previsto-2027`). |
| ayto-ibi-familia-numerosa | **OK** (obs. FP) | `familyType in [familia-numerosa, monoparental]`: quita la F a monoparentales con título (p. ej. viudedad con 2 hijos, art. 2.2 Ley 40/2003). Extracto art. 12.1: «ostenten la condición de titulares de familia numerosa, conforme lo establecido en la Ley 40/2003». Obs.: monoparental **sin** título obtiene T (FP residual; no hay pregunta de titularidad en el cuestionario). Sin F nuevo. |
| ayto-tarjeta-azul-discapacidad | **OK** (matiz) | `any` [disability gte33 | employmentStatus jubilado | dependency reconocida] reproduce las categorías Cuarta, Segunda y Quinta del Anexo — verificadas en la fuente: Segunda «Disfrutar de pensión de jubilación por razón de edad o invalidez permanente…»; Quinta «Ser mayor de dieciocho años y tener reconocida la situación de dependencia». Matiz: el excerpt citado solo cubre la Cuarta; convendría añadir Segunda/Quinta. Obs. FP: el tope `renta-max-3-iprem` (3×IPREM, propio de la cat. IV) es más laxo que el 1×IPREM de las categorías II/V → T indebida a pensionistas/dependientes con 1–3×IPREM; sin F nuevo. |
| cm-reintegro-accidentes-trabajo | **OK** | `in [empleado-publico, docente]`: los docentes de la CM cotizan en el Régimen General salvo opción mutualista, así que son destinatarios legítimos; extracto «empleados públicos incluidos en el Régimen General de la Seguridad Social». Obs. menor: docente acogido a MUFACE obtendría T indebida (no medible). |
| complemento-ayuda-infancia | **OK** | Dos degrades justificados: art. 11.6 «unidades de convivencia que incluyan menores de edad entre sus miembros» ≠ «personas a tu cargo» (proxy imperfecto → soft); art. 10.1.a con exenciones reales en la fuente («No se exigirá este plazo respecto de: 1.º Los menores incorporados a la unidad de convivencia por nacimiento, adopción, reagrupación familiar…»). |
| descuento-transporte-familia-numerosa | **OK** (obs. FP) | Idéntico patrón que IBI: `in [familia-numerosa, monoparental]`; extracto art. 11.4 «deberán presentar… el correspondiente título oficial de familia numerosa». Mismo FP residual para monoparentales sin título; sin F nuevo. |
| fuenlabrada-prestaciones-sociales | **OK** | Soft en empadronamiento con excepción literal en el extracto (art. 4.2: «se exceptúa este requisito para las prestaciones dirigidas a transeúntes, mujeres que han sufrido… violencia de género»). Umbral 6400→**7984**: el baremo del art. 7 (persona sola) corta en «665,33 y más → 0 %»; 665,33 €×12 = 7.983,96 ≈ 7.984 €/año. Correcto y citado (art. 4.3 remite al baremo del art. 7, presente en la fuente). |
| imv | **OK** | `edad-minima` soft: las excepciones del art. 5.2 están literalmente en la fuente («Tampoco se exigirá… a las personas de entre 18 y 22 años… bajo la tutela de Entidades Públicas… o sean huérfanos absolutos… Que provengan de un centro penitenciario por haber sido liberados de prisión… superior a seis meses»; víctimas de VG/trata). Además declaradas en uncovered `excepciones-edad-18-22`. |
| leganes-prestaciones-especial-necesidad | **OK** | Soft: art. 3.a «Se exceptúa de este requisito a las víctimas de violencia de género o intrafamiliar y los supuestos previstos en los artículos 10.3 y 11.1 de la Ley 1/1996… y a las prestaciones que vayan dirigidas a transeúntes» — la excepción existe y el cuestionario no la mide. |
| madrid-abono-transporte-65 | **OK** (matiz) | `any` [age≥65 | jubilado | dependency reconocida] = categorías Primera, Segunda y Quinta del Anexo Tarjeta Azul (verificadas en la fuente). El requisito `renta-iprem` (soft, 1×IPREM 12 pagas) ya cubre el tope de estas categorías. Matiz: el excerpt «Tener sesenta y cinco años cumplidos» solo prueba la Primera; añadir Segunda/Quinta sería más completo. |
| madrid-ayudas-nacimiento-adopcion-multiple | **OK** | Soft + label «múltiple»: art. 5.1 «los progenitores que hayan tenido dos o más hijos de nacimiento o adopción múltiple». El cuestionario cuenta personas a cargo pero no puede saber si nacieron en el mismo parto → soft correcto; la condición `dependents count_where_gte 2` no genera F indebida al beneficiario real (2+ hijos del parto múltiple = 2+ dependents). |
| madrid-ayudas-urgencia-social | **OK** | Soft justificado: la cartera atiende por **presencia/urgencia**, no por empadronamiento — la fuente recoge «las personas… que se encuentren en situación de urgencia o emergencia social podrán acceder a prestaciones que atiendan dichas circunstancias» sin exigir padrón. El excerpt citado («Ámbito territorial de atención Comunidad de Madrid») es débil pero el soft elimina el F. |
| madrid-bono-alquiler-joven | **OK** | Soft + `documents.contrato` ya no `mandatory`: la fuente BOCM dice «una vivienda que constituya o vaya a constituir su domicilio habitual y permanente» y la sede «Ser titular de uno de los siguientes tipos de contratos **o estar en disposición de firmarlo**» → la vía pre-contractual existe y no es medible. |
| madrid-cheque-escuela-infantil | **OK** | Soft: NEE que repite está en el extracto «los niños mayores de tres años que deban permanecer escolarizados un año más en el primer ciclo… por necesidades educativas especiales» y los no-nacidos se apoyan en uncovered `nacido-antes-2027` (bases art. 4.1.a: «Haber nacido o estar previsto el nacimiento con anterioridad a la fecha que se determine»). |
| madrid-renta-minima-insercion | **OK** | Ambos soft con excepciones literales en art. 6.1.b: «También podrá reconocerse la prestación a las personas que… 1.º Ser menor de veinticinco años o mayor de sesenta y cinco, y tener menores o personas con discapacidad a su cargo. 2.º Tener una edad comprendida entre dieciocho y veinticinco años… 3.º Tener una edad superior a sesenta y cinco años y no ser titular de pensión…» y «menores de edad, salvo que se encuentren emancipadas». Vías declaradas también en uncovered (`vias-18-25`, `mayores-65-sin-pension`, `menores-emancipados`). |
| madrid-titulo-familia-numerosa | **OK** | Soft: la excepción está en art. 2.2.e «Tres o más hermanos huérfanos de padre y madre, mayores de 18 años, o dos, si uno de ellos es discapacitado, que convivan y tengan una dependencia económica entre ellos» — no medible por `dependents`. Recogida en uncovered `equiparaciones-2-hijos`. |
| mostoles-prestaciones-sociales | **OK** | Soft ×2 (emancipado + excepciones de VG/calle/Ley 1/1996 — art. 4.1.a/b). Cambio 12p→14p **correcto según R5-VERIF**: la ordenanza dice expresamente «la actualización… se realizará anualmente, según el IPREM anual, calculado **a 14 pagas**» → `IPREM_ANUAL_14P` = 8.400 €. Es el caso en que la norma sí especifica 14 pagas. |
| pension-jubilacion-contributiva | **OK** (matiz) | Label corregido: el suelo de 52 años para coeficientes reductores por penosidad es el art. **206.6** LGSS («Jubilación anticipada por razón de la actividad») — verificado: la frase «en ningún caso dará lugar a que el interesado pueda acceder a la pensión de jubilación con una edad inferior a la de cincuenta y dos años» aparece tanto en el art. 206.6 como en el 206 bis.2 (discapacidad). El leaf cita «Art. 206 bis.2» con esa frase literal → la cita es literalmente cierta aunque el locator apunta a la variante de discapacidad y el label a la de penosidad; convendría citar 206.6 o ambos. Matiz 2: el excerpt a nivel de requisito (cuadro DT 7ª 2026) ya no prueba el nuevo label — queda como contexto. |
| prestacion-cuidado-menor-enfermedad-grave | **OK** (obs. FP) | `empleado-publico` añadido al `in`: el personal **laboral** público cotiza en el RG y es destinatario (art. 4.1: «afiliadas y en alta en algún régimen del sistema de la Seguridad Social»). El label advierte «los funcionarios de régimen propio quedan fuera». Obs.: un funcionario mutualista que marque «Empleo público» obtiene T indebida — no medible; sin F nuevo. |
| prestacion-cuidador-no-profesional__v-2026-10-23 | **OK** (matiz) | La exención añadida **existe literalmente** en la fuente (art. 5.1.c in fine): «No será necesario el cumplimiento de los requisitos relativos a la nacionalidad española… ni a la residencia en territorio español durante un periodo de cinco años… i) Solicitantes de asilo… beneficiarios de asilo o de protección subsidiaria… ii) Beneficiarias de protección temporal…». Matiz 1: el excerpt citado («Para los menores de cinco años el periodo de residencia se exigirá a quien ejerza su guarda y custodia») **no cubre** la cláusula añadida → ampliar el extracto. Matiz 2 (forma): falta «. » entre «…condiciones de acceso propias» y «El nuevo art. 5.1.c…». |
| prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad | **OK** | Nueva rama `dependents count_where_gte 2 (age<18)` dentro del `any`: implementa «en una familia numerosa **o que, con tal motivo, adquiera dicha condición**» (art. 357.1, presente en el extracto citado) — quien ya tiene 2 menores adquiere la condición de FN general con el tercer nacimiento. Solo ensancha un `any`: no introduce F. |
| prestaciones-dependencia-saad__v-2026-10-23 | **OK** (matiz) | Idéntico cambio e idéntico dictamen que `prestacion-cuidador-no-profesional__v-2026-10-23`: la exención existe en la fuente; el excerpt no la cubre y falta un punto en la concatenación del label. |
| prestamos-personal-publico-cm | **KO** | El degrade hard→soft en `personal-laboral-cm` está justificado (el cuestionario no distingue laboral fijo/temporal/funcionario), **pero** el nuevo uncovered `catalogo-personal-convenio` y el nuevo label afirman cobertura de «laboral temporal, eventual, **altos cargos** y funcionario de administración y servicios» con «límite de 1 mes de sueldo» para temporales. El extracto citado solo prueba art. 139.1 («El personal laboral fijo… tendrá derecho»); «altos cargos» **no aparece en la fuente** (0 ocurrencias) y «personal eventual» solo figura como categoría excluida o en contextos ajenos. La norma sí soporta parte del catálogo (139.2 «fondo conjunto para personal laboral y funcionario de administración y servicios»; 139.4 «Al personal temporal, con contrato de duración superior a tres meses… los plazos de amortización no excederán del período de duración de los contratos»). **Corrección propuesta:** recortar el catálogo a lo probado y ampliar el excerpt a 139.2/139.4. |
| sermas-ortoprotesica-desplazamiento | **OK** | Defecto real confirmado: `territory eq "cm"` comparaba el objeto territorio con la cadena «cm» → F para el 100 % de perfiles. `within_territory {ccaa:"13"}` es el operador correcto del motor y 13 = Comunidad de Madrid. El requisito ya era soft (`derecho-asistencia-sermas`). |
| sermas-reintegro-gastos-sanitarios | **OK** | Mismo defecto y misma corrección verificados (`titular-tarjeta-sermas`, ya soft). |
| subsidio-desempleo | **OK** | Solo label (aclara que la norma mide el mes natural anterior y aquí es proxy anual). Extracto art. 275.1 ya probaba «no superen el 75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias»; `SMI_MENSUAL ×9` = 1.221×9 = 10.989 €/año ≈ 915,75×12. Consistente. |
| subsidio-mayores-52 | **KO** | La vía de acceso diferido existe y el label es correcto — art. 280.1: «También podrán solicitar el subsidio… quienes cumplan todos los requisitos… en la fecha en la que tengan derecho a reanudar cualquier subsidio, así como quienes, reuniendo dichos requisitos, cumplan la edad de cincuenta y dos años durante la percepción de cualquiera de los subsidios previstos en el artículo 274» — **pero el extracto citado está cortado a media palabra**: «derecho a reanudar cualquier subsidio, así como quienes, reu» (viola la checklist: «ningún extracto cortado a media palabra»). **Corrección propuesta:** ampliar el excerpt a la cláusula completa («También podrán solicitar el subsidio para trabajadores mayores de cincuenta y dos años quienes… previstos en el artículo 274») y recalcular `excerptSha256`. |

## Observaciones

1. **FP residual aceptado, pero conviene registrarlo.** Tres correcciones
   `eq`→`in`/`any` convierten un falso negativo en un posible falso positivo
   que el cuestionario no puede deshacer: `anticipos-docentes-cm`
   (empleado público no docente → T), `ayto-ibi-familia-numerosa` y
   `descuento-transporte-familia-numerosa` (monoparental sin título → T),
   `prestacion-cuidado-menor-enfermedad-grave` y
   `cm-reintegro-accidentes-trabajo` (funcionario mutualista MUFACE → T).
   Coherente con ADR-017 (el peor fallo es el FN) y los labels lo advierten,
   pero si algún día se añade una pregunta de «¿tienes el título FN?» /
   «¿cotizas en régimen propio?» estas ramas deberían revisarse.
2. **Afinidad parcial por extractos que no crecieron con el label.** En
   `ayto-tarjeta-azul-discapacidad`, `madrid-abono-transporte-65`,
   `madrid-ayudas-urgencia-social`, `pension-jubilacion-contributiva` y las
   dos versiones `__v-2026-10-23` de dependencia, la afirmación añadida al
   label existe literalmente en el `.txt` citado pero **el excerpt no la
   cubre**. Todo pasa G4 (literalidad + hash), pero para la memoria y el
   jurado convendría ampliar esos extractos (Tarjeta Azul: Anexo
   Segunda/Quinta; dependencia: cláusula «No será necesario el cumplimiento…»
   del art. 5.1.c; jubilación: alinear locator/label entre 206.6 y 206
   bis.2).
3. **Defecto de forma compartido** en las dos versiones `__v-2026-10-23`: el
   texto añadido se concatena sin separación («…condiciones de acceso propias
   El nuevo art. 5.1.c…»).
4. **Fuera de alcance pero detectado:** `ayto-tarjeta-azul-discapacidad`
   usa `IPREM_ANUAL_14P ×3` para `renta-max-3-iprem` mientras la ordenanza
   dice solo «tres veces el IPREM» — según R5-VERIF («el IPREM» sin
   especificar ⇒ 12 pagas) sería 21.600 €, no 25.200 €. No se tocó en esta
   ola y el sesgo es favorable al solicitante (FP, no FN); anotado para ola
   futura.
5. **`madrid-ayudas-nacimiento-adopcion-multiple`**: el resumen de la ola
   menciona «art. 5.3 declarado en uncovered»; no hay mención a 5.3 en el
   ruleset (el uncovered cubre parto múltiple, plazo 60 días, nacionalidad,
   patria potestad, renta per cápita…). No afecta al veredicto — el degrade a
   soft es el que resuelve el FN — pero la traza del resumen no es exacta.
6. `f10-fn.test.ts` (29 casos) reproduce cada FN corregido y pasa; los dos
   tests de `review-apply-real.test.ts` que fallaban lo hacían porque faltaba
   este fichero — comprobar que ahora pasan.

## Gates ejecutados por el verificador

- `tsx scripts/eligibility-validate.ts` → 52 rulesets, **0 errores**, 52
  avisos G10 (pendiente de muestreo humano — correcto).
- `vitest run tests/eligibility/boundary/f10-fn.test.ts` → **29/29**.
- Pin golden↔rulesVersion → **47/47** coherentes.
- Campos/operadores/esquema/territorio/parámetros → todos verificados.

## Resultado

**27 OK · 2 KO** (`prestamos-personal-publico-cm`, `subsidio-mayores-52`).
Los dos KO son subsanables sin rehacer la lógica: ampliar extractos
defectuosos y recortar el catálogo del convenio a lo probado por la cita.
Ninguna corrección introduce un falso negativo nuevo; las ramas `in`/`any`
solo ensanchan. La ola queda `humanReview: pending` a la espera del
muestreo de Daniel en `muestreo-ola-12.md` (ADR-040/044).
