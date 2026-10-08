/**
 * memoria-cifras.ts — F10-DEV-1
 *
 * `npm run memoria:cifras` emite la tabla de cifras que puede citar la memoria
 * (F7-6: solo cifras medidas; nada se escribe a mano en submission/memoria.md).
 *
 * Cada cifra sale de un artefacto real del repo en el momento de la corrida:
 * bundle público, universe, nivel-2, goldens, fuentes y la suite de tests
 * (vitest con reporter JSON — la corrida tarda unos segundos y es lo que
 * hace que la cifra sea medida y no recordada).
 *
 * Salida: tabla por consola + `submission/cifras.json` (ignorable si se quiere:
 * es derivado y regenerable).
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (p: string) => JSON.parse(readFileSync(join(root, p), "utf8"));

const bundle = read("public/datos/elegibilidad/bundle.json") as {
	referenceDate: string;
	rulesets: { benefitSlug: string; sources: { url: string }[] }[];
	sources: { id: string }[];
	parameters: Record<string, unknown>;
};
const nivel2 = read("public/datos/elegibilidad/nivel-2.json") as {
	items: { accessState?: string }[];
};
const universe = read("data/universe/programs.json") as {
	programs: unknown[];
};
const rejected = read("data/universe/rejected.json") as unknown[];

const urlSet = new Set<string>();
JSON.stringify(bundle, (_k, v) => {
	if (typeof v === "string" && v.startsWith("https://")) urlSet.add(v);
	return v;
});

const goldenDir = "data/eligibility/golden";
const goldenFiles = readdirSync(join(root, goldenDir)).filter((f) =>
	f.endsWith(".json"),
);
let expectations = 0;
for (const f of goldenFiles) {
	expectations += (read(`${goldenDir}/${f}`).expectations ?? []).length;
}

const sourceMetas = readdirSync(join(root, "data/eligibility/sources")).filter(
	(f) => f.endsWith(".json") && f !== "registry.json",
).length;

const access = nivel2.items.reduce<Record<string, number>>((acc, it) => {
	acc[it.accessState ?? "?"] = (acc[it.accessState ?? "?"] ?? 0) + 1;
	return acc;
}, {});

// Tests: corrida real de vitest (reporter JSON) — la cifra existe porque corre.
let tests = { total: 0, passed: 0, files: 0 };
try {
	const out = execFileSync(
		process.execPath,
		["node_modules/vitest/vitest.mjs", "run", "--reporter=json"],
		{ cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	);
	const start = out.indexOf("{");
	const rep = JSON.parse(out.slice(start));
	tests = {
		total: rep.numTotalTests,
		passed: rep.numPassedTests,
		// testResults = ficheros; numTotalTestSuites cuenta describe suites.
		files: rep.testResults?.length ?? rep.numTotalTestSuites,
	};
} catch {
	console.error("aviso: no pude medir la suite de tests — cifra omitida");
}

const cifras = {
	at: new Date().toISOString().slice(0, 10),
	rulesetsEnBundle: bundle.rulesets.length,
	programasNivel1: new Set(bundle.rulesets.map((r) => r.benefitSlug)).size,
	referenceDateBundle: bundle.referenceDate,
	fuentesEnBundle: bundle.sources.length,
	fuentesRegistradas: sourceMetas,
	urlsCitadasEnBundle: urlSet.size,
	universoAptos: universe.programs.length,
	universoRechazados: rejected.length,
	fichasNivel2: nivel2.items.length,
	nivel2Estados: access,
	goldenPersonas: goldenFiles.length,
	goldenExpectations: expectations,
	testFiles: tests.files,
	testsTotal: tests.total,
	testsPassed: tests.passed,
};

for (const [k, v] of Object.entries(cifras)) {
	console.log(`${k.padEnd(24)} ${typeof v === "object" ? JSON.stringify(v) : v}`);
}
writeFileSync(
	join(root, "submission", "cifras.json"),
	`${JSON.stringify(cifras, null, 2)}\n`,
);
console.log("\n→ submission/cifras.json");
