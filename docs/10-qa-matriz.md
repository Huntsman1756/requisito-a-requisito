# QA — estrategia, matriz de navegadores/dispositivos y puertas

## 1. Pirámide

| Nivel | Herramienta (mismo stack que la-ayuda) | Qué cubre | Cuándo |
|---|---|---|---|
| Tipos | `tsc --noEmit` (`npm run check`) | Contratos | Cada cambio |
| Lint/formato | Biome (`npm run lint`) | Estilo | Cada commit (husky) |
| Unit motor | Vitest | Operadores, Kleene, intervalos, plazo, parámetros, «qué te falta» | Cada cambio del motor |
| Exhaustivas + monotonía | Vitest + generador propio | Todo el espacio de respuestas por RuleSet | Cada cambio de motor o regla |
| Golden (oráculo jurídico) | Vitest | Personas revisadas por humano | Cada cambio de regla |
| Mutación dirigida | script Node | Que los tests detectan cambios de umbral | Fin de F2 y F3 |
| Gate de reglas | `eligibility-build` | Esquema, autoridad, citas, extractos, dominios, frescura | Build |
| Componentes | Vitest (render de estados, si el repo lo hace ya) o Playwright | Estados de §3 de docs/09 | F4 |
| E2E multinavegador | Playwright (`playwright.config.ts`, nuevo) | Recorridos completos | F4–F5 |
| Accesibilidad auto | `@axe-core/playwright` | WCAG 2.2 A/AA | F4–F5 |
| Regresión visual | Playwright `toHaveScreenshot` | Pantallas clave × proyectos | F5 |
| Privacidad | Playwright (intercepción de red + storage) | Que el perfil no sale | F4–F5 |
| Rendimiento | Script con CDP (método portado de `docs/ops/mobile-performance-lab.md` de la-ayuda) + tamaños de `out/` | Presupuestos §5 | F5 |
| Manual | Checklist `templates/manual-device-checklist.md` | Dispositivos reales y lectores de pantalla | F5 (Daniel, unos 30 min) |

**Sin dependencias nuevas** salvo autorización (ADR-010). Los navegadores de
Playwright se instalan con la caché en F:
`$env:PLAYWRIGHT_BROWSERS_PATH='F:\Caches\ms-playwright'; npx playwright install chromium firefox webkit`.

## 2. Matriz de navegadores y dispositivos (Playwright `projects`)

Config `playwright.config.ts` del proyecto con estos proyectos:

| Proyecto | Motor | Dispositivo/viewport | Extras |
|---|---|---|---|
| `desktop-chromium` | Chromium | 1366×768 | — |
| `desktop-firefox` | Firefox | 1366×768 | — |
| `desktop-webkit` | WebKit | 1440×900 | (proxy de Safari macOS) |
| `mobile-android` | Chromium | `devices['Pixel 7']` | táctil |
| `mobile-ios` | WebKit | `devices['iPhone 14']` | táctil (proxy de Safari iOS) |
| `tablet-ios` | WebKit | `devices['iPad Mini']` | — |
| `small-reflow` | Chromium | 320×640 | reflow / zoom 400 % |
| `dark` | Chromium | 390×844 | `colorScheme: 'dark'` |
| `forced-colors` | Chromium | 1366×768 | `forcedColors: 'active'` |
| `reduced-motion` | Chromium | 390×844 | `reducedMotion: 'reduce'` |

Cada proyecto ejecuta: recorrido feliz, recorrido «todo no lo sé», responder un
dato faltante desde resultados, ir atrás sin perder respuestas, conmutador de
cerradas, desplegar cita, copiar/imprimir y borrar respuestas.

Idioma: solo `es` (ADR-024). Si se añade `en` (Should), se ejecuta en
`desktop-chromium` y `mobile-ios`.

**Límites honestos:** WebKit de Playwright no es Safari real, y la emulación
móvil no es un dispositivo. Por eso hay checklist manual (§4).

## 3. Accesibilidad

Automática (axe, en todos los proyectos y en cada estado de pantalla):
tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`. **Puerta: 0 violaciones
`serious` o `critical`; las `moderate` se listan y se justifican.**

Pruebas Playwright específicas:
- Completar el cuestionario **solo con teclado** (Tab/Shift+Tab/Espacio/Enter/flechas).
- El foco va al encabezado del paso nuevo y no queda tapado (comprobar el
  `boundingBox` del elemento con foco frente a la cabecera sticky).
- Los objetivos táctiles son ≥ 24 px (medir con `boundingBox` todos los controles interactivos).
- `aria-live` anuncia el recálculo: se comprueba el texto de la región tras responder.
- Mensajes de error asociados (`aria-describedby`, `aria-invalid`).
- `lang` del documento por locale.

Manual (checklist): NVDA + Firefox (Windows) y VoiceOver + Safari (iPhone):
completar el recorrido, entender una tarjeta y abrir una cita.

## 4. Manual en dispositivos reales

`templates/manual-device-checklist.md`, que rellena Daniel (o un agente con
control del escritorio, solo para navegadores de Windows): Edge y Chrome en
Windows, Chrome en Android y Safari en iPhone. Resultado a
`evidence/<fecha>-manual/`.

## 5. Presupuestos de rendimiento (ruta `/comprobar` y resultados)

| Métrica | Presupuesto | Medición |
|---|---|---|
| JS propio de la ruta (gzip) | ≤ 120 KB | tamaños en `out/_next/static` atribuidos a la ruta |
| Bundle de reglas del vertical (gzip) | ≤ 150 KB | tamaño de fichero |
| LCP móvil de laboratorio | ≤ 2,5 s | perfil CDP de la-ayuda (CPU 4×, red lenta) |
| INP (responder → resultado) | ≤ 200 ms | marca de rendimiento propia alrededor de la evaluación |
| Evaluación completa del bundle | ≤ 50 ms con CPU 4× | `performance.now()` en un test E2E |
| CLS | ≤ 0,1 | — |

## 6. Privacidad (puerta bloqueante)

Test E2E en todos los proyectos:
1. Se interceptan todas las peticiones (`page.on('request')`). Se responde un
   perfil con valores centinela únicos (p. ej. municipio `28065`, banda de renta
   concreta, edad 37). **Ninguna URL, cabecera ni cuerpo contiene los centinelas.**
2. Tras completar el recorrido: `document.cookie === ''`; sin consentimiento,
   `localStorage` sin `mb_user_profile` ni claves del orientador; ninguna URL del
   historial contiene un campo de `SENSITIVE_FIELDS` (`user-state.ts`).
3. «Borrar mis respuestas» deja el almacenamiento vacío.
4. No hay peticiones a dominios de terceros.

## 7. Calidad de datos y contenido

- `npm run link:check` sobre las URL de fuentes y canales del bundle.
- Ninguna cadena de interfaz fuera del sistema i18n (test); si existe `en`, ninguna clave ausente.
- Ninguna palabra prohibida del microcopy (docs/09 §5) aparece en el `out/` de
  la ruta (test por búsqueda de texto).

## 8. Definición de «hecho» por unidad

1. Test que falla antes y pasa después (para defectos y para lógica del motor).
2. `npm run check`, `npm test` y `npm run build`, en secuencia y en verde.
3. Las suites focalizadas de la unidad en verde, con su recuento.
4. Commit pequeño con mensaje convencional.
5. Fila de `TASK_QUEUE.md` actualizada con commit y evidencia.

Al final de la fase: puerta completa del fichero `phases/Fx.md` y recibo
`templates/phase-receipt.json` rellenado en `evidence/<fecha>-Fx/receipt.json`.
