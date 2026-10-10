/**
 * frescura.test.ts — F10-FRONT-FINAL §2.6: las fechas «revisada
 * automáticamente» que muestra la web salen de data/freshness/runs.jsonl,
 * recomputadas de forma independiente. Si publican una fecha que no está
 * en el registro, este test cae (regla 4.12: nada inventado).
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	type FreshnessRun,
	lastAutoRun,
	lastOkBySource,
} from "../src/lib/freshness";

const root = process.cwd();
const OUT = join(root, "public/datos/elegibilidad");

const runs: FreshnessRun[] = readFileSync(
	join(root, "data/freshness/runs.jsonl"),
	"utf8",
)
	.trim()
	.split("\n")
	.filter(Boolean)
	.map((l) => JSON.parse(l) as FreshnessRun);

const sources = readdirSync(join(root, "data/eligibility/sources"))
	.filter((f) => f.endsWith(".json") && f !== "registry.json")
	.map((f) =>
		JSON.parse(
			readFileSync(join(root, "data/eligibility/sources", f), "utf8"),
		),
	) as { id: string; url: string }[];

const frescura = JSON.parse(
	readFileSync(join(OUT, "frescura.json"), "utf8"),
) as { lastAutoRunAt: string | null; sources: Record<string, string> };

const fuentes = JSON.parse(
	readFileSync(join(OUT, "fuentes.json"), "utf8"),
) as { sources: { id: string; lastRevalidatedAt?: string | null }[] };

describe("frescura publicada (regla 4.12)", () => {
	it("lastAutoRunAt es la fecha de la última corrida con checked > 0", () => {
		const last = lastAutoRun(runs);
		expect(frescura.lastAutoRunAt).toBe(last?.date ?? null);
	});

	it("cada fecha por fuente es una revalidación correcta registrada", () => {
		const expected = lastOkBySource(runs, sources);
		expect(frescura.sources).toEqual(expected);
	});

	it("fuentes.json lleva la misma fecha por fuente", () => {
		const expected = lastOkBySource(runs, sources);
		for (const s of fuentes.sources) {
			expect(s.lastRevalidatedAt ?? null).toBe(expected[s.id] ?? null);
		}
	});

	it("las fechas existen en corridas reales (nada inventado)", () => {
		const dates = new Set(runs.map((r) => r.date));
		for (const d of Object.values(frescura.sources)) {
			expect(dates.has(d)).toBe(true);
		}
	});
});
