# madrid-abono-transporte-65

## Análisis

**1. Requisitos `hard: true`.** Dos.

### `edad-65` (`hard: true`, `age gte 65`) — la Tarjeta Azul no es solo para mayores de 65

La Resolución de 2011 (Anexo, apartado A) cubre **seis** categorías de
residentes en Madrid, no solo la Primera («Tener sesenta y cinco años cumplidos»):

- Segunda: «Disfrutar de pensión de jubilación por razón de edad o invalidez
  permanente (absoluta o total)» con ingresos ≤ IPREM — **sin mínimo de edad**.
- Tercera: cónyuge o pareja de hecho sin ingresos de beneficiarios de las dos
  anteriores.
- Cuarta: discapacidad ≥ 33 % con ingresos ≤ 3×IPREM.
- Quinta: «Ser mayor de dieciocho años y tener reconocida la situación de
  dependencia» con ingresos ≤ IPREM.
- Séptima: dependientes menores de 18 vía renta del padre/madre/tutor.

Un pensionista por jubilación o invalidez de 60 años, empadronado en Madrid y
con ingresos bajos, cumple la norma por la vía Segunda pero obtiene F en
`edad-65` → `no_cumple`. Lo mismo para una persona dependiente de 40 o un
discapacitado ≥ 33 %. El `uncoveredRequirement` `otras-categorias` lo advierte
(«si encajas en otra categoría, revísala también»), pero el veredicto final sigue
siendo «no parece aplicarte» — justo el daño que ADR-017 quiere evitar. (Existe
el slug `ayto-tarjeta-azul-discapacidad` para la Cuarta; pensionista < 65 y
dependiente > 18 no tienen RuleSet alternativo.) Alternativa: acotar el
beneficio al perfil 65+ haría que `edad-65` no fuese un requisito sino el
propio ámbito — pero tal cual está («beneficio = Tarjeta Azul», requisito hard),
produce falsos negativos para las demás categorías.

### `empadronado-municipio-madrid` (`hard: true`, `within_territory 28079`)

La norma dice «siendo residentes en Madrid» y la solicitud se formaliza ante la
dependencia habilitada por el Ayuntamiento de Madrid — interpretación municipal
razonable y honesta en el label. La norma dice «residentes», no
«empadronados», pero en la práctica la acreditación es por padrón; matiz bajo.

### `renta-iprem` (`hard: false`, `incomeAnnual lte IPREM_ANUAL_12P` = 7.200 €)

El Anexo equipara el tope a «el IPREM» y su propia tabla de 2011 lo expresa como
532,51 €/mes = 7.455,14 €/año, es decir **IPREM de 14 pagas** (532,51 × 14 =
7.455,14). Usar 12 pagas (7.200 €) es ~1.200 €/año más estricto: una renta de
7.500–8.400 € da F en la fila pese a estar dentro del tope normativo. Soft ⇒
aviso engañoso, no veredicto. El label lo declara («usamos el valor más
estricto»). Además la escala por cargas familiares (hasta 1,765×IPREM) está en
⚠ — declarado.

**2. Dato del cuestionario más estricto que la norma.** `age` no puede expresar
las vías alternativas (pensión, dependencia, discapacidad); `incomeAnnual` con
IPREM 12p es más estricto que el IPREM de la norma.

**3. Honestidad de label y uncoveredRequirements.** Muy completo: escala de
cargas, suma de ingresos de personas a cargo, otras categorías, ámbito de validez
(zona A/EMT/ML1), carácter bonificado del precio (6,30 € oficial vs 3,70 €),
alternativa Abono +65 y revisión periódica. La laguna es que el alcance del
RuleSet (perfil 65+) convierte el resto de categorías en falsos negativos de
veredicto aunque se mencionen en ⚠.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| edad-65 | alto | «Segunda.—Disfrutar de pensión de jubilación por razón de edad o invalidez permanente (absoluta o total)…» y «Quinta.—Ser mayor de dieciocho años y tener reconocida la situación de dependencia» (Anexo A) — sin edad mínima de 65 | Acotar el beneficio declaradamente a «Tarjeta Azul — perfil 65+» (la edad como ámbito, con ⚠ visible) o modelar las categorías II/III/V como ramas `any` con los campos existentes (`disability`, `dependency`, `employmentStatus=jubilado`) |
| empadronado-municipio-madrid | bajo | «siendo residentes en Madrid» | Nada que corregir de fondo; opcional precisar «empadronado (la residencia se acredita por padrón)» |
| renta-iprem | bajo | Tabla anexa: «532,51 €/mes — 7.455,14 €/año» = IPREM×14 | Usar `IPREM_ANUAL_14P` (8.400 € en 2026) si se decide reflejar la praxis de la tabla; al ser soft el daño es solo de fila |
