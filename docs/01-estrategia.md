# Estrategia

> **Actualización 2026-10-05 (ADR-022, ADR-026), que prevalece sobre lo de abajo:**
> se presenta un **proyecto nuevo e independiente**, **Requisito a Requisito**, **solo para la Comunidad de Madrid** y hecho para este
> concurso. Reutiliza código y datos de la-ayuda y EduAyudas **sin modificarlos**
> (docs/13). Candidato: Daniel, **persona física**. Las secciones «Qué se presenta
> (plan A)» y «Riesgo principal» de abajo describían la opción anterior
> (evolucionar la-ayuda) y quedan como contexto. La evaluación tras F0 y la
> recomendación de categoría (Leader, salvo confirmación de Impact) siguen vigentes.

## Tesis

El premio no valora una buena idea: Impact pondera **50% impacto demostrado**.
Un proyecto nuevo de diez días tendría innovación y cero impacto. Por eso no se
crea un repo nuevo: se **evoluciona `la-ayuda`** con piezas ya construidas.

## Qué se presenta (plan A — Global Tech Impact)

**La Ayuda — Tus derechos, con fuente.** De «catálogo de ayudas» a:

> Dime tu situación y te digo qué ayudas públicas merece la pena comprobar, por
> qué, qué te falta, cuándo termina el plazo y dónde se solicita, con cada
> afirmación enlazada a la fuente oficial.

Piezas reutilizadas (donantes, no productos adicionales):

| Repo | Aporta |
|---|---|
| `la-ayuda` (F:) | Producto público, catálogo ~450 fichas renderizadas, 5 interfaces lingüísticas, asistente, ledger de autoridad editorial, pipeline fail-closed |
| `eduayudas` (G:, live en edubecas.es) | Motor determinista `packages/rules-engine` (pass/fail/unknown + `missingField` + `nextAction`), tipos de reglas con `source_excerpt`/`source_url` |
| `renta-verificable` | Modelo claim → evidencia → fuente → límite de lo afirmable; huella de evidencia por contenido |
| `official-sources` / radar | Vigencia de plazos: OPEN / UPCOMING / CLOSED / UNKNOWN; no mostrar cerradas por defecto |

**Vertical único e impecable: Comunidad de Madrid** (ADR-021). Ayudas autonómicas y
municipales de la CM más las estatales que puede pedir un residente en Madrid,
priorizando familias y educación (donde EduAyudas ya tiene modelo) y
completando con juventud, vivienda o empleo si hace falta para llegar a 8. Después se argumenta que el mismo esquema escala a vivienda,
empleo, dependencia (criterio escalabilidad 20%).

**Diferenciador:** «¿Qué me falta para poder solicitarla?» — en lugar de «no
elegible», mostrar qué dato falta o qué requisito concreto no se cumple.

## Riesgo principal: el impacto medido

Hechos observados el 2026-10-05 en `la-ayuda/TASK_QUEUE.md`:
- No hay dominio público ni nginx configurado para la-ayuda en el VPS observado.
- El gate `pipeline:authority --strict` está en rojo (9 verificadas, 439 legacy) y
  **bloquea deploy**.

Consecuencia: **la-ayuda probablemente no tiene usuarios reales que acreditar.**
EduAyudas **sí** sirve un sitio vivo (`https://edubecas.es`). Por tanto:

- **F0-3 (decisión de vehículo):** medir antes del día 2 qué datos de uso reales
  existen (telemetría la-ayuda, logs/analytics de edubecas.es, estrellas/forks,
  reutilizaciones, menciones). Si edubecas.es tiene uso medible y la-ayuda no, la
  memoria presenta **el ecosistema La Ayuda + EduBecas** como una iniciativa
  (mismo titular, mismo modelo probatorio) y la demo de elegibilidad como su
  evolución. Decisión registrada en `DECISIONS.md`.
- La memoria debe ser honesta: impacto actual medido + impacto diseñado (cómo se
  medirá) + piloto. No inflar.

## Plan B — Global Tech Leader

Si la respuesta (o la falta de respuesta antes del 13/10) indica que una persona
física no encaja en Impact: presentar a **Leader** (art. 8 incluye «otros líderes
tecnológicos»; criterios Ejecución 40 / Resultados 35 / Ecosistema 25).

Narrativa: *un ecosistema open-source que convierte fuentes públicas españolas
difíciles de reutilizar en datos verificables, APIs, buscadores y
visualizaciones.* Evidencias: proyectos en `F:\_Proyectos` (BankCall España,
owership_radar, OpenFunds, openinstrument, RadarRegularioV2, bdns-archive-es,
la-ayuda, edubecas…) con **cifras reales** extraídas por un agente (commits,
volumen de datos, fuentes integradas, despliegues vivos, usuarios si los hay).
La demo de elegibilidad sigue siendo útil como pieza estrella.

**Por defecto**, si el 13/10 no hay respuesta: decide Daniel (ver TASK_QUEUE).

## Qué NO se presenta

