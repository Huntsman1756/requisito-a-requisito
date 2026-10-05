# Hoja de revisión — lote de reglas F3

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## bono-cultural-joven (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener 17 o 18 años (cumplir 18 en 2026) | edad between [17,18] | «Podrán ser beneficiarias las personas jóvenes que cumplan 18 años en 2026» | Extracto, apartado «Primero. Beneficiarios» | https://www.boe.es/diario_boe/txt.php?id=BOE-B-2026-21271 |

**No comprobables con nuestras preguntas (⚠):**

- **La regla exacta es haber nacido en 2008 (cumplir 18 durante 2026); con la edad sola no se puede distinguir de nacer en otro año con la misma edad** — «cumplan 18 años en 2026» (Extracto, apartado «Primero. Beneficiarios»)
- **Nacionalidad española, residencia legal en España, solicitud de asilo o protección temporal, o ser extranjero extutelado en trámite de permiso** — «que posean la nacionalidad española o residencia legal en España en el momento de presentación de la solicitud» (Extracto, apartado «Primero. Beneficiarios»)
- **Elegir una modalidad al solicitar (1: hasta 200/100/100 € por categoría; 2: hasta 400 € en cursos/talleres e instrumentos); son incompatibles entre sí** — «estas dos modalidades son incompatibles entre sí» (Extracto, apartados «Segundo. Objeto» y «Sexto. Otros datos»)

- **Plazo**: 2026-06-22 → 2026-10-31
- **Canal**: Ministerio de Cultura — programa Bono Cultural Joven — https://bonoculturajoven.gob.es (online)
- **Importe**: per_applicant 400–400 € one_off («un importe de 400 euros por persona beneficiaria»)
- **Doc**: Identificación electrónica (Cl@ve; si no has cumplido 18, Cl@ve PIN avanzado o permanente obtenido en persona) (obligatorio)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## bono-social-electrico (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| aviso: Cumplir alguna vía de «consumidor vulnerable» (hay más vías no comprobables abajo) | ALGUNA VÍA: tipo de familia eq "familia-numerosa" O ingresos anuales lte 1.5×IPREM_ANUAL_14P | «deberá cumplir alguno de los requisitos siguientes» | Art. 3.2 | https://www.boe.es/eli/es/rd/2017/10/06/897/con |

**No comprobables con nuestras preguntas (⚠):**

- **Ser titular del punto de suministro de tu vivienda habitual y estar acogido al PVPC (solo lo pueden aplicar comercializadores de referencia)** — «la persona titular de un punto de suministro de electricidad en su vivienda habitual que, siendo persona física, esté acogida al precio voluntario para el pequeño consumidor (PVPC)» (Art. 3.1)
- **Otra vía: pensionistas de la Seguridad Social por jubilación o incapacidad con cuantía mínima, sin otros ingresos >500 €/año** — «sean pensionistas del Sistema de la Seguridad Social por jubilación o incapacidad permanente, percibiendo la cuantía mínima vigente» (Art. 3.2.c)
- **Otra vía: beneficiario del Ingreso Mínimo Vital** — «beneficiario del Ingreso Mínimo Vital conforme a lo establecido en la Ley 19/2021» (Art. 3.2.d)
- **El umbral de renta sube 0,3×IPREM por cada adulto adicional y 0,5×IPREM por cada menor de la unidad de convivencia; +1×IPREM en circunstancias especiales (discapacidad ≥33 %, violencia de género, víctima de terrorismo, dependencia grado II-III, monoparental con menor, electrodependencia)** — «el multiplicador de renta respecto al índice IPREM de 14 pagas se incrementará en 0,3 por cada miembro adicional mayor de edad que conforme la unidad de convivencia y 0,5 por cada menor de edad» (Art. 3.2.a y 3.3)
- **Con renta ≤ 50 % del umbral (o ≤1×IPREM en vía pensionista o ≤2×IPREM con familia numerosa) se es vulnerable severo: descuento del 50 %** — «En el caso del consumidor vulnerable severo, el descuento será del 50 por ciento» (Art. 3.4 y 6.3)

