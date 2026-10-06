# Hoja de muestreo — Ola 5 (ADR-040)

Fecha: 2026-10-05 · Programas: 5 · Verificador independiente: dictamen completo
en `2026-10-05-F3/verificacion-ola-5.md`.

**Regla ADR-040**: revisa 2 de 5; si alguna sale KO, revisión completa de la
ola. Tras tu OK, las que hayas aprobado pasan a `humanReview.status: approved`.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| pension-no-contributiva | OK tras corrección del KO inicial | ☐ OK ☐ KO |
| subsidio-desempleo | OK | ☐ OK ☐ KO |
| asignacion-hijo-a-cargo | OK tras corrección del KO inicial | ☐ OK ☐ KO |
| pension-viudedad | OK tras corrección del KO inicial | ☐ OK ☐ KO |
| madrid-ayudas-alquiler-plan-estatal | OK | ☐ OK ☐ KO |

## Qué mirar

- **pension-no-contributiva**: residencia-espana-2y daba «no cumple» a quien vivió 2+ años en distintos municipios — ahora evalúa años de residencia en España, no en el municipio.
- **subsidio-desempleo**: todo soft: no puede producir «no cumple» falso.
- **asignacion-hijo-a-cargo**: el golden se re-pineó tras la recitación.
- **pension-viudedad**: el 60 % se recitó al extracto correcto.
- **madrid-ayudas-alquiler-plan-estatal**: CLOSED_RECURRING reproducido con golden.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
