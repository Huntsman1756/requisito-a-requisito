# prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad

## Análisis

1. **`colectivo-familiar` (hard) — vía familia numerosa: falso negativo real.** La norma admite no solo a quien ya es familia numerosa sino a quien **adquiere la condición con ese mismo nacimiento/adopción**. Literal de la fuente citada (LGSS art. 357.1): «en una familia numerosa **o que, con tal motivo, adquiera dicha condición**, en una familia monoparental o en los supuestos de madres o padres que tengan reconocido un grado de discapacidad igual o superior al 65 por ciento». El cuestionario pregunta «¿Cómo es tu familia?» con opciones «Familia numerosa / Familia monoparental / Otra situación». Un progenitor con dos hijos que acaba de tener el tercero (o que adopta y adquiere la condición con tal motivo) y todavía no tiene expedido ni tramitado el título puede responder honestamente «Otra situación» → `familyType eq "familia-numerosa"` = F en la única vía que le aplicaba → **F en requisito hard → veredicto `no_cumple` pese a que la norma le admite expresamente**. Es la «o» de la norma leída más estrictamente que el texto. (Caso típico: la ayuda existe precisamente para el momento del nacimiento que genera la condición.)

2. **`colectivo-familiar` (hard) — vía discapacidad: dos asimetrías.**
   - La rama evalúa `disability eq "gte33"` del **usuario**; la norma admite «madres o padres» con ≥65 %, y el beneficiario puede ser cualquiera de los dos progenitores («el derecho a percibirlas solo podrá ser reconocido en favor de uno de ellos», art. 361.1). Si quien responde el cuestionario es el progenitor sin discapacidad pero el otro progenitor tiene ≥65 %, la rama da F; salvo que la familia encaje en las otras dos vías → F hard posible. Población real aunque acotada (lo natural es que solicite el progenitor con discapacidad).
   - La rama acepta ≥33 % cuando la norma exige ≥65 %: **sobreadmisión** (T indebido para 33–64 %), dirección contraria al falso negativo y declarada honestamente en `uncoveredRequirements.grado-discapacidad-65`. Sin acción por falsos negativos, pero el desfase es real.

3. **`colectivo-familiar` — vía monoparental**: la definición legal exige además «que constituye el sustentador único de la familia» (art. 357.2). No se evalúa y está declarado en `uncoveredRequirements.monoparental-sustentador`. Honesto.

4. **Resto**: `uncoveredRequirements` declara correctamente el nacimiento/adopción en España, el límite de ingresos anuales de la LPGE (+15 % por hijo desde el segundo, con matiz de ambos progenitores), los requisitos de afiliación/residencia del art. 352.1.a) y c) y la incompatibilidad entre progenitores. El plazo de prescripción (5 años) está citado de la ficha SEGSS.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| colectivo-familiar (rama familia numerosa) | alto | «en una familia numerosa **o que, con tal motivo, adquiera dicha condición**» (LGSS art. 357.1) — F hard a quien adquiere la condición con este nacimiento/adopción y aún no se reconoce como FN | Añadir rama `any` por circunstancia del nacimiento (p. ej. `dependents` ≥ 3 incluido el nuevo hijo, o pregunta «¿con este nacimiento/adopción pasáis a ser familia numerosa?»); mínimo: matizar el label («familia numerosa actual o que pase a serlo con este nacimiento») |
| colectivo-familiar (rama discapacidad) | bajo | «madres o padres que tengan reconocido un grado de discapacidad igual o superior al 65 por ciento» — evalúa solo la discapacidad del usuario; si el beneficiario es el otro progenitor, F hard | Matizar el label («tú o el otro progenitor con discapacidad ≥ 65 %») o añadir campo para discapacidad de la pareja; el desfase gte33 vs ≥65 ya está declarado en `grado-discapacidad-65` |
| — | ninguno | — | — |
