/**
 * results-order — orden y agrupado de la pantalla de resultados
 * (F10-RES + F10-RES-2 «Solo si…»). Regla de negocio de PRESENTACIÓN
 * (los veredictos no cambian):
 *
 *   1. «Encaja» (probable, o posible con todo lo comprobable en T, nada
 *      en F y NINGUNA condición definitoria en U)
 *   2. «Solo si…»: la ayuda deja abierta una condición definitoria en U
 *      (enfermedad grave del menor, fallecimiento del causante, edad
 *      ordinaria…) — se muestra con la condición como titular
 *   3. «Posible» con pocas incógnitas (≤2 U y ninguna blanda en F)
 *   4. «No se puede descartar»: posible con muchas incógnitas o alguna
 *      blanda ya en F — se muestra plegado con su número
 *   5. «Faltan datos» (insuficiente), al final
 *   6. «No aplica» (no_cumple) va aparte y plegada (ya lo era)
 *
 * Dentro de cada grupo: más requisitos cumplidos primero; a igualdad,
 * menos incógnitas primero; a igualdad, título alfabético.
 */

import type {
	EvaluationResult,
	RuleSet,
} from "./eligibility-engine/schema";
import type { Condition, ConditionLeaf } from "./eligibility-engine/schema";
import { resolveParam } from "./eligibility-engine/params";
import type { Parameters } from "./eligibility-engine/schema";
import { aidTitle } from "./aid-titles";

/** Una condición definitoria tal como la publica
 *  data/presentation/condiciones-definitorias.json. */
export interface CondDef {
	/** id del requisito en el RuleSet (comprobable o no cubierto). */
	req: string;
	/** texto corto en positivo: «si tu hijo tiene una enfermedad grave». */
	texto: string;
}
export type CondMap = Record<string, CondDef[] | undefined>;

/** Condiciones definitorias que siguen sin resolver (U): requisitos
 *  comprobables en U o requisitos «uncovered» del RuleSet, que no se
 *  comprueban nunca — U por construcción. Las que dan F no entran aquí:
 *  ya tiran la tarjeta a «no se puede descartar»/«no aplica». */
export function definingU(
	rs: RuleSet,
	ev: EvaluationResult,
	defs: CondDef[] | undefined,
): CondDef[] {
	if (!defs?.length) return [];
	const uncoveredIds = new Set(rs.uncoveredRequirements.map((u) => u.id));
	const reqById = new Map(ev.requirements.map((r) => [r.id, r.status]));
	return defs.filter((d) =>
		uncoveredIds.has(d.req) ? true : reqById.get(d.req) === "U",
	);
}

/** «Encaja»: veredicto probable, o posible con todos los duros
 *  comprobables en T y NINGÚN requisito en F (ni duro ni blando) — y
 *  además ninguna condición definitoria sin resolver (F10-RES-2 §1.2). */
export function isEncaja(
	rs: RuleSet,
	ev: EvaluationResult,
	defs?: CondDef[] | undefined,
): boolean {
	if (!(
		ev.verdict === "probable" ||
		(ev.verdict === "posible" &&
			ev.requirements.every(
				(r) => (!r.hard || r.status === "T") && r.status !== "F",
			) &&
			ev.requirements.some((r) => r.hard && r.status === "T"))
	))
		return false;
	return definingU(rs, ev, defs).length === 0;
}

export const nT = (ev: EvaluationResult) =>
	ev.requirements.filter((r) => r.status === "T").length;
export const nU = (ev: EvaluationResult) =>
	ev.requirements.filter((r) => r.status === "U").length;

/** Pocas incógnitas por resolver ⇒ la tarjeta va abierta; si no, plegada. */
export const MAX_OPEN_UNKNOWNS = 2;

export interface ResultEntry {
	rs: RuleSet;
	ev: EvaluationResult;
}
export interface SoloSiEntry extends ResultEntry {
	/** Condiciones definitorias sin resolver, para «— solo si …». */
	conds: CondDef[];
}
export interface ResultGroups {
	encajas: ResultEntry[];
	soloSi: SoloSiEntry[];
	posiblesPocas: ResultEntry[];
	noDescartar: ResultEntry[];
	faltanDatos: ResultEntry[];
	noCumple: ResultEntry[];
	notEvaluable: ResultEntry[];
}

