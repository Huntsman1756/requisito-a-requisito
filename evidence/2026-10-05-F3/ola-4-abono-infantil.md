# Hoja de revisión — ola-4-abono-infantil

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## ⚠ Aviso previo para el revisor (bloquea la aprobación)

1. **El abono 7-14 es GRATUITO en 2026, no «precio reducido».** El encargo
   sugería «7-14 precio reducido». Las fuentes oficiales lo desmienten: la
   tabla de precios con descuento (BOCM-20251231-2) lista el
   «ABONO DE 7 HASTA 14 AÑOS — Título gratuito» y la «TARJETA INFANTIL —
   Título gratuito». El RDL 17/2025 fija «Gratuidad para abonos y títulos
   infantiles (niños nacidos entre 2012 y 2026)». La diferencia fina:
   - **Tarjeta/abono infantil (<7)**: gratuita por **tarifa oficial**
     («TARJETA INFANTIL Gratuita» en la Resolución de tarifas,
     BOCM-20251231-3) — no depende de la bonificación anual.
   - **Abono 7-14**: gratuito por **bonificación 2026**; en la tarifa oficial
     figura como JOVEN a 20 €/30 días (perfil «Joven de 7-14 años» del CRTM).
2. **Un solo requisito duro: edad del dependiente.** El beneficio lo disfruta
   el menor, pero el perfil es el de la persona que responde ⇒ la condición es
   `dependents count_where_gte(age lt 15)` (cohorte «nacidos 2012-2026» en
   2026 ≡ 0-14 años). `timeDependent: decreasing`: el paso del tiempo solo
   puede sacar al menor del colectivo (cumplir 15), nunca meterlo — un
   nacimiento es un cambio de perfil, no de fecha.
3. **Las bandas <7 y 7-14 no se modelan como requisitos separados** (la unión
   es «menor de 15»): se documentan en `uncoveredRequirements` y en los
   **documentos condicionados por banda** — `ttp-infantil` solo aparece si hay
   dependiente <7 y `ttp-personal` solo si hay dependiente en [7,15) —
   usando `count_where_gte` con `where` compuesto (`all: [gte 7, lt 15]`),
   soportado por `evalCondition` en `operators.ts`.
4. **Menores de 4 años: gratis sin título.** Hecho solo acreditable con la
   web del CRTM (rango 3): «Para los menores de 4 años, el transporte público
   madrileño es gratuito y no requiere la adquisición de título alguno». Como
   G11 exige rango ≤ 2 en `requirements`/`uncoveredRequirements`/`amount`, el
   dato va **dentro del documento `ttp-infantil`** (los documentos admiten
   rango 3, ADR-034) con un extracto literal largo que cubre carga, validez,
   cobertura y el caso <4.
5. **Residencia: sí se exige, y es más que la CM** (mismo criterio que
   `madrid-abono-transporte-joven`, mismo Anuncio BOCM-20260612-17): la
   expedición de la TTP —infantil o personal del menor— exige acreditar
   residencia en CM ∪ E1/E2 ∪ convenio CLM, salvo familia numerosa.
   Disyunción no modelable ⇒ `hard: false` con `within_territory {ccaa:"13"}`.
6. **`standalone: true`**: `madrid-abono-transporte-infantil` no tiene ficha
   en el catálogo importado (G2 cubierto con 4 fuentes de rango 1 propias).
7. **`documentType` del Anuncio de residencia** se mantiene `informational`
   (coherente con el ruleset del abono joven).

## Fuentes verificadas (todas HTTP 200 el 05/10/2026)

| Uso | URL | Tipo | Bytes | sha256 (bytes) |
|---|---|---|---|---|
| Precios 2026 con descuento (cohorte infantil, «Título gratuito», coste TTP) | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-2.PDF | Resolución CRTM 29/12/2025, BOCM nº 311 (rango 1) | 155.893 | 11dff8cab49a… |
| Tarifas oficiales 2026 («TARJETA INFANTIL Gratuita», JOVEN 20 €) | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-3.PDF | Resolución CRTM 29/12/2025, BOCM nº 311 (rango 1) | 172.390 | c8e8bc79433e… |
| Residencia para expedir la TTP (desde 15/06/2026) | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/06/12/BOCM-20260612-17.PDF | Anuncio CRTM 05/06/2026, BOCM nº 138 (rango 1) | 79.695 | c7f0e137a806… |
| Condiciones generales de la TTP (soporte, solicitud, edad) | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/01/22/BOCM-20260122-20.PDF | Resolución CRTM 19/01/2026, BOCM nº 18 (rango 1) | 170.271 | 2ee837d3826a… |
| Fichas de títulos, perfiles, canal y documentación de menores | https://www.crtm.es/billetes-y-tarifas | CRTM web oficial (rango 3: solo channel, documents, simulator) | 338.551 (HTML) | 6e68ca052a88… |

