import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parametersSchema } from "../../src/lib/eligibility-engine/schema";
import { normalizeText } from "../../src/lib/eligibility-engine/text-normalize";

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const SRC = join(__dirname, "../../data/eligibility/sources");

const params = parametersSchema.parse(
	JSON.parse(readFileSync(join(__dirname, "../../data/eligibility/parameters.json"), "utf8")),
);

describe("parameters.json (F1-6)", () => {
	it("contiene IPREM y SMI vigentes", () => {
		const ids = params.parameters.map((p) => p.id);
		expect(ids).toContain("IPREM_ANUAL_14P");
		expect(ids).toContain("SMI_MENSUAL");
	});

	it("toda cita aparece literalmente en el snapshot normalizado y el sha cuadra", () => {
		for (const p of params.parameters) {
			for (const per of p.periods) {
				const txt = readFileSync(join(SRC, `${per.citation.sourceId}.txt`), "utf8");
				const norm = normalizeText(per.citation.excerpt);
				expect(txt, `${p.id} ${per.from}`).toContain(norm);
				expect(sha(norm)).toBe(per.citation.excerptSha256);
			}
		}
	});

	it("hay vigencia que cubre la fecha de referencia 2026-10-08", () => {
		const today = "2026-10-08";
		for (const p of params.parameters) {
			const ok = p.periods.some(
				(per) => per.from <= today && (per.to === undefined || per.to >= today),
			);
			expect(ok, p.id).toBe(true);
		}
	});
});
