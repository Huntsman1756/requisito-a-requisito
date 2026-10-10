/**
 * lib.ts — funciones puras del generador del universo (R2-REPRO).
 * Sin fetch ni fs: reciben datos y devuelven programas clasificados.
 * Los tests offline las cubren.
 */

import { createHash } from "node:crypto";

export interface RawItem {
	title: string;
	url?: string;
	/** p. ej. "sede-cm" | "bdns" | "la-ayuda" | "pipeline-bocm" | "seed" */
	sourceKind: string;
	scope: "comunidad-madrid" | "municipal" | "estatal";
	/** Nombre del municipio (o mancomunidad) cuando scope === "municipal". */
	municipality?: string;
	accessState?: string;
	id?: string;
	nivel1?: string;
	fechaRecepcion?: string;
	numeroConvocatoria?: string;
	extra?: Record<string, unknown>;
}

export interface Program {
	id: string;
	title: string;
	scope: string;
	municipality?: string;
	accessState: string;
	officialSourceUrl?: string;
	themes: string[];
	lifeEvents: string[];
	source: { kind: string; url?: string };
	dedupedWith?: string[];
	seedNote?: string;
	hint?: boolean;
	[key: string]: unknown;
}

export const THEMES = [
	"familia_infancia",
	"educacion",
	"empleo",
	"vivienda",
	"dependencia_discapacidad",
	"mayores",
	"ingresos_minimos",
	"energia_suministros",
	"transporte",
	"cultura_juventud",
	"violencia_genero",
	"salud",
] as const;

export const LIFE_EVENTS = [
	"tener_hijo",
	"perder_empleo",
	"estudiar",
	"independizarse_vivienda",
	"cuidar_familiar",
	"discapacidad",
	"mayor_65",
	"ingresos_bajos",
] as const;

const norm = (s: string) =>
	s
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, " ")
		.trim();

// Exclusiones deterministas (documentadas en el informe)
const EXCLUDE: [RegExp, string][] = [
	[/\bnominativa\b/, "subvención nominativa (a una entidad concreta)"],
	[/\bpremio\b|\bpremios\b|\bconcurso\b|certamen/, "premio/certamen, no prestación"],
	[/ayuntamientos|municipios|mancomunidad|entidades locales/, "destinada a entidades locales"],
	[/empresas|sociedades mercantiles|pymes\b|microempresas|emprendedores/, "destinada a empresas/autónomos"],
	[/asociaciones|fundaciones|entidades sin (animo|fin de lucro)|a entidades|a universidades|financiacion de proyectos de investigacion|organizaciones/, "destinada a entidades"],
	[/nombramiento|plaza\s+de|concurso-oposicion|subasta/, "no es una ayuda"],
	[/justificacion de (la |las )?(subvenci|ayuda|gasto)|anticipo de la subvenci|liquidacion de la subvenci|comunicacion de datos|aportacion de documentacion|reintegro de (la |el )?(subvencion|ayuda|importe|fondo)/, "trámite interno de la convocatoria"],
	[/para contratar|por contratar|contratacion de (personas|personal)|sello de excelencia|responsabilidad social/, "ayuda al empleador, no a la persona"],
	[/federaciones|establecimientos|montes|bovino|ovino|caprino|explotacion|agricol|ganader|vinedo|forestal|vitivinicola|apicol|pesquer|acuicol|regadio|lobo iberico|zonas de montana/, "actividad agraria/económica"],
	[/leader\b|desarrollo local participativo|plan de cooperacion|obras y servicios municipales|obras publicas de infraestructuras|areas industriales/, "desarrollo local o entidades"],
	[/funcionarios|personal de administracion|personal publico|personal militar|cuerpos docentes|funcionario de justicia|personal funcionario/, "interno del empleado público"],
	[/clubes deportivos|a clubes|centros escolares|a colegios|a centros|a librerias|oficinas de farmacia|redlab|laboratorios|largometraje|cortometraje|videojuegos|edicion de libros|fondos bibliograficos|mercados municipales|galerias de alimentacion|policia local|industria agroalimentaria|grupo(s)? operativo(s)?|entidades de enlace|entidades de formacion|efecto tractor|sostenimiento de colegios|equipamiento.*bibliotecas|proyectos de i\+d|doctorados industriales|en formacion, asociados a proyectos|interes general con fines|a proyectos|para proyectos|a programas|para programas|a servicios|mantener (centros|plazas)|plazas y tratamientos|centros especiales de empleo|colaboracion en proyectos|proyectos ambientales|actividades.*ambiental|circuitos de artes|prevencion.*(vih|its)|vih - sida|agroalimentari|industria del libro|a la industria|tecnificacion|campos de voluntariado|centros educativos|agrupaciones empresariales|empresarial|proyectos comerciales|guardia civil/, "destinada a entidades o actividad económica"],
	[/comercializaci|transformacion de productos|modernizacion de librerias|modernizacion y dinamizacion/, "destinada a empresas"],
	[/convenio/, "convenio entre administraciones, no una ayuda a personas"],
	[/puesto libre|designaci[oó]n|nombramiento/, "designación/nombramiento"],
	[/correcci[oó]n de errores|rectificaci[oó]n|formalizacion contrato|convocatoria contrato|plan general de urbanismo|plan estrategico|proceso selectivo|imparticion ense[nñ]anzas|servicios m[ií]nimos|estatutos|bases reguladoras|concurso de meritos|adenda|autorizacion de|convalidacion|homologacion/, "acto administrativo, no una convocatoria de ayuda a personas"],
	[/concesi[oó]n|adjudicaci[oó]n/, "resolución de concesión, no una convocatoria"],
	[/pr[oó]rroga/, "prórroga, no una convocatoria"],
	[/modificaci[oó]n de (las |la )?(bases|convocatoria|orden)/, "modificación de bases"],
];

