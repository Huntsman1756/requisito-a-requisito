# Memoria descriptiva — Requisito a Requisito

**Premios Global Tech Leaders Awards 2026 · Orden 566/2026 · Global Tech Impact**
Titular: Daniel — persona física, titular y responsable directo.
Demo en producción: https://huntsman1756.github.io/requisito-a-requisito/

---

## 1. Resumen

Las ayudas públicas existen pero no llegan: están dispersas entre Estado,
Comunidad y ayuntamientos, escritas en lenguaje administrativo y con plazos que
se pierden. **Requisito a Requisito** convierte la norma en una conversación de
≤ 10 preguntas y devuelve, para cada ayuda, qué requisito cumples, cuál no,
cuál no se puede saber y **qué te falta** — con la fuente oficial enlazada en
cada afirmación.

Números medidos (evidencia en el repositorio): **50 programas** comprobados
requisito a requisito (52 RuleSets) · **166 fuentes oficiales registradas**
(145 citadas en el bundle) · **421 programas**
del universo de Madrid clasificados aptos para personas · **527 pruebas** automáticas en verde ·
**155 enlaces** del producto verificados el 8/10 · el perfil **nunca sale del
navegador**.

## 2. El problema

En España conviven tres administraciones que publican ayudas a personas. Quien
busca apoyo debe saber que existe una ayuda, encontrar su norma, leer requisitos
largos y decidir si merece la pena pedirla. El resultado es el fenómeno
documentado de *non take-up*: derechos que no se ejercen por desconocimiento o
por coste de comprensión.

Las webs oficiales informan pero no orientan: el usuario debe evaluar su
situación por sí mismo, artículo a artículo. Requisito a Requisito hace la
lectura por él y le lleva directamente al simulador o a la sede oficial.

## 3. La iniciativa

Un asistente estático (sin servidor, sin cuentas, sin registro) que:

1. Pregunta lo mínimo (≤ 10 preguntas, con «No lo sé» y «Prefiero no decirlo»).
2. Evalúa **50 ayudas comprobadas** y 401 fichas del catálogo en nivel 2.
3. Responde por ayuda: qué requisitos cumples (✓), cuáles no (✗), cuáles no se
   pueden saber sin más datos (?) y cuáles quedan fuera de alcance del
   cuestionario (⚠).
4. Distingue tres resultados honestos: **encaja**, **posible** (falta un dato
   o una condición del trámite) y **no cumple** — nunca afirma lo que no sabe.
5. Muestra la matriz requisito a requisito por dimensiones del perfil, un plan
   de acción con documentos agrupados y calendario descargable, y el
   **simulador oficial** como acción primaria donde existe.
6. Enlaza cada afirmación a su fuente oficial con extracto literal y huella.

Las reglas son **datos abiertos reutilizables** (`data/eligibility/rules/*.json`,
esquema JSON Schema público): otra administración u ONG puede cargarlas y
reusar el motor sin depender de este producto.

## 4. Impacto y resultados (50 %)

### Medido (con evidencia)

- **50 programas verificados** en el nivel 1 (52 RuleSets: la dependencia
  tiene versión vigente y futura) tras autor ⇒ verificador
  independiente ⇒ corrección ⇒ merge ⇒ despliegue (ADR-040): 18 del Estado,
  24 de la Comunidad de Madrid y 8 municipales (Madrid, Móstoles, Leganés y
  Fuenlabrada). De las 10 olas, el verificador detectó y se corrigieron: un
  nombre de programa que no existe en Madrid («Beca 6000» es andaluza →
  renombrada al programa real de la CM), la RAI incluida aunque está
  **derogada desde 01/11/2024** (retirada del nivel 1, documentada en el
  universo), 3 falsos negativos de la ola 4 corregidos antes de publicar,
  dos códigos INE municipales erróneos en la ola 8 y una convocatoria que
  la sede seguía mostrando «en plazo» pese a estar cerrada por el BOCM
  (ola 10: prima el boletín). El sistema se
  autoprotege: una regla defectuosa no llega a producción.
- **421 programas** del universo de Madrid clasificados como aptos para
  persona física (779 descartados con motivo documentado: ayudas a
  entidades o empleadores, avisos administrativos; descubrimiento: sede
  CM, BDNS, pipeline BOCM, semilla de permanentes). **401 fichas**
  publicadas en el nivel 2 con su estado de acceso — las cerradas se
  muestran como «Cerrada» y los programas con regla propia se deduplican
  por URL oficial.
