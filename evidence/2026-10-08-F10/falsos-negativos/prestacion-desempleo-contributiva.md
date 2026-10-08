# prestacion-desempleo-contributiva

## Análisis

1. **`situacion-legal-desempleo` (soft, único requisito evaluado)** — `employmentStatus eq "desempleado"`. Al ser `hard:false` nunca produce veredicto `no_cumple`. La norma (LGSS art. 267) cubre supuestos en los que la persona aún tiene contrato vivo: suspensión o reducción de jornada (ERE/ERTE, art. 47 ET), fijo-discontinuo en inactividad, trabajador con dos contratos que pierde uno (paro parcial). Quien esté en ERTE o en desempleo parcial responderá «Trabajo por cuenta ajena» y verá F en el requisito pese a estar en situación legal de desempleo. El propio label lo declara («el paro también cubre el desempleo parcial, p. ej. un ERTE») y `uncoveredRequirements.causa-involuntaria` lista las causas admitidas. F mostrado, mitigado.

2. **Bordes y unidades** — El mínimo de cotización se deja honestamente en `uncoveredRequirements` (art. 266.b/269.1: «Tener cubierto el período mínimo de cotización … dentro de los seis años anteriores»; escala «Desde 360 hasta 539 → 120»). No hay bordes lt/gte evaluados → sin riesgo de borde inclusivo/exclusivo.

3. **Plazo de solicitud** — `uncoveredRequirements.plazo-solicitud-15-dias` dice «15 días» citando LGSS art. 268.1 («dentro del plazo de los quince días siguientes»); la fuente SEPE precisa «quince días hábiles» — el window cita correctamente la versión SEPE con `businessDays:true`. Coherente.

4. **Colectivos** — `casos-especiales-cotizacion` declara honestamente emigrantes retornados (360 días en los 6 años anteriores a la emigración) y eventual agrario desde autónomos (720 días). La lista de beneficiarios SEPE incluye también funcionarios de empleo, militares profesionales, empleadas de hogar, penados liberados, miembros de corporaciones locales, sindicalistas liberados y altos cargos — el campo `employmentStatus` no los distingue, pero son soft y las causas están declaradas.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| situacion-legal-desempleo | bajo | LGSS art. 267 (vía label/uncovered): suspensión o reducción de jornada e inactividad del fijo-discontinuo son situación legal de desempleo aunque el usuario responda «asalariado» → F mostrado a quien la norma admite (soft, no bloquea el veredicto; label ya advierte del ERTE) | Ninguna urgente; si se quiere afinar, permitir `in: ["desempleado","asalariado"]` con label condicional, o una opción de cuestionario «tengo contrato pero estoy en ERTE/jornada reducida» |
| — | ninguno | — | — |
