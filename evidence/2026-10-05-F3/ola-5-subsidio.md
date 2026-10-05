# Hoja de revisión — ola 5: Subsidio por desempleo (carencia de rentas / insuficiencia de cotización, SEPE, estatal)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## subsidio-desempleo (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `subsidio-desempleo` en
`data/catalog/benefits/` (existen fichas hermanas del catálogo importado:
`subsidio-cotizaciones-insuficientes`, `subsidio-emigrantes-retornados` y
`subsidio-mayores-52`, pero el slug del encargo es el genérico del art.
274.1 LGSS); G2 se satisface con la fuente de rango 1 propia (LGSS,
texto consolidado BOE, última actualización 03/10/2026).

> **Ámbito normativo:** este RuleSet cubre el subsidio **general** del art.
> 274.1 — (a) agotamiento de la prestación contributiva y (b) situación
> legal de desempleo con cotizaciones insuficientes (≥90 días sin llegar a
> 360). **No** cubre el subsidio de mayores de 52 (art. 280), que ya tiene
> su propio RuleSet (`subsidio-mayores-52`); se remite a él con el
> requisito uncovered `remision-mayores-52` (art. 274.3).

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **aviso**: Estar en desempleo total, o trabajando a tiempo parcial (suma de jornadas < jornada completa) | employmentStatus eq "desempleado" (soft) | «Serán beneficiarios del subsidio los desempleados que, cumpliendo los requisitos establecidos en el apartado 2, se encuentren en alguna de las siguientes situaciones» | Art. 274.1 LGSS | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| **aviso**: Carencia de rentas propias — rentas del mes anterior ≤ 75 % SMI sin pagas extra (915,75 €/mes 2026 ⇒ proxy anual 10.989 €/año); alternativa: responsabilidades familiares | incomeAnnual lte param `SMI_MENSUAL` × 9 (soft) | «cuando las rentas de cualquier naturaleza de la persona solicitante o beneficiaria durante el mes natural anterior a dichas fechas no superen el 75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias» | Art. 275.1 LGSS | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |

**No comprobables con nuestras preguntas (⚠):**

- **Hecho causante — criterio decisivo**: (a) «Haber agotado la prestación
  por desempleo» (art. 274.1.a) o (b) «Encontrarse en situación legal de
  desempleo sin tener cubierto el periodo mínimo de cotización para tener
  derecho a la prestación contributiva, siempre que hayan cotizado al menos
  noventa días» (art. 274.1.b). La página SEPE lo resume como «te encuentras
  en situación legal de desempleo sin tener cubierto al menos 360 días
  cotizados para tener derecho a la prestación contributiva, siempre que
  hayas cotizado al menos 90 días». Es dato de vida laboral ⇒ U.
- **Sin derecho a contributiva** (art. 274.2): «se exigirá no tener derecho
  a la prestación contributiva por desempleo». El encargo lo listaba como
  comprobable, pero **no hay pregunta que lo determine** (no preguntamos
  cotizaciones ni prestación en curso) ⇒ U; es coherente con el tratamiento
  de «360 días cotizados» en `prestacion-desempleo-contributiva` (UNKNOWN
  ≠ NO).
- **Menor de 45 sin responsabilidades familiares accediendo por
  agotamiento**: la prestación agotada debe haber durado ≥360 días
  (art. 274.1.a). La edad se pregunta pero la duración de la prestación
  agotada y las responsabilidades familiares (cónyuge/pareja) no ⇒ U.
- **Alternativa por responsabilidades familiares** (arts. 274.2 in fine y
  275.2-3): la renta per cápita de la unidad familiar (solicitante +
  cónyuge/pareja de hecho + hijos <26 o con discapacidad o acogidos) debe
  ser ≤75 % SMI. No preguntamos rentas del resto de la unidad ni la
  composición completa ⇒ U. Por eso `carencia-rentas` es soft: una renta
  propia alta no excluye si hay responsabilidades familiares.
- **Inscripción como demandante de empleo + acuerdo de actividad**
  (art. 274.4; la sede SEPE lo exige «en el momento de la resolución de la
  solicitud») ⇒ U.
- **Incompatibilidades** (art. 274.2: «no encontrase en supuesto de
  incompatibilidad» [sic en el texto consolidado]) ⇒ U.
