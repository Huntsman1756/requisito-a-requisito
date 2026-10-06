# Hoja de autor — ola-7-escuela-infantil (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `verification.status = ok` +
`humanReview.status` según proceda.

## ayto-escuela-infantil (rulesVersion 1, verificado 2026-10-06)

Programa: **Escuelas Infantiles Municipales del Ayuntamiento de Madrid** —
admisión de alumnado de primer ciclo (0–3 años) en la red municipal
(~76 escuelas). **Nivel administrativo: municipal** (no confundir con las becas
de la CM de la ola 1 ni con la red de la CM). `standalone: true` — sin ficha en
`data/catalog/benefits/`; acreditado con fuentes de rango 1 (BOAM) (G2).

**Normativa:**
- Ordenanza Reguladora del Servicio de Escuelas Infantiles del Ayuntamiento de
  Madrid, de 26/10/2016 (BOAM nº 7783, 14/11/2016), modificada por Acuerdo del
  Pleno de 27/03/2019 (BOAM nº 8375, 09/04/2019).
- Convocatoria anual: Resolución de 13/03/2026 del Director General de
  Educación, Juventud y Voluntariado (BOAM nº 10092/1031, 24/03/2026),
  curso 2026/2027.
- Cuotas: instrucción anual por resolución (art. 11.1 Ordenanza). La última
  localizada es la de 2024/2025 (Resolución de 20/08/2024, BOAM nº 9711/2947,
  06/09/2024). No se ha encontrado la instrucción de 2026/2027 publicada.

**Vigencia (ADR-045):** SÍ admite solicitudes nuevas hoy (06/10/2026). El plazo
ordinario cerró el 17/04/2026, pero las bases (apdo. 15.3) abren un **proceso
extraordinario** sin convocatoria previa: solicitud individual en cada escuela
(o Registro electrónico), por riguroso orden de entrega, sin baremo, hasta el
**30/05/2027**. Solo se llaman solicitudes extraordinarias cuando quedan
vacantes tras agotar la lista de no admitidos. Ventana modelada:
`closesAt 2027-05-30`, `recurrence: annual`, `previousCalls` con los tres
plazos ordinarios citados (2024: 03–16/04; 2025: 12–26/03; 2026: 06–17/04) ⇒
a 06/10/2026 el motor da **OPEN** (236 días), y tras el cierre degradaría a
CLOSED_RECURRING, no CLOSED.

**Registry:** añadido `sede.madrid.es` con `maxRank: 1` — aloja el BOAM
(Boletín Oficial del Ayuntamiento de Madrid), que es el diario oficial
municipal (rango 1 según docs/08 §1). Las fichas de trámite de la sede siguen
declarándose rango 3 (`sede-ayto-admision-eim-2627`). El wildcard `.madrid.es`
queda en rango 4.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: El menor debe residir en el municipio de Madrid (o prever residir antes del inicio del curso; hay excepciones para no residentes — ver ⚠) | territory within municipality 28079 | «los menores residentes en el municipio de Madrid o que prevean residir con anterioridad a la fecha de inicio del curso escolar» | Bases, apdo. 2.1.a | BOAM nº 10092/1031 (anexo BASES) |
| **OBLIGATORIO**: Tener a cargo una niña o niño en edad de primer ciclo de Educación Infantil (nacidos en 2024, 2025 o 2026; los de 2023 solo con permanencia acreditada, y los «no nacidos» con parto previsto antes del 01/01/2027 — ver ⚠) | personas a cargo count_where_gte ≥1 con edad lt 3 | «(nacidos en 2024, 2025 y 2026 o de 2023 que precisen continuar en el primer ciclo de educación infantil por causas acreditadas)» | Bases, apdo. 2.1 | BOAM nº 10092/1031 (anexo BASES) |

**No comprobables con nuestras preguntas (⚠):**

- **«No nacidos» con parto previsto antes del 01/01/2027** (informe médico) — el
  cuestionario solo recoge hijos ya nacidos (apdo. 2.1.b).
- **Borde nacidos oct–dic 2023**: hoy tienen 2 años (< 3 ⇒ nuestra condición da
  T) pero la convocatoria exige nacido en 2024+ salvo permanencia acreditada;
  queda documentado para no vender seguridad falsa (apdo. 2.1).
- **Excepciones de residencia** (apdo. 2.1.d–e): hermano/a escolarizado en la
  red municipal en 2026/2027 (solo para esas escuelas) y mejora social de
  gratuidad del art. 72 del XII Convenio Colectivo.
- **Adopción/acogimiento en trámite** (apdo. 2.1.c): plaza condicionada a la
  filiación en la matrícula.