const THEME_RX: [string, RegExp][] = [
	["familia_infancia", /natalidad|nacimiento|adopcion|hijo|familia numerosa|familias|monoparental|maternidad|paternidad|menor/],
	["educacion", /beca|estudio|formacion|universidad|fp\b|bachillerato|escolar|comedor|libros/],
	["empleo", /empleo|desempleo|paro\b|subsidio|insercion|formacion ocupacional/],
	["vivienda", /vivienda|alquiler|alquila|compra|hipoteca|realojo/],
	["dependencia_discapacidad", /dependencia|discapacidad|saad|tercera edad/],
	["violencia_genero", /violencia de genero|proteccion victimas|mujeres/],
	["mayores", /jubilacion|pensiones|mayores|edad avanzada|abono senior/],
	["energia_suministros", /energia|electric|bono social|termico|fotovoltaic|placas/],
	["transporte", /transporte|abono|renfe|metro|interurbano/],
	["cultura_juventud", /cultural|juvenil|joven|deporte|deport/],
	["salud", /salud|sanitari|enfermedad|mental/],
	["ingresos_minimos", /emergencia|urgencia social|proteccion social|renta|alimentacion|ingreso minimo/],
];

const EVENT_RX: [string, RegExp][] = [
	["tener_hijo", /natalidad|nacimiento|adopcion|embarazo|maternidad|paternidad/],
	["perder_empleo", /desempleo|paro\b|subsidio|prestacion por desempleo|insercion/],
	["estudiar", /beca|estudio|formacion|universidad|fp\b|bachillerato|escolar/],
	["independizarse_vivienda", /vivienda|alquiler|alquila|realojo|hipoteca/],
	["cuidar_familiar", /dependencia|saad|cuidad|enfermedad|discapacidad/],
	["discapacidad", /discapacidad/],
	["mayor_65", /mayores|jubilacion|pension|abono senior/],
	["ingresos_bajos", /energia|electric|bono social|termico|renta|ingreso minimo/],
];

export function classify(title: string): { ok: boolean; reason?: string } {
	const t = norm(title);
	for (const [rx, why] of EXCLUDE) if (rx.test(t)) return { ok: false, reason: why };
	return { ok: true };
}

