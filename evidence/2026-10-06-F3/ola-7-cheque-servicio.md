# Ola 7 — Cheque Servicio / ayuda económica para ayuda a domicilio (Ayuntamiento de Madrid)

**Veredicto: NO ENTRA en el nivel 1 (ADR-045).** El programa tal como se
encargó —la ayuda económica municipal «Cheque Servicio» para pagar un servicio
de ayuda a domicilio a una empresa— **no admite solicitudes nuevas**: no existe
trámite propio ni norma vigente que lo mantenga como programa independiente.
Lo que sigue vivo con ese nombre es la **prestación económica vinculada al
servicio (PEVS) del SAAD, de la Comunidad de Madrid** — otra administración.

No se crea RuleSet ni golden. Se documentan las comprobaciones y las
alternativas vivas para la decisión del coordinador.

## 1. Qué se comprobó (ADR-045: ¿admite solicitudes nuevas?)

### 1a. El marco vigente del SAD municipal ya no contiene ningún cheque

La Ordenanza 10/2022, de 28 de junio (Acuerdo del Pleno; BOAM n.º 9180 y
BOCM n.º 166, ambos del 14/07/2022) es hoy la norma del Servicio de Ayuda a
Domicilio del Ayuntamiento. En todo su texto consolidado hay **0 apariciones
de «cheque» y 0 de «prestación económica»**: el SAD es un servicio con
aportación del usuario, no una ayuda económica.

Su disposición derogatoria única dice literalmente:

> «Queda derogada la Ordenanza Reguladora del Acceso a los Servicios de Ayuda
> a Domicilio para Mayores y/o Personas con Discapacidad, aprobada por Acuerdo
> plenario de 29 de julio de 2009.»

— y la ordenanza de 2009 (marco bajo el que operaba el cheque servicio
municipal) figura en el ANM como «Disposición no vigente». La disposición
transitoria única solo conserva las intensidades ya reconocidas a las personas
beneficiarias existentes (régimen transitorio de derechos consolidados, el
mismo patrón que RAI/ADR-045).

### 1b. La Ordenanza de prestaciones económicas ya no tiene el cheque-servicio como modalidad

La Ordenanza de las prestaciones económicas del SPSS del Ayuntamiento, de
28/09/2004 (ANM, última actualización publicada el **19/04/2021**), dice en su
art. 1 vigente:

> «El objeto de la presente ordenanza es la regulación de las prestaciones
> económicas del sistema público de servicios sociales del Ayuntamiento de
> Madrid en las modalidades de ayudas económicas de emergencia social y
> ayudas económicas temporales de especial necesidad.»

El «cheque-servicio» solo aparece **una vez**, en el preámbulo, citando la
Ley 11/2003 («cheque-servicio, modalidad de prestación económica otorgada a
personas o familias para que con ella atiendan el pago de centros o
servicios…») — y la Ley 11/2003 está **derogada con efectos desde el
11/01/2023** por la disposición derogatoria única.2.b) de la Ley 12/2022
(BOE, texto consolidado de la propia ley).

Además la lista cerrada de destinos del art. 9 (alojamiento, alimentos,
alojamiento temporal de mayores, adaptaciones geriátricas, comedor de
mayores, escuela infantil, comedor escolar, actividades preventivas para
menores, gastos excepcionales) **no incluye** la ayuda a domicilio ni el pago
de servicios periódicos: con la norma vigente no cabe conceder una ayuda para
contratar ayuda a domicilio.

### 1c. No existe trámite en la sede electrónica

- En `sede.madrid.es` no hay ningún trámite «cheque servicio». El trámite
  «Ayudas económicas del sistema público de servicios sociales» (abierto,
  permanente) lista en «Datos Específicos» solo dos modalidades:

  > «Las ayudas pueden ser: Ayudas económicas de emergencia social.
  > Ayudas económicas temporales de especial necesidad.»

- El trámite «Servicio de ayuda a domicilio para personas mayores y personas
  con discapacidad» ofrece el **servicio** (con aportación económica del
  usuario según baremo), fundamentado en la Ordenanza 10/2022, arts. 5 y 6 —
  sin mención a cheque ni a ayuda económica.

## 2. Lo que sí existe con el nombre «cheque servicio» (corrección del encargo)

El nombre «cheque servicio» designa hoy en Madrid la **prestación económica
vinculada al servicio (PEVS) del SAAD, gestionada por la Comunidad de
Madrid** (no por el Ayuntamiento):

- Ley 39/2006, art. 17; Decreto 54/2015, arts. 48–56 (el propio texto equipara
  «prestación económica vinculada al servicio» y «cheque servicio»);
  Orden 627/2010 (subsistente en lo no sustituido por el Decreto 54/2015).
- Requisitos (Decreto 54/2015): dependencia reconocida, PIA que establece un
  servicio del catálogo SAAD como modalidad más adecuada **y no sea posible
  el acceso a un servicio público** adecuado financiado por administración
  pública, centro o entidad privada autorizada por la CM, y contrato con el
  prestador. Cuantía variable según coste del servicio, grado y capacidad
  económica.