- **Incorporación a partir de las 16 semanas** para nacidos en 2026 (apdo. 2.2).
- **Proceso extraordinario**: orden de entrega, sin baremo, solo si hay
  vacantes tras la lista de no admitidos (apdos. 15.1.b, 15.3).
- **Baremo del proceso ordinario** (apdo. 13): situación laboral, renta per
  cápita (IRPF 2024), hermanos, proximidad, familia numerosa/monoparental,
  discapacidad, parto múltiple, acogimiento — puntúa prioridad, no es puerta de
  elegibilidad.
- **Solicitud única** con máximo 4 escuelas en orden de preferencia (apdo.
  21.1); más de una solicitud puede excluir.
- **Cuotas** (instrucción anual; última localizada 2024/2025): escolaridad
  gratuita; comedor 96 €/mes salvo exención/reducción; horario ampliado
  voluntario 12 €/mes por tramo de media hora; FN especial exenta de horario
  ampliado, FN general −50 %; reducción del 100 % en supuestos de
  vulnerabilidad. **La renta no escala el precio**: desde 2019/2020 la
  escolaridad es gratuita para todas las rentas.
- **Vía NEE**: capítulo III con reserva de plazas, baremo y calendario propios.

- **Plazo**: extraordinario abierto ⇒ 2027-05-30 (bases 15.3.d); ordinario
  2026-04-06 → 2026-04-17 cerrado.
- **Canal**: Ayuntamiento de Madrid — DG de Educación, Juventud y Voluntariado —
  sede electrónica + Registro + presencial en la escuela de primera opción.
- **Importe**: fixed 0 €/mes (escolaridad gratuita; «contempla la gratuidad de
  la cuota de escolaridad para el curso 2019/2020 y sucesivos», exposición de
  motivos de la Resolución).
- **Doc**: impreso de solicitud (obligatorio); Anexo I (obligatorio);
  filiación del menor (obligatoria, consultable de oficio); documentación de la
  unidad familiar (para baremo/renta); informe médico FPP (solo no nacidos).

OK / KO por requisito: ☐ ☐

### Notas para el verificador

- **Corrección de la consigna**: la consigna describía «precios públicos
  escalados por renta/familia numerosa». Ese era el modelo anterior a 2019;
  desde el curso 2019/2020 la cuota de escolaridad es **gratuita** (BOAM 8375,
  09/04/2019, y confirmado en la exposición de motivos de la convocatoria
  2026/27). Lo que queda escalado/bonificado es el horario ampliado (FN) y las
  exenciones por vulnerabilidad. La renta per cápita solo puntúa en el baremo
  de admisión ordinaria, no en la cuota ni como puerta de elegibilidad.
- **`hard` sobre edad del menor**: `dependents` admite `count_where_gte` con
  `where.age lt 3` — el cuestionario sí mide edad de las personas a cargo, así
  que va hard (mismo patrón que `madrid-cheque-escuela-infantil`). El borde
  oct–dic 2023 queda en ⚠.
- **Residencia hard** con el matiz «o prevean residir»: una familia de otro
  municipio que ya sepa que se muda a Madrid antes del curso sale aquí como
  `no_cumple`; se acepta porque el grueso del flujo es residencia actual y la
  excepción queda explicada en ⚠. Si el verificador prefiere `soft`, es un
  cambio de una línea.
- **Errata detectada en madrid.es**: la página «Preguntas frecuentes admisión
  2026-2027» cita «Resolución de 27 de febrero de 2025»; la resolución real del
  curso 2026/27 es la de **13 de marzo de 2026** (BOAM 10092/1031, 24/03/2026).
  No citada (rango 4); se anota por si conviene avisar.
- **Snapshots**: BOAM ítem (HTML de la resolución, con cuerpo completo) +
  anexos BASES e INSTRUCCIONES en PDF de `sede.madrid.es` + bases de los dos
  cursos anteriores para `previousCalls` + ficha del trámite (rango 3) +
  anexo de la instrucción de cuotas 2024/25. Bytes en
  `F:\AgentState\datawardsmadrid\snapshots\`.
- **Validación**: `npx tsx scripts/eligibility-validate.ts` → 36 rulesets,
  0 errores, 36 avisos (todos G10 `humanReview pending`, igual que el resto de
  olas). Golden evaluado con el motor: `posible` + `OPEN` (cierra
  2027-05-30, 236 días).
- Golden asociado: `gp-escuela-infantil-madrid` — verdict esperado `posible`,
  deadlineState `OPEN` a 2026-10-06.
