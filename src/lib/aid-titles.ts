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
};

export const aidTitle = (slug: string): string => AID_TITLES[slug] ?? slug;
