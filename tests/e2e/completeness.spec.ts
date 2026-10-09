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
// ADR-052: el nivel 1 se lista en /explorar/ por benefitSlug con enlace a su
// ficha; el nivel 2 es un catálogo con enlace oficial, sin página propia.
const level1 = JSON.parse(
	readFileSync("out/datos/elegibilidad/nivel-1.json", "utf8"),
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
		const item = level1.find((i) => i.slug === rs.benefitSlug);
		if (!item) {
			errors.push(`${rs.benefitSlug}: no está en nivel-1.json (explorar)`);
			continue;
		}
		if (level2.some((i) => i.slug === rs.benefitSlug))
			errors.push(`${rs.benefitSlug}: duplicado también en nivel-2.json`);
		await page
			.getByRole("searchbox", { name: "Buscar por nombre" })
			.fill(item.displayTitle);
		const href = url(`/ayudas/${rs.benefitSlug}/`);
		if (
			!(await page
				.locator(".explorer-list a")
				.evaluateAll(
					(as, h) => as.some((a) => a.getAttribute("href") === h),
					href,
				))
		)
			errors.push(
				`${rs.benefitSlug}: búsqueda no muestra el enlace a su ficha`,
			);
		const li = page
			.locator(".explorer-item")
			.filter({ hasText: item.displayTitle });
		if (
			!(await li
				.locator(".explorer-badge")
				.first()
				.isVisible()
				.catch(() => false))
		)
			errors.push(
				`${rs.benefitSlug}: falta la marca «comprobada requisito a requisito»`,
			);
	}
	await findings("inventario-nivel-1", errors);
});

test("enlaces internos: todo /ayudas/<slug>/ enlazado existe en el export", async ({
	request,
}) => {
	const errors: string[] = [];
	const hrefs = new Set<string>();
	for (const p of ["/", "/ayudas/", "/explorar/"]) {
		const html = await (await request.get(url(p))).text();
		for (const m of html.matchAll(/href="([^"]*\/ayudas\/[^"#?]+?\/)"/g))
			hrefs.add(m[1]);
	}
	for (const href of hrefs) {
		const response = await request.get(href);
		if (!response.ok())
			errors.push(`${href}: enlace interno roto (${response.status()})`);
	}
	await findings("enlaces-internos-ayudas", errors);
});

test("persona positiva: cada programa se muestra en resultados de comprobar", async ({
	browser,
}, testInfo) => {
	// Barrido por los 50 programas: una sola pasada por motor de escritorio
	// basta — en proyectos móviles emulados duplica minutos sin añadir
	// cobertura (la UI del flujo ya se prueba en comprobar/visual).
	test.skip(
		/mobile|tablet|small-reflow/.test(testInfo.project.name),
		"el barrido corre en escritorio; en móvil lo cubren comprobar/visual",
	);
	// 50 flujos reales de 10 pasos en un mismo test: ~2,5 min en frío,
	// >5 min con la máquina cargada — margen de sobra para el CI.
	test.setTimeout(480_000);
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
			// F10-RES-3: puede no haber tarjetas abiertas (todo en filas
			// compactas) — vale cualquiera de las dos formas de resultado.
			// «attached», no «visible»: las filas plegadas dentro de
			// <details> también cuentan (se despliegan justo después).
			await page.waitForSelector(".aid-card, .row-line", {
				timeout: 15000,
				state: "attached",
			});
			const closed = page.getByRole("button", {
				name: /Mostrar ayudas cerradas/,
			});
			if (await closed.isVisible()) await closed.click();
			// El grupo «no se puede descartar» va plegado desde F10-RES: se abre
			// para comprobar que la ayuda golden aparece también ahí.
			for (const d of await page.locator(".results-closed > summary").all())
				await d.click();
			// F10-RES-3: la ayuda golden puede pintarse como tarjeta abierta
			// (encaja/podría encajar) o como fila compacta («solo si…», las
			// plegadas «sin descartar» o las que dependen de un dato). En
			// ningún caso puede estar en «No parece aplicarte» (no se renderiza
			// hasta abrirlo, así que todo enlace visible es un acierto).
			const href = url(`/ayudas/${slug}/`);
			const card = page
				.locator(".results-list .aid-card")
				.filter({ has: page.locator(`a[href="${href}"]`) });
			const row = page
				.locator(".row-line")
				.filter({ has: page.locator(`a[href="${href}"]`) });
			if ((await card.count()) === 0 && (await row.count()) === 0) {
				errors.push(
					`${slug}: no aparece en resultados (ni tarjeta abierta ni fila compacta)`,
				);
			} else if ((await card.count()) > 0) {
				const header = await card.first().locator("h2").innerText();
				if (!/Encaja|Posible|Probable/i.test(header))
					errors.push(
						`${slug}: golden ${golden.goldenId} positivo en motor, pero tras formulario muestra «${header}»`,
					);
			}
		} catch (e) {
			errors.push(`${slug}: ${String(e).slice(0, 300)}`);
		} finally {
			await ctx.close();
		}
	}
	await findings("resultados-positivos", errors);
});

// ADR-052: el nivel 2 es un catálogo con enlace oficial, sin página propia.
// El criterio es «aparece en /explorar/ con enlace oficial HTTPS».
test("inventario nivel 2: cada entrada aparece en explorar con enlace oficial HTTPS (ADR-052)", async ({
	page,
	request,
}) => {
	test.setTimeout(240_000);
	const errors: string[] = [];
	await page.goto(url("/explorar/"));
	await expect(page.locator(".explorer-count")).not.toHaveText("Cargando…");
	for (const item of level2) {
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
