# F4 — Diseño y frontend

**Fechas:** 07–11/10 (wireframes desde el 07 con datos fixture) · **Depende de:**
F2 para datos reales (los wireframes no) · **Responsable:** agente; **revisión de diseño: Daniel**
**Especificación:** `docs/09-diseno-ux.md`, `DESIGN.md` (portado)

## Tareas

| ID | Tarea |
|---|---|
| F4-1 | Identidad del producto Madrid sobre los tokens portados: nombre (D-6), un acento, logotipo textual y favicon; cabecera y pie con «No somos una administración pública». ADR si cambia algún token |
| F4-2 | Wireframes de todas las pantallas de docs/09 §2 en 375 y 1366 px, con fixtures → `evidence/<fecha>-F4/wireframes/` → **revisión de Daniel** |
| F4-3 | Componentes de docs/09 §3 con todos sus estados, usando **solo tokens existentes** |
| F4-4 | Ruta de entrada + cuestionario progresivo (preguntas filtradas por el bundle, `showIf`, coherencia, atrás sin pérdida, foco y anuncio) |
| F4-5 | Revisión de respuestas |
| F4-6 | Resultados: resumen con `aria-live`, panel «te faltan datos» con respuesta en línea y recálculo, tarjetas ordenadas (docs/07 §4.2), conmutadores de cerradas/próximas, plegado de «no parece aplicarte» |
| F4-7 | Integración del self-check: una ayuda con invariante fallido ⇒ tarjeta «no evaluable»; bundle inválido ⇒ página de error honesta |
| F4-8 | «Cómo funciona»: método, jerarquía de fuentes, límites, privacidad y enlace a los datos abiertos |
| F4-9 | Persistencia por las vías de `user-state.ts` (handoff de pestaña + perfil local con consentimiento), «Borrar mis respuestas», «Copiar resumen», hoja de impresión |
| F4-10 | i18n: todas las cadenas por `t('es', key)`; `en` solo si Should |
| F4-11 | Sin JS: la ruta muestra una explicación y un enlace al catálogo (export estático) |
| F4-13 | Nivel 2 de resultados con el ranking portado (`src/lib/related/rank.ts`) sobre el catálogo importado, separado visualmente y con su etiqueta (ADR-016); test: ninguna tarjeta de nivel 2 muestra ✓, «probable» ni «cumples» |
| F4-14 | Privacidad con `user-state.ts` portado: campos del orientador en `SENSITIVE_FIELDS`; «Borrar mis respuestas» limpia el handoff y el perfil con consentimiento; tests portados y nuevos en verde |
| F4-15 | Ficha de ayuda (`/ayudas/[slug]`) para nivel 1 y nivel 2, con fuente, fecha y procedencia (incluido «importada de la-ayuda@<commit>» en el pie técnico) |
| F4-12 | Datos abiertos: publicar RuleSets, parámetros y catálogo en `/datos/elegibilidad/` con licencia y manifiesto |

## Bucle de calidad visual (obligatorio, porque el front es clave)
Tras cada pantalla: capturas en 375 y 1366 px (claro y oscuro) en `evidence/<fecha>-F4/capturas/` y autorrevisión contra la lista de docs/09: jerarquía de la tarjeta (§4), microcopy (§5, palabras prohibidas), estados (§3), anti-patrones de `DESIGN.md` §6 (nada de tarjetas dentro de tarjetas, mosaicos ni look de «dashboard IA») y accesibilidad (§7). Antes de cerrar F4, **una revisión independiente**: un subagente sin contexto previo recibe solo las capturas y docs/09, y devuelve los problemas por gravedad. Se corrigen los graves. Daniel ve las capturas (F4-W) sin bloquear.

## Pruebas a escribir
- Por componente: render de **cada estado** de la tabla de docs/09 §3.
- E2E (en `desktop-chromium` y `mobile-ios` durante la fase; la matriz completa en F5):
  recorrido feliz, todo «no lo sé», responder un dato faltante ⇒ recálculo
  anunciado, atrás sin pérdida, cerradas ocultas, cita desplegable, invariante
  forzado ⇒ «no evaluable».
- axe en cada pantalla.
- Privacidad (docs/10 §6) desde el primer E2E.
- Palabras prohibidas (docs/09 §5) ausentes del `out/`.

## Verificación

```powershell
npm run check; npm test; npm run build
npx playwright test --project desktop-chromium --project mobile-ios
```

## Puerta de salida
- [ ] Wireframes aprobados por Daniel antes de pulir.
- [ ] Todos los estados de componentes renderizados y capturados (`evidence/<fecha>-F4/estados/`).
- [ ] E2E y axe en verde en los dos proyectos.
- [ ] Test de privacidad en verde.
- [ ] Ninguna cadena de interfaz fuera de i18n.
- [ ] Recibo y handoff.
