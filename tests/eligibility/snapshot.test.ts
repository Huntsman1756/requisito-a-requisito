import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
	type FetchBytes,
	snapshotSource,
} from "../../scripts/eligibility-snapshot";
import { sourceRegistrySchema } from "../../src/lib/eligibility-engine/schema";

const tmp = mkdtempSync(join(tmpdir(), "snap-"));
const registry = sourceRegistrySchema.parse(
	JSON.parse(
		readFileSync("data/eligibility/sources/registry.json", "utf8"),
	),
);

const HTML = Buffer.from(
	"<html><body><h1>Convocatoria</h1><p>Plazo: 15&nbsp;d&iacute;as «hábiles».</p><script>var x=1;</script></body></html>",
	"utf8",
);

const fakeFetch: FetchBytes = async (_url) => ({
	bytes: HTML,
	contentType: "text/html",
});

describe("snapshotSource", () => {
	it("rechaza un dominio fuera del registro", async () => {
		await expect(
			snapshotSource({
				url: "https://blog.ejemplo.com/x",
				id: "fuera-registro",
				rank: 4,
				registry,
				fetchBytes: fakeFetch,
				sourcesDir: tmp,
				snapshotsDir: tmp,
			}),
		).rejects.toThrowError(/ELIG_DOMAIN_NOT_REGISTERED/);
	});

	it("rechaza --expect con sha distinto", async () => {
		await expect(
			snapshotSource({
				url: "https://www.boe.es/x",
				id: "expect-mal",
				rank: 1,
				registry,
				fetchBytes: fakeFetch,
				expect: "0".repeat(64),
				sourcesDir: tmp,
				snapshotsDir: tmp,
			}),
		).rejects.toThrowError(/ELIG_SHA_MISMATCH/);
	});

	it("descarga, extrae texto normalizado y escribe .json + .txt", async () => {
		const meta = await snapshotSource({
			url: "https://www.boe.es/convocatoria",
			id: "boe-test",
			rank: 1,
			registry,
			fetchBytes: fakeFetch,
			sourcesDir: tmp,
			snapshotsDir: tmp,
		});
		expect(meta.id).toBe("boe-test");
		expect(meta.sha256).toBe(createHash("sha256").update(HTML).digest("hex"));
		const txt = readFileSync(join(tmp, "boe-test.txt"), "utf8");
		expect(txt).toContain('15 días "hábiles"');
		expect(txt).not.toContain("<");
		expect(txt).not.toContain("var x");
		expect(meta.textSha256).toBe(
			createHash("sha256").update(txt, "utf8").digest("hex"),
		);
		const written = JSON.parse(readFileSync(join(tmp, "boe-test.json"), "utf8"));
		expect(written.url).toBe("https://www.boe.es/convocatoria");
		expect(written.contentType).toBe("text/html");
		expect(written.rank).toBe(1);
	});

	it("rechaza una descarga vacía", async () => {
		await expect(
			snapshotSource({
				url: "https://www.boe.es/vacio",
				id: "vacio",
				rank: 1,
				registry,
				fetchBytes: async () => ({ bytes: Buffer.alloc(0), contentType: "text/html" }),
				sourcesDir: tmp,
				snapshotsDir: tmp,
			}),
		).rejects.toThrowError(/ELIG_EMPTY_DOWNLOAD/);
	});
});

afterAll(() => rmSync(tmp, { recursive: true, force: true }));
