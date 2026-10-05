# Hoja de revisión — ola 2: RMI Comunidad de Madrid

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-renta-minima-insercion (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `madrid-renta-minima-insercion` en
`data/catalog/benefits/` ni pista en `leads.json`; G2 se satisface con las
fuentes de rango 1 propias (Ley 15/2001 consolidada + Decreto 126/2014).

> **Nota para el verificador — divergencia con el encargo.** El encargo citaba
> «Ley 5/2017» y «antigüedad de empadronamiento habitualmente 6 meses». La norma
> real de la RMI de la CM es la **Ley 15/2001, de 27 de diciembre** (BOE-A-2002-4378,
> consolidada al 22/12/2022) y su Reglamento es el **Decreto 126/2014** (BOCM
> 21/11/2014). La antigüedad exigida es de **1 año de residencia efectiva e
> ininterrumpida** (Ley art. 6.1.a + Reglamento art. 7.2); los **6 meses** son la
> antigüedad de la **unidad de convivencia** (Ley art. 6.1.c + Reglamento art. 9.4),
> no del empadronamiento. Las cuantías anuales se fijan en la Ley de Presupuestos
> (para 2026: **Ley 6/2025, art. 58**, BOE-A-2026-3218).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Residir de forma permanente en la Comunidad de Madrid y estar empadronado/a en uno de sus municipios | territorio within_territory {"ccaa":"13"} | «Residir de manera permanente en la Comunidad de Madrid y estar empadronadas en alguno de sus Municipios» | Art. 6.1.a | https://www.boe.es/eli/es-md/l/2001/12/27/15/con |
| **OBLIGATORIO**: Residencia efectiva e ininterrumpida en la CM el año inmediatamente anterior (proxy: antigüedad de empadronamiento; acreditable con certificación/volante, Regl. art. 7.2) | meses de residencia gte 12 | «será necesario tener una residencia efectiva y continuada en la Comunidad de Madrid durante el tiempo que se determine reglamentariamente, que no podrá ser inferior al año inmediatamente anterior a la formulación de la solicitud» | Art. 6.1.a (+ Regl. art. 7.2) | https://www.boe.es/eli/es-md/l/2001/12/27/15/con |
| **OBLIGATORIO**: Ser mayor de 25 años y menor de 65 — salvo con menores o personas con discapacidad a cargo (cualquier edad adulta) u otras vías de 18–25 y +65 (ver ⚠) | ALGUNA VÍA: (edad gte 25 Y edad lt 65) O (edad gte 18 Y (edad lt 25 O edad gt 65) Y personas a cargo count_where_gte ≥1 con (edad lt 18 O discapacidad eq "yes")) | «Ser mayor de veinticinco años y menor de sesenta y cinco en la fecha de formulación de la solicitud» + vía cargo: «Ser menor de veinticinco años o mayor de sesenta y cinco, y tener menores o personas con discapacidad a su cargo» | Art. 6.1.b | https://www.boe.es/eli/es-md/l/2001/12/27/15/con |
| aviso: Los ingresos mensuales de la unidad de convivencia deben ser inferiores a la cuantía de RMI que corresponda (469,93 €/mes persona sola en 2026; escala por miembros — ver ⚠) | ingresos anuales lt 5639.16 | «sean iguales o superiores a la cuantía de Renta Mínima de Inserción que les correspondería en función del número de miembros que la integran» (Regl. art. 12.2) + cuantía: «a) Importe de la prestación mensual básica: 469,93 euros» (art. 58.a) | Art. 12.2 del Reglamento | https://www.bocm.es/boletin/CM_Orden_BOCM/2014/11/21/BOCM-20141121-1.PDF |

**No comprobables con nuestras preguntas (⚠):**

