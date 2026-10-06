# Hoja de revisión — ola 5: Pensión de viudedad contributiva (INSS, estatal)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## pension-viudedad (rulesVersion 1, verificado 2026-10-05)

`standalone: true` — no hay ficha `pension-viudedad` en
`data/catalog/benefits/` ni entrada en `data/universe/programs.json`; G2 se
satisface con dos fuentes de rango 1 propias (LGSS texto consolidado BOE y
RD 241/2026 de pensiones).

> **Nota para el verificador — alcance del encargo.** El encargo citaba
> «LGSS arts. 219-233». Sobre el texto consolidado real (snapshot
> `boe-lgss-prestacion-familia`, misma fuente que `subsidio-mayores-52` y
> `prestacion-desempleo-contributiva`), la viudedad está en los **arts.
> 219–223** (cónyuge superviviente, separación/divorcio/nulidad, parejas de
> hecho, prestación temporal, compatibilidad/extinción); los arts. 224–233
> completan el bloque de muerte y supervivencia (orfandad, familiares, base
> reguladora 228, límite 229, imprescriptibilidad 230). Se citan 219–223 y
> 230; el encargo queda cubierto.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **aviso**: Tener 65 años o más (cuantía: el 52 % general sube al 60 % sin otra pensión pública, trabajo ni rentas altas) | age gte 65 (soft) | «el porcentaje aplicable a la base reguladora de la pensión de viudedad será del 60%, cuando en la persona beneficiaria concurran los siguientes requisitos: Tener una edad igual o superior a 65 años» | Seg-social «Cuantía / Abono» › Porcentaje | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10964/10966/28489/28492 |
| **aviso**: Convivir con hijos <26 o mayores incapacitados (permite el 70 % con límites de ingresos) | dependents count_where_gte 1 (age<26 o disability=yes) (soft) | «El 70% de la base reguladora … Que el pensionista tenga cargas familiares . Se entiende que existen cargas familiares cuando: Conviva con hijos menores de 26 años o mayores incapacitados» | Seg-social «Cuantía / Abono» › Porcentaje | (misma página) |

**No comprobables con nuestras preguntas (⚠):**

- **Estar viudo/a — criterio decisivo**: no existe `maritalStatus` ni campo de
  hecho causante en `data/eligibility/questions.json` ⇒ «ser-viudo-viuda» en
  uncovered (art. 219.1: «el cónyuge superviviente», carácter vitalicio).
- **Cotización del causante**: en alta/asimilada ⇒ 500 días en los 5 años
  anteriores; no en alta ⇒ 15 años; exento si accidente (laboral o no) o
  enfermedad profesional (art. 219.1) ⇒ U.
- **Duración del vínculo**: muerte por enfermedad común anterior al
  matrimonio ⇒ 1 año de matrimonio o hijos comunes (o convivencia previa que
  sume >2 años); si no, **prestación temporal de 2 años** (arts. 219.2, 222;
  seg-social «Beneficiarios / requisitos») ⇒ U.
- **Separación/divorcio/nulidad**: acreedor de pensión compensatoria
  extinguida por la muerte, sin nuevas nupcias ni pareja de hecho; vía propia
  para víctimas de violencia de género (art. 220.1) ⇒ U.
- **Pareja de hecho**: inscripción registral o documento público ≥2 años +
  convivencia estable ≥5 años (salvo hijos comunes) — fallecimientos
  posteriores a 31-12-2021 (art. 221.2 + página seg-social) ⇒ U.
- **Extinción por nuevo vínculo**: matrimonio o pareja de hecho del
  beneficiario extingue la pensión (art. 223.2; con excepciones
  reglamentarias, p. ej. >61 años) ⇒ U.
- **Complemento a mínimos**: cuantías mínimas 2026 por tramo de edad
  (9.931,60 / 12.262,60 / 13.106,80 / 17.592,40 €/año) sujetas a límite de
  ingresos (RD 241/2026, Anexo I) ⇒ U.

- **Ventana**: `rolling: true` — derecho imprescriptible (art. 230 LGSS); la
  solicitud solo limita la retroactividad a 3 meses (seg-social «Hecho
  causante / Efectos económicos»).
- **Canal**: INSS (ISM en el Régimen Especial del Mar), gestión y pago
  (seg-social «Gestión / Pago»); solicitud por la sede electrónica
  `sede.seg-social.gob.es` o presencial (cita previa / formulario).
- **Importe**: `variable`, `monthly` — porcentaje sobre la base reguladora:
  52 % general, 60 % con 65 años + sin otra pensión + sin rentas >9.193
  €/año, 70 % con cargas familiares + límites de ingresos (seg-social
  «Cuantía / Abono»). No hay cuantía fija; las mínimas 2026 van como aviso
  en «complemento-minimos».
- **Doc**: solicitud modelo oficial; identidad en vigor (DNI / pasaporte+NIE);
  acta de defunción (mandatorias). Condicionadas: matrimonio (libro de
  familia/acta del Registro Civil) y pareja de hecho (certificado registral
  o escritura + actas + empadronamiento de 5 años) — ambas `mandatory: false`
  porque el perfil no distingue el vínculo.

OK / KO por requisito: ☐

## Fuentes (HTTP 200 verificadas, snapshot local)

