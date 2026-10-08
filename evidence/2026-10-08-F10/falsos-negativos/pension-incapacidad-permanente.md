# pension-incapacidad-permanente

## Análisis

1. El único requisito evaluado, `edad-inferior-jubilacion-comunes`, es **hard:false** → no puede producir un F bloqueante. Su condición `age < 67` aproxima «la edad prevista en el artículo 205.1.a)»: la norma dice «No se reconocerá el derecho a las prestaciones de incapacidad permanente derivada de contingencias comunes cuando el beneficiario, en la fecha del hecho causante, tenga la edad prevista en el artículo 205.1.a) y reúna los requisitos para acceder a la pensión de jubilación» (art. 195.1). En 2026 la edad es 66 años y 10 meses (o 65 con 38 años y 3 meses cotizados), no 67: una persona de 66,5 años con cotización suficiente obtiene T aunque la norma ya no admite IP de contingencias comunes para ella → desviación en sentido falso **positivo**, no negativo. Y la cláusula «y reúna los requisitos» admite IP comunes incluso a esa edad si no hay jubilación posible — declarado en `no-jubilacion-comunes`. Matiz sin F.

2. El label dice «(67 años, o 65 con 38 años y 6 meses cotizados)»: son los valores estacionarios de 2027 en adelante; en 2026 la tabla de la DT 7.ª es 66a10m/38a3m. Matiz de texto, ya matizado en el propio label con «o no reunir los requisitos para jubilarte».

3. Todos los requisitos realmente determinantes (alta/asimilada, períodos de cotización según edad y contingencia — incluido «no será exigido ningún período previo de cotización» en AT/EP y la vía sin alta con 15 años para absoluta/gran incapacidad, y la declaración de grado por el INSS) están en `uncoveredRequirements` con cita correcta → honesto; nada se evalúa más estricto que la norma.

4. Fecha de referencia: `referenceDate: application`; la edad relevante es la del hecho causante, que puede diferir de la de solicitud — matiz cubierto por `efectos-hecho-causante`.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| edad-inferior-jubilacion-comunes | bajo | «cuando el beneficiario, en la fecha del hecho causante, tenga la edad prevista en el artículo 205.1.a) y reúna los requisitos para acceder a la pensión de jubilación» (art. 195.1) | Ajustar el umbral a la edad de 2026 (66a10m) o parametrizarlo por año; aclarar que a esa edad la IP comunes solo se excluye si hay jubilación posible — hoy es soft, sin F |
| — (resto) | ninguno | — | Todos los requisitos determinantes correctamente declarados no comprobables |
