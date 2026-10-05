<!-- Origen: la-ayuda@63ad635b:DESIGN.md, MIT (proyecto propio de Daniel). Copia base; la adaptacion a este producto se completa en F4 (docs/09). -->

# DESIGN.md - La Ayuda Frontend Contract (Open Design Spec)

## Sistema vigente - "Portal civico 2026" (rebuild completo)

El sistema "Registro Publico" anterior quedo reemplazado por completo. El nuevo sistema se inspira en portales civicos modernos de referencia (edubecas.es, opositar.app, larenta.es): superficies blancas flotantes sobre fondo frio claro, radios grandes controlados, sombras suaves, pills de estado y tipografia sans editorial.

Arquitectura CSS vigente:

- `src/app/globals.css`: tokens, reset, shell (header/nav/footer), botones, tarjetas `.card`/`.aid-card`, badges, formularios, dark mode, responsive, reduced-motion y print.
- `src/styles/pages.css`: layout por pagina (home, explorar, ficha, asistente, resultado, convocatorias, estado, articulos, hubs de contenido).
- Orden de carga: `pages.css` antes que `globals.css` (globals gana en igual especificidad).

Principios del sistema:

- Fondo `--bg: #f2f6f4` (verdoso frio claro); superficies `--surface: #ffffff` con `--shadow-s/m/l` y radios `--radius` (12px) a `--radius-xl` (26px).
- Acento civico verde `--accent: #0a5c40` / `--accent-2: #0d7451` / `--accent-soft: #dcede3` / `--accent-ink: #06402c` para CTAs, estados activos y foco.
- Pills de estado: `Revisada` (ok-soft), `Pendiente de revision` (warn-soft), `Cerrada` (neutral-soft), deadlines (info/danger-soft).
- Hero home: layout de dos columnas con tarjeta de confianza (`home-trust`) a la derecha; buscador como caja pill con boton integrado.
- Ficha: sidebar `.benefit-sidebar` sticky con datos clave (dl con filetes); secciones `.benefit-section` en dos columnas (intro + contenido).
- Mono IBM Plex reservada a identificadores, metadatos de procedencia y etiquetas `eyebrow`.
- Dark mode por `prefers-color-scheme` con tokens espejados; `--on-accent` fija el texto sobre acento.
- Iconos SVG inline (`.icon`, 1em, currentColor); `focus-visible` con doble anillo blanco+acento.

## 1. Filosofia de marca y voz

- Objetivo: catalogo publico y transparente de ayudas, prestaciones, deducciones y subvenciones en Espana, priorizando fuentes oficiales primarias.
- Tono: confiable, ciudadano, claro y riguroso. La interfaz debe reducir jerga legal sin ocultar la evidencia.
- Principio UI clave: el frontend debe reflejar honestamente el pipeline de ingestion, verificacion y publicacion. Una ayuda publicada debe poder auditarse desde su ficha hasta el boletin, convocatoria o fuente oficial que la origino.
- Separacion obligatoria: `GO tecnico`, `candidate`, `needs_review`, `draft`, `publishReady` y `revisada` no son sinonimos. La UI no debe presentar candidatos o borradores como ayudas activas para la ciudadania.

## 2. Direccion visual

- Estetica: portal civico moderno, de alta trazabilidad. Evitar apariencia generica de dashboard SaaS o "IA" y tambien el look de registro documental plano.
- Composicion: superficies blancas flotantes sobre fondo frio, jerarquia fuerte entre resumen ciudadano, datos clave y evidencia oficial; radios grandes y sombras suaves.
- Personalidad: civica, accesible y precisa. El elemento memorable es la trazabilidad visible (pills de estado, procedencia, fechas de revision), no efectos decorativos.
- Tipografia: sistema auto-hospedado (`public/fonts/`, `@font-face` en `public/fonts/fonts.css`). Inter Variable para titulares y UI (`--font-display`), Source Sans 3 para cuerpo (`--font-body`), Source Serif 4 para citas de texto oficial (`--font-serif`), IBM Plex Mono para identificadores, importes y metadatos de procedencia (`--font-mono`). Titulares con tracking negativo (`-0.03em` a `-0.04em`) y pesos 780-820.
- Movimiento: discreto y funcional (translateY -1/-2px en hover, transiciones <=200ms); respetar `prefers-reduced-motion`.

