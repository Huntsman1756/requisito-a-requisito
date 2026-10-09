/** Títulos ciudadanos por slug de ayuda (lote 1). Fallback: el slug. */
export const AID_TITLES: Record<string, string> = {
	"bono-cultural-joven": "Bono Cultural Joven 2026",
	"bono-social-electrico": "Bono Social Eléctrico",
	"madrid-ayudas-nacimiento-adopcion-multiple":
		"Ayuda por nacimiento o adopción múltiple (Comunidad de Madrid)",
	"prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad":
		"Prestación por nacimiento o adopción (familia numerosa, monoparental o discapacidad)",
	"subsidio-mayores-52": "Subsidio por desempleo de mayores de 52 años",
	"descuento-transporte-familia-numerosa":
		"Descuento de tren para familias numerosas",
	imv: "Ingreso Mínimo Vital",
	"madrid-cheque-escuela-infantil":
		"Cheque escuela infantil (Comunidad de Madrid)",
	"madrid-beca-comedor-escolar":
		"Beca de comedor escolar (Comunidad de Madrid)",
	"madrid-bono-alquiler-joven": "Bono alquiler joven (Comunidad de Madrid)",
	"madrid-becas-bachillerato-centros-privados":
		"Becas de Bachillerato en centros privados (Comunidad de Madrid)",
	"madrid-renta-minima-insercion": "Renta Mínima de Inserción (Comunidad de Madrid)",
	"prestaciones-dependencia-saad": "Reconocimiento de la dependencia (SAAD)",
	"madrid-abono-transporte-joven": "Abono transporte joven (Comunidad de Madrid)",
	"madrid-abono-transporte-65": "Tarjeta azul de transporte (+65, Madrid capital)",
	"prestacion-cuidado-menor-enfermedad-grave":
		"Prestación por cuidado de menores con enfermedad grave",
	"complemento-ayuda-infancia": "Complemento de ayuda para la infancia (IMV)",
	"madrid-titulo-familia-numerosa": "Título oficial de familia numerosa",
	"bono-social-termico": "Bono social térmico",
	"madrid-ayudas-nacimiento-general":
		"Ayuda económica por nacimiento (Comunidad de Madrid)",
	"prestacion-nacimiento-cuidado-menor":
		"Permiso y prestación por nacimiento y cuidado del menor",
	"becas-generales-mefp-2026-2027": "Becas del Ministerio de Educación (universidad)",
	"madrid-abono-transporte-infantil": "Transporte público gratuito infantil (menores de 7 años)",
	"prestacion-cuidador-no-profesional":
		"Prestación para cuidadoras no profesionales de personas dependientes",
	"prestacion-desempleo-contributiva": "Prestación contributiva por desempleo (SEPE)",
	"madrid-ayudas-urgencia-social":
		"Ayudas económicas de urgencia social (Comunidad de Madrid)",
	"pension-no-contributiva": "Pensión no contributiva (jubilación o invalidez)",
	"subsidio-desempleo": "Subsidio por desempleo (insuficiencia de cotización)",
	"asignacion-hijo-a-cargo": "Asignación por hijo o menor a cargo",
	"pension-viudedad": "Pensión de viudedad",
	"madrid-ayudas-alquiler-plan-estatal": "Ayuda al alquiler (Plan Estatal de Vivienda)",
	"cese-actividad-autonomos": "Cese de actividad de autónomos",
	"pension-incapacidad-permanente": "Pensión de incapacidad permanente",
	"pension-jubilacion-contributiva": "Pensión de jubilación contributiva",
	"pension-orfandad": "Pensión de orfandad",
	"ayto-emergencia-social":
		"Ayudas económicas de emergencia social (Ayuntamiento de Madrid)",
	"ayto-escuela-infantil":
		"Escuelas infantiles municipales (Ayuntamiento de Madrid)",
	"ayto-ibi-familia-numerosa":
		"Bonificación del IBI para familias numerosas (Ayuntamiento de Madrid)",
	"ayto-tarjeta-azul-discapacidad":
		"Tarjeta azul de transporte (personas con discapacidad, Madrid capital)",
	"mostoles-prestaciones-sociales":
		"Prestaciones sociales económicas (Móstoles)",
	"leganes-prestaciones-especial-necesidad":
		"Prestaciones sociales de especial necesidad (Leganés)",
	"fuenlabrada-prestaciones-sociales":
		"Prestaciones sociales económicas (Fuenlabrada)",
	"fuenlabrada-fuenlacarenet-2026":
		"FuenlaCareNet — ayuda de urgencia social (Fuenlabrada)",
	"madrid-accede-prestamo-libros":
		"Préstamo de libros de texto — Programa ACCEDE (Comunidad de Madrid)",
	"madrid-ayuda-pago-unico-vg":
		"Ayuda económica de pago único (víctimas de violencia de género, CM)",
	"sermas-reintegro-gastos-sanitarios":
		"Reintegro de gastos sanitarios — farmacia, urgencias o desplazamiento (SERMAS)",
	"sermas-ortoprotesica-desplazamiento":
		"Reintegro de prestación ortoprotésica y desplazamiento sanitario (SERMAS)",
	"cm-reintegro-accidentes-trabajo":
		"Reintegro de gastos por accidente de trabajo (empleados públicos CM)",
	"prestamos-personal-publico-cm":
		"Préstamo sin intereses para personal de la CM (hasta 5.000 €)",
	"anticipos-docentes-cm":
		"Anticipo de nómina para funcionarios docentes (Comunidad de Madrid)",
};

export const aidTitle = (slug: string): string => AID_TITLES[slug] ?? slug;

const SLUG_TOKEN = /\b[a-z0-9]+(?:-[a-z0-9]+){2,}\b/g;

/**
 * Sustituye identificadores internos («madrid-abono-transporte-65») por su
 * título ciudadano al pintar textos de regla. No toca el dato de la regla:
 * solo la capa de presentación.
 */
export const humanizeSlugs = (text: string): string =>
	text.replace(SLUG_TOKEN, (m) => AID_TITLES[m] ?? m);
