# Verificación ola 9 — re-autoría de las 2 reglas de dependencia

**Fecha:** 2026-10-06 · **Autor:** agente (re-autoría) · **Verificador:** agente
(pasada independiente sobre extractos, numeración y vigencia) · **Detonante:**
F9 marcó stale `boe-ley-39-2006-dependencia` tras la republicación del texto
consolidado el 03/10/2026 por la **Ley 4/2026, de 1 de octubre
(BOE-A-2026-20528)**, en vigor el **23/10/2026**.

Alcance: `prestaciones-dependencia-saad` y
`prestacion-cuidador-no-profesional`.

## Comprobaciones de la pasada verificadora

1. **Identidad de la norma modificadora** — confirmada en el propio texto
   consolidado («Disposición final cuarta bis… desde la entrada en vigor de
   la Ley 4/2026, de 1 de octubre») y en el BOE:
   `boe.es/diario_boe/txt.php?id=BOE-A-2026-20528`. La fuente
   `boe-ley-39-2006-dependencia` sirve ya la redacción modificada.
2. **Extractos literales** — comprobación programática de las **55 citas**
   de ambas reglas contra el texto normalizado de cada snapshot:
   **55/55 presentes, 0 fallos**. `rules:fill-hashes` re-emitió las huellas
   `excerptSha256` sin errores.
3. **Numeración y localizadores** — corregidos donde la reforma movió el
   pasaje:
   - cuidador `convivencia-habitabilidad`: Art. 14.4 → **Art. 18.1**.
   - cuidador `ss-convenio-cuidador`: Art. 18.3 → **Disposición adicional
     cuarta** («Seguridad Social de los cuidadores no profesionales»).
   - saad `prestacion-entorno-familiar`: «Art. 14.4 y 18.1-3» → **Art. 18**.
   - cuidador nuevo ítem `apoyos-servicios-cuidadores` → **Disposición
     final cuarta bis** (derecho nuevo: servicios de apoyo a personas
     cuidadoras).
   - saad `menores-6-anos` → Disposición adicional decimotercera (vigente).
4. **Sustancia que sí cambió y NO se disimula** — el Decreto de la CM
   (`bocm-20150526-1-dependencia`) sigue exigiendo parentesco hasta 3.er
   grado + 1 año de cuidados previos + incompatibilidades + plazo
   suspensivo de 2 años, todo ello en tensión con la nueva ley estatal
   («entorno familiar **o relacional**», sin sección de incompatibilidades).
   Las etiquetas se reescribieron para decir exactamente eso al usuario:
   «en revisión — el decreto de la CM aún no se ha actualizado». Ninguna
   condición del motor depende de ese texto: los tres requisitos modelados
   (empadronamiento CM, dependencia reconocida / no reconocida según la
   regla, residencia 5 años con 2 inmediatos) no cambiaron de sustancia.
5. **Vigencia** — la reforma entra en vigor el 23/10/2026. El texto
   consolidado que cita el producto ya es el nuevo; las etiquetas
   transicionales cubren el intervalo. El informe
   `evidence/2026-10-06-F9/stale-ley-39-2006.md` documenta el detalle.
6. **Gates** — `eligibility:validate`: 45 rulesets, 0 errores.
   `eligibility:build`: 45 incluidas, 0 excluidas.
7. **Goldens** — `gp-cuidadora-64-carabanchel.json` y
   `gp-dependencia-cuidadora.json` evalúan veredicto + plazo con el motor
   real (personas ya existentes de la wave original).

## Decisión

Las dos reglas vuelven a `data/eligibility/rules/` con
`verification: ok` y este informe. El seguimiento del decreto de la CM
(cuando se actualice a la Ley 4/2026 habrá una segunda re-autoría de las
etiquetas «en revisión») queda cubierto por la revisión diaria de F9.

**No verificado:** que la Administración de la CM aplique ya el criterio
nuevo del art. 18 (el decreto manda hasta su reforma — por eso la etiqueta
dice «en revisión» y no afirma el nuevo criterio como regla).
