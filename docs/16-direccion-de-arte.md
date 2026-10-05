# Dirección de arte — Requisito a Requisito (ADR-043)

**Sustituye** a la decisión de portar el aspecto visual de la-ayuda (docs/13 §3,
filas de `globals.css`, `DESIGN.md` y fuentes). Motivo: Daniel lo ve genérico, con
rejillas de rectángulos, sin iconos ni imágenes y con colores planos, «muy de IA».
Lo que **sí** se conserva de la-ayuda: la estructura técnica (tokens CSS, modo
oscuro por tokens, `prefers-reduced-motion`, foco visible), no su estética.

**Referencia visual obligatoria:** `design/prototipo/requisito-a-requisito.html`
(abrir en el navegador; también publicado como artifact privado de Daniel). Es la
**fuente de verdad visual**: el agente lo reproduce en componentes React con los
mismos tokens y la misma jerarquía. Los datos del prototipo son de ejemplo y se
sustituyen por el bundle real; **ninguna cifra del prototipo puede llegar a
producción**.

## 1. Concepto

**«El expediente que se comprueba solo».** El mundo visual sale de los formularios
y expedientes oficiales españoles: **casillas numeradas**, artículos citados
(«Art. 3.1.b»), referencias de boletín (`BOE-B-2026-21271`) y el **sello de
registro**. Cada requisito es una casilla que se marca (✓ cumples, ? falta un
dato, ✕ no cumples, – / ⚠ no aplica o no comprobable, ↻ se convoca cada año) y
cada marca lleva su cita. El único gesto audaz es el **sello «Comprobado con la
fuente»**, ligeramente girado; todo lo demás es sobrio.

## 2. Tokens (copiar del `:root` del prototipo a `src/app/globals.css`)

| Token | Claro | Uso |
|---|---|---|
| `--paper` | `#EEF2F5` | Fondo: papel de formulario frío |
| `--sheet` | `#FFFFFF` | Hojas: expediente, matriz, pantalla de pregunta |
| `--ink` / `--ink-2` | `#14202F` / `#4A5668` | Texto |
| `--rule` / `--tint` | `#CDD5DE` / `#E3E9F4` | Líneas de casilla / fondo activo |
| `--seal` (+ `--seal-soft`) | `#2337A0` | **Único acento**: tinta de sello, CTA, foco, enlaces |
| `--ok` `--doubt` `--no` `--na` (+ `-soft`) | verde, ámbar, ladrillo, pizarra | **Semánticos**, no decorativos |
| `--lvl-estado` `--lvl-cm` `--lvl-ayto` | azul, ciruela, verde azulado | **Administración competente** (etiquetas `lvl`), para que el ciudadano vea a la primera quién gestiona cada ayuda |

Modo oscuro: los valores del bloque oscuro del prototipo. **Prohibido** usar el
rojo corporativo de la Comunidad de Madrid ni sus logotipos (no suplantar).

## 3. Tipografía

- **Atkinson Hyperlegible Next** (Braille Institute, diseñada para baja visión)
  para titulares y cuerpo. La legibilidad es parte de la identidad y del
  argumento de accesibilidad. Titulares en 800 con tracking negativo ligero.
- **IBM Plex Sans Condensed** 600 en mayúsculas espaciadas para etiquetas, sellos y
  niveles de administración.
- **IBM Plex Mono** para localizadores (`Art. 3.1.b`), referencias de boletín,
  códigos INE, fechas de verificación y contadores.
- Fuentes **auto-alojadas** en `public/fonts/` (licencia OFL, descargar los ficheros
  oficiales) con `font-display: swap` y fallback `system-ui`. Sin Google Fonts en
  producción (privacidad).

## 4. Iconos e imágenes

- **Iconos de línea propios** (SVG inline, trazo de 2 px, `currentColor`) para los
  8 eventos vitales y las promesas de la portada, como en el prototipo. Si hacen
  falta más, se permite **Lucide** (`lucide-react`, ISC) por ADR-042, importando
  solo los iconos usados. Todos los iconos llevan `aria-hidden` y texto al lado.
