# Verificación independiente — ola 2 (ADR-040)

Verificador que **no** ha participado en la producción. Método:

1. `npx tsx scripts/eligibility-validate.ts --today 2026-10-05` (gate oficial
   G1–G11): **16 rulesets, 0 errores, 16 avisos** (todos `ELIG_G10_HUMAN_REVIEW`,
   esperados antes del muestreo de Daniel). Es decir: todos los `excerpt` están
   literalmente en el `.txt` normalizado y todos los `excerptSha256` cuadran
   (G4), dominios registrados y **ninguna cita de requisitos/uncovered/amount
   usa rango > 2** (G11); rango 3 solo en `channel`, `documents`,
   `officialSimulator` y el estado operativo del plazo (expresamente permitido
   por el gate).
2. Verificación semántica manual: posición de cada extracto frente a las
   cabeceras de artículo del `.txt` (script de contexto en
   `F:\Temp\datawardsmadrid-verif2\check-citations.mts`), umbrales y fechas
   recomputados o contrastados con el texto completo de cada norma.
3. Personas golden ejecutadas con el motor real (`evaluateRuleSet` vía tsx,
   runner propio `F:\Temp\datawardsmadrid-verif2\run-golden.mts`,
   `invariantsEnabled: true` → `selfCheck` PASS en los cinco) + casos límite
   para falsos negativos (`edge-cases.mts`).
4. Goldens validados contra `goldenPersonaSchema` (Zod estricto).

Ámbito: `madrid-renta-minima-insercion`, `prestaciones-dependencia-saad`,
`madrid-abono-transporte-joven`, `madrid-abono-transporte-65`,
`prestacion-cuidado-menor-enfermedad-grave`. Identidades comprobadas: los dos
renombrados coinciden con fichas del catálogo (`prestaciones-dependencia-saad`
y `prestacion-cuidado-menor-enfermedad-grave`, ambas `active` + `revisada`);
los otros tres son `standalone: true` y **no** tienen ficha homónima en
`data/catalog/benefits/` (correcto: `renta-activa-insercion` es la RAI estatal,
no la RMI). Nombres públicos reales en `src/lib/aid-titles.ts` (sin invenciones
tipo «beca-6000»). `verifiedAt: 2026-10-05`, `humanReview: pending`,
`themes`/`lifeEvents` dentro del enum canónico en los cinco.

---

## madrid-renta-minima-insercion — VERDICT: OK (con erratas)

Ejecución golden `gp-rmi-getafe` (today 2026-10-05): `verdict=posible` ✓,
`deadline=ROLLING` ✓; hard T/T/T (residencia CM, año de residencia, 25–65) y
soft `ingresos-inferiores-rmi` = U (banda 0–8.400 cruza 5.639,16) ✓.

- Extractos: todos presentes y en el artículo citado (Ley 15/2001: 2.1, 6.1.a,
  6.1.b y circunstancia 1.ª, 6.1.b in fine, 6.1.e, 6.1.f, 6.1.g, 6.2, 7.1 in
  fine, 8.2, 8.5; Reglamento Dto. 126/2014: 9.4, 12.2, 12.6, 14.3, 31.1;
  Ley 6/2025 art. 58.a). La lista de excepciones del aviso
  `unidad-convivencia-excepciones` coincide una a una con el art. 14.3 a)–e).
- Números: 469,93 €/mes base + 117,48 € primer adicional + 75,11 € siguientes
  (art. 58) ✓; 5.639,16 = 469,93 × 12 ✓; tope = SMI según art. 58 in fine →
  1.221 €/mes en 2026 (RD 126/2026, art. 1: «40,70 €/día o 1 221 €/mes») ✓;
  unidad de convivencia 6 meses (art. 9.4) ✓; patrimonio <3× cuantía anual
  (art. 12.6) ✓; subsidiariedad con denegación previa (Ley art. 4.2: «Sólo
  cuando fueran denegadas…») ✓.
- Ventana `rolling` citada del Regl. art. 31.1; la sede confirma «En plazo:
  permanente» ✓.

