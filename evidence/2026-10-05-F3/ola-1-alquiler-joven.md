# Hoja de revisión — ola 1 · madrid-bono-alquiler-joven

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## Elección de fuente (del encargo: CM propia vs. Plan Estatal)

Elegido el **Bono Alquiler Joven gestionado por la Comunidad de Madrid**, cuyas
bases reguladoras son el **Real Decreto 42/2022** (BOE, rango 1) y cuyo
procedimiento en la CM autoriza el **Acuerdo del Consejo de Gobierno de
26/12/2024** (extracto BOCM-20250110-20, rango 1). Razones: la sede de la CM
mantiene el trámite A688 «En plazo: permanente» y el BOCM publica resoluciones
de concesión tan recientes como septiembre de 2026 (BOCM-20260922-16). La
alternativa (Plan Estatal RD 106/2018 y prórrogas) es solo el marco anterior,
menos específico para Madrid.

**Nota**: no existe ficha `madrid-bono-alquiler-joven` en `data/catalog/benefits/`
(solo lead en `leads.json`), así que el RuleSet va con `standalone: true` +
fuentes de rango 1 (gate G2).

## madrid-bono-alquiler-joven (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Ser mayor de edad en la fecha de la solicitud | edad gte 18 | «Podrán ser beneficiarias de las ayudas del Bono Alquiler Joven las personas físicas mayores de edad» | Art. 6.1 | https://www.boe.es/eli/es/rd/2022/01/18/42/con |
| **OBLIGATORIO**: Tener 35 años o menos en la fecha de la solicitud | edad lte 35 | «Ser persona física y tener hasta treinta y cinco años, incluida la edad de treinta y cinco años, en el momento de solicitar la ayuda» | Art. 6.1.a | https://www.boe.es/eli/es/rd/2022/01/18/42/con |
| **OBLIGATORIO**: Vivir en la Comunidad de Madrid (la vivienda alquilada debe ser tu residencia habitual en la región) | territorio within_territory {"ccaa":"13"} | «la tramitación y resolución de los procedimientos de su concesión y pago en la Comunidad de Madrid» | Extracto, título del Acuerdo | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/01/10/BOCM-20250110-20.PDF |
| **OBLIGATORIO**: Rentas anuales iguales o inferiores a 3 veces el IPREM (25.200 € en 2026); en alquiler de vivienda cuentan las de toda la unidad de convivencia | ingresos anuales lte 3×IPREM_ANUAL_14P | «iguales o inferiores a 3 veces el Indicador Público de Renta de Efectos Múltiples (IPREM)» | Art. 6.1.d | https://www.boe.es/eli/es/rd/2022/01/18/42/con |
| aviso: Ser titular de un contrato de arrendamiento o cesión de uso de vivienda o habitación — o estar en condiciones de firmarlo | situación de vivienda in ["alquiler","general"] | «Ser titular o estar en condiciones de suscribir, en calidad de persona arrendataria, un contrato de arrendamiento de vivienda formalizado en los términos de la Ley 29/1994» | Art. 6.1.c | https://www.boe.es/eli/es/rd/2022/01/18/42/con |

**No comprobables con nuestras preguntas (⚠):**

- **Ser español, de un Estado de la UE/EEE o Suiza, o extranjero con estancia o residencia regular en España** — «Poseer la nacionalidad española, o la de alguno de los Estados miembros de la Unión Europea o del Espacio Económico Europeo, Suiza» (Art. 6.1.b)
- **La vivienda o habitación alquilada debe ser tu residencia habitual y permanente, acreditada con certificado o volante de empadronamiento (si aún no has firmado, el contrato y el volante se aportan tras la concesión)** — «La vivienda o habitación arrendada o cedida deberá constituir la residencia habitual y permanente de la persona arrendataria o cesionaria» (Art. 7, primer párrafo)
- **Ni tú ni quienes conviven contigo podéis ser propietarios o usufructuarios de una vivienda en España (excepciones: parte alícuota por herencia, no disponibilidad por separación o divorcio, inaccesibilidad por discapacidad u otra causa ajena a la voluntad)** — «Ser persona propietaria o usufructuaria de alguna vivienda en España» (Art. 6.2.a)
- **No puedes tener parentesco en primer o segundo grado de consanguinidad o afinidad con el arrendador, ni ser socio o partícipe de la persona arrendadora** — «tenga parentesco en primer o segundo grado de consanguinidad o de afinidad con la persona arrendadora o cedente» (Art. 6.2.b-c)
- **Acreditar una fuente regular de ingresos: trabajo por cuenta propia o ajena, personal investigador en formación o prestación social pública periódica — con al menos 3 meses de vida laboral en los 6 anteriores o una duración prevista de 6 meses** — «se entenderá que tienen una fuente regular de ingresos quienes estén trabajando por cuenta propia o ajena, el personal investigador en formación y las personas perceptoras de una prestación social pública de carácter periódico» (Art. 6.1.d, segundo párrafo)
- **El alquiler no puede superar 600 €/mes (300 € si es habitación); la CM lo eleva hasta 900 €/450 € en los municipios del Anexo II del Acuerdo (Madrid, Móstoles, Getafe, Alcorcón…) — no comprobamos la renta mensual que pagas** — «deberá ser igual o inferior a 600 euros mensuales» (Art. 8, párrafos 1-2)
- **En alquiler de vivienda, el límite de 3×IPREM se mide sobre las rentas de TODAS las personas con domicilio habitual en la vivienda (consten o no en el contrato); en alquiler de habitación solo cuentan las tuyas** — «incluidos los de las personas que tengan su domicilio habitual y permanente en la vivienda arrendada o cedida o a arrendar o ceder, consten o no como titulares del contrato de arrendamiento o cesión» (Art. 6.1.d)
- **No estar incurso en las circunstancias del art. 13 de la Ley 38/2003 General de Subvenciones** — «No podrán obtener la condición de persona beneficiaria de estas ayudas quienes incurran en alguna de las circunstancias previstas el artículo 13 de la Ley 38/2003» (Art. 6.7)
- **No es compatible con otras ayudas públicas al pago del alquiler o cesión (salvo excepciones: IMV, prestaciones no contributivas, ayudas a personas especialmente vulnerables)** — «no se podrá compatibilizar con ninguna otra ayuda que para el pago del alquiler o cesión puedan conceder las comunidades autónomas» (Art. 10, primer párrafo)

