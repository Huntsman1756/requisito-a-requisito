# Universo de ayudas de Madrid: inventario, fuentes y producción

Revisado por Claude el 2026-10-05. Objetivo: que el producto muestre **todas** las
ayudas relevantes para un residente en la Comunidad de Madrid que podamos sostener
con fuente oficial, no solo las 6 iniciales.

## 1. Lo que hay hoy (medido)

| Fuente | Qué contiene | Medición 2026-10-05 | Utilidad |
|---|---|---|---|
| la-ayuda, fichas `src/content/benefits` | Fichas derivadas de boletines | **Madrid** (sin fiscales): 49 activas (5 abiertas, **44 cerradas**) + 328 borradores; tipos: empleo 139, ayudas 110, educación 52, general 50, vivienda 17, mayores 7, infancia 6. **Estatales**: 166 activas (150 cerradas, 6 abiertas, 6 permanentes) + 1.162 borradores | Mucho material, pero **centrado en convocatorias**: la mayoría ya cerró o no tiene estado. Los borradores son pistas, no catálogo |
| la-ayuda, `data/pipeline/candidates.jsonl` (ingesta de official-sources sincronizada desde el VPS) | Candidatos de boletines | 14.615 en total; **529 del BOCM**; 4.112 del BOE | Pistas para descubrir convocatorias de Madrid; mucho ruido (subvenciones a entidades, nombramientos…) |
| official-sources (VPS `/opt/official-sources/data/official_sources.sqlite`; la copia local de julio está desactualizada) | Ingesta diaria BOE + registro de 94 fuentes (BDNS, BOCM RSS, universidades de Madrid…) | Producción en el VPS; acceso **solo lectura** | Fuente de pistas; ya llega a la-ayuda por sincronización |
| EduAyudas `eduayudas-current-call-leads-2026-09-27.json` | 53 pistas educativas abiertas | **0 de Madrid** | Poca para Madrid; útil como patrón |
| **BDNS / SNPSAP, API pública** `infosubvenciones.es/bdnstrans/api` | Todas las convocatorias registradas | Región Comunidad de Madrid (id 25) + beneficiario «personas físicas que no desarrollan actividad económica» (id 1), 2026: **118 convocatorias** (39 locales, 28 autonómicas, 32 «otros», sobre todo universidades) | **Descubrimiento principal** de convocatorias de Madrid; hay que filtrar las nominativas, los concursos y los premios |
| **Sede de la Comunidad de Madrid, buscador «Ayudas, becas y subvenciones»** (`sede.comunidad.madrid/buscador/tipo/Ayudas, Becas y Subvenciones`, filtros por perfil Ciudadanía/Estudiantes/Familias y estado En plazo/Cerrado) | **Catálogo oficial estructurado** de la CM, cada ficha con normativa, plazo, requisitos y tramitación | No usado hasta ahora | **Fuente nº 1** para la CM: rango 3 para descubrir, canal, documentos y estado; los requisitos se citan de la norma BOCM enlazada (rango 1, G11) |
| Sede del Ayuntamiento de Madrid (`sede.madrid.es`, trámites y ayudas) y sedes de los grandes municipios | Ayudas municipales | No usado | Fuente para las ayudas municipales de la capital |
| Prestaciones estatales permanentes (Seguridad Social, SEPE, IMV, dependencia/SAAD, familia numerosa…) | **Programas, no convocatorias** | Parcialmente en la-ayuda | **Imprescindibles** para un orientador (patrón ACCESS NYC) |

## 2. Cambio de enfoque: programas, no solo convocatorias (ADR-038)

El ciudadano no busca «la convocatoria del BOCM de marzo». Busca «ayuda para la
guardería» o «ayuda porque me he quedado en paro». La unidad del producto pasa a
ser el **programa**, con uno de estos estados de acceso:

| Estado | Ejemplo | Cómo se muestra |
|---|---|---|
| `OPEN` | Convocatoria en plazo | «Plazo abierto: quedan N días» |
| `ROLLING` (permanente) | IMV, título de familia numerosa, prestación por nacimiento | «Se puede pedir en cualquier momento» |
| `UPCOMING` | Fecha de apertura publicada | «Abre el …» |
| `CLOSED_RECURRING` | Becas de comedor o cheque de escuela infantil que se convocan cada año | «Cerrada ahora. Se convoca cada año; la última vez, del X al Y. Te conviene estar atento a partir de …» — **solo** si hay ≥ 2 convocatorias anuales consecutivas citadas (`previousCalls`) |
| `CLOSED` | Convocatoria única cerrada | No se muestra por defecto |
| `UNKNOWN` | Sin dato fiable | «Consulta el plazo en la sede» |

Con esto, las 44 fichas de Madrid «cerradas» dejan de ser inútiles: si son
recurrentes, se muestran como tales; si no, no se muestran.

