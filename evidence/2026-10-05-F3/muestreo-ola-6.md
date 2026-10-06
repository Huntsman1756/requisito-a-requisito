# Hoja de muestreo — Ola 6 (ADR-040)

Fecha: 2026-10-05 · Programas: 5 · Verificador independiente: dictamen completo
en `2026-10-05-F3/verificacion-ola-6.md`.

**Regla ADR-040**: revisa 2 de 5; si alguna sale KO, revisión completa de la
ola. Tras tu OK, las que hayas aprobado pasan a `humanReview.status: approved`.

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
