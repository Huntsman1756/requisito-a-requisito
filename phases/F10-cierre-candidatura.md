# F10 — Cierre de la candidatura (08/10 → 16/10)

**Fase activa desde el 08/10.** Absorbe lo pendiente de F3, F5, F6, F7 y F8.
Si este documento contradice una fase anterior en algo de fechas u orden, manda
este. En reglas de rigor manda siempre AGENTS.md §4.

## 0. Situación el 08/10 (medida, no supuesta)

| Área | Estado | Riesgo |
|---|---|---|
| Producto | Desplegado en Pages. 52 RuleSets (50 programas: la dependencia tiene versiones A y B, R8-VIG) en el nivel 1 y 401 fichas en el nivel 2 | Bajo |
| Rigor | G1–G12, invariantes I1–I11, exhaustivo con 175.451 perfiles y 0 violaciones, mutación con 0 supervivientes | Bajo |
| **Revisión humana** | **Las 52 reglas tienen `humanReview: pending`**, así que hoy **la release `--strict` del jurado saldría vacía** | **CRÍTICO** |
| Panel NAN | La calibración v2 no cumple. Cerrado por ADR-050: no se usa | Cerrado |
| **Impacto (50 % de la nota)** | Piloto sin hacer: no hay `piloto.json`, ni sesiones, ni testimonios | **CRÍTICO** |
| Memoria | `memoria.md` y `memoria.pdf` del 06/10, sin piloto y con la calibración v1 | Alto |
| Frescura | El CI corre a diario. La tarea local llevaba bloqueada desde el 06/10 por ficheros sin commitear (corregido el 08/10) | Medio |
| QA | 45/45 e2e en 9 de 10 proyectos (Firefox no arranca en este PC). Falta el checklist manual en dispositivos reales | Medio |

**Ruta crítica:** (1) muestreo de Daniel ⇒ `humanReview` ⇒ release estricta;
(2) piloto ⇒ `piloto.json` ⇒ memoria. Todo lo demás es secundario.

## 1. Calendario

| Día | Agente | Daniel |
|---|---|---|
| **08/10 (mié)** | F10-DOC (este plan). F10-REV-1: script para aprobar una ola desde su hoja. F10-IMP-1: mejorar el guion del piloto | **F8-3:** lista de 5–10 personas o entidades y envío del mensaje de difusión. **Empezar el muestreo** (lote-1 y olas 1–3) |
| **09/10 (jue)** | F10-REG: los 7 sospechosos de la tria, en ciclo autor ⇒ verificador. F10-FRONT (Must) | Muestreo de las olas 4–10 (~20 min por ola). Cerrar las citas del piloto |
| **10/10 (vie)** | Aplicar los muestreos (F10-REV-2). Ensayo de la release estricta en local (F10-REL-1) | Sesiones del piloto (F8-4) |
| **11/10 (sáb)** | F10-QA. F10-MEM-1: memoria con todo menos el piloto | Sesiones del piloto. F5-M (móvil real) |
| **12/10 (dom)** | Consolidar los datos del piloto que haya (F8-5) y corregir lo detectado (F8-6) | Sesiones del piloto |
| **13/10 (lun)** | Cierre de F8. F10-MEM-2: memoria final y PDF. Veracidad | Última sesión (si falta). Leer la memoria |
| **14/10 (mar)** | **F10-REL-2: deploy de la release estricta** + comprobaciones posteriores + paquete completo + recibo de fase | Aprobar la memoria (lectura final) |
| **15/10 (mié)** | — (los agentes no presentan nada) | **P-1: firmar y presentar en la sede.** Descargar el justificante |
| 16/10 | Margen absoluto. No se toca la demo | — |

## 2. Tareas por área

Prioridad: **P0** = sin esto no hay candidatura defendible; **P1** = mejora la
nota de forma clara; **P2** = solo si sobra tiempo. Cada tarea se cierra con su
fila en TASK_QUEUE (commit, comandos, evidencia).

### 2.1 Revisión de reglas y release del jurado (back y datos) — P0