Erratas (ninguna bloqueante; la 1.ª y la 2.ª son falsos negativos reproducidos
en requisitos duros — los más serios de la ola):

1. **`residencia-un-ano` (hard) mide la antigüedad en el municipio actual, no
   en la Comunidad.** `q-residenceSince` pregunta «¿Desde cuándo estás
   empadronado **ahí**?» (en el municipio elegido en `q-territory`). La norma
   exige residencia efectiva e ininterrumpida **en la CM** el año anterior;
   mudarse dentro de la CM no la interrumpe. Reproducido: perfil empadronado
   en Getafe desde 04/2026 (tras años en otro municipio de la CM) ⇒
   `residencia-un-ano=F` ⇒ **`no_cumple` falso**. El label dice «(proxy:
   antigüedad en el empadronamiento)» pero no revela el fallo para quien se
   movió dentro de la región. Recomendación: `hard: false` (mismo tratamiento
   que `residencia-espana-5y2` de dependencia, que resuelve este mismo sesgo
   como soft) o advertencia explícita «si antes vivías en otro municipio de la
   CM, ese tiempo también cuenta».
2. **`edad-25-65` (hard) excluye a menores emancipados.** La rama de excepción
   exige `age ≥ 18`; pero el propio uncovered `menores-emancipados` (Ley
   art. 6.1.b in fine) reconoce que un menor emancipado puede ser titular.
   Reproducido: 17 años con una hija ⇒ F ⇒ `no_cumple`. La norma la admitiría
   (emancipada + menor a cargo). Caso borde, pero es un hard que corta.
3. Frontera exacta-25: la Ley dice «mayor de veinticinco años» (vía general) y
   el Regl. art. 8.2 cubre «entre dieciocho y veinticinco años». El ruleset
   implementa `gte 25` en la vía general (interpretación válida) y el aviso
   `vias-18-25` dice «entre 18 y 24 años» — la norma dice **veinticinco**,
   así que el label debe decir «18–25».
4. `amount.maxEur` 1.221 €: derivación correcta (art. 58 in fine + SMI) pero el
   excerpt citado solo respalda los 469,93 €; mismo patrón que `imv` en la
   ola 1 (derivación documentada, cita que no cubre el tope literal).
5. `computo-ingresos-unidad`: el label afirma «rendimientos mensuales de TODA
   la unidad» pero el excerpt citado (Ley art. 8.2) habla de los rendimientos
   **del solicitante** frente a la PNC (+25 %/+15 % por miembro). La afirmación
   del label se sostiene mejor con Regl. art. 15.1 («recursos de que dispongan
   todos los miembros de la unidad de convivencia en el mes»). Localizador
   impreciso, dato verdadero.
6. `incomeAnnual` pregunta ingresos **personales** («¿Cuántos ingresos anuales
   tienes?»), no de la unidad; el label y el ⚠ lo declaran, pero la dirección
   del error puede ser en ambos sentidos (es soft).
7. `unidad-convivencia-excepciones`: «desarraigo social» es paráfrasis del
   art. 14.3.d («personas solas en situación de grave exclusión») — aceptable,
   no literal.

## prestaciones-dependencia-saad — VERDICT: ruleset OK / KO el golden

Ejecución del ruleset real con el perfil golden: `posible` + `ROLLING` +
`missing=[dependency]` ✓ exactamente lo esperado.

- **KO del golden `gp-dependencia-cuidadora.json`**: tras el renombrado del
  ruleset, el archivo quedó inconsistente — `expectations[0].benefitSlug =
  "madrid-dependencia-saad"` y `rulesVersion: 1` apuntan al slug/versión que
  **ya no existen** (el ruleset es `prestaciones-dependencia-saad` v2), y las
  claves extra raíz `benefitSlug`/`rulesVersion` **violanean
  `goldenPersonaSchema` (strictObject)**: `safeParse` devuelve
  `unrecognized_keys`. Un runner de goldens que respete el contrato no
  encontrará ruleset para esa expectativa. Corrección: actualizar
  `expectations[0]` al slug nuevo + `rulesVersion: 2` y eliminar las claves
  raíz extra. La hoja del autor (`ola-2-dependencia.md`) también describe el
  slug viejo v1 + `standalone: true`; está fechada antes del renombrado —
  añadir una línea aclaratoria.
