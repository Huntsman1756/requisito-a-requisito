# sermas-reintegro-gastos-sanitarios

## Análisis

1. **`titular-tarjeta-sermas` (soft) — condición defectuosa: F sistemático.** Idéntico defecto al de `sermas-ortoprotesica-desplazamiento`: `{field:"territory", op:"eq", value:"cm"}` compara por igualdad de valor un objeto `{ccaa, province, municipality}` con la cadena `"cm"` → **F para cualquier perfil**. Es soft (no bloquea el veredicto) pero muestra el requisito como incumplido al 100 % de los usuarios, incluido el titular SERMAS empadronado en Madrid — F indebido sistemático.

2. **Proxy imperfecto aun corregido**: el requisito pide «Ser titular de la Tarjeta Sanitaria Individual emitida por la Comunidad de Madrid o tener derecho a la asistencia sanitaria a cargo del SERMAS» — el empadronamiento no prueba la titularidad (mutualistas, personas desplazadas, empadronados fuera con tarjeta, empadronados sin derecho). Debe quedar como requisito declarado (`uncovered`) o aproximarse con `within_territory`.

3. **`uncoveredRequirements`** — Honestos: `gasto-acreditado` enumera los tres tipos del modelo oficial («Gastos de farmacia □ Gastos de asistencia sanitaria (incluido personal de empresas en el exterior y en embajadas) □ Gastos de desplazamiento (incluido alojamiento, manutención y ambulancia, en su caso)») y `plazos-por-tipo` advierte correctamente de que cada tipo puede tener plazo propio — decisión prudente de no afirmar un plazo único. Documentos (DNI anverso/reverso, informe médico en castellano, factura —no tickets—, IBAN del titular de la tarjeta) verificados literalmente en el anexo de la Resolución 21/2010.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| titular-tarjeta-sermas | alto | Condición `{field:"territory", op:"eq", value:"cm"}` → F sistemático para todo perfil (objeto ≠ string), pese a que el requisito normativo es «titular de la Tarjeta Sanitaria … o derecho a la asistencia sanitaria a cargo del SERMAS» | Sustituir por `within_territory {ccaa:"13"}` como mínimo; idealmente mover a `uncoveredRequirements` (titularidad de la tarjeta no es deducible del empadronamiento) |
| titular-tarjeta-sermas (proxy) | bajo | Empadronamiento ≠ titularidad SERMAS | Resuelto si se adopta la propuesta anterior |
