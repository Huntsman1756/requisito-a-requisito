# Cola de tareas

**Fase activa: F0** — reorientada el 2026-10-05 a **proyecto nuevo e independiente en este repo** (ADR-022). Próximo: F0-7 → F0-8 → F0-9 → F0-5b; después F1/F2.
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
| D-6 | Nombre del producto (provisional «Ayudas Madrid · con fuente») y dominio/subdominio de la demo | **Daniel** | 08/10 | — | TODO | Necesario para F4-1 y F6 |
| F0-6 | Navegadores de Playwright en la caché de F: | agente | 06/10 | F0-4 | HECHO (2026-10-05 · baseline.json) | chromium-1228, firefox-1532, webkit-2311 ya en F:\Caches\ms-playwright |
| F0-3b | Search Console de edubecas.es aportado por Daniel | agente | 05/10 | — | HECHO (2026-10-05 · evidence/2026-10-05-F0/impacto/edubecas-search-console-resumen.json) | 1 clic / 1.128 impresiones en 75 días (posición ~71). **No es tracción: no se cita como impacto** |
| F0-5b | **Inventario de candidatas al nivel 1, ámbito Comunidad de Madrid (ADR-021)**, sobre el catálogo importado en F0-9 + pistas BOCM | agente | 06/10 | F0-4 | HECHO (2026-10-05 · evidence/2026-10-05-F0/vertical/candidatas-madrid.json) | 24 candidatas en plazo/rolling; 12 priorizadas nivel 1 ≥ 8 ✓ |
| D-1 | Vehículo | **Daniel** | — | — | HECHO (2026-10-05 · ADR-022) | Proyecto nuevo, solo Madrid; la-ayuda y EduAyudas como donantes de solo lectura |
| D-4 | **Crear el repo GitHub público** de este proyecto (ADR-025) y autorizar el push. Al ser nuevo, no hay historial heredado que auditar; el agente comprueba que no haya secretos antes del primer push | **Daniel** (decisión) + agente (escaneo) | 08/10 | — | TODO | Sin esto, el ecosistema queda en promesa |
| D-5 | Categoría: con los datos de F0, **recomendación: Leader** si no hay respuesta afirmativa sobre Impact antes del 12/10 | **Daniel** | ≤ 12/10 | F0-2 | TODO | Ver docs/01 «Evaluación tras F0» |
| F1-1..8 | Zod, registro de dominios, snapshot, validate (G1–G10), build, parámetros, INE y catálogo de preguntas | agente | 07/10 | F0-4 | TODO (F1-1 se porta en F0-8) | |
| F2-1..15 | Motor: intervalos, Kleene, operadores, territorio, parámetros, derivados, veredicto + oráculo, «qué te falta», plazo, esfuerzo, invariantes, explicaciones, exhaustivo y rendimiento | agente | 08/10 | F1-1 | TODO | |
| F3 lotes | Reglas citadas del vertical (lotes de 4–6) | agente | 10/10 | F1, F0-5 | TODO | |
| F3-R | Revisión de lotes de reglas | **Daniel** | por lote | F3 lote | TODO | |
| F3-G | ≥ 12 personas golden + revisión | agente + **Daniel** | 10/10 | F3 lotes | TODO | |
| F3-M | Mutación: 0 supervivientes | agente | 10/10 | F3-G | TODO | |
| F4-1..12 | Diseño y frontend | agente | 11/10 | F2 | TODO | |
| F4-W | Aprobación de wireframes | **Daniel** | 08/10 | F4-2 | TODO | |
| F5-1..11 | QA transversal (10 proyectos, a11y, visual, rendimiento, privacidad, full) | agente | 12/10 | F4 | TODO | |
| F5-M | Checklist manual en dispositivos reales | **Daniel** | 12/10 | F5-2 | TODO | |
| D-3 | Demo: despliegue autorizado o solo vídeo | **Daniel** | 11/10 | — | TODO | |
| F6-1..5 | Vídeo, capturas, (demo), comprobaciones posteriores | agente | 13/10 | F5 | TODO | |
| D-2 | Categoría definitiva (ADR-005) — se cierra con D-5 | **Daniel** | ≤ 13/10 | F0-2 | TODO | |
| F7-1..8 | Evidencia, memoria, veracidad y paquete | agente | 14/10 | F0-3 … F6 | TODO | |
| P-1 | Firmar y presentar en la sede | **Daniel** | 15/10 | F7 | TODO | Límite absoluto 16/10 |
