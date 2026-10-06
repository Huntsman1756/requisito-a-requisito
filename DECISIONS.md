# Decisiones (ADR cortos)

Formato: `ADR-NNN — título` · fecha · estado (propuesta/aceptada/sustituida) ·
contexto · decisión · consecuencias. Añadir al final; no reescribir las aceptadas.

## ADR-001 — Fecha límite 16/10/2026
2026-10-05 · aceptada · La sede (02/10) y la Orden (15 días naturales) fijan 16/10;
la prensa dice 18/10. Se usa 16/10; objetivo interno 14/10, presentación 15/10.

## ADR-002 — No crear proyecto nuevo; evolucionar la-ayuda
2026-10-05 · aceptada · Impact pondera 50% impacto demostrado; un proyecto de diez
días no lo tiene. Se evoluciona `la-ayuda` con el motor de EduAyudas y el modelo
probatorio de Renta Verificable. Sin fusión de repos.

## ADR-003 — Sin LLM en el producto de esta entrega
2026-10-05 · aceptada · Explicaciones por plantillas deterministas. Motivos: plazo,
riesgo jurídico, contrato de la-ayuda («model output is never publication
authority») y coherencia del mensaje (rules-as-code). Un LLM explicativo queda
como trabajo futuro con restricción de no añadir hechos.

## ADR-004 — Vertical familias/educación, sin fichas fiscales
2026-10-05 · aceptada · Es donde EduAyudas aporta modelo de reglas y evita las
fichas fiscales afectadas por la auditoría del 27/09/2026. Mínimo viable 8 fichas.

## ADR-005 — Una sola categoría; plan A Impact, plan B Leader
2026-10-05 · propuesta · Pendiente de la consulta (F0-2) y del inventario de
impacto (F0-3). Si el 13/10 no hay respuesta, decide Daniel.

## ADR-006 — Vehículo de impacto: la-ayuda sola o ecosistema La Ayuda + EduBecas
2026-10-05 · propuesta · la-ayuda no tiene dominio público ni deploy (strict rojo);
edubecas.es está vivo. Se decide tras F0-3 con cifras medidas.

## ADR-007 — El perfil del ciudadano no sale del navegador
2026-10-05 · aceptada · Export estático, evaluación en cliente, telemetría sin
respuestas ni hashes de perfil. Test Playwright de red lo garantiza.

## ADR-008 — «Qué te falta» como función central, con elegibilidad futura acotada
2026-10-05 · aceptada · Es el diferenciador de la visión del producto. Tres
mensajes deterministas (faltan datos / cumples todo salvo X / podrías a partir de
fecha). Solo se promete fecha cuando el cambio depende del calendario (edad,
antigüedad de empadronamiento) y cae dentro del plazo; nunca por ingresos o
situación laboral.

## ADR-009 — Esfuerzo como estimación propia etiquetada
2026-10-05 · aceptada · Las fuentes oficiales casi nunca dan tiempo de
solicitud. Se muestra «estimación de La Ayuda» con fórmula versionada sobre
campos de la ficha y calibrada con solicitudes cronometradas; nunca como dato
oficial. `total_budget` nunca se presenta como importe por persona.

## ADR-010 — Sin dependencias nuevas
2026-10-05 · aceptada · Se usan las de la-ayuda (Next, React, Zod, pdfjs-dist,
Vitest, Playwright, axe, Biome). Las pruebas exhaustivas usan un generador propio
(sin fast-check). Una dependencia nueva requiere autorización de Daniel.

## ADR-011 — Sin backend en tiempo de ejecución
2026-10-05 · aceptada · El «back» es el pipeline de build. La evaluación ocurre en
el navegador sobre un bundle estático con digest. Garantiza privacidad, coste ~0 y
escala sin servidor.

## ADR-012 — Lógica trivalente (Kleene) sobre intervalos
2026-10-05 · aceptada · Las respuestas imprecisas (bandas, mes/año, CCAA sin
municipio) son intervalos o jerarquías. El motor devuelve T/F/U, nunca convierte
incertidumbre en «no». Se garantiza monotonía por test exhaustivo.

