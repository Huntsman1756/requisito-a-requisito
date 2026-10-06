# R5-RAI — Auditoría de vigencia de las 35 reglas (2026-10-06)

Criterio: ¿admite solicitudes nuevas hoy?

| Tipo | Reglas |
|---|---|
| `rolling: true` (permanente) | 28 reglas — admiten solicitud siempre que se cumplan los requisitos |
| `rolling: false` anual con plazo vigente/futuro | becas-generales-mefp, beca-comedor, becas-bachillerato-privados, cheque-infantil, bono-cultural, alquiler-plan-estatal — convocatoria anual, la actual está abierta o cerrada esperando la próxima (CLOSED_RECURRING no produce falso «abierta») |
| `rolling: false` + `closesAt` pasado | renta-activa-inserción (derogada 01/11/2024) → **retirada del nivel 1** |

## Corregido
- `renta-activa-insercion`: eliminada de `data/eligibility/rules` (ruleset +
  golden). Queda en el universo con `accessState: CLOSED`, `derogatedAt:
  2024-11-01` y nota de derechos conservados (la ficha ya lo mostraba así).

## Verificados tras la alerta de Daniel
- `asignacion-hijo-a-cargo`: el ruleset ya modela que tras el IMV/CAPI la
  asignación para hijos sin discapacidad no admite nuevas altas (requisito
  `causante-con-discapacidad` + UC `regimen-transitorio-extinguida`). Vigente
  solo para hijos con discapacidad ≥33 % / casos especiales.
- `subsidio-mayores-52`: la reforma de 2019 (RDL 8/2019) eliminó el subsidio
  «mayores de 55» pero el de mayores de 52 sigue abierto (rolling), con requisitos
  citados a la LGSS. Vigente.
- Abonos de transporte de la CM y ayudas de natalidad: permanentes, sin cierre.
- Las 6 pensiones (jubilación, viudedad, orfandad, IP, PNC, cuidado de menores)
  son prestaciones de la Seguridad Social, abiertas todo el año.

## Pendiente
- `madrid-ayudas-alquiler-plan-estatal` (closesAt 15/12/2025, rec=annual) —
  ya se mostrará «cerrada» hasta la convocatoria 2026, que es el comportamiento
  correcto; el universo la registra como CLOSED_RECURRING.