Re-chequeo `curl -L` el 05/10/2026: **HTTP 200** las 5 URLs citadas, y también
las fichas específicas del buscador `…/buscador/abono-infantil` (200) y
`…/buscador/abono-7-14` (200) — no se añaden como fuentes porque los extractos
necesarios ya están en la página agregadora snapshoteada
(`crtm-billetes-tarifas`) y una nueva extracción de texto sin el pipeline
oficial (`normalizeText`) arriesgaría las huellas de los literales.

Nota sobre variantes de snapshot: para BOCM-20251231-2 se cita el id
`bocm-20251231-2-precios-transporte-2026` (mismo PDF, extracción que conserva
la disposición de tabla «JOVEN / TARJETA AZUL / ABONO +65 / TARJETA INFANTIL /
ABONO DE 7 HASTA 14 AÑOS»); para BOCM-20251231-3 se cita el id
`bocm-20251231-3-tarifas-2026` porque en la variante `-transporte-2026` la
extracción separa las etiquetas de fila de sus valores («JOVEN 20,00 €» no es
literal allí). Mismo `sha256` de bytes en cada par; solo cambia el texto
extraído.

## madrid-abono-transporte-infantil (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener a tu cargo al menos un menor de 15 años (la cohorte infantil bonificada: nacidos entre 2012 y 2026): la tarjeta/abono infantil para los menores de 7 y el abono 7-14 son títulos gratuitos | `dependents count_where_gte(age lt 15, count 1)` | «Gratuidad para abonos y títulos infantiles (niños nacidos entre 2012 y 2026)» | Acuerdo, exposición — descuentos del RDL 17/2025, pág. 65 | BOCM-20251231-2.PDF |
| aviso: Que el menor resida (empadronamiento) en un municipio de la CM — también sirven E1/E2 y convenio CLM, no comprobable | `territory within_territory {"ccaa":"13"}` | «la expedición de las TTP-personales, tanto las nuevas como sus du- plicados, quedará supeditada a la acreditación de la condición de residente…» | Anuncio, párrafo tercero, pág. 48 | BOCM-20260612-17.PDF |

**No comprobables con nuestras preguntas (⚠):**

- **La residencia se acredita con certificado de empadronamiento en vigor (o autorizando su consulta)** — «La condición de residente se acreditará mediante certificado de empadronamiento en vi- gor…» (Anuncio, párrafo cuarto, pág. 48)
- **Los titulares de familia numerosa pueden obtener la TTP aunque el municipio no cumpla residencia** — «se mantendrá la posibilidad de expedición de la Tarjeta de Trans- porte Público Personal para los titulares de título acreditativo de familia numerosa…» (Anuncio, párrafo quinto, pág. 48)
- **El abono 7-14 se carga cada 30 días en una TTP Personal a nombre del menor, personal e intransferible** — «El soporte físico es una tarjeta identificativa (Tarjeta de Transporte Público personal), propiedad del Consorcio Regional de Transportes de Madrid» (Condiciones TTP, apartado 1, pág. 61)
- **La tarjeta infantil es gratuita por tarifa oficial, no por bonificación** — «TARJETA INFANTIL Gratuita» (Tabla TARIFAS DESDE 01/01/2026, pág. 70)
- **La gratuidad del abono 7-14 es bonificación de 2026 (RDL 17/2025) y se revisa cada año; la tarifa oficial joven es 20 €/30 días** — «JOVEN 20,00 € 16,00 € 16,00 € 10,00 € 12,00 € 6,00 €» (Tabla de tarifas, fila JOVEN, pág. 70)

- **Plazo**: permanente (`rolling: true`) — «Mantener los precios del transporte público en el año 2026 continuando con los mis- mos existentes en el segundo semestre de 2025» (Acuerdo, pág. 65). La gratuidad del 7-14 está garantizada solo para 2026; el invariante de frescura fuerza re-verificación.
- **Canal**: CRTM — https://www.crtm.es/billetes-y-tarifas (online + presencial: «Puedes solicitar cita previa para obtener la Tarjeta Transporte Público en la web o en el teléfono … 012»; la primera TTP exige cita previa en Oficina de Gestión; la gestión la realiza el padre/madre/tutor)
- **Simulador oficial**: https://www.crtm.es/billetes-y-tarifas/buscador — «Puedes encontrar el billete más conveniente para ti en nuestro buscador…» (rango 3; ADR-018)
- **Importe**: fixed 0 € monthly («Gratuidad para abonos y títulos infantiles…» — precio que paga el usuario: 0)
- **Doc**: TTP Infantil, gratuita — solo si hay dependiente <7 (condición `count_where_gte age lt 7`); extracto largo rango 3 que cubre carga única, validez hasta cumplir 7, cobertura CM y el caso <4 sin título
- **Doc**: TTP Personal a nombre del menor, emisión 4 € — solo si hay dependiente 7-14 (condición `count_where_gte` con `where: all[gte 7, lt 15]`); cita rango 1 «Tarjeta Transporte Público Personal 4,00 €» (tabla de tarjetas, pág. 68)
- **Doc**: DNI del menor — la edad se comprueba con DNI/NIE o con el Registro Civil (Condiciones TTP, pág. 62)
- **Doc**: Certificado/volante de empadronamiento en vigor del menor (Anuncio residencia, pág. 48)
- **Doc**: Fotografía tamaño pasaporte, reciente y en color (Condiciones TTP, pág. 62)
- **Doc (condicional)**: solicitud firmada por padre/madre/tutor; si el menor <14 no tiene DNI: impreso de autorización + Libro de Familia/partida + DNI del representante; si un menor <7 acude con otra persona: autorización firmada (FAQ TTP, rango 3 — documentos admiten rango 3)

