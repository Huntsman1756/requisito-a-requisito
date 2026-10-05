# Back, infraestructura y despliegue

## 1. No hay backend en tiempo de ejecución (decisión)

El «back» es el **pipeline de build** (Node 22 + TypeScript, scripts de
la-ayuda). Ningún servidor evalúa perfiles: así se garantiza la privacidad, el
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

### 1.1 Scripts (en la-ayuda; nombres orientativos)

| Script npm | Hace | Falla si |
|---|---|---|
| `eligibility:snapshot -- --url <u> --id <id>` | Descarga, sha256, extrae texto normalizado y escribe `sources/<id>.json` + `.txt` | Dominio fuera del registro, descarga incompleta, sha distinto del esperado con `--expect` |
| `eligibility:validate` | Zod de reglas/catálogo/parámetros; autoridad; citas; extractos; frescura; conflictos | Cualquier gate (docs/02 §3 y docs/07 §5) |
| `eligibility:build` | Genera bundle + manifiesto + `eligibility-report.json`; se engancha al `build` existente | `validate` falla |
| `eligibility:exhaustive` | Tests exhaustivos y de monotonía (puede ir dentro de `npm test` si tarda < 60 s) | Invariante o monotonía |
| `eligibility:mutate` | Mutación dirigida de umbrales | Algún mutante sobrevive |

Integración con el build bloqueado de la-ayuda (`scripts/build-locked.ts`):
añadir el paso **sin** alterar los gates editoriales existentes. Si eso no es
posible sin tocar contratos, se ejecuta `eligibility:build` como `prebuild`
documentado. Decisión en un ADR del repo destino.

### 1.2 Telemetría (opcional)

Se reutiliza el colector existente (ADR-020 de la-ayuda). Eventos permitidos:
`elig_start`, `elig_complete{probable:n,posible:n,insuficiente:n}`,
`elig_missing_answered`, `elig_apply_click{slug}` e `invariant_failed{slug,code}`.
Nada del perfil. Si el colector no está desplegado, la memoria lo dice.

## 2. Infraestructura de servido

Estado observado el 2026-10-05: el VPS tiene nodo de pipeline/telemetría, **sin
nginx ni dominio para la-ayuda**, con el disco al 91–93 %. El gate strict está en
rojo por deuda legacy, y **la-ayuda no se puede desplegar**.

Opciones para que el jurado vea la demo (decide Daniel, D-3):

| Opción | Qué es | Requisitos | Riesgo |
|---|---|---|---|
| A. Demo estática separada | Build del worktree servido en un vhost/ruta de demo (`demo.<dominio>`) solo con el vertical y un banner «Demostración» | Autorización explícita, dominio, nginx, TLS, espacio en disco | No debe presentarse como la-ayuda en producción. Requiere su propio canary y comprobación posterior al despliegue |
| B. Vídeo + capturas + repositorio | Vídeo de 2–3 min, capturas por dispositivo y enlace a GitHub | Ninguno | Menos impacto, pero cero riesgo |
| C. Ambas | B siempre; A si se autoriza | — | Recomendada |

### 2.1 Configuración del servido (si se elige A)

- Nginx estático, HTTP→HTTPS y HSTS.
- Cabeceras: `Content-Security-Policy: default-src 'self'; script-src 'self'` (sin
  `unsafe-inline` si el export lo permite; si no, hashes); `connect-src 'self'`
  más el colector, si se usa; `frame-ancestors 'none'`;
  `Referrer-Policy: no-referrer`; `Permissions-Policy` restrictiva;
  `X-Content-Type-Options: nosniff`.
- Caché: `/_next/static/*` inmutable 1 año; bundle con nombre con digest
  inmutable; HTML `no-cache`.
- Compresión gzip/brotli.
- Despliegue atómico por cambio de symlink (`current`), como en el procedimiento
  de releases de la-ayuda, con rollback al symlink anterior.
- Comprobaciones posteriores: HTTP 200 en rutas clave, digest del bundle servido
  igual al local, cabeceras presentes y una pasada de E2E con `E2E_BASE_URL`
  apuntando a la demo.

### 2.2 Prohibiciones

- Usar el despliegue de la-ayuda (`pipeline:promote-release`) para la demo.
- Desplegar sin autorización explícita de Daniel en esa sesión.
- Liberar espacio en el VPS borrando cosas sin autorización (el disco al 93 % es
  un riesgo que se **reporta**, no se resuelve por iniciativa propia).
- Usar Cloudflare o Vercel (retirados en la-ayuda).

## 3. Entornos

| Entorno | Dónde | Para |
|---|---|---|
| Local de desarrollo | `npm run dev` en el worktree | Desarrollo |
| Export local | `npm run build` + `npm run preview` (`serve-export.mjs`) | E2E, accesibilidad, rendimiento (lo que se prueba es lo que se sirve) |
| Demo | VPS (opción A) | Jurado |
| CI | GitHub Actions de la-ayuda | Solo si Daniel autoriza el push de la rama; no se deduce aceptación de CI a partir de pruebas locales |
