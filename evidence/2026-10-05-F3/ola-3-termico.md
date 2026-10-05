# Hoja de revisión — ola 3: Bono Social Térmico (Comunidad de Madrid)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## bono-social-termico (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `bono-social-termico` en
`data/catalog/benefits/`; G2 se satisface con las fuentes de rango 1 propias
(RDL 15/2018 consolidado + Orden 1478/2022 + Orden 4379/2025 del BOCM).

> **Nota para el verificador — divergencia con el encargo.** El encargo citaba
> «misma fuente RD 897/2017» y «canal seg-social». Dos correcciones sobre la
> fuente real:
>
> 1. **El bono social térmico NO está en el RD 897/2017**: el texto consolidado
>    del RD (snapshot `boe-rd-897-2017-bono-social`, actualización 28/01/2026)
>    no contiene ni «térmico» ni «calefacción» — el art. 14 bis trata del
>    reparto del coste del bono eléctrico. El BST lo crea el **art. 5 del Real
>    Decreto-ley 15/2018, de 5 de octubre** (BOE-A-2018-13593), que remite al
>    RD 897/2017 solo para la definición de consumidor vulnerable (esa parte se
>    reutiliza con la misma fuente y los mismos extractos que
>    `bono-social-electrico.json`).
> 2. **El canal en Madrid no es la Seguridad Social**: tras la STC 134/2020 la
>    gestión y el pago corresponden a las CC.AA. (art. 10 RDL 15/2018) y la
>    Comunidad de Madrid lo gestiona por la **Ley 4/2022** y la **Orden
>    1478/2022** (BOCM 29/06/2022), de la Consejería de Familia, Juventud y
>    Asuntos Sociales. El trámite ciudadano es la sede CM
>    (`sede.comunidad.madrid`, ref. A874 «Bono Social Térmico 2025»), no
>    seg-social. `seg-social.es` no muestra página pública del BST para la CM.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Punto de suministro eléctrico de la vivienda habitual en la CM (proxy: empadronamiento en municipio CM) | territory within_territory {"ccaa":"13"} | «consumidores domésticos con punto de suministro de energía eléctrica dentro del ámbito territorial de la Comunidad de Madrid que sean beneficiarios del bono social de electricidad» | Art. 1 Orden 1478/2022 | https://bocm.es/boletin/CM_Orden_BOCM/2022/06/29/BOCM-20220629-29.PDF |
| aviso: Cumplir alguna vía de «consumidor vulnerable» del BSE | ALGUNA VÍA: (familyType eq "familia-numerosa") O (incomeAnnual lte 1,5 × IPREM_ANUAL_14P) | «deberá cumplir alguno de los requisitos siguientes» + «Estar en posesión del título de familia numerosa» + «sea igual o inferior a 1,5 veces el IPREM de 14 pagas» | Art. 3.2 RD 897/2017 | https://www.boe.es/eli/es/rd/2017/10/06/897/con |

**No comprobables con nuestras preguntas (⚠):**

