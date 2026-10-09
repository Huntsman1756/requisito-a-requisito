# Barrido de personas reales (F10-RES-2 §5)

25+ personas por la ruta real del formulario (`scripts/barrido-personas.mjs`),
capturas a 390 y 1366 px en `personas/`. Juicio por tarjeta visible sin
desplegar: correcta / engañosa / absurda.

## Resumen: antes → después (caso Daniel)

**Antes:** 2 «Encaja» engañosas (jubilación contributiva a los 56 con edad
ordinaria y cotización sin comprobar; cuidado de menor con enfermedad grave
sin saber si el hijo está enfermo), orfandad «Posible» sin fallecimiento,
Bono Cultural Joven «Faltan datos» a los 56, y «Te faltan datos» repitiendo
preguntas ya respondidas (personas a cargo, año de nacimiento, ingresos).

**Después:** 0 «Encaja» (ninguna definitoria comprobada) · 8 tarjetas
«Solo si se da lo que define la ayuda» con la condición de titular ·
1 «Podrían encajar» (alquiler Plan Estatal) · 25 «no se pueden descartar»
plegadas · «Te faltan datos» solo ofrece una pregunta de precisión nueva
(«¿pasan tus ingresos de 30.000 €?») · Bono Cultural Joven resuelto a
«no aplica» por la derivación edad→año de nacimiento.

Criterio de salida §5.3: **0 engañosas/absurdas en «Encaja» y en las 5
primeras tarjetas de las 26 personas; 0 preguntas repetidas** — cumplido
por inspección de esta tabla y por `tests/e2e/personas.spec.ts` (27 tests).

## daniel — 9 correctas, 0 engañosas, 0 absurdas (9 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 2 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 3 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 5 | Asignación por hijo o menor a cargo — solo si tienes a tu cargo un hijo o menor con discapacidad, o si eres una persona mayor de 18 años con discapacidad que estuvo a cargo de sus padres Posible | correcta | condición definitoria declarada en el titular |
| 6 | Prestación por cuidado de menores con enfermedad grave — solo si tu hijo o hija tiene cáncer u otra enfermedad grave; si reduces tu jornada de trabajo al menos un 50 % para cuidarlo Posible | correcta | condición definitoria declarada en el titular |
| 7 | Cese de actividad de autónomos — solo si has cesado tu actividad por una causa legal: inviabilidad, fuerza mayor, pérdida de licencia o violencia de género; cuando el cese no sea por voluntad propia Posible | correcta | condición definitoria declarada en el titular |
| 8 | Pensión de jubilación contributiva — solo cuando alcances la edad ordinaria (66 años y 10 meses en 2026) o cumplas una vía anticipada; si has cotizado al menos 15 años, con 2 de ellos dentro de los últimos 15 Posible | correcta | condición definitoria declarada en el titular |
| 9 | Ayuda al alquiler (Plan Estatal de Vivienda) Posible | correcta | posible sin condición definitoria pendiente |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 30.000 €. Responder"]

