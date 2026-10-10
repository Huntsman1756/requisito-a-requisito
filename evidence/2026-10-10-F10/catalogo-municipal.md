# Catálogo municipal de nivel 2 — informe (F10-CAT-MUNI)

Fecha: 2026-10-10 · Alcance: solo nivel 2 (catálogo con enlace oficial,
ADR-052; no se han creado reglas nuevas).

## Resumen

| Métrica | Antes | Después |
|---|---|---|
| Entradas municipales en el universo | 22 | 41 |
| Fichas municipales publicadas (nivel-2) | 22¹ | 40 |
| Municipios y mancomunidades con fichas | sin municipio registrado | 16 municipios + 5 mancomunidades |
| Entradas con procedencia verificada (sha256) | 0 | 18 |

¹ Las 22 anteriores no registraban municipio en ningún campo: no había
desglose por municipio posible.

La ficha municipal deduplicada (Leganés, `sede-municipal-75d8689f96`) no
sale en nivel-2 porque **ya tiene regla de nivel 1** (misma URL oficial) —
la deduplicación por URL oficial funciona como debe (Ola-10).

## Fuentes

1. **BDNS/infosubvenciones.es** (`tiposBeneficiario=1` — personas físicas,
   `regiones=25` — CAM, recepción ≥ 01/01/2026): 47 convocatorias LOCAL
   → 23 aptas tras el filtro de exclusión (24 rechazadas: certámenes,
   nominativas a entidades, actos administrativos y ayudas a entidades).
2. **Sedes municipales** (15 municipios más poblados + los de la BDNS):
   18 entradas curadas en `data/universe/municipal-seed.input.json`,
   verificadas una a una por `npm run universe:municipal` (HTTP + sha256
   + fecha en `data/universe/municipal-seed.json`; 18/18 respondieron 200
   el 10/10/2026).

## Antes y después por municipio

| Municipio / mancomunidad | Antes | Después | Origen |
|---|---|---|---|
| Alcalá de Henares | 0 | 4 | BDNS 2 + sede 2 |
| Boadilla del Monte | 0 | 4 | BDNS 4 |
| El Escorial | 0 | 3 | BDNS 3 |
| Pozuelo de Alarcón | 0 | 3 | BDNS 2 + sede 1 |
| Rivas-Vaciamadrid | 0 | 3 | sede 3 |
| Alcorcón | 0 | 2 | sede 2 |
| Alcobendas | 0 | 2 | sede 2 |
| Arroyomolinos | 0 | 2 | BDNS 2 |
| Torrejón de Ardoz | 0 | 2 | sede 2 |
| Ciempozuelos | 0 | 1 | BDNS 1 |
| Getafe | 0 | 1 | sede 1 |
| Las Rozas de Madrid | 0 | 1 | sede 1 |
| Leganés | 0 | 0 (+ficha nivel 1) | sede 1 (deduplicada contra la regla) |
| Majadahonda | 0 | 1 | BDNS 1 |
| Móstoles | 0 | 1 | sede 1 |
| Parla | 0 | 1 | sede 1 |
| San Sebastián de los Reyes | 0 | 1 | sede 1 |
| 5 mancomunidades de servicios sociales | 0 | 9 | BDNS 9 |
| **Municipal total** | **22** | **41 universo / 40 nivel-2** | 23 BDNS + 18 sede |

Las 22 anteriores no llevaban municipio; su «antes» por municipio no se
puede desglosar. Ahora todas las entradas municipales llevan `municipality`
(BDNS: del órgano convocante; sede: curado).

## Filtro de calidad aplicado

- Rechazadas automáticamente (24 de 47 BDNS): premios y certámenes (11),
  subvenciones nominativas a entidades (3), bases reguladoras/actos
  administrativos (7), ayudas a entidades o actividad económica (3).
- Del seed: nada de ayudas a empresas, nada de plazos cerrados de años
  anteriores (una entrada Alcobendas se mantiene como UNKNOWN porque es la
  edición vigente aunque el plazo ordinario pasó; la página oficial sigue
  siendo la referencia), nada de duplicados (dedupe por título+municipio
  y por URL oficial contra el nivel 1).
- **No publicadas** por falta de fuente buena: Fuenlabrada (FuenlaCareNet
  ya es ficha nivel 1), Madrid (emergencia social ya es ficha nivel 1),
  Coslada (su portal de servicios sociales no ofrece una página de ayuda
  concreta verificable — mejor nada que una fuente dudosa).

## Relevancia para las personas del barrido (27)

Personas por municipio en `tests/fixtures/personas.mjs`: Madrid 22,
Móstoles 3, Coslada 1, Getafe 1, Ajalvir (Daniel) — códigos INE reales.

- **4 personas** ven entradas municipales nuevas directamente: las 3 de
  Móstoles (emergencia social H045) y la de Getafe (cheques sociales de
  la Tarjeta Ciudad).
- Coslada (1 persona) queda sin entrada nueva por falta de fuente buena —
  anotado arriba.
- Daniel (Ajalvir, 179 municipios pequeños) no se beneficia todavía:
  cubrir municipios <30 000 exige BOCM/secciones de administración local
  — queda como siguiente paso.

## Procedencia registrada

Cada entrada del seed lleva `httpStatus`, `sha256` del cuerpo descargado
y `fetchedAt` en `data/universe/municipal-seed.json`; `nivel-2.json`
publica `provenance.{sha256,checkedAt}` en esas mismas entradas. Las de
BDNS llevan la URL canónica `bdnstrans/.../convocatoria/<num>` y el
`receivedAt` del registro.

## Limitaciones (honestas)

- La BDNS solo registra convocatorias concurso-competitivas: las
  prestaciones permanentes (emergencia social por ordenanza) solo entran
  si la sede municipal las documenta en una página estable — por eso el
  seed pesa más que la BDNS en municipios grandes.
- `accessState`: 13 ROLLING / 9 UNKNOWN / 17 CLOSED / 1 OPEN. Las UNKNOWN
  son convocatorias de la edición vigente cuyo plazo exacto no consta en
  la ficha — se muestran como «por confirmar», nunca como abiertas.
- Cobertura: 16 de 179 municipios. El siguiente paso son los BOCM de
  administración local y las mancomunidades restantes.
