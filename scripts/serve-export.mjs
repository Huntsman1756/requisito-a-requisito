#!/usr/bin/env node
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve(process.cwd(), "out");
const index = process.argv.indexOf("--port");
const port = Number(index < 0 ? 4321 : process.argv[index + 1]);
const types = {
	".html": "text/html; charset=utf-8",
	".css": "text/css",
	".js": "application/javascript",
	".json": "application/json",
	".xml": "application/xml",
	".txt": "text/plain; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".ico": "image/x-icon",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
};
const server = createServer((request, response) => {
	try {
		if (!["GET", "HEAD"].includes(request.method)) {
			response.writeHead(405).end();
			return;
		}
		let pathname = decodeURIComponent(
			new URL(request.url, "http://localhost").pathname,
		);
		// En producción todo va bajo BASE_PATH ("/requisito-a-requisito"); en
		// local lo aceptamos también como prefijo para que las rutas absolutas
		// (p. ej. fuentes) resuelvan igual.
		if (pathname.startsWith("/requisito-a-requisito/")) {
			pathname = pathname.slice("/requisito-a-requisito".length);
		}
		let path = resolve(root, `.${pathname}`);
		if (path !== root && !path.startsWith(root + sep)) {
			response.writeHead(403).end();
			return;
		}
		try {
			if (statSync(path).isDirectory()) path = resolve(path, "index.html");
		} catch {
			if (!extname(path)) path += ".html";
		}
		const stat = statSync(path);
		if (!stat.isFile()) {
			response.writeHead(404).end();
			return;
		}
		response.writeHead(200, {
			"content-type": types[extname(path)] ?? "application/octet-stream",
			"content-length": stat.size,
			"x-content-type-options": "nosniff",
		});
		if (request.method === "HEAD") {
			response.end();
			return;
		}
		createReadStream(path)
			.on("error", () => response.destroy())
			.pipe(response);
	} catch {
		response.writeHead(404).end();
	}
});
server.keepAliveTimeout = 60_000;
server.listen(port, "127.0.0.1", () =>
	console.log(`Static export preview http://127.0.0.1:${port}`),
);
