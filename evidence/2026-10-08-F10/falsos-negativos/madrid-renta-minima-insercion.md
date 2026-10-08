# madrid-renta-minima-insercion

## Análisis

1. `residencia-un-ano` (hard:true) evalúa `residenceMonths ≥ 12`, derivado de `residenceSince`, cuya pregunta es «¿Desde cuándo estás empadronado ahí?» — es decir, antigüedad de empadronamiento **en el municipio actual**. La norma pide «residencia efectiva e ininterrumpida en la Comunidad de Madrid durante el año inmediatamente anterior a la formulación de la solicitud» (Decreto 126/2014, art. 7.2). Quien se muda de un municipio de la CM a otro (p. ej. de Getafe a Madrid hace 6 meses, tras 10 años empadronado en la CM) reinicia el contador del cuestionario pero no el legal → F indebido en requisito hard.

2. Además, el reglamento computa como residencia efectiva períodos que el cuestionario no puede ver: «Tendrán también la consideración de residencia efectiva, a efectos del cumplimiento de este requisito, los períodos siguientes: a) El tiempo transcurrido en España en establecimientos penitenciarios o en centros de tratamiento terapéutico o rehabilitador. b) El tiempo de residencia en otra Comunidad Autónoma, cuando la persona solicitante o, en su caso, los familiares a su cargo hayan tenido que trasladar su residencia a territorio de la Comunidad de Madrid por ser alguno de ellos víctima de violencia en el ámbito familiar o de violencia de género» (art. 7.3). Una víctima de violencia de género recién llegada a la CM, o una persona recién excarcelada, obtiene F aunque la norma le computa ese tiempo → falso negativo.

3. `edad-25-65` (hard:true) cubre la vía general (25–64) y la circunstancia 1.ª (menor de 25 o mayor de 65 **con** menores/discapacidad a cargo). Da F a tres grupos que la norma admite:
   - 18–24 años **sin** menores a cargo por las vías del art. 8.2 del Reglamento: «Podrá reconocerse la prestación ... a personas con una edad comprendida entre dieciocho y veinticinco años, siempre que se encuentren en alguna de las situaciones siguientes: a) Haber estado tutelado por la Comunidad de Madrid ... b) Orfandad absoluta. c) ... grave exclusión social ... d) Ser víctima de violencia en el ámbito familiar o de violencia de género ... e) Participar en un Programa de Inclusión Social» → F indebido.
   - Mayores de 65 sin menores a cargo que viven solos y tienen denegada la PNC (art. 8.3: «a personas con una edad superior a sesenta y cinco años que carezcan de ingresos o tengan ingresos inferiores al importe de prestación mensual básica») → F indebido.
   - Menores emancipados o con beneficio de mayor edad (Ley art. 6.1.b in fine: «salvo que se encuentren emancipadas o dispongan del beneficio de la mayor edad») → F.
   Las tres están en `uncoveredRequirements` (`vias-18-25`, `mayores-65-sin-pension`, `menores-emancipados`) pero el requisito hard sigue devolviendo F. Borde correcto: «menor de sesenta y cinco» ↔ `lt 65`; a los 65 exactos ya hace falta vía alternativa — bien.

4. La vía de reconocimiento excepcional (art. 6.2 Ley: «En ningún caso podrá excepcionarse el requisito de residir de manera permanente en la Comunidad de Madrid») puede dispensar el resto de requisitos — incluidos los dos hard anteriores — en «unidades en extrema necesidad», declarada en `concesion-excepcional`. Refuerza que los hard F puedan ser indebidos.

5. `residencia-permanente-cm` (hard, territory ccaa 13): correcto — es el único requisito inexcusable por ley.

6. `ingresos-inferiores-rmi` (hard:false) usa 5.639,16 € = 469,93 × 12, coherente con el reglamento («dividiéndose la cuantía total de los mencionados ingresos por doce meses», y «doce mensualidades»). La cuantía real sube por miembro (+117,48 € el primer adicional, +75,11 € cada siguiente — art. 58 Ley 6/2025) y se mide sobre la unidad de convivencia, no sobre el ingreso personal de la banda; declarado en el label y en `computo-ingresos-unidad` como orientativo → matiz, sin F indebido hard.

7. Honestidad: los labels son cuidadosos («proxy: antigüedad en el empadronamiento», «solo es orientativa») y las excepciones están documentadas. El problema es de modelado: excepciones documentadas como "no comprobadas" dejan intacto el F de un requisito hard.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| residencia-un-ano | alto | «residencia efectiva e ininterrumpida en la Comunidad de Madrid durante el año inmediatamente anterior» + art. 7.3 «el tiempo de residencia en otra Comunidad Autónoma, cuando ... hayan tenido que trasladar su residencia ... por ser alguno de ellos víctima de violencia en el ámbito familiar o de violencia de género» | Medir residencia en la CM (no en el municipio) o degradar a soft; las excepciones del art. 7.3 (prisión, VG) exigen al menos que el requisito no pueda dar F seco |
| edad-25-65 | alto | Art. 8.2 Reglamento: «Podrá reconocerse ... a personas con una edad comprendida entre dieciocho y veinticinco años, siempre que se encuentren en alguna de las situaciones siguientes: ... tutelado ... Orfandad absoluta ... grave exclusión social ... violencia ... Programa de Inclusión Social»; art. 8.3 (>65 solos con PNC denegada); Ley art. 6.1.b in fine (emancipados) | Añadir vías `any` para 18–24 con circunstancias tasadas y >65 solos; mientras no sean comprobables, degradar el requisito a soft |
| residencia-permanente-cm | ninguno | «En ningún caso podrá excepcionarse el requisito de residir de manera permanente en la Comunidad de Madrid» (art. 6.2) | — |
| ingresos-inferiores-rmi | bajo | «dividiéndose la cuantía total ... por doce meses»; art. 58: básica 469,93 + complementos por miembro | Recalcular el umbral por tamaño de unidad si el cuestionario lo permite; si no, mantener soft (ya lo es) |
| labels/uncovered | bajo | «proxy: antigüedad en el empadronamiento» | El aviso existe pero omite el caso mudanza intra-CM y las computaciones del art. 7.3; explicitarlos |
