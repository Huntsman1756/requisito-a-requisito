# Hoja de muestreo — Ola 7 (ADR-040)

Fecha: 2026-10-06 · Programas: 4 · Verificador independiente: dictamen completo
en `2026-10-06-F3/verificacion-ola-7.md`.

**Regla ADR-040**: revisa 2 de 4; si alguna sale KO, revisión completa de la
ola. Tras tu OK, las que hayas aprobado pasan a `humanReview.status: approved`.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| ayto-emergencia-social | OK (correcciones aplicadas) | ☐ OK ☐ KO |
| ayto-escuela-infantil | OK | ☐ OK ☐ KO |
| ayto-ibi-familia-numerosa | OK | ☐ OK ☐ KO |
| ayto-tarjeta-azul-discapacidad | OK (correcciones aplicadas) | ☐ OK ☐ KO |

## Qué mirar

- **ayto-emergencia-social**: canal/docs recitados a rango 1; IPREM como aviso, sin umbral inventado.
- **ayto-escuela-infantil**: destinatarios 2.1.a-e modelados como avisos.
- **ayto-ibi-familia-numerosa**: art. 12 completo.
- **ayto-tarjeta-azul-discapacidad**: IPREM 14 pagas verificado contra la tabla oficial.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
