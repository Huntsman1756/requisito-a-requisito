# Hoja de revisión — ola 6: Renta Activa de Inserción (RAI, SEPE, estatal)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## renta-activa-insercion (rulesVersion 1, verificado 2026-10-05)

**Sí existe ficha** `renta-activa-insercion` en `data/catalog/benefits/`
(importada de la-ayuda, `revisada`), por lo que **no** lleva `standalone`.
La ficha ya daba el estado correcto: «Cerrada a nuevas incorporaciones desde
el 1 de noviembre de 2024».

## Corrección del encargo (importante)

El encargo asumía «convocatorias anuales» y pedía comprobar el estado de la
última. La realidad normativa es otra:

1. **La RAI era un programa permanente, no una convocatoria anual.** El
   preámbulo del RD 1369/2006 dice textualmente que el programa «no se
   configura con una duración anual, sino que se ordena con carácter
   permanente estableciendo una garantía de continuidad» (los programas
   anuales fueron los anteriores de 2000–2006, que este RD sustituyó).
2. **El programa está derogado, no en pausa entre convocatorias.** La
   disposición derogatoria única.4 del **Real Decreto-ley 2/2024, de 21 de
   mayo** (BOE-A-2024-10235) declara: «Queda derogado el Real Decreto
   1369/2006…», con entrada en vigor el **1 de noviembre de 2024**
   (disposición final decimocuarta.2). El texto consolidado del RD lo
   confirma: «Norma derogada, con efectos desde el 1 de noviembre de 2024».
3. Por tanto la ventana se modela `closesAt: "2024-10-31"` +
   `recurrence: "none"` ⇒ **CLOSED definitivo**, no `CLOSED_RECURRING`
   (que está reservado a convocatorias anuales que volverán a abrir; aquí
   no habrá otra convocatoria). No se citan `previousCalls`: no aplica.
4. **Régimen transitorio (DT 3.ª.1 RDL 2/2024):** quien a 01/11/2024 la
   hubiera solicitado, la percibiera o la tuviera suspendida sigue bajo la
   normativa anterior hasta la extinción del derecho; la sede SEPE confirma
   que subsisten las solicitudes de **reincorporación** (15 días hábiles
   tras el hecho causante; art. 9.4-5 del RD).
5. **Colectivos en el texto final del RD (art. 2):** ≥45 años con 12 meses
   de inscripción ininterrumpida; discapacidad ≥33 % o incapacidad
   equivalente; emigrantes retornados (retorno <12 meses + ≥6 meses
   trabajados fuera); víctimas de violencia de género o doméstica
   acreditadas. La sede SEPE añade la violencia **sexual**. El encargo
   mencionaba «víctimas de terrorismo/trata y ex presos»: **no son
   colectivos del art. 2 del RD 1369/2006**; esos colectivos estaban
   cubiertos por subsidios específicos de la LGSS (p. ej. subsidio por
   liberación de prisión) y, desde la reforma, las víctimas de VG/sexual
   tienen un subsidio propio en la nueva disposición del RDL 2/2024.
6. El «acceso a partir de la tercera solicitud» del encargo era una regla
   de admisión histórica ligada a la disponibilidad del programa; con la
   derogación es un dato histórico sin efecto operativo actual.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **aviso**: Estar desempleado/a (dirigido a trabajadores desempleados; incompatible con trabajo a tiempo completo) | employmentStatus eq "desempleado" (soft) | «Podrán ser beneficiarios del programa los trabajadores desempleados menores de 65 años que, a la fecha de solicitud de incorporación, reúnan los siguientes requisitos» | Art. 2.1 RD 1369/2006 | https://www.boe.es/eli/es/rd/2006/11/24/1369/con |
| **aviso**: Menos de 65 años en la fecha de solicitud de incorporación | age lt 65 (soft) | «trabajadores desempleados menores de 65 años que, a la fecha de solicitud de incorporación» | Art. 2.1 RD 1369/2006 | https://www.boe.es/eli/es/rd/2006/11/24/1369/con |
| **aviso**: Colectivo comprobable — ≥45 años (larga duración) o discapacidad ≥33 %; emigrante retornado y víctima de violencia quedan en ⚠ | any(age gte 45 · disability eq "gte33") (soft) | «Ser mayor de 45 años» / «Acreditar una minusvalía en grado igual o superior al 33 por ciento» | Art. 2.1.a) y 2.2.a) RD 1369/2006 | https://www.boe.es/eli/es/rd/2006/11/24/1369/con |
| **aviso**: Carencia de rentas propias — rentas del mes ≤ 75 % SMI sin pagas extra (915,75 €/mes 2026 ⇒ proxy anual ≈ 10.989 €/año); variante per cápita de la unidad familiar en ⚠ | incomeAnnual lte param `SMI_MENSUAL` × 9 (soft) | «Carecer de rentas, de cualquier naturaleza, superiores en cómputo mensual al 75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias» | Art. 2.1.d) RD 1369/2006 | https://www.boe.es/eli/es/rd/2006/11/24/1369/con |