export function tagsFor(title: string): { themes: string[]; lifeEvents: string[] } {
	const t = norm(title);
	return {
		themes: THEME_RX.filter(([, rx]) => rx.test(t)).map(([k]) => k),
		lifeEvents: EVENT_RX.filter(([, rx]) => rx.test(t)).map(([k]) => k),
	};
}

/** Clave de dedupe por programa: título normalizado sin año ni edición. */
export function progKey(title: string): string {
	let t = norm(title);
	t = t.replace(/\s*\((19|20)\d{2}[^)]*\)/g, "");
	t = t.replace(/\b(19|20)\d{2}\b/g, "");
	t = t.replace(/\bconvocatoria\s+\w{2,5}\s*\b/g, "");
	return t.replace(/\s+/g, " ").trim().slice(0, 80);
}

/** Orden de preferencia de fuente para dedupe (menor = mejor). */
const SRC_ORDER: Record<string, number> = {
	"sede-cm": 0,
	"sede-municipal": 1,
	"la-ayuda": 2,
	bdns: 3,
	"pipeline-bocm": 4,
	seed: 5,
};

/** Resolución determinista de UNKNOWN (R3-UNK):
 *  - fecha de publicación/recepción < año en curso → CLOSED (la convocatoria
 *    de una edición pasada ya no admite solicitudes; verificado por fecha,
 *    no por inferencia del texto)
 *  - título con «permanentemente|indefinidamente|plazo abierto|carácter
 *    permanente» → ROLLING
 *  Si no, se queda UNKNOWN (y va al final de /explorar).
 */
export function resolveAccessState(r: RawItem, today: string): string {
	const t = norm(r.title);
	if (/permanentemente|indefinidamente|plazo abierto|caracter permanente|sin plazo|inscripcion abierta/.test(t)) {
		return "ROLLING";
	}
	const year = Number(today.slice(0, 4));
	// BOCM embebido: bocm-BOCM-YYYYMMDD-N
	const bocmDate = /bocm-BOCM-(\d{4})(\d{2})(\d{2})-/i.exec(r.id ?? "");
	const bocmYear = /bocm-(\d{4})/i.exec(r.id ?? "")?.[1];
	const dateStr =
		(typeof r.extra?.receivedAt === "string" ? r.extra.receivedAt : undefined) ??
		(bocmDate
			? `${bocmDate[1]}-${bocmDate[2]}-${bocmDate[3]}`
			: bocmYear
				? `${bocmYear}-12-31`
				: undefined);
	if (dateStr) {
		// plazo ordinario de una convocatoria BOCM: ~15-30 días naturales;
		// publicada hace >90 días y sin señal de permanencia → CLOSED
		// (inferido; la ficha indica «consulta la sede»)
		const diffDays =
			(Date.parse(today) - Date.parse(dateStr)) / 86_400_000;
		if (Number(dateStr.slice(0, 4)) < year || diffDays > 90) return "CLOSED";
	}
	return r.accessState ?? "UNKNOWN";
}

export function mergePrograms(items: RawItem[], today = "9999-12-31"): {
	programs: Program[];
	rejected: { title: string; reason: string; source: string }[];
} {
	const rejected: { title: string; reason: string; source: string }[] = [];
	const byKey = new Map<string, Program>();
	const sorted = [...items].sort(
		(a, b) => (SRC_ORDER[a.sourceKind] ?? 9) - (SRC_ORDER[b.sourceKind] ?? 9),
	);
	for (const r of sorted) {
		const c = classify(r.title);
		if (!c.ok) {
			rejected.push({ title: r.title, reason: c.reason!, source: r.sourceKind });
			continue;
		}
		const { themes, lifeEvents } = tagsFor(r.title);
		const id = r.id ?? `${r.sourceKind}-${createHash("sha1").update(norm(r.title)).digest("hex").slice(0, 10)}`;
		const p: Program = {
			id,
			title: r.title,
			scope: r.scope,
			...(r.municipality ? { municipality: r.municipality } : {}),
			accessState:
				r.accessState && r.accessState !== "UNKNOWN"
					? r.accessState
					: resolveAccessState(r, today),
			officialSourceUrl: r.url,
			themes,
			lifeEvents,
			source: { kind: r.sourceKind, url: r.url },
			...(r.extra ?? {}),
		};
		// La dedupe es por título+municipio: «ayudas de emergencia social»
		// en Getafe y en Rivas son dos programas distintos.
		const k = `${progKey(r.title)}|${r.municipality ?? ""}`;
		const prev = byKey.get(k);
		if (prev) {
			prev.dedupedWith = [...(prev.dedupedWith ?? []), id];
			continue;
		}
		byKey.set(k, p);
	}
	return { programs: [...byKey.values()], rejected };
}

