import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import type {
	CitizenProfile,
	RuleSet,
} from "../../src/lib/eligibility-engine/schema";

const inputs = JSON.parse(
	readFileSync("out/datos/elegibilidad/bundle.json", "utf8"),
) as { rulesets: RuleSet[] };
const rules = [
	...new Map(inputs.rulesets.map((r) => [r.benefitSlug, r])).values(),
];
// El loader de Playwright no admite los imports JSON del motor. Preparar las
// personas con tsx; el navegador sigue evaluando el bundle real sin interceptar.
const fixtures = JSON.parse(
	execFileSync(
		process.execPath,
		["node_modules/tsx/dist/cli.mjs", "scripts/completeness-web-data.ts"],
		{ encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
	),
) as {
	bundleDigest: string;
	questionCount: number;
	persons: {
		slug: string;
		today: string;
		goldenId: string;
		answers: CitizenProfile["answers"];
	}[];
};
if (
	fixtures.bundleDigest !==
	createHash("sha256")
		.update(readFileSync("out/datos/elegibilidad/bundle.json"))
		.digest("hex")
)
	throw new Error("fixture positiva de otro bundle");
const level2 = JSON.parse(
	readFileSync("out/datos/elegibilidad/nivel-2.json", "utf8"),
).items as { slug: string; displayTitle: string; officialSourceUrl?: string }[];
const base = process.env.BASE_PATH ?? "";
const url = (p: string) => `${base}${p}`;

test.beforeEach(async ({ request }) => {
	const response = await request.get(url("/datos/elegibilidad/bundle.json"));
	expect(response.ok()).toBe(true);
	expect(
		createHash("sha256")
			.update(await response.body())
			.digest("hex"),
	).toBe(fixtures.bundleDigest);
});

async function findings(name: string, errors: string[]) {
	await test.info().attach(name, {
		body: JSON.stringify(errors, null, 2),
		contentType: "application/json",
	});
	expect(errors, name).toEqual([]);
}

test("inventario: cada programa del bundle tiene ficha y aparece en explorar", async ({
	page,
	request,
}) => {
	test.setTimeout(180_000);
	const errors: string[] = [];
	await page.goto(url("/explorar/"));
	await expect(page.locator(".explorer-count")).not.toHaveText("Cargando…");
	for (const rs of rules) {
		const response = await request.get(url(`/ayudas/${rs.benefitSlug}/`));
		if (!response.ok() || !(await response.text()).includes("<h1"))
			errors.push(`${rs.benefitSlug}: ficha no carga (${response.status()})`);
		const item = level2.find(
			(i) =>
				i.slug === rs.benefitSlug ||
				i.officialSourceUrl === rs.application.channel.url,
		);
		if (!item) {
			errors.push(
				`${rs.benefitSlug}: no identificado en explorar por slug o canal oficial`,
			);
			continue;
		}
		await page
			.getByRole("searchbox", { name: "Buscar por nombre" })
			.fill(item.displayTitle);
		if (
			!(await page
				.locator(".explorer-list a")
				.evaluateAll(
					(as, href) => as.some((a) => a.getAttribute("href") === href),
					item.officialSourceUrl,
				))
		)
			errors.push(`${rs.benefitSlug}: búsqueda no muestra su enlace oficial`);
	}
	await findings("inventario-nivel-1", errors);
});

test("persona positiva: cada programa se muestra en resultados de comprobar", async ({
	browser,
}) => {
	test.setTimeout(300_000);
	const errors: string[] = [];
	for (const slug of rules.map((r) => r.benefitSlug)) {
		const golden = fixtures.persons.find((p) => p.slug === slug);
		if (!golden) {
			errors.push(`${slug}: falta fixture positiva`);
			continue;
		}
		const ctx = await browser.newContext();
		try {
			const page = await ctx.newPage();
			await page.clock.install({ time: new Date(`${golden.today}T12:00:00Z`) });
			// Ejercita la persistencia nativa y el formulario real; no intercepta el motor.
			const answers = golden.answers;
			await page.addInitScript(
				(answers0) =>
					sessionStorage.setItem(
						"rr_check_handoff",
						JSON.stringify({
							answers: answers0,
							step: 0,
							savedAt: new Date().toISOString(),
						}),
					),
				answers,
			);
			await page.goto(url("/comprobar/"));
			await page.getByRole("button", { name: "Empezar", exact: true }).click();
			for (let i = 0; i < fixtures.questionCount + 1; i++) {
				if (
					await page
						.getByRole("button", { name: "Ver mis resultados", exact: true })
						.isVisible()
				)
					break;
				await expect(page.locator("fieldset.question")).toBeVisible();
				const field = await page
					.locator(".progress")
					.getAttribute("aria-valuenow");
				const next = page.getByRole("button", {
					name: "Siguiente",
					exact: true,
				});
				// Si la respuesta guardada falta, conservar UNKNOWN mediante el control público.
				const unknown = page.getByRole("button", {
					name: "No lo sé",
					exact: true,
				});
				await next.click();
				await expect
					.poll(
						async () =>
							(await page.locator(".field-error").isVisible()) ||
							(await page
								.getByRole("button", {
									name: "Ver mis resultados",
									exact: true,
								})
								.isVisible()) ||
							(await page
								.locator(".progress")
								.evaluateAll(
									(es) => es[0]?.getAttribute("aria-valuenow") ?? null,
								)) !== field,
					)
					.toBe(true);
				if (await page.locator(".field-error").isVisible()) {
					if (await unknown.isVisible()) await unknown.click();
					else if (
						await page
							.getByRole("button", { name: "Prefiero no decirlo", exact: true })
							.isVisible()
					)
						await page
							.getByRole("button", { name: "Prefiero no decirlo", exact: true })
							.click();
					else
						throw new Error(
							`paso ${field}: el perfil no se puede representar en el formulario`,
						);
				}
			}
			await page
				.getByRole("button", { name: "Ver mis resultados", exact: true })
				.click();
			const closed = page.getByRole("button", {
				name: /Mostrar ayudas cerradas/,
			});
			if (await closed.isVisible()) await closed.click();
			const card = page
				.locator(".results-list .aid-card")
				.filter({ has: page.locator(`a[href="${url(`/ayudas/${slug}/`)}"]`) });
			await expect(card).toHaveCount(1, { timeout: 2500 });
			const header = await card.locator("h2").innerText();
			if (!/Encaja|Posible|Probable/i.test(header))
				errors.push(
					`${slug}: golden ${golden.goldenId} positivo en motor, pero tras formulario muestra «${header}»`,
				);
		} catch (e) {
			errors.push(`${slug}: ${String(e).slice(0, 300)}`);
		} finally {
			await ctx.close();
		}
	}
	await findings("resultados-positivos", errors);
});

test("inventario nivel 2: todas las fichas tienen página propia y enlace oficial", async ({
	page,
	request,
}) => {
	test.setTimeout(240_000);
	const errors: string[] = [];
	await page.goto(url("/explorar/"));
	await expect(page.locator(".explorer-count")).not.toHaveText("Cargando…");
	for (const item of level2) {
		const response = await request.get(url(`/ayudas/${item.slug}/`));
		if (!response.ok())
			errors.push(`${item.slug}: página propia ${response.status()}`);
		if (!item.officialSourceUrl?.startsWith("https://")) {
			errors.push(`${item.slug}: falta enlace oficial https`);
			continue;
		}
		await page
			.getByRole("searchbox", { name: "Buscar por nombre" })
			.fill(item.displayTitle);
		if (
			!(await page
				.locator(".explorer-list a")
				.evaluateAll(
					(as, href) => as.some((a) => a.getAttribute("href") === href),
					item.officialSourceUrl,
				))
		)
			errors.push(`${item.slug}: enlace no encontrado por búsqueda`);
	}
	await findings("inventario-nivel-2", errors);
});
