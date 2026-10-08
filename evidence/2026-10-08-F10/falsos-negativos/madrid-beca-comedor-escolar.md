# madrid-beca-comedor-escolar

## Análisis

Reglas evaluadas (`data/eligibility/rules/madrid-beca-comedor-escolar.json`, Acuerdo de 24/04/2024 + Acuerdo de 30/04/2025):

- `hijo-en-edad-escolar` (**hard**): `dependents count_where_gte(1, age lte 18)`. La norma no fija edad: exige que el alumno «vaya a cursar estudios en las etapas educativas de **Educación Infantil, Educación Primaria y Educación Secundaria Obligatoria**» en centros autorizados con comedor (art. 4.1-2). La edad ≤18 es un proxy razonable pero imperfecto en ambos sentidos:
  - **Posible falso negativo**: un alumno de 19–20 años que siga en ESO (repetidor, incorporación tardía al sistema, necesidades educativas) cumpliría la norma por etapa pero da F por edad. Escenario raro pero normativamente posible: la norma no pone techo de edad, la regla sí.
  - Falso positivo (fuera de alcance): un dependiente de 17–18 en Bachillerato/FP da T pese a que la etapa no está cubierta («no vale Bachillerato ni FP» — declarado en `uncoveredRequirements.etapa-y-centro`).
  - Proxy de custodia: «a tu cargo» — un menor escolarizado cuya guarda ostente el otro progenitor y que el respondente no liste como dependiente → F. Borde aceptable (el solicitante es quien incluye al menor en la solicitud).
- `centro-en-comunidad-madrid` (**hard: false**): `territory within ccaa 13` como aproximación a la ubicación del **centro** (el requisito real es del colegio, no de la residencia). El label lo dice honestamente: «si el colegio está en la CM aunque viváis fuera, también vale» — decisión correcta hacerlo soft: un residente fuera de la CM con hijo escolarizado en la CM no recibe F. La norma tampoco exige empadronamiento en la CM (declarado en `empadronamiento-solo-prueba`: el volante solo se pide para acreditar convivencia si se rechaza la consulta).
- `via-economica-o-colectivo` (**hard: false**): `any(incomeAnnual lt 8400, familyType eq "familia-numerosa")`. Norma: vías a)–k) del art. 5.2, incluida la c) «renta **per cápita** inferior a 8.400 euros» y la k) «familia numerosa con una renta per cápita a partir de 8.400 euros e inferior a 10.000». Dos matices:
  - `incomeAnnual` recoge ingresos **del respondente** («¿Cuántos ingresos anuales tienes?»), no del hogar ni per cápita — el label de la vía lo corrige («del hogar»). Un hogar de 4 miembros con ingresos del respondente de 9.000 € (per cápita 2.250 €) cumple la vía c) pero la rama da F — contenido por ser soft.
  - Las vías sin límite de renta (RMI/IMV, VG, terrorismo, FCSE/FAS, acogimiento, escolarización de oficio, protección internacional/Ucrania) no se comprueban pero **sí se declaran** en `uncoveredRequirements.otras-vias-sin-renta`. Honesto.
  - Bonus correcto en el cálculo: «cada miembro con discapacidad ≥33 % computa por dos» (art. 8.2) — declarado en `discapacidad-cuenta-doble`.
- Fecha de referencia: la norma comprueba requisitos «a la fecha de **finalización del plazo** de presentación de solicitudes» (art. 5), y `referenceDate` es `application`; la diferencia está declarada en `requisitos-a-fin-de-plazo`. Matiz honesto.
- `uncoveredRequirements` muy completo y honesto (etapa/centro, plaza de comedor, per cápita exacta, discapacidad ×2, otras vías, uso ≥50 % para mantenerla).

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| hijo-en-edad-escolar | bajo | «vayan a cursar estudios en las etapas educativas de Educación Infantil, Educación Primaria y Educación Secundaria Obligatoria» (art. 4.1) — la norma no fija edad; el proxy ≤18 puede dar F a un alumno de ESO de 19+ años | Documentar en el label que >18 en ESO también puede valer, o rebajar a soft |
| centro-en-comunidad-madrid | ninguno | «ubicados en el territorio de la Comunidad de Madrid» (art. 4.2) — soft, cubre residente fuera de CM con centro dentro | — |
| via-economica-o-colectivo | bajo | «Familia con una renta per cápita inferior a 8.400 euros» (art. 5.2.c) — el campo mide ingresos personales, no per cápita del hogar; soft, sin F duro | Si se recoge composición del hogar, calcular per cápita; mantener soft mientras tanto |
