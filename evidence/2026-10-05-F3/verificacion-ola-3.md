# Verificación independiente — ola 3 (ADR-040)

Verificador independiente: no participé en la redacción. Fecha: 2026-10-05.

**Método.** (1) Script `F:\Temp\datawardsmadrid-verif3\check-citas.mjs`: recorre
todas las citas de los 5 rulesets (requirements, uncovered, amount, application,
documents, sub-condiciones); recalcula `sha256(excerpt)` y comprueba inclusión
literal en `data/eligibility/sources/<id>.txt` (normalización de blancos y
cortes «pala- bra» tolerados). (2) Runner `F:\Temp\datawardsmadrid-verif3\run-golden.ts`
(tsx, repo real): parsea ruleset + golden con los esquemas Zod y ejecuta
`evaluateRuleSet` con `ctx {today: gp.today, catalog:
public/datos/elegibilidad/questions.json, parameters:
data/eligibility/parameters.json, invariantsEnabled: false}`.
(3) Inspección de fidelidad sobre el texto de las fuentes y el catálogo de
preguntas. (4) G11: rangos por cita. (5) `standalone` vs
`data/catalog/benefits/` (244 fichas, ninguna con estos 5 slugs).

**Resultado global**: 107 citas comprobadas → **0 extractos ausentes, 0 hashes
incorrectos**. Los 5 goldens reproducen el veredicto esperado con el motor real
(5/5 `posible` + `ROLLING`, sin blockers). `eligibility-validate --today
2026-10-05` → 21 rulesets, 0 errores, 21 avisos G10 (pending, esperado).

| Ayuda | Dictamen | Motivo principal |
|---|---|---|
| complemento-ayuda-infancia | **KO** | `amount` muestra 57,5–115 €/mes con cita del art. 13.2.e cuyo texto consolidado dice 100/70/50 €: las cifras exhibidas no tienen respaldo en fuente de rango ≤2 |
| madrid-titulo-familia-numerosa | **OK** (con observaciones) | Fiel (21/25 correctos, encargo «21/26» corregido y documentado); 26 citas íntegras |
| bono-social-termico | **KO** | Hoja `ola-3-termico.md` no llegó a main; golden con `employmentStatus:"empleado"` (valor inexistente en el catálogo) |
| madrid-ayudas-nacimiento-general | **OK** (con observaciones) | Fiel (art. 6.c vigente, 500 €/mes, plazo continuado); merge degradó 2 extractos |
| prestacion-nacimiento-cuidado-menor | **KO** | 3 citas de uncovered no probatorias + requisito hard `persona-trabajadora` excluye docente/investigador/empleado público (falso negativo) |

## 1. complemento-ayuda-infancia — KO

19 citas íntegras y hash correctos. Golden `gp-cai-madre-getafe` reproduce
`posible` + `ROLLING` (3 hard en T). `standalone: true` correcto (sin ficha en
catálogo). G11 OK (la fuente rango 3 `segss-imv` solo aparece en
simulador/canal, zonas permitidas).

**Defecto bloqueante — `amount`**: `minEur: 57.5, maxEur: 115, monthly`. La cita
aportada (art. 13.2.e de la Ley 19/2021 consolidada) contiene el mecanismo
pero **otras cifras**: «Menores de tres años: 100 euros. Mayores de tres años y
menores de seis años: 70 euros. Mayores de seis años…: 50 euros» (verificado en
`boe-ley-19-2021-imv.txt` @72812). Los tramos 115/80,50/57,50 (100/70/50 × 1,15)
solo constan en la página de la Seguridad Social (rango 3), que G11 prohíbe
citar en `amount`. El autor lo detectó y documentó con honestidad (hoja
`ola-3-cai.md`, decisión 1), pero presentar cifras concretas amparadas por un
extracto que dice otras cifras infringe la regla 2 («sin fuente oficial no hay
afirmación») en su sentido más estricto.

**Resolución exigida**: `amount.type = "variable"` (conservando la cita del
mecanismo, art. 13.2.e), o localizar una fuente de rango ≤2 que publique los
tramos vigentes (el +15 % de 2023 y sus prórrogas anuales: p. ej. la norma de
revalorización o una resolución de cuantías del INSS si existiera en BOE). No
acepto la derivación «la página SS es oficial» sin más: G11 existe precisamente
para esto.

Observaciones menores: (a) `edad-titular` hard puede dar `no_cumple` a una menor
emancipada con hijo — el autor lo documentó y hay aviso; aceptable pero valorar
`hard:false`. (b) La pregunta `dependents` cubre «otras personas a tu cargo»; el
requisito CAPI («menor miembro de la unidad») lo tolera bien.

