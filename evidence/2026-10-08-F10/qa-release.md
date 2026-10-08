# QA de release — build `--strict` (F10-B2, 08/10)

**Declaración (regla 4.12):** las aprobaciones `humanReview` son **SIMULADAS**
en una copia de `data/eligibility/rules/` dentro de
`F:\Temp\datawardsmadrid-cierre\strict\` — las reglas reales siguen
`humanReview: pending`. El ensayo recorre la ruta real: `applySheet` por hoja
vigente de `muestreo-indice.json` → `buildEligibility --strict`.

## 1. Bundle estricto

```text
npx tsx scripts/qa-strict.ts F:/Temp/datawardsmadrid-cierre/strict
→ lote-1 (2), ola-1 (2), ola-2 (1), ola-3 (3), ola-4 (1), ola-5 (3),
  ola-6 (2), ola-8 (3), ola-11 (4), ola-12 (31)
→ ola-7/9/10 sin vigentes (todos sus slugs mandan en hojas más recientes)
→ strict: 52 incluidas, 0 excluidas, digest 51b6b5967ae06383…
```

El bundle se intercambió en `data/eligibility/bundle/` (copia de seguridad en
`F:\Temp\datawardsmadrid-cierre\bundle-normal`) → `npm run datos:public` →
`npm run build` ⇒ export estático con los 52 RuleSets.

## 2. Resultados sobre el export estricto

| Prueba | Comando | Resultado |
|---|---|---|
| Build estático | `npm run build` | OK, 52 reglas en bundle público |
| e2e completos | `npx playwright test` (5 proyectos: desktop-chromium, mobile-android, mobile-ios, small-reflow, dark) | **30/30 verdes** (3,7 min) |
| axe | `a11y.spec.ts` × 5 páginas × 3 proyectos | **15/15, 0 serious/critical** |
| Privacidad | `fiabilidad.spec.ts` «el perfil no sale del navegador» | verde: 0 peticiones externas, 0 cookies, solo `rr_*` en storage |
| Link-check | `npm run link:check` | **155 URL, 0 fallidas** |
| Goldens sobre el bundle estricto | `tsx scripts/eligibility-goldens.ts --bundle …/eligibility-bundle.json` | 44 personas, 47 expectativas, **0 diferencias** |
| Exhaustivo | `npm run eligibility:exhaustive` | **259.391 perfiles, 0 violaciones** |
| Solo teclado | `teclado.spec.ts` (Tab+Enter, foco visible) | verde |
| Zoom 200 % | `teclado.spec.ts` 360×640 y 390×844 (dsf 2) | verde, sin scroll horizontal |
| Móvil | proyectos `mobile-android`/`mobile-ios`/`dark`/`small-reflow`/`reduced-motion` en la matriz | verde |

## 3. Lighthouse (móvil, export local)

| Página | Rendimiento | Accesibilidad |
|---|---|---|
| `/` | 90–96 | 98 |
| `/comprobar/` | 98 | 100 |
| `/ayudas/imv/` | 82→98 (segunda corrida) | 100 |
| `/observatorio/` | 71→98 (segunda corrida) | 100 |

La primera corrida midió FCP=3,6–4,7 s en un PC con CPU saturada por la suite
corriendo a la vez; la segunda (sin carga) da 96–98. Variancia del equipo, no
del código — ambas quedan registradas en `F:\Temp\datawardsmadrid-cierre\lh*.json`.
A11y 98–100 en todas.

## 4. Firefox / WebKit

Este equipo no arranca Firefox ni WebKit (la matriz local solo corre Chromium).
Workflow manual `.github/workflows/e2e-browsers.yml` (`workflow_dispatch`):
build del export + `playwright test --project=desktop-firefox --project=desktop-webkit`
en ubuntu-latest. Resultado del run CI: **verde — run 37823319781**
(e2e en Firefox y WebKit completados sin fallos).

## 5. Declarado

- Aprobaciones simuladas (2 OK por hoja en copia) — la release real espera a
  las hojas de Daniel.
- Móvil oscuro, reflow 320 px y movimiento reducido cubiertos por la matriz de
  proyectos de Playwright.
- Medidas con ruido de máquina repetidas y anotadas; nada re-etiquetado.
