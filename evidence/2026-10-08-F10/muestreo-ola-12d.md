# Hoja de muestreo — Ola 12d (ADR-040) · correcciones de falsos negativos

Fecha: 2026-10-08 · Programas: 5 · Parte de la ola 12, dividida
en cinco hojas (12a–12e) para que un KO solo detenga su parte — ver
`verificacion-ola-12d.md`.

**Regla ADR-040**: revisa 2 de esta hoja; si alguna sale KO, **solo esta hoja
se bloquea** — las demás siguen su curso.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **5 regla(s)**: fuenlabrada-prestaciones-sociales, mostoles-prestaciones-sociales, sermas-ortoprotesica-desplazamiento, sermas-reintegro-gastos-sanitarios, subsidio-desempleo.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-08-F10/muestreo-ola-12d.md` — es la única vía que pone humanReview=approved.

## Tema de esta hoja — umbrales corregidos + defecto de territorio (SERMAS)

Móstoles: la ordenanza dice «IPREM anual a 14 pagas» → 8.400 €. Fuenlabrada: 665,33×12 = 7.984 €/año. SERMAS ×2: defecto real — `territory eq "cm"` comparaba un objeto con una cadena y daba F a todo el mundo → `within_territory {ccaa:13}`. Subsidio: label honesto (la norma mide el mes anterior, no el año).

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| `fuenlabrada-prestaciones-sociales` | OK | ☐ OK ☐ KO |
| `mostoles-prestaciones-sociales` | OK | ☐ OK ☐ KO |
| `sermas-ortoprotesica-desplazamiento` | OK | ☐ OK ☐ KO |
| `sermas-reintegro-gastos-sanitarios` | OK | ☐ OK ☐ KO |
| `subsidio-desempleo` | OK | ☐ OK ☐ KO |

## Dictamen del verificador (extracto de `verificacion-ola-12.md`)

- `fuenlabrada-prestaciones-sociales` — ****OK****: Soft en empadronamiento con excepción literal en el extracto (art. 4.2: «se exceptúa este requisito para las prestaciones dirigidas a transeúntes, mujeres que han sufrido… violencia de género»). Umbral 6400→**7984**: el baremo del art. 7 (persona sola) corta en «665,33 y más → 0 %»; 665,33 €×12 = 7.983,96 ≈ 7.984 €/año. Correcto y citado (art. 4.3 remite al baremo del art. 7, presente en la fuente).
- `mostoles-prestaciones-sociales` — ****OK****: Soft ×2 (emancipado + excepciones de VG/calle/Ley 1/1996 — art. 4.1.a/b). Cambio 12p→14p **correcto según R5-VERIF**: la ordenanza dice expresamente «la actualización… se realizará anualmente, según el IPREM anual, calculado **a 14 pagas**» → `IPREM_ANUAL_14P` = 8.400 €. Es el caso en que la norma sí especifica 14 pagas.
- `sermas-ortoprotesica-desplazamiento` — ****OK****: Defecto real confirmado: `territory eq "cm"` comparaba el objeto territorio con la cadena «cm» → F para el 100 % de perfiles. `within_territory {ccaa:"13"}` es el operador correcto del motor y 13 = Comunidad de Madrid. El requisito ya era soft (`derecho-asistencia-sermas`).
- `sermas-reintegro-gastos-sanitarios` — ****OK****: Mismo defecto y misma corrección verificados (`titular-tarjeta-sermas`, ya soft).
- `subsidio-desempleo` — ****OK****: Solo label (aclara que la norma mide el mes natural anterior y aquí es proxy anual). Extracto art. 275.1 ya probaba «no superen el 75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias»; `SMI_MENSUAL ×9` = 1.221×9 = 10.989 €/año ≈ 915,75×12. Consistente.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre SOLO esta hoja y se corrige
antes de aprobar el resto.
