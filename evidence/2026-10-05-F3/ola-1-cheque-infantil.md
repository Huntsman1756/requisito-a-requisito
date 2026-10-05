# Hoja de revisión — ola-1-cheque-infantil (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-cheque-escuela-infantil (rulesVersion 1, verificado 2026-10-05)

Nombre oficial del programa: *becas para la escolarización en el primer ciclo de
Educación Infantil en centros de titularidad privada* (el «cheque guardería /
cheque escuela infantil»). Convocatoria vigente más reciente: curso **2026-2027**
(Orden 1644/2026, de 27 de abril; extracto BOCM nº 116 de 18/05/2026; BDNS
902503). Bases reguladoras: Orden 763/2025, de 18 de marzo (BOCM nº 76,
31/03/2025). `standalone: true` — no existe ficha en `data/catalog/benefits/`
(la ayuda está en `data/universe` como lead `bdns-902503` y seed «Cheque de
escuela infantil»); se acredita con dos fuentes de rango 1 propias (G2).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener un hijo o hija menor de 3 años (el primer ciclo es de 0 a 3 años; la convocatoria 2026-2027 exige nacido o previsto antes del 1 de enero de 2027 — ver ⚠) | personas a cargo count_where_gte ≥1 con edad lt 3 | «Niños menores de tres años matriculados en centros de titularidad privada autorizados» | Extracto, Segundo (Beneficiarios) | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/05/18/BOCM-20260518-39.PDF |
| aviso: Ingresos anuales de la unidad familiar por debajo de 35.913 € (el límite real es de renta PER CÁPITA — ver ⚠) | ingresos anuales lt 35913 | «No superar el límite de renta per cápita familiar de 35.913 euros.» | Apartado «Requisitos», punto 3 | https://sede.comunidad.madrid/ayudas-becas-subvenciones/becas-educacion-infantil-2026-2027 |

**No comprobables con nuestras preguntas (⚠):**

- **Estar matriculado o tener reserva de plaza para el curso 2026-2027 en un centro de titularidad privada autorizado por la Administración educativa para el primer ciclo, sin ocupar plaza sostenida con fondos públicos** — «en un centro de titularidad privada autorizado por la Administración educativa para impartir dicho ciclo, siempre que no ocupe plaza sostenida con fondos públicos.» (Art. 4.1.b)
- **El menor debe haber nacido —o estar previsto que nazca— antes del 1 de enero de 2027; nuestra pregunta solo recoge hijos ya nacidos, no embarazos en curso** — «Haber nacido o estar previsto su nacimiento antes de 1 de enero de 2027.» (Apartado «Requisitos», punto 1)
- **El límite de 35.913 € se aplica a la renta PER CÁPITA: ingresos de la unidad familiar ÷ miembros computables (quien tenga discapacidad ≥33 % o sea víctima de violencia de género computa por dos); la renta consultada es el IRPF 2024** — «los ingresos de la unidad familiar, tal y como se define en el artículo 5 anterior, divididos» (Art. 6.1)
- **También son destinatarios los mayores de 3 años que repitan primer ciclo por necesidades educativas especiales acreditadas por el Equipo de Atención Temprana** — «los niños mayores de tres años que deban permanecer escolarizados un año más en el primer ciclo de Educación» (Extracto, Segundo (Beneficiarios))
- **Los requisitos deben reunirse al cierre del plazo de solicitud y mantenerse durante todo el curso escolar** — «Estos requisitos deberán mantenerse a lo largo de todo el curso» (Art. 4.1)
- **Concesión por concurrencia competitiva: si no hay crédito para todas, se ordena por puntuación (ingresos, composición familiar y situación laboral de los progenitores), así que cumplir los requisitos no garantiza la beca** — «Las becas se concederán en régimen de concurrencia competitiva.» (Art. 2.2)
- **La solicitud la firma al menos un progenitor/tutor/acogedor, pero todos los mayores de 18 de la unidad familiar deben firmar la autorización de consulta de datos (AEAT, TGSS, padrón…)** — «La solicitud deberá ser firmada al menos por uno de los progenitores» (Art. 7.2)
- **La beca nunca supera el coste del servicio de escolarización ni, sumada a otras ayudas para la misma finalidad, la cuota del centro** — «en ningún caso la cuantía de la beca superará el coste del servicio de escolarización.» (Art. 16.5)