## ADR-013 — Parámetros con vigencia (patrón OpenFisca)
2026-10-05 · aceptada · IPREM, SMI y umbrales reutilizables viven en
`parameters.json` con periodos y cita; las reglas los referencian.

## ADR-014 — Reglas como datos abiertos
2026-10-05 · aceptada · RuleSets, parámetros y catálogo de preguntas se publican
en el export estático con licencia y manifiesto. Argumento central del criterio
de ecosistema.

## ADR-015 — Segunda implementación independiente del veredicto
2026-10-05 · aceptada · `verdict-oracle.ts` se escribe aparte y se compara en todo
el espacio exhaustivo y en el navegador (I2). Coste bajo; protege la parte de la
que depende la confianza.

## ADR-007 (revisión 2026-10-05) — Privacidad sobre el contrato existente
2026-10-05 · aceptada · Sustituye el detalle de persistencia del ADR-007 original:
se usa `la-ayuda/src/lib/user-state.ts` (campos sensibles fuera de la URL, handoff
en `sessionStorage`, perfil en `localStorage` solo con consentimiento). Los campos
nuevos se añaden a `SENSITIVE_FIELDS`. El share hash no se habilita para el
orientador. Sigue vigente: el perfil nunca sale del navegador.

## ADR-016 — Dos niveles de resultados: comprobadas vs relacionadas
2026-10-05 · aceptada · la-ayuda ya tiene un ranking heurístico (`rankBenefits`).
Se conserva como nivel 2 («También podrían interesarte — no hemos comprobado los
requisitos») sin etiquetas de cumplimiento. El nivel 1 es exclusivo del motor con
RuleSets aprobados. Da utilidad más allá del vertical sin aparentar más rigor.

## ADR-017 — Asimetría de errores: evitar falsos negativos
2026-10-05 · aceptada · Decir «no te aplica» a quien sí cumple desanima a pedir la
ayuda (problema de non take-up). `F` solo con un valor respondido y una regla sin
ambigüedad. Los requisitos discutibles van a ⚠ `uncovered`. `no_cumple` siempre
visible (plegado), con el motivo y la invitación a consultar la fuente.

## ADR-018 — Enlazar simuladores oficiales en vez de competir
2026-10-05 · aceptada · Si el organismo ofrece un simulador o comprobador oficial
(p. ej. el del IMV), es la acción principal de la tarjeta (`application.officialSimulator`).

## ADR-019 — Vías alternativas y excepciones explícitas (patrón Catala)
2026-10-05 · aceptada · Los nodos `any/all/not` y las hojas admiten `label` +
`citation`. El resultado indica la vía por la que se cumple; `missing` propone la
vía con menos datos pendientes. La revisión humana se hace sobre una tabla de
decisión legible generada desde el exhaustivo (patrón CUTECat).

## ADR-020 — «Autoridad vigente» en main = `status=active && reviewStatus=revisada`
2026-10-05 · propuesta · El AGENTS.md de `F:\_Proyectos\la-ayuda` describe el
ledger `data/pipeline/authority/publication-ledger.jsonl` y `pipeline:authority
--strict`, pero **no existen en `main` (63ad635b)**; viven en la rama
`integrate/autonomous-pipeline`, que no es la base indicada. En `main` el gate
editorial vigente es `status=active && reviewStatus=revisada`, reforzado por
`tests/content-governance.test.ts` (citación documental obligatoria en fichas
`revisada`). Se usa ese gate para F0-5/F3 y se documenta como desviación D3
(condición de contorno, no rebaja de rigor). Si Daniel prefiere basar el
worktree en `integrate/autonomous-pipeline`, la rama se recrea.

