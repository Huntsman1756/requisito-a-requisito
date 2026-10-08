# Handoff — revisión del agente antes de Daniel

Checkout revisado: `be56fc2`, con correcciones locales de esta unidad.
Informe: `evidence/2026-10-08-F10/revision-agente.md`.

- IPREM corroborado con SEPE actual y Ley 31/2022: 600 €/mes,
  7.200 €/año ordinario y 8.400 € con extraordinarias donde corresponda.
- Corregida evidencia de QA: `npm run build` regeneraba el bundle normal.
  Ensayo repetido con `next build` directo y huella del export estricta
  comprobada; aprobaciones simuladas en copia, 52 RuleSets, goldens 47/47,
  Chromium + reflow 32/32 (axe, privacidad, teclado y zoom incluidos).
- Firefox/WebKit CI verde era build normal; strict sigue pendiente.
- `memoria:cifras`: 527/527 tests, 38 ficheros. Memoria y veracidad
  actualizados; PDF regenerado (cinco páginas renderizadas e inspeccionadas).
- Checklist corregido a la veracidad vigente y condición de borrador.
- `validate:full` verde; export normal restaurado, ninguna aprobación real
  escrita ni workflow cambiado. No se hizo push ni deploy.

Siguiente tarea propia: F10-META-MOSTOLES, incoherencia de `parametersUsed`
(12P declarado frente a 14P usado). Requiere corrección y verificación antes
de aplicar 12d. La condición actual sí usa 14P; no es un cambio de cálculo.
No se considera lista para aprobar esa hoja con este metadato pendiente.

Después: comprobar log de frescura el 09/10 (la tarea Ready no demuestra
revalidación: último log todavía registra árbol sucio), recibir las hojas
de Daniel y aplicar con review:apply. QA completo de la release realmente
aprobada, piloto y entrega del 14/10 siguen en su calendario.

CI consultado: seis runs recientes completados en verde, incluido
37823319781 de Firefox/WebKit normal. Son anteriores a estas correcciones.
