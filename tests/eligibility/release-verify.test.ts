/**
 * F10-REL: ensayo de la ruta de publicación estricta (regla 4.12 — las
 * aprobaciones son SIMULADAS en copia; ninguna regla real se toca).
 *
 * Con aprobaciones simuladas: build --strict en scratch ⇒ release:verify
 * verde. Sin aprobaciones: rojo en cada puerta (0 reglas, sin approved,
 * sha distinto).
 */
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildEligibility } from "../../scripts/eligibility-build";
import { verifyRelease } from "../../scripts/release-verify";
import { applySheet, type MuestreoIndice } from "../../scripts/review-apply";

const root = process.cwd();
const indice = JSON.parse(
	readFileSync(join(root, "evidence/muestreo-indice.json"), "utf8"),
) as MuestreoIndice;

function cloneRules() {
	const dir = mkdtempSync(join(tmpdir(), "rel-rules-"));
	cpSync(join(root, "data/eligibility/rules"), dir, { recursive: true });
	return dir;
}

function markTwo(text: string): string {
	let k = 0;
	const out = text
		.split("\n")
		.map((line) => {
			if (k < 2 && /^\|.*☐ OK ☐ KO/.test(line)) {
				k += 1;
				return line.replace("☐ OK ☐ KO", "☑ OK ☐ KO");
			}
			return line;
		})
		.join("\n");
	if (k > 0) return out;
	// lote-1 marca con cabeceras `## <slug> — ☑ OK` (misma forma que qa-strict).
	const all = new Set(indice.hojas.flatMap((h) => h.slugs));
	return text.replace(/^##\s+([a-z0-9][a-z0-9-]*)\b(.*)$/gm, (line, slug, rest) => {
		if (k < 2 && all.has(slug) && !/[☑☒✓]/.test(rest)) {
			k += 1;
			return `## ${slug}${rest} — ☑ OK`;
		}
		return line;
	});
}

function buildStrict(rulesDir: string) {
	const bundleDir = mkdtempSync(join(tmpdir(), "rel-bundle-"));
	buildEligibility({
		rulesDir,
		sourcesDir: join(root, "data/eligibility/sources"),
		catalogDir: join(root, "data/catalog/benefits"),
		parametersPath: join(root, "data/eligibility/parameters.json"),
		registry: JSON.parse(
			readFileSync(join(root, "data/eligibility/sources/registry.json"), "utf8"),
		),
		outDir: bundleDir,
		today: "2026-10-08",
		strictHumanReview: true,
	});
	return bundleDir;
}

/** Simula el layout de out/: bundle, fichas, listado y nivel-1 coherentes. */
function fakeOut(bundleDir: string, extra?: { fichas?: string[] }) {
	const out = mkdtempSync(join(tmpdir(), "rel-out-"));
	const datos = join(out, "datos/elegibilidad");
	mkdirSync(datos, { recursive: true });
	writeFileSync(
		join(datos, "bundle.json"),
		readFileSync(join(bundleDir, "eligibility-bundle.json")),
	);
	const bundle = JSON.parse(
		readFileSync(join(bundleDir, "eligibility-bundle.json"), "utf8"),
	) as { rulesets: { benefitSlug: string }[] };
	const slugs = [
		...new Set(bundle.rulesets.map((r) => r.benefitSlug)),
		...(extra?.fichas ?? []),
	];
	mkdirSync(join(out, "ayudas"), { recursive: true });
	for (const s of slugs) {
		mkdirSync(join(out, "ayudas", s), { recursive: true });
		writeFileSync(join(out, "ayudas", s, "index.html"), `<h1>${s}</h1>`);
	}
	writeFileSync(
		join(out, "ayudas", "index.html"),
		`${slugs.map((s) => `<li class="aid-card"><a href="/ayudas/${s}/">${s}</a></li>`).join("")}`,
	);
	writeFileSync(
		join(datos, "nivel-1.json"),
		JSON.stringify({ items: slugs.map((slug) => ({ slug })) }),
	);
	return out;
}

