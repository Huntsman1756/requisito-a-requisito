# Requisito a Requisito

Orientador de ayudas públicas de la **Comunidad de Madrid** (autonómicas,
municipales y las estatales que puede pedir un residente). Con ≤ 10 preguntas
dice qué ayudas merece la pena comprobar, qué requisito cumples, cuál no,
cuál no se puede saber y **qué te falta** — con la fuente oficial enlazada en
cada afirmación.

Las reglas son **deterministas** (no hay IA en la decisión) y el perfil
**nunca sale del navegador**: ni URL, ni cookies, ni telemetría.

## Datos abiertos

El despliegue publica en `/datos/`:

- `bundle.json` — los RuleSets vigentes (requisitos con cita literal + huella
  `sha256` del snapshot oficial), los parámetros 2026 y el catálogo de
  preguntas.
- `fuentes.json` — registro de fuentes oficiales: URL, fecha de descarga y
  huellas del documento (`sha256`) y del texto normalizado (`textSha256`,
  contra el que se verifica cada extracto citado).
- `nivel-2.json` — el universo de programas de Madrid sin regla propia, con su
  estado de acceso y fuente oficial.
- `indice.json` — digest y bytes de cada fichero (test de consistencia en
  `tests/datos-indice.test.ts`).

Los esquemas están en `schemas/` (JSON Schema 2020-12). Ver la página
`/datos/` del despliegue para instrucciones de uso.

## Cómo se verifica una regla

Ciclo obligatorio por cada RuleSet (`docs/12`, ADR-040/044):

1. **Autor** escribe el RuleSet citando extractos literales de la fuente
   oficial (`data/eligibility/sources/<id>.txt`, huella verificada por el
   build — sin cita no compila).
2. **Verificador independiente** revisa citas, vigencia y requisitos
   (`templates/verificador-checklist.md`) → informe en
   `evidence/<fecha>/verificacion-ola-N.md`.
3. **Revisión humana por muestreo** (ADR-040): una hoja
   `evidence/…/muestreo-ola-N.md` por ola; con ≥2 OK de reglas distintas y
   ningún KO se aprueba entera con `npm run review:apply -- <hoja>`
   (`evidence/muestreo-indice.json` fija qué hoja vigente aprueba cada regla).
4. **Frescura diaria** (CI + corrida local): si un extracto citado desaparece
   de la fuente, la regla sale del bundle sola (fail-closed) hasta revisión.

`UNKNOWN` nunca equivale a «no»: un dato impreciso da `U`, no `F` (ADR-012).

## Correr en local

```sh
npm install
npm run eligibility:build   # valida las reglas y genera el bundle
npm run datos:public        # publica los JSON en public/datos/
npm run dev                 # web en localhost:3000
npm test                    # tests (incluye goldens y verificación de datos)
npm run build               # exportación estática a out/
npm run validate:full       # la puerta completa
```

## Licencia

- **Código**: MIT (propuesta en ADR — pendiente de firma del autor).
- **RuleSets y evidencias**: CC BY 4.0 (propuesta en ADR — pendiente).
- Las fuentes citadas pertenecen a sus administraciones; aquí se enlazan, no
  se republican.

## Procedencia

Proyecto hecho para la candidatura de Daniel a los **Global Tech Leaders
Awards 2026** (CM, Orden 566/2026). Reutiliza código y datos de proyectos
propios estatales (`la-ayuda`, `EduAyudas`) sin modificarlos — ver
`docs/13-reutilizacion-donantes.md` y `data/catalog/provenance.json`.

Contribuir: este repo publica el producto, los datos, las evidencias
(`evidence/`) y las decisiones (`DECISIONS.md`). El material de proceso
(cola, fases, handoffs, memoria) vive en un taller privado y no se sube aquí.

## Cómo se ha construido

Cada regla pasa por autor ⇒ verificador independiente ⇒ hoja de muestreo con
aprobación humana; solo entonces entra en la release del jurado. Las
evidencias están en `evidence/` (cada afirmación de la memoria apunta a un
informe o a una cifra medida) y las decisiones en `DECISIONS.md`.
