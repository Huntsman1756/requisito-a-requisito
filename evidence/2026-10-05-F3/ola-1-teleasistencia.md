# Hoja de revisión — ola-1-teleasistencia (F3)

Revisar cada requisito: label comprensible, condición fiel a la norma,
extracto literal presente en la fuente, localizador correcto, enlace oficial.
Marcar KO con motivo; con todo OK ⇒ `humanReview.status = approved`.

## madrid-teleasistencia-domiciliaria (rulesVersion 1, verificado 2026-10-05)

Servicio municipal de teleasistencia del **Ayuntamiento de Madrid** (Área de
Gobierno de Políticas Sociales, Familia e Igualdad — Dirección General de
Mayores y Prevención de la Soledad no deseada). Servicio **permanente**
(ROLLING), de atención social primaria, con dispositivo de emergencia
(colgante/pulsera/reloj) y apoyo domiciliario no sanitario. `standalone: true` —
no existe ficha en `data/catalog/benefits/` ni en `data/universe/programs.json`;
se acredita con fuente de rango 1 propia (G2): la Orden 2372/2023 (Cartera de
Servicios Sociales de la CM), cuya ficha 050204 recoge esta prestación y
remite la aportación de Madrid capital a la ordenanza municipal.

**⚠ Aviso previo para el verificador (G11/rangos):** la Carta de Servicios de
Teleasistencia — documento municipal que fija destinatarias y requisitos — se
publica en `transparencia.madrid.es`, cuyo techo en
`data/eligibility/sources/registry.json` es **rango 4**. G11 exige rango ≤ 2 en
`requirements`, `uncoveredRequirements` y `amount`, así que **varias citas de
este RuleSet serán marcadas** por el gate hasta que se decida cómo tratar las
fuentes municipales del Ayuntamiento de Madrid (ver «Notas para el
verificador»). Donde existe equivalente de rango 1 (vía dependencia, valoración,
aportación) se ha citado la Orden 2372/2023.

| Requisito | Condición | Extracto oficial | Localizador | Enlace |
|---|---|---|---|---|
| **OBLIGATORIO**: Estar empadronada en la ciudad de Madrid | territorio within_territory {"ccaa":"13","province":"28","municipality":"28079"} | «Estar empadronado/a en la ciudad de Madrid.» | Sección 2, «Requisitos de la persona interesada» | https://transparencia.madrid.es/UnidadesDescentralizadas/Calidad/CARTAS%20SERVICIOS/SistemaCartasServicio/19%20CS_Teleasistencia/Definitiva/CS-Teleasistencia-26.pdf |
| aviso: Ser mayor de 65 años, o tener entre 18 y 64 años con dependencia reconocida con el servicio en el PIA (tercera vía no comprobable — ver ⚠) | ALGUNA VÍA: edad gte 65 O dependencia eq "reconocida" | «Personas mayores de 65 años, priorizando a las mayores de 80 años que vivan solas.» / «Persona en situación de dependencia cuyo Programa Individual de Atención reconozca este servicio como modalidad de intervención más adecuada.» | Carta de Servicios, sección 2 «Personas destinatarias»; Orden 2372/2023, anexo II, ficha 050204 «Requisitos para el acceso» | https://transparencia.madrid.es/UnidadesDescentralizadas/Calidad/CARTAS%20SERVICIOS/SistemaCartasServicio/19%20CS_Teleasistencia/Definitiva/CS-Teleasistencia-26.pdf · https://www.bocm.es/boletin/CM_Orden_BOCM/2023/08/01/BOCM-20230801-18.PDF |

**No comprobables con nuestras preguntas (⚠):**

