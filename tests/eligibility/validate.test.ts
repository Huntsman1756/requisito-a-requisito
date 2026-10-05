import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
	type ValidateOptions,
	validateEligibility,
} from "../../scripts/eligibility-validate";

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const EXCERPT = "Los solicitantes deberán residir en la Comunidad de Madrid";
const TODAY = "2026-10-08";

function baseRuleset(): Record<string, unknown> {
	return {
		benefitSlug: "test-ayuda",
		rulesVersion: 1,
		verifiedAt: "2026-10-05",
		humanReview: { status: "approved", by: "daniel", at: "2026-10-06" },
		referenceDate: "application",
		sources: [
			{
				id: "bocm-conv",
				rank: 1,
				documentType: "call",
				url: "https://www.bocm.es/conv.PDF",
			},
		],
		requirements: [
			{
				id: "residencia",
				hard: true,
				label: "Residir en la Comunidad de Madrid",
				citation: {
					sourceId: "bocm-conv",
					locator: "Art. 3",
					excerpt: EXCERPT,
					excerptSha256: sha(EXCERPT),
				},
				condition: { field: "territory", op: "within_territory", value: { ccaa: "13" } },
			},
		],
		uncoveredRequirements: [],
		application: {
			window: {
				rolling: true,
				citation: {
					sourceId: "bocm-conv",
					locator: "Art. 9",
					excerpt: EXCERPT,
					excerptSha256: sha(EXCERPT),
				},
			},
			channel: {
				managingBody: "Comunidad de Madrid",
				url: "https://sede.comunidad.madrid/x",
				online: true,
				citation: {
					sourceId: "bocm-conv",
					locator: "Art. 9",
					excerpt: EXCERPT,
					excerptSha256: sha(EXCERPT),
				},
			},
			documents: [],
		},
		amount: null,
	};
}

function makeEnv(mutate?: (rs: Record<string, unknown>) => void) {
	const root = mkdtempSync(join(tmpdir(), "val-"));
	const rulesDir = join(root, "rules");
	const sourcesDir = join(root, "sources");
	const catalogDir = join(root, "benefits");
	for (const d of [rulesDir, sourcesDir, catalogDir]) mkdirSync(d, { recursive: true });

	writeFileSync(
		join(sourcesDir, "bocm-conv.json"),
		JSON.stringify({
			id: "bocm-conv",
			url: "https://www.bocm.es/conv.PDF",
			fetchedAt: "2026-10-01T00:00:00.000Z",
			sha256: sha("bytes"),
			textSha256: "x".repeat(64),
			contentType: "application/pdf",
			rank: 1,
		}),
	);
	writeFileSync(
		join(sourcesDir, "bocm-conv.txt"),
		`Título de la convocatoria. ${EXCERPT}. Otro texto.`,
	);
	writeFileSync(join(catalogDir, "test-ayuda.json"), "{}");
	writeFileSync(
		join(root, "parameters.json"),
		JSON.stringify({
			parameters: [
				{
					id: "IPREM_ANUAL_14P",
					label: "IPREM",
					unit: "EUR_YEAR",
					periods: [{ from: "2026-01-01", value: 8990, citation: { sourceId: "bocm-conv", locator: "Art. 1", excerpt: EXCERPT, excerptSha256: sha(EXCERPT) } }],
				},
			],
		}),
	);

	const rs = baseRuleset();
	mutate?.(rs);
	writeFileSync(join(rulesDir, "test-ayuda.json"), JSON.stringify(rs));

	const registry = {
		domains: [
			{ host: "www.bocm.es", maxRank: 1 as const, label: "BOCM" },
			{ host: "sede.comunidad.madrid", maxRank: 3 as const, label: "Sede CM" },
		],
	};
	const opts: ValidateOptions = {
		rulesDir,
		sourcesDir,
		catalogDir,
		parametersPath: join(root, "parameters.json"),
		registry,
		today: TODAY,
		strictHumanReview: true,
	};
	return { root, opts };
}

const codes = (r: { errors: { code: string }[] }) => r.errors.map((e) => e.code);

