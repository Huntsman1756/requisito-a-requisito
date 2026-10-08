# imv

## Análisis

**1. Requisitos `hard: true`.** Uno solo (`edad-minima`); los otros dos son
`hard: false`, pero sus filas F también afirman cosas que la norma no dice.

### `edad-minima` (`hard: true`) — excepciones del art. 5.2 no modeladas

La condición es `any` [`age ≥ 23`, `age ≥ 18` **y** ≥ 1 menor < 18 a cargo], que
reproduce la regla general («edad mínima de 23 años, o ser mayores de edad o
menores emancipados en caso de tener hijos o menores en régimen de guarda…»).
Pero el propio art. 5.2 continúa: «salvo en los supuestos de mujeres víctimas de
violencia de género, víctimas de trata de seres humanos y explotación sexual en
los que se exigirá que la persona titular sea mayor de edad o menor emancipada,
o el de personas que hayan estado bajo la tutela de Entidades Públicas de
protección de menores dentro de los tres años anteriores a la mayoría de edad o
que provengan de centros penitenciarios por haber sido liberados de prisión,
siempre que la privación de libertad haya sido por tiempo superior a seis meses,
en los que se exigirá que la persona titular sea mayor de edad». Y añade la vía
de «huérfanos absolutos cuando sean los únicos miembros de la unidad de
convivencia y ninguno de ellos alcance la edad de 23 años».

Una persona de 20 años extutelada, liberada de prisión tras > 6 meses, víctima
de violencia de género o de trata, **sin menores a cargo**, cumple la norma como
solicitante individual y obtiene F → `no_cumple`. El cuestionario no tiene campo
para esas circunstancias: según docs/07 §2.3 («si no se puede modelar, no se
puede descartar a nadie por ella») esta regla no debería producir F duro. Que la
excepción figure en `uncoveredRequirements` (`excepciones-edad-18-22`) no cambia
el veredicto.

### `residencia-espana-1a` (`hard: false`, `residenceMonths gte 12`) — campo que mide otra cosa

La norma pide «residencia legal y efectiva en España … durante al menos el año
inmediatamente anterior a la fecha de presentación de la solicitud» (art.
10.1.a). `residenceMonths` se deriva de «¿Desde cuándo estás empadronado **ahí**?»
— meses de empadronamiento en el municipio actual, no residencia en España. Quien
se mude de municipio dentro de España obtiene fila F indebida («no cumples la
residencia») aun teniendo 20 años de residencia legal. Al ser soft no cambia el
veredicto, pero la fila dice algo falso. Además las exenciones del art. 10.1.a
(«No se exigirá este plazo respecto de: … 2.º Las personas víctimas de trata de
seres humanos y de explotación sexual. 3.º Las mujeres víctimas de violencia de
género») tampoco son modelables.

### `ingresos-inferiores-renta-garantizada` (`hard: false`, `incomeAnnual lt 8803.2`)

Dirección benigna: la norma exige ingresos «inferior, al menos en 10 euros, a la
cuantía mensual de la renta garantizada» (art. 11.2), lo que para persona sola en
2026 equivale a ~8.683 €/año; el umbral usado (8.803,20 €, PNC 2026, «queda
establecida en 8.803,20 euros anuales») es **menos** estricto → nunca F indebido.
La escala por número de miembros está declarada en el label con ⚠.

**2. Dato del cuestionario más estricto que la norma.** Sí:
`residenceSince` mide empadronamiento municipal (más estricto que residencia en
España) y `age`+`dependents` no recogen las excepciones del art. 5.2.

**3. Honestidad de label y uncoveredRequirements.** Muy completo
(`uncoveredRequirements` enumera unidad 6 meses, vida independiente < 30, pareja,
patrimonio, activos, administrador de sociedad, excepciones de edad y de
residencia, servicio residencial, vulnerabilidad sobrevenida, compatibilidad con
trabajo y el propio complemento). La parte débil es la misma de siempre: las
excepciones están declaradas pero la regla hard sigue descartando.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| edad-minima | alto | «…el de personas que hayan estado bajo la tutela de Entidades Públicas de protección de menores dentro de los tres años anteriores a la mayoría de edad o que provengan de centros penitenciarios por haber sido liberados de prisión… en los que se exigirá que la persona titular sea mayor de edad» (art. 5.2) | Degradar a `hard: false` (docs/07 §2.3: excepción favorable no modelable) o añadir campo de circunstancias excepcionales; mientras, el ⚠ existente no evita el `no_cumple` |
| residencia-espana-1a | alto | «residencia legal y efectiva en España … durante al menos el año inmediatamente anterior» (art. 10.1.a) vs `residenceMonths` = empadronamiento en el municipio; exenciones «víctimas de trata… violencia de género» | Medir residencia en España (nueva pregunta/ayuda: «aunque sea en otro municipio») o matizar el label de la fila para no afirmar «no cumples residencia» a quien se ha movido dentro de España |
| ingresos-inferiores-renta-garantizada | ninguno | — | — |
