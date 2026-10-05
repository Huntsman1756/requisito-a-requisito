# Contexto de la convocatoria (hechos verificados)

Revisado: 2026-10-05. Fuente normativa prevalente: la Orden publicada en BOCM.
Si un dato de prensa contradice la Orden o la sede, **prevalece la Orden/sede**.

## Fuentes

| Fuente | URL | Rango |
|---|---|---|
| Orden 566/2026 (texto completo) | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/10/01/BOCM-20261001-20.PDF | Normativa (prevalente) |
| Extracto BOCM | https://www.bocm.es/boletin/CM_Orden_BOCM/2026/10/01/BOCM-20261001-21.PDF | Normativa |
| Sede electrónica + formulario | https://sede.comunidad.madrid/premios/premios-global-tech-leaders-awards | Oficial (actualizada 02/10) |
| BDNS 932105 | https://www.pap.hacienda.gob.es/bdnstrans/GE/es/convocatoria/932105 | Oficial (registro) |
| Madrid Tech Week | https://madridtechweek.es/global-tech-leaders-awards/ | Divulgativa |

**F0-1 (2026-10-05, HECHO):** PDFs en `evidence/2026-10-05-F0/fuentes/` con
sha256 en `manifest.json`. Todas las afirmaciones llevan cita art./pág.
(BOCM núm. 234, de 01/10/2026). Lo no citado a la Orden se marca con su fuente.

## Datos clave (verificados contra el PDF)

- **Plazo:** 15 días naturales desde el día siguiente a la publicación
  (art. 11.1, pág. 80; art. 31, pág. 86). Publicación 01/10 → la sede fija
  **02/10/2026–16/10/2026** (calendario del trámite P105). Prensa: 18/10 → descartado.
- **Destinatarios:** «cualesquiera personas físicas o jurídicas, públicas o
  privadas, nacionales o extranjeras» (art. 5.1, pág. 78). Sin requisito de
  domicilio en Madrid. Sin tasas (sede P105: «No requiere pago de tasas»).
- **Requisitos:** capacidad legal; candidatura veraz, completa y actualizada;
  ser titular, responsable directo o representante legítimo del
  proyecto/iniciativa/trayectoria (art. 6, pág. 79).
- **Una sola candidatura por persona**, en nombre propio o en favor de otra
  (art. 11.5, pág. 81). La Orden no dice «una por categoría»: el límite es por
  persona, luego una persona no puede presentarse a dos categorías.
- **Documentación:** a) formulario, b) memoria descriptiva del proyecto,
  iniciativa o trayectoria, c) acreditación de personalidad/representación,
  d) consentimiento expreso si la presenta un tercero, e) lo que determine la
  convocatoria (art. 12.1, pág. 81).
- **Formato de la memoria: la Orden NO fija formato ni extensión.** Solo exige
  «memoria descriptiva» (art. 12.1.b). El formulario normalizado de la sede
  (impreso 4050F1, tras JS) es la especificación operativa; pendiente de
  inspección con navegador (F0-6) o de decisión propia razonable.
- **Presentación:** electrónica por el Registro Electrónico General
  (art. 11.2–3, pág. 80-81); las personas físicas pueden también por los medios
  del art. 16.4 LPACAP, incluida la presencial (art. 11.4 y 12.3.a, págs. 81-82).
- **Premio:** subvención en especie (estatuilla/placa), ≤ 100 € por beneficiario
  (art. 4, pág. 78); crédito total 500 € (art. 28, pág. 85-86).
- **Resolución:** plazo máximo 15 días desde el fin del plazo de presentación;
  silencio desestimatorio (art. 18, pág. 83; confirmado en sede).
- **Entrega:** la Orden no fija fecha/lugar. La sede: «dentro de los días en que
  se celebrará el Madrid Tech Week entre el 28 de octubre y el 5 de noviembre de
  2026». El «03/11/2026, Real Casa de Correos» del análisis previo **no consta en
  la Orden ni en la sede**: solo usarlo si se verifica en otra fuente oficial.
- **Órgano instructor:** Dirección General de Estrategia Digital (art. 14,
  pág. 82). **Consulta:** Subdirección de Sociedad y Economía Digital,
  C/ Embajadores 181, 28045 Madrid — sociedadyeconomia.digital@madrid.org
  (bloque «Contacto» de la sede P105). Ya anotado en `docs/06`.

## Categorías y criterios (art. 8, págs. 79-80 · ponderación art. 16.2, pág. 82)

| Categoría | Destinatarios según art. 8 | Criterios (art. 16.2) |
|---|---|---|
| Global Tech Leader | CEOs, CIOs, CTOs **y otros líderes tecnológicos** | Ejecución 40% · Impacto y resultados 35% · Ecosistema 25% |
| Global AI & Emerging Technologies | empresas, instituciones o equipos | Innovación 40% · Impacto y resultados 35% · Escalabilidad 25% |
| Global Tech Company | empresas | Impacto y resultados 40% · Ejecución 35% · Escalabilidad 25% |
| **Global Tech Impact** | empresas, fundaciones o entidades | **Impacto y resultados 50% · Ecosistema 30% · Escalabilidad 20%** |
| Global Public International Innovation | administraciones / entidades públicas | Impacto y resultados 40% · Viabilidad 35% · Innovación 25% |

## Incoherencia abierta (bloqueante para elegir categoría)

La sede admite personas físicas en general, pero el art. 8 describe Impact como
«empresas, fundaciones o entidades» y AI como «empresas, instituciones o equipos».
Leader sí cubre «otros líderes tecnológicos». **No se asume** que una persona física
pueda concurrir a Impact: se consulta (ver `06-consulta-elegibilidad.md`).
