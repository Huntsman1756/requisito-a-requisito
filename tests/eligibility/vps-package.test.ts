/**
 * F10-VPS (ADR-053): el artefacto del espejo se genera desde un export SIN
 * el prefijo de Pages y su manifiesto cuadra con el bundle servido.
 * Sobre datos reales: el bundle público publicado y su manifest han de
 * coincidir en digest (regla 4.11).
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { packageVps } from "../../scripts/vps-package";

const sha256 = (s: string | Buffer) =>
	createHash("sha256").update(s).digest("hex");

function fixtureOut(bundleObj: unknown) {
	const out = mkdtempSync(join(tmpdir(), "vps-out-"));
	mkdirSync(join(out, "datos/elegibilidad"), { recursive: true });
	mkdirSync(join(out, "ayudas/x"), { recursive: true });
	const bundle = JSON.stringify(bundleObj);
	writeFileSync(join(out, "datos/elegibilidad/bundle.json"), bundle);
	writeFileSync(
		join(out, "datos/elegibilidad/manifest.json"),
		JSON.stringify({ bundleDigest: sha256(bundle) }),
	);
	writeFileSync(
		join(out, "index.html"),
		'<a href="/ayudas/x/">x</a><a href="/comprobar/">c</a>',
	);
	writeFileSync(join(out, "404.html"), "<h1>404</h1>");
	writeFileSync(join(out, "ayudas/x/index.html"), "<h1>x</h1>");
	return out;
}

describe("vps-package (ADR-053)", () => {
	it("genera tar + manifest coherentes con el bundle del export", () => {
		const out = fixtureOut({ rulesets: [{ benefitSlug: "x" }] });
		const dest = mkdtempSync(join(tmpdir(), "vps-art-"));
		const m = packageVps(out, dest, "abc123", "normal");
		expect(m.commit).toBe("abc123");
		expect(m.mode).toBe("normal");
		// El sha del manifiesto es el del tar producido.
		expect(m.siteSha256).toBe(
			sha256(readFileSync(join(dest, "site.tar.gz"))),
		);
		// bundleDigest == sha256 de datos/elegibilidad/bundle.json del export.
		expect(m.bundleSha256).toBe(
			sha256(readFileSync(join(out, "datos/elegibilidad/bundle.json"))),
		);
		expect(m.bundleDigest).toBe(m.bundleSha256);
		// El tar contiene index.html sin el prefijo de Pages.
		const tmp = mkdtempSync(join(tmpdir(), "vps-extract-"));
		writeFileSync(join(tmp, "site.tar.gz"), readFileSync(join(dest, "site.tar.gz")));
		execFileSync("tar", ["-xzf", "site.tar.gz"], { cwd: tmp });
		const html = readFileSync(join(tmp, "index.html"), "utf8");
		expect(html).not.toContain("/requisito-a-requisito");
		expect(html).toContain('/ayudas/x/');
	});

	it("rechaza un export que conserva el prefijo de Pages", () => {
		const out = fixtureOut({ rulesets: [] });
		writeFileSync(
			join(out, "index.html"),
			'<a href="/requisito-a-requisito/ayudas/x/">x</a>',
		);
		const dest = mkdtempSync(join(tmpdir(), "vps-art2-"));
		expect(() => packageVps(out, dest, "abc", "normal")).toThrow(/prefijo/);
	});

	it("rechaza un export sin bundle", () => {
		const out = mkdtempSync(join(tmpdir(), "vps-out3-"));
		writeFileSync(join(out, "index.html"), "ok");
		writeFileSync(join(out, "404.html"), "ok");
		const dest = mkdtempSync(join(tmpdir(), "vps-art3-"));
		expect(() => packageVps(out, dest, "abc", "normal")).toThrow(/bundle/);
	});

	it("datos reales: el manifest público cuadra con el bundle publicado", () => {
		const pub = "public/datos/elegibilidad";
		const bundle = readFileSync(join(pub, "bundle.json"));
		const manifest = JSON.parse(
			readFileSync(join(pub, "manifest.json"), "utf8"),
		) as { bundleDigest?: string };
		expect(manifest.bundleDigest).toBe(sha256(bundle));
	});
});
