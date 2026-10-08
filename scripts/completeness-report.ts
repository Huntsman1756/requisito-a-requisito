import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { goldenCoverage, reachability, readInputs } from "./completeness";

const arg = (key: string, fallback?: string) => {
	const i = process.argv.indexOf(`--${key}`);
	return i < 0 ? fallback : process.argv[i + 1];
};
const date = arg("today") ?? new Date().toISOString().slice(0, 10);
const out = arg("out") ?? `evidence/${date}-F10`;
const inputs = readInputs(process.cwd(), arg("bundle"));
if (inputs.rules.length === 0)
	throw new Error("completitud: bundle vacío; no se acredita cobertura");
const rows = inputs.rules.map((r) => reachability(r, inputs, date));
const coverage = goldenCoverage(inputs);
mkdirSync(out, { recursive: true });
writeFileSync(
	join(out, "alcanzabilidad.json"),
	`${JSON.stringify({ date, rows, coverage }, null, 2)}\n`,
);
const blocked = rows.filter((r) => r.validPositive === 0 || r.invalid > 0);
writeFileSync(
	join(out, "alcanzabilidad.md"),
	[
		"# Alcanzabilidad — datos reales",
		"",
		`Fecha: ${date}. ${rows.length} RuleSets / ${coverage.length} programas. ${blocked.length} versiones sin positivo válido o con fallo de invariantes.`,
		`Combinaciones evaluadas: ${rows.reduce((n, r) => n + r.profiles, 0)}. Fuera del esquema de perfil: ${rows.reduce((n, r) => n + r.invalidProfiles, 0)} (no cuentan como testigos positivos). Versiones con recorte: ${rows.filter((r) => r.truncated).length}.`,
		"",
		"Dominio discretizado de profileCombos, no población real ni probabilidad de acceso. Las versiones futuras se evalúan en validFrom. insuficiente equivale aquí a no_se_sabe; cumple corresponde a probable. Un cero puede revelar también una laguna del generador: requiere análisis, no una corrección automática de la regla.",
		"",
		"| Programa | Versión | Fecha evaluada | Perfiles | Cumple/probable | Posible | No cumple | No se sabe | Positivos válidos | Perfiles fuera del esquema | Estrategia | Aviso |",
		"|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|",
		...rows.map(
			(r) =>
				`| ${r.slug} | ${r.version} | ${r.today} | ${r.profiles} | ${r.counts.probable} | ${r.counts.posible} | ${r.counts.no_cumple} | ${r.counts.insuficiente} | ${r.validPositive} | ${r.invalidProfiles} | ${r.strategy}${r.truncated ? " (RECORTE)" : ""} | ${r.counts.no_cumple / r.profiles > 0.95 ? ">95 % no_cumple" : ""}${r.validPositive === 0 ? " CERO POSITIVOS VÁLIDOS" : ""} |`,
		),
		"",
		"## Goldens positivos",
		"",
		...coverage.map((c) => `- ${c.slug}: ${c.golden ?? "FALTA"}`),
		"",
	].join("\n"),
);
console.log(
	`${rows.length} RuleSets; ${blocked.length} bloqueados; ${coverage.filter((c) => !c.golden).length} programas sin golden positivo`,
);
if (blocked.length || coverage.some((c) => !c.golden)) process.exitCode = 1;
