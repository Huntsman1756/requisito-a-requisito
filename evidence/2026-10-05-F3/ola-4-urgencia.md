# Hoja de revisión — ola 4: Ayudas económicas de urgencia/emergencia social (Comunidad de Madrid)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-ayudas-urgencia-social (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `madrid-ayudas-urgencia-social` en
`data/catalog/benefits/`; G2 se satisface con dos fuentes de rango 1 propias
(Orden 2372/2023 BOCM — Cartera de Servicios Sociales — y Ley 12/2022 BOE).

> **Nota para el verificador — divergencias con el encargo.**
>
> 1. **El Decreto 74/2017 citado en el encargo no es esta ayuda**: el Decreto
>    74/2017, de 29 de agosto, del Consejo de Gobierno crea y regula el
>    **Registro de Datos de Planes de Autoprotección** de la CM (BOCM n.º 210,
>    04/09/2017; corrección de errores BOCM n.º 212, 07/09/2017) — materia de
>    protección civil, sin relación con servicios sociales. Descartado.
> 2. **El programa existe como prestación de la Cartera, no como «Orden de
>    gestión» propia**: la CM modela las «Ayudas Económicas de urgencia/
>    emergencia para la cobertura de necesidades básicas» como **ficha 060502**
>    de la Cartera de Servicios Sociales (Orden 2372/2023, de 25 de julio,
>    BOCM n.º 181, 01/08/2023), dentro del objetivo 06 «Protección. Atención
>    de situaciones de urgencia y emergencia social». Es el equivalente
>    autonómico a las prestaciones económicas individuales de urgencia/
>    emergencia que la Ley 12/2022 (art. 11.1.e) atribuye a las entidades
>    locales: la Cartera la asigna a la **Comunidad de Madrid como proveedor
>    «excepto Madrid capital»**, que dispone de dispositivo propio (SAMUR
>    Social + Ordenanza municipal de prestaciones económicas).
> 3. **No es un «complemento del RMI»**: es una prestación de atención social
>    especializada, compatible con la RMI pero independiente (pago único,
>    concesión inmediata tras valoración del trabajador social). Se ha modelado
>    como lo que es, no como un complemento.
> 4. **No hay trámite en la sede**: no existe ficha de solicitud en
>    `sede.comunidad.madrid` (probados `/prestacion-social/ayudas-emergencia-
>    social` y `/servicios-sociales/emergencia-social` ⇒ 404). El acceso es por
>    el **Servicio de Emergencia Social** (24 h/365 días, integrado en el 112)
>    o por los servicios sociales municipales; por eso el canal es la página
>    oficial del servicio en `comunidad.madrid` (rango 4, solo para canal) y
>    `channel.online = false`.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: ámbito territorial CM | territory within_territory {"ccaa":"13"} | «Ámbito territorial de atención Comunidad de Madrid» | Anexo II, ficha 060502 | https://www.bocm.es/boletin/CM_Orden_BOCM/2023/08/01/BOCM-20230801-18.PDF |
| **OBLIGATORIO**: fuera de Madrid capital (dispositivo propio) | not (territory within_territory {"municipality":"28079"}) | «Proveedor del servicio Comunidad de Madrid (excepto Madrid capital)» | Anexo II, ficha 060502 | ídem |
| aviso: carecer de recursos económicos | incomeAnnual lte IPREM_ANUAL_14P (8.400 €, orientativo) | «Carecer de recursos económicos para cubrir necesidades básicas en el momento de la intervención» | Anexo II, ficha 060502 | ídem |

**No comprobables con nuestras preguntas (⚠):**

- **La propia situación de urgencia/emergencia** — «Se considera urgencia
  social la situación de carácter excepcional o extraordinario, o de
  agravamiento de las circunstancias personales o familiares, con incidencia
  en las condiciones de vulnerabilidad, que requiera una respuesta inmediata
  por parte del Sistema Público de Servicios Sociales» (Ley 12/2022 art. 10.3).
  No hay pregunta para «situación sobrevenida» ⇒ queda en ⚠, nunca excluye.
- **Valoración profesional previa** — «Una vez valorada la situación como
  emergencia social, se gestionan las ayudas económicas necesarias para
  cumplir con el plan de intervención elaborado» (ficha 060502).
- **Perfil beneficiario** — «Persona en intervención en el Servicio de
  Emergencia Social. Personas en situación de vulnerabilidad severa y urgencia
  o emergencia social» (ficha 060502).
- **Prestación condicionada** — «Garantizada/condicionada Condicionada»: la
  concesión no es un derecho automático ni está garantizada.
- **Madrid capital**: la concesión de prestaciones económicas individuales de
  urgencia/emergencia es competencia municipal (Ley 12/2022 art. 11.1.e); en
  la ciudad de Madrid el canal es el municipal (centros de servicios sociales
  del distrito / SAMUR Social, Ordenanza de prestaciones económicas del
  Ayuntamiento de Madrid de 28/09/2004).
- **Compatibilidad** — «Régimen de compatibilidad con otras prestaciones
  Compatible» (ficha 060502): puede complementar RMI/IMV/ayudas municipales.
- **Documentación**: sin lista pública de documentos exigibles ni impreso;
  la determina el profesional que valora (ficha 060502 — Procedimiento) ⇒
  `documents: []` (lista vacía deliberada, no olvido).

- **Plazo**: rolling — servicio permanente («El Servicio de Emergencia Social
  funciona las 24 horas del día, todos los días del año», página oficial) y
  «Plazo de concesión Inmediato» (ficha 060502). No hay solicitud ni cierre.
