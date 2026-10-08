# pension-jubilacion-contributiva

## Análisis

1. `edad-minima-52` (hard:true) exige `age ≥ 52`. El suelo de 52 años es correcto y la propia fuente citada lo confirma: el art. 206.6 LGSS dice «La aplicación de los correspondientes coeficientes reductores de la edad en ningún caso dará lugar a que el interesado pueda acceder a la pensión de jubilación con una edad inferior a la de cincuenta y dos años» — y es un apartado **del propio art. 206** (jubilación anticipada por actividad penosa), no solo del 206 bis (discapacidad, que repite el mismo suelo en su apartado 2). Por tanto **no hay vía por debajo de 52** en el texto consolidado citado → el requisito no da F a nadie que la norma admita. Borde correcto: `gte 52` ↔ «edad inferior a la de cincuenta y dos años».

2. **Pero el label y `uncoveredRequirements.colectivos-penosos` afirman lo contrario**: el label dice «solo colectivos con coeficientes por penosidad (minería y similares) pueden rebajarla aún más» y el uncovered dice «puede quedar por debajo incluso de los 52 años». No hay extracto en las fuentes que lo pruebe y el art. 206.6 de la propia fuente citada lo contradice para los coeficientes reductores. (Posibles vías por debajo de 52 en normas específicas de regímenes especiales — p. ej. minería — no están en el snapshot ni en la cita; si existieran, sería otro argumento para revisar, pero con la evidencia disponible la afirmación es infundada). No produce F — es un sobre-aviso — pero dice algo probablemente falso.

3. El resto está modelado honestamente: la edad exigible real (66a10m/65 con 38a3m en 2026, «A partir del año 2027 ... 67 años») está en `edad-ordinaria-exigible` citando la tabla de la DT 7.ª literalmente; los 15 años/2 de los últimos 15, el alta no exigible («podrá causarse, aunque los interesados no se encuentren ... en alta»), las anticipadas involuntaria (4 años/33 años/6 meses demanda de empleo) y voluntaria (2 años/35 años), discapacidad ≥65 % o ≥45 % tasada, demorada, activa e incompatibilidad con el trabajo están en `uncoveredRequirements` con extractos presentes en la fuente. Ningún requisito evaluado es más estricto que la norma.

4. Fecha de referencia `application`: la edad se evalúa en la fecha de la solicitud/hecho causante — correcto.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| edad-minima-52 | ninguno | «en ningún caso dará lugar a que el interesado pueda acceder a la pensión de jubilación con una edad inferior a la de cincuenta y dos años» (art. 206.6) | — |
| label edad-minima-52 / colectivos-penosos | bajo | El mismo art. 206.6 contradice «puede quedar por debajo incluso de los 52 años»; no hay extracto que pruebe un acceso <52 | Corregir el texto: los coeficientes por penosidad no pueden bajar de 52 (art. 206.6); si se quiere advertir por regímenes especiales con normas propias, citar la norma concreta |
| — (resto de uncovered) | ninguno | — | Completo y con cita literal presente en la fuente |
