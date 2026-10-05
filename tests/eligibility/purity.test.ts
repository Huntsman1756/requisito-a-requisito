import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ENGINE = join(__dirname, "../../src/lib/eligibility-engine");

const FORBIDDEN = [
	/node:fs/,
	/from "fs"/,
	/from 'fs'/,
	/Date\.now\(\)/,
	/new Date\(\)/,
	/from "next/,
	/from 'next/,
	/react/,
];

describe("pureza del motor (puerta F2)", () => {
	it("ningún módulo importa fs, Date.now, Next ni React", () => {
		for (const f of readdirSync(ENGINE).filter((x) => x.endsWith(".ts"))) {
			// Se chequea el código, no los comentarios (que pueden nombrar la regla).
			const src = readFileSync(join(ENGINE, f), "utf8")
				.replace(/\/\*[\s\S]*?\*\//g, "")
				.replace(/(^|\s)\/\/[^\n]*/g, "$1");
			for (const re of FORBIDDEN) {
				expect(re.test(src), `${f} contiene ${re}`).toBe(false);
			}
		}
	});
});
