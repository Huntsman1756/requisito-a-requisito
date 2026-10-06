/**
 * review-panel/mutants.ts — conjunto de calibración determinista (docs/17 §6).
 *
 * Genera, a partir de las reglas verificadas en data/eligibility/rules:
 * - MUTANTES: un defecto inyectado por ítem (umbral ±1 y ±10 %, lt↔lte,
 *   hard↔soft, condición invertida, campo cambiado, IPREM 12↔14 pagas y
 *   requisito eliminado en el ítem de completitud).
 * - CONTROLES: los ítems originales sin tocar (misma base que cada mutante).
 * - HISTÓRICOS: defectos reales ya encontrados (Bono Cultural por edad, Renfe
 *   citada por rango 3, falsos negativos de la RMI, Tarjeta Azul con 12P).
 *
 * Cada caso declara `expected` y `fpClass` (true ⇒ mutante de falso positivo:
 * el criterio exige 100 % de detección en ese subconjunto).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Condition, ConditionLeaf, RuleSet } from "../../src/lib/eligibility-engine/schema";
import { conditionPlain, extractItems, type PanelItem } from "./items";

export type CaseKind = "mutant" | "control" | "historical";

export interface CalibCase {
	caseId: string;
	ruleSlug: string;
	kind: CaseKind;
	/** tipo de defecto inyectado (solo mutantes e históricos) */
	mutantType?: string;
	/** true ⇒ el defecto incluiría a quien no cumple (falso positivo) */
	fpClass: boolean;
	expected: "pass" | "escalate";
	item: PanelItem;
	note: string;
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

function leafs(c: Condition): ConditionLeaf[] {
	if ("all" in c) return c.all.flatMap(leafs);
	if ("any" in c) return c.any.flatMap(leafs);
	if ("not" in c) return leafs(c.not);
	return [c as ConditionLeaf];
}

const NUMERIC_OPS = new Set(["lt", "lte", "gt", "gte", "eq"]);
const BOUNDARY_SWAP: Record<string, { to: string; fp: boolean }> = {
	lt: { to: "lte", fp: true }, // incluir el límite relaja la condición
	gt: { to: "gte", fp: true },
	lte: { to: "lt", fp: false },
	gte: { to: "gt", fp: false },
};

const FIELD_ROTATION = [
	"age",
	"incomeAnnual",
	"residenceMonths",
	"dependents",
	"disability",
	"familyType",
	"employmentStatus",
	"housingStatus",
	"studentStatus",
	"dependency",
	"birthYear",
	"territory",
];

function nextField(field: string): string {
	const i = FIELD_ROTATION.indexOf(field);
	return FIELD_ROTATION[(i < 0 ? 0 : i + 1) % FIELD_ROTATION.length];
}

function numericLeaf(ls: ConditionLeaf[]): ConditionLeaf | undefined {
	return ls.find(
		(l) =>
			(typeof l.value === "number" && NUMERIC_OPS.has(l.op)) ||
			(l.op === "between" &&
				Array.isArray(l.value) &&
				l.value.every((v) => typeof v === "number")),
	);
}

interface RuleCtx {
	rs: RuleSet;
	items: PanelItem[];
	readSource: (id: string) => string;
}

function loadRules(root: string): RuleCtx[] {
	const rulesDir = join(root, "data/eligibility/rules");
	const srcDir = join(root, "data/eligibility/sources");
	const out: RuleCtx[] = [];
	for (const f of readdirSync(rulesDir).filter((x) => x.endsWith(".json")).sort()) {
		const rs = JSON.parse(readFileSync(join(rulesDir, f), "utf8")) as RuleSet;
		const cache = new Map<string, string>();
		const readSource = (id: string) => {
			if (!cache.has(id)) {
				try {
					cache.set(id, readFileSync(join(srcDir, `${id}.txt`), "utf8"));
				} catch {
					cache.set(id, "");
				}
			}
			return cache.get(id)!;
		};
		out.push({ rs, items: extractItems(rs, readSource), readSource });
	}
	return out;
}

function requirementOf(rs: RuleSet, item: PanelItem) {
	const id = item.itemId.replace(/^req:/, "");
	return rs.requirements.find((r) => r.id === id);
}

