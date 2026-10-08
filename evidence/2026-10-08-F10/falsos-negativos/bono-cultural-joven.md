# bono-cultural-joven

## Análisis

El único requisito hard (`nacido-en-2008`) se evalúa como
`birthYear between [2008, 2008]`, y la norma dice literalmente:

> «Podrán ser beneficiarias las personas jóvenes que cumplan 18 años en 2026 y
> que posean la nacionalidad española o residencia legal en España en el momento
> de presentación de la solicitud.»

Cumplir 18 años en 2026 ≡ haber nacido en 2008: el mapeo es exacto, sin bordes
inclusivos/exclusivos ni fechas de referencia ambiguas (la convocatoria no fija
«a 31/12» ni «a la solicitud»: basta cumplirlos en el año). La norma no tiene
excepciones de edad.

Comportamiento del cuestionario:

- `q.birthYear` solo se muestra si `age ∈ [15,20]` — quien nació en 2008 tiene
  17–18 años en 2026 → siempre ve la pregunta. Un nacido en 2008 que declara
  otro año sería un error del propio usuario.
- Respuestas `unknown`/`declined`/`unasked` → `U` («faltan datos»), nunca `F`
  (el operador solo da F con respuesta `value`, docs/07 §1).
- Una persona nacida en 2007 (18 cumplidos en 2025) recibe `F` — correcto: la
  convocatoria es por año de nacimiento, no por «tener 18 hoy».

`uncoveredRequirements` declara con extracto los requisitos no comprobables
(nacionalidad/residencia/asilo/protección temporal/extutelados — el extracto
confirma «Igualmente, podrán ser beneficiarias aquellas personas que sean
solicitantes de asilo en España; quienes hayan solicitado protección temporal; y
personas extranjeras extuteladas…») y la elección de modalidad incompatible.
Ventana (22/06–31/10/2026), canal exclusivamente electrónico y cuantía 400 €
correctamente citados.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| — | ninguno | — | — |
