import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Observatorio" };

const OUT = "public/datos/elegibilidad";

export default function Observatorio() {
	const rulesDir = join(process.cwd(), "data/eligibility/rules");
	const rules = readdirSync(rulesDir).filter((f) => f.endsWith(".json"));
	const manifest = JSON.parse(
		readFileSync(join(process.cwd(), "data/eligibility/bundle/manifest.json"), "utf8"),
	);
	let l2 = { items: [] as { accessState?: string; scope?: string }[] };
	try {
		l2 = JSON.parse(readFileSync(join(process.cwd(), OUT, "nivel-2.json"), "utf8"));
	} catch {
		/* aún no generado */
	}
	const sources = JSON.parse(
		readFileSync(join(process.cwd(), "data/eligibility/sources/registry.json"), "utf8"),
	);
	const byState = l2.items.reduce<Record<string, number>>((acc, i) => {
		const k = i.accessState ?? "UNKNOWN";
		acc[k] = (acc[k] ?? 0) + 1;
		return acc;
	}, {});
	const byScope = l2.items.reduce<Record<string, number>>((acc, i) => {
		const k = i.scope ?? "estatal";
		acc[k] = (acc[k] ?? 0) + 1;
		return acc;
	}, {});

	return (
		<section className="shell" aria-labelledby="observatorio-title">
			<h1 id="observatorio-title">Observatorio</h1>
			<p className="lede">
				Qué hay detrás: cuántas ayudas comprobamos, de dónde salen los datos y
				cuándo se verificaron por última vez.
			</p>

			<h2>Ayudas comprobadas requisito a requisito</h2>
			<p>
				{manifest.included.length} programas con reglas verificables. Cada
				afirmación enlaza a la norma oficial.
			</p>

			<h2>Catálogo relacionado (sin comprobar requisitos)</h2>
			<p>{l2.items.length} programas con enlace a la fuente oficial.</p>
			<ul>
				{Object.entries(byState).map(([k, v]) => (
					<li key={k}>
						{k}: {v}
					</li>
				))}
			</ul>
			<ul>
				{Object.entries(byScope).map(([k, v]) => (
					<li key={k}>
						{k}: {v}
					</li>
				))}
			</ul>

			<h2>Fuentes oficiales usadas</h2>
			<p>{sources.sources?.length ?? 0} dominios oficiales registrados.</p>

			<h2>Última verificación</h2>
			<p>
				Las reglas se verificaron el {manifest.generatedAt?.slice(0, 10) ?? "—"}.{" "}
				<a href="/datos/elegibilidad/manifest.json">Manifiesto del bundle</a> ·{" "}
				<Link href="/explorar">Explorar el catálogo</Link>
			</p>

			<p className="legal">
				Este observatorio se genera automáticamente con cada publicación.
			</p>
		</section>
	);
}
