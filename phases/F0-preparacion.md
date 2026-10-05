# F0 — Preparación y decisiones

**Fechas:** 05–06/10 · **Depende de:** nada · **Responsable:** agente + Daniel (D-1, D-2)

## Objetivo
Dejar verificados los hechos de la convocatoria, la línea base técnica, el
inventario de impacto real y la lista de ayudas candidatas, para que el resto de
fases no trabaje sobre supuestos.

## Tareas

| ID | Tarea | Salida |
|---|---|---|
| F0-1 | Descargar la Orden 566/2026 y el extracto del BOCM; calcular sha256; verificar plazo, art. 8, criterios y pesos, «una candidatura por persona», **formato y extensión de la memoria** y órgano/vía de consulta | `evidence/<fecha>-F0/fuentes/` + citas (art./pág.) completadas en `docs/00-contexto-convocatoria.md` y órgano en `docs/06-…` |
| F0-2 | Daniel envía la consulta de elegibilidad | Fecha de envío anotada en `DECISIONS.md` (ADR-005) |
| F0-3 | Inventario de impacto real (**solo lectura**): telemetría de la-ayuda, analytics/logs de edubecas.es, GitHub (stars, forks, issues externos, clones si hay acceso), datasets publicados y menciones | `evidence/<fecha>-F0/impacto/inventario.json`: cada cifra con `value`, `source`, `command_or_url` y `measuredAt`; si no hay dato, `null` + motivo |
| F0-4 | Crear el worktree de la-ayuda (AGENTS.md §3), `npm ci`, línea base `npm run check`, `npm test`, `npm run build` y `npm run test:a11y` | `evidence/<fecha>-F0/baseline.json` (exit codes y recuentos). Si la base ya falla: documentarlo como rojo preexistente |
| F0-5 | Inventario de ayudas candidatas al vertical familias/educación: `type ∈ {child_support, education_support, scholarship}` o `category ∈ {familia, educacion, beca}`; cruzar con autoridad vigente; excluir `tax_deduction` y las fichas de la auditoría del 27/09; anotar el estado del plazo | `evidence/<fecha>-F0/vertical/candidatas.json` ordenado por plazo abierto/próximo |
| F0-6 | Instalar los navegadores de Playwright en la caché de F: (docs/10 §1) | Versiones anotadas en baseline.json |
| D-1 | **Daniel**: vehículo (la-ayuda sola o ecosistema La Ayuda + EduBecas), a la vista de F0-3 | ADR-006 aceptado |

## Verificación (comandos)

```powershell
# Worktree
git -C F:\_Proyectos\la-ayuda worktree list
cd F:\AgentState\worktrees\la-ayuda\premio-gtl
git status --short            # debe estar limpio
npm ci
npm run check; npm test; npm run build; npm run test:a11y
npm run pipeline:authority -- --strict   # se espera exit 1 por deuda legacy: anotar los números, no corregir
# Hashes
Get-FileHash -Algorithm SHA256 evidence\<fecha>-F0\fuentes\*.pdf
```

## Puerta de salida
- [ ] Los datos de `docs/00` tienen cita con artículo y página; el formato de la memoria está anotado.
- [ ] La consulta está enviada (o hay una fecha de decisión por defecto fijada con Daniel).
- [ ] `inventario.json` existe; ninguna cifra sin fuente.
- [ ] `baseline.json` existe; los rojos preexistentes están identificados.
- [ ] `candidatas.json` tiene ≥ 8 ayudas con autoridad vigente (si hay menos: escalar a Daniel **hoy**).
- [ ] Recibo `evidence/<fecha>-F0/receipt.json` y handoff escritos.

## Riesgos
- Menos de 8 ayudas con autoridad en el vertical ⇒ opciones para Daniel: ampliar
  el vertical (por ejemplo, vivienda joven) o regularizar fichas por el circuito
  editorial de la-ayuda (más lento).
- edubecas.es sin analítica ⇒ la memoria usa métricas de producto (cobertura,
  fuentes, verificación), no de uso.