## 2. madrid-titulo-familia-numerosa — OK con observaciones

26 citas íntegras, hash correctos. Golden reproduce `posible` + `ROLLING`
(3 hard T + 1 soft T). `standalone` correcto: la ficha
`madrid-beneficios-familias-numerosas` es un hub distinto (verificado en
`data/catalog/benefits/`). G11 OK (sede rango 3 solo en plazo/documento
condicional, permitido por docs/08 §16).

Fidelidad verificada en el texto consolidado: art. 5.2 (competencia CCAA de
residencia), art. 2.1 («tres o más hijos»), art. 3.1.a («menores de 21 años» /
ampliación «hasta los 25 años de edad» si estudian — coincide con RD 1621/2005
«25 años incluidos»), art. 4 (categorías), Decreto 30/2023 nuevo art. 10.1.a
(«veintiséis años» = vigencia, bien distinguir del cómputo). La corrección del
encargo (21/25 y no 21/26) es **correcta** y está bien documentada.

Observaciones (no bloquean):

1. `boe-rd-1621-2005-reglamento-fn` está declarado en `sources` pero **no se
   cita nunca** — fuente declarada sin uso.
2. `dependents` ≠ «hijos»: la pregunta del catálogo es «personas a tu cargo»
   (`q.dependents.help`: «Hijas, hijos u otras personas que dependan de ti»).
   `edad-hijos` cuenta como computable a cualquier dependiente con
   `disability ∈ yes/unknown/declined` a cualquier edad: una madre dependiente
   discapacitada de 60 años + un hijo pasarían los dos hard (falso positivo en
   dirección «posible»). Limitación estructural del catálogo; convendría anotarlo
   en un uncovered o restringir la pregunta.
3. `hijos-minimo` cita art. 2.2.a (equiparación) para un simple `count ≥ 2` sin
   `where`: correcto como suelo pero el extracto describe un supuesto concreto;
   aceptable.

## 3. bono-social-termico — KO (proceso y golden, no fondo)

17 citas íntegras, hash correctos. El ruleset reproduce `posible` + `ROLLING`.
Fidelidad verificada: Orden 1478/2022 art. 1 (ámbito CM), art. 5 (perceptor BSE
a 31/12), RD 897/2017 art. 3.2.a (1,5×IPREM 14 pagas con multiplicadores de
unidad — correctamente enviado a `uncovered`), Orden 4379/2025 (inicio oficio
2025 sobre perceptores a 31/12/2024). `standalone` correcto.

**Defectos:**

1. **La hoja `ola-3-termico.md` no existe en `evidence/2026-10-05-F3/`** del repo
   principal. Existe en el worktree
   `F:\AgentState\worktrees\datawardsmadrid\ola-3-bono-termico\evidence\2026-10-05-F3\ola-3-termico.md`
   (untracked) y es buena: documenta que el BST nace del RDL 15/2018 y no del RD
   897/2017 y que el canal es la CM. Sin hoja en main no hay trazabilidad de la
   revisión humana — hay que copiarla.
2. **Regresión en el merge del golden**: en el worktree
   `employmentStatus = "asalariado"`; en main quedó `"empleado"`, valor
   **inexistente** en el catálogo (`asalariado|autonomo|empleado-publico|
   docente|investigador|militar|desempleado|jubilado|general`). El esquema Zod no
   lo detecta (answers libres) y el veredicto no cambia (el ruleset no consulta
   `employmentStatus`), pero el golden no es producible por el cuestionario real.
3. `incomeAnnual {min:28000,max:42000}` tampoco es una banda del cuestionario
   (la única banda alta es `banda-25200-inf` → `{25200, null}`). Igual en
   worktree y main; no afecta al veredicto (la vía FN basta) pero conviene
   corregirlo a `{25200, null}`.

## 4. madrid-ayudas-nacimiento-general — OK con observaciones

23 citas íntegras, hash correctos. Golden `gp-nacimiento-getafe` reproduce
`posible` + `ROLLING`. `standalone` correcto (existe
`madrid-ayudas-nacimiento-adopcion-multiple`, que es el pago único 1.800 € —
programa distinto, bien diferenciado en la hoja).

Fidelidad verificada en las tres piezas BOCM: art. 6.b («treinta años o menos»
→ `lte 30` hard ✓); art. 6.c redacción vigente del Acuerdo 21/12/2022 («al menos
durante cinco años, dentro de los diez años inmediatamente anteriores», ya no
ininterrumpidos → `residenceMonths ≥ 60` como soft con la regla exacta en
uncovered ✓, proxy correcto y conservador); art. 6.d (30.000/36.200 → soft con
el límite estricto ✓); art. 5.1 (gestante semana 21 / madre nacido ≥1/1/2022 /
adopción ✓); art. 4 (500 €/mes por hijo hasta 24 meses ✓); art. 9.1 (plazo
continuado ✓). G11 OK (Órdenes de crédito rango 2 permitidas en uncovered; sede
rango 3 solo en documento condicional).

