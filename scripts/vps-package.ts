/**
 * vps-package.ts — empaqueta out/ para el espejo del VPS (ADR-053).
 *
 * Produce en <destDir>:
 *   - site.tar.gz   (el export completo, sin prefijo de basePath)
 *   - manifest.json { commit, at, mode, siteSha256, bundleDigest,
 *                     bundleSha256, files }
 *
 * El VPS solo descarga (modelo pull): verifica siteSha256 y bundleSha256 del
 * manifiesto, y en modo strict exige humanReview=approved en todas las
 * reglas (la misma puerta que release:verify, fail-closed).
 *
 * Comprobaciones aquí (fail-closed):
 *   - out/ contiene index.html, 404.html y datos/elegibilidad/bundle.json;
 *   - ningún .html contiene el prefijo de Pages `/requisito-a-requisito`
 *     (el espejo sirve en la raíz de requisito.h1756.es);
 *   - bundleDigest del manifiesto público coincide con el contenido real.
 *
 * Uso: npx tsx scripts/vps-package.ts [outDir=out] [destDir=artifacts]
 *        [commit] [mode=normal|strict]
 */

import { execFileSync } from "node:child_process";
import {
	createHash,
} from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const PAGES_PREFIX = "/requisito-a-requisito";

const sha256 = (buf: Buffer) =>
	createHash("sha256").update(buf).digest("hex");

function* walkHtml(dir: string): Generator<string> {
	for (const f of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, f.name);
		if (f.isDirectory()) yield* walkHtml(p);
		else if (f.name.endsWith(".html")) yield p;
	}
}

export interface VpsManifest {
	commit: string;
	at: string;
	mode: "normal" | "strict";
	siteSha256: string;
	bundleDigest: string;
	bundleSha256: string;
	files: { site: string; manifest: string };
}

export function packageVps(
	outDir = "out",
	destDir = "artifacts",
	commit = "unknown",
	mode: "normal" | "strict" = "normal",
): VpsManifest {
	const errors: string[] = [];

	for (const f of ["index.html", "404.html", "datos/elegibilidad/bundle.json"])
		if (!existsSync(join(outDir, f))) errors.push(`falta ${f} en ${outDir}`);
	if (errors.length) throw new Error(`vps-package: ${errors.join("; ")}`);

	// El espejo sirve en la raíz: el prefijo de Pages no debe aparecer como
	// ruta interna (href="/repo/…", src="…", url('…')). Los enlaces
	// externos a github.com/Huntsman1756/requisito-a-requisito son válidos:
	// van precedidos de «/», no de comilla.
	const internalPrefix = /["'(:]\/requisito-a-requisito\//;
	const withPrefix: string[] = [];
	for (const html of walkHtml(outDir))
		if (internalPrefix.test(readFileSync(html, "utf8")))
			withPrefix.push(html.slice(outDir.length + 1));
	if (withPrefix.length)
		throw new Error(
			`vps-package: ${withPrefix.length} HTML con el prefijo ${PAGES_PREFIX} ` +
				`(ej.: ${withPrefix[0]}) — el export para el VPS se construye con BASE_PATH vacío`,
		);

	const bundle = readFileSync(join(outDir, "datos/elegibilidad/bundle.json"));
	const bundleSha256 = sha256(bundle);
	const pubManifest = JSON.parse(
		readFileSync(join(outDir, "datos/elegibilidad/manifest.json"), "utf8"),
	) as { bundleDigest?: string };
	const bundleDigest = pubManifest.bundleDigest ?? "";
	if (!bundleDigest) throw new Error("vps-package: manifest sin bundleDigest");
	if (bundleDigest !== bundleSha256)
		throw new Error(
			`vps-package: bundleDigest del manifiesto (${bundleDigest.slice(0, 12)}…) ` +
				`!= sha256 de bundle.json (${bundleSha256.slice(0, 12)}…)`,
		);

	mkdirSyncOrThrow(destDir);
	const tarPath = join(destDir, "site.tar.gz");
	// Rutas relativas + cwd: en Windows, GNU tar interpreta `F:\…` como host
	// remoto en -f y falla de forma errática en -C. Todo relativo evita ambos.
	execFileSync(
		"tar",
		["-czf", relative(outDir, tarPath), "."],
		{ cwd: outDir },
	);
	const siteSha256 = sha256(readFileSync(tarPath));

	// El tar se puede abrir y tiene index.html en la raíz.
	const list = execFileSync("tar", ["-tzf", "site.tar.gz"], {
		cwd: destDir,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	if (!list.split("\n").some((l) => l === "./index.html" || l === "index.html"))
		throw new Error("vps-package: el tar no contiene ./index.html");

	const manifest: VpsManifest = {
		commit,
		at: new Date().toISOString(),
		mode,
		siteSha256,
		bundleDigest,
		bundleSha256,
		files: { site: "site.tar.gz", manifest: "manifest.json" },
	};
	writeFileSync(
		join(destDir, "manifest.json"),
		`${JSON.stringify(manifest, null, 2)}\n`,
	);
	return manifest;
}

function mkdirSyncOrThrow(dir: string) {
	if (existsSync(dir) && !statSync(dir).isDirectory())
		throw new Error(`vps-package: ${dir} existe y no es un directorio`);
	mkdirSync(dir, { recursive: true });
}

if (process.argv[1]?.endsWith("vps-package.ts")) {
	const [, , outDir, destDir, commit, mode] = process.argv;
	const m = packageVps(
		outDir ?? "out",
		destDir ?? "artifacts",
		commit ?? "unknown",
		(mode as "normal" | "strict") ?? "normal",
	);
	console.log(
		`vps-package: ${m.files.site} sha256=${m.siteSha256.slice(0, 12)}… ` +
			`bundle=${m.bundleDigest.slice(0, 12)}… commit=${m.commit} mode=${m.mode}`,
	);
}
