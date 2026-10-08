# sermas-ortoprotesica-desplazamiento

## Análisis

1. **`derecho-asistencia-sermas` (soft) — condición defectuosa: F sistemático.** La condición es `{field:"territory", op:"eq", value:"cm"}`. Pero en este producto la respuesta `territory` es un objeto estructurado `{ccaa, province, municipality}` (ej. `{ccaa:"13", province:"28", municipality:"28065"}`, ver `src/lib/eligibility-engine/territory.ts` y `tests/eligibility/*`), y el operador `eq` compara por identidad de valor (`v === leaf.value`). Un objeto nunca es igual a la cadena `"cm"` → **el requisito da F para cualquier perfil, incluido un usuario empadronado en Madrid que sí tiene derecho SERMAS**. Es `hard:false`, así que no produce veredicto `no_cumple`, pero el requisito se muestra como no cumplido al 100 % de los usuarios: F indebido sistemático, no solo en bordes. (Comparar con el resto del corpus, que usa `within_territory {ccaa:"13"}`.)

2. **Aun corregido el operador, el proxy es imperfecto**: la norma pide «las personas con derecho a la asistencia sanitaria a cargo del Servicio Madrileño de Salud en el momento de producirse el hecho causante» (Decreto 84/2021, art. 2) — el derecho SERMAS no coincide 1:1 con el empadronamiento en la CM (mutualistas con asistencia concertada, personas desplazadas, empadronados fuera con tarjeta SERMAS, y a la inversa empadronados sin derecho efectivo). Con `within_territory` seguiría habiendo F a algún titular SERMAS empadronado fuera.

3. **`uncoveredRequirements`** — Honestos: prescripción por especialista del SNS («emitida por un médico especialista en la materia correspondiente … perteneciente al Sistema Nacional de Salud», art. 12), endoso como alternativa a adelantar el importe (art. 3.e/25) y plazo de 12 meses desde el justificante de pago («la solicitud será inadmitida por extemporánea»). Nota de fidelidad: la vigencia de 12 meses de la prescripción (art. 15) es una regla distinta del plazo de solicitud; ambas figuran.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| derecho-asistencia-sermas | alto | Condición `{field:"territory", op:"eq", value:"cm"}` evalúa siempre F (objeto ≠ string) → F mostrado a todos los usuarios, incluidos beneficiarios reales (art. 2: «personas con derecho a la asistencia sanitaria a cargo del Servicio Madrileño de Salud») | Sustituir por `within_territory {ccaa:"13"}` como mínimo; idealmente pasar el requisito a `uncoveredRequirements` («tener derecho a asistencia sanitaria SERMAS») porque el empadronamiento no prueba el derecho sanitario |
| derecho-asistencia-sermas (proxy) | bajo | Empadronamiento ≠ derecho SERMAS (mutualistas, desplazados, tarjetas vigentes con padrón fuera) | Cubierto si se adopta la propuesta anterior |
