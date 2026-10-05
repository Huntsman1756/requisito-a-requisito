# Motor de evaluación — especificación normativa

Este documento define **cómo se evalúa cualquier respuesta posible** del ciudadano
y **qué comprobaciones pasan antes de mostrar un resultado**. Es la parte más
importante del producto: si el motor se equivoca, el producto hace daño.

Esquemas formales: `schemas/*.schema.json`. Implementación: TypeScript estricto en
`la-ayuda/src/lib/eligibility-engine/` (funciones puras, sin I/O, reloj inyectado).

Inspiración (patrones, no código): OpenFisca (parámetros con vigencia, reglas como
datos), ACCESS NYC / MyFriendBen (screener por preguntas), Aides Jeunes
(consistencia de respuestas). Ver `docs/04-referencias-internacionales.md`.

---

## 0. Criterios de decisión (orden de prioridad cuando chocan)

1. **No inducir a error.** Ante la duda, `U` o requisito no comprobable (⚠), nunca `T`.
2. **Asimetría de errores (ADR-017).** Un **falso negativo** (decir «no te
   aplica» a quien sí cumple) desanima a solicitar y es el error más dañino de un
   orientador. Por eso:
   - `F` solo con respuesta `value` **y** una regla modelada sin ambigüedad.
   - Un requisito cuya interpretación sea discutible (discrecionalidad, conceptos
     indeterminados, «situación de vulnerabilidad acreditada»…) **no** se modela
     como condición hard: va a `uncoveredRequirements` (⚠).
   - `no_cumple` nunca se oculta del todo: queda plegado, con el motivo, la cita y
     «Si crees que sí cumples, consulta la fuente oficial».
3. **No competir con lo oficial (ADR-018).** Si existe un simulador o un
   comprobador oficial para la ayuda, es la acción principal de la tarjeta.
4. **Explicar antes que puntuar.** Cada fila tiene un porqué y una fuente. No
   existen puntuaciones opacas en el nivel «comprobado».
5. **Pedir lo mínimo.** Solo se pregunta lo que alguna regla del bundle necesita;
   se prefieren bandas a cifras exactas y no se piden fechas de nacimiento de menores.

## 1. Dominio de respuestas

Cada pregunta (catálogo en `schemas/question-catalog.schema.json`) produce una
`Answer` con **cuatro estados posibles**:

| Estado | Significado | Cómo lo trata el motor | Mensaje |
|---|---|---|---|
| `value` | El usuario dio un valor | Se evalúa | — |
| `unknown` | Pulsó «No lo sé» | `U` (desconocido) | «No lo sabes: puedes consultarlo en …» (si hay ayuda) |
| `declined` | Pulsó «Prefiero no decirlo» | `U` | «No lo has querido indicar» — **no insistir** (no se vuelve a pedir en «qué te falta» salvo que el usuario lo abra) |
| `unasked` | La pregunta no se mostró | `U` | «No te lo hemos preguntado» + botón para responder |

**Nunca** un estado distinto de `value` produce `F` (no cumple).

### 1.1 Tipos de valor

| Tipo | Ejemplo | Representación interna |
|---|---|---|
| `single` | situación laboral | token del catálogo (`desempleado`) |
| `multi` | colectivos | conjunto de tokens |
| `integer` | nº de hijos | entero con `min/max` |
| `age` | edad | **intervalo** `[min,max]` en años cumplidos a `today` (exacta: `[n,n]`; por mes/año de nacimiento: intervalo de ≤1 año; por banda: banda) |
| `money_band` | ingresos | **intervalo** `[min,max)` en € anuales |
| `month_year` | alta en padrón | fecha (día 1) → permite derivar `residenceMonths` como intervalo |
| `territory` | CCAA + municipio | códigos INE (`ccaa`, `province`, `municipality`) — jerárquico |
| `dependents` | hijos/menores a cargo | lista de `{ ageInterval, disability? }` |

Regla general: **todo dato impreciso es un intervalo**, y el motor razona sobre
intervalos (§3). Esto permite preguntar bandas (menos invasivo) sin falsear la
evaluación.

### 1.2 Validación de respuestas (antes de evaluar)

- Rango: `age ∈ [0,120]`, `integer ∈ [min,max]`, bandas del catálogo, fechas no futuras.
- Coherencia (patrón Aides Jeunes): reglas declarativas en el catálogo, p. ej.
  `age < 16 ∧ employment = jubilado`. Una incoherencia **no bloquea**: se pide
  confirmación; si se confirma, se evalúa tal cual.
- Campo inválido ⇒ se trata como `unasked` y la UI muestra el error accesible
  (`role="alert"`) en la pregunta, nunca un resultado.

