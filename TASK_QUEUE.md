# Cola de tareas

**Producto: Requisito a Requisito (ADR-029). Categoría: Global Tech Impact (ADR-028).** **Fase activa: F3** — orden decidido el 2026-10-05: **F3-FIX → F6-0 → F4 → F3 lote 2 + golden → F9 → F8/F5 → F7** — F0/F1/F2 cerradas el 2026-10-05. Próximo: F3 lotes (reglas Madrid citadas) → F3-R/G/M; después F4.
Detalle en `phases/`. Estados: `TODO` · `EN CURSO (fecha)` · `HECHO (commit · evidencia)` · `BLOQUEADO: motivo — quién`.

| ID | Tarea | Resp. | Fecha obj. | Depende | Estado | Evidencia / notas |
|---|---|---|---|---|---|---|
| F0-1 | Fuentes de la Orden con sha256, citas art./pág., formato de memoria y órgano de consulta | agente | 06/10 | — | HECHO (2026-10-05 · evidence/2026-10-05-F0/fuentes/) | sha256 en manifest.json; docs/00 con citas art./pág.; órgano de consulta en docs/06. La Orden NO fija formato/extensión de la memoria (art. 12.1.b). |
| F0-2 | Enviar la consulta de elegibilidad (`docs/06`) | **Daniel** | 06/10 | F0-1 | HECHO (2026-10-05, enviada por Daniel) · respuesta pendiente; regla por defecto ADR-027 (sin respuesta el 12/10 ⇒ Leader) | |
| F0-3 | Inventario de impacto real | agente | 06/10 | — | HECHO (2026-10-05 · evidence/2026-10-05-F0/impacto/inventario.json) | Repos privados (0 stars); GA4 de edubecas sin acceso — cifras de tráfico quedan BLOQUEADO — Daniel |
| F0-4 | Worktree + línea base | agente | 05/10 | — | HECHO (2026-10-05 · evidence/2026-10-05-F0/baseline.json) | check PASS; test 750/750; build PASS; a11y 12/12. Sin pipeline:authority en main (desviación documentada) |
| F0-5 | Ayudas candidatas del vertical con autoridad | agente | 06/10 | F0-4 | HECHO (2026-10-05 · evidence/2026-10-05-F0/vertical/candidatas.json) | 16 candidatas con autoridad vigente (8 open, 6 rolling, 2 unknown) ≥ 8 ✓ |
| F0-7 | **Andamiaje del proyecto en este repo** (phases/F0 F0-7) | agente | 06/10 | — | HECHO (2026-10-05 · feat(f0-7)) | check/lint/test/build PASS + e2e smoke 1/1 |
| F0-8 | **Portar `6595a533`** (Zod) del worktree de la-ayuda | agente | 06/10 | F0-7 | HECHO (2026-10-05 · feat(f0-8)) | 36 tests schema en verde; worktree conservado |
| F0-9 | **Importar el catálogo** de la-ayuda con procedencia (docs/13 §2) | agente | 06/10 | F0-7 | HECHO (2026-10-05 · feat(f0-9)) | 244 (57 Madrid + 187 estatales) + 332 pistas; determinismo test OK |
| D-6 | Nombre | Daniel | — | — | HECHO (ADR-029) | **Requisito a Requisito**; dominio propio después |
| F0-6 | Navegadores de Playwright en la caché de F: | agente | 06/10 | F0-4 | HECHO (2026-10-05 · baseline.json) | chromium-1228, firefox-1532, webkit-2311 ya en F:\Caches\ms-playwright |
| F0-3b | Search Console de edubecas.es aportado por Daniel | agente | 05/10 | — | HECHO (2026-10-05 · evidence/2026-10-05-F0/impacto/edubecas-search-console-resumen.json) | 1 clic / 1.128 impresiones en 75 días (posición ~71). **No es tracción: no se cita como impacto** |
| F0-5b | **Inventario de candidatas al nivel 1, ámbito Comunidad de Madrid (ADR-021)**, sobre el catálogo importado en F0-9 + pistas BOCM | agente | 06/10 | F0-4 | HECHO (2026-10-05 · evidence/2026-10-05-F0/vertical/candidatas-madrid.json) | 24 candidatas en plazo/rolling; 12 priorizadas nivel 1 ≥ 8 ✓ |
| D-1 | Vehículo | **Daniel** | — | — | HECHO (2026-10-05 · ADR-022) | Proyecto nuevo, solo Madrid; la-ayuda y EduAyudas como donantes de solo lectura |
| D-4 | Repo público | Claude (delegado) | — | — | HECHO (ADR-025/030/036) | `requisito-a-requisito`, público; lo crea el agente con `gh` tras comprobar que no hay secretos |
| D-5 | Categoría | **Daniel** | — | — | HECHO (ADR-028) | **Global Tech Impact**: confirmada la admisión de persona física por la Subdirección (`evidence/2026-10-05-consulta/`) |
| F1-1..8 | Zod, registro de dominios, snapshot, validate (G1–G10), build, parámetros, INE y catálogo de preguntas | agente | 07/10 | F0-4 | HECHO (2026-10-05 · commits be24d10…61002d0) | registry, snapshot+normalize, G1–G10 con negativos, build con digest, IPREM/SMI BOE, INE 2026 (19 CCAA/52 prov/8132 mun), preguntas ≤10 visibles. 101 tests |
| F2-1..15 | Motor: intervalos, Kleene, operadores, territorio, parámetros, derivados, veredicto + oráculo, «qué te falta», plazo, esfuerzo, invariantes, explicaciones, exhaustivo y rendimiento | agente | 08/10 | F1-1 | HECHO (2026-10-05 · commits 9f3a43c, 7521a82, 2849e17) | Motor puro completo; 151 tests; exhaustivo 0 violaciones en 3 fixtures; pureza verificada; microbench 25 evals <5ms. Pendiente: exhaustivo sobre reglas reales (F3) |
| F3-FIX | Correcciones de rigor del lote 1 (G11 + citas rango 1-2 + birthYear + vigencia bono social) | agente | 06/10 | — | HECHO (2026-10-05 · commit de4…· G11 con test negativo; G4 cubre citas de hojas; Renfe→RD 1621/2005; subsidio→LGSS arts. 274-280; BCJ→birthYear; bono social→42,5/57,5 % por RDL 7/2026) | lote-1.md regenerado — **Daniel ya puede revisar** |
| F6-0 | Walking skeleton público | agente | 07/10 | F3-FIX | HECHO (2026-10-05 · repo público creado + push, Pages por workflow, run en curso) | github.com/Huntsman1756/requisito-a-requisito → huntsman1756.github.io/requisito-a-requisito |
| F9 | **Job diario de frescura** (phases/F9) | agente | 11/10 | F6-0 | TODO | Debe funcionar solo hasta el 05/11 |
| F3 lotes | Reglas citadas del vertical (lotes de 4–6) | agente | 10/10 | F1, F0-5 | EN CURSO (2026-10-05 · lote 1: 6/6 ayudas, 0 errores, 20 tests frontera, 340 perfiles exhaustivos 0 violaciones) | evidence/2026-10-05-F3/lote-1.md **pendiente revisión Daniel (G10)** |
| F3-R | Revisión de lotes de reglas | **Daniel** | por lote | F3 lote | TODO | |
| F3-G | ≥ 12 personas golden + revisión | agente + **Daniel** | 10/10 | F3 lotes | TODO | |
| F3-M | Mutación: 0 supervivientes | agente | 10/10 | F3-G | TODO | |
| F4-1..12 | Diseño y frontend | agente | 11/10 | F2 | EN CURSO — núcleo HECHO (2026-10-05): /comprobar completo + resultados + nivel 2 + /ayudas/[slug] + datos abiertos + revisión visual independiente aplicada (2 commits) | Pendiente: wireframes formales, matriz de proyectos, opt-in profile, en |
| F4-W | Vistazo a las capturas de diseño (no bloqueante) | **Daniel** | 09/10 | F4-2 | LISTO PARA VER — `evidence/2026-10-05-F4/capturas/` (16 PNG, 375/1366) | |
| F5-1..11 | QA transversal (10 proyectos, a11y, visual, rendimiento, privacidad, full) | agente | 12/10 | F4 | TODO | |
| F5-M | Checklist manual en dispositivos reales | **Daniel** | 12/10 | F5-2 | TODO | |
| D-3 | Demo desplegada | Claude (delegado) | — | — | HECHO (ADR-030) | GitHub Pages; dominio propio más adelante |
| F6-1..5 | Vídeo, capturas, (demo), comprobaciones posteriores | agente | 13/10 | F5 | TODO | |
| D-2 | Categoría definitiva | **Daniel** | — | — | HECHO (ADR-028) | Impact |
| D-7 | Contador de uso | Claude (delegado) | — | — | HECHO (ADR-032) | No; impacto por sesiones y testimonios |
| D-8 | Cobertura | Claude (delegado) | — | — | HECHO (ADR-033) | `@vitest/coverage-v8` autorizado |
| F8-1..6 | **Piloto real** (phases/F8): demo piloto, kit de sesión, 3–10 sesiones, testimonios con permiso, consolidación | agente + **Daniel** | 13/10 | F3 lote 1, F4 mínimo, D-3/D-4/D-6 | TODO | Clave para el 50 % de impacto |
| F7-1..8 | Evidencia, memoria, veracidad y paquete | agente | 14/10 | F0-3 … F6 | TODO | |
| P-1 | Firmar y presentar en la sede | **Daniel** | 15/10 | F7 | TODO | Límite absoluto 16/10 |
