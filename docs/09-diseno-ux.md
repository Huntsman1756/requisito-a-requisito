# Diseño y experiencia — «La Ayuda · Tus derechos, con fuente»

El diseño importa tanto como el motor: el jurado y el ciudadano juzgarán en
segundos. Este documento **parte del** sistema de la-ayuda, portado a este repo
(`DESIGN.md` propio, copiado de `la-ayuda/DESIGN.md`, «Portal cívico 2026»): mismos
tokens, tipografías, componentes y anti-patrones. **No se crea un sistema visual
nuevo**: se porta. Se permite dar identidad propia al producto de Madrid con
**un** acento y un logotipo, sin tocar la estructura de tokens.

## 1. Principios

1. **Una cosa por pantalla** en el cuestionario (patrón GOV.UK «one thing per
   page», usado también por ACCESS NYC): una pregunta, una decisión, un botón
   principal. En escritorio se permite ver el resumen lateral.
2. **La duda es una respuesta válida.** «No lo sé» y «Prefiero no decirlo» son
   botones de primer nivel, no enlaces escondidos.
3. **El resultado se explica solo.** Cada ✓ / ✗ / ? lleva su porqué y su fuente a
   un toque. La trazabilidad visible es el elemento memorable de la marca.
4. **Honestidad antes que ánimo.** Nunca «¡Tienes derecho!». Siempre «probablemente
   cumples», «no podemos saberlo» o «no parece aplicarte», con el aviso legal fijo.
5. **Móvil primero (360–390 px) y sin prisa:** objetivos táctiles ≥ 44 px, texto
   base ≥ 16 px y nada que dependa de pasar el cursor por encima.
6. **Lenguaje claro:** frases cortas, segunda persona y verbos de acción. El literal
   oficial va solo en el desplegable de la cita. **No** se dice «Lectura Fácil»:
   la UNE 153101 EX exige validarla con personas con dificultades lectoras, y eso
   no se ha hecho.
7. **Rápido:** objetivo de completar el cuestionario en ≤ 3 min (medido en la prueba
   de comprensión de F5).

## 2. Mapa de pantallas

```
[Entrada /comprobar]
   │  «Descubre qué ayudas puedes pedir — 2 minutos, sin registrarte, tus datos no salen de tu móvil»
   ▼
[Cuestionario 1..N]  (N ≤ 10, solo preguntas necesarias; barra de progreso)
   │  ← Atrás · Saltar · No lo sé · Prefiero no decirlo
   ▼
[Revisión de respuestas]  (editar cualquiera; coherencia: «¿Seguro que…?»)
   ▼
[Resultados]
   ├─ Resumen: «3 ayudas probables · 2 posibles · te faltan 2 datos para 4 más»
   ├─ Bloque «Te faltan datos» (responder en línea → recalcula sin recargar)
   ├─ Tarjetas: Probables → Posibles → Insuficientes
   ├─ Conmutador «Mostrar cerradas» / «Próximas a abrir»
   ├─ Plegado: «No parece aplicarte (N) — ver por qué» (con «Si crees que sí cumples, consulta la fuente»)
   ├─ Nivel 2: «También podrían interesarte — no hemos comprobado los requisitos» (ranking portado de la-ayuda, ADR-016)
   └─ Acciones: Copiar resumen · Imprimir · Borrar mis respuestas · Empezar de nuevo
        ▼
   [Detalle «Por qué»] (desplegable en tarjeta; en escritorio, panel lateral)
        └─ requisito ↔ tu respuesta ↔ extracto literal ↔ fuente ↗
[Cómo funciona]  (método, fuentes, límites, privacidad, datos abiertos)
[Error / sin JS / bundle inválido]  (mensaje honesto + enlace al catálogo)
```

## 3. Componentes (nuevos, sobre el sistema existente)