## ADR-021 — Ámbito: Comunidad de Madrid
2026-10-05 · aceptada (Daniel) · El premio es de la Comunidad de Madrid. El
orientador cubre ayudas autonómicas y municipales de la CM y las estatales que
puede solicitar un residente en Madrid. Sustituye en parte al ADR-004: «familias
y educación» pasa a ser prioridad dentro del ámbito Madrid, no el criterio de
ámbito. El inventario de F0-5 (16 candidatas, solo 1 de Madrid) se rehace (F0-5b).
La pregunta de territorio se simplifica: municipio de la CM, sin selector de CCAA,
y las ayudas de otras comunidades quedan fuera del bundle y del nivel 2.

## ADR-006 (propuesta actualizada) — Vehículo
2026-10-05 · propuesta · Search Console de edubecas.es muestra 1 clic en 75 días:
no aporta tracción. Propuesta: presentar la-ayuda sola; EduBecas se menciona como
trabajo previo propio. Pendiente de que Daniel confirme (D-1).

## ADR-022 — Proyecto nuevo e independiente, solo Madrid, para este concurso
2026-10-05 · aceptada (Daniel) · **Sustituye ADR-002 y ADR-006.** El producto es un
proyecto nuevo que vive en este mismo repo (`F:\_Proyectos\datawardsmadrid`, que
pasa de centro de mando a repo del producto + candidatura). No se modifican
la-ayuda ni EduAyudas: son donantes de solo lectura (docs/13). Consecuencias:
- Se abandona el worktree `F:\AgentState\worktrees\la-ayuda\premio-gtl`: **se
  conserva** (no se borra) y su commit `6595a533` (Zod) se porta aquí.
- Se elimina la dependencia de los gates editoriales de la-ayuda (ledger/strict).
  La autoridad aquí = gates propios de citas (G1–G10) + revisión humana.
- El despliegue ya no está bloqueado por la deuda legacy de la-ayuda (ADR-025).
- Impacto: un proyecto nuevo no tiene uso histórico. La memoria lo presenta como
  piloto, con la trayectoria y el código propios como base. Esto refuerza la
  preferencia por Leader (D-5), pendiente de la consulta.
- ADR-016 (dos niveles) se mantiene: el nivel 2 sale del catálogo importado con un
  ranking portado. ADR-007 (revisión) se mantiene sobre una **copia** propia de
  `user-state.ts`. ADR-010 se lee como «el mismo conjunto de dependencias que
  la-ayuda, nada más».

## ADR-023 — Catálogo importado con procedencia; importar no es aprobar
2026-10-05 · aceptada · `scripts/import-donor-catalog.ts` lee la-ayuda en un commit
fijado (`git show`), filtra Madrid + estatales, `active && revisada` y sin
`tax_deduction`, y escribe JSON normalizado + `provenance.json` (commit, ruta,
sha256). Lo importado solo alimenta el nivel 2; el nivel 1 exige un RuleSet propio
aprobado.

## ADR-024 — Idioma: español (inglés como Should)
2026-10-05 · aceptada · Ámbito Madrid: se elimina el requisito de 5 locales. `es`
obligatorio; `en` solo si sobra tiempo (residentes internacionales).

## ADR-025 — Repo propio público y despliegue independiente
2026-10-05 · propuesta · Repo nuevo en GitHub, **público desde el primer push**
(sin historial heredado que auditar), con licencia MIT para el código y licencia
abierta para los datos de reglas (verificar la compatibilidad con las fuentes).
Demo desplegable en un vhost propio. Requiere autorización de Daniel para crear
el repo remoto, hacer push y desplegar (D-4, D-3).

## ADR-026 — Candidato: persona física
2026-10-05 · aceptada (Daniel) · Daniel se presenta como persona física, titular y
responsable directo del proyecto (art. 5.1 y 6 de la Orden). No se constituirá
ninguna entidad. La categoría sigue pendiente de la consulta (F0-2) y de D-5.