| ID | Tarea | Criterio de hecho |
|---|---|---|
| F10-REV-1 | Script `npm run review:apply -- <hoja.md>`. Lee una hoja `muestreo-ola-N.md` (o `lote-1.md`) con las casillas marcadas por Daniel (`☒ OK` / `☒ KO`). Si **hay 2 o más OK y ningún KO**, escribe en todas las reglas de la ola `humanReview: { status: "approved", by: "Daniel", at, notes: "muestreo ADR-040: <slugs revisados>; hoja <ruta>" }`. Con algún KO no escribe nada y lista la ola para revisión completa. Si no hay ninguna casilla marcada, no hace nada. Las reglas de cada ola salen del informe `verificacion-ola-N.md`, nunca de una lista escrita a mano | Tests: hoja vacía ⇒ no hace nada; 1 KO ⇒ no hace nada; 2 OK ⇒ aprueba la ola entera; es idempotente; una regla que no pertenece a la ola ⇒ error |
| F10-REV-2 | Aplicar las hojas que Daniel haya marcado y commitear por ola. **Solo el agente edita las reglas; Daniel solo marca casillas** | `humanReview` aprobado = recuento de reglas de las olas OK |
| F10-REV-3 | Hojas duplicadas: `evidence/2026-10-06-F3/muestreo-ola-9.md` y `evidence/2026-10-06-F9/muestreo-ola-9.md` difieren. Dejar una sola versión válida (la que corresponde a las reglas actuales, posteriores a la Ley 4/2026) y marcar la otra como sustituida | Una sola hoja por ola |
| F10-REL-1 | Ensayo de la release: `npm run eligibility:build:release` en local, con el recuento de reglas incluidas y excluidas. Comprobar que la web compila con ese bundle y que el nivel 2 conserva las fichas excluidas | Recuento ≥ 20 programas (ADR-040) o aviso a Daniel el 12/10 |
| F10-REL-2 | El 14/10, Pages pasa a servir el build `--strict` (ADR-050). Cambiar el workflow de deploy para que use `eligibility:build:release` **a partir de ese commit**, no antes | Producción muestra solo reglas aprobadas, sin la etiqueta «revisión final pendiente» en el nivel 1 |

### 2.2 Calidad de las reglas (back) — P1

Los sospechosos de `evidence/2026-10-06-panel-v2/tria-defectos-v1.md` persisten en
la v2. **Cada uno se corrige con el ciclo normal** (autor ⇒ verificador
independiente ⇒ merge), con su golden o test de frontera:

| ID | Regla / requisito | Qué comprobar |
|---|---|---|
| F10-REG-1 | `asignacion-hijo-a-cargo / causante-con-discapacidad` | El grado (≥33 % si <18 años, ≥65 % si ≥18). Modelarlo si el cuestionario tiene el dato o declararlo en `uncovered` |
| F10-REG-2 | `madrid-abono-transporte-infantil / menor-0-14-a-cargo` | Borde inclusivo o exclusivo de «0–14 años» frente a `age < 14` |
| F10-REG-3 | `subsidio-desempleo / desempleo` | Si el extracto admite supuestos que la condición deja fuera (falso negativo, que es el error más grave, ADR-017) |
| F10-REG-4 | `pension-incapacidad-permanente / edad-inferior-jubilacion-comunes` | El caso de quien está por debajo de la edad pero tiene derecho por otra causa |
| F10-REG-5 | `becas-generales-mefp-2026-2027 / estudiante-universitario` | Declarar en `label` y `uncovered` que se exige grado o máster oficial en un centro español |
| F10-REG-6 | `ayto-escuela-infantil / residir-madrid` | Declarar «prever residir» y las excepciones en `uncovered` |
| F10-REG-7 | `ayto-tarjeta-azul-discapacidad / empadronado` | La norma dice «residente» y la regla exige «empadronado». Comprobar si es más estricta (posible falso negativo) |

**Si F10-REG cambia una regla de una ola ya aprobada por Daniel, ese cambio
necesita volver a aprobarse** (ver cómo en §4). Por eso F10-REG va **antes** de
aplicar los muestreos de esas olas, o se aprueba aparte.

### 2.3 Impacto y piloto (F8) — P0

