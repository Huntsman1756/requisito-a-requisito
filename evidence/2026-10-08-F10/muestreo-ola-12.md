# Hoja de muestreo — Ola 12 (ADR-040) · correcciones de falsos negativos

Fecha: 2026-10-08 · Programas: 29 (todas re-autorías de la auditoría de falsos
negativos, `falsos-negativos/resumen.md`) · Verificador independiente:
`verificacion-ola-12.md`.

**Regla ADR-040**: revisa 2 de 5; si alguna sale KO, revisión completa de la
ola. Tras tu OK, las que hayas aprobado pasan a `humanReview.status: approved`.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-08-F10/muestreo-ola-12.md` — es la única vía que pone humanReview=approved.

**Patrón de la corrección** (docs/07 §2.3): si la norma tiene excepciones que
el cuestionario no puede medir, el requisito deja de ser «obligatorio» y pasa a
«aviso» — la ficha lo sigue explicando, pero ya no dice «no cumples» a quien
podría encajar en la excepción. Cuando el cuestionario sí lo puede medir, se
amplió la condición (`in`/`any`) en vez de degradar.

## Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| `anticipos-docentes-cm` | OK | ☐ OK ☐ KO |
| `ayto-emergencia-social` | OK | ☐ OK ☐ KO |
| `ayto-escuela-infantil` | OK | ☐ OK ☐ KO |
| `ayto-ibi-familia-numerosa` | OK | ☐ OK ☐ KO |
| `ayto-tarjeta-azul-discapacidad` | OK | ☐ OK ☐ KO |
| `cm-reintegro-accidentes-trabajo` | OK | ☐ OK ☐ KO |
| `complemento-ayuda-infancia` | OK | ☐ OK ☐ KO |
| `descuento-transporte-familia-numerosa` | OK | ☐ OK ☐ KO |
| `fuenlabrada-prestaciones-sociales` | OK | ☐ OK ☐ KO |
| `imv` | OK | ☐ OK ☐ KO |
| `leganes-prestaciones-especial-necesidad` | OK | ☐ OK ☐ KO |
| `madrid-abono-transporte-65` | OK | ☐ OK ☐ KO |
| `madrid-ayudas-nacimiento-adopcion-multiple` | OK | ☐ OK ☐ KO |
| `madrid-ayudas-urgencia-social` | OK | ☐ OK ☐ KO |
| `madrid-bono-alquiler-joven` | OK | ☐ OK ☐ KO |
| `madrid-cheque-escuela-infantil` | OK | ☐ OK ☐ KO |
| `madrid-renta-minima-insercion` | OK | ☐ OK ☐ KO |
| `madrid-titulo-familia-numerosa` | OK | ☐ OK ☐ KO |
| `mostoles-prestaciones-sociales` | OK | ☐ OK ☐ KO |
| `pension-jubilacion-contributiva` | OK | ☐ OK ☐ KO |
| `prestacion-cuidado-menor-enfermedad-grave` | OK | ☐ OK ☐ KO |
| `prestacion-cuidador-no-profesional` | OK | ☐ OK ☐ KO |
| `prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad` | OK | ☐ OK ☐ KO |
| `prestaciones-dependencia-saad` | OK | ☐ OK ☐ KO |
| `prestamos-personal-publico-cm` | OK | ☐ OK ☐ KO |
| `sermas-ortoprotesica-desplazamiento` | OK | ☐ OK ☐ KO |
| `sermas-reintegro-gastos-sanitarios` | OK | ☐ OK ☐ KO |
| `subsidio-desempleo` | OK | ☐ OK ☐ KO |
| `subsidio-mayores-52` | OK | ☐ OK ☐ KO |

## Qué mirar

- **residencia ≠ padrón** (`complemento-ayuda-infancia`, `imv`,
  `madrid-renta-minima-insercion`): la norma mide residencia en España/CM y
  el cuestionario solo meses de empadronamiento en el municipio actual ⇒ aviso.
- **excepciones no medibles ⇒ aviso**: empadronamiento en urgencias
  (`ayto-emergencia-social`, `fuenlabrada`, `leganes`, `mostoles`,
  `madrid-ayudas-urgencia-social`), menores emancipados, NEE/continuidad en
  infantil (`ayto-escuela-infantil`, `madrid-cheque-escuela-infantil`),
  excepciones de edad en IMV/RMI/título FN, vía pre-contractual del bono
  alquiler joven.
- **colisiones de respuesta ⇒ `in`/`any`**: docente que marca «empleo público»
  (`anticipos-docentes-cm`, `cm-reintegro-accidentes-trabajo`), monoparental
  con título FN (`descuento-transporte-fn`, `ayto-ibi-fn`), laboral público
  (`prestacion-cuidado-menor-enfermedad-grave`), adquiere la condición con el
  nacimiento (`prestacion-nacimiento-adopcion-…`), otras vías de Tarjeta Azul
  (`ayto-tarjeta-azul-discapacidad`, `madrid-abono-transporte-65`).
- **defecto corregido**: `territory eq "cm"` daba F a todo el mundo en las dos
  fichas SERMAS ⇒ `within_territory {ccaa:13}`.
- **umbrales**: Móstoles pasa a IPREM a 14 pagas (8.400 €, lo dice la
  ordenanza); Fuenlabrada a 7.984 € (665,33 × 12).
- **solo texto**: `subsidio-desempleo` (la norma mide el mes anterior),
  `pension-jubilacion-contributiva` (nadie baja de 52, art. 206.6),
  `prestamos-personal-publico-cm` (catálogo de colectivos en uncovered),
  `subsidio-mayores-52` (acceso diferido del art. 280.1), exenciones de asilo y
  protección en las versiones `__v-2026-10-23` de dependencia/cuidador.

Cada afirmación lleva su extracto literal en el informe individual del slug
(`falsos-negativos/<slug>.md`) y en el RuleSet.

## Si algo sale KO

Anota la ayuda y el punto concreto; se re-abre la ola completa y se corrige
antes de aprobar el resto.
