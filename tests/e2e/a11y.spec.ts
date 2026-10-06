import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// axe en las páginas públicas principales (F5-4): 0 serious/critical.
for (const [name, path] of [
	["home", "/"],
	["comprobar", "/comprobar/"],
	["explorar", "/explorar/"],
	["observatorio", "/observatorio/"],
	["como-funciona", "/como-funciona/"],
] as const) {
	test(`axe ${name}`, async ({ page }) => {
		await page.goto(path);
		const res = await new AxeBuilder({ page })
			.exclude("iframe")
			.analyze();
		const bad = res.violations.filter(
			(v) => v.impact === "serious" || v.impact === "critical",
		);
		expect(bad.map((v) => `${v.id}: ${v.nodes.length} nodo(s)`)).toEqual([]);
	});
}
