# F8 — Piloto real y evidencia de impacto (Impact pondera impacto al 50 %)

**Fechas:** 10–14/10 · **Depende de:** primera versión usable (F3 lote 1 + F4
mínimo) **desplegada** (D-3, D-4, D-6) · **Responsable:** Daniel (contactos) + agente
(materiales, medición y consolidación)

## Por qué existe esta fase
La categoría es **Global Tech Impact** (ADR-028): el 50 % de la nota es «impacto y
resultados». Un proyecto nuevo no tiene histórico, así que hay que conseguir
**evidencia real, pequeña y honesta** en pocos días. Nunca se inventa ni se infla
nada. Si el piloto da poco, la memoria dice poco.

## Qué cuenta como evidencia (de más a menos fuerte)
1. **Sesiones observadas** con personas reales de Madrid (3–10): completan el
   recorrido en el móvil, se anota el tiempo, si entendieron el resultado, cuántas
   ayudas «probables» o «posibles» descubrieron que no conocían y si piensan
   solicitar alguna. Consentimiento verbal o escrito y **sin datos personales** en
   las notas (docs/10 §8 y `templates/manual-device-checklist.md`, sección
   comprensión).
2. **Testimonios con consentimiento** (texto breve, nombre de pila o anónimo, rol:
   «madre de dos hijos en Getafe», «técnica de una asociación»), por escrito.
3. **Interés de intermediarios:** respuesta de una AMPA, asociación vecinal, ONG,
   servicio social municipal o entidad del tercer sector de Madrid que lo haya
   probado o quiera difundirlo (correo guardado como evidencia).
4. **Uso agregado anónimo** (solo si D-7 lo autoriza): contador de recorridos
   completados y clics a la sede oficial, **sin perfil** (docs/11 §1.2). Si no se
   autoriza, no hay cifras de uso y la memoria lo dice.
5. **Métricas de producto** (siempre disponibles): nº de ayudas de Madrid
   cubiertas con reglas citadas, nº de fuentes oficiales, perfiles evaluados por el
   exhaustivo, defectos detectados por los gates, tiempo medio por ayuda y
   accesibilidad AA verificada.

## Tareas

| ID | Tarea | Resp. |
|---|---|---|
| F8-1 | Versión piloto desplegada (puede ser parcial: lote 1 + interfaz mínima) con el banner «Versión piloto» | agente (tras D-3/D-4/D-6) |
| F8-2 | Kit de piloto: guion de sesión de 10 min, hoja de observación sin datos personales, texto de consentimiento y mensaje corto para difundir (WhatsApp/correo) | agente |
| F8-3 | Lista de 5–10 contactos o entidades de Madrid a quienes pedir que lo prueben (familiares, conocidos con hijos, AMPA del colegio, asociación del barrio) | **Daniel** |
| F8-4 | Realizar 3–10 sesiones (presenciales o por videollamada) o envío del enlace con un formulario de opinión **anónimo y voluntario** | **Daniel** |
| F8-5 | Consolidar resultados en `evidence/<fecha>-F8/piloto.json` y extraer testimonios con permiso | agente |
| F8-6 | Corregir los problemas de comprensión detectados (si son pequeños) antes de la memoria | agente |

## Puerta de salida (13/10)
- [ ] `piloto.json` con cada dato trazable (sesión → nota → fecha), sin datos personales.
- [ ] Testimonios solo con permiso explícito guardado.
- [ ] Separación clara en la memoria entre **medido en el piloto**, **capacidad
      del producto** y **plan de escalado**.
