# F10 — Completitud, 08/10/2026

Implementada la petición de comprobar que todos los programas son alcanzables y aparecen en el export. Revisión secuencial, sin subagentes. Ninguna regla ni aprobación humana modificada.

Motor: 52/52 versiones alcanzables por un perfil positivo válido; 50/50 programas con golden positivo. Barrido cartesiano completo: 4.376.596 combinaciones, incluyendo RMI sin recorte; los 1.744.758 perfiles fuera del esquema no acreditan positivos. Se añaden seis goldens pendientes de revisión en `evidence/2026-10-08-F10/goldens-completitud.md`. Barrido completo y límites en `alcanzabilidad.md`. Commits de motor/goldens: `50c9399`, `0270f36`; inventario y cierre en el commit de este handoff.

**Release bloqueada por completitud**, además de las hojas humanas pendientes: una ficha L1 404, los 50 programas sin identidad en explorar, las 401 entradas L2 sin página propia y tres personas positivas que terminan como «faltan datos» tras el formulario. Informe y errores completos: `evidence/2026-10-08-F10/completitud.md` y `.json`. No corregirlos sin la petición de Daniel: la sesión tenía alcance de pruebas y documentación.

`check → lint → test → build` y `validate:full` verdes (550 tests / 42 ficheros). Web normal y strict simulado: los tres checks fallan por los mismos defectos. `release:verify` estricto simulado pasó con 52/50 y SHA comprobado. Las marcas se aplicaron mediante la herramienta real, exclusivamente sobre copias en scratch; no es revisión humana. Se restauró el export normal.

`validate:release` ya incluye `completeness:verify` y `completeness:web`. Pages instala Chromium solo para strict. `RELEASE_MODE` no se cambia. Los nuevos checks solo se han ejecutado en Chromium; Firefox/WebKit siguen pendientes para esta comprobación.

Siguiente paso: Daniel revisa los hallazgos y las hojas (empezar por 12d); el agente corrige solo lo que se solicite. Mantener aparte la revisión normativa, los goldens y las aprobaciones. Piloto y cinco casos reales aún pendientes.

Estado de push/CI: se registra al cerrar en la respuesta y mediante `gh run list`; este handoff pertenece al commit de cierre F10-COMP-WEB.
