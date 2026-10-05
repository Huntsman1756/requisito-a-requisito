# Hoja de revisión — ola-2-abono-joven

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## ⚠ Aviso previo para el revisor (bloquea la aprobación)

1. **El precio vigente NO es 8 €: es 10 €/30 días en 2026.** La tarea sugería
   «tarifa oficial 8 €/30 días». Las fuentes oficiales desmienten esa cifra
   para 2026: la Resolución de precios (BOCM-20251231-2) fija **10,00 €** para
   el Joven ordinario y la Resolución de tarifas (BOCM-20251231-3) deja la
   tarifa oficial en **20,00 €** (el abono joven está exento del +3 %). La
   bonificación actual es del **50 %** (RDL 17/2025 + fondos autonómicos),
   garantizada hasta el **31/12/2026**. Los 8 € correspondieron a la
   bonificación del 60 % de ejercicios anteriores.
2. **No es «gratuidad».** En 2026 son gratuitos el abono 7-14 años, la
   tarjeta infantil (<7) y el abono +65. El Abono Joven (15-25) cuesta 10 €.
   El nombre del slug del programa queda como `madrid-abono-transporte-joven`.
3. **Edad: 15–25 (hasta cumplir 26), no <30.** La ficha CRTM lo dice literal
   («desde los 15 años hasta la fecha en que se cumplen 26 años») y la
   Resolución de precios fija el colectivo bonificado como «nacidos entre
   2000 y 2011» (= quienes cumplen 15–26 durante 2026). Modelado como dos
   requisitos hard: `age gte 15` (increasing ⇒ elegibilidad futura para un
   menor de 15) y `age lt 26` (decreasing).
4. **Residencia: sí se exige, y es más que la CM.** Desde el 15/06/2026
   (Anuncio BOCM-20260612-17) la expedición de la TTP personal exige
   acreditar residencia (certificado de empadronamiento) en un municipio de
   la CM **o** de las zonas tarifarias E1/E2 **o** del convenio con
   Castilla-La Mancha; excepción: titulares de familia numerosa. Esa
   disyunción no es modelable con `within_territory` (solo admite un
   territorio y una lista de municipios E1/E2/convenio no está en nuestros
   datos). Por eso el requisito comprobable es **`hard: false`** con
   `within_territory {ccaa:"13"}` — no puede descartar a un residente de un
   municipio E1/E2 o del convenio (F mostrada como aviso, nunca
   `no_cumple`) — y el detalle completo va a `uncoveredRequirements` con
   cita de rango 1 (docs/07 §0.2 y §2.3).
5. **`standalone: true`**: `madrid-abono-transporte-joven` no tiene ficha en
   el catálogo importado (solo existe como semilla del universo,
   `seed-9c224d99ff` → comunidad.madrid/transportes/abono-joven). Hay tres
   fuentes de rango 1 propias, con lo que G2 queda cubierto.
6. **Dominio nuevo en `registry.json`**: `crtm.es`/`www.crtm.es` con
   `maxRank: 3` (web oficial del operador; el canal y el simulador). Las
   citas del CRTM se usan **solo** para `channel` y `officialSimulator`;
   todos los requisitos y los no comprobables citan BOCM (rango 1).

## Fuentes verificadas (todas HTTP 200 el 05/10/2026)

| Uso | URL | Tipo | Bytes | sha256 (bytes) |
|---|---|---|---|---|
| Precios 2026 (precio 10 €, colectivos, coste TTP) | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-2.PDF | Resolución CRTM 29/12/2025, BOCM nº 311 (rango 1) | 155.893 | 11dff8cab49a… |
| Tarifas oficiales 2026 (tarifa 20 €, abono joven sin +3 %) | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-3.PDF | Resolución CRTM 29/12/2025, BOCM nº 311 (rango 1) | 172.390 | c8e8bc79433e… |
| Residencia para expedir la TTP (desde 15/06/2026) | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/06/12/BOCM-20260612-17.PDF | Anuncio CRTM 05/06/2026, BOCM nº 138 (rango 1) | 79.695 | c7f0e137a806… |
| Condiciones generales de la TTP (soporte, solicitud, edad) | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/01/22/BOCM-20260122-20.PDF | Resolución CRTM 19/01/2026, BOCM nº 18 (rango 1) | 170.271 | 2ee837d3826a… |
| Ficha del título (canal, dónde se carga) | https://www.crtm.es/billetes-y-tarifas/buscador/abono-joven | CRTM web oficial (rango 3, solo canal) | 109.585 (HTML) | 90eb4375e99e… |
| Simulador oficial (buscador de títulos) | https://www.crtm.es/billetes-y-tarifas | CRTM web oficial (rango 3) | 338.551 (HTML) | 6e68ca052a88… |

