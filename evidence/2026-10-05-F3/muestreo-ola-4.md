# Hoja de muestreo — Ola 4 (ADR-040)

Fecha: 2026-10-05 · Programas: 5 · Verificador independiente: dictamen completo
en `2026-10-05-F3/verificacion-ola-4.md`.

**Regla ADR-040**: revisa 2 de cada ola; si alguna sale KO, revisión completa.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- <ruta-de-esta-hoja>` — es la única vía que pone humanReview=approved.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| prestacion-desempleo-contributiva | OK tras corrección del KO inicial | ☐ OK ☐ KO |
| madrid-ayudas-urgencia-social | OK | ☐ OK ☐ KO |
| madrid-abono-transporte-infantil | OK tras corrección del KO inicial | ☐ OK ☐ KO |
| becas-mec-universidad-2026-2027 | OK | ☐ OK ☐ KO |
| prestacion-cuidador-no-profesional | OK | ☐ OK ☐ KO |

## Qué mirar

- **prestacion-desempleo-contributiva**: el verificador KO-recitó dos casos especiales y «15 días hábiles»; se recitó antes del merge. Comprueba el rango 360→720 días del art. 269.1.
- **madrid-ayudas-urgencia-social**: excluye Madrid capital (la ficha municipal lo marca «excepto Madrid capital»).
- **madrid-abono-transporte-infantil**: 2 afirmaciones de uncovered sin fuente rango ≤2 se recitaron; pin del golden actualizado.
- **becas-mec-universidad-2026-2027**: ventana 07/04→18/05/2026 literal; fuera de plazo se evalúa como CLOSED.
- **prestacion-cuidador-no-profesional**: ver también la versión B Ley 4/2026 (ola 9).

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