describe("release-verify (ruta estricta, simulado)", () => {
	it("con aprobaciones simuladas ⇒ verify verde", { timeout: 180_000 }, async () => {
		const rulesDir = cloneRules();
		for (const h of indice.hojas) {
			if (h.vigenteSlugs.length === 0) continue;
			const r = applySheet(join(root, h.sheet), {
				rulesDirs: [rulesDir],
				today: "2026-10-08",
				sheetsDirText: markTwo(readFileSync(join(root, h.sheet), "utf8")),
			});
			expect(r.action, h.sheet).toBe("approved");
		}
		const bundleDir = buildStrict(rulesDir);
		const res = verifyRelease(fakeOut(bundleDir), bundleDir);
		expect(res.errors).toEqual([]);
		expect(res.ok).toBe(true);
		expect(res.rulesets).toBe(52);
		expect(res.programas).toBe(50);
	});

	it("todas las hojas menos una ⇒ strict excluye esa ola y verify verde con el recuento real", {
		timeout: 180_000,
	}, async () => {
		const rulesDir = cloneRules();
		const skip = "muestreo-ola-12d.md";
		let skippedSlugs: string[] = [];
		for (const h of indice.hojas) {
			if (h.sheet.endsWith(skip)) {
				skippedSlugs = h.vigenteSlugs;
				continue;
			}
			if (h.vigenteSlugs.length === 0) continue;
			const r = applySheet(join(root, h.sheet), {
				rulesDirs: [rulesDir],
				today: "2026-10-08",
				sheetsDirText: markTwo(readFileSync(join(root, h.sheet), "utf8")),
			});
			expect(r.action, h.sheet).toBe("approved");
		}
		expect(skippedSlugs.length).toBeGreaterThan(0);
		const bundleDir = buildStrict(rulesDir);
		const bundle = JSON.parse(
			readFileSync(join(bundleDir, "eligibility-bundle.json"), "utf8"),
		) as { rulesets: { benefitSlug: string }[] };
		const slugs = new Set(bundle.rulesets.map((r) => r.benefitSlug));
		for (const s of skippedSlugs) expect(slugs.has(s)).toBe(false);
		const res = verifyRelease(fakeOut(bundleDir), bundleDir);
		expect(res.errors).toEqual([]);
		expect(res.ok).toBe(true);
		// Las cifras dicen el número real, no 52/50.
		expect(res.rulesets).toBe(52 - skippedSlugs.length);
		expect(res.programas).toBe(50 - new Set(skippedSlugs).size);
	});

	it("ficha de una regla no aprobada ⇒ verify rojo (fuente única)", {
		timeout: 180_000,
	}, async () => {
		const rulesDir = cloneRules();
		for (const h of indice.hojas) {
			if (h.vigenteSlugs.length === 0) continue;
			const r = applySheet(join(root, h.sheet), {
				rulesDirs: [rulesDir],
				today: "2026-10-08",
				sheetsDirText: markTwo(readFileSync(join(root, h.sheet), "utf8")),
			});
			expect(r.action, h.sheet).toBe("approved");
		}
		const bundleDir = buildStrict(rulesDir);
		// Una ficha extra de un slug que no está en el bundle ⇒ agujero G12.
		const res = verifyRelease(
			fakeOut(bundleDir, { fichas: ["regla-no-aprobada"] }),
			bundleDir,
		);
		expect(res.ok).toBe(false);
		expect(res.errors.join(" ")).toMatch(/regla-no-aprobada/);
	});

	it("sin aprobaciones ⇒ verify rojo en todas las puertas", { timeout: 180_000 }, async () => {
		const rulesDir = cloneRules(); // sin aplicar ninguna hoja
		const bundleDir = buildStrict(rulesDir);
		const res = verifyRelease(fakeOut(bundleDir), bundleDir);
		expect(res.ok).toBe(false);
		expect(res.rulesets).toBe(0);
		expect(res.errors.join(" ")).toMatch(/0|20|approved/);
	});

	it("bundle pisado por un build normal ⇒ sha256 distinto y sin approved", {
		timeout: 180_000,
	}, async () => {
		const rulesDir = cloneRules();
		const normalDir = mkdtempSync(join(tmpdir(), "rel-normal-"));
		await buildEligibility({
			rulesDir,
			sourcesDir: join(root, "data/eligibility/sources"),
			catalogDir: join(root, "data/catalog/benefits"),
			parametersPath: join(root, "data/eligibility/parameters.json"),
			registry: JSON.parse(
				readFileSync(
					join(root, "data/eligibility/sources/registry.json"),
					"utf8",
				),
			),
			outDir: normalDir,
			today: "2026-10-08",
			strictHumanReview: false, // build NORMAL: incluye pending
		});
		// El "strict" esperado vive en su propio dir; el out lleva el normal
		// pisado ⇒ sha256 distinto Y reglas sin approved.
		const strictDir = buildStrict(rulesDir);
		const res = verifyRelease(fakeOut(normalDir), strictDir);
		expect(res.ok).toBe(false);
		expect(res.shaOk).toBe(false);
		expect(res.noAprobadas.length).toBeGreaterThan(0);
	});
});
