# datawardsmadrid — Guía para agentes

Candidatura de Daniel (**persona física**, ADR-026) a los **Premios Global Tech
Leaders Awards 2026** (Comunidad de Madrid, Orden 566/2026, BOCM del 01/10/2026).
Este repo contiene **el producto y la candidatura**: código, especificación,
fases, esquemas, plantillas, evidencias y memoria (ADR-022).

Es un **proyecto nuevo e independiente**, hecho para este concurso. Reutiliza
código y datos de proyectos propios estatales (la-ayuda, EduAyudas) **sin
modificarlos**: son donantes de solo lectura (docs/13).

Producto: **Requisito a Requisito** (ADR-029) — *Ayudas públicas en la Comunidad de Madrid, comprobadas con la fuente oficial*. Orientador que, a partir de
≤ 10 preguntas, dice qué ayudas públicas merece la pena comprobar, qué requisitos
cumples, cuáles no y cuáles no se pueden saber, **qué te falta**, plazo,
documentos y dónde solicitar, con cada afirmación enlazada a la fuente oficial.
Las reglas deterministas deciden y nada se envía fuera del navegador.
**Ámbito: Comunidad de Madrid** (ayudas autonómicas y municipales de la CM, más las
estatales que puede solicitar un residente en Madrid). El premio es de la
Comunidad de Madrid (ADR-021).

Aplica además `F:\_Proyectos\AGENTS.md` (unidades, worktrees, temporales y caché).

## 0. Ahora mismo (08/10 → 16/10): fase F10

**Lee primero `phases/F10-cierre-candidatura.md`.** Ahí están el calendario por
día, las tareas por área (back, front, dev, infra, QA y memoria), las decisiones
pendientes de Daniel y la lista de lo que NO se hace.

- **Ruta crítica 1 — revisión humana:** las 52 reglas tienen
  `humanReview: pending`, así que la release `--strict` del jurado saldría vacía.
  Daniel marca las hojas `muestreo-ola-*.md`, el agente las aplica
  (`review:apply`) y el 14/10 Pages sirve el build estricto (ADR-050).
- **Ruta crítica 2 — impacto (50 % de la nota):** piloto con personas reales
  del 10 al 13/10 ⇒ `piloto.json` ⇒ memoria.
- **El panel NAN está cerrado** (ADR-050). Nada de `panel:run` ni `panelReview`.
- **No se reabre** el producto, la categoría ni la elegibilidad (ADR-051): la
  Subdirección ya confirmó que una persona física puede concurrir a Impact.
- **Antes de que Daniel marque las hojas**, `review:apply` tiene que estar corregido (F10-FIX-1): la versión del 08/10 deriva mal la pertenencia a cada ola.
- Al cerrar cada sesión: evidencia commiteada, fila de TASK_QUEUE, handoff y `gh run list` sin jobs en rojo sin explicar.

## 1. Orden de lectura (al empezar cada sesión)

1. `TASK_QUEUE.md`: fase activa y siguiente tarea.
2. `handoffs/`: el más reciente.
3. `phases/Fx-*.md`: **solo** la fase activa (hoy: **F10**).
4. `docs/12-forma-de-trabajo.md`: cómo trabajar, cuándo parar y cómo recortar.
5. Según la tarea:
   - motor → `docs/07-motor-evaluacion.md` + `schemas/`
   - fuentes y reglas → `docs/08-fuentes-y-datos.md`
   - interfaz → **`docs/16-direccion-de-arte.md` + `design/prototipo/requisito-a-requisito.html` (fuente de verdad visual)** + `docs/09-diseno-ux.md` (contenido, flujo y accesibilidad)
   - QA → `docs/10-qa-matriz.md`
   - build, servido o demo → `docs/11-infra-despliegue.md`
   - visión de conjunto → `docs/02-arquitectura.md`
6. `DECISIONS.md`: no reabras decisiones aceptadas sin evidencia nueva.
7. `docs/13-reutilizacion-donantes.md`: qué se toma de cada repo propio y cómo.

Contexto de fondo (solo si hace falta): `docs/00` (convocatoria), `docs/01`
(estrategia), `docs/04` (referencias), `docs/05` (memoria) y `docs/06` (consulta).

## 2. Fecha límite

- **Plazo de presentación: 16/10/2026** (sede + BOCM). La prensa dice 18/10:
  **ignorarlo**. Paquete listo el **14/10**; Daniel presenta el 15/10.