- **Plazo**: permanente/continuo
- **Canal**: Comercializador de referencia (compañía de PVPC) — https://www.miteco.gob.es/es/energia/pobreza-energetica/pe-001/que-es.html (presencial/otro)
- **Importe**: variable – €  («descuento del 35 por ciento en todos los términos que componen el PVPC»)
- **Doc**: Modelo oficial de solicitud y documentación acreditativa al comercializador de referencia (obligatorio)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## descuento-transporte-familia-numerosa (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Ser titular de familia numerosa | tipo de familia eq "familia-numerosa" | «Si eres miembro de Familia Numerosa, tienes derecho a viajar con importantes descuentos» | Página del descuento, condiciones | https://www.renfe.com/es/es/viajar/prepara-tu-viaje/descuentos/familia-numerosa |

**No comprobables con nuestras preguntas (⚠):**

- **El descuento es 20 % para familia numerosa de categoría general y 50 % para la de categoría especial (nuestra pregunta no distingue la categoría)** — «Los descuentos alcanzan el 20% en los casos de familia numerosa de categoría general y el 50% para integrantes de familia numerosa de categoría especial» (Página del descuento, condiciones)
- **Aplica en trenes AVE (excepto AVE Internacional España-Francia), Larga Distancia, Avant, Media Distancia, Cercanías y Feve** — «en todos los trenes AVE (excepto AVE Internacional entre España y Francia), Larga Distancia, Avant, Media Distancia, Cercanías y Feve» (Página del descuento, condiciones)
- **Los títulos FN monoparentales de la Generalitat de Catalunya solo se aceptan en trenes Rodalies** — «Los títulos de familia numerosa emitidos por la Generalitat de Catalunya para familias monoparentales solo serán aceptados como tales en los trenes de Rodalies» (Página del descuento, condiciones)

- **Plazo**: permanente/continuo
- **Canal**: Renfe Viajeros — https://www.renfe.com (online)
- **Importe**: variable – €  («Los descuentos alcanzan el 20% en los casos de familia numerosa de categoría general y el 50% para integrantes de familia numerosa de categoría especial»)
- **Doc**: Título de familia numerosa vigente (se exige al comprar y a bordo) (obligatorio)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## madrid-ayudas-nacimiento-adopcion-multiple (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Estar empadronado en la Comunidad de Madrid | territorio within_territory {"ccaa":"13"} | «Estar empadronado en la Comunidad de Madrid» | Art. 6.b | https://www.bocm.es/boletin/CM_Orden_BOCM/2023/12/28/BOCM-20231228-18.PDF |
| **OBLIGATORIO**: Tener al menos dos hijas o hijos a cargo (el parto o adopción múltiple es de 2+ en un mismo acto — ver ⚠) | personas a cargo count_where_gte undefined ≥2 | «los progenitores que hayan tenido dos o más hijos de nacimiento o adopción múltiple» | Art. 5.1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2023/12/28/BOCM-20231228-18.PDF |
| aviso: Ingresos anuales por debajo de 30.000 € (el límite real es de renta per cápita — ver ⚠) | ingresos anuales lt 30000 | «La renta per cápita de la unidad familiar no podrá ser igual o superior al límite de 30.000 euros» | Art. 6.c | https://www.bocm.es/boletin/CM_Orden_BOCM/2023/12/28/BOCM-20231228-18.PDF |

**No comprobables con nuestras preguntas (⚠):**

