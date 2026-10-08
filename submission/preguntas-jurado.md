# Preguntas difíciles del jurado — respuesta y evidencia

Cada respuesta lleva su fuente dentro del repo; ninguna afirmación es a ojo.

## «¿Qué pasa cuando cambia la ley?»

La frescura es diaria: `.github/workflows/freshness.yml` re-descarga las normas
y comprueba que cada extracto citado sigue presente. Si un extracto desaparece,
la regla se marca stale y la ayuda sale del bundle (fail-closed) hasta revisarla.
La reforma real de la Ley 39/2006 (Ley 4/2026, 03/10) ejercitó esto en producción:
detectada el 06/10, las dos reglas afectadas salieron y volvieron como versiones
con ventana de vigencia (R8-VIG). Evidencia: `data/freshness/runs.jsonl`,
commit `feat(f9)`, `docs/08` §frescura.

## «¿Por qué no IA?»

Porque decidir no es resumir. La IA está prohibida en el producto (ADR-003):
un modelo generativo puede alucinar un umbral o una excepción; aquí la decisión
la toma un motor determinista con cita literal y sha256 por requisito. Donde la
norma no se puede comprobar con nuestras preguntas, lo declara (`uncovered`)
en vez de inventarse una respuesta. `docs/07`, `evidence/2026-10-08-F10/fiabilidad.md`.

## «¿Cómo sabéis que no os equivocáis?»

Cuatro capas medidas:

1. Verificador independiente por ola (autor ≠ verificador): informes en
   `evidence/*/verificacion-ola-*.md`.
2. 527 tests: invariantes del motor, fronteras, mutación (238 mutantes), goldens
   (44 personas reales con expectativa anotada).
3. Auditoría de falsos negativos de los 50 programas (B1): cada regla revisada
   preguntando «¿puede decir que no a quien la norma admite?» —
   `evidence/2026-10-08-F10/falsos-negativos/resumen.md`, 29 corregidas y
   reverificadas.
4. Exhaustivo: 259.391 perfiles sintéticos, 0 violaciones de los invariantes
   (`eligibility:exhaustive`).

## «¿Cuántos usuarios tenéis?»

Cero medidos aún — es una candidatura, no un producto en producción. El piloto
con personas reales está en preparación (kit en `evidence/2026-10-06-F8/kit/`)
y sus agregados serán medianas y absolutos, nunca porcentajes con n<10
(ADR-051a). No inflaremos el número: «0 usuarios medidos» es la cifra honesta.

## «¿Quién lo mantiene?»

El pipeline es automático donde puede serlo: frescura diaria en CI, extracts
auto-verificados por huella, build fail-closed. Lo que requiere juicio
(una reforma sustantiva, una excepción no medible) queda fuera del listado
hasta revisión humana — el peor resultado posible es «no dice nada»,
nunca «dice algo falso». Coste medido por regla nueva: `docs/18-escalar.md` §3.

## «¿Esto no lo hace ya la administración?»

La administración publica textos; no evalúa tu perfil contra el requisito
concreto con «lo que falta». Aquí el resultado es accionable: cumples X,
te falta Y (con documento y plazo). Y es ciudadano-verificable: cualquiera
puede re-descargar la fuente y comprobar la huella. `/como-verificamos/`.

## «¿Y la privacidad?»

El perfil nunca sale del navegador: el test e2e bloqueante verifica 0
peticiones externas, 0 cookies y solo `rr_*` en almacenamiento local
(`tests/e2e/fiabilidad.spec.ts`, verde en la matriz de navegadores).

## «¿Por qué 50 programas y no 500?»

Porque no vendemos cobertura que no podemos sostener: cada programa lleva
verificación independiente + revisión humana. El universo completo (401
programas) está en nivel 2 — enlazado con fuente pero sin evaluar — y el
Observatorio publica exactamente qué cubre cada nivel.
