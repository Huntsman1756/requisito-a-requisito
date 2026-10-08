# madrid-bono-alquiler-joven

## Análisis

Reglas evaluadas (`data/eligibility/rules/madrid-bono-alquiler-joven.json`, RD 42/2022 Título I + Acuerdo CM de 26/12/2024):

- `mayoria-edad` (hard): `age gte 18`. Art. 6.1: «personas físicas mayores de edad». Correcto, sin excepciones de emancipación en el precepto.
- `edad-max-35` (hard): `age lte 35`. Art. 6.1.a: «tener hasta treinta y cinco años, **incluida la edad de treinta y cinco años**, en el momento de solicitar la ayuda» → `lte 35` con `referenceDate: application` es literalmente correcto (borde inclusivo bien resuelto).
- `vivienda-en-madrid` (**hard**, `territory within ccaa 13` = empadronamiento actual en la CM): **falso negativo real**. La norma permite solicitar **antes de tener la vivienda**: art. 6.1.c «Ser titular **o estar en condiciones de suscribir**… un contrato de arrendamiento», y el Acuerdo CM habla de «una vivienda que constituya **o vaya a constituir** su domicilio habitual y permanente». El propio `uncoveredRequirements.vivienda-habitual` lo reconoce: «si aún no has firmado, el contrato y el volante se aportan tras la concesión». Lo que la norma exige es que la **vivienda** esté en la CM y llegue a ser residencia habitual — no que el solicitante esté *ya* empadronado en la CM. Un joven empadronado fuera de la CM (o sin empadronar) que se emancipa alquilando en la región — justo la finalidad del bono — recibe **F duro** → «no cumples» indebido.
- `ingresos-3iprem` (hard): `incomeAnnual lte IPREM_ANUAL_14P × 3` = 25.200 €. La norma mide la suma de rentas de **todas** las personas con domicilio habitual en la vivienda (salvo habitación, solo el arrendatario) — art. 6.1.d, declarado en `ingresos-unidad-convivencia`. Dirección segura: los ingresos del respondente computan siempre en esa suma, así que si superan 3×IPREM la unidad también los supera → F válido. Con bandas: «Más de 25.200 €» → F; el resto T. Correcto y conservador.
- `alquiler-o-condiciones` (soft): `housingStatus in [alquiler, general]` — «Otra situación» absorbe «en condiciones de suscribir» (vivir con los padres, etc.); soft → no bloquea. Bien.
- Inconsistencia menor: `documents.contrato` figura como `mandatory: true` («Copia del contrato de arrendamiento») aunque la norma y el propio uncovered reconocen la solicitud pre-contractual (se aporta tras la concesión). No es requisito de elegibilidad, pero la lista de documentos puede disuadir a quien aún no ha firmado.
- `uncoveredRequirements` completo: nacionalidad/estancia regular, residencia habitual (con el matiz pre-contractual), prohibición de propiedad con sus excepciones (parte alícuota, separación/divorcio, inaccesibilidad — art. 6.2.a), parentesco con arrendador, fuente regular de ingresos (con definición del art. 6.1.d segundo párrafo), renta máxima 600 €/300 € y ampliación a 900/450 en municipios del Anexo II, incompatibilidades. Honesto.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| vivienda-en-madrid | alto | «Ser titular **o estar en condiciones de suscribir**… un contrato de arrendamiento» (art. 6.1.c); «una vivienda que constituya **o vaya a constituir** su domicilio habitual» (Acuerdo CM) — exigir empadronamiento CM *actual* como hard excluye a quien se muda a la CM | Replantear: comprobar que la vivienda (actual o prevista) estará en la CM; degradar a soft o mover a uncovered «la vivienda debe ser en la CM» |
| mayoria-edad | ninguno | «personas físicas mayores de edad» (art. 6.1) | — |
| edad-max-35 | ninguno | «hasta treinta y cinco años, incluida la edad de treinta y cinco años» (art. 6.1.a) → lte inclusivo correcto | — |
| ingresos-3iprem | ninguno | «rentas anuales, incluidos los de las personas que tengan su domicilio habitual… iguales o inferiores a 3 veces el IPREM» (art. 6.1.d) — F solo si el respondente solo ya supera el tope | — |
| documents.contrato | bajo | «estar en condiciones de suscribir» (art. 6.1.c) vs. contrato marcado `mandatory: true` | Marcar condicional o aclarar «si ya lo has firmado» |
