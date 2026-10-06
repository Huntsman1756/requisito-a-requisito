// Origen: la-ayuda@6595a533 (rama feat/premio-gtl-elegibilidad, MIT, codigo propio). Portado segun docs/13.
/**
 * Esquemas Zod del motor de elegibilidad.
 *
 * Equivalentes a los 7 JSON Schema normativos de la candidatura
 * (datawardsmadrid/schemas/*.schema.json, draft 2020-12): misma obligatoriedad,
 * mismos enums, `additionalProperties: false` => `strictObject`.
 * Validación pura: sin defaults ni coerciones (un "default" de JSON Schema es
 * anotación, no mutación del dato).
 */

import { z } from "zod";

const isoDate = z.iso.date();
const isoDateTime = z.iso.datetime();
const sha256Hex = z.string().regex(/^[a-f0-9]{64}$/);
const httpsUrl = z.string().regex(/^https:\/\//);
const rankSchema = z.union([
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
]);

export const citationSchema = z.strictObject({
	sourceId: z.string(),
	locator: z.string().min(2),
	excerpt: z.string().min(8),
	excerptSha256: sha256Hex,
});
export type Citation = z.infer<typeof citationSchema>;

export type Condition =
	| { all: Condition[]; label?: string; citation?: Citation }
	| { any: Condition[]; label?: string; citation?: Citation }
	| { not: Condition; label?: string; citation?: Citation }
	| ConditionLeaf;

export const CONDITION_OPS = [
	"eq",
	"neq",
	"in",
	"not_in",
	"includes_any",
	"includes_all",
	"lt",
	"lte",
	"gt",
	"gte",
	"between",
	"within_territory",
	"count_where_gte",
	"exists",
] as const;
export type ConditionOp = (typeof CONDITION_OPS)[number];

export interface ConditionLeaf {
	field: string;
	op: ConditionOp;
	value?: unknown;
	param?: string;
	multiplier?: number;
	inclusive?: [boolean, boolean];
	where?: Condition;
	count?: number;
	label?: string;
	citation?: Citation;
}

const leafSchema: z.ZodType<ConditionLeaf> = z.strictObject({
	field: z.string(),
	op: z.enum(CONDITION_OPS),
	value: z.unknown().optional(),
	param: z.string().optional(),
	multiplier: z.number().gt(0).optional(),
	inclusive: z.tuple([z.boolean(), z.boolean()]).optional(),
	where: z.lazy((): z.ZodType<Condition> => conditionSchema).optional(),
	count: z.number().int().min(1).optional(),
	label: z.string().optional(),
	citation: citationSchema.optional(),
});

const nodeExtras = {
	label: z.string().optional(),
	citation: citationSchema.optional(),
};

export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
	z.union([
		z.strictObject({
			all: z.array(conditionSchema).min(1),
			...nodeExtras,
		}),
		z.strictObject({
			any: z.array(conditionSchema).min(1),
			...nodeExtras,
		}),
		z.strictObject({ not: conditionSchema, ...nodeExtras }),
		leafSchema,
	]),
);

const requirementSchema = z.strictObject({
	id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
	hard: z.boolean(),
	label: z.string(),
	labelKey: z.string().optional(),
	timeDependent: z.enum(["increasing", "decreasing", "none"]).optional(),
	citation: citationSchema,
	condition: conditionSchema,
});

const uncoveredRequirementSchema = z.strictObject({
	id: z.string(),
	label: z.string(),
	citation: citationSchema,
});

const previousCallSchema = z.strictObject({
	opensAt: isoDate,
	closesAt: isoDate,
	citation: citationSchema,
});

const applicationWindowSchema = z.strictObject({
	opensAt: isoDate.optional(),
	closesAt: isoDate.optional(),
	rolling: z.boolean(),
	recurrence: z.enum(["none", "annual"]).optional(),
	previousCalls: z.array(previousCallSchema).optional(),
	businessDays: z.boolean().optional(),
	conflict: z.boolean().optional(),
	citation: citationSchema,
});

