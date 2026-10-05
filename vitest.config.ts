import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: ["**/.tmp/**", "**/a11y/**", "**/e2e/**", "**/node_modules/**"],
		maxWorkers: 4,
	},
});
