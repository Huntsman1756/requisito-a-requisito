import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { normalizeText } from "../../src/lib/eligibility-engine/text-normalize";

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

describe("normalizeText (docs/08 §2)", () => {
	it("colapsa espacios y saltos de línea", () => {
		expect(normalizeText("  hola\n\nmundo   \t cru\u00a0el ")).toBe(
			"hola mundo cru el",
		);
	});

	it("une cortes de línea con guion", () => {
		expect(normalizeText("administra-\ntiva")).toBe("administrativa");
		expect(normalizeText("administra- tiva")).toBe("administra- tiva");
	});

	it("comillas tipográficas → rectas; eñes NFC", () => {
		expect(normalizeText("«España» “cívica” — 2026")).toBe(
			'"España" "cívica" — 2026',
		);
		// NFC: e + tilde combinante => ñ precompuesta
		expect(normalizeText("espan\u0303a")).toBe("españa");
	});

	it("mismo texto con distinta tipografía da el mismo resultado", () => {
		const a = "El  plazo  es de  15 días.\nOtra línea";
		const b = "El plazo es de 15 días. Otra línea";
		expect(normalizeText(a)).toBe(normalizeText(b));
	});

	it("un cambio de una cifra cambia el hash", () => {
		const a = normalizeText("El plazo es de 15 días.");
		const b = normalizeText("El plazo es de 16 días.");
		expect(sha(a)).not.toBe(sha(b));
	});

	it("es idempotente", () => {
		const t = "Título «raro» — con\nguiones- de sobra";
		expect(normalizeText(normalizeText(t))).toBe(normalizeText(t));
	});
});
