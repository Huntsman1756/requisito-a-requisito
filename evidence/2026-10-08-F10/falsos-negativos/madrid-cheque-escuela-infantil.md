# madrid-cheque-escuela-infantil

## Análisis

1. `hijo-menor-3` (hard:true) exige un dependiente con `age < 3`. La norma admite expresamente una excepción que la regla convierte en F: la convocatoria 2026-2027 dice literalmente «Excepcionalmente, también serán destinatarios de estas ayudas los niños mayores de tres años que deban permanecer escolarizados un año más en el primer ciclo de Educación Infantil por razón de sus necesidades educativas especiales acreditadas por el correspondiente informe del Equipo de Atención Temprana» (bocm-20260518-39-infantil-2026-2027, Extracto, Segundo). Un menor de 3-5 años con NEE repetidor de primer ciclo obtiene F en el único requisito hard aunque la norma lo admite → falso negativo. Está declarado en `uncoveredRequirements.mayores-3-nee`, pero el veredicto hard sigue siendo F (el aviso no lo rescata).

2. El mismo requisito da F a los hijos aún no nacidos: las bases exigen «Haber nacido o estar previsto el nacimiento con anterioridad a la fecha que se determine en cada orden de convocatoria» (bocm-20250331-39-bases-infantil, art. 4.1.a) y la sede concreta «nacido o estar previsto su nacimiento antes de 1 de enero de 2027». Una embarazada que solicita en junio de 2026 cumple la norma pero el cuestionario solo cuenta hijos nacidos (`dependents`) → F. Declarado en `uncoveredRequirements.nacido-antes-2027`, pero sigue produciendo F.

3. Borde de edad: «menores de tres años» ↔ `lt 3` es correcto (un niño de 3 años cumplidos no es "menor de tres"). La fecha de referencia real es la matrícula en primer ciclo (nacido antes del 1/1/2027), no la edad a fecha de solicitud; para nacidos en 2024-2026 ambas coinciden, salvo la excepción NEE ya citada.

4. `renta-limite` (hard:false) compara `incomeAnnual` (ingresos de toda la unidad, en bandas de 8.400 €) con 35.913 €, pero el límite legal es de renta **per cápita**: «los ingresos de la unidad familiar, tal y como se define en el artículo 5 anterior, divididos [entre el número de miembros computables]» (art. 6.1) y «la renta per cápita familiar no podrá superar el límite de 35.913 euros» (extracto). Es más estricto de lo que la norma pide (compara total vs. per cápita), pero al ser soft y con bandas anchas el resultado práctico es T o U, no F (ninguna banda queda entera por encima de 35.913 salvo la abierta, que da U). El label y `renta-per-capita-calculo` lo declaran honestamente.

5. Honestidad: el label del requisito hard lleva el «⚠» y `uncoveredRequirements` declara la excepción NEE, los no nacidos, el cómputo per cápita, la concurrencia competitiva y el mantenimiento de requisitos durante el curso. Honesto, aunque insuficiente: los dos primeros son excepciones a un requisito hard.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| hijo-menor-3 (excepción NEE) | alto | «también serán destinatarios de estas ayudas los niños mayores de tres años que deban permanecer escolarizados un año más en el primer ciclo» (Extracto, Segundo) | Añadir vía `any` al requisito: dependiente <3 **o** dependiente con discapacidad `yes`/`unknown` (proxy NEE, marcado como tal); nunca F por edad ≥3 |
| hijo-menor-3 (hijo no nacido) | alto | «Haber nacido o estar previsto el nacimiento con anterioridad a la fecha que se determine en cada orden de convocatoria» (bases, art. 4.1.a) | Tratar el requisito como U cuando el usuario declare embarazo en curso; si el cuestionario no lo recoge, degradar el requisito a soft o reformularlo como «primer ciclo» |
| renta-limite | bajo | «la renta per cápita familiar no podrá superar el límite de 35.913 euros» (extracto, pág. 4) | Comparar ingresos ÷ miembros computables (con x2 por discapacidad ≥33 %/VG); hoy es solo orientativo y ya está declarado |
| — (labels/uncovered) | bajo | — | Correctos y honestos; el problema es solo que las excepciones no alcanzan al veredicto hard |