## 3. Paleta de colores

Implementacion vigente (sistema "Portal civico 2026" — un unico `:root` canonico en `src/app/globals.css` mas un unico bloque `prefers-color-scheme: dark`):

- Base: `--bg: #f2f6f4` (verdoso frio claro), superficies `--surface: #ffffff`, `--surface-2: #e9f1ec`, `--surface-3: #d8e6dd`; texto `--ink: #0f1b15`, `--text: #39473f`, `--muted: #61716a`, `--faint: #8a9a90`; lineas `--line`, `--line-strong`.
- Acento unico: verde civico `--accent: #0a5c40` / hover `--accent-2: #0d7451` / `--accent-ink: #06402c` / `--accent-soft: #dcede3` / `--accent-border`. Enlaces `--link` = acento. Texto sobre acento: `--on-accent` (blanco en light, tinta en dark).
- Estados: `--ok/--warn/--danger/--info` con sus pares `-soft` para pills de revision, plazos y avisos.
- Forma: `--shell: 74rem`, radios `--radius-s: 8px` / `--radius: 12px` / `--radius-l: 18px` / `--radius-xl: 26px` / `--radius-full: 999px`; sombras `--shadow-s/m/l` multicapa suaves.
- Dark mode: mismo set redefinido en un solo bloque canonico `@media (prefers-color-scheme: dark)` (`--bg: #0c1310`, `--surface: #131d18`, `--accent: #4cc79a`, `--on-accent: #06281c`, etc.). La fuente de verdad del color es ese bloque.
- Aliases: los tokens del sistema anterior (`--paper*`, `--signal*`, `--doc*`, `--wash/--mist/--warm/--coral`, etc.) fueron eliminados junto a todas sus reglas; no quedan consumidores. No reintroducir aliases sin consumidor.
- Evitar fondos con grid, gradientes llamativos, bloques multicolor sin funcion o paletas de "app IA".
- El asistente debe usar una estructura cromatica unica y estable: seleccion, foco, aviso y resultado no pueden parecer sistemas distintos.

Referencia contractual original:

- Fondo general: blanco calido o blanco tintado (`#FFFFFF` como referencia) con secciones en gris ultra-claro (`#F1F5F9`).
- Texto principal: gris azulado oscuro de alto contraste (`#1E293B`).
- Accent principal: azul civico (`#0284C7`) para enlaces, acciones primarias y foco de navegacion.
- Bordes y superficies: neutros frios (`#CBD5E1`, `#E2E8F0`, `#F8FAFC`) para separar sin sobrecargar.
- Estado activo/publicado: verde esmeralda (`#059669`). Solo para contenido visible y utilizable por ciudadania.
- Estado editorial/draft: indigo (`#4F46E5`). Uso preferente en vistas internas o modulos de transparencia, no como reclamo publico de una ayuda.
- Estado candidato/needs review: naranja (`#D97706`). Debe indicar que falta verificacion, no que la ayuda sea solicitabile.
- Urgencia de plazo: rojo accesible (`#DC2626`) solo cuando falten menos de 5 dias o haya cierre inminente confirmado.

## 4. Reglas de accesibilidad y base del repo

- Mantener el skip link global hacia `#main-content`.
- Mantener landmarks semanticos: `header`, `nav[aria-label]`, `main#main-content` y `footer`.
- Un solo `h1` por pagina y jerarquia sin saltos.
- No eliminar estilos `:focus-visible`; cualquier custom focus debe tener contraste suficiente.
- Todo boton icon-only debe tener `aria-label` traducido.
- Los textos `aria-label` deben venir del sistema i18n del repo, no estar hardcodeados en ingles.
- Los formularios deben usar `label` explicito; no confiar solo en `placeholder`.
- Resultados dinamicos: usar `role="status" aria-live="polite"`. Errores: `role="alert"`.
- Controles de progreso o confianza: usar `role="progressbar"` con `aria-valuenow`, `aria-valuemin`, `aria-valuemax` y etiqueta accesible.

## 5. Componentes obligatorios

