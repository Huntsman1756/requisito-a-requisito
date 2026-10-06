# F5 — Informe QA transversal (2026-10-06)

## Matriz proyecto × suite

| Proyecto | comprobar.spec | smoke | a11y (axe) | Estado |
|---|---|---|---|---|
| desktop-chromium | 4/4 | 1/1 | 5/5 | OK |
| desktop-webkit | 4/4 | 1/1 | 5/5 | OK |
| mobile-android | 4/4 | 1/1 | 5/5 | OK |
| mobile-ios | 4/4 | 1/1 | 5/5 | OK |
| tablet-ios | 4/4 | 1/1 | 5/5 | OK |
| small-reflow | 4/4 | 1/1 | 5/5 | OK |
| dark | 4/4 | 1/1 | 5/5 | OK tras fix de contraste |
| forced-colors | 4/4 | 1/1 | 5/5 | OK |
| reduced-motion | 4/4 | 1/1 | 5/5 | OK |
| desktop-firefox | — | — | — | entorno |

**Firefox**: el ejecutable headless falla al arrancar en este equipo
(`RenderCompositorSWGL failed mapping default framebuffer`, errores
`nsIWinTaskbar`/`juggler`). El fallo es de lanzamiento del navegador, no del
producto; pendiente re-ejecución en CI u otro equipo (el proyecto
`desktop-firefox` sigue activo en playwright.config).

## Defectos reales encontrados y corregidos

1. **`residenceSince` nunca se preguntaba** — `usedFields` solo incluía el campo
   directo (`residenceSince`), pero las reglas consultan el derivado
   (`residenceMonths`), así que la pregunta quedaba filtrada y todas las reglas
   con residencia tenían un `U` evitable. Corregido en `CheckFlow` (unión con
   `q.derives`). Hallazgo del e2e.
2. **Contraste oscuro del CTA primario** — axe `color-contrast` serious en la
   home en `dark`: `.btn.primary` (blanco sobre `#8EA0FF` = 2,43:1). La
   corrección previa solo cubría `.btn-primary`. Ahora ambas variantes y
   `.cta .cta` toman texto oscuro sobre el sello. axe 0 serious/critical.
3. Flujo e2e actualizado a las 12 preguntas del catálogo (territorio,
   empadronamiento, edad, a-cargo, familia, empleo, estudios, ingresos,
   discapacidad, vivienda; birthYear y dependencia quedan ocultas por `showIf`
   — verificado).

## link-check
`npx tsx scripts/link-check.ts` → **114 URL del bundle, 0 fallidas**.

## Suites unitarias
`npm run test` → 243 tests, 0 fallos. `npm run check`/`lint`/`build` → OK.

## Pendiente para Daniel (F5-10, manual)
- checklist `templates/manual-device-checklist.md` en Edge/Chrome Windows,
  Android Chrome, iPhone Safari, NVDA y VoiceOver.
- 2 días verdes del job F9 en GitHub Actions.
