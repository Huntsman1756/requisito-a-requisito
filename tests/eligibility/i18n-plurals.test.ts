/**
 * i18n-plurals — guarda F10-RES-3: el mini-formato plural de t() exige
 * `{n, plural, one {# …} other {# …}}` (el `#` abre cada rama). Un patrón
 * mal formado se pinta CRUDO en la interfaz («{n, plural, one {…») — el
 * barrido visual lo pilló en results.sentence.noDescartar. Todas las
 * claves con «plural» tienen que renderizar limpio para n=1 y n=25.
 */

import { describe, expect, it } from "vitest";
import { es, t, type I18nKey } from "../../src/lib/i18n/es";

const PLURAL_KEYS = (Object.keys(es) as I18nKey[]).filter((k) =>
	es[k].includes("plural"),
);

describe("i18n: todo patrón plural de es.ts se renderiza, nunca en crudo", () => {
	it("hay patrones plurales declarados", () => {
		expect(PLURAL_KEYS.length).toBeGreaterThan(0);
	});
	it.each(PLURAL_KEYS)("%s", (key) => {
		for (const n of [1, 2, 25]) {
			const rendered = t(key, { n, max: n, x: `${n} €` });
			expect(
				rendered.includes("{") || rendered.includes("}"),
				`n=${n}: «${rendered.slice(0, 80)}»`,
			).toBe(false);
		}
	});
});
