# F5 — QA transversal: navegadores, dispositivos, accesibilidad, rendimiento y privacidad

**Fechas:** 10–12/10 · **Depende de:** F4 funcional · **Responsable:** agente; **pruebas manuales: Daniel**
**Especificación:** `docs/10-qa-matriz.md`

## Tareas

| ID | Tarea |
|---|---|
| F5-1 | Configurar `playwright.eligibility.config.ts` con los 10 proyectos de docs/10 §2 |
| F5-2 | Ejecutar todos los E2E en los 10 proyectos; corregir los fallos con un test de regresión |
| F5-3 | Recorridos en 5 locales × {desktop-chromium, mobile-ios} |
| F5-4 | axe en todos los proyectos y estados; 0 serious/critical |
| F5-5 | Pruebas a11y específicas: solo teclado, foco no tapado, objetivos ≥ 24 px, aria-live, errores asociados, `lang` |
| F5-6 | Regresión visual: `toHaveScreenshot` de entrada, paso de pregunta, revisión, resultados (con y sin datos faltantes) y tarjeta desplegada × 10 proyectos; las líneas base se generan **después** de la aprobación del diseño |
| F5-7 | Rendimiento: presupuestos de docs/10 §5 con el perfil CDP de la-ayuda; 3 ejecuciones, mediana |
| F5-8 | Privacidad (docs/10 §6) en los 10 proyectos |
| F5-9 | `npm run link:check` sobre las URL del bundle |
| F5-10 | Checklist manual (`templates/manual-device-checklist.md`) → **Daniel**: Edge y Chrome en Windows, Chrome en Android, Safari en iPhone, NVDA y VoiceOver |
| F5-12 | Prueba de comprensión con 3–5 personas ajenas (checklist manual): tiempo para completar el cuestionario (objetivo ≤ 3 min), si entienden «probable», «faltan datos» y la diferencia entre nivel 1 y nivel 2. Antes, revisar y reutilizar `G:\_Proyectos\eduayudas\docs\QA_BROWSER_CHECKLIST.md` |
| F5-11 | Validación completa del repo: `node scripts/validate-agent-delivery.mjs --full` |

## Verificación

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='F:\Caches\ms-playwright'
npm run build
npx playwright test --config playwright.eligibility.config.ts          # 10 proyectos
npx playwright test --config playwright.eligibility.config.ts --grep @a11y
npx playwright test --config playwright.eligibility.config.ts --grep @privacy
npx playwright test --config playwright.eligibility.config.ts --grep @visual
npm run link:check
node scripts/validate-agent-delivery.mjs --full
```

## Puerta de salida
- [ ] 10/10 proyectos en verde (si hay flaky: causa identificada y corregida; **no** se añaden `retries`).
- [ ] axe: 0 serious/critical en todos los proyectos.
- [ ] Privacidad en verde en todos los proyectos.
- [ ] Presupuestos de rendimiento cumplidos, o desviación documentada con la causa.
- [ ] Checklist manual completado por Daniel; los defectos encontrados, corregidos o anotados como límite conocido.
- [ ] `validate-agent-delivery --full` en PASS.
- [ ] Informe `evidence/<fecha>-F5/qa-report.md` con la matriz de resultados (proyecto × suite); recibo y handoff.