- **Plazo**: permanente/continuo (abierto desde el 03/02/2025; sede: «En plazo: permanente»)
- **Canal**: Comunidad de Madrid — Consejería de Vivienda, Transportes e Infraestructuras (Dirección General de Ayudas y Acceso a la Vivienda) — https://sede.comunidad.madrid/ayudas-becas-subvenciones/bono-alquiler-joven-0 (online + presencial)
- **Importe**: per_applicant 250–250 € monthly («una ayuda de 250 euros mensuales con el límite del importe mensual de la renta arrendaticia o del precio de la cesión»; duración: 2 años, art. 12)
- **Doc**: Copia del contrato de arrendamiento o cesión de vivienda o habitación (obligatorio)
- **Doc**: Volante o certificado de empadronamiento colectivo o familiar con la fecha de alta en el domicilio (obligatorio)
- **Doc**: Justificantes de los pagos del alquiler de las mensualidades vencidas desde enero de 2024 (obligatorio)
- **Doc**: Certificado de vida laboral (o de alta en mutualidad alternativa) con las cuotas del último ejercicio (obligatorio)
- **Doc**: Notas del Registro de la Propiedad (localización y titularidad) de todos los empadronados mayores de 18 años (obligatorio)
- **Doc**: Declaración del IRPF o certificado de imputaciones de la AEAT (solo si no autorizas la consulta de tus datos fiscales) (obligatorio)
- **Doc**: Anexos I y II (autorización de consulta de datos de convivientes y autorización de presentación) (obligatorio)
- **Doc**: Permiso de residencia legal en España (solo si eres extranjero no comunitario)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

## Decisiones de modelado y dudas para el revisor

1. **Edad partida en dos requisitos** (`mayoria-edad` gte 18 `increasing` +
   `edad-max-35` lte 35 `decreasing`) para que «qué te falta» pueda dar
   elegibilidad futura a un menor de 18 y nunca a quien ya pasó los 35.
2. **`vivienda-en-madrid` sobre `territory`**: el requisito real es que la
   vivienda sea residencia habitual en la CM (acreditada por empadronamiento);
   nuestra pregunta de territorio recoge la residencia del usuario, así que
   modela el mismo hecho. El detalle «domicilio habitual y permanente» queda
   además como ⚠ `vivienda-habitual`.
3. **`alquiler-o-condiciones` no-hard**: quien responde «propiedad» probablemente
   incumple el art. 6.2.a, pero hay excepciones (herencia, no disponibilidad…)
   y la norma admite «estar en condiciones de suscribir» ⇒ aviso, no bloqueo
   (ADR-017).
4. **`ingresos-3iprem` hard aunque la norma suma convivientes**: si los ingresos
   propios ya superan 3×IPREM, los del hogar también lo superan ⇒ F segura; el
   sentido contrario queda cubierto por ⚠ `ingresos-unidad-convivencia`.
5. **El Acuerdo de 26/12/2024 en el BOCM es un extracto** (texto completo en
   BDNS 805618 y comunidad.madrid); todo lo citado del BOCM sale del propio
   extracto publicado.
6. **Corrección del encargo**: Móstoles es el municipio INE **28092**, no 28127
   (28127 = Las Rozas de Madrid). La golden usa 28092.
7. **Pendiente del lote**: snapshots `boe-rd-42-2022-bono-alquiler`,
   `bocm-20250110-20-bono-alquiler` y `sede-bono-alquiler-joven` en
   `data/eligibility/sources/` (los extractos ya llevan `excerptSha256`
   calculado con la misma normalización del motor y su presencia está
   verificada en las fuentes descargadas el 05/10/2026; pdfjs puede insertar
   «- » en cortes de línea del PDF del BOCM, los extractos elegidos evitan
   esos puntos).
