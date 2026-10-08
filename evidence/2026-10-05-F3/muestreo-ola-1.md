# Hoja de muestreo — Ola 1 (ADR-040)

Fecha: 2026-10-05 · Programas: 5 · Verificador independiente: dictamen completo
en `verificacion-ola-1.md` (revisó cada cita literal contra los snapshots,
umbrales, ventanas y golden con el motor real).

**Regla ADR-040**: revisa 2 de cada ola; si alguna sale KO, revisión completa.

**Cómo marcarla (Daniel):** en cada fila de «Tu turno» sustituye `☐ OK ☐ KO` por `☑ OK ☐ KO` o `☐ OK ☑ KO`.
Esta hoja aprueba **2 regla(s)**: madrid-beca-comedor-escolar, madrid-becas-bachillerato-centros-privados.
En otra hoja se aprueban: imv → evidence/2026-10-08-F10/muestreo-ola-12.md; madrid-bono-alquiler-joven → evidence/2026-10-08-F10/muestreo-ola-12.md; madrid-cheque-escuela-infantil → evidence/2026-10-08-F10/muestreo-ola-12.md.
Un solo KO basta para que no se apruebe nada de la ola; con 2 o más OK (de reglas distintas) y ningún KO se aprueba entera.
Cuando acabes, ejecuta `npm run review:apply -- evidence/2026-10-05-F3/muestreo-ola-1.md` — es la única vía que pone humanReview=approved.

Estado previo del verificador

| Ayuda | Verificador | Tu turno |
|---|---|---|
| imv | OK | ☐ OK ☐ KO |
| madrid-becas-bachillerato-centros-privados | OK normativa (tras corregir identidad: era «beca-6000», nombre andaluz — renombrado al programa real y vinculado a la ficha del catálogo) | ☐ OK ☐ KO |
| madrid-cheque-escuela-infantil | OK (erratas menores) | ☐ OK ☐ KO |
| madrid-beca-comedor-escolar | OK tras fix del motor (`previousCalls` se ordenaba mal → mostraba CLOSED en vez de CLOSED_RECURRING) | ☐ OK ☐ KO |
| madrid-bono-alquiler-joven | OK (erratas menores) | ☐ OK ☐ KO |
| madrid-teleasistencia-domiciliaria | **DESCARTADA por el autor+verificador**: solo existe fuente de rango 4 (Carta de Servicios); no se puede modelar con citas de rango ≤2 → nivel 2 | — |

## Qué mirar en cada una (15-20 min en total)

Para cada ayuda, la hoja del autor (`ola-1-*.md`) tiene la tabla de requisitos
con el extracto literal y su fuente. Comprueba que:

1. El extracto dice lo que la regla afirma (umbral, edad, plazo).
2. Los «⚠ no comprobable» son razonables (cosas que nadie puede saber sin
   documentos).
3. El plazo/estado es el real.

### Los puntos más delicados por ayuda

- **imv**: requisito de ingresos se modela como aviso (no duro) porque el
  umbral real escala por unidad familiar; la edad mínima admite excepciones.
- **becas-bachillerato**: `estudiante-bachillerato` quedó como aviso (una
  reserva de plaza sin estar estudiando daría «no cumples» falsa); comprueba
  que el importe 2.000–3.750 €/curso está en el extracto citado.
- **cheque-infantil**: sin requisito de empadronamiento (la norma no lo pide —
  verificado, no es un olvido); el límite 35.913 € es per cápita, modelado como
  aviso.
- **beca-comedor**: sin requisito de empadronamiento (el centro debe estar en
  la CM, no la residencia); renta per cápita 8.400 € modelada como aviso.
- **bono-alquiler-joven**: `ingresos-3iprem` duro es seguro en sentido F
  (ingresos propios > umbral ⇒ hogar > umbral); ventana «permanente» citada a
  sede + Acuerdo.

## Erratas menores aceptadas por el verificador (no bloquean)

- Algunas etiquetas resumen más de lo que dice el extracto citado (p. ej. el
  año del IRPF o la lista de municipios del Anexo II) — el dato existe en
  fuente de rango 1 pero el extracto citado no lo nombra literalmente.
- `imv`: el texto de una excepción menciona «huérfanos absolutos» donde la ley
  lo sitúa en unidad de convivencia.
- `beca-comedor`: la vía familia numerosa se modela sin el límite rpc <10.000 €
  (dirección conservadora: nunca excluye a quien sí podría entrar).
- Los golden escriben `blockers` por id; el motor emite labels (se resolverá
  al crear el runner de golden).

## Resultado

Tras marcar OK/KO aquí, se actualiza `humanReview` y `TASK_QUEUE.md`.
Un KO en cualquiera ⇒ revisión completa de las 5.
