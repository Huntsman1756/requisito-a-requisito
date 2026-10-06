# Verificación ola 10 — leads de la frescura local (F9)

**Fecha:** 2026-10-06 · **Origen:** `data/catalog/leads-new.json` (29 convocatorias
descubiertas por la primera corrida local del descubridor de la sede CM).

## Tria de los 29 leads

Criterio del encargo: persona física, residente en la CM, admite solicitudes
hoy, fuente de rango 1–2 localizable.

| Resultado | n | Detalle |
|---|---|---|
| Para entidades/municipios/empresas | 21 | excluidos correctamente por el clasificador del universo (beneficiario no es persona física) |
| Cerrada en la fecha de la consulta | 1 | `prestamos-docentes-2026`: el BOCM (Resolución 12/06/2026, base novena) fija el fin el **01/10/2026**, aunque la sede la siga listando — **primado el BOCM**; queda en nivel 2 como CLOSED |
| Débil sin base normativa rango 1–2 clara | 2 | `prestamos-personal-educacion` (PAS) solo con Resolución de 2012 de modelo; `reintegro-accidentes` es rama específica cubierta por su Resolución propia → incluida |
| Autorizadas | 5 | ver tabla |

**Nota del clasificador (bug corregido):** la exclusión `reintegro de gastos`
capturaba los reintegros sanitarios SERMAS (prestaciones personales reales)
junto a trámites internos de convocatoria. Regex refinado a `reintegro de
(la/el) (subvención|ayuda|importe|fondo)`; el universo pasó de 653 a 656
programas (los 3 reintegros ahora listados).

## Reglas autorizadas

| Slug | Base rango 1 | Plazo | Modelado |
|---|---|---|---|
| `sermas-reintegro-gastos-sanitarios` | Resolución 21/2010 (BOCM 111) + Decreto 84/2021 | permanente (sede) | territory soft + 2 ⚠ |
| `sermas-ortoprotesica-desplazamiento` | Decreto 84/2021 | permanente + tope 12 meses desde el justificante | territory soft + 3 ⚠ |
| `cm-reintegro-accidentes-trabajo` | Resolución 19/01/2021 (BOCM 27) | permanente | empleado público hard + 1 ⚠ |
| `prestamos-personal-publico-cm` | Convenio Colectivo Único 2025-2028, art. 139 (BOCM 305) | permanente | empleado público hard + 2 ⚠ · máx. 5.000 € |
| `anticipos-docentes-cm` | Resolución 12/06/2026, bases 14-16 (BOCM 148) | permanente (mensual) | docente hard + 1 ⚠ · máx. nómina líquida |

## Comprobaciones

1. Todas las citas resuelven literalmente contra los snapshots
   (`rules:fill-hashes` → ok) — incluida la guionación del PDF.
2. G11: requisitos/importes solo de rango ≤ 2 (la cita rango 3 del convenio
   se sustituyó por el art. 139.4 sobre dotación del fondo).
3. G1 Zod: `recurrence` solo admite `none|annual` — anticipos mensuales
   modelados como `rolling` simple; `lifeEvents` limitado al enum.
4. Goldens: `gp-ola10-*` evaluados con el motor real → veredictos esperados.
5. Nivel 2: los 24 leads restantes conservan `accessState` del universo
   (`programs.json`, regenerado con `universe:build`).

## No verificado

- El BOCM de cada documento es el consolidado vigente salvo cambio
  detectado por frescura (las 5 fuentes BOCM nuevas entran en la revisión
  diaria automática).
- La sede declara «permanente» pero el cuerpo de requisitos se renderiza
  por JS: donde solo el índice era legible se citó la base BOCM.
