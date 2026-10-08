# Hoja de muestreo — Ola 7 (ADR-040)

Fecha: 2026-10-06 · Programas: 4 · Verificador independiente: dictamen completo
en `2026-10-06-F3/verificacion-ola-7.md`.

**Regla ADR-040**: revisa 2 de cada ola; si alguna sale KO, revisión completa.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **2 regla(s)**: ayto-emergencia-social, ayto-ibi-familia-numerosa.
En otra hoja se aprueban: ayto-escuela-infantil → evidence/2026-10-08-F10/muestreo-ola-11.md; ayto-tarjeta-azul-discapacidad → evidence/2026-10-08-F10/muestreo-ola-11.md.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-06-F3/muestreo-ola-7.md` — es la única vía que pone humanReview=approved.

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
