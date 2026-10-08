# Fiabilidad — 2026-10-08 (F10-FIAB)

Pregunta a responder con evidencia: **¿puede alguien en Madrid fiarse de lo que
le dice la web hoy?**

Todo lo que sigue está medido, no afirmado. Comandos reproducibles; la salida
bruta está en `fiabilidad-audit.json` (generado por `scripts/fiabilidad-audit.ts`)
y en `F:\Temp\datawardsmadrid-fiabilidad\` (scratch).

## 1. Vigencia y plazos (nivel 1 y nivel 2)

**Medida:** `deadlineState(window, 2026-10-08)` sobre las 52 reglas del bundle
(`npx tsx scripts/fiabilidad-audit.ts`) + muestra determinista de 40 fichas de
nivel 2 (`nivel-2.json`, muestreo por índice `floor(i·N/40)`) cuyo
`accessState` se contrasta contra la fuente oficial en vivo (HTTP + marcador
de la sede CM «…ha finalizado»).

**Resultado nivel 1:**

| Estado | n | Reglas |
|---|---|---|
| ROLLING (continuo) | 44 | resto |
| OPEN | 3 | ayto-escuela-infantil (cierra 2027-05-30), bono-cultural-joven (cierra 2026-10-31), fuenlabrada-fuenlacarenet-2026 (cierra 2027-09-30) |
| CLOSED_RECURRING | 5 | becas-generales-mefp-2026-2027 (cerró 18/05), madrid-beca-comedor-escolar (28/05), madrid-becas-bachillerato-centros-privados (26/05), madrid-cheque-escuela-infantil (08/06), madrid-ayudas-alquiler-plan-estatal (15/12/2025) |

- Reglas «abiertas» con plazo vencido: **0**.
- Reglas «cerradas» que en realidad están abiertas: **0** (todas las
  CLOSED_RECURRING cerraron su ventana citada; la etiqueta «se convoca cada
  año» solo procede de ≥2 ediciones anuales consecutivas citadas).

**Resultado nivel 2:** 40/40 fichas de la muestra coherentes con su fuente
(URL viva; sin OPEN/ROLLING cuya sede marque «plazo finalizado» ni CLOSED sin
marca). 0 mismatches.

**Hallazgo (corregido):** `deadlineState` calculaba la reapertura estimada como
última `previousCall`+1 año ignorando la apertura de la ventana vigente: para
`becas-mec` estimaba 2026-03-24, ya pasada. La estimación **no se renderizaba**
en ninguna vista (latente, no visible). Corregido: la estimación parte de la
última apertura conocida y se omite si cae en el pasado.
Gravedad: BAJO (latente). Commit `d38463c`; tests en `coverage-f2.test.ts`.

## 2. Frescura + F10-INF-2

**Medida:** `data/freshness/runs.jsonl` + estado actual.

- Última corrida CI: 2026-10-07 — 121 comprobadas, 0 errores de descarga,
  45 saltadas (hosts inalcanzables desde el WAF de GitHub Actions).
- Última corrida local: 2026-10-06 — 40 comprobadas, 0 stale.
- Stale ahora mismo: **0**. Sin revalidar >48 h: **0** (las 45 saltadas en CI
  están cubiertas por la corrida local diaria programada).
- Nota honesta: la tarea local diaria se **saltó hoy 08:38** por árbol sucio
  de una sesión anterior — queda pendiente correr `npm run freshness:local`
  como tarea de higiene (no cambia el dato: la web CM responde 200).

**F10-INF-2 (resuelto):** `cm-pensiones-no-contributivas` —
`comunidad.madrid/servicios/asuntos-sociales/pensiones-no-contributivas`
devolvía 404 porque la CM trasladó la página a
`comunidad.madrid/asuntos-sociales/pensiones-no-contributivas` (301→200,
medido 08/10). URL actualizada en `pension-no-contributiva` y re-snapshot
(`sha a2c11c5c`). Commit `3df9a02`. El 404 de `comunidad-emergencia-social`
del 06/10 fue artefacto del WAF ante IPs de GitHub: la URL responde 200
directa desde fuera de CI.

## 3. Importes y parámetros

**Medida:** resolución de los 7 parámetros a 2026-10-08 + tabla de los 52
`amount` citados (en `fiabilidad-audit.json → amounts`).

| Parámetro | Valor 2026 | Fuente | OK |
|---|---|---|---|
| IPREM_DIA | 20 € | Ley 31/2022 (LPGE-23), DA 90.ª a) | ✓ |
| IPREM_MENSUAL | 600 € | id., DA 90.ª b) | ✓ |
| IPREM_ANUAL_12P | 7.200 € | id., DA 90.ª c) | ✓ |
| IPREM_ANUAL_14P | 8.400 € | id., DA 90.ª d) | ✓ |
| SMI_DIA | 40,70 € | RD 126/2026, art. 1 | ✓ |
| SMI_MENSUAL | 1.221 €/mes | id., art. 1 | ✓ |
| SMI_ANUAL | 17.094 € | id., art. 3 | ✓ |

- **IPREM 2026:** la DA 90.ª de la LPGE-2023 fija 600/7.200/8.400 «durante
  2023»; el texto consolidado (snapshot con «última actualización publicada el
  30/09/2026») sigue mostrando la disposición sin modificación — con ninguna
  LPGE posterior que la haya tocado, los valores continúan por prórroga. La
  dependencia documental (una disposición de prórroga literal) queda anotada
  como riesgo BAJO de cita, no de cifra: los propios trámites oficiales
  comprobados en la auditoría siguen publicando topes coherentes con esos
  importes.
- **R4-AZUL (12/14 pagas):** `ayto-tarjeta-azul-discapacidad` usa
  `IPREM_ANUAL_14P` (3× = 25.200 €/año): justificado y declarado — el cuadro
  oficial de la Resolución anualiza a 14 pagas (tope histórico 22.365,42 € =
  42 × IPREM mensual). El resto de reglas con IPREM usan el anual de 12 pagas
  o el que dice su norma.
- **2025 en 2026:** ningún importe de convocatorias 2025 sigue aplicándose;
  los SMI son del RD 126/2026 (vigente 01/01/2026).

## 4. Motor en producción

**Medida:**
- Bundle desplegado descargado de Pages (`…/datos/elegibilidad/bundle.json`)
  → **byte a byte idéntico** al local, digest `a54cccf2…` (antes de la
  corrección de hoy; tras ella el digest nuevo es `34d01103…` y el deploy
  `d7b678b` ya está publicado).
- `npx tsx scripts/eligibility-goldens.ts --bundle <deployed>`:
  **44 personas, 47 expectativas, 0 diferencias** (también sobre el bundle
  local).
- `npm run eligibility:exhaustive` sobre el bundle: **175.451 perfiles,
  0 violaciones de invariantes, 0 violaciones de monotonía, 0 de
  determinismo**.

**Hallazgo BLOQUEANTE encontrado y corregido:** el asistente `/comprobar/` en
producción **no cargaba el bundle** — los fetch del cliente usaban
`process.env.BASE_PATH`, que Next no inyecta en el navegador (solo
`NEXT_PUBLIC_*`): en Pages pedía `/datos/…` en la raíz del dominio → 404 →
«Algo no ha salido bien». Los e2e de producción nunca habían podido ejecutar
el flujo (navegaban a la raíz del dominio). Corregido: `NEXT_PUBLIC_BASE_PATH`
en `next.config.ts` + `check-data.ts` y 2 enlaces `/datos/*` pasados a `Link`.
Commits `4dcaac4`, `a26c8db` + spec `tests/e2e/fiabilidad.spec.ts` que ahora
sí corre el flujo completo contra producción (3/3 verde tras el deploy).

## 5. Asimetría de errores (ADR-017)

**Medida:** auditoría mecánica de los 64 requisitos `hard` del bundle
(`fiabilidad-audit.json → asymmetry`) + test de regresión con perfil vacío.

- **0 requisitos hard dependen de un campo que el cuestionario no pregunta.**
- 12 requisitos hard consultan campos de personas a cargo
  (`dependents.*.age`, `dependents.*.disability`) que el asistente **no
  precisa** (solo pregunta el número de personas a cargo): producen `U` —
  nunca `F`. Dirección segura (UNKNOWN ≠ NO), a costa de que esas ayudas
  quedan en «posible» en vez de «probable». Tabla en el JSON de auditoría.
- `F` solo sale de respuestas definidas que contradicen la condición
  (test: perfil vacío ⇒ 0 hard-F en las 52 reglas).
- F10-REG-6 era un falso negativo real (ver §7) → corregido.

## 6. Front en producción

**Medida:** `tests/e2e/fiabilidad.spec.ts` contra
`https://huntsman1756.github.io/requisito-a-requisito` (Playwright,
Chromium, `PLAYWRIGHT_BROWSERS_PATH=F:\Caches\ms-playwright`).

- Tarjeta «no parece aplicarte»: muestra el requisito que falla **con su cita**
  (extracto literal + localizador + enlace a la fuente oficial) y enlace a la
  ficha completa. Antes solo nombraba el requisito (F10-FRONT-1, corregido en
  `a26c8db`).
- `npm run link:check` sobre las **155 URL citadas** del bundle: **0 fallidas**.
- Etiqueta de revisión: todas las tarjetas del nivel 1 muestran «Comprobada
  con la fuente · **revisión final pendiente**» — coherente con el estado real
  (52/52 `humanReview: pending`). La spec verifica además que una tarjeta no
  puede decir «revisada» si su regla no está aprobada en el bundle servido.
- La rama `panelReview.approved → «revisada por un panel»` existe en el código
  pero el bundle no contiene `panelReview` (ADR-050); en `--strict` el panel ya
  no abre la puerta (corregido en `eligibility-validate.ts`).

## 7. Correcciones aplicadas (hallazgos)

| # | Hallazgo | Gravedad | Corrección |
|---|---|---|---|
| F10-FIAB-A | `/comprobar/` en producción no cargaba el bundle (basePath) | **BLOQUEANTE** | `4dcaac4` + spec e2e producción |
| F10-FRONT-1 | tarjeta no_cumple sin cita ni enlace a la fuente | ALTO | `a26c8db` (cita + ficha en cada requisito F) |
| F10-REG-6 | `ayto-escuela-infantil/residir-madrid` hard → NO indebido para quien «prevea residir» | ALTO | soft + uncovered (`verificacion-ola-11.md`) |
| estimate pasado | `nextOpeningEstimate` podía quedar < hoy | BAJO (latente) | `d38463c` |
| F10-INF-2 | URL de pensiones CM movida | MEDIO | `3df9a02` |
| F10-REG-1/3/5/7 | desfases label/uncovered | BAJO | `28cef77` + uncovered |
| F10-REG-2/4 | confirmados correctos (0–14 inclusivo; ≥67 ya soft) | — | tests de frontera |
| F10-REV-3 | doble hoja de ola 9 (copia F9 con campos vacíos) | BAJO | eliminada la duplicada; queda `evidence/2026-10-06-F3/muestreo-ola-9.md` |
| strict+panel | `--strict` aceptaba `panelReview.approved` | MEDIO | solo `humanReview` (ADR-050) |
| goldens | 12 pins/obsoletos rompían el runner; runner sin versionar | MEDIO | `d7b678b` + tests en npm test |
| `review:apply` | no existía | — | `scripts/review-apply.ts` + 8 tests |
| e2e prod | specs navegaban a `/` ignorando el basePath de Pages | MEDIO | `fiabilidad.spec.ts` con rutas relativas al BASE |

Sin reglas retiradas a `rules-hold/`: ninguna necesitó bajarse.

## 8. Ensayo de release estricta (F10-REL-1)

En `F:\Temp\datawardsmadrid-fiabilidad\release-copy\` (nada de ello se
commitea):

- `--strict` sobre las reglas reales: **0 incluidas, 50 excluidas** — todas
  `ELIG_G10_HUMAN_REVIEW` (52 ficheros → 50 slugs). Hoy **ninguna** regla
  entraría en la release del jurado: faltan las hojas marcadas por Daniel.
- `--strict` con las 52 aprobaciones **simuladas a mano** (escritas en la copia,
  sin pasar por `review:apply` — regla 4.12): 52 incluidas, 0 excluidas
  (digest `87ad707f`). Con ese bundle, la web construye y pasa los 13 e2e +
  axe + spec de fiabilidad en local. Ese ensayo demostró que el build strict y
  la web funcionan; **no** demostró que las hojas aprueban — eso se cubre ahora
  con el test sobre datos reales `tests/eligibility/review-apply-real.test.ts`
  (aplica las hojas reales marcadas en copia y el build estricto real incluye
  los 50 programas / 52 RuleSets). Además, la revisión posterior detectó que
  la pertenencia por `verificacion-ola-N.md` era incorrecta y se reescribió
  (F10-FIX-1: pertenencia desde la propia hoja + `muestreo-indice.json`).
- Falta para la release real: que Daniel marque las hojas `muestreo-ola-*.md`
  (regla ADR-040: 2 por ola, 0 KO) y correr `npm run review:apply` por hoja;
  luego `pages.yml` con `--strict` (F10-REL-2, 14/10).

## 9. Privacidad (bloqueante, ADR-007)

**Medida:** spec de privacidad en producción registrando toda petición.

- 0 peticiones salen del propio sitio (sin telemetría ni terceros; las fuentes
  son `<a>` de salida, no fetch).
- 0 respuestas del perfil en URL, cuerpos o cookies (cookies: ninguna).
- Almacenamiento: solo `rr_*` (`rr_profile` en localStorage si el usuario lo
  pide, `rr_check_handoff` en sessionStorage) — mismo origen, solo navegador.

## Lo que NO pude verificar

- Estado de plazo de las fichas de nivel 2 cuya fuente no escribe el marcador
  «ha finalizado» (BOE/BDNS/las-ayuda): se comprueba URL viva, no el plazo
  editorial dentro de la página — riesgo acotado porque el nivel 2 ya se
  muestra como «sin comprobar».
- Aplicabilidad real del criterio IPREM-14-pagas en tarjeta azul con el IPREM
  vigente: la Resolución (2011) no se republica; nuestra lectura (3×IPREM
  14p vigente) es la defensible y queda declarada en uncovered.
- Si la Administración aplica ya la Ley 4/2026 a dependencia en las sedes
  (la regla lo dice con etiqueta «en revisión» — correcto por diseño).

## Veredicto

**fiable** — tras la corrección del fallo bloqueante de basePath, la web dice
hoy lo que el motor y las fuentes sostienen; el motor (175.451 perfiles, 44
goldens, 155 enlaces citados) no produjo una sola contradicción, y toda
regla pendiente lo declara como «revisión final pendiente».
