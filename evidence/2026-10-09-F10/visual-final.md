# Estabilización visual — resultado final (09/10)

Herramienta: `tests/e2e/visual-layout.spec.ts` + `scripts/visual-report.ts`.
Cada test audita la página en 9 anchos (320–1920) × tema claro/oscuro con:
scroll-x, solapes entre hojas de texto (por fragmento de línea, no por caja),
columnas <12 ch, palabras fuera de caja, texto cortado, objetivos táctiles
(<24 alta / <44 media, con la excepción WCAG inline-in-text y de radios en
label), slugs visibles, recursos 404, errores de consola y axe color-contrast.
Además: zoom 200 % en portada+ficha+explorar, zoom 400 % con reflow a 320 px,
intro/paso-dependientes/resultados del flujo, y un test funcional del menú
móvil.

## Resultado

| Matriz | Tests | Hallazgos alta/media |
|---|---|---|
| desktop-chromium (local, export) | 136/136 ✓ | 0 |
| small-reflow 320 px | 136/136 ✓ | 0 |
| mobile-android (Pixel 7 emulado) | 136/136 ✓ | 0 |
| Firefox/WebKit/móviles/tablet | CI e2e-browsers (run 37921466756) | pendiente lectura |
| Espejo https://requisito.h1756.es | smoke + axe + flujo: 16/16 ✓ | pendiente pasada final |

Evolución: informe inicial → 62 patrones; tras el lote de correcciones →
23; iteración final → **0 hallazgos de severidad alta/media**.

## Causas raíz corregidas (commits del 09/10)

1. `.req` grid `1.6rem` aplastaba texto de requisito → columna flexible.
2. Nav de escritorio dentro de `<details>` cerrado (ancho 0, sangrado sobre
   el banner) → navs separadas escritorio/móvil.
3. Hijos de `<details>` cerrado tienen layout en Chromium →
   `display:none` explícito (eran el scroll-x a 320 px en tarjetas).
4. Enlaces multilínea del banner/ficha solapaban → `inline-block`.
5. `/ayudas/` listaba slugs (mapa local de 6) → `aidTitle()` completo.
6. `humanizeSlugs()` en presentación; slugs internos no se muestran.
7. Textos de regla: moneda es-ES (`5.639,16 €`), plurales, nombres de
   municipio/CCAA y parámetros humanos.
8. `Link` a `.json` prefetchaba `.txt?_rsc` → `<a>` a secas; `icon.svg`.
9. `.cta`/`question__why`/`Menú` de 21 px o invisibles → 44–48 px.
10. Grids sin plantilla (`results-list`, `aid-list`, `explorer-list`,
    `.promises`) → `minmax(0,1fr)`; `.explorer-meta` ya no es nowrap.
11. Zoom 200–400 %: `min()` en paddings/gaps, `min-width:0` + `anywhere`
    en ítems flex/grid, `.box`/`.events`/footer apilados, `.seal` estático,
    filtros de explorar con `max-width:100%`.
12. `.log li` de 2 hijos caía en columna de 7 rem → 3 columnas solo ≥861 px.
13. h1+h2 pegados (`como-funciona`) → `h1 + h2 { margin-top: 1.4rem }`.
14. **Nav móvil inaccesible** (summary con `display:none`) → visible + test
    funcional nuevo.
15. Falsos positivos del audit: rects por línea en anchors, exclusión de
    `details` cerrados y `.sr-only`, scroll a 0 con `behavior:instant`
    antes de medir (cabecera sticky), 404 del documento principal.

## FASE 3 (volumen de resultados)

`scripts/resultados-volumen.ts` + informe `resultados-volumen.md`:
ningún perfil típico ve ≤ 3 útiles; la sección nivel 2 «También podrían
interesarte» ya existía (cap 10 + «ver más», marcada sin comprobar).

## Pendiente documentado

- Slug dentro del texto de una regla (`madrid-abono-transporte-65`) — se
  presenta humanizado; el dato es de Daniel → `visual-para-daniel.md`.
- Aviso Telegram del updater VPS tras 3 fallos (sin canal sin secretos).
- Segunda pasada al espejo + run CI e2e-browsers → cerrar filas de
  TASK_QUEUE cuando estén verdes.