- **Ser perceptor del BSE a 31/12 del año anterior — criterio decisivo**: la ayuda es de concesión directa de oficio; las comercializadoras de referencia remiten el listado a la CM antes del 31 de enero (Orden art. 6.3). No hay pregunta «¿percibes el bono social de electricidad?» ⇒ U — «las personas físicas que perciban el bono social de electricidad previsto en el artículo 45 de la Ley 24/2013, de 26 de diciembre, del Sector Eléctrico, a 31 de diciembre del año anterior» (Orden art. 5; igual en RDL art. 8)
- **Titularidad PVPC de la vivienda habitual** (necesaria para ser perceptor del BSE) — «la persona titular de un punto de suministro de electricidad en su vivienda habitual que, siendo persona física, esté acogida al precio voluntario para el pequeño consumidor (PVPC)» (RD 897/2017 art. 3.1)
- **Vía pensionistas** (jubilación/incapacidad con cuantía mínima, sin otros ingresos >500 €/año) — «sean pensionistas del Sistema de la Seguridad Social por jubilación o incapacidad permanente, percibiendo la cuantía mínima vigente» (RD art. 3.2.c)
- **Vía IMV** — «beneficiario del Ingreso Mínimo Vital conforme a lo establecido en la Ley 19/2021» (RD art. 3.2.d)
- **Multiplicador de hogar** (+0,3×IPREM por adulto adicional, +0,5×IPREM por menor, +1×IPREM circunstancias especiales) — «el multiplicador de renta respecto al índice IPREM de 14 pagas se incrementará en 0,3 por cada miembro adicional mayor de edad que conforme la unidad de convivencia y 0,5 por cada menor de edad» (RD art. 3.2.a y 3.3)
- **Grado de vulnerabilidad y zona climática** fijan la cuantía — «La cuantía anual a asignar a cada uno de los beneficiarios del bono social térmico vendrá determinada según la categoría de consumidor vulnerable, así como, la zona climática en la que se ubique la vivienda en la que se encuentre empadronado» (Orden art. 4; metodología en anexo I del RDL 15/2018)
- **Datos bancarios**: si los remitidos por la comercializadora están incompletos/incorrectos ⇒ requerimiento de 10 días hábiles; sin respuesta, desistimiento — «otorgando un plazo máximo de 10 días hábiles, con advertencia de que si no lo hiciesen se les tendrá por desistidos» (Orden art. 6.5)
- **Renuncia**: 10 días hábiles tras la publicación de la resolución de concesión en el BOCM; no afecta a años posteriores ni al BSE — «El beneficiario podrá renunciar al pago de la ayuda en el plazo de 10 días hábiles contados a partir del siguiente a la publicación de la resolución de concesión» (Orden art. 8; sede confirma)
- **Condicionado a fondos**: la concesión depende de la transferencia del Estado — «El otorgamiento de ayudas en concepto de Bono Social Térmico estará condicionado a la existencia de disponibilidad presupuestaria» (RDL art. 7.2)

- **Plazo**: rolling con recurrencia anual — procedimiento de oficio iniciado por orden cada año (última: Orden 4379/2025, «Acordar el inicio del procedimiento para reconocer el derecho al pago de las ayudas del bono social térmico de los beneficiarios del bono social eléctrico a 31 de diciembre de 2024 con punto de suministro en la Comunidad de Madrid», Segundo). La sede indica «En plazo: permanente» para los trámites de renuncia/datos bancarios.
- **Canal**: Comunidad de Madrid — Consejería de Familia, Juventud y Asuntos Sociales (Dirección General de Servicios Sociales e Integración), concesión directa de oficio — https://sede.comunidad.madrid/ayudas-becas-subvenciones/bono-social-termico-2025 — «La gestión y el pago de las ayudas corresponderá a las Comunidades Autónomas y a las Ciudades con Estatuto de Autonomía» (RDL art. 10.2). Trámites accesorios online y presenciales.
- **Importe**: `variable`, pago único anual («El importe de la ayuda se abonará en un pago único», Orden art. 9.1). No hay partida media citada en la norma accesible: los importes unitarios de 2025 van en el anexo (imagen rasterizada) de la Resolución SE Energía de 20/11/2025 — para la zona D de Madrid ~210,71 € (vulnerable) / 337,13 € (severo) según traslados autonómicos, pero **sin extracto citables** ⇒ `variable` por regla del encargo. No se copian cifras sin cita.
- **Doc**: ninguna con la concesión («No es necesario aportar documentación junto a la solicitud», sede); solo la comunicación de datos bancarios si la CM lo requiere (modelo anexo II de la Orden) ⇒ `mandatory: false`.

OK / KO por requisito: ☐ ☐ ☐

