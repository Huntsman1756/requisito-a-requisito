# Hoja de revisión — lote de reglas F3

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.
**Cómo marcarla (Daniel):** al final de cada cabecera `## <ayuda>` añade `— ☑ OK` o `— ☑ KO <motivo>`.
Esta hoja aprueba **2 regla(s)**: bono-cultural-joven, bono-social-electrico.
En otra hoja se aprueban: descuento-transporte-familia-numerosa → evidence/2026-10-08-F10/muestreo-ola-12b.md; madrid-ayudas-nacimiento-adopcion-multiple → evidence/2026-10-08-F10/muestreo-ola-12c.md; prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad → evidence/2026-10-08-F10/muestreo-ola-12c.md; subsidio-mayores-52 → evidence/2026-10-08-F10/muestreo-ola-12e.md.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-05-F3/lote-1.md` — es la única vía que pone humanReview=approved.


## bono-cultural-joven (rulesVersion 2, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Haber nacido en 2008 (cumplir 18 años durante 2026) | birthYear between [2008,2008] | «Podrán ser beneficiarias las personas jóvenes que cumplan 18 años en 2026» | Extracto, apartado «Primero. Beneficiarios» | https://www.boe.es/diario_boe/txt.php?id=BOE-B-2026-21271 |

**No comprobables con nuestras preguntas (⚠):**

- **Responder solo «18 años» no basta: la regla es haber nacido en 2008, así que se pregunta el año de nacimiento** — «cumplan 18 años en 2026» (Extracto, apartado «Primero. Beneficiarios»)
- **Nacionalidad española, residencia legal en España, solicitud de asilo o protección temporal, o ser extranjero extutelado en trámite de permiso** — «que posean la nacionalidad española o residencia legal en España en el momento de presentación de la solicitud» (Extracto, apartado «Primero. Beneficiarios»)
- **Elegir una modalidad al solicitar (1: hasta 200/100/100 € por categoría; 2: hasta 400 € en cursos/talleres e instrumentos); son incompatibles entre sí** — «estas dos modalidades son incompatibles entre sí» (Extracto, apartados «Segundo. Objeto» y «Sexto. Otros datos»)

- **Plazo**: 2026-06-22 → 2026-10-31
- **Canal**: Ministerio de Cultura — programa Bono Cultural Joven — https://bonoculturajoven.gob.es (online)
- **Importe**: per_applicant 400–400 € one_off («un importe de 400 euros por persona beneficiaria»)
- **Doc**: Identificación electrónica (Cl@ve; si no has cumplido 18, Cl@ve PIN avanzado o permanente obtenido en persona) (obligatorio)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## bono-social-electrico (rulesVersion 2, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| aviso: Cumplir alguna vía de «consumidor vulnerable» (hay más vías no comprobables abajo) | ALGUNA VÍA: tipo de familia eq "familia-numerosa" O ingresos anuales lte 1.5×IPREM_ANUAL_14P | «deberá cumplir alguno de los requisitos siguientes» | Art. 3.2 | https://www.boe.es/eli/es/rd/2017/10/06/897/con |

**No comprobables con nuestras preguntas (⚠):**

- **Ser titular del punto de suministro de tu vivienda habitual y estar acogido al PVPC (solo lo pueden aplicar comercializadores de referencia)** — «la persona titular de un punto de suministro de electricidad en su vivienda habitual que, siendo persona física, esté acogida al precio voluntario para el pequeño consumidor (PVPC)» (Art. 3.1)
- **Otra vía: pensionistas de la Seguridad Social por jubilación o incapacidad con cuantía mínima, sin otros ingresos >500 €/año** — «sean pensionistas del Sistema de la Seguridad Social por jubilación o incapacidad permanente, percibiendo la cuantía mínima vigente» (Art. 3.2.c)
- **Otra vía: beneficiario del Ingreso Mínimo Vital** — «beneficiario del Ingreso Mínimo Vital conforme a lo establecido en la Ley 19/2021» (Art. 3.2.d)
- **El umbral de renta sube 0,3×IPREM por cada adulto adicional y 0,5×IPREM por cada menor de la unidad de convivencia; +1×IPREM en circunstancias especiales (discapacidad ≥33 %, violencia de género, víctima de terrorismo, dependencia grado II-III, monoparental con menor, electrodependencia)** — «el multiplicador de renta respecto al índice IPREM de 14 pagas se incrementará en 0,3 por cada miembro adicional mayor de edad que conforme la unidad de convivencia y 0,5 por cada menor de edad» (Art. 3.2.a y 3.3)
- **Con renta ≤ 50 % del umbral (o ≤1×IPREM en vía pensionista o ≤2×IPREM con familia numerosa) se es vulnerable severo: descuento 57,5 % en 2026 (ordinario 50 %)** — «En el caso del consumidor vulnerable severo, el descuento será del 50 por ciento» (Art. 3.4 y 6.3)
- **Los descuentos 42,5 %/57,5 % son excepcionales y solo para 2026; a partir del 1/1/2027 salvo nueva prórroga vuelven 35 %/50 %** — «con carácter excepcional, en el período comprendido entre el 1 de enero y el 31 de diciembre de 2026» (Art. 1.1)

- **Plazo**: permanente/continuo
- **Canal**: Comercializador de referencia (compañía de PVPC) — https://www.miteco.gob.es/es/energia/pobreza-energetica/pe-001/que-es.html (presencial/otro)
- **Importe**: variable – €  («El descuento correspondiente al consumidor vulnerable será del 42,5 por ciento. En el caso del consumidor vulnerable severo, el descuento será del 57,5 por ciento»)
- **Doc**: Modelo oficial de solicitud y documentación acreditativa al comercializador de referencia (obligatorio)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## descuento-transporte-familia-numerosa (rulesVersion 2, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Ser titular de familia numerosa | tipo de familia eq "familia-numerosa" | «los interesados deberán presentar, cuando se les solicite, el correspondiente título oficial de familia numerosa o documento que acredite fehacientemente tal condición» | Art. 11.4 | https://www.boe.es/eli/es/rd/2005/12/30/1621/con |

**No comprobables con nuestras preguntas (⚠):**

- **El descuento es 20 % para familia numerosa de categoría general y 50 % para la de categoría especial (nuestra pregunta no distingue la categoría)** — «Las reducciones serán del 20 y 50 por ciento, según se trate de familias de las categorías general o especial» (Art. 11.1)

- **Plazo**: permanente/continuo
- **Canal**: Renfe Viajeros — https://www.renfe.com (online)
- **Importe**: variable – €  («tendrán derecho a reducciones en las tarifas de transporte ferroviario de viajeros. Las reducciones serán del 20 y 50 por ciento, según se trate de familias de las categorías general o especial»)
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

- **El nacimiento se produjo en territorio español o la adopción se constituyó o reconoció por autoridad española** — «nacimiento o adopción de hijo en España» (Art. 357.1)
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

## subsidio-mayores-52 (rulesVersion 2, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener 52 años (la norma cuenta la edad en la fecha del hecho causante — ver ⚠) | edad gte 52 | «Podrán acceder al subsidio para mayores de cincuenta y dos años los trabajadores que, en la fecha en que se encuentren en el supuesto previsto en el artículo 274.1 tengan cumplida dicha edad» | Art. 280.1 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| aviso: Estar en desempleo total o trabajando a tiempo parcial (nuestra pregunta no distingue jornada — ver ⚠) | situación laboral eq "desempleado" | «Podrán acceder a estos subsidios quienes mantengan uno o varios contratos a tiempo parcial, siempre que la suma de las jornadas trabajadas en dichos contratos sea inferior a una jornada completa» | Art. 274.1.b | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **Haber agotado la prestación por desempleo, o estar en situación legal de desempleo con al menos 90 días cotizados** — «Encontrarse en situación legal de desempleo sin tener cubierto el periodo mínimo de cotización para tener derecho a la prestación contributiva, siempre que hayan cotizado al menos noventa días» (Art. 274.1.a y b)
- **Quien trabaja a tiempo parcial también puede acceder si la suma de jornadas es inferior a una jornada completa (nuestra pregunta no distingue la jornada)** — «siempre que la suma de las jornadas trabajadas en dichos contratos sea inferior a una jornada completa» (Art. 274.1.b)
- **Estar inscrito como demandante de empleo y haber suscrito el acuerdo de actividad** — «el reconocimiento del derecho al subsidio exigirá la inscripción como demandante de empleo, así como la suscripción del acuerdo de actividad» (Art. 274.4)
- **Cumplir todos los requisitos, salvo la edad, para acceder a una pensión contributiva de jubilación** — «acrediten todos los requisitos, salvo la edad, para acceder a cualquier tipo de pensión contributiva de jubilación en el sistema de la Seguridad Social» (Art. 280.1)
- **Haber cotizado por desempleo al menos seis años a lo largo de la vida laboral** — «hayan cotizado efectivamente en España por desempleo durante al menos seis años a lo largo de su vida laboral» (Art. 280.1)
- **Carencia de rentas propias: rentas del mes anterior ≤ 75 % del SMI sin pagas extra (nuestra pregunta recoge ingresos anuales, no mensuales)** — «cuando las rentas de cualquier naturaleza de la persona solicitante o beneficiaria durante el mes natural anterior a dichas fechas no superen el 75 por ciento del salario mínimo interprofesional» (Art. 275.1)
- **No haber percibido ni agotado la Renta Activa de Inserción, la prestación por cese de actividad ni el subsidio extraordinario** — «las personas que hayan percibido o agotado la Renta Activa de Inserción regulada en el Real Decreto 1369/2006» (Art. 280.1)

- **Plazo**: permanente/continuo
- **Canal**: SEPE — Servicio Público de Empleo Estatal — https://sede.sepe.gob.es/ (online)
- **Importe**: per_applicant – € monthly («igual al 80 por ciento del indicador público de rentas de efectos múltiples mensual vigente en cada momento»)
- **Doc**: Solicitud de subsidio (incluye la suscripción del acuerdo de actividad) (obligatorio)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐
