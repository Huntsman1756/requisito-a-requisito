# Tria de los defectos afirmados por la calibración v1 (controles)

Preparada mientras corre la v2 (`--only-failed`, 327 casos). Sirve para:
al terminar v2, separar lo que era (a) `cannot_tell` sin material,
(b) aproximación declarada (v2 la acepta), (c) defecto real pendiente.

## Clases observadas en v1

1. **`cannot_tell` en ítems de completitud** (~30 ítems): sin condición ni
   extracto no había material que juzgar → v2 ignora fidelity/hardness en
   completitud (solo `missingRequirements` validadas).
2. **`should_be_hard`/`should_be_soft` sin consenso o sobreestimado**: los
   modelos proponen endurecer/ablandar requisitos que son deliberadamente
   suaves (dato no medible por el cuestionario: edad en el fallecimiento,
   «alta en RETA» vs «autónomo», cuantía mayor — no elegibilidad).
3. **`too_lax`/`too_strict` ya declarados en `label`/`uncovered`**: los
   casos de consenso revisados uno a uno tienen el desfase escrito en la
   etiqueta (distrito vs municipio, «solo comprobamos el tope más alto»,
   «la ordenanza no fija umbral», IPREM como baremo no publicado).
   El prompt v2 los trata como `exact` (aproximación declarada).
4. **Sospechosos de defecto real (revisar tras v2):**
   - `asignacion-hijo-a-cargo/req:causante-con-discapacidad`: la condición
     no exige el grado (≥33 % si <18, ≥65 % si ≥18). El cuestionario tiene
     `disability` con gte33/lt33 → se podría modelar el grado; revisar.
   - `ayto-escuela-infantil/req:residir-madrid`: el extracto admite
     «prever residir» + excepciones; la aproximación está en el label,
     pero convendría declararla también en `uncovered`.
   - `becas-generales-mefp-2026-2027/req:estudiante-universitario`:
     `studentStatus=si` no distingue grado/máster oficiales ni curso — si
     la banda del cuestionario no cubre, declarar en label/uncovered.
   - `madrid-abono-transporte-infantil/req:menor-0-14-a-cargo`:
     `wrong` de deepseek — revisar la condición `count_where_gte` con
     `age < 14` vs «0–14 años» (borde inclusivo/exclusivo).
   - `complemento-ayuda-infancia/req:menor-en-unidad` y
     `bono-cultural-joven/req:nacido-en-2008`: los 2 falsos negativos de
     mutantes — equivalencias semánticas que los modelos no detectaron;
     enriquecer mutants.ts (mutante `field` con equivalencia evidente).
   - `pension-incapacidad-permanente/req:edad-inferior-jubilacion-comunes`:
     2 modelos `too_strict` — revisar si la condición incluye el caso
     «menor de edad de jubilación pero con derecho por causa distinta».
   - `subsidio-desempleo/req:desempleo`: `too_strict` ×2 + `should_be_soft`
     — el extracto puede admitir supuestos que la condición corta.

## Criterio tras v2

- Si una alarma persiste en v2 con fidelity ≠ exact y el desfase **no**
  está declarado en `label`/`uncovered`: defecto real → reautoría de ese
  ítem (label, uncovered o condición) y rerun de ese caso.
- Si persiste como `should_be_*` y el matiz es deliberado (no medible o
  no excluyente): documentar como aceptación consciente en el informe de
  verificación de la ola, no como defecto.
