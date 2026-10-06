import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { formatDateEs } from "../../lib/format";

export const metadata: Metadata = { title: "Observatorio" };

const OUT = "public/datos/elegibilidad";

export default function Observatorio() {
	const rulesDir = join(process.cwd(), "data/eligibility/rules");
	const rules = readdirSync(rulesDir).filter((f) => f.endsWith(".json"));
	const manifest = JSON.parse(
		readFileSync(join(process.cwd(), "data/eligibility/bundle/manifest.json"), "utf8"),
	);
	const l2 = JSON.parse(
		readFileSync(join(process.cwd(), OUT, "nivel-2.json"), "utf8"),
	);
	const sources = JSON.parse(
		readFileSync(join(process.cwd(), "data/eligibility/sources/registry.json"), "utf8"),
	);
	let verified = "";
	for (const f of rules) {
		const d = JSON.parse(readFileSync(join(rulesDir, f), "utf8"));
		if (!verified || d.verifiedAt > verified) verified = d.verifiedAt;
	}
	const byState = (l2.items as { accessState?: string }[]).reduce<Record<string, number>>((acc, i) => {
		const k = i.accessState ?? "UNKNOWN";
		acc[k] = (acc[k] ?? 0) + 1;
		return acc;
	}, {});
	const byScope = (l2.items as { scope?: string }[]).reduce<Record<string, number>>((acc, i) => {
		const k = i.scope ?? "estatal";
		acc[k] = (acc[k] ?? 0) + 1;
		return acc;
	}, {});
	// Frescura: última corrida del job diario (data/freshness/runs.jsonl)
	let lastRun: { date: string; checked: number; skipped?: string[]; stale: string[] } | null = null;
	try {
		const lines = readFileSync(join(process.cwd(), "data/freshness/runs.jsonl"), "utf8")
			.trim()
			.split("\n");
		lastRun = JSON.parse(lines[lines.length - 1]);
	} catch {
		lastRun = null;
	}
	const dailyCount = lastRun ? lastRun.checked : null;
	const periodicCount = lastRun ? (lastRun.skipped?.length ?? 0) : null;
	const staleCount = lastRun ? lastRun.stale.length : null;

	return (
		<section className="shell band" aria-labelledby="observatorio-title" style={{ borderTop: 0 }}>
			<h1 id="observatorio-title">Observatorio</h1>
			<p className="lede">
				Qué cubrimos, de dónde sale y qué ha cambiado. Estas cifras se generan
				con cada publicación.
			</p>

			<div className="obs">
				<div><b>{manifest.included.length}</b><span className="note">ayudas comprobadas con reglas</span></div>
				<div><b>{l2.items.length}</b><span className="note">relacionadas con fuente oficial</span></div>
				<div><b>{(sources.domains?.length ?? 0)}</b><span className="note">dominios oficiales registrados</span></div>
				<div><b>{formatDateEs(verified)}</b><span className="note">última verificación de reglas</span></div>
			</div>

			<h2 style={{ marginTop: "2rem" }}>Catálogo por estado de acceso</h2>
			<div className="log">
				<ul>
					{Object.entries(byState as Record<string, number>).map(([k, v]) => (
						<li key={k}>
							<span className="label">{{ OPEN: "Plazo abierto", ROLLING: "Plazo continuo", UPCOMING: "Próxima", CLOSED_RECURRING: "Se convoca cada año", UNKNOWN: "Por confirmar" }[k] ?? k}</span>
							<span className="mono">{v} programas</span>
							<span>
								{k === "OPEN" && "Plazo abierto ahora mismo"}
								{k === "ROLLING" && "Se puede pedir en cualquier momento"}
								{k === "UPCOMING" && "Anunciada; plazo aún no abierto"}
								{k === "CLOSED_RECURRING" && "Cerrada; se convoca cada año"}
								{k === "UNKNOWN" && "Estado por confirmar"}
							</span>
						</li>
					))}
				</ul>
			</div>

			<h2 style={{ marginTop: "2rem" }}>Frescura de las fuentes</h2>
			{lastRun ? (
				<>
					<div className="obs">
						<div><b>{dailyCount}</b><span className="note">fuentes revisadas cada día (normas y sedes accesibles)</span></div>
						<div><b>{periodicCount}</b><span className="note">de revisión periódica (las sedes bloquean el proceso automático)</span></div>
						<div><b>{formatDateEs(lastRun.date)}</b><span className="note">última revisión</span></div>
						<div><b>{staleCount}</b><span className="note">fuentes marcadas como cambiadas</span></div>
					</div>
					<p className="note">
						Cada día se re-descargan las normas (BOE, BOCM y otras sedes
						accesibles) y se comprueba que los extractos citados siguen
						presentes; si falta alguno, la ayuda sale del listado hasta su
						revisión. Las páginas informativas de las administraciones no
						responden al proceso automático y se revisan en otro ciclo.
					</p>
				</>
			) : (
				<p className="note">Sin datos de frescura aún.</p>
			)}

			<h2 style={{ marginTop: "2rem" }}>Por ámbito</h2>
			<ul>
				{Object.entries(byScope as Record<string, number>).map(([k, v]) => (
					<li key={k}>
						{k === "comunidad-madrid" ? "Comunidad de Madrid" : k === "municipal" ? "Ayuntamientos" : "Estado"}
						{" — "}{v}
					</li>
				))}
			</ul>

			<p className="note" style={{ marginTop: "1.6rem" }}>
				<a href="/datos/elegibilidad/manifest.json">Manifiesto del bundle</a> ·{" "}
				<Link href="/explorar">Explorar el catálogo</Link> ·{" "}
				<Link href="/datos/elegibilidad/nivel-2.json">Datos abiertos (JSON)</Link>
			</p>
		</section>
	);
}
