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
