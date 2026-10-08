/**
 * B3-DATOS / regla 4.13: el índice de /datos/ debe cuadrar con los ficheros
 * publicados — cada entrada existe, sus bytes y sha256 coinciden, y no hay
 * fichero publicado sin entrada en el índice.
 *
 * `npm test` corre tras `datos:public` (el build lo regenera), así que este
 * test compara lo publicado, no lo declarado.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const OUT = join(process.cwd(), "public/datos/elegibilidad");
const indice = JSON.parse(readFileSync(join(OUT, "indice.json"), "utf8"));

describe("índice de /datos/ (B3-DATOS)", () => {
	it("cada entrada existe y cuadra en bytes y sha256", () => {
		for (const f of indice.files) {
			const p = join(OUT, f.file);
			expect(existsSync(p), f.file).toBe(true);
			const buf = readFileSync(p);
			expect(buf.length, `${f.file} bytes`).toBe(f.bytes);
			expect(
				createHash("sha256").update(buf).digest("hex"),
				`${f.file} sha256`,
			).toBe(f.sha256);
			expect(f.description?.length ?? 0).toBeGreaterThan(0);
		}
	});

	it("no hay fichero publicado sin entrada en el índice", () => {
		const idx = new Set(indice.files.map((f: { file: string }) => f.file));
		idx.add("indice.json"); // el propio índice
		const publicados = readdirSync(OUT).filter((f) => f.endsWith(".json"));
		expect(publicados.filter((f) => !idx.has(f))).toEqual([]);
	});

	it("el índice declara la licencia y el digest del bundle", () => {
		expect(indice.bundleDigest).toMatch(/^[0-9a-f]{64}$/);
		expect(indice.license).toContain("Requisito a Requisito");
	});
});
