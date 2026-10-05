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
};

export const aidTitle = (slug: string): string => AID_TITLES[slug] ?? slug;
