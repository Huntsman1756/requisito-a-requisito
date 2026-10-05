# F1 — Fuentes, esquemas y gates de build

**Fechas:** 06–07/10 · **Depende de:** F0-4 · **Responsable:** agente
**Especificación:** `docs/08-fuentes-y-datos.md`, `schemas/*.schema.json`,
`docs/11-infra-despliegue.md` §1.1

## Objetivo
Que sea **imposible** construir un bundle con una afirmación sin fuente oficial,
con un extracto que no esté en la fuente, con una ayuda sin autoridad vigente o
con datos caducados.

## Tareas

| ID | Tarea |
|---|---|
| F1-1 | (Portado en F0-8 desde `6595a533`; completar lo que falte) Zod en `src/lib/eligibility-engine/schema.ts` equivalente a los 7 JSON Schema. Test: los ejemplos de `templates/*.example.json` validan con Zod; los mutantes inválidos (falta de cita, `additionalProperties`, enum incorrecto) se rechazan |
| F1-2 | `data/eligibility/sources/registry.json` con los dominios oficiales (BOE, BOCM y los boletines autonómicos del vertical, BDNS, sedes) y su rango máximo |
| F1-3 | `scripts/eligibility-snapshot.ts`: descarga → sha256 → extracción de texto (pdfjs-dist / HTML) → normalización (NFC, espacios, cortes de línea con guion, comillas) → `sources/<id>.json` + `.txt`. Bytes a `F:\AgentState\datawardsmadrid\snapshots\` |
| F1-4 | `scripts/eligibility-validate.ts` con los gates: G1 Zod · G2 `benefitSlug` existe en `data/catalog/benefits/` (importado con procedencia) **o** el RuleSet declara `standalone: true` con una fuente de rango 1 propia (pistas BOCM) · G3 cada `citation.sourceId` existe y su dominio está en el registro con un rango compatible · G4 el extracto aparece en el `.txt` normalizado y `excerptSha256` cuadra · G5 `uncoveredRequirements` presente · G6 frescura (`verifiedAt` ≤ 90 días) · G7 conflicto ⇒ fuera · G8 `referenceDate` modelada si la cita la fija · G9 parámetros con vigencia que cubre `referenceDate` · G11 citas de requisitos/umbrales/importes solo de rango 1–2 (ADR-034) · G10 `humanReview.status == approved` (solo exigido en el build de release/demo; en desarrollo, aviso) |
| F1-5 | `scripts/eligibility-build.ts`: bundle + manifiesto con digest + `eligibility-report.json` (incluidas/excluidas con motivo). Enganche al build (ADR del repo) |
| F1-6 | `data/eligibility/parameters.json` con IPREM y SMI vigentes, **citados** (localizar la norma en el BOE) |
| F1-7 | Tabla INE de CCAA/provincias/municipios: snapshot con cita; módulo `territory.ts` con lookup |
| F1-8 | `data/eligibility/questions.json` inicial (≤ 10 preguntas), reutilizando tokens de `eligibilityFactors` y claves `factor_*`; añadir `whyKey` y `sensitivity` |

## Pruebas a escribir (antes de implementar cada gate)

- Un test negativo **por gate** (G1–G10): un fixture que viola solo ese gate ⇒ el
  build falla con un código de error identificable (`ELIG_G4_EXCERPT_NOT_FOUND`…).
- Un test positivo: un RuleSet fixture completo ⇒ bundle generado y digest estable
  (dos builds ⇒ el mismo digest).
- Normalización: el mismo texto con distinta tipografía da el mismo hash; con un
  cambio de una cifra, el hash cambia.
- Snapshot: un dominio fuera del registro ⇒ rechazo; `--expect <sha>` distinto ⇒ rechazo.

## Verificación

```powershell
npm run check
npm test -- tests/eligibility/gate tests/eligibility/schema
npm run eligibility:validate -- --fixtures      # todos los negativos fallan por su código y el positivo pasa
npm run eligibility:build; Get-Content data\eligibility\eligibility-report.json
npm run build; npm test
```

## Puerta de salida
- [ ] 10/10 gates con test negativo en rojo por la razón correcta y test positivo en verde.
- [ ] Digest del bundle determinista (dos builds idénticos).
- [ ] IPREM, SMI y tabla INE citados.
- [ ] Catálogo de preguntas válido (≤ 10 visibles en un recorrido).
- [ ] Check, test y build en verde; recibo y handoff.