- Ventana permanente (se decide en el procedimiento de reconocimiento /
  revisión del PIA, trámite S13 — el mismo que ya modelan
  `prestaciones-dependencia-saad` y `prestacion-cuidador-no-profesional`).

**Sugerencia de relevo:** si se quiere cubrir «el cheque servicio» que la
ciudadanía conoce, el candidato es la **PEVS de la CM**, con slug propio
(p. ej. `pevs-cheque-servicio-saad`), no `ayto-cheque-servicio` — el nivel
administrativo de la tarjeta debe coincidir con el órgano gestor real (el
mismo criterio del chequeo R5-VERIF tras el caso Tarjeta Azul). Las fuentes
ya están en el repo (`boe-ley-39-2006-dependencia`,
`bocm-20150526-1-dependencia`, `sede-reconocimiento-dependencia`); faltaría
como mucho un snapshot de la Orden 627/2010 (BOCM 30/04/2010) y de la norma
de cuantías vigente (RD 1051/2013 / actualización 2024).

Mapa rápido por si se despacha: `hard` = territory within CCAA 13; `soft` =
dependency eq "reconocida" (la pregunta va sobre ti), residenceMonths ≥ 24
(Ley 39/2006 art. 5.1.c); `uncovered` = grado (BVD), PIA y modalidad,
imposibilidad de servicio público, contrato con entidad autorizada, capacidad
económica, incompatibilidades, plazo suspensivo.

## 3. Alternativas municipales vivas (para el universo / nivel 2)

- **SAD municipal** (Ordenanza 10/2022): servicio de ayuda a domicilio para
  mayores de 65 o con discapacidad, empadronados en Madrid — servicio, no
  ayuda económica; trámite abierto en sede.
- **Ayudas económicas del SPSS** (emergencia social y temporales de especial
  necesidad): cubierto por la rama hermana `ola-7/emergencia-social`.
- El programa «cheque servicio» municipal **no figura en
  `data/universe/programs.json`**, por lo que no hay ficha que marcar
  `CLOSED`; si apareciera en el futuro, debería nacer con
  `accessState: CLOSED` + nota «no admite solicitudes nuevas» (patrón
  ADR-045/universo).

## 4. Fuentes (HTTP 200, snapshot local el 2026-10-06)

| sourceId | Rango | URL | sha256 (bytes) |
|---|---|---|---|
| bocm-20220714-42-ordenanza-sad | 1 | https://www.bocm.es/boletin/CM_Orden_BOCM/2022/07/14/BOCM-20220714-42.PDF | 2e70a4212b92… (text 8bdbd4edddb8…) |
| ayto-ordenanza-prestac-econ | 4 | https://www.madrid.es/UnidadesDescentralizadas/ServSocialesYAtencionDependencia/ServiciosSociales/Especial%20Informativos/Tarjeta_Familias/Capitulos/ficheros/Ordenanza_prestac_econ.pdf | 7b144469db90… (text 271c2ec746e6…) |
| sede-ayto-ayudas-economicas | 4 | https://sede.madrid.es/portal/site/tramites/menuitem.62876cb64654a55e2dbd7003a8a409a0/?vgnextchannel=2cb9a38813180210VgnVCM100000c90da8c0RCRD&vgnextfmt=default&vgnextoid=aa50ef82e1bed010VgnVCM1000000b205a0aRCRD | 1e9329744703… (text 9d55a09f945d…) |
| sede-ayto-sad-mayores | 4 | https://sede.madrid.es/portal/site/tramites/menuitem.62876cb64654a55e2dbd7003a8a409a0/?vgnextchannel=61eba38813180210VgnVCM100000c90da8c0RCRD&vgnextoid=fae76a38d1bed010VgnVCM2000000c205a0aRCRD | 4f9c0044bf82… (text 55b0c80ce8e8…) |

Fuentes ya existentes reutilizadas para el contraste: `boe-ley-12-2022-ss`
(derogación de la Ley 11/2003, efectos 11/01/2023), `boe-ley-39-2006-dependencia`
(art. 17, PEVS), `bocm-20150526-1-dependencia` (Decreto 54/2015, arts. 48–56).

Nota operativa: `www.madrid.es` y `sede.madrid.es` rechazan curl (403,
WAF) pero responden al `fetch` de Node — el script de snapshot funciona sin
cambios. El dominio `.madrid.es` del registro cubre ambos subdominios con
techo de rango 4; la norma municipal de rango 1 se obtiene del BOCM (las
ordenanzas se publican también allí).

## 5. Comandos ejecutados

- `npm run eligibility:snapshot` ×4 (vía `node node_modules/tsx/dist/cli.mjs
  scripts/eligibility-snapshot.ts`) — ver tabla.
- `npx tsx scripts/eligibility-validate.ts` → **35 rulesets, 0 errores,
  35 avisos** (todos `ELIG_G10_HUMAN_REVIEW pending`, preexistentes). Sin
  errores nuevos.
