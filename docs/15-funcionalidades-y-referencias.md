# Funcionalidades ampliadas y de dónde salen

Para que el producto no sea «un formulario con tarjetas». Cada función indica su
referencia (patrón observado; **no se copia código**) y su prioridad para el 14/10.
Las funciones respetan los principios: reglas deterministas, citas y privacidad.

## 1. Funciones

| # | Función | Qué es | Referencia (patrón) | Prioridad |
|---|---|---|---|---|
| A | **Ver un ejemplo** | En la portada, 3–4 perfiles ficticios de Madrid («Familia monoparental en Getafe», «Estudiante de 18 años en Alcalá», «Persona de 55 años en paro en Vallecas», «Pareja joven de alquiler en Móstoles»). Un clic ⇒ resultados completos sin rellenar nada. Reutiliza las personas golden | Demos de PolicyEngine y MyFriendBen | **Must** |
| B | **Entrar por evento vital** | «Voy a tener un hijo», «Me he quedado sin trabajo», «Estudio o voy a estudiar», «Busco vivienda o me independizo», «Cuido de un familiar», «Tengo una discapacidad», «Tengo 65 años o más». Filtra el universo y adapta las preguntas | USAGov benefits locator (BEARS, por eventos vitales), Canada Benefits Finder (life events y temas) | **Must** |
| C | **Matriz «requisito a requisito»** | Tabla de ayudas × requisitos con ✓ / ? / ✗ / ⚠. Cada celda abre la cita. En móvil, se apila como lista por ayuda. Es la **firma visual** del producto | Propia (da sentido al nombre) | **Must** |
| D | **Plan de acción** | Tras los resultados: (1) «Podrías pedir hasta X € en N ayudas» (solo importes por persona citados, con rango honesto); (2) documentos agrupados: «con estos 5 documentos cubres 4 ayudas»; (3) calendario de plazos (lista ordenada + **.ics** generado en el navegador); (4) **pasos** por ayuda en formato paso a paso; (5) imprimir o guardar en PDF desde el navegador | GOV.UK *step by step navigation* y *task list*; MyFriendBen (valor + esfuerzo); ACCESS NYC (cómo solicitar) | **Must** (1–3, 5) / Should (4) |
| E | **Observatorio** (transparencia pública) | Página con: nº de programas por nivel y tema, fuentes oficiales usadas, **registro diario del job de frescura** (F9), cambios detectados («la fuente del bono social cambió el …»), pistas nuevas pendientes de revisión, enlace a los datos abiertos y a las reglas legibles | grant-finder (procedencia y frescura), OpoAlerta (página de estado), NSW Rules as Code (reglas publicadas) | **Must** |
| F | **Reglas legibles** | Por programa, la tabla de decisión generada desde el RuleSet («si tienes X y Y ⇒ …») con citas. También en datos abiertos | Catala / CUTECat (revisable por juristas), OpenFisca (parámetros) | Should |
| G | **Cita en contexto** | Al abrir «Fuente», un panel muestra el párrafo oficial con el extracto **resaltado** (a partir del `.txt` normalizado guardado) + enlace a la página oficial | Propio, sobre el gate G4 | Should |
| H | **Modo acompañante** | Para trabajadoras sociales, AMPAs y ONG: «Estoy ayudando a otra persona», textos en tercera persona, hoja imprimible para la cita en servicios sociales y un botón visible para borrar todo al terminar (equipos compartidos) | ACCESS NYC (uso por intermediarios), Benefits Data Trust | Should (multiplica el impacto del piloto) |
| I | **Estado de acceso por programa** | OPEN / ROLLING / UPCOMING / CLOSED_RECURRING (docs/14 §2) con sus textos | grant-finder, Opositar (plazos próximos) | **Must** |
| J | **Simulador oficial primero** | Si existe (IMV, por ejemplo), es la acción principal | ADR-018 | **Must** |
| K | **Identidad visual** | Logotipo tipográfico «Requisito a Requisito» (marca con el símbolo ✓? o similar, en SVG propio), portada con jerarquía, la matriz como elemento memorable, ilustración cero o mínima | DESIGN.md + GOV.UK/DSFR (sobriedad pública) | **Must** |
| L | Explorar el catálogo | Listado del universo con filtros (tema, evento vital, ámbito, estado de acceso) y búsqueda | la-ayuda (explorar), Opositar, TOPOS | **Must** |
| M | Inglés | Interfaz en inglés | ADR-024 | Could |

## 2. Repos y sistemas de referencia (consultar, no copiar)

| Referencia | Qué mirar | Licencia (verificar antes de citar) |
|---|---|---|
| GOV.UK Design System — patrones *step by step*, *task list*, *check answers*, *question pages* | Estructura de pasos, textos y estados | MIT (código), OGL (contenido) |
| DSFR (Système de Design de l'État, Francia) | Sobriedad de un servicio público, componentes accesibles | Verificar |
| Canada Benefits Finder (alpha.service.canada.ca) | Filtros por eventos vitales y temas, resúmenes de prestaciones | Verificar |
| USAGov benefits locator / BEARS | Recorridos por eventos vitales en inglés y español | Dominio público (EE. UU.) en general; verificar |
| ACCESS NYC (CityOfNewYork/ACCESS-NYC) | Screener multilingüe, resultados accionables, programas como datos abiertos | Verificar |
| MyFriendBen (benefits-calculator) | Valor estimado y tiempo para solicitar | Verificar |
| Aides Jeunes (betagouv) | Consistencia de respuestas, restricciones geográficas | AGPL: **no** copiar código |
| PolicyEngine | Demos con hogares de ejemplo | AGPL: **no** copiar código |
| grant-finder (openprose) | Registro de convocatorias con procedencia y frescura | Verificar |

## 3. Política de dependencias (ADR-042)

Se permite añadir una dependencia **solo si** ahorra más de medio día, es MIT,
ISC, BSD o Apache-2.0, está mantenida (con release en los últimos 12 meses),
pesa ≤ 30 KB gzip en cliente, no tiene telemetría ni llamadas de red, y se
registra con un ADR corto (nombre, versión, licencia, motivo). Para .ics, PDF e
impresión **no** hacen falta dependencias: texto RFC 5545 generado a mano y
`window.print()` con CSS de impresión. Un combobox accesible se puede escribir
siguiendo el patrón ARIA APG.
