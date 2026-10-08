/**
 * F10-REV-1: `npm run review:apply -- <hoja.md>` — semántica de aprobación.
 *
 * La única vía mecánica que puede poner humanReview=approved; cada caso del
 * encargo queda fijado: hoja vacía, un KO, ≥2 OK, idempotencia, regla ajena.
 */

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { applySheet, parseMarks } from "../../scripts/review-apply";

const roots: string[] = [];
afterAll(() => {
	for (const r of roots) rmSync(r, { recursive: true, force: true });
});

function rs(slug: string, version = 1) {
	return {
		benefitSlug: slug,
		rulesVersion: version,
		humanReview: { status: "pending" },
		requirements: [],
		uncoveredRequirements: [],
		application: { window: { rolling: true } },
		sources: [],
	};
}

interface Env {
	dir: string;
	rulesDir: string;
	sheet: (name: string, text: string) => string;
}

function makeEnv(): Env {
	const dir = mkdtempSync(join(tmpdir(), "review-apply-"));
	roots.push(dir);
	const rulesDir = join(dir, "rules");
	return {
		dir,
		rulesDir,
		sheet: (name, text) => {
			const p = join(dir, name);
			writeFileSync(p, text);
			return p;
		},
	};
}

function plantRules(env: Env, slugs: string[]) {
	mkdirSync(env.rulesDir, { recursive: true });
	for (const s of slugs) {
		writeFileSync(
			join(env.rulesDir, `${s}.json`),
			`${JSON.stringify(rs(s), null, "\t")}\n`,
		);
	}
}

const SHEET = (marcas: [string, string][]) => `# Hoja de muestreo — Ola 7

| Ayuda | Verificador | Tu turno |
|---|---|---|
${marcas.map((m) => `| ${m[0]} | OK | ${m[1]} |`).join("\n")}
`;

