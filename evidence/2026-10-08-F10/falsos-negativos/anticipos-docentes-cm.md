# anticipos-docentes-cm

## Análisis

El RuleSet tiene **un único requisito hard** (`funcionario-docente-activo`) que se
evalúa como `employmentStatus eq "docente"`. La norma (base decimoquinta.1 de la
Resolución de 12/06/2026) dice literalmente:

> «Ser funcionario, de carrera o en prácticas, de cuerpos docentes no
> universitarios y estar en situación de servicio activo. No podrán solicitar
> estos préstamos los funcionarios que ocupen puestos incluidos en la relación de
> puestos de trabajo de la Administración educativa.»

Hallazgos:

1. **Colisión de opciones del cuestionario → falso negativo.** La pregunta
   `q.employment` («¿Cuál es tu situación laboral?», respuesta única) ofrece tanto
   «Empleo público» (`empleado-publico`) como «Docencia» (`docente`). Un
   funcionario docente de la CM es ambas cosas a la vez; si elige «Empleo
   público» (o «Otra situación») — respuestas igualmente ciertas — la condición
   da `F` y, al ser el único requisito hard, el veredicto es `no_cumple`
   («no parece aplicarte») a quien es exactamente el destinatario de la ayuda.
   El fallo no está en la norma sino en cómo se mapea el campo.
2. **Interinos.** La norma exige «de carrera o en prácticas»: el funcionario
   interino queda fuera. Quien responde «Docencia» siendo interino obtiene `T`
   → falso *positivo* (dirección segura; el label lo advierte).
3. **«Servicio activo» no es comprobable** con el cuestionario (excedencia,
   servicios especiales, suspensión…): solo produce falsos positivos, nunca `F`
   indebido. Lo mismo para la exclusión de puestos en la RPT de la
   Administración educativa (va en el propio label).
4. **Matiz de cita (no afecta a elegibilidad):** `application.documents[0]`
   (`doc-solicitud-web`) cita «base decimoctava», pero el extracto reproducido
   pertenece en gran parte a la sección de **préstamos** («Séptima
   Documentación… factura o presupuesto…»), mientras la base decimoctava.1 de
   anticipos dice: «sin que sea necesario presentar ningún tipo de justificación
   documental». El label (solicitud electrónica) es correcto; el extracto citado
   puede inducir a pensar que hay que aportar facturas, lo que no procede en
   anticipos. `inPerson: false` es correcto (base octava exige presentación
   electrónica por Decreto 188/2021).
5. `uncoveredRequirements` declara honestamente los requisitos no comprobables
   (bases 15.2–4: anticipo pendiente, retención judicial, reintegro).

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| funcionario-docente-activo (hard) | alto | «Ser funcionario, de carrera o en prácticas, de cuerpos docentes no universitarios y estar en situación de servicio activo» (base 15.ª.1) | `op: "in"` con `["docente","empleado-publico"]`, o precisar la opción «Docencia» del cuestionario como «funcionario/a docente» para que no colisione con «Empleo público» |
| doc-solicitud-web (extracto de la cita) | bajo | base 18.ª.1: «sin que sea necesario presentar ningún tipo de justificación documental» | sustituir el extracto por el tramo de anticipos (base 18.ª) |
| resto | ninguno | — | — |
