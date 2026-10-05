<!-- Origen: la-ayuda@63ad635b:DESIGN.md, MIT (proyecto propio de Daniel). Reescrito en F4-ART (ADR-043): la estética anterior se sustituye; se conserva solo la estructura técnica de tokens. -->

# DESIGN.md — Requisito a Requisito

Fuente de verdad visual: `design/prototipo/requisito-a-requisito.html`
(prototipo aprobado por Daniel) y `docs/16-direccion-de-arte.md`.

## Concepto

**«El expediente que se comprueba solo».** Estética de formulario oficial
español: casillas numeradas, citas en mono («Art. 3.1.b», `BOE-B-2026-21271`),
etiquetas de administración competente y el **sello de verificación** como único
gesto audaz (ligero giro, doble borde). Todo lo demás, sobrio.

## Tokens (`src/app/globals.css`)

- Papel/estructura: `--paper` `#EEF2F5` · `--sheet` `#FFF` · `--ink`/`--ink-2`
  `#14202F`/`#4A5668` · `--rule` `#CDD5DE` · `--tint` `#E3E9F4`.
- **Acento único** `--seal` `#2337A0` (tinta de sello: CTA, foco, enlaces).
- Semánticos: `--ok` `#1D7448` · `--doubt` `#9A6200` · `--no` `#A93A2C` ·
  `--na` `#56627A` (+ `-soft` por color).
- Nivel de administración: `--lvl-estado` `#2337A0` · `--lvl-cm` `#7A2E5E` ·
  `--lvl-ayto` `#16685F`.
- Modo oscuro por tokens (ver :root[data-theme]).

## Tipografía (autoalojada, OFL, `public/fonts/`)

- **Atkinson Hyperlegible Next** (400/500/700/800): cuerpo y titulares 800 con
  tracking negativo. Diseñada para baja visión: la legibilidad es identidad.
- **IBM Plex Sans Condensed** 500–600: etiquetas, sellos, niveles de
  administración (mayúsculas espaciadas).
- **IBM Plex Mono** 400–600: localizadores, referencias de boletín, fechas,
  contadores.
- Sin Google Fonts (privacidad). `font-display: swap`.

## Componentes

- `Brand` (logo SVG: dos casillas marcadas) + favicon de casilla.
- `Seal` — «Comprobado con la fuente · <fuente> · <fecha>» girado −7°.
- `Tick` — 5 estados: `ok` ✓ · `doubt` ?/↻ · `no` ✕ · `na` –/⚠.
- `.lvl` — etiqueta de administración (estado/cm/ayto), borde en su color.
- Eventos vitales: **lista de dos columnas con filete**, icono en círculo
  `.ev-i`, recuento `.ev-c` en mono a la derecha. Nada de rejilla.
- Ejemplos: chips pill.
- Proceso: `ol.steps` con regla superior y «Paso N» real.
- Pantalla de pregunta `.screen`: barra `.progress`, `legend` 800, `details.why`,
  `.field`/`.input`, `.alt` (No lo sé / Prefiero no decirlo), `.nav-q`.
- `RequirementMatrix` — `<table>` real, **columnas por dimensión del perfil**
  (empadronamiento, edad, hijos, ingresos, situación familiar, empleo, otros,
  plazo, resultado — máx. 7+2), casilla `.tick` por celda agregando el peor
  estado; pulsar abre el panel de cita. En móvil, scroll horizontal propio.
- Ficha/expediente `.dossier`: regla superior gruesa, casillas numeradas,
  `dl` de datos clave, pie con fecha de verificación + acción principal.
- `Plan` (`.action-plan`): importe total grande (solo importes citados),
  documentos agrupados, plazos, descarga `.ics`, imprimir.
- Observatorio: `.obs` (estadísticos con regla) + `.log` (registro diario).
- Banner piloto `.pilot-banner` bajo la cabecera; banner de ejemplo
  `.example-banner` en ámbar.

## Anti-patrones

Rejillas de tarjetas iguales · tarjetas dentro de tarjetas · emojis como
iconos · degradados · crema+terracota · fotos de stock · ilustraciones
genéricas · iconos coloreados por sección · todo centrado · sombras en todo ·
rojo/logotipos de la Comunidad de Madrid · «IA»/«inteligente» en los textos.

## Accesibilidad

- WCAG 2.2 AA: landmarks, skip-link, foco visible, `prefers-reduced-motion`,
  tamaños ≥44 px, `aria-live` para recálculos y el panel de cita.
- Ningún estado se comunica solo por color: siempre marca + texto.
- Contraste: tokens calibrados ≥ 4.5:1 en texto, ≥ 3:1 en bordes de estado.

## Imágenes

Las imágenes son **documentos reales**: miniatura de la primera página del
documento oficial citado (snapshot → WebP, `pdfjs-dist` en build) en la ficha.
Nunca fotos de stock, ilustraciones ni imágenes generadas.
