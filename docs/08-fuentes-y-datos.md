# Fuentes y datos

## 1. Jerarquía de autoridad

Toda afirmación mostrada (requisito, importe, plazo, documento, canal) cita una
fuente con rango. **Rango menor = más autoridad.**

| Rango | Tipo | Ejemplos | Uso |
|---|---|---|---|
| 1 | Norma o convocatoria publicada en diario oficial (texto consolidado ELI si existe) | BOE, BOCM, DOGC, BOJA, DOGV, BOPV… | Requisitos, umbrales, plazos, importes |
| 2 | Registro oficial de la convocatoria | BDNS / SNPSAP (`pap.hacienda.gob.es/bdnstrans`) | Extracto, fechas, órgano, importe total |
| 3 | Sede electrónica del órgano gestor (ficha del procedimiento) | `sede.comunidad.madrid`, `sede.seg-social.gob.es`, `sede.sepe.gob.es` | Canal, documentos, formularios, estado del plazo |
| 4 | Portal informativo oficial | `comunidad.madrid`, `*.gob.es` (páginas informativas) | Solo contexto y texto divulgativo; nunca umbrales |
| — | **Prohibido** | prensa, blogs, agregadores, foros, otros catálogos, salidas de modelos | Nunca |

**Conflictos:** gana el rango menor. Si dos fuentes del **mismo** rango
contradicen un dato material ⇒ el dato queda `UNKNOWN`, el requisito o plazo se
marca `conflict`, el gate de build lo reporta y la UI dice «las fuentes oficiales
no coinciden». Caso de referencia: este premio (prensa 18/10 frente a Orden 16/10:
prensa = prohibida, gana la Orden).

Registro de dominios permitidos: `data/eligibility/sources/registry.json`
(`schemas/source-registry.schema.json`). Un dominio fuera del registro ⇒ la cita
no pasa el gate.

## 2. Adquisición y huella (procedimiento por documento)

1. Descargar el documento oficial (PDF/HTML) con la herramienta de snapshot.
   Bytes en `F:\AgentState\datawardsmadrid\snapshots\<sha256>.<ext>` (fuera del
   repo, no se suben a git).
2. Extraer texto: PDF con `pdfjs-dist` (ya es dependencia de la-ayuda), HTML con
   el extractor existente si lo hay. Normalizar (NFC, espacios colapsados, guiones
   de corte de línea unidos, comillas tipográficas → rectas).
3. Guardar en el repo: `data/eligibility/sources/<sourceId>.json` con `url`,
   `fetchedAt`, `sha256` (bytes), `textSha256`, `contentType`, y el texto
   normalizado en `data/eligibility/sources/<sourceId>.txt` (lo necesita el gate
   de extractos en CI sin red).
4. Cada `citation.excerpt` debe aparecer **literalmente** en el `.txt` normalizado
   (comparación normalizada). `excerptSha256` = sha256 del extracto normalizado.
5. Si la fuente cambia (sha distinto en una nueva descarga), todas las reglas que
   la citan pasan a `stale` hasta revisión: no se publican.

## 3. Datos de referencia

| Dato | Fuente oficial | Uso | Vigencia |
|---|---|---|---|
| Códigos CCAA/provincia/municipio | INE — Relación de municipios y códigos | Territorio jerárquico | Snapshot anual; registrar fecha |
| IPREM (diario, mensual, anual 12/14 pagas) | Ley de PGE vigente o norma de prórroga (BOE) | Umbrales de renta | Por año |
| SMI | Real Decreto anual (BOE) | Umbrales de renta | Por año |
| Calendario de festivos (solo si una regla cuenta días hábiles) | BOE (estatal) + boletín autonómico | Plazos en días hábiles | Por año |

Los valores concretos (p. ej. el IPREM de 2026) **los debe localizar y citar el
agente en F1**; este documento no los da por buenos.

## 4. Fichas y autoridad de la-ayuda

- Solo entran ayudas cuya ficha tenga **autoridad vigente** en el ledger
  (`npm run pipeline:authority -- --strict`, `pipeline:explain publication <id>`).
  Se reutiliza la función del pipeline; no se reimplementa.
- `eligibilityFactors` de la ficha = **pre-filtro** para decidir qué preguntar.
  No es regla (no tiene cita).
- Si el RuleSet contradice la ficha (p. ej. distinto plazo), se reporta en
  `eligibility-report.json` y la ayuda queda fuera hasta corregir una de las dos
  por el circuito editorial de la-ayuda. **Este trabajo no edita fichas ni el
  ledger.**

## 5. Datos abiertos (contribución al ecosistema)

Los RuleSets validados, `parameters.json` y el catálogo de preguntas se publican
en el export estático como JSON con licencia (la misma del corpus de la-ayuda; el
agente la verifica) en `/datos/elegibilidad/…`, con su manifiesto y digest.
Esto es el equivalente «rules as open data» y es el argumento central del criterio
de ecosistema (30%).

## 6. Datos personales

- El perfil se evalúa **solo en el navegador**. Ni el servidor ni la telemetría
  reciben respuestas, hashes, combinaciones ni slugs ligados a un perfil.
- Discapacidad, dependencia y salud son **categorías especiales** (RGPD art. 9):
  preguntas marcadas `sensitivity: "special"`, siempre opcionales, con texto que
  explica por qué se pregunta y que no sale del dispositivo.
- **Contrato existente que manda: `la-ayuda/src/lib/user-state.ts`** («USER STATE
  CONSISTENCY V1»). No se crea un contrato paralelo:
  - Todos los campos nuevos del orientador (`incomeAnnual`, `residenceSince`,
    `dependents`, `municipality`, `disabilityDegree`…) se añaden a
    `SENSITIVE_FIELDS` ⇒ nunca en query params.
  - Persistencia: solo las vías ya definidas, es decir, el handoff de la pestaña
    en `sessionStorage` y el perfil local **con consentimiento explícito**
    (`mb_user_profile`, `localStorage`). Si el usuario no lo ha aceptado, nada en
    `localStorage`. Botón visible «Borrar mis respuestas», que limpia ambos.
  - El «share hash» explícito existente **no** se habilita para las respuestas del
    orientador en esta entrega (riesgo de compartir datos sensibles sin querer).
  - Reutilización: se prerrellenan desde el perfil existente solo los campos con
    correspondencia **exacta** (`region`, `familyType`, `housingStatus`,
    `employmentStatus`). Las bandas gruesas actuales (`ageGroup` joven/adulto/senior,
    `incomeBand` bajo/medio/alto) **no** se convierten a intervalos: no tienen
    límites definidos y harían pasar como `T` o `F` lo que es `U`.
- Sin cookies. Sin datos en la URL.
- **Menores (minimización, como en EduAyudas `LEGAL_NOTES.md`):** de las personas a
  cargo se pide solo la banda de edad (0–2, 3–5, 6–11, 12–15, 16–17, 18–25) y, si
  alguna regla lo usa, si tiene discapacidad. Nunca nombres ni fechas de
  nacimiento. Si una regla necesita una edad exacta en una frontera, el resultado
  es `U` y se pregunta solo ese dato.
- Compartir resultado: «Copiar resumen» e imprimir (texto sin datos personales
  salvo que el usuario lo decida).
- Avisos (heredados de EduAyudas): «No somos una administración pública. La
  información se basa en fuentes oficiales; la solicitud se hace en la sede
  oficial.» y «El resultado es orientativo…» (docs/09 §5).
