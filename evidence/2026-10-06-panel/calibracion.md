# Calibración del panel multimodelo — 2026-10-06

- Prompt: `panel-v1` · modelos: deepseek-v4-flash, qwen3.8-flash, mimo-v2.6-flash
- Ítems: 223 con defecto (mutantes + históricos) · 88 controles
- Registro crudo: `raw/calls.jsonl` · casos: `casos.json` · veredictos: `resultados.json`

## Criterio de aceptación (docs/17 §6) — **NO CUMPLE**

| Criterio | Umbral | Medido | Resultado |
|---|---|---|---|
| Detección de mutantes | ≥ 95 % | 99.1 % | OK |
| …en mutantes de falso positivo | 100 % | 100.0 % | OK |
| Falsas alarmas en controles | ≤ 20 % | 97.7 % | KO |

## Matriz de confusión

| | Detectado | No detectado | Alarma | Limpio | Inválidas |
|---|---|---|---|---|---|
| deepseek-v4-flash | 212 | 11 | 72 | 16 | 6 |
| qwen3.8-flash | 216 | 7 | 85 | 3 | 91 |
| mimo-v2.6-flash | 210 | 13 | 76 | 12 | 33 |
| **Panel (agregado)** | **221** | **2** | **86** | **2** | — |

## Detección por tipo de defecto

| Tipo | n | Detectados | Tasa |
|---|---|---|---|
| field | 39 | 37 | 94.9 % |
| hard_soft | 29 | 29 | 100.0 % |
| hist_azul_12p | 1 | 1 | 100.0 % |
| hist_bono_edad | 1 | 1 | 100.0 % |
| hist_renfe_rango3 | 1 | 1 | 100.0 % |
| hist_rmi_menores | 1 | 1 | 100.0 % |
| hist_rmi_municipio | 1 | 1 | 100.0 % |
| invert | 39 | 39 | 100.0 % |
| iprem | 8 | 8 | 100.0 % |
| op_swap | 27 | 27 | 100.0 % |
| removed_req | 30 | 30 | 100.0 % |
| umbral_lax | 23 | 23 | 100.0 % |
| umbral_pct | 23 | 23 | 100.0 % |

## Mutantes NO detectados (2)

- `bono-cultural-joven/req:nacido-en-2008#field` — campo birthYear→territory
  - deepseek-v4-flash: exact/ok fn=low fp=low — El extracto exige cumplir 18 años en 2026, lo que equivale a haber nacido en 2008, tal como codifica el valor [2008,2008]; el requisito sí aparece como excluyen
  - qwen3.8-flash: exact/ok fn=none fp=none — La condición de haber nacido en 2008 equivale a cumplir 18 años durante 2026. La nacionalidad/residencia y demás requisitos aparecen en uncovered, por lo que no
  - mimo-v2.6-flash: exact/ok fn=none fp=none — Cumplir 18 años en 2026 equivale exactamente a haber nacido en 2008, por lo que la condición entre 2008 y 2008 reproduce el extracto. El requisito se impone com