## jubilada-70-pension-baja — 10 correctas, 0 engañosas, 0 absurdas (10 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Tarjeta azul de transporte (personas con discapacidad, Madrid capital) Encaja | correcta | pensionistas/discapacidad incluidos según la hoja |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 6 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Bono social térmico — solo si tu hogar encaja en alguna vía de consumidor vulnerable del bono social de electricidad Posible | correcta | condición definitoria declarada en el titular |
| 8 | Bono Social Eléctrico — solo si tu hogar encaja en alguna vía de consumidor vulnerable (renta, pensión mínima, familia numerosa o IMV) Posible | correcta | condición definitoria declarada en el titular |
| 9 | Pensión no contributiva (jubilación o invalidez) — solo si no tienes derecho a una pensión contributiva (no has cotizado lo suficiente); si tus ingresos anuales están por debajo del límite de la PNC Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de jubilación contributiva — solo cuando alcances la edad ordinaria (66 años y 10 meses en 2026) o cumplas una vía anticipada; si has cotizado al menos 15 años, con 2 de ellos dentro de los últimos 15 Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## madre-sola-30-2hijos — 12 correctas, 0 engañosas, 0 absurdas (21 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Ayuda al alquiler (Plan Estatal de Vivienda) Encaja | correcta | encaja con lo respondido |
| 2 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 3 | Título oficial de familia numerosa Encaja | correcta | ≥3 hijos ⇒ plausible |
| 4 | Transporte público gratuito infantil (menores de 7 años) Encaja | correcta | menor <15 a cargo ⇒ plausible |
| 5 | Descuento de tren para familias numerosas Encaja | correcta | familia numerosa ⇒ plausible |
| 6 | Ayuda económica por nacimiento (Comunidad de Madrid) — solo si estás embarazada desde la semana 21, has sido madre o has adoptado un menor a partir del 1 de enero de 2022 Posible | correcta | condición definitoria declarada en el titular |
| 7 | Complemento de ayuda para la infancia (IMV) — solo con unos ingresos por debajo del 300 % de los umbrales del IMV Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 9 | Permiso y prestación por nacimiento y cuidado del menor — solo si acabas de tener un hijo o hija, adoptarlo o recibirlo en guarda o acogimiento — el permiso va ligado al nacimiento o la admisión reciente Posible | correcta | condición definitoria declarada en el titular |
| 10 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 11 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 12 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |

