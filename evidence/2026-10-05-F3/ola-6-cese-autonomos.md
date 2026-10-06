# Hoja de revisión — ola 6: Prestación por cese de actividad de trabajadores autónomos («paro de autónomos», estatal)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved` y
`verification.status = ok` con informe (ADR-044/G12).

## cese-actividad-autonomos (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `cese-actividad-autonomos` en
`data/catalog/benefits/`; G2 se satisface con la fuente de rango 1 propia
(LGSS, texto consolidado BOE, actualización 03/10/2026).

> **Nota para el verificador — el encargo se ha contrastado con la norma.**
> El encargo citaba «LGSS arts. 327-345 aprox». Sobre el texto consolidado
> real (snapshot `boe-lgss-prestacion-familia`):
>
> 1. **La protección por cese de actividad es el Título V, arts. 327–350**
>    (327 objeto y ámbito, 328 régimen jurídico, 329 acción protectora,
>    330 requisitos, 331–336 situación legal de cese, 337 solicitud y
>    nacimiento del derecho, 338 duración, 339 cuantía, 340 suspensión,
>    341 extinción, 342 incompatibilidades, 343 compatibilidad con
>    IT/maternidad/paternidad, 344 financiación, 345 recaudación, 346 órgano
>    gestor, 347 obligaciones, 348 reintegro, 349 infracciones, 350
>    jurisdicción). El encargo iba bien encaminado.
> 2. **70 % de la base reguladora: correcto pero matizado** (art. 339.2):
>    el 50 % se aplica en los supuestos del art. 331.1.a).4.º-5.º (reducción
>    de jornada / deuda 150 % sin cierre) y en la suspensión temporal parcial
>    por fuerza mayor. La base reguladora es el promedio de bases de los 12
>    meses continuados e inmediatamente anteriores (art. 339.1). Topes:
>    máximo 175 % del IPREM mensual + 1/6 (200 % con 1 hijo a cargo, 225 %
>    con 2+), mínimo 107 % (con hijos) u 80 % (sin hijos) del IPREM
>    (art. 339.3-4); los topes no se aplican en los supuestos del 50 %.
> 3. **«≥12 meses cotizados»: correcto, con matiz** (art. 330.1.b + 338.1):
>    los 12 meses de cotización por cese deben estar dentro de los 24 meses
>    inmediatamente anteriores, y las cotizaciones computables se buscan en
>    los 48 meses anteriores al cese.
> 4. **«Convenio con mutua»: lo gestiona la mutua** (arts. 337.1 y 346.1):
>    se solicita a la mutua colaboradora que cubre las contingencias
>    profesionales del autónomo (o a la entidad gestora / ISM en el mar).
> 5. **Plazo: último día del mes siguiente al cese** (art. 337.4), no «15
>    días hábiles» como en el paro de asalariados; fuera de plazo no se
>    pierde el derecho: se descuentan los días de retraso (art. 337.5).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **aviso**: Ser autónomo/a afiliado/a y en alta en el RETA (o Régimen del Mar); incluye SETA, TRADE, socios de cooperativas y autónomos societarios | employmentStatus eq "autonomo" (soft) | «Estar afiliadas y en alta en el Régimen Especial de Trabajadores por Cuenta Propia o Autónomos o en el Régimen Especial de los Trabajadores del Mar, en su caso» | Art. 330.1.a LGSS | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **Cotización mínima 12 meses — criterio decisivo** (arts. 330.1.b, 338.1):
  «períodos de cotización efectuados dentro de los cuarenta y ocho meses
  anteriores a la situación legal de cese de actividad de los que, al menos,
  doce meses deben estar comprendidos en los veinticuatro meses
  inmediatamente anteriores a dicha situación de cese». No preguntamos la
  vida laboral ⇒ U.
- **Situación legal de cese / tipo de cese** (art. 331.1): motivos
  económicos-técnicos-productivos-organizativos (pérdidas > 10 % de ingresos
  en un año completo, ejecuciones ≥ 30 % de ingresos, concurso, reducción
  del 60 % de jornada o suspensión del 60 % de contratos con caída de
  ingresos del 75 %, o deuda exigible > 150 % de ingresos sin asalariados),
  fuerza mayor, pérdida forzosa de licencia administrativa, violencia de
  género o sexual, divorcio/separación con ayuda familiar; TRADE,
  cooperativas y societarios con reglas propias (arts. 333–336). No
  distinguimos la causa ⇒ U (UNKNOWN ≠ NO).