## ADR-027 — Orden de preferencia de categoría y regla por defecto
2026-10-05 · aceptada (Daniel) · Preferencia: **Impact** (mejor encaje temático:
acceso a ayudas, non take-up) si la Subdirección confirma que una persona física
puede concurrir. AI & Emerging se descarta como primera opción: el producto evita
la IA a propósito (ADR-003) y su criterio principal es la innovación tecnológica.
**Si el 12/10 no hay respuesta, o es negativa ⇒ Leader.** El producto es el mismo
en los tres casos; solo cambia la memoria (docs/05 tiene los esqueletos A y B).

## ADR-028 — Categoría: Global Tech Impact
2026-10-05 · aceptada (Daniel) · La Subdirección de Sociedad y Economía Digital
confirma por correo que una persona física puede concurrir a Impact si lidera o
impulsa una iniciativa tecnológica con impacto social
(`evidence/2026-10-05-consulta/`). Por ADR-027 ⇒ **Impact**. Cierra D-5 y D-2.
Consecuencias: memoria con el esqueleto A (docs/05); nueva fase **F8 Piloto real**
para conseguir evidencia de impacto honesta; la demo desplegada y el repo público
pasan de Should a **Must** (sin ellos no hay piloto); suben de prioridad D-3, D-4
y D-6.

## ADR-029 — Nombre: «Requisito a Requisito»
2026-10-05 · aceptada (Daniel) · Lema: «Ayudas públicas en la Comunidad de Madrid,
comprobadas con la fuente oficial». No se usa el nombre ni el logotipo de la
Comunidad de Madrid como marca. Repo GitHub: `requisito-a-requisito`.

## ADR-030 — Piloto desplegado en GitHub Pages; dominio propio después
2026-10-05 · aceptada (autonomía delegada por Daniel) · Sustituye la opción VPS de
docs/11 para el piloto. Motivos: export estático, cero coste, no toca el VPS de
edubecas.es, despliegue y rollback por Actions, y es coherente con el repo público
(ADR-025). URL: `https://huntsman1756.github.io/requisito-a-requisito/`
(`basePath` en next.config). Si el proyecto sale bien, Daniel compra un dominio y
se configura como custom domain de Pages. Limitación aceptada: Pages no permite
cabeceras HTTP propias ⇒ CSP mediante `<meta http-equiv>` (sin `frame-ancestors`);
HTTPS lo pone Pages.

## ADR-031 — Job diario de frescura hasta el 05/11/2026
2026-10-05 · aceptada · GitHub Actions diario: revalida las fuentes citadas, marca
como `stale` las reglas cuya cita ya no aparece, descubre convocatorias nuevas de
la CM como **pistas** (issues, sin publicar), recompila y despliega solo si pasan
los gates (fail-closed). Detalle: phases/F9. Los plazos los calcula el navegador
cada día.

## ADR-032 — Sin contador de uso (D-7)
2026-10-05 · aceptada (autonomía) · GitHub Pages no tiene backend y cualquier
contador implicaría un tercero o un servidor. Se mantiene la privacidad estricta.
El impacto del piloto se mide con sesiones observadas, testimonios con permiso y
respuestas de entidades (phases/F8). Se puede reconsiderar con dominio propio.

## ADR-033 — Cobertura de tests (D-8)
2026-10-05 · aceptada (autonomía) · Se autoriza `@vitest/coverage-v8` como
devDependency con la versión alineada con vitest. Puerta F2: ≥ 95 % de líneas y
ramas en `src/lib/eligibility-engine/`.

## ADR-034 — Gate G11: requisitos, umbrales e importes solo de fuentes de rango 1–2
2026-10-05 · aceptada · Detectado en el lote 1: el descuento de Renfe y el subsidio
de mayores de 52 citaban webs de rango 3 (renfe.com, sepe.es) para requisitos e
importes. Nuevo gate fail-closed: la `citation` de todo `requirement`, `amount`,
umbral y `referenceDate` debe apuntar a una fuente de **rango 1 o 2**. El rango 3
solo vale para `channel`, `documents`, `officialSimulator` y el estado operativo
del plazo. Test negativo obligatorio.