const officialSimulatorSchema = z.strictObject({
	url: httpsUrl,
	label: z.string(),
	citation: citationSchema,
});

const channelSchema = z.strictObject({
	managingBody: z.string(),
	url: httpsUrl,
	online: z.boolean(),
	inPerson: z.boolean().optional(),
	citation: citationSchema,
});

const documentSchema = z.strictObject({
	id: z.string(),
	label: z.string(),
	mandatory: z.boolean(),
	condition: conditionSchema.optional(),
	citation: citationSchema,
});

const applicationSchema = z.strictObject({
	window: applicationWindowSchema,
	officialSimulator: officialSimulatorSchema.optional(),
	channel: channelSchema,
	documents: z.array(documentSchema),
});

const amountSchema = z.union([
	z.null(),
	z.strictObject({
		type: z.enum([
			"per_applicant",
			"fixed",
			"range",
			"variable",
			"total_budget",
		]),
		minEur: z.number().min(0).optional(),
		maxEur: z.number().min(0).optional(),
		period: z.enum(["one_off", "monthly", "annual", "per_course"]).optional(),
		citation: citationSchema,
	}),
]);

export const ruleSetSchema = z.strictObject({
	benefitSlug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
	standalone: z.boolean().optional(),
	rulesVersion: z.number().int().min(1),
	verifiedAt: isoDate,
	verification: z
		.strictObject({
			status: z.enum(["ok", "pending", "ko"]),
			by: z.string().optional(),
			at: isoDate.optional(),
			report: z.string().optional(),
		})
		.optional(),
	humanReview: z.strictObject({
		status: z.enum(["pending", "approved", "rejected"]),
		by: z.string().optional(),
		at: isoDate.optional(),
		notes: z.string().optional(),
	}),
	referenceDate: z.union([isoDate, z.literal("application")]),
	referenceDateCitation: citationSchema.optional(),
	sources: z
		.array(
			z.strictObject({
				id: z.string().regex(/^[a-z0-9][a-z0-9_.-]*$/),
				rank: rankSchema,
				documentType: z.enum([
					"regulatory_base",
					"call",
					"extract",
					"resolution",
					"modification",
					"extension",
					"procedure_page",
					"informational",
				]),
				url: httpsUrl,
				title: z.string().optional(),
			}),
		)
		.min(1),
	parametersUsed: z
		.array(z.string())
		.refine((a) => new Set(a).size === a.length, {
			message: "parametersUsed must be unique",
		})
		.optional(),
	requirements: z.array(requirementSchema).min(1),
	uncoveredRequirements: z.array(uncoveredRequirementSchema),
	application: applicationSchema,
	amount: amountSchema,
	effortInputs: z
		.strictObject({
			requiresCertificate: z.boolean().optional(),
			formPages: z.number().int().min(0).optional(),
		})
		.optional(),
	/** Temas para explorar/filtrar el catálogo (docs/15). */
	themes: z
		.array(
			z.enum([
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
			]),
		)
		.optional(),
	/** Eventos vitales a los que responde (docs/15 B). */
	lifeEvents: z
		.array(
			z.enum([
				"tener_hijo",
				"perder_empleo",
				"estudiar",
				"independizarse_vivienda",
				"cuidar_familiar",
				"discapacidad",
				"mayor_65",
				"ingresos_bajos",
			]),
		)
		.optional(),
});
export type RuleSet = z.infer<typeof ruleSetSchema>;

// --- Citizen profile ---------------------------------------------------------

const intervalSchema = z.strictObject({
	min: z.number().nullable(),
	max: z.number().nullable(),
	maxExclusive: z.boolean().optional(),
});

const monthYearSchema = z.strictObject({
	year: z.number().int().min(1900),
	month: z.number().int().min(1).max(12),
});

const territoryValueSchema = z.strictObject({
	ccaa: z.string().regex(/^[0-9]{2}$/),
	province: z
		.string()
		.regex(/^[0-9]{2}$/)
		.optional(),
	municipality: z
		.string()
		.regex(/^[0-9]{5}$/)
		.optional(),
});

