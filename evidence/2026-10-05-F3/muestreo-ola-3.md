# Hoja de muestreo — Ola 3 (ADR-040)

Fecha: 2026-10-05 · Programas: 5 · Dictamen completo: `verificacion-ola-3.md`.
Dictamen inicial: 2 OK / 3 KO → **los 3 KO corregidos y reverificados**
(`eligibility:validate`: 21 rulesets, 0 errores).

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **3 regla(s)**: bono-social-termico, madrid-ayudas-nacimiento-general, prestacion-nacimiento-cuidado-menor.
En otra hoja se aprueban: complemento-ayuda-infancia → evidence/2026-10-08-F10/muestreo-ola-12a.md; madrid-titulo-familia-numerosa → evidence/2026-10-08-F10/muestreo-ola-12c.md.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-05-F3/muestreo-ola-3.md` — es la única vía que pone humanReview=approved.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-05-F3/muestreo-ola-3.md` — es la única vía que pone humanReview=approved.

| Ayuda | Verificador | Corrección aplicada | Tu turno |
|---|---|---|---|
| `complemento-ayuda-infancia` | KO → resuelto | Los tramos 57,50–115 € solo aparecen en rango ≥3; `amount` pasó a `variable` | ☐ OK ☐ KO |
| `madrid-titulo-familia-numerosa` | OK | — | ☐ OK ☐ KO |
| `bono-social-termico` | KO → resuelto | Golden corregido (`asalariado`, renta 25.200–∞) + hoja copiada | ☐ OK ☐ KO |
| `madrid-ayudas-nacimiento-general` | OK | (extractos cortos pero válidos) | ☐ OK ☐ KO |
| `prestacion-nacimiento-cuidado-menor` | KO → resuelto | `persona-trabajadora` → soft; 3 citas recitadas a LGSS 47.1/359 y ET 45.1.d | ☐ OK ☐ KO |

## Puntos críticos para tu muestreo

- **CAPI**: sin cifra fija en la ficha (la cuantía oficial publicada en rango 3
  es 57,50–115 €/mes según edad del menor).
- **Título FN**: suelo de **2** hijos (no 3: las equiparaciones cuentan);
  límite 21/25 años (los 26 del Decreto 30/2023 son la vigencia del título).
- **Bono térmico**: no está en RD 897/2017 sino en RDL 15/2018; lo gestiona la
  CM (Orden 1478/2022), no la SS; de oficio para perceptores del bono eléctrico.
- **Natalidad CM**: 500 €/mes/hijo desde la semana 21 de gestación hasta los
  24 meses; duro: edad ≤ 30 + empadronamiento CM.
- **Permiso nacimiento**: **19 semanas** (RDL 9/2025), no 16; LGSS arts.
  177–182; `persona-trabajadora` es aviso (hay funcionarios mutualistas).
