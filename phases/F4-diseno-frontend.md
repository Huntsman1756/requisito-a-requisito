# F4 — Diseño y frontend

**Fechas:** 07–11/10 (wireframes desde el 07 con datos fixture) · **Depende de:**
F2 para datos reales (los wireframes no) · **Responsable:** agente; **revisión de diseño: Daniel**
**Especificación:** `docs/09-diseno-ux.md`, `la-ayuda/DESIGN.md`

## Tareas

| ID | Tarea |
|---|---|
| F4-1 | Leer el asistente actual (`assistant-form.ts`, `assistant-data.json`, sus contratos en `docs/ops/`) y su router de locales; ADR del repo: **extender** el asistente o crear una ruta hermana enlazada desde él. Criterio: no romper los contratos localizados aceptados |
| F4-2 | Wireframes de todas las pantallas de docs/09 §2 en 375 y 1366 px, con fixtures → `evidence/<fecha>-F4/wireframes/` → **revisión de Daniel** |
| F4-3 | Componentes de docs/09 §3 con todos sus estados, usando **solo tokens existentes** |
| F4-4 | Ruta de entrada + cuestionario progresivo (preguntas filtradas por el bundle, `showIf`, coherencia, atrás sin pérdida, foco y anuncio) |
| F4-5 | Revisión de respuestas |
| F4-6 | Resultados: resumen con `aria-live`, panel «te faltan datos» con respuesta en línea y recálculo, tarjetas ordenadas (docs/07 §4.2), conmutadores de cerradas/próximas, plegado de «no parece aplicarte» |
| F4-7 | Integración del self-check: una ayuda con invariante fallido ⇒ tarjeta «no evaluable»; bundle inválido ⇒ página de error honesta |
| F4-8 | «Cómo funciona»: método, jerarquía de fuentes, límites, privacidad y enlace a los datos abiertos |
| F4-9 | Persistencia por las vías de `user-state.ts` (handoff de pestaña + perfil local con consentimiento), «Borrar mis respuestas», «Copiar resumen», hoja de impresión |
| F4-10 | i18n: todas las claves `elig_*` en es/ca/gl/eu/oc (la interfaz completa; si una traducción no es fiable, marcarla en el informe para revisión) |
| F4-11 | Sin JS: la ruta muestra una explicación y un enlace al catálogo (export estático) |
| F4-13 | Nivel 2 de resultados con `rankBenefits` existente, separado visualmente y con su etiqueta (ADR-016); test: ninguna tarjeta de nivel 2 muestra ✓, «probable» ni «cumples» |
| F4-14 | Privacidad sobre `user-state.ts`: campos nuevos en `SENSITIVE_FIELDS`, prerrelleno solo de correspondencias exactas, «Borrar mis respuestas» limpia el handoff y el perfil con consentimiento; los tests existentes de `user-state` siguen en verde |
| F4-12 | Datos abiertos: publicar RuleSets, parámetros y catálogo en `/datos/elegibilidad/` con licencia y manifiesto |

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
npx playwright test --config playwright.eligibility.config.ts --project desktop-chromium --project mobile-ios
npm run test:a11y          # la suite existente sigue en verde (no regresión)
npm run test:e2e:audit -- product-smoke publication-regressions   # no regresión del producto actual
```

## Puerta de salida
- [ ] Wireframes aprobados por Daniel antes de pulir.
- [ ] Todos los estados de componentes renderizados y capturados (`evidence/<fecha>-F4/estados/`).
- [ ] E2E y axe en verde en los dos proyectos; la suite a11y y las auditorías existentes sin regresión.
- [ ] Test de privacidad en verde.
- [ ] 5 locales sin claves de interfaz ausentes.
- [ ] Recibo y handoff.