---

## 2. Reglas

Cada ayuda tiene un `RuleSet` (`schemas/rule-set.schema.json`) con:

- `requirements[]`: **cada requisito = una fila de la tarjeta**, con `hard`
  (excluyente) o no, `label`, `citation` (fuente + localizador + extracto literal +
  huella) y una `condition`.
- `condition`: árbol con `all` / `any` / `not` y hojas `{ field, op, value | param }`.
- `uncoveredRequirements[]`: requisitos de la fuente que no se pueden modelar
  (p. ej. «estar al corriente con Hacienda»). Siempre visibles como ⚠.
- `application`: ventana (`opensAt`, `closesAt`, `rolling`), canal, documentos.
- `amount`: tipo e importes con cita.

### 2.1 Parámetros con vigencia (patrón OpenFisca)

Umbrales que cambian por año (IPREM, SMI, límites de renta) **no se escriben
dentro de las reglas**: se referencian (`param: "IPREM_ANUAL_14P"`, `multiplier: 2`)
y viven en `parameters.json` con periodos de vigencia y cita
(`schemas/parameters.schema.json`). El motor resuelve el valor vigente en la
**fecha de referencia** de la convocatoria (`referenceDate` del RuleSet; si no
consta, `today`), no en la fecha del sistema.

### 2.2 Operadores

| `op` | Aplica a | Significado |
|---|---|---|
| `eq`, `neq` | single, integer | igualdad |
| `in`, `not_in` | single | pertenencia a lista |
| `includes_any`, `includes_all` | multi | intersección |
| `lt`, `lte`, `gt`, `gte` | integer, age, money_band, residenceMonths | comparación sobre intervalos (§3) |
| `between` | ídem | `[a,b]` inclusivo salvo que la cita diga lo contrario (`inclusive: [true,false]`) |
| `within_territory` | territory | el territorio del usuario está dentro del de la regla (§3.3) |
| `count_where_gte` | dependents | nº de personas a cargo que cumplen subcondición ≥ n |
| `exists` | cualquiera | hay valor |

**Cada umbral lleva en la cita su literal** («menores de 26 años» ⇒ `lt 26`, no
`lte 25` aunque sea equivalente: se escribe como dice la norma para que la
revisión humana sea directa).

### 2.3 Vías alternativas y excepciones (patrón Catala)

Las normas suelen escribirse como «regla base + excepciones» («menores de 26
años, **o** de 30 si tienen discapacidad ≥ 33 %»; «6 meses empadronado, **salvo**
víctimas de violencia de género»). Se modelan como `any` cuyos hijos llevan
`label` y `citation` propios:

```jsonc
"condition": { "any": [
  { "label": "Menor de 26 años", "citation": {…art. 3.1…}, "field": "age", "op": "lt", "value": 26 },
  { "label": "Menor de 30 con discapacidad ≥ 33 %", "citation": {…art. 3.2…},
    "all": [ { "field": "age", "op": "lt", "value": 30 }, { "field": "disabilityDegree", "op": "gte", "value": 33 } ] }
]}
```

- Resultado `T`: la fila dice **por qué vía** se cumple («Cumples por: menor de 30
  con discapacidad»).
- Resultado `U` en un `any`: `missing` propone la vía con **menos datos
  pendientes** y menciona las demás.
- Una excepción que favorece al ciudadano y no se puede modelar ⇒ ⚠ en
  `uncoveredRequirements` (si no se puede modelar, no se puede descartar a nadie
  por ella).

### 2.4 Coexistencia con el asistente actual (ADR-016)

la-ayuda ya ordena las fichas con un **ranking heurístico de relevancia**
(`src/lib/rules/assistant.ts`, `rankBenefits`, pesos documentados en
`src/lib/rules/README.md`). Ese ranking **no es elegibilidad** y no se toca. La
página de resultados muestra **dos niveles que nunca se mezclan**:

| Nivel | Origen | Etiquetas permitidas | Etiquetas prohibidas |
|---|---|---|---|
| **Comprobadas con las reglas oficiales** | Motor (este documento), solo ayudas con RuleSet aprobado | probable / posible / faltan datos / no parece aplicarte | — |
| **También podrían interesarte** | `rankBenefits` sobre el resto del catálogo | «Relacionada con tu situación — no hemos comprobado los requisitos» | probable, cumples, cualquier ✓ de requisito |

Así el producto es útil más allá del vertical sin aparentar más rigor del que tiene.

---

## 3. Lógica trivalente sobre intervalos

Resultado de toda condición: `T` (cumple), `F` (no cumple), `U` (no se puede saber).