- **La unidad de convivencia debe estar constituida con antelación mínima de 6 meses a la solicitud (certificación/volante de empadronamiento con fecha de alta)** — «la unidad de convivencia deberá estar constituida con una antelación mínima de seis meses a la fecha de la solicitud» (Regl. art. 9.4)
- **Excepciones al plazo de 6 meses de la unidad: menores o personas con discapacidad a cargo, fallecimiento de progenitores/tutores, desarraigo social, violencia familiar o de género, separación/divorcio** — «Podrá exceptuarse el plazo de seis meses previos de constitución de la unidad de convivencia para el reconocimiento de la prestación» (Regl. art. 14.3)
- **Residencia legal: extranjeros con autorización/tarjeta de residencia vigente (la sede pide NIE/TIE, certificado UE o pasaporte)** — «podrá ser percibida por aquellas personas que acrediten tener residencia legal en la Comunidad de Madrid» (Ley art. 2.1)
- **Subsidiariedad: haber solicitado previamente (y que hayan denegado) las pensiones o prestaciones a que se pueda tener derecho — IMV, PNC, desempleo…** — «Haber solicitado previamente de los organismos correspondientes las pensiones o prestaciones a que se refiere el artículo 4.1» (Ley art. 6.1.e y 4.2)
- **Menores de la unidad en edad de escolarización obligatoria escolarizados** — «Tener escolarizados a los menores que formen parte de la unidad de convivencia en edad de escolarización obligatoria» (Ley art. 6.1.f)
- **Suscripción del compromiso de programa individual de inserción y participación activa** — «Haber suscrito el compromiso de formalizar el preceptivo programa individual de inserción y de participar activamente en las medidas que se contengan en el mismo» (Ley art. 6.1.g)
- **Patrimonio conjunto de la unidad < 3 veces la cuantía anual de la RMI correspondiente (la vivienda habitual no computa, Regl. art. 25)** — «sea igual o superior a tres veces la cuantía anual de la Renta Mínima de Inserción que pudiera corresponder» (Regl. art. 12.6)
- **Baja voluntaria, reducción de jornada o rechazo de oferta de empleo en los 6 meses previos ⇒ se presume suficiencia de recursos** — «ha causado baja voluntaria en un trabajo o rechazado una oferta de empleo adecuada a sus capacidades y habilidades, en los seis meses inmediatamente anteriores a la formulación de la solicitud» (Ley art. 8.5)
- **Vías 18–24 años sin menores a cargo: extutela por la CM, orfandad absoluta, grave exclusión social (informe social), víctima de violencia familiar/de género, o participación en Programa de Inclusión Social reconocido** — «Podrá reconocerse la prestación de la Renta Mínima de Inserción a personas con una edad comprendida entre dieciocho y veinticinco años» (Regl. art. 8.2)
- **Mayores de 65 sin menores a cargo: además vivir solo (o sin miembro que pueda ser titular) y denegación expresa de la pensión no contributiva de jubilación** — «a personas con una edad superior a sesenta y cinco años que carezcan de ingresos» (Regl. art. 8.3)
- **Menores de edad: nunca titulares salvo emancipados o con beneficio de mayor edad (nuestra pregunta de edad no lo distingue)** — «En ningún caso podrán ser titulares de renta mínima de inserción las personas menores de edad, salvo que se encuentren emancipadas» (Ley art. 6.1.b, in fine)
- **Residir en establecimiento colectivo público de estancia permanente (residencias de mayores/discapacidad, centros penitenciarios) no constituye unidad de convivencia (excepción: tercer grado para cuidado de hijos)** — «En ningún caso podrán constituir una unidad de convivencia las personas que residan en centros colectivos de titularidad pública de estancia permanente» (Ley art. 7.1)
- **Vía de reconocimiento excepcional por extrema necesidad (nunca exceptúa la residencia permanente en la CM ni aplica a menores no emancipados)** — «En ningún caso podrá excepcionarse el requisito de residir de manera permanente en la Comunidad de Madrid» (Ley art. 6.2)
- **El cómputo real de ingresos es en rendimientos mensuales de TODA la unidad de convivencia, con valoración reglamentaria y recursos no computables (Regl. arts. 15–25); la ley fija además una presunción ligada a la PNC anual/12 (+25 % 2.º miembro, +15 % adicionales). Nuestra comprobación con banda anual solo es orientativa** — «cuando los rendimientos mensuales que obtenga sean inferiores a la cuantía vigente de la pensión no contributiva de la Seguridad Social en cómputo anual prorrateado a doce meses» (Ley art. 8.2)