## ADR-035 — Vigencia normativa: modificaciones y disposiciones transitorias
2026-10-05 · aceptada · Antes de citar un importe o un porcentaje de una norma
modificada con frecuencia (p. ej. el bono social eléctrico, RD 897/2017), se
revisa en el BOE la sección «Análisis → Posteriores» de la norma y las
disposiciones de los reales decretos-ley que fijen valores **temporales** vigentes
a `referenceDate`. Si no se puede determinar con certeza el valor vigente ⇒
`amount` sin cifra (variable) + ⚠, y nunca un número dudoso. Los avisos de
discrepancia al donante (la-ayuda) solo se registran tras esta comprobación.

## ADR-036 — Autonomía delegada (2026-10-05)
2026-10-05 · aceptada (Daniel: «tienes total autonomía para decidir cómo realizar
todo el proyecto») · Quedan cerradas por delegación D-3 (despliegue en Pages),
D-4 (repo público `requisito-a-requisito` y push), D-6 (nombre; dominio después),
D-7 y D-8. **Siguen reservados a Daniel:** revisión de los lotes de reglas y de
las personas golden (G10; formato ligero), contactos y sesiones del piloto,
revisión final de la memoria, firma y presentación, y cualquier gasto (dominio).
Los agentes no envían correos ni contactan con terceros en nombre de Daniel.

## ADR-037 — Bono social eléctrico: 42,5 % / 57,5 % en 2026 (verificado)
2026-10-05 · aceptada · Contrastado por Claude: el RDL 7/2026, de 20 de marzo (BOE
del 21/03/2026), fija descuentos excepcionales del 42,5 % (vulnerable) y del 57,5 %
(vulnerable severo) del 1 de enero al 31 de diciembre de 2026. El texto
consolidado del RD 897/2017 (35 % / 50 %) solo rige cuando acaba la prórroga.
El catálogo donante era correcto. Caso de ejemplo de ADR-035 para la memoria
(«el sistema obliga a comprobar la vigencia temporal»). **El job F9 debe vigilar
este RuleSet a partir del 01/01/2027.**

## ADR-038 — Unidad = programa; estado CLOSED_RECURRING
2026-10-05 · aceptada · El corpus ingerido está centrado en convocatorias: de las
49 fichas activas de Madrid, 44 están cerradas. El producto pasa a centrarse en
**programas** (permanentes y recurrentes) más las convocatorias abiertas. Nuevo
estado `CLOSED_RECURRING`, solo con ≥ 2 convocatorias anuales consecutivas citadas
(`previousCalls`); muestra la última ventana y una fecha orientativa «aprox.».
Esquemas actualizados (`previousCalls`, `themes`, `lifeEvents`).

## ADR-039 — Descubrimiento del universo de Madrid
2026-10-05 · aceptada · Fuentes por prioridad: (1) buscador oficial de la sede de
la Comunidad de Madrid «Ayudas, becas y subvenciones» (rango 3 para descubrir,
canal y estado; requisitos de la norma BOCM enlazada); (2) API pública de la BDNS
(región 25 y beneficiario persona física, id 1; 118 convocatorias en 2026); (3)
BOCM del pipeline de la-ayuda (529 candidatos) y su catálogo; (4) sede del
Ayuntamiento de Madrid y de los municipios grandes; (5) lista semilla de
prestaciones permanentes estatales y de la CM (docs/14 §3). Lectura del VPS de
official-sources solo en modo `readonly`. Salida: `data/universe/programs.json`.

## ADR-040 — Producción de reglas en oleadas paralelas con verificador
2026-10-05 · aceptada · Oleadas de 5 programas, con varios agentes en worktrees
`F:\AgentState\worktrees\datawardsmadrid\ola-<n>`. Un verificador independiente
por oleada comprueba citas, umbrales, G11 y vigencia. Daniel aprueba la oleada ya
verificada **por muestreo** (2 de 5; cualquier KO ⇒ revisión completa). Objetivo:
30–40 programas en el nivel 1 (mínimo 20) y todo el universo apto en el nivel 2.

