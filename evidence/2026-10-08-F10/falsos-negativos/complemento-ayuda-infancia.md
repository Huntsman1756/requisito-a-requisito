# complemento-ayuda-infancia

## Análisis

**1. Requisitos `hard: true`.** Tres.

### `residencia-espana-1a` (`hard: true`, `residenceMonths gte 12`) — falso negativo sistemático

La norma exige «residencia legal y efectiva en España … durante al menos el año
inmediatamente anterior a la fecha de presentación de la solicitud» (art.
10.1.a). Pero `residenceMonths` se deriva de la pregunta **«¿Desde cuándo estás
empadronado ahí?»** (`q.residenceSince.label`, referida al municipio elegido en
la pregunta anterior, «¿En qué municipio de la Comunidad de Madrid estás
empadronado?»). Es decir, el campo mide **meses de empadronamiento en el
municipio actual**, no años de residencia en España.

Cualquier persona que haya cambiado de municipio (o llegado a Madrid desde otra
comunidad autónoma) hace menos de 12 meses pero resida legalmente en España desde
hace 10 años responde una fecha reciente → `residenceMonths < 12` → F →
veredicto `no_cumple`. Es un caso frecuente, no exótico: el requisito afirma algo
falso («no cumples el año de residencia en España») a quien sí lo cumple.

Además la propia ley exime del plazo a colectivos que el cuestionario no puede
capturar: «No se exigirá este plazo respecto de: 1.º Los menores incorporados a
la unidad de convivencia por nacimiento, adopción, reagrupación familiar… 2.º Las
personas víctimas de trata de seres humanos y de explotación sexual. 3.º Las
mujeres víctimas de violencia de género» (art. 10.1.a, in fine). Una mujer
víctima de violencia de género recién llegada → F indebido → `no_cumple`.

### `menor-en-unidad` (`hard: true`, `dependents` con `age lt 18` ≥ 1)

La norma dice «unidades de convivencia que incluyan **menores de edad entre sus
miembros**» (art. 11.6); el cuestionario pregunta «¿Cuántas personas tienes **a
tu cargo**? — Hijas, hijos u otras personas que dependan de ti». Un menor que es
miembro de la unidad pero que el usuario no percibe «a su cargo» (hermano menor,
hijo/a de la pareja de hecho, menor incorporado por reagrupación o acogimiento)
puede no declararse → F → `no_cumple` aunque la unidad incluya menores. La
equivalencia «a tu cargo» = «miembro de la unidad de convivencia» es más estricta
que la norma.

### `edad-titular` (`hard: true`)

Modelada correctamente como `any`: `age ≥ 23` **o** (`age ≥ 18` **y** ≥ 1 menor
de 18 a cargo), que reproduce el art. 5.2 («edad mínima de 23 años, o ser mayores
de edad o menores emancipados en caso de tener hijos o menores en régimen de
guarda…»). Las excepciones del art. 5.2 (extuteladas, liberadas de prisión > 6
meses, víctimas de violencia de género o trata — «se exigirá que la persona
titular sea mayor de edad», y huérfanos absolutos únicos miembros sin nadie ≥ 23)
aplican a titulares de 18–22 años **sin** hijos a cargo; para el complemento hace
falta de todos modos un menor en la unidad, así que un perfil de 18–22 que las
invoque y declare al menor pasa por la segunda rama. Riesgo residual ligado al
punto anterior: una huérfana de 20 años con un hermano de 16 en la unidad que no
lo cuente «a su cargo» falla en ambas condiciones.

**2. Dato del cuestionario más estricto que la norma.** Sí, dos:
`residenceSince` (empadronamiento municipal vs residencia en España) y
`dependents` (a cargo vs miembro de la unidad). Ambos alimentan requisitos
`hard: true`.

**3. Honestidad de label y uncoveredRequirements.** Los
`uncoveredRequirements` son completos y honestos (umbrales 300 %/150 %, unidad 6
meses, excepciones de edad y de residencia, incompatibilidad con la asignación,
custodia compartida). Pero declarar la excepción en ⚠ no evita que la condición
hard emita F: según docs/07 §2.3, «si no se puede modelar, no se puede descartar
a nadie por ella». El label de `residencia-espana-1a` dice «Residir legal y
efectivamente en España», sin advertir de que el dato medido es el
empadronamiento municipal: poco honesto en la práctica.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| residencia-espana-1a | bloqueante | «residencia legal y efectiva en España … durante al menos el año inmediatamente anterior» (art. 10.1.a) frente a `residenceMonths` = meses empadronado **en el municipio**; y exenciones «víctimas de trata… mujeres víctimas de violencia de género» | Degradar a `hard: false` o reformular: medir «tiempo residiendo en España» (nueva pregunta o reinterpretar residenceSince) y dejar el tramo municipal para las ayudas que lo exigen; las exenciones no modelables exigen que la regla no descarte (docs/07 §2.3) |
| menor-en-unidad | alto | «unidades de convivencia que incluyan menores de edad entre sus miembros» (art. 11.6) vs pregunta «personas a tu cargo» | Ajustar el label/ayuda de la pregunta o añadir ⚠ explícito: «cuenta también menores de tu unidad de convivencia aunque no dependan directamente de ti»; si no, degradar a soft |
| edad-titular | bajo | «o huérfanos absolutos cuando sean los únicos miembros de la unidad de convivencia y ninguno de ellos alcance la edad de 23 años» (art. 5.2) | Ya cubierto en ⚠ (`excepciones-edad-titular`); depende del punto anterior |
