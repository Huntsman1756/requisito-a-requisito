# Hoja de revisión — ola 7 · ayto-ibi-familia-numerosa

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## Elección de fuente y encuadre

**Bonificación del IBI por familia numerosa del Ayuntamiento de Madrid**
(art. 12 de la Ordenanza Fiscal reguladora del Impuesto sobre Bienes
Inmuebles, de 15 de diciembre de 1989). **ENTRA** en el nivel 1 (ADR-045):
el IBI es un tributo periódico vigente y la bonificación se aplica cada
ejercicio — hoy admite solicitudes nuevas (de hecho se aplica **de oficio**
cuando el título es de la CM, art. 12.3).

Marco citado (todo rango 1 salvo la sede de la Agencia Tributaria Madrid):

- **Ordenanza 5/2023, de 22/12/2023** (BOCM n.º 308, 28/12/2023,
  `BOCM-20231228-42`, págs. 135-141) — reescribió íntegro el art. 12
  («Familias numerosas»): sujeto pasivo titular de FN en el devengo,
  empadronamiento en el municipio, aplicación de oficio, solicitud si no
  consta, cuadro de porcentajes por valor catastral y categoría.
- **Ordenanza 4/2024, de 23/12/2024** (BOCM n.º 308, 27/12/2024,
  `BOCM-20241227-61`, págs. 478-481) — nueva redacción del último párrafo
  del art. 12.1 (definición de vivienda habitual) tras la Sentencia TSJM
  329/2024 (anulado el inciso «y de su familia»); vigente desde 01/01/2025.
- **Ordenanza 9/2025, de 22/12/2025** (BOCM n.º 307, 26/12/2025,
  `BOCM-20251226-63`) — última modificación publicada de la ordenanza del
  IBI; en vigor desde **01/01/2026** y modifica los arts. 4, 8, 9, 13 y
  15 bis, **sin tocar el art. 12** ⇒ la bonificación FN sigue con la
  redacción de 2023/2024. Es la comprobación de vigencia (ADR-045/ADR-035).
- **`agenciatributaria.madrid.es`** (Portal del Contribuyente, rango 3 —
  órgano gestor tributario; añadido al `registry.json` con `maxRank: 3`):
  página informativa de la bonificación (requisitos operativos: de oficio
  si el título es de la CM, carné vigente, SEP/PAC) y página del trámite
  (canal online con firma electrónica y presencial en registros).

**No existe ficha** `ayto-ibi-familia-numerosa` en `data/catalog/benefits/`
(la ficha `madrid-beneficios-familias-numerosas` cubre beneficios
autonómicos, no el IBI municipal) ⇒ `standalone: true` + 3 fuentes rango 1
(G2). `sede.madrid.es` (ELI del texto consolidado, `es-md-01860896`)
devuelve HTTP 403 a cualquier descarga automatizada (Akamai) y **no** se ha
podido snapshotar; el BOCM es la fuente rango 1 usada en su lugar.

## ayto-ibi-familia-numerosa (rulesVersion 1, verificado 2026-10-06)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Estar empadronado en el municipio de Madrid | territorio within_territory {"municipality":"28079"} | «en el municipio de Madrid, aplicándose de oficio por la Administración municipal en el recibo del impuesto» | Art. 12.3 | https://www.bocm.es/boletin/CM_Orden_BOCM/2023/12/28/BOCM-20231228-42.PDF |
| **OBLIGATORIO**: Ser titular de familia numerosa (vigente en el devengo, 1 de enero) | familyType eq «familia-numerosa» | «Los sujetos pasivos del impuesto que, en el momento del devengo, ostenten la condición de titulares de familia numerosa, conforme lo establecido en la Ley 40/2003» | Art. 12.1 | misma |
| **OBLIGATORIO**: La vivienda habitual no puede ser de alquiler — el recibo del IBI debe ser tuyo (sujeto pasivo) | housingStatus not_in [«alquiler»] | «El cambio de domicilio de la vivienda habitual del sujeto pasivo determinará la pérdida del derecho a la bonificación en cuanto a dicho inmueble» | Art. 12.1 y 12.6 | misma |

