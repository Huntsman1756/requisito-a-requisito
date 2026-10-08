/**
 * F10-FIX-2d: reproduce un conflicto REAL de rebase en runs.jsonl
 * (append-only, con acentos) en un repo temporal y verifica que
 * `scripts/merge-jsonl.mjs` lo resuelve: UTF-8 intacto, orden conservado
 * (primero las líneas de origin/HEAD, después las locales nuevas), sin
 * marcadores de conflicto.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const dirs: string[] = [];
afterAll(() => {
	for (const d of dirs) rmSync(d, { recursive: true, force: true });
}, 120_000);

const GIT = (cwd: string, args: string[]) =>
	execFileSync("git", args, {
		cwd,
		encoding: "utf8",
		env: {
			...process.env,
			GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t",
			GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t",
		},
	});

const LINE_BASE1 = '{"date":"2026-10-07","runner":"ci","checked":100,"cosmetic":["seguridad"]}';
const LINE_BASE2 = '{"date":"2026-10-07","runner":"local","onlySkipped":true,"checked":40}';
// Acentos deliberados — la corrupción ANSI de Set-Content los rompe.
const LINE_MAIN = '{"date":"2026-10-08","runner":"ci","cosmetic":["pensión","revalidación"]}';
const LINE_LOCAL = '{"date":"2026-10-08","runner":"local","cosmetic":["versión","demostración"]}';

describe("merge-jsonl — conflicto real en runs.jsonl", () => {
	it("resuelve sin reordenar y sin corromper UTF-8", { timeout: 120_000 }, () => {
		const repo = mkdtempSync(join(tmpdir(), "merge-jsonl-"));
		dirs.push(repo);
		const f = "data/freshness/runs.jsonl";
		const abs = join(repo, f);
		GIT(repo, ["init", "-b", "main"]);
		mkdirSync(join(repo, "data/freshness"), { recursive: true });
		writeFileSync(abs, `${LINE_BASE1}\n${LINE_BASE2}\n`, "utf8");
		GIT(repo, ["add", "-A"]);
		GIT(repo, ["commit", "-m", "base"]);

		// Rama local (la de freshness-local.ps1) y línea nueva en main.
		GIT(repo, ["checkout", "-b", "local"]);
		writeFileSync(abs, `${LINE_BASE1}\n${LINE_BASE2}\n${LINE_LOCAL}\n`, "utf8");
		GIT(repo, ["commit", "-am", "local"]);
		GIT(repo, ["checkout", "main"]);
		writeFileSync(abs, `${LINE_BASE1}\n${LINE_BASE2}\n${LINE_MAIN}\n`, "utf8");
		GIT(repo, ["commit", "-am", "main"]);

		// Conflicto real: rebase local → main.
		let conflict = false;
		try {
			GIT(repo, ["checkout", "local"]);
			GIT(repo, ["rebase", "main"]);
		} catch { conflict = true; }
		expect(conflict).toBe(true);
		expect(readFileSync(abs, "utf8")).toContain("<<<<<<<");

		// Resolver con el script real.
		execFileSync("node", [
			join(process.cwd(), "scripts/merge-jsonl.mjs"), repo, f,
		]);
		const merged = readFileSync(abs, "utf8");
		expect(merged).not.toContain("<<<<<<<");
		// UTF-8 intacto.
		expect(merged).toContain("pensión");
		expect(merged).toContain("revalidación");
		expect(merged).toContain("versión");
		expect(merged).toContain("demostración");
		// Orden: :2: (main/origin) primero, la local nueva al final.
		expect(merged.trim().split("\n")).toEqual([
			LINE_BASE1, LINE_BASE2, LINE_MAIN, LINE_LOCAL,
		]);
	});
});
