/**
 * evaluate.ts — evaluación completa de un RuleSet (docs/07).
 * Pura: sin fs, sin Date.now(), sin Next/React. `today` siempre inyectado.
 */

import { diffDays } from "./derived";
import { effortOf } from "./effort";
import { evaluationKeys, reasonKeyFor } from "./explain";
import { deadlineState } from "./deadline";
import { assertEvaluationInvariants, type InvariantCtx } from "./invariants";
import {
	blockersOf,
	futureEligibilityOf,
	missingOf,
	type ReqResult,
} from "./missing";
import {
	type EvalCtx,
	evalCondition,
} from "./operators";
import { verdictOf } from "./verdict";
import type {
	CitizenProfile,
	EvaluationResult,
	Parameters,
	QuestionCatalog,
	RuleSet,
} from "./schema";

export interface EvaluateCtx extends InvariantCtx {
	parameters: Parameters;
	catalog: QuestionCatalog;
	today: string;
}

export function evaluateRuleSet(
	rs: RuleSet,
	profile: CitizenProfile,
	ctx: EvaluateCtx,
): EvaluationResult {
	const evalCtx: EvalCtx = {
		parameters: ctx.parameters,
		referenceDate: rs.referenceDate === "application" ? ctx.today : rs.referenceDate,
		today: ctx.today,
	};

	const requirements = rs.requirements.map((req) => {
		const r = evalCondition(req.condition, profile, evalCtx);
		return {
			id: req.id,
			hard: req.hard,
			status: r.status,
			uncertainty: r.uncertainty,
			reasonKey: reasonKeyFor(r.status, r.uncertainty),
			reasonParams: r.via?.label ? { via: r.via.label } : undefined,
			missingFields: r.status === "U" ? r.missingFields : undefined,
			citation: req.citation,
		};
	});

	const reqResults: ReqResult[] = rs.requirements.map((req, i) => ({
		id: req.id,
		hard: req.hard,
		status: requirements[i].status,
		label: req.label,
		missingFields: requirements[i].missingFields,
		timeDependent: req.timeDependent,
		condition: req.condition,
	}));

	const verdict = verdictOf(
		requirements.map((r) => ({ hard: r.hard, status: r.status })),
		rs.uncoveredRequirements.length,
	);

	const deadline = deadlineState(rs.application.window, ctx.today);
	const missing = missingOf(reqResults, ctx.catalog);
	const blockers = blockersOf(reqResults);
	const futureEligibility = futureEligibilityOf(
		reqResults,
		rs.application.window,
		ctx.today,
		profile,
	);

	// Documentos: solo los que aplican (condición T o U).
	const documents = rs.application.documents
		.filter(
			(d) =>
				d.condition === undefined ||
				evalCondition(d.condition, profile, evalCtx).status !== "F",
		)
		.map((d) => d.label);

	const ageDays = diffDays(rs.verifiedAt, ctx.today);
	const staleness =
		ageDays > 90 ? "stale" : ageDays > 30 ? "aging" : undefined;

	const amount = rs.amount
		? {
				type: rs.amount.type,
				minEur: rs.amount.minEur,
				maxEur: rs.amount.maxEur,
				period: rs.amount.period,
				displayAsPersonal: rs.amount.type !== "total_budget",
			}
		: undefined;

	const ev: EvaluationResult = {
		benefitSlug: rs.benefitSlug,
		rulesVersion: rs.rulesVersion,
		today: ctx.today,
		verdict,
		requirements,
		missing,
		blockers,
		futureEligibility,
		uncovered: rs.uncoveredRequirements.map((u) => u.label),
		deadline,
		amount,
		documents,
		channel: {
			managingBody: rs.application.channel.managingBody,
			url: rs.application.channel.url,
			online: rs.application.channel.online,
		},
		effort: effortOf(rs.effortInputs ?? {}),
		whyShown: ["why_shown_rules_approved"],
		verifiedAt: rs.verifiedAt,
		staleness,
		explanationKeys: [],
		selfCheck: { passed: true, failed: [] },
	};
	ev.explanationKeys = evaluationKeys(ev);

	const failed = assertEvaluationInvariants(ev, rs, {
		parameters: ctx.parameters,
		bundleDigest: ctx.bundleDigest,
		expectedBundleDigest: ctx.expectedBundleDigest,
	});
	ev.selfCheck = { passed: failed.length === 0, failed };
	return ev;
}
