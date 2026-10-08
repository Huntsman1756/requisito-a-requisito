# Hoja de muestreo — Ola 5 (ADR-040)

Fecha: 2026-10-05 · Programas: 5 · Verificador independiente: dictamen completo
en `2026-10-05-F3/verificacion-ola-5.md`.

**Regla ADR-040**: revisa 2 de cada ola; si alguna sale KO, revisión completa.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- <ruta-de-esta-hoja>` — es la única vía que pone humanReview=approved.

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
