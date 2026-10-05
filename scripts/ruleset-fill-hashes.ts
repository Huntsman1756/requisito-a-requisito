/**
 * ruleset-fill-hashes.ts — rellena `excerptSha256` en los RuleSets
 * (sha256 UTF-8 del extracto literal, que debe estar en el .txt
 * normalizado de su fuente; G4 lo verifica de nuevo).
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RULES = "data/eligibility/rules";
const SOURCES = "data/eligibility/sources";

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

function fixCitations(node: unknown, texts: Map<string, string>, file: string): number {
	let missing = 0;
	if (Array.isArray(node)) {
		for (const x of node) missing += fixCitations(x, texts, file);
	} else if (node && typeof node === "object") {
		const o = node as Record<string, unknown>;
		if (typeof o.excerpt === "string" && typeof o.sourceId === "string") {
			const txt = texts.get(o.sourceId);
			if (txt === undefined) {
				console.error(`${file}: sin snapshot para sourceId ${o.sourceId}`);
				missing++;
			} else if (!txt.includes(o.excerpt)) {
				console.error(
					`${file}: extracto NO encontrado en ${o.sourceId}.txt: «${o.excerpt.slice(0, 80)}…»`,
				);
				missing++;
			}
			o.excerptSha256 = sha(o.excerpt);
		}
		for (const v of Object.values(o)) missing += fixCitations(v, texts, file);
	}
	return missing;
}

if (process.argv[1]?.endsWith("ruleset-fill-hashes.ts")) {
	const texts = new Map<string, string>();
	for (const f of readdirSync(SOURCES).filter((x) => x.endsWith(".txt"))) {
		texts.set(f.replace(/\.txt$/, ""), readFileSync(join(SOURCES, f), "utf8"));
	}
	let missing = 0;
	const files = process.argv.slice(2).filter((f) => f.endsWith(".json"));
	for (const f of files.length ? files : readdirSync(RULES).filter((x) => x.endsWith(".json")).map((x) => join(RULES, x))) {
		const raw = readFileSync(f, "utf8");
		const rs = JSON.parse(raw);
		missing += fixCitations(rs, texts, f);
		writeFileSync(f, `${JSON.stringify(rs, null, "\t")}\n`);
	}
	if (missing > 0) {
		console.error(`${missing} extractos no encontrados`);
		process.exit(1);
	}
	console.log("excerptSha256 rellenados y verificados contra snapshots");
}