**No comprobables con nuestras preguntas (⚠):**

- **Ser sujeto pasivo del IBI de la vivienda habitual** (propietario,
  usufructuario u otro derecho real); con varios sujetos pasivos solo se
  bonifica el porcentaje de quienes estén en el título — «solo se aplicará
  sobre el porcentaje del derecho que corresponda a los sujetos in- cluidos
  en el título de familia numerosa» (art. 12.5)
- **Vivienda habitual de la familia numerosa** (uso residencial exclusivo;
  presunción por empadronamiento del sujeto pasivo) — art. 12.1 último
  párrafo, redacción vigente de la Ordenanza 4/2024
- **Valor catastral individualizado** (y su tramo, que fija el porcentaje)
  — art. 12.2 y 12.4
- **Título vigente el 1 de enero del devengo**; se aplica del ejercicio
  siguiente a adquirir la condición y cesa al perderla — art. 12.3
- **Solicitud cuando no se aplique de oficio** (título no expedido por la
  CM o bonificación ausente del recibo) — art. 12.3 ¶2 y página ATM
- **Porcentaje por categoría y valor catastral**: 90 % ≤204.000 €;
  50 %/80 % en (204.000, 408.000]; 10 %/30 % >408.000 € — art. 12.4
- **Cambio de domicilio**: pierde la bonificación en ese inmueble y la
  traslada a la nueva vivienda al ejercicio siguiente — art. 12.6

- **Plazo**: permanente — «Se mantendrá mientras se mantenga la condición
  de familia numerosa» (página ATM) ⇒ **ROLLING**.
- **Canal**: Agencia Tributaria Madrid — «Tramitar en línea» (requiere
  identificación y firma electrónica) y presencial en Oficinas municipales
  de asistencia en materia de registro y otros registros oficiales.
- **Importe**: variable anual — 10 %–90 % de la cuota íntegra según
  categoría FN y valor catastral (art. 12.4); sobre la cuota resultante de
  otras bonificaciones compatibles si las hay.
- **Doc**: solicitud (solo si no de oficio o título no-CM) — página ATM.
- **Doc**: certificado o fotocopia del carné vigente de FN (solo si hay que
  pedirla; sin reiterar en renovaciones) — art. 12.3 ¶2.
- **Doc**: impreso de representación (solo si actúa representante) — trámite.
- **Doc**: escritura de propiedad (solo si el inmueble carece de datos
  catastrales) — página ATM.

OK / KO por requisito: ☐ ☐ ☐

## Decisiones de modelado y dudas para el revisor

1. **`empadronado-madrid` sobre `territory`/`municipality`**: la pregunta
   territorial pregunta dónde vive/está empadronada la persona; la ordenanza
   exige empadronamiento del **sujeto pasivo en el municipio** (28079, Madrid
   ciudad). Leganés u otro municipio de la CM ⇒ F (el IBI de otra ciudad no
   lo gestiona el Ayuntamiento de Madrid). Usuario que solo declara la CCAA ⇒
   U honesta. Comprobado: 28079 ⇒ T, 28074 ⇒ F, solo «13» ⇒ U.
2. **`vivienda-habitual-propia` hard con `not_in ["alquiler"]`**: quien
   declara «alquiler» no puede ser sujeto pasivo del IBI de su vivienda
   habitual (otra propiedad no habitual tampoco bonifica) ⇒ F segura. Quien
   responde «general» (cedida, usufructo, otros) ⇒ T, porque el usufructo
   habitual SÍ puede ser sujeto pasivo y un F sería un falso negativo; la
   titularidad exacta queda en `sujeto-pasivo-titularidad` (⚠). Misma
   asimetría que `madrid-ayudas-alquiler-plan-estatal` (incluye «general»
   en el lado compatible).
