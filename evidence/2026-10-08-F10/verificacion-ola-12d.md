# Verificación ola 12d — correcciones de falsos negativos (extracto)

Extracto de `verificacion-ola-12.md` para los 5 programas de
esta hoja. Método, gates y resultado global: ver el informe matriz. Los 2 KO
que señalaba el informe global (`prestamos-personal-publico-cm` y
`subsidio-mayores-52`) ya están subsanados: extractos ampliados a la cláusula
completa y catálogo del convenio recortado a lo que prueba el art. 139.

| slug | OK/KO | justificación (cita literal de la fuente citada o del `.txt`) |
|---|---|---|
| fuenlabrada-prestaciones-sociales | **OK** | Soft en empadronamiento con excepción literal en el extracto (art. 4.2: «se exceptúa este requisito para las prestaciones dirigidas a transeúntes, mujeres que han sufrido… violencia de género»). Umbral 6400→**7984**: el baremo del art. 7 (persona sola) corta en «665,33 y más → 0 %»; 665,33 €×12 = 7.983,96 ≈ 7.984 €/año. Correcto y citado (art. 4.3 remite al baremo del art. 7, presente en la fuente). |
| mostoles-prestaciones-sociales | **OK** | Soft ×2 (emancipado + excepciones de VG/calle/Ley 1/1996 — art. 4.1.a/b). Cambio 12p→14p **correcto según R5-VERIF**: la ordenanza dice expresamente «la actualización… se realizará anualmente, según el IPREM anual, calculado **a 14 pagas**» → `IPREM_ANUAL_14P` = 8.400 €. Es el caso en que la norma sí especifica 14 pagas. |
| sermas-ortoprotesica-desplazamiento | **OK** | Defecto real confirmado: `territory eq "cm"` comparaba el objeto territorio con la cadena «cm» → F para el 100 % de perfiles. `within_territory {ccaa:"13"}` es el operador correcto del motor y 13 = Comunidad de Madrid. El requisito ya era soft (`derecho-asistencia-sermas`). |
| sermas-reintegro-gastos-sanitarios | **OK** | Mismo defecto y misma corrección verificados (`titular-tarjeta-sermas`, ya soft). |
| subsidio-desempleo | **OK** | Solo label (aclara que la norma mide el mes natural anterior y aquí es proxy anual). Extracto art. 275.1 ya probaba «no superen el 75 por ciento del salario mínimo interprofesional, excluida la parte proporcional de dos pagas extraordinarias»; `SMI_MENSUAL ×9` = 1.221×9 = 10.989 €/año ≈ 915,75×12. Consistente. |
