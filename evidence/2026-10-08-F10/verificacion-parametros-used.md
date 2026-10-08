# Verificación independiente — `parametersUsed` ⇄ `param` en condiciones

**Fecha:** 2026-10-08 · **Verificador:** agente independiente (no autor)
**Alcance:** cambio `IPREM_ANUAL_12P → IPREM_ANUAL_14P` en
`data/eligibility/rules/mostoles-prestaciones-sociales.json` y nuevo test
`tests/eligibility/parameters-used.test.ts`.

## 1. RuleSet de Móstoles — OK

- `parametersUsed: ["IPREM_ANUAL_14P"]` (líneas 25-27) y la condición
  `carencia-ingresos` usa `"param": "IPREM_ANUAL_14P"` (línea 78). **Coinciden.**
- El label (línea 68) dice «el límite es el IPREM anual calculado a 14 pagas
  (8.400 € en 2026)». En la fuente
  `data/eligibility/sources/bocm-20220223-mostoles-ordenanza-prestaciones.txt`
  aparecen literalmente:
  - «el IPREM (Indicador Público de Renta de Efectos Múltiples) anual,
    calculado a **14 pagas**» (actualización anual del baremo),
  - «no podrá superar el importe del Indicador Público de Renta de Efectos
    Múltiples (IPREM) calculado a **14 pagas**, que se encuentre en vigor»
    (importe máximo por unidad familiar),
  - «el límite mencionado del IPREM anual en **14 pagas**».
- `parameters.json` define `IPREM_ANUAL_14P` = 8.400 EUR_YEAR (vigente desde
  2023-01-01, sin `to`), citado a BOE Ley 31/2022, DA 90.ª d): «la cuantía
  anual del IPREM será de 8.400 euros…». Coherente con el label.
- **Observación (no bloqueante):** el excerpt citado para `carencia-ingresos`
  (art. 4.1.c) dice «…ingresos económicos superiores a los recogidos en la
  presente ordenanza» — no contiene literalmente «14 pagas»; esa frase está en
  el baremo/art. 4.2 de la misma ordenanza. La cita remite correctamente a la
  ordenanza; el dato «14 pagas» se sostiene dentro de la misma fuente rango 1.

## 2. Cobertura del test — OK (con observación)

- Esquema (`src/lib/eligibility-engine/schema.ts`, líneas 33-101): `Condition`
  solo puede anidar por `all` / `any` / `not` (nodos) y `where` (hoja, op.
  `count_where_gte`). Todos los objetos son `strictObject`: **no existe otra
  clave que pueda contener una condición**.
- `paramsOf` recorre arrays, recoge `o.param` y desciende exactamente por
  `any`/`all`/`not`/`where` → **cobertura completa** de las condiciones de
  `requirements`.
- Comprobado que no se le escapa un `param` en subcondición: el deep-walk
  genérico independiente (punto 4) recorre **todas** las claves de cada objeto
  y encontró el mismo conjunto de params.
- **Observación (menor):** el test solo recorre `rs.requirements`. El esquema
  permite `condition` opcional en `application.documents[*]`
  (`documentSchema`, línea 154). Hoy hay 20 documentos con `condition` en 11
  rulesets y **ninguno usa `param`** (verificado con deep-walk), así que el
  test cubre todo lo existente. Si en el futuro una condición de documento
  usara `param`, este test no lo detectaría → sugerencia de ampliar el barrido
  a `rs.application.documents`.

## 3. Ejecución de comandos — OK

```
$ npx vitest run tests/eligibility/parameters-used.test.ts
 ✓ tests/eligibility/parameters-used.test.ts (1 test) 37ms
 Test Files  1 passed (1)
      Tests  1 passed (1)

$ npx tsx scripts/eligibility-validate.ts
eligibility:validate → 52 rulesets, 0 errores, 52 avisos
```

Los 52 avisos son todos `ELIG_G10_HUMAN_REVIEW … status = pending`
(pendiente de revisión humana, esperado; no son errores).

## 4. Contraste independiente (sin vitest) — OK

Script propio `F:\Temp\datawardsmadrid-verif-params\check.mjs` (Node puro,
deep-walk genérico por todas las claves, incluye condiciones de documentos):
**0 errores** en 52 rulesets. 12 rulesets usan parámetros y en todos
`usados == declarados`:

| ruleset | param usado = declarado |
|---|---|
| ayto-emergencia-social | IPREM_ANUAL_12P |
| ayto-tarjeta-azul-discapacidad | IPREM_ANUAL_14P |
| bono-social-electrico | IPREM_ANUAL_14P |
| bono-social-termico | IPREM_ANUAL_14P |
| leganes-prestaciones-especial-necesidad | IPREM_ANUAL_12P |
| madrid-abono-transporte-65 | IPREM_ANUAL_12P |
| madrid-ayuda-pago-unico-vg | SMI_MENSUAL |
| madrid-ayudas-alquiler-plan-estatal | IPREM_ANUAL_14P |
| madrid-ayudas-urgencia-social | IPREM_ANUAL_12P |
| madrid-bono-alquiler-joven | IPREM_ANUAL_14P |
| mostoles-prestaciones-sociales | **IPREM_ANUAL_14P** |
| subsidio-desempleo | SMI_MENSUAL |

Los 40 restantes no usan `param` ni declaran `parametersUsed` (o lo declaran
vacío/ausente sin uso — sin discrepancia).

## 5. humanReview — OK

`grep '"approved"' data/eligibility/rules/*.json` → **0 coincidencias** en los
52 rulesets. El deep-walk confirma `humanReview.status === "pending"` en todos.
Ningún ruleset real tiene `humanReview: approved` (correcto: la aprobación es
humana, ADR-044/G12).

## Veredicto global: **OK**

Cambio correcto, test con cobertura completa de las condiciones de
requirements, validación limpia (0 errores), contraste independiente
coincidente y sin `humanReview:approved`. Observaciones menores (no
bloqueantes): excerpt del art. 4.1.c no contiene literalmente «14 pagas» (la
frase está en otra parte de la misma ordenanza); el test podría ampliarse a
condiciones de `application.documents` por robustez futura.