const dependentSchema = z.strictObject({
	age: intervalSchema,
	disability: z.enum(["yes", "no", "unknown", "declined"]).optional(),
});

const answerSchema = z.union([
	z.strictObject({ state: z.enum(["unknown", "declined", "unasked"]) }),
	z.strictObject({
		state: z.literal("value"),
		value: z.union([
			z.string(),
			z.array(z.string()),
			z.number().int(),
			intervalSchema,
			monthYearSchema,
			territoryValueSchema,
			z.array(dependentSchema),
		]),
	}),
]);

export const citizenProfileSchema = z.strictObject({
	catalogVersion: z.number().int(),
	answers: z.record(z.string(), answerSchema),
});
export type CitizenProfile = z.infer<typeof citizenProfileSchema>;

// --- Golden persona ----------------------------------------------------------

export const VERDICTS = [
	"probable",
	"posible",
	"insuficiente",
	"no_cumple",
] as const;
export type Verdict = (typeof VERDICTS)[number];

export const DEADLINE_STATES = [
	"OPEN",
	"UPCOMING",
	"CLOSED",
	"CLOSED_RECURRING",
	"ROLLING",
	"UNKNOWN",
] as const;
export type DeadlineState = (typeof DEADLINE_STATES)[number];

export const goldenPersonaSchema = z.strictObject({
	id: z.string().regex(/^gp-[a-z0-9-]+$/),
	description: z.string(),
	today: isoDate,
	profile: citizenProfileSchema,
	expectations: z
		.array(
			z.strictObject({
				benefitSlug: z.string(),
				rulesVersion: z.number().int(),
				verdict: z.enum(VERDICTS),
				deadlineState: z.enum(DEADLINE_STATES).optional(),
				missingFields: z.array(z.string()).optional(),
				blockers: z.array(z.string()).optional(),
				futureFrom: isoDate.optional(),
				justification: z
					.array(
						z.strictObject({
							sourceId: z.string(),
							locator: z.string(),
							reasoning: z.string(),
						}),
					)
					.min(1),
			}),
		)
		.min(1),
	review: z.strictObject({
		status: z.enum(["pending", "approved", "rejected"]),
		by: z.string().optional(),
		at: isoDate.optional(),
	}),
});
export type GoldenPersona = z.infer<typeof goldenPersonaSchema>;

// --- Evaluation result -------------------------------------------------------

const requirementResultSchema = z.strictObject({
	id: z.string(),
	hard: z.boolean(),
	status: z.enum(["T", "F", "U"]),
	uncertainty: z
		.enum([
			"unasked",
			"unknown",
			"declined",
			"range_straddles",
			"territory_partial",
			"conflict",
		])
		.optional(),
	reasonKey: z.string(),
	reasonParams: z
		.record(z.string(), z.union([z.string(), z.number()]))
		.optional(),
	missingFields: z.array(z.string()).optional(),
	citation: citationSchema,
});