/** Mutante de un ítem de requisito: clona el ítem y aplica la mutación. */
function mutate(
	item: PanelItem,
	type: string,
	fp: boolean,
	note: string,
	change: (req: { hard?: boolean; condition?: Condition }, item: PanelItem) => void,
): CalibCase | null {
	const it = clone(item);
	it.itemId = `${item.itemId}#${type}`;
	const proxy = { hard: it.hard, condition: it.condition };
	change(proxy, it);
	it.hard = proxy.hard;
	it.condition = proxy.condition;
	if (it.condition) it.conditionPlain = conditionPlain(it.condition);
	return {
		caseId: `${item.ruleSlug}/${it.itemId}`,
		ruleSlug: item.ruleSlug,
		kind: "mutant",
		mutantType: type,
		fpClass: fp,
		expected: "escalate",
		item: it,
		note,
	};
}

function control(item: PanelItem): CalibCase {
	const it = clone(item);
	it.itemId = `${item.itemId}#control`;
	return {
		caseId: `${item.ruleSlug}/${it.itemId}`,
		ruleSlug: item.ruleSlug,
		kind: "control",
		fpClass: false,
		expected: "pass",
		item: it,
		note: "ítem original verificado, sin mutar",
	};
}

function mutantsForRule({ rs, items }: RuleCtx): { cases: CalibCase[]; controls: PanelItem[] } {
	const cases: CalibCase[] = [];
	const controls = new Map<string, PanelItem>();
	const reqItems = items.filter((i) => i.kind === "requirement");
	const comp = items.find((i) => i.kind === "completeness");
	const add = (c: CalibCase | null, orig?: PanelItem) => {
		if (!c) return;
		cases.push(c);
		if (orig && !controls.has(orig.itemId)) controls.set(orig.itemId, orig);
	};

	// 1. umbral ±1 (lax) y ±10 % (estricto) sobre el primer leaf numérico
	const numItem = reqItems.find((i) => {
		const r = requirementOf(rs, i);
		return r && numericLeaf(leafs(r.condition));
	});
	if (numItem) {
		const req = requirementOf(rs, numItem)!;
		const leaf = numericLeaf(leafs(req.condition))!;
		const isBetween = leaf.op === "between" && Array.isArray(leaf.value);
		const v = isBetween ? (leaf.value as number[])[1] : (leaf.value as number);
		const vLo = isBetween ? (leaf.value as number[])[0] : v;
		const eqLike = !isBetween && !["lt", "lte", "gt", "gte"].includes(leaf.op);

		add(
			mutate(numItem, "umbral_lax", !eqLike, `umbral relajado (${leaf.op} ${v}→${v + 1})`, (p) => {
				const l = numericLeaf(leafs(p.condition!))!;
				if (l.op === "between" && Array.isArray(l.value)) l.value = [l.value[0], (l.value[1] as number) + 1];
				else if (["lt", "lte"].includes(l.op)) l.value = (l.value as number) + 1;
				else if (["gt", "gte"].includes(l.op)) l.value = (l.value as number) - 1;
				else l.value = (l.value as number) + 1;
			}),
			numItem,
		);
		add(
			mutate(
				numItem,
				"umbral_pct",
				false,
				`umbral endurecido ±10 % (${leaf.op} ${isBetween ? vLo : v}→${
					isBetween || ["gt", "gte"].includes(leaf.op)
						? Math.ceil((isBetween ? vLo : v) * 1.1)
						: Math.floor((isBetween ? vLo : v) * 0.9)
				})`,
				(p) => {
					const l = numericLeaf(leafs(p.condition!))!;
					if (l.op === "between" && Array.isArray(l.value))
						l.value = [Math.ceil((l.value[0] as number) * 1.1), l.value[1]];
					else if (["lt", "lte"].includes(l.op)) l.value = Math.floor((l.value as number) * 0.9);
					else if (["gt", "gte"].includes(l.op)) l.value = Math.ceil((l.value as number) * 1.1);
					else l.value = Math.round((l.value as number) * 1.1);
				},
			),
			numItem,
		);
	}

	// 2. lt↔lte en el primer leaf de frontera
	const swapItem = reqItems.find((i) => {
		const r = requirementOf(rs, i);
		return r && leafs(r.condition).some((l) => l.op in BOUNDARY_SWAP);
	});
	if (swapItem) {
		const req = requirementOf(rs, swapItem)!;
		const leaf = leafs(req.condition).find((l) => l.op in BOUNDARY_SWAP)!;
		const swap = BOUNDARY_SWAP[leaf.op];
		add(
			mutate(swapItem, "op_swap", swap.fp, `${leaf.op}→${swap.to} (cambia el límite incluido)`, (p) => {
				const l = leafs(p.condition!).find((x) => x.op in BOUNDARY_SWAP)!;
				l.op = BOUNDARY_SWAP[l.op].to as ConditionLeaf["op"];
			}),
			swapItem,
		);
	}

	// 3. hard→soft del primer requisito excluyente
	const hardItem = reqItems.find((i) => requirementOf(rs, i)?.hard === true);
	if (hardItem) {
		add(
			mutate(hardItem, "hard_soft", true, "requisito excluyente ablandado a soft", (p) => {
				p.hard = false;
			}),
			hardItem,
		);
	}

	// 4. condición invertida del primer requisito
	if (reqItems[0]) {
		add(
			mutate(reqItems[0], "invert", false, "condición envuelta en NOT", (p) => {
				p.condition = { not: clone(p.condition!) };
			}),
			reqItems[0],
		);
	}

	// 5. campo cambiado del primer leaf
	const fieldItem = reqItems.find((i) => {
		const r = requirementOf(rs, i);
		return r && leafs(r.condition).length > 0;
	});
	if (fieldItem) {
		const req = requirementOf(rs, fieldItem)!;
		const leaf = leafs(req.condition)[0];
		add(
			mutate(fieldItem, "field", false, `campo ${leaf.field}→${nextField(leaf.field)}`, (p) => {
				leafs(p.condition!)[0].field = nextField(leaf.field);
			}),
			fieldItem,
		);
	}

	// 6. IPREM 12P↔14P en el primer leaf parametrizado
	const ipremItem = reqItems.find((i) => {
		const r = requirementOf(rs, i);
		return r && leafs(r.condition).some((l) => l.param?.startsWith("IPREM_ANUAL_"));
	});
	if (ipremItem) {
		const req = requirementOf(rs, ipremItem)!;
		const leaf = leafs(req.condition).find((l) => l.param?.startsWith("IPREM_ANUAL_"))!;
		const to = leaf.param === "IPREM_ANUAL_12P" ? "IPREM_ANUAL_14P" : "IPREM_ANUAL_12P";
		// 12P→14P sube el tope (lax ⇒ falso positivo); 14P→12P lo baja (falso negativo)
		add(
			mutate(ipremItem, "iprem", leaf.param === "IPREM_ANUAL_12P", `${leaf.param}→${to}`, (p) => {
				leafs(p.condition!).find((l) => l.param?.startsWith("IPREM_ANUAL_"))!.param = to;
			}),
			ipremItem,
		);
	}

	// 7. requisito eliminado (ítem de completitud sin un requisito del contexto)
	if (comp?.context) {
		const victim = rs.requirements.find(
			(r) => r.citation && comp.context!.includes(r.citation.excerpt),
		);
		if (victim) {
			const it = clone(comp);
			it.itemId = "completeness#removed_req";
			it.modelledIds = (it.modelledIds ?? []).filter((m) => !m.startsWith(`${victim.id} (`));
			cases.push({
				caseId: `${comp.ruleSlug}/${it.itemId}`,
				ruleSlug: comp.ruleSlug,
				kind: "mutant",
				mutantType: "removed_req",
				fpClass: true,
				expected: "escalate",
				item: it,
				note: `requisito «${victim.id}» eliminado de la lista modelada`,
			});
			if (!controls.has(comp.itemId)) controls.set(comp.itemId, comp);
		}
	}

	return { cases, controls: [...controls.values()] };
}

