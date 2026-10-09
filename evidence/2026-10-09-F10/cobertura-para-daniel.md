# Cobertura: programas de alto alcance fuera del nivel 1 (F10-RES-2 §6)

**Qué es esto:** cruce entre el universo (`data/universe/programs.json`, 421
programas) y el nivel 1 (los 50 RuleSets del bundle). Solo programas
**abiertos o continuos** que una persona residente en Madrid puede pedir y
que hoy solo aparecen como «relacionada, sin comprobar» (nivel 2) o ni
siquiera eso.

**Esto no pide cambios ahora** — añadir un programa al nivel 1 exige hoja de
verificación nueva y lo decides tú (ADR-054). La tabla ordena por alcance
aproximado para la ola siguiente.

| Alcance | Programa (en el universo, abierto/continuo) | Personas del barrido que se beneficiarían |
|---|---|---|
| ★★★ muy alto | **Cheque cursos 3.000 € para personas desempleadas** (`sede-cm-8ed32e75ad`) + transporte/conciliación en formación (`sede-cm-8476e0f5b2`, `sede-cm-826b8e1ed0`) | parado-45, parado-larga-54, migrante-residencia-2a |
| ★★★ muy alto | **Complemento de Apoyo al Empleo (CAE)** del subsidio (`la-ayuda-complemento-apoyo-empleo-subsidio`) | parado-45, parado-larga-54, madre-sola-30-2hijos |
| ★★★ muy alto | **Ayudas económicas mensuales por gestación, nacimiento o adopción (CM)** (`sede-cm-2eeb939425`) | pareja-40-bebe, pareja-26-hijo |
| ★★ alto | **Tarifa Cero para autónomos** (`sede-cm-e07458e62b`) + **cuenta propia para desempleados** (`sede-cm-d90234a691`) | daniel, autonoma-35, autonomo-62-baja |
| ★★ alto | **Reducción de renta — Agencia de Vivienda Social** (`sede-cm-23825b4914`) + **permuta de vivienda pública** (`sede-cm-e2c56789b1`) | madre-sola-30-2hijos, familia-alquiler-3hijos, joven-22-alquila, alquiler-vallecas-30 |
| ★★ alto | **Ayudas a familias con pacientes con patologías de extrema complejidad** (`sede-cm-66ab1d21de`) | cuidadora-60-coslada, mayor-80-dependencia (a cargo) |
| ★★ alto | **Subsidio por cotizaciones insuficientes** (`la-ayuda-subsidio-cotizaciones-insuficientes`) | parado-45, joven-22-alquila, pareja-26-hijo |
| ★ medio | **Achatarra-vehículo / vehículo eléctrico 2024** (`sede-cm-94e3096d74`) y **movilidad ZBE** (`bdns-894617/894618`) | casi todas con vehículo |
| ★ medio | **Ayudas previas a la jubilación ordinaria** (`sede-cm-17c1873c91`) — personal público | docente-50, empleada-publica-44 |
| ★ medio | **Ayudas >52 años en formación** (`sede-cm-051f77b60c`, `sede-cm-b91c8ff693`) | parado-larga-54 |
| ★ medio | **Jóvenes desempleados en certificados profesionales** (`sede-cm-60822e256e`) | joven-22-alquila |
| ★ nicho | **Subsidio de emigrante retornado** (`la-ayuda-subsidio-emigrantes-retornados`), **salida de centros de la Red VG** (`sede-cm-4d513f437e`), **familias acogedoras** (`la-ayuda-madrid-ayuda-familias-acogedoras`) | situaciones concretas no cubiertas por el cuestionario |

## Lectura

- El nivel 1 (50 reglas) cubre pensiones, IMV/RMI, nacimiento, empleo
  contributivo y los bonos principales — el «tronco» ya está.
- El mayor hueco de alcance real es **empleo-formativo** (cheque de cursos,
  CAE, transporte en formación): le toca a 4 de las 26 personas del barrido y
  no se comprobaría con ninguna pregunta nueva — las 10 actuales bastan para
  una primera hoja.
- Segundo hueco: **nacimiento/gestación mensual de la CM** (distinta del
  pago único ya presente) — dos personas del barrido.
- Autónomos: Tarifa Cero tiene alcance alto y reglas simples — buen
  candidato a una ola pequeña tras el 16/10.
