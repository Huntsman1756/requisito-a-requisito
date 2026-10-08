import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: ["**/.tmp/**", "**/a11y/**", "**/e2e/**", "**/node_modules/**"],
		maxWorkers: 4,
		// validate.test.ts corre validateEligibility completo por gate; con la
		// suite ampliada (goldens en npm test) 5s no bastan en máquinas cargadas.
		testTimeout: 20000,
	},
});