| Componente | Estados obligatorios | Notas |
|---|---|---|
| `QuestionStep` | vacío, respondido, error, «no lo sé», «prefiero no decirlo», pregunta especial (sensible) | `fieldset` + `legend` = pregunta; ayuda «¿Por qué te lo preguntamos?» desplegable; error con `role="alert"` asociado por `aria-describedby` |
| `ProgressBar` | n/N | `role="progressbar"` con `aria-valuenow/min/max` y texto «Pregunta 3 de 7» (DESIGN.md §4) |
| `AnswerReview` | lista editable | Cada fila enlaza a su paso |
| `ResultSummary` | con resultados, sin resultados, todo desconocido | `role="status" aria-live="polite"` al recalcular |
| `MissingInfoPanel` | n datos faltantes, ninguno | Respuesta en línea; recalcula y anuncia «Ahora: 1 ayuda probable más» |
| `ResultCard` | probable, posible, insuficiente, no_cumple, no evaluable (self-check), cerrada, próxima, urgente (<5 días), obsoleta (>30 días) | Jerarquía §4 |
| `RequirementRow` | T ✓, F ✗, U ?, aviso ⚠ (no comprobable), conflicto de fuentes | Icono **y** texto (nunca solo color); cita desplegable |
| `CitationDisclosure` | cerrado/abierto | `<details>` nativo; extracto en `--font-serif`, localizador y fecha en `--font-mono` |
| `DeadlinePill` | OPEN, UPCOMING, CLOSED, ROLLING, UNKNOWN, urgente | Pills existentes (info/danger/neutral-soft) |
| `AmountLine` | por solicitante, rango, variable, sin dato | `total_budget` jamás aquí |
| `EffortLine` | estimación / sin dato | Etiqueta «estimación de La Ayuda» + enlace al método |
| `LegalNotice` | fijo | «Esto no determina tu derecho a la ayuda. La decisión corresponde al organismo competente.» |
| `PrivacyNote` | fijo en entrada y en preguntas sensibles | «Tus respuestas no salen de este dispositivo.» |

## 4. Jerarquía de la tarjeta de resultado

1. Cabecera: badge de fuente (BOCM/BOE/…), ámbito y `DeadlinePill`.
2. Título ciudadano (`displayTitle`), con el veredicto como pill (`Probable` en
   ok-soft, `Posible` en info-soft, `Faltan datos` en warn-soft, `No parece
   aplicarte` en neutral-soft).
3. Línea resumen: «Probablemente cumples 5 de 6 condiciones comprobables».
4. Bloque «qué te falta» si aplica (§4.1 de docs/07): es lo primero tras el resumen.
5. Lista de requisitos (`RequirementRow`) y fila «Convocatoria abierta».
6. Datos clave en `dl`: Puedes recibir · Plazo · Necesitarás · Tiempo aproximado ·
   Dónde solicitar.
7. Acción primaria: si hay `officialSimulator`, «Compruébalo con el simulador oficial ↗»
   (ADR-018). Si no, «Ir a la sede oficial ↗» (solo si `channel.url` está citado),
   y si tampoco, «Ver la fuente oficial ↗». Secundaria: «Ver ficha completa».
8. «Por qué te aparece» (desplegable).
9. Pie: fuente + «Verificado el …» + `LegalNotice`.

No hay tarjetas dentro de tarjetas (anti-patrón de DESIGN.md §6): los requisitos
son una lista con filetes, no subtarjetas.

## 5. Contenido y microcopy (solo `es`; ADR-024)

