# Handoff de revisión — Claude — 2026-10-05 (2.ª revisión)

**Leer antes de tocar nada.** Revisión de los commits `7f22805`, `29c82d8` y `1bb07ae`.

## Bien hecho
- Universo de 662 programas con descartes motivados; nivel 2 con 327 fichas; `CLOSED_RECURRING` con `previousCalls`; explorador, Observatorio, plan con .ics, simulador oficial primero. 193 tests, build y e2e en verde.

## Lo que NO se hizo y era prioritario
- **F4-ART (dirección de arte, ADR-043) sigue en TODO.** El sitio usa todavía Inter/Source Sans y los tokens heredados de la-ayuda; las capturas v3 no se parecen al prototipo aprobado por Daniel. Es la **segunda tarea** de esta sesión (tras los arreglos de datos). Fuente de verdad: `design/prototipo/requisito-a-requisito.html` + `docs/16-direccion-de-arte.md`.

## Defectos encontrados (tareas R2-* en TASK_QUEUE)
1. **R2-BDNS (datos públicos erróneos):** paginación con parámetros que la API ignora (misma página ~41 veces; «2.050 registros» es un artefacto) y **enlaces BDNS con el id interno** en vez de `numeroConvocatoria`. Parámetros que funcionan (comprobados por Claude): `page`, `pageSize`, `order`, `direccion`, `vpd=GE`, `regiones=25`, `tiposBeneficiario=1`, `fechaDesde=01/01/2026`, `fechaHasta=<hoy dd/mm/aaaa>` ⇒ `totalElements` 118.
2. **R2-REPRO:** el generador del universo está en `F:\Temp` (purgable). Va al repo con tests.
3. **R2-EJ:** ejemplos incompletos (0 probables, piden año de nacimiento e ingresos).
4. **R2-MAT:** matriz ilegible (una columna por requisito). Columnas por dimensión del perfil, como en el prototipo.
5. **R2-I18N:** «2 2 ayudas más».

## Proceso
- Lee el prompt entero y `TASK_QUEUE.md`: el orden está en la cabecera de la cola.
- No marques HECHO sin la puerta de la tarea. Para F4-ART: capturas lado a lado con el prototipo en `evidence/<fecha>-F4/capturas-art/` + revisión independiente.
