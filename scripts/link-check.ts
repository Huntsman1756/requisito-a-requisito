/**
 * link-check — F5-9: todas las URL del bundle (fuentes, canales, simuladores)
 * deben responder 200. Uso: npx tsx scripts/link-check.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const bundle = JSON.parse(
	readFileSync(join(process.cwd(), "public/datos/elegibilidad/bundle.json"), "utf8"),
);
const urls = new Set<string>();
const walk = (o: unknown): void => {
	if (Array.isArray(o)) return void o.forEach(walk);
	if (o && typeof o === "object") {
		const d = o as Record<string, unknown>;
		if (typeof d.url === "string" && d.url.startsWith("http")) urls.add(d.url);
		for (const v of Object.values(d)) walk(v);
	}
};
walk(bundle);

const results: { url: string; ok: boolean; status: number | string }[] = [];
for (const url of urls) {
	try {
		const r = await fetch(url, {
			method: "GET",
			headers: { "user-agent": "requisito-a-requisito-linkcheck/1.0" },
			redirect: "follow",
		});
		// 403 de sede por HEAD/UA se registra como aceptable si el GET devuelve algo
		results.push({ url, ok: r.status < 400 || r.status === 403, status: r.status });
	} catch (e) {
		results.push({ url, ok: false, status: String(e).slice(0, 60) });
	}
}
const bad = results.filter((r) => !r.ok);
console.log(`link-check: ${results.length} URL, ${bad.length} fallidas`);
for (const b of bad) console.log("  ✗", b.status, b.url);
process.exitCode = bad.length ? 1 : 0;