| sourceId | Rango | URL | HTTP | sha256 (bytes) |
|---|---|---|---|---|
| boe-lgss-prestacion-familia | 1 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con | 200 | fa5a4efeab3a… (preexistente, reutilizada) |
| boe-rd-241-2026-pensiones | 1 | https://www.boe.es/eli/es/rd/2026/03/25/241 | 200 | 31c4607ec9c6… (preexistente, reutilizada) |
| segss-viudedad-beneficiarios | 3 | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10964/10966/28489/28490?changeLanguage=es | 200 | b7414eb11bca… |
| segss-viudedad-cuantia | 3 | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10964/10966/28489/28492?changeLanguage=es | 200 | 29ad9a3cfe3b… |
| segss-viudedad-efectos | 3 | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10964/10966/28489/28493?changeLanguage=es | 200 | 52b19549d091… |
| segss-viudedad-solicitud | 3 | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10964/10966/28489/28498?changeLanguage=es | 200 | fb7d0a2f25c2… |
| segss-viudedad-gestion | 3 | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10964/10966/28489/29611?changeLanguage=es | 200 | 235f14acfae5… |

Bytes en `F:\AgentState\datawardsmadrid\snapshots\<sha256>.html`; metadatos +
`.txt` normalizado en `data/eligibility/sources/segss-viudedad-*`.
`?changeLanguage=es` fuerza el castellano (sin el parámetro el portal sirvió
28492 en euskera y 28493/28498 en inglés): es el URL citado y el que refetcheará
el job de frescura. La página `prestaciones.seg-social.es/servicio/
pension-de-viudedad.html` existe pero su dominio no está en el registry ⇒ no
se usa. `sede.seg-social.gob.es` está registrado (rango 3) como canal.

## Decisiones

1. **`standalone: true`**: sin ficha en catálogo ni entrada en el universo;
   dos fuentes de rango 1 propias (LGSS + RD 241/2026).
2. **`ser-viudo-viuda` → uncovered**: el catálogo no tiene `maritalStatus` ni
   hecho causante (confirmado en `questions.json`); coincide con el encargo.
   UNKNOWN ≠ NO: nadie queda excluido por no poder demostrar la viudedad.
3. **Todo soft en `requirements`**: ningún requisito comprobable condiciona
   el derecho (la edad solo modula la cuantía 52 %→60 %/70 %) ⇒ `hard: false`
   en ambos. Cualquier perfil da «posible» como máximo al quedar
   `uncoveredCount > 0` — deliberado y documentado.
4. **`cargas-familiares-70` con `count_where_gte` + `where any`**: cuenta
   personas a cargo <26 años o con `disability=yes`. Sesgo conocido: un
   dependiente mayor con discapacidad (p. ej. un padre) también da T aunque
   «cargas familiares» se refiere a hijos — es solo un aviso de cuantía
   (soft), no altera el veredicto ni el derecho.
5. **`window.rolling: true`** con cita de la página «Efectos económicos»
   (retroactividad 3 meses); la imprescriptibilidad del art. 230 LGSS se
   recoge en la hoja y en la justificación del golden.
6. **`amount: variable / monthly`**: la pensión es un % de la base reguladora
   (52 % general; 60 %/70 % según edad y cargas). Cuantías mínimas 2026 del
   RD 241/2026 citadas en uncovered «complemento-minimos» (Anexo I: 9.931,60 /
   12.262,60 / 13.106,80 / 17.592,40 €/año), no como cifra fija.
7. **`excerptSha256` reales**: sha256 UTF-8 del extracto (normalización
   idempotente — equivale a `ruleset-fill-hashes.ts` y al gate G4). Cada
   extracto verificado presente en el `.txt` de su fuente. Ningún «FILL».
8. **Snapshot sin npm**: fetch con Node + `sha256`, HTML→texto con réplica
   de `htmlToText`+`normalizeText` (`F:\Temp\datawardsmadrid-viudedad\`).
9. **Documentos condicionales sin `condition`**: el perfil no conoce el tipo
   de vínculo ⇒ «doc-matrimonio» y «doc-pareja-hecho» se declaran
   `mandatory: false` con la condición en el label (mismo patrón que
   `doc-informe-maternidad` en `prestacion-nacimiento-cuidado-menor`).

## Notas para el verificador independiente

- Comprobar en `boe-lgss-prestacion-familia.txt` los arts. 219.1, 219.2,
  220.1, 221.2, 223.2 y 230; en `segss-viudedad-cuantia.txt` el bloque
  «Porcentaje» (52 %/60 %/70 % y cargas familiares); en
  `segss-viudedad-solicitud.txt` el bloque «SI SE SOLICITA PENSIÓN DE
  VIUDEDAD» (a-c); en `segss-viudedad-efectos.txt` la retroactividad de
  3 meses; en `segss-viudedad-beneficiarios.txt` la prestación temporal; en
  `boe-rd-241-2026-pensiones.txt` el cuadro «Viudedad» del Anexo I.
- Las páginas seg-social conservan los espacios antes de signos de cierre
  («requisitos :», «cargas familiares .»): preservados en los extractos.
- Pendiente de revisión humana: `humanReview.status = pending`.
- Golden `gp-viuda-vallecas`: espera `posible` + `ROLLING` (age=68 ⇒ soft
  edad-65 T; hija de 22 ⇒ soft cargas T; viudedad/cotización/duración son U
  no excluyentes).
- Al no haber hard, **ningún perfil da `no_cumple` ni `probable`**: es
  deliberado (no podemos verificar el hecho causante ni la cotización del
  causante; UNKNOWN ≠ NO).
