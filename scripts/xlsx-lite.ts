/**
 * xlsx-lite.ts — lector mínimo de .xlsx sin dependencias (solo zlib de Node).
 * Suficiente para los ficheros INE codmun: hojas con filas <row><c><v>.
 */

import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

interface ZipEntry {
	name: string;
	method: number;
	compressedSize: number;
	localOffset: number;
}

function zipEntries(buf: Buffer): ZipEntry[] {
	let i = buf.length - 22;
	for (; i > 0 && buf.readUInt32LE(i) !== 0x06054b50; i--);
	const count = buf.readUInt16LE(i + 10);
	let off = buf.readUInt32LE(i + 16);
	const out: ZipEntry[] = [];
	for (let k = 0; k < count; k++) {
		const nameLen = buf.readUInt16LE(off + 28);
		out.push({
			name: buf.subarray(off + 46, off + 46 + nameLen).toString(),
			method: buf.readUInt16LE(off + 10),
			compressedSize: buf.readUInt32LE(off + 20),
			localOffset: buf.readUInt32LE(off + 42),
		});
		off += 46 + nameLen + buf.readUInt16LE(off + 30) + buf.readUInt16LE(off + 32);
	}
	return out;
}

function zipRead(buf: Buffer, name: string): Buffer | null {
	const e = zipEntries(buf).find((x) => x.name === name);
	if (!e) return null;
	const nameLen = buf.readUInt16LE(e.localOffset + 26);
	const extraLen = buf.readUInt16LE(e.localOffset + 28);
	const data = buf.subarray(
		e.localOffset + 30 + nameLen + extraLen,
		e.localOffset + 30 + nameLen + extraLen + e.compressedSize,
	);
	return e.method === 8 ? inflateRawSync(data) : data;
}

const decodeXml = (s: string): string =>
	s
		.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number.parseInt(d, 10)))
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, "&");

export interface XlsxSheet {
	name: string;
	path: string;
}

export function xlsxSheetList(path: string): XlsxSheet[] {
	const buf = readFileSync(path);
	const wb = zipRead(buf, "xl/workbook.xml")?.toString("utf8") ?? "";
	const rels = zipRead(buf, "xl/_rels/workbook.xml.rels")?.toString("utf8") ?? "";
	const relMap = new Map(
		[...rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((m) => [
			m[1],
			m[2].startsWith("/") ? m[2].slice(1) : `xl/${m[2]}`,
		]),
	);
	return [...wb.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].map(
		(m) => ({ name: decodeXml(m[1]), path: relMap.get(m[2]) ?? "" }),
	);
}

export function xlsxRows(path: string, sheetPath: string): string[][] {
	const buf = readFileSync(path);
	const shared = zipRead(buf, "xl/sharedStrings.xml")?.toString("utf8") ?? "";
	const sharedStrings = [...shared.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
		decodeXml(
			[...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
				.map((t) => t[1])
				.join(""),
		),
	);
	const xml = zipRead(buf, sheetPath)?.toString("utf8") ?? "";
	return [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
		const cells: string[] = [];
		for (const c of row[1].matchAll(
			/<c(?:\s[^>]*)?>([\s\S]*?)<\/c>|<c(?:\s[^>]*)?\/>/g,
		)) {
			const tag = c[0];
			const typeMatch = tag.match(/t="([^"]+)"/);
			const t = typeMatch?.[1];
			const v = c[1]?.match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1];
			const is = c[1]?.match(/<is><t[^>]*>([\s\S]*?)<\/t><\/is>/)?.[1];
			let val = "";
			if (is !== undefined) val = decodeXml(is);
			else if (t === "s" && v !== undefined) val = sharedStrings[Number(v)] ?? "";
			else if (v !== undefined) val = decodeXml(v);
			cells.push(val);
		}
		return cells;
	});
}