- **Plazo: 6 meses desde el hecho causante** (art. 276.1): fuera de plazo
  la solicitud se **deniega** (a diferencia de la contributiva, donde fuera
  de plazo solo se pierden días). Si se pide en los 15 días hábiles
  siguientes, el derecho nace al día siguiente del hecho causante; si no,
  nace el día de la solicitud. ⇒ U (no preguntamos la fecha del cese).
- **Cese posterior involuntario**: si tras el hecho causante se ha
  trabajado, el último cese debe ser involuntario (cuenta propia) o SLE
  (cuenta ajena) (art. 276.1 in fine) ⇒ U.
- **Duración trimestral prorrogable** (art. 277): 3–30 meses según supuesto,
  cotizaciones, edad y responsabilidades familiares (21 meses con 180 días
  cotizados + RF). Las cotizaciones usadas no computan para derechos
  futuros ⇒ informativo.
- **Remisión mayores de 52** (art. 274.3): quien cumpla el art. 280 percibe
  `subsidio-mayores-52` ⇒ informativo/cruce con el otro RuleSet.

- **Ventana**: `rolling: true` + `businessDays: true` — prestación
  permanente; el plazo de 6 meses y los 15 días hábiles regulan el
  nacimiento/denegación del derecho (art. 276.1), no una convocatoria.
- **Canal**: SEPE — sede electrónica (certificado/Cl@ve), oficina de
  prestaciones con cita previa, oficina de registro público o correo
  administrativo («La solicitud la podrás presentar a través de: La sede
  electrónica del SEPE . En la oficina de prestaciones…»).
- **Importe**: `variable`, `monthly` — 95 % del IPREM los primeros 180
  días, 90 % del día 181 al 360 y 80 % desde el día 361 (art. 278). Sin
  cuantía fija que citar (el IPREM 2026 ya está modelado como parámetro).
- **Doc**: modelo oficial de solicitud (incluye declaración responsable de
  rentas del mes anterior y acuerdo de actividad), identificación
  (DNI/pasaporte; NIE/TIE extranjeros) de solicitante y familiares que
  figuren en la solicitud, documento bancario con número de cuenta,
  declaración de IRPF del último ejercicio, y Libro de Familia solo si
  figuran hijos/as (condición `dependents ≥ 1`).

OK / KO por requisito: ☐

## Fuentes (HTTP 200 verificadas el 2026-10-05, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| boe-lgss-prestacion-familia | 1 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con | 200 | fa5a4efeab3a… (preexistente, reutilizada de subsidio-mayores-52 / prestacion-desempleo-contributiva) |
| sepe-subsidio-cotizaciones-insuficientes | 3 | https://www.sepe.es/HomeSepe/prestaciones-desempleo/subsidio-desempleo/subsidio-cotizaciones-insuficientes-he-trabajado-menos-de-un-anyo.html | 200 | 4d8289a59478… |
| sepe-subsidio-agotamiento | 3 | https://www.sepe.es/HomeSepe/prestaciones-desempleo/subsidio-desempleo/subsidio-agotamiento-prestacion-contributiva.html | 200 | 35debe168c96… |

Bytes de los snapshots nuevos en
`F:\AgentState\datawardsmadrid\snapshots\4d8289a5….html` y
`…\35debe16….html`; metadatos en
`data/eligibility/sources/sepe-subsidio-*.json` + `.txt` normalizados
(textSha256 `d8df9a0a41d0…` y `f9e08b0b8b84…`). También verificada HTTP 200
la landing `…/subsidio-desempleo.html` (no se registra como fuente: todo su
contenido útil está en las dos páginas de detalle). Las URL candidatas
«quiero-solicitar-un-subsidio», «he-agotado-la-prestacion-por-desempleo» y
«he-trabajado-menos-de-un-ano» devuelven 404 (el árbol real usa otros
slugs, listados desde la landing).

## Decisiones

1. **`standalone: true`**: sin ficha `subsidio-desempleo` en
   `data/catalog/benefits/`; rango 1 propio (LGSS consolidado). El encargo
   fija el slug genérico; no se renombra la ficha donante
   `subsidio-cotizaciones-insuficientes` (los donantes son de solo lectura
   y el nivel 2 sigue siendo suyo).