**No comprobables con nuestras preguntas (⚠):**

- **Derechos conservados al 01/11/2024 — requisito decisivo** (DT 3.ª.1
  RDL 2/2024): «Las personas que, a 1 de noviembre de 2024, hubieran
  solicitado, fueran beneficiarios o tuvieran suspendidos … la renta activa
  de inserción, seguirán rigiéndose por la normativa anterior … hasta la
  extinción del derecho actual». Es un dato histórico que no podemos
  preguntar ⇒ U. La sede SEPE lo confirma: «A partir del 1 de noviembre de
  2024 se suprime el acceso a la Renta Activa de Inserción (RAI)» y «Si
  hasta el 31 de octubre de 2024 incluido, has solicitado, eres persona
  beneficiaria o tienes suspendida la RAI … dicha RAI seguirá rigiéndose
  por las mismas condiciones por las que se te reconoció».
- **Inscripción ininterrumpida 12 meses + búsqueda activa** (art. 2.1.b),
  con reglas sobre interrupciones (≥90 días trabajados en los 365
  anteriores; salidas al extranjero ≤15 días por causas tasadas; EEE/Suiza
  <90 días por trabajo o perfeccionamiento) ⇒ U.
- **Emigrante retornado** (art. 2.2.b): retorno <12 meses + ≥6 meses
  trabajados en el extranjero + inscripción como demandante ⇒ U.
- **Víctima de violencia de género o doméstica** (art. 2.2.c; la sede SEPE
  añade «sexual»): acreditación administrativa, sin convivir con el
  agresor, inscrita como demandante ⇒ U.
- **Extinción previa de la protección por desempleo** (art. 2.1.c):
  haber extinguido contributiva y/o subsidio salvo sanción y no tener
  derecho a esa protección; no se exige en las vías de discapacidad ni de
  víctima ⇒ U.
- **Carencia de rentas por unidad familiar** (art. 2.1.d, segundo párrafo):
  con cónyuge y/o hijos <26 (o mayores incapacitados o acogidos) el límite
  del 75 % SMI se aplica a la renta per cápita de la unidad; no preguntamos
  rentas del resto de miembros ⇒ U. Por eso `carencia-rentas` es soft.
- **Compromiso de actividad** (art. 3.1-3): suscripción en la fecha de
  solicitud + obligaciones del plan personal de inserción ⇒ U.
- **Límites históricos** (art. 2.4): no haber sido beneficiario en los 365
  días anteriores (salvo discapacidad ≥33 % o víctima) y máximo de tres
  derechos ⇒ U.
- **Reincorporación** (art. 9.4-5 + sede SEPE): solicitud en los 15 días
  hábiles/siguientes al cese o al retorno del extranjero; fuera de plazo se
  consumen días; por cese en trabajo a tiempo completo se recupera de
  oficio si sigue inscrito ⇒ U.

- **Ventana**: `rolling: false`, `closesAt: "2024-10-31"`,
  `recurrence: "none"` ⇒ **CLOSED** (derogación definitiva, DD única.4 RDL
  2/2024 en vigor el 01/11/2024 — DF 14.ª.2). No es `CLOSED_RECURRING`: no
  hay convocatoria que se repita.
- **Canal**: SEPE — sede electrónica y oficina de prestaciones con cita
  previa (rango 3, pie de trámites de la propia página de la RAI).
- **Importe**: `variable`, `monthly` — 80 % del IPREM mensual vigente
  (art. 4.2; con IPREM 600 € = 480 €/mes; parámetro IPREM ya modelado);
  duración máxima 11 meses por derecho, hasta 3 derechos (art. 5.1 y
  art. 2.4.b).
- **Doc**: solicitud con compromiso de actividad (art. 11.1), declaración
  de unidad familiar y rentas (art. 11.1) y acreditación del colectivo
  (art. 2.2.a/c). Para derechos conservados la solicitud operativa es la de
  **reincorporación** (plazo de 15 días hábiles según la sede).

OK / KO por requisito: ☐

## Fuentes (HTTP 200 verificadas el 2026-10-05, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| boe-rd-1369-2006-rai | 1 | https://www.boe.es/eli/es/rd/2006/11/24/1369/con | 200 | 96d91301aef9… (textSha256 b4cbe63ed777…) |
| boe-rdl-2-2024-asistencial | 1 | https://www.boe.es/eli/es/rdl/2024/05/21/2/con | 200 | e8418341f263… (textSha256 35ee2dd6e4d2…) |
| sepe-rai-anterior-noviembre-2024 | 3 | https://www.sepe.es/HomeSepe/prestaciones-desempleo/si-tengo-subsidio-rai-antes-noviembre-2024 | 200 | 2ba7e1bb0b68… (textSha256 91e8a0dd2e74…) |

