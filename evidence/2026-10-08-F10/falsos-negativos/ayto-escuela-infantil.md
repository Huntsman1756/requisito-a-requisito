# ayto-escuela-infantil

## Análisis

La convocatoria EIM 2026/2027 define el destinatario **por año de nacimiento**,
no por edad (bases, apdo. 2.1):

> «(nacidos en 2024, 2025 y 2026 o de 2023 que precisen continuar en el primer
> ciclo de educación infantil por causas acreditadas)»
> «los menores cuyo nacimiento se prevea para fecha anterior al 1 de enero de
> 2027, cuando así conste en informe médico emitido al efecto»

El requisito `hijo-primer-ciclo` (hard) se evalúa como
`count_where_gte dependents where age lt 3`, es decir, por la **edad cumplida a
`today`**, no por el año de nacimiento. Tres vectores de falso negativo:

1. **Nacidos en 2023 con permanencia acreditada.** A fecha de evaluación
   (octubre 2026) los nacidos enero–octubre de 2023 tienen 3 años cumplidos →
   `F` → `no_cumple`, aunque la norma los admite («o de 2023 que precisen
   continuar… por causas acreditadas»). El label y el uncovered
   `borde-nacidos-2023` lo declaran, pero el veredicto sigue siendo F.
   (Los nacidos oct–dic 2023 pasan con `T` aunque necesiten la misma
   permanencia: falso positivo, dirección segura.)
2. **Nacidos en 2024 que cumplen 3 dentro de la ventana.** El proceso
   extraordinario está abierto hasta el **30/05/2027** («La admisión de
   solicitudes… en el proceso extraordinario… finalizará el 30 de mayo de
   2027», apdo. 15.3). Un niño nacido en, p. ej., marzo de 2024 es «nacido en
   2024» y entra en la norma durante toda la ventana, pero a partir de marzo de
   2027 tiene 3 años → `F` → `no_cumple`. Es un falso negativo **sistemático y
   creciente**: entre enero y mayo de 2027 lo sufren progresivamente todos los
   nacidos enero–mayo de 2024 (la cohorte mayor de la convocatoria).
3. **Menores no nacidos con FPP < 01/01/2027.** La norma los admite con informe
   médico, pero no caben en `dependents` (solo recoge personas nacidas): una
   usuaria embarazada sin otros hijos obtiene `F` → `no_cumple`. Declarado en
   label y en `nacimiento-previsto-2027`, pero el veredicto es F.

El otro requisito, `residir-madrid`, ya es `hard: false` (corregido en la ronda
F10-REG por «prevean residir»: verificado OK en esta revisión — no puede dar FN).

`uncoveredRequirements` es honesto y completo: excepciones de residencia
(hermano escolarizado, art. 72 XII Convenio), adopción/acogimiento en trámite,
incorporación a las 16 semanas, proceso extraordinario sin baremo, vía NEE,
cuotas con aviso de que la instrucción citada es la de 2024/2025 y puede variar.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| hijo-primer-ciclo (hard) | alto | «nacidos en 2024, 2025 y 2026 o de 2023 que precisen continuar en el primer ciclo… por causas acreditadas» + «nacimiento… anterior al 1 de enero de 2027» (apdo. 2.1) | modelar por año de nacimiento (añadir `birthYear` al dependiente o una pregunta específica); alternativa mínima: `age lt 4` + label que cubra nacidos-2023 y no nacidos (asume un pequeño falso positivo de nacidos fin-2022 en vez del FN sistemático) |
| residir-madrid (soft) | ninguno | — | — |
