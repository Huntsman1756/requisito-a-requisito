/**
 * eligibility-mutate.ts — F3-M (phases/F3 «Mutación dirigida», docs/07 §8.4)
 *
 * Para cada RuleSet genera mutantes dirigidos:
 *   - cada umbral numérico de una condición: +1 y −1
 *   - cada `hard` de requirement/document invertido
 *
 * Un mutante SOBREVIVE si ninguna evaluación sobre el dominio exhaustivo
 * (mismo dominio que `runExhaustive`, con recorte por pares si aplica)
 * produce un veredicto distinto al del original. Salida: 0 supervivientes.
 *
 * Uso: npx tsx scripts/eligibility-mutate.ts [--slug X] [--limit N]
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateRuleSet } from "../src/lib/eligibility-engine/evaluate";
import { profileCombos } from "../src/lib/eligibility-engine/exhaustive";
import { pickValidVersions } from "../src/lib/eligibility-engine/versions";
import {
	parametersSchema,
	questionCatalogSchema,
	ruleSetSchema,
	type CitizenProfile,
	type QuestionCatalog,
	type RuleSet,
} from "../src/lib/eligibility-engine/schema";

interface Mutant {
	kind: string;
	describe: string;
	apply: (rs: RuleSet) => void;
}

/** Recorre las condiciones y aplica f a cada hoja {field,op,value...}. */
function mapLeaves(cond: unknown, f: (leaf: Record<string, unknown>) => void): void {
	if (!cond || typeof cond !== "object") return;
	const c = cond as Record<string, unknown>;
	if (Array.isArray(c.all)) {
		for (const x of c.all as unknown[]) mapLeaves(x, f);
		return;
	}
	if (Array.isArray(c.any)) {
		for (const x of c.any as unknown[]) mapLeaves(x, f);
		return;
	}
	if (c.not !== undefined) return void mapLeaves(c.not, f);
	f(c);
}

const clone = (rs: RuleSet): RuleSet => structuredClone(rs);

function signature(rs: RuleSet, fields: string[], combos: { state: string; value?: unknown }[][], catalog: QuestionCatalog, ctx: { parameters: unknown; today: string }): string[] {
	return combos.map((combo) => {
		const answers: CitizenProfile["answers"] = {};
		for (let i = 0; i < fields.length; i++) {
			answers[fields[i]] = combo[i] as CitizenProfile["answers"][string];
		}
		const ev = evaluateRuleSet(
			rs,
			{ catalogVersion: catalog.catalogVersion, answers },
			{ parameters: ctx.parameters as never, catalog, today: ctx.today },
		);
		return (
			ev.verdict +
			"|" +
			ev.requirements.map((r) => r.status).join("") +
			"|" +
			(ev.documents as unknown[]).join("~")
		);
	});
}

function mutantsFor(rs: RuleSet): Mutant[] {
	const out: Mutant[] = [];
	const leafKey = (n: Record<string, unknown>) =>
		`${String(n.field)}|${String(n.op)}|${JSON.stringify(n.value)}|${JSON.stringify(n.param ?? null)}`;

	// Recolecta hojas con su ubicación (índice de requirement/document).
	const seen = new Map<string, { where: string; leaf: Record<string, unknown> }>();
	rs.requirements.forEach((req, ri) => {
		mapLeaves(req.condition, (leaf) => {
			const k = leafKey(leaf);
			if (!seen.has(k)) seen.set(k, { where: `req:${req.id}#${ri}`, leaf });
		});
	});
	rs.application.documents.forEach((doc, di) => {
		mapLeaves(doc.condition, (leaf) => {
			const k = leafKey(leaf);
			if (!seen.has(k)) seen.set(k, { where: `doc:${doc.id}#${di}`, leaf });
		});
	});

	for (const [k, { where, leaf }] of seen) {
		const numeric = (v: unknown) => typeof v === "number" && Number.isFinite(v);
		const endpoints: number[] = [];
		if (numeric(leaf.value)) endpoints.push(leaf.value as number);
		if (Array.isArray(leaf.value)) {
			for (const v of leaf.value) if (numeric(v)) endpoints.push(v as number);
		}
		if (endpoints.length > 0 || typeof leaf.count === "number") {
		for (const delta of [1, -1]) {
			out.push({
				kind: "umbral",
				describe: `${where} ${k} Δ${delta > 0 ? "+1" : "−1"}`,
				apply: (m) => {
					const bump = (v: unknown) => (numeric(v) ? (v as number) + delta : v);
					const applyTo = (cond: unknown) =>
						mapLeaves(cond, (n) => {
							if (leafKey(n) !== k) return;
							if (numeric(n.value)) n.value = bump(n.value);
							if (Array.isArray(n.value)) n.value = (n.value as unknown[]).map(bump);
							// count_where_gte u operadores con campo numérico suelto
							if (numeric(n.count)) n.count = (n.count as number) + delta;
						});
					for (const r of m.requirements) applyTo(r.condition);
					for (const d of m.application.documents) applyTo(d.condition);
				},
			});
		}
		}
		// umbrales de intervalos {min,max} y de count_where
		if (leaf.value && typeof leaf.value === "object" && !Array.isArray(leaf.value)) {
			const iv = leaf.value as { min?: number | null; max?: number | null };
			for (const bound of ["min", "max"] as const) {
				if (numeric(iv[bound])) {
					for (const delta of [1, -1]) {
						out.push({
							kind: "umbral",
							describe: `${where} ${k}.${bound} Δ${delta > 0 ? "+1" : "−1"}`,
							apply: (m) => {
								const applyTo = (cond: unknown) =>
									mapLeaves(cond, (n) => {
										if (leafKey(n) !== k) return;
										const x = n.value as { min?: number | null; max?: number | null };
										if (numeric(x[bound])) x[bound] = (x[bound] as number) + delta;
									});
								for (const r of m.requirements) applyTo(r.condition);
								for (const d of m.application.documents) applyTo(d.condition);
							},
						});
					}
				}
			}
		}
	}

	for (const [i, req] of rs.requirements.entries()) {
		out.push({
			kind: "hard",
			describe: `req:${req.id} hard ${req.hard}→${!req.hard}`,
			apply: (m) => {
				m.requirements[i].hard = !m.requirements[i].hard;
			},
		});
	}
	return out;
}

