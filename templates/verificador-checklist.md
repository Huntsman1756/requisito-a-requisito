# Checklist del verificador independiente (una ola)

Por cada ruleset `data/eligibility/rules/<slug>.json` del worktree del autor:

## Citas
- [ ] Todo `excerpt` aparece literalmente en `<sourceId>.txt` (texto normalizado).
- [ ] `excerptSha256` correcto.
- [ ] El extracto **prueba lo que afirma el label** (afinidad, no solo literalidad).
- [ ] G11: requisitos, `uncoveredRequirements` y `amount` citan solo fuentes de rango 1–2.
- [ ] Ningún extracto cortado a media palabra.

## Norma
- [ ] **Vigencia (R5-VERIF)**: el programa admite solicitudes nuevas hoy. Revisar
      derogaciones, disposiciones derogatorias y régimen solo transitorio. Si no
      admite → KO, no entra en el nivel 1 (queda en el nivel 2 con nota).
- [ ] Artículos y cifras coinciden con la norma vigente (no con la consigna si
      está anticuada).
- [ ] **IPREM 12 frente a 14 pagas (R5-VERIF)**: si la regla usa un parámetro
      IPREM, comprobar que el umbral elegido es el de la norma citada. «El IPREM»
      sin especificar ⇒ 12 pagas (7.200 €); 14 pagas solo si la norma o el
      criterio oficial del Plan Estatal lo dice. Nunca el umbral más laxo.
- [ ] **Nivel administrativo (R5-VERIF)**: el órgano gestor y la etiqueta de la
      tarjeta coinciden con la administración real (p. ej. la Tarjeta Azul es del
      Ayuntamiento de Madrid, no de la CM). Un ruleset de la CM no puede citar
      solo normas del Ayto. ni al revés.
- [ ] Requisitos `hard` sin medición exacta ⇒ falsos negativos (KO). Preferir
      `soft` cuando el cuestionario no lo mide.

## Motor y goldens
- [ ] `rulesVersion` del golden = la del ruleset.
- [ ] El golden reproduce veredicto + plazo + blockers con el motor real.
- [ ] Valores de los goldens existen en el cuestionario (bandas, opciones).
- [ ] `deadline`/`window` refleja la realidad (OPEN/CLOSED/CLOSED_RECURRING).

## Informe
Salida en `evidence/<fecha>-F3/verificacion-ola-<n>.md`: por cada ruleset
OK/KO + motivo + corrección aplicada o propuesta.