- **166 fuentes oficiales registradas** (145 citadas en el bundle); cada
  extracto lleva `excerptSha256`
  verificado contra el texto normalizado de la fuente.
- **527 pruebas** automáticas en verde. Firefox y WebKit completaron las
  pruebas E2E en CI sobre el build normal (run 37823319781); su ejecución
  sobre la release estricta sigue pendiente **[14/10 — actualizar tras
  e2e-browsers mode: strict]**. La matriz local cubre Chromium,
  móvil, tablet, reflow 320 px, oscuro, contraste forzado y movimiento reducido.
- **155 URLs** del bundle verificadas el 8/10 (link-check, 0 fallidas).
- **Auditoría de fiabilidad (8/10)**: se midió la web como producto, no solo
  el motor: vigencia de plazos contra la fecha, frescura de fuentes, muestra
  determinista de 40 fichas del nivel 2 contrastada con su sede, parámetros
  vigentes y privacidad en producción. Encontró un **fallo bloqueante** —el
  asistente no cargaba datos en Pages por el prefijo de ruta— corregido y
  reverificado el mismo día, junto a tarjetas «no cumple» que ahora muestran
  el requisito fallado con su cita literal. Veredicto documentado:
  **«fiable»** (`evidence/2026-10-08-F10/fiabilidad.md`).
- **Release verificable**: la versión para el jurado solo incluye reglas con
  aprobación humana registrada (`--strict`, ADR-050). El ensayo en copia
  local demuestra: sin aprobaciones, el build sale **vacío** (0 de 52) en
  lugar de vender lo no revisado; con marcas **simuladas en copia** y aplicadas
  por la herramienta real `review:apply`, las 52 pasan. Las hojas reales
  siguen pendientes de Daniel **[14/10 — actualizar con el recuento real
  de aprobadas]**. El cierre es un
  gate que falla cerrado.
- **Mutación dirigida**: 238 mutantes de las reglas (umbral ±1, dureza
  invertida) — **0 supervivientes** sin explicar; y barrido exhaustivo de
  175.451 perfiles sin violación de invariantes, monotonía ni determinismo
  (`eligibility:mutate` / `eligibility:exhaustive`).
- **axe**: 0 violaciones serious/critical en las 5 páginas públicas × 9
  proyectos, tras corregir un contraste del CTA en modo oscuro.

### Capacidad implementada (no medida aún)

- Privacidad por diseño: el perfil vive en el navegador; no hay telemetría ni
  envío. El job diario de frescura (F9) re-descarga cada día las normas
  oficiales, compara extractos y retira automáticamente la regla afectada
  si la fuente cambia — nunca reescribe una regla. Las páginas de las sedes
  electrónicas que bloquean el acceso automatizado (45 de las 166 fuentes
  registradas)
  se revalidan periódicamente en una corrida local con la misma regla
  fail-closed; el Observatorio muestra los recuentos reales de cada ciclo.
- **Detección real (6/10/2026)**: el job marcó cambiada la Ley 39/2006 de
  Dependencia tras la publicación de la Ley 4/2026 (BOE-A-2026-20528) —
  9 extractos citados ya no existían en el texto consolidado. Las 2 ayudas
  afectadas se retiraron del listado sin intervención humana, se documentó
  qué cambió en sustancia (no solo citas: parentesco, incompatibilidades,
  plazo suspensivo) y se re-autorizaron contra la nueva redacción el mismo
  día (evidencia en `evidence/2026-10-06-F9/` y `-F3/verificacion-ola-9.md`).
- **Vigencia de la redacción (R8-VIG)**: la reforma está publicada pero
  entra en vigor el 23/10/2026 — el sistema no puede mostrar la norma
  futura como vigente. Cada regla admite `validFrom`/`validUntil`, el motor
  elige la única versión vigente en la fecha de consulta (y si no hay
  exactamente una, la ayuda dice «No podemos evaluar»), y las fichas de las
  dos ayudas de dependencia muestran hoy la redacción anterior con el aviso
  «Esta ayuda cambia el 23 de octubre de 2026 (Ley 4/2026)» enlazando ambos
  textos. La invariante I11 lo comprueba antes de cada veredicto
  (`verificacion-r8vig.md`, tests de frontera 22/23 de octubre).