Observaciones (no bloquean):

1. El merge degradó dos extractos respecto al worktree: «…residencia legal en
   Espa» (truncado a media palabra; en el txt consta «España» completa) y
   «dentro de los diez años inme-» (corte de PDF «inme- diatamente»). Ambos son
   literales (subcadenas del txt) y pasan el gate, pero el worktree tenía las
   versiones completas — conviene restaurarlas.
2. Inconsistencia cross-ruleset de rangos: aquí las Órdenes BOCM de crédito van
   con rango 2 y en `bono-social-termico`/becas/infantil las Órdenes de
   convocatoria van con rango 1. Ambas ≤2 (G11 se cumple); convendría unificar
   el criterio en `docs/08`.
3. `amount.type:"variable"` con `minEur:500` — el 500 €/mes sí está citado; OK.

## 5. prestacion-nacimiento-cuidado-menor — KO

22 citas íntegras (literal + hash). Golden `gp-permiso-madre-parla` reproduce
`posible` + `ROLLING`. `standalone` correcto. Correcciones del encargo
verificadas y correctas: la prestación está en LGSS arts. 177–182 (no 331–345)
y el permiso vigente es de **19 semanas** por el RDL 9/2025 (ET art. 48.4,
verificado en el txt: «diecinueve semanas», «treinta y dos semanas»
monoparentalidad, «dos semanas… hasta que el hijo o la hija cumpla los ocho
años»). Tramos de cotización del art. 178.1 fieles (<21→0; 21–25→90d/7a o
180d vida; ≥26→180d/7a o 360d vida).

**Defectos bloqueantes:**

1. **Tres citas de `uncoveredRequirements` presentes pero no probatorias** (el
   extracto existe en el `.txt` pero habla de otra cosa; localizador cesta
   «LGSS arts. 165.1/177/180/181» que no es un localizador real):
   - `corriente-de-cuotas`: extracto «la empresa deberá de encontrarse al
     corriente de pago en las cuotas…» — es de la DA cuadragésima octava
     (reducciones de cuotas de la **empresa** vía Sistema RED), no del requisito
     del causante. La norma correcta está en el mismo snapshot: **art. 47 LGSS**
     («En el caso de trabajadores que sean responsables del ingreso de
     cotizaciones… será necesario que el causante se encuentre al corriente en
     el pago»). Sustituir extracto y localizador.
   - `limites-adopcion-acogimiento`: el label habla de límites del **ET**
     (<6 años, o mayores con discapacidad/dificultades acreditadas) y del EBEP
     (acogimiento ≥1 año), pero cita `boe-lgss-…` con el extracto genérico del
     art. 177. El respaldo real está en el snapshot ya declarado
     `boe-et-estatuto-trabajadores` (art. 45.1.d: «de menores de seis años o de
     menores de edad mayores de seis años con discapacidad o que… tengan
     especiales dificultades de inserción…»). Recitar a ET.
   - `subsidio-parto-multiple`: el extracto citado (art. 181, beneficiarias del
     supuesto especial) no menciona el subsidio especial por parto múltiple; en
     las fuentes declaradas de rango ≤2 no he localizado el texto que lo regula.
     Opciones: localizar la norma real (posiblemente disposición/reglamento, no
     LGSS 181) o rebajar el claim.
   Contexto: el worktree original citaba estas tres a la página seg-social
   (rango 3, extractos sí probatorios) — eso era KO por G11; el merge subió el
   rango a 1 cambiando los extractos por otros literales pero no afines. Se
   cambió una violación de rango por una violación de probanza.
2. **`persona-trabajadora` (hard) da F a `docente`, `investigador`,
   `empleado-publico` y `militar`** → `no_cumple` para perfiles que pueden ser
   personal laboral en Régimen General (docentes e investigadores laborales lo
   son). UNKNOWN≠NO: el régimen de un docente no se puede descartar con la
   pregunta. La ola 2 recibió la misma observación del verificador de entonces
   («cáncer amplía a docente/investigador», según el commit 0d4b52f) — pero esa
   ampliación **ni siquiera está en `prestacion-cuidado-menor-enfermedad-grave.json`**
   (sigue `in [asalariado, autonomo]`; el mensaje del commit es inexacto) y en
   todo caso no se aplicó aquí. Ampliar el `any` a `in [asalariado, autonomo,
   docente, investigador, empleado-publico]` con el matiz EBEP en el aviso, o
   rebajar a soft.
