# Calibración del panel multimodelo — 2026-10-06

- Prompt: `panel-v2` · modelos: deepseek-v4-flash, qwen3.8-flash, mimo-v2.6-flash
- Ítems: 235 con defecto (mutantes + históricos) · 92 controles
- Registro crudo: `raw/calls.jsonl` · casos: `casos.json` · veredictos: `resultados.json`

## Criterio de aceptación (docs/17 §6) — **NO CUMPLE**

| Criterio | Umbral | Medido | Resultado |
|---|---|---|---|
| Detección de mutantes | ≥ 95 % | 94.0 % | KO |
| …en mutantes de falso positivo | 100 % | 91.8 % | KO |
| Falsas alarmas en controles | ≤ 20 % | 75.0 % | KO |

## Matriz de confusión

| | Detectado | No detectado | Alarma | Limpio | Inválidas |
|---|---|---|---|---|---|
| deepseek-v4-flash | 167 | 68 | 44 | 48 | 15 |
| qwen3.8-flash | 196 | 39 | 50 | 42 | 71 |
| mimo-v2.6-flash | 165 | 70 | 34 | 58 | 27 |
| **Panel (agregado)** | **221** | **14** | **69** | **23** | — |

## Detección por tipo de defecto

| Tipo | n | Detectados | Tasa |
|---|---|---|---|
| field | 39 | 34 | 87.2 % |
| hard_soft | 31 | 30 | 96.8 % |
| hist_azul_12p | 1 | 1 | 100.0 % |
| hist_bono_edad | 1 | 1 | 100.0 % |
| hist_renfe_rango3 | 1 | 1 | 100.0 % |
| hist_rmi_menores | 1 | 1 | 100.0 % |
| hist_rmi_municipio | 1 | 1 | 100.0 % |
| invert | 41 | 41 | 100.0 % |
| iprem | 8 | 8 | 100.0 % |
| op_swap | 29 | 27 | 93.1 % |
| removed_req | 32 | 27 | 84.4 % |
| umbral_lax | 25 | 24 | 96.0 % |
| umbral_pct | 25 | 25 | 100.0 % |

## Mutantes NO detectados (14)

