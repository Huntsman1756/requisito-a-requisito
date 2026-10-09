import type { Metadata } from "next";
import Link from "next/link";
import { formatAmount, formatWindow } from "../../lib/format";
import { allRuleSets, loadVersion } from "../../lib/rule-pages";

export const metadata: Metadata = { title: "Ayudas del piloto" };

interface Source {
	id: string;
	rank: number;
	url: string;
	title: string;
}
interface RuleListItem {
	benefitSlug: string;
	validFrom?: string;
	validUntil?: string;
	humanReview: { status: string };
	sources: Source[];
	application: {
		channel: { managingBody: string; url: string; online: boolean };
		window: { rolling: boolean; opensAt?: string; closesAt?: string };
	};
	amount: { type: string; minEur?: number; maxEur?: number; period?: string } | null;
	requirements: { id: string; label: string; hard: boolean }[];
	uncoveredRequirements: { id: string; label: string }[];
}

const TITLES: Record<string, string> = {
	"bono-cultural-joven": "Bono Cultural Joven 2026",
	"bono-social-electrico": "Bono Social Eléctrico",
	"madrid-ayudas-nacimiento-adopcion-multiple":
		"Ayuda por nacimiento o adopción múltiple (Comunidad de Madrid)",
	"prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad":
		"Prestación por nacimiento o adopción (familia numerosa, monoparental o discapacidad)",
	"subsidio-mayores-52": "Subsidio por desempleo de mayores de 52 años",
	"descuento-transporte-familia-numerosa":
		"Descuento de tren para familias numerosas",
};

// Una tarjeta por benefitSlug (la versión vigente), todo desde el bundle:
// en --strict solo salen las reglas aprobadas (ADR-050/G12).
function loadRules(): RuleListItem[] {
	const today = new Date().toISOString().slice(0, 10);
	const seen = new Set<string>();
	const out: RuleListItem[] = [];
	for (const { benefitSlug } of allRuleSets<RuleListItem>()) {
		if (seen.has(benefitSlug)) continue;
		seen.add(benefitSlug);
		const v = loadVersion<RuleListItem>(benefitSlug, today);
		if (v) out.push(v.rs);
	}
	return out.sort((a, b) => a.benefitSlug.localeCompare(b.benefitSlug));
}

const amountText = (r: RuleListItem) => (r.amount ? formatAmount(r.amount) : null);
const windowText = (r: RuleListItem) => formatWindow(r.application.window);

export default function Ayudas() {
	const rules = loadRules();
	return (
		<section className="shell" aria-labelledby="titulo">
			<h1 id="titulo">Ayudas del piloto</h1>
			<p className="lede">
				Cada ayuda lista sus requisitos con el texto oficial literal que los
				sustenta. Todo lo marcado con ⚠ no se puede comprobar con las
				preguntas actuales.
			</p>
			<ul className="aid-list">
				{rules.map((r) => (
					<li key={r.benefitSlug} className="aid-card">
						<h2>
							{TITLES[r.benefitSlug] ?? r.benefitSlug}{" "}
							<span className="tag tag--review">
								Verificado con la fuente
							</span>
						</h2>
						<dl className="aid-meta">
							<div>
								<dt>Plazo</dt>
								<dd>{windowText(r)}</dd>
							</div>
							{amountText(r) && (
								<div>
									<dt>Cuantía</dt>
									<dd>{amountText(r)}</dd>
								</div>
							)}
							<div>
								<dt>Dónde se solicita</dt>
								<dd>
									<a href={r.application.channel.url} rel="noopener noreferrer">
										{r.application.channel.managingBody}
									</a>
								</dd>
							</div>
						</dl>
						<h3>Lo que comprobamos</h3>
						<ul>
							{r.requirements.map((req) => (
								<li key={req.id}>
									{req.label}
									{!req.hard && " (aviso)"}
								</li>
							))}
						</ul>
						{r.uncoveredRequirements.length > 0 && (
							<>
								<h3>También exige (⚠ no comprobable aquí)</h3>
								<ul>
									{r.uncoveredRequirements.map((u) => (
										<li key={u.id}>⚠ {u.label}</li>
									))}
								</ul>
							</>
						)}
						<h3>Fuentes</h3>
						<ul>
							{r.sources.map((s) => (
								<li key={s.id}>
									<a href={s.url} rel="noopener noreferrer">
										{s.title}
									</a>{" "}
	
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>
			<p>
				<Link href="/">← Volver al inicio</Link>
			</p>
		</section>
	);
}
