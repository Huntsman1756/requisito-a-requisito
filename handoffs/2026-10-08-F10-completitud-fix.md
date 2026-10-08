# Handoff — F10 — 2026-10-08 (corrección de hallazgos de completitud)

**HEAD:** ver `git log` en `main` de datawardsmadrid · **Evidencia:**
`evidence/2026-10-08-F10/completitud.md` (actualizada)

## Hecho en esta sesión

Los 4 hallazgos de `completitud.md` (medición del 08/10) corregidos, por
petición de Daniel. Sin tocar `data/eligibility/rules` ni aprobaciones.

- **Ficha 404** — commit `e510dbe` — las fichas `/ayudas/<slug>/` se generan y
  cargan por `benefitSlug` (extracción a `src/lib/rule-pages.ts`); test sobre
  datos reales `tests/eligibility/fichas-slug.test.ts` + barrido de enlaces
  internos en el spec e2e.
- **Edades de personas a cargo** — commit `792ba3f` — `QuestionStep` pide en el
  MISMO paso la edad de cada dependiente (campo numérico + «Prefiero no
  decirlo» por persona ⇒ rango desconocido, UNKNOWN ≠ NO). Conserva
  `disability` si ya respondido. Verificado por la ruta real: teclear «2»
  muestra 2 campos; los 3 goldens afectados salen positivos.
- **Nivel 1 en /explorar/** — commit `d110fea` — `nivel-1.json` desde el
  **bundle** (en strict solo aprobadas, ADR-050); marca «Comprobada requisito
  a requisito» + enlace a la ficha; reglas excluidas del bundle reaparecen en
  nivel 2 con enlace oficial (ADR-052). 50/50 identificados, 0 duplicados.
- **Nivel 2 sin ficha propia** — ADR-052 en DECISIONS.md: catálogo con enlace
  oficial HTTPS por diseño; el test pide «aparece en /explorar/ con enlace
  oficial HTTPS» (401/401), referencia al ADR incluida.
- **Tests + evidencia** — commit `2e67c6b` — spec actualizado, completitud.md.

## Validación

- `check` / `lint` / `test` (553 tests, 43 ficheros) / `build`: PASS.
- `completeness:web` (desktop-chromium): **4/4 en normal y 4/4 en strict
  simulado** (`qa-strict.ts`, aprobaciones simuladas en scratch — declarado,
  regla 4.12). Sha256 del export estricto = bundle estricto de scratch;
  restaurado el build normal (`fe2b9a53…`).
- fiabilidad + comprobar + a11y + teclado (15 tests): PASS — privacidad en
  verde (perfil solo en `rr_*` del navegador).
- No se regeneraron anexos (eso es del 14/10).

## Pendiente y siguiente paso exacto

1. F10-MUESTREO — Daniel marca las hojas (`evidence/…/muestreo-ola-*.md`,
   empezar por 12d). Luego `npm run review:apply -- <hoja>` por cada una.
2. El puerto 4321 lo ocupa otro proyecto (Puntualidad Renfe): para e2e local
   usar `E2E_PORT=<libre>` (p. ej. 4821) con PLAYWRIGHT_BROWSERS_PATH=F:\Caches\ms-playwright.
3. Checks web de completitud solo en Chromium; Firefox/WebKit por CI
   (`e2e-browsers.yml`), pendiente también para strict el 14/10.

## Bloqueos (quién decide)

- Release estricta real: sigue bloqueada por las hojas de Daniel
  (`humanReview: pending`), ya no por completitud.

## Cosas que el siguiente agente debe saber

- `nivel-1.json` se genera desde el bundle, no del directorio de reglas: en
  `--strict` las no aprobadas salen del nivel 1 y reaparecen como catálogo en
  nivel-2.json (su ficha `/ayudas/<slug>/` existe igualmente — las fichas se
  generan por directorio de reglas; decisión residual, revisar si importa el
  14/10).
- `describeAnswer` muestra dependientes como «2 · 5, 9 años».
- `QuestionStep` usa ahora `setError(<I18nKey>)` con mensajes por tipo de
  error (`check.error.dependentAge`).

## Clasificación de desviaciones

D3 menor: ADR-052 cambia un criterio de completitud (nivel 2 sin página
propia) — documentado con ADR, no silenciado.
