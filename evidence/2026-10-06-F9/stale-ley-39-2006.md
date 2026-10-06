# F9 — Fuente STALE: boe-ley-39-2006-dependencia

Detectado por `scripts/freshness.ts --dry-run` el 2026-10-06.

El texto consolidado de la Ley 39/2006 en el BOE fue republicado el
**03/10/2026** (última actualización publicada) por la **Ley 4/2026, de 1 de
octubre**, que modifica el TRLGSS y la propia Ley 39/2006. La reforma es
sustantiva en los artículos de prestaciones económicas: cambian las
redacciones citadas (p. ej. «acordará las condiciones de acceso a esta
prestación, para su posterior aprobación por el Gobierno mediante real
decreto») y desaparecen literalmente pasajes citados por las reglas.

Efecto medido:

- Snapshot actualizado con la nueva redacción → 9 extractos citados ya no
  están presentes (4 en `prestacion-cuidador-no-profesional`, 5 en
  `prestaciones-dependencia-saad`).
- `eligibility:build` excluye ambas reglas del bundle (G4, fail-closed):
  el bundle público pasa de 45 a 43 reglas hasta su re-verificación.
- `verification.status` marcado `ko` en ambas reglas con referencia a este
  informe.

Acción pendiente (ola 9): re-autorar los dos RuleSet contra la nueva
redacción de la Ley 39/2006 (arts. 18, 19, 20, 22, 24 modificados por la
Ley 4/2026) y repetir el ciclo autor ⇒ verificador ⇒ merge. El flujo
fail-closed funcionó como se diseñó: ninguna afirmación queda citando un
texto derogado.
