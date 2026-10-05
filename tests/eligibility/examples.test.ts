import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateRuleSet } from "../../src/lib/eligibility-engine/evaluate";
import type { EvaluationResult, RuleSet } from "../../src/lib/eligibility-engine/schema";
import { EXAMPLES } from "../../src/lib/examples";

const root = join(__dirname, "..", "..");
const bundle = JSON.parse(
	readFileSync(join(root, "public/datos/elegibilidad/bundle.json"), "utf8"),
) as { rulesets: RuleSet[] };
const catalog = JSON.parse(
	readFileSync(join(root, "public/datos/elegibilidad/questions.json"), "utf8"),
);
const parameters = JSON.parse(
	readFileSync(join(root, "data/eligibility/parameters.json"), "utf8"),
);
const ctx = {
	today: "2026-10-05",
	catalog,
	parameters,
	invariantsEnabled: false,
};

const evalAll = (answers: Record<string, unknown>): EvaluationResult[] =>
	bundle.rulesets.map((rs) =>
		evaluateRuleSet(
			rs,
			{ catalogVersion: 1, answers } as never,
			ctx as never,
		),
	);

const isEncaja = (ev: EvaluationResult) =>
	ev.verdict === "probable" ||
	(ev.verdict === "posible" &&
		ev.requirements.every((r) => !r.hard || r.status === "T") &&
		ev.requirements.some((r) => r.hard && r.status === "T"));

describe("ejemplos de portada (R2-EJ)", () => {
	it("cada ejemplo responde todo lo que sus reglas preguntan salvo el demo", () => {
		for (const ex of EXAMPLES) {
			const evs = evalAll(ex.answers);
			// familia-getafe demuestra «falta un dato» a propósito (hijos <3
			// sin señalar): lo demás no puede quedar sin responder
			// U en requisito duro ⇒ el ejemplo no responde una pregunta
			// que sus reglas usan. U en avisos (soft) es honesto: la banda de
			// ingresos puede ser imprecisa a propósito.
			const u = evs.flatMap((e) =>
				e.requirements.filter((r) => r.status === "U" && r.hard),
			);
			if (ex.id !== "familia-getafe") {
				expect(u.map((r) => r.id)).toEqual([]);
			}
		}
	});

	it("los ejemplos cubren ≥2 encaja, ≥1 falta-un-dato y ≥1 recurrente", () => {
		const all = EXAMPLES.flatMap((ex) => evalAll(ex.answers));
		expect(all.filter(isEncaja).length).toBeGreaterThanOrEqual(2);
		expect(
			all.filter(
				(ev) =>
					(ev.verdict === "posible" || ev.verdict === "insuficiente") &&
					ev.requirements.some((r) => r.hard && r.status === "U"),
			).length,
		).toBeGreaterThanOrEqual(1);
		expect(
			all.filter(
				(ev) =>
					ev.deadline.state === "CLOSED_RECURRING" &&
					(ev.verdict === "posible" || ev.verdict === "probable"),
			).length,
		).toBeGreaterThanOrEqual(1);
	});
});
