# pension-no-contributiva

## Análisis

1. `edad-65-o-discapacidad` (hard:true): `any` [age ≥ 65 (jubilación NC) | 18 ≤ age < 65 **y** disability = "gte33" (incapacidad NC)]. Fiel a la ley: «Tendrán derecho a la pensión de jubilación en su modalidad no contributiva las personas que, habiendo cumplido sesenta y cinco años de edad» (art. 369.1) y «a) Ser mayor de dieciocho y menor de sesenta y cinco años de edad ... c) Estar afectadas por una discapacidad o por una enfermedad crónica, en un grado igual o superior al 65 por ciento» (art. 363.1).
   - Dirección permisiva: el cuestionario solo distingue ≥33 %; quien tiene 33–64 % obtiene T aunque la norma exige ≥65 % → falso **positivo** declarado («la PNC exige el 65 %; nuestra pregunta solo distingue a partir del 33 %»), no falso negativo.
   - FN residual: la norma admite «discapacidad **o enfermedad crónica**» ≥65 %. Quien tenga una enfermedad crónica valorada al 65 % sin certificado de discapacidad puede responder «no» a la pregunta de discapacidad → F indebido. El label menciona «discapacidad o enfermedad crónica reconocida» pero no advierte de que el cuestionario puede no capturarla. Matiz.
   - Bordes correctos: `gte 65` ↔ «cumplido sesenta y cinco años»; `gte 18 ∧ lt 65` ↔ «mayor de dieciocho y menor de sesenta y cinco». Un menor de 18 con discapacidad → F correcto (no hay excepción).

2. `residencia-espana-2y` (hard:false): `residenceMonths ≥ 24` se deriva de `residenceSince` («¿Desde cuándo estás empadronado ahí?» = municipio actual). La norma exige **residencia legal en España**, no empadronamiento en el municipio: «residan legalmente en territorio español y lo hayan hecho durante diez años ... de los cuales dos deberán ser consecutivos e inmediatamente anteriores a la solicitud» (art. 369.1; en incapacidad 5 años, art. 363.1.b). Quien se traslada entre municipios españoles reinicia el contador del cuestionario pero no el legal → soft F indebido; y un extranjero con residencia legal reciente sin padrón completo → U/F. Además el total exigido (10 años jubilación / 5 incapacidad) no es comprobable — declarado en `residencia-total-modalidad`. Soft, matiz.

3. `reside-cm` (hard:false, ccaa 13): correcto — es solo el órgano gestor («Comunidad de Madrid, para los beneficiarios residentes en la misma. La prestación PNC abarca todo el territorio español»).

4. Honestidad: `carencia-rentas` (límite 8.803,20 €/año propios + acumulación de la unidad económica), `sin-pension-contributiva`, `grado-discapacidad-65`, documentación por modalidad y el complemento de alquiler de 525 € están declarados con extractos presentes en las fuentes (arts. 363.1.c-d, 364, 369; RD 241/2026 art. 21). No se evalúa nada más estricto que la norma.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| edad-65-o-discapacidad (enfermedad crónica ≥65 % sin certificado de discapacidad) | bajo | «Estar afectadas por una discapacidad o por una enfermedad crónica, en un grado igual o superior al 65 por ciento» (art. 363.1.c) | Aclarar en la pregunta/label que "discapacidad" incluye enfermedad crónica valorada; si no se captura, el valor `disability=no` no debería cerrar la vía incapacidad (documentar al menos en el label, que ya menciona enfermedad crónica) |
| edad-65-o-discapacidad (sobreinclusión 33–64 %) | bajo | «en un grado igual o superior al 65 por ciento» | Falso positivo declarado (no falso negativo); aceptable, mantener aviso |
| residencia-espana-2y | bajo | «residan legalmente en territorio español y lo hayan hecho durante diez años ... de los cuales dos deberán ser consecutivos e inmediatamente anteriores a la solicitud» (art. 369.1) | El campo mide empadronamiento en el municipio actual; ideal sería medir residencia en España. Ya es soft |
| reside-cm | ninguno | «Comunidad de Madrid, para los beneficiarios residentes en la misma» | — |
