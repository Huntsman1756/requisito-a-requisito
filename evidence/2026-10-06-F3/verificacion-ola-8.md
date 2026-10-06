# Verificación independiente — ola 8 (ADR-040/044/045/046, R5-VERIF)

Verificador independiente: segunda pasada completa sobre los textos
oficiales, ajena a la redacción de los RuleSet. Fecha: 2026-10-06. Ámbito:
los 6 RuleSet nuevos de la ola 8 (municipios grandes + programas CM
pendientes), sus fuentes snapshot y sus goldens:

- `mostoles-prestaciones-social**es**` → `mostoles-prestaciones-sociales.json` + `gp-mostoles-prestaciones`
- `leganes-prestaciones-especial-necesidad` → `leganes-prestaciones-especial-necesidad.json` + `gp-leganes-prestaciones`
- `fuenlabrada-prestaciones-sociales` → `fuenlabrada-prestaciones-sociales.json` + `gp-fuenlabrada-prestaciones`
- `fuenlabrada-fuenlacarenet-2026` → `fuenlabrada-fuenlacarenet-2026.json` + `gp-fuenlabrada-prestaciones`
- `madrid-accede-prestamo-libros` → `madrid-accede-prestamo-libros.json` + `gp-accede-estudiante`
- `madrid-ayuda-pago-unico-vg` → `madrid-ayuda-pago-unico-vg.json` + `gp-vg-pago-unico`

**Fuentes nuevas (7 snapshots, 6 de rango 1):**

| id | rango | contenido |
|---|---|---|
| bocm-20220223-mostoles-ordenanza-prestaciones | 1 | Ordenanza de prestaciones sociales individuales de Móstoles (Pleno 28/10/2021, BOCM 46 de 23/02/2022, doc. 56) |
| bocm-20230328-leganes-ordenanza-prestaciones | 1 | Ordenanza de prestaciones económicas por especial necesidad de Leganés (aprobación definitiva 14/03/2023, BOCM 74 de 28/03/2023, doc. 62) |
| bocm-20130920-fuenlabrada-ordenanza-prestaciones | 1 | Ordenanza de prestaciones sociales individuales de Fuenlabrada, texto íntegro (BOCM 224 de 20/09/2013, doc. 45) |
| fuenlabrada-ordenanza-prestaciones | 2 | Mismo texto en la web de transparencia municipal (idéntico contenido, comprobado art. por art.) |
| bocm-20260521-fuenlacarenet | 1 | Bases + convocatoria #FuenlaCareNet (extracto; bases completas BDNS 905282) |
| bocm-20181214-decreto-168-accede | 1 | Decreto 168/2018, Reglamento del Programa Accede (BOCM 297 de 14/12/2018, doc. 18) |
| bocm-20191213-orden-3616-accede | 1 | Orden 3616/2019 (desarrollo: plazos, fianza, calendario) |
| bocm-20260826-orden-3286-accede | 1 | Orden 3286/2026, de 24/08/2026 (modifica Orden 3616/2019: nuevo calendario hasta 2030 + cuantías 2026/27) |
| bocm-20221202-orden-2739-vg | 1 | Orden 2739/2022 (normas reguladoras de la ayuda de pago único por violencia de género) |

**Método.** (1) Script de chequeo de citas: recorre las **78 citas** de los
6 rulesets; inclusión literal del extracto en el `.txt` de cada fuente
(0 ausentes tras corrección de artefactos tipográficos del PDF) y
`rules:fill-hashes` que rellena y verifica `excerptSha256` contra los
snapshots. (2) `F:\Temp\datawardsmadrid-verif8\run-golden.mts`:
`evaluateRuleSet` real del motor con `{today, catalog, parameters}` del
repo: las 6 expectativas reproducen veredicto `posible` y
`deadlineState` (ROLLING u OPEN) con `invariantsEnabled` (I1–I10). (3)
Lectura afinidad claim↔extracto en contexto. (4) `eligibility:validate` →
45 rulesets, 0 errores. (5) Comprobaciones R5-VERIF: vigencia del
programa, IPREM 12/14 pagas, nivel administrativo, códigos INE del
`territory.json`, URLs de canal con `curl` (3 URLs corregidas a páginas
que responden 200), colisión de slugs (ninguna).

