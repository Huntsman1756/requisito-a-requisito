# Resultados por la ruta real — 2026-10-09 (F10-RES)

Medición por la **ruta real** (regla 12): el navegador recorre `/comprobar/`
respondiendo todas las preguntas como lo haría cada persona, y se lee la
pantalla de resultados (título, sello y orden). Script: `scripts/_ruta-real.mjs`
sobre el export estático local (`serve-export.mjs`, puerto 4399). 20
recorridos completos: 10 perfiles típicos + 10 personas golden variadas.

**Fecha de consulta fijada por el reloj de Playwright: 2026-10-09.**

## Qué se midió antes del cambio

Con el listado anterior (orden del bundle ≈ alfabético, sin agrupar por
veredicto), las posibles con más incógnitas ocupaban la cabeza de la lista.
Ejemplos medidos (top-10 real, antes):

- `tipico:familia-2-menores-getafe`: 1.º «Asignación por hijo o menor a
  cargo» (Posible), 2.º «Emergencia social Ayto. Madrid» (Posible),
  3.º «Escuelas infantiles Ayto. Madrid» (Posible)… IMV salía 10.º.
- `tipico:mayor-65-pension-baja` (68 años, jubilada, sin personas a cargo):
  1.º «Asignación por hijo o menor a cargo», 3.º «Escuelas infantiles
  municipales», 5.º «Becas del Ministerio (universidad)», 8.º «Cese de
  actividad de autónomos» — todas «Posible».
- `golden:imv`: «Asignación por hijo», «Escuelas infantiles», «Becas
  universidad», «Cese de actividad de autónomos» en cabeza; el propio IMV
  quedaba 9.º.

**Por qué salían así:** dos causas apiladas.

1. *Orden:* la lista mostraba las evaluaciones en el orden del bundle
   (alfabético) dentro de cada veredicto; «probable» casi nunca existe, así
   que todo caía en el grupo «posible» y ordenado por nombre, no por
   ajuste.
2. *«Encaja» demasiado laxo:* se etiquetaba «Encaja» todo lo `posible` con
   los requisitos duros en T, aunque una blanda ya fuera F (p. ej.
   «2 o más personas a cargo» con `dependents=[]`). Además muchas reglas
   llevan solo el territorio como duro y el resto blando/no comprobable, lo
   que dejaba «Encaja» a ayudas cuyo requisito definitorio no se puede
   comprobar (ver `resultados-para-daniel.md`).

## Cambio aplicado (solo presentación — ninguna regla tocada)

`src/lib/results-order.ts` (extraído de `ResultsView.tsx` para poder
probarlo sobre el bundle real):

- Grupos en pantalla: **Encaja** → **Posible con pocas incógnitas** (≤ 2 U y
  nada en F) → **«No se pueden descartar»** (plegado, con contador; posibles
  con > 2 U o alguna blanda en F) → **Faltan datos** (insuficiente) →
  «No parece aplicarte» (ya iba plegado).
- `isEncaja` endurecido: ningún requisito en F (ni duro ni blando) puede
  salir como «Encaja».
- Dentro de cada grupo: más requisitos cumplidos primero, a igualdad menos
  incógnitas, a igualdad título.
- Los programas plegados conservan enlace a su ficha (`compact` añade
  «Ver ficha completa»).

Bug de mapeo buscado (§2.3): `residenceMonths` sí se deriva de
`residenceSince` (`operators.ts` → `derived.ts`) y `dependents` alimenta los
`count_where_*`. El atasco del medidor era del propio script (sembraba
`birthYear` como número en vez de `{min,max}`), no del producto.

## Después — contadores por perfil (top de la página)

