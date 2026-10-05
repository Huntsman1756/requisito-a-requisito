# Hoja de revisión — ola 2: abono transporte 65 (Tarjeta Azul)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-abono-transporte-65 (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `madrid-abono-transporte-65` en
`data/catalog/benefits/`; G2 se satisface con fuentes de rango 1 propias
(Resoluciones CRTM en BOCM).

### Aclaración de producto (importante)

La tarea mezclaba dos títulos distintos. Se ha modelado la **Tarjeta Azul**
(Ayuntamiento de Madrid), porque el programa pedido cita «tarjeta azul» y
«precio mensual». El **Abono +65** del CRTM (gratuito, 365 días, toda la CM,
sin límite de renta) es otro producto: queda citado como alternativa en
`uncoveredRequirements`. Candidato a RuleSet propio si la ola lo pide.

### Hallazgos frente al encargo

- **Empadronamiento**: NO es «residencia en la zona tarifaria» ni «CM» en
  general. La Tarjeta Azul exige **empadronamiento en el municipio de Madrid**
  (INE 28079). Modelado como `within_territory { municipality: "28079" }`
  (hard): quien vive en Móstoles o Getafe obtiene F, quien solo sabe su
  provincia obtiene U (UNKNOWN ≠ NO).
- **Sede oficial**: ni `crtm.es` ni `tarjetas.dgt` tramitan la Tarjeta Azul.
  **Se solicita a través del Ayuntamiento de Madrid**, presencial en las
  Oficinas Línea Madrid sin cita previa (salvo auxiliares Aravaca, El Pardo y
  Valverde); la emisión y la gestión corren a cargo del CRTM. La vía
  electrónica existe **solo** para la categoría «persona con discapacidad
  mayor de 18 años» ⇒ `channel.online: false`, `inPerson: true` para la vía
  >65. `sede.madrid.es` bloquea la descarga automatizada (HTTP 403, WAF) ⇒
  no se ha podido snapshotear; el canal se cita de la página oficial del
  título en `crtm.es` (rango 3, permitido para canal/documentos por G11).
- **Precio mensual**: el título de 30 días cargado en la Tarjeta Azul cuesta
  **3,70 € en 2026** (precio bonificado, Acuerdo de precios, rango 1). La
  **tarifa oficial** sin bonificar es **6,30 €** (Acuerdo de tarifas, rango 1).
  Como la bonificación se renueva por acuerdos periódicos, queda avisado en
  ⚠ `precio-bonificado-anual`.
- **Renta**: para mayores de 65 sin cargas familiares el tope es **1×IPREM**
  (8.400 €/año en 2026, parámetro `IPREM_ANUAL_14P`). Con cargas familiares
  hay escala (hasta 1,765×IPREM). Como nuestras preguntas no comprueban
  «cargas familiares» con su definición legal, el requisito de renta va
  `hard: false` (aviso), no excluye (UNKNOWN ≠ NO).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener 65 años cumplidos | edad gte 65 | «Tener sesenta y cinco años cumplidos» | Anexo, apartado A) Primera | https://www.bocm.es/boletin/CM_Orden_BOCM/2011/05/25/BOCM-20110525-21.PDF |
| **OBLIGATORIO**: Estar empadronado/a en el municipio de Madrid | territorio within_territory { municipality: "28079" } | «Podrán disfrutar de este beneficio aquellas personas que, siendo residentes en Madrid, reúnan alguna de las condiciones siguientes» | Anexo, apartado A) | https://www.bocm.es/boletin/CM_Orden_BOCM/2011/05/25/BOCM-20110525-21.PDF |
| aviso: Rentas individuales anuales de 1×IPREM o menos (8.400 € en 2026) | ingresos anuales lte IPREM_ANUAL_14P | «no percibir por ingresos totales individuales una cantidad superior al Indicador Público de Rentas de Efectos Múltiples» | Anexo, apartado A) Primera | https://www.bocm.es/boletin/CM_Orden_BOCM/2011/05/25/BOCM-20110525-21.PDF |

**No comprobables con nuestras preguntas (⚠):**

