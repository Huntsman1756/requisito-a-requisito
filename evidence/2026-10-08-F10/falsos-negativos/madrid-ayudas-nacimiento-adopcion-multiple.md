# madrid-ayudas-nacimiento-adopcion-multiple

## Análisis

Reglas evaluadas (`data/eligibility/rules/madrid-ayudas-nacimiento-adopcion-multiple.json`, Acuerdo de 27/12/2023):

- `empadronado-madrid` (hard): `territory within ccaa 13`. Art. 6.b: «Estar empadronado en la Comunidad de Madrid». Coincidencia literal, sin excepciones en la norma. Correcto.
- `dos-o-mas-personas-cargo` (**hard**): `dependents count_where_gte count=2`. **La condición no mide lo que exige la norma.** Art. 5.1: «los progenitores que **hayan tenido dos o más hijos de nacimiento o adopción múltiple**, nacidos o adoptados a partir del 1 de enero de 2024». Lo que la norma pide es un hecho (parto/adopción simultánea de ≥2), no «tener 2 personas a cargo». Consecuencias:
  - **Falso positivo** (fuera de alcance, pero relevante): dos hermanos de distinta edad dan `count≥2` → T aunque no hubo nacimiento múltiple.
  - **Falso negativo posible**: el campo `dependents` se pregunta como «¿Cuántas personas tienes a tu cargo?» («Hijas, hijos u otras personas que dependan de ti»). Un progenitor de gemelos recién nacidos que **no ostente la custodia** (el otro progenitor sí), o que interprete «a tu cargo» como carga económica previa al nacimiento, declararía 0–1 dependientes → **F indebido** en requisito hard → veredicto «no cumple» a quien el art. 5.1 sí admite («los progenitores que hayan tenido…», sin exigir custodia; la única incompatibilidad es que no lo solicite también el otro progenitor y las exclusiones de patria potestad/desamparo del art. 5.2).
  - El label «Tener al menos dos hijas o hijos a cargo» no es honesto del todo: omite «múltiple» y «nacidos/adoptados a partir del 1/1/2024», aunque ambos matices sí figuran en `uncoveredRequirements` (`parto-adopcion-multiple`, `nacidos-desde-2024`). La cita literal en la cita («dos o más hijos de nacimiento o adopción múltiple») sí es correcta.
- `ingresos-referencia` (**hard: false**): `incomeAnnual lt 30000`. La norma (art. 6.c) exige **renta per cápita** < 30.000 €: «La renta per cápita de la unidad familiar no podrá ser igual o superior al límite de 30.000 euros». El requisito se aplica a los ingresos **individuales** del respondente — discrepancia declarada en `uncoveredRequirements` (`renta-per-capita`). Además `incomeAnnual` es bandado: la banda 25.200+ cruza 30.000 → U, no F; las demás bandas dan T. En la práctica nunca produce F. Bajo.
- Borde inclusivo/exclusivo: «no podrá ser igual o superior a 30.000» → debe ser estrictamente menor → `lt` correcto.
- `uncoveredRequirements` honesto en general: fecha ≥1/1/2024, plazo 60 días (art. 12.1), nacionalidad/residencia legal (art. 6.a), prohibiciones LGS, patria potestad (art. 5.2). **Laguna**: el art. 5.3 excluye expresamente «los supuestos en los que la filiación de los menores se establezca por reconocimiento registral» — no aparece ni como requisito ni en `uncoveredRequirements` (matiz de honestidad, dirección restrictiva).
- Fecha de referencia `application`: art. 6 exige los requisitos «en el momento de la presentación de la solicitud» — coherente.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| dos-o-mas-personas-cargo | alto | «los progenitores que hayan tenido dos o más hijos de nacimiento o adopción múltiple» (art. 5.1) — el proxy «≥2 dependientes a cargo» puede dar F a un progenitor beneficiario sin custodia/declaración de los menores a su cargo, y el label omite «múltiple» | Cambiar label a «haber tenido ≥2 hijos en un mismo nacimiento o adopción simultánea a partir de 2024» y, si el cuestionario lo permite, preguntar por el hecho («nacimiento/adopción múltiple reciente») en lugar de `dependents`; si no, degradar a soft + uncovered |
| empadronado-madrid | ninguno | «Estar empadronado en la Comunidad de Madrid» (art. 6.b) | — |
| ingresos-referencia | bajo | «La renta per cápita de la unidad familiar no podrá ser igual o superior al límite de 30.000 euros» (art. 6.c) — label dice «ingresos anuales» sin per cápita; soft y bandas → en la práctica solo T/U | Precisar en el label «renta per cápita de la unidad familiar» |
| (uncovered) exclusión art. 5.3 | bajo | «Quedan expresamente excluidos… los supuestos en los que la filiación de los menores se establezca por reconocimiento registral» — no declarada | Añadir a `uncoveredRequirements` |
