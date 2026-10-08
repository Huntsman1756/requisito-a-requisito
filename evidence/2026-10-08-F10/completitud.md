# F10 — Completitud: pruebas incorporadas, release bloqueada

Revisión del 08/10/2026, desde `f0695fb`. No se han modificado reglas ni aplicado aprobaciones humanas. Los problemas encontrados quedan para Daniel, conforme al alcance solicitado.

## Resultado medido

| Comprobación | Normal | Strict simulado |
|---|---:|---:|
| Versiones con al menos un positivo válido en el motor | 52/52 | 52/52 |
| Programas con golden positivo que coincide con el motor | 50/50 | 50/50 |
| Fichas de nivel 1 que cargan | 49/50 | 49/50 |
| Programas identificados en explorar por slug o URL del canal | 0/50 | 0/50 |
| Personas positivas tras pasar por el formulario | 47/50 | 47/50 |
| Entradas de nivel 2 con página propia | 0/401 | 0/401 |
| Entradas de nivel 2 encontradas por título con enlace oficial HTTPS | 401/401 | 401/401 |

Detalle de todos los errores y huellas de ambos bundles en [completitud.json](completitud.json). El test falla deliberadamente ante esos resultados; no se han silenciado ni convertido en expectativas aceptadas.

## Hallazgos pendientes

1. **Ficha 404:** `becas-generales-mefp-2026-2027`. `src/app/ayudas/[slug]/page.tsx:68` obtiene los slugs desde nombres de fichero, que aquí no coinciden con `benefitSlug`.
2. **Inventario de nivel 1:** `Explorer.tsx:59` carga únicamente nivel 2. `publish-public-data.ts:124–140` excluye sus URLs si ya están en reglas. No se identifica ninguno de los 50 programas por slug o URL exacta del canal. La comparación por URL exacta no demuestra que no exista alguna entrada equivalente con otro identificador; sí incumple el inventario solicitado y exige una identidad explícita.
3. **Página propia de nivel 2:** las 401 entradas tienen enlace externo oficial visible en el buscador, pero `/ayudas/<slug>/` devuelve 404. El producto actual no genera esas páginas. Es un incumplimiento del criterio solicitado, no una afirmación de que sus enlaces externos estén rotos.
4. **Se pierde precisión al continuar el formulario:** tres goldens positivos terminan con «FALTAN DATOS»: `gp-abono-infantil-getafe`, `gp-beca-comedor-fuencarral` y `gp-permiso-madre-parla`. `QuestionStep.tsx:74–84` reconstruye dependientes con edades de 0 a 130 años. Las tarjetas siguen presentes, pero dejan de ser opciones positivas. No se modifica ese comportamiento en esta sesión.

## Barrido y goldens

[Alcanzabilidad](alcanzabilidad.md) contiene la tabla completa de 52 versiones, evaluadas en su ventana de vigencia. Se recorrieron **4.376.596 combinaciones cartesianas discretizadas**, sin recorte: 1.744.758 no cumplen el esquema del perfil y **no cuentan como testigos positivos**; hay 1.711.728 positivos válidos, cero versiones sin positivo válido y cero fallos de invariantes. No hubo programas por encima del 95 % de `no_cumple` en el dominio generado. Esta distribución no representa a la población.

La diferencia respecto a los 259.391 perfiles anteriores incluye las dos versiones futuras, evaluadas en `validFrom`, y la expansión completa de Renta Mínima de Inserción: 4.118.400 combinaciones frente a las 1.495 de pares y fronteras del barrido anterior. La comprobación de completitud pide el cartesiano completo al generador existente; el barrido histórico y el motor conservan su comportamiento.

Se añaden seis personas ficticias derivadas de requisitos citados, con revisión `pending`: [hoja separada de revisión](goldens-completitud.md). Quedan 50 goldens con 53 expectativas. Cubrir un programa con un golden **no aprueba su regla ni verifica su correspondencia jurídica**.

## Ruta ejecutada y puerta de release

- `check → lint → test → build`: PASS; 550 tests en 42 ficheros. `validate:full`: PASS.
- Tres tests de Playwright sobre el export normal: FAIL por los hallazgos anteriores.
- `qa-strict.ts` aplica marcas simuladas con `review:apply` **a copias en scratch**. Se exportó ese bundle estricto sin reconstruirlo en modo normal. `release:verify`: PASS, 52 RuleSets / 50 programas, SHA256 correcto y aprobaciones simuladas. Alcanzabilidad sobre ese export: PASS. Los tres tests web sobre su huella servida: FAIL, con los mismos hallazgos.
- Tras el ensayo se restauró el build normal. El cambio final de transporte de fixtures (stdout, sin fichero compartido entre workers) se comprobó nuevamente con el test de inventario: mismos 51 hallazgos de nivel 1. Las corridas completas anteriores ya tenían las mismas aserciones y perfiles.
- `validate:release` incorpora cobertura de goldens y alcanzabilidad mediante `completeness:verify`, y los tres checks web mediante `completeness:web`. Pages instala Chromium cuando se active strict. **No se ha activado strict ni adelantado el deploy del 14/10.** Con las hojas reales pendientes, la ruta strict se bloqueará primero por falta de aprobaciones; con las aprobaciones simuladas, se bloquea después por completitud.

No se ejecutaron estos nuevos checks en Firefox/WebKit. Los perfiles se introducen mediante la persistencia nativa, con fecha controlada, y luego recorren los controles reales del formulario; no equivalen a teclear todos los campos desde cero. Se muestran también las ayudas cerradas para comprobar inventario. Quedan pendientes la revisión humana de las normas y los cinco casos reales de Daniel.