- **Con personas a tu cargo (distintas del cónyuge) el tope de renta sube: 1,16499×IPREM / 1,37294× / 1,765× (1, 2, 3+ cargas), con prueba de las cargas** — «en el caso de las personas con cargas familiares distintas del cónyuge, no se considerará el tope del IPREM, sino la siguiente escala» (Anexo, apartado A) Sexta)
- **Si alguna de las personas a tu cargo percibe ingresos, se suman a tu renta a todos los efectos** — «si cualquiera de estas personas a cargo, percibiera algún tipo de ingreso, se sumará a todos los efectos, a la renta del solicitante» (Anexo, apartado A) Sexta)
- **Otras categorías cubiertas: pensionistas por razón de edad o invalidez permanente, discapacidad ≥33 % (tope 3×IPREM), dependientes >18, cónyuges/parejas sin ingresos de beneficiarias y dependientes menores de edad** — «Tener la condición de discapacitado (en cualquiera de sus formas), con un grado de minusvalía igual o superior al 33 por 100 reflejado en el certificado emitido por la Comisión Técnica Calificadora u otro organismo competente, que no perciba ingresos totales individuales superiores a tres veces el IPREM» (Anexo, apartado A) Segunda–Séptima)
- **El título solo sirve en Metro zona A, EMT y ML1** — «validez mensual y utilización ilimitada en las redes de MetroMadrid (red de metro en la zona tarifaria A, incluido ML-1) y de la Empresa Municipal de Transportes de Madrid» (Resolución 2009, expositivo)
- **3,70 € es precio bonificado 2026 (tarifa oficial 6,30 €); las bonificaciones se renuevan por acuerdos periódicos y el precio puede variar** — «TARJETA AZUL 6,30 €» (Acuerdo de tarifas 2026, tabla TÍTULO 30 DÍAS)
- **Alternativa: el Abono +65 del CRTM, título gratuito de 365 días para cualquier usuario mayor de 65** — «ABONO +65 (*) Título gratuito» (Acuerdo de precios 2026)
- **Revisión de oficio del Ayuntamiento: puede retirar el beneficio si dejas de cumplir requisitos** — «El Ayuntamiento de Madrid, con la frecuencia que determine, procederá a la revisión de las Tarjetas Azules» (Anexo, apartado C))

- **Plazo**: permanente/rolling («Que el día 2 de marzo de 2009 comience el proceso de recepción de solicitudes y tramitación de la Tarjeta Azul», Resolución 2009, Disposición Segundo; `opensAt 2009-03-02`)
- **Canal**: Ayuntamiento de Madrid — Oficinas Línea Madrid, presencial sin cita previa (salvo auxiliares Aravaca, El Pardo, Valverde); online solo para discapacidad >18 — https://crtm.es/landing-billetes-y-tarifas/tarjeta-transporte-publico-azul/ — «La Tarjeta Azul se solicita de forma presencial en las Oficinas de Atención al Ciudadano Línea Madrid , sin cita previa, excepto las oficinas auxiliares de Aravaca, El Pardo y Valverde, o por medios electrónicos (actualmente, solo para la categoría de 'Persona con discapacidad mayor de 18 años')». La tarjeta caduca a los 5 años (fuente rango 3; se anota aquí, no en los requisitos).
- **Importe**: fixed 3,70 € monthly («TARJETA AZUL 3,70 €», Acuerdo de precios 2026, tabla TÍTULO 30 DÍAS)
- **Doc**: Fotocopia del DNI (obligatorio, Anexo B).1)
- **Doc**: Fotografía tamaño pasaporte, reciente y en color (obligatorio; presencial te la pueden tomar en la oficina — Condiciones TTP 2026, cláusula 4, que cubre «incluida la denominada tarjeta azul»)
- **Doc**: Documento acreditativo de los ingresos percibidos (obligatorio, Anexo B).2)
- **Doc**: Solicitud con autorización de comprobación de datos y compromiso de comunicar variaciones (obligatorio, Anexo B).4)
- **Doc**: Ingresos de los menores a cargo (solo si hay menores a cargo con ingresos, Anexo B).3)

OK / KO por requisito: ☐ ☐ ☐

