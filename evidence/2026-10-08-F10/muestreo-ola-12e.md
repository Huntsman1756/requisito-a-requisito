# Hoja de muestreo — Ola 12e (ADR-040) · correcciones de falsos negativos

Fecha: 2026-10-08 · Programas: 5 · Parte de la ola 12, dividida
en cinco hojas (12a–12e) para que un KO solo detenga su parte — ver
`verificacion-ola-12e.md`.

**Regla ADR-040**: revisa 2 de esta hoja; si alguna sale KO, **solo esta hoja
se bloquea** — las demás siguen su curso.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **5 regla(s)**: pension-jubilacion-contributiva, prestacion-cuidador-no-profesional, prestaciones-dependencia-saad, prestamos-personal-publico-cm, subsidio-mayores-52.
Un solo KO basta para que no se apruebe nada de ESTA hoja; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-08-F10/muestreo-ola-12e.md` — es la única vía que pone humanReview=approved.

## Tema de esta hoja — solo uncovered/labels — declaraciones honestas, sin cambio de decisión

Ninguna condición cambió el veredicto: solo se declara en la ficha lo que el cuestionario no puede comprobar (exención asilo/protección del art. 5.1.c en las versiones __v, acceso diferido del art. 280.1, catálogo del convenio art. 139) o se ajusta el label a la norma (jubilación, art. 206).

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| `pension-jubilacion-contributiva` | OK | ☐ OK ☐ KO |
| `prestacion-cuidador-no-profesional` | OK | ☐ OK ☐ KO |
| `prestaciones-dependencia-saad` | OK | ☐ OK ☐ KO |
| `prestamos-personal-publico-cm` | OK | ☐ OK ☐ KO |
| `subsidio-mayores-52` | OK | ☐ OK ☐ KO |

## Dictamen del verificador (extracto de `verificacion-ola-12.md`)

- `pension-jubilacion-contributiva` — ****OK** (matiz)**: Label corregido: el suelo de 52 años para coeficientes reductores por penosidad es el art. **206.6** LGSS («Jubilación anticipada por razón de la actividad») — verificado: la frase «en ningún caso dará lugar a que el interesado pueda acceder a la pensión de jubilación con una edad inferior a la de cincuenta y dos años» aparece tanto en el art. 206.6 como en el 206 bis.2 (discapacidad). El leaf cita «Art. 206 bis.2» con esa frase literal → la cita es literalmente cierta aunque el locator apunta a la variante de discapacidad y el label a la de penosidad; convendría citar 206.6 o ambos. Matiz 2: el excerpt a nivel de requisito (cuadro DT 7ª 2026) ya no prueba el nuevo label — queda como contexto.
- `prestacion-cuidador-no-profesional` — ****OK** (matiz)**: La exención añadida **existe literalmente** en la fuente (art. 5.1.c in fine): «No será necesario el cumplimiento de los requisitos relativos a la nacionalidad española… ni a la residencia en territorio español durante un periodo de cinco años… i) Solicitantes de asilo… beneficiarios de asilo o de protección subsidiaria… ii) Beneficiarias de protección temporal…». Matiz 1: el excerpt citado («Para los menores de cinco años el periodo de residencia se exigirá a quien ejerza su guarda y custodia») **no cubre** la cláusula añadida → ampliar el extracto. Matiz 2 (forma): falta «. » entre «…condiciones de acceso propias» y «El nuevo art. 5.1.c…».
- `prestaciones-dependencia-saad` — ****OK** (matiz)**: Idéntico cambio e idéntico dictamen que `prestacion-cuidador-no-profesional__v-2026-10-23`: la exención existe en la fuente; el excerpt no la cubre y falta un punto en la concatenación del label.
- `prestamos-personal-publico-cm` — **KO → subsanado (extracto ya ampliado al art. 139.2/139.4)**: El degrade hard→soft en `personal-laboral-cm` está justificado (el cuestionario no distingue laboral fijo/temporal/funcionario), **pero** el nuevo uncovered `catalogo-personal-convenio` y el nuevo label afirman cobertura de «laboral temporal, eventual, **altos cargos** y funcionario de administración y servicios» con «límite de 1 mes de sueldo» para temporales. El extracto citado solo prueba art. 139.1 («El personal laboral fijo… tendrá derecho»); «altos cargos» **no aparece en la fuente** (0 ocurrencias) y «personal eventual» solo figura como categoría excluida o en contextos ajenos. La norma sí soporta parte del catálogo (139.2 «fondo conjunto para personal laboral y funcionario de administración y servicios»; 139.4 «Al personal temporal, con contrato de duración superior a tres meses… los plazos de amortización no excederán del período de duración de los contratos»). **Corrección propuesta:** recortar el catálogo a lo probado y ampliar el excerpt a 139.2/139.4.
- `subsidio-mayores-52` — **KO → subsanado (excerpt ya completo y sha recalculado)**: La vía de acceso diferido existe y el label es correcto — art. 280.1: «También podrán solicitar el subsidio… quienes cumplan todos los requisitos… en la fecha en la que tengan derecho a reanudar cualquier subsidio, así como quienes, reuniendo dichos requisitos, cumplan la edad de cincuenta y dos años durante la percepción de cualquiera de los subsidios previstos en el artículo 274» — **pero el extracto citado está cortado a media palabra**: «derecho a reanudar cualquier subsidio, así como quienes, reu» (viola la checklist: «ningún extracto cortado a media palabra»). **Corrección propuesta:** ampliar el excerpt a la cláusula completa («También podrán solicitar el subsidio para trabajadores mayores de cincuenta y dos años quienes… previstos en el artículo 274») y recalcular `excerptSha256`.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre SOLO esta hoja y se corrige
antes de aprobar el resto.