## ADR-041 — Funcionalidades ampliadas
2026-10-05 · aceptada · docs/15: Must = ejemplos en portada, eventos vitales,
matriz requisito a requisito, plan de acción (valor, documentos agrupados,
calendario .ics, imprimir), Observatorio, estado de acceso, simulador oficial
primero, identidad visual y explorar el catálogo. Should = reglas legibles, cita
en contexto, modo acompañante y paso a paso por ayuda. Inspiración: GOV.UK, USAGov
BEARS, Canada Benefits Finder, ACCESS NYC, MyFriendBen, grant-finder, Catala; sin
copiar código.

## ADR-042 — Política de dependencias (sustituye ADR-010)
2026-10-05 · aceptada · Se permite una dependencia nueva si ahorra más de medio
día, tiene licencia MIT/ISC/BSD/Apache-2.0, está mantenida, pesa ≤ 30 KB gzip en
cliente, no tiene telemetría ni llamadas de red y se registra en un ADR. Nunca
código AGPL/GPL copiado. (docs/15 §3)

## ADR-043 — Dirección de arte propia (sustituye al aspecto de la-ayuda)
2026-10-05 · aceptada y prototipo aprobado por Daniel («está genial») ·
Concepto «el expediente que se comprueba solo»: casillas de formulario oficial,
citas en mono, sello de verificación como único gesto audaz, colores por
administración competente, Atkinson Hyperlegible Next + IBM Plex. Sin rejillas de
tarjetas, sin fotos de stock; las imágenes son miniaturas de los documentos
oficiales citados. Fuente de verdad visual: `design/prototipo/requisito-a-requisito.html`.
Especificación: docs/16. Se conserva de la-ayuda solo la estructura técnica de los
tokens. Lucide (ISC) se admite si hace falta (ADR-042).

## ADR-044 — Qué reglas pueden ser públicas en el nivel 1 (gate G12)
2026-10-05 · aceptada · Hallazgo de la 4.ª revisión de Claude: las 21 reglas tienen
`humanReview: pending` y **todas se publican en el nivel 1** de la web, porque el
deploy de Pages usa el build no estricto (G10 solo bloquea con `--strict`). Además,
la ola 3 se integró y desplegó **antes** de su verificación independiente (no hay
`verificacion-ola-3.md`). Regla nueva:
- **G12 (bloquea siempre, también en Pages):** una regla solo entra en el bundle
  público si tiene `verification: { status: "ok", by, at, report }` con un informe
  existente en `evidence/`. Si no lo tiene ⇒ fuera del bundle (sigue en el repo).
- **Etiqueta honesta mientras falte G10:** las reglas verificadas pero sin
  aprobación de Daniel se muestran con «Comprobada con la fuente · revisión final
  pendiente». Con `approved` desaparece la segunda parte.
- **Release para el jurado (14/10):** build `--strict`; solo reglas `approved`.
  Lo que Daniel no apruebe a tiempo no aparece en la versión de la memoria.
- **Orden de integración:** autor ⇒ verificador ⇒ merge a main ⇒ deploy. Nunca se
  integra en main una ola sin su informe de verificación.

## ADR-044 (enmienda 2026-10-06) — Merge antes de verificar, protegido por G12
2026-10-06 · aceptada · La ola 5 se integró en main antes de su verificación. Como
G12 ya impide que llegue al bundle público, se **acepta** integrar en main antes
de verificar, siempre que G12 esté activo y el recibo de la ola lo diga. Lo que
sigue prohibido es que una regla sin `verification: ok` llegue a producción.

