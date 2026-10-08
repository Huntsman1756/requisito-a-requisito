# Guion de demo — 3 minutos (Requisito a Requisito)

**Caso real** (perfil golden `gp-cai-madre-getafe`, verificado contra el motor):
madre de 33 años, monoparental, un hijo de 4 años, empadronada en Getafe
desde 05/2021, en desempleo, ingresos en la banda más baja.

## 0:00–0:20 — Portada y promesa

> «Es un orientador de ayudas públicas de la Comunidad de Madrid. Contestas
> unas preguntas y te dice qué ayudas encajan — y cada requisito enlaza al
> texto oficial que lo exige.»

Se ve: home con el espécimen de ficha (Bono Cultural Joven) — cada requisito
con su ✓/⚠ y el extracto literal.

## 0:20–1:10 — El asistente (voz en off sobre clicks)

Entrar en `/comprobar/` → Empezar:

1. Municipio: **Getafe** (combobox).
2. Empadronada desde: **05/2021**.
3. Edad: **33**.
4. Personas a cargo: **1** → edad **4**.
5. Familia: **monoparental**.
6. Empleo: **desempleo**.
7. Estudios: **no**.
8. Ingresos: **hasta 8.400 €**.
9. Discapacidad: **no**. Dependencia: (no se pregunta: sin discapacidad).
10. Vivienda: **alquiler**.

> «Solo pregunta lo que necesita: si no hay discapacidad, no pregunta la
> dependencia. Y este botón — *No lo sé* — nunca convierte la duda en un no.»

## 1:10–1:50 — Resultados

Pantalla «Tus resultados»:

- **Complemento de ayuda a la infancia: Posible** — cumple los tres
  requisitos duros comprobables (menor en la unidad, año de residencia, edad
  de la titular); lo que no se puede comprobar con estas preguntas se lista
  como «también exige», honesto.
- **«Te faltan datos»**: si alguna respuesta quedó sin contestar, la lista
  dice cuántas ayudas desbloquearía responderla.
- Cada tarjeta: plazo, documentos, dónde solicitar.

> «Clic en «Fuente» — ahí está el texto literal del BOE con su huella. La
> decisión la toma el código, la norma la sostiene el documento.»

## 1:50–2:30 — La ficha verificable

Abrir la ficha de la ayuda (`/ayudas/complemento-ayuda-infancia/`):

- Cada requisito: label en lenguaje claro + «Se comprueba así» generado del
  RuleSet + extracto literal con enlazante al BOCM.
- La cadena `/como-verificamos/` — fuente → extracto con sha256 → motor
  determinista → verificador independiente → revisión humana → revalidación
  diaria.

> «Si el BOE cambia el texto, la huella falla y la ayuda sale del listado —
> nunca dirá una cosa que la norma ya no dice.»

## 2:30–3:00 — Datos abiertos y cierre

`/datos/`: bundle JSON con los 52 RuleSets, registro de 166 fuentes con sus
huellas, índice con sha256 de cada fichero.

> «Tus respuestas no salen del navegador — ni cookie, ni telemetría. Las
> reglas son abiertas y cualquiera puede comprobar la huella de cada cita.»

## Plan B (si falla la demo en vivo)

Vídeo/capturas regeneradas con `npm run anexos` desde el build estricto —
los mismos pasos de este guion automatizados con Playwright.