### 3.1 Hojas

- Respuesta no `value` ⇒ `U`.
- Comparación sobre intervalo `[lo,hi]` del usuario contra umbral `t`:
  - `lt t`: `hi < t` ⇒ T · `lo ≥ t` ⇒ F · si no ⇒ U («tu rango incluye valores que
    cumplen y que no»; `missing` pide el dato preciso).
  - Análogo para `lte/gt/gte/between`.
- `eq/in` sobre tokens: T/F directo.

### 3.2 Composición (lógica de Kleene)

| | `all` (Y) | `any` (O) | `not` |
|---|---|---|---|
| Regla | algún F ⇒ F; si no, algún U ⇒ U; si no T | algún T ⇒ T; si no, algún U ⇒ U; si no F | T↔F, U⇒U |

Propiedad garantizada (y testeada): **monotonía** — completar un dato `U` nunca
cambia un resultado ya `T` o `F`; solo convierte `U` en `T` o `F`.

### 3.3 Territorio

Jerarquía INE `CCAA ⊃ provincia ⊃ municipio`. Regla municipal y usuario solo con
CCAA: si la CCAA contiene el municipio ⇒ `U` (pedir municipio); si no ⇒ `F`.
Regla autonómica y usuario con municipio ⇒ se deriva CCAA ⇒ T/F.
Tabla de códigos: snapshot INE con cita (`docs/08-fuentes-y-datos.md`).

### 3.4 Tiempo

- `today` se inyecta (ISO date). Ninguna función llama a `Date.now()`.
- Edad, meses de residencia y antigüedades se calculan respecto a la
  `referenceDate` que fije la convocatoria («a 31 de diciembre», «a la fecha de
  solicitud»…). Si la convocatoria fija una fecha y no se ha modelado ⇒ la regla no
  pasa el gate de build.

---

## 4. Del resultado por requisito al veredicto

Para cada requisito: `status ∈ {T,F,U}`. Luego:

```
hardF   = requisitos hard con F
hardU   = requisitos hard con U
softF   = requisitos no hard con F
covered = uncoveredRequirements.length == 0

verdict =
  hardF > 0                         → "no_cumple"
  hardU == 0 && covered             → "probable"
  hardU == 0 && !covered            → "posible"     (hay requisitos no comprobables)
  hardU > 0 && hardU <= satisfied   → "posible"
  else                              → "insuficiente"
```

`softF` nunca cambia el veredicto: aparece como aviso («puede afectar a la cuantía»).

**Plazo** es independiente del veredicto (es una fila más, §6): una ayuda
`probable` con plazo `CLOSED` se oculta por defecto pero no cambia de veredicto.

### 4.1 «¿Qué me falta?» (`missing`, `blockers`, `futureEligibility`)

| Situación | Salida | Mensaje |
|---|---|---|
| `hardF == 0 && hardU > 0` | `missing[]` = campos que resolverían cada U (deduplicados, ordenados por nº de requisitos que desbloquean) | «No podemos determinarlo: faltan N datos» + responder en línea |
| `hardF == 1` y resto hard T | `blockers[0]` | «Cumples todo salvo: <label>» + cita |
| `hardF ≥ 1` solo por campos `timeDependent: "increasing"` (edad mínima, meses de residencia, antigüedad) y el resto hard T | `futureEligibility.date` = primera fecha en que todos pasan | «Podrías cumplirla a partir del <fecha>» **solo si** `date ≤ closesAt` o `rolling`/recurrente con cita |
| `hardF ≥ 2` | `blockers[]` | «No parece aplicarte: no cumples A y B» (plegado) |

Nunca hay elegibilidad futura por: edad máxima (`decreasing`), ingresos,
situación laboral, territorio. Si la edad es un intervalo, la fecha también:
«entre el X y el Y».

### 4.2 Orden de resultados

1. Plazo `OPEN`/`ROLLING`/`UPCOMING` antes que `UNKNOWN`; `CLOSED` oculto por defecto.
2. Veredicto: `probable` > `posible` > `insuficiente`.
3. Dentro: plazo más cercano primero; luego importe por solicitante (si hay).
4. `no_cumple` en sección plegada «No parece aplicarte (ver por qué)».

---

## 5. Comprobaciones antes de dar una respuesta (runtime self-check)

Antes de renderizar **cada** evaluación, `assertEvaluationInvariants(evaluation,
ruleSet, bundleManifest)` se ejecuta en el navegador. Si **cualquier** invariante
falla para una ayuda, esa ayuda **no muestra veredicto**: se muestra «No podemos
evaluar esta ayuda ahora. Consulta la fuente oficial ↗» y se emite el evento
`invariant_failed` (solo `slug` + código de invariante; nada del perfil).

