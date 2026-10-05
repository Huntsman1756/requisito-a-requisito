# Hoja de revisión — ola 5 · madrid-ayudas-alquiler-plan-estatal

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## Elección de fuente y encuadre

**Programa de ayuda al alquiler de vivienda del Plan Estatal 2022-2025** (el
«Programa 2» del RD 42/2022), gestionado por la CM con convenio de 15/09/2022.
**No** es el Bono Alquiler Joven (concesión directa, ≤35 años) ni la línea de
«ayuda a las personas jóvenes» de la misma convocatoria: es la ayuda general al
alquiler para sectores con escasos medios y mayores de 65 años.

Marco citado (todo rango 1 salvo la sede):

- **Orden 3479/2022, de 7 de octubre** (BOCM nº 242, 11/10/2022) — bases
  reguladoras de la CM (art. 5 programas, art. 6 sectores preferentes y
  requisitos, art. 7 incompatibilidad, art. 8 cuantía 50 %).
- **RD 42/2022, arts. 27–32** (texto consolidado ELI) — requisitos del programa
  y cuantía «hasta el 50 % de la renta mensual».
- **Extractos de convocatoria BOCM**: 2025 (BOCM-20251028-25, Orden 22/10/2025,
  BDNS 864405/864406), 2024 (BOCM-20241029-11, Orden 24/10/2024) y 2023
  (BOCM-20231016-8, Orden 11/10/2023).
- **Sede A858** (`sede.comunidad.madrid/ayudas-becas-subvenciones/ayudas-alquiler-jovenes-0`,
  rango 3) — solo canal y documentos.

**No existe ficha** `madrid-ayudas-alquiler-plan-estatal` en
`data/catalog/benefits/` ⇒ `standalone: true` + fuentes rango 1 (gate G2).

## Corrección del encargo (importante)

El encargo describía «edad ≤ 65 (o excepción)». **Es al revés**: el programa
general de alquiler **no tiene edad máxima**; solo exige mayoría de edad
(art. 27.1 RD + art. 6.2 Orden) y pertenencia a un sector preferente, siendo
precisamente uno de ellos «unidades de convivencia en la que todos sus miembros
tienen edades iguales o superiores a 65 años» (art. 6.1.g). El tope de 35 años
corresponde a la línea «personas jóvenes» de la misma Orden (art. 5.2/6.3) y a
otros programas. Se ha modelado la norma real.

Nota de vigencia (ADR-035): existe **RD 326/2026** (Plan Estatal de Vivienda
2026-2030) desde el 23/04/2026, visible en el propio texto consolidado («Téngase
en cuenta…»). A fecha 2026-10-05 **no hay convocatoria CM 2026** publicada en el
BOCM (solo resoluciones de convocatorias 2024/2025 y la línea de emergencia por
incendios de la Sierra Oeste, BOCM-20260904-31, que es otra ayuda). Se modela la
última convocatoria conocida (2025) con `recurrence: annual` ⇒ `CLOSED_RECURRING`.
La próxima convocatoria puede cambiar bases si la CM la dicta bajo el nuevo plan.