- **Cese involuntario** (art. 331.2.a): «A aquellos que cesen o interrumpan
  voluntariamente su actividad» no se les reconoce, salvo TRADE (art.
  333.1.b) ⇒ U.
- **Acuerdo de actividad + activa disponibilidad** (art. 330.1.c):
  suscripción del acuerdo de la Ley 3/2023 y disponibilidad ante el servicio
  público de empleo de la CM ⇒ U.
- **Al corriente de cuotas** (art. 330.1.e): si no lo estás en la fecha del
  cese, el órgano gestor invita al pago con plazo improrrogable de 30 días
  naturales con plenos efectos ⇒ U.
- **Edad ordinaria de jubilación** solo si el cese es definitivo (art.
  330.1.d), con la salvedad de no tener cotización suficiente para
  jubilarse ⇒ U (la edad ordinaria depende de las cotizaciones acumuladas).
- **Mutua/entidad gestora** (art. 337.1): hay que estar adherido a una mutua
  colaboradora o tener la cobertura con la entidad gestora (ISM en el mar)
  ⇒ U.
- **Plazo: último día del mes siguiente al cese** (art. 337.4-5); fuera de
  plazo se descuentan días de percepción ⇒ U.
- **Escala de duración** (art. 338.1): 12–17 meses cotizados ⇒ 4 meses;
  18–23 ⇒ 6; 24–29 ⇒ 8; 30–35 ⇒ 10; 36–42 ⇒ 12; 43–47 ⇒ 16; ≥ 48 ⇒ 24 ⇒ U.
- **Trabajadores a cargo** (art. 330.2): garantías/obligaciones laborales
  previas al cese ⇒ U.
- **Incompatibilidades** (art. 342.1): incompatible con trabajo por cuenta
  propia o ajena salvo supuestos 331.1.a).4.º-5.º, suspensión parcial por
  fuerza mayor y pluriactividad con tope SMI; y con pensiones/prestaciones
  incompatibles ⇒ U.

- **Ventana**: `rolling: true` + `businessDays: false` — prestación
  permanente; el plazo del «mes siguiente» regula el reconocimiento
  (art. 337.4), no una convocatoria. La cita de la ventana usa la página de
  la Seguridad Social (rango 3 = estado operativo del plazo, G11); la norma
  (art. 337.4, rango 1) está citada en el requisito `plazo-solicitud`.
- **Canal**: la mutua colaboradora que cubre las contingencias profesionales
  (o ISM), con tramitación online por la sede electrónica de la Seguridad
  Social (Import@ss) o presencial en la mutua («La solicitud de prestación
  por cese de actividad será presentada ante la Mutua con la que el
  trabajador tenga cubiertas las contingencias profesionales…»).
- **Importe**: `variable`, `monthly` — 70 % de la base reguladora (50 % en
  los supuestos 331.1.a).4.º-5.º y suspensión parcial por fuerza mayor),
  art. 339.1-2; topes IPREM del art. 339.3 citados en esta hoja pero sin
  cifra fija declarable.
- **Doc**: solicitud modelo oficial «Cese de Actividad» (tabla de
  documentos de la página SS), declaración jurada del motivo y fecha del
  cese (art. 332.1) y documentación acreditativa de la causa (art.
  332.1.1.a: documentos contables/fiscales/judiciales + cierre del
  establecimiento, baja censal y baja en el RETA en el supuesto de
  inviabilidad).

OK / KO por requisito: ☐

## Fuentes (HTTP 200 verificadas, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| boe-lgss-prestacion-familia | 1 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con | 200 | fa5a4efeab3a… (preexistente, contiene el Título V completo) |
| segss-cese-actividad | 3 | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/10538/2277 | 200 | c26d5d65322d… |