- **Logotipo:** las dos casillas marcadas del prototipo (SVG propio) + «Requisito a
  Requisito» en Atkinson 800. Favicon = una casilla marcada.
- **Imágenes = documentos reales:** en la ficha de cada ayuda, una miniatura de la
  primera página del documento oficial citado (renderizada desde el snapshot con
  `pdfjs-dist` en el build, en WebP pequeño, con texto alternativo «Primera página
  de la Orden …, BOCM n.º …»). Es la imagen más honesta y propia del producto.
  **Nada de fotos de stock, ilustraciones genéricas ni imágenes generadas.**

## 5. Composición (lo que evita el «look IA»)

- **Nada de rejillas de tarjetas iguales.** Los eventos vitales van en **lista de
  dos columnas con filete inferior**, icono en círculo y recuento a la derecha.
  Los ejemplos son **chips**. El proceso son **3 pasos con regla superior** (la
  numeración es real: es una secuencia).
- **Matriz requisito a requisito** (tabla real `<table>` con `<caption>`, `scope`,
  scroll horizontal propio en móvil y alternativa en móvil < 640 px: una lista por
  ayuda con sus casillas). Es la **firma** del producto.
- **Expediente** (detalle de una ayuda): cabecera con regla gruesa, casillas
  numeradas con su cita en mono, `dl` de datos clave, pie con la fecha de
  verificación y la acción principal.
- **Plan** al lado del expediente en escritorio y debajo en móvil: importe total
  grande (solo importes citados por persona), documentos agrupados y plazos.
- Radio pequeño (6 px), **una** sombra (la hoja de muestra de la portada). Bordes
  de 1 px; regla de 2 px en `--ink` para los encabezados de sección y de
  expediente.
- Ancho de lectura ≤ 65 caracteres; `--shell` 72rem.

## 6. Microinteracciones

- Pulsar una casilla de la matriz ⇒ abre el panel «Texto oficial» con el extracto
  resaltado (`aria-live`).
- Responder en «Nos falta un dato» ⇒ las casillas afectadas cambian de `?` a `✓` o
  `✕` con una transición de 150 ms (sin ella con `reduced-motion`) y el resumen
  anuncia el cambio.
- El sello de la portada no se anima (el gesto es el giro, no el movimiento).

## 7. Cómo implementarlo (tarea F4-ART)

1. Sustituir los tokens y las fuentes por los de §2–§3; eliminar los heredados de
   la-ayuda que no se usen.
2. Reescribir `DESIGN.md` del repo a partir de este documento (principios,
   tokens, componentes, anti-patrones).
3. Componentes: `Brand`, `Seal`, `Tick` (5 estados), `LevelTag`, `LifeEventList`,
   `ExampleChips`, `Steps`, `QuestionScreen` (con `ProgressBar`, `Why`,
   `AltAnswers` y `MunicipalityCombobox` según el patrón ARIA APG),
   `RequirementMatrix` (+ variante móvil), `CitationPanel`, `Dossier`, `PlanAside`,
   `ObservatoryStats` y `ChangeLog`.
4. Rehacer la portada, `/comprobar`, `/resultados`, `/ayudas/[slug]`, `/ayudas`,
   `/observatorio` y `/como-funciona` siguiendo el prototipo.
5. Bucle de calidad visual (phases/F4): capturas en 375/1366, claro y oscuro,
   **lado a lado con el prototipo**, y revisión independiente que compare las dos.
   Diferencias aceptables: solo las impuestas por datos reales.
6. Accesibilidad: el contraste de todos los pares de tokens se comprueba con axe y
   con un script de contraste (≥ 4.5:1 en texto, ≥ 3:1 en bordes de casillas y
   estados). Ningún estado se comunica solo por color: siempre marca + texto.

## 8. Anti-patrones explícitos

Rejillas 3×3 de tarjetas · tarjetas dentro de tarjetas · emojis como iconos ·
degradados · crema con terracota · fotos de stock · ilustraciones genéricas de
personas · iconos de colores distintos por sección · todo centrado · sombras en
todo · el rojo o los logotipos de la Comunidad de Madrid · «IA» o «inteligente» en
los textos.
