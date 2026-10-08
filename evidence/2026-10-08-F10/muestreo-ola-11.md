# Hoja de muestreo — Ola 11 (ADR-040) · re-autorías F10-REG

Fecha: 2026-10-08 · Programas: 7 (5 re-autorías + 2 verificadas sin cambio) ·
Verificador independiente: dictamen completo en `verificacion-ola-11.md`.

**Regla ADR-040**: revisa 2 de 5; si alguna sale KO, revisión completa de la
ola. Tras tu OK, las que hayas aprobado pasan a `humanReview.status: approved`.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-08-F10/muestreo-ola-11.md` — es la única vía que pone humanReview=approved.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| `ayto-escuela-infantil` | OK | ☐ OK ☐ KO |
| `asignacion-hijo-a-cargo` | OK | ☐ OK ☐ KO |
| `subsidio-desempleo` | OK | ☐ OK ☐ KO |
| `becas-generales-mefp-2026-2027` | OK | ☐ OK ☐ KO |
| `ayto-tarjeta-azul-discapacidad` | OK | ☐ OK ☐ KO |
| `madrid-abono-transporte-infantil` (sin cambio: borde 0–14 correcto) | OK | ☐ OK ☐ KO |
| `pension-incapacidad-permanente` (sin cambio: ≥67 ya era aviso) | OK | ☐ OK ☐ KO |

## Qué mirar

- **ayto-escuela-infantil**: `residir-madrid` pasó de obligatorio a aviso —
  la norma admite «prever residir» antes del curso y el cuestionario solo
  pregunta el empadronamiento. Comprueba que la ficha lo explica bien.
- **asignacion-hijo-a-cargo**: se añadió ⚠ declarando que el grado de
  discapacidad de las personas a cargo no se pregunta.
- **subsidio-desempleo**: se añadió ⚠ de que quienes trabajan a tiempo
  parcial (jornada < completa) también pueden acceder.
- **becas-generales-mefp-2026-2027**: el label ahora dice «título oficial de
  grado o máster en una universidad o centro español» + ⚠ de títulos propios.
- **ayto-tarjeta-azul-discapacidad**: label aclarado («residentes» vs
  empadronamiento) + ⚠ residente-sin-empadronar.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
