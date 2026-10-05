# F0-U — Inventario del universo de ayudas de Madrid

Fecha: 2026-10-05 · Agente

## Recuentos reales

| Métrica | Valor |
|---|---|
| Fuentes consultadas | 5 (sede CM ×3 estados, BDNS API región 25/beneficiario 1, catálogo la-ayuda, pipeline BOCM, semilla) |
| BDNS región 25 + beneficiario persona física 2026 | 2.050 registros |
| Sede CM «En plazo» / «En tramitación» / «Pendiente apertura» | 80 / 300 / 3 |
| Candidatos BOCM del pipeline | 536 |
| Fichas la-ayuda importadas | 244 |
| **Programas tras dedupe y clasificación** | **662** |
| Descartados con motivo | 1470 |

## Por estado de acceso

- CLOSED: 335
- UNKNOWN: 260
- OPEN: 39
- ROLLING: 28

## Por ámbito

- comunidad-madrid: 473
- estatal: 174
- municipal: 15

## Por fuente

- pipeline-bocm: 237
- la-ayuda: 198
- sede-cm: 188
- bdns: 22
- seed: 17

## Temas cubiertos

- educacion: 114
- empleo: 96
- cultura_juventud: 42
- salud: 31
- transporte: 30
- vivienda: 26
- familia_infancia: 25
- dependencia_discapacidad: 14
- social_emergencia: 12
- mujeres_violencia: 10
- energia: 9
- mayores: 8

## Semilla de permanentes añadida (17)

- IMV, contributiva y asistencial de desempleo, complemento por hijo, RMI Madrid,
  permiso nacimiento, enfermedad grave menor, SAAD, pensiones NC, título FN,
  bono térmico, becas Ministerio, abono joven, tarjeta azul, bono alquiler joven,
  cheque infantil, becas comedor, violencia de género.
  Cada una enlaza a su norma BOE consolidada o sede oficial estable.

## Límites conocidos
- La clasificación es determinista (regex sobre título); puede quedar ruido en `UNKNOWN`.
- BDNS no da plazo en la lista → estado UNKNOWN hasta verificación.
- Las fichas de la-ayuda sin URL oficial quedan sin enlace.
- Las oleadas F3 deciden cuáles pasan a nivel 1 (30–40 objetivo).