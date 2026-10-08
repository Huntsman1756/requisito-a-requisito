# Hoja de muestreo — Ola 2 (ADR-040)

Fecha: 2026-10-05 · Programas: 5 · Dictamen completo: `verificacion-ola-2.md`.
Regla: revisa 2 de 5; cualquier KO ⇒ revisión completa de la ola.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- <ruta-de-esta-hoja>` — es la única vía que pone humanReview=approved.

| Ayuda | Verificador | Tu turno |
|---|---|---|
| `madrid-renta-minima-insercion` (RMI) | OK con erratas | ☐ OK ☐ KO |
| `prestaciones-dependencia-saad` (SAAD) | OK | ☐ OK ☐ KO |
| `madrid-abono-transporte-joven` | OK con erratas menores | ☐ OK ☐ KO |
| `madrid-abono-transporte-65` (Tarjeta Azul) | OK con errata de umbral | ☐ OK ☐ KO |
| `prestacion-cuidado-menor-enfermedad-grave` | OK | ☐ OK ☐ KO |

## Lo que el verificador encontró (ya corregido)

- **3 falsos negativos reproducidos con el motor** → pasaron a aviso:
  - RMI `residencia-un-ano`: `residenceMonths` mide antigüedad en el
    municipio actual, no en la CM (una mudanza interna daría «no cumples»).
  - RMI `edad-25-65`: excluía a menores emancipados con cargas.
  - Cáncer `trabajadora-afiliada-alta`: excluía docentes e investigadores
    (sí cotizan a la SS). Añadidos; funcionario de carrera queda ⚠ (mutualidad).
- **Goldens**: claves raíz ilegales en dos ficheros (corregido).
- **Tarjeta Azul**: el tope legal es 532,51 €/mes (2011); el ruleset usa
  IPREM anual (~17 % más laxo). Es un *aviso*, no bloquea; revisar si quieres
  endurecerlo.
- **Identidad**: dos rulesets renombrados al slug de la ficha del catálogo
  (precedente beca-6000): `prestaciones-dependencia-saad` y
  `prestacion-cuidado-menor-enfermedad-grave`.

## Puntos críticos para tu muestreo

- **RMI**: umbral 469,93 €/mes (art. 58 Ley 6/2025); soft porque el límite
  real es por unidad de convivencia; edad 25–64 con excepciones documentadas.
- **SAAD**: solo 1 requisito duro (empadronamiento CM); grado/baremo/PIA en ⚠.
  El resto es imposible de comprobar sin valoración oficial — honesto.
- **Abono joven**: precio **10 €** (bonificación 50 % sobre 20 €, no 8 € ni
  gratis); edad 15–25; empadronamiento soft (el dominio incluye E1/E2/CLM).
- **Tarjeta Azul**: empadronamiento **en el municipio de Madrid** (28079), no
  CM; canal presencial en Línea Madrid (online solo discapacidad >18).
- **Cáncer**: la ficha del catálogo tiene una URL equivocada (NSS, no la
  prestación) — pendiente corrección del catálogo, no bloquea.
