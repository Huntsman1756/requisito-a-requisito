/**
 * municipal-seed.ts — F10-CAT-MUNI: verifica el seed municipal curado.
 *
 * Lee data/universe/municipal-seed.input.json (entradas curadas a mano,
 * solo ayudas dirigidas a personas, recurrentes o de la edición vigente),
 * descarga cada URL oficial de forma educada (una petición cada ~800 ms)
 * y escribe data/universe/municipal-seed.json con la procedencia por
 * entrada: estado HTTP, sha256 del cuerpo y fecha de la comprobación.
 *
 * build.ts solo incluye las entradas con status 2xx — calidad ante
 * cantidad (mejor 30 buenas que 300 dudosas).
 *
 * Uso: npm run universe:municipal
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const INPUT = join(ROOT, "data/universe/municipal-seed.input.json");
const OUT = join(ROOT, "data/universe/municipal-seed.json");
const TODAY = new Date().toISOString().slice(0, 10);

interface SeedInput {
	title: string;
	url: string;
	municipality: string;
	accessState: string;
	note?: string;
}

interface SeedOut extends SeedInput {
	httpStatus: number | null;
	sha256: string | null;
	fetchedAt: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function checkOne(url: string): Promise<{ status: number; sha256: string } | { status: null; sha256: null }> {
	try {
		const r = await fetch(url, {
			headers: { "user-agent": "Mozilla/5.0" },
			signal: AbortSignal.timeout(30_000),
		});
		const body = await r.arrayBuffer();
		return {
			status: r.status,
			sha256: createHash("sha256").update(Buffer.from(body)).digest("hex"),
		};
	} catch {
		return { status: null, sha256: null };
	}
}

async function main() {
	const input = JSON.parse(readFileSync(INPUT, "utf8")) as SeedInput[];
	const items: SeedOut[] = [];
	for (const [i, it] of input.entries()) {
		const c = await checkOne(it.url);
		items.push({ ...it, httpStatus: c.status, sha256: c.sha256, fetchedAt: TODAY });
		console.log(
			`  ${c.status ?? "ERR"} ${it.municipality} — ${it.title.slice(0, 70)}`,
		);
		if (i < input.length - 1) await sleep(800);
	}
	const bad = items.filter((i) => !i.httpStatus || i.httpStatus >= 400);
	writeFileSync(
		OUT,
		`${JSON.stringify({ generatedAt: TODAY, items }, null, 1)}\n`,
	);
	console.log(
		`municipal-seed → ${items.length - bad.length}/${items.length} verificadas` +
			(bad.length ? ` (${bad.length} descartadas por respuesta ${bad.map((b) => b.httpStatus ?? "ERR").join(",")})` : ""),
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