## 3. Embudo del universo (tarea F0-U)

```
Descubrimiento (sede CM · BDNS API · BOCM/pipeline la-ayuda · sede Ayto. Madrid · lista de prestaciones estatales permanentes · fichas la-ayuda)
   │ dedupe (identificador BDNS, ELI/BOE-BOCM, URL canónica de la sede, título normalizado)
   ▼
Clasificación determinista + revisión rápida del agente:
   ¿destinatario = persona física / hogar?        no → fuera (entidades, empresas, nombramientos, premios, nominativas)
   ¿puede pedirla un residente en la CM?          no → fuera
   ¿estado de acceso? OPEN / ROLLING / UPCOMING / CLOSED_RECURRING / CLOSED / UNKNOWN
   ▼
Universo Madrid (data/universe/programs.json, cada fila con fuente y procedencia)
   ├─ Nivel 1 «comprobada»: RuleSet citado + verificador + revisión de Daniel (F3 en oleadas)
   └─ Nivel 2 «relacionada, sin comprobar requisitos»: ficha con enlace oficial, estado de acceso y temas/eventos vitales
```

**Salida:** `data/universe/programs.json` + `evidence/<fecha>-universo/informe.md`
con recuentos por fuente, por estado y por tema, y la lista de descartes con su
motivo. **Las cifras de este documento se sustituyen por las medidas.**

### Lista mínima de programas permanentes a comprobar (semilla, a verificar)

Estatales: Ingreso Mínimo Vital (y su complemento de ayuda para la infancia),
prestación y subsidios por desempleo (SEPE), prestación por nacimiento y cuidado
de menor, prestación por cuidado de menor con enfermedad grave, prestación por
hijo a cargo con discapacidad, reconocimiento de la dependencia (SAAD) y sus
prestaciones, título de familia numerosa y sus beneficios, bono social eléctrico,
bono social térmico, becas del Ministerio (generales y NEAE), Bono Cultural Joven,
pensiones no contributivas.
Comunidad de Madrid: Renta Mínima de Inserción, ayudas de la CM a la maternidad y
natalidad, cheque o ayudas de escuela infantil, becas de comedor y precio reducido,
becas de FP y Bachillerato, abono transporte joven y tarjeta de transporte para
familias numerosas, Bono Alquiler Joven, Plan Alquila, ayudas a familias
numerosas, discapacidad (grado y prestaciones), tarjeta azul/transporte para
mayores, ayudas a víctimas de violencia de género.
Ayuntamiento de Madrid (y municipios grandes): ayudas sociales de emergencia,
Tarjeta Familias, ayudas a la vivienda, becas municipales.

> Esta lista es una **semilla de búsqueda**, no una afirmación: cada programa
> entra solo si se encuentra su norma y su ficha oficial vigentes.

## 4. Objetivos de cobertura (revisables tras F0-U)

| Nivel | Objetivo 14/10 | Mínimo aceptable |
|---|---|---|
| Nivel 1 (comprobadas con reglas) | **30–40** programas de Madrid y estatales, priorizando permanentes y recurrentes de alto alcance (familias, infancia, empleo, vivienda, dependencia, educación) | 20 |
| Nivel 2 (relacionadas con fuente) | **Todo el universo clasificado** como apto (estimación: 100–250) | 80 |

## 5. Producción en oleadas (ADR-040)

- **Oleadas de 5 programas**, en paralelo con varios agentes, cada uno en un
  worktree propio: `F:\AgentState\worktrees\datawardsmadrid\ola-<n>` (rama
  `rules/ola-<n>`), integrado por merge en `main` cuando pasa `validate:full`.
- **Verificador independiente** por oleada: un agente distinto, sin el contexto
  del autor, recibe solo el RuleSet y los textos de las fuentes. Comprueba cada
  cita (que el extracto exista y que la condición diga lo que dice el extracto),
  los umbrales, el rango de la fuente (G11) y la vigencia (ADR-035). Su informe
  va a `evidence/<fecha>-F3/ola-<n>-verificacion.md`.
- **Revisión de Daniel** sobre la hoja ya verificada: OK/KO por fila (G10).
  Cuando la oleada está verificada, Daniel puede aprobarla **por muestreo**:
  revisa 2 de cada 5 programas y, si no hay KO, aprueba la oleada (ADR-040).
  Cualquier KO ⇒ revisión completa de esa oleada.
- Orden: permanentes de gran alcance → recurrentes de Madrid → convocatorias
  abiertas ahora.

## 6. Acceso a los datos del VPS

Se permite **lectura** de la base de producción de official-sources (`sqlite3`
con `-readonly` o `mode=ro`) y de sus exportaciones, fuera de horas de ingesta y
sin copiar la base entera. Nunca escribir, reiniciar servicios ni tocar timers.
Ante la duda, usar la sincronización ya existente en la-ayuda (`data/pipeline/`).
