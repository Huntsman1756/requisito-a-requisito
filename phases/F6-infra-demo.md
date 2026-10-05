# F6 — Infraestructura y demo

**Fechas:** 11–13/10 · **Depende de:** F5 en verde (para desplegar), F4 (para grabar) ·
**Responsable:** agente; **decisión D-3 y autorización de despliegue: Daniel**
**Especificación:** `docs/11-infra-despliegue.md`

## Tareas

| ID | Tarea |
|---|---|
| F6-1 | **Siempre:** vídeo de demostración de 2–3 min (guion en `evidence/<fecha>-F6/guion.md`: problema → 6 preguntas → resultados → «qué te falta» → cita oficial → privacidad) grabado sobre el export local en móvil emulado y en escritorio |
| F6-2 | Capturas finales por dispositivo para la memoria (claro y oscuro) |
| F6-3 | **Solo con la autorización D-3:** config nginx de la demo (vhost/ruta, TLS, cabeceras de docs/11 §2.1), script de despliegue atómico con rollback; comprobar antes el espacio en disco del VPS y **reportar** si es insuficiente |
| F6-4 | Comprobaciones posteriores al despliegue: 200 en rutas clave, digest del bundle servido = local, cabeceras CSP/HSTS/Referrer, E2E con `E2E_BASE_URL` en `desktop-chromium` + `mobile-ios` + `@privacy` |
| F6-5 | Banner «Demostración — versión preliminar» y enlace al repositorio y a «Cómo funciona» |

## Verificación (si hay despliegue)

```powershell
curl.exe -sI https://<demo>/comprobar/ | Select-String "content-security-policy|strict-transport|referrer-policy"
# Digest servido frente al local
curl.exe -s https://<demo>/<ruta-bundle> | node -e "..."   # comparar con manifest local
$env:E2E_BASE_URL='https://<demo>'; npx playwright test --config playwright.config.ts --project desktop-chromium --project mobile-ios --grep "@smoke|@privacy"
```

## Puerta de salida
- [ ] Vídeo y capturas en `submission/anexos/`.
- [ ] Si hay demo: comprobaciones posteriores en verde, rollback probado una vez y URL anotada en el handoff.
- [ ] Si no hay demo: anotado en DECISIONS (D-3) y la memoria usa vídeo y repositorio.
- [ ] Recibo y handoff.