3. **`titulo-familia-numerosa` hard solo con `familyType`**: la ordenanza
   no exige composición — exige el título, que ya codifica 2+/3+ hijos; no
   se duplica el chequeo de `dependents` (eso vive en la regla del título,
   `madrid-titulo-familia-numerosa`).
4. **`window` rolling + cita rango 3**: el carácter permanente («se
   mantendrá mientras se mantenga la condición») solo consta en la página
   del órgano gestor — el art. 12.3 («se aplicará de oficio… cesando su
   aplicación cuando se pierda») lo apoya. El estado operativo del plazo es
   uso legítimo de rango 3 (docs/08 §1).
5. **Extractos con corte «xx- » del BOCM**: en tres citas fue inevitable
   conservar el corte del PDF (`vi- vienda`, `residen- cial`,
   `em- padronado`/`in- cluidos`, `fa- milia`) porque la normalización de
   pdfjs deja el guion seguido de espacio en la misma línea; el extracto es
   literal (G4 pasa) y el localizador señala el precepto exacto. En el
   resto se eligieron tramos limpios (misma práctica que en lotes
   anteriores). `excerptSha256` generado con
   `scripts/ruleset-fill-hashes.ts` contra los `.txt` (06/10/2026, HTTP 200
   en las 5 descargas).
6. **Vigencia (ADR-045/ADR-035)**: comprobado que la última modificación
   (Ordenanza 9/2025, BOCM-20251226-63, en vigor 01/01/2026) **no toca el
   art. 12** — modifica arts. 4, 8, 9, 13 y 15 bis. El art. 12 vigente es el
   de la Ordenanza 5/2023 con el último párrafo del 12.1 reformado por la
   Ordenanza 4/2024 (TSJM 329/2024 anuló «y de su familia»). La página de la
   Agencia Tributaria confirma los porcentajes actuales. **ENTRA**: el
   tributo se devenga cada 1 de enero y la bonificación sigue activa; la
   solicitud sigue abierta si no se aplica de oficio.
7. **`amount` variable sin minEur/maxEur**: la cuota íntegra de cada
   contribuyente es distinta; se cita el cuadro oficial de porcentajes
   (art. 12.4) y `period: annual`.
8. **`solicitud-si-no-oficio` (⚠) mezcla dos fuentes**: la condición
   general («si no consta aplicada de oficio, podrá solicitarse») cita el
   art. 12.3 ¶2 (rango 1); el detalle «si tu título no lo expidió la
   Comunidad de Madrid» solo consta en la página de la Agencia (rango 3),
   que queda citada en el documento `instancia-solicitud`. G11 respeta el
   rango ≤2 en este punto normativo.
9. **Sin simulador oficial** detectado para este trámite ⇒ sin
   `application.officialSimulator`.
10. **`humanReview: pending` y sin `verification`**: pendiente del
    verificador independiente de la ola 7 (ADR-040/044); mientras tanto G12
    la mantiene fuera del bundle público.

## Persona golden

`gp-ibi-fn-madrid`: padre 46 años, familia numerosa (4 hijos a cargo),
empadronado en el municipio de Madrid (28079) desde 2008, vivienda
habitual en propiedad ⇒ `posible` + `ROLLING` (verificado ejecutando el
motor: los 3 requisitos T, blockers [], missing [], invariantes I1–I10
sin error). Contraejemplos ejecutados:

- Leganés (28074) ⇒ `no_cumple` (`empadronado-madrid=F`).
- Solo CCAA «13» sin municipio ⇒ `posible` con U (`territory_partial`).
- Barcelona (08019) ⇒ `no_cumple`.
- `familyType` general o monoparental ⇒ `no_cumple`.
- `housingStatus` alquiler ⇒ `no_cumple` (`vivienda-habitual-propia=F`).
- `housingStatus` general ⇒ `posible` (la titularidad queda en ⚠).
- `housingStatus`/`familyType` sin responder ⇒ `posible` con U.

`npx tsx scripts/eligibility-validate.ts` ⇒ 36 rulesets, **0 errores**,
36 avisos G10 (pending, como el resto del lote).