## madrid-ayudas-alquiler-plan-estatal (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Ser mayor de edad en la fecha de la solicitud | edad gte 18 | «las personas físicas mayores de edad que reúnan todos y cada uno de los requisitos siguientes» | Art. 27.1 | https://www.boe.es/eli/es/rd/2022/01/18/42/con |
| **OBLIGATORIO**: La vivienda alquilada (tu residencia habitual) debe estar en la Comunidad de Madrid | territorio within_territory {"ccaa":"13"} | «correspondiendo su gestión a la Comunidad de Madrid» | Art. 2 | https://www.bocm.es/boletin/CM_Orden_BOCM/2022/10/11/BOCM-20221011-19.PDF |
| **OBLIGATORIO**: Ingresos anuales de la unidad ≤3×IPREM (25.200 €); 4×IPREM si FN general/discapacidad/terrorismo; 5×IPREM (42.000 €) si FN especial o discapacidad ≥33 % — comprobamos el tope más alto sobre tus ingresos | ingresos anuales lte 5×IPREM_ANUAL_14P | «de 5 veces el IPREM cuando se trate de familias numerosas de categoría especial o de personas con discapacidad con un grado reconocido igual o superior al 33 %» | Art. 27.1.c | https://www.boe.es/eli/es/rd/2022/01/18/42/con |
| aviso: Pertenecer a alguno de los colectivos: FN, monoparental con cargas, víctima de VG o terrorismo en la unidad, miembro con discapacidad, todos desempleados que han agotado prestaciones, o todos ≥65 años | any(familyType=familia-numerosa · familyType=monoparental + ≥1 persona a cargo · discapacidad propia ≥33 % o de una persona a cargo) | «que se encuentren en alguno de los supuestos siguientes establecidos en la Orden de convocatoria para cada uno de los programas» | Extracto, Primero (I) | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/10/28/BOCM-20251028-25.PDF |
| aviso: Ser titular de un contrato de arrendamiento LAU, cesión de uso o habitación ya firmado (en este programa no vale «estar en condiciones de suscribirlo») | situación de vivienda in ["alquiler","general"] | «Ser titular, en calidad de arrendatario, de un contrato de arrendamiento de vivienda formalizado en los términos de la Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos» | Art. 27.1.a | https://www.boe.es/eli/es/rd/2022/01/18/42/con |

**No comprobables con nuestras preguntas (⚠):**

- **Ser español, UE/EEE/Suiza o extranjero con estancia o residencia regular** — «Poseer la nacionalidad española, o la de alguno de los Estados miembros de la Unión Europea o del Espacio Económico Europeo, Suiza» (Orden, art. 6.2.a)
- **Los otros colectivos con derecho**: víctimas acreditadas de violencia de género o de terrorismo en la unidad, todos los miembros desempleados que han agotado prestaciones, todos los miembros ≥65 años — si es tu caso, sí puedes solicitarla — «Unidades de convivencia en la que todos sus miembros tienen edades iguales o su[periores a 65 años]» (Orden, art. 6.1.c-d, f-g)
- **Titularidad exacta del contrato** (a tu nombre; «en condiciones de firmarlo» solo en la línea de jóvenes) — «o de un contrato de cesión de uso o de arrendamiento o cesión de uso de una habitación» (Orden, art. 6.2.b)
- **Residencia habitual y permanente** acreditada con volante de empadronamiento — «constituya la residencia habitual y permanente de la persona arrendataria» (Orden, art. 6.2.c)
- **El límite real es sobre la suma de rentas de TODA la unidad de convivencia** (3/4/5×IPREM según supuesto; en habitación solo cuentan las tuyas) — «la suma total de las rentas anuales de las personas que tengan su domicilio habitual y permanente en la vivienda arrendada, consten o no como titulares del contrato de arrendamiento sean iguales o inferiores a 3 veces el Indicador Público de Renta de Efectos Múltiples (IPREM)» (RD, art. 27.1.c)
- **Ingreso mínimo de la unidad** >0,5×IPREM/año (4.200 € en 2026) para FN, terrorismo, discapacidad o todos ≥65; para el resto basta ≥0 € — «sean iguales o superiores a 0,50 veces el IPREM» (Orden, art. 6.2.e)
- **Renta mensual máxima**: 600 € vivienda / 300 € habitación; hasta 900 €/450 € en los 55 municipios listados y, para FN, en toda la CM — «por una renta arrendaticia o precio de cesión, igual o inferior a 600 euros mensuales» (RD, art. 27.1.d)
- **No ser propietario o usufructuario** de vivienda en España (excepciones: parte alícuota por herencia, separación/divorcio, inaccesibilidad por discapacidad, causa ajena) — «Ser propietaria o usufructuaria de alguna vivienda en España» (RD, art. 27.2.a)
- **Sin parentesco 1.º/2.º grado con el arrendador ni ser socio/partícipe** (salvo cooperativas en cesión sin ánimo de lucro) — «tenga parentesco en primer o segundo grado de consanguinidad o de afinidad con la persona arrendadora o cedente» (RD, art. 27.2.b-c)
- **No incurso en art. 13 LGS ni con revocación** de ayudas de planes de vivienda — «Que esté incursa en alguna de las circunstancias previstas el artículo 13 de la Ley 38/2003» (Orden, art. 6.2.g.iv)
- **Incompatible con otras ayudas al alquiler** (incl. Renta Básica; solo se exceptúan ayudas de especial vulnerabilidad, prestaciones no contributivas e IMV) — «no podrán compatibilizarse con percepciones de la Renta Básica de Eman[cipación]» (Orden, art. 7)

