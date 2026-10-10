# Referencias internacionales

Se toman **ideas y patrones**, no código. Antes de citar cualquiera en la memoria,
un agente debe abrir el repo, anotar commit inspeccionado y comprobar que la
afirmación sigue siendo cierta (las descripciones de abajo vienen de un análisis
previo y no están verificadas).

| Referencia | Qué es | Qué tomamos | Qué no |
|---|---|---|---|
| [ACCESS NYC](https://github.com/CityOfNewYork/ACCESS-NYC) | Screener municipal de elegibilidad para ayudas (Nueva York) | UX móvil, baja alfabetización digital, multilingüe, accesible; programas como datos abiertos | Su backend y stack |
| [MyFriendBen](https://github.com/MyFriendBen/benefits-calculator) | Calculadora de prestaciones conectada a PolicyEngine | Mostrar **valor estimado + esfuerzo/tiempo** para solicitar | Estimaciones sin base: solo mostramos importe/esfuerzo si la fuente lo respalda |
| [OpenFisca](https://github.com/openfisca/openfisca-core) | Motor *Rules as Code* | Principio: reglas deterministas calculan; la explicación es otra capa | Adoptar OpenFisca (Python, servidor): no cabe en 10 días ni en export estático |
| [Aides Jeunes](https://github.com/betagouv/aides-jeunes) | Simulador francés sobre OpenFisca | Restricciones geográficas, comprobaciones de consistencia, telemetría de uso | — |
| [grant-finder](https://github.com/openprose/grant-finder) | Ledger de convocatorias con procedencia y frescura | Procedencia por resultado, `checked_at`, ocultar cerradas por defecto | — |
| [TheyWorkForYou](https://github.com/mysociety/theyworkforyou), [Budget Galaxy](https://github.com/JuanBlanco9/Budget-Galaxy), [OpenGovernment](https://github.com/provydon/opengovernment), [GovTrace](https://github.com/guilhermeseckert/GovTrace) | Transparencia parlamentaria / presupuestaria / dinero público | Idea futura: dinero público → adjudicatario → subvenciones → vínculos | Fuera de alcance de esta candidatura |

## Síntesis para la memoria

> UX de ACCESS NYC + valor/esfuerzo de MyFriendBen + rules-as-code de OpenFisca +
> procedencia/frescura de grant-finder, sobre un modelo probatorio propio
> (claim → evidencia → fuente → límite) y un diferenciador: **«qué te falta»**.

## Ideas aparcadas (no hacer ahora)

- **Convocatorias Abiertas ES**: CLI/API que agrega BDNS + BOE + boletines y
  responde `OPEN/UPCOMING/CLOSED/UNKNOWN` con evidencia y detección de
  contradicciones (caso real: prensa 18/10 vs Orden 16/10). Microproyecto posterior.
- **Grafo de dinero público** (Subsidy Tracker + PLACSP + Regulatory Record +
  Vínculos Públicos). Proyecto propio con validación seria.

## Revisión ampliada (2026-10-05) — qué cambia en la especificación

| Referencia | Hallazgo | Cambio aplicado |
|---|---|---|
| **Simulador oficial del IMV** (Seguridad Social, `ingreso-minimo-vital.seg-social-innova.es/simulador`) | Existe un simulador **oficial** para algunas prestaciones; un millón de consultas el primer día (2020) | Si una ayuda tiene simulador oficial, la tarjeta lo enlaza como acción principal («Compruébalo con el simulador oficial»). Nunca competimos con él. Campo `officialSimulator` en el RuleSet (ADR-018) |
| **Catala** (Inria / Microsoft Research) y **CUTECat** (generación concólica de tests para leyes, 2024) | La ley se estructura como regla base + **excepciones**; los tests generados deben poder revisarlos juristas; encontró un bug en la implementación oficial de las prestaciones familiares francesas | 1) Nodos compuestos con `label` y `citation` para modelar **vías alternativas y excepciones** legibles (docs/07 §2.3). 2) El generador exhaustivo produce una **tabla de decisión legible** por ayuda para la revisión humana (F3) |
| **NSW Rules as Code** (Australia) | Reglas publicadas junto a la norma, consumidas por un cuestionario | Refuerza ADR-014 (reglas como datos abiertos) |
| **PolicyEngine** (EE. UU./R. U., sobre OpenFisca) | Explicaciones generadas por LLM sobre cálculos deterministas | Se confirma ADR-003: lo dejamos como trabajo futuro, con la restricción de no añadir hechos |
| **Mes Aides / 1jeune1solution** (Francia) | 24 prestaciones en < 7 min; el simulador reconoce criterios que no puede integrar | Objetivo medible: completar en ≤ 3 min (10 preguntas). `uncoveredRequirements` siempre visibles |
| **Aspen Institute, «Assessing Benefits Screeners»** (2025) | Marco de evaluación de screeners: precisión, mantenimiento, confianza y resultados | Criterios de decisión de docs/07 §0, en especial la asimetría de errores: **un falso negativo hace más daño que un falso positivo** (ADR-017) |
| **AIReF**, opiniones sobre el IMV | Non take-up ≈ 56 % (2023) según prensa que cita a AIReF | Dato candidato para el «problema» de la memoria; **verificar en el documento primario de AIReF** antes de usarlo |
| **UNE 153101 EX (Lectura Fácil)** | Ningún texto es «Lectura Fácil» sin validarlo con personas con dificultades lectoras (3 validadores) | Decimos «lenguaje claro», **nunca** «lectura fácil» (docs/09 §5) |
| **Alcanza** (competidor de EduBecas, perfil en `eduayudas/competitor-profiles/`) | Amplitud del catálogo + cuenta + datos sensibles + pago | Diferenciación para la memoria: sin cuenta, sin datos fuera del dispositivo, gratuito y con fuente en cada afirmación |
| **EduAyudas `docs/RULE_ENGINE.md` y `LEGAL_NOTES.md`** (propio) | Casos de territorio críticos; avisos «No somos una administración pública»; minimización de datos de menores | Casos añadidos a F2-4; aviso añadido a `LegalNotice`; edades de menores solo por bandas (docs/08 §6) |
| **la-ayuda `src/lib/rules/assistant.ts` y `user-state.ts`** (propio) | Ya hay un ranking heurístico de relevancia y un contrato de privacidad canónico | Resultados en **dos niveles** sin mezclar etiquetas (ADR-016); privacidad sobre `user-state.ts` en vez de un contrato paralelo (ADR-007 revisado) |

Fuentes consultadas: [simulador IMV (prensa)](https://wwwhatsnew.com/?p=373713),
[Catala (MSR)](https://www.microsoft.com/en-us/research/publication/catala-a-programming-language-for-the-law/),
[CUTECat (SPLASH 2024)](https://2024.splashcon.org/details/prolala-2024-papers/6/CUTECat-Generating-Testcases-for-Fiscal-Laws-through-Concolic-Execution),
[NSW Rules as Code](https://www.digital.nsw.gov.au/article/rules-as-code-test-learn-repeat),
[PolicyEngine](https://digitalgovernmenthub.org/ecosystem/directory/policyengine/),
[Mes Aides (CAF)](https://caf.fr/allocataires/caf-de-seine-et-marne/actualites-departementales/simulateur-mes-aides-evaluez-vos-droits-24-aides-sociales-en-moins-de-7-minutes),
[Aspen Institute](https://www.aspeninstitute.org/publications/assessing-benefits-screeners/),
[AIReF IMV (prensa)](https://www.menorca.info/actualidad/nacional/2024/07/10/2201195/ingreso-minimo-vital-mas-mitad-hogares-solicitan.html),
[UNE 153101 (AENOR)](https://en.tienda.aenor.com/al-dia/noticias/une-153101-une-153102-lectura-facil).
Todas son lecturas de referencia: ninguna es evidencia para la memoria hasta que se verifique en la fuente primaria.

## Revisión del 08/10: investigación externa aportada por Daniel (ADR-051)

Las referencias proceden de un informe externo. **El agente no las ha consultado
todavía**, y antes de citar cualquiera en la memoria hay que abrirla y anotar la
fecha o el commit (docs/12 §6). Solo se toman patrones: nada de código, textos ni datos.

| Referencia | Patrón | Qué hacemos aquí | Estado |
|---|---|---|---|
| **PolicyEngine Cliff Watch** | «¿Qué pasa si cambian mis ingresos?», es decir, los umbrales en los que se pierde una prestación | Solo con reglas ya verificadas: mostrar en la ficha el umbral citado («hasta X € de ingresos») y nunca una curva calculada. La curva necesitaría definir legalmente la renta, el ejercicio y la unidad familiar | Aparcado para después del 16/10. Hay que comprobar que la ficha ya enseña el umbral citado |
| **PolicyEngine TANF Calculator** | Front estático con resultados precalculados y sin back | Confirma la arquitectura (export estático, coste por usuario ~0): sirve como argumento de escalabilidad en la memoria | Adoptado (ya era así) |
| **BenefitsBridge** (Cornell, 2026) | Abandonaron el chatbot por pasos estructurados. Antipatrón: el perfil en Base64 dentro de la URL | Confirma ADR-003 y ADR-007. El test de privacidad ya prohíbe el perfil en la URL | Adoptado (ya era así) |
| **ClaimIt** (USAII 2026) | Primero comprueba las causas de exclusión y explica por qué no y qué alternativa hay | Las tarjetas «no cumples» con el requisito que falla y su cita, más un enlace a ayudas del mismo evento vital. Su decisión con LLM **no** se adopta | Should en F10-FRONT |
| **DigiEduHack 2025 — PathWise** | Itinerario: qué puedo pedir, qué me falta y cuál es el siguiente trámite | Ya existen el plan de acción y «qué te falta». Argumento para la memoria | Ya cubierto |
| **ACCESS NYC** | Preguntas mínimas, lenguaje claro y cómo solicitar | Ya está en docs/15 y en ADR-041 | Ya cubierto |
| **OpenFisca France** (AGPL) | Parámetros con fecha y escenarios reproducibles | Equivale a R8-VIG (`validFrom`/`validUntil`) y a `parameters.json` con fecha. Por la licencia AGPL, solo se estudia la arquitectura | Ya cubierto |
| **Bank Branches AU**, **Cardinal (OCP)**, **Eurostat Big Data Hackathon 2025**, **EU Datathon 2022** | Mapas de servicios, indicadores de contratación y desigualdad ambiental | Están fuera del ámbito del producto (ADR-029) | No se adopta |

## Revisión del 10/10: patrones de front de los buscadores de referencia (F10)

Todas las páginas se consultaron el 10/10/2026. Solo se toman patrones:
nada de código, textos ni CSS. Lo que ya estaba en el producto se marca
«ya cubierto»; lo aplicable antes del 12/10 va en «aplicado»; el resto,
«siguiente paso» (queda para la memoria).

| Referencia | Patrones concretos | Qué hacemos |
|---|---|---|
| **GOV.UK** «Check benefits and financial support you can get» | 1) Aviso de alcance honesto antes de empezar («This tool does not include all the ways you can get help…»). 2) Un único CTA «Check what you can get». 3) Enlaza calculadoras de terceros en vez de reinventarlas | 1) y 3) ya cubierto (scope del Observatorio; enlazamos simuladores oficiales en la ficha, ADR-018). 2) refuerza la portada con dos caminos explícitos (comprobar vs explorar) — ya lo teníamos |
| **USAGov** Benefit Finder | 1) Filtro por categorías vitales (casillas) como primera pantalla, antes de cualquier pregunta. 2) Par explícito «Apply selections / Clear selections» | 1) ya cubierto por los eventos vitales de /explorar/. 2) **aplicado**: botón «Limpiar filtros» visible solo con filtros activos (feedback 10/10) |
| **ACCESS NYC** | 1) Doble entrada: «I'm not sure what I qualify for» (screener) vs «I know what benefits I need» (solicitud directa). 2) Coste anunciado arriba: «Get matched with up to 30 benefits in 5–10 minutes». 3) Newsletter de avisos de plazos | 1) ya cubierto (Comprobar vs Explorar). 2) **aplicado**: la portada dice «≤ 3 min»… verificar que el claim sigue medido; si no, quitarlo. 3) siguiente paso (aviso de plazos por correo requiere backend; aparcado) |
| **mes-aides / 1jeune1solution** (Francia) | 1) Resultados ordenados por importe con el total estimado arriba. 2) Barra de progreso persistente entre preguntas. 3) Página-resumen «toutes mes aides» imprimible | 2) ya cubierto (progreso por pasos). 1) y 3) siguiente paso: ordenar resultados por un orden útil documentado (relevancia/plazo) y ofrecer una vista imprimible; el importe solo si la fuente lo respalda (MyFriendBen en la tabla de arriba) |
| **Canada** Benefits Finder | 1) Filtros facetados por «tipo de ayuda» × «audiencia» explicando la lógica AND. 2) Nota de alcance honesta: «federal benefits only» con enlaces a buscadores provinciales. 3) «See all 157 results without filtering» — escape del cuestionario. 4) Aviso de estafas | 2) ya cubierto (marcamos CM/municipal/estatal por ámbito). 3) ya cubierto: /explorar/ lista todo sin filtrar. 1) los «perfiles» facetados encajan con nuestros filtros de tema/evento — ya cubierto. 4) siguiente paso (aviso de suplantación en /como-funciona/) |
| **GetCalFresh** (Code for America) | 1) Remisión honesta: «You can't apply on this website» + enlace al portal oficial. 2) «Get support from a real person» — canal humano. 3) Guías por situación especial (estudiantes, inmigrantes, SSI) | 1) ya cubierto (cada tarjeta enlaza la sede oficial; nunca simulamos la solicitud). 2) no aplicable (no hay equipo humano; lo suplimos con /como-funciona/ y «qué te falta»). 3) siguiente paso: fichas-guía por evento vital |
| **Payment and Service Finder** (Australia) | No se pudo abrir (la página exige JS y el acceso automatizado da timeout) | Anotado como pendiente; si no se puede consultar no se cita en la memoria |
| **Buscador de la CM** (sede.comunidad.madrid) | 1) Facetas con recuento por valor (tema/tipo/perfil/consejería/estado). 2) «Borrar filtros» como reset global. 3) Urgencia por ficha: «Últimos días» + fechas de inicio/fin. 4) Requiere JS | 2) **aplicado** («Limpiar filtros»). 3) parcialmente cubierto: nivel 2 ya muestra estado de plazo; **aplicado** el énfasis en plazo en la ficha. 1) siguiente paso (recuento por faceta). 4) contraste para la memoria: nuestra web funciona sin JS salvo el asistente |
| **Punto de Acceso General** (administracion.gob.es) | Índice de índices: la puerta única delega en sedes sectoriales | ya cubierto: cada fuente enlaza su sede oficial, no hacemos de meta-buscador de trámites |
| **Simuladores de la Seguridad Social** (Tu Seguridad Social) | 1) Simulación sobre los datos reales del usuario (requiere certificado/cl@ve). 2) Informe PDF descargable del resultado. 3) Escenarios «qué pasa si» (adelantar/retrasar, cambiar bases) | ya cubierto por ADR-018 (la ficha enlaza el simulador oficial como acción principal; nunca competimos con él). 2) siguiente paso: exportar la comprobación a un texto descargable |
| **Proyectos abiertos tipo benefit-finder** (OpenFisca, aides-jeunes, MyFriendBen, BenefitsBridge, ClaimIt) | Recopilados en las tablas anteriores | nada nuevo aplicable antes del 12/10; se mantienen las decisiones (estructurado > chatbot; sin perfil en URL; AGPL solo se estudia) |

### Aplicado en esta sesión (pequeño y de bajo riesgo)

- «Limpiar filtros» visible solo con filtros activos (USAGov / CM).
- En móvil, filtros plegados en «Filtrar (N activos)» — el patrón de facets
  colapsadas que usan ACCESS NYC y el buscador de la CM en pantallas
  pequeñas.
- «¿Seguir con tus respuestas o empezar de cero?» — el patrón
  «continuar donde lo dejaste» que hacen mes-aides (guarda la simulación)
  y GetCalFresh («For returning visitors»), pero **más estricto en
  privacidad**: preguntar antes de reutilizar y ofrecer borrar.

### Siguiente paso (anotado para la memoria, no para el 12/10)

- Vista imprimible / descargable de la comprobación (mes-aides, seg-social).
- Aviso anti-estafas y de suplantación en /como-funciona/ (Canada).
- Recuento por faceta en los filtros de /explorar/ (CM, Canada).
- Guías por situación especial (GetCalFresh); umbral citado visible en
  resultados (PolicyEngine Cliff Watch — ya en la tabla de arriba).
