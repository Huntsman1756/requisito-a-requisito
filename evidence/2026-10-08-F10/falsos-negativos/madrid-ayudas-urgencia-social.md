# madrid-ayudas-urgencia-social

## Análisis

Reglas evaluadas (`data/eligibility/rules/madrid-ayudas-urgencia-social.json`, Orden 2372/2023 — Cartera, ficha 060502):

- `ambito-territorial-cm` (**hard**): `territory within ccaa 13`. La cita es «Ámbito territorial de atención: Comunidad de Madrid» — un **ámbito del servicio**, no un requisito de empadronamiento. La ficha solo fija como «Requisitos para el acceso»: «**Carecer de recursos económicos para cubrir necesidades básicas en el momento de la intervención**» — nada de empadronamiento. El propio label lo reconoce: «debes vivir (**o encontrarte**) en un municipio de la CM». El cuestionario `territory` mide **empadronamiento** («¿En qué municipio… estás empadronado?»). Una persona en urgencia que se encuentra en la CM sin estar empadronada allí (recién llegada, sin hogar, desplazada — precisamente el perfil de una emergencia social) recibe **F duro**: falso negativo. Además, convertir el ámbito territorial en requisito personal hard es una interpretación más estricta que la norma.
- `fuera-madrid-capital` (hard): `not (within municipality 28079)`. La ficha dice «Proveedor del servicio: Comunidad de Madrid (**excepto Madrid capital**)» y la Ley 12/2022 art. 11.1.e atribuye a los municipios «la concesión de prestaciones económicas individuales de urgencia y emergencia social». El F a empadronados en Madrid capital es fiel a la prestación autonómica, y el label redirige honestamente al canal municipal (SAMUR Social / servicios sociales del distrito); además existe `uncoveredRequirements.madrid-capital-municipal` con la misma redirección. No es falso negativo de la prestación — pero combínalo con el punto anterior: quien **se encuentra** en Madrid capital sin estar empadronado obtiene T en este requisito y F en `ambito-territorial-cm`, cuando en realidad sería atendido por el dispositivo municipal. Matiz.
- `sin-recursos-basicos` (**hard: false**): `incomeAnnual lte IPREM_ANUAL_12P` (7.200 €). La Cartera «no publica umbral» — el label lo dice con honestidad («como referencia orientativa usamos…»). Con bandas de ingresos la banda 0–8.400 cruza 7.200 → U, nunca F. Bien modelado.
- `uncoveredRequirements` declara con honestidad lo esencial: la urgencia/emergencia la valora un trabajador social (Ley 12/2022 art. 10.3), no hay solicitud con plazo ni lista pública de documentos, es prestación condicionada, y redirige la ciudad de Madrid al cauce municipal.
- Fecha de referencia `application`: coherente («en el momento de la intervención»).

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| ambito-territorial-cm | alto | «Requisitos para el acceso: Carecer de recursos económicos para cubrir necesidades básicas en el momento de la intervención» — la ficha no exige empadronamiento; el label dice «vivir (o encontrarte)» pero la condición mide solo empadronamiento | Degradar a soft o replantear como «te encuentras en la CM»; si se mantiene hard sobre `territory`, el label debe decir «empadronado» y declarar la divergencia |
| fuera-madrid-capital | bajo | «Proveedor del servicio Comunidad de Madrid (excepto Madrid capital)» — F fiel a la prestación, con redirección municipal en label y uncovered | Mantener; verificar que el motor enlaza la alternativa `ayto-emergencia-social` |
| sin-recursos-basicos | ninguno | umbral orientativo declarado; soft + bandas ⇒ nunca F | — |
