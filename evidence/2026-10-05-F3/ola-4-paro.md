# Hoja de revisión — ola 4: Prestación contributiva por desempleo (SEPE, estatal)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## prestacion-desempleo-contributiva (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `prestacion-desempleo-contributiva` en
`data/catalog/benefits/`; G2 se satisface con la fuente de rango 1 propia
(LGSS, texto consolidado BOE). La entrada del universo (`seed-8d3f2e8a16`)
ya la anota como ROLLING con «LGSS arts. 264–271».

> **Nota para el verificador — divergencia con el encargo.** El encargo citaba
> «LGSS arts. 274-294 + Estatuto del Trabajador». Sobre el texto consolidado
> real (snapshot `boe-lgss-prestacion-familia`, actualización 03/10/2026):
>
> 1. **La prestación contributiva no está en los arts. 274–294**: esos son el
>    nivel asistencial (subsidios, arts. 274–280 — usados por
>    `subsidio-mayores-52`) y el desempleo agrario/casos especiales (281+).
>    El nivel contributivo está en el **Capítulo II, arts. 264–273**: 264
>    (personas protegidas), 266 (requisitos), 267 (situación legal de
>    desempleo), 268 (solicitud y nacimiento del derecho), 269 (duración),
>    270 (cuantía).
> 2. **El Estatuto de los Trabajadores solo se cita por remisión**: el art.
>    267.1 remite a los arts. 40, 41.3, 45.1.n, 47, 49.1.m, 50 y 51 ET para
>    enumerar las causas de situación legal de desempleo. El snapshot
>    `boe-et-estatuto-trabajadores` existe en el repo si el verificador quiere
>    cruzarlo, pero no añade requisito propio ⇒ no se declara como fuente.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **aviso**: Situación legal de desempleo (pérdida de empleo, suspensión o reducción de jornada 10 %–70 %; cubre también el desempleo parcial) | employmentStatus eq "desempleado" (soft) | «Encontrarse en situación legal de desempleo, acreditar disponibilidad para buscar activamente empleo y para aceptar colocación adecuada a través de la suscripción del acuerdo de actividad al que se refiere el artículo 3 de la Ley 3/2023, de 28 de febrero, de Empleo» | Art. 266.c LGSS | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **Cotización mínima 360 días — criterio decisivo**: «Tener cubierto el
  período mínimo de cotización a que se refiere el artículo 269.1, dentro de
  los seis años anteriores a la situación legal de desempleo o al momento en
  que cesó la obligación de cotizar» (art. 266.b). La escala del art. 269.1
  empieza en 360 días («Desde 360 hasta 539 → 120»). No preguntamos la vida
  laboral ⇒ U; la página SEPE lo resume como «Haber trabajado y cotizado a
  desempleo al menos 360 días dentro de los 6 años anteriores».
- **Causa involuntaria del cese** (art. 267.1): despido, causas objetivas, fin
  de contrato temporal/formativo, resolución por causas ET (arts. 40, 41.3,
  49.1.m, 50), suspensión/reducción (art. 47 ET), fijo-discontinuo, retorno de
  emigrante, excarcelación, violencia de género/sexual. La baja voluntaria
  ordinaria no da derecho. No distinguimos la causa ⇒ U.
- **Alta o situación asimilada** en régimen que cotice por desempleo
  (art. 266.a) ⇒ U.
- **Inscripción como demandante de empleo** (oficina de empleo CM) + acuerdo
  de actividad, mantenida durante toda la prestación (arts. 266.e, 268.1) ⇒ U.
- **No haber cumplido la edad ordinaria de jubilación contributiva**, salvo
  falta de cotización para jubilarse o suspensión/reducción (art. 266.d) ⇒ U
  (la edad ordinaria 2026 depende de las cotizaciones acumuladas).
- **Plazo: 15 días hábiles** desde el último día trabajado (o retorno del
  extranjero o excarcelación); fuera de plazo la prestación nace desde la
  solicitud y se pierden los días intermedios (art. 268.1-2 LGSS; sede SEPE).
- **Incompatibilidades**: sin trabajo a tiempo completo ni actividad por
  cuenta propia (salvo programa de fomento) ni pensión incompatible con el
  trabajo (lista «Requisitos» de la sede).
- **Colectivos con reglas propias**: emigrante retornado (360 días en los 6
  años previos a emigrar, sin desempleo de otro Estado del EEE/Suiza);
  eventual agrario ex-autónomo (720 días).

- **Ventana**: `rolling: true` + `businessDays: true` — permanente; el plazo
  de 15 días hábiles regula el nacimiento del derecho (art. 268.1), no una
  convocatoria. Fuera de plazo: «perdiendo tantos días de prestación como
  medien entre la fecha en que hubiera tenido lugar el nacimiento del
  derecho… y aquella en que efectivamente se hubiese formulado la solicitud»
  (art. 268.2).
