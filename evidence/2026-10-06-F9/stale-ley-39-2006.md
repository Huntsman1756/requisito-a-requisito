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

## Actualización 2026-10-06 (OLA-9, primer paso)

Las 9 citas rotas se reescribieron con los literales de la nueva redacción
(extractos verificados con `t.includes`). Pero la reforma es estructural,
no solo redaccional: desaparecen el parentesco hasta tercer grado, el año
de cuidados previo, la sección de incompatibilidades (suprimida), el plazo
suspensivo de dos años y el carácter excepcional de la prestación por
entorno familiar; «programa individual de atención» pasa a «Plan
Individual de Atención»; los menores con régimen propio pasan de 3 a 6
años y la afiliación del cuidador pasa del convenio especial al Régimen
de la SS que corresponda (disposición adicional cuarta). Las reglas
permanecen en `rules-hold/` hasta una re-autoría sustantiva completa:
de nada sirve que la cita resuelva si el requisito ya no existe.
