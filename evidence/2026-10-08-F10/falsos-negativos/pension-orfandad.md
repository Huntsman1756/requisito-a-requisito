# pension-orfandad

## Análisis

1. El único requisito evaluado, `edad-en-fallecimiento`, es **hard:false** → no produce F bloqueante. Su `any` cubre los dos encuadres posibles del beneficiario: el propio huérfano (`age < 25` o `disability ≠ no`) o un padre/madre que declara dependientes (`count ≥ 1` con `age < 25` o `disability = yes`). Borde correcto: `lt 25` ↔ «menor de veinticinco años» (art. 224.3); la vía general es menor de 21 o incapacitado («siempre que, en el momento de la muerte, sean menores de veintiún años o estén incapacitados para el trabajo», art. 224.1) y el tramo 21–24 exige no trabajar o ingresos < SMI — declarado en `tramo-21-25-trabajo-ingresos` con extracto literal presente. La regla es permisiva (21–24 que trabajan cobrando < SMI computan igual; la prórroga si cumple 25 en curso escolar «se mantendrá hasta el día primero del mes inmediatamente posterior al de inicio del siguiente al curso académico» está en la fuente y se menciona en el label) → cualquier desviación es hacia T, no hacia F.

2. `disability neq "no"` incluye `unknown`/`declined` → U/T permisivo, correcto contra FN. El enum del dependiente es yes/no — un hijo "incapacitado para el trabajo" sin certificado de discapacidad podría responder no → soft F posible, matiz ya mitigado por la triple vía del `any`.

3. Requisitos determinantes correctamente no comprobados: filiación, alta/cotización del causante («quien se encontrase en alta o situación asimilada ... o fuera pensionista», «Será de aplicación ... lo previsto en el segundo párrafo del artículo 219.1»), quién solicita si es menor, la prestación por violencia contra la mujer («La cuantía de esta prestación será el 70 por ciento de su base reguladora»), el incremento de orfandad absoluta (+52 % del Decreto 3158/1966 art. 38) y el tope del 100 % de base reguladora — todos con extractos presentes en la fuente.

4. Ambigüedad de encuadre (el cuestionario no distingue «eres el huérfano» de «eres el progenitor superviviente preguntando por tus hijos»): el `any` lo resuelve de forma permisiva → no genera FN, solo menor precisión.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| edad-en-fallecimiento | bajo | «serán menores de veintiún años o estén incapacitados para el trabajo» (art. 224.1) / «menor de veinticinco años ... ingresos ... inferiores ... al salario mínimo interprofesional» (art. 224.3) | Ninguna acción necesaria: soft y permisivo en todas sus vías; si se quiere más precisión, separar los dos encuadres (huérfano vs progenitor declarante) |
| — (resto) | ninguno | — | uncoveredRequirements completo y honesto |
