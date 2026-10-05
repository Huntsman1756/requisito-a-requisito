# datawardsmadrid — Guía para agentes

Candidatura de Daniel a los **Premios Global Tech Leaders Awards 2026** (Comunidad
de Madrid, Orden 566/2026, BOCM del 01/10/2026). Este repo es el **centro de mando**:
especificación, fases, esquemas, plantillas, evidencias y memoria. **El código
del producto no vive aquí**: se escribe en un worktree de la-ayuda (§3).

Producto: **La Ayuda · Tus derechos, con fuente**. Orientador que, a partir de
≤ 10 preguntas, dice qué ayudas públicas merece la pena comprobar, qué requisitos
cumples, cuáles no y cuáles no se pueden saber, **qué te falta**, plazo,
documentos y dónde solicitar, con cada afirmación enlazada a la fuente oficial.
Las reglas deterministas deciden y nada se envía fuera del navegador.
**Ámbito: Comunidad de Madrid** (ayudas autonómicas y municipales de la CM, más las
estatales que puede solicitar un residente en Madrid). El premio es de la
Comunidad de Madrid (ADR-020).

Aplica además `F:\_Proyectos\AGENTS.md` (unidades, worktrees, temporales y caché).

## 1. Orden de lectura (al empezar cada sesión)

1. `TASK_QUEUE.md`: fase activa y siguiente tarea.
2. `handoffs/`: el más reciente.
3. `phases/Fx-*.md`: **solo** la fase activa.
4. `docs/12-forma-de-trabajo.md`: cómo trabajar, cuándo parar y cómo recortar.
5. Según la tarea:
   - motor → `docs/07-motor-evaluacion.md` + `schemas/`
   - fuentes y reglas → `docs/08-fuentes-y-datos.md`
   - interfaz → `docs/09-diseno-ux.md` + `la-ayuda/DESIGN.md`
   - QA → `docs/10-qa-matriz.md`
   - build, servido o demo → `docs/11-infra-despliegue.md`
   - visión de conjunto → `docs/02-arquitectura.md`
6. `DECISIONS.md`: no reabras decisiones aceptadas sin evidencia nueva.
7. `F:\_Proyectos\la-ayuda\AGENTS.md`: **contrato fuerte del repo destino**;
   prevalece sobre este documento en todo lo que afecte a ese repo.

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
| Especificación, evidencias, memoria, handoffs | `F:\_Proyectos\datawardsmadrid\` |
| Código del producto | worktree `F:\AgentState\worktrees\la-ayuda\premio-gtl`, rama `feat/premio-gtl-elegibilidad` desde `main` |
| Donante del motor (solo lectura) | `G:\_Proyectos\eduayudas\packages\rules-engine` |
| Bytes de fuentes oficiales | `F:\AgentState\datawardsmadrid\snapshots\` |
| Scratch | `F:\Temp\datawardsmadrid-<tarea>\` |
| Navegadores de Playwright | `F:\Caches\ms-playwright` (`PLAYWRIGHT_BROWSERS_PATH`) |

**Repos locales ↔ GitHub.** El local suele ir por delante y es la fuente de
verdad. GitHub se usa solo para leer; no se hace push sin autorización.

| Local | GitHub | Papel |
|---|---|---|
| `F:\_Proyectos\la-ayuda` | [Huntsman1756/mapa-de-beneficios](https://github.com/Huntsman1756/mapa-de-beneficios) | Producto destino |
| `G:\_Proyectos\eduayudas` | [Huntsman1756/edubecas](https://github.com/Huntsman1756/edubecas) (en producción: edubecas.es) | Referencia del motor de reglas |
| `F:\_Proyectos\renta-verificable` | [Huntsman1756/renta-verificable](https://github.com/Huntsman1756/renta-verificable) | Referencia del modelo claim → evidencia |

Crear el worktree (una vez):

```powershell
git -C F:\_Proyectos\la-ayuda worktree add F:\AgentState\worktrees\la-ayuda\premio-gtl -b feat/premio-gtl-elegibilidad main
```

**No** trabajar en el checkout principal de la-ayuda: tiene cambios sucios ajenos
que hay que preservar.

## 4. Reglas no negociables

1. **Las reglas deciden; el texto solo explica.** No hay LLM en el producto (ADR-003).
2. **Sin fuente oficial no hay afirmación.** Cada requisito, importe, plazo,
   documento y canal lleva cita (fuente de rango 1–4, localizador, extracto
   literal presente en el texto de la fuente y su huella). Si falta ⇒ el build falla.
3. **UNKNOWN ≠ NO.** Un dato que falta o es impreciso da `U`, nunca `F`.
4. **Comprobación antes de responder.** Cada evaluación pasa los invariantes
   I1–I10 en el navegador; si alguno falla, no se muestra veredicto (docs/07 §5).
5. **Solo ayudas con autoridad vigente** en el ledger de la-ayuda. No se tocan
   las fichas, el ledger ni `data/pipeline/authority/`.
6. **Privacidad:** el perfil nunca sale del navegador ni va en telemetría, URL o
   cookies (ADR-007; test bloqueante en todos los navegadores).
7. **Solo se citan cifras medidas** en la memoria (0 cifras huérfanas, F7-6).
8. **Sin dependencias nuevas, sin push, sin merge a main, sin despliegue y sin
   envíos** sin autorización explícita de Daniel en esa sesión.
9. **No copiar** código, textos, CSS, iconos ni datos de proyectos de terceros;
   solo patrones, anotados en `docs/04` (docs/12 §6).
10. Validación del repo destino: `npm run check`, `npm test` y `npm run build`, en
    secuencia. Windows + Node/npm, sin Bun. Commits pequeños por unidad, sin
    `git add .`, `reset --hard` ni `clean`.

## 5. Cerrar tarea y fase

- Tarea: fila de `TASK_QUEUE.md` con estado, commit, comandos + resultado y
  evidencia (docs/10 §8).
- Fase: puerta de `phases/Fx.md` + `evidence/<fecha>-Fx/receipt.json`
  (plantilla `templates/phase-receipt.json`) + `handoffs/<fecha>-Fx.md`
  (plantilla `templates/handoff.md`).
- Decisión de diseño ⇒ ADR en `DECISIONS.md` (las del repo destino, en su propio
  `docs/decisions/`).
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
phases/F0..F7        una fase por fichero con su puerta
schemas/             JSON Schema 2020-12 (contrato normativo; Zod en el código)
templates/           ejemplos y plantillas (RuleSet, golden, recibo, handoff, checklist manual)
evidence/            evidencias fechadas
handoffs/            relevos entre sesiones
submission/          paquete final
```