- **El nacimiento o adopción múltiple es de dos o más hijos en un mismo acto (parto múltiple o adopción simultánea)** — «dos o más hijos de nacimiento o adopción múltiple» (Art. 5.1)
- **Los hijos han nacido o sido adoptados a partir del 1 de enero de 2024** — «nacidos o adoptados a partir del 1 de enero de 2024» (Art. 5.1 y art. sobre solicitudes)
- **Presentar la solicitud en un plazo máximo de 60 días naturales desde el nacimiento o la adopción múltiple** — «Las soli- citudes deberán ser presentadas en el plazo máximo de 60 días naturales a partir del naci- miento o la adopción múltiple» (Art. 12.1 (solicitudes))
- **Ser español o extranjero con residencia legal en España** — «Ser español o extranjero con residencia legal en España» (Art. 6.a)
- **No estar incurso en las prohibiciones del art. 13 de la Ley 38/2003 General de Subvenciones (las obligaciones tributarias y de Seguridad Social están exoneradas de acreditación en fase de pago)** — «No estar incurso en alguna de las prohibiciones establecidas en el artículo 13 de la Ley 38/2003» (Art. 6.d)
- **No tener suspendida ni privada la patria potestad por resolución judicial firme ni los menores en situación de desamparo** — «que tengan suspendida o hayan sido pri- vadas del ejercicio de la patria potestad de sus hijos» (Art. 5.2)
- **El límite real es renta PER CÁPITA de la unidad familiar < 30.000 € (ingresos del hogar ÷ personas del hogar)** — «La renta per cápita de la unidad familiar no podrá ser igual o superior al límite de 30.000 euros» (Art. 6.c)

- **Plazo**: permanente/continuo
- **Canal**: Comunidad de Madrid — Consejería de Familia, Juventud y Asuntos Sociales — https://sede.comunidad.madrid/ayudas-becas-subvenciones/ayudas-nacimiento-o-adopcion-multiple (online)
- **Importe**: variable 3600– € one_off («se abonará en un pago único de 1.800 euros por cada hijo nacido o adoptado»)
- **Doc**: Empadronamiento actual de residencia (obligatorio)
- **Doc**: Certificación registral individual o libro de familia (o certificados de nacimiento / certificado de inicio de convivencia adoptiva) (obligatorio)
- **Doc**: Declaración de ingresos de la unidad familiar (obligatorio)
- **Doc**: Declaración responsable de no incurrir en prohibiciones del art. 13 de la Ley 38/2003 (Anexo 2) (obligatorio)
- **Doc**: Tarjeta de residente o solicitud de renovación, solo si no dispones de NIF/NIE

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Pertenecer a una de estas situaciones: familia numerosa, monoparental, o madre/padre con discapacidad | ALGUNA VÍA: tipo de familia eq "familia-numerosa" O tipo de familia eq "monoparental" O discapacidad eq "gte33" | «en una familia numerosa o que, con tal motivo, adquiera dicha condición, en una familia monoparental o en los supuestos de madres o padres que tengan reconocido un grado de discapacidad igual o superior al 65 por ciento se tendrá derecho a una prestación económica» | Art. 357.1 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **El nacimiento se produjo en territorio español o la adopción se constituyó o reconoció por autoridad española** — «siempre que el nacimiento se haya producido en territorio español o que la adopción se haya constituido o reconocido por autoridad española» (Ficha «Objeto»)
- **Si la vía es discapacidad: el grado reconocido debe ser ≥65 % (nuestra pregunta solo distingue ≥33 %)** — «un grado de discapacidad igual o superior al 65 por ciento» (Art. 357.1)
- **Si la vía es monoparental: un solo progenitor que convive con el hijo y constituye el sustentador único de la familia** — «que constituye el sustentador único de la familia» (Art. 357.2)
- **Ingresos anuales por debajo del límite que fija cada año la Ley de Presupuestos (+15 % por hijo a partir del segundo; si conviven ambos progenitores, cuentan los ingresos de ambos)** — «no perciba ingresos anuales, de cualquier naturaleza, superiores a la cuantía que anualmente establezca la correspondiente Ley de Presupuestos Generales del Estado» (Art. 357.3)
- **Requisitos de afiliación y residencia del art. 352.1 a) y c) de la LGSS** — «reúna los requisitos establecidos en las letras a) y c) del artículo 352.1» (Art. 357.3)
- **Si ambos progenitores pueden ser beneficiarios, solo uno recibe la prestación** — «el derecho a percibirlas solo podrá ser reconocido en favor de uno de ellos» (Art. 361.1)

