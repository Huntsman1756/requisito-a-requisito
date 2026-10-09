/**
 * check-data.ts — carga en el navegador los datos abiertos del producto.
 * Rutas bajo BASE_PATH (Pages sirve /<repo>/).
 */

import type {
	Parameters,
	QuestionCatalog,
	RuleSet,
} from "./eligibility-engine/schema";

export interface SourceMeta {
	id: string;
	url: string;
	sha256: string;
	textSha256: string;
	contentType: string;
	rank: number;
}

export interface Bundle {
	bundleVersion: number;
	referenceDate: string;
	rulesets: RuleSet[];
	parameters: Parameters;
	sources: SourceMeta[];
}

export interface Level2Item {
	slug: string;
	displayTitle: string;
	managingBody?: string;
	officialSourceUrl?: string;
	applicationStatus?: string;
	estimatedValueText?: string;
	/** Estado de acceso (docs/14 §2): OPEN/ROLLING/UPCOMING/CLOSED_RECURRING/UNKNOWN. */
	accessState?: string;
	scope?: string;
	themes?: string[];
	lifeEvents?: string[];
	eligibilityFactors: Record<string, unknown>;
}

export interface IntroData {
	questions: QuestionCatalog;
	territory: {
		municipalities: { code: string; name: string }[];
		ccaa: { code: string; name: string }[];
	};
	/** Campos que usa alguna regla (campos-usados.json): para elegir las
	 * preguntas no hace falta descargar el bundle. */
	fields: Set<string>;
	parameters: Parameters;
}

export interface ResultsData {
	bundle: Bundle;
	level2: Level2Item[];
	manifestDigest: string;
	/** Capa de presentación F10-RES-2: condición definitoria por regla. */
	condiciones: Record<string, { req: string; texto: string }[] | undefined>;
}

export interface CheckData extends ResultsData {
	questions: QuestionCatalog;
	territory: IntroData["territory"];
}

// BASE_PATH no se inyecta en el bundle del cliente (solo NEXT_PUBLIC_*); sin
// él, en Pages (…/requisito-a-requisito/) las peticiones a /datos/* iban a la
// raíz del dominio y el asistente no cargaba. Hallazgo F10-FIAB-A.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function get<T>(path: string): Promise<T> {
	const r = await fetch(`${BASE}${path}`);
	if (!r.ok) throw new Error(`${path}: ${r.status}`);
	return r.json() as Promise<T>;
}

// F10-PERF: la intro solo necesita preguntas + territorio + campos usados
// (unos 15 KB). El bundle (~900 KB), el nivel 2 y el manifiesto se piden al
// llegar a la revisión o a resultados — el primer paso pesa mucho menos.
export async function loadIntroData(): Promise<IntroData> {
	const [questions, territory, campos] = await Promise.all([
		get<QuestionCatalog>("/datos/elegibilidad/questions.json"),
		get<{
			municipalities: { code: string; name: string }[];
			ccaa: { code: string; name: string }[];
		}>("/datos/elegibilidad/territorio-madrid.json"),
		get<{ fields: string[]; parameters: Parameters }>(
			"/datos/elegibilidad/campos-usados.json",
		),
	]);
	return {
		questions,
		territory,
		fields: new Set(campos.fields),
		parameters: campos.parameters,
	};
}

export async function loadResultsData(): Promise<ResultsData> {
	const [bundle, level2, manifest, cond] = await Promise.all([
		get<Bundle>("/datos/elegibilidad/bundle.json"),
		get<{ items: Level2Item[] }>("/datos/elegibilidad/nivel-2.json"),
		get<{ bundleDigest: string }>("/datos/elegibilidad/manifest.json"),
		get<{
			rules: Record<
				string,
				{ condiciones?: { req: string; texto: string }[] }
			>;
		}>("/datos/elegibilidad/condiciones-definitorias.json"),
	]);
	return {
		bundle,
		level2: level2.items,
		manifestDigest: manifest.bundleDigest,
		condiciones: Object.fromEntries(
			Object.entries(cond.rules).map(([slug, r]) => [
				slug,
				r.condiciones ?? [],
			]),
		),
	};
}
