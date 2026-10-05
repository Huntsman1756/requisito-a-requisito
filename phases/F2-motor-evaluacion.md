# F2 — Motor de evaluación

**Fechas:** 06–08/10 (en paralelo con F1 una vez hecho F1-1) · **Depende de:** F1-1
**Especificación:** `docs/07-motor-evaluacion.md` (normativa) · **Responsable:** agente

## Objetivo
Un motor puro, determinista y probado de forma exhaustiva que, para **cualquier**
combinación de respuestas, produzca un resultado correcto o se niegue a dar
veredicto.

## Tareas (TDD: test → implementación)

| ID | Tarea | Tests mínimos |
|---|---|---|
| F2-1 | `interval.ts`: intervalos abiertos/cerrados, comparación con umbral → T/F/U | dentro, fuera, frontera exacta con `inclusive`, intervalo que cruza, abierto por un lado |
| F2-2 | `logic.ts`: Kleene `all/any/not` | tabla de verdad completa (27 binarios) + n-arios + anidados |
| F2-3 | `operators.ts`: todos los `op` de docs/07 §2.2 | por operador × {value, unknown, declined, unasked} |
| F2-4 | `territory.ts` + `within_territory` | municipio↔CCAA, CCAA sola frente a regla municipal (U o F), código inexistente, y los 4 casos críticos de EduAyudas `docs/RULE_ENGINE.md` (otra CCAA con regla hard ⇒ solo `no_cumple`; ayuda estatal ⇒ no filtra; sin CCAA ⇒ U, nunca F; misma CCAA ⇒ T) |
| F2-4b | Vías alternativas y excepciones (docs/07 §2.3): `any` con `label` y `citation`; vía satisfecha en el resultado; `missing` elige la vía con menos datos | cumple por la vía base, cumple por la excepción, U con dos vías (orden de `missing`), excepción no modelable ⇒ ⚠ |
| F2-5 | `params.ts`: resolución por vigencia y `multiplier` | cambio a 1 de enero; fuera de vigencia ⇒ error I9 |
| F2-6 | Derivados: edad desde fecha o mes/año → intervalo en `referenceDate`; `residenceMonths` desde `month_year` | cumpleaños el mismo día, 29 de febrero, mes/año ⇒ intervalo de 1 año |
| F2-7 | `evaluate.ts` + `verdict.ts` (docs/07 §4) | cada rama del veredicto; los soft nunca cambian el veredicto |
| F2-8 | `verdict-oracle.ts`: segunda implementación independiente (tabla), **escrita sin mirar verdict.ts** | igualdad con verdict.ts en todo el espacio exhaustivo |
| F2-9 | `missing.ts`: `missing` (orden por `unlocks`), `blockers`, `futureEligibility` | los tres mensajes; futuro fuera de plazo ⇒ ausente; `decreasing` ⇒ nunca; edad en intervalo ⇒ rango de fechas |
| F2-10 | `deadline.ts` | OPEN, UPCOMING, CLOSED (ayer), ROLLING, UNKNOWN, urgente < 5 días, zona Europe/Madrid, último día completo |
| F2-11 | `effort.ts` (fórmula v1, ADR-009) | entradas incompletas ⇒ sin estimación |
| F2-12 | `invariants.ts` I1–I10 | un test por invariante con evaluación corrupta ⇒ detectada |
| F2-13 | `explain.ts`: plantillas → claves `elig_*` en `es` (ADR-024) | I10: ningún número en el texto que no esté en el resultado |
| F2-14 | Generador exhaustivo (sin dependencias): dominio discretizado por campo (opciones + unknown + declined; para numéricos t−1, t, t+1 y bandas que cruzan) | sobre 3 RuleSets fixture: invariantes + **monotonía** + **determinismo**; tope de 200.000 perfiles y si se supera, pares + fronteras con informe |
| F2-15 | Rendimiento: evaluar 25 RuleSets × 1 perfil | < 50 ms con CPU 4× (medido en E2E en F5; aquí microbenchmark Node < 5 ms) |

## Verificación

```powershell
npm run check
npm test -- tests/eligibility/unit
npm run eligibility:exhaustive -- --fixtures    # imprime perfiles evaluados, recortes, 0 violaciones
npm test; npm run build
```

## Puerta de salida
- [ ] El motor no importa nada de Next, React, `fs` ni `Date.now()` (test que lo comprueba con grep sobre los imports).
- [ ] Cobertura de líneas y ramas ≥ 95 % en `eligibility-engine/` (Vitest coverage, si el repo lo tiene configurado; si no, informe de ramas cubiertas por tabla).
- [ ] Exhaustivo: 0 violaciones de invariantes, monotonía y determinismo; número de perfiles anotado.
- [ ] Oráculo independiente = veredicto en el 100 % del espacio.
- [ ] Recibo y handoff.