Bytes del snapshot nuevo en `F:\AgentState\datawardsmadrid\snapshots\c26d5d65322d96828c2c2715b6014c30786b2db757201170cb81e71c405197b5.html`;
metadatos en `data/eligibility/sources/segss-cese-actividad.json` + `.txt`
normalizado (textSha256 `899644f3f1ae2c…`). La URL canónica de
prestaciones de autónomos (`…/PrestacionesPensionesTrabajadores/10963/28393/28396`)
responde 200 pero el contenido llega por AJAX (snapshot vacío de cese) ⇒ se
usa la página «Protección por cese de actividad» que sí sirve el texto
completo en el HTML.

## Decisiones

1. **Norma real = LGSS Título V, arts. 327–350** (la pista «327-345»
   quedaba corta: el título incluye órgano gestor, obligaciones, reintegro
   e infracciones hasta el 350; los artículos citados viven en 327–342).
2. **`standalone: true`**: sin ficha en `data/catalog/benefits/`; rango 1
   propio (LGSS consolidado). Es estatal y la solicita cualquier autónomo
   residente en Madrid ⇒ dentro del ámbito ADR-021.
3. **`autonomo-alta-reta` hard:false**: el único comprobable. Quien ya cesó
   puede declararse «desempleado» y los colectivos especiales (TRADE,
   cooperativas, societarios, mar) no se distinguen en la pregunta ⇒ F solo
   avisa, no excluye (mismo patrón que `prestacion-desempleo-contributiva`
   y `subsidio-mayores-52`).
4. **Tipo de cese, mutua, al corriente de cuotas → uncovered**: son datos
   que no se pueden preguntar con el catálogo actual ⇒ U, nunca F.
5. **`window.rolling: true` + `businessDays: false`**: prestación
   permanente; el plazo legal es en días naturales («último día del mes
   siguiente», art. 337.4), no hábiles como en la contributiva de
   asalariados.
6. **`amount: variable / monthly`**: 70 % de la base reguladora (50 % en
   supuestos especiales), topes IPREM 175/200/225 % y mínimos 107/80 %
   (art. 339) descritos en la hoja; sin cuantía fija.
7. **`excerptSha256` reales**: sha256 UTF-8 del extracto (equivalente a
   `ruleset-fill-hashes.ts`); cada extracto verificado presente en el `.txt`
   de su fuente. Ningún «FILL».
8. **Snapshot sin npm**: bytes con curl (HTTP 200), sha256 con `sha256sum`,
   HTML→texto con réplica exacta de `htmlToText`+`decodeEntities`+
   `normalizeText` (`F:\Temp\datawardsmadrid-cese\norm.mjs`); bytes crudos
   archivados en el store de snapshots por huella.
9. **Requisitos e importe solo citan rango 1** (LGSS); la página SS
   (rango 3) solo alimenta ventana, canal y modelo de solicitud, como exige
   G11 (el encargo «requirements/amount solo rango ≤ 2» queda cumplido con
   margen).
10. **`verification` omitido** (no `ok`): pendiente del verificador
    independiente; G12 la excluye del bundle público hasta entonces, igual
    que las 5 reglas de la ola 5.

## Notas para el verificador independiente

- Comprobar en `boe-lgss-prestacion-familia.txt` los arts. 330, 331.1-2,
  332.1, 337.1/4-5, 338.1, 339.1-4 y 342.1; y en `segss-cese-actividad.txt`
  los apartados «¿Dónde debe presentar la solicitud y en qué plazo?» y la
  tabla «Documentos».
- La comprobación de «extracto literal» usa el `.txt` commiteado de cada
  fuente.
- Pendiente de revisión humana: `humanReview.status = pending`.
- Golden `gp-cese-autonomo-leganes`: espera `posible` + `ROLLING`
  (employmentStatus=autonomo ⇒ soft T; los decisivos —12 meses cotizados,
  causa del cese, cuotas, mutua— son U no excluyentes).
- Al ser la condición soft, cualquier perfil da `posible` como mínimo: es
  deliberado (UNKNOWN ≠ NO; un autónomo ya cesado puede autodeclararse
  «desempleado» y una mutua distinta no cambia el derecho).