3. **Hoja desincronizada**: `ola-3-permiso.md` (idéntica al worktree) sigue
   describiendo como citas las de seg-social rango 3 que el ruleset mergeado ya
   no contiene; la decisión 6 de la hoja ya no refleja el ruleset. Actualizar la
   tabla tras recitar.

Observaciones menores: el extracto del requisito `menor-a-cargo` habla de
«situaciones protegidas» y no de «a tu cargo» (las ramas lo cubren peor aún:
cita de afiliación/alta para el label «persona trabajadora»; las sub-condiciones
sí llevan citas correctas de arts. 178.1 y 318.a).

## Tabla de muestreo — 2 puntos críticos por ayuda

| Ayuda | Punto muestreado | Fuente / lugar | Resultado |
|---|---|---|---|
| CAI | Cuantía 57,5–115 €/mes | `boe-ley-19-2021-imv.txt` @72812: art. 13.2.e dice «100 euros / 70 euros / 50 euros» | **KO**: cifras mostradas sin respaldo rango ≤2 |
| CAI | Edad titular ≥23 o mayor con menores a cargo | art. 5.2 literal presente @51230 | OK (excepciones en ⚠ documentadas) |
| Título FN | Umbral de cómputo `age lte 25` | Ley 40/2003 art. 3.1.a «menores de 21… ampliará hasta los 25 años de edad» + RD 1621/2005 «25 años incluidos» | OK: encargo «21/26» bien corregido |
| Título FN | `dependents` cuenta «otras personas a tu cargo» | `q.dependents.help` i18n | Observación: adulto dependiente discapacitado infla el cómputo (falso positivo «posible») |
| Térmico | Golden `employmentStatus:"empleado"` | catálogo `q-employment` (9 valores; «empleado» no existe) | **KO**: regresión de merge (worktree: «asalariado») |
| Térmico | Perceptor BSE a 31/12 como criterio decisivo no comprobable | Orden 1478/2022 art. 5 + RDL 15/2018 art. 8 | OK (en uncovered; la ayuda es de oficio, no hay falso negativo) |
| Natalidad | Empadronamiento 5-en-10 no continuados | BOCM 29/12/2022, art. 6.c vigente | OK (soft + regla exacta en ⚠) |
| Natalidad | Extractos «…en Espa» / «inme-» truncados | vs versiones completas del worktree | Observación: literales pero degradados en merge |
| Permiso | `corriente-de-cuotas` con extracto de DA 48ª (empresa/reducciones) | LGSS txt @883262 vs norma correcta art. 47 @109989 | **KO**: cita no probatoria |
| Permiso | `persona-trabajadora` excluye docente/investigador/público/militar | catálogo `q-employment`; precedente verificador ola 2 | **KO**: falso negativo en requisito duro |

## Acciones para cerrar la ola

1. **CAI**: `amount` → `variable` o fuente rango ≤2 con los tramos vigentes.
2. **Térmico**: copiar `ola-3-termico.md` desde el worktree a
   `evidence/2026-10-05-F3/`; corregir el golden (`empleado`→`asalariado`,
   `{28000,42000}`→`{25200,null}`).
3. **Permiso**: recitar `corriente-de-cuotas` (LGSS art. 47),
   `limites-adopcion-acogimiento` (ET art. 45.1.d) y resolver
   `subsidio-parto-multiple`; ampliar/ablandar `persona-trabajadora`;
   actualizar la hoja.
4. **Natalidad** (opcional): restaurar extractos completos del worktree.
5. **Proceso**: el commit 0d4b52f afirma «cáncer amplía a docente/investigador»
   pero `prestacion-cuidado-menor-enfermedad-grave.json` sigue sin contener
   `docente` ni `investigador` — mensaje de commit inexacto o corrección perdida
   en el merge; conviene revisar si otras correcciones de la ola 2 quedaron sin
   aplicar.

## Evidencia de ejecución

- `node F:\Temp\datawardsmadrid-verif3\check-citas.mjs` → 107 citas, 0 ausentes,
  0 hash incorrectos; única señal de rango: citas rango 3 confinadas a
  `application.*` (permitido).
- `tsx F:\Temp\datawardsmadrid-verif3\run-golden.ts` → 5/5 goldens reproducen
  `posible` + `ROLLING`, sin blockers ni missingFields.
- `tsx scripts/eligibility-validate.ts --today 2026-10-05` → 21 rulesets,
  0 errores, 21 avisos G10.
- Catálogo `data/catalog/benefits/` (244 fichas): ninguna coincide con los 5
  slugs ⇒ `standalone: true` correcto en los 5.
