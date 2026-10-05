# Hoja de revisión — ola 3 · prestacion-nacimiento-cuidado-menor

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## ⚠ Correcciones al encargo que debe validar el revisor

1. **«LGSS arts. 331–345» no es la norma de esta prestación.** En el texto
   consolidado de la LGSS (RDL 8/2015, última actualización publicada
   03/10/2026) los arts. 331–345 regulan el **cese de actividad de los
   trabajadores autónomos** (comprobado sobre el snapshot). La prestación
   por nacimiento y cuidado de menor está en el **capítulo VI del título II,
   arts. 177–182** (Régimen General; aplicable a RETA por el art. 318.a), más
   el requisito general de afiliación del art. 165.1.
2. **«16 semanas por progenitor» está desfasado.** El **RDL 9/2025, de 29 de
   julio** (en vigor desde el 31/07/2025) amplió el ET art. 48.4 a
   **diecinueve semanas por progenitor** (6 obligatorias a jornada completa
   tras el parto + 11 hasta los 12 meses + 2 de cuidado hasta los 8 años;
   **32 semanas en monoparentalidad**). La propia página de la Seguridad
   Social lo advierte. El RuleSet refleja la duración vigente.
3. **Slug sin ficha en el catálogo.** No existe
   `data/catalog/benefits/prestacion-nacimiento-cuidado-menor.json` en el
   catálogo importado de la-ayuda ⇒ el RuleSet lleva `standalone: true`
   (dos fuentes de rango 1 propias: LGSS y ET consolidados).

## Fuentes snapshotteadas (HTTP 200 el 05/10/2026)

| sourceId | URL | sha256 bytes | textSha256 |
|---|---|---|---|
| boe-lgss-prestacion-familia | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con | fa5a4efe… (ya existía, reutilizada) | 17cab0ec… |
| boe-et-estatuto-trabajadores | https://www.boe.es/eli/es/rdlg/2015/10/23/2/con | 2b88fc80036f… | 1d289ebd69b6… |
| segss-nacimiento-cuidado-menor | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/6b96a085-4dc0-47af-b2cb-97e00716791e/requisitos+19-c021?changeLanguage=es | d147d7ca1203… | 3b679c36b89b… |
| segss-nacimiento-cuidado-menor-info | https://www.seg-social.es/wps/portal/wss/internet/InformacionUtil/44539/43384/75775a96-c87a-4b2d-a34c-f802097357a6?changeLanguage=es | ac33fe085c96… | 2a080d42b638… |

Bytes en `F:\AgentState\datawardsmadrid\snapshots\<sha256>.html`; metadatos y
texto normalizado en `data/eligibility/sources/<id>.json|txt`. Snapshot
reproducido a mano con Node (misma normalización que `eligibility-snapshot.ts`)
porque el encargo prohibía `npm`. **Verificación automática de los 21
extractos**: literal presente en el `.txt` y `excerptSha256` = sha256(extracto)
— 0 fallos.

## prestacion-nacimiento-cuidado-menor (rulesVersion 1, verificado 2026-10-05)

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Tener a tu cargo un hijo o una persona menor (nacimiento, adopción, guarda o acogimiento) | dependents `count_where_gte` ≥1, age<18 | «se consideran situaciones protegidas el nacimiento, la adopción, la guarda con fines de adopción y el acogimiento familiar» | LGSS Art. 177 | https://www.boe.es/eli/es/rdlg/2015/10/30/8/con |
| **OBLIGATORIO**: Ser persona trabajadora por cuenta ajena o propia | `any`: employmentStatus `in` [asalariado] · employmentStatus `eq` autonomo | «Serán beneficiarias las personas trabajadoras por cuenta ajena o propia, cualquiera que sea su sexo» (+ LGSS 178.1 y 318.a en cada rama) | seg-social «Personas beneficiarias» | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/6b96a085-4dc0-47af-b2cb-97e00716791e/requisitos+19-c021 |

**No comprobables con nuestras preguntas (⚠, 10 avisos):**

- **Afiliación y alta (o asimilada)** al inicio de cada período de descanso
  — LGSS arts. 178.4 y 165.1.
- **Período mínimo de cotización por edad** (a la fecha del nacimiento o de
  la resolución/decisión): < 21 → ninguno; 21–25 → 90 días/7 años o 180
  vida laboral; ≥ 26 → 180 días/7 años o 360 vida laboral — LGSS 178.1.
- **Subsidio no contributivo (supuesto especial)**: sin cotización mínima
  pero con el resto de requisitos → 100 % del IPREM durante el descanso
  obligatorio (+ 14 días en FN, monoparentalidad, múltiple o discapacidad
  ≥ 65 %) — LGSS 181–182. Ampliado por RDL 9/2025.
