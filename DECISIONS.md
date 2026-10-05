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