- `complemento-ayuda-infancia/req:menor-en-unidad#field` — campo dependents→disability
  - deepseek-v4-flash: exact/ok fn=none fp=none — La condición exige al menos un miembro de la unidad de convivencia menor de 18 años, que es exactamente lo que dice el extracto ('unidades de convivencia que in
  - qwen3.8-flash: exact/ok fn=none fp=none — La condición modela correctamente la existencia de un menor de 18 años en la unidad de convivencia, tal como exige el extracto para el complemento de ayuda a la
  - mimo-v2.6-flash: exact/ok fn=low fp=low — La condición (al menos 1 miembro con age < 18) traduce fielmente el extracto, que exige unidades de convivencia que «incluyan menores de edad entre sus miembros

## Falsas alarmas sobre controles (86)

- `asignacion-hijo-a-cargo/req:causante-con-discapacidad#control` — falso positivo
  - deepseek-v4-flash: too_lax/should_be_hard — La condición acepta dependientes con discapacidad sin verificar el grado exigido (≥33 % si <18, ≥65 % si ≥18) e incluso 'unknown/declined', y para mayores de 18
  - qwen3.8-flash: too_lax/should_be_hard — La condición admite dependientes con discapacidad sin confirmar y una alternativa de beneficiario adulto no probada en el extracto, sin exigir los grados ≥33 %/
  - mimo-v2.6-flash: too_lax/ok — El extracto exige un grado concreto de discapacidad (≥33 % si el causante es menor de 18 años y ≥65 % si es mayor), mientras que la condición acepta cualquier '
- `asignacion-hijo-a-cargo/completeness#control` — falso positivo
  - deepseek-v4-flash: cannot_tell/ok — No se aporta en este ítem ni la condición formal ni el extracto literal, solo el contexto, por lo que no es posible comprobar si la condición reproduce el texto
  - qwen3.8-flash: exact/should_be_hard — El requisito modelado de hijo o menor a cargo con discapacidad coincide con los artículos 351.a y 352 del contexto, y los demás requisitos aparecen en `uncovere
  - mimo-v2.6-flash: cannot_tell/should_be_hard — El dato `label` no es una afirmación sobre el extracto sino una pregunta de auditoría y no se ha facilitado la condición codificada, por lo que no puede juzgars
- `ayto-emergencia-social/req:mayor-edad#control` — falso negativo
  - deepseek-v4-flash: too_strict/ok — El extracto admite como beneficiario al mayor de edad O al menor emancipado, pero la condición 'age >= 18' excluye a los menores emancipados, por lo que es más 
  - qwen3.8-flash: too_strict/should_be_soft — El extracto admite como beneficiario a mayor de edad o menor emancipado, pero la condición age gte 18 excluye a los menores emancipados. Al no poder comprobar l
  - mimo-v2.6-flash: too_strict/ok — La condición "age gte 18" omite la alternativa del texto, "o menor emancipado", por lo que excluiría a menores emancipados menores de 18 años que sí cumplen el 
- `ayto-emergencia-social/req:empadronado-madrid#control` — falso positivo
  - deepseek-v4-flash: too_lax/ok — La condición solo comprueba el empadronamiento en el municipio de Madrid, mientras que el extracto exige, según el caso, el distrito de la solicitud o el munici
  - qwen3.8-flash: too_lax/should_be_soft — La condición solo exige empadronamiento en el municipio de Madrid y no distingue el distrito de la solicitud ni la tramitación por el Área de Gobierno, por lo q
  - mimo-v2.6-flash: too_lax/ok — La condición solo comprueba estar empadronado en el municipio de Madrid (28079), pero el extracto exige además estar empadronado en el Distrito al que se dirige
- `ayto-emergencia-social/req:carencia-recursos#control` — falso negativo
  - deepseek-v4-flash: too_strict/ok — El extracto solo exige acreditar la situación de necesidad y no fija umbral de ingresos; usar 1×IPREM como corte es más estricto y podría excluir a quien cumple
  - qwen3.8-flash: cannot_tell/ok — salida inválida
  - mimo-v2.6-flash: too_strict/ok — El extracto solo exige "acreditar la situación de necesidad" sin fijar umbral de ingresos, de modo que condicionarla a renta ≤ 1×IPREM es más exigente que la no
- `ayto-emergencia-social/completeness#control` — falso positivo
  - deepseek-v4-flash: cannot_tell/ok — No se aporta condición formal ni extracto que comparar, solo el contexto normativo, por lo que la fidelidad no puede juzgarse. El conjunto modelado/no cubierto 
  - qwen3.8-flash: too_lax/ok — La regla modelada omite requisitos expresos como documentación, copago y exclusiones, por lo que puede incluir a quien no cumple. También hay riesgo de falsos n
  - mimo-v2.6-flash: cannot_tell/ok — No se facilitan ni la condición codificada ni el extracto literal de la regla concreta, por lo que no puede juzgarse su fidelidad ni su dureza. El contexto sí c
- `ayto-escuela-infantil/req:residir-madrid#control` — falso negativo
  - deepseek-v4-flash: too_strict/ok — La condición solo admite residencia actual en el municipio de Madrid, mientras el extracto permite también prever residir antes del inicio del curso y contempla
  - qwen3.8-flash: too_strict/should_be_soft — La condición excluye a los solicitantes no residentes que cumplen excepciones legales (hermanos escolarizados, convenio colectivo, etc.), generando falsos negat
  - mimo-v2.6-flash: too_strict/ok — El extracto admite tanto a los residentes en el municipio de Madrid como a quienes prevean residir allí antes del inicio del curso, mientras que la condición so
- `ayto-escuela-infantil/completeness#control` — falso positivo
  - deepseek-v4-flash: cannot_tell/ok — No se aporta en el extracto la condición formal ni el enunciado literal de la regla, solo el contexto normativo, por lo que la fidelidad no puede juzgarse. Resp
  - qwen3.8-flash: cannot_tell/should_be_hard — No se ha aportado condition/excerpt, por lo que no puede juzgarse la fidelidad. Sí falta modelar la legitimación del solicitante como padre, madre, tutor/a o re
  - mimo-v2.6-flash: cannot_tell/ok — salida inválida
- `ayto-ibi-familia-numerosa/completeness#control` — falso positivo
  - deepseek-v4-flash: cannot_tell/should_be_soft — El ítem no formula una condición de elegibilidad, sino una pregunta de cobertura, por lo que no hay condición/excerpt que comparar. La única exigencia del artíc
  - qwen3.8-flash: too_lax/ok — El contexto impone un requisito documental expreso para la solicitud si no consta de oficio, no recogido en modelled/uncovered. Por tanto, la cobertura es más p
  - mimo-v2.6-flash: cannot_tell/ok — No se aporta condición formal ni extracto contrastable, por lo que no puede juzgarse la fidelidad; en cuanto al contenido, casi todos los requisitos del artícul
- `ayto-tarjeta-azul-discapacidad/req:renta-max-3-iprem#control` — fidelity=cannot_tell
  - qwen3.8-flash: cannot_tell/ok — El extracto exige no superar 3 × IPREM con ingresos individuales y excluye la escala por cargas para la condición cuarta, pero no precisa la anualización ni el 
- `ayto-tarjeta-azul-discapacidad/req:empadronado-municipio-madrid#control` — fidelity=cannot_tell
  - qwen3.8-flash: cannot_tell/ok — salida inválida
  - mimo-v2.6-flash: cannot_tell/ok — salida inválida
- `ayto-tarjeta-azul-discapacidad/completeness#control` — falso positivo
  - deepseek-v4-flash: cannot_tell/should_be_soft — El ítem no aporta una condición formal que comparar con el extracto, sino una pregunta de cobertura, por lo que la fidelidad no puede juzgarse y no cabe tratarl
  - qwen3.8-flash: too_lax/ok — El texto impone presentar la solicitud ante la dependencia habilitada y aportar documentación y pruebas no recogidas en modelled ni uncovered. Por eso la condic
  - mimo-v2.6-flash: cannot_tell/should_be_soft — La etiqueta no es una condición de elegibilidad sino una pregunta de control, por lo que no puede compararse con un extracto concreto y no debe actuar como requ
- `becas-generales-mefp-2026-2027/req:estudiante-universitario#control` — falso positivo
  - deepseek-v4-flash: too_lax/should_be_hard — La condición se limita a un indicador booleano de 'estudiante' (studentStatus = si), mientras que el extracto acota las enseñanzas subvencionables a los estudio
  - qwen3.8-flash: too_lax/ok — La condición solo pregunta por studentStatus "si", sin distinguir grado o máster oficiales ni curso 2026-2027, por lo que es más permisiva que el extracto. Adem
  - mimo-v2.6-flash: cannot_tell/ok — salida inválida
- `bono-cultural-joven/req:nacido-en-2008#control` — falso positivo
  - qwen3.8-flash: exact/ok — La condición de año 2008 equivale a cumplir 18 años en 2026. El contexto añade requisitos de nacionalidad/residencia y situaciones asimiladas que no están model
- `bono-cultural-joven/completeness#control` — falso positivo
  - deepseek-v4-flash: cannot_tell/should_be_soft — No se aporta condición/excerpt para comparar fidelidad. El contexto revela requisitos de solicitud no cubiertos por modelled ni por uncovered.
  - qwen3.8-flash: too_lax/ok — La regla solo modela la edad, mientras el extracto impone además presentación electrónica, identificación Cl@ve para menores de 18 años a fecha de solicitud y a
  - mimo-v2.6-flash: exact/ok — La condición codificada (haber nacido en 2008) equivale al extracto «cumplan 18 años en 2026», que se impone como requisito excluyente de beneficiaria. Además, 