const arg = (n: string, d?: string) => {
	const i = process.argv.indexOf(`--${n}`);
	return i >= 0 ? process.argv[i + 1] : d;
};

const root = process.cwd();
const rulesDir = join(root, "data", "eligibility", "rules");
const catalog = questionCatalogSchema.parse(
	JSON.parse(readFileSync(join(root, "data", "eligibility", "questions.json"), "utf8")),
);
const parameters = parametersSchema.parse(
	JSON.parse(readFileSync(join(root, "data", "eligibility", "parameters.json"), "utf8")),
);
const today = arg("today") ?? new Date().toISOString().slice(0, 10);
const onlySlug = arg("slug");
const limit = Number(arg("limit", "0")) || Infinity;

const files = readdirSync(rulesDir).filter((f) => f.endsWith(".json")).sort();
const bySlug = new Map<string, RuleSet[]>();
for (const f of files) {
	const rs = ruleSetSchema.parse(
		JSON.parse(readFileSync(join(rulesDir, f), "utf8")),
	);
	const l = bySlug.get(rs.benefitSlug) ?? [];
	l.push(rs);
	bySlug.set(rs.benefitSlug, l);
}

// Mutantes demostrablemente equivalentes en el dominio: el flag `hard` de
// este requisito nunca decide el veredicto porque, en todo perfil donde
// falla, otro requisito duro también falla. Los cubre la aserción
// declarativa de tests/eligibility/hard-flags.test.ts (pin por requisito).
// Añadir aquí una entrada exige documentar el motivo; cualquier otro
// superviviente nuevo hace fallar el arnés.
const EQUIVALENTS = new Map<string, string>([
	[
		"madrid-renta-minima-insercion|req:residencia-permanente-cm hard true→false",
		"hard enmascarado por los requisitos territoriales duros: cuando falla residencia-permanente-cm también falla la residencia en CM; el pin de hard-flags.test.ts lo cubre",
	],
	[
		"madrid-titulo-familia-numerosa|req:caso-general-3-hijos hard false→true",
		"hard enmascarado: cuando el requisito falla, los requisitos duros de la vía general ya fallan; cubierto por hard-flags.test.ts",
	],
]);

let survivors = 0;
let totalMutants = 0;
let unexplained = 0;
for (const [slug, group] of bySlug) {
	if (onlySlug && slug !== onlySlug) continue;
	const { evaluable } = pickValidVersions(group, today);
	for (const rs of evaluable) {
		const mutants = mutantsFor(rs).slice(0, limit);
		if (mutants.length === 0) continue;
		const { fields, combos } = profileCombos(rs, catalog, 30_000, today);
		const ctx = { parameters, today };
		const base = signature(rs, fields, combos, catalog, ctx);
		let alive = 0;
		for (const mut of mutants) {
			const m = clone(rs);
			mut.apply(m);
			const got = signature(m, fields, combos, catalog, ctx);
			const changed = got.some((g, i) => g !== base[i]);
			if (!changed) {
				const key = `${slug}|${mut.describe}`;
				const why = EQUIVALENTS.get(key);
				if (why) {
					console.log(`  equivalente ${slug} :: ${mut.describe} — ${why}`);
				} else {
					alive++;
					survivors++;
					unexplained++;
					console.log(`  SUPERVIVIENTE ${slug} :: ${mut.describe}`);
				}
			}
		}
		totalMutants += mutants.length;
		console.log(
			`${slug}: ${mutants.length} mutantes × ${combos.length} perfiles — ${alive} supervivientes`,
		);
	}
}
console.log(
	`total: ${totalMutants} mutantes, ${survivors} supervivientes sin explicar` +
		(unexplained === 0 ? " (los equivalentes documentados están pinneados)" : ""),
);
process.exit(unexplained === 0 ? 0 : 1);
