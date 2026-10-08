# Verificación ola 12a — correcciones de falsos negativos (extracto)

Extracto de `verificacion-ola-12.md` para los 6 programas de
esta hoja. Método, gates y resultado global: ver el informe matriz. Los 2 KO
que señalaba el informe global (`prestamos-personal-publico-cm` y
`subsidio-mayores-52`) ya están subsanados: extractos ampliados a la cláusula
completa y catálogo del convenio recortado a lo que prueba el art. 139.

| slug | OK/KO | justificación (cita literal de la fuente citada o del `.txt`) |
|---|---|---|
| ayto-emergencia-social | **OK** | Ambos degradados a soft con excepción real en la norma: art. 12.2 «Estar empadronado en el Distrito… salvo, en ambos supuestos, en situaciones excepcionales justificadas en el informe social municipal» (no medible) y art. 12.1 «Ser mayor de edad o menor emancipado» (emancipación no medible). |
| complemento-ayuda-infancia | **OK** | Dos degrades justificados: art. 11.6 «unidades de convivencia que incluyan menores de edad entre sus miembros» ≠ «personas a tu cargo» (proxy imperfecto → soft); art. 10.1.a con exenciones reales en la fuente («No se exigirá este plazo respecto de: 1.º Los menores incorporados a la unidad de convivencia por nacimiento, adopción, reagrupación familiar…»). |
| imv | **OK** | `edad-minima` soft: las excepciones del art. 5.2 están literalmente en la fuente («Tampoco se exigirá… a las personas de entre 18 y 22 años… bajo la tutela de Entidades Públicas… o sean huérfanos absolutos… Que provengan de un centro penitenciario por haber sido liberados de prisión… superior a seis meses»; víctimas de VG/trata). Además declaradas en uncovered `excepciones-edad-18-22`. |
| leganes-prestaciones-especial-necesidad | **OK** | Soft: art. 3.a «Se exceptúa de este requisito a las víctimas de violencia de género o intrafamiliar y los supuestos previstos en los artículos 10.3 y 11.1 de la Ley 1/1996… y a las prestaciones que vayan dirigidas a transeúntes» — la excepción existe y el cuestionario no la mide. |
| madrid-ayudas-urgencia-social | **OK** | Soft justificado: la cartera atiende por **presencia/urgencia**, no por empadronamiento — la fuente recoge «las personas… que se encuentren en situación de urgencia o emergencia social podrán acceder a prestaciones que atiendan dichas circunstancias» sin exigir padrón. El excerpt citado («Ámbito territorial de atención Comunidad de Madrid») es débil pero el soft elimina el F. |
| madrid-renta-minima-insercion | **OK** | Ambos soft con excepciones literales en art. 6.1.b: «También podrá reconocerse la prestación a las personas que… 1.º Ser menor de veinticinco años o mayor de sesenta y cinco, y tener menores o personas con discapacidad a su cargo. 2.º Tener una edad comprendida entre dieciocho y veinticinco años… 3.º Tener una edad superior a sesenta y cinco años y no ser titular de pensión…» y «menores de edad, salvo que se encuentren emancipadas». Vías declaradas también en uncovered (`vias-18-25`, `mayores-65-sin-pension`, `menores-emancipados`). |
