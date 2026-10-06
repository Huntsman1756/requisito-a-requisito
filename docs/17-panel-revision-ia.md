# Panel de revisión multimodelo (NAN) — ADR-047

**Problema:** Daniel no puede revisar a mano cada regla (36+ reglas y unos 200
requisitos) antes del 14/10. **Solución:** un **panel de 3 modelos de familias
distintas** (vía NAN, que Daniel ya paga) revisa cada requisito con una tarea
**estrecha y comprobable**, con agregación **determinista** y **calibrado con
errores inyectados**. Daniel solo ve los **desacuerdos**.

## 1. Por qué es fiable (y dónde no lo es)

- Los modelos **no aportan hechos**. El gate G4 ya garantiza que cada extracto
  existe literalmente en la fuente oficial guardada. El panel solo juzga si **la
  condición codificada dice lo mismo que el extracto** y si falta algún requisito
  en el párrafo. Es una tarea de lectura cerrada, la que mejor hacen los modelos.
- Tres familias distintas (DeepSeek, Qwen, MiMo) ⇒ los errores son poco
  correlacionados. Cualquier objeción de cualquiera de ellos ⇒ escala a Daniel.
- **Lo que el panel NO decide:** la vigencia del programa (¿admite solicitudes
  nuevas?), el rango de la fuente ni los importes temporales. Eso lo cubren los
  gates (G11), el verificador Claude (ADR-045) y el job F9.
- El resultado del panel **no es una revisión humana** y no se presenta como tal
  (ni en la web ni en la memoria).

## 2. Configuración

- Endpoint: `https://api.nan.builders/v1/chat/completions` (compatible con OpenAI),
  clave en `NAN_API_KEY` (variable de entorno local; **nunca** en el repo ni en el
  CI público). Sin dependencias nuevas: `fetch` nativo.
- Modelos del panel: `deepseek-v4-flash`, `qwen3.8-flash`, `mimo-v2.6-flash`.
  Desempate y repetición: `gemma4`. **No usar `glm*`** (nivel premium; la-ayuda lo
  prohíbe y se mantiene el criterio).
- `response_format: { type: "json_object" }`, temperatura 0 (o la mínima
  admitida), `max_tokens` acotado. Máximo 6 peticiones concurrentes y ≤ 50 por
  minuto (el límite es 60 rpm por clave). Reintentos con backoff ante 429/5xx.
  Timeout de 90 s.
- Caché por huella: `sha256(modelo + versión del prompt + item)`; no se repite una
  revisión idéntica. Registro de cada llamada (modelo, latencia, tokens, salida
  cruda) en `evidence/<fecha>-panel/raw/`.

## 3. Unidad de revisión (un «ítem»)

Por cada requisito, umbral, importe, ventana de plazo y documento con cita:

```jsonc
{
  "ruleSlug": "madrid-bono-alquiler-joven",
  "itemId": "req:edad-18-35",
  "kind": "requirement",          // requirement | amount | window | document | uncovered
  "label": "Tener entre 18 y 35 años",
  "hard": true,
  "condition": { "field": "age", "op": "between", "value": [18, 35] },   // tal cual
  "conditionPlain": "edad ≥ 18 y ≤ 35 a fecha de solicitud",            // render determinista
  "excerpt": "…literal…",
  "context": "…±1.200 caracteres del .txt de la fuente alrededor del extracto…",
  "locator": "Art. 4.1.a"
}
```

Además, **un ítem de completitud por regla**: la sección de beneficiarios y
requisitos completa (localizada en el `.txt`) + la lista de requisitos modelados y
de `uncovered` ⇒ «¿falta algún requisito que la norma exija a la persona
solicitante?».

## 4. Pregunta y salida (JSON estricto)

Prompt versionado (`prompts/panel-v1.md`), en español, que **solo** permite usar el
texto suministrado:

