# pension-viudedad

## Análisis

1. Ambos requisitos evaluados son **hard:false** → ninguno puede producir un F bloqueante.

2. `edad-65-cuantia` (`age ≥ 65`) reproduce el requisito del 60 %: «Haber cumplido una edad igual o superior a los 65 años» (RD 900/2018, art. 2.a) — correcto, inclusivo en el borde (`gte 65` ↔ «igual o superior»). Las demás condiciones del RD (no otra pensión pública, no rendimientos de trabajo/capital relevantes) están declaradas en el propio label; no se evalúan → sin estrictud indebida.

3. `cargas-familiares-70` (`dependents count ≥ 1` con `age < 26` o `disability = yes`) reproduce «Se entenderá por cargas familiares la convivencia del beneficiario con hijos menores de veintiséis años o mayores incapacitados, o menores acogidos» (Decreto 3158/1966, art. 31.2). Borde correcto (`lt 26` ↔ «menores de veintiséis años»). Diferencias menores y todas en sentido permisivo o soft: «incapacitados» ≈ `disability=yes` (un hijo mayor incapacitado para trabajar sin certificado de discapacidad podría no contarse → soft F marginal); «menores acogidos» entran en «otras personas que dependan de ti» de la pregunta de dependientes; las condiciones económicas (pensión = principal fuente, rendimientos de la unidad ≤ 75 % del SMI) están declaradas en el label y no evaluadas.

4. Requisitos determinantes no comprobados, honestos y con extracto presente: cónyuge superviviente/pareja de hecho («el cónyuge superviviente», art. 219.1), cotización del causante («quinientos días, dentro de los cinco años inmediatamente anteriores»), año de matrimonio para enfermedad común previa (arts. 219.2/222), divorciados con pensión compensatoria (art. 220.1), pareja de hecho (2 años inscripción + 5 convivencia salvo hijos comunes, art. 221.2) y extinción por nuevo vínculo (art. 223.2). La tabla de mínimos 2026 del label coincide con el cuadro del Anexo I del RD 241/2026.

5. Fecha de referencia y unidades: nada que se evalue más estricto que la norma.

## Riesgos

| requisito | riesgo (ninguno/bajo/alto/bloqueante) | cita | propuesta |
|---|---|---|---|
| edad-65-cuantia | ninguno | «Haber cumplido una edad igual o superior a los 65 años» (RD 900/2018, art. 2.a) | — |
| cargas-familiares-70 | bajo | «la convivencia del beneficiario con hijos menores de veintiséis años o mayores incapacitados, o menores acogidos» (art. 31.2) | Matiz: "incapacitados" no equivale siempre a discapacidad certificada; soft, sin impacto en veredicto |
| — (resto) | ninguno | — | uncoveredRequirements completo y honesto |
