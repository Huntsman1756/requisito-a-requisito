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
};

export const aidTitle = (slug: string): string => AID_TITLES[slug] ?? slug;
