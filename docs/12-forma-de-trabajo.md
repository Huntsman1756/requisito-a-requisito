# Forma de trabajo para agentes

## 1. Inicio de sesión (siempre, en este orden)

1. Leer `AGENTS.md` de este repo y `TASK_QUEUE.md`.
2. Abrir **solo** el fichero de la fase activa: `phases/Fx.md`.
3. Leer el último handoff (`handoffs/`, el más reciente).
4. En este repo: `git status --short` y `git log --oneline -5`.
   Si hay cambios que no son tuyos, **no tocarlos**. Si se solapan con tu tarea,
   parar y reportarlo.
5. Elegir la primera tarea `TODO` de la fase activa cuyas dependencias estén
   `HECHO`. Marcarla `EN CURSO` con la fecha.

## 2. Ciclo por unidad de trabajo

1. **Contrato antes del código:** escribir en 3–5 líneas, en la fila de la tarea o
   en el handoff, qué entra, qué sale, los invariantes y qué no se toca.
2. **Test primero** para el motor, las reglas y los defectos: el test falla por la
   razón esperada.
3. Implementar el mínimo que lo hace pasar.
4. Validación focalizada (`npm test -- <ruta>`), luego `npm run check`.
5. Antes de cerrar la unidad: `npm run check`, `npm test` y `npm run build`, en
   secuencia (los tests consumen `out/`).
6. Commit pequeño: `feat(eligibility): …`, `test(eligibility): …`,
   `fix(eligibility): …`, `docs(eligibility): …`. Añadir solo los ficheros de la
   unidad (`git add <rutas>`; **nunca** `git add .`).
7. Actualizar `TASK_QUEUE.md`: estado, commit, comandos con resultado y recuento,
   y ruta de la evidencia.

## 3. Cierre de fase

1. Ejecutar la **puerta** del `phases/Fx.md`, con todos sus comandos.
2. Rellenar `templates/phase-receipt.json` → `evidence/<fecha>-Fx/receipt.json`.
3. Escribir el handoff (`templates/handoff.md`) → `handoffs/<fecha>-Fx.md`.
4. Si la fase tiene revisión humana (F3 reglas, F4 diseño, F7 memoria), dejar el
   paquete listo y marcar `BLOQUEADO: revisión Daniel`. Mientras tanto, se sigue
   con la siguiente tarea independiente.

## 4. Cuándo parar y preguntar a Daniel

- Una regla no se puede representar fielmente (ambigüedad jurídica, discrecionalidad).
- Dos fuentes oficiales del mismo rango se contradicen.
- Hace falta una dependencia nueva, escribir en un repo donante, hacer push,
  crear el repo remoto, desplegar o enviar algo.
- Un test que no es tuyo falla en la línea base, o aparece trabajo sucio ajeno
  solapado con el tuyo.
- Recortar alcance (ver §5).

## 5. Recortes de alcance (si no da tiempo)

Recortar **en este orden**:
1. Número de ayudas del vertical (mínimo 8).
2. Inglés (Should, ADR-024).
3. Estimación de esfuerzo (se oculta).
4. Pulido visual secundario (impresión, animaciones).
5. (Ya no se recorta: con Impact, la demo desplegada y el piloto son Must, ADR-028.)

**Nunca se recortan:** gates de citas, invariantes, privacidad, accesibilidad
AA automática, personas golden revisadas, ni la honestidad de las cifras de la
memoria.

## 6. Referencias externas: cómo usarlas sin copiar

- Se pueden **leer** ACCESS NYC, MyFriendBen, OpenFisca, Aides Jeunes, grant-finder
  y GOV.UK Design System para entender patrones.
- **No** se copia código, textos, iconos, ilustraciones, CSS ni datos de esos
  proyectos.
- Cada patrón adoptado se anota en `docs/04-referencias-internacionales.md` con:
  repositorio, commit o fecha consultada, qué patrón y cómo se implementa aquí de
  forma independiente.
- Antes de citarlos en la memoria se verifica que la afirmación sigue siendo
  cierta (licencia, estado, alcance).

## 7. Higiene del workspace

- Scratch en `F:\Temp\datawardsmadrid-<tarea>\`; snapshots de bytes en
  `F:\AgentState\datawardsmadrid\snapshots\`; caché de Playwright en
  `F:\Caches\ms-playwright`.
- Nada en `C:\` ni en `D:\`. No crear `tmp*` dentro de los repos.
- No borrar worktrees sin las comprobaciones de `F:\_Proyectos\AGENTS.md` §7.
