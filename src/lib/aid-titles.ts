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
};

export const aidTitle = (slug: string): string => AID_TITLES[slug] ?? slug;