- Extractos: todos presentes y en el artículo citado (Dto. 54/2015 art. 2;
  Ley 39/2006 arts. 5.1.a, 5.1.c, 5.2, 5.4 (emigrantes retornados verificado
  en el texto), 14.4, 27.2, 28.1, 29.1, DA 13.ª.1, DF 1.ª.2; Dto. 54/2015
  arts. 12.2, 13.1.a/c/d/e/g/h, 18.2). La antigüedad máxima de 3 meses del
  informe de salud está literal en art. 13.1.e ✓.
- Ventana `rolling` citada de la ficha S13 («En plazo: permanente Referencia:
  S13», sede rango 3 — permitido para estado operativo del plazo) ✓.

Erratas (menores):

1. `residencia-espana-5y2` (soft) usa el mismo proxy municipal: quien lleva
   <2 años empadronado en su municipio tras años en otra provincia obtiene F
   (reproducido: residenceSince 10/2025 ⇒ F). Es aviso y el label lo declara;
   el veredicto queda `posible`. Menor.
2. `menores-3-anos` añade «(en la CM, el CRECOVI)»: dato real pero no está en
   el excerpt citado (Ley estatal). Sobre-extensión de label menor.
3. `empadronado-cm`: el excerpt dice «residan» y el label añade
   «empadronado» — el empadronamiento se acredita documentalmente (Dto.
   art. 13.1.c); coherente, anotado.
4. `sin-reconocimiento-previo` evalúa la dependencia **de quien responde**
   (`dependency` solo se pregunta si `disability ≠ no`); el perfil no capta la
   dependencia de las personas a cargo. Queda U ⇒ `posible`, honesto; el
   golden lo documenta bien.
5. Alcance: la ficha del catálogo es `scopeLevel: state` y el ruleset impone
   residencia CM como hard. Coherente con el producto (pregunta territorial
   centrada en CM), pero un usuario de otra CCAA vería `no_cumple` en una
   ficha estatal. Decisión aceptable; que Daniel lo sepa.

## madrid-abono-transporte-joven — VERDICT: OK (con erratas menores)

Ejecución golden `gp-abono-estudiante-alcala`: `posible` + `ROLLING` +
`blockers=[]` ✓. Control negativo: 26 años ⇒ `no_cumple` (correcto).

- Edad: la cita «nacidos entre 2000 y 2011» equivale a cumplir 15–26 durante
  2026 ⇒ `gte 15` + `lt 26` fiel («hasta el día en que cumples 26»; la ficha
  CRTM —rango 3, no citada en requisitos— lo confirma literal). `timeDependent`
  increasing/decreasing bien puestos.
- Precios: fila Joven 10,00 € ordinario (bonificado) ✓ y tarifa oficial
  20,00 € en la resolución de tarifas ✓; columnas de descuentos adicionales
  mapean bien (disc ≥65 % = 8 €, FN general = 8 €, FN especial = 5 €,
  FNG+disc = 6 €, FNE+disc = 3 €) ✓; TTP 4,00 € ✓.
- Residencia TTP (desde 15/06/2026) como soft: correcto — la disyunción
  CM ∪ zonas E1/E2 ∪ convenio CLM no es modelable y nunca descarta (UNKNOWN
  ≠ NO) ✓. `within_territory {ccaa:13}` coherente.

Erratas (menores):

1. El excerpt de `amount`/`descuentos-adicionales` («10,00 € 8,00 € …
   3,70 € (*) 365 días de validez») sangra a las filas siguientes por el orden
   de extracción del PDF: el 3,70 € es la Tarjeta Azul y «365 días» es del
   Abono +65. La cifra citada (10,00 €) está, pero el extracto no es solo la
   fila Joven. Inocuo pero impreciso.
