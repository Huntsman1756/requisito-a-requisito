import { execFileSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { importDonorCatalog } from "../../scripts/import-donor-catalog";

const tmp = mkdtempSync(join(tmpdir(), "donor-"));
const donor = join(tmp, "la-ayuda");
const out = join(tmp, "catalog");

const FICHAS: Record<string, string> = {
	"madrid-ayuda-buena.md": `---
title: 'Madrid: ayuda de ejemplo revisada'
category: familia
type: child_support
scopeLevel: regional
scopeRegion: madrid
status: active
reviewStatus: revisada
applicationStatus: open
managingBody: 'Comunidad de Madrid'
officialSourceUrl: 'https://www.bocm.es/x'
lastReviewedAt: '2026-09-01'
---
Cuerpo.
`,
	"madrid-deduccion.md": `---
title: 'Madrid: deducción fiscal (excluida)'
category: vivienda
type: tax_deduction
scopeLevel: regional
scopeRegion: madrid
status: active
reviewStatus: revisada
---
`,
	"estatal-beca.md": `---
title: 'Beca estatal de ejemplo'
category: educacion
type: scholarship
scopeLevel: state
scopeRegion: null
status: active
reviewStatus: revisada
applicationStatus: rolling
managingBody: 'Ministerio'
officialSourceUrl: 'https://www.boe.es/x'
---
`,
	"estatal-restringida.md": `---
title: 'Estatal solo para otra CCAA (excluida)'
category: educacion
type: scholarship
scopeLevel: state
status: active
reviewStatus: revisada
eligibilityFactors:
  residencyRegion:
    - canarias
---
`,
	"madrid-borrador.md": `---
title: 'Madrid: borrador BOCM (pista)'
category: familia
type: aid_or_benefit
scopeLevel: regional
scopeRegion: madrid
status: draft
reviewStatus: pendiente
---
`,
	"andalucia-ok.md": `---
title: 'Andalucía: fuera de ámbito'
category: familia
type: child_support
scopeLevel: regional
scopeRegion: andalucia
status: active
reviewStatus: revisada
---
`,
};

let commit = "";

describe("importDonorCatalog", () => {
	it("importa Madrid+estatales revisadas, excluye fiscales/fuera de ámbito y separa pistas; determinista", { timeout: 30000 }, () => {
		execFileSync("git", ["init", "-q", donor]);
		execFileSync("git", ["-C", donor, "config", "user.email", "t@t"]);
		execFileSync("git", ["-C", donor, "config", "user.name", "t"]);
		const dir = join(donor, "src/content/benefits");
		mkdirSync(dir, { recursive: true });
		for (const [name, content] of Object.entries(FICHAS)) {
			writeFileSync(join(dir, name), content);
		}
		execFileSync("git", ["-C", donor, "add", "."]);
		execFileSync("git", ["-C", donor, "commit", "-qm", "fichas"]);
		commit = execFileSync("git", ["-C", donor, "rev-parse", "HEAD"], {
			encoding: "utf8",
		}).trim();

		const r1 = importDonorCatalog({ donor, commit, outDir: out });
		expect(r1.imported).toBe(2);
		expect(r1.leads).toBe(1);
		expect(r1.excluded).toBe(3);

		const slugs = readdirSync(join(out, "benefits")).sort();
		expect(slugs).toEqual(["estatal-beca.json", "madrid-ayuda-buena.json"]);

		const ficha = JSON.parse(
			readFileSync(join(out, "benefits/madrid-ayuda-buena.json"), "utf8"),
		);
		expect(ficha.slug).toBe("madrid-ayuda-buena");
		expect(ficha.scopeRegion).toBe("madrid");
		expect(ficha.reviewStatus).toBe("revisada");

		const leads = JSON.parse(readFileSync(join(out, "leads.json"), "utf8"));
		expect(leads.leads).toHaveLength(1);
		expect(leads.leads[0].slug).toBe("madrid-borrador");

		const prov = JSON.parse(readFileSync(join(out, "provenance.json"), "utf8"));
		expect(prov.commit).toBe(commit);
		expect(prov.donor).toBe(donor);
		expect(prov.files["madrid-ayuda-buena"].path).toBe(
			"src/content/benefits/madrid-ayuda-buena.md",
		);
		expect(prov.files["madrid-ayuda-buena"].sha256).toMatch(/^[a-f0-9]{64}$/);

		// Determinismo: mismo commit => mismos bytes de salida.
		const out2 = join(tmp, "catalog2");
		const r2 = importDonorCatalog({ donor, commit, outDir: out2 });
		expect(r2.imported).toBe(2);
		for (const f of readdirSync(join(out, "benefits"))) {
			expect(readFileSync(join(out2, "benefits", f), "utf8")).toBe(
				readFileSync(join(out, "benefits", f), "utf8"),
			);
		}
		expect(readFileSync(join(out2, "provenance.json"), "utf8")).toBe(
			readFileSync(join(out, "provenance.json"), "utf8"),
		);
	});
});

afterAll(() => rmSync(tmp, { recursive: true, force: true }));