Nota sobre textos: los extractos citados son literales sobre el texto
normalizado **pdfjs-dist 6.4.299 + `normalizeText`** (el mismo pipeline de
`eligibility:snapshot`, ejecutado con el node_modules del repo principal — la
versión coincide con el lockfile del worktree), incluidos los artefactos de
separación silábica (`mis- mos`, `vigen- tes`, `du- plicados`, `tarifa- rias`,
`vi- gente`, `vi- gor`, `Trans- porte`, `impre- sos`, `ne- cesarios`). Los
bytes y el texto verificador quedaron en `F:\Temp\datawardsmadrid-abono-joven\`
y los bytes también en `F:\AgentState\datawardsmadrid\snapshots\<sha256>.*`.
A diferencia del lote de beca-6000, **sí** se materializaron
`data/eligibility/sources/<id>.json|.txt` (misma salida que produciría el
snapshot oficial; un re-snapshot posterior solo cambiaría `fetchedAt`).

## madrid-abono-transporte-joven (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener al menos 15 años (el abono joven empieza a los 15; de 7 a 14 hay un título gratuito distinto) | edad gte 15 | «Descuento del 50 % para abonos y títulos jóvenes (nacidos entre 2000 y 2011)» | Acuerdo, exposición — descuentos del RDL 17/2025, pág. 65 | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-2.PDF |
| **OBLIGATORIO**: Ser menor de 26 años (el abono joven se puede usar hasta el día en que cumples 26) | edad lt 26 | «Descuento del 50 % para abonos y títulos jóvenes (nacidos entre 2000 y 2011)» | Acuerdo, exposición — descuentos del RDL 17/2025, pág. 65 | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-2.PDF |
| aviso: Vivir (empadronamiento) en un municipio de la CM — también sirven E1/E2 y convenio CLM, no comprobable | territorio within_territory {"ccaa":"13"} | «la expedición de las TTP-personales, tanto las nuevas como sus du- plicados, quedará supeditada a la acreditación de la condición de residente en un municipio de la Comunidad de Madrid o en alguno de los municipios integrados en las zonas tarifa- rias E1 y E2, así como en aquellos municipios expresamente previstos en el convenio vi- gente suscrito con la Comunidad Autónoma de Castilla-La Mancha» | Anuncio, párrafo tercero, pág. 48 | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/06/12/BOCM-20260612-17.PDF |

**No comprobables con nuestras preguntas (⚠):**

- **La residencia se acredita con certificado de empadronamiento en vigor (o autorizando su consulta); en Castilla y León valen los municipios de los convenios vigentes** — «La condición de residente se acreditará mediante certificado de empadronamiento en vi- gor en la que refleje la residencia del solicitante en alguno de los municipios señalados en el apartado anterior» (Anuncio, párrafo cuarto, pág. 48)
- **Los titulares de familia numerosa pueden obtener la TTP aunque su municipio no cumpla los requisitos de residencia** — «se mantendrá la posibilidad de expedición de la Tarjeta de Trans- porte Público Personal para los titulares de título acreditativo de familia numerosa, en los términos previstos en la normativa específica aplicable» (Anuncio, párrafo quinto, pág. 48)
- **El abono se carga en una Tarjeta de Transporte Público Personal (física o virtual), personal e intransferible; emisión 4 €; la solicitud exige foto tamaño pasaporte y documento de identidad** — «El soporte físico es una tarjeta identificativa (Tarjeta de Transporte Público personal), propiedad del Consorcio Regional de Transportes de Madrid, sobre la que figuran impre- sos el nombre y fotografía de la persona a cuyo favor está expedida» (Condiciones TTP, apartado 1, pág. 61)
- **El precio de 10 € es una bonificación del 50 % sobre la tarifa oficial de 20 € garantizada hasta el 31/12/2026 — puede cambiar en años siguientes** — «Aprobar las tablas tarifarias actualizadas con un incremento de un 3 % sobre las vigen- tes, con excepción del abono joven y el título 10 viajes de Castilla-León» (Resolución de tarifas, pág. 69)
- **Con familia numerosa o discapacidad ≥ 65 % el mismo abono cuesta menos: 8 €, 5 €, 6 € o 3 € según el colectivo** — «10,00 € 8,00 € 8,00 € 5,00 € 6,00 € 3,00 € 3,70 € (*) 365 días de validez» (Tabla de precios, fila Joven, pág. 66)

- **Plazo**: permanente/continuo (`rolling: true`) — «Mantener los precios del transporte público en el año 2026 continuando con los mis- mos existentes en el segundo semestre de 2025» (Acuerdo, pág. 65). Sin `opensAt`/`closesAt`: el título existe todo el año; el precio bonificado está garantizado hasta 31/12/2026 y el invariante I8 (frescura ≤ 90 días) fuerza re-verificación antes.
- **Canal**: Consorcio Regional de Transportes Públicos Regulares de Madrid (CRTM) — https://www.crtm.es/billetes-y-tarifas/buscador/abono-joven (online + presencial: app «Tarjeta Transporte», máquinas de autoventa, estancos e intercambiadores; la TTP se pide en webttp.comunidad.madrid u oficinas de gestión con cita 012)
- **Simulador oficial**: https://www.crtm.es/billetes-y-tarifas/buscador — «Puedes encontrar el billete más conveniente para ti en nuestro buscador» (página «Billetes y tarifas», rango 3; ADR-018: será la acción principal de la tarjeta)
- **Importe**: fixed 10 € monthly («10,00 € …» fila Joven/Ordinario — precio que paga el usuario, no importe recibido; la tarifa oficial sin bonificar es 20 €)
- **Doc**: Tarjeta de Transporte Público Personal — emisión 4 € (obligatorio)
- **Doc**: DNI o NIE en vigor (la edad se comprueba con él o con el Registro Civil) (obligatorio)
- **Doc**: Certificado de empadronamiento en vigor o autorización de consulta (obligatorio)
- **Doc**: Fotografía tamaño pasaporte, reciente y en color — en oficina la toman allí (obligatorio)
- **Doc**: Título de familia numerosa o documento de discapacidad (solo si se pide el precio reducido por esos colectivos)

OK / KO por requisito: ☐ ☐ ☐

## Lo que se ha verificado y NO se ha modelado (a propósito)

- **No hay requisito de estudios ni de renta**: el abono joven es un título
  tarifario por edad + soporte TTP, no una subvención con baremo.
- **La banda completa (15 → hasta cumplir 26)** figura literal solo en la web
  del CRTM («desde los 15 años hasta la fecha en que se cumplen 26 años»);
  en rango 1 se modela con la cohorte de la Resolución de precios
  («nacidos entre 2000 y 2011»), equivalente durante 2026.
- **«No puede usarse en viajes internos de Castilla-La Mancha»** (ficha CRTM,
  rango 3): limitación de uso del título, no de elegibilidad — no se modela.
- **Menores de 15-17**: la solicitud de TTP de un menor sin DNI usa el
  Registro Civil y la firma de los progenitores (Condiciones TTP); no se
  modela porque no afecta a la elegibilidad del título.
- **El abono anual** (10× el de 30 días) existe para todos los perfiles; no se
  modela por ser una modalidad de pago equivalente.
- `themes`: `transporte` + `cultura_juventud` (misma clasificación que la
  semilla del universo); `lifeEvents`: `estudiar` como pista de descubrimiento.

## Golden persona `gp-abono-estudiante-alcala`

- Perfil: 19 años (nacimiento 2007), Alcalá de Henares 28005 (INE),
  empadronada desde 2016, estudia («si»), ingresos 0–8.400 €, sin personas a
  cargo, sin discapacidad, vivienda «otra situación».
- Esperado: **veredicto `posible`** (los dos hard T; el aviso de residencia T;
  pero quedan no comprobables ⇒ nunca `probable`) y **deadline `ROLLING`** a
  `today = 2026-10-05`.
- Verificado con el motor real (`evaluateRuleSet`, nodo + tsx sobre el
  node_modules del repo principal): `verdict=posible`, `deadline=ROLLING`,
  `selfCheck.passed=true`, `missing=[]`, `blockers=[]`, 5 uncovered.
- Casos frontera ejecutados: 14 años ⇒ `no_cumple` con
  `futureEligibility.from=2027-10-05` (cumple 15); 26 años ⇒ `no_cumple`;
  residente en Toledo (45) ⇒ `posible` con residencia F **solo como aviso**
  (soft, no descarta — correcto por si es municipio de convenio); territorio
  sin responder ⇒ `posible` con U.

## Validación ejecutada

- `scripts/eligibility-validate.ts` (tsx, today=2026-10-05): **12 rulesets,
  0 errores, 12 avisos** (todos `ELIG_G10_HUMAN_REVIEW pending`, esperado).
  G4 verificó extracto presente + `sha256` en las 14 citas de este RuleSet.
- `scripts/eligibility-exhaustive.ts`: **45 perfiles** cartesianos para este
  RuleSet — 0 violaciones de invariantes, monotonía y determinismo
  (total lote: 9.571 perfiles, 0 violaciones).
- `goldenPersonaSchema.safeParse`: OK.
- No se ejecutaron `npm run check`/`test`/`build` completos (worktree sin
  node_modules propio; se usó un junction temporal al del repo principal,
  ya eliminado — ver nota de limpieza en el informe del agente).

## Pendiente / dudas para el verificador

1. **Diferencia respecto al encargo**: precio real 10 € (no 8 €) y NO es
   gratuidad. Si el producto quiere reflejar también la gratuidad 7-14 o el
   abono +65, serían RuleSets distintos.
2. **`documentType` del Anuncio de residencia** se ha marcado
   `informational` (no es «Resolución»; el enum no tiene «instrucción»).
   Revisar si se prefiere `regulatory_base`.
3. **`residencia-municipio-crtm` como `hard:false`**: decisión deliberada
   para no descartar a residentes de municipios E1/E2/convenio CLM ni
   titulares de familia numerosa fuera de la CM. Si el motor ganara un modo
   «territorio en lista de municipios», podría endurecerse.
4. **`channel.url`** apunta a la ficha del título en crtm.es; la petición de
   la TTP se hace en webttp.comunidad.madrid (dominio `.comunidad.madrid`,
   rango 4) — se menciona en la etiqueta del documento, no como cita.
5. **El dominio `crtm.es` (maxRank 3) se añadió a `registry.json`**; si la
   revisión prefiere rango 4 para webs corporativas de operadores, basta
   subir `rank` a 4 en las dos fuentes CRTM.