- Ningún agente firma, presenta, envía correos ni contacta con la Administración.
- Si no da tiempo, se recorta alcance (docs/12 §5), **nunca rigor**.

## 3. Dónde trabajar

| Qué | Dónde |
|---|---|
| **Código del producto** + especificación + evidencias + memoria | **este repo**: `F:\_Proyectos\datawardsmadrid` (rama `main`; ramas de trabajo `feat/<tarea>` si conviene) |
| Donantes (**solo lectura**, nunca escribir) | `F:\_Proyectos\la-ayuda` (catálogo, diseño, privacidad), `G:\_Proyectos\eduayudas` (motor de referencia, avisos legales, QA), `F:\_Proyectos
enta-verificable` (modelo de evidencia). Ver docs/13 |
| Trabajo previo que hay que portar | worktree `F:\AgentState\worktrees\la-ayuda\premio-gtl`, commit `6595a533` (Zod). **Conservar; no borrar; no seguir trabajando ahí** |
| Bytes de fuentes oficiales | `F:\AgentState\datawardsmadrid\snapshots\` |
| Scratch | `F:\Temp\datawardsmadrid-<tarea>\` |
| Navegadores de Playwright | `F:\Caches\ms-playwright` (`PLAYWRIGHT_BROWSERS_PATH`) |

**Repos donantes ↔ GitHub** (lectura; el local suele ir por delante):

| Local | GitHub | Qué se reutiliza |
|---|---|---|
| `F:\_Proyectos\la-ayuda` | [Huntsman1756/mapa-de-beneficios](https://github.com/Huntsman1756/mapa-de-beneficios) (MIT) | 57 fichas Madrid + 191 estatales (activas y revisadas), tokens de diseño, `user-state.ts`, ranking de relevancia, configuración de tooling |
| `G:\_Proyectos\eduayudas` | [Huntsman1756/edubecas](https://github.com/Huntsman1756/edubecas) | Referencia del motor, casos de territorio, avisos legales, checklist de QA |
| `F:\_Proyectos
enta-verificable` | [Huntsman1756/renta-verificable](https://github.com/Huntsman1756/renta-verificable) | Modelo claim → evidencia |

Para leer un donante sin depender de su working tree:
`git -C F:\_Proyectos\la-ayuda show <commit>:<ruta>`. Fija el commit en
`data/catalog/provenance.json`.

## 4. Reglas no negociables

1. **Las reglas deciden; el texto solo explica.** No hay LLM en el producto (ADR-003).
2. **Sin fuente oficial no hay afirmación.** Cada requisito, importe, plazo,
   documento y canal lleva cita (fuente de rango 1–4, localizador, extracto
   literal presente en el texto de la fuente y su huella). Si falta ⇒ el build falla.
3. **UNKNOWN ≠ NO.** Un dato que falta o es impreciso da `U`, nunca `F`.
4. **Solo reglas verificadas en público (ADR-044, G12):** autor ⇒ verificador independiente ⇒ merge ⇒ deploy; la release del jurado solo con `approved`.
4b. **Comprobación antes de responder.** Cada evaluación pasa los invariantes
   I1–I10 en el navegador; si alguno falla, no se muestra veredicto (docs/07 §5).
5. **Los donantes no se modifican.** Ni commits, ni ramas, ni builds en su
   checkout. Lo importado lleva procedencia (commit + sha256) y **solo** alimenta el
   nivel 2. El nivel 1 exige un RuleSet propio aprobado (ADR-023).
6. **Privacidad:** el perfil nunca sale del navegador ni va en telemetría, URL o
   cookies (ADR-007; contrato portado de `user-state.ts`; test bloqueante en todos
   los navegadores).
7. **Solo se citan cifras medidas** en la memoria (0 cifras huérfanas, F7-6).
8. **Dependencias nuevas solo según ADR-042.** Push, despliegue en Pages y merge a
   main autorizados por delegación (ADR-036) si `validate:full` pasa. **Nunca**
   envíos ni contactos con terceros, ni gastos.
9. **No copiar** código, textos, CSS, iconos ni datos de proyectos de terceros;
   solo patrones, anotados en `docs/04` (docs/12 §6).
10. Validación: `npm run check`, `npm run lint`, `npm test` y `npm run build`, en
    secuencia (y `npm run validate:full` al cerrar una fase). Windows + Node/npm, sin Bun. Commits pequeños por unidad, sin
    `git add .`, `reset --hard` ni `clean`.
11. **Herramientas que escriben aprobaciones o datos públicos** (`review:apply`,
    el build del bundle, el deploy, los generadores de nivel 2 y de cifras)
    llevan, además de los tests con fixtures, **un test sobre los datos reales
    del repo** que compruebe el invariante de negocio. Ejemplo: cada regla del
    bundle pertenece a exactamente una hoja de muestreo vigente. Que pasen los
    tests sintéticos no basta (lección del 08/10: `review:apply` pasaba 8 tests
    y con las hojas reales dejaba 14 reglas sin ola).
12. **Un resultado se mide por la ruta real.** Si para un ensayo se simula un
    paso (por ejemplo, aprobaciones escritas a mano en una copia), el informe lo
    dice explícitamente («simulado, sin pasar por X») y **no** se presenta como
    lo que ocurrirá. Las afirmaciones del tipo «con las hojas aplicadas entran N»
    exigen ejecutar la herramienta real.
13. **Cada cifra de la memoria** sale de `submission/cifras.json`
    (`npm run memoria:cifras`) o de un informe de `evidence/`, y tiene su
    entrada en el `veracidad.json` vigente, que acumula todas las cifras (no
    solo las nuevas). Hay que usar el nombre exacto de la medida: «registradas»
    no es «citadas», ni «RuleSets» es «programas».
14. **Push y CI:** los workflows que hacen commit en `main` (frescura) integran
    antes de subir (`git pull --rebase` + reintento). Un agente que vea un job
    del CI en rojo lo investiga en esa misma sesión y no lo da por bueno porque
    el deploy esté en verde. **Un `git push` nunca va en la misma orden que una
    tubería** (`git pull --rebase | tail -1 && git push` lanza el push aunque el
    pull falle, porque `&&` mira el código de `tail`): primero `git pull --rebase`
    solo, comprobar que sale con código 0, y `git push` en otra orden. Nunca push
    forzado (`--force`, `-f`, `+rama`). En Claude Code lo bloquea
    `.claude/hooks/push-guard.js`; los demás agentes lo cumplen por esta regla.

## 5. Cerrar tarea y fase

- Tarea: fila de `TASK_QUEUE.md` con estado, commit, comandos + resultado y
  evidencia (docs/10 §8).
- Fase: puerta de `phases/Fx.md` + `evidence/<fecha>-Fx/receipt.json`
  (plantilla `templates/phase-receipt.json`) + `handoffs/<fecha>-Fx.md`
  (plantilla `templates/handoff.md`).
- Decisión de diseño ⇒ ADR en `DECISIONS.md`.
- Bloqueo ⇒ `BLOQUEADO: <qué> — <quién>` y seguir con la siguiente tarea independiente.

## 6. Mapa del repo

```
AGENTS.md            este contrato
README.md            resumen de una página
TASK_QUEUE.md        cola viva
DECISIONS.md         ADRs
docs/00..06          contexto, estrategia, arquitectura, fases (índice), referencias, memoria, consulta
docs/07              motor de evaluación (normativo)
docs/08              fuentes, jerarquía, snapshot, datos de referencia, privacidad
docs/09              diseño y UX
docs/10              QA: pirámide, matriz de navegadores/dispositivos, a11y, rendimiento, privacidad
docs/11              back (pipeline de build), infraestructura, demo
docs/12              forma de trabajo
phases/F0..F10       una fase por fichero con su puerta (F10 = cierre activo)
schemas/             JSON Schema 2020-12 (contrato normativo; Zod en el código)
templates/           ejemplos y plantillas (RuleSet, golden, recibo, handoff, checklist manual)
docs/13              reutilización de donantes (la-ayuda, EduAyudas…)
docs/14              universo de ayudas de Madrid, fuentes de descubrimiento, oleadas
docs/15              funcionalidades ampliadas, referencias y política de dependencias
docs/16              dirección de arte (ADR-043)
docs/17              panel de revisión multimodelo NAN (ADR-047)
design/prototipo/    prototipo HTML: fuente de verdad visual
src/ data/ scripts/ tests/ public/   código y datos del producto (se crean en F0-7)
evidence/            evidencias fechadas
handoffs/            relevos entre sesiones
submission/          paquete final
```
