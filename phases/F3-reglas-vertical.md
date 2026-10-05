# F3 — Reglas del vertical y personas golden

**Fechas:** 07–10/10 · **Depende de:** F0-5, F1 (gates) · **Responsable:** agente; **revisión: Daniel**

## Objetivo
8–25 ayudas de familias/educación con reglas citadas literalmente, que pasan todos
los gates, revisadas por un humano y cubiertas por personas golden.

## Procedimiento por ayuda (en lotes de 4–6)

1. Fuente de rango 1 (convocatoria o bases en el diario oficial) y, si existe, la
   ficha del procedimiento en la sede (rango 3) para canal y documentos:
   `npm run eligibility:snapshot -- --url … --id …`.
2. Leer la fuente completa. Identificar los requisitos de beneficiario, la
   `referenceDate`, el plazo, el importe por solicitante, los documentos y el canal.
3. Escribir `data/eligibility/rules/<slug>.json`:
   - Un requisito por condición ciudadana comprensible, con su `hard`.
   - Umbrales **tal como los dice la norma** (`lt 26` si dice «menores de 26»).
   - Umbrales de renta como `param` (IPREM…) si la norma los expresa así.
   - Todo lo no modelable va a `uncoveredRequirements` con su cita.
   - `timeDependent` donde aplique.
4. `npm run eligibility:validate`. Si falla un gate, **se corrige la regla o la
   ayuda queda fuera**; el gate no se relaja.
5. Tests de frontera **escritos a mano desde la cita** por cada umbral («con 25
   cumple, con 26 no»).
6. Generar la **tabla de decisión legible** por ayuda a partir del exhaustivo (patrón
   CUTECat): una fila por combinación representativa (frontera de cada umbral, cada
   vía alternativa, cada `unknown`) con su resultado. La revisión humana mira la
   tabla, no el JSON.
7. Comprobar si el organismo ofrece **simulador oficial** para la ayuda; si existe,
   rellenar `application.officialSimulator` con cita.
8. Asimetría de errores (ADR-017): todo requisito discutible ⇒ ⚠ `uncovered`, no hard.
9. Generar la hoja de revisión del lote: `evidence/<fecha>-F3/lote-N.md` con una
   tabla por requisito (`label` | condición legible | extracto | localizador |
   enlace), los `uncovered`, el plazo, el importe y los documentos.
10. **Daniel** marca OK/KO por fila. Los KO se corrigen. Con todo OK:
   `humanReview.status = approved`.

## Personas golden (≥ 12)

- Perfiles ficticios realistas y variados: monoparental, familia numerosa,
  estudiante universitario que se independiza, dos progenitores con un bebé,
  persona con discapacidad a cargo, recién empadronado (futuro), ingresos en el
  umbral, sin responder nada, todo «prefiero no decirlo», un municipio fuera del
  ámbito, plazo recién cerrado, convocatoria próxima, **cumple solo por una
  excepción** (vía alternativa), **requisito discutible** que debe salir como ⚠ y
  no como ✗ (ADR-017), y una ayuda con **simulador oficial**.
- Cada expectativa lleva justificación con cita (`schemas/golden-persona.schema.json`).
- Revisión por **Daniel** (estado `approved`). Sin aprobación no cuentan para la puerta.

## Mutación dirigida

`npm run eligibility:mutate`: cada umbral ±1 (y cada `hard` invertido) ⇒ al
menos un test debe fallar. Cada mutante superviviente ⇒ añadir un test de frontera
o golden.

## Verificación

```powershell
npm run eligibility:validate                 # 0 errores; report con N incluidas
npm test -- tests/eligibility/golden tests/eligibility/boundary
npm run eligibility:exhaustive               # sobre el bundle real
npm run eligibility:mutate                   # 0 supervivientes
npm run build; npm test
```

## Puerta de salida
- [ ] ≥ 8 ayudas `approved` (objetivo 15–25) en el bundle; las excluidas, con su motivo en el informe.
- [ ] ≥ 12 personas golden `approved`, todas en verde.
- [ ] Mutación: 0 supervivientes.
- [ ] Exhaustivo sobre el bundle real: 0 violaciones.
- [ ] Tiempo medio por ayuda medido (dato para escalabilidad en la memoria).
- [ ] Se cronometran 3–5 solicitudes reales, sin enviarlas, para calibrar la estimación de esfuerzo → `evidence/<fecha>-F3/esfuerzo.json`.
- [ ] Recibo y handoff.
