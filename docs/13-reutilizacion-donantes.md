# Reutilización de proyectos propios (donantes)

Este proyecto es **nuevo e independiente**: un orientador de ayudas **solo para la
Comunidad de Madrid**, creado para este concurso (ADR-022). No modifica la-ayuda ni
EduAyudas. Los reutiliza como **donantes de solo lectura**: se copia código propio
(licencia MIT en la-ayuda; todo es de Daniel) y se **importan datos con procedencia**.

Regla de oro: **nada se escribe en los repos donantes**. Ni ramas, ni commits, ni
builds en su checkout. Lectura de ficheros y `git show <commit>:<ruta>` como mucho.

## 1. Inventario de donantes

| Donante | Ruta local (GitHub) | Qué aporta | Cómo se reutiliza |
|---|---|---|---|
| **la-ayuda** | `F:\_Proyectos\la-ayuda` (`mapa-de-beneficios`, MIT) | Catálogo: **57 fichas de Madrid activas y revisadas** (54 sin `tax_deduction`) + **191 estatales** activas y revisadas sin `tax_deduction` + **328 borradores BOCM** de Madrid (solo como pistas). Medido el 2026-10-05 sobre `main`. Esquema Zod de fichas (`src/content/types.ts`), tokens de diseño (`src/app/globals.css`, `public/fonts/`), contrato de privacidad (`src/lib/user-state.ts`), ranking heurístico (`src/lib/rules/assistant.ts`), patrón i18n (`src/lib/i18n`), utilidades de presentación (`src/lib/eligibility.ts`, `benefit-display`), configuración de Biome/TS/Vitest/Playwright | **Datos:** script de importación con procedencia (§2). **Código:** se copia y adapta a mano el mínimo necesario, con un encabezado de origen (`// Origen: la-ayuda@<commit>:<ruta>, MIT`) |
| **la-ayuda, rama `feat/premio-gtl-elegibilidad`** | worktree `F:\AgentState\worktrees\la-ayuda\premio-gtl` | Commit `6595a533`: esquemas Zod equivalentes a `schemas/*.schema.json` (F1-1) | Se **porta** al proyecto nuevo con un encabezado de origen. El worktree y la rama **se conservan** (no se borran; ver `F:\_Proyectos\AGENTS.md` §7). Ya no se trabaja ahí |
| **EduAyudas / EduBecas** | `G:\_Proyectos\eduayudas` (`edubecas`) | Motor `packages/rules-engine` (referencia del diseño de reglas), `docs/RULE_ENGINE.md` (casos de territorio), `docs/LEGAL_NOTES.md` (avisos, minimización), `docs/QA_BROWSER_CHECKLIST.md`, `competitor-profiles/`. Ayudas educativas de Madrid si existen en su seed o export | Referencia de diseño y tests. Datos: solo si hay un export legible sin acceder a la base de datos de producción; si no, se omite |
| **renta-verificable** | `F:\_Proyectos\renta-verificable` | Modelo claim → evidencia → fuente; huella por contenido (`review_contract.py`) | Referencia conceptual para los gates de citas |
| **official-sources** (y radar) | `G:\_Proyectos\official-sources-*` | Ingesta BOE/BOCM, estados de plazo | Referencia. Las pistas nuevas del BOCM se descargan con nuestro `eligibility:snapshot` |

## 2. Importación del catálogo desde la-ayuda (con procedencia)

`scripts/import-donor-catalog.ts`:

1. **Entrada:** ruta de la-ayuda + **commit fijado** (`--commit <sha>`). Lee con
   `git -C <ruta> show <sha>:src/content/benefits/<f>.md` para no depender del
   working tree sucio del donante.
2. **Filtro de ámbito Madrid (ADR-021):**
   - `scopeRegion == "madrid"` (autonómicas y municipales de la CM), o
   - `scopeLevel == "state"` **y** sin restricción de residencia incompatible con Madrid.
   - Excluir `type == tax_deduction` (riesgo fiscal; auditoría del 27/09 en la-ayuda).
3. **Filtro de calidad del donante:** `status == active && reviewStatus == revisada`
   en ese commit. Los borradores (`draft`) se exportan aparte como **pistas**
   (`data/catalog/leads.json`), nunca como catálogo.
4. **Salida:**
   - `data/catalog/benefits/<slug>.json`: la ficha normalizada al esquema propio
     (subconjunto de campos de `src/content/types.ts` del donante).
   - `data/catalog/provenance.json`: `donor`, `repoUrl`, `commit`, `importedAt` y,
     por ficha, `path` + `sha256` de los bytes leídos.
5. **Determinista:** mismo commit ⇒ mismos bytes de salida (test).
6. **Importar no es aprobar.** Una ficha importada aparece **solo en el nivel 2**
   («También podrían interesarte — no hemos comprobado los requisitos»). Al nivel
   1 solo entra con un RuleSet propio que pase los gates G1–G10 y tenga revisión
   humana (docs/07, F3).

## 3. Código que se porta (lista cerrada; añadir aquí antes de portar otro)

| Origen | Destino | Adaptación |
|---|---|---|
| la-ayuda `src/app/globals.css` (tokens, reset, botones, pills, formularios, dark mode, reduced-motion, print) + `public/fonts/` | `src/app/globals.css`, `public/fonts/` | Quitar lo que no se use; conservar los nombres de tokens para poder comparar con `DESIGN.md` |
| la-ayuda `DESIGN.md` | `DESIGN.md` (propio) | Copia adaptada: mismos principios y anti-patrones, más los componentes del orientador (docs/09) |
| la-ayuda `src/lib/user-state.ts` | `src/lib/user-state.ts` | Se conservan el contrato (campos públicos y sensibles, handoff, perfil con consentimiento) y sus tests. Los campos sensibles pasan a ser los del orientador |
| la-ayuda `src/lib/rules/assistant.ts` (`rankBenefits`) + `README.md` | `src/lib/related/rank.ts` | Solo para el nivel 2. Sin penalización de región (todo es Madrid o estatal); pesos documentados |
| la-ayuda `src/content/types.ts` (subconjunto) | `src/lib/catalog/schema.ts` | Solo los campos que usa el producto |
| la-ayuda `src/lib/i18n` (patrón `t(lang,key)`) | `src/lib/i18n.ts` | Solo `es` (+ `en` si se llega a Should) |
| la-ayuda `scripts/serve-export.mjs`, `biome.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts` | raíz | Adaptados |
| la-ayuda worktree `6595a533` `src/lib/eligibility-engine/schema.ts` (+ tests) | `src/lib/eligibility-engine/schema.ts` | Directo |
| EduAyudas `packages/rules-engine/src/{evaluate,types}.ts` | — | **Solo referencia**; el motor se escribe según docs/07 |

**Dependencias:** las mismas versiones que `la-ayuda/package.json` para el
subconjunto usado (next, react, react-dom, zod, pdfjs-dist, typescript; dev:
vitest, @playwright/test, @axe-core/playwright, @biomejs/biome, tsx, @types/*).
Nada más sin autorización (ADR-010).

## 4. Lo que NO se reutiliza

- El pipeline editorial, el ledger, Hermes/NAN y el scheduler de la-ayuda (son de
  otro producto; aquí la autoridad son los gates de citas más la revisión humana).
- La base de datos, la autenticación y las alertas de EduAyudas.
- Las 5 interfaces lingüísticas (el ámbito es Madrid: `es`, y `en` como Should).
- Cualquier dato de producción, credencial o `.env` de los donantes.
