# madrid-abono-transporte-joven

## Análisis

Reglas evaluadas (`data/eligibility/rules/madrid-abono-transporte-joven.json`):

- `edad-min-15` (hard): `age gte 15`. La ficha oficial del CRTM (`crtm-abono-joven.txt`) dice literalmente: «Este título personal e intransferible de 30 días, te permite viajar por todas las zonas tarifarias (pudiendo viajar de la zona A a la E2) **desde los 15 años hasta la fecha en que se cumplen 26 años**». El umbral inferior coincide con la norma. La tabla tarifaria (`bocm-20251231-2`, pág. 66) confirma que de 7 a 14 años existe un abono gratuito distinto («ABONO DE 7 HASTA 14 AÑOS — Título gratuito»), igual que en el label. Correcto.
- `edad-max-26` (hard): `age lt 26`. La norma dice «hasta la fecha en que se cumplen 26 años». El único borde dudoso es si «hasta la fecha en que se cumplen 26» incluye el propio día del 26.º cumpleaños (lectura inclusiva de «hasta»). Con `lt 26` y edad entera calculada a fecha de solicitud, una persona que cumple 26 ese día da F. Matiz de borde, no un falso negativo amplio: el propio texto ficha limita la validez «hasta la fecha en que se cumplen 26». La cita usada («nacidos entre 2000 y 2011») procede del párrafo de descuentos del RDL 17/2025, no del rango de edad del título; el rango 15–26 solo consta en la ficha CRTM (rango 3), pero es coherente.
- `residencia-municipio-crtm` (hard: **false**): `within_territory ccaa 13`. La norma (`bocm-20260612-17-residencia-ttp.txt`) exige residencia en municipio de la CM, **o** en zonas tarifarias E1/E2, **o** en municipios del convenio con Castilla-La Mancha: «residente en un municipio de la Comunidad de Madrid o en alguno de los municipios integrados en las zonas tarifarias E1 y E2, así como en aquellos municipios expresamente previstos en el convenio vigente suscrito con la Comunidad Autónoma de Castilla-La Mancha». Al ser `hard: false`, un residente en E1/E2 (Castilla y León) o del convenio CLM nunca recibe F: como mucho U/observación. Bien modelado — el «o» normativo no se ha convertido en «y», y la excepción de familia numerosa («se mantendrá la posibilidad de expedición de la TTP Personal para los titulares de título acreditativo de familia numerosa») está declarada en `uncoveredRequirements`.
- Fecha de referencia: `referenceDate: "application"` — coherente con «hasta la fecha en que se cumplen 26 años» (se evalúa al usar/solicitar, no a 31/12).
- Interpretación del cuestionario: `age` en años cumplidos a la fecha; coincide con la norma. `territory` no es más estricto (es soft).
- Labels y `uncoveredRequirements`: honestos. Declaran el soporte TTP (4 €, foto, DNI/NIE), la excepción FN, los precios reducidos FN/discapacidad y que la residencia se acredita con certificado de empadronamiento. Matiz menor: el label de `edad-min-15` menciona el título gratuito 7–14 pero no la tarjeta infantil gratuita para <7 años («La tarjeta transporte público infantil y la tarjeta azul son gratuitas»); un menor de 7 recibe F sin pista del título alternativo. No es falso negativo del beneficio (el abono joven no le corresponde), solo una guía incompleta.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| edad-max-26 | bajo | «hasta la fecha en que se cumplen 26 años» — ambigüedad inclusiva del día del 26.º cumpleaños | Matiz aceptable; si se quiere margen, documentar que la carga se permite mientras no se hayan cumplido 26 |
| edad-min-15 | bajo | «La tarjeta transporte público infantil y la tarjeta azul son gratuitas» — alternativa <7 no mencionada en el label | Ampliar label: «menores de 7 tienen la tarjeta infantil gratuita» |
| residencia-municipio-crtm | ninguno | «o en alguno de los municipios integrados en las zonas tarifarias E1 y E2… convenio… Castilla-La Mancha» — modelado como soft, correcto | — |
