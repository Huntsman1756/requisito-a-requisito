# ayto-ibi-familia-numerosa

## Análisis

La Ordenanza Fiscal del IBI (art. 12, redacción Ord. 5/2023, con último párrafo
del 12.1 sustituido por Ord. 4/2024 tras la STSJM 329/2024) exige ser sujeto
pasivo titular de familia numerosa en el devengo (1 de enero) sobre la vivienda
habitual de la familia numerosa:

> «Los sujetos pasivos del impuesto que, en el momento del devengo, ostenten la
> condición de titulares de familia numerosa, conforme lo establecido en la Ley
> 40/2003…»
> «se entenderá por vivienda habitual aquella unidad urbana de uso residencial
> destinada, exclusivamente, a satisfacer la necesidad permanente de vivienda de
> la familia numerosa y **se presumirá** que reúne dicha característica aquella
> en la que figure empadronado el sujeto pasivo»

Hallazgos:

1. **`titulo-familia-numerosa` (hard, `familyType eq "familia-numerosa"`) → F
   por colisión de opciones.** La pregunta `q.familyType` es de respuesta
   única: «Familia numerosa», «Familia monoparental» u «Otra situación». Una
   familia que es **a la vez monoparental y numerosa** (p. ej. un progenitor con
   tres hijos: la Ley 40/2003 no exige dos progenitores para la condición de
   familia numerosa) y elige «Familia monoparental» — respuesta cierta —
   obtiene `F` → `no_cumple` aunque sea titular FN en el devengo. Falso
   negativo por diseño del cuestionario, no por la norma.
2. **`empadronado-madrid` (hard, `within_territory` 28079) → borde.** La norma
   no exige «empadronamiento» como requisito: exige que la vivienda sea la
   habitual *de la familia numerosa* y el empadronamiento del sujeto pasivo es
   solo una **presunción** (iuris tantum). Un sujeto pasivo no empadronado en el
   inmueble que acredite la residencia habitual de la familia (caso que motivó
   la STSJM 329/2024) recibe `F` indebido. Borde estrecho y en la práctica el
   reconocimiento de oficio se nutre del padrón; existe vía de solicitud.
3. **`vivienda-habitual-propia` (hard, `housingStatus not_in ["alquiler"]`) —
   correcto.** La bonificación va sobre el recibo del sujeto pasivo
   (propietario, usufructuario u otro derecho real): quien vive de alquiler no
   es sujeto pasivo → `F` correcto. «Otra situación» (`general`) pasa a `T`,
   dirección permisiva (un usufructuario o titular de derecho real que se
   declara «otra situación» no recibe F — acierto de diseño).
4. `uncoveredRequirements` es honesto y completo: titularidad catastral y
   porcentaje por cotitulares (con la excepción de nulidad/separación/divorcio),
   vivienda habitual real, valor catastral individualizado y tramos, vigencia
   del título a 1 de enero, aplicación de oficio vs. solicitud, cambio de
   domicilio.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| titulo-familia-numerosa (hard) | alto | «…ostenten la condición de titulares de familia numerosa, conforme lo establecido en la Ley 40/2003» (art. 12.1) | que `familyType` admita multivalor o que la condición acepte también `monoparental` cuando los dependientes computables alcancen el mínimo de FN (`count_where_gte dependents ≥ 3`/`≥2`); mínimo: declarar en el label «elige "familia numerosa" aunque seas monoparental» |
| empadronado-madrid (hard) | bajo | «se presumirá que reúne dicha característica aquella en la que figure empadronado el sujeto pasivo» (art. 12.1 último párrafo, tras STSJM 329/2024) | matizar el label: el requisito real es vivienda habitual de la FN en Madrid; el empadronamiento es presunción rebatible con acreditación |
| vivienda-habitual-propia (hard) | ninguno | — | — |
