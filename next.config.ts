import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	// Repo lives inside a parent dir with its own lockfile; pin the root
	// so Next doesn't warn about workspace detection.
	outputFileTracingRoot: import.meta.dirname,
	images: {
		unoptimized: true,
	},
	distDir: ".next",
	env: {},
};

export default nextConfig;
