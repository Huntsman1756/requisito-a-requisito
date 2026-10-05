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
| F0-5b | Rehacer el inventario con **ámbito Comunidad de Madrid** (ADR-021): autonómicas y municipales de la CM más estatales que puede pedir un residente; familia, educación/becas, juventud, vivienda, empleo, discapacidad/dependencia; sin `tax_deduction` | `evidence/<fecha>-F0/vertical/candidatas-madrid.json`; si < 8, opciones a Daniel |
| F0-7 | **Andamiaje del proyecto en este repo** (ADR-022): `package.json` con el subconjunto de dependencias de la-ayuda y **sus mismas versiones**, `tsconfig.json`, `biome.json`, `vitest.config.ts`, `playwright.config.ts` (10 proyectos de docs/10 §2), `next.config.ts` (`output: export`), `scripts/serve-export.mjs`, `src/app/globals.css` + `public/fonts/` + `DESIGN.md` portados (docs/13 §3), página de entrada vacía con layout accesible (skip link, landmarks), scripts npm (`check`, `lint`, `test`, `build`, `preview`, `validate:full`). `.gitignore` con `node_modules/`, `.next/`, `out/` | `npm ci && npm run check && npm run lint && npm test && npm run build` en verde; `out/index.html` servido con `npm run preview` |
| F0-8 | **Portar el commit `6595a533`** (Zod de los 7 esquemas + tests) del worktree de la-ayuda a `src/lib/eligibility-engine/schema.ts`, con un encabezado de origen | Tests en verde aquí. El worktree **no se borra** |
| F0-9 | **Importar el catálogo** (docs/13 §2): `scripts/import-donor-catalog.ts --donor F:\_Proyectos\la-ayuda --commit <sha de main>`; Madrid + estatales, `active && revisada`, sin `tax_deduction`; pistas BOCM aparte | `data/catalog/` + `provenance.json`; test de determinismo; recuentos en el recibo (esperado ≈ 54 Madrid + ≈ 191 estatales) |
| D-1 | ~~Vehículo~~ — **cerrado por ADR-022** (proyecto nuevo) | — |

## Verificación (comandos)

```powershell
cd F:\_Proyectos\datawardsmadrid
git status --short
npm ci
npm run check; npm run lint; npm test; npm run build
npm run preview   # y abrir / en el navegador o con Playwright
npm run catalog:import -- --donor F:\_Proyectos\la-ayuda --commit <sha>
git -C F:\_Proyectos\la-ayuda status --short   # debe seguir IGUAL que antes: el donante no se toca
Get-FileHash -Algorithm SHA256 evidence\<fecha>-F0\fuentes\*.pdf
```

## Puerta de salida
- [ ] Los datos de `docs/00` tienen cita con artículo y página; el formato de la memoria está anotado.
- [ ] La consulta está enviada (o hay una fecha de decisión por defecto fijada con Daniel).
- [ ] `inventario.json` existe; ninguna cifra sin fuente.
- [ ] `baseline.json` existe; los rojos preexistentes están identificados.
- [ ] `candidatas-madrid.json` (F0-5b) tiene ≥ 8 ayudas de Madrid o estatales (si hay menos: escalar a Daniel **hoy**).
- [ ] Andamiaje en verde (F0-7), Zod portado (F0-8) y catálogo importado con procedencia (F0-9).
- [ ] Los repos donantes no tienen cambios nuevos atribuibles a este trabajo.
- [ ] Recibo `evidence/<fecha>-F0/receipt.json` y handoff escritos.

## Riesgos
- Menos de 8 ayudas de Madrid aptas para reglas ⇒ usar pistas del BOCM (borradores
  del donante) descargando la fuente oficial directamente, o ampliar a estatales.
- edubecas.es sin analítica ⇒ la memoria usa métricas de producto (cobertura,
  fuentes, verificación), no de uso.