- Panel de revisión multimodelo implementado (extracción de ítems, prompt
  versionado, agregación determinista, caché por huella, límite de
  concurrencia y de llamadas por minuto), **calibrado con errores
  inyectados antes de confiar en él y descartado al no superar la
  calibración**:
  - **v1**, sobre un conjunto determinista de 311 casos (mutantes de reglas
    verificadas, controles y casos históricos): detectó el **99,1 %** de los
    errores, pero dio **97,7 % de falsas alarmas** sobre los controles,
    cuando el umbral es del 20 % (`evidence/2026-10-06-panel/calibracion.md`).
  - **v2**, con un prompt corregido, sobre los 327 casos que escalaron en la
    v1: **94,0 %** de detección, **91,8 %** en mutantes de falso positivo y
    **75,0 %** de falsas alarmas (`evidence/2026-10-06-panel-v2/calibracion.md`).
  - Reagregando offline esos mismos veredictos, **ninguna regla de agregación
    cumple a la vez los tres umbrales** (`agregacion-alternativas.md`).
  - **Decisión (ADR-050):** el panel no aprueba ninguna regla. El criterio no
    se relaja. La revisión final de las reglas es humana, por muestreo de
    cada ola (ADR-040).

  Medir un control automático y descartarlo cuando no alcanza el nivel exigido
  forma parte del método. Por eso este resultado negativo se incluye aquí.

### Piloto

[PILOTO — pendiente de las sesiones de Daniel; nada que inventar aquí]

Kit de sesión ya preparado (`evidence/2026-10-06-F8/kit/`): guion con tarea
medida («encuentra una ayuda para tu situación y dime qué requisito no sabes
si cumples», con tiempo y si la completa sola), contraste opcional de 3
minutos con la web oficial y escala de comprensión 1–5; hoja de observación
sin datos personales, consentimiento y mensaje de difusión. Los agregados
(`scripts/piloto-agregados.ts` → `piloto.json`) darán medianas y absolutos —
nunca porcentajes con n<10.

## 5. Contribución al ecosistema (30 %)

- **Datos abiertos**: reglas, esquema, catálogo de fuentes y universo en
  `data/` bajo repositorio público con licencia abierta.
- **Motor reutilizable**: `src/lib/eligibility-engine` es agnóstico al
  territorio; otra comunidad puede alimentar el mismo esquema.
- **Reglas como código (Rules as Code)**: cada requisito lleva cita literal,
  huella y procedencia, alineado con OpenFisca y las prácticas RaC.
- **Job de frescura abierto**: `.github/workflows/freshness.yml` revalida las
  normas cada día (las páginas de sedes, en un ciclo periódico local) y abre
  issues si cambian; el Observatorio publica las cifras de cada corrida.

## 6. Escalabilidad (20 %)

- Sin servidor: exportación estática; el coste marginal por usuario es ~0.
- El coste medido por regla nueva: una ola de 5 autores en paralelo + verificador
  produce ~5 reglas/día; la verificación automática de extractos reduce el
  coste de revisión a los desacuerdos.
- Extensible por vertical (vivienda, empleo, dependencia) y por territorio:
  las olas 7–8 ya incorporan programas de cuatro ayuntamientos (Madrid,
  Móstoles, Leganés y Fuenlabrada).

## 7. Garantías

- **Rules as code, no texto libre**: la evaluación la hace un motor
  determinista; ningún modelo de IA decide ni redacta una respuesta.
- **Sin fuente oficial no hay afirmación**: una afirmación sin cita falla en la
  build (G4/G11).
- **UNKNOWN ≠ NO**: lo que no se puede saber se muestra como «falta un dato»,
  nunca como «no cumple».
- **El perfil no sale del navegador**: sin cookies de perfil, sin telemetría,
  sin cuentas.
- **Transparencia**: el Observatorio público muestra cobertura, estados,
  fuentes y la última verificación.

## 8. Titular

Daniel — persona física; titular y responsable directo del proyecto.

## Anexos

- Demo: https://huntsman1756.github.io/requisito-a-requisito/
- Capturas: `evidence/2026-10-05-F4/capturas-art/` y `capturas-v3/`
- Inventario del universo: `evidence/2026-10-05-universo/informe.md`
- Kit de piloto: `evidence/2026-10-06-F8/kit/`
- Informe QA: `evidence/2026-10-06-F5/qa-report.md`
- Hojas de verificación por ola: `evidence/2026-10-05-F3/verificacion-ola-*.md`
  y `evidence/2026-10-06-F3/verificacion-ola-7.md`, `verificacion-ola-8.md`

---

*Cada cifra de esta memoria remite a una entrada de `evidence/` o a un artefacto
del repositorio (ver `veracidad.json`). Ninguna afirmación usa métricas que no
están medidas.*
