# F9 — Fuente cambiada: `boe-ley-39-2006-dependencia` (2026-10-06)

## Qué pasó

La primera corrida del job de frescura (F9, run 37456014953) detectó 9
extractos ausentes en la fuente `boe-ley-39-2006-dependencia`. El texto
consolidado de la **Ley 39/2006, de 14 de diciembre, de Promoción de la
Autonomía Personal y Atención a las personas en situación de dependencia**
se actualizó el **2026-10-03** («Última actualización publicada el
03/10/2026»).

**Norma modificadora (identificador oficial): Ley 4/2026, de 1 de
octubre — BOE-A-2026-20528** (BOE núm. 246, de 3 de octubre de 2026),
por la que se modifican el Texto Refundido de la Ley General de derechos
de las personas con discapacidad y de su inclusión social (RDL 1/2013)
y la Ley 39/2006. **Entrada en vigor: 23/10/2026** (disposición final de
la propia norma). Comprobado contra el BOE y prensa oficial del 05/10
(Europa Press / Ministerio de Derechos Sociales: «la mayor reforma
social en décadas», en vigor el 23/10).

## Reacción del sistema (verificada)

1. `freshness` la marcó STALE → build la excluyó fail-closed (G4).
2. Las 2 reglas que la citan quedaron fuera del bundle y con
   `verification: ko` (frescura-F9): `prestaciones-dependencia-saad` y
   `prestacion-cuidador-no-profesional`, en `data/eligibility/rules-hold/`.

## Qué cambió en sustancia (Ley 4/2026)

Reformas del capítulo de prestaciones:

- Art. 14 (catálogo): nuevos servicios (cuidados y apoyos en viviendas,
  asistencia personal flexibilizada, teleasistencia como derecho).
- **Art. 18 (prestación cuidados entorno familiar):** se elimina la
  «excepcionalidad» y el requisito de parentesco — ahora «entorno
  familiar **o relacional**», a elección de la persona y por PIA.
- **Sección 4.ª de incompatibilidades: suprimida.**
- **PIA pasa a denominarse Plan Individual de Atención** (mismo acrónimo).
- **Disposición adicional cuarta** (nueva): Seguridad Social de las
  personas cuidadoras no profesionales.
- **Disposición final cuarta bis** (nueva): criterios comunes de
  servicios de apoyo a personas cuidadoras (asesoramiento, respiro,
  apoyo psicológico, formación, accesibilidad) en 6 meses.
- Vigente sin cambio de sustancia: residencia 5 años (art. 5.1.c),
  valoración y baremo (arts. 27-30), plazo de 6 meses para resolver
  (disposición final primera), protección de menores de 6 años
  (disp. adic. decimotercera).

## Decisión de rigor

- **Regla `prestaciones-dependencia-saad`**: sus requisitos siguen
  vigentes (residencia CM + 5 años, dependencia reconocida por el
  baremo); citas re-escritas contra la nueva redacción; locator del
  apoyo al cuidador actualizado a art. 18.
- **Regla `prestacion-cuidador-no-profesional`**: el grueso de sus
  condiciones específicas (parentesco 3.er grado, 1 año de cuidados
  previos, incompatibilidades, plazo suspensivo de 2 años) proviene del
  **Decreto de la CM (BOCM 26/05/2015)**, no de la ley estatal — y el
  decreto **aún no está actualizado**. Las citas del BOE se corrigieron;
  las del decreto se conservan **con la etiqueta marcando la transición
  legal**: la Ley 4/2026 amplía el cuidado al entorno relacional y
  elimina las incompatibilidades a nivel estatal, pero el desarrollo
  autonómico sigue siendo el texto de 2015. Esta tensión es
  **informativa para el usuario** («en revisión»), no un invento del
  sistema.
- Nuevo `uncoveredRequirements` en la regla del cuidador:
  `apoyos-servicios-cuidadores` (disp. final cuarta bis).

## Estado

Re-autoría completada el 2026-10-06 (OLA-9 / R7-OLA9) con verificación
de extractos contra el texto consolidado y recuento de citas. Las dos
reglas vuelven a `data/eligibility/rules/` con `verification: ok` solo
tras la pasada verificadora independiente (verificacion-ola-9.md).

## Seguimiento

- El decreto de la CM de dependencia (2015) se revisa a diario vía F9 —
  cuando se actualice a la Ley 4/2026, las etiquetas «en revisión»
  volverán a abrirse (frescura) para re-autoría.
- `leads sede` da 404 en CI (WAF) — el descubrimiento corre en la
  revalidación local (R7-LOCAL).
