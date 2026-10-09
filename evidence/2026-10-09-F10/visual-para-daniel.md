# Visual — lo que necesita la decisión de Daniel (F10, 09/10)

Cosas de **contenido de reglas** que no se tocan aquí (invalidaría las hojas
de muestreo) — se han resuelto solo en presentación donde procedía y se
proponen para su revisión.

## Para revisar en la fuente de la regla (cuando quieras)

1. **Slug dentro del texto de una regla** — `madrid-abono-transporte-infantil`
   (y posiblemente otras) contiene en su etiqueta algo como «…así como el
   abono `madrid-abono-transporte-65`…». En la web se pinta ya con el nombre
   humano («Tarjeta azul de transporte…») vía `humanizeSlugs`, pero el dato
   lleva el identificador interno. Si te parece bien, cambia el texto de la
   regla por el nombre y regenera — o déjalo así (la web ya lo presenta bien).
2. **Condiciones anidadas muy largas** — algunos requisitos se leen como
   «Se comprueba así: basta una de: tienes 23 años o más; todas a la vez: tu
   edad es al menos 18…». Es correcto pero denso. No es texto de regla: se
   genera en `src/lib/rule-text.ts`; podemos mejorar la plantilla sin tocar
   datos si quieres.
3. **Banner de demostración (D-10)** — a 320 px ocupa 3 líneas
   («Demostración — versión preliminar… · Código y reglas abiertos ·
   Cómo funciona»). No se ha tocado el texto; si lo quieres más corto es tu
   decisión.

## Checklist de 10 minutos en tu móvil

Con tu móvil real (iPhone o Android), en https://requisito.h1756.es:

1. **Portada** — ¿se lee el título sin cortes? Los dos botones son
   cómodos de pulsar (≈48 px de alto).
2. **Menú** — arriba a la derecha «≡ Menú»: se abre, los enlaces tienen
   dedo y vuelve a cerrar al tocar otra vez.
3. **/ayudas/** — las 50 tarjetas tienen NOMBRE HUMANO (nada de
   «anticipos-docentes-cm»).
4. **Una ficha** (p. ej. Ingreso Mínimo Vital) — cada requisito se lee
   completo, la cita «Fuente» abre el extracto sin montarse sobre el texto,
   y el botón «Comprueba si te aplica» cabe en pantalla.
5. **/comprobar/** — flujo completo: las edades de personas a cargo piden
   un campo por persona; «Prefiero no decirlo» va por persona.
6. **Resultados** — tarjetas legibles, la sección «También podrían
   interesarte» está marcada como sin comprobar.
7. **Modo oscuro** del móvil — repite portada + una ficha.

## Hallazgos cerrados que puedes comparar

- Ficha a 320–390 px antes: una palabra por línea + «(aviso)» montado →
  ahora lista normal (ver `visual/ficha-imv-360-light.png`).
- Banner/links de cabecera solapados a 360–390 → separados.
- Menú móvil inexistente (summary con display:none) → visible y táctil.
- Resultados y explorar con scroll horizontal a 320 → eliminado.
- Textos «5639.16 €» y «es menos de» → «5.639,16 €» y concordancia plural.
- Zoom 200/400 % con scroll-x en portada → reflow sin scroll lateral.
