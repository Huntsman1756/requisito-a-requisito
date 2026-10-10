import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * rutas-humo.spec.ts — F10-FRONT-FINAL: humo de TODAS las rutas del export.
 *
 * El bug del espejo (/datos/ → 404 por `try_files $uri =404` sin `$uri/`)
 * solo afectaba a las rutas de DIRECTORIO en nginx; un humo por index.html
 * lo habría detectado. Localmente recorre out/; contra Pages o el espejo
 * (E2E_BASE_URL) pide la misma lista y exige 200 en todas.
 *
 * Uso:  npx playwright test rutas-humo                       (export local)
 *       E2E_BASE_URL=https://requisito.h1756.es npx playwright test rutas-humo
 *       E2E_BASE_URL=https://huntsman1756.github.io/requisito-a-requisito …
 */

const BASE = (process.env.E2E_BASE_URL ?? "").replace(/\/$/, "");

function exportRoutes(): string[] {
	const out = join(process.cwd(), "out");
	const routes: string[] = [];
	const walk = (d: string, prefix: string) => {
		for (const e of readdirSync(d, { withFileTypes: true })) {
			if (e.isDirectory()) walk(join(d, e.name), `${prefix}${e.name}/`);
			else if (e.name === "index.html") routes.push(prefix);
		}
	};
	if (existsSync(out)) walk(out, "/");
	return routes;
}

test.describe("humo de rutas", () => {
	test("cada index.html del export responde 200", async ({ request }) => {
		let routes = exportRoutes();
		if (routes.length === 0) {
			// Sin out/ local (p. ej. solo contra el despliegue): reconstruye
			// la lista desde los datos publicados.
			const fixed = [
				"/",
				"/comprobar/",
				"/ayudas/",
				"/explorar/",
				"/observatorio/",
				"/datos/",
				"/como-funciona/",
				"/como-verificamos/",
			];
			const n1 = await (
				await request.get(`${BASE}/datos/elegibilidad/nivel-1.json`)
			).json();
			routes = [
				...fixed,
				...(n1.items ?? []).map(
					(i: { slug: string }) => `/ayudas/${i.slug}/`,
				),
			];
		}
		expect(routes.length).toBeGreaterThan(20);
		const failures: string[] = [];
		for (const route of routes) {
			const res = await request.get(`${BASE}${route}`);
			if (res.status() !== 200)
				failures.push(`${route} → ${res.status()}`);
		}
		expect(failures).toEqual([]);
	});

	test("una ruta inexistente devuelve la 404 propia", async ({ request }) => {
		const res = await request.get(`${BASE}/ruta-que-no-existe-rr/`);
		expect(res.status()).toBe(404);
		expect(await res.text()).toContain("Esta página no existe");
	});
});