OK / KO por requisito: ☐ ☐

## Lo que se ha verificado y NO se ha modelado (a propósito)

- **La banda <4 sin título y la validez «hasta cumplir 7»** solo figuran en la
  web del CRTM (rango 3): van en el documento `ttp-infantil` (rango 3
  permitido), no en `uncoveredRequirements` (G11 exige rango ≤ 2).
- **Perfil «Joven de 7-14 años» del sistema tarifario** (CRTM): la elegibilidad
  se acota por la cohorte de la Resolución (nacidos 2012-2026 ≡ <15 en 2026),
  equivalente a «7 hasta 14 años» para el abono y «menores de 7» para la
  tarjeta infantil.
- **Descuentos FN/discapacidad**: no aplican a títulos gratuitos (la propia
  web los exceptúa: «salvo … billetes gratuitos, como el Infantil, el abono
  7-14 o el +65») — no aportan precio menor que 0; no se modela.
- **El abono anual** (10 × 30 días) existe para todos los perfiles; no se
  modela por ser modalidad de pago equivalente.
- **Las edades del usuario adulto no importan**: el beneficio es del menor;
  solo se comprueba la existencia del dependiente elegible.
- `themes`: `transporte` + `familia_infancia`; `lifeEvents`: `tener_hijo`.

## Golden persona `gp-abono-infantil-getafe`

- Perfil: madre de 34 años, Getafe (28065, INE), empadronada desde 09/2015,
  asalariada, ingresos 8.400–20.000 €, dos menores a cargo de **5 y 9 años**
  (cubre ambas bandas: infantil <7 y abono 7-14).
- Esperado: **veredicto `posible`** (hard T; aviso de residencia T; quedan
  no comprobables ⇒ nunca `probable`) y **deadline `ROLLING`** a
  `today = 2026-10-05`.
- Verificado con el motor real (`evaluateRuleSet`, tsx sobre junction al
  node_modules del repo principal): `verdict=posible`, `deadline=ROLLING`,
  `selfCheck.passed=true`, `missing=[]`, `blockers=[]`, 5 uncovered.
- Casos frontera ejecutados: dependiente único de 15 ⇒ `no_cumple`; sin
  dependientes ⇒ `no_cumple`; `dependents` sin responder ⇒ `insuficiente` con
  `missing=[dependents]` (U ≠ F); dependiente 14-16 a caballo ⇒ `insuficiente`;
  residente en Toledo (CCAA 45) ⇒ `posible` con residencia F **solo como
  aviso** (soft, no descarta).
- Schemas: `ruleSetSchema.safeParse` OK; `goldenPersonaSchema.safeParse` OK.

## Validación ejecutada

- `scripts/eligibility-validate.ts` (tsx, today=2026-10-05): **22 rulesets,
  0 errores, 22 avisos** (todos `ELIG_G10_HUMAN_REVIEW pending`, esperado).
  G4 verificó extracto presente + `sha256` en las 17 citas de este RuleSet;
  G11 forzó mover 3 datos de rango 3 a `documents` (ver aviso 4).
- `scripts/eligibility-exhaustive.ts`: **360 perfiles** cartesianos para este
  RuleSet — 0 violaciones de invariantes, monotonía y determinismo
  (total lote: 18.580 perfiles, 0 violaciones).
- No se ejecutaron `npm run check`/`test`/`build` (encargo «sin npm»; worktree
  sin node_modules propio — se usó un junction temporal al del repo principal
  para tsx, ya eliminado).

## Pendiente / dudas para el verificador

1. **Diferencia respecto al encargo**: el 7-14 no es «precio reducido», es
   gratuito en 2026. Modelado como tal; el matiz tarifa-oficial-vs-bonificación
   queda en `uncoveredRequirements` (`infantil-gratuita-por-tarifa`,
   `gratuidad-7-14-bonificada`).
2. **`channel.url`** apunta a la página agregadora snapshoteada; existen
   fichas dedicadas `buscador/abono-infantil` y `buscador/abono-7-14` (HTTP
   200) — si el front prefiere enlace por banda, añadirlas como fuentes
   requeriría snapshot oficial del pipeline.
3. **Residencia del menor vs. del solicitante**: el Anuncio habla del
   «solicitante» de la TTP (que en menores es el propio menor, representado
   por sus padres). El label lo dice explícito («que el menor resida»).
4. **`hard: false` en residencia**: misma decisión deliberada que en
   `madrid-abono-transporte-joven` — no descartar a residentes E1/E2/convenio
   ni a titulares de familia numerosa.
