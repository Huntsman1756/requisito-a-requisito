/**
 * used-fields.ts — campos que usan las reglas de un bundle.
 * El asistente solo pregunta lo que alguna regla consulta.
 */

import type { Condition, RuleSet } from "./eligibility-engine/schema";

function fieldsOf(c: Condition, out: Set<string>): void {
	if ("all" in c) for (const x of c.all) fieldsOf(x, out);
	else if ("any" in c) for (const x of c.any) fieldsOf(x, out);
	else if ("not" in c) fieldsOf(c.not, out);
	else {
		out.add(c.field);
		if (c.where) fieldsOf(c.where, out);
	}
}

export function usedFields(rulesets: RuleSet[]): Set<string> {
	const out = new Set<string>();
	for (const rs of rulesets) {
		for (const r of rs.requirements) fieldsOf(r.condition, out);
		for (const d of rs.application.documents)
			if (d.condition) fieldsOf(d.condition, out);
	}
	return out;
}
