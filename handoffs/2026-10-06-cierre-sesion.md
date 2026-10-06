# Cierre de sesión — 2026-10-06

## Estado al cerrar (commit b2a8f38, main limpio)

**39 reglas en producción** (`eligibility:build` → 39 incluidas, 0 excluidas ·
257 tests verdes · deploy en curso en Pages al cerrar).

| Por administración | Reglas |
|---|---|
| Estado | ~18 |
| Comunidad de Madrid | ~17 |
| Ayuntamiento de Madrid | 4 (ola 7) |

Por estado de revisión: las 39 llevan `verification: ok` (verificador
independiente + informe en evidence/) y `humanReview: pending`. Ninguna tiene
`approved` aún.

## Qué quedó a medias

- **R6-PANEL**: maquinaria completa y con tests (`scripts/review-panel/`,
  `prompts/panel-v1.md`, agregación determinista, caché por huella). **Sin
  llamadas reales: falta `NAN_API_KEY` en el entorno.** Sin la clave no hay
  R6-CALIB ni R6-RUN. La clave nunca se escribe en repo/CI/evidencias.
- **F8 piloto**: kit listo en `evidence/2026-10-06-F8/kit/`; faltan las sesiones
  con personas (Daniel) y `piloto.json`.
- **F7 memoria**: borrador en `submission/memoria.md` + `veracidad.json` (15
  claims con evidencia). Falta la revisión de Daniel, la categoría definitiva
  confirmable si la sede aclara persona física en Impact, y PDF final.
- **F9**: workflow diario en `.github/workflows/freshness.yml` desplegado;
  pendiente observar 2 días verdes en GitHub Actions.
- **Firefox e2e**: no arranca en este equipo (juggler/GFX). El proyecto sigue
  activo en `playwright.config.ts`; 9/10 proyectos verdes, documentado en
  `evidence/2026-10-06-F5/qa-report.md`.

## Verificaciones hechas

- Ola 5 (PNC, subsidio, asignación, viudedad, alquiler estatal): verificada, 3 KO
  corregidos antes del merge.
- Ola 6 (jubilación, orfandad, incapacidad, cese autónomos): verificada, 5 OK
  con observaciones menores. RAI retirada tras verificación (R5-RAI).
- Ola 7 municipal: 4 OK + 2 NO ENTRA probados con fuentes (cheque-servicio
  derogado; ReViVa/EMVS sin fuente rango ≤2).
- QA transversal: 45/45 e2e en 9 proyectos; axe 0 serious/critical tras corregir
  el contraste oscuro del CTA; link-check 114 URL, 0 fallidas.

## Lo que el próximo agente necesita saber

1. `NAN_API_KEY` solo en env local de Daniel; sin ella R6 queda BLOQUEADO y se
   sigue con ola 8 / F7.
2. El muestreo humano de Daniel sigue abierto (`lote-1.md`, `muestreo-ola-*.md`);
   ADR-047 lo reduce a escalado + 5 al azar tras calibración.
3. Si una fuente se marca `stale` en `data/eligibility/freshness-stale.json`, la
   regla sale del bundle sola (fail-closed) — no reescribirla a mano sin
   re-verificación.
4. Worktrees de olas integradas: limpiar solo con las comprobaciones de
   `F:\_Proyectos\AGENTS.md §7` (status limpio, sin commits sin integrar).