- **Canal**: Comunidad de Madrid — Consejería de Familia, Juventud y Asuntos
  Sociales (Dirección General de Servicios Sociales e Integración; Servicio
  de Emergencia Social, 24 h, integrado en el 112). `online: false`,
  `inPerson: true`. En Madrid capital: SAMUR Social (Ayuntamiento de Madrid).
- **Importe**: `variable`, `one_off` — «Conjunto de prestaciones económicas
  y/o en especie, de pago único… Ayuda puntual de pago único» (ficha 060502).
  Sin cuantía publicada (depende de la necesidad valorada; modalidades:
  «Farmacia/ Transporte/ Alimentos/ Otros») ⇒ no se cifra.
- **Doc**: ninguna publicada ⇒ `documents: []`.

OK / KO por requisito: ☐ ☐ ☐

## Fuentes (HTTP 200 verificadas, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| bocm-20230801-18-cartera-ss | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2023/08/01/BOCM-20230801-18.PDF | 200 | 5297fa58df10… (preexistente) |
| boe-ley-12-2022-ss | 1 | https://www.boe.es/eli/es-md/l/2022/12/21/12/con | 200 | 6163fc7f9fa8… |
| comunidad-emergencia-social | 4 | https://www.comunidad.madrid/asuntos-sociales/servicio-emergencia-social | 200 | 1ce701acdec9… |

Snapshots de bytes en `F:\AgentState\datawardsmadrid\snapshots\<sha256>.html`;
metadatos en `data/eligibility/sources/<id>.json`; texto normalizado en
`<id>.txt` (misma réplica `htmlToText`+`normalizeText` del pipeline;
`F:\Temp\datawardsmadrid-urgencia\norm.mjs`).

## Decisiones

1. **Norma real = Orden 2372/2023 (Cartera de SS, ficha 060502) + Ley
   12/2022**, no Decreto 74/2017 (autoprotección, descartado) ni «Orden de
   gestión» inexistente como tal. Divergencia documentada arriba.
2. **`standalone: true`**: sin ficha en `data/catalog/benefits/`; dos fuentes
   de rango 1 propias (G2).
3. **`ambito-territorial-cm` hard**: el ámbito territorial de atención es la
   CM (ficha 060502); fuera de la CM ⇒ F.
4. **`fuera-madrid-capital` hard**: el proveedor es «Comunidad de Madrid
   (excepto Madrid capital)»; una residente en la ciudad de Madrid no puede
   obtener ESTA prestación (tiene la equivalente municipal vía SAMUR Social /
   ordenanza del Ayuntamiento, art. 11.1.e Ley 12/2022). `no_cumple` fiel al
   programa modelado; el label dirige al canal municipal. Si solo se conoce
   la CCAA ⇒ U (pide municipio en «qué te falta»).
5. **`sin-recursos-basicos` hard:false**: la Cartera no publica umbral;
   IPREM_ANUAL_14P como referencia orientativa (declarada en el label); la
   banda 8.400–16.800 cruza el umbral ⇒ U, nunca F.
6. **Veredicto máximo `posible`** (estructural): los requisitos decisivos
   (situación de urgencia/emergencia, valoración profesional, condicionada)
   no son comprobables ⇒ el veredicto nunca llega a `probable`, lo que es
   fiel a una prestación de valoración profesional.
7. **`documents: []` deliberado**: la ficha no publica documentación exigible
   (gestión tras valoración); añadir documentos «de cajón» violaría
   «sin fuente no hay afirmación».
8. **`channel.online: false`**: no hay trámite electrónico de solicitud;
   acceso por el SES (112/teléfono/presencial) o servicios sociales
   municipales.
9. **`amount: variable` + `one_off`**: pago único o en especie sin cuantía
   publicada (ficha 060502); no se cita cifra sin extracto.
10. **`excerptSha256` reales**: sha256 UTF-8 del extracto, verificado presente
    en el `.txt` normalizado de cada fuente (equivalente a
    `ruleset-fill-hashes.ts`). Ningún «FILL».
11. **Sin npm**: bytes con curl (200), sha256 con sha256sum/node, extracción
    con réplica local; validación estructural con node (sin node_modules en
    el worktree). La validación G1–G11 completa queda para el integrador.

## Notas para el verificador independiente

- Comprobar en el PDF de la Orden 2372/2023 (BOCM n.º 181, págs. 273–274) la
  ficha 060502 completa: denominación, procedimiento, perfil, requisito de
  acceso, «condicionada», compatibilidad, plazo inmediato, pago único,
  proveedor «excepto Madrid capital» y normativa reguladora (Ley 12/2022).
- Comprobar en el BOE consolidado de la Ley 12/2022 los arts. 10.3
  (competencia CM en urgencia/emergencia + definiciones), 11.1.e (competencia
  municipal en prestaciones económicas individuales de urgencia/emergencia) y
  24.4 (carácter instrumental de las prestaciones económicas).
- Pendiente de revisión humana: `humanReview.status = pending`.
- Golden `gp-urgencia-mostoles`: espera `posible` + `ROLLING` (territorio CM
  T; fuera de Madrid capital T; recursos T por banda baja; situación de
  urgencia y valoración profesional = no comprobables ⚠).
- Efecto colateral conocido: una persona empadronada en Madrid capital obtiene
  `no_cumple` para ESTA prestación autonómica (correcto: el dispositivo es el
  municipal SAMUR Social). Si el criterio editorial cambia a «avisar pero no
  excluir», basta pasar `fuera-madrid-capital` a `hard:false`.
