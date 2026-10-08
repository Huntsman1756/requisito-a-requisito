import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	// GitHub Pages sirve el proyecto en /<repo>/; en local y CI se construye en la raíz.
	basePath: process.env.BASE_PATH ?? "",
	// Repo lives inside a parent dir with its own lockfile; pin the root
	// so Next doesn't warn about workspace detection.
	outputFileTracingRoot: import.meta.dirname,
	images: {
		unoptimized: true,
	},
	distDir: ".next",
	env: {
		// basePath también en cliente: los fetch a /datos/* los hace el navegador
		// (el asistente carga el bundle en runtime; sin esto, en Pages pedían
		// /datos/… en la raíz del dominio → 404 → «No hemos podido cargar»).
		NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH ?? "",
	},
};

export default nextConfig;
