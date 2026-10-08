# ayto-tarjeta-azul-discapacidad

## Análisis

La Resolución de 11/04/2011 (Anexo, apartado A) enumera **siete** categorías de
beneficiarios de la Tarjeta Azul «siendo residentes en Madrid»:

> «Primera.— Tener sesenta y cinco años cumplidos y no percibir… superior al
> IPREM. Segunda.— Disfrutar de pensión de jubilación por razón de edad o
> invalidez permanente (absoluta o total)… Tercera.— …el cónyuge o pareja de
> hecho inscrita… que no tenga ingresos a su nombre. Cuarta.— Tener la condición
> de discapacitado (en cualquiera de sus formas), con un grado de minusvalía
> igual o superior al 33 por 100… que no perciba ingresos totales individuales
> superiores a tres veces el IPREM. Quinta.— Ser mayor de dieciocho años y tener
> reconocida la situación de dependencia… Séptima.— …personas dependientes
> menores de dieciocho años…»

El RuleSet modela **solo la categoría Cuarta** (discapacidad ≥33 % + renta
≤3×IPREM) con dos requisitos hard. Hallazgos:

1. **`discapacidad-min-33` (hard) → F a destinatarios de otras categorías.**
   Un pensionista por invalidez permanente de 50 años con renta ≤1×IPREM, una
   persona >18 con dependencia reconocida (Quinta), un cónyuge sin ingresos
   (Tercera) o un menor dependiente (Séptima) reciben `F` → `no_cumple` siendo
   beneficiarios de la *misma* Tarjeta Azul. La categoría Primera (≥65) está
   cubierta por el ruleset hermano `madrid-abono-transporte-65`, pero **las
   categorías Segunda, Tercera, Quinta y Séptima no tienen ruleset**: para esos
   perfiles la única tarjeta sobre la Tarjeta Azul les dice «no parece
   aplicarte». Las categorías están declaradas en
   `uncoveredRequirements` (`otras-categorias-beneficiarias`,
   `conyuge-sin-ingresos`, `menores-dependientes`) — la honestidad es correcta,
   pero el veredicto F ya se ha emitido.
2. **`renta-max-3-iprem` (hard, `incomeAnnual lte 3×IPREM_ANUAL_14P`) —
   correcto.** «no perciba ingresos totales individuales superiores a tres
   veces el IPREM»: el cuadro oficial anualiza a 14 pagas (22.365,42 € =
   42 × 532,51 €), lo que justifica `IPREM_ANUAL_14P` × 3 = 25.200 €. El campo
   `incomeAnnual` es renta *individual* («¿Cuántos ingresos anuales tienes?») =
   «ingresos totales individuales» de la norma. La escala por cargas
   familiares (Sexta) **no aplica** a la categoría Cuarta («salvo las contenidas
   en la condición cuarta») — el label lo dice bien. La banda 16.800–25.200 €
   cruza el umbral → `U`, no `F`.
3. **`empadronado-municipio-madrid` (hard) — matiz declarado.** La Resolución
   dice «residentes en Madrid» y se verifica por padrón; label + uncovered
   `residente-vs-empadronado` honestos. Un residente de hecho aún no empadronado
   recibe `F` (borde).
4. `uncoveredRequirements` completo y honesto (revisión periódica, ámbito
   zona A/EMT, precio bonificado 2026 vs tarifa oficial, verificación
   administrativa AEAT/INSS).

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| discapacidad-min-33 (hard) | alto | «reúnan alguna de las condiciones siguientes: Primera… Segunda… Quinta… Séptima…» (Anexo A) | crear rulesets hermanos para pensionista/dependencia/cónyuge/menor dependiente, o unificar la Tarjeta Azul en un ruleset con `any` por categorías; mientras tanto el F es indebido para 4 de las 7 vías |
| renta-max-3-iprem (hard) | ninguno | — | — |
| empadronado-municipio-madrid (hard) | bajo | «siendo residentes en Madrid, reúnan alguna de las condiciones siguientes» (Anexo A) | ya declarado en label y uncovered; opcional: `hard: false` como se hizo con EIM |
