# Arquitectura — La Ayuda «Tus derechos, con fuente»

Documento de visión de conjunto. El detalle normativo está en:
motor → `07-motor-evaluacion.md` · fuentes → `08-fuentes-y-datos.md` ·
diseño → `09-diseno-ux.md` · QA → `10-qa-matriz.md` · back/infra →
`11-infra-despliegue.md` · contratos → `schemas/`.

## 1. Stack (heredado de la-ayuda; no se cambia)

| Capa | Tecnología | Versión en `package.json` |
|---|---|---|
| Lenguaje | TypeScript estricto | ^5.9 |
| Runtime de build | Node.js | ≥ 22.6 (npm; **no** Bun) |
| Frontend | Next.js App Router, `output: export` + React | ^15.5 / ^19.3 |
| Validación | Zod (fuente de verdad en código) + JSON Schema (`schemas/`, contrato normativo) | ^4.6 |
| PDF | pdfjs-dist (extracción de texto de las fuentes) | ^6.3 |
| Tests | Vitest · Playwright · @axe-core/playwright | ^4.1 · ^1.61 · ^4.12 |
| Lint/formato | Biome | ^2.4 |
| Servido | Export estático + nginx (VPS) | — |

**Sin dependencias nuevas** salvo autorización (ADR-010).

Repo destino: `F:\_Proyectos\la-ayuda` (GitHub `mapa-de-beneficios`), en el
worktree `F:\AgentState\worktrees\la-ayuda\premio-gtl`, rama
`feat/premio-gtl-elegibilidad`.

## 2. Flujo

```
                 BUILD (Node, determinista, sin red salvo snapshot)                     NAVEGADOR (privado)
┌─────────────────┐  ┌─────────────────────────┐  ┌───────────────────────┐   ┌───────────────────────────────┐
│ fuentes oficiales│─▶│ sources/<id>.json + .txt│─▶│ eligibility:validate  │   │ cuestionario (≤10, progresivo) │
│ (BOE/BOCM/BDNS/  │  │ (sha256, texto normaliz.)│  │  · Zod                │   │          │                     │
│  sede)           │  └─────────────────────────┘  │  · autoridad ledger   │   │  CitizenProfile (memoria)      │
└─────────────────┘  ┌─────────────────────────┐  │  · citas ∈ texto      │   │          ▼                     │
                     │ rules/<slug>.json       │─▶│  · dominios/frescura  │   │  evaluate(profile,bundle,today)│
                     │ parameters.json         │  │  · conflictos         │──▶│          ▼                     │
                     │ questions.json          │  └───────────────────────┘   │  assertEvaluationInvariants    │
                     └─────────────────────────┘    eligibility-bundle.json    │   ├ OK  → tarjeta con veredicto │
                                                    + manifest (digest)        │   └ KO  → «no podemos evaluar» │
                                                    + eligibility-report.json  └───────────────────────────────┘
```

## 3. Módulos en la-ayuda (rutas propuestas; ajustar a las convenciones reales)