| Perfil | Encajan | Dependen de un dato | Por responder | Relacionadas (nivel 2) |
|---|---|---|---|---|
| tipico:familia-2-menores-getafe | 10 | 30 | 4 | 61 |
| tipico:mayor-65-pension-baja | 7 | 28 | 3 | 61 |
| tipico:joven-26-alquila | 5 | 29 | 3 | 61 |
| tipico:desempleado-larga-47 | 5 | 27 | 3 | 64 |
| tipico:discapacidad-40 | 6 | 27 | 2 | 60 |
| tipico:monoparental-38 | 11 | 27 | 4 | 61 |
| tipico:estudiante-20 | 7 | 26 | 2 | 61 |
| tipico:autonomo-44 | 2 | 30 | 2 | 61 |
| tipico:vg-34 | 9 | 28 | 4 | 64 |
| tipico:sin-ingresos-33 | 4 | 29 | 3 | 64 |

(n.º de encajan cae frente a los 9–17 de antes: era artificialmente alto por
la laxitud de `isEncaja`; el veredicto de cada ayuda no cambia, solo la
etiqueta «Encaja» y el orden.)

## Después — top-10 abierto por perfil típico

### tipico:familia-2-menores-getafe
1. Bono alquiler joven (CM) — Encaja
2. Ayuda al alquiler (Plan Estatal) — Encaja
3. Ayuda por nacimiento o adopción múltiple (CM) — Encaja *(2 menores a cargo → blanda en T)*
4. Complemento de ayuda para la infancia (IMV) — Encaja
5. Título oficial de familia numerosa — Encaja
6. Permiso y prestación por nacimiento y cuidado del menor — Encaja
7. Prestación por cuidado de menores con enfermedad grave — Encaja
8. Transporte público gratuito infantil — Encaja
9. Prestación para cuidadoras no profesionales — Encaja ⚠ *(ver lista de Daniel)*
10. Reconocimiento de la dependencia (SAAD) — Encaja ⚠ *(idem)*

### tipico:mayor-65-pension-baja
1. Pensión no contributiva — Encaja
2. Tarjeta azul de transporte (discapacidad, Madrid) — Encaja *(pensionistas entran en la ayuda: `employmentStatus=jubilado` es vía dura)*
3. Prestación para cuidadoras no profesionales — Encaja ⚠
4. Reconocimiento de la dependencia (SAAD) — Encaja
5. Pensión de jubilación contributiva — Encaja
6. Ayuda pago único víctimas de violencia de género (CM) — Encaja ⚠ *(título VG no comprobable — lista de Daniel)*
7. Bono social térmico — Encaja
8. Ingreso Mínimo Vital — Posible
9. Reintegro de gastos sanitarios (SERMAS) — Posible
10. Reintegro ortoprotésico SERMAS — Posible

### tipico:joven-26-alquila
1. Bono alquiler joven (CM) — Encaja
2. Prestación para cuidadoras no profesionales — Encaja ⚠
3. Reconocimiento de la dependencia (SAAD) — Encaja
4. Ayuda pago único VG (CM) — Encaja ⚠
5. Bono social térmico — Encaja
6. Ingreso Mínimo Vital — Posible
7. Tarjeta azul (discapacidad) — Posible
8. Pensión de incapacidad permanente — Posible
9. Reintegro gastos sanitarios SERMAS — Posible
10. Reintegro ortoprotésico SERMAS — Posible

### tipico:desempleado-larga-47
1. Renta Mínima de Inserción (CM) — Encaja
2. Ayuda pago único VG (CM) — Encaja ⚠
3. Bono social térmico — Encaja
4. Prestación para cuidadoras no profesionales — Encaja ⚠
5. Reconocimiento de la dependencia (SAAD) — Encaja
6. Ingreso Mínimo Vital — Posible
7. Subsidio por desempleo (insuficiencia) — Posible
8. Emergencia social (Ayto. Madrid) — Posible
9. Tarjeta azul (discapacidad) — Posible
10. Bono Social Eléctrico — Posible

### tipico:discapacidad-40
1. Pensión no contributiva — Encaja
2. Reconocimiento de la dependencia (SAAD) — Encaja
3. Tarjeta azul de transporte — Encaja
4. Prestación por nacimiento o adopción (FN, monoparental o discapacidad) — Encaja *(rama por discapacidad, correcto)*
5. Ayuda pago único VG — Encaja ⚠
6. Bono social térmico — Encaja
7. Ingreso Mínimo Vital — Posible
8. Asignación por hijo a cargo — Posible *(vía art. 352.2.c para persona adulta con discapacidad)*
9. Pensión de incapacidad permanente — Posible
10. Pensión de orfandad — Posible ⚠ *(blanda «edad en fallecimiento» con vía discapacidad)*