| Situación | Texto |
|---|---|
| Entrada | «Responde unas preguntas y te decimos qué ayudas merece la pena comprobar. No hace falta registrarse. Tus respuestas no salen de este dispositivo.» |
| No lo sé | «No lo sé» — tras pulsar: «Sin problema. Te diremos qué ayudas dependen de este dato.» |
| Prefiero no decirlo | «Prefiero no decirlo» |
| U por rango | «Con el rango que indicaste no podemos saberlo: el límite es 22.000 €.» |
| Falta un dato | «No podemos determinarlo: nos falta saber tu municipio.» [Responder] |
| Cumples salvo X | «Cumples todo salvo: llevar 6 meses empadronado.» |
| Futuro | «Podrías cumplirla a partir del 1 de enero de 2027, cuando lleves 6 meses empadronado. El plazo sigue abierto hasta el 31 de enero.» |
| No evaluable | «Ahora no podemos evaluar esta ayuda. Consulta la fuente oficial.» |
| Sin resultados | «Con tus respuestas no hemos encontrado ayudas de este grupo. Esto no significa que no existan: revisa el catálogo completo.» |
| Aviso legal | «Esto no determina tu derecho a la ayuda. La decisión corresponde al organismo competente.» |
| Identidad | «No somos una administración pública. La información se basa en fuentes oficiales; la solicitud se hace en la sede oficial.» (pie de resultados y «Cómo funciona») |
| Vía alternativa | «Cumples por: menor de 30 años con discapacidad (excepción del art. 3.2).» |
| Nivel 2 | «Relacionada con tu situación. No hemos comprobado sus requisitos: revisa la ficha.» |
| No te aplica (plegado) | «No parece aplicarte porque no cumples: <requisito>. Si crees que sí cumples, consulta la fuente oficial.» |

Prohibido: «tienes derecho», «te corresponde», «garantizado», «IA», «inteligente»,
«100 %», «todas las ayudas», «lectura fácil», «oficial» aplicado a nosotros.

## 6. Responsive, temas y movimiento

- Breakpoints: los existentes del repo. Diseñar para 320, 375, 768, 1024 y 1366 px.
  Reflow sin scroll horizontal a 320 px (equivale a zoom del 400 %).
- Escritorio ≥ 1024: cuestionario centrado (máx. 40rem); resultados en dos
  columnas (lista + panel «Por qué» sticky).
- Modo oscuro: tokens espejados existentes; comprobar contraste de pills en ambos
  temas.
- `forced-colors`: iconos con `currentColor` y bordes visibles. El estado no puede
  depender del fondo.
- Movimiento: transiciones ≤ 200 ms y nada con `prefers-reduced-motion`.
- Impresión: hoja de resultados limpia (sin navegación), con fuentes y fechas.

## 7. Accesibilidad (WCAG 2.2 AA — objetivo verificable)

- Un `h1` por pantalla. Al cambiar de paso, el foco se mueve al `h1`/`legend` del
  nuevo paso y se anuncia «Pregunta 3 de 7».
- Todo operable con teclado, en orden lógico, con foco visible (doble anillo
  existente) y **nunca tapado** por cabeceras sticky (2.4.11).
- Tamaño de objetivo ≥ 24×24 px (2.5.8), y ≥ 44 px en móvil por diseño.
- No pedir dos veces la misma información (3.3.7, Redundant Entry): las respuestas
  se conservan al ir atrás.
- Errores identificados en texto y asociados al campo (3.3.1/3.3.3).
- Mensajes de estado con `aria-live` (4.1.3).
- `lang` correcto por locale; los extractos en otra lengua, con su `lang`.
- Ningún tiempo límite.

## 8. Referencias de diseño (inspiración, no copia)

GOV.UK Design System (patrones de pregunta, «check answers», mensajes de error),
ACCESS NYC (screener multilingüe y móvil), MyFriendBen (resultado con valor y
esfuerzo), edubecas.es y la propia la-ayuda (lenguaje visual). No se copian
textos, iconos, ilustraciones ni CSS de terceros.

## 9. Entregables de diseño (F4)

1. `evidence/<fecha>-diseno/wireframes.md`: wireframes ASCII o capturas de un
   prototipo con datos fixture, por pantalla y en 375 y 1366 px.
2. Inventario de componentes con sus estados (tabla §3), en capturas.
3. Revisión de Daniel (OK/KO) **antes** de pulir: lo que no se apruebe, no se pule.
