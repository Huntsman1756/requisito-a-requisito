# Condiciones definitorias — verificación independiente (F10-RES-2 §1.3)

**Qué es esto:** `data/presentation/condiciones-definitorias.json` es una capa
de **presentación** — dice qué requisito «define la situación» de cada ayuda
para etiquetar tarjetas «solo si…». **No es una hoja de verificación**: no
aprueba ni modifica reglas (decisión ADR-054: las reglas no se tocan antes
del 16/10).

**Verificado por:** un agente independiente (solo lectura), contrastando cada
entrada contra `data/eligibility/bundle/eligibility-bundle.json` (los
`requirements` y `uncoveredRequirements` de cada RuleSet y sus citas).

## Resultado

- 50/50 slugs del bundle tienen entrada (los dos duplicados por versión —
  `prestacion-cuidador-no-profesional` y `prestaciones-dependencia-saad` —
  comparten entrada, como declara el propio fichero).
- Todos los `req` citados existen en su RuleSet.
- Test continuo: `tests/eligibility/condiciones-definitorias.test.ts` comprueba
  ids, cobertura total y forma de los textos sobre el bundle real.

## Correcciones aplicadas tras la revisión

| Entrada | Problema detectado | Corrección |
|---|---|---|
| `prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad` | req equivocado (`nacimiento-en-espana` es accesorio; el definitorio es `colectivo-familiar`) | `colectivo-familiar` + nacimiento como segunda |
| `ayto-tarjeta-azul-discapacidad` | el texto inventaba «familia numerosa» (no es categoría de la Tarjeta Azul) y confundía menor/mayor con dependencia | texto corregido |
| `madrid-ayudas-nacimiento-general` | texto sin base («acoger un menor de 6 años») y faltaba `edad-max-30` (hard) | texto corregido + edad ≤30 |
| `subsidio-mayores-52` | faltaba `edad-52` (la condición que da nombre) | añadida |
| `pension-no-contributiva` | faltaba `edad-65-o-discapacidad` | añadida |
| `madrid-bono-alquiler-joven` | faltaba `edad-max-35` | añadida |
| `madrid-renta-minima-insercion` | faltaba `edad-25-65` | añadida |
| `mostoles-prestaciones-sociales` | citaba la subsidiariedad, no la situación (`carencia-ingresos`) | añadida |
| `fuenlabrada-fuenlacarenet-2026` | citaba la derivación, no la situación (`menores-a-cargo`) | añadida |
| `prestamos-personal-publico-cm` | texto corto: cubre también funcionarios de administración | ampliado |
| `asignacion-hijo-a-cargo` | la 2.ª vía real es «mayor de 18 con discapacidad a cargo de sus padres», no «que impida trabajar» | corregida |
| `madrid-ayudas-nacimiento-adopcion-multiple` | la fecha «desde 1/1/2024» es otro req (`nacidos-desde-2024`) | citado aparte |

Restantes 38 entradas: **OK** en la revisión (par definitorio y texto fieles
a la cita oficial).

## Qué NO resuelve esta capa

No sustituye la comprobación real: una tarjeta «solo si tu hijo tiene una
enfermedad grave» sigue siendo `U` — no se puede saber con las 10 preguntas.
Eso es exactamente lo que la capa declara en pantalla. Si se quisiera
comprobar de verdad, haría falta pregunta nueva + hoja de verificación — la
decisión aplazada de ADR-054.