- **Canal**: SEPE — sede electrónica (certificado/Cl@ve), oficina de
  prestaciones con cita previa, oficina de registro público o correo
  administrativo («La solicitud se presentará a través de: La sede
  electrónica del SEPE . En la oficina de prestaciones…»).
- **Importe**: `variable`, `monthly` — 70 % de la base reguladora los
  primeros 180 días y 60 % desde el día 181 (art. 270.2), con mínimo
  80 %/107 % y máximo 175 %/200 %/225 % del IPREM según hijos a cargo
  (art. 270.3). No hay cuantía fija que citar.
- **Doc**: solicitud modelo oficial (incluye acuerdo de actividad),
  identificación (DNI/pasaporte/NIE-TIE), documento bancario con número de
  cuenta, certificado(s) de empresa de los últimos 6 meses si la empresa no
  los envió al SEPE, y Libro de Familia solo si figuran hijos a cargo
  (condición `dependents ≥ 1`).

OK / KO por requisito: ☐

## Fuentes (HTTP 200 verificadas, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| boe-lgss-prestacion-familia | 1 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con | 200 | fa5a4efeab3a… (preexistente, reutilizada de subsidio-mayores-52) |
| sepe-contributiva-mas-de-un-anyo | 3 | https://www.sepe.es/HomeSepe/prestaciones-desempleo/prestacion-contributiva/prestacion-contributiva-mas-de-un-anyo.html | 200 | 95b67d161db9… |

Bytes del snapshot nuevo en `F:\AgentState\datawardsmadrid\snapshots\95b67d16….html`;
metadatos en `data/eligibility/sources/sepe-contributiva-mas-de-un-anyo.json`
+ `.txt` normalizado (textSha256 `229ce2b37a9c…`). También verificada HTTP 200
la landing `…/prestacion-contributiva.html` (no snapshot: todo su contenido
útil está en la página de detalle). ET consolidado
(`boe-et-estatuto-trabajadores`) también responde 200; no se usa como fuente.

## Decisiones

1. **Norma real = LGSS arts. 264–273**, no 274–294 (divergencia documentada
   arriba). Referencias ET transitivas sin cita directa.
2. **`standalone: true`**: sin ficha en `data/catalog/benefits/`; rango 1
   propio (LGSS consolidado).
3. **`situacion-legal-desempleo` hard:false**: el único comprobable. El paro
   cubre también suspensión y reducción de jornada 10 %–70 % (art. 267.1.b-c),
   así que una persona «asalariada» en ERTE también tiene derecho ⇒ F solo
   avisa, no excluye (mismo patrón que `subsidio-mayores-52`).
4. **360 días → uncovered**: no hay pregunta de vida laboral; se cita art.
   266.b + la escala del 269.1, más el resumen literal de la sede.
5. **`window.rolling: true` + `businessDays: true`**: prestación permanente;
   los 15 días hábiles condicionan el nacimiento del derecho (art. 268).
6. **`amount: variable / monthly`**: la cuantía depende de la base reguladora
   (70 %/60 %, art. 270.2); los topes IPREM (art. 270.3) se citan en la hoja
   pero no hay cifra fija declarable.
7. **`excerptSha256` reales**: sha256 UTF-8 del extracto (equivalente a
   `ruleset-fill-hashes.ts`); cada extracto verificado presente en el `.txt`
   de su fuente. Ningún «FILL».
8. **Snapshot sin npm**: bytes con curl (HTTP 200), sha256 con `sha256sum`,
   HTML→texto con réplica de `htmlToText`+`normalizeText`
   (`F:\Temp\datawardsmadrid-paro\norm.mjs`).
9. **Documentos**: Libro de Familia condicionado a `dependents ≥ 1` (solo si
   figuran hijos a cargo en la solicitud); el certificado de empresa queda
   `mandatory: true` con la salvedad en el label («si la empresa no lo ha
   enviado ya al SEPE»).

## Notas para el verificador independiente

- Comprobar en `boe-lgss-prestacion-familia.txt` los arts. 266, 267.1, 268.1-2,
  269.1 y 270.2; y en `sepe-contributiva-mas-de-un-anyo.txt` los apartados
  «Requisitos», «Documentación» y «Cuándo, dónde y cómo lo tramito».
- La comprobación de «extracto literal» usa el `.txt` commiteado de cada
  fuente; los `.txt` del SEPE incluyen espacios antes de signos de cierre
  (« , » / « . ») que se han preservado en los extractos.
- Pendiente de revisión humana: `humanReview.status = pending`.
- Golden `gp-paro-alcala`: espera `posible` + `ROLLING`
  (employmentStatus=desempleado ⇒ soft T; los decisivos —360 días, causa
  involuntaria, alta, inscripción— son U no excluyentes).
- Al ser la condición soft, cualquier perfil da `posible` como mínimo: es
  deliberado (UNKNOWN ≠ NO; no podemos excluir a un asalariado en ERTE).
