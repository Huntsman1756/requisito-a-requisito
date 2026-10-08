# 18. Cómo escalar a otra comunidad o municipio

Qué hay que hacer para añadir otra comunidad autónoma o un municipio nuevo, con
el coste **medido** de las olas reales (git log del 05–08/10/2026) — no una
estimación a ojo.

## 1. Lo que ya es reutilizable (0 horas de código)

| Pieza | Estado |
|---|---|
| Motor T/F/U, `verdictOf`, operadores, territorio INE | `src/lib/eligibility-engine/` — sin cambios |
| Esquemas normativos (JSON Schema + Zod) | `schemas/`, contrato cerrado |
| Build fail-closed, validación G1–G12, frescura diaria | `scripts/eligibility-*.ts`, workflow |
| Cuestionario (≤10 preguntas) | `data/eligibility/questions.json` — campos genéricos; solo faltan las respuestas nuevas |
| Goldens, mutación 238, muestreo ADR-040, review:apply | scripts + plantillas |
| Territorio: añadir la CCAA/provincia/municipios INE | `data/eligibility/territory.json` (ya vienen todas las de España) |

Lo único territorio-dependiente es el **dataset**: catálogo de beneficios del
nuevo ámbito, fuentes oficiales y RuleSets.

## 2. Pasos medidos

1. **Universo** (`universe/`): importar el catálogo de la comunidad/municipio
   (el pipeline de `catalog:import` ya existe — fue un import de CSV/JSON del
   Instituto de Ayudas; otra comunidad necesita su exportación equivalente).
2. **Jerarquía territorial**: la INE ya está completa; solo queda indicar el
   ámbito en los RuleSets (`within_territory {ccaa:"XX"}`).
3. **Fuentes**: snapshot + registro por norma (un JSON + `.txt` por fuente en
   `data/eligibility/sources/`).
4. **RuleSet por programa**: autoría con extractos literales (`rules:fill-hashes`
   rellena los sha256), verificador independiente, goldens, hoja de muestreo.
5. **Bundle**: `eligibility:build` recoge todo lo nuevo automáticamente.

## 3. Coste medido por regla (datos reales, git log)

Ventanas entre commits de cada ola (autoría + verificación + goldens):

| Ola | Programas | Ventana | ≈ min/regla |
|---|---|---|---|
| ola-2 (20:32→21:09 ≈ ola-3) | 5 | ~40 min | ~8 |
| ola-4 → ola-5 | 5 | ~25–40 min | ~5–8 |
| ola-8 (municipios) | 6 | ~2,7 h | ~27 |
| ola-9 (re-autoría Ley 4/2026) | 2 | ~2 h | ~60 |
| ola-10 | 5 | ~3,7 h | ~44 |
| **B1 correcciones FN** | 29 | ~2 h | ~4 |

Lectura honesta: las reglas rutinarias con norma y sede ya capturadas cuestan
**~5–10 min**; las que exigen fuente nueva, norma difícil o re-autoría por
cambio legal suben a **~30–60 min**. La verificación independiente y el golden
van incluidos en la ventana (commit a commit).

**Estimación marcada como estimación**: para un municipio nuevo con ~10–20
programas, ≈ 1 jornada de trabajo con este pipeline. Otra comunidad autónoma
completa (100+ programas): ~1–2 semanas.

## 4. Lo que NO se escala gratis

- **La lectura de la norma**: cada artículo hay que leerlo y citarlo literal.
  La frescura automática detecta cambios, pero una reforma sustantiva (como la
  Ley 4/2026) obliga a re-autoría humana/asistida.
- **El juicio**: `hard` solo cuando la condición es medible; si no, `soft` +
  `uncovered` honesto (docs/07 §2.3). La auditoría de falsos negativos de
  esta sesión demuestra que eso no se puede delegar a un heurístico.
- **La revisión humana (ADR-040)**: cada ola pasa por hoja de muestreo; nadie
  entra al bundle estricto sin OK humano.

## 5. Contrato técnico

`schemas/rule-set.schema.json` es el contrato normativo (JSON Schema 2020-12,
cerrado). El ejemplo mínimo `tests/eligibility/fixtures/rule-set.example.json`
pasa la validación en `tests/schema-json-doc.test.ts` — un contribuidor
externo puede partir de ahí.
