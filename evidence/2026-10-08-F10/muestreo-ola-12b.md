# Hoja de muestreo — Ola 12b (ADR-040) · correcciones de falsos negativos

Fecha: 2026-10-08 · Programas: 7 · Parte de la ola 12, dividida
en cinco hojas (12a–12e) para que un KO solo detenga su parte — ver
`verificacion-ola-12b.md`.

**Regla ADR-040**: revisa 2 de esta hoja; si alguna sale KO, **solo esta hoja
se bloquea** — las demás siguen su curso.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **7 regla(s)**: anticipos-docentes-cm, ayto-ibi-familia-numerosa, ayto-tarjeta-azul-discapacidad, cm-reintegro-accidentes-trabajo, descuento-transporte-familia-numerosa, madrid-abono-transporte-65, prestacion-cuidado-menor-enfermedad-grave.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-08-F10/muestreo-ola-12b.md` — es la única vía que pone humanReview=approved.

## Tema de esta hoja — eq → in/any: vías que el cuestionario sí cubre

La condición era más estricta que la norma: pedía una respuesta concreta cuando el cuestionario ya ofrece la vía alternativa (docente→empleo público, monoparental con título FN, laboral público, categorías II/V de Tarjeta Azul, adquisición de la condición de familia numerosa con el nacimiento).

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| `anticipos-docentes-cm` | OK | ☐ OK ☐ KO |
| `ayto-ibi-familia-numerosa` | OK | ☐ OK ☐ KO |
| `ayto-tarjeta-azul-discapacidad` | OK | ☐ OK ☐ KO |
| `cm-reintegro-accidentes-trabajo` | OK | ☐ OK ☐ KO |
| `descuento-transporte-familia-numerosa` | OK | ☐ OK ☐ KO |
| `madrid-abono-transporte-65` | OK | ☐ OK ☐ KO |
| `prestacion-cuidado-menor-enfermedad-grave` | OK | ☐ OK ☐ KO |

## Dictamen del verificador (extracto de `verificacion-ola-12.md`)

- `anticipos-docentes-cm` — ****OK** (obs. FP)**: `employmentStatus in [docente, empleado-publico]`: el docente que marcó «Empleo público» ya no recibe F. Extracto (base 15ª.1): «Ser funcionario, de carrera o en prácticas, de cuerpos docentes no universitarios y estar en situación de servicio activo». Prueba el requisito; el label indica «marca Docencia o Empleo público». Obs.: empleados públicos **no docentes** obtienen T en un requisito hard → falso positivo residual irreducible con el cuestionario actual (no distingue docencia dentro de empleo público). No introduce F nuevo.
- `ayto-ibi-familia-numerosa` — ****OK** (obs. FP)**: `familyType in [familia-numerosa, monoparental]`: quita la F a monoparentales con título (p. ej. viudedad con 2 hijos, art. 2.2 Ley 40/2003). Extracto art. 12.1: «ostenten la condición de titulares de familia numerosa, conforme lo establecido en la Ley 40/2003». Obs.: monoparental **sin** título obtiene T (FP residual; no hay pregunta de titularidad en el cuestionario). Sin F nuevo.
- `ayto-tarjeta-azul-discapacidad` — ****OK** (matiz)**: `any` [disability gte33 | employmentStatus jubilado | dependency reconocida] reproduce las categorías Cuarta, Segunda y Quinta del Anexo — verificadas en la fuente: Segunda «Disfrutar de pensión de jubilación por razón de edad o invalidez permanente…»; Quinta «Ser mayor de dieciocho años y tener reconocida la situación de dependencia». Matiz: el excerpt citado solo cubre la Cuarta; convendría añadir Segunda/Quinta. Obs. FP: el tope `renta-max-3-iprem` (3×IPREM, propio de la cat. IV) es más laxo que el 1×IPREM de las categorías II/V → T indebida a pensionistas/dependientes con 1–3×IPREM; sin F nuevo.
- `cm-reintegro-accidentes-trabajo` — ****OK****: `in [empleado-publico, docente]`: los docentes de la CM cotizan en el Régimen General salvo opción mutualista, así que son destinatarios legítimos; extracto «empleados públicos incluidos en el Régimen General de la Seguridad Social». Obs. menor: docente acogido a MUFACE obtendría T indebida (no medible).
- `descuento-transporte-familia-numerosa` — ****OK** (obs. FP)**: Idéntico patrón que IBI: `in [familia-numerosa, monoparental]`; extracto art. 11.4 «deberán presentar… el correspondiente título oficial de familia numerosa». Mismo FP residual para monoparentales sin título; sin F nuevo.
- `madrid-abono-transporte-65` — ****OK** (matiz)**: `any` [age≥65 | jubilado | dependency reconocida] = categorías Primera, Segunda y Quinta del Anexo Tarjeta Azul (verificadas en la fuente). El requisito `renta-iprem` (soft, 1×IPREM 12 pagas) ya cubre el tope de estas categorías. Matiz: el excerpt «Tener sesenta y cinco años cumplidos» solo prueba la Primera; añadir Segunda/Quinta sería más completo.
- `prestacion-cuidado-menor-enfermedad-grave` — ****OK** (obs. FP)**: `empleado-publico` añadido al `in`: el personal **laboral** público cotiza en el RG y es destinatario (art. 4.1: «afiliadas y en alta en algún régimen del sistema de la Seguridad Social»). El label advierte «los funcionarios de régimen propio quedan fuera». Obs.: un funcionario mutualista que marque «Empleo público» obtiene T indebida — no medible; sin F nuevo.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre SOLO esta hoja y se corrige
antes de aprobar el resto.
