# Hoja de muestreo — Ola 10 (ADR-040)

Fecha: 2026-10-06 · Programas: 5 · Verificador independiente: dictamen completo
en `2026-10-06-F3/verificacion-ola-10.md`.

**Regla ADR-040**: revisa 2 de cada ola; si alguna sale KO, revisión completa.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **0 regla(s)**: .
En otra hoja se aprueban: anticipos-docentes-cm → evidence/2026-10-08-F10/muestreo-ola-12b.md; cm-reintegro-accidentes-trabajo → evidence/2026-10-08-F10/muestreo-ola-12b.md; prestamos-personal-publico-cm → evidence/2026-10-08-F10/muestreo-ola-12e.md; sermas-ortoprotesica-desplazamiento → evidence/2026-10-08-F10/muestreo-ola-12d.md; sermas-reintegro-gastos-sanitarios → evidence/2026-10-08-F10/muestreo-ola-12d.md.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-06-F3/muestreo-ola-10.md` — es la única vía que pone humanReview=approved.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| sermas-reintegro-gastos-sanitarios | OK | ☐ OK ☐ KO |
| sermas-ortoprotesica-desplazamiento | OK | ☐ OK ☐ KO |
| cm-reintegro-accidentes-trabajo | OK | ☐ OK ☐ KO |
| prestamos-personal-publico-cm | OK | ☐ OK ☐ KO |
| anticipos-docentes-cm | OK | ☐ OK ☐ KO |

## Qué mirar

- **sermas-reintegro-gastos-sanitarios**: Resolución 21/2010; permanente.
- **sermas-ortoprotesica-desplazamiento**: Decreto 84/2021; plazo tope 12 meses desde el justificante.
- **cm-reintegro-accidentes-trabajo**: Resolución 19/01/2021; solo empleados públicos CM.
- **prestamos-personal-publico-cm**: Convenio Colectivo Único art. 139; hasta 5.000 € sin intereses.
- **anticipos-docentes-cm**: Resolución 12/06/2026 bases 14-16; hasta la nómina líquida mensual.

Tria de 29 leads: 21 eran para entidades, 1 cerrada (el BOCM prima sobre la sede).

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
