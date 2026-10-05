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
	eligibilityFactors: Record<string, unknown>;
}

export interface CheckData {
	bundle: Bundle;
	questions: QuestionCatalog;
	territory: {
		municipalities: { code: string; name: string }[];
		ccaa: { code: string; name: string }[];
	};
	level2: Level2Item[];
	manifestDigest: string;
}

const BASE = (process.env.BASE_PATH ?? "") || "";

async function get<T>(path: string): Promise<T> {
	const r = await fetch(`${BASE}${path}`);
	if (!r.ok) throw new Error(`${path}: ${r.status}`);
	return r.json() as Promise<T>;
}

export async function loadCheckData(): Promise<CheckData> {
	const [bundle, questions, territory, level2, manifest] = await Promise.all([
		get<Bundle>("/datos/elegibilidad/bundle.json"),
		get<QuestionCatalog>("/datos/elegibilidad/questions.json"),
		get<{
			municipalities: { code: string; name: string }[];
			ccaa: { code: string; name: string }[];
		}>("/datos/elegibilidad/territorio-madrid.json"),
		get<{ items: Level2Item[] }>("/datos/elegibilidad/nivel-2.json"),
		get<{ bundleDigest: string }>("/datos/elegibilidad/manifest.json"),
	]);
	return {
		bundle,
		questions,
		territory,
		level2: level2.items,
		manifestDigest: manifest.bundleDigest,
	};
}