### A. Monitor de frescura del catalogo

Ubicacion: header o bloque superior de catalogo.

Debe mostrar, solo si existen datos reales:

- Ultimo boletin o fuente procesada.
- Fecha/hora de ultima ingestion o sincronizacion.
- Candidatos evaluados por IA hoy.
- Ayudas activas totales.
- Ultima verificacion editorial o tecnica disponible.

Reglas:

- No inventar metricas.
- Si falta una metrica, mostrar estado honesto: `Sin dato publicado`, `Pendiente de sincronizacion` o `No verificado`.
- El modulo debe enlazar a una pagina o bloque de metodologia cuando exista.

### B. Buscador ciudadano

El panel superior debe incluir:

- Busqueda principal por texto: ejemplos como `vivienda`, `autonomos`, `pensiones`, `familias numerosas`.
- Filtro de ambito: `Estatal`, `Comunidad Autonoma`, `Provincial`, `Local`.
- Filtro por publico objetivo: `Jovenes`, `Familias`, `Desempleados`, `Autonomos`, `Empresas`, `Personas con discapacidad`, `Mayores`.
- Filtro de estado publico: por defecto solo `Activas/publicadas`.
- Orden recomendado: `Plazo mas cercano`, `Publicacion reciente`, `Mayor cuantia`, `Mas verificadas`.

Estado vacio:

- Debe explicar que no hay resultados con esos filtros.
- Debe ofrecer limpiar filtros.
- Puede sugerir consultar fuentes oficiales enlazadas, pero nunca prometer cobertura total si el pipeline no la confirma.

### C. Tarjeta principal de ayuda

Cada ficha de ayuda publicada debe seguir esta jerarquia:

1. Cabecera de origen:
   - Badge de fuente: `BOE`, `BDNS`, `DOGV`, `BOCM`, `BOJA`, etc.
   - Fecha de publicacion original.
   - Ambito territorial.
   - Estado publico visible: `Activa`, `Plazo abierto`, `Plazo cerrado`, `Pendiente de verificacion`, segun datos reales.

2. Titulo limpio:
   - Nombre normalizado para ciudadania.
   - Evitar titulos burocraticos extensos en la cabecera.
   - La denominacion oficial completa puede ir en evidencia o detalle.

3. Bloque de datos clave:
   - Cuantia o beneficio: destacado en negrita. Ejemplos: `Hasta 400 EUR`, `Bonificacion del 50%`, `Deduccion autonomica`.
   - Plazo de solicitud: fecha limite y aviso si quedan menos de 5 dias.
   - Requisito principal: criterio restrictivo mas importante. Ejemplos: `Ingresos inferiores a 22.000 EUR`, `Residencia en la Comunidad Valenciana`, `Alta como autonomo`.

4. Resumen ciudadano:
   - 2-4 frases claras.
   - Sin lenguaje tecnico innecesario.
   - No incluir inferencias no respaldadas por la fuente.

5. Acciones:
   - Accion primaria: `Ver fuente oficial` o `Consultar convocatoria`.
   - Accion secundaria: `Ver evidencia`, `Compartir`, `Copiar enlace`.
   - Si no hay canal de solicitud confirmado, no mostrar un boton que parezca solicitud directa.

6. Acordeon de transparencia y evidencias:
   - Extracto literal o resumen trazable del boletin/PDF/fuente oficial.
   - Enlace directo a la fuente primaria.
   - Identificador o referencia oficial si existe.
   - Fecha de captura/verificacion.
   - Estado de revision editorial.
   - Si aplica, modelo o sistema que ayudo a extraer el dato: Hermes, NAN, Qwen, Gemma. Presentarlo como asistencia de analisis, no como autoridad final.

### D. Pagina de detalle de ayuda

Debe ampliar la tarjeta sin romper la jerarquia:

- Resumen ciudadano arriba.
- Datos clave en bloque persistente o muy visible.
- Requisitos detallados.
- Como solicitar, solo si esta confirmado.
- Fuente oficial y evidencia.
- Historial de cambios o ultima revision.
- Aviso claro si la ayuda procede de una fuente oficial pero aun requiere validacion editorial.

### E. Transparencia del algoritmo

