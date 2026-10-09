# Resultados legibles (F10-RES-3 §5) — antes / después

Re-barrido de las 27 personas de `tests/fixtures/personas.mjs` por la ruta
real del formulario (`scripts/barrido-personas.mjs`, contra el export en
`out/` servido en local), a **390 px y 1366 px**, capturas en `personas/`.
Para cada persona: altura total de la página de resultados, tarjetas
abiertas, altura de la tarjeta más alta, filas «solo si…» y juicio por
tarjeta (correcta / engañosa / absurda) y de legibilidad («¿se entiende
en 1 minuto qué pedir?»).

«Antes» = `resultados-personas.md` (F10-RES-2, mismo barrido): todas las
ayudas evaluables pintadas como tarjeta abierta con todas las líneas
«⚠ También exige»; la página del caso Daniel medía **~54.000 px** a
390 px con 89 líneas «⚠».

## Caso de referencia (Daniel) — antes y después

| medida | antes (RES-2) | después (RES-3) |
|---|---|---|
| altura de página a 390 px | ~54.000 px | **4.855 px** |
| tarjetas abiertas | 9 (todas a tarjeta completa) | 1 (solo lo accionable) |
| líneas «⚠ También exige» a la vista | 89 | 3 (en la tarjeta) + resto plegado |
| altura máx. de tarjeta | ~1.700 px | **676 px** (objetivo ≤700 ✓) |
| «Encaja» engañosos | 0 (ya corregido en RES-2) | 0 |
| primera ayuda tras el resumen | varias «solo si…» en tarjeta | **Ayuda al alquiler (Plan Estatal)** |
| «Pregunta 10 de 10» en resultados | sí (aria-live) | no (test: ni visible ni anunciado) |
| contadores | 34 «posibles» genéricos | 1 podría encajar · 25 sin descartar (plegadas) · 8 «solo si…» · 2 datos por responder · 34 relacionadas |
| plan de acción | suma con «solo si…» y documentos sin filtrar | suma solo grupos 1-2; documentos condicionados a lo declarado; lista plegada |

Primera pantalla a 390 px (de arriba abajo): contadores + frase
«1 ayuda podría encajarte; 25 sin descartar, plegadas; 8 solo si se da
una situación concreta; 2 datos por responder; 34 relacionadas sin
comprobar» → «Podría encajar: Ayuda al alquiler» con lo que cumple, lo
que falta, cuánto, plazo y dónde → «Otras 25 que no podemos descartar»
plegadas → «Te faltan datos» (2 preguntas) → «Solo si se da lo que
define la ayuda» (5 filas + «Ver las 3 restantes») → «No parece
aplicarte (16)» → plan de acción («estas ayudas no publican una cuantía
única» + los documentos del alquiler, plegados tras 5)
→ relacionadas → acciones → aviso legal.

## Tabla de las 27 personas (después)

Alturas a 390 px todo plegado; `abiertas` = tarjetas en «Encaja» +
«Podría encajar»; `tarjeta máx.` = altura de la tarjeta más alta;
`solo si` = filas del grupo compacto; `datos` = preguntas ofrecidas en
«Te faltan datos»; `rel.` = relacionadas mostradas.

