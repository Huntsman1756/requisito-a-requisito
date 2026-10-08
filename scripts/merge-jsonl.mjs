/**
 * merge-jsonl.mjs — resolución de conflicto para ficheros JSONL append-only
 * (hoy: data/freshness/runs.jsonl).
 *
 * Uso en mitad de un `git rebase origin/main` con conflicto:
 *
 *   node scripts/merge-jsonl.mjs <repo> <path> [out]
 *
 * Lee los dos lados del conflicto por su stage del index — `:2:` es el lado
 * «ours» del rebase (origin/main, ya integrado) y `:3:` el commit local que
 * se está aplicando — y escribe:
 *
 *   1. las líneas de :2: en su orden;
 *   2. después, las líneas de :3: que no estuvieran ya.
 *
 * UTF-8 sin BOM en lectura y escritura (los runs llevan acentos: «revisión»,
 * «revalidación»…). No reordena: el orden del log es cronología.
 */

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

const [repo, path, outArg] = process.argv.slice(2);
// `out` se escribe SIEMPRE dentro de <repo> (o donde se indique en absoluto) —
// nunca relativo al cwd: el conflicto se resuelve en el repo que lo padece.
const out = outArg ? (isAbsolute(outArg) ? outArg : join(repo, outArg)) : join(repo, path);
if (!repo || !path) {
	console.error("uso: node scripts/merge-jsonl.mjs <repo> <path> [out]");
	process.exit(1);
}

const stage = (n) =>
	execFileSync("git", ["-C", repo, "show", `:${n}:${path}`], {
		encoding: "buffer",
		maxBuffer: 64 * 1024 * 1024,
	}).toString("utf8");

const lines = (s) => s.split(/\r?\n/).filter((l) => l.trim() !== "");
const seen = new Set(lines(stage(2)));
const merged = [...seen];
for (const l of lines(stage(3))) {
	if (!seen.has(l)) {
		seen.add(l);
		merged.push(l);
	}
}
writeFileSync(out, `${merged.join("\n")}\n`, "utf8");
console.log(`${out}: ${merged.length} líneas (${lines(stage(2)).length} de :2: + ${lines(stage(3)).length} de :3:)`);
