# Handoff — F10 — 2026-10-09 (fuente única para las páginas)

**HEAD:** `972a762` en `main` · **Evidencia:** sesión medida abajo

## Hecho en esta sesión

El residual del handoff anterior era un agujero de ADR-050/G12: las páginas
leían `data/eligibility/rules/` directamente, así que en `--strict` habrían
publicado reglas no aprobadas (release-verify solo miraba el bundle).

- **Fuente única** — commit `9ab83db` — `src/lib/rule-pages.ts` lee
  `data/eligibility/bundle/eligibility-bundle.json` (todas en normal, solo
  aprobadas en strict). Migrados: fichas `[slug]`, listado `/ayudas/` (una
  tarjeta por benefitSlug, versión vigente), portada (cifras + specimen),
  observatorio (última verificación) y como-verificamos (enlace de ejemplo →
  bundle; «50» fijo eliminado del texto). Guardia en
  `fichas-slug.test.ts`: **falla si algún fichero de src/ referencia
  `data/eligibility/rules`**.
- **release-verify ampliado** — commit `9254632` — sobre `out/`: fichas
  exportadas == benefitSlugs del bundle; `/ayudas/` = una tarjeta por
  programa; `nivel-1.json` == bundle; ningún HTML enlaza `/ayudas/<slug>/`
  fuera del bundle. Ensayo en el test: todas las hojas menos 12d ⇒ 47
  rulesets / 45 programas, verify verde; ficha extra ⇒ rojo.
- **Ensayo real con KO simulado** (4.12, declarado — `qa-strict.ts
  --ko=muestreo-ola-12d.md` sobre copia en scratch): strict 47 incluidas / 5
  excluidas ⇒ `datos:public` + `next build` ⇒ 47 fichas (las de 12d NO
  existen), nivel-1.json 45, las 5 excluidas reaparecen como catálogo de
  nivel 2 (406) ⇒ `release:verify` verde (sha ok) y `completeness:web`
  **4/4 con el recuento real**. Restaurado el build normal (sha comprobada).
- **Memoria** — commit `972a762` — marcador `[14/10 — cifra del strict]` en
  los tres puntos de memoria.md que dicen «50 programas publicados»;
  `memoria:cifras` ya lee el bundle público servido, así que `cifras.json`
  del 14/10 medirá el strict sin cambios. Regenerado hoy (52/50, 556 tests).

## Validación

- `check` / `lint` (38 warnings preexistentes) / `test` (556 tests, 43
  ficheros) / `build`: PASS.
- `completeness:web` normal: 4/4. Strict simulado -12d: 4/4 + verify verde.
- Producción: deploy del push en verde (`gh run list`).

## Pendiente y siguiente paso exacto

1. F10-MUESTREO — Daniel marca las hojas (empezar por 12d: el ensayo muestra
   que un KO allí deja 45 programas publicados, ≥ 20 ⇒ D-12 no se activa).
2. `review:apply` por hoja → `RELEASE_MODE=strict` el 14/10 → `validate:release`
   (ahora incluye la puerta de fuente única sobre out/).
3. Regenerar `memoria:cifras` + memoria con las cifras del strict el 14/10.

## Bloqueos (quién decide)

- Release estricta real: solo las hojas de Daniel.

## Cosas que el siguiente agente debe saber

- **AGENTS.md tiene un cambio ajeno sin commitear** (regla «push nunca en la
  misma orden que una tubería», hook `.claude/hooks/push-guard.js` + dir
  `.claude/` sin seguimiento). Dejado fuera de los commits por ser de otro
  agente/Daniel — el siguiente que lo vea decida si commitea.
- `qa-strict.ts --ko=` espera solo el NOMBRE de la hoja (sin ruta).
- `nivel-2.json` en strict incluye las reglas excluidas como catálogo
  (ADR-052): su `slug` puede coincidir con un benefitSlug — es esperado, el
  criterio de fuente única solo prohíbe FICHA y enlace a ficha.
- OJO al correr `memoria:cifras`: ejecuta vitest y mide el bundle público
  servido EN ESE MOMENTO — si hay un bundle de ensayo intercambiado, las
  cifras salen del ensayo (pasó hoy; se regeneró tras restaurar).
- Puerto e2e local: `E2E_PORT=4821` (4321 lo ocupa otro proyecto).

## Clasificación de desviaciones

D0/D2: nada de alcance; la fuente única cumple ADR-050/G12 tal como estaba
pensada (documentado en ADR-052 para el nivel 2).