```jsonc
{
  "fidelity": "exact" | "too_strict" | "too_lax" | "wrong" | "cannot_tell",
  "hardness": "ok" | "should_be_soft" | "should_be_hard",
  "falseNegativeRisk": "none" | "low" | "high",
  "falsePositiveRisk": "none" | "low" | "high",
  "missingRequirements": [ { "quote": "…literal del contexto…", "why": "…" } ],
  "explanation": "≤ 2 frases"
}
```

Validación con Zod. Una salida inválida se reintenta una vez y después cuenta
como `cannot_tell`. Las citas de `missingRequirements` deben existir literalmente
en el contexto (si no, se descartan).

## 5. Agregación determinista

| Condición | Resultado del ítem |
|---|---|
| Los 3 modelos dicen `exact` + `hardness ok` + riesgos `none`/`low` + sin `missingRequirements` válidos | **PASS** |
| Algún `too_lax` o `falsePositiveRisk: high` | **ESCALA** (falso positivo) |
| Algún `too_strict` o `falseNegativeRisk: high` | **ESCALA** (falso negativo, ADR-017) |
| Algún `wrong` o `cannot_tell`, o desacuerdo en `hardness` | **ESCALA** |

Una regla queda **`panelReview.status = "approved"`** si todos sus ítems son PASS
**y** pasa G1–G12 **y** tiene `verification: ok` (verificador Claude). Si no, la
hoja de escalado reúne **solo los ítems en duda**, con las tres opiniones, en
`evidence/<fecha>-panel/escalado.md`, y Daniel marca OK o KO por ítem.

## 6. Calibración con errores inyectados (criterio de aceptación del propio panel)

Antes de usar el panel para aprobar nada:
1. Conjunto de **mutantes** generado de forma determinista a partir de las reglas
   ya verificadas: umbral ±1 y ±10 %, `lt`↔`lte`, `hard`↔`soft`, condición
   invertida, requisito eliminado (debe detectarse en completitud), campo
   cambiado, IPREM de 14 en lugar de 12. Más los **defectos reales** ya
   encontrados como casos históricos (Bono Cultural modelado por edad, Renfe
   citada por rango 3, falsos negativos de la RMI, Tarjeta Azul con 14P).
2. Conjunto de **controles**: los ítems originales verificados (no deberían
   escalar).
3. **Criterio de aceptación:** detección de mutantes ≥ 95 % (y 100 % en los de
   «falso positivo»), y falsas alarmas sobre los controles ≤ 20 %. Si no se
   cumple, se ajusta el prompt (nueva versión) y se repite. **Nunca** se relaja el
   criterio.
4. Informe en `evidence/<fecha>-panel/calibracion.md`: matriz de confusión por
   modelo y del panel. Es material directo para la memoria.

## 7. Qué cambia en los gates y en la web

- `panelReview: { status: "approved" | "escalated" | "pending", promptVersion, models, at, report, calibration }` en el RuleSet (Zod + JSON Schema).
- **Release del jurado (`--strict`)**: entra una regla si `humanReview = approved`
  **o** (`panelReview = approved` **y** la calibración vigente pasa el criterio §6).
- Etiquetas: `panel approved` ⇒ «Comprobada con la fuente · revisada por un panel
  independiente»; `humanReview approved` ⇒ «Comprobada con la fuente · revisada»;
  ninguna de las dos ⇒ «revisión final pendiente» (ADR-044).
- «Cómo funciona» y la memoria explican el panel tal cual (tres modelos, tarea
  acotada, calibración y escalado a una persona).
- **Muestreo humano final recomendado:** Daniel revisa al azar 5 ítems aprobados
  por el panel (≈ 15 min). Si hay algún KO, se invalida la calibración y se repite.

## 8. Coste y tiempo estimados

~36 reglas × ~7 ítems × 3 modelos ≈ 750 llamadas (+ calibración ≈ 1.500). A ~50
rpm son ≈ 45–60 min de reloj, ejecutables en segundo plano. Las cuotas de NAN
indicadas en su web (cientos de millones de tokens al mes) lo cubren con
holgura; verificar el saldo de la cuenta antes.
