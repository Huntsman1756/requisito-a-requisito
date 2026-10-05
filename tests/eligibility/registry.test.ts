import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { matchDomain, rankAllowed } from "../../src/lib/eligibility-engine/domains";
import { sourceRegistrySchema } from "../../src/lib/eligibility-engine/schema";

const registry = sourceRegistrySchema.parse(
	JSON.parse(
		readFileSync(
			join(__dirname, "../../data/eligibility/sources/registry.json"),
			"utf8",
		),
	),
);

describe("registry.json", () => {
	it("valida contra sourceRegistrySchema", () => {
		expect(registry.domains.length).toBeGreaterThan(10);
	});

	it("los hosts con punto inicial son sufijos; el resto exactos", () => {
		for (const d of registry.domains) {
			expect(d.host).not.toContain("://");
			expect(d.host).not.toContain("/");
		}
	});

	it("los dominios del vertical están cubiertos (BOE, BOCM, sede CM, SS, SEPE)", () => {
		const hosts = registry.domains.map((d) => d.host);
		for (const h of [
			"www.boe.es",
			"www.bocm.es",
			"sede.comunidad.madrid",
			"sede.seg-social.gob.es",
			"sede.sepe.gob.es",
		]) {
			expect(hosts).toContain(h);
		}
	});
});

describe("matchDomain", () => {
	const domains = registry.domains;

	it("host exacto gana a sufijo", () => {
		expect(matchDomain("sede.comunidad.madrid", domains)?.maxRank).toBe(3);
		expect(matchDomain("www.boe.es", domains)?.maxRank).toBe(1);
	});

	it("sufijo cubre subdominios no registrados", () => {
		const m = matchDomain("empleo.comunidad.madrid", domains);
		expect(m?.host).toBe(".comunidad.madrid");
		expect(m?.maxRank).toBe(4);
	});

	it("devuelve null fuera del registro", () => {
		expect(matchDomain("blogspot.com", domains)).toBeNull();
		expect(matchDomain("www.marca.com", domains)).toBeNull();
	});

	it("no cuela dominios parecidos (sufijo exige punto real)", () => {
		expect(matchDomain("falso-comunidad.madrid.evil.example", domains)).toBeNull();
		expect(matchDomain("notagob.es", domains)).toBeNull();
	});
});

describe("rankAllowed (G3)", () => {
	const domains = registry.domains;

	it("rango 1 permitido en boletines oficiales", () => {
		expect(rankAllowed("https://www.boe.es/diario_boe/txt.php?id=X", 1, domains).ok).toBe(true);
		expect(rankAllowed("https://www.bocm.es/boletin/CM/x.PDF", 1, domains).ok).toBe(true);
	});

	it("rango 1 rechazado en sedes y portales informativos", () => {
		expect(rankAllowed("https://sede.comunidad.madrid/x", 1, domains).ok).toBe(false);
		expect(rankAllowed("https://www.comunidad.madrid/x", 1, domains).ok).toBe(false);
	});

	it("dominio no registrado ⇒ rechazo", () => {
		expect(rankAllowed("https://es.wikipedia.org/wiki/X", 4, domains).ok).toBe(false);
	});
});
