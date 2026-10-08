# Handoff — F10 (sesión de fiabilidad) — 2026-10-08

**HEAD:** `<ver con git log>` en `main` de datawardsmadrid ·
**Evidencia:** `evidence/2026-10-08-F10/fiabilidad.md` (veredicto: **fiable**),
`fiabilidad-audit.json`, `verificacion-ola-11.md`, `muestreo-ola-11.md`

## Hecho en esta sesión

- Auditoría de fiabilidad completa (7 puntos, todo medido) → `fiabilidad.md` —
  comandos: `npx tsx scripts/fiabilidad-audit.ts`, `eligibility-goldens.ts
  --bundle`, `eligibility:exhaustive`, `link:check`, spec e2e `fiabilidad`.
- **BLOQUEANTE corregido:** `/comprobar/` en producción no cargaba el bundle
  (`process.env.BASE_PATH` no se inyecta en cliente). Fix `4dcaac4`
  (`NEXT_PUBLIC_BASE_PATH` en next.config + check-data + 2 `<a>`→`Link`).
  Verificado en producción tras el deploy: flujo completo, citas y privacidad
  en verde.
- F10-FRONT-1 `a26c8db`: la tarjeta «no parece aplicarte» muestra cada
  requisito F con su cita literal + enlace a la fuente + enlace a la ficha.
- F10-REG-1..7 `28cef77`: 5 reglas re-autoradas y verificadas (ola 11),
  `ayto-escuela-infantil/residir-madrid` de hard a soft (único falso negativo
  real); REG-2 y REG-4 confirmados correctos con tests de frontera.
- Estimación de reapertura CLOSED_RECURRING nunca en pasado `d38463c`.
- F10-INF-2 `3df9a02`: URL de pensiones CM actualizada + re-snapshot.
- F10-REV-3: duplicada `evidence/2026-10-06-F9/muestreo-ola-9.md` retirada.
- F10-REV-1: `npm run review:apply -- <hoja.md>` implementado
  (`scripts/review-apply.ts`) con 8 tests; cabeceras de todas las hojas
  `muestreo-ola-*.md` con instrucciones de 3 líneas para Daniel.
- `--strict` ya no acepta `panelReview.approved` (ADR-050).
- Ensayo release estricta en `F:\Temp\…\release-copy`: real = **0/50**;
  simulada = 52 incluidas, web+e2e+axe verdes.
- Goldens ahora corren dentro de `npm test`
  (`tests/eligibility/fiabilidad-regresion.test.ts`) y hay regresiones de
  plazos, asimetría y parámetros.

## Estado de la puerta de la fase

- [x] Fiabilidad auditada y corregida (veredicto «fiable»)
- [ ] Muestreo de Daniel (F10-MUESTREO) — **sigue en 0**
- [ ] Release estricta (F10-REL-2) — sigue prohibida antes del 14/10
- [ ] Piloto (F8) — pospuesto por Daniel hasta después de la fiabilidad;
  su fecha límite se mantiene 13/10

## Pendiente y siguiente paso exacto

1. **F10-MUESTREO (Daniel):** marcar `☑ OK`/`☐ KO` en `muestreo-ola-1..10.md`,
   `lote-1.md` y `muestreo-ola-11.md` (las instrucciones ya están en cada
   cabecera). Sin esto, la release del jurado queda vacía — medido hoy.
2. **F10-REV-2 (agente):** por cada hoja marcada,
   `npm run review:apply -- evidence/<dir>/muestreo-ola-N.md` y un commit por
   ola. Es idempotente y rechaza marcas sobre reglas ajenas a la ola.
3. `npm run freshness:local` el 09/10 (la tarea diaria se saltó el 08/10 por
   árbol sucio de esta sesión — el script ahora distingue ficheros sin
   seguimiento, pero el árbol tiene cambios reales commiteados ya).
4. F10-IMP-1/2 (kit del piloto) una vez cerrada la fiabilidad.

## Bloqueos (quién decide)

- `BLOQUEADO: humanReview.approved de las 52 reglas — Daniel` (única vía:
  hojas marcadas + review:apply; ningún agente puede aprobar).
- Sin bloqueos técnicos. Deploy y rama main están sincronizados y verdes.

## Cosas que el siguiente agente debe saber

- **Las e2e contra producción necesitan el basePath**: usa
  `E2E_BASE_URL=https://huntsman1756.github.io/requisito-a-requisito` + las
  rutas de `fiabilidad.spec.ts` (los specs antiguos navegan a `/` y miden la
  raíz de github.io — falsos negativos; pendiente portarlos).
- En bash de Windows, exporta `MSYS_NO_PATHCONV=1` si pasas `BASE_PATH=/…`.
- `deadlineState` puede devolver `nextOpeningEstimate: undefined` aunque la
  ventana sea anual recurrente — es intencionado (nunca una fecha ya pasada).
- `review-apply` define la ola por `verificacion-ola-N.md` del MISMO directorio
  que la hoja; los slugs son los tokens `en-código` que existen en rules/.
- El nivel 2 quedó en 401 fichas (dedupe por URL oficial en la generación de
  hoy); el recuento de TASK_QUEUE y la memoria deben usar 401.
- Pendiente de decisión, no olvidar: la fiabilidad no cubre el contenido
  editorial de fichas nivel 2 sin marcador de cierre en la sede (ver §«Lo que
  no pude verificar» en fiabilidad.md).

## Clasificación de desviaciones

D0 ninguna · D1 cosmética · D2 cambio de alcance aprobado · D3 cambio de contrato/riesgo (requiere ADR)

D1: el orden del calendario F10 cambió por decisión explícita de Daniel
(fiabilidad antes que piloto) — registrado en TASK_QUEUE y en el calendario.