| ID | Tarea | Resp. |
|---|---|---|
| F8-3 | Lista de 5–10 personas o entidades de Madrid (familia con hijos, persona mayor, joven, autónomo o desempleado; una AMPA o asociación). Variedad de perfiles, no de cantidad | **Daniel**, 08–09/10 |
| F10-IMP-1 | Mejorar el kit (`evidence/2026-10-06-F8/kit/`) con la investigación (ADR-051a): **(a)** tarea medida, «encuentra una ayuda para tu situación y dime qué requisito no sabes si cumples», con tiempo, si la completa (sí/no/con ayuda) y errores de comprensión; **(b)** tarea de contraste opcional: la misma pregunta en la web oficial durante 3 minutos, anotando si la encuentra; **(c)** escala 1–5 de «entiendo por qué sale esto». Sin datos personales; el perfil se escribe solo en el navegador del usuario | agente, 08–09/10 |
| F10-IMP-2 | Plantilla `evidence/<fecha>-F8/piloto.json` con una fila por sesión: id anónimo, fecha, canal, perfil genérico, tiempo, tarea completada, ayudas descubiertas que no conocía, intención de solicitar, cita con permiso (sí/no), referencia a la hoja. Y un script que calcule los agregados (mediana del tiempo, % completado) **solo con lo medido** | agente, 10/10 |
| F8-4 | 3–10 sesiones, presenciales o por videollamada | **Daniel**, 10–13/10 |
| F8-5/6 | Consolidar los datos y corregir los problemas pequeños de comprensión antes de la memoria | agente, 12–13/10 |
| F10-IMP-3 | **Intermediarios:** un correo o mensaje de Daniel a 1–3 entidades (AMPA, asociación vecinal, servicio social). Si alguna responde, se guarda el correo como evidencia. Ningún agente contacta a terceros | **Daniel** |

**Reglas de honestidad del piloto:** nunca se presenta como muestra
representativa. Se dan cifras absolutas («5 de 6 personas…»), no porcentajes con
n < 10. Si salen 0 sesiones, la memoria lo dice y se apoya en las métricas de
producto (F8 §5).

### 2.4 Front — P1/P2

| ID | Tarea | P |
|---|---|---|
| F10-FRONT-1 | Comprobar en producción que cada tarjeta «no cumples» muestra **qué requisito falla y su cita**, y que desde ahí se llega a otras ayudas del mismo evento vital (patrón ClaimIt, ADR-051b). Si ya lo hace, anotarlo; si no, implementarlo **solo con datos del motor** | P1 |
| F10-FRONT-2 | Banner «Demostración — versión preliminar» (`src/app/layout.tsx:60`): con la release estricta, cambiarlo por «Versión piloto · datos comprobados a <fecha>». **Decide Daniel** (D-10) | P1 |
| F10-FRONT-3 | Corregir los problemas de comprensión del piloto (textos, orden y botones; nunca reglas sin el ciclo de verificación) | P0 si aparecen |
| F10-FRONT-4 | Should diferidos de F4-PLUS: G (cita en contexto resaltada) y luego F (reglas legibles) | P2 |
| F10-FRONT-5 | En la ficha, el umbral citado en lenguaje claro («hasta 8.400 € de ingresos del hogar»), como versión mínima y honesta de Cliff Watch. Sin curvas ni simulación | P2 |

### 2.5 Dev y tooling — P1

| ID | Tarea |
|---|---|
| F10-DEV-1 | La hoja de cifras de la memoria se genera desde el repo (`npm run memoria:cifras`): número de reglas y programas, fuentes, tests, perfiles del exhaustivo, mutantes y fichas del nivel 2. **Hay que distinguir RuleSets (52) de programas (50).** Así no se escriben cifras a mano |
| F10-DEV-2 | Script versionado para regenerar `memoria.pdf` (el checklist cita un script `tmp-pdf` que no está en el repo) dentro de `scripts/`, con la salida en `submission/` |
| F10-DEV-3 | Mejora de `mutants.ts`: mutante `field` con una equivalencia evidente (`nacido-en-2008` ↔ edad). **P2, después del 16/10** |

### 2.6 Infra — P1

| ID | Tarea |
|---|---|
| F10-INF-1 | Comprobar que la tarea programada `freshness-local` corre de nuevo tras el cambio del 08/10 (los ficheros sin seguimiento fuera de las rutas de frescura ya no la bloquean). Revisar `F:\AgentState\datawardsmadrid\freshness-local.log` el 09/10. **Regla para agentes: cerrar cada sesión con la evidencia commiteada** |
| F10-INF-2 | La fuente `cm-pensiones-no-contributivas` dio 404 en el CI del 06/10. Ahora está entre las saltadas, que revisa la tarea local. Confirmar la URL vigente; si cambió, actualizar el registro con un snapshot nuevo |
| F10-INF-3 | Congelar la demo desde el 14/10 después de REL-2: solo correcciones bloqueantes. El job diario sigue funcionando, pero un `stale` saca la regla (fail-closed) y eso es correcto |
| F10-INF-4 | R7-VPS, después del 16/10 |

### 2.7 QA — P0/P1

