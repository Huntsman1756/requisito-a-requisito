# leganes-prestaciones-especial-necesidad

## Análisis

**1. Requisitos `hard: true`.** Uno: `empadronado-leganes-6m` (`all`
[`within_territory 28074`, `residenceMonths ≥ 6`]).

El alineamiento dato–norma es bueno: la ordenanza pide «residencia efectiva de
forma ininterrumpida (empadronamiento) de al menos 6 meses con antelación a la
fecha de presentación de la solicitud» (art. 3.a) y `residenceMonths` mide
exactamente meses empadronado **en ese municipio** («¿Desde cuándo estás
empadronado ahí?»). `gte 6` reproduce «al menos 6 meses».

El problema son las **excepciones no modelables**: el art. 3.a «exceptúa de este
requisito a las víctimas de violencia de género o intrafamiliar y los supuestos
previstos en los artículos 10.3 [y 11.1 de la L.O. 1/1996]», y las prestaciones
para personas transeúntes no exigen empadronamiento (el propio label lo recoge).
El cuestionario no pregunta por violencia de género ni por protección de menores:
una víctima con 2 meses de empadronamiento (o con domicilio en otro municipio por
haber huido) obtiene F → `no_cumple`, cuando la ordenanza la admite. La ordenanza
además garantiza «los extranjeros, cualquiera que sea su situación
administrativa, tienen derecho a los servicios y prestaciones sociales básicas»
(art. 3.e-f) — está en `uncoveredRequirements`, pero si la prestación básica no
exige empadronamiento pleno para esos supuestos, el hard también puede sobrar
ahí. Según docs/07 §2.3, excepción favorable no modelable ⇒ no se puede
descartar.

`limite-ingresos-anexo-i` (`hard: false`, `incomeAnnual lte IPREM_ANUAL_12P`):
el límite real del Anexo I es 100 % IPREM para 1 miembro y crece hasta 215 %
para 10 («1 100 % IPREM … 10 215 % IPREM»), más la deducción del 50 % de
hipoteca/alquiler (máx. 500 €/mes). Usar 1×IPREM para todas las unidades es la
cota inferior: para una unidad de 4 miembros con ingresos de 1,5×IPREM la fila da
F indebida. Soft ⇒ solo aviso, pero afirma «no superar los límites» a quien sí
los supera holgadamente. El label lo declara honestamente («Como referencia
orientativa usamos ingresos por debajo de 1 × IPREM»). Nota adicional: la ordenanza
no precisa si el IPREM es mensual o anual; el parámetro usa 12 pagas (7.200 €) —
razonable como cota inferior.

**2. Dato del cuestionario más estricto que la norma.** `residenceMonths` está
bien alineado con la ordenanza; el problema es la ausencia de campo para las
excepciones. `incomeAnnual` con 1×IPREM es estricto para unidades de 2+.

**3. Honestidad de label y uncoveredRequirements.** Los labels mencionan las
excepciones (bien), pero mantener `hard: true` en la condición las anula a efectos
del veredicto. `uncoveredRequirements` es amplio y honesto (valoración de
necesidad, recursos agotados, extranjería, incompatibilidades, diseño de
intervención, modalidades, deber de comunicación en 15 días).

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| empadronado-leganes-6m | alto | «exceptúa de este requisito a las víctimas de violencia de género o intrafamiliar y los supuestos previstos en los artículos 10.3 [y 11.1]» (art. 3.a) + prestaciones a transeúntes | Degradar a `hard: false` o añadir campo de excepción; docs/07 §2.3 exige no descartar por excepciones no modelables |
| limite-ingresos-anexo-i | bajo | «1 100 % IPREM … 10 215 % IPREM» (Anexo I) | Aceptable como cota orientativa (declarado en label); idealmente umbral por tamaño de unidad o ⚠ más explícito en la fila cuando haya unidad > 1 |