**Códigos INE corregidos en verificación:** Móstoles 28092 (no 28135),
Fuenlabrada 28058 (no 28061) — erratas del autor detectadas contra
`data/eligibility/territory.json`; Leganés 28074 correcto.

| Ayuda | Dictamen | Motivo principal |
|---|---|---|
| mostoles-prestaciones-sociales | **OK** | 15 citas íntegras y afines; arts. 3, 4.1-4.2, 13.1-13.2 verificados en contexto; tabla IPREM del art. 5 (1×/1,5×/1,8×/2×/2,2× IPREM según miembros) trasladada al label del requisito soft; vigencia acreditada (ficha oficial del Ayto.: aprobación 28/10/2021, en vigor desde 24/02/2022, sin modificación posterior) |
| leganes-prestaciones-especial-necesidad | **OK** | 15 citas íntegras; art. 3.a-f completo (6 meses de empadronamiento con excepciones, deducción 50 % hipoteca/alquiler máx. 500 €), anexo I (100–215 % IPREM según miembros) y anexo IV (documentación) verificados; ordenanza vigente (aprobación definitiva 2023, sin derogatoria) |
| fuenlabrada-prestaciones-sociales | **OK (con observación)** | 12 citas íntegras; arts. 4.1-4.5, 5, 7.1, 10 verificados; baremo art. 7 (665,33–1.147,95 €/mes según miembros) trasladado al label; **observación registrada en `uncoveredRequirements`**: proyecto de nueva ordenanza aprobado por JGL (exp. 2025/GPR_01/003828) — el texto de 2013 sigue vigente hasta su aprobación definitiva y publicación |
| fuenlabrada-fuenlacarenet-2026 | **OK** | 6 citas íntegras; ventana abierta (segundo periodo 01/10/2026–30/09/2027) comprobada en el extracto BOCM; el requisito c) (derivación por Servicios Sociales) queda como no comprobable — decisión coherente con el cuestionario |
| madrid-accede-prestamo-libros | **OK** | 8 citas íntegras en 3 fuentes rango 1; arts. 2, 5 del Decreto 168/2018 (adhesión voluntaria, entrega en junio con excepciones a-e), art. 3 de la Orden 3616/2019 (fianza 5–60 €) y Orden 3286/2026 (vigencia/calendario hasta 2030) verificados |
| madrid-ayuda-pago-unico-vg | **OK** | 9 citas íntegras; art. 3.a-e completo, art. 5.2 (renta per cápita con responsabilidades) en label y aviso, art. 8 (cuantías 6–24 meses) verificado; IPREM no aplica — la norma usa 75 % del SMI excluidas pagas extra ⇒ `SMI_MENSUAL × 9` = 915,75 €/mes = 10.989 €/año, coherente con la sede («915,75 € al mes en 2026») |

**Comprobaciones transversales:**

- **IPREM 12 vs 14 pagas**: Móstoles y Leganés citan «IPREM» sin más
  precisión ⇒ `IPREM_ANUAL_12P` por convención del proyecto. La ayuda VG
  usa SMI, no IPREM. Ningún mutante del tipo tarjeta-azul (14P) aplica.
- **Vigencia del programa** (ADR-045): las 6 reglas modelan programas con
  vigencia acreditada o ventana abierta a fecha 2026-10-06. FuenlaCareNet
  con `opensAt/closesAt` literales de las bases. Fuenlabrada con la
  observación de nueva ordenanza en tramitación (flag para F9).
- **Nivel administrativo**: 4 municipales (Móstoles, Leganés y 2 de
  Fuenlabrada) + 2 autonómicas; todas dentro del ámbito CM.
- **UNKNOWN ≠ NO**: los requisitos no comprobables están en
  `uncoveredRequirements` (derivación social, títulos de VG, situación de
  necesidad valorada, excepciones de empadronamiento); los umbrales
  dependientes del tamaño de la unidad se modelan soft con la tabla
  completa en el label.
- **G2/G11/G12**: las 6 reglas son `standalone` y todas las citas de
  requisitos, importes, plazos y canales usan fuentes de rango 1–2
  (rango 1 en todas salvo la consolidada de Fuenlabrada como fuente
  informativa adicional). `verification` queda `ok` tras este dictamen;
  `humanReview` permanece `pending`.

Resultado: **6/6 reglas aprobadas para merge** (`verification.status: ok`,
`by: verificador-independiente`, `at: 2026-10-06`).