2. **`desempleo` hard:false**: mismo patrón que
   `prestacion-desempleo-contributiva` y `subsidio-mayores-52` — quien
   trabaja a tiempo parcial con jornada sumada inferior a la completa
   también accede (art. 274.1.b in fine) ⇒ F solo avisa.
3. **`carencia-rentas` hard:false con proxy paramétrico**: el encargo
   permitía «uncovered o proxy IPREM». Se elige proxy comprobable:
   `incomeAnnual lte SMI_MENSUAL × 9` (75 % × 12 meses = 9×SMI mensual;
   10.989 €/año en 2026). Bandas: 0–8.400 ⇒ T; 8.400–16.800 ⇒ U
   (el umbral cae dentro); ≥16.800 ⇒ F suave (aviso, no exclusión: la vía
   de responsabilidades familiares del art. 275.2 puede salvarlo). Se
   usa `param` para que el umbral siga al SMI vigente (G9), con la cita
   normativa de rango 1 en el propio parámetro (RD 126/2026).
4. **`sin-derecho-contributiva` → uncovered**: el encargo lo listaba como
   comprobable, pero ninguna pregunta del catálogo determina el derecho a
   la contributiva (dato de vida laboral). UNKNOWN ≠ NO ⇒ U documentado.
5. **`window.rolling: true` + `businessDays: true`**: permanente; el plazo
   de 6 meses del art. 276.1 es de solicitud/denegación, no convocatoria.
6. **`amount: variable / monthly`**: 95/90/80 % IPREM por tramos de días
   (art. 278); sin cuantía fija declarable.
7. **`excerptSha256` reales**: sha256 UTF-8 del extracto normalizado
   (equivalente a G4/`ruleset-fill-hashes`); cada extracto verificado
   presente en el `.txt` de su fuente (20/20). Ningún «FILL».
8. **Snapshot sin npm**: bytes con curl (HTTP 200), sha256 con Node +
   `sha256`, HTML→texto con réplica de `htmlToText`+`normalizeText`
   (`F:\Temp\datawardsmadrid-paro\norm.mjs`, reutilizada de la ola 4;
   builder y simulación de puertas en `F:\Temp\datawardsmadrid-subsidio\`).
9. **Dos páginas SEPE**: `cotizaciones-insuficientes` (supuesto 274.1.b;
   ventana y documentación) y `agotamiento` (supuesto 274.1.a; canal).
   Ambas rango 3 ⇒ solo citan window/channel/documents (G11); los
   requisitos e importe citan siempre la LGSS (rango 1).
10. **Documentos**: Libro de Familia condicionado a `dependents ≥ 1`
    (la página lo exige para los hijos que figuren en la solicitud); IRPF
    `mandatory: true` según la lista de la sede.

## Notas para el verificador independiente

- Comprobar en `boe-lgss-prestacion-familia.txt` los arts. 274.1-4, 275.1-3,
  276.1, 277 y 278; y en los `.txt` SEPE los apartados «Requisitos»,
  «Documentación necesaria» y «Cuándo, dónde y cómo lo tramito».
- La comprobación de «extracto literal» usa el `.txt` commiteado de cada
  fuente; los `.txt` del SEPE incluyen espacios antes de signos de cierre
  (« , » / « . ») preservados en los extractos, y «encontrase» es [sic]
  del propio texto consolidado del BOE (art. 274.2).
- El multiplicador `9` de `SMI_MENSUAL` es 0,75 × 12 meses: convierte el
  umbral mensual de carencia en proxy anual comparable con `incomeAnnual`.
- Pendiente de revisión humana: `humanReview.status = pending`.
- Golden `gp-subsidio-getafe`: espera `posible` + `ROLLING`
  (employmentStatus=desempleado ⇒ soft T; incomeAnnual 0–8.400 ⇒ T;
  los decisivos —hecho causante, sin derecho a contributiva, inscripción,
  plazo— son U no excluyentes).
- Al ser ambas condiciones soft, cualquier perfil da `posible` como mínimo
  salvo ingresos altos: es deliberado (UNKNOWN ≠ NO; no podemos excluir a
  un trabajador a tiempo parcial ni a quien acredita responsabilidades
  familiares).