| Ruta | Responsabilidad |
|---|---|
| `src/lib/eligibility-engine/types.ts` | Tipos derivados de `schemas/` |
| `src/lib/eligibility-engine/schema.ts` | Zod de RuleSet, catálogo, parámetros, perfil y resultado |
| `src/lib/eligibility-engine/interval.ts` | Aritmética y comparación de intervalos |
| `src/lib/eligibility-engine/logic.ts` | Kleene T/F/U, `all/any/not` |
| `src/lib/eligibility-engine/operators.ts` | Operadores (docs/07 §2.2) |
| `src/lib/eligibility-engine/territory.ts` | Jerarquía INE |
| `src/lib/eligibility-engine/params.ts` | Resolución de parámetros por vigencia |
| `src/lib/eligibility-engine/evaluate.ts` | `evaluate(profile, ruleSet, ctx) → BenefitEvaluation` |
| `src/lib/eligibility-engine/verdict.ts` + `verdict-oracle.ts` | Veredicto y su segunda implementación independiente (I2) |
| `src/lib/eligibility-engine/missing.ts` | `missing`, `blockers`, `futureEligibility` |
| `src/lib/eligibility-engine/deadline.ts` | Estado del plazo |
| `src/lib/eligibility-engine/effort.ts` | Estimación propia versionada (ADR-009) |
| `src/lib/eligibility-engine/invariants.ts` | I1–I10 |
| `src/lib/eligibility-engine/explain.ts` | Plantillas → claves i18n |
| `data/eligibility/{rules,sources,parameters.json,questions.json}` | Datos de entrada |
| `data/eligibility/sources/registry.json` | Dominios permitidos y rangos |
| `scripts/eligibility-*.ts` | snapshot / validate / build / exhaustive / mutate |
| `src/app/…/comprobar/` | Ruta del orientador (según el router de locales actual) |
| `src/components/eligibility/*` | Componentes de docs/09 §3 |
| `tests/eligibility/{unit,exhaustive,golden,gate,e2e}` | Pruebas |
| `playwright.eligibility.config.ts` | Matriz de navegadores (docs/10 §2) |

### 3.1 Código existente que hay que respetar y reutilizar (observado el 2026-10-05)

- `src/lib/eligibility.ts` → `eligibilityChecklist(benefit, lang)`: **solo
  presentación** de `eligibilityFactors` («Encajas si…»). No evalúa perfiles ni
  tiene citas. **No se renombra ni se rompe**. El motor va en
  `eligibility-engine/` para evitar la ambigüedad de import.
- `src/lib/assistant-form.ts` (`initSituationForm`) + `src/app/assistant-data.json`:
  asistente actual, con contratos localizados aceptados (`docs/ops/assistant-
  localized-contract.md`, `docs/ops/explore-preinit-submit.md`). F4-1 decide si se
  extiende o se enlaza.
- `src/lib/rules/assistant.ts` (`rankBenefits`) + `src/lib/rules/README.md`: **ranking
  heurístico de relevancia** por pesos. No es elegibilidad. Se mantiene para el
  nivel 2 de resultados («También podrían interesarte»), sin etiquetas de
  cumplimiento (ADR-016, docs/07 §2.4).
- `src/lib/user-state.ts`: **contrato canónico de privacidad** (campos públicos y
  sensibles, precedencia, perfil con consentimiento). El orientador lo extiende;
  no crea otro (docs/08 §6).
- Vocabulario: los tokens de `eligibilityFactors` y las claves i18n `factor_*` son
  la base de las opciones del catálogo de preguntas. `eligibilityFactors` =
  pre-filtro, **no** regla.
- i18n: `t(lang, key)` de `src/lib/i18n`. Las claves nuevas llevan el prefijo `elig_`.
- Diseño: tokens de `src/app/globals.css` y estilos por página en `src/styles/pages.css`.
- Autoridad editorial: la función que usa `pipeline:authority` (no reimplementar).

### 3.2 Origen del motor

Se toman como **referencia** `G:\_Proyectos\eduayudas\packages\rules-engine\src\
{evaluate,types}.ts` (repo propio, edubecas): estructura pass/fail/unknown +
`missingField` + `nextAction`. Se reescribe con la especificación de docs/07
(intervalos, Kleene, citas, reloj inyectado, sin `any`). En el encabezado se
anota el origen.

## 4. Decisiones de arquitectura clave

Ver `DECISIONS.md`: sin LLM (ADR-003), el perfil no sale del navegador (ADR-007),
«qué te falta» (ADR-008), esfuerzo como estimación propia (ADR-009), sin
dependencias nuevas (ADR-010), sin backend en tiempo de ejecución (ADR-011),
lógica trivalente sobre intervalos (ADR-012), parámetros con vigencia (ADR-013) y
reglas como datos abiertos (ADR-014).