- **Plazo**: convocatoria 2025 cerrada (04/11/2025–15/12/2025); recurrente anual
  — convocatorias 2023 (01/11–15/12/2023), 2024 (01/11–15/12/2024) y 2025 citadas
  en `previousCalls` ⇒ **CLOSED_RECURRING**, próxima estimada ~04/11/2026.
- **Canal**: Comunidad de Madrid — Consejería de Vivienda, Transportes e
  Infraestructuras (Dirección General de Vivienda y Rehabilitación) —
  https://sede.comunidad.madrid/ayudas-becas-subvenciones/ayudas-alquiler-jovenes-0
  (online con firma electrónica + presencial). Ref. trámite: A858, sin tasas.
- **Importe**: variable — «hasta el 50 % de la renta o precio mensual» (RD,
  art. 30; Orden, art. 8). Período subvencionable 2025: enero–diciembre.
- **Doc**: contrato/s de arrendamiento vigentes en el periodo subvencionable (obligatorio)
- **Doc**: volante/certificado de empadronamiento colectivo/familiar (obligatorio)
- **Doc**: certificado de vida laboral de todos los mayores empadronados (obligatorio)
- **Doc**: Anexos I y II (autorización arrendatarios + declaración responsable convivientes) (obligatorio)
- **Doc**: IRPF o certificado de imputaciones AEAT de la unidad, solo si no autorizas la consulta fiscal (obligatorio)
- **Doc**: certificado del organismo pagador si percibes RMI/emergencia/prestaciones exentas (condicional)
- **Doc**: certificado de bases de cotización si Sistema Especial Empleados de Hogar (condicional)
- **Doc**: acreditación monoparental (condicional: familyType=monoparental)
- **Doc**: acreditación víctima de violencia de género (condicional, sin pregunta)
- **Doc**: certificado de víctima de terrorismo DGAVT (condicional, sin pregunta)
- **Doc**: certificado/resolución SEPE de prestaciones agotadas de todos los mayores (condicional, sin pregunta)
- **Doc**: permiso de residencia legal (solo extranjeros no comunitarios)
- **Doc**: la CM consulta por vía electrónica NIF/NIE, título FN, discapacidad y desempleo SEPE salvo oposición motivada

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## Decisiones de modelado y dudas para el revisor

1. **`sector-preferente` no-hard con solo las vías comprobables**: la norma exige
   estar en uno de 7 supuestos (art. 6.1). Solo podemos acreditar FN,
   monoparental con cargas y discapacidad (propia ≥33 % o de persona a cargo).
   Las demás (VG, terrorismo, desempleo agotado de todos, todos ≥65) no se
   preguntan o no son probables con nuestros campos ⇒ nunca puede ser F con
   honestidad: si ninguna vía comprobable se cumple queda como aviso (⚠), no como
   bloqueo (ADR-017; UNKNOWN ≠ NO), y `uncoveredRequirements` lo explica.