## ADR-045 — Vigencia del programa, no solo de los importes
2026-10-06 · aceptada · Hallazgo de la 5.ª revisión de Claude: la ola 6 incluía la
**Renta Activa de Inserción (RAI), derogada desde el 01/11/2024** por el RDL 2/2024
(no admite solicitudes nuevas; solo régimen transitorio para quien ya la tenía).
Regla: antes de escribir una regla, el autor comprueba en el BOE que **el programa
admite solicitudes nuevas** (derogaciones, «Análisis → Posteriores», disposiciones
transitorias). El verificador lo comprueba otra vez. Programas en régimen solo
transitorio ⇒ fuera del nivel 1; en el nivel 2, con la nota «No admite nuevas
solicitudes desde …». El universo (F0-U) marca `accessState: CLOSED` + `derogatedAt`.

## ADR-046 — Equilibrio por administración en el nivel 1
2026-10-06 · aceptada · De 31 reglas, ~17 son de la Comunidad, 14 del Estado y
**prácticamente ninguna municipal**. La promesa del producto es «Estado + Comunidad
+ Ayuntamiento en una sola respuesta», y el premio es de Madrid. Las olas
siguientes priorizan: (1) **Ayuntamiento de Madrid** (ayudas económicas de
especial necesidad o emergencia social, ayudas a familias, escuelas infantiles
municipales, becas municipales y ayudas a la vivienda del Ayuntamiento), (2)
municipios grandes (Móstoles, Alcalá, Fuenlabrada, Leganés, Getafe), (3) programas
de la CM aún sin regla (becas de FP, préstamo de libros (ACCEDE), discapacidad).
Las pensiones contributivas del Estado (jubilación, incapacidad permanente,
orfandad) aportan poco a un orientador, porque dependen de la vida laboral, que
no se pregunta: solo si sobra capacidad, y con las cotizaciones en ⚠.

## ADR-047 — Panel de revisión multimodelo (NAN) en lugar de revisión manual regla a regla
2026-10-06 · aceptada (Daniel: no puede revisar cada regla; propone usar NAN, que ya
paga) · Tres modelos de familias distintas (`deepseek-v4-flash`, `qwen3.8-flash`,
`mimo-v2.6-flash`; `gemma4` de desempate; nada de `glm*`) revisan cada requisito
con una tarea cerrada: ¿la condición codificada dice lo mismo que el extracto
literal (ya garantizado por G4) y falta algún requisito en el párrafo? Agregación
determinista: cualquier objeción ⇒ escala a Daniel. El panel se **calibra con
errores inyectados** (≥ 95 % de detección, 100 % en falsos positivos, ≤ 20 % de
falsas alarmas) antes de aprobar nada. La release `--strict` admite
`humanReview: approved` **o** `panelReview: approved` con calibración vigente.
Etiqueta pública: «revisada por un panel independiente». Nunca se presenta como
revisión humana. La clave `NAN_API_KEY` solo está en el entorno local. Detalle:
docs/17. Matiza ADR-040 (el muestreo humano pasa a ser de desacuerdos + 5 ítems
al azar).

## ADR-048 — uber/ADR no se incorpora
2026-10-06 · aceptada · `uber/ADR` es un sistema de seguridad empresarial para
detectar comportamiento de riesgo de agentes de IA (descubrimiento, telemetría,
detección). No mejora la calidad de las reglas ni del producto, y su despliegue
consumiría días. Los riesgos equivalentes aquí (secretos, escrituras en donantes,
publicación sin revisión) ya los cubren reglas explícitas y gates (G12, ADR-044,
prohibición de escribir en donantes, `NAN_API_KEY` fuera del repo).

## ADR-049 — Revisión local de fuentes bloqueadas para el CI: Windows ahora, VPS después
2026-10-06 · aceptada (Daniel) · 40 de 154 fuentes (sede.comunidad.madrid y
seg-social.es) bloquean a GitHub Actions. Se revisan con una tarea programada de
Windows en el PC de Daniel (diaria, más al iniciar sesión si se perdió), con la
misma lógica fail-closed que F9 y push del resultado. Si el PC está apagado, ese
día no hay revisión de esas fuentes: el Observatorio muestra la fecha real de la
última revisión de cada grupo (R7-HONEST). Migración posterior a un VPS de Daniel
(R7-VPS), comprobando antes que esas sedes responden desde su IP.
