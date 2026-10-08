# prestaciones-dependencia-saad

Revisadas las dos versiones: `prestaciones-dependencia-saad.json` (vigente hasta 22/10/2026) y `prestaciones-dependencia-saad__v-2026-10-23.json` (desde 23/10/2026, Ley 4/2026).

## Análisis

1. **`empadronado-cm` (hard)** — `territory within_territory {ccaa:"13"}`. Decreto 54/2015 art. 2: «residan en la Comunidad de Madrid en la fecha en que presenten la solicitud». Sin excepciones en la fuente; el label aclara que en otra CCAA el trámite es el mismo ante su administración. Correcto.

2. **`residencia-espana-5y2` (soft)** — `residenceMonths gte 24` (derivado de `residenceSince` = empadronamiento en el municipio actual). Dos brechas:
   - La norma mide residencia **en España** (5 años, 2 inmediatos), no en el municipio actual → F mostrado a recién llegados de otros municipios españoles. Mitigado por el label («la fecha de alta en tu municipio actual es solo una pista … ese tiempo también cuenta») y por `uncoveredRequirements.residencia-regla-completa` (menores de 5 años → periodo al guardián; emigrantes retornados).
   - **Solo versión `__v-2026-10-23`**: el nuevo art. 5.1.c exime de los 5 años de residencia y de la nacionalidad a «i) Solicitantes de asilo en España … beneficiarios de asilo o de protección subsidiaria … ii) Beneficiarias de protección temporal … RD 1325/2003», y remite a la DA 19.ª a quienes residen en el extranjero por «destino oficial de miembros de su unidad familiar en una misión o servicio público». Ningún `uncoveredRequirement` de la versión __v recoge estas exenciones → F mostrado a personas exentas por la redacción vigente desde el 23/10/2026. En la versión pre-Ley4 no existe la exención → sin laguna allí.

3. **`sin-reconocimiento-previo` (soft)** — `dependency eq "no"`. Quien responde «en trámite» o «reconocida» ve F. El label lo justifica: «este trámite es el reconocimiento inicial; si ya la tienes, lo que procede es la revisión de grado o el PIA». Matiz: el slug sugiere «prestaciones del SAAD» en general (que incluiría PIA/prestaciones para ya reconocidos); el label lo acota honestamente, pero un usuario ya reconocido que busca prestaciones puede leer el F como «no puedo acceder al SAAD». Bajo.

4. **Menores** — La versión pre-Ley4 declara el régimen de menores de 3 años (DA 13.ª antigua) y la __v actualiza a menores de 6 años (DA 13.ª nueva) — verificado en ambos textos consolidados. Correcto y actualizado.

5. **Documentación y canal** — El certificado de empadronamiento pedido («5 años en España, los 2 últimos inmediatamente anteriores … y el empadronamiento en un municipio de la Comunidad de Madrid») coincide con la ficha S13. Los opcionales (representación, informe social, libro de familia) están marcados `mandatory:false`. Honesto.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| residencia-espana-5y2 (solo __v-2026-10-23) | alto | Art. 5.1.c nuevo: «No será necesario el cumplimiento de los requisitos relativos a la nacionalidad española … ni a la residencia en territorio español durante un periodo de cinco años … i) Solicitantes de asilo … ii) Beneficiarias de protección temporal» + remisión a DA 19.ª — F mostrado a exentos; laguna en `uncoveredRequirements` de la versión vigente desde el 23/10 | Incorporar las exenciones en `residencia-regla-completa`/`nacionalidad-extranjeria` de la versión __v |
| residencia-espana-5y2 (ambas) | bajo | 5 años España + 2 inmediatos vs proxy de empadronamiento en el municipio actual | Ya mitigado por label y uncovered; si se quiere precisión, preguntar años de residencia en España |
| sin-reconocimiento-previo | bajo | El F para «en trámite»/«reconocida» es coherente con «reconocimiento inicial», pero el slug sugiere todas las prestaciones del SAAD | Matizar el label/título del programa hacia «reconocimiento de la dependencia» o señalar que para ya reconocidos procede el PIA (ya lo hace en parte) |