Ubicacion: footer del catalogo, pagina secundaria o bloque `Como funciona`.

Explicar en lenguaje ciudadano:

- Captura de fuentes oficiales.
- Filtrado de ruido y extraccion asistida por modelos.
- Verificacion tecnica y editorial.
- Publicacion estatica segura.
- Enlace a metodologia, criterios de confianza y limitaciones.

Copy recomendado:

> La Ayuda prioriza fuentes oficiales. Los modelos de IA ayudan a localizar y estructurar informacion, pero una ayuda no debe tratarse como publicada hasta superar los controles de verificacion definidos por el proyecto.

## 6. Anti-patrones prohibidos

- No usar mosaicos de cuadrados/rectangulos iguales como solucion principal de home, asistente o navegacion.
- No convertir la portada en una enumeracion infinita de ayudas. Debe orientar, buscar, segmentar y solo despues mostrar listados limitados.
- No usar tarjetas dentro de tarjetas ni paneles decorativos apilados que parezcan un dashboard generado.
- No repartir colores por seccion sin un sistema funcional claro.
- No presentar `needs_review`, `candidate` o `draft` como `Activa`.
- No mostrar enlaces a solicitud si el canal no esta confirmado.
- No mezclar texto legal denso en el resumen principal.
- No ocultar la fuente oficial detras de una accion secundaria irrelevante.
- No usar metricas de pipeline sin artefacto o dato real.
- No convertir estados tecnicos internos en reclamos de marketing.
- No usar estados de confianza altos solo porque un modelo encontro una coincidencia.
- No romper i18n ni accesibilidad por componentes visuales.

## 7. Contrato de datos minimo para componentes

Una tarjeta debe poder renderizarse con este contrato conceptual:

```ts
type AidCard = {
  id: string;
  title: string;
  officialTitle?: string;
  sourceLabel: string;
  sourceUrl: string;
  sourcePublishedAt?: string;
  capturedAt?: string;
  verifiedAt?: string;
  scope: "estatal" | "autonomico" | "provincial" | "local";
  territoryLabel?: string;
  publicStatus: "active" | "open" | "closed" | "pending_review";
  reviewStatus?: "draft" | "needs_review" | "verified" | "revisada";
  amountLabel?: string;
  deadlineLabel?: string;
  daysUntilDeadline?: number;
  mainRequirement?: string;
  citizenSummary: string;
  evidenceExcerpt?: string;
  evidenceLocator?: string;
};
```

Reglas:

- `sourceUrl` es obligatorio para fichas publicas.
- `citizenSummary` no debe contener datos no respaldados.
- `deadlineLabel` debe distinguir entre `sin plazo`, `no encontrado`, `pendiente de confirmar` y fecha confirmada.
- `publicStatus` debe derivarse de reglas deterministas, no de copy manual.

## 8. Prompts para agentes de implementacion

### Paso 1 - Tarjeta de ayuda

Lee `DESIGN.md` de `la-ayuda`. Crea el componente de tarjeta para una ayuda activa. Separa visualmente el titulo normalizado, el bloque de datos clave y el acordeon de evidencias. El badge de fuente oficial debe estar en la cabecera de la tarjeta. No muestres candidatos o borradores como activos. Mantén WCAG 2.2 AA y usa etiquetas ARIA traducibles.

### Paso 2 - Barra de estado del pipeline

Disena un componente compacto para el header que muestre metricas de frescura del catalogo: ultima fuente procesada, candidatos evaluados hoy y ayudas activas totales. Si una metrica no existe en datos reales, renderiza un estado honesto en vez de inventarla. El componente debe funcionar en movil y escritorio.

### Paso 3 - Buscador ciudadano

Implementa el buscador combinando filtros de ambito y colectivo. Por defecto muestra solo ayudas activas/publicadas. Cuando no haya resultados, muestra un estado vacio claro con opcion de limpiar filtros y enlace a fuentes oficiales/metodologia si existe.

### Paso 4 - Pagina de transparencia

Crea una seccion `Como funciona` que explique el pipeline: captura de fuentes oficiales, extraccion asistida por IA, verificacion humana/editorial y publicacion estatica segura. Debe dejar claro que la fuente oficial es la autoridad final.
