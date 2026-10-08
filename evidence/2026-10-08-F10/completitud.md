# F10 — Completitud: hallazgos corregidos, 0 pendientes

Revisión del 08/10/2026, iniciada desde `f0695fb`. Los cuatro hallazgos de la
primera medición quedaron corregidos en esta misma fecha y la comprobación se
repitió en normal y en el ensayo estricto simulado. No se han modificado reglas
(`data/eligibility/rules`) ni aplicado aprobaciones humanas reales.

## Resultado medido (tras la corrección)

| Comprobación | Normal | Strict simulado |
|---|---:|---:|
| Versiones con al menos un positivo válido en el motor | 52/52 | 52/52 |
| Programas con golden positivo que coincide con el motor | 50/50 | 50/50 |
| Fichas de nivel 1 que cargan (`/ayudas/<benefitSlug>/`) | 50/50 | 50/50 |
| Programas de nivel 1 en `/explorar/` con enlace a su ficha y marca «comprobada requisito a requisito» | 50/50 | 50/50 |
| Enlaces internos `/ayudas/<slug>/` rotos en el export | 0 | 0 |
| Personas positivas tras pasar por el formulario real | 50/50 | 50/50 |
| Entradas de nivel 2 en `/explorar/` con enlace oficial HTTPS (ADR-052) | 401/401 | 401/401 |

`completeness:web` (desktop-chromium): **4/4 tests en verde en ambos modos**
(inventario nivel 1, enlaces internos, persona positiva, inventario nivel 2).
Ensayo strict: aprobaciones simuladas con `review:apply` sobre copia en
scratch (`qa-strict.ts`, regla 4.12 — declarado, no es revisión humana);
`out/…/bundle.json` sha256 = `57faef79…c1f2661e11`, idéntico al bundle
estricto generado. Tras el ensayo se restauró el build normal
(`fe2b9a53…f74550a8ac2`).

## Hallazgos y corrección

1. **Ficha 404 — RESUELTO.** `becas-generales-mefp-2026-2027` cargaba por
   nombre de fichero (`becas-mec-universidad-2026-2027`). La resolución
   slug → RuleSet se extrajo a `src/lib/rule-pages.ts` y tanto
   `generateStaticParams` como la carga usan `benefitSlug`. Test sobre datos
   reales: `tests/eligibility/fichas-slug.test.ts` (todo fichero de reglas
   aporta su `benefitSlug`, todo slug del bundle resuelve ficha). El spec e2e
   además barre los enlaces internos `/ayudas/<slug>/` del export.
2. **Edades de personas a cargo — RESUELTO.** `QuestionStep.tsx` pedía solo
   «n personas» y fabricaba dependientes de 0–130 años, así que las reglas por
   edad de los hijos quedaban «faltan datos». En el MISMO paso (siguen siendo
   ≤ 10 preguntas), cuando n > 0 se pide la edad de cada persona con la opción
   «Prefiero no decirlo» por persona ⇒ rango desconocido (UNKNOWN ≠ NO). El
   campo `disability` de un dependiente ya respondido se conserva. La revisión
   previa muestra «n · edades». Los 3 goldens afectados
   (`gp-abono-infantil-getafe`, `gp-beca-comedor-fuencarral`,
   `gp-permiso-madre-parla`) salen positivos por la ruta real del formulario.
3. **Nivel 1 en `/explorar/` — RESUELTO.** `publish-public-data.ts` publica
   `nivel-1.json` desde el **bundle** (en `--strict`, solo las aprobadas —
   ADR-050); `Explorer.tsx` las lista con la marca «Comprobada requisito a
   requisito» y enlace a `/ayudas/<benefitSlug>/`, sin duplicar la entrada de
   nivel 2 (dedup por URL oficial, como antes). Las reglas excluidas del
   bundle reaparecen como entradas de catálogo de nivel 2 con su enlace
   oficial (ADR-052).
4. **Página propia de nivel 2 — CERRADO por diseño (ADR-052).** El nivel 2 es
   un catálogo con enlace oficial HTTPS; no se generan 401 fichas sin regla
   verificada. El criterio del test pasa a ser «aparece en /explorar/ con
   enlace oficial HTTPS» con referencia al ADR; no se silenció la aserción.

## Medición anterior (08/10, antes de la corrección — trazabilidad)

| Comprobación | Normal | Strict simulado |
|---|---:|---:|
| Fichas de nivel 1 que cargan | 49/50 | 49/50 |
| Programas identificados en explorar | 0/50 | 0/50 |
| Personas positivas por formulario | 47/50 | 47/50 |
| Entradas de nivel 2 con página propia | 0/401 | 0/401 |

Detalle de aquellos errores en `completitud.json` (histórico).

## Barrido y goldens

[Alcanzabilidad](alcanzabilidad.md) contiene la tabla completa de 52
versiones: 4.376.596 combinaciones cartesianas discretizadas, 0 versiones sin
positivo válido, 0 fallos de invariantes. Los seis goldens ficticios de
cobertura siguen con revisión `pending` en
[goldens-completitud.md](goldens-completitud.md); cubrir un programa con un
golden **no aprueba su regla**.

## Estado

`check → lint → test → build`: PASS (553 tests en 43 ficheros, incluido el
nuevo `fichas-slug.test.ts` sobre datos reales). `completeness:web` en normal
y en strict simulado: 4/4. Quedan pendientes la revisión humana de las hojas
(Daniel), el piloto y los checks web en Firefox/WebKit.
