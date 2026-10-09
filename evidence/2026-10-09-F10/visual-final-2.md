# Pasada visual 2 — F10-VIS-2 (09/10, tarde)

Segunda pasada de la matriz visual en hora distinta a la primera (que fue
por la mañana), con los checks de estilo calculado nuevos de la 1.2
(mono fuera de sitio, UA por defecto en dl/ul/details/table/blockquote,
escala de títulos, paleta de tokens, página vacía, 404 con cuerpo).

## Resultado

| Alcance | Resultado |
|---|---|
| Local `out/` (serve-export, puerto 4399) — desktop-chromium | **136/136 verde** |
| Local `out/` — mobile-iphonese | **136/136 verde** |
| Ambas pasadas tras el fix de fuentes (`a81f1f0`) | **272/272 verde** |
| Pages (`/requisito-a-requisito`, 47f4cb4) — desktop-chromium | **136/136 verde** |
| Espejo (`requisito.h1756.es`) — desktop-chromium | 128/136 en la primera pasada, durante la ventana del pull atómico (CSS viejo + HTML nuevo). Verificación puntual tras el swap: fichas y listas con estilo correcto. Pendiente pasada completa sobre `a81f1f0` |
| Vitest (incluye results-order sobre bundle real) | **567/567, 46 ficheros** |
| Funcional + completeness desktop-chromium | 8/8 |
| CI del push: «Deploy a GitHub Pages» | build+deploy verdes (37949217233 y ss.) |
| CI manual «e2e-browsers» (chromium+firefox+webkit) | **verde en 8990210** (37951847211); primer run rojo por el enlace duplicado (corregido) |

## El hallazgo grande de la sesión

**El sitio nunca cargó sus fuentes en producción.** `layout.tsx` generaba
`src:url("/fonts/"ahn-r.woff2"")` — comillas corruptas por el `split(",")`
de `FONTS_CSS`. Las 10 caras de `document.fonts` estaban vacías: todo el
sitio se pintó siempre con la fuente del sistema. Ningún check lo veía:
los preloads respondían 200 y el fallback tipográfico es parecido a
Atkinson a tamaños pequeños. Corregido en `a81f1f0` con guarda permanente
en el audit (`fuente-sin-cargar`, severidad alta).

## Defectos reales encontrados y corregidos en esta pasada

Severidad según el audit (alta > media > baja).

**Alta**
- Solape «Tu plan de acción» × «Podrías pedir hasta…» (2 px) en todas las
  anchuras de las páginas de resultados → `.plan-total` con más aire.
- Página 404 servida vacía por `serve-export` (Pages sí sirve 404.html) →
  el servidor local ahora devuelve el mismo 404.html con status 404 y hay
  guarda «página vacía» en el audit.
- `/ayudas/` con `dl/dt/dd` del navegador, metadatos en monoespaciada y
  h3 a tamaño de título (corregido en la primera parte de la sesión).

**Media**
- `a.cta`/`button.cta` sueltos («Empezar», «Siguiente», «Ir a la sede
  oficial») con el color de texto del navegador (negro) en vez del diseño.
- Paleta mal resuelta por el detector en emulación móvil (falso positivo):
  `var(--x)` en elemento fantasma → lectura directa de `:root`.
- `shot()` con `fullPage` reventaba en resultados muy largas (> 32767 px
  en Chromium) → fallback a viewport.
- Audit medía solapes durante el intercambio de fuentes (font-swap) →
  espera `document.fonts.ready`.
- `.aid-meta` en dos columnas a 320 px dejaba valores en ~100 px → una
  columna bajo 560 px.
- **Fuentes del diseño nunca cargadas** (ver sección dedicada): comillas
  corruptas en el `src:url(...)` del `@font-face` inline.
- Enlace a ficha duplicado en las tarjetas `no_cumple` compactas → strict
  mode roto en fiabilidad.spec en los 3 navegadores del CI.
- Observatorio mostraba el token `CLOSED` en inglés → «Cerrado».
- `pension-viudedad` rompía el export por una fuente sin título →
  fallback al dominio.
- «between» aparecía en inglés en el texto de requisitos → traducido.

**Baja / detectado por la revisión humana (§1.3)**
- `<legend>` de la pregunta flotando sobre el borde del fieldset a 1366 px
  → integrado dentro de la tarjeta.
- Bullets vacíos en «Fuentes oficiales» (2 fuentes de `pension-viudedad`
  sin `title`) → fallback; contado para Daniel.

## Resultados agrupados (F10-RES), incluidos en esta pasada

La página de resultados muestra ahora grupos con rótulo: **Encaja**,
**Podrían encajar — falta confirmar algún dato**, **«No se pueden
descartar (N)»** plegado y **«No tenemos datos suficientes»**. Las
tarjetas plegadas llevan enlace a ficha («Ver ficha completa»). Capturas
de la revisión humana en `visual-rev/` y del agrupado en
`F:/Temp/…/res-grouped-*.png` (copiadas a la evidencia).

## Pendiente de esta fila

- Pasada completa sobre el espejo cuando el VPS sirva `a81f1f0` (el
  artefacto de `8990210` está en curso; el de `a81f1f0` lo seguirá).
- Lighthouse en el espejo para / , /comprobar/ , una ficha y /explorar/
  (ya medido en local comprimido: 100 / 92 / 100 / 97).