- `ayto-ibi-familia-numerosa/req:empadronado-madrid#field` — campo territory→age
  - deepseek-v4-flash: exact/ok fn=none fp=none — El extracto impone como requisito estar empadronado en el municipio de Madrid y la condición modela exactamente ese empadronamiento territorial (municipio 28079
  - qwen3.8-flash: exact/ok fn=none fp=none — La condición codifica el empadronamiento en el municipio de Madrid, que es el requisito exigido por el extracto. La aplicación de oficio y sus excepciones están
  - mimo-v2.6-flash: exact/ok fn=low fp=low — La condición territorial (municipio 28079) equivale al extracto, que exige estar empadronado en el municipio de Madrid y lo hace excluyente («deberá»), por lo q
- `descuento-transporte-familia-numerosa/req:titulo-familia-numerosa#field` — campo familyType→employmentStatus
  - deepseek-v4-flash: exact/ok fn=low fp=low — La condición modela ser titular/miembro de familia numerosa, que es justo lo que exige el artículo 11.4 para el descuento, y la acreditación oficial está recogi
  - qwen3.8-flash: exact/ok fn=low fp=low — La condición exige ser familia numerosa, equivalente al requisito de tener reconocida/acreditada esa condición. La categoría, que afecta al porcentaje del descu
  - mimo-v2.6-flash: exact/ok fn=none fp=low — La condición 'ser titular de familia numerosa' recoge el derecho reconocido en el extracto, y la exigencia de presentar el título oficial cuando se solicite que
- `madrid-abono-transporte-65/req:edad-65#hard_soft` — requisito excluyente ablandado a soft
  - deepseek-v4-flash: exact/ok fn=low fp=none — La condición (age ≥ 65) reproduce literalmente el requisito «Tener sesenta y cinco años cumplidos», que la norma presenta como una de las vías alternativas de a
  - qwen3.8-flash: exact/ok fn=none fp=low — La edad exigida coincide con el extracto; la renta y la residencia están declaradas como requisitos modelados, y otras categorías como no comprobadas. El caráct
  - mimo-v2.6-flash: exact/ok fn=none fp=low — La condición (age ≥ 65) equivale al literal «Tener sesenta y cinco años cumplidos» y el resto del extracto (tope de IPREM) está modelado en renta-iprem. Al ser 
- `madrid-abono-transporte-infantil/completeness#removed_req` — requisito «residencia-municipio-crtm» eliminado de la lista modelada
  - deepseek-v4-flash: exact/ok fn=none fp=none — La lista cubre en `modelled` o `uncovered` los requisitos que el contexto exige al solicitante: residencia acreditada por empadronamiento o autorización de cons
  - qwen3.8-flash: exact/ok fn=none fp=none — El contexto exige acreditar residencia mediante empadronamiento y permite aportar o autorizar su consulta; esos requisitos están declarados en uncovered. Tambié
  - mimo-v2.6-flash: exact/ok fn=none fp=none — El único requisito que el contexto impone al solicitante (acreditar residencia mediante certificado de empadronamiento vigente o autorizar su consulta) aparece 
- `madrid-ayudas-nacimiento-general/req:empadronado-municipio-cm#field` — campo territory→age
  - deepseek-v4-flash: exact/ok fn=none fp=low — La condición reproduce el requisito de residencia y empadronamiento en un municipio de la Comunidad de Madrid en el momento de la solicitud, tal como figura en 
  - qwen3.8-flash: exact/ok fn=none fp=low — La condición verifica la residencia/empadronamiento actual en la Comunidad de Madrid, coincidente con el extracto para el subrequisito declarado. Los plazos de 
  - mimo-v2.6-flash: exact/ok fn=none fp=low — La condición de territorio reprodufiel requisito c) en su parte de empadronamiento en la CM al momento de la solicitud, y el resto de exigencias del extracto (5
- `madrid-ayudas-urgencia-social/req:sin-recursos-basicos#op_swap` — lte→lt (cambia el límite incluido)
  - deepseek-v4-flash: exact/ok fn=low fp=low — La condición usa un umbral orientativo declarado (IPREM) porque la Cartera no publica cuantía, por lo que la aproximación no es un defecto. Los requisitos de ac
  - qwen3.8-flash: exact/ok fn=low fp=low — La condición usa un umbral orientativo de 1 IPREM, pero el propio label declara que la Cartera no publica umbral y que es solo referencia. El requisito real es 
  - mimo-v2.6-flash: exact/ok fn=low fp=low — El extracto solo exige carecer de recursos económicos para cubrir necesidades básicas y el label declara explícitamente que la Cartera no publica umbral y que e
- `madrid-beca-comedor-escolar/req:via-economica-o-colectivo#op_swap` — lt→lte (cambia el límite incluido)
  - deepseek-v4-flash: exact/ok fn=low fp=low — La condición cubre solo parte del derecho (renta del hogar < 8.400 €, que implica renta per cápita < 8.400 €, y familia numerosa sin tope de renta), pero las ap
  - qwen3.8-flash: exact/ok fn=none fp=low — La condición modela correctamente las dos vías comprobables (renta < 8.400 y familia numerosa) y el campo 'uncovered' declara explícitamente que se aproximan po
  - mimo-v2.6-flash: exact/ok fn=low fp=low — Las dos aproximaciones (usar ingresos totales del hogar en vez de renta per cápita, y aceptar familia numerosa sin comprobar el tramo 8.400–10.000 €) quedan dec
- `madrid-cheque-escuela-infantil/req:hijo-menor-3#field` — campo dependents→disability
  - deepseek-v4-flash: exact/ok fn=low fp=low — La condición modela el requisito de edad (al menos un menor de 3 años) que impone el extracto («niños menores de tres años»), y las precisiones que quedan fuera
  - qwen3.8-flash: exact/ok fn=none fp=none — La condición exige al menos un menor de 3 años, que es el núcleo del extracto. La matrícula, la fecha de nacimiento y la excepción para mayores de 3 con NEE est
  - mimo-v2.6-flash: exact/ok fn=low fp=low — La condición (al menos un menor de 3 años) equivale al extracto «Niños menores de tres años…», y las diferencias (excepción de mayores de 3 con NEE, fecha límit
- `madrid-renta-minima-insercion/completeness#removed_req` — requisito «residencia-permanente-cm» eliminado de la lista modelada
  - deepseek-v4-flash: exact/ok fn=none fp=none — El contexto (arts. 1-7) exige residencia permanente y empadronamiento con un año previo, edad 25-65 con sus salvedades, unidad de convivencia de 6 meses, carenc
  - qwen3.8-flash: cannot_tell/ok fn=none fp=none — salida inválida
  - mimo-v2.6-flash: exact/ok fn=none fp=none — Como ítem de completitud, todos los requisitos que el contexto impone al solicitante (residencia y empadronamiento de un año, edad, unidad de convivencia de 6 m
- `prestacion-cuidador-no-profesional/req:empadronado-cm#field` — campo territory→age
  - deepseek-v4-flash: exact/ok fn=low fp=none — La condición de territorio en la Comunidad de Madrid (ccaa 13) coincide con el extracto, que exige residir en la CM en la fecha de solicitud. La mención al empa
  - qwen3.8-flash: exact/ok fn=none fp=none — La condición within_territory con CCAA 13 equivale a residir en la Comunidad de Madrid en la fecha de solicitud. Los requisitos adicionales de residencia y naci
  - mimo-v2.6-flash: exact/ok fn=low fp=none — La condición (residir en la Comunidad de Madrid, ccaa 13, en la fecha de solicitud) equivale al extracto literal «residan en la Comunidad de Madrid en la fecha 
- `prestacion-desempleo-contributiva/completeness#removed_req` — requisito «situacion-legal-desempleo» eliminado de la lista modelada
  - deepseek-v4-flash: exact/ok fn=none fp=none — La lista de `uncovered` recoge todos los requisitos del art. 266 y 267 contenidos en el contexto (alta, cotización mínima, situación legal de desempleo, disponi
  - qwen3.8-flash: exact/ok fn=none fp=none — Los requisitos del artículo 266 del contexto están cubiertos por la lista de uncovered. No identifico una exigencia expresa al solicitante que falte.
  - mimo-v2.6-flash: exact/ok fn=none fp=none — El contexto (arts. 266 y 267) solo contiene requisitos que ya figuran en la lista `uncovered`: afiliación y alta, cotización mínima, situación legal de desemple
- `prestaciones-dependencia-saad/req:residencia-espana-5y2#umbral_lax` — umbral relajado (gte 24→25)
  - deepseek-v4-flash: exact/ok fn=low fp=low — La condición mide un proxy (meses de alta en el municipio actual) y tanto el label («es solo una pista», el tiempo previo en otro municipio español también cuen
  - qwen3.8-flash: exact/ok fn=low fp=low — La condición es orientativa y el desfase está declarado: el label avisa de que el padrón municipal es solo una pista y uncovered reconoce que no se comprueba la
  - mimo-v2.6-flash: exact/ok fn=none fp=low — El label declara los 5 años y el ⚠, y el desfase de la condición (solo 23 meses medibles) queda expresamente cubierto por 'residencia-regla-completa' en uncover
- `prestaciones-dependencia-saad/completeness#removed_req` — requisito «residencia-espana-5y2» eliminado de la lista modelada
  - deepseek-v4-flash: exact/ok fn=none fp=none — El contexto (art. 5) exige estar en situación de dependencia en algún grado, el régimen propio de los menores de 3 años y residir en España cinco años (dos inme
  - qwen3.8-flash: exact/ok fn=none fp=none — Los requisitos del artículo 5 del contexto —dependencia, residencia, menores, nacionalidad/extranjería y retornados— están cubiertos por modelled/uncovered. No 
  - mimo-v2.6-flash: exact/ok fn=none fp=none — Los requisitos de acceso que aparecen en el contexto (situación de dependencia y grado, nacionalidad o su régimen sustitutivo, regla de residencia de 5/2 años c
- `prestaciones-dependencia-saad/completeness#removed_req` — requisito «residencia-espana-5y2» eliminado de la lista modelada
  - deepseek-v4-flash: exact/ok fn=none fp=none — El contexto (art. 5) exige nacionalidad española, situación de dependencia en alguno de los grados y residencia en territorio español (5 años, 2 inmediatamente 
  - qwen3.8-flash: exact/ok fn=low fp=low — Los requisitos del artículo 5 sobre dependencia, nacionalidad/residencia y menores están cubiertos por modelled o uncovered. No falta ningún requisito explícito
  - mimo-v2.6-flash: exact/ok fn=none fp=low — Los requisitos que el Art. 5 impone al solicitante (situación de dependencia en grado, residencia/nacionalidad y sus excepciones, régimen de menores de 6 años) 

## Falsas alarmas sobre controles (69)

- `asignacion-hijo-a-cargo/req:causante-con-discapacidad#control` — falso positivo
  - deepseek-v4-flash: exact/ok — La condición recoge el supuesto del art. 351.a (hijo o menor a cargo con discapacidad ≥33 % si <18 años o ≥65 % si ≥18) y la flexibilidad al admitir 'unknown/de
  - qwen3.8-flash: too_lax/ok — La rama de dependientes está declarada como aproximada por el grado no comprobable, pero la rama de adulto mayor de 18 con discapacidad ≥33% es más permisiva qu
- `ayto-emergencia-social/req:mayor-edad#control` — falso negativo
  - deepseek-v4-flash: exact/ok — La condición exige 18 años, pero el extracto también admite al menor emancipado; esta diferencia está expresamente declarada en la etiqueta y en el modelado com
  - mimo-v2.6-flash: exact/ok — La condición (age ≥ 18) reproduce el requisito «Ser mayor de edad» y el propio label declara la aproximación de excluir a menores no emancipados por no poder co
- `ayto-emergencia-social/req:empadronado-madrid#control` — falso negativo
  - qwen3.8-flash: exact/ok — La condición municipal es una aproximación prudente porque el label avisa del matiz de distrito y el uncovered declara la excepción justificada por informe soci
  - mimo-v2.6-flash: exact/ok — El label avisa explícitamente que el empadronamiento debe ser «en el distrito al que se dirija la solicitud», por lo que la cobertura a nivel de municipio 28079
- `ayto-emergencia-social/req:carencia-recursos#control` — missingRequirements
  - qwen3.8-flash: exact/ok — La condición es orientativa y el umbral IPREM está declarado como aproximación, no como requisito fijo; el extracto solo exige acreditar necesidad. El desfase e
- `ayto-emergencia-social/completeness#control` — falso positivo
  - deepseek-v4-flash: exact/ok — Los requisitos del artículo 12 están mayoritariamente cubiertos entre modelled y uncovered (edad, empadronamiento, necesidad, aceptación del diseño de intervenc
  - qwen3.8-flash: exact/ok — La cobertura no contradice el texto, pero omite requisitos expresos sobre documentación, unidad familiar, denegaciones previas y exclusiones por gastos o deudas
- `ayto-escuela-infantil/completeness#control` — falso positivo
  - qwen3.8-flash: too_lax/ok — La cobertura reproduce bien requisitos de edad y residencia, pero omite sin declarar la exigencia de ser representante legal del menor. Por ello puede incluir a
  - mimo-v2.6-flash: exact/ok — Los requisitos sustantivos del solicitante (residencia, edad del menor y sus excepciones, no nacidos, adopción, hermano escolarizado, convenio, solicitud única,
- `ayto-tarjeta-azul-discapacidad/req:empadronado-municipio-madrid#control` — falso negativo
  - qwen3.8-flash: too_strict/ok — La norma exige ser 'residente en Madrid', mientras que la regla codifica y el label afirman estar 'empadronado'. El empadronamiento es un requisito más estricto
- `ayto-tarjeta-azul-discapacidad/completeness#control` — missingRequirements
  - deepseek-v4-flash: exact/ok — La cobertura modelada y las cautelas declaradas no contradicen el contexto: recogen las condiciones sustantivas (empadronamiento, discapacidad ≥33 %, tope de 3 
  - mimo-v2.6-flash: exact/ok — La completitud es correcta en lo sustantivo (residencia, discapacidad 33 % y tope de 3× IPREM) y los colectivos adicionales quedan declarados como no comprobabl
- `becas-generales-mefp-2026-2027/req:estudiante-universitario#control` — falso positivo
  - deepseek-v4-flash: exact/should_be_hard — El extracto define las enseñanzas universitarias elegibles y la condición las representa como un sí/no, lo que es correcto. Sin embargo, el extracto impone este
  - qwen3.8-flash: too_lax/ok — La condición solo verifica ser estudiante, pero el contexto añade requisitos de sistema/centro español y abono de tasas a centro español no declarados en uncove
  - mimo-v2.6-flash: exact/should_be_hard — La etiqueta declara con precisión el subconjunto que cubre la condición (grado o máster oficial, curso 2026-2027), por lo que equivale al extracto; sin embargo,
- `bono-cultural-joven/completeness#control` — missingRequirements
  - deepseek-v4-flash: exact/ok — La lista modelada no contradice el contexto: sus requisitos (nacimiento en 2008, nacionalidad/residencia y modalidad) coinciden con el extracto. Solo faltan la 
  - qwen3.8-flash: exact/ok — La cobertura declara edad, nacionalidad/residencia y modalidad, pero faltan requisitos procedimentales exigidos expresamente al solicitante.
  - mimo-v2.6-flash: exact/ok — El ítem de completitud no contradice el contexto: lo modelado (18 años en 2026) y lo declarado como no cubierto (nacionalidad/residencia y modalidad) son correc
- `bono-social-electrico/req:alguna-via-vulnerable#control` — hardness=should_be_hard
  - deepseek-v4-flash: exact/should_be_hard — La condición modela solo dos de las vías de vulnerabilidad, pero el resto (PVPC, pensionista, IMV, multiplicadores) queda declarado en `uncovered`, por lo que l
  - qwen3.8-flash: cannot_tell/ok — salida inválida
- `bono-social-electrico/completeness#control` — falso positivo
  - deepseek-v4-flash: exact/ok — La cobertura es incompleta: faltan requisitos explícitos del contexto, como la potencia máxima contratada, la condición de persona física y la acreditación del 
  - mimo-v2.6-flash: exact/ok — Como ítem de completitud, la cobertura declarada es coherente con el contexto: las vías de vulnerabilidad no modeladas (PVPC, pensionistas, IMV, multiplicadores
- `bono-social-termico/req:alguna-via-vulnerable#control` — falso negativo
  - deepseek-v4-flash: exact/ok — La condición modela solo las vías de renta y familia numerosa, pero las demás vías de consumidor vulnerable (pensionistas, IMV) y el multiplicador por composici
  - qwen3.8-flash: cannot_tell/ok — salida inválida
- `bono-social-termico/completeness#control` — falso positivo
  - qwen3.8-flash: exact/ok — La cobertura no contradice el texto, pero faltan requisitos expresos como ser persona física, consumidor doméstico y disponer de datos correctos y suficientes p
- `cese-actividad-autonomos/req:autonomo-alta-reta#control` — falso positivo
  - deepseek-v4-flash: exact/should_be_hard — La condición (employmentStatus eq "autonomo") coincide con el requisito de afiliación y alta en el RETA o en el Régimen del Mar, tal como precisa el propio labe
  - qwen3.8-flash: too_lax/ok — La condición solo exige employmentStatus eq "autonomo", pero el extracto impone además estar afiliada y en alta en el RETA o en el Régimen Especial de los Traba