- **Capacidad de uso adecuado del servicio, de la persona interesada o de quien conviva con ella** — «Tener capacidad para realizar un uso adecuado del Servicio de Teleasistencia tanto la persona interesada, como la persona con la que conviva, en su caso.» (Carta de Servicios, sección 2 «Requisitos de la persona interesada»)
- **Tercera vía: personas de 18–64 años en riesgo de aislamiento severo (salvo supuestos atendidos por servicios especializados) o con enfermedad grave e incapacitante, con informe justificativo de los Servicios Sociales** — «Personas de entre 18 y 64 años, en situación de riesgo de aislamiento severo (excepto situaciones que se atienden desde servicios especializados) o con enfermedad grave e incapacitante. El acceso al Servicio de estas personas deberá venir acompañado de informe de los Servicios Sociales que justifique tal necesidad.» (Carta de Servicios, sección 2 «Personas destinatarias»)
- **Se prioriza a las mayores de 80 años que vivan solas** — «Personas mayores de 65 años, priorizando a las mayores de 80 años que vivan solas.» (Carta de Servicios, sección 2)
- **El alta por el teléfono 010 solo es para mayores de 65 que vivan solas según el Padrón; el resto tramita en el Centro de Servicios Sociales, y la vía 010 exige autorizar la consulta de ingresos a la AEAT** — «Las personas mayores de 65 años que según los datos de Padrón viven solas, pueden tramitar la solicitud de Teleasistencia a través del teléfono 010.» (Carta de Servicios, secciones 2 y 7)
- **El acceso pasa por valoración técnica de los Servicios Sociales (perfil: personas no dependientes que requieren apoyo para la vida autónoma, en situación de necesidad o vulnerabilidad social)** — «Personas no dependientes que requieren apoyo para la vida autónoma, en situación de necesidad o vulnerabilidad social.» (Orden 2372/2023, anexo II, ficha 040601, «Perfil de persona beneficiaria»)
- **Si la vía es la dependencia: la resolución y el PIA deben reconocer la teleasistencia como modalidad adecuada** — «Resolución de reconocimiento de la situación de dependencia y de aprobación del Programa Individual de Atención reconociendo el servicio como modalidad de intervención más adecuada.» (Orden 2372/2023, anexo II, ficha 050204, «Procedimiento de prestación»)
- **Cuota: en Madrid capital la aportación depende de la ordenanza municipal — cuota única por domicilio según RMPC de 0, 6, 9 o 12 €/mes, gratuita desde los 87 años** — «Los servicios de teleasistencia son gratuitos, excepto en el caso de los prestados en Madrid Capital por parte del Ayuntamiento de Madrid. En este caso, la aportación de la persona usuaria se ajustará a la tabla de precios establecida por la ordenanza municipal en vigor.» (Orden 2372/2023, anexo II, ficha 050204, «Aportación de la persona usuaria»; cuadro de copago en la Carta de Servicios, sección 2)
- **Incompatible con la atención residencial (la persona usuaria debe vivir en su domicilio)** — «Compatible, excepto con el Servicio de Atención Residencial.» (Orden 2372/2023, anexo II, ficha 050204, «Régimen de compatibilidad con otras prestaciones»)

- **Plazo**: permanente/continuo — «las 24 horas del día, todos los días del año» (Carta de Servicios, sección 2 «Horario»)
- **Canal**: Ayuntamiento de Madrid — Centros Municipales de Servicios Sociales, Registro Electrónico (Tramitar > En línea) y teléfono 010 — https://sede.madrid.es/portal/site/tramites/menuitem.62876cb64654a55e2dbd7003a8a409a0/?vgnextchannel=61eba38813180210VgnVCM100000c90da8c0RCRD&vgnextfmt=default&vgnextoid=91316cf6eed2f310VgnVCM1000000b205a0aRCRD (online + presencial + telefónico)
- **Importe**: variable – € monthly («la aportación de la persona usuaria se ajustará a la tabla de precios establecida por la ordenanza municipal en vigor»; según la Carta de Servicios 2026: 0 € si RMPC ≤ 614,29 €, 6 € hasta 768,30 €, 9 € hasta 999,32 €, 12 € desde 999,33 €, y 0 € a partir de 87 años)
- **Doc**: Solicitud de los servicios o prestaciones sociales para mayores o personas con discapacidad, formulario normalizado (obligatorio)
- **Doc**: Autorización de consulta de datos de ingresos a la AEAT (imprescindible en la vía 010)
- **Doc**: Informe de los Servicios Sociales (solo en la vía de aislamiento severo o enfermedad grave incapacitante)

