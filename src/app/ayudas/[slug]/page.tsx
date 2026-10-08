import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aidTitle } from "../../../lib/aid-titles";
import { formatAmount, formatWindow } from "../../../lib/format";
import { condText } from "../../../lib/rule-text";

const RULES_DIR = join(process.cwd(), "data/eligibility/rules");

interface Rs {
	benefitSlug: string;
	rulesVersion: number;
	verifiedAt: string;
	validFrom?: string;
	validUntil?: string;
	versionNote?: string;
	humanReview: { status: string };
	sources: { id: string; rank: number; url: string; title: string }[];
	requirements: { id: string; label: string; hard: boolean; condition: import("../../../lib/eligibility-engine/schema").Condition; citation: { locator: string; excerpt: string; sourceId: string } }[];
	uncoveredRequirements: { id: string; label: string; citation: { locator: string; excerpt: string; sourceId: string } }[];
	application: {
		window: { rolling: boolean; opensAt?: string; closesAt?: string };
		channel: { managingBody: string; url: string; online: boolean };
		documents: { id: string; label: string; mandatory: boolean }[];
	};
	amount: {
		type: string;
		minEur?: number;
		maxEur?: number;
		period?: string;
		citation: { locator: string; excerpt: string };
	} | null;
}

// R8-VIG: un mismo slug puede tener varias versiones (`<slug>.json` y
// `<slug>__v-AAAA-MM-DD.json`). La ficha muestra la vigente en la fecha del
// build y un aviso con enlace a los textos cuando existe otra versión.
function versionsOf(slug: string): Rs[] {
	const out: Rs[] = [];
	for (const f of readdirSync(RULES_DIR)) {
		if (!f.endsWith(".json")) continue;
		const base = f.slice(0, -5).replace(/__v-\d{4}-\d{2}-\d{2}$/, "");
		if (base !== slug) continue;
		try {
			out.push(JSON.parse(readFileSync(join(RULES_DIR, f), "utf8")));
		} catch {
			// archivo ilegible: se ignora
		}
	}
	return out;
}

function load(slug: string): { rs: Rs; other: Rs[] } | null {
	const all = versionsOf(slug);
	if (all.length === 0) return null;
	const today = new Date().toISOString().slice(0, 10);
	const valid = all.filter(
		(r) =>
			(!r.validFrom || r.validFrom <= today) &&
			(!r.validUntil || r.validUntil >= today),
	);
	const rs = valid[0] ?? all.find((r) => !r.validFrom) ?? all[0];
	return { rs, other: all.filter((r) => r !== rs) };
}

export function generateStaticParams() {
	return readdirSync(RULES_DIR)
		.filter((f) => f.endsWith(".json") && !/__v-\d{4}-\d{2}-\d{2}/.test(f))
		.map((f) => ({ slug: f.slice(0, -5) }));
}

export function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	return params.then(({ slug }) => ({ title: aidTitle(slug) }));
}

export default async function Ficha({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const loaded = load(slug);
	if (!loaded) notFound();
	const { rs, other } = loaded;

	const w = rs.application.window;
	const src = (id: string) => rs.sources.find((s) => s.id === id);

	return (
		<article className="shell" aria-labelledby="titulo">
			<h1 id="titulo">{aidTitle(slug)}</h1>
			<p className="lede">
				{formatWindow(w)} · Verificado con la fuente el{" "}
				{new Date(rs.verifiedAt).toLocaleDateString("es-ES", {
					day: "numeric",
					month: "long",
					year: "numeric",
				})}
			</p>

			{rs.versionNote && other.length > 0 && (
				<p className="note version-note">
					{rs.versionNote}{" "}
					{rs.sources[0] && (
						<a href={rs.sources[0].url} rel="noopener noreferrer">
							texto vigente ahora ↗
						</a>
					)}{" "}
					{other[0]?.sources[0] && (
						<a href={other[0].sources[0].url} rel="noopener noreferrer">
							· texto de la nueva versión ↗
						</a>
					)}
				</p>
			)}

			<h2>Requisitos</h2>
			<ul className="req-list">
				{rs.requirements.map((r) => (
					<li key={r.id} className="req">
						<strong>{r.label}</strong>{" "}
						{!r.hard && <em>(aviso)</em>}
						<br />
						<small className="req-rule">Se comprueba así: {condText(r.condition)}</small>
						<details className="cite">
							<summary>Fuente</summary>
							<blockquote>«{r.citation.excerpt}»</blockquote>
							<p className="cite-meta">
								{r.citation.locator} ·{" "}
								<a href={src(r.citation.sourceId)?.url} rel="noopener noreferrer">
									fuente oficial ↗
								</a>
							</p>
						</details>
					</li>
				))}
			</ul>

			{rs.uncoveredRequirements.length > 0 && (
				<>
					<h2>También exige (no comprobable aquí)</h2>
					<ul className="req-list">
						{rs.uncoveredRequirements.map((u) => (
							<li key={u.id} className="req req--warn">
								⚠ {u.label}
								<details className="cite">
									<summary>Fuente</summary>
									<blockquote>«{u.citation.excerpt}»</blockquote>
									<p className="cite-meta">
										{u.citation.locator} ·{" "}
										<a
											href={src(u.citation.sourceId)?.url}
											rel="noopener noreferrer"
										>
											fuente oficial ↗
										</a>
									</p>
								</details>
							</li>
						))}
					</ul>
				</>
			)}

			{rs.amount && (
				<>
					<h2>Cuantía</h2>
					<p>
						{formatAmount(rs.amount)} — «{rs.amount.citation.excerpt}» (
						{rs.amount.citation.locator})
					</p>
				</>
			)}

			<h2>Dónde solicitar</h2>
			<p>
				<a href={rs.application.channel.url} rel="noopener noreferrer">
					{rs.application.channel.managingBody} ↗
				</a>{" "}
				({rs.application.channel.online ? "online" : "otro canal"})
			</p>

			{rs.application.documents.length > 0 && (
				<>
					<h2>Documentación</h2>
					<ul>
						{rs.application.documents.map((d) => (
							<li key={d.id}>
								{d.label}
								{d.mandatory ? "" : " (según caso)"}
							</li>
						))}
					</ul>
				</>
			)}

			<h2>Fuentes oficiales</h2>
			<ul>
				{rs.sources.map((s) => (
					<li key={s.id}>
						<a href={s.url} rel="noopener noreferrer">
							{s.title}
						</a>{" "}

					</li>
				))}
			</ul>

			<p className="legal">
				Esto no determina tu derecho a la ayuda. La decisión corresponde al
				organismo competente. Datos abiertos:{" "}
				<Link href="/datos/elegibilidad/manifest.json" rel="noopener noreferrer">
					datos abiertos del sitio
				</Link>
				.
			</p>
			<p>
				<Link href="/ayudas">← Volver a las ayudas</Link> ·{" "}
				<Link href="/comprobar">Comprueba si te aplica</Link>
			</p>
		</article>
	);
}
