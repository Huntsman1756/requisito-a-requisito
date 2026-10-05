# Hoja de revisión — ola 3: Complemento de Ayuda para la Infancia (CAPI)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

Fuentes verificadas (HTTP 200 el 2026-10-05):

- `boe-ley-19-2021-imv` — https://www.boe.es/eli/es/l/2021/12/20/19/con (rango 1; snapshot ya existente, reutilizado)
- `segss-imv` — https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/65850d68-8d06-4645-bde7-05374ee42ac7/serviciossobreimv (rango 3; snapshot ya existente, reutilizado; solo citado en canal/simulador, no en requisitos ni importe, por G11)
- https://imv.seg-social.es/ — sede electrónica IMV (canal + simulador oficial)
- `boe-rd-241-2026-pensiones` — https://www.boe.es/eli/es/rd/2026/03/25/241 (verificado 200 pero **no declarado**: no contiene los importes del CAPI — «infancia» no aparece en su texto; solo fija la PNC 8.803,20 € que usa el ruleset `imv`)

## complemento-ayuda-infancia (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `complemento-ayuda-infancia` en
`data/catalog/benefits/`; G2 se satisface con la fuente de rango 1 propia
(Ley 19/2021, BOE consolidado, art. 11.6).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Al menos un menor de 18 años miembro de la unidad de convivencia (en la fecha de la solicitud) | personas a cargo count_where_gte ≥1 con edad lt 18 | «Se establece un complemento de ayuda para la infancia para aquellas unidades de convivencia que incluyan menores de edad entre sus miembros» | Art. 11.6 | https://www.boe.es/eli/es/l/2021/12/20/19/con |
| **OBLIGATORIO**: Residir legal y efectivamente en España, de forma continuada, durante al menos el año anterior a la solicitud (proxy: empadronamiento; la «legal» es ⚠) | meses de residencia gte 12 | «Tener residencia legal y efectiva en España y haberla tenido de forma continuada e ininterrumpida durante al menos el año inmediatamente anterior a la fecha de presentación de la solicitud» | Art. 10.1.a | https://www.boe.es/eli/es/l/2021/12/20/19/con |
| **OBLIGATORIO**: La persona titular debe tener al menos 23 años, o ser mayor de edad (o menor emancipada) con hijos o menores a cargo (excepciones en ⚠) | ALGUNA VÍA: edad gte 23 O (edad gte 18 Y personas a cargo count_where_gte ≥1 con edad lt 18) | «deberán tener una edad mínima de 23 años, o ser mayores de edad o menores emancipados en caso de tener hijos o menores en régimen de guarda con fines de adopción o acogimiento familiar permanente» | Art. 5.2 | https://www.boe.es/eli/es/l/2021/12/20/19/con |

**No comprobables con nuestras preguntas (⚠):**

- **Hay que reunir todos los requisitos del IMV salvo los límites económicos, que son más amplios: puede reconocerse solo el complemento aunque no salga el IMV (se estudia con la misma solicitud); también lo reconoce de oficio el INSS a perceptores de la asignación por hijo a cargo** — «reconocerá de oficio el complemento de ayuda para la infancia en los supuestos de unidades de convivencia de los actuales beneficiarios de la asignación económica por hijo o menor a cargo sin discapacidad o con discapacidad inferior al 33 por ciento» (Art. 11.6 y Disposición adicional décima.1)
- **Ingresos computables del ejercicio anterior por debajo del 300 % de los umbrales de la renta garantizada (según composición de la unidad) y patrimonio neto por debajo del 150 % de los límites del anexo II, con el test de activos del anexo III** — «siempre que en el ejercicio inmediatamente anterior al de la solicitud los ingresos computables, de acuerdo con lo dispuesto en el artículo 20 de la presente Ley, sean inferiores al 300% de los umbrales del anexo I y el patrimonio neto sea inferior al 150% de los límites fijados en el anexo II, cumpliendo el test de activos definido en el anexo III» (Art. 11.6)
- **La unidad de convivencia debe llevar constituida al menos 6 meses de forma continuada (salvo nacimiento/adopción/guarda/acogimiento, reagrupación, violencia de género o trata)** — «se exigirá que la misma esté constituida, en los términos de los artículos 6, 7 y 8, durante al menos los seis meses anteriores a la presentación de la solicitud, de forma continuada» (Art. 10.3)
- **La residencia debe ser legal: extranjeros con inscripción en el registro central de extranjeros, tarjeta de familiar de ciudadano de la UE o autorización de residencia** — «La residencia legal en España se acreditará mediante la inscripción en el registro central de extranjeros, en el caso de nacionales de los Estados miembros de la Unión Europea, Espacio Económico Europeo o la Confederación Suiza, o con tarjeta de familiar de ciudadano de la Unión o autorización de residencia» (Art. 21.2)
- **Excepciones a la edad de la persona titular: menores emancipadas con hijos a cargo, extuteladas (tutela dentro de los 3 años antes de la mayoría), huérfanos absolutos, liberadas de prisión tras >6 meses, víctimas de violencia de género o trata** — «salvo en los supuestos de mujeres víctimas de violencia de género, víctimas de trata de seres humanos y explotación sexual en los que se exigirá que la persona titular sea mayor de edad o menor emancipada» (Art. 5.2, in fine; y Art. 4.1)
- **No da derecho ser usuario permanente de un servicio residencial social/sanitario (salvo violencia de género o trata)** — «Podrán ser beneficiarias de la prestación del ingreso mínimo vital las personas que temporalmente sean usuarias de una prestación de servicio residencial, de carácter social, sanitario o socio-sanitario» (Art. 4.2)
- **Incompatible con la asignación económica por hijo o menor a cargo sin discapacidad o con discapacidad <33 %: si cumples ambas, hay que optar por una** — «El complemento de ayuda para la infancia será incompatible con la asignación económica por hijo o menor a cargo sin discapacidad o con discapacidad inferior al 33 por ciento» (Disposición adicional décima.7)
- **En custodia compartida judicial, el menor cuenta en la unidad donde está domiciliado** — «en supuestos de custodia compartida establecida judicialmente, se considerará, a efectos de la determinación de la cuantía de la prestación, que forman parte de la unidad donde se encuentren domiciliados» (Art. 13.4)