### tipico:monoparental-38
1. Ayuda al alquiler (Plan Estatal) — Encaja
2. Complemento infancia (IMV) — Encaja
3. Permiso y prestación nacimiento y cuidado — Encaja
4. Prestación cuidado menores enfermedad grave — Encaja
5. Transporte público gratuito infantil — Encaja
6. Prestación cuidadoras no profesionales — Encaja ⚠
7. Reconocimiento dependencia (SAAD) — Encaja
8. Descuento de tren FN — Encaja *(la regla cuenta monoparental con título)*
9. Prestación nacimiento FN/monoparental/discapacidad — Encaja
10. Ayuda pago único VG — Encaja ⚠

### tipico:estudiante-20
1. Bono alquiler joven (CM) — Encaja
2. Ayuda económica por nacimiento (CM) — Encaja ⚠ *(«estar gestante o madre reciente» no comprobable — lista de Daniel)*
3. Abono transporte joven (CM) — Encaja
4. Ayuda pago único VG — Encaja ⚠
5. Bono social térmico — Encaja
6. Prestación cuidadoras — Encaja ⚠
7. Reconocimiento dependencia (SAAD) — Encaja
8. Becas Bachillerato centros privados (CM) — Posible
9. Emergencia social (Ayto. Madrid) — Posible
10. Tarjeta azul (discapacidad) — Posible

### tipico:autonomo-44
1. Prestación cuidadoras no profesionales — Encaja ⚠
2. Reconocimiento dependencia (SAAD) — Encaja
3+. *(los demás salen como «dependen de un dato» o plegadas — 30 en total;
   «cese de actividad de autónomos» queda plegada: blanda
   `employmentStatus=autonomo` en T pero el resto del trámite no comprobable)*

### tipico:vg-34
1. Ayuda al alquiler (Plan Estatal) — Encaja
2. Bono alquiler joven — Encaja
3. Beca de comedor escolar — Encaja
4. Bonificación IBI familias numerosas — Encaja *(la regla admite monoparental)*
5. Complemento infancia (IMV) — Encaja
6. Renta Mínima de Inserción — Encaja
7. Ayuda pago único VG — Encaja
8. Ayuda nacimiento/adopción múltiple — Encaja
9. Bono social térmico — Encaja
10. Transporte infantil < 7 — Encaja

### tipico:sin-ingresos-33
1. Bono alquiler joven — Encaja
2. Ayuda al alquiler (Plan Estatal) — Encaja
3. Renta Mínima de Inserción — Encaja
4. Ayuda pago único VG — Encaja ⚠
5+. *(resto posible/plegadas)*

## Juicio de plausibilidad (§2.2)

Tras el cambio **no hay ayudas claramente absurdas en el top-10 abierto de
ningún perfil típico** (test `tests/eligibility/results-order.test.ts` lo
fija sobre datos reales). Lo que queda son dos familias de casos:

- **Honestas pero ruidosas (marcadas ⚠):** SAAD y «cuidadoras no
  profesionales» encajan en casi todos los perfiles porque su requisito
  definitorio no es comprobable con las preguntas actuales (la dependencia
  la puede tener la propia persona o un familiar; nuestra pregunta solo
  cubre el primer caso). Van a `resultados-para-daniel.md`.
- **Etiqueta engordada antes, corregida:** «nacimiento múltiple» con 0
  personas a cargo, «escuela infantil», «orfandad» a los 40, «asignación
  por hijo» sin hijos… ahora salen plegadas en «No se pueden descartar»
  porque tienen una blanda en F, no como «Encaja».

Nivel 2: los 60–64 programas «relacionadas, sin comprobar» siguen en su
sección propia (sin veredicto, ADR-052); no se mezclan con los evaluados.