2. `precio-bonificado-2026`: el label afirma «garantizada hasta el 31/12/2026»;
   el excerpt citado (punto primero de la resolución de tarifas) habla del
   +3 % con excepción del abono joven — la garantía temporal se sustenta en el
   acuerdo de precios («en el año 2026»), no en esta cita. Sobre-extensión
   menor.
3. `window` cita «Mantener los precios… en 2026» — respalda la vigencia de
   precios, no la compra continua del título; aceptable (y es rango 1, más de
   lo exigible para la ventana).

## madrid-abono-transporte-65 — VERDICT: OK (con una errata de umbral)

Ejecución golden `gp-abono-65-carabanchel`: `posible` + `ROLLING` +
`blockers=[]` ✓ (67 años, municipio Madrid 28079, banda 0–8.400 ≤ IPREM).

- «Tener sesenta y cinco años cumplidos» y «siendo residentes en Madrid»
  literales en el Anexo de la Resolución 11/04/2011 ✓; `municipality: "28079"`
  es la lectura correcta (beneficio municipal del Ayuntamiento).
- Escala de cargas 1,16499 / 1,37294 / 1,76500 ×IPREM — literal en el Anexo
  A) Sexta ✓; suma de ingresos de personas a cargo ✓ (párrafo final);
  revisión de oficio (apartado C) ✓; apertura 02/03/2009 (Disposición Segundo)
  ✓; validez mensual zona A + EMT + ML1 (resolución 2009) ✓; Abono +65
  gratuito 365 días en la tabla de precios ✓; 3,70 € bonificado y 6,30 €
  oficial ✓.

Erratas:

1. **Unidad del tope de renta dudosa (soft).** La resolución operacionaliza el
   límite en **mensual** (anexo «INGRESOS MES … hasta 532,51 €» = IPREM mensual
   de 2011). El ruleset compara `incomeAnnual ≤ IPREM_ANUAL_14P` (8.400 €/año
   ≡ 700 €/mes), un ~17 % más laxo que la conversión fiel (600 €/mes × 12 =
   7.200 €/año = `IPREM_ANUAL_12P`). No excluye a nadie (soft + ⚠ de cargas),
   pero el umbral declarado en el label («8.400 € en 2026») no es el que la
   norma aplica. Recomendación: `IPREM_ANUAL_12P` o justificar explícitamente
   la elección 14-pagas.
2. `edad-65` hard es correcto para la categoría Primera, pero una pensionista
   por invalidez de 55 años con ingresos bajos (encaja en la Segunda) obtiene
   `no_cumple` mientras el ⚠ `otras-categorias` le dice «revísala también» —
   leve contradicción veredicto/aviso, aceptable por el alcance «+65» del
   ruleset. Reproducido.
3. Duplicación de snapshots (higiene): `bocm-20251231-2-precios-2026` y
   `bocm-20251231-2-precios-transporte-2026` son **el mismo PDF** (misma URL y
   mismo sha256 de bytes `11dff8ca…`) snapshotteado con dos ids; igual para
   `bocm-20251231-3-tarifas-*` (`c8e8bc79…`). Los `.txt` difieren solo en la
   normalización de guiones cortados. Conviene unificar el sourceId (riesgo de
   divergencia futura, duplica bytes en snapshots/).
4. `foto` (doc) cita las Condiciones TTP 2026 (cláusula 4) — correcto para la
   tarjeta física; el anexo B) de 2011 no la lista (la tarjeta no era TTP
   personal aún). Elección razonable, anotada.

## prestacion-cuidado-menor-enfermedad-grave — VERDICT: ruleset OK / KO el golden

Ejecución del ruleset real con el perfil golden: `posible` + `ROLLING` +
`blockers=[]` ✓ (dependiente de 6 años ⇒ T; asalariado ⇒ T).

- **KO del golden `gp-cancer-padre-vallecas.json`** — mismo defecto que
  dependencia: `expectations[0]` apunta a `prestacion-cuidado-menores-cancer`
  v1 (slug inexistente tras el renombrado) y las claves raíz extra
  `benefitSlug`/`rulesVersion` violan `goldenPersonaSchema` (`unrecognized_keys`
  en `safeParse`). Misma corrección.
