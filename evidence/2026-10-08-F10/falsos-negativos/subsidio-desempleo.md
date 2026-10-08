# subsidio-desempleo

## Análisis

1. **`desempleo` (soft)** — `employmentStatus eq "desempleado"`. La norma admite también a quien trabaja a tiempo parcial: «Podrán acceder a estos subsidios quienes mantengan uno o varios contratos a tiempo parcial, siempre que la suma de las jornadas trabajadas en dichos contratos sea inferior a una jornada completa» (LGSS art. 274.1, in fine). Un trabajador a tiempo parcial responde «asalariado» → F mostrado. Mitigado: el propio label del requisito incluye el tiempo parcial y `uncoveredRequirements.trabajo-tiempo-parcial` avisa de que «quien trabaje a tiempo parcial verá este requisito como ⚠». Honesto; F mostrado pero declarado.

2. **`carencia-rentas` (soft) — desfase mensual vs anual.** La norma mide las rentas **del mes natural anterior**: «las rentas de cualquier naturaleza de la persona solicitante o beneficiaria durante el mes natural anterior a dichas fechas no superen el 75 por ciento del salario mínimo interprofesional» (LGSS art. 275.1; SEPE: «todas las rentas e ingresos obtenidos durante el mes natural anterior»). La condición evalúa `incomeAnnual lte 9×SMI_MENSUAL` (=10.989 €/año, correcto como 12×0,75×SMI; la aritmética 12-vs-14-pagas es conservadora y no da F en la zona 10.989–12.820 € porque cae en banda U). Problema: la población típica de esta ayuda **acaba de perder un empleo** — quien ganó 20.000 € el año pasado y hoy tiene 0 €/mes cumple la norma (rentas del mes anterior = 0 ≤ 915,75 €), pero si responde su renta anual pasada (bandas b2/b3) ve **F**; el label dice «tus rentas del mes anterior … proxy anual ≈ 10.989 €/año», así que es parcialmente honesto, pero el dato preguntado («¿Cuántos ingresos anuales tienes?») no es el que mide la norma y puede dar F a quien la admite. Soft: no bloquea el veredicto, pero distorsiona la lista de «lo que no cumples».

3. **Hecho causante y plazos** — `uncoveredRequirements` declara correctamente: agotamiento o ≥90 días cotizados (art. 274.1), no tener derecho a la contributiva (274.2), la regla de <45 años sin responsabilidades (prestación agotada ≥360 días), la alternativa de responsabilidades familiares por renta per cápita ≤75 % SMI (275.2), inscripción y acuerdo de actividad (274.4), cese involuntario posterior al hecho causante (276.1) y el plazo de 6 meses («la solicitud será denegada»). **Laguna menor**: ni el hecho causante ni la ventana mencionan que la nueva arquitectura de subsidios se aplica a situaciones legales de desempleo «a partir del 1 de noviembre de 2024» (SEPE lo exige en ambos supuestos; hoy 2026 afecta solo a hechos causantes antiguos fuera del plazo de 6 meses, de modo que el impacto práctico es nulo).

4. **`remision-mayores-52`** — Honesto: remite a `subsidio-mayores-52` si se cumple el art. 280, evitando un falso negativo por solapamiento de programas.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| carencia-rentas | alto | Norma: «rentas … durante el mes natural anterior … no superen el 75 por ciento del SMI»; condición: `incomeAnnual lte 9×SMI` — recién desempleado con rentas mensuales actuales nulas pero renta anual pasada ≥16.800 € ve F pese a cumplir la norma (soft; label reconoce que es «proxy anual») | Preguntar renta del último mes o aclarar en el label que debe declararse la renta mensual actual; añadir a `uncoveredRequirements` que la comprobación oficial es mensual |
| desempleo | bajo | Tiempo parcial con jornada < completa es admitido (art. 274.1) pero `eq "desempleado"` da F; mitigado por label y `trabajo-tiempo-parcial` | — |
| (hecho causante, ventana temporal) | bajo | SEPE: «Estar en situación legal de desempleo a partir del 1 de noviembre de 2024» no aparece en ningún texto del RuleSet | Añadir matiz en `hecho-causante` (impacto residual) |