| ID | Tarea |
|---|---|
| F10-QA-1 | `npm run validate:full` en verde antes de REL-2. Guardar la salida en `evidence/<fecha>-F10/` |
| F10-QA-2 | e2e y axe **contra el build estricto** (no solo el normal) y link-check de las URL de producción tras el deploy |
| F10-QA-3 | Firefox: si no arranca en este PC, ejecutar ese proyecto en GitHub Actions (job manual) y guardar el resultado. Si no se puede, se declara la limitación (ya documentada) |
| F10-QA-4 | F5-M (Daniel): checklist manual en el móvil real (`templates/manual-device-checklist.md`), 15 minutos |
| F10-QA-5 | Prueba de privacidad bloqueante en el build estricto: el perfil no aparece en la URL, el almacenamiento compartido, la telemetría ni las peticiones |

### 2.8 Memoria y paquete (F7) — P0

| ID | Tarea |
|---|---|
| F10-MEM-1 (11/10) | Actualizar `memoria.md`: (a) calibración v1 y v2 como resultado negativo medido y decisión de no usar el panel (ADR-050), que es evidencia de rigor; (b) cifras desde F10-DEV-1; (c) una frase sobre la elegibilidad con la respuesta de la Subdirección; (d) estructura alineada con los pesos del art. 16.2: **impacto y resultados 50 %**, ecosistema 30 % (código y datos abiertos, reglas reutilizables, licencia), escalabilidad 20 % (coste ~0, ~5 reglas al día, otras CCAA) |
| F10-MEM-2 (13/10) | Añadir el piloto con la separación **medido / capacidad / plan**. Regenerar `memoria.pdf` (F10-DEV-2). `veracidad.json` con 0 claims sin evidencia (F7-6) |
| F10-MEM-3 (14/10) | Paquete: `submission/` con memoria.pdf, anexos (vídeos y 6–8 capturas **regeneradas con la release estricta**), checklist actualizado y recibo `evidence/2026-10-14-F10/receipt.json` + handoff |

## 3. Decisiones pendientes de Daniel

| ID | Pregunta | Por defecto si no responde el 12/10 |
|---|---|---|
| D-10 | Texto del banner en la release del jurado | «Versión piloto · datos comprobados a <fecha>» |
| D-11 | ¿Se presentan testimonios con nombre de pila o anónimos? | Anónimos con rol genérico |
| D-12 | Si el 12/10 hay menos de 20 programas aprobados: ¿se publica igualmente con lo aprobado o se revisan más hojas? | Se publica lo aprobado y la memoria dice el número exacto |

## 4. Qué NO hacer (errores que ya han pasado o que son fáciles de cometer)

- **No** ejecutar `panel:run` ni escribir `panelReview`. El panel está cerrado (ADR-050).
- **No** marcar `humanReview: approved` sin una hoja de muestreo marcada por Daniel. El agente aplica, no decide.
- **No** modificar una regla aprobada sin volver a pedir el OK. Si F10-REG toca una regla `approved`, se vuelve a `pending`, se añade a una hoja de re-muestreo y Daniel la mira.
- **No** reabrir el producto, la categoría ni la elegibilidad (ADR-022, 028, 029 y 051). No hay que repetir la consulta a la Consejería.
- **No** cambiar el deploy a `--strict` antes del 14/10 (REL-2): ese día la web mostraría menos ayudas sin necesidad.
- **No** dejar scripts generadores en `F:\Temp` (pasó con F0-U). Si un script produce evidencia, va en `scripts/`.
- **No** dejar evidencia sin commitear al cerrar una sesión.
- **No** usar `git add .`, `-A`, `reset --hard` ni `clean`. Se añade cada ruta de forma explícita.
- **No** dar porcentajes del piloto con n < 10 ni presentarlo como representativo.
- **No** contactar con nadie, enviar correos ni presentar nada: eso es de Daniel.
- **No** citar en la memoria las referencias de docs/04 sin abrirlas antes y anotar la fecha.

## 5. Puerta de salida (14/10)

- [ ] Release estricta en producción con ≥ 20 programas `approved` (o la decisión D-12 tomada)
- [ ] `validate:full` en verde y e2e, axe y privacidad sobre el build estricto
- [ ] `piloto.json` (aunque tenga 0 sesiones, dicho así) y cada dato trazable
- [ ] `memoria.pdf` regenerado; `veracidad.json` con 0 cifras huérfanas
- [ ] Anexos regenerados con la release estricta
- [ ] Checklist de presentación al día y recibo de fase + handoff