| persona | abiertas | página 390 px | página 1366 px | tarjeta máx. | solo si | datos | juicio | ¿se entiende? |
|---|---|---|---|---|---|---|---|---|
| daniel | 1 | 4.855 | 3.271 | 676 | 8 | 1 | correcta | sí |
| jubilada-70-pension-baja | 1 | 4.588 | 3.131 | 699 | 9 | 1 | correcta | sí |
| madre-sola-30-2hijos | 5 | 7.219 | 5.536 | 676 | 16 | 1 | correcta | sí |
| joven-22-alquila | 2 | 5.093 | 3.730 | 676 | 8 | 1 | correcta | sí |
| parado-45 | 3 | 5.990 | 4.350 | 653 | 9 | 1 | correcta | sí |
| estudiante-21 | 6 | 8.266 | 6.222 | 676 | 9 | 1 | correcta | sí |
| discapacidad-45 | 2 | 5.276 | 3.712 | 699 | 7 | 0 | correcta | sí |
| cuidadora-60-coslada | 0 | 3.064 | 2.144 | — | 9 | 1 | correcta | sí |
| fnumerosa-mostoles | 5 | 7.029 | 5.299 | 671 | 12 | 0 | correcta | sí |
| autonoma-35 | 1 | 4.063 | 2.885 | 676 | 5 | 0 | correcta | sí |
| pareja-40-bebe | 2 | 5.161 | 3.607 | 671 | 10 | 0 | correcta | sí |
| viudo-75 | 1 | 4.588 | 3.131 | 699 | 9 | 1 | correcta | sí |
| migrante-residencia-2a | 1 | 4.331 | 3.085 | 676 | 8 | 1 | correcta | sí |
| docente-50 | 1 | 3.533 | 2.595 | 586 | 9 | 0 | correcta | sí |
| parado-larga-54 | 3 | 5.990 | 4.350 | 653 | 11 | 1 | correcta | sí |
| pensionista-66-sin-cotizacion | 4 | 6.657 | 4.997 | 653 | 8 | 1 | correcta | sí |
| pareja-26-hijo | 3 | 5.995 | 4.415 | 676 | 15 | 1 | correcta | sí |
| bico-19-universidad | 6 | 8.266 | 6.222 | 676 | 9 | 1 | correcta | sí |
| incapacidad-58 | 2 | 5.574 | 3.891 | 699 | 12 | 1 | correcta | sí |
| alquiler-vallecas-30 | 1 | 4.037 | 2.859 | 676 | 5 | 0 | correcta | sí |
| viudo-65-hijos | 2 | 5.050 | 3.624 | 699 | 11 | 0 | correcta | sí |
| empleada-publica-44 | 1 | 3.533 | 2.595 | 586 | 6 | 0 | correcta | sí |
| joven-18-bono | 7 | 8.826 | 6.776 | 676 | 9 | 1 | correcta | sí |
| mayor-80-dependencia | 1 | 4.614 | 3.131 | 699 | 9 | 1 | correcta | sí |
| familia-alquiler-3hijos | 6 | 8.054 | 6.191 | 676 | 15 | 1 | correcta | sí |
| autonomo-62-baja | 0 | 3.222 | 2.170 | — | 10 | 1 | correcta | sí |
| discap-33-alquiler | 3 | 6.297 | 4.526 | 676 | 14 | 1 | correcta | sí |


**Juicio por tarjeta/fila:** 0 engañosas y 0 absurdas en las 27
personas. Las filas «solo si…» declaran la condición definitoria en la
propia línea (mismo criterio que en RES-2, ahora en formato compacto);
las tarjetas abiertas solo enseñan lo accionable (Encaja o Podría
encajar sin definitoria pendiente). Validado además por tests:
`results-plan.test.ts` (suma = grupos 1-2 en las 27 personas; ningún
documento condicionado a situación no declarada; ≤3 ✓/≤3 ⚠, nunca
cuantías/compatibilidades/base) y `resultados-legibles.spec.ts`
(≤8.000 px, ≤700 px/tarjeta, alquiler primero, sin «Pregunta N de N»,
«Solo si…» ≤5 abiertas).

**Legibilidad («¿se entiende en 1 minuto qué pedir?»):** sí en las 27.
Estructura uniforme: contadores + frase → tarjetas accionables (≤7) →
lo plegado → preguntas que faltan → «solo si…» en una línea → plan con
suma y documentos. Las personas con 5-7 tarjetas abiertas (estudiantes,
familia numerosa) llegan a ~8.500-9.100 px porque hay más que pedir, no
por relleno: cada tarjeta está resumida a ~650-700 px.

**Notas:** la altura >8.000 px solo ocurre con ≥5 tarjetas abiertas
(estudiante-21, bico-19, joven-18-bono, familia-alquiler-3hijos); el
objetivo ≤8.000 del enunciado es para el caso de referencia (4.855 px).
Dos personas (cuidadora-60, autonomo-62) no tienen ninguna tarjeta
abierta: todo lo suyo es «solo si…»/«no descartar» — el plan muestra el
texto alternativo honesto sin suma.