OK / KO por requisito: ☐ ☐ ☐ ☐ ☐

### Notas para el verificador

- **Fuentes verificadas por HTTP 200 el 05/10/2026 (curl):**
  `https://www.bocm.es/boletin/CM_Orden_BOCM/2023/08/01/BOCM-20230801-18.PDF` (200,
  PDF íntegro de la Orden 2372/2023) y
  `https://transparencia.madrid.es/UnidadesDescentralizadas/Calidad/CARTAS%20SERVICIOS/SistemaCartasServicio/19%20CS_Teleasistencia/Definitiva/CS-Teleasistencia-26.pdf`
  (200, texto íntegro de la Carta de Servicios 2026). También 200:
  `…/FolletoCS-Teleasistencia_26.pdf` (folleto resumen con los mismos requisitos).
  **`sede.madrid.es` y `www.madrid.es` responden 403 a clientes no navegador**
  (Akamai) — la página del trámite existe y es la del canal, pero **no se pudo
  capturar su snapshot desde curl**; los textos municipales citados proceden de
  la Carta de Servicios (transparencia.madrid.es), que sí es accesible.
- **Problema de rango (G11/G2):** el Ayuntamiento de Madrid publica sus normas en
  el BOAM y sus documentos reguladores en `madrid.es`/`transparencia.madrid.es`,
  todos con techo de **rango 4** en `registry.json`. Requisitos, no-comprobables
  e importes citados a la Carta de Servicios **fallarán G11** hasta que se decida
  una de estas salidas: (a) añadir el BOAM/documentos normativos municipales al
  registro con rango adecuado (el BOAM es diario oficial; las ordenanzas del
  Pleno también se publican en BOCM —p. ej. la Ordenanza 10/2022, BOCM-166 de
  14/07/2022—, pero **no se ha localizado ordenanza propia de teleasistencia**
  para la ciudad de Madrid en el BOCM), (b) admitir para servicios municipales
  citas de rango 4 en posiciones normativas, o (c) relegar el programa a nivel 2.
  Modelar requisitos fingiendo una fuente de rango 1 que no dice lo que dice la
  Carta sería peor: se ha preferido fidelidad con el flag explícito.
- **Sin cifras en `amount`**: la tabla 0/6/9/12 € (RMPC) y la gratuidad ≥ 87 años
  solo constan en la Carta (rango 4), así que `amount` queda `variable` citado a
  la Cartera (rango 1) y el cuadro concreto se explica en el ⚠ `cuota-segun-ordenanza`.
- **`poblacion-destinataria` es `hard: false` a propósito** (asimetría de
  errores, ADR-017): existe una tercera vía no modelable (aislamiento
  severo/enfermedad grave, 18–64 años, con informe), así que un `F` computable no
  puede excluir a nadie.
- **Vigencia de la Cartera**: Orden 2372/2023 está vigente con anexos actualizados
  por la Orden 2254/2024 (BOCM 20/08/2024), la Orden 2002/2025 (BOCM 29/07/2025) y
  corrección por Orden 2811/2025 (BOCM 16/09/2025). La ficha de teleasistencia
  citada procede del PDF del BOCM del 01/08/2023; conviene que el verificador
  confirme que el texto de la ficha no cambió en las actualizaciones de anexos.
- **Campo `dependency`**: nuestra pregunta solo se muestra si `disability` ≠ «no»
  (`showIf`), así que para perfiles sin discapacidad la rama de dependencia queda
  sin responder (U), sin efecto para ≥65 años. Si se quiere cubrir mejor la vía
  18–64 con dependencia, revisar el `showIf` del catálogo de preguntas.
- `excerptSha256: "FILL"` en todas las citas, pendiente de
  `ruleset-fill-hashes` sobre los snapshots oficiales; los extractos están
  tomados del texto extraído del PDF con `pdftotext` y respeta la normalización
  (saltos de línea unidos con espacio).
- Golden asociado: `gp-teleasistencia-vallecas` — verdict esperado `posible`,
  `deadlineState` `ROLLING` a 2026-10-05.
