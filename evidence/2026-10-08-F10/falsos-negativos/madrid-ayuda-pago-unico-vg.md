# madrid-ayuda-pago-unico-vg

## Análisis

Reglas evaluadas (`data/eligibility/rules/madrid-ayuda-pago-unico-vg.json`, Orden 2739/2022):

- `residente-cm` (hard): `territory within_territory ccaa 13`. Art. 3.c: «Ser residente en cualquier municipio de la Comunidad de Madrid». Coincide literalmente; la norma no contempla excepciones de residencia. La acreditación es por certificado de empadronamiento (art. 11.1.b) y el cuestionario pregunta justo eso (`q.territory.label`: «¿En qué municipio de la Comunidad de Madrid estás empadronado?»). Correcto.
- `renta-75-smi` (**hard: false**): `incomeAnnual lte SMI_MENSUAL × 9`. SMI 2026 = 1.221 €/mes (parámetro citado a RD 126/2026) → 75 % = 915,75 €/mes; ×12 = 10.989 €/año, que es exactamente lo que dice el label. La norma compara **renta mensual excluida la parte proporcional de dos pagas extraordinarias** (art. 3.d). La conversión es correcta si el usuario introduce ingresos «mensuales × 12». **Matiz**: si el usuario responde a «¿Cuántos ingresos anuales tienes?» con su bruto anual de 14 pagas (p. ej. 915 €/mes × 14 = 12.810 €), la regla da F blando aunque la norma (915 ≤ 915,75) lo admite. Al ser `hard: false` no produce veredicto de «no cumple», pero atenúa el resultado. Propuesta: usar ×10,5 (915,75×14≈12.820) si `incomeAnnual` se entiende con pagas extra, o aclarar en la ayuda de la pregunta.
- Variante familiar del art. 5.2 («la renta mensual del conjunto de la unidad familiar, dividida por el número de miembros… no superen el 75 por 100 del SMI»): el label la declara honestamente, pero el campo `incomeAnnual` del cuestionario solo recoge ingresos del respondente — una solicitante con renta propia >10.989 € pero per cápita familiar <915,75 € recibiría F blando. No bloquea (soft).
- Lo no verificable está bien declarado en `uncoveredRequirements`: título VG vigente con las 6 vías de acreditación del art. 4 (sentencia, orden de protección, medida cautelar, informe del Ministerio Fiscal, acreditación administrativa art. 23 LO 1/2004, título habilitante art. 31 Ley 5/2005 — la «o» normativa está intacta, no convertida en «y»), no haber sido beneficiaria antes (art. 3.a), informe del SPE de especiales dificultades de empleo (art. 3.e/6) y escalado de cuantías.
- Fecha de referencia: `application`; el art. 3 exige el requisito «tanto en el momento de presentación de la solicitud como al serle concedida» — coherente.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| residente-cm | ninguno | «c) Ser residente en cualquier municipio de la Comunidad de Madrid.» (art. 3.c) | — |
| renta-75-smi | bajo | «Carecer de rentas que, en cómputo mensual, superen el 75 por 100 del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias.» (art. 3.d) — el umbral ×9=10.989 €/año solo es correcto si el usuario declara base mensual×12, no total 14 pagas | Aclarar en `q.income.help` que se pidan ingresos anuales sin pagas extraordinarias, o parametrizar el límite en base 14 pagas; mantener soft |