Bytes de los snapshots en `F:\AgentState\datawardsmadrid\snapshots\<sha256>.html`;
metadatos en `data/eligibility/sources/<id>.json` + `.txt` normalizados.
La URL del SEPE también responde con sufijo `.html` (mismo documento); se usa
la forma sin sufijo, que es la que ya figura en la ficha del catálogo.

## Decisiones

1. **Ficha existente ⇒ sin `standalone`**: `renta-activa-insercion` está en
   el catálogo importado (G2 satisfecho por la ficha; además el RuleSet
   tiene dos fuentes de rango 1 propias).
2. **CLOSED, no CLOSED_RECURRING**: la derogación es definitiva (DD única.4
   RDL 2/2024, en vigor 01/11/2024). `closesAt: 2024-10-31` es el último día
   de acceso a nuevas incorporaciones; la ventana cita el precepto
   derogatorio de rango 1 (el localizador recoge la fecha de efectos de la
   DF 14.ª.2). El estado operativo lo confirma la sede SEPE (rango 3).
3. **Todos los requisitos `hard: false`**: el único filtro real hoy es el
   histórico (derechos conservados), no comprobable ⇒ ninguna respuesta del
   perfil puede excluir con seguridad a quien mantiene un derecho
   reconocido o suspendido (UNKNOWN ≠ NO). El `posible` + `CLOSED` es el
   estado veraz: el veredicto queda limitado por los 9 uncovered.
4. **`edad-menor-65` soft**: el requisito se evaluaba a la fecha de
   solicitud de incorporación; quien la solicito con 64 puede seguir
   percibiéndola o tenerla suspendida con 65 ⇒ una F no excluiría.
5. **`carencia-rentas` soft con proxy paramétrico**: mismo patrón que
   `subsidio-desempleo` (`incomeAnnual lte SMI_MENSUAL × 9`: 75 % × 12 =
   10.989 €/año en 2026). Soft porque existe la variante per cápita de la
   unidad familiar (art. 2.1.d in fine) que puede cambiar el resultado.
6. **`colectivo` como `any` parcial soft**: se comprueban las dos patas
   posibles (edad ≥45, discapacidad ≥33 %) y las otras dos quedan en
   uncovered (emigrante retornado, víctima) ⇒ F solo avisa.
7. **`amount: variable / monthly`**: 80 % del IPREM mensual (art. 4.2); sin
   cuantía fija declarable porque sigue al IPREM vigente (ya parametrizado).
8. **Documentos con cita de rango 1**: el art. 11.1 fija solicitud +
   compromiso + documentación acreditativa + declaración de rentas de la
   unidad familiar. La sede SEPE solo se usa para canal y estado operativo
   (sus apartados «Documentación» listan el modelo de la prestación
   contributiva, no específico de la RAI ⇒ no se cita para documentos).
9. **`verification.status: pending`**: pendiente de verificador
   independiente (ADR-044/G12); no entra en el bundle público hasta `ok`.
10. **Snapshot sin npm**: bytes con curl (HTTP 200), sha256 con Node,
    HTML→texto con réplica de `htmlToText`+`normalizeText`
    (`F:\Temp\datawardsmadrid-paro\norm.mjs`); builder y simulación de
    puertas en `F:\Temp\datawardsmadrid-ola6-rai\` (`build-rai.mjs`,
    `check-gates-rai.mjs`). Simulación: G2/G3/G4/G6/G9/G11 verdes, 19/19
    extractos presentes con sha válido, golden reproducido
    (`posible` + `CLOSED`).

## Notas para el verificador independiente

- Comprobar en `boe-rd-1369-2006-rai.txt` los arts. 2.1.a-d, 2.2.a-c, 2.4,
  3.1, 4.2, 5.1, 9.4-5 y 11.1, y el aviso «Norma derogada, con efectos
  desde el 1 de noviembre de 2024» del propio texto consolidado.
- Comprobar en `boe-rdl-2-2024-asistencial.txt` la DT 3.ª.1 (derechos
  conservados), la DD única.4 (derogación del RD 1369/2006) y la DF
  14.ª.2 (entrada en vigor el 01/11/2024 del apartado 4).
- Comprobar en `sepe-rai-anterior-noviembre-2024.txt` la sección «Renta
  activa de inserción (RAI)»: supresión del acceso desde el 01/11/2024,
  conservación para quien la tenía solicitada/percibía/suspendida al
  31/10/2024, reincorporación en 15 días hábiles, duración 11 meses y
  cuantía 80 % IPREM.
- El multiplicador `9` de `SMI_MENSUAL` es 0,75 × 12 meses (umbral mensual
  de carencia → proxy anual comparable con `incomeAnnual`), idéntico al de
  `subsidio-desempleo`.
- Pendiente de revisión humana: `humanReview.status = pending` y
  `verification.status = pending`.
- Golden `gp-rai-mostoles`: espera `posible` + `CLOSED` (4 requisitos soft
  en T; los decisivos —derechos conservados, inscripción 12 m, colectivos
  no comprobables, compromiso— son U no excluyentes).
