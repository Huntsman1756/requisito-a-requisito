# bono-social-termico

## Análisis

La Orden 1478/2022 fija el ámbito (art. 1: «consumidores domésticos con punto de
suministro de energía eléctrica dentro del ámbito territorial de la Comunidad de
Madrid que sean beneficiarios del bono social de electricidad») y el colectivo
(art. 5: «las personas físicas que perciban el bono social de electricidad… **a
31 de diciembre del año anterior**»). La ayuda se concede **de oficio** a partir
del listado que remiten las comercializadoras (Orden 4379/2025: «beneficiarios
del bono social eléctrico a 31 de diciembre de 2024»).

Hallazgos:

1. **`suministro-cm` (hard, `within_territory` ccaa 13) — proxy del punto de
   suministro por el empadronamiento actual.** El label lo declara («proxy:
   empadronamiento en un municipio de la CM»). El borde de falso negativo:
   quien era perceptor del BSE con suministro en la CM a 31/12/2024 y se ha
   empadronado en otra CCAA durante 2025 **sigue estando en la lista de
   concesión del ejercicio 2025** (la elegibilidad se mide a 31/12, no hoy) →
   nuestro check da `F` → `no_cumple` indebido. Daño práctico limitado: la ayuda
   se paga de oficio sin solicitud, así que el F solo desinforma, no priva del
   dinero. Aún así es un F real frente a la norma.
2. **`alguna-via-vulnerable` (soft) — mismo matiz que `bono-social-electrico`:**
   la vía renta compara `incomeAnnual` (ingresos individuales: «¿Cuántos ingresos
   anuales tienes?») contra el umbral de renta **conjunta** de la unidad de
   convivencia con multiplicadores (+0,3 por adulto adicional, +0,5 por menor,
   +1×IPREM en circunstancias especiales — art. 3.2.a/3.3 RD 897/2017). Hogares
   admitidos por multiplicador pueden recibir `F` de fila; al ser soft queda en
   aviso, no en veredicto.
3. `uncoveredRequirements` es honesto y completo: la fecha de referencia real
   (perceptor BSE a 31/12), la titularidad PVPC, las vías pensionista e IMV, la
   cuantía por grado y zona climática, los datos bancarios (10 días hábiles), la
   renuncia y la condición de disponibilidad presupuestaria — todo con extracto
   literal verificado en `bocm-20220629-29-bono-termico.txt` y
   `boe-rd-897-2017-bono-social.txt`.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| suministro-cm (hard) | bajo | «las personas físicas que perciban el bono social de electricidad… a 31 de diciembre del año anterior» (art. 5, Orden 1478/2022) | matizar en el label que la fecha de referencia es 31/12 del año anterior (el ⚠ `perceptor-bse-31-12` ya lo dice); considerar `hard: false` dado que la concesión es de oficio y el padrón actual no es el dato normativo |
| alguna-via-vulnerable (vía renta, soft) | bajo | «la renta conjunta anual de la unidad de convivencia… igual o inferior a 1,5 veces el IPREM de 14 pagas» (art. 3.2.a RD 897/2017) | igual que en bono-social-electrico: aclarar que se mide renta individual como cota inferior |
| resto | ninguno | — | — |
