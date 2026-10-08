# asignacion-hijo-a-cargo

## Análisis

El único requisito modelado (`causante-con-discapacidad`) es `hard: false`, por
lo que **ningún resultado `F` puede producir el veredicto `no_cumple`**: un
`softF` solo aparece como aviso (docs/07 §4).

La condición es un `any` con dos vías:

1. `count_where_gte dependents` con `disability in ["yes","unknown","declined"]`
   — los valores posibles del campo `disability` de un dependiente son
   exactamente `yes/no/unknown/declined` (`schemas/citizen-profile.schema.json`
   §dependent), así que la lista cubre todo lo que no es «no». Si el usuario
   declara discapacidad desconocida o no la responde, la subcondición da `U` →
   la vía da `U` (no `F`). Un dependiente con `disability: "no"` da `F` en esa
   vía, lo cual es correcto: desde el 1/06/2020 la asignación solo vive por
   discapacidad («no podrán presentarse nuevas solicitudes de la asignación
   económica por hijo o menor a cargo sin discapacidad o con discapacidad
   inferior al 33 por ciento», DT 6.ª Ley 19/2021).
2. Rama propia: `age gte 18` ∧ `disability eq "gte33"` — vía del art. 352.2.c
   LGSS («Los hijos con discapacidad mayores de dieciocho años respecto de los
   que no se haya establecido ninguna medida de apoyo a su capacidad…»). El
   cuestionario no distingue ≥33 de ≥65, así que la vía es deliberadamente
   permisiva (`gte33`): quien tiene ≥65 también responde `gte33` → `T`.
   Dirección falso positivo, no FN; el matiz de grado queda declarado en
   `uncoveredRequirements` (`grado-discapacidad-baremo`,
   `grado-discapacidad-no-preguntado`).

Notas de honestidad:

- El límite de ingresos (15.356 €/año, RD 241/2026 art. 24.2) está en
  `uncoveredRequirements` con una declaración ejemplar: «para hijos con
  discapacidad las instrucciones del INSS no exigen ese límite, pero nosotros no
  lo podemos comprobar con fuente normativa aquí». No alimenta ninguna
  condición → no puede dar `F`.
- El cierre de la asignación sin discapacidad (DT 6.ª Ley 19/2021) está
  declarado en el label y en uncovered.
- Detalle menor: la vía 1 no mira la edad del dependiente (un dependiente adulto
  con `disability: yes` cuenta como `T` aunque la norma exigiría ≥65 % si tiene
  ≥18 años). Es falso positivo por granularidad del cuestionario, ya declarado
  en label («el grado exacto ≥33 %/≥65 % se comprueba en la ⚠»).

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| — | ninguno | — | — |
