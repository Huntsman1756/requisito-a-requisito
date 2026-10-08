# Hoja de muestreo — Ola 8 (ADR-040)

Fecha: 2026-10-06 · Programas: 6 · Verificador independiente: dictamen completo
en `2026-10-06-F3/verificacion-ola-8.md`.

**Regla ADR-040**: revisa 2 de cada ola; si alguna sale KO, revisión completa.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **3 regla(s)**: fuenlabrada-fuenlacarenet-2026, madrid-accede-prestamo-libros, madrid-ayuda-pago-unico-vg.
En otra hoja se aprueban: fuenlabrada-prestaciones-sociales → evidence/2026-10-08-F10/muestreo-ola-12.md; leganes-prestaciones-especial-necesidad → evidence/2026-10-08-F10/muestreo-ola-12.md; mostoles-prestaciones-sociales → evidence/2026-10-08-F10/muestreo-ola-12.md.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-06-F3/muestreo-ola-8.md` — es la única vía que pone humanReview=approved.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| mostoles-prestaciones-sociales | OK | ☐ OK ☐ KO |
| leganes-prestaciones-especial-necesidad | OK | ☐ OK ☐ KO |
| fuenlabrada-prestaciones-sociales | OK | ☐ OK ☐ KO |
| fuenlabrada-fuenlacarenet-2026 | OK | ☐ OK ☐ KO |
| madrid-accede-prestamo-libros | OK | ☐ OK ☐ KO |
| madrid-ayuda-pago-unico-vg | OK | ☐ OK ☐ KO |

## Qué mirar

- **mostoles-prestaciones-sociales**: ordenanza 2016 (6 meses empadronamiento).
- **leganes-prestaciones-especial-necesidad**: art. 3.a-f.
- **fuenlabrada-prestaciones-sociales**: baremo por unidad familiar como aviso.
- **fuenlabrada-fuenlacarenet-2026**: segundo periodo abierto 01/10/2026–30/09/2027.
- **madrid-accede-prestamo-libros**: Decreto 168/2018, adhesión de centro.
- **madrid-ayuda-pago-unico-vg**: art. 3.a-e, renta per cápita.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