const VERIF = (slugs: string[]) =>
	`# Verificación ola 7\n\nÁmbito: ${slugs.map((s) => `\`${s}\``).join(", ")}.\n`;

describe("review:apply (F10-REV-1)", () => {
	it("parsea marcas ☑/[x] frente a OK y KO", () => {
		const m = parseMarks(SHEET([
			["ayuda-uno", "☑ OK ☐ KO"],
			["ayuda-dos", "☐ OK ☑ KO"],
			["ayuda-tres", "[x] OK [ ] KO"],
		]));
		expect(m).toEqual([
			{ slug: "ayuda-uno", ok: true, ko: false },
			{ slug: "ayuda-dos", ok: false, ko: true },
			{ slug: "ayuda-tres", ok: true, ko: false },
		]);
	});

	it("hoja vacía ⇒ no hace nada", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos", "ayuda-tres"]);
		env.sheet("verificacion-ola-7.md", VERIF(["ayuda-uno", "ayuda-dos", "ayuda-tres"]));
		const s = env.sheet("muestreo-ola-7.md", SHEET([
			["ayuda-uno", "☐ OK ☐ KO"],
			["ayuda-dos", "☐ OK ☐ KO"],
			["ayuda-tres", "☐ OK ☐ KO"],
		]));
		const r = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		expect(r.action).toBe("nothing");
		expect(r.approved).toEqual([]);
		expect(readFileSync(join(env.rulesDir, "ayuda-uno.json"), "utf8")).toContain('"pending"');
	});

	it("un KO ⇒ no hace nada (la ola se reabre)", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos", "ayuda-tres"]);
		env.sheet("verificacion-ola-7.md", VERIF(["ayuda-uno", "ayuda-dos", "ayuda-tres"]));
		const s = env.sheet("muestreo-ola-7.md", SHEET([
			["ayuda-uno", "☑ OK ☐ KO"],
			["ayuda-dos", "☐ OK ☑ KO"],
			["ayuda-tres", "☐ OK ☐ KO"],
		]));
		const r = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		expect(r.action).toBe("nothing");
		expect(r.koMarks).toBe(1);
		expect(readFileSync(join(env.rulesDir, "ayuda-uno.json"), "utf8")).toContain('"pending"');
	});

	it("un solo OK ⇒ no hace nada (se exigen 2)", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos"]);
		env.sheet("verificacion-ola-7.md", VERIF(["ayuda-uno", "ayuda-dos"]));
		const s = env.sheet("muestreo-ola-7.md", SHEET([
			["ayuda-uno", "☑ OK ☐ KO"],
			["ayuda-dos", "☐ OK ☐ KO"],
		]));
		const r = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		expect(r.action).toBe("nothing");
	});

	it("≥2 OK y 0 KO ⇒ aprueba la ola entera", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos", "ayuda-tres"]);
		env.sheet("verificacion-ola-7.md", VERIF(["ayuda-uno", "ayuda-dos", "ayuda-tres"]));
		const s = env.sheet("muestreo-ola-7.md", SHEET([
			["ayuda-uno", "☑ OK ☐ KO"],
			["ayuda-tres", "☑ OK ☐ KO"],
			["ayuda-dos", "☐ OK ☐ KO"], // sin marcar: entra igual (regla de la ola)
		]));
		const r = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		expect(r.action).toBe("approved");
		expect(r.approved.sort()).toEqual(["ayuda-dos@1", "ayuda-tres@1", "ayuda-uno@1"]);
		for (const slug of ["ayuda-uno", "ayuda-dos", "ayuda-tres"]) {
			const f = JSON.parse(readFileSync(join(env.rulesDir, `${slug}.json`), "utf8"));
			expect(f.humanReview).toEqual({ status: "approved", by: "daniel", at: "2026-10-08" });
		}
	});

	it("idempotente: una segunda corrida no toca nada", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos"]);
		env.sheet("verificacion-ola-7.md", VERIF(["ayuda-uno", "ayuda-dos"]));
		const s = env.sheet("muestreo-ola-7.md", SHEET([
			["ayuda-uno", "☑ OK ☐ KO"],
			["ayuda-dos", "☑ OK ☐ KO"],
		]));
		applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		const r2 = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-09" });
		expect(r2.approved).toEqual([]);
		expect(r2.skipped.length).toBe(2);
		// 'at' conserva la primera fecha de aprobación
		const f = JSON.parse(readFileSync(join(env.rulesDir, "ayuda-uno.json"), "utf8"));
		expect(f.humanReview.at).toBe("2026-10-08");
	});

	it("una marca sobre regla ajena a la ola ⇒ error, sin escrituras", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos", "intrusa"]);
		env.sheet("verificacion-ola-7.md", VERIF(["ayuda-uno", "ayuda-dos"]));
		const s = env.sheet("muestreo-ola-7.md", SHEET([
			["ayuda-uno", "☑ OK ☐ KO"],
			["ayuda-dos", "☑ OK ☐ KO"],
			["intrusa", "☑ OK ☐ KO"],
		]));
		const r = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		expect(r.action).toBe("error");
		expect(r.reason).toContain("intrusa");
		expect(readFileSync(join(env.rulesDir, "ayuda-uno.json"), "utf8")).toContain('"pending"');
	});

	it("la pertenencia a la ola sale de verificacion-ola-N.md del mismo directorio", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos"]);
		// sin verificacion-ola-7.md ⇒ error
		const s = env.sheet("muestreo-ola-7.md", SHEET([["ayuda-uno", "☑ OK ☐ KO"], ["ayuda-dos", "☑ OK ☐ KO"]]));
		const r = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		expect(r.action).toBe("error");
		expect(r.reason).toContain("verificacion-ola-7.md");
	});
});

describe("review:apply — formato lote-N.md", () => {
	const LOTE = (marcas: string[]) => `# Hoja de revisión — lote de reglas F3
${marcas.join("\n")}
`;

	it("lote: marcas en cabecera ## slug — ☑ OK; la ola son las cabeceras", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos", "ayuda-tres"]);
		const s = env.sheet(
			"lote-1.md",
			LOTE(["## ayuda-uno (rulesVersion 1) — ☑ OK", "## ayuda-dos (rulesVersion 1) — ☑ OK", "## ayuda-tres (rulesVersion 1)"]),
		);
		const r = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		expect(r.action).toBe("approved");
		expect(r.wave).toBe("lote-1");
		expect(r.approved.sort()).toEqual(["ayuda-dos@1", "ayuda-tres@1", "ayuda-uno@1"]);
	});

	it("lote: cabecera con KO ⇒ nada", () => {
		const env = makeEnv();
		plantRules(env, ["ayuda-uno", "ayuda-dos"]);
		const s = env.sheet("lote-1.md", LOTE(["## ayuda-uno — ☑ KO el motivo", "## ayuda-dos — ☑ OK"]));
		const r = applySheet(s, { rulesDirs: [env.rulesDir], today: "2026-10-08" });
		expect(r.action).toBe("nothing");
		expect(r.koMarks).toBe(1);
	});
});