## Fuentes (HTTP 200 verificadas, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| boe-rdl-15-2018-bono-termico | 1 | https://www.boe.es/eli/es/rdl/2018/10/05/15/con | 200 | 931aaf4ea0b0… |
| boe-rd-897-2017-bono-social | 1 | https://www.boe.es/eli/es/rd/2017/10/06/897/con | 200 | 9b5f71eadad6… (preexistente) |
| bocm-20220629-29-bono-termico | 1 | https://bocm.es/boletin/CM_Orden_BOCM/2022/06/29/BOCM-20220629-29.PDF | 200 | e871cd96e08e… |
| bocm-20251229-22-bono-termico-2025 | 1 | https://bocm.es/boletin/CM_Orden_BOCM/2025/12/29/BOCM-20251229-22.PDF | 200 | 24384ea3fcaf… |
| sede-bono-social-termico | 3 | https://sede.comunidad.madrid/ayudas-becas-subvenciones/bono-social-termico-2025 | 200 | 8a0f70fabf9f… |

## Decisiones

1. **Norma real = RDL 15/2018** (arts. 5–10), no el RD 897/2017: este último solo
   aporta la definición de consumidor vulnerable, reutilizada con los mismos
   extractos huella verificados que `bono-social-electrico.json`.
2. **Canal CM, no Seguridad Social**: gestión y pago autonómicos (art. 10 RDL +
   Ley 4/2022 + Orden 1478/2022). Divergencia con el encargo documentada arriba.
3. **`standalone: true`**: sin ficha en `data/catalog/benefits/`; rango 1 propio
   sobrado (RDL + dos Órdenes BOCM).
4. **`suministro-cm` hard**: el territorio respondido (empadronamiento) es proxy
   del punto de suministro en la vivienda habitual; fuera de CM ⇒ F.
5. **`alguna-via-vulnerable` hard:false** como en eléctrico: hay otras vías no
   comprobables (pensionista, IMV); F solo avisa.
6. **`window.rolling: true` + `recurrence: "annual"`**: concesión de oficio cada
   ejercicio; no hay solicitud ni cierre para el ciudadano. El extracto cita la
   orden de inicio en vigor (4379/2025).
7. **`amount: variable` + `period: annual`**: la cuantía depende de grado de
   vulnerabilidad y zona climática (Orden art. 4) y se regulariza cada año;
   no se cita partida media porque los importes unitarios 2025 figuran en un
   anexo rasterizado de la Resolución SE Energía 20/11/2025 no extractable.
8. **`excerptSha256` reales**: sha256 UTF-8 del extracto (equivalente a
   `ruleset-fill-hashes.ts`); cada extracto verificado presente en su `.txt`.
   Ningún «FILL».
9. **Snapshots sin npm**: bytes con curl (200), sha256 con `sha256sum`,
   HTML→texto con réplica de `htmlToText`+`normalizeText`
   (`F:\Temp\datawardsmadrid-termico\norm.mjs`); PDFs con `pdftotext -raw`
   (salida cp1252 → decodificada) + `normalizeText`. Bytes en
   `F:\AgentState\datawardsmadrid\snapshots\<sha256>.<ext>`; metadatos en
   `data/eligibility/sources/<id>.json`.
10. **Documentos**: solo la comunicación de datos bancarios condicional
    (`mandatory: false`); con la concesión no hay documentación.

## Notas para el verificador independiente

- La página de la sede (ref. A874, «Bono Social Térmico 2025») lista las Órdenes
  de concesión por fases de 2026 (p. ej. Orden 2339/2026 pagada el 18/08/2026) —
  prueba de ciclo vivo.
- Comprobar en el PDF de la Orden 1478/2022 (BOCM nº 153, págs. 282–286) arts.
  1, 4, 5, 6.5, 8, 9.1.
- La comprobación de «extracto literal» usa el `.txt` commiteado de cada fuente.
- Pendiente de revisión humana: `humanReview.status = pending`.
- Golden `gp-termico-getafe`: espera `posible` + `ROLLING` (suministro CM = T;
  vía vulnerable por familia numerosa = T; perceptor BSE 31/12, PVPC, grado y
  zona = U no excluyentes).
