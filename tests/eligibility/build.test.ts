import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { buildEligibility } from "../../scripts/eligibility-build";

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const EXCERPT = "Los solicitantes deberán residir en la Comunidad de Madrid";

function ruleset(slug: string, good: boolean): Record<string, unknown> {
	const rs: Record<string, unknown> = {
		benefitSlug: slug,
		rulesVersion: 1,
		verifiedAt: "2026-10-05",
		humanReview: { status: "approved", by: "daniel", at: "2026-10-06" },
		referenceDate: "application",
		sources: [
			{ id: "bocm-conv", rank: 1, documentType: "call", url: "https://www.bocm.es/conv.PDF" },
		],
		requirements: [
			{
				id: "residencia",
				hard: true,
				label: "Residir en la Comunidad de Madrid",
				citation: { sourceId: "bocm-conv", locator: "Art. 3", excerpt: EXCERPT, excerptSha256: sha(EXCERPT) },
				condition: { field: "territory", op: "within_territory", value: { ccaa: "13" } },
			},
		],
		uncoveredRequirements: [],
		application: {
			window: {
				rolling: true,
				citation: { sourceId: "bocm-conv", locator: "Art. 9", excerpt: EXCERPT, excerptSha256: sha(EXCERPT) },
			},
			channel: {
				managingBody: "Comunidad de Madrid",
				url: "https://sede.comunidad.madrid/x",
				online: true,
				citation: { sourceId: "bocm-conv", locator: "Art. 9", excerpt: EXCERPT, excerptSha256: sha(EXCERPT) },
			},
			documents: [],
		},
		amount: null,
	};
	if (!good) rs.verifiedAt = "2020-01-01"; // G6
	if (good) {
		// G12/ADR-044: sin verification ok + informe existente, fuera del bundle
		rs.verification = {
			status: "ok",
			by: "test",
			at: "2026-10-08",
			report: "evidence/2026-10-05-F3/verificacion-ola-1.md",
		};
	}
	return rs;
}

function makeEnv() {
	const root = mkdtempSync(join(tmpdir(), "build-"));
	const dirs = {
		rulesDir: join(root, "rules"),
		sourcesDir: join(root, "sources"),
		catalogDir: join(root, "benefits"),
		outDir: join(root, "out"),
	};
	for (const d of Object.values(dirs)) mkdirSync(d, { recursive: true });
	writeFileSync(
		join(dirs.sourcesDir, "bocm-conv.json"),
		JSON.stringify({
			id: "bocm-conv",
			url: "https://www.bocm.es/conv.PDF",
			fetchedAt: "2026-10-01T00:00:00.000Z",
			sha256: sha("bytes"),
			textSha256: sha("texto"),
			contentType: "application/pdf",
			rank: 1,
		}),
	);
	writeFileSync(join(dirs.sourcesDir, "bocm-conv.txt"), `X. ${EXCERPT}. Y.`);
	writeFileSync(join(dirs.catalogDir, "test-ok.json"), "{}");
	writeFileSync(join(dirs.catalogDir, "test-mal.json"), "{}");
	writeFileSync(join(dirs.rulesDir, "test-ok.json"), JSON.stringify(ruleset("test-ok", true)));
	writeFileSync(join(dirs.rulesDir, "test-mal.json"), JSON.stringify(ruleset("test-mal", false)));
	writeFileSync(join(root, "parameters.json"), JSON.stringify({ parameters: [] }));
	return {
		root,
		opts: {
			...dirs,
			parametersPath: join(root, "parameters.json"),
			registry: {
				domains: [
					{ host: "www.bocm.es", maxRank: 1 as const, label: "BOCM" },
					{ host: "sede.comunidad.madrid", maxRank: 3 as const, label: "Sede" },
				],
			},
			today: "2026-10-08",
			strictHumanReview: true,
		},
	};
}

const roots: string[] = [];
afterAll(() => {
	for (const r of roots) rmSync(r, { recursive: true, force: true });
});

describe("eligibility-build", () => {
	it("incluye las que pasan, excluye las que no, con motivo y digest", () => {
		const { root, opts } = makeEnv();
		roots.push(root);
		const r = buildEligibility(opts);
		expect(r.ok).toBe(false); // hay errores (test-mal) pero el bundle se genera igual
		const bundle = JSON.parse(readFileSync(join(opts.outDir, "eligibility-bundle.json"), "utf8"));
		expect(bundle.rulesets.map((x: { benefitSlug: string }) => x.benefitSlug)).toEqual(["test-ok"]);
		const manifest = JSON.parse(readFileSync(join(opts.outDir, "manifest.json"), "utf8"));
		expect(manifest.bundleDigest).toMatch(/^[a-f0-9]{64}$/);
		const report = JSON.parse(readFileSync(join(opts.outDir, "eligibility-report.json"), "utf8"));
		expect(report.included).toEqual(["test-ok"]);
		expect(report.excluded[0].slug).toBe("test-mal");
		expect(report.excluded[0].codes).toContain("ELIG_G6_STALE");
	});

	it("G12: sin verification ok (o informe inexistente) queda fuera del bundle", () => {
		const { root, opts } = makeEnv();
		roots.push(root);
		const rs = ruleset("test-sin-verif", true);
		delete (rs as Record<string, unknown>).verification;
		writeFileSync(join(opts.rulesDir, "test-sin-verif.json"), JSON.stringify(rs));
		writeFileSync(join(opts.catalogDir, "test-sin-verif.json"), "{}");
		buildEligibility(opts);
		const report = JSON.parse(readFileSync(join(opts.outDir, "eligibility-report.json"), "utf8"));
		expect(report.included).not.toContain("test-sin-verif");
		expect(
			report.excluded.find((x: { slug: string }) => x.slug === "test-sin-verif")
				?.codes,
		).toContain("ELIG_G12_NO_VERIFICATION");
	});

	it("digest estable: dos builds con los mismos datos dan el mismo digest", () => {
		const a = makeEnv();
		const b = makeEnv();
		roots.push(a.root, b.root);
		const ra = buildEligibility(a.opts);
		const rb = buildEligibility(b.opts);
		const ma = JSON.parse(readFileSync(join(a.opts.outDir, "manifest.json"), "utf8"));
		const mb = JSON.parse(readFileSync(join(b.opts.outDir, "manifest.json"), "utf8"));
		expect(ma.bundleDigest).toBe(mb.bundleDigest);
		expect(ra.ok).toBe(rb.ok);
	});
});