- Reglas verificadas contra el RD 1148/2011 consolidado (con RD 677/2023) y la
  LGSS: reducción ≥50 % y afiliación/alta (art. 4.1) ✓; ambos progenitores en
  alta con excepciones (mutualidad de colegio profesional, Convenio Especial
  por trabajar en país sin convenio, monoparentales) — el label las enumera
  bien (art. 4.2) ✓; único beneficiario y alternancia por periodos ≥1 mes
  (arts. 4.3/4.5) ✓; cotización por edades (<21 ninguna; 21–25: 90 días/7 años
  o 180 vida laboral; ≥26: 180/7 años o 360 vida laboral — exacto, arts.
  5.1–5.2) ✓; duración 1 mes + 2 + sucesivos de 4 hasta los 23 (26 con
  discapacidad ≥65 %) — literal en art. 7.1 ✓; solicitud en 3 meses o
  retroactividad máxima 3 meses (art. 7.1) ✓; funcionarios fuera (LGSS
  art. 191.4) ✓; ingreso de larga duración incluye cuidado/tratamiento en
  domicilio tras diagnóstico+hospitalización (art. 3.1) ✓.

Erratas:

1. **`trabajadora-afiliada-alta` (hard, `in [asalariado, autonomo]`) produce
   falsos negativos en cotizantes a la SS.** `docente` (concertada/privada:
   Régimen General), `empleado-publico` laboral (no funcionario), `investigador`
   contratado y `general` ⇒ F ⇒ `no_cumple`. Reproducido con el motor
   (docente ⇒ `trabajadora-afiliada-alta=F` ⇒ `no_cumple`). El autor lo anota
   («caso borde, aceptable») pero docente-laboral no es un caso borde en
   Madrid. Recomendación: que esos valores den U (no F) o degradar a soft; los
   únicos F seguros son `desempleado`/`jubilado`… y ni siquiera `funcionario`
   está separado del resto de «empleo público».
2. `persona-a-cargo`, rama 18–25 (`age < 26`): da T a un dependiente de 23–25
   aunque el art. 190.3 exige además **discapacidad ≥65 % acreditada antes de
   los 23** para esa franja; el label solo cita «diagnosticada antes de los
   18». Sobre-inclusión segura (fail-open, el veredicto queda capado en
   posible) pero el ⚠ debería mencionar la condición de discapacidad para
   23–25.
3. Hallazgo del autor **relevante fuera del ruleset**: la ficha del catálogo
   `data/catalog/benefits/prestacion-cuidado-menor-enfermedad-grave.json` tiene
   `officialSourceUrl` = `…/InformacionUtil/44539/44084` (verificado en el
   JSON; el autor reporta que esa página devuelve «Obtención del Número de la
   Seguridad Social / Afiliación», no la prestación — yo no lo he re-descargado).
   No es defecto del ruleset (que cita `…/Pensionistas/Servicios/34887/40968/1951`),
   pero la ficha `revisada` parece llevar una fuente oficial errónea — conviene
   corregirla en otra unidad.

---

## Resumen para el muestreo de Daniel (2 puntos por ayuda)

