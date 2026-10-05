# F9 — Frescura continua: job diario hasta la entrega de premios

**Fechas:** montar el 10–11/10; **funciona sin intervención hasta el 05/11/2026**
(fin de Madrid Tech Week; la resolución es como máximo 15 días después del
16/10). **Depende de:** repo público + despliegue en GitHub Pages (F6-0).
**Decisión:** ADR-031.

## Por qué
Entre hoy y la valoración del jurado habrá convocatorias nuevas, plazos que cierran
y normas que cambian. El producto debe seguir **verdadero** sin que nadie lo toque,
y **nunca publicar algo no revisado**.

## Qué hace el job (GitHub Actions, `schedule` diario a las 06:00 Europe/Madrid + `workflow_dispatch`)

| Paso | Acción | Si falla o detecta cambios |
|---|---|---|
| 1. Plazos | No requiere job: el navegador calcula el estado del plazo con la fecha del usuario (motor con `today` inyectado). Una ayuda cuyo plazo cierra deja de mostrarse como abierta **ese mismo día** | — |
| 2. Revalidar fuentes | Para cada fuente citada en `data/eligibility/sources/`: descargar, sha256 y texto normalizado. Si el sha coincide, nada | **sha distinto ⇒** comprobar que cada `excerpt` sigue en el texto nuevo. Si sigue: actualizar el snapshot y registrar el cambio. Si **no** sigue: marcar el RuleSet como `stale` ⇒ **sale del nivel 1** (G6/I8) y se abre un issue «Revisar <slug>: la fuente cambió». **Nunca** se reescribe una regla automáticamente |
| 3. Frescura | `verifiedAt` > 30 días ⇒ banner «verificado hace N días»; > 90 ⇒ fuera (I8) | Issue de aviso |
| 4. Descubrir novedades | Consultar fuentes oficiales de convocatorias para la Comunidad de Madrid (BDNS/SNPSAP filtrado por órgano CM y municipios de la CM; sumario diario del BOCM; BOE para estatales). El agente verifica primero los endpoints oficiales disponibles y su licencia | Las novedades van a `data/catalog/leads-new.json` y a **un issue por novedad** («Nueva convocatoria: …, plazo …, fuente …»). **No se publican**: entran al nivel 1 solo con RuleSet citado y revisión (procedimiento F3). Como mucho, la página «Novedades detectadas» (Could) las lista como «pendiente de revisión», sin requisitos |
| 5. Build + deploy | `npm ci` → `validate:full` → deploy a GitHub Pages | Si cualquier gate falla, **no se despliega** y queda publicada la versión anterior (fail-closed) + issue |
| 6. Registro | `data/freshness/runs.jsonl`: fecha, fuentes comprobadas, cambios, novedades, resultado del deploy, digest del bundle | El historial de ejecuciones es evidencia para la memoria («el sistema se mantiene solo») |

## Reglas
- El job **no** tiene credenciales más allá del `GITHUB_TOKEN` del workflow (permisos
  mínimos: `contents: write` solo para los commits del snapshot, y `pages: write`,
  `id-token: write`, `issues: write`).
- Commits automáticos con el autor `requisito-bot` y el mensaje `chore(freshness): …`.
- Si el agente o Daniel no están, el peor caso es: una ayuda sale del nivel 1 o no
  se añade una nueva. **Nunca** se muestra un dato desactualizado como vigente.

## Pruebas
- Fixture de una fuente con el mismo sha ⇒ sin cambios.
- Fuente con un cambio cosmético (el extracto sigue presente) ⇒ snapshot actualizado y regla vigente.
- Fuente con un cambio material (extracto ausente) ⇒ RuleSet `stale` excluido, issue creado (simulado), deploy del resto.
- Gate roto ⇒ no hay deploy (simulado con `act` o con un test del script orquestador).
- Novedad detectada ⇒ lead registrado; **no** aparece en el bundle.

## Puerta de salida
- [ ] El workflow se ejecuta en verde dos días seguidos en GitHub.
- [ ] Los tres casos de fuente (igual, cosmético, material) tienen test.
- [ ] `runs.jsonl` con registros reales.
- [ ] Documentado en «Cómo funciona» (página pública): «revisamos las fuentes cada día».