// --- BDNS (R2-BDNS) ------------------------------------------------------------

export const BDNS_BASE = "https://www.infosubvenciones.es/bdnstrans/api";
/** Parámetros que la API realmente aplica (comprobados 2026-10-05). */
export const BDNS_PARAMS = {
	page: 0,
	pageSize: 100,
	order: "fechaRecepcion",
	direccion: "desc",
	vpd: "GE",
	regiones: "25",
	tiposBeneficiario: "1",
	fechaDesde: "01/01/2026",
} as const;

export function bdnsUrl(page: number, fechaHasta: string): string {
	const q = new URLSearchParams({
		page: String(page),
		pageSize: String(BDNS_PARAMS.pageSize),
		order: BDNS_PARAMS.order,
		direccion: BDNS_PARAMS.direccion,
		vpd: BDNS_PARAMS.vpd,
		regiones: BDNS_PARAMS.regiones,
		tiposBeneficiario: BDNS_PARAMS.tiposBeneficiario,
		fechaDesde: BDNS_PARAMS.fechaDesde,
		fechaHasta,
	});
	return `${BDNS_BASE}/convocatorias/busqueda?${q}`;
}

/** URL pública de una convocatoria: usa numeroConvocatoria, NO el id interno. */
export function bdnsPublicUrl(numeroConvocatoria: string): string {
	return `https://www.infosubvenciones.es/bdnstrans/GE/es/convocatoria/${numeroConvocatoria}`;
}

const CONNECTORS = new Set(["de", "del", "la", "las", "los", "el", "y", "e", "en"]);

/** «ESCORIAL, EL» → «El Escorial»; «RIVAS-VACIAMADRID» → «Rivas-Vaciamadrid»;
 *  «ALCALÁ DE HENARES» → «Alcalá de Henares». Conectores en minúscula salvo
 *  al inicio («El Escorial», «Las Rozas»). Las mancomunidades se quedan con
 *  su nombre en la misma forma. */
export function municipalityFromBody(nivel2: string): string {
	const m = nivel2.replace(/\s+/g, " ").trim();
	const inv = /^(.+),\s*(EL|LA|LOS|LAS)$/i.exec(m);
	const base = inv ? `${inv[2]} ${inv[1]}` : m;
	return base
		.toLowerCase()
		.replace(/(^|\s|["“«()/-])(\w)/g, (_s, sep, c) => `${sep}${c.toUpperCase()}`)
		.split(" ")
		.map((w, i) =>
			i > 0 && CONNECTORS.has(w.toLowerCase()) ? w.toLowerCase() : w,
		)
		.join(" ");
}

export function mapBdnsRecord(c: {
	id: number;
	numeroConvocatoria: string;
	descripcion: string;
	fechaRecepcion: string;
	nivel1: string;
	nivel2: string;
	nivel3: string;
}): RawItem {
	const scope =
		c.nivel1 === "AUTONOMICA"
			? "comunidad-madrid"
			: c.nivel1 === "LOCAL"
				? "municipal"
				: c.nivel1 === "ESTADO"
					? "estatal"
					: "estatal";
	return {
		id: `bdns-${c.numeroConvocatoria}`,
		title: c.descripcion.replace(/\s+/g, " ").trim(),
		url: bdnsPublicUrl(c.numeroConvocatoria),
		sourceKind: "bdns",
		scope,
		...(scope === "municipal"
			? { municipality: municipalityFromBody(c.nivel2) }
			: {}),
		accessState: "UNKNOWN",
		extra: {
			body: `${c.nivel2} — ${c.nivel3}`,
			receivedAt: c.fechaRecepcion,
		},
	};
}
