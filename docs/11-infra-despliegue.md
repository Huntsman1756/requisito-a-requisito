# Back, infraestructura y despliegue

## 1. No hay backend en tiempo de ejecución (decisión)

El «back» es el **pipeline de build** (Node 22 + TypeScript, scripts propios). Ningún servidor evalúa perfiles: así se garantiza la privacidad, el
coste es casi nulo y escala a cualquier número de usuarios (criterio de
escalabilidad). ADR-011.

```
snapshot de fuentes ──▶ validate (Zod + gates) ──▶ eligibility-bundle.json + manifest (digest)
       │                         │                              │
  data/eligibility/sources   eligibility-report.json      next build (output: export)
                                                                │
                                                     out/ (HTML+JS+JSON estáticos)
                                                                │
                                                     nginx en el VPS (o vídeo para el jurado)
```

### 1.1 Scripts npm del proyecto

| Script npm | Hace | Falla si |
|---|---|---|
| `eligibility:snapshot -- --url <u> --id <id>` | Descarga, sha256, extrae texto normalizado y escribe `sources/<id>.json` + `.txt` | Dominio fuera del registro, descarga incompleta, sha distinto del esperado con `--expect` |
| `eligibility:validate` | Zod de reglas/catálogo/parámetros; autoridad; citas; extractos; frescura; conflictos | Cualquier gate (docs/02 §3 y docs/07 §5) |
| `eligibility:build` | Genera bundle + manifiesto + `eligibility-report.json`; se engancha al `build` existente | `validate` falla |
| `eligibility:exhaustive` | Tests exhaustivos y de monotonía (puede ir dentro de `npm test` si tarda < 60 s) | Invariante o monotonía |
| `eligibility:mutate` | Mutación dirigida de umbrales | Algún mutante sobrevive |

Además: `catalog:import` (docs/13 §2) y `validate:full` (check + lint + test +
build + exhaustivo + E2E de humo + a11y; lo usa el cierre de cada fase). El
`build` ejecuta `eligibility:validate` y `eligibility:build` **antes** de
`next build` y falla si fallan.

### 1.2 Telemetría (Could)

No hay colector propio. Si se añade, eventos agregados sin perfil (`elig_start`,
`elig_complete{probable:n,…}`, `elig_apply_click{slug}`, `invariant_failed{slug,code}`)
a un endpoint del mismo dominio, y requiere autorización. Por defecto, **sin
telemetría** y la memoria explica cómo se medirá.

## 2. Infraestructura de servido

Al ser un proyecto independiente, **la demo no depende del estado de la-ayuda**
(ADR-022/025). Daniel ya opera un VPS (el de edubecas.es).

| Opción | Qué es | Requisitos | Recomendación |
|---|---|---|---|
| A. Demo pública en un vhost propio | `out/` servido por nginx en el VPS existente, en un subdominio o dominio propio (D-3) | Autorización explícita, DNS, TLS (Let's Encrypt), espacio en disco comprobado antes | **Sí**, si Daniel autoriza: el jurado puede usarla |
| B. Vídeo + capturas + repo público | 2–3 min de recorrido | Ninguno | **Siempre** (respaldo) |

### 2.1 Configuración del servido

- Nginx estático, HTTP→HTTPS y HSTS.
- Cabeceras: `Content-Security-Policy: default-src 'self'; script-src 'self'` (con
  hashes si el export necesita inline); `connect-src 'self'`; `frame-ancestors 'none'`;
  `Referrer-Policy: no-referrer`; `Permissions-Policy` restrictiva;
  `X-Content-Type-Options: nosniff`.
- Caché: `/_next/static/*` inmutable 1 año; bundle de reglas con digest en el
  nombre, inmutable; HTML `no-cache`. Compresión gzip/brotli.
- Despliegue atómico: `releases/<id>/` + symlink `current`; rollback = volver al
  symlink anterior. Script `scripts/deploy.ps1` (o `.sh` en el VPS) **sin
  credenciales en el repo**.
- Comprobaciones posteriores: HTTP 200 en rutas clave, digest del bundle servido =
  local, cabeceras presentes, E2E de humo y privacidad con `E2E_BASE_URL`.
- **No tocar** la configuración ni los procesos de edubecas.es en ese VPS: vhost
  aparte, usuario y directorio aparte.

### 2.2 Prohibiciones

- Desplegar sin autorización explícita de Daniel en esa sesión.
- Modificar servicios, vhosts o datos de edubecas.es u otros proyectos del VPS.
- Liberar espacio borrando cosas sin autorización (se **reporta**).
- Secretos en el repo (el repo será público, ADR-025).
- Cloudflare o Vercel.

## 3. Entornos

| Entorno | Dónde | Para |
|---|---|---|
| Desarrollo | `npm run dev` en este repo | Desarrollo |
| Export local | `npm run build` + `npm run preview` (`serve-export.mjs` portado) | E2E, a11y, rendimiento: se prueba lo que se sirve |
| Demo | VPS, vhost propio (opción A) | Jurado |
| CI | GitHub Actions del repo nuevo (`check`, `lint`, `test`, `build`, E2E Chromium) | Tras crear el repo remoto con autorización (D-4) |
