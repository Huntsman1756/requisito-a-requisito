# Hoja de muestreo — Ola 9 (ADR-040)

Fecha: 2026-10-06 · Programas: 3 · Verificador independiente: dictamen completo
en `2026-10-06-F3/verificacion-ola-9.md`.

**Regla ADR-040**: revisa 2 de cada ola; si alguna sale KO, revisión completa.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **2 regla(s)**: prestacion-cuidador-no-profesional, prestaciones-dependencia-saad.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-06-F3/muestreo-ola-9.md` — es la única vía que pone humanReview=approved.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| prestaciones-dependencia-saad (versiones A y B: hasta 22/10 y desde 23/10) | OK | ☐ OK ☐ KO |
| prestacion-cuidador-no-profesional (versiones A y B) | OK | ☐ OK ☐ KO |

## Qué mirar

- **prestaciones-dependencia-saad (versión A: hasta 22/10)**: redacción anterior recuperada del historial; citas al snapshot pre-reforma.
- **prestaciones-dependencia-saad (versión B: desde 23/10)**: nueva redacción Ley 4/2026: sin parentesco ni año previo; disp. adic. décima (reactivación de suspendidas).
- **prestacion-cuidador-no-profesional (versiones A y B)**: mismo tratamiento; art. 18 nuevo texto.

**Importante**: la ficha muestra la versión vigente hoy; el 23/10 el producto cambia solo a la versión B (despliegue diario de frescura).

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
