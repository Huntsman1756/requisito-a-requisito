# Revisión de lenguaje claro — `src/lib/i18n/es.ts` (B4.2)

Criterio: frases ≤ 20 palabras donde se pueda, jerga administrativa explicada,
y cada resultado dice qué hacer a continuación.

## Resultado

El fichero ya cumplía en casi todo — los textos se escribieron con el
criterio de lenguaje claro desde F4. Las únicas frases largas eran las que
explican el «por qué» de cada pregunta y el aviso legal.

## Antes → después

| Clave | Antes | Después |
|---|---|---|
| `check.intro.body` | «Responde unas preguntas y te decimos qué ayudas merece la pena comprobar. No hace falta registrarse. Tus respuestas no salen de este dispositivo.» | «Responde unas preguntas. Te decimos qué ayudas merece la pena comprobar. Sin registro: nada sale de este dispositivo.» |
| `q.territory.why` | «Muchas ayudas exigen estar empadronado en un lugar concreto.» | + «(estar empadronado = figurar en el padrón municipal de ese pueblo o ciudad)» |

## «Qué hago ahora» en cada resultado

- `posible`/`probable` → tarjeta con «Dónde solicitar», «Necesitarás» y plazo.
- `insuficiente` → «Te faltan datos · Responder».
- `no_cumple` → «Si crees que sí cumples, consulta la fuente oficial» + enlace.
- `not_evaluable` → «Consulta la fuente oficial».

## Regla legible por RuleSet (B4.1)

`src/lib/rule-text.ts` genera «Se comprueba así: …» desde la condición del
RuleSet — nunca escrita a mano. `tests/regla-legible.test.ts` comprueba que
los 50 programas (52 RuleSets) producen texto sin huecos.

## Página «Cómo lo comprobamos» (B4.3)

`src/app/como-verificamos/page.tsx` — la cadena verificable en 7 eslabones,
cada uno con su enlace real al repo (fuentes, reglas, motor, verificación,
muestreo, frescura, auditoría de falsos negativos).
