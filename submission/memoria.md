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

Números medidos (evidencia en el repositorio): **50 ayudas** comprobadas
requisito a requisito · **167 fuentes oficiales** verificadas · **656 programas**
del universo de Madrid catalogados · **288 pruebas** automáticas en verde ·
**114 enlaces** del producto verificados el 6/10 · el perfil **nunca sale del
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
2. Evalúa **50 ayudas comprobadas** y 74 fichas del catálogo en nivel 2.
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

- **50 reglas verificadas** en el nivel 1 tras autor ⇒ verificador
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
- **656 programas** del universo de Madrid catalogados y clasificados
  (descubrimiento: sede CM, BDNS, pipeline BOCM, semilla de permanentes);
  74 fichas útiles en el nivel 2 (los programas con regla propia se
  deduplican por URL oficial).
- **167 fuentes oficiales** citadas; cada extracto lleva `excerptSha256`
  verificado contra el texto normalizado de la fuente.
- **288 pruebas** automáticas en verde; suite E2E en 9 proyectos (Chromium,
  WebKit, móvil, tablet, reflow 320 px, oscuro, contraste forzado, movimiento
  reducido). El navegador Firefox no arranca en este equipo (limitación
  documentada del entorno, no del producto).
- **114 URLs** del bundle verificadas (link-check, 0 fallidas).
- **axe**: 0 violaciones serious/critical en las 5 páginas públicas × 9
  proyectos, tras corregir un contraste del CTA en modo oscuro.

### Capacidad implementada (no medida aún)

- Privacidad por diseño: el perfil vive en el navegador; no hay telemetría ni
  envío. El job diario de frescura (F9) re-descarga cada día las normas
  oficiales, compara extractos y retira automáticamente la regla afectada
  si la fuente cambia — nunca reescribe una regla. Las páginas de las sedes
  electrónicas que bloquean el acceso automatizado (40 de las 167 fuentes)
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
  concurrencia y de llamadas por minuto): **calibración v1 completada**
  sobre un conjunto determinista de 311 casos (mutantes de reglas
  verificadas, controles y casos históricos): detección del **99,1 %** y
  **100 %** en mutantes de falso positivo, pero **97,7 % de falsas alarmas**
  sobre controles — fuera del umbral del 20 % (informe
  `evidence/2026-10-06-panel/calibracion.md`). El análisis separa dos
  causas: ítems de completitud sin material suficiente para juzgar
  (`cannot_tell`, corregido en panel-v2) y **defectos reales de modelado**
  que el panel detecta legítimamente (por ejemplo, exigir un umbral donde
  la norma no lo fija). El panel no se ejecuta sobre las reglas ni se
  escribe `panelReview` hasta que la calibración sea aceptada por el
  revisor.

### Piloto (en curso, 10–13/10)

Kit de sesión preparado (`evidence/2026-10-06-F8/kit/`): guion de 10 min, hoja
de observación sin datos personales, texto de consentimiento y mensaje de
difusión. El objetivo son 3–10 sesiones observadas con personas reales de
Madrid; los resultados se consolidarán en `piloto.json` antes de la entrega.

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
