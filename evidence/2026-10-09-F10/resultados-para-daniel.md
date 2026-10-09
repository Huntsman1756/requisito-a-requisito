# Resultados para decidir con Daniel — F10-RES (2026-10-09)

**Nada de lo siguiente se ha cambiado en las reglas** (§2.4): son reglas
cuyo modelado hoy produce un `posible`/`encaja` más generoso de lo que una
lectura sensata espera, y corregirlas exige decidir sobre la regla — eso lo
decide Daniel, posiblemente en una hoja de revisión nueva.

Contexto de cada propuesta: en F10-RES solo se ha cambiado la PRESENTACIÓN
(orden y agrupación en `src/lib/results-order.ts`, pill «Encaja» más
estricto). Los veredictos del motor no han cambiado.

## R1 · `madrid-ayuda-pago-unico-vg` — sale «Encaja» para casi cualquier residente en la CM

- **Requisito definitorio no comprobable:** «Tener vigente el título que
  acredita la situación de violencia de género (sentencia, orden de
  protección, informe de la Fiscalía…)» — no hay pregunta para ello y la
  única dura es `residente-cm`. Resultado: sale «Encaja» en la mayoría de
  perfiles con renta baja.
- **Cita:** Orden 2739/2022 (BOCM 02/12/2022), normas reguladoras
  art. 3.a — la condición VG es la primera y definitoria.
- **Propuesta:** evaluar si conviene (a) añadir una pregunta sobre título
  VG/condición acreditada (es un dato sensible — posible candidata a
  `declined`), o (b) marcar el veredicto máximo como `posible` cuando el
  requisito definitorio está en `uncoveredRequirements`, o (c) dejarlo así
  y que el ⚠ lo aclare. Decisión de Daniel.

## R2 · `madrid-ayudas-nacimiento-general` — «Encaja» para toda persona ≤ 30 años empadronada en la CM

- **Requisito definitorio no comprobable:** «estar gestante desde la semana
  21 o ser madre con hijo reciente» está en `uncoveredRequirements`; no hay
  pregunta de gestación/parto reciente. Con `age ≤ 30` + empadronamiento
  cumple todas las duras.
- **Cita:** Acuerdo de 27/12/2021 (BOCM), art. 6.a.
- **Propuesta:** igual que R1 — o pregunta nueva («¿estás embarazada o
  acabas de dar a luz?», sensible, candidata a `declined`) o capar el
  veredicto a `posible`.

## R3 · `prestacion-cuidador-no-profesional` — «Encaja» en todos los perfiles

- **El requisito usa el campo `dependency`, pero nuestra pregunta va sobre
  la dependencia de la propia persona usuaria**, y la prestación es para
  quien cuida a un FAMILIAR dependiente. Quien no declara discapacidad
  nunca ve la pregunta de dependencia → queda U → blanda no-F → «Encaja».
- **Cita:** Ley 39/2006 art. 18.1-2 (la dependencia es de la persona
  cuidada, no de quien cuida).
- **Propuesta:** o la pregunta se reformula («¿tienes a tu cargo una
  persona con dependencia reconocida?»), o la regla usa otro campo, o se
  capa a `posible`. Es la ayuda más ruidosa hoy (aparece «Encaja» en 9 de
  10 perfiles típicos). Daniel decide.

## R4 · `prestaciones-dependencia-saad` — «Encaja» en todos los perfiles

- Igual patrón: `sin-reconocimiento-previo` (soft, `dependency=no`) queda
  U/T según el flujo y el requisito definitorio («estar realmente en
  situación de dependencia») no es comprobable.
- **Matiz honesto a favor:** la ayuda ES «solicitar el reconocimiento» —
  cualquiera puede pedirlo; «Encaja» aquí es menos engañoso que en R3.
- **Cita:** Ley 39/2006 arts. 28.1 y 30.1.
- **Propuesta:** revisar junto con R3 — si se reformula la pregunta de
  dependencia, esta regla mejora sola.

## R5 · `ayto-escuela-infantil` — ambos requisitos son soft

- `residir-madrid` (territorio municipio 28079) y `hijo-primer-ciclo`
  (`dependents` con algún menor < 3 años) son **blandos**. Con
  `dependents=[]` o fuera del municipio quedan en F → ya no sale «Encaja»
  (va al grupo plegado «No se pueden descartar»), pero sigue contando como
  «posible» en el tally.
- **Cita:** Bases BOAM 24/03/2026, apdo. 2.1.
- **Propuesta:** valorar pasar ambos a duros — la lista de excepciones
  (hermanos escolarizados, adopción en trámite) cabe en `uncovered`/`any`.
  Daniel decide si entra en una hoja nueva.

## R6 · `madrid-ayudas-nacimiento-adopcion-multiple` — «dos o más personas a cargo» soft

- `dos-o-mas-personas-cargo` (`dependents` ≥ 2) es soft: con `dependents=[]`
  da F → ahora plegada, antes salía «Encaja». El matiz «nacimiento
  múltiple» (mismo parto) no lo expresa nuestro campo, pero **con 0
  personas a cargo la ayuda no aplica en ningún caso**.
- **Cita:** Acuerdo de 28/12/2023 (BOCM), art. 5.1.
- **Propuesta:** el requisito podría ser duro como mínimo en su versión
  contable («≥ 2 a cargo»), dejando en uncovered el matiz de parto
  múltiple. Daniel decide.

## R7 · `asignacion-hijo-a-cargo` — blanda en F para quien no tiene hijos

- `causante-con-discapacidad` es soft con dos vías (hijo con discapacidad a
  cargo / persona adulta con discapacidad, art. 352.2.c). Con
  `dependents=[]` y `disability=no` → F → ya va plegada, no «Encaja».
- **Cita:** LGSS art. 351.a y 352.2.c.
- **Propuesta:** se puede quedar así (el plegado ya la aparta) o endurecer.
  Solo lo lista para que Daniel tenga el cuadro completo.

## R8 · `pension-viudedad` — «Posible» para cualquier persona sin más

- No hay pregunta sobre pareja/viudedad; las duras son edad-banda y
  residencia, así que una persona de 20 años la ve como «Posible».
  Ejemplo citado en la misma instrucción de la sesión («viudedad para
  quien no ha declarado pareja»).
- **Cita:** Decreto 3158/1966, art. 31 ss. (la condición definitoria es el
  vínculo matrimonial con el causante — no comprobable hoy).
- **Propuesta:** pregunta sobre situación de pareja (sensible) o capar a
  posible. Daniel decide.

## Resumen de decisiones

| # | Regla | Acción posible | Riesgo de no tocarla |
|---|---|---|---|
| R1 | pago único VG | pregunta nueva o capar veredicto | «Encaja» falso positivo frecuente |
| R2 | nacimiento general CM | pregunta nueva o capar | idem (< 30 años) |
| R3 | cuidador no profesional | reformular pregunta `dependency` | ruido en todos los perfiles |
| R4 | SAAD | — (honesto) | ruido leve |
| R5 | escuela infantil Ayto. | hard territorio + hijo < 3 | posible sobreinclusivo |
| R6 | nacimiento múltiple | hard `dependents ≥ 2` | ya mitigado (plegada) |
| R7 | asignación hijo | — | ya mitigado (plegada) |
| R8 | viudedad | pregunta pareja o capar | «Posible» benigno pero ruidoso |
