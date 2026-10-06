# Hoja de autor — ola 7: Ayudas económicas de especial necesidad / emergencia social (Ayuntamiento de Madrid)

Programa: **prestaciones económicas del sistema público de servicios sociales
del Ayuntamiento de Madrid**, en las modalidades «ayudas económicas de
emergencia social» y «ayudas económicas temporales de especial necesidad»
(arts. 7 y 8 de la Ordenanza). Canal: Centros de Servicios Sociales de los
distritos; urgencias, SAMUR Social. **Veredicto: ENTRA** (vigente y con
solicitud abierta permanente — no es convocatoria con ventana).

## Vigencia (ADR-045)

- Norma: **Ordenanza de las prestaciones económicas del sistema público de
  servicios sociales del Ayuntamiento de Madrid, de 28 de septiembre de 2004**
  (aprobada originariamente como «Ordenanza reguladora del procedimiento de
  concesión de prestaciones sociales de carácter económico para situaciones de
  especial necesidad y/o emergencia social»). **No derogada**: texto
  consolidado vigente ANM 2021\337 (última actualización publicada
  19/04/2021), desarrollada por la Instrucción aprobada por Decreto de
  27/12/2013 (modificada por Decretos de 05/10/2021 y **11/02/2025** — la
  norma se sigue desarrollando en 2025).
- El trámite «Ayudas económicas del sistema público de servicios sociales»
  figura **activo en la sede electrónica** (`sede.madrid.es`, con «Tramitar en
  línea» y presencial con cita previa en los Centros de Servicios Sociales).
  La sede devuelve 403 a fetch no navegador (Akamai), así que no se pudo
  capturar snapshot; la página sí está documentada en la búsqueda oficial.
- OJO: la ficha `060502` de la **Comunidad** de Madrid (regla
  `madrid-ayudas-urgencia-social`, ola 4) **excluye expresamente Madrid
  capital** («Comunidad de Madrid (excepto Madrid capital)»). Esta regla es
  **complementaria**: cubre justo el territorio que la autonómica no cubre —
  municipio 28079. managingBody y citas estrictamente municipales (R5-VERIF).

## Fuentes (snapshot local, HTTP 200)

| sourceId | Rango | URL | Uso |
|---|---|---|---|
| bocm-20130704-64-ordenanza-presecon | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2013/07/04/BOCM-20130704-64.PDF | Texto vigente de arts. 1, 2, 4, 6–12, 14, 15 c-f, 16–19, DA y anexo (modificación de 26/06/2013, BOCM n.º 157, pág. 188 ss.) → todos los requisitos, uncovered, ventana e importe |
| bocm-20210419-56-ordenanza-5-2021 | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2021/04/19/BOCM-20210419-56.PDF | Ordenanza 5/2021 (modifica 4 d) y 15 a), añade 16.3 y 17 bis): prueba de vigencia y canal electrónico (art. 38 OAACE 2019) |
| ayto-ordenanza-presecon-consolidada | 4 | https://www.madrid.es/UnidadesDescentralizadas/ServSocialesYAtencionDependencia/ServiciosSociales/Especial%20Informativos/Tarjeta_Familias/Capitulos/ficheros/Ordenanza_prestac_econ.pdf | Texto consolidado ANM 2021\337 → solo canal y documentos (G11: nada normativo desde rango 4) |

Consultada además (sin snapshot, bloqueo 403 o 404):
`sede.madrid.es` (trámite activo, requisitos art. 12, «Tramitar en línea»,
baremo resumen), `www.madrid.es/...GuiaPrestaciones2025.pdf` (ficha 20204,
404 a fetch no navegador) y la ficha suelta
`necbasicurgenciayemergencia.pdf` (URL obsoleta, 404).

## Requisitos modelados

| Requisito | Tipo | Condición | Base (art. Ordenanza) |
|---|---|---|---|
| `empadronado-madrid` | **hard** | `territory within_territory {municipality:"28079"}` | art. 12.2: empadronado en el distrito de la solicitud o en el municipio de Madrid |
| `mayor-edad` | **hard**, `timeDependent:increasing` | `age gte 18` | art. 12.1: «Ser mayor de edad o menor emancipado» |
| `carencia-recursos` | soft | `incomeAnnual lte IPREM_ANUAL_12P` (orientativo) | art. 12.3: «Acreditar la situación de necesidad» — sin umbral publicado |

**No comprobables (uncoveredRequirements):**

1. `situacion-emergencia-social` — art. 8.1 (necesidad económica coyuntural y
   urgente): la valora el profesional.
2. `valoracion-trabajador-social` — art. 4 b): valoración previa + proceso de
   intervención social obligatorio (art. 2: informe social municipal).