- **Plazo**: permanente/continuo («El derecho a la prestación del ingreso mínimo vital nacerá a partir del primer día del mes siguiente al de la fecha de presentación de la solicitud», Art. 14.1; el complemento es parte de la prestación del IMV según la DA 1ª del RD 789/2022 y se estudia con la misma solicitud)
- **Canal**: Instituto Nacional de la Seguridad Social (INSS) — https://imv.seg-social.es/ (online y presencial en CAISS) — «Para solicitar el ingreso mínimo vital y/o el complemento de ayuda para la infancia acceda al Servicio Ingreso Mínimo Vital en nuestra sede electrónica» (página «Servicios sobre IMV», rango 3 — permitido para canal)
- **Simulador oficial**: https://imv.seg-social.es/ (mismo que el del IMV)
- **Importe**: range 57,50–115 €/mes **por cada menor** («La cuantía del complemento de ayuda para la infancia contemplada en el artículo 11, apartado 6, será una cantidad mensual por cada menor de edad miembro de la unidad de convivencia, en función de la edad cumplida el día 1 de enero del correspondiente ejercicio», Art. 13.2.e). **OJO — revisar**: las cifras 115/80,50/57,50 € (tramos <3 años / 3–5 / 6–17 en 2026) constan en la página de la Seguridad Social (rango 3) y en la web del Ministerio, pero el texto consolidado del art. 13.2.e sigue mostrando los tramos originales de 100/70/50 € (incremento del 15 % para 2023 por art. 79 del RD-ley 20/2022, mantenido desde entonces sin nueva publicación normativa localizada). La cita de `amount` es de rango 1 pero respalda la estructura (mensual, por menor, por tramo de edad), no los euros concretos — G11 impide citar la fuente que sí los publica.
- **Doc**: Documento de identidad: DNI (españoles) o documento del país de origen, TIE o pasaporte + NIE (extranjeros) (obligatorio, Art. 21.1)
- **Doc**: Certificado de empadronamiento (obligatorio, Art. 21.3)
- **Doc**: Libro de familia o certificado del registro civil (obligatorio, Art. 21.4)
- **Doc**: Solicitud del IMV en el modelo normalizado — el complemento se estudia con la misma solicitud (obligatorio, Art. 27.1 y 27.3)

OK / KO por requisito: ☐ ☐ ☐

## Decisiones y dudas para la revisión

1. **Importe sin cita normativa de las cifras**: no se ha localizado norma de rango ≤2 que publique los tramos vigentes 115/80,50/57,50 €. El consolidado del art. 13.2.e tiene 100/70/50 €. Se ha optado por `range 57,50–115 €/mes` con cita del mecanismo legal (art. 13.2.e) y consta aquí la discrepancia; si el revisor lo prefiere, `amount` podría pasar a `type: "variable"` para no mostrar cifras sin cita rango ≤2 directa.
2. **`boe-rd-241-2026-pensiones` no declarado** pese a figurar en el encargo («RD 241/2026 (importes)»): no contiene los tramos del CAPI (comprobado: 0 apariciones de «infancia»). Solo fija la PNC (8.803,20 €) que alimenta el ruleset `imv`, no este.
3. **Perceptora del IMV → ⚠**: no preguntamos «¿cobras el IMV?». La ley lo expresa como requisitos del IMV con umbrales ampliados (300 %/150 %) y reconocimiento de oficio a perceptores de la asignación por hijo a cargo (DA 10ª); ambos quedan como aviso.
4. **Edad de la titular hard** (igual que en `imv.json`): una menor emancipada con hijo daría F en `edad-titular` y `no_cumple` aunque pueda ser titular (art. 5.2); queda cubierto por el aviso `excepciones-edad-titular`. Si preocupa el falso negativo, puede bajarse a `hard: false`.
5. **Sin snapshots nuevos**: se han reutilizado `boe-ley-19-2021-imv` y `segss-imv` (ya en `data/eligibility/sources/`). Ninguna fuente adicional necesaria.
6. Golden `gp-cai-madre-getafe`: madre monoparental 33 años, hijo de 4, Getafe, empadronada 05/2021, ingresos 0–8.400 € ⇒ `posible` + `ROLLING`, sin blockers ni missingFields.