export const evaluationResultSchema = z.strictObject({
	benefitSlug: z.string(),
	rulesVersion: z.number().int(),
	today: isoDate,
	verdict: z.enum(VERDICTS),
	requirements: z.array(requirementResultSchema),
	missing: z.array(
		z.strictObject({
			field: z.string(),
			questionId: z.string(),
			unlocks: z.number().int().min(1),
		}),
	),
	blockers: z.array(z.string()),
	futureEligibility: z
		.strictObject({
			from: isoDate,
			to: isoDate.optional(),
			becauseOf: z.array(z.string()),
			withinWindow: z.literal(true),
		})
		.optional(),
	uncovered: z.array(z.string()),
	deadline: z.strictObject({
		state: z.enum(DEADLINE_STATES),
		opensAt: isoDate.optional(),
		closesAt: isoDate.optional(),
		daysLeft: z.number().int().optional(),
		urgent: z.boolean().optional(),
		conflict: z.boolean().optional(),
	}),
	amount: z
		.strictObject({
			type: z.enum([
				"per_applicant",
				"fixed",
				"range",
				"variable",
				"total_budget",
			]),
			minEur: z.number().optional(),
			maxEur: z.number().optional(),
			period: z.string().optional(),
			displayAsPersonal: z.boolean(),
		})
		.optional(),
	documents: z.array(z.string()),
	channel: z.object({
		managingBody: z.string(),
		url: z.string(),
		online: z.boolean(),
	}),
	effort: z
		.strictObject({
			minMinutes: z.number().int(),
			maxMinutes: z.number().int(),
			formulaVersion: z.string(),
		})
		.optional(),
	whyShown: z.array(z.string()),
	verifiedAt: isoDate,
	staleness: z.enum(["fresh", "aging", "stale"]).optional(),
	explanationKeys: z.array(z.string()),
	selfCheck: z.strictObject({
		passed: z.boolean(),
		failed: z.array(z.string().regex(/^I([1-9]|10)$/)),
	}),
});
export type EvaluationResult = z.infer<typeof evaluationResultSchema>;

// --- Parameters (patrón OpenFisca) -------------------------------------------

export const parametersSchema = z.strictObject({
	parameters: z.array(
		z.strictObject({
			id: z.string().regex(/^[A-Z0-9_]+$/),
			label: z.string(),
			unit: z.enum([
				"EUR_YEAR",
				"EUR_MONTH",
				"EUR_DAY",
				"YEARS",
				"MONTHS",
				"RATIO",
			]),
			periods: z
				.array(
					z.strictObject({
						from: isoDate,
						to: isoDate.optional(),
						value: z.number(),
						citation: citationSchema,
					}),
				)
				.min(1),
		}),
	),
});
export type Parameters = z.infer<typeof parametersSchema>;

// --- Question catalog ---------------------------------------------------------

export const questionCatalogSchema = z.strictObject({
	catalogVersion: z.number().int().min(1),
	questions: z
		.array(
			z.strictObject({
				id: z.string().regex(/^q-[a-z0-9-]+$/),
				field: z.string(),
				type: z.enum([
					"single",
					"multi",
					"integer",
					"age",
					"money_band",
					"month_year",
					"territory",
					"dependents",
				]),
				order: z.number().int().min(1),
				labelKey: z.string(),
				helpKey: z.string().optional(),
				whyKey: z.string(),
				options: z
					.array(
						z.strictObject({
							value: z.string(),
							labelKey: z.string(),
							interval: z
								.tuple([z.number().nullable(), z.number().nullable()])
								.optional(),
						}),
					)
					.optional(),
				min: z.number().optional(),
				max: z.number().optional(),
				allowUnknown: z.boolean(),
				allowDecline: z.boolean(),
				sensitivity: z.enum(["normal", "special"]),
				showIf: conditionSchema.optional(),
				derives: z.array(z.string()).optional(),
			}),
		)
		.min(1)
		.max(14),
	consistencyChecks: z.array(
		z.strictObject({
			id: z.string(),
			when: conditionSchema,
			messageKey: z.string(),
		}),
	),
});
export type QuestionCatalog = z.infer<typeof questionCatalogSchema>;

// --- Source registry -----------------------------------------------------------

export const sourceSnapshotSchema = z.strictObject({
	id: z.string(),
	url: httpsUrl,
	fetchedAt: isoDateTime,
	sha256: sha256Hex,
	textSha256: sha256Hex,
	contentType: z.string(),
	rank: rankSchema,
	publishedAt: isoDate.optional(),
	eli: z.string().optional(),
	supersededBy: z.string().optional(),
});
export type SourceSnapshot = z.infer<typeof sourceSnapshotSchema>;

export const sourceRegistrySchema = z.strictObject({
	domains: z.array(
		z.strictObject({
			host: z.string(),
			maxRank: rankSchema,
			label: z.string(),
		}),
	),
	snapshots: z.array(sourceSnapshotSchema).optional(),
});
export type SourceRegistry = z.infer<typeof sourceRegistrySchema>;