| ID | Invariante |
|---|---|
| I1 | Cada requisito del RuleSet aparece exactamente una vez en `satisfied ∪ failed ∪ unknown` |
| I2 | `verdict` recalculado por una **segunda implementación independiente** (tabla de verdad compacta en `verdict-oracle.ts`) coincide |
| I3 | Toda fila, importe, documento, plazo y canal mostrados tienen `citation.sourceId` existente en `sources[]` con `url` https y `locator` |
| I4 | `probable` ⇒ `hardU == 0 && hardF == 0` |
| I5 | `futureEligibility.date > today` y (`≤ closesAt` o recurrente citado) |
| I6 | `amount.type == "total_budget"` ⇒ no se renderiza como «puedes recibir» |
| I7 | Digest del bundle cargado == digest del manifiesto embebido en el HTML (bundle no manipulado ni mezclado de builds distintas) |
| I8 | Frescura: `today − verifiedAt ≤ 90 días` (si > 30, banner «verificado hace N días, puede haber cambiado»; si > 90 ⇒ falla) |
| I9 | Parámetros resueltos tienen vigencia que cubre `referenceDate` |
| I10 | Ningún texto de explicación contiene un número que no esté en la evaluación (plantillas solo interpolan campos del resultado) |

Además, a nivel de bundle completo: si el manifiesto no carga o I7 falla para el
bundle, la página entera muestra error honesto y enlace al catálogo; nunca
resultados parciales silenciosos.

---

## 6. Plazo (`deadline`)

`OPEN` (hoy entre `opensAt` y `closesAt`), `UPCOMING` (antes de `opensAt`),
`CLOSED` (después de `closesAt`), `ROLLING` (sin plazo, citado), `UNKNOWN`
(sin dato fiable). Días restantes en zona `Europe/Madrid`; el último día cuenta
completo salvo cita en contra. `< 5 días` ⇒ estilo urgente (DESIGN.md).
Contradicción entre fuentes del mismo rango ⇒ `UNKNOWN` + aviso («las fuentes
oficiales no coinciden»), y el gate de build lo reporta.

---

## 7. Explicaciones

Plantillas deterministas por (`op`, resultado) con claves i18n
(`elig_req_pass`, `elig_req_unknown_range`, `elig_missing_n`, …). Solo interpolan
campos de la evaluación (I10). Lenguaje claro: frases ≤ 20 palabras, segunda
persona, sin jerga; el literal oficial va en el desplegable de la cita.

---

## 8. Pruebas del motor (obligatorias, en orden de fase)

1. **Unitarias por operador** con intervalos: dentro, fuera, frontera exacta,
   intervalo que cruza el umbral, `unknown/declined/unasked`.
2. **Tabla de verdad Kleene** completa para `all/any/not` (27 casos binarios + n-arios).
3. **Exhaustivas por RuleSet (build-time):** para cada ayuda se enumera el producto
   cartesiano del dominio discretizado de los campos que usa: cada opción del
   catálogo + `unknown` + `declined`, y para numéricos los puntos `t−1, t, t+1` de
   cada umbral + una banda que cruza cada umbral. Para cada perfil generado:
   - I1–I10 se cumplen;
   - **monotonía**: sustituir cualquier `U` por cualquier valor no cambia
     requisitos ya T/F;
   - **determinismo**: dos ejecuciones ⇒ JSON byte a byte igual.
   Si el producto supera 200.000 perfiles, se usa cobertura por pares + fronteras
   y se reporta el recorte. Sin dependencias nuevas (no fast-check): generador propio.
4. **Personas golden** (`schemas/golden-persona.schema.json`): ≥ 12 perfiles
   ficticios con resultado esperado por ayuda, **justificado con cita** y
   **revisado por Daniel**. Son el oráculo jurídico; el resto de tests son
   estructurales.
5. **Mutación dirigida:** script que altera cada umbral de un RuleSet en ±1 y
   comprueba que al menos un test golden o de frontera falla. Mutante superviviente
   ⇒ falta un caso; se añade.
6. **Elegibilidad futura:** dentro de plazo, fuera de plazo, edad máxima (nunca),
   intervalo de edad (rango de fechas), recurrente citado.
7. **Parámetros:** cambio de vigencia a 1 de enero; `referenceDate` fuera de toda
   vigencia ⇒ I9.
8. **Self-check:** un test por invariante que fabrica una evaluación corrupta y
   comprueba que la UI muestra «No podemos evaluar» y no un veredicto.