3. `aceptacion-diseno-intervencion` — art. 12.5: aceptación expresa del
   diseño de intervención (su incumplimiento extingue la ayuda, art. 18 a).
4. `excepcion-empadronamiento` — art. 12.2 *salvo*: situaciones excepcionales
   justificadas (p. ej. personas sin hogar vía SAMUR Social).
5. `baremo-sin-umbral-fijo` — disposición adicional + anexo: baremo de 10
   puntos (sociofamiliar 2 + socioeconómica 3 + riesgo/exclusión 3 +
   intervención o emergencia 2), «escala validada y estandarizada».
6. `incompatibilidad-mismo-concepto` — art. 6.2: no se cubre dos veces la
   misma necesidad (salvo complemento si no se solventó).
7. `documentacion-emergencia-flexible` — art. 14.6: en emergencia se admite
   dar curso a la solicitud comprometiendo la documentación después.
8. `cuantia-y-plazo-por-resolucion` — arts. 4.c/15.c: cuantía y plazo se fijan
   en el diseño de intervención; regla general máx. 90 % del coste, en
   emergencia/graves puede cubrirse el total.

## Decisiones

1. **ENTRA**: ordenanza vigente (consolidada 2021, desarrollo en 2025),
   solicitud permanente (rolling), resolución legal en 5 días naturales para
   emergencia social (art. 15.e).
2. **`standalone: true`**: no hay ficha en `data/catalog/benefits/`; G2 con
   fuente propia de rango 1 (BOCM-20130704-64).
3. **Solo dos hard**: territorio y edad son los únicos requisitos del art. 12
   que el cuestionario mide directamente. La «situación de necesidad» es soft
   (sin umbral oficial; IPREM 1× solo referencia, nunca F).
4. **Excepción de empadronamiento documentada**: el hard territorial puede dar
   F a una persona sin hogar no empadronada (el art. 12.2 admite excepción);
   el cuestionario no puede distinguirla ⇒ se documenta en uncovered +
   label. Riesgo residual de falso negativo marginal, aceptado igual que en
   `fuera-madrid-capital` (ola 4).
5. **Menor emancipado**: hard `age ≥ 18`; una emancipada de 16–17 daría F.
   Caso marginal; documentado en label («o menor emancipado… no lo podemos
   comprobar aquí») y aquí.
6. **`window.rolling`**: no hay convocatoria ni plazo de solicitud; la cita
   (art. 15.e) acredita el trámite continuo y la resolución en 5 días
   naturales.
7. **`channel.url` = sede.madrid.es** (trámite real) con **cita rango 4** del
   art. 15.a consolidado (registro municipal o medios electrónicos del art. 38
   OAACE) — G11 no restringe el canal; la sede no es snapshot-able (403).
8. **`amount: variable/one_off`**: sin cuantía pública (la fija el diseño de
   intervención; art. 4.c: hasta 90 % o 100 % en emergencia). No se cifra.
9. **Extracto con artefacto PDF**: la única aparición literal de art. 12.5 en
   el BOCM lleva el corte tipográfico «di- seño»; se cita **literal** con la
   marca (fiel al PDF oficial) y se avisa en el locator. La alternativa
   (texto consolidado limpio) es rango 4 y violaría G11.
10. **documents**: del art. 14 consolidado (rango 4 permitido en documentos):
    identidad, filiación/convivencia, situación económica (autorización AEAT
    o declaración responsable) y acreditación de la necesidad. `mandatory:
    false` solo el de filiación (condicionado a unidad familiar).

## No se pudo medir / pendiente

- `sede.madrid.es` y `GuiaPrestaciones2025.pdf` no snapshot-ables (Akamai
  403/404): el canal electrónico exacto y la ficha 20204 quedan apoyados en
  el art. 15.a consolidado; verificador puede contrastar a mano en navegador.
- No hay pregunta de «situación sobrevenida/emergencia» ni de emancipación ⇒
  ambos quedan en uncovered; el veredicto máximo posible es `posible`
  (estructural, igual que la regla autonómica).
- `humanReview.status = pending` y `verification.status = pending` (G12:
  requiere verificador independiente antes de entrar en bundle público).
- Golden `gp-emergencia-madrid`: espera `posible` + `ROLLING` (territorio T,
  edad T, recursos U por straddle de banda; situación/valoración/aceptación
  no comprobables).
- Validación: `npx tsx scripts/eligibility-validate.ts` ⇒ **36 rulesets, 0
  errores** (36 avisos G10 humanReview preexistentes + el de esta regla).
  Comprobación ad hoc con el motor: `posible`/`ROLLING` en el golden;
  `no_cumple` en Móstoles (28092) y en menor de 17; `posible` con edad o
  ingresos desconocidos.