2. **`ingresos-max-5iprem` hard sobre los ingresos propios**: si los ingresos
   propios ya superan 5×IPREM, los de la unidad también ⇒ F segura. La banda
   abierta «≥25.200 €» evalúa U (straddle), no F. Los umbrales reales por
   supuesto (3/4/5×IPREM) y el suelo de 0,5×IPREM quedan en `uncovered`.
   Se sigue `IPREM_ANUAL_14P` (8.400 €) — la norma habla de «IPREM» anual; el
   mismo parámetro usado en madrid-bono-alquiler-joven (mismo RD).
3. **`vivienda-en-madrid` sobre `territory`**: como en bono-alquiler-joven, la
   pregunta de territorio modela la vivienda/residencia en la CM; el detalle
   «habitual y permanente + empadronamiento» está además en ⚠
   (`residencia-habitual`).
4. **`contrato-alquiler` no-hard**: quien responde «propiedad» probablemente
   incumple 6.2.b y 6.2.g.i, pero hay excepciones ⇒ aviso (mismo patrón que el
   Bono). A diferencia del Bono, aquí no vale «en condiciones de suscribir»
   (eso es solo de la línea de jóvenes, art. 6.3) — se dice en el label.
5. **`window` = convocatoria 2025 + `previousCalls` [2023, 2024, 2025]**: las
   tres son anuales consecutivas citadas (extractos BOCM). Incluir la propia
   2025 en `previousCalls` hace que `nextOpeningEstimate` = 04/11/2026 (+1 año
   sobre la última apertura), la expectativa correcta; con solo [2023, 2024] la
   estimación caería en 2025 (ya pasada). Convención distinta a la de
   `madrid-beca-comedor-escolar` (que no incluye la ventana vigente): revisar si
   el verificador prefiere la otra lectura; ambas producen CLOSED_RECURRING.
6. **Monoparental con cargas**: `familyType=monoparental` + ≥1 persona a cargo
   (cualquier edad <99). La Orden define monoparental con hijos menores no
   emancipados o mayores incapacitados sujetos a patria potestad prorrogada; las
   personas «a cargo» del perfil son el proxy declarado — se documenta.
7. **Discapacidad**: la vía propia exige `gte33` (33 % reconocido, umbral
   habitual de «persona con discapacidad»); un <33 % o «prefiero no decirlo» no
   produce falso ✓ — cae a ⚠ con el supuesto completo visible. Personas a cargo
   con `disability: yes` también cuentan («algún miembro»).
8. **RD 42/2022 vs RD 326/2026**: el Plan Estatal 2022-2025 sigue siendo la base
   de la última convocatoria (2025). Si la CM convoca en 2026 bajo el nuevo plan,
   habrá que revisar umbrales y sectores (tarea de frescura F9).
9. **Extractos**: elegidos evitando los cortes «xx- » del PDF del BOCM (la
   normalización pdfjs no los une en la misma línea); el BOE en HTML no presenta
   ese problema. `excerptSha256` calculado con la normalización del motor y
   verificado contra los `.txt` snapshot de `data/eligibility/sources/`
   (05/10/2026, HTTP 200 en las 6 descargas).
10. **Sin simulador oficial** detectado para este trámite en la sede ⇒ sin
    `application.officialSimulator`.

## Persona golden

`gp-alquiler-vallecas`: madre 42 años, familia numerosa, 3 hijos a cargo,
Puente de Vallecas (Madrid 28079), alquiler, ingresos propios 8.400–16.800 € ⇒
`posible` + `CLOSED_RECURRING` (verificado ejecutando el motor: todos los
requisitos T, «sector-preferente» resuelve por la vía «familia numerosa»;
blockers [], missing []; invariantes I1–I10 pasan). Contraejemplos comprobados:
fuera de CM ⇒ `no_cumple`; 17 años ⇒ `no_cumple` + elegibilidad futura
2027-10-05; banda de ingresos abierta ⇒ U honesta; ≥65 sin colectivo
comprobable ⇒ `posible` con aviso.