describe("eligibility-validate gates", () => {
	const roots: string[] = [];
	afterAll(() => {
		for (const r of roots) rmSync(r, { recursive: true, force: true });
	});
	function run(mutate?: (rs: Record<string, unknown>) => void) {
		const { root, opts } = makeEnv(mutate);
		roots.push(root);
		return validateEligibility(opts);
	}

	it("positivo: un RuleSet completo pasa todos los gates", () => {
		const r = run();
		expect(r.errors).toEqual([]);
		expect(r.rulesets.map((x) => x.benefitSlug)).toEqual(["test-ayuda"]);
	});

	it("G1: schema inválido → ELIG_G1", () => {
		const r = run((rs) => {
			rs.benefitSlug = "SIN-GUION-INVALIDO!";
		});
		expect(codes(r)).toContain("ELIG_G1_SCHEMA");
	});

	it("G2: slug sin ficha en el catálogo y sin standalone → ELIG_G2", () => {
		const r = run((rs) => {
			rs.benefitSlug = "no-existe-en-catalogo";
		});
		expect(codes(r)).toContain("ELIG_G2_NO_CATALOG_ENTRY");
	});

	it("G2: standalone sin fuente rango 1 → ELIG_G2", () => {
		const r = run((rs) => {
			rs.benefitSlug = "no-existe-en-catalogo";
			rs.standalone = true;
			(rs.sources as { rank: number }[])[0].rank = 3;
		});
		expect(codes(r)).toContain("ELIG_G2_NO_CATALOG_ENTRY");
	});

	it("G2: standalone con fuente rango 1 → pasa", () => {
		const r = run((rs) => {
			rs.benefitSlug = "no-existe-en-catalogo";
			rs.standalone = true;
		});
		expect(r.errors).toEqual([]);
	});

	it("G3: citation.sourceId inexistente → ELIG_G3", () => {
		const r = run((rs) => {
			(rs.requirements as { citation: { sourceId: string } }[])[0].citation.sourceId =
				"no-existe";
		});
		expect(codes(r)).toContain("ELIG_G3_UNKNOWN_SOURCE");
	});

	it("G3: dominio de la fuente fuera del registro → ELIG_G3", () => {
		const r = run((rs) => {
			(rs.sources as { url: string }[])[0].url = "https://es.wikipedia.org/x";
		});
		expect(codes(r)).toContain("ELIG_G3_DOMAIN");
	});

	it("G3: rango declarado mejor que el techo del dominio → ELIG_G3", () => {
		const r = run((rs) => {
			(rs.sources as { url: string; rank: number }[])[0].url =
				"https://sede.comunidad.madrid/x";
		});
		expect(codes(r)).toContain("ELIG_G3_RANK");
	});

	it("G4: extracto no presente en el .txt → ELIG_G4", () => {
		const r = run((rs) => {
			(rs.requirements as { citation: { excerpt: string; excerptSha256: string } }[])[0].citation.excerpt =
				"extracto que no está en el texto";
			(rs.requirements as { citation: { excerpt: string; excerptSha256: string } }[])[0].citation.excerptSha256 =
				sha("extracto que no está en el texto");
		});
		expect(codes(r)).toContain("ELIG_G4_EXCERPT_NOT_FOUND");
	});

	it("G4: excerptSha256 no cuadra → ELIG_G4", () => {
		const r = run((rs) => {
			(rs.requirements as { citation: { excerptSha256: string } }[])[0].citation.excerptSha256 =
				"0".repeat(64);
		});
		expect(codes(r)).toContain("ELIG_G4_EXCERPT_SHA");
	});

	it("G5: sin campo uncoveredRequirements → ELIG_G5", () => {
		const r = run((rs) => {
			delete rs.uncoveredRequirements;
		});
		expect(codes(r)).toContain("ELIG_G5_UNCOVERED_MISSING");
	});

	it("G6: verifiedAt con más de 90 días → ELIG_G6", () => {
		const r = run((rs) => {
			rs.verifiedAt = "2026-01-01";
		});
		expect(codes(r)).toContain("ELIG_G6_STALE");
	});

	it("G7: ventana en conflicto → ELIG_G7", () => {
		const r = run((rs) => {
			(rs.application as { window: { conflict: boolean } }).window.conflict = true;
		});
		expect(codes(r)).toContain("ELIG_G7_CONFLICT");
	});

	it("G8: referenceDateCitation presente pero referenceDate = application → ELIG_G8", () => {
		const r = run((rs) => {
			rs.referenceDateCitation = {
				sourceId: "bocm-conv",
				locator: "Art. 9",
				excerpt: EXCERPT,
				excerptSha256: sha(EXCERPT),
			};
		});
		expect(codes(r)).toContain("ELIG_G8_REFERENCE_DATE");
	});

	it("G9: parámetro inexistente → ELIG_G9", () => {
		const r = run((rs) => {
			rs.parametersUsed = ["NO_EXISTE"];
		});
		expect(codes(r)).toContain("ELIG_G9_PARAM");
	});

	it("G10: humanReview pending en build estricto → ELIG_G10", () => {
		const r = run((rs) => {
			rs.humanReview = { status: "pending" };
		});
		expect(codes(r)).toContain("ELIG_G10_HUMAN_REVIEW");
	});

	it("G10 en desarrollo: pending solo avisa", () => {
		const { root, opts } = makeEnv((rs) => {
			rs.humanReview = { status: "pending" };
		});
		roots.push(root);
		const r = validateEligibility({ ...opts, strictHumanReview: false });
		expect(r.errors).toEqual([]);
		expect(r.warnings.map((w) => w.code)).toContain("ELIG_G10_HUMAN_REVIEW");
	});
});
