import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");

describe("andamiaje (F0-7)", () => {
	it("globals.css contiene los tokens y utilidades de accesibilidad del diseño", () => {
		const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
		for (const token of ["--accent", "--bg", "--ink", "--ok", "--warn", "--danger"]) {
			expect(css).toContain(token);
		}
		expect(css).toContain(".skip-link");
		expect(css).toContain("prefers-reduced-motion");
	});

	it("las fuentes portadas existen", () => {
		for (const f of ["ahn-r.woff2", "ibm-plex-mono-400.woff2"]) {
			expect(existsSync(join(ROOT, "public/fonts", f)), f).toBe(true);
		}
	});

	it("los ficheros del producto llevan cabecera de procedencia", () => {
		const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
		expect(css).toContain("Origen: la-ayuda@63ad635b");
		const design = readFileSync(join(ROOT, "DESIGN.md"), "utf8");
		expect(design).toContain("Origen: la-ayuda@63ad635b");
	});
});