export function groupResults(
	evaluations: ResultEntry[],
	showClosed: boolean,
	condMap: CondMap = {},
): ResultGroups {
	const ok = ({ ev }: ResultEntry) => ev.selfCheck.passed;
	const open = ({ ev }: ResultEntry) =>
		showClosed || ev.deadline.state !== "CLOSED";
	const byFit = (a: ResultEntry, b: ResultEntry) =>
		nT(b.ev) - nT(a.ev) ||
		nU(a.ev) - nU(b.ev) ||
		aidTitle(a.ev.benefitSlug).localeCompare(
			aidTitle(b.ev.benefitSlug),
			"es",
		);
	const verdict = (v: string) =>
		evaluations.filter((x) => x.ev.verdict === v && ok(x));

	const hasF = (ev: EvaluationResult) =>
		ev.requirements.some((r) => r.status === "F");
	const encaja = (x: ResultEntry) =>
		isEncaja(x.rs, x.ev, condMap[x.ev.benefitSlug]);
	// «Solo si…»: probable/posible SIN ningún requisito ya en F y con
	// alguna condición definitoria en U. Si algo ya da F — aunque sea
	// blando — va al plegado: destacarla con «solo si…» sería también
	// excesivo de optimismo.
	const soloSi = (x: ResultEntry): SoloSiEntry | undefined => {
		if (
			encaja(x) ||
			(x.ev.verdict !== "posible" && x.ev.verdict !== "probable") ||
			hasF(x.ev)
		)
			return undefined;
		const conds = definingU(x.rs, x.ev, condMap[x.ev.benefitSlug]);
		return conds.length ? { ...x, conds } : undefined;
	};

	return {
		encajas: evaluations
			.filter((x) => ok(x) && open(x) && encaja(x))
			.sort(byFit),
		soloSi: evaluations
			.filter(ok)
			.filter(open)
			.map(soloSi)
			.filter((x): x is SoloSiEntry => x !== undefined)
			.sort((a, b) => a.conds.length - b.conds.length || byFit(a, b)),
		posiblesPocas: verdict("posible")
			.filter((x) => !encaja(x) && !hasF(x.ev) && nU(x.ev) <= MAX_OPEN_UNKNOWNS)
			.filter((x) => !definingU(x.rs, x.ev, condMap[x.ev.benefitSlug]).length)
			.filter(open)
			.sort(byFit),
		noDescartar: verdict("posible")
			.filter((x) => !encaja(x) && !soloSi(x))
			.filter((x) => hasF(x.ev) || nU(x.ev) > MAX_OPEN_UNKNOWNS)
			.filter(open)
			.sort(byFit),
		faltanDatos: verdict("insuficiente").filter(open).sort(byFit),
		noCumple: verdict("no_cumple").sort(byFit),
		notEvaluable: evaluations.filter((x) => !ok(x)),
	};
}

/**
 * Umbrales de ingresos que quedan en U dentro de la franja respondida.
 * F10-RES-2 §2.2: si la persona respondió «Más de 25.200 €» y un umbral
 * real cae dentro, se ofrece una pregunta de precisión con ese umbral.
 * Recorre los requisitos en U y devuelve el umbral más bajo pendiente
 * (al responder se recalcula; el siguiente aparece si sigue en U).
 */
export function incomeThresholdU(
	evaluations: ResultEntry[],
	profile: {
		answers: Record<string, { state: string; value?: unknown } | undefined>;
	},
	ctx: { parameters: Parameters; today: string },
): number | undefined {
	const a = profile.answers.incomeAnnual;
	if (a?.state !== "value") return undefined;
	const band = a.value as { min?: number | null; max?: number | null };
	const lo = band?.min ?? Number.NEGATIVE_INFINITY;
	const hi = band?.max ?? Number.POSITIVE_INFINITY;

	const leafTs = (c: Condition, refDate: string): number[] => {
		if ("all" in c) return c.all.flatMap((x) => leafTs(x, refDate));
		if ("any" in c) return c.any.flatMap((x) => leafTs(x, refDate));
		if ("not" in c) return leafTs(c.not, refDate);
		const leaf = c as ConditionLeaf;
		if (leaf.field !== "incomeAnnual") return [];
		const nums: number[] = [];
		if (leaf.param !== undefined) {
			const p = resolveParam(ctx.parameters, leaf.param, refDate);
			if (p !== undefined) nums.push(p * (leaf.multiplier ?? 1));
		}
		if (leaf.op === "between" && Array.isArray(leaf.value))
			for (const x of leaf.value) if (typeof x === "number") nums.push(x);
		if (
			["lt", "lte", "gt", "gte"].includes(leaf.op) &&
			typeof leaf.value === "number"
		)
			nums.push(leaf.value * (leaf.multiplier ?? 1));
		return nums;
	};

	const pend = new Set<number>();
	for (const { rs, ev } of evaluations) {
		const st = new Map(ev.requirements.map((r) => [r.id, r.status]));
		const refDate =
			rs.referenceDate === "application" ? ctx.today : rs.referenceDate;
		for (const req of rs.requirements) {
			if (st.get(req.id) !== "U") continue;
			for (const t of leafTs(req.condition, refDate)) {
				// Solo umbrales estrictamente dentro de la franja respondida:
				// resolverlos cambia la evaluación.
				if (t > lo && (hi === Number.POSITIVE_INFINITY ? true : t < hi))
					pend.add(t);
			}
		}
	}
	const sorted = [...pend].sort((x, y) => x - y);
	return sorted[0];
}
