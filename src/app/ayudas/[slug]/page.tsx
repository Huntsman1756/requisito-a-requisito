import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aidTitle } from "../../../lib/aid-titles";
import { formatAmount, formatWindow } from "../../../lib/format";

const RULES_DIR = join(process.cwd(), "data/eligibility/rules");

interface Rs {
	benefitSlug: string;
	rulesVersion: number;
	verifiedAt: string;
	humanReview: { status: string };
	sources: { id: string; rank: number; url: string; title: string }[];
	requirements: { id: string; label: string; hard: boolean; citation: { locator: string; excerpt: string; sourceId: string } }[];
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

function load(slug: string): Rs | null {
	const p = join(RULES_DIR, `${slug}.json`);
	try {
		return JSON.parse(readFileSync(p, "utf8"));
	} catch {
		return null;
	}
}

export function generateStaticParams() {
	return readdirSync(RULES_DIR)
		.filter((f) => f.endsWith(".json"))
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
	const rs = load(slug);
	if (!rs) notFound();

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

			<h2>Requisitos</h2>
			<ul className="req-list">
				{rs.requirements.map((r) => (
					<li key={r.id} className="req">
						<strong>{r.label}</strong>{" "}
						{!r.hard && <em>(aviso)</em>}
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
				<a href="/datos/elegibilidad/manifest.json" rel="noopener noreferrer">
					datos abiertos del sitio
				</a>
				.
			</p>
			<p>
				<Link href="/ayudas">← Volver a las ayudas</Link> ·{" "}
				<Link href="/comprobar">Comprueba si te aplica</Link>
			</p>
		</article>
	);
}