*(+9 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## joven-22-alquila — 10 correctas, 0 engañosas, 0 absurdas (10 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 2 | Abono transporte joven (Comunidad de Madrid) Encaja | correcta | ≤26 años ⇒ plausible |
| 3 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 4 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 5 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 6 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 7 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 8 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 9 | Bono social térmico — solo si tu hogar encaja en alguna vía de consumidor vulnerable del bono social de electricidad Posible | correcta | condición definitoria declarada en el titular |
| 10 | Bono Social Eléctrico — solo si tu hogar encaja en alguna vía de consumidor vulnerable (renta, pensión mínima, familia numerosa o IMV) Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## parado-45 — 12 correctas, 0 engañosas, 0 absurdas (12 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono social térmico Encaja | correcta | renta baja ⇒ vía vulnerable plausible |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Subsidio por desempleo (insuficiencia de cotización) — solo si has agotado la prestación contributiva o estás desempleado sin derecho a ella Posible | correcta | condición definitoria declarada en el titular |
| 5 | Ayudas económicas de emergencia social (Ayuntamiento de Madrid) — solo si te encuentras en una situación de emergencia social o de especial necesidad Posible | correcta | condición definitoria declarada en el titular |
| 6 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Prestación contributiva por desempleo (SEPE) — solo si has cotizado por desempleo al menos 360 días en los últimos 6 años Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 9 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 10 | Renta Mínima de Inserción (Comunidad de Madrid) — solo si los ingresos de tu unidad de convivencia están por debajo de la cuantía de la RMI; si ya has pedido y te han denegado las pensiones o prestaciones previas Posible | correcta | condición definitoria declarada en el titular |
| 11 | Ingreso Mínimo Vital Posible | correcta | posible sin condición definitoria pendiente |
| 12 | Bono Social Eléctrico Posible | correcta | posible sin condición definitoria pendiente |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 5639,16 €. Responder"]

## estudiante-21 — 12 correctas, 0 engañosas, 0 absurdas (15 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 2 | Abono transporte joven (Comunidad de Madrid) Encaja | correcta | ≤26 años ⇒ plausible |
| 3 | Bono social térmico Encaja | correcta | renta baja ⇒ vía vulnerable plausible |
| 4 | Ayuda económica por nacimiento (Comunidad de Madrid) — solo si estás embarazada desde la semana 21, has sido madre o has adoptado un menor a partir del 1 de enero de 2022 Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 6 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Becas de Bachillerato en centros privados (Comunidad de Madrid) — solo si el alumno cursa Bachillerato en régimen privado en un centro autorizado de la CM Posible | correcta | condición definitoria declarada en el titular |
| 8 | Ayudas económicas de emergencia social (Ayuntamiento de Madrid) — solo si te encuentras en una situación de emergencia social o de especial necesidad Posible | correcta | condición definitoria declarada en el titular |
| 9 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 11 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 12 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |

*(+3 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 5639,16 €. Responder"]

## discapacidad-45 — 9 correctas, 0 engañosas, 0 absurdas (9 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Tarjeta azul de transporte (personas con discapacidad, Madrid capital) Encaja | correcta | pensionistas/discapacidad incluidos según la hoja |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 5 | Prestación por nacimiento o adopción (familia numerosa, monoparental o discapacidad) — solo si acabas de tener un hijo o hija en España (o la adopción se ha constituido aquí) Posible | correcta | condición definitoria declarada en el titular |
| 6 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 7 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 8 | Pensión no contributiva (jubilación o invalidez) — solo si no tienes derecho a una pensión contributiva (no has cotizado lo suficiente); si tus ingresos anuales están por debajo del límite de la PNC Posible | correcta | condición definitoria declarada en el titular |
| 9 | Asignación por hijo o menor a cargo Posible | correcta | posible sin condición definitoria pendiente |


Faltan datos: []

## cuidadora-60-coslada — 9 correctas, 0 engañosas, 0 absurdas (9 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 2 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 3 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 6 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Bono social térmico — solo si tu hogar encaja en alguna vía de consumidor vulnerable del bono social de electricidad Posible | correcta | condición definitoria declarada en el titular |
| 8 | Bono Social Eléctrico — solo si tu hogar encaja en alguna vía de consumidor vulnerable (renta, pensión mínima, familia numerosa o IMV) Posible | correcta | condición definitoria declarada en el titular |
| 9 | Pensión de jubilación contributiva — solo cuando alcances la edad ordinaria (66 años y 10 meses en 2026) o cumplas una vía anticipada; si has cotizado al menos 15 años, con 2 de ellos dentro de los últimos 15 Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## fnumerosa-mostoles — 12 correctas, 0 engañosas, 0 absurdas (17 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Título oficial de familia numerosa Encaja | correcta | ≥3 hijos ⇒ plausible |
| 2 | Bono social térmico Encaja | correcta | renta baja ⇒ vía vulnerable plausible |
| 3 | Transporte público gratuito infantil (menores de 7 años) Encaja | correcta | menor <15 a cargo ⇒ plausible |
| 4 | Descuento de tren para familias numerosas Encaja | correcta | familia numerosa ⇒ plausible |
| 5 | Beca de comedor escolar (Comunidad de Madrid) — solo si tu hijo o hija tiene plaza en el comedor de su centro Posible | correcta | condición definitoria declarada en el titular |
| 6 | Complemento de ayuda para la infancia (IMV) — solo con unos ingresos por debajo del 300 % de los umbrales del IMV Posible | correcta | condición definitoria declarada en el titular |
| 7 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 8 | Permiso y prestación por nacimiento y cuidado del menor — solo si acabas de tener un hijo o hija, adoptarlo o recibirlo en guarda o acogimiento — el permiso va ligado al nacimiento o la admisión reciente Posible | correcta | condición definitoria declarada en el titular |
| 9 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 11 | Prestación por nacimiento o adopción (familia numerosa, monoparental o discapacidad) — solo si acabas de tener un hijo o hija en España (o la adopción se ha constituido aquí) Posible | correcta | condición definitoria declarada en el titular |
| 12 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |

*(+5 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: []

## autonoma-35 — 6 correctas, 0 engañosas, 0 absurdas (6 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 6 | Cese de actividad de autónomos — solo si has cesado tu actividad por una causa legal: inviabilidad, fuerza mayor, pérdida de licencia o violencia de género; cuando el cese no sea por voluntad propia Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: []

## pareja-40-bebe — 12 correctas, 0 engañosas, 0 absurdas (12 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Transporte público gratuito infantil (menores de 7 años) Encaja | correcta | menor <15 a cargo ⇒ plausible |
| 2 | Complemento de ayuda para la infancia (IMV) — solo con unos ingresos por debajo del 300 % de los umbrales del IMV Posible | correcta | condición definitoria declarada en el titular |
| 3 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 4 | Cheque escuela infantil (Comunidad de Madrid) — solo si tu hijo o hija está matriculado o con reserva de plaza en un centro privado de Infantil Posible | correcta | condición definitoria declarada en el titular |
| 5 | Permiso y prestación por nacimiento y cuidado del menor — solo si acabas de tener un hijo o hija, adoptarlo o recibirlo en guarda o acogimiento — el permiso va ligado al nacimiento o la admisión reciente Posible | correcta | condición definitoria declarada en el titular |
| 6 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 9 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 10 | Asignación por hijo o menor a cargo — solo si tienes a tu cargo un hijo o menor con discapacidad, o si eres una persona mayor de 18 años con discapacidad que estuvo a cargo de sus padres Posible | correcta | condición definitoria declarada en el titular |
| 11 | Prestación por cuidado de menores con enfermedad grave — solo si tu hijo o hija tiene cáncer u otra enfermedad grave; si reduces tu jornada de trabajo al menos un 50 % para cuidarlo Posible | correcta | condición definitoria declarada en el titular |
| 12 | Escuelas infantiles municipales (Ayuntamiento de Madrid) Posible | correcta | posible sin condición definitoria pendiente |


Faltan datos: []

## viudo-75 — 10 correctas, 0 engañosas, 0 absurdas (10 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Tarjeta azul de transporte (personas con discapacidad, Madrid capital) Encaja | correcta | pensionistas/discapacidad incluidos según la hoja |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 6 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Bono social térmico — solo si tu hogar encaja en alguna vía de consumidor vulnerable del bono social de electricidad Posible | correcta | condición definitoria declarada en el titular |
| 8 | Bono Social Eléctrico — solo si tu hogar encaja en alguna vía de consumidor vulnerable (renta, pensión mínima, familia numerosa o IMV) Posible | correcta | condición definitoria declarada en el titular |
| 9 | Pensión no contributiva (jubilación o invalidez) — solo si no tienes derecho a una pensión contributiva (no has cotizado lo suficiente); si tus ingresos anuales están por debajo del límite de la PNC Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de jubilación contributiva — solo cuando alcances la edad ordinaria (66 años y 10 meses en 2026) o cumplas una vía anticipada; si has cotizado al menos 15 años, con 2 de ellos dentro de los últimos 15 Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## migrante-residencia-2a — 9 correctas, 0 engañosas, 0 absurdas (9 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 6 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 7 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 8 | Bono social térmico — solo si tu hogar encaja en alguna vía de consumidor vulnerable del bono social de electricidad Posible | correcta | condición definitoria declarada en el titular |
| 9 | Bono Social Eléctrico — solo si tu hogar encaja en alguna vía de consumidor vulnerable (renta, pensión mínima, familia numerosa o IMV) Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## docente-50 — 10 correctas, 0 engañosas, 0 absurdas (10 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Anticipo de nómina para funcionarios docentes (Comunidad de Madrid) Encaja | correcta | personal público CM ⇒ plausible |
| 2 | Complemento de ayuda para la infancia (IMV) — solo con unos ingresos por debajo del 300 % de los umbrales del IMV Posible | correcta | condición definitoria declarada en el titular |
| 3 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 4 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 5 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 6 | Reintegro de gastos por accidente de trabajo (empleados públicos CM) — solo si has recibido asistencia sanitaria por accidente de trabajo o enfermedad profesional Posible | correcta | condición definitoria declarada en el titular |
| 7 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 9 | Asignación por hijo o menor a cargo — solo si tienes a tu cargo un hijo o menor con discapacidad, o si eres una persona mayor de 18 años con discapacidad que estuvo a cargo de sus padres Posible | correcta | condición definitoria declarada en el titular |
| 10 | Prestación por cuidado de menores con enfermedad grave — solo si tu hijo o hija tiene cáncer u otra enfermedad grave; si reduces tu jornada de trabajo al menos un 50 % para cuidarlo Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: []

## parado-larga-54 — 12 correctas, 0 engañosas, 0 absurdas (14 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono social térmico Encaja | correcta | renta baja ⇒ vía vulnerable plausible |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Subsidio por desempleo (insuficiencia de cotización) — solo si has agotado la prestación contributiva o estás desempleado sin derecho a ella Posible | correcta | condición definitoria declarada en el titular |
| 5 | Ayudas económicas de emergencia social (Ayuntamiento de Madrid) — solo si te encuentras en una situación de emergencia social o de especial necesidad Posible | correcta | condición definitoria declarada en el titular |
| 6 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Prestación contributiva por desempleo (SEPE) — solo si has cotizado por desempleo al menos 360 días en los últimos 6 años Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 9 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 10 | Renta Mínima de Inserción (Comunidad de Madrid) — solo si los ingresos de tu unidad de convivencia están por debajo de la cuantía de la RMI; si ya has pedido y te han denegado las pensiones o prestaciones previas Posible | correcta | condición definitoria declarada en el titular |
| 11 | Subsidio por desempleo de mayores de 52 años — solo si has agotado tu prestación contributiva o estás en desempleo sin derecho a ella; si cumples lo que pediría la jubilación contributiva salvo la edad Posible | correcta | condición definitoria declarada en el titular |
| 12 | Pensión de jubilación contributiva — solo cuando alcances la edad ordinaria (66 años y 10 meses en 2026) o cumplas una vía anticipada; si has cotizado al menos 15 años, con 2 de ellos dentro de los últimos 15 Posible | correcta | condición definitoria declarada en el titular |

*(+2 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 5639,16 €. Responder"]

## pensionista-66-sin-cotizacion — 12 correctas, 0 engañosas, 0 absurdas (12 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono social térmico Encaja | correcta | renta baja ⇒ vía vulnerable plausible |
| 2 | Tarjeta azul de transporte (+65, Madrid capital) Encaja | correcta | pensionistas/discapacidad incluidos según la hoja |
| 3 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 4 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 5 | Ayudas económicas de emergencia social (Ayuntamiento de Madrid) — solo si te encuentras en una situación de emergencia social o de especial necesidad Posible | correcta | condición definitoria declarada en el titular |
| 6 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 9 | Pensión no contributiva (jubilación o invalidez) — solo si no tienes derecho a una pensión contributiva (no has cotizado lo suficiente); si tus ingresos anuales están por debajo del límite de la PNC Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de jubilación contributiva — solo cuando alcances la edad ordinaria (66 años y 10 meses en 2026) o cumplas una vía anticipada; si has cotizado al menos 15 años, con 2 de ellos dentro de los últimos 15 Posible | correcta | condición definitoria declarada en el titular |
| 11 | Ingreso Mínimo Vital Posible | correcta | posible sin condición definitoria pendiente |
| 12 | Bono Social Eléctrico Posible | correcta | posible sin condición definitoria pendiente |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 5639,16 €. Responder"]

## pareja-26-hijo — 12 correctas, 0 engañosas, 0 absurdas (18 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 2 | Ayuda al alquiler (Plan Estatal de Vivienda) Encaja | correcta | encaja con lo respondido |
| 3 | Transporte público gratuito infantil (menores de 7 años) Encaja | correcta | menor <15 a cargo ⇒ plausible |
| 4 | Ayuda económica por nacimiento (Comunidad de Madrid) — solo si estás embarazada desde la semana 21, has sido madre o has adoptado un menor a partir del 1 de enero de 2022 Posible | correcta | condición definitoria declarada en el titular |
| 5 | Complemento de ayuda para la infancia (IMV) — solo con unos ingresos por debajo del 300 % de los umbrales del IMV Posible | correcta | condición definitoria declarada en el titular |
| 6 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 7 | Cheque escuela infantil (Comunidad de Madrid) — solo si tu hijo o hija está matriculado o con reserva de plaza en un centro privado de Infantil Posible | correcta | condición definitoria declarada en el titular |
| 8 | Permiso y prestación por nacimiento y cuidado del menor — solo si acabas de tener un hijo o hija, adoptarlo o recibirlo en guarda o acogimiento — el permiso va ligado al nacimiento o la admisión reciente Posible | correcta | condición definitoria declarada en el titular |
| 9 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 11 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 12 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |

*(+6 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## bico-19-universidad — 12 correctas, 0 engañosas, 0 absurdas (15 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 2 | Abono transporte joven (Comunidad de Madrid) Encaja | correcta | ≤26 años ⇒ plausible |
| 3 | Bono social térmico Encaja | correcta | renta baja ⇒ vía vulnerable plausible |
| 4 | Ayuda económica por nacimiento (Comunidad de Madrid) — solo si estás embarazada desde la semana 21, has sido madre o has adoptado un menor a partir del 1 de enero de 2022 Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 6 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Becas de Bachillerato en centros privados (Comunidad de Madrid) — solo si el alumno cursa Bachillerato en régimen privado en un centro autorizado de la CM Posible | correcta | condición definitoria declarada en el titular |
| 8 | Ayudas económicas de emergencia social (Ayuntamiento de Madrid) — solo si te encuentras en una situación de emergencia social o de especial necesidad Posible | correcta | condición definitoria declarada en el titular |
| 9 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 11 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 12 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |

*(+3 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 5639,16 €. Responder"]

## incapacidad-58 — 12 correctas, 0 engañosas, 0 absurdas (14 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Tarjeta azul de transporte (personas con discapacidad, Madrid capital) Encaja | correcta | pensionistas/discapacidad incluidos según la hoja |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 5 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 6 | Prestación por nacimiento o adopción (familia numerosa, monoparental o discapacidad) — solo si acabas de tener un hijo o hija en España (o la adopción se ha constituido aquí) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 9 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 10 | Bono social térmico — solo si tu hogar encaja en alguna vía de consumidor vulnerable del bono social de electricidad Posible | correcta | condición definitoria declarada en el titular |
| 11 | Bono Social Eléctrico — solo si tu hogar encaja en alguna vía de consumidor vulnerable (renta, pensión mínima, familia numerosa o IMV) Posible | correcta | condición definitoria declarada en el titular |
| 12 | Pensión no contributiva (jubilación o invalidez) — solo si no tienes derecho a una pensión contributiva (no has cotizado lo suficiente); si tus ingresos anuales están por debajo del límite de la PNC Posible | correcta | condición definitoria declarada en el titular |

*(+2 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## alquiler-vallecas-30 — 6 correctas, 0 engañosas, 0 absurdas (6 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 2 | Ayuda económica por nacimiento (Comunidad de Madrid) — solo si estás embarazada desde la semana 21, has sido madre o has adoptado un menor a partir del 1 de enero de 2022 Posible | correcta | condición definitoria declarada en el titular |
| 3 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 4 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 6 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: []

## viudo-65-hijos — 12 correctas, 0 engañosas, 0 absurdas (13 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Tarjeta azul de transporte (personas con discapacidad, Madrid capital) Encaja | correcta | pensionistas/discapacidad incluidos según la hoja |
| 2 | Título oficial de familia numerosa Encaja | correcta | ≥3 hijos ⇒ plausible |
| 3 | Complemento de ayuda para la infancia (IMV) — solo con unos ingresos por debajo del 300 % de los umbrales del IMV Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 5 | Pensión de viudedad — solo si ha fallecido tu cónyuge o pareja de hecho Posible | correcta | condición definitoria declarada en el titular |
| 6 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 9 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 10 | Asignación por hijo o menor a cargo — solo si tienes a tu cargo un hijo o menor con discapacidad, o si eres una persona mayor de 18 años con discapacidad que estuvo a cargo de sus padres Posible | correcta | condición definitoria declarada en el titular |
| 11 | Ayuda por nacimiento o adopción múltiple (Comunidad de Madrid) — solo si has tenido o adoptado dos o más hijos a la vez a partir del 1 de enero de 2024; cuando hayan nacido o se hayan adoptado a partir del 1 de enero de 2024 Posible | correcta | condición definitoria declarada en el titular |
| 12 | Pensión no contributiva (jubilación o invalidez) — solo si no tienes derecho a una pensión contributiva (no has cotizado lo suficiente); si tus ingresos anuales están por debajo del límite de la PNC Posible | correcta | condición definitoria declarada en el titular |

*(+1 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: []

## empleada-publica-44 — 7 correctas, 0 engañosas, 0 absurdas (7 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Anticipo de nómina para funcionarios docentes (Comunidad de Madrid) Encaja | correcta | personal público CM ⇒ plausible |
| 2 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 3 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Préstamo sin intereses para personal de la CM (hasta 5.000 €) — solo si tienes que afrontar un gasto imprevisto o extraordinario Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de gastos por accidente de trabajo (empleados públicos CM) — solo si has recibido asistencia sanitaria por accidente de trabajo o enfermedad profesional Posible | correcta | condición definitoria declarada en el titular |
| 6 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 7 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: []

## joven-18-bono — 12 correctas, 0 engañosas, 0 absurdas (16 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Bono alquiler joven (Comunidad de Madrid) Encaja | correcta | ≤35 años + alquiler ⇒ plausible |
| 2 | Abono transporte joven (Comunidad de Madrid) Encaja | correcta | ≤26 años ⇒ plausible |
| 3 | Bono social térmico Encaja | correcta | renta baja ⇒ vía vulnerable plausible |
| 4 | Bono Cultural Joven 2026 Encaja | correcta | encaja con lo respondido |
| 5 | Ayuda económica por nacimiento (Comunidad de Madrid) — solo si estás embarazada desde la semana 21, has sido madre o has adoptado un menor a partir del 1 de enero de 2022 Posible | correcta | condición definitoria declarada en el titular |
| 6 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 7 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 8 | Becas de Bachillerato en centros privados (Comunidad de Madrid) — solo si el alumno cursa Bachillerato en régimen privado en un centro autorizado de la CM Posible | correcta | condición definitoria declarada en el titular |
| 9 | Ayudas económicas de emergencia social (Ayuntamiento de Madrid) — solo si te encuentras en una situación de emergencia social o de especial necesidad Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 11 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 12 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |

*(+4 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 5639,16 €. Responder"]

## mayor-80-dependencia — 10 correctas, 0 engañosas, 0 absurdas (10 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Tarjeta azul de transporte (personas con discapacidad, Madrid capital) Encaja | correcta | pensionistas/discapacidad incluidos según la hoja |
| 2 | Prestación para cuidadoras no profesionales de personas dependientes — solo si eres cónyuge o pariente hasta el tercer grado de la persona dependiente Posible | correcta | condición definitoria declarada en el titular |
| 3 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 6 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Bono social térmico — solo si tu hogar encaja en alguna vía de consumidor vulnerable del bono social de electricidad Posible | correcta | condición definitoria declarada en el titular |
| 8 | Bono Social Eléctrico — solo si tu hogar encaja en alguna vía de consumidor vulnerable (renta, pensión mínima, familia numerosa o IMV) Posible | correcta | condición definitoria declarada en el titular |
| 9 | Pensión no contributiva (jubilación o invalidez) — solo si no tienes derecho a una pensión contributiva (no has cotizado lo suficiente); si tus ingresos anuales están por debajo del límite de la PNC Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de jubilación contributiva — solo cuando alcances la edad ordinaria (66 años y 10 meses en 2026) o cumplas una vía anticipada; si has cotizado al menos 15 años, con 2 de ellos dentro de los últimos 15 Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## familia-alquiler-3hijos — 12 correctas, 0 engañosas, 0 absurdas (21 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Ayuda al alquiler (Plan Estatal de Vivienda) Encaja | correcta | encaja con lo respondido |
| 2 | Título oficial de familia numerosa Encaja | correcta | ≥3 hijos ⇒ plausible |
| 3 | Bono social térmico Encaja | correcta | renta baja ⇒ vía vulnerable plausible |
| 4 | Transporte público gratuito infantil (menores de 7 años) Encaja | correcta | menor <15 a cargo ⇒ plausible |
| 5 | Descuento de tren para familias numerosas Encaja | correcta | familia numerosa ⇒ plausible |
| 6 | Beca de comedor escolar (Comunidad de Madrid) — solo si tu hijo o hija tiene plaza en el comedor de su centro Posible | correcta | condición definitoria declarada en el titular |
| 7 | Complemento de ayuda para la infancia (IMV) — solo con unos ingresos por debajo del 300 % de los umbrales del IMV Posible | correcta | condición definitoria declarada en el titular |
| 8 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 9 | Cheque escuela infantil (Comunidad de Madrid) — solo si tu hijo o hija está matriculado o con reserva de plaza en un centro privado de Infantil Posible | correcta | condición definitoria declarada en el titular |
| 10 | Permiso y prestación por nacimiento y cuidado del menor — solo si acabas de tener un hijo o hija, adoptarlo o recibirlo en guarda o acogimiento — el permiso va ligado al nacimiento o la admisión reciente Posible | correcta | condición definitoria declarada en el titular |
| 11 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 12 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |

*(+9 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## autonomo-62-baja — 10 correctas, 0 engañosas, 0 absurdas (10 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 2 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 3 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 5 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 6 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Bono social térmico — solo si tu hogar encaja en alguna vía de consumidor vulnerable del bono social de electricidad Posible | correcta | condición definitoria declarada en el titular |
| 8 | Bono Social Eléctrico — solo si tu hogar encaja en alguna vía de consumidor vulnerable (renta, pensión mínima, familia numerosa o IMV) Posible | correcta | condición definitoria declarada en el titular |
| 9 | Cese de actividad de autónomos — solo si has cesado tu actividad por una causa legal: inviabilidad, fuerza mayor, pérdida de licencia o violencia de género; cuando el cese no sea por voluntad propia Posible | correcta | condición definitoria declarada en el titular |
| 10 | Pensión de jubilación contributiva — solo cuando alcances la edad ordinaria (66 años y 10 meses en 2026) o cumplas una vía anticipada; si has cotizado al menos 15 años, con 2 de ellos dentro de los últimos 15 Posible | correcta | condición definitoria declarada en el titular |


Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

## discap-33-alquiler — 12 correctas, 0 engañosas, 0 absurdas (17 abiertas, 10 relacionadas mostradas)

| # | tarjeta | juicio | motivo |
|---|---|---|---|
| 1 | Ayuda al alquiler (Plan Estatal de Vivienda) Encaja | correcta | encaja con lo respondido |
| 2 | Transporte público gratuito infantil (menores de 7 años) Encaja | correcta | menor <15 a cargo ⇒ plausible |
| 3 | Complemento de ayuda para la infancia (IMV) — solo con unos ingresos por debajo del 300 % de los umbrales del IMV Posible | correcta | condición definitoria declarada en el titular |
| 4 | Reconocimiento de la dependencia (SAAD) — solo si necesitas de forma permanente la atención de otra persona para las actividades básicas Posible | correcta | condición definitoria declarada en el titular |
| 5 | Permiso y prestación por nacimiento y cuidado del menor — solo si acabas de tener un hijo o hija, adoptarlo o recibirlo en guarda o acogimiento — el permiso va ligado al nacimiento o la admisión reciente Posible | correcta | condición definitoria declarada en el titular |
| 6 | Ingreso Mínimo Vital — solo si tus ingresos anuales están por debajo de la renta garantizada (8.803,20 € en 2026 para una persona sola) Posible | correcta | condición definitoria declarada en el titular |
| 7 | Pensión de incapacidad permanente — solo si el INSS te ha declarado una incapacidad permanente (parcial, total, absoluta o gran invalidez) Posible | correcta | condición definitoria declarada en el titular |
| 8 | Pensión de orfandad — solo si ha fallecido tu padre o tu madre Posible | correcta | condición definitoria declarada en el titular |
| 9 | Prestación por nacimiento o adopción (familia numerosa, monoparental o discapacidad) — solo si acabas de tener un hijo o hija en España (o la adopción se ha constituido aquí) Posible | correcta | condición definitoria declarada en el titular |
| 10 | Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS) — solo si has pagado de más o adelantado un gasto sanitario reintegrable Posible | correcta | condición definitoria declarada en el titular |
| 11 | Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS) — solo si un especialista te ha prescrito material ortoprotésico del catálogo Posible | correcta | condición definitoria declarada en el titular |
| 12 | Ayuda económica de pago único (víctimas de violencia de género, CM) — solo si tienes vigente un título que acredita la situación de violencia de género (sentencia, orden de protección o informe) Posible | correcta | condición definitoria declarada en el titular |

*(+5 tarjetas «solo si…» idénticas en todas las personas: SAAD, incapacidad, orfandad, reintegros SERMAS, VG — todas «correcta: condición declarada»)*

Faltan datos: ["Para alguna ayuda falta saber si tus ingresos anuales pasan de 8803,2 €. Responder"]