- **Duración y disfrute del permiso**: 19 semanas/progenitor (32
  monoparental) — ET 48.4.
- **Derecho individual e intransferible** de cada progenitor — ET 48.4.
- **Límites en adopción/guarda/acogimiento**: < 6 años o mayores con
  discapacidad/dificultades acreditadas (ET); acogimiento ≥ 1 año (EBEP).
- **Funcionarios → EBEP 49 a)–c) y mutualidad** (MUFACE/ISFAS/MUGEJU), no
  INSS — LGSS 177 in fine.
- **No trabajar durante el descanso** (salvo jornada parcial, pluriempleo y
  pluriactividad) — LGSS 180.
- **Al corriente de cuotas** (responsables directas, sobre todo autónomos)
  — página de requisitos seg-social.
- **Subsidio especial por parto múltiple** (un pago, solo un progenitor).

- **Plazo**: permanente/rolling — el derecho nace el día de inicio del
  descanso (página de requisitos seg-social, «Nacimiento»).
- **Canal**: INSS (ISM en el Régimen del Mar) — sede electrónica
  https://sede.seg-social.gob.es/, presencial en CAISS o correo ordinario.
- **Importe**: `variable`, mensual — 100 % de la base reguladora (base de
  cotización por contingencias comunes del mes anterior al mes previo al
  hecho causante / días) — LGSS 179.1.
- **Doc**: solicitud modelo oficial (obligatoria).
- **Doc**: documento de identidad en vigor (obligatorio).
- **Doc**: libro de familia o certificado de inscripción (obligatorio si el
  dato no consta en el Registro Civil).
- **Doc**: certificado de empresa (condición: employmentStatus = asalariado;
  no si la empresa lo transmitió electrónicamente).
- **Doc**: informe de maternidad del SPS (no obligatorio: solo si la madre
  anticipa el descanso o en los supuestos señalados).

OK / KO por requisito: ☐ ☐

## Decisiones de modelado y dudas para el revisor

1. **`menor-a-cargo` con `age < 18`.** El permiso por nacimiento solo puede
   disfrutarse hasta los 12 meses (tramo b) o los 8 años (tramo c), pero la
   adopción/guarda/acogimiento de un menor mayor de 6 años con discapacidad
   o dificultades acreditadas también da derecho: `< 18` evita un
   `no_cumple` falso en ese supuesto; el timing lo acota el aviso
   `duracion-y-disfrute-permiso`. Dirección fail-safe (UNKNOWN ≠ NO): el
   veredicto queda capado en «posible» por los uncovered.
2. **`employmentStatus in [asalariado, autonomo]` excluye funcionarios,
   docentes, investigadores y militares.** Fiel al encargo; el permiso del
   personal funcionario se canaliza por EBEP 49 y su mutualidad — cubierto
   por el aviso `funcionarios-mutualidad`. Mismo patrón que el ruleset de
   cáncer (ola 2).
3. **Nada de cuantía fija**: `amount.type = variable`, `period = monthly`
   (100 % de la base reguladora; el supuesto no contributivo = 100 % IPREM
   queda en aviso).
4. **`channel.url` = `https://sede.seg-social.gob.es/`** (la página de
   trámites lo enlaza como canal preferente; también CAISS y correo).
5. **`standalone: true`** por la ausencia de ficha en el catálogo
   importado (dos fuentes rango 1: LGSS y ET).
6. **Dos fuentes seg-social de rango 3**: la de «requisitos» (contenido
   normativo de la prestación) y la de «Información útil» (trámites,
   documentos, canal). Ninguna alimenta requisitos decisivos sola: cada
   requisito/aviso tiene al menos una cita de rango 1 salvo
   `limites-adopcion-acogimiento`, `corriente-de-cuotas` y
   `subsidio-parto-multiple` (la página oficial desglosa el desarrollo
   reglamentario del ET/LGSS para el ciudadano).
7. **`themes: [familia_infancia]`, `lifeEvents: [tener_hijo]`**.
8. **`effortInputs`**: `requiresCertificate: true` (sede electrónica con
   certificado/Cl@ve), `formPages: 2` — estimación propia, no dato oficial.

## Golden `gp-permiso-madre-parla`

Madre de 30 años, Parla (28106), recién nacido a cargo, asalariada:
requisitos comprobables T, veredicto esperado **«posible»** (la
afiliación/alta y la cotización mínima — 180 días/7 años o 360 vida laboral
por tener ≥ 26 — son incognoscibles con ≤ 10 preguntas), deadline
**ROLLING**, sin blockers.
