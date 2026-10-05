/**
 * eligibility-snapshot.ts — F1-3 (docs/08 §2)
 *
 * Descarga una fuente oficial, calcula sha256 de los bytes, extrae el texto,
 * lo normaliza y deja en data/eligibility/sources/<id>.json + <id>.txt.
 * Los bytes se guardan en F:\AgentState\datawardsmadrid\snapshots\<sha256>.<ext>
 * (fuera del repo).
 *
 * Uso: npm run eligibility:snapshot -- --url <u> --id <id> --rank <1-4>
 *      [--content-type <mime>] [--expect <sha256>] [--published-at <fecha>]
 *      [--eli <eli>] [--sources-dir <d>] [--snapshots-dir <d>]
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { matchDomain } from "../src/lib/eligibility-engine/domains";
import type { SourceRegistry, SourceSnapshot } from "../src/lib/eligibility-engine/schema";
import { sourceSnapshotSchema } from "../src/lib/eligibility-engine/schema";
import { normalizeText } from "../src/lib/eligibility-engine/text-normalize";

export class SnapshotError extends Error {
	constructor(
		public readonly code: string,
		message: string,
	) {
		super(`${code}: ${message}`);
		this.name = "SnapshotError";
	}
}

export type FetchBytes = (url: string) => Promise<{
	bytes: Buffer;
	contentType: string;
}>;

export interface SnapshotOptions {
	url: string;
	id: string;
	rank: 1 | 2 | 3 | 4;
	registry: SourceRegistry;
	fetchBytes?: FetchBytes;
	expect?: string;
	publishedAt?: string;
	eli?: string;
	sourcesDir: string;
	snapshotsDir: string;
}

const sha256 = (b: Buffer | string) =>
	createHash("sha256").update(b).digest("hex");

// --- Extracción de texto ------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
	nbsp: " ", iexcl: "¡", iquest: "¿", aacute: "á", eacute: "é",
	iacute: "í", oacute: "ó", uacute: "ú", Aacute: "Á", Eacute: "É",
	Iacute: "Í", Oacute: "Ó", Uacute: "Ú", ntilde: "ñ", Ntilde: "Ñ",
	uuml: "ü", Uuml: "Ü", ccedil: "ç", ordm: "º", orden: "ª",
	laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘",
	rsquo: "’", mdash: "—", ndash: "–", hellip: "…", amp: "&",
	lt: "<", gt: ">", quot: '"', apos: "'", euro: "€",
};

function decodeEntities(s: string): string {
	return s
		.replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
			String.fromCodePoint(Number.parseInt(h, 16)),
		)
		.replace(/&#(\d+);/g, (_, d) =>
			String.fromCodePoint(Number.parseInt(d, 10)),
		)
		.replace(
			/&([a-zA-Z]+);/g,
			(m, name) => NAMED_ENTITIES[name] ?? m,
		);
}

export function htmlToText(html: string): string {
	let s = html;
	s = s.replace(/<script[\s\S]*?<\/script\s*>/gi, " ");
	s = s.replace(/<style[\s\S]*?<\/style\s*>/gi, " ");
	s = s.replace(/<noscript[\s\S]*?<\/noscript\s*>/gi, " ");
	s = s.replace(/<!--[\s\S]*?-->/g, " ");
	s = s.replace(/<br\s*\/?>/gi, "\n");
	s = s.replace(/<\/(p|div|li|tr|h[1-6]|section|article|table|ul|ol)>/gi, "\n");
	s = s.replace(/<[^>]+>/g, " ");
	return normalizeText(decodeEntities(s));
}

async function pdfToText(bytes: Buffer): Promise<string> {
	const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
	const doc = await getDocument({
		data: new Uint8Array(bytes),
		disableFontFace: true,
		useSystemFonts: false,
	}).promise;
	const parts: string[] = [];
	for (let i = 1; i <= doc.numPages; i++) {
		const page = await doc.getPage(i);
		const tc = await page.getTextContent();
		parts.push(tc.items.map((it) => ("str" in it ? it.str : "")).join(" "));
	}
	return normalizeText(parts.join("\n"));
}

export async function extractText(
	bytes: Buffer,
	contentType: string,
): Promise<string> {
	const ct = contentType.toLowerCase();
	if (ct.includes("pdf") || bytes.subarray(0, 5).toString() === "%PDF-") {
		return pdfToText(bytes);
	}
	const text = bytes.toString("utf8");
	if (ct.includes("html") || /<\s*html[\s>]/i.test(text)) {
		return htmlToText(text);
	}
	return normalizeText(text);
}

// --- Descarga por defecto ------------------------------------------------------

const defaultFetch: FetchBytes = async (url) => {
	const res = await fetch(url, { redirect: "follow" });
	if (!res.ok) {
		throw new SnapshotError(
			"ELIG_FETCH_FAILED",
			`HTTP ${res.status} al descargar ${url}`,
		);
	}
	return {
		bytes: Buffer.from(await res.arrayBuffer()),
		contentType: res.headers.get("content-type") ?? "",
	};
};

// --- Núcleo --------------------------------------------------------------------

export async function snapshotSource(
	opts: SnapshotOptions,
): Promise<SourceSnapshot> {
	const { url, id, rank, registry, expect, sourcesDir, snapshotsDir } = opts;
	if (!/^https:\/\//.test(url)) {
		throw new SnapshotError("ELIG_URL_NOT_HTTPS", `url no https: ${url}`);
	}
	const host = new URL(url).hostname.toLowerCase();
	if (!matchDomain(host, registry.domains)) {
		throw new SnapshotError(
			"ELIG_DOMAIN_NOT_REGISTERED",
			`dominio no registrado: ${host}`,
		);
	}
	const { bytes, contentType } = await (opts.fetchBytes ?? defaultFetch)(url);
	if (bytes.length === 0) {
		throw new SnapshotError("ELIG_EMPTY_DOWNLOAD", `descarga vacía: ${url}`);
	}
	const digest = sha256(bytes);
	if (expect && expect !== digest) {
		throw new SnapshotError(
			"ELIG_SHA_MISMATCH",
			`esperado ${expect}, obtenido ${digest}`,
		);
	}

	const text = await extractText(bytes, contentType);
	if (!text) {
		throw new SnapshotError(
			"ELIG_EMPTY_TEXT",
			`la extracción no produjo texto: ${url}`,
		);
	}

	mkdirSync(sourcesDir, { recursive: true });
	mkdirSync(snapshotsDir, { recursive: true });

	const ext = contentType.includes("pdf")
		? ".pdf"
		: contentType.includes("html")
			? ".html"
			: ".bin";
	writeFileSync(join(snapshotsDir, `${digest}${ext}`), bytes);
	// sha256(<id>.txt) == textSha256: el fichero ES el texto normalizado.
	writeFileSync(join(sourcesDir, `${id}.txt`), text);

	const meta: SourceSnapshot = sourceSnapshotSchema.parse({
		id,
		url,
		fetchedAt: new Date().toISOString(),
		sha256: digest,
		textSha256: sha256(text),
		contentType,
		rank,
		...(opts.publishedAt ? { publishedAt: opts.publishedAt } : {}),
		...(opts.eli ? { eli: opts.eli } : {}),
	});
	writeFileSync(
		join(sourcesDir, `${id}.json`),
		`${JSON.stringify(meta, null, 2)}\n`,
	);
	return meta;
}

// --- CLI ------------------------------------------------------------------------

function argValue(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1]?.endsWith("eligibility-snapshot.ts")) {
	const url = argValue("url");
	const id = argValue("id");
	const rank = Number(argValue("rank") ?? "0");
	const expectSha = argValue("expect");
	const publishedAt = argValue("published-at");
	const eli = argValue("eli");
	const sourcesDir =
		argValue("sources-dir") ??
		join(process.cwd(), "data", "eligibility", "sources");
	const snapshotsDir =
		argValue("snapshots-dir") ??
		"F:/AgentState/datawardsmadrid/snapshots";
	if (!url || !id || ![1, 2, 3, 4].includes(rank)) {
		console.error(
			"uso: --url <https> --id <sourceId> --rank <1-4> [--expect <sha256>] [--published-at <fecha>] [--eli <eli>]",
		);
		process.exit(2);
	}
	const registry = JSON.parse(
		await import("node:fs").then((fs) =>
			fs.readFileSync(join(sourcesDir, "registry.json"), "utf8"),
		),
	);
	try {
		const meta = await snapshotSource({
			url,
			id,
			rank: rank as 1 | 2 | 3 | 4,
			registry,
			expect: expectSha,
			publishedAt,
			eli,
			sourcesDir,
			snapshotsDir,
		});
		console.log(
			`snapshot ${meta.id}: ${meta.sha256.slice(0, 12)}… text ${meta.textSha256.slice(0, 12)}… (${meta.contentType})`,
		);
	} catch (e) {
		if (e instanceof SnapshotError) {
			console.error(e.message);
			process.exit(1);
		}
		throw e;
	}
}
