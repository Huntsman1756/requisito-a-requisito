# subsidio-mayores-52

## Análisis

1. **`edad-52` (hard)** — `age gte 52` con `referenceDate: application` y `timeDependent: "increasing"`. La norma exige los 52 «en la fecha en que se encuentren en el supuesto previsto en el artículo 274.1» (art. 280.1) — no necesariamente hoy. Evaluar la edad actual es **más permisivo**, no más estricto: nadie que hoy tenga ≥52 recibe F por esta regla. Quien tiene 51 y cumplirá 52 durante la percepción de otro subsidio o con inscripción ininterrumpida puede acceder entonces (art. 280.1: «podrán solicitar el acceso a este subsidio a partir de la fecha en que cumplan dicha edad, siempre que … hayan permanecido inscritos ininterrumpidamente como demandantes de empleo»; «quienes, reuniendo dichos requisitos, cumplan la edad de cincuenta y dos años durante la percepción de cualquiera de los subsidios previstos en el artículo 274»; también en fecha de «reanudar cualquier subsidio»). Para ese perfil el motor muestra elegibilidad futura (hard-F con `timeDependent: increasing` → `futureEligibility`), lo que evita el falso negativo. Estas tres vías alternativas de acceso **no figuran en `uncoveredRequirements`**: la lista declara los requisitos del primer párrafo (jubilación salvo edad, 6 años cotizados, carencia, exclusiones RAI/cese/subsidio extraordinario) pero omite las vías de acceso por reanudación, por cumplir 52 durante la percepción y la condición de inscripción ininterrumpida — laguna de honestidad, no F indebido.

2. **`desempleo` (soft)** — `employmentStatus eq "desempleado"`. Mismo matiz que en `subsidio-desempleo`: quien trabaja a tiempo parcial (< jornada completa) también accede (art. 274.1, in fine: «la suma de las jornadas trabajadas en dichos contratos sea inferior a una jornada completa») y responderá «asalariado» → F mostrado. `uncoveredRequirements.jornada-parcial` lo declara. Soft → sin efecto en veredicto.

3. **`uncoveredRequirements`** — Fieles: hecho causante (agotamiento o ≥90 días cotizados), inscripción y acuerdo de actividad, requisitos de jubilación salvo edad, 6 años cotizados por desempleo («sin que a estos efectos resulte de aplicación el artículo 235» implícito), carencia de rentas ≤75 % SMI del mes anterior (art. 275.1 — el label lo expresa correctamente como mensual, a diferencia del proxy anual de `subsidio-desempleo`) y exclusiones (RAI, cese de actividad, subsidio extraordinario DA27). No declara la **obligación de declaración anual de rentas** (art. 280.8) ni el mantenimiento de la carencia durante toda la percepción (280.2/5) — matiz de completitud sobre obligaciones, no sobre acceso.

4. **Bordes** — `gte 52` con «cincuenta y dos años … cumplida dicha edad»: borde inclusivo correcto; referencia temporal resuelta con `timeDependent` en lugar de un F seco. Correcto.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| edad-52 | bajo | Art. 280.1: acceso también «en la fecha en la que tengan derecho a reanudar cualquier subsidio» y «durante la percepción de cualquiera de los subsidios», con «inscripción ininterrumpida» — vías no declaradas en `uncoveredRequirements` (el F a un <52 ya se mitiga con elegibilidad futura) | Añadir `uncoveredRequirement` con las vías de acceso diferido y la inscripción ininterrumpida desde el agotamiento/última situación legal de desempleo |
| desempleo | bajo | Tiempo parcial admitido por la norma; F mostrado solo a nivel de requisito (soft) y declarado | — |
| (obligaciones no declaradas) | bajo | Art. 280.8: «declaración anual de sus rentas» y mantenimiento de carencia durante la percepción | Añadir a `uncoveredRequirements` como obligación posterior al reconocimiento |