## Fuentes (HTTP 200 verificadas, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| bocm-20090316-tarjeta-azul | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2009/03/16/2009-03-16_11032009_0226.pdf | 200 | 403fc4119f0f… |
| bocm-20110525-tarjeta-azul | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2011/05/25/BOCM-20110525-21.PDF | 200 | e2ff8440fa7e… |
| bocm-20251231-2-precios-2026 | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-2.PDF | 200 | 11dff8cab49a… |
| bocm-20251231-3-tarifas-2026 | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-3.PDF | 200 | c8e8bc79433e… |
| bocm-20260122-20-condiciones-ttp | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/01/22/BOCM-20260122-20.PDF | 200 | 2ee837d3826a… |
| crtm-tarjeta-azul | 3 | https://crtm.es/landing-billetes-y-tarifas/tarjeta-transporte-publico-azul/ | 200 | 593bd3bad2f5… |

Descartada por inaccesible: `sede.madrid.es` (trámite oficial del
Ayuntamiento) — HTTP 403 (WAF) con curl y webfetch; la información de canal
se cita de `crtm.es` (rango 3, válido para canal por G11).

## Decisiones

1. **Producto = Tarjeta Azul** (municipal, Ayuntamiento de Madrid), no el
   Abono +65 (CRTM, gratuito). El +65 queda como alternativa ⚠ citada;
   candidato a RuleSet propio (`madrid-abono-transporte-mas-65` o similar).
2. **`standalone: true`**: sin ficha en `data/catalog/benefits/`; rango 1
   propio (Resoluciones CRTM 2009/2011 + Acuerdos 2025).
3. **Empadronamiento = municipio de Madrid (28079)**, más estricto que lo
   pedido («zona tarifaria»/«CM»). `within_territory` da U si el usuario
   solo conoce provincia/CCAA.
4. **Renta `hard: false`**: el tope real depende de cargas familiares no
   comprobables; F solo avisa. La escala va a ⚠.
5. **`excerptSha256` reales** calculados como sha256 del extracto
   normalizado (igual que `ruleset-fill-hashes.ts`); cada extracto verificado
   presente en su `.txt` (equivalente G4). Ningún «FILL».
6. **Registry**: añadidos `crtm.es` y `www.crtm.es` con `maxRank: 3`
   (órgano gestor, precedente `renfe.com`). Sin citas a `sede.madrid.es`
   (inaccesible) ni `madrid.es` (rango 4 y 403).
7. **Snapshots sin npm**: bytes descargados con curl (200), sha256 con
   `sha256sum`, texto con `pdftotext` (modo por defecto para prosa; `-table`
   en las dos tablas tarifarias para conservar fila «TARJETA AZUL → precio»,
   que el orden del stream PDF separa) + normalización equivalente a
   `text-normalize.ts` (NFC, comillas, guiones de corte, blancos). Bytes en
   `F:\AgentState\datawardsmadrid\snapshots\<sha256>.<ext>`; metadatos en
   `data/eligibility/sources/<id>.json`.
8. **`window.opensAt: 2009-03-02`**, `rolling: true` (recepción continua de
   solicitudes desde la Resolución de 2009; no hay cierre).
9. **Caducidad 5 años**: consta en `crtm.es` (rango 3) pero no en las
   Resoluciones citadas; por G11 no puede ir en requisitos ⇒ se anota en
   esta hoja y en el canal, pendiente de una fuente rango ≤2 si se quiere
   modelar.

## Notas para el verificador independiente

- Comprobar en el PDF de tarifas (BOCM-20251231-3, tabla «TARIFAS DESDE
  01/01/2026») que la fila TARJETA AZUL vale 6,30 € y en el de precios
  (BOCM-20251231-2) que vale 3,70 €.
- La comprobación de «extracto literal» usa el `.txt` commiteado; en la
  tabla de precios la fila es legible en el PDF pero el orden de extracción
  del stream separa etiqueta y valor ⇒ `.txt` generado con `pdftotext
  -table` (ver §Decisiones, punto 7).
- Pendiente de revisión humana: `humanReview.status = pending`.
- Golden `gp-abono-65-carabanchel`: espera `posible` + `ROLLING` (edad y
  municipio hard = T; renta no-hard = T; 7 ⚠ no comprobables).