- **Plazo**: permanente/continuo
- **Canal**: Instituto Nacional de la Seguridad Social (INSS) — https://sede.seg-social.gob.es/ (online)
- **Importe**: per_applicant 1000–1000 € one_off («consistirá en un pago único de 1.000 euros»)
- **Doc**: Formulario de solicitud oficial (obligatorio)
- **Doc**: Documentos de identidad y acreditación de las circunstancias del derecho (la SS consulta los que ya conoce) (obligatorio)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## subsidio-mayores-52 (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener 52 años (la norma cuenta la edad en la fecha del hecho causante — ver ⚠) | edad gte 52 | «Tener 52 años en la fecha en la que se encuentre en una de las situaciones indicadas en el apartado anterior» | Página «Requisitos», apartado 2 | https://www.sepe.es/HomeSepe/prestaciones-desempleo/subsidio-desempleo/tengo-mas-de-52.html |
| aviso: Estar en desempleo total o trabajando a tiempo parcial (nuestra pregunta no distingue jornada — ver ⚠) | situación laboral eq "desempleado" | «Estar en desempleo total o trabajando a tiempo parcial» | Página «Requisitos», apartado 3 | https://www.sepe.es/HomeSepe/prestaciones-desempleo/subsidio-desempleo/tengo-mas-de-52.html |

**No comprobables con nuestras preguntas (⚠):**

- **Quien trabaja a tiempo parcial también puede acceder (nuestra pregunta no distingue la jornada)** — «o trabajando a tiempo parcial» (Página «Requisitos», apartado 3)
- **Haber agotado una prestación contributiva por desempleo a partir del 1/11/2024, o acreditar situación legal de desempleo con al menos 90 días cotizados** — «Acreditar situación legal de desempleo el día 1 de noviembre de 2024 o con posterioridad, habiendo cotizado al menos noventa días» (Página «Requisitos», apartado 1)
- **Estar inscrito como demandante de empleo en la fecha del reconocimiento y haber suscrito el acuerdo de actividad** — «estar inscrito o inscrita como demandante de empleo, y haber suscrito el acuerdo de actividad» (Página «Requisitos», apartado 4)
- **Cumplir todos los requisitos, salvo la edad, para acceder a una pensión contributiva de jubilación** — «Cumplir todos los requisitos, salvo la edad, para acceder a cualquier tipo de pensión contributiva de jubilación en el sistema de la Seguridad Social» (Página «Requisitos», apartado 5)
- **Haber cotizado por desempleo al menos seis años a lo largo de la vida laboral** — «Haber cotizado efectivamente en España por la contingencia de desempleo durante, al menos, seis años a lo largo de tu vida laboral» (Página «Requisitos», apartado 5)
- **Carencia de rentas propias en la solicitud y durante la percepción** — «que cumples el requisito de carencia de rentas propias. El cumplimiento de este requisito deberás mantenerlo durante todo el tiempo de percepción del subsidio» (Página «Requisitos», apartado 5)
- **No haber percibido ni agotado la Renta Activa de Inserción, la prestación por cese de actividad ni el subsidio extraordinario** — «la prestación por cese de actividad o el subsidio extraordinario por desempleo, no puedes acceder al subsidio de mayor de 52 años» (Página «Requisitos», final)

- **Plazo**: permanente/continuo
- **Canal**: SEPE — Servicio Público de Empleo Estatal — https://sede.sepe.gob.es/ (online)
- **Importe**: per_applicant – € monthly («La cuantía mensual del subsidio por desempleo es igual al 80 % del indicador público de renta de efectos múltiples (IPREM)»)
- **Doc**: Solicitud de subsidio (incluye la suscripción del acuerdo de actividad) (obligatorio)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐
