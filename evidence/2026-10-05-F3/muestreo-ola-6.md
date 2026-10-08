# Hoja de muestreo — Ola 6 (ADR-040)

Fecha: 2026-10-05 · Programas: 5 · Verificador independiente: dictamen completo
en `2026-10-05-F3/verificacion-ola-6.md`.

**Regla ADR-040**: revisa 2 de cada ola; si alguna sale KO, revisión completa.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **2 regla(s)**: cese-actividad-autonomos, pension-orfandad.
En otra hoja se aprueban: pension-incapacidad-permanente → evidence/2026-10-08-F10/muestreo-ola-11.md; pension-jubilacion-contributiva → evidence/2026-10-08-F10/muestreo-ola-12.md.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-05-F3/muestreo-ola-6.md` — es la única vía que pone humanReview=approved.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| pension-jubilacion-contributiva | OK | ☐ OK ☐ KO |
| pension-orfandad | OK | ☐ OK ☐ KO |
| pension-incapacidad-permanente | OK | ☐ OK ☐ KO |
| cese-actividad-autonomos | OK | ☐ OK ☐ KO |
| renta-activa-insercion | RETIRADA por derogación (01/11/2024, RDL 2/2024) | ☐ OK ☐ KO |

## Qué mirar

- **pension-jubilacion-contributiva**: DT 7ª (66a10m/65+38a3m en 2026).
- **pension-orfandad**: <21/incapacitado/<25-SMI, +52 % orfandad absoluta.
- **pension-incapacidad-permanente**: 24 mensualidades, 55 %/75 %.
- **cese-actividad-autonomos**: 70 % BR, topes 175/200/225 % IPREM.
- **renta-activa-insercion**: documentada en auditoria-vigencia-R5-RAI.md — no está en el bundle.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
