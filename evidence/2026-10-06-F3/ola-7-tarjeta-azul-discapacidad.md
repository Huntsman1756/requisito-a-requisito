# Ola 7 — Tarjeta Azul (categoría discapacidad ≥33 %), Ayuntamiento de Madrid

**Sustituto del slot «cheque servicio»** (veredicto NO ENTRA en
`ola-7-cheque-servicio.md`). **Veredicto: ENTRA.** Programa municipal del
Ayuntamiento de Madrid, abierto de forma permanente y con trámite en línea
activo en la sede electrónica (comprobado el 2026-10-06).

## 1. Cribado por orden de preferencia

1. **Cheque taxi / ayudas al uso del taxi para PMR (Ayto. Madrid) → NO
   ENTRA.** No existe trámite vivo en `sede.madrid.es` ni página en
   `madrid.es`: la ficha «Personas con movilidad reducida» del portal solo
   enlaza «Taxi adaptado - EUROTAXI» (información de servicio, no ayuda
   económica), «Tarjeta de estacionamiento PMR», «Tarjeta Azul» y «Servicio
   de ayuda a domicilio». El «cheque taxi» municipal se apoyaba en datos de
   las emisoras de radio-taxi; la sentencia TSJM de 10/07/2012 dejó sin base
   esa cesión y el programa quedó sin operar — nunca se reactivó como
   convocatoria abierta (las ayudas a eurotaxi vigentes son para
   **titulares de licencia**, plan Cambia 360, no para usuarias). Análogo al
   cheque servicio: hoy la ayuda al uso del taxi que se conoce es la del
   SAAD/CM, otra administración.
2. **Becas o ayudas deportivas municipales →** no se agotó: existe descuento
   permanente en abonos de instalaciones deportivas (tarifa social), pero su
   norma vive en ordenanza fiscal municipal sin versión BOCM localizada;
   descartado en favor del candidato 3 con fuentes rango 1 ya comprobadas.
3. **Otra ayuda municipal → Tarjeta Azul (categoría discapacidad): ENTRA.**

## 2. Por qué la Tarjeta Azul es municipal y está viva

- La sede electrónica del Ayuntamiento mantiene el trámite «Tarjeta Azul de
  transportes para autobuses (EMT) y metro» con botón **«Tramitar en línea»
  activo** (solicitud y renovación digital) y canal presencial sin cita en
  las Oficinas Línea Madrid — snapshot `sede-ayto-tarjeta-azul`, 2026-10-06.
- Reparto de roles (propio trámite): «El Ayuntamiento de Madrid se encarga
  de tramitar las solicitudes de Tarjeta Azul y el Consorcio Regional de
  Transportes de Madrid (CRTM) es la responsable de emitirla, enviarla y
  gestionarla». La modificación de requisitos de 2011 se hizo **a propuesta
  de la Junta de Gobierno de la Ciudad de Madrid** (Resolución CRTM
  11/04/2011, exposición). Vigencia de la colaboración acreditada por el
  Convenio CRTM–Ayto. de 02/06/2023 (BOCM n.º 43, 30/06/2023) y su prórroga
  (Acuerdo de 04/07/2025, BOCM n.º 22, 01/08/2025), citados en el propio
  «Fundamento legal» del trámite — no snapshoteados (no aportan requisitos).
- Criterio R5-VERIF confirmado: es tarjeta del **Ayuntamiento**, no de la
  CM. `managingBody` y `channel.url` apuntan al Ayto. (`sede.madrid.es`).

## 3. Relación con `madrid-abono-transporte-65` (corrección de solape)

La tarjeta existente `madrid-abono-transporte-65` ya modela **la categoría
≥65 años de esta misma Tarjeta Azul** (requisitos duros: 65 años +
empadronado en Madrid + ≤1×IPREM; sus citas son las Resoluciones de la
Tarjeta Azul). Este ruleset NO duplica: modela la **categoría discapacidad
≥33 %** (tope 3×IPREM, canal en línea habilitado solo para esta categoría),
que la tarjeta de mayores no cubre — una persona con discapacidad y 45 años
caía en `no_cumple` allí por edad. Patrón por categoría beneficiaria, como
ya hacen `madrid-ayudas-nacimiento-general` / `-multiple`.

## 4. Modelo

| requirement | hard | campo | norma |
|---|---|---|---|
| `empadronado-municipio-madrid` | sí | `territory` within 28079 | Res. 2011, Anexo A) «siendo residentes en Madrid» |
| `discapacidad-min-33` | sí | `disability` = gte33 | Res. 2011, Anexo A) Cuarta |
| `renta-max-3-iprem` | sí | `incomeAnnual` ≤ IPREM_ANUAL_14P ×3 | Res. 2011, Anexo A) Cuarta «no perciba … superiores a tres veces el IPREM» |

