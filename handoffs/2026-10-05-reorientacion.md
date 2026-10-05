# Handoff — reorientación del proyecto — 2026-10-05

**Leer antes que el handoff de F0.**

Daniel ha decidido (ADR-022, ADR-026):
- **Proyecto nuevo e independiente**, solo Comunidad de Madrid, para este concurso.
  El código vive en **este repo** (`F:\_Proyectos\datawardsmadrid`).
- **No se modifican** la-ayuda ni EduAyudas. Son donantes de solo lectura (docs/13).
- Daniel concursa como **persona física**.

Consecuencias para ti:
1. **Deja de trabajar en el worktree** `F:\AgentState\worktrees\la-ayuda\premio-gtl`.
   No lo borres. Su commit `6595a533` (Zod) se porta aquí en F0-8. Los 3 ficheros
   modificados que tiene (`data/product-state.json`, `ev1-state.json`,
   `docs/audits/product-state/product-state.json`) son del build de la-ayuda: no los toques.
2. Siguiente orden: **F0-7** (andamiaje) → **F0-8** (portar Zod) → **F0-9** (importar
   el catálogo con procedencia) → **F0-5b** (candidatas Madrid para el nivel 1) →
   F1/F2.
3. ADR-020 (autoridad en main = `active && revisada`) sigue valiendo como **filtro
   de importación** del donante. Ya no hay gate de ledger. El gate G2 de F1 cambia
   (ver phases/F1).
4. Idioma solo `es` (ADR-024). Playwright: una sola config `playwright.config.ts`.
5. La demo puede desplegarse de forma independiente (ADR-025, docs/11) **con
   autorización** (D-3, D-4, D-6).
6. Recuentos medidos en el donante (main, 2026-10-05): 57 fichas Madrid
   `active && revisada` (54 sin `tax_deduction`), 191 estatales sin fiscales, 328
   borradores BOCM de Madrid (pistas).
