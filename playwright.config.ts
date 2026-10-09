import { defineConfig, devices } from "@playwright/test";

// 4321 is shared with whatever else runs locally; when it is taken by another
// project, `reuseExistingServer` would silently drive that server and every
// assertion fails. E2E_PORT lets the run pick a free port instead.
const port = Number(process.env.E2E_PORT ?? 4321);

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 45_000,
	retries: 0,
	// La suite visual genera un test por página×tema; sin esto corren en
	// serie dentro del mismo fichero.
	fullyParallel: true,
	reporter: "list",
	use: {
		baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${port}`,
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
	},
	// E2E_BASE_URL points at an external deployment; locally the static export
	// in out/ is served with scripts/serve-export.mjs.
	webServer: process.env.E2E_BASE_URL
		? undefined
		: {
				command: `node scripts/serve-export.mjs --port ${port}`,
				port,
				reuseExistingServer: true,
			},
	// Matriz de navegadores/dispositivos: docs/10 §2.
	projects: [
		{
			name: "desktop-chromium",
			use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } },
		},
		{
			name: "desktop-firefox",
			use: { ...devices["Desktop Firefox"], viewport: { width: 1366, height: 768 } },
		},
		{
			name: "desktop-webkit",
			use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
		},
		{ name: "mobile-android", use: { ...devices["Pixel 7"] } },
		{ name: "mobile-android-s9", use: { ...devices["Galaxy S9+"] } },
		{ name: "mobile-ios", use: { ...devices["iPhone 14"] } },
		{ name: "mobile-ios15", use: { ...devices["iPhone 15"] } },
		{ name: "mobile-iphonese", use: { ...devices["iPhone SE"] } },
		// Firefox móvil: no hay perfiles de dispositivo Firefox; se emula con
		// viewport + isMobile + hasTouch.
		{
			name: "mobile-firefox",
			use: {
				...devices["Desktop Firefox"],
				viewport: { width: 412, height: 915 },
				isMobile: true,
				hasTouch: true,
				deviceScaleFactor: 2.625,
			},
		},
		{ name: "tablet-ios", use: { ...devices["iPad Mini"] } },
		{
			name: "small-reflow",
			use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 640 } },
		},
		{
			name: "dark",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 390, height: 844 },
				colorScheme: "dark",
			},
		},
		{
			name: "forced-colors",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1366, height: 768 },
				forcedColors: "active",
			},
		},
		{
			name: "reduced-motion",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 390, height: 844 },
				reducedMotion: "reduce",
			},
		},
	],
});