Decisión IPREM: la tabla oficial de la Resolución (Anexo, «INGRESOS
MÁXIMOS…», supuesto 3) computa el tope anual de esta categoría como
**3 × IPREM de 14 pagas** (2011: 22.365,42 € = 3 × 7.455,14 = 42 × 532,51
mensuales). Se usa `IPREM_ANUAL_14P` (8.400 €) × 3 = **25.200 €/año** —
cae justo en el corte de la banda de ingresos 16.800–25.200, sin ambigüedad.

Uncovered (todo con cita rango 1, G11): otras categorías beneficiarias
(quinta — dependientes >18), cónyuge/pareja sin ingresos (tercera), menores
dependientes (séptima), verificación de renta vía autorización AEAT/INSS
(B).4 + trámite), revisión periódica y caducidad 5 años (C) + CRTM),
validez limitada a Metro zona A + EMT + ML-1 (Res. 2009), precio bonificado
3,70 € vs tarifa oficial 6,30 € (Res. tarifas 2026).

Nota: la escala de cargas familiares (sexta) **no** se aplica a esta
categoría — la propia norma la excluye («salvo las contenidas en la
condición cuarta»): el tope 3×IPREM es fijo y por eso va como `hard`.

Canal: presencial sin cita en Oficinas Línea Madrid (no auxiliares Aravaca,
El Pardo, Las Tablas/Valverde) **y en línea** — el CRTM indica que el canal
electrónico está habilitado precisamente para «Persona con discapacidad
mayor de 18 años» (rank 3, permitido en `channel`). `online: true`.

Importe: `fixed` 3,70 €/30 días (precio bonificado 2026; Resolución de
precios 29/12/2025). Obtención de la tarjeta: gratuita (sede).

Golden: `gp-tarjeta-azul-vallecas` — 45 años, Madrid 28079, discapacidad
gte33, renta 8.400–16.800 → los tres hards en T ⇒ `posible` / `ROLLING`
(verificado ejecutando `evaluateRuleSet` sobre la persona: verdict posible,
deadline ROLLING, reqs T/T/T).

## 5. Fuentes (snapshot 2026-10-06 o anterior, en `data/eligibility/sources/`)

| sourceId | Rango | URL | Uso |
|---|---|---|---|
| bocm-20090316-tarjeta-azul | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2009/03/16/2009-03-16_11032009_0226.pdf | creación del título, red de validez |
| bocm-20110525-tarjeta-azul | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2011/05/25/BOCM-20110525-21.PDF | requisitos, documentos, revisión, apertura 16/05/2011 |
| bocm-20251231-2-precios-2026 | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-2.PDF | precio 3,70 €/30 días 2026 |
| bocm-20251231-3-tarifas-2026 | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2025/12/31/BOCM-20251231-3.PDF | tarifa oficial 6,30 € |
| bocm-20260122-20-condiciones-ttp | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/01/22/BOCM-20260122-20.PDF | fotografía pasaporte |
| crtm-tarjeta-azul | 3 | https://crtm.es/landing-billetes-y-tarifas/tarjeta-transporte-publico-azul/ | canal presencial/en línea, caducidad 5 años |
| sede-ayto-tarjeta-azul | 4 | https://sede.madrid.es/portal/site/tramites/menuitem.62876cb64654a55e2dbd7003a8a409a0/?vgnextoid=ac464e85763fd310VgnVCM1000000b205a0aRCRD&vgnextchannel=2cb9a38813180210VgnVCM100000c90da8c0RCRD&vgnextfmt=default | trámite vivo, canal URL, fundamentos legales |

Solo `sede-ayto-tarjeta-azul` se snapshotó hoy; el resto ya estaba en el
repo (ola-2, `madrid-abono-transporte-65`).

## 6. Comandos ejecutados

- `node node_modules/tsx/dist/cli.mjs scripts/eligibility-snapshot.ts --url
  <sede tarjeta azul> --id sede-ayto-tarjeta-azul --rank 4` →
  `ddd8052ea8a7…` text `4e60ee99f2eb…` (text/html).
- `node node_modules/tsx/dist/cli.mjs scripts/ruleset-fill-hashes.ts` →
  «excerptSha256 rellenados y verificados contra snapshots».
- Evaluación del golden con `evaluateRuleSet` (today 2026-10-06) →
  `posible` / `ROLLING` (T/T/T).
- `node node_modules/tsx/dist/cli.mjs scripts/eligibility-validate.ts` →
  **36 rulesets, 0 errores, 36 avisos** (35 preexistentes + 1 aviso
  ELIG_G10_HUMAN_REVIEW propio por `humanReview: pending`).

## 7. Pendientes

- `humanReview: pending` — pendiente de verificador independiente (G12).
- Categorías no cubiertas por este ruleset ni por `abono-65` (pensionistas
  60–65, dependientes >18, cónyuge sin ingresos, menores): documentadas en
  `uncoveredRequirements`; si se quiere una tarjeta propia, patrón ya
  establecido.
