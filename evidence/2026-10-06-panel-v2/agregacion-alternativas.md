# Calibración v2: ¿falla la agregación o fallan los modelos? (2026-10-08)

**Conclusión: fallan los modelos.** Ninguna regla de agregación razonable cumple
a la vez los tres umbrales de docs/17 §6. El panel **no se acepta** para esta
candidatura (ADR-050).

## Método

Reagregamos offline los 327 × 3 veredictos guardados en `resultados.json`, sin
llamadas nuevas, con
`npx tsx scripts/review-panel/simulate-aggregation.ts evidence/2026-10-06-panel-v2`.

- Criterio de objeción `strict`: el de `aggregate()` (fidelity ≠ exact, hardness ≠ ok,
  riesgo alto o requisito ausente). `nohard`: lo mismo, pero ignorando `hardness`.
- Agregación:
  - `any`: basta una objeción válida.
  - `any-invalid-escalates`: lo que hace hoy el código, porque una salida inválida
    cuenta como `cannot_tell` y por tanto escala.
  - `2of3`: hacen falta 2 objeciones.
  - `2ofvalid`: 2 objeciones entre las salidas válidas; con menos de 2 válidas, escala.
- Aproximación declarada: `missingRequirements` se cuenta sin revalidar la cita
  literal contra el contexto.

## Resultado

| Criterio de objeción | Agregación | Detección (≥95 %) | Mutantes FP (100 %) | Falsas alarmas (≤20 %) |
|---|---|---|---|---|
| strict | any | 87.7 % | 84.5 % | 69.6 % |
| strict | any-invalid-escalates (actual) | 94.5 % | 92.8 % | 76.1 % |
| strict | 2of3 | 72.3 % | 70.1 % | 40.2 % |
| strict | 2ofvalid | 72.3 % | 70.1 % | 40.2 % |
| nohard | any | 84.3 % | 77.3 % | 67.4 % |
| nohard | any-invalid-escalates | 93.2 % | 89.7 % | 76.1 % |
| nohard | 2of3 | 65.5 % | 54.6 % | 37.0 % |
| nohard | 2ofvalid | 65.5 % | 54.6 % | 37.0 % |

## Lectura

1. **Parte de la «detección» es accidental.** Si las salidas inválidas no
   escalaran, la detección bajaría de 94,5 % a 87,7 %. El 22 % de las salidas de
   qwen3.8-flash fueron inválidas (71 de 327).
2. **Lo que se gana en un umbral se pierde en otro.** Exigir mayoría reduce las
   falsas alarmas al 40 %, pero hunde la detección al 72 %. Ninguna regla
   alcanza a la vez ≥ 95 % de detección y ≤ 20 % de falsas alarmas.
3. **Parte de las «falsas alarmas» pueden ser defectos reales.** La
   `tria-defectos-v1.md` lista 7 sospechosos que persisten en la v2. Un control
   no es necesariamente correcto, así que estos sospechosos se revisan por la
   vía normal (autor ⇒ verificador), no con el panel.
4. **Docs/17 §6 prohíbe relajar el criterio, y no se relaja.** Ajustar la
   agregación sobre estos mismos 327 casos y medir sobre ellos sería
   sobreajuste. Una futura v3 necesitaría modelos más capaces y un conjunto de
   validación separado por slug, y queda para después del 16/10.

## Consecuencia

- R6-CALIB queda cerrada con el resultado NO CUMPLE. R6-RUN se cancela y no se
  escribe `panelReview` en ninguna regla.
- La release del jurado depende de `humanReview`, con el muestreo de Daniel por
  ola (ADR-040), tal como prevé ADR-044.
- En la memoria, la calibración se presenta como resultado negativo medido: es
  evidencia de rigor y no se oculta.