- **Plazo**: 2026-05-19 → 2026-06-08 (15 días hábiles desde el día siguiente al extracto BOCM del 18/05/2026; businessDays; recurrence annual; CLOSED_RECURRING con dos convocatorias anuales anteriores citadas: 2024-04-30→2024-05-23, Orden conjunta 1945/2024, BOCM nº 101, y 2025-06-04→2025-06-24, Orden 1980/2025, BOCM nº 131)
- **Canal**: Comunidad de Madrid — Consejería de Educación, Ciencia y Universidades — https://sede.comunidad.madrid/ayudas-becas-subvenciones/becas-educacion-infantil-2026-2027 (online + presencial)
- **Importe**: range 177–283 € monthly («de 177 euros mensuales hasta un límite máximo de 283 euros mensuales.», Art. 16.4; los 283 € exigen 5 puntos en el criterio de ingresos)
- **Doc**: Certificado de nacimiento del Registro Civil, Libro de Familia o documento oficial equivalente de los menores de la unidad familiar (obligatorio)
- **Doc**: Certificado médico de la fecha probable del parto (obligatorio si el hijo aún no ha nacido)
- **Doc**: Pasaporte (solo personas extranjeras sin NIE; el DNI/NIE se consulta de oficio salvo oposición)
- **Doc**: Certificado o volante de empadronamiento colectivo expedido por otra Comunidad Autónoma (familias monoparentales u otros miembros familiares empadronados fuera de la CM)
- **Doc**: Dictamen de un Equipo de Orientación Educativa y Psicopedagógica de Atención Temprana (solo si el menor tiene más de 3 años o necesidades educativas especiales)
- **Doc**: Certificado de renta de la AEAT del ejercicio 2024 (solo si no autorizas la consulta de datos tributarios)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

### Notas para el verificador

- **Sin requisito de residencia/empadronamiento en la CM**: verificado en el
  art. 4.1 de la Orden 763/2025 — los únicos requisitos son nacimiento antes de
  la fecha fijada, matrícula/reserva en centro privado autorizado y límite de
  renta per cápita. No se ha modelado condición de `territory` a propósito.
- **Sin exigencia de estar al corriente tributario/SS ni prohibiciones del
  art. 13.2 LGS**: el art. 4.2 permite la condición de beneficiario aunque no se
  cumpla el art. 13.2 LGS, y el art. 18.2 exonera de acreditar obligaciones
  tributarias y de Seguridad Social (Orden 2532/1998). Tampoco hay requisito de
  «no estar en excedencia»: la situación laboral solo puntúa en la baremación
  (art. 13.3), no es de elegibilidad.
- **Fechas del plazo derivadas**: la convocatoria fija «15 días hábiles a partir
  del día siguiente al extracto»; opensAt/closesAt se derivan de la fecha de
  publicación (18/05/2026 → 19/05→08/06/2026; 03/06/2025 → 04/06→24/06/2025;
  29/04/2024 → 30/04→23/05/2024). Los cierres 08/06/2026, 24/06/2025 y
  23/05/2024 coinciden con lo comunicado por la CM y recogido en prensa; la cita
  oficial es el extracto BOCM (regla del plazo), no las fechas concretas.
- **`excerptSha256: "FILL"`** en todas las citas, pendiente de cálculo sobre el
  snapshot oficial (varios extractos BOCM cruzan salto de línea del PDF; la
  normalización une con espacio, igual que en `madrid-ayudas-nacimiento-adopcion-multiple`).
- Texto íntegro de la Orden 1644/2026 en BDNS: https://www.infosubvenciones.es/bdnstrans/GE/es/convocatoria/902503 (la ficha BDNS es aplicación JS; el texto usado es el extracto BOCM, que es rango 1).
- Golden asociado: `gp-cheque-madre-torrejon` — verdict esperado `posible`,
  deadlineState `CLOSED_RECURRING` a 2026-10-05.