- **Plazo**: permanente/rolling — prestación continua por solicitud del interesado («se iniciará mediante solicitud de la persona interesada», Regl. art. 31.1; la sede indica «En plazo: permanente»)
- **Canal**: Comunidad de Madrid — Consejería de Familia, Juventud y Asuntos Sociales (preferente: centro municipal de servicios sociales del domicilio) — https://sede.comunidad.madrid/prestacion-social/renta-minima-insercion (online con firma electrónica y presencial) — «La tramitación de la solicitud puede realizarse por medios electrónicos o de forma presencial» (sede)
- **Importe**: range 469,93–1.221 € monthly. Base 469,93 €/mes persona sola +117,48 € 2.º miembro +75,11 € cada siguiente («a) Importe de la prestación mensual básica: 469,93 euros», art. 58.a Ley 6/2025). `maxEur` = tope legal = SMI («El tope máximo será el establecido en el artículo 10.4 de la Ley 15/2001 … esto es, el Salario Mínimo Interprofesional», art. 58 in fine) = 1.221 €/mes en 2026 (RD 126/2026, fuente `boe-rd-126-2026-smi` ya registrada). Del importe se deducen los ingresos mensuales de la unidad (sede: «Se deducirá de esta cuantía los ingresos mensuales que puedan percibir los integrantes de la misma»)
- **Doc**: Certificación de empadronamiento histórico y colectivo (obligatorio)
- **Doc**: Documento de identidad del solicitante y miembros (DNI/NIE/TIE/pasaporte/certificado UE) (obligatorio)
- **Doc**: Libro de Familia completo / certificados de nacimiento / acuerdos de adopción-acogimiento-tutela (obligatorio solo si hay unidad con menores/personas a cargo)
- **Doc**: Certificado de escolaridad y asistencia regular de los menores (obligatorio solo si hay menores)
- **Doc**: Justificantes de ingresos de todos los miembros (obligatorio)
- **Doc**: Documentación del patrimonio mobiliario e inmobiliario (obligatorio)
- **Doc**: Titularidad de la vivienda (compraventa/arrendamiento) (obligatorio)
- **Doc**: Datos bancarios del solicitante (obligatorio)
- **Doc**: Certificados SEPE/SS de prestaciones o pensiones (si las percibes o solicitaste — condicional a desempleado/jubilado)
- **Doc**: Certificado de discapacidad (condicional a discapacidad propia o de personas a cargo)

**Parámetro que haría falta** (no inventado, pendiente): `RMI_CUANTIA_MENSUAL_1P`
(EUR_MONTH, 469,93 desde 2026-01-01, cita art. 58.a Ley 6/2025) — el umbral del
aviso `ingresos-inferiores-rmi` (5639,16 = 469,93 × 12) está literal con cita en
la hoja; si se añade el parámetro a `parameters.json` se puede migrar a
`param` + escala por miembros. Análogo: `RMI_TOPE_SMI` se resuelve ya con el
parámetro existente `SMI_MENSUAL` si se quisiera un `amount` paramétrico.

**Casos límite documentados**: (a) edad exactamente 65 años queda en hueco
literal («menor de 65» F y «mayor de 65» F) — reproduces la literalidad de la
norma; la vía real a esa edad es la excepcional; (b) `edad-25-65` marcado
`timeDependent: "increasing"` pero el motor no calcula fecha futura para
condiciones `any` (whenSatisfied devuelve undefined) ⇒ no se promete elegibilidad
futura errónea a mayores de 64; (c) el requisito de ingresos es `hard:false`
porque el umbral real depende del nº de miembros y se mide en mensual.

OK / KO por requisito: ☐ ☐ ☐ ☐
