# Revisión del trabajo del agente — 08/10/2026

Revisión secuencial del checkout `be56fc2`, antes del muestreo de Daniel.
Las aprobaciones humanas reales siguen pendientes. Se revisaron cola y handoff,
aplicación de hojas, parámetros, procedimiento de QA, cifras, checklist,
memoria y estado de CI/frescura. No es una revisión independiente de reglas.

## Corregido

| Hallazgo | Corrección |
|---|---|
| `npm run build` sobrescribía el bundle estricto del ensayo con uno normal | Informe original rectificado; ensayo nuevo con `next build` directo y SHA256 del JSON exportado; instrucciones de `qa-strict.ts` corregidas |
| Firefox/WebKit en CI se presentaban junto al QA estricto | El run 37823319781 fue verde, pero usa build normal; QA estricto de esos motores sigue pendiente |
| Memoria y `cifras.json` conservaban 479 tests | `memoria:cifras` ejecutado: 527/527, 38 ficheros; memoria y veracidad actualizados |
| Memoria no explicitaba las marcas simuladas al describir 52 incluidas | Ahora dice «simuladas en copia» y mantiene pendientes las hojas reales |
| Checklist enlazaba la veracidad del 06/10 y decía PDF del 06/10 | Referencia vigente del 08/10; PDF regenerado y comprobado |

## IPREM comprobado por el agente

No hay que delegar en Daniel la búsqueda de esta cifra. La página actual del
[SEPE, Cuantías anuales](https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html)
sitúa los valores junto al SMI de 2026 y remite expresamente a la Ley 31/2022:
IPREM mensual 600 € y anual ordinario 7.200 €. La
[Ley 31/2022, DA 90.ª](https://www.boe.es/eli/es/l/2022/12/23/31/con)
fija 20 €/día, 600 €/mes, 7.200 €/año y 8.400 € para el cómputo anual con
extraordinarias en los supuestos que describe su apartado d).

La corroboración administrativa actual permite mantener los valores del repo;
el SEPE se usa como corroboración, no sustituye la cita normativa del parámetro.
No se ha localizado en esta revisión una disposición nueva que cambie el IPREM.
La continuidad por prórroga es una inferencia respaldada por esa corroboración,
no una cita literal nueva de prórroga. En Móstoles, el snapshot normativo
`bocm-20220223-mostoles-ordenanza-prestaciones.txt` especifica 14 pagas;
8.400 € sigue siendo el parámetro base. Esto no verifica de nuevo los
multiplicadores por composición del hogar ni sustituye el muestreo de 12d.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| `check → lint → test → build` | Verde; 527/527 tests, 38 ficheros |
| `validate:full` al cerrar la revisión | Verde; restaura el bundle normal y repite check, lint, 527/527 tests y build |
| `memoria:cifras` | 527/527 tests medidos; 52 RuleSets / 50 programas; 166 fuentes registradas / 145 citadas; 401 fichas nivel 2 |
| CLI `eligibility-build.ts --strict --out <scratch>/strict-real` con reglas reales | 0 incluidas / 50 programas excluidos por revisión humana pendiente |
| `qa-strict.ts <scratch>/strict-simulado` | Marcas simuladas en copia aplicadas con la herramienta real: 52 RuleSets incluidos / 0 excluidos, 14 hojas vigentes |
| `datos:public → next build` directo | SHA256 del JSON exportado = SHA256 del bundle estricto de scratch |
| Goldens sobre JSON exportado estricto | 44 personas, 47 expectativas, 0 diferencias |
| Playwright sobre export estricto, `desktop-chromium` + `small-reflow` | 32/32 verdes; incluye axe, privacidad, teclado y zoom 200 % |
| `memoria:pdf` + extracción/renderizado con PyMuPDF | 5 páginas; cifra 527 presente; inspección de las cinco páginas renderizadas sin recorte aparente |
| `gh run list --limit 6` | Seis runs completados en verde; incluye Firefox/WebKit normal. No son un CI nuevo de estos cambios locales |

Huella del bundle estricto simulado servido por el export:
`1119247b97637579b571703e29134c3c131237a6d0514462a16db73d23e39e81`.
Scratch y logs: `F:\Temp\datawardsmadrid-revision-agente\`.
Al terminar se restaura el build normal mediante `validate:full`; ninguna regla
real recibe aprobaciones y no se modifica el workflow de Pages.

## Pendiente real, sin atribuirlo a Daniel por defecto

| Responsable | Siguiente paso |
|---|---|
| Agente + revisión de la corrección | Móstoles usa `IPREM_ANUAL_14P` en la condición, pero `parametersUsed` aún declara `IPREM_ANUAL_12P`. No altera el cálculo actual, pero el metadato debe alinearse; pendiente de corrección y verificación antes de aprobar la hoja |
| Agente, tras recibir hojas | `review:apply`, commit por hoja y recuento real de programas de la release |
| Agente, 09/10 | Comprobar primera ejecución de frescura tras el arreglo: tarea Ready, última ejecución 08/10 08:37 con código 0 pero log de árbol sucio; siguiente 09/10 07:30. Código 0 no acredita una revalidación |
| Agente, tras muestreo | QA completo sobre export estricto, incluido Firefox/WebKit y privacidad; comprobar huella del bundle exportado y servido |
| Agente, tras piloto | Agregados reales, memoria final y veracidad acumulada |
| Agente, 14/10 | Release estricta, anexos regenerados, comprobaciones posteriores, paquete y recibo de fase |
| Daniel | Muestreo humano, licencia, D-10/D-11, piloto, móvil real y lectura final |

No se publica ni se presenta esta revisión como cierre de F10. El PDF sigue
siendo borrador con piloto pendiente. El mínimo D-12 depende de las aprobaciones
y frescura reales; el ensayo simulado no lo resuelve.

Reversión: retirar las correcciones documentales, cifras y PDF de esta unidad;
la única modificación de script es la explicación del ensayo. Las reglas y
los workflows permanecen intactos.
