# Hoja de muestreo — Ola 12a (ADR-040) · correcciones de falsos negativos

Fecha: 2026-10-08 · Programas: 6 · Parte de la ola 12, dividida
en cinco hojas (12a–12e) para que un KO solo detenga su parte — ver
`verificacion-ola-12a.md`.

**Regla ADR-040**: revisa 2 de esta hoja; si alguna sale KO, **solo esta hoja
se bloquea** — las demás siguen su curso.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **6 regla(s)**: ayto-emergencia-social, complemento-ayuda-infancia, imv, leganes-prestaciones-especial-necesidad, madrid-ayudas-urgencia-social, madrid-renta-minima-insercion.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-08-F10/muestreo-ola-12a.md` — es la única vía que pone humanReview=approved.

## Tema de esta hoja — residencia/empadronamiento → aviso (soft)

La norma exige residencia o empadronamiento con excepciones que el cuestionario no puede medir (informe social, violencia de género, emancipación, presencia por urgencia). El requisito pasa a «aviso»: ya no dice «no cumples» a quien podría encajar en la excepción.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| `ayto-emergencia-social` | OK | ☐ OK ☐ KO |
| `complemento-ayuda-infancia` | OK | ☐ OK ☐ KO |
| `imv` | OK | ☐ OK ☐ KO |
| `leganes-prestaciones-especial-necesidad` | OK | ☐ OK ☐ KO |
| `madrid-ayudas-urgencia-social` | OK | ☐ OK ☐ KO |
| `madrid-renta-minima-insercion` | OK | ☐ OK ☐ KO |

## Dictamen del verificador (extracto de `verificacion-ola-12.md`)

- `ayto-emergencia-social` — ****OK****: Ambos degradados a soft con excepción real en la norma: art. 12.2 «Estar empadronado en el Distrito… salvo, en ambos supuestos, en situaciones excepcionales justificadas en el informe social municipal» (no medible) y art. 12.1 «Ser mayor de edad o menor emancipado» (emancipación no medible).
- `complemento-ayuda-infancia` — ****OK****: Dos degrades justificados: art. 11.6 «unidades de convivencia que incluyan menores de edad entre sus miembros» ≠ «personas a tu cargo» (proxy imperfecto → soft); art. 10.1.a con exenciones reales en la fuente («No se exigirá este plazo respecto de: 1.º Los menores incorporados a la unidad de convivencia por nacimiento, adopción, reagrupación familiar…»).
- `imv` — ****OK****: `edad-minima` soft: las excepciones del art. 5.2 están literalmente en la fuente («Tampoco se exigirá… a las personas de entre 18 y 22 años… bajo la tutela de Entidades Públicas… o sean huérfanos absolutos… Que provengan de un centro penitenciario por haber sido liberados de prisión… superior a seis meses»; víctimas de VG/trata). Además declaradas en uncovered `excepciones-edad-18-22`.
- `leganes-prestaciones-especial-necesidad` — ****OK****: Soft: art. 3.a «Se exceptúa de este requisito a las víctimas de violencia de género o intrafamiliar y los supuestos previstos en los artículos 10.3 y 11.1 de la Ley 1/1996… y a las prestaciones que vayan dirigidas a transeúntes» — la excepción existe y el cuestionario no la mide.
- `madrid-ayudas-urgencia-social` — ****OK****: Soft justificado: la cartera atiende por **presencia/urgencia**, no por empadronamiento — la fuente recoge «las personas… que se encuentren en situación de urgencia o emergencia social podrán acceder a prestaciones que atiendan dichas circunstancias» sin exigir padrón. El excerpt citado («Ámbito territorial de atención Comunidad de Madrid») es débil pero el soft elimina el F.
- `madrid-renta-minima-insercion` — ****OK****: Ambos soft con excepciones literales en art. 6.1.b: «También podrá reconocerse la prestación a las personas que… 1.º Ser menor de veinticinco años o mayor de sesenta y cinco, y tener menores o personas con discapacidad a su cargo. 2.º Tener una edad comprendida entre dieciocho y veinticinco años… 3.º Tener una edad superior a sesenta y cinco años y no ser titular de pensión…» y «menores de edad, salvo que se encuentren emancipadas». Vías declaradas también en uncovered (`vias-18-25`, `mayores-65-sin-pension`, `menores-emancipados`).

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre SOLO esta hoja y se corrige
antes de aprobar el resto.