- Renta Verificable sola (pre-beta local, sin despliegue remoto probado).
- La Ayuda tal como está (README reconoce dos afirmaciones fiscales incorrectas de
  septiembre; el vertical familias/educación evita las fichas fiscales).
- Más joven que tú (diseñado para Bizkaia; impacto social difícil de defender).
- Proyecto nuevo de transparencia (dinero público → adjudicatario → vínculos):
  bueno, pero merece proyecto propio, no 10 días. Registrado como idea futura.
- Doble candidatura (Impact + AI): prohibido por la Orden.

## Prioridad relativa

Este trabajo **no debe quitar horas a Bizkaia** (donde hay opciones reales). Si
hay conflicto, se recorta el vertical (menos fichas) o se pasa a plan B, que
requiere sobre todo redacción y recopilación de métricas.

## Evaluación tras F0 (2026-10-05)

Datos medidos (`evidence/2026-10-05-F0/`):
- **Uso:** la telemetría de la-ayuda es local-only (sin agregados). Search Console de
  edubecas.es: **1 clic y 1.128 impresiones en 75 días** (posición media ~71).
  Menciones externas: 0.
- **Ecosistema:** los tres repos son **privados** (0 stars; los clones son propios).
- **Técnica:** línea base verde (750/750 tests, build, a11y 12/12).

Consecuencias:
1. El **producto** es viable para el 14/10 con alcance Must (docs/03).
2. **Impacto demostrado ≈ 0**: la memoria no puede citar tracción. Las cifras de
   Search Console son un punto de partida honesto, no un argumento.
3. El **ecosistema** depende de publicar el código y los datos (D-4).
4. Por eso la recomendación de categoría pasa a **Global Tech Leader** (Ejecución
   40 / Resultados 35 / Ecosistema 25), con la trayectoria de proyectos entregados
   y el orientador de Madrid como pieza destacada, **salvo** que la Subdirección
   confirme que una persona física puede concurrir a Impact y Daniel prefiera
   asumir el 50 % de impacto sin usuarios. Decisión: D-5 / D-2.

## Propuesta de valor frente a lo que ya existe (2026-10-05)

Pregunta que hará el jurado: *si ya existe la sede de la Comunidad de Madrid, ¿qué
aporta esto?* Observado el 2026-10-05 (verificar de nuevo antes de citar cifras):

**La sede oficial** (`sede.comunidad.madrid`, «Ayudas, becas y subvenciones») es un
**catálogo administrativo**: 848 procedimientos mezclados (ayudas a familias junto a
inversiones forestales o ayudas a autónomos por incendios), **solo de la Comunidad
de Madrid** (sin estatales ni municipales), sin preguntar la situación de la persona
ni evaluar nada, y con los requisitos dentro de cada ficha y de la norma, en
lenguaje administrativo. Hay simuladores sueltos para una ayuda concreta (p. ej.
el de ayudas al alquiler). Fuera de la CM: el simulador del IMV (Seguridad Social),
también para una sola prestación.

| Web oficial | Requisito a Requisito |
|---|---|
| Tienes que saber qué buscar | Pregunta tu situación (≤ 10 preguntas o un evento vital) y dice qué te puede corresponder |
| Una administración por web | **Estado + Comunidad + Ayuntamiento en una sola respuesta** |
| Lees los requisitos y los interpretas | **Requisito a requisito:** cumples / no cumples / no se puede saber, con cita literal |
| «No cumples» o nada | **Qué te falta:** el dato que falta, el único requisito que falla o la fecha a partir de la que podrías cumplirlo |
| Una ficha por procedimiento | **Plan de acción:** importe total posible, documentos comunes, calendario |
| Convocatoria cerrada = desaparece | «Se convoca cada año; la última fue del X al Y» |
| Lenguaje administrativo | Lenguaje claro sin perder el texto oficial |

**Posicionamiento: complemento, no competidor.** Cada ayuda termina en su ficha de
la sede oficial, donde se solicita. El argumento principal ante este jurado:

> Requisito a Requisito demuestra un modelo reutilizable («rules as code»): las
> reglas de cada ayuda como **datos abiertos, verificables y citados**, que la propia
> Comunidad de Madrid, los ayuntamientos o las entidades sociales pueden reutilizar
> en sus servicios.

Encaja con **ecosistema (30 %)** y **escalabilidad (20 %)**, y con las líneas de
Rules as Code de la OCDE y de gobiernos como Nueva Zelanda, Australia (NSW) y
Francia (OpenFisca) (docs/04).

**Límites que se asumen en la memoria:** si la Administración lanzara un
orientador oficial, este perdería sentido como servicio, pero el modelo de reglas
abiertas seguiría siendo reutilizable. Dependemos de la corrección de las fuentes
oficiales (de ahí la revisión diaria, F9). El resultado es siempre orientativo.

**Tono obligatorio:** nunca criticar a la Administración ni a su web; describir los
hechos («catálogo de 848 procedimientos») y presentar el proyecto como un
complemento que lleva a la ciudadanía hasta la sede.
