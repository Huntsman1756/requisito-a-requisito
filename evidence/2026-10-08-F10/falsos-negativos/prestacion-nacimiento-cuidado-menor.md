# prestacion-nacimiento-cuidado-menor

## Análisis

1. **`menor-a-cargo` (hard)** — `dependents count_where_gte 1 where age lt 18`. La norma protege «el nacimiento, la adopción, la guarda con fines de adopción y el acogimiento familiar» (LGSS art. 177). La condición (tener algún menor <18 a cargo) es **más laxa** que la norma — tener un hijo de 10 años da T aunque no haya nuevo nacimiento —, dirección contraria al falso negativo: no encontré supuesto en que dé F a quien la norma admite. Quien adopta/acoge un menor sigue teniendo un dependiente <18 (los límites de edad en adopción/guarda —menor de 6 o mayor con discapacidad/dificultades, ET 45.1.d— están declarados en `uncoveredRequirements.limites-adopcion-acogimiento`). El consentimiento del otro progenitor y demás supuestos de menores figuran en la documentación S13. Sin riesgo de F indebido.

2. **`persona-trabajadora` (soft)** — `employmentStatus in ["asalariado"]` **o** `eq "autonomo"`. Tres colectivos que la norma también admite y que el campo no cubre:
   - **Funcionarios** (opciones «Empleo público», «Docencia», «Carrera militar» del cuestionario): su permiso existe por EBEP art. 49.a)–c) y lo gestiona la mutualidad. La norma citada lo dice: «y en el artículo 49.a), b) y c) del texto refundido de la Ley del Estatuto Básico del Empleado Público» — está honestamente declarado en `uncoveredRequirements.funcionarios-mutualidad` («este veredicto se refiere al régimen de la Seguridad Social de las personas asalariadas y autónomas»).
   - **Personas en situación asimilada al alta** (p. ej. desempleados cobrando prestación, excedencia por cuidado): la fuente SEGSS dice «las personas trabajadoras por cuenta ajena o propia … siempre que se encuentren en situación de alta o **asimilada al alta**». Quien responda «En desempleo» verá F aunque la norma le cubre; `uncoveredRequirements.afiliacion-y-alta` lo declara («o en situación asimilada a la de alta»). F mostrado, mitigado (soft).
   - Quien no es trabajador pero tiene el **subsidio no contributivo** (RDL 9/2025 lo amplió): `supuesto-especial-no-contributivo` lo declara con cita LGSS arts. 181–182.

3. **Bordes edad/cotización** — Los tramos de cotización por edad (<21 → 0; 21–25 → 90/180; ≥26 → 180/360) quedan en `uncoveredRequirements.cotizacion-minima-edad` con la fecha de referencia correcta («edad … en el momento del parto», art. 178.1.c). No evaluado → sin borde.

4. **Duración** — El label cita 19 semanas del ET art. 48.4 («suspenderá el contrato … durante diecinueve semanas», 32 en monoparentalidad) — verificado literal en el texto consolidado post-RDL 9/2025.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| persona-trabajadora | bajo | SEGSS: «personas trabajadoras por cuenta ajena o propia … en situación de alta o asimilada al alta» — desempleado en prestación u otros asimilados ven F en el requisito (soft; `afiliacion-y-alta` y `funcionarios-mutualidad` ya declaran ambos huecos) | Sin urgencia: la declaración honesta ya existe; opcionalmente ampliar la condición a `employmentStatus in ["asalariado","autonomo","empleado-publico","docente","militar"]` con label que remita a la mutualidad |
| — | ninguno | — | — |
