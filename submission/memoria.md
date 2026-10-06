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

Números medidos (evidencia en el repositorio): **35 ayudas** comprobadas
requisito a requisito · **127 fuentes oficiales** verificadas · **653 programas**
del universo de Madrid catalogados · **253 pruebas** automáticas en verde ·
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
2. Evalúa **35 ayudas comprobadas** y 653 fichas del catálogo.
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

- **35 reglas verificadas** en el nivel 1 tras autor ⇒ verificador
  independiente ⇒ corrección ⇒ merge ⇒ despliegue (ADR-040). De las 6 olas,
  el verificador detectó y se corrigieron: un nombre de programa que no existe
  en Madrid («Beca 6000» es andaluza → renombrada al programa real de la CM),
  la RAI incluida aunque está **derogada desde 01/11/2024** (retirada del nivel
  1, documentada en el universo), y 3 falsos negativos de la ola 4 corregidos
  antes de publicar. El sistema se autoprotege: una regla defectuosa no llega
  a producción.
- **653 programas** del universo de Madrid catalogados y clasificados
  (descubrimiento: sede CM, BDNS, pipeline BOCM, semilla de permanentes);
  387 fichas útiles en el nivel 2.
- **127 fuentes oficiales** citadas; cada extracto lleva `excerptSha256`
  verificado contra el texto normalizado de la fuente.
- **253 pruebas** automáticas en verde; suite E2E en 9 proyectos (Chromium,
  WebKit, móvil, tablet, reflow 320 px, oscuro, contraste forzado, movimiento
  reducido). El navegador Firefox no arranca en este equipo (limitación
  documentada del entorno, no del producto).
- **114 URLs** del bundle verificadas (link-check, 0 fallidas).
- **axe**: 0 violaciones serious/critical en las 5 páginas públicas × 9
  proyectos, tras corregir un contraste del CTA en modo oscuro.

### Capacidad implementada (no medida aún)

- Privacidad por diseño: el perfil vive en el navegador; no hay telemetría ni
  envío. El job diario de frescura (F9) re-descarga cada fuente, compara
  extractos y retira automáticamente la regla afectada si la fuente cambia —
  nunca reescribe una regla.
- Panel de revisión multimodelo ya implementado (extracción de ítems, prompt
  versionado, agregación determinista, caché por huella); las llamadas reales
  esperan la clave `NAN_API_KEY`.

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
  fuentes cada día y abre issues si cambian.

## 6. Escalabilidad (20 %)

- Sin servidor: exportación estática; el coste marginal por usuario es ~0.
- El coste medido por regla nueva: una ola de 5 autores en paralelo + verificador
  produce ~5 reglas/día; la verificación automática de extractos reduce el
  coste de revisión a los desacuerdos.
- Extensible por vertical (vivienda, empleo, dependencia) y por territorio:
  la ola 7 ya incorpora programas del **Ayuntamiento de Madrid**.

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

---

*Cada cifra de esta memoria remite a una entrada de `evidence/` o a un artefacto
del repositorio (ver `veracidad.json`). Ninguna afirmación usa métricas que no
están medidas.*