| Ayuda | Punto crítico 1 | Punto crítico 2 |
|---|---|---|
| madrid-renta-minima-insercion | `residencia-un-ano` (hard): el proxy mide antigüedad en el **municipio actual**, no en la CM ⇒ `no_cumple` falso si te moviste dentro de la región (reproducido). Plantéate soft o aviso explícito | `edad-25-65` (hard) corta a menores emancipados con cargas (17 + hija ⇒ `no_cumple`) que la propia ley admite; y el aviso de vías jóvenes dice «18–24» donde la norma dice «18–25» |
| prestaciones-dependencia-saad | **Golden roto tras el renombrado**: `expectations` apunta a `madrid-dependencia-saad` v1 (inexistente) y las claves raíz extra rompen `goldenPersonaSchema` | `residencia-espana-5y2` usa antigüedad municipal como proxy de «5 años en España + 2 inmediatos» — F soft en mudanzas recientes (declarado en label; veredicto se mantiene) |
| madrid-abono-transporte-joven | Edad `gte 15` + `lt 26` fiel al colectivo «nacidos 2000–2011»; comprueba que la residencia TTP (desde 15/06/2026) queda como aviso y nunca excluye | El excerpt de la fila Joven sangra valores de Tarjeta Azul (3,70 €) y Abono +65 («365 días») por el orden de extracción del PDF — inocuo pero impreciso |
| madrid-abono-transporte-65 | `renta-iprem` usa `IPREM_ANUAL_14P` (8.400 €/año ≡ 700 €/mes) pero el anexo de la resolución mide el tope en **mensual** (532,51 € en 2011 ⇒ 600 €/mes ⇒ 7.200 €/año): umbral ~17 % laxo | `edad-65` hard da `no_cumple` a pensionistas <65 que encajan en otras categorías de la Tarjeta Azul (⚠ lo advierte); snapshots `-precios-2026`/`-precios-transporte-2026` son el mismo PDF duplicado |
| prestacion-cuidado-menor-enfermedad-grave | `trabajadora-afiliada-alta` (hard) da `no_cumple` a docentes/laborales públicos/investigadores que sí cotizan a la SS (reproducido) — el falso negativo más discutible de la ola | Golden roto igual que dependencia (expectativa al slug viejo + claves extra fuera de schema); además la ficha del catálogo lleva una `officialSourceUrl` que apunta a otra página de la SS |

## Resultado global

- **5 de 5 rulesets normativamente íntegros**: ningún extracto ausente ni sha
  incorrecto (G4), todos los localizadores verificados contra el artículo
  citado, umbrales y fechas correctos (469,93 €; escala 117,48/75,11; tope SMI
  1.221 €; 10 €/20 €; 3,70 €/6,30 €; 15–26 años; 65 cumplidos; escala IPREM
  1,16499/1,37294/1,765; cotización 90/180 y 180/360; 1+2+4 meses hasta 23/26).
  Los 5 goldens se reproducen con el motor real (veredicto + deadline + missing
  + blockers tal como se espera).
- **2 KO de contrato en goldens** (`gp-dependencia-cuidadora`,
  `gp-cancer-padre-vallecas`): las `expectations` siguen apuntando a los slugs
  pre-renombrado (`madrid-dependencia-saad`, `prestacion-cuidado-menores-cancer`)
  con `rulesVersion: 1`, y las claves raíz extra violan `goldenPersonaSchema`.
  Corrección mecánica: actualizar slug+versión en `expectations[0]` y quitar
  las claves extra.
- **3 falsos negativos en requisitos duros** (reproducidos con el motor):
  RMI `residencia-un-ano` (mudanza intra-CM), RMI `edad-25-65` (menor
  emancipado con cargas), cáncer `trabajadora-afiliada-alta` (docente/laboral
  público/investigador cotizante). Ninguno es inventado: son opciones reales
  del catálogo de preguntas. Criterio del proyecto: UNKNOWN ≠ NO — estas
  condiciones deberían dar U o ser soft donde la pregunta no puede distinguir.
- G11 limpio; ventanas `rolling` todas citadas; sin `previousCalls`/`recurrence`
  porque ninguna es de convocatoria — correcto.
- Erratas recurrentes: labels que afirman datos no presentes en el excerpt
  citado (CRECOVI, «31/12/2026», «TODA la unidad» vs cita del solicitante,
  sangrado de filas del PDF de precios), y duplicación de snapshots
  `bocm-20251231-2/3` con dos sourceId para el mismo PDF.
- Pendiente cruzado (no es de esta ola): la ficha del catálogo
  `prestacion-cuidado-menor-enfermedad-grave` tiene `officialSourceUrl`
  apuntando a «Número de la SS / Afiliación» — corregir en otra unidad.
