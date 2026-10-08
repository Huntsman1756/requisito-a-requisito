# ayto-emergencia-social

## Análisis

La ordenanza (art. 12, redacción de 26/06/2013) exige literalmente:

> «1. Ser mayor de edad o menor emancipado. 2. Estar empadronado en el Distrito
> al cual se dirige la solicitud o en el municipio de Madrid en las solicitudes
> a tramitar por el Área de Gobierno competente en materia de servicios
> sociales, **salvo, en ambos supuestos, en situaciones excepcionales
> justificadas en el informe social municipal**. 3. Acreditar la situación de
> necesidad. …»

Hallazgos:

1. **`empadronado-madrid` (hard, `within_territory` municipio 28079) → F
   indebido para la excepción.** La ordenanza admite expresamente dispensar el
   empadronamiento «en situaciones excepcionales justificadas en el informe
   social municipal» — el supuesto típico es precisamente la población diana de
   esta ayuda (personas sin hogar o en urgencia vital, canal SAMUR Social). Una
   persona en Madrid sin empadronar recibe `F` → `no_cumple`, aunque la norma la
   ampara. El label lo menciona («solo prevé excepciones justificadas en informe
   social municipal») y hay un uncovered (`excepcion-empadronamiento`), pero el
   veredicto sigue siendo F: per docs/07 §2.3, una excepción favorable que no se
   puede modelar no debería poder expulsar a nadie por ella.
2. **`mayor-edad` (hard, `age gte 18`) → F indebido para el menor emancipado.**
   «Ser mayor de edad **o menor emancipado**»: un emancipado de 16–17 años recibe
   `F`. Es `timeDependent: "increasing"`, así que el motor mostrará «podrías
   cumplirla a partir de tu 18.º cumpleaños» — mensaje falso para quien ya cumple
   por emancipación. El label lo reconoce («circunstancia que no podemos
   comprobar aquí»). Colectivo estrecho pero literalmente amparado.
3. **`carencia-recursos` (soft, `incomeAnnual lte IPREM_ANUAL_12P` = 7.200 €).**
   La ordenanza **no fija umbral** («Acreditar la situación de necesidad», art.
   12.3): el label lo declara («referencia orientativa») y al ser soft nunca da
   `no_cumple`. Además la banda 0–8.400 € cruza 7.200 → `U`, no `F`. Sin riesgo
   de FN en veredicto; a lo sumo un aviso engañoso como fila.
4. `uncoveredRequirements` es honesto y completo: baremo sin umbral fijo,
   valoración del trabajador social, aceptación del diseño de intervención,
   incompatibilidad por mismo concepto, documentación flexible en emergencia
   (art. 14.6), cuantía por resolución.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| empadronado-madrid (hard) | alto | «Estar empadronado en el Distrito… salvo, en ambos supuestos, en situaciones excepcionales justificadas en el informe social municipal» (art. 12.2) | bajar a `hard: false` o documentar en la regla que el F no aplica a quien declara situación excepcional (el ⚠ existe pero el veredicto ya se emitió) |
| mayor-edad (hard) | alto | «Ser mayor de edad o menor emancipado» (art. 12.1) | `any`: `[age gte 18, vía "menor emancipado" no comprobable]` — o pasar a soft, al estilo de lo ya aplicado en `residir-madrid` de EIM (verificacion-ola-11) |
| carencia-recursos (soft) | bajo | «Acreditar la situación de necesidad» (art. 12.3 — sin umbral en la norma) | mantener soft; el label ya dice «referencia orientativa» |