/** Casos históricos: defectos reales ya encontrados y corregidos (docs/17 §6.1). */
function historical(ctxs: RuleCtx[]): CalibCase[] {
	const bySlug = new Map(ctxs.map((c) => [c.rs.benefitSlug, c]));
	const out: CalibCase[] = [];
	const hist = (
		slug: string,
		itemId: string,
		type: string,
		fp: boolean,
		note: string,
		build: (ctx: RuleCtx) => PanelItem | null,
	) => {
		const ctx = bySlug.get(slug);
		if (!ctx) return;
		const item = build(ctx);
		if (!item) return;
		out.push({
			caseId: `historical/${slug}/${itemId}`,
			ruleSlug: slug,
			kind: "historical",
			mutantType: type,
			fpClass: fp,
			expected: "escalate",
			item,
			note,
		});
	};

	// Bono Cultural modelado por edad en lugar de año de nacimiento
	hist(
		"bono-cultural-joven",
		"req:nacido-en-2008#edad",
		"hist_bono_edad",
		false,
		"histórico: «cumplir 18 en 2026» modelado como edad=18 (quien nace a finales de 2008 tiene 17 al solicitar ⇒ falso negativo)",
		(ctx) => {
			const orig = ctx.items.find((i) => i.itemId === "req:nacido-en-2008");
			if (!orig) return null;
			const it = clone(orig);
			it.itemId = "req:nacido-en-2008#edad";
			it.condition = { field: "age", op: "eq", value: 18 };
			it.conditionPlain = conditionPlain(it.condition);
			return it;
		},
	);

	// Requisito citado por fuente de rango 3 (Renfe) en lugar del BOE:
	// el extracto de Renfe no establece el requisito (presentar el título).
	hist(
		"descuento-transporte-familia-numerosa",
		"req:titulo-familia-numerosa#rango3",
		"hist_renfe_rango3",
		false,
		"histórico: requisito citado con la web de Renfe (rango 3), cuyo texto no establece la obligación de presentar el título",
		(ctx) => {
			const orig = ctx.items.find((i) => i.itemId === "req:titulo-familia-numerosa");
			const text = ctx.readSource("renfe-familia-numerosa");
			if (!orig || !text) return null;
			const excerpt = "Si eres miembro de Familia Numerosa, tienes derecho a viajar con importantes descuentos";
			const i = text.indexOf(excerpt);
			if (i < 0) return null;
			const it = clone(orig);
			it.itemId = "req:titulo-familia-numerosa#rango3";
			it.sourceId = "renfe-familia-numerosa";
			it.locator = "web Renfe (rango 3)";
			it.excerpt = excerpt;
			it.context = text.slice(Math.max(0, i - 600), Math.min(text.length, i + excerpt.length + 600));
			return it;
		},
	);

	// RMI: residencia exigida en el municipio de Madrid en lugar de la CM
	hist(
		"madrid-renta-minima-insercion",
		"req:residencia-permanente-cm#municipio",
		"hist_rmi_municipio",
		false,
		"histórico: la RMI exige residencia en la Comunidad, no en el municipio de Madrid (falso negativo para el resto de municipios)",
		(ctx) => {
			const orig = ctx.items.find((i) => i.itemId === "req:residencia-permanente-cm");
			if (!orig) return null;
			const it = clone(orig);
			it.itemId = "req:residencia-permanente-cm#municipio";
			it.condition = { field: "territory", op: "within_territory", value: { municipality: "28079" } };
			it.conditionPlain = conditionPlain(it.condition);
			return it;
		},
	);

	// RMI: omisión de la excepción de menores emancipados en completitud
	hist(
		"madrid-renta-minima-insercion",
		"completeness#menores",
		"hist_rmi_menores",
		false,
		"histórico: mayoría de edad modelada como excluyente sin la excepción de menores emancipados o con beneficio de tutela",
		(ctx) => {
			const orig = ctx.items.find((i) => i.itemId === "completeness");
			if (!orig?.context) return null;
			const it = clone(orig);
			it.itemId = "completeness#menores";
			it.modelledIds = [
				...(it.modelledIds ?? []).filter((m) => !m.startsWith("edad-25-65 (")),
				"mayoria-edad (hard): Ser mayor de edad",
			];
			it.uncoveredIds = (it.uncoveredIds ?? []).filter((u) => !u.startsWith("menores-emancipados"));
			return it;
		},
	);

	// Tarjeta Azul: IPREM de 12 pagas donde la tabla oficial usa 14
	hist(
		"ayto-tarjeta-azul-discapacidad",
		"req:renta-max-3-iprem#12p",
		"hist_azul_12p",
		false,
		"histórico: tope computado con IPREM_ANUAL_12P cuando la tabla oficial usa 14 pagas (25.200 € ⇒ 21.600 €, falso negativo)",
		(ctx) => {
			const orig = ctx.items.find((i) => i.itemId === "req:renta-max-3-iprem");
			if (!orig) return null;
			const it = clone(orig);
			it.itemId = "req:renta-max-3-iprem#12p";
			const cond = clone(it.condition!) as ConditionLeaf;
			cond.param = "IPREM_ANUAL_12P";
			it.condition = cond;
			it.conditionPlain = conditionPlain(cond);
			return it;
		},
	);

	return out;
}

/** Conjunto completo de calibración, determinista. */
export function buildCalibrationSet(root: string): CalibCase[] {
	const ctxs = loadRules(root);
	const out: CalibCase[] = [];
	for (const ctx of ctxs) {
		const { cases, controls } = mutantsForRule(ctx);
		out.push(...cases);
		out.push(...controls.map(control));
	}
	out.push(...historical(ctxs));
	return out;
}
