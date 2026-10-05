"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EvaluateCtx } from "../../lib/eligibility-engine/evaluate";
import { evaluateRuleSet } from "../../lib/eligibility-engine/evaluate";
import type {
	CitizenProfile,
	EvaluationResult,
	QuestionCatalog,
	RuleSet,
} from "../../lib/eligibility-engine/schema";

type Question = QuestionCatalog["questions"][number];
import { aidTitle } from "../../lib/aid-titles";
import type { CheckData } from "../../lib/check-data";
import { es, type I18nKey, t } from "../../lib/i18n/es";
import { matchLevel2 } from "../../lib/level2";
import { clearAll } from "../../lib/profile-store";
import type { Answer } from "./QuestionStep";
import { QuestionStep } from "./QuestionStep";

const key = (k: string): string => (k in es ? es[k as I18nKey] : k);
const VERDICT_ORDER = [
	"probable",
	"posible",
	"insuficiente",
	"no_cumple",
] as const;

interface Props {
	data: CheckData;
	profile: CitizenProfile;
	evalCtx: EvaluateCtx;
	questions: Question[];
	onSetAnswer: (field: string, a: Answer) => void;
	onRestart: () => void;
	onAnnounce: (s: string) => void;
}

export function ResultsView({
	data,
	profile,
	evalCtx,
	questions,
	onSetAnswer,
	onRestart,
	onAnnounce,
}: Props) {
	const [showClosed, setShowClosed] = useState(false);
	const [showNoCumple, setShowNoCumple] = useState(false);
	const [inlineField, setInlineField] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [cleared, setCleared] = useState(false);

	const evaluations = useMemo(
		() =>
			data.bundle.rulesets.map((rs) => ({
				rs,
				ev: evaluateRuleSet(rs, profile, evalCtx),
			})),
		[data, profile, evalCtx],
	);

	const byVerdict = (v: string) =>
		evaluations.filter(
			({ ev }) => ev.verdict === v && ev.selfCheck.passed,
		);
	const notEvaluable = evaluations.filter(({ ev }) => !ev.selfCheck.passed);
	const visible = VERDICT_ORDER.flatMap((v) =>
		byVerdict(v).filter(
			({ ev }) => showClosed || ev.deadline.state !== "CLOSED",
		),
	);
	const closedCount = evaluations.filter(
		({ ev }) => ev.deadline.state === "CLOSED",
	).length;

	// Datos que faltan: unión de missing de todas las evaluaciones.
	const missing = useMemo(() => {
		const map = new Map<string, { field: string; questionId: string; unlocks: number }>();
		for (const { ev } of evaluations) {
			for (const m of ev.missing) {
				const cur = map.get(m.field);
				if (!cur || m.unlocks > cur.unlocks) map.set(m.field, m);
			}
		}
		return [...map.values()];
	}, [evaluations]);

	const missingAids = new Set(
		evaluations.flatMap(({ ev }) => ev.missing.map(() => ev.benefitSlug)),
	).size;

	const level2 = useMemo(
		() => matchLevel2(data.level2, profile.answers),
		[data, profile],
	);

	const probables = byVerdict("probable").length;
	const posibles = byVerdict("posible").length;

	const copySummary = () => {
		const lines = [
			`${t("app.name")} — ${t("results.title")}`,
			"",
			...visible.map(
				({ ev }) =>
					`• ${aidTitle(ev.benefitSlug)}: ${key(`verdict.${ev.verdict}`)}`,
			),
			"",
			t("legal.notice"),
		];
		navigator.clipboard?.writeText(lines.join("\n"));
		setCopied(true);
	};

	return (
		<section aria-labelledby="results-title">
			<h1 id="results-title">{t("results.title")}</h1>

			<p className="summary" role="status" aria-live="polite">
				{visible.length === 0 && notEvaluable.length === 0
					? t("results.summary.none")
					: t("results.summary", {
							probables,
							posibles,
							missing: missing.length,
							missingAids,
						})}
			</p>

			{missing.length > 0 && (
				<aside className="missing-panel" aria-labelledby="missing-title">
					<h2 id="missing-title">{t("results.missing.title")}</h2>
					<p>{t("results.missing.body", { n: missingAids })}</p>
					<ul>
						{missing.map((m) => {
							const q = questions.find((x) => x.field === m.field);
							if (!q) return null;
							return (
								<li key={m.field}>
									{inlineField === m.field ? (
										<QuestionStep
											inline
											question={q}
											answer={profile.answers[m.field]}
											municipalities={data.territory.municipalities}
											ccaaList={data.territory.ccaa}
											onAnswer={(a) => {
												onSetAnswer(m.field, a);
												setInlineField(null);
												onAnnounce(t("results.missing.recalc"));
											}}
											onContinue={() => {
												setInlineField(null);
												onAnnounce(t("results.missing.recalc"));
											}}
											onBack={() => setInlineField(null)}
										/>
									) : (
										<>
											{key(q.labelKey)}{" "}
											<button
												type="button"
												className="btn-quiet"
												onClick={() => setInlineField(m.field)}
											>
												{t("results.missing.answer")}
											</button>
										</>
									)}
								</li>
							);
						})}
					</ul>
				</aside>
			)}

			<div className="results-list">
				{visible
					.filter(({ ev }) => ev.verdict !== "no_cumple")
					.map(({ rs, ev }) => (
						<ResultCard key={ev.benefitSlug} rs={rs} ev={ev} />
					))}
			</div>

			{byVerdict("no_cumple").length > 0 && (
				<div className="nocumple">
					<button
						type="button"
						className="btn-quiet"
						aria-expanded={showNoCumple}
						onClick={() => setShowNoCumple((v) => !v)}
					>
						{t("results.noaplica.title", {
							n: byVerdict("no_cumple").length,
						})} — ver por qué
					</button>
					{showNoCumple && (
						<ul>
							{byVerdict("no_cumple").map(({ rs, ev }) => (
								<li key={ev.benefitSlug}>
									<ResultCard rs={rs} ev={ev} compact />
								</li>
							))}
						</ul>
					)}
				</div>
			)}

			{closedCount > 0 && (
				<button
					type="button"
					className="btn-quiet"
					onClick={() => setShowClosed((v) => !v)}
				>
					{t("results.closed.toggle")} ({closedCount})
				</button>
			)}

			{notEvaluable.length > 0 && (
				<ul className="results-list">
					{notEvaluable.map(({ rs, ev }) => (
						<li key={ev.benefitSlug} className="aid-card">
							<h2>
								{aidTitle(ev.benefitSlug)}{" "}
								<span className="pill pill--neutral">
									{t("verdict.not_evaluable")}
								</span>
							</h2>
							<p>{t("verdict.line.not_evaluable")}</p>
							<p>
								<a href={rs.sources[0]?.url} rel="noopener noreferrer">
									{t("card.gotoSource")} ↗
								</a>
							</p>
						</li>
					))}
				</ul>
			)}

			{level2.length > 0 && (
				<aside aria-labelledby="level2-title">
					<h2 id="level2-title">{t("results.level2.title")}</h2>
					<p className="level2-note">{t("results.level2.note")}</p>
					<ul className="level2-list">
						{level2.map(({ item }) => (
							<li key={item.slug}>
								<a href={item.officialSourceUrl} rel="noopener noreferrer">
									{item.displayTitle}
								</a>
								{item.managingBody && ` — ${item.managingBody}`}
							</li>
						))}
					</ul>
				</aside>
			)}

			<div className="actions">
				<button type="button" className="btn-quiet" onClick={copySummary}>
					{t("results.actions.copy")}
				</button>
				<button
					type="button"
					className="btn-quiet"
					onClick={() => window.print()}
				>
					{t("results.actions.print")}
				</button>
				<button
					type="button"
					className="btn-quiet"
					onClick={() => {
						clearAll();
						setCleared(true);
						onRestart();
					}}
				>
					{t("results.actions.clear")}
				</button>
				<button type="button" className="btn-quiet" onClick={onRestart}>
					{t("results.actions.restart")}
				</button>
			</div>
			{copied && <p role="status">{t("results.actions.copyDone")}</p>}
			{cleared && <p role="status">{t("results.actions.clearDone")}</p>}
		</section>
	);
}

function ResultCard({
	rs,
	ev,
	compact,
}: {
	rs: RuleSet;
	ev: EvaluationResult;
	compact?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const failed = ev.requirements.filter((r) => r.status === "F" && r.hard);
	const pill = `pill pill--${ev.verdict}`;

	return (
		<article className="aid-card">
			<h2>
				{aidTitle(ev.benefitSlug)}{" "}
				<span className={pill}>{key(`verdict.${ev.verdict}`)}</span>{" "}
				<DeadlinePill ev={ev} />
			</h2>
			<p className="verdict-line">{key(`verdict.line.${ev.verdict}`)}</p>

			{ev.futureEligibility && (
				<p className="future">
					{t("results.future", { date: ev.futureEligibility.from })}
				</p>
			)}

			{ev.verdict === "no_cumple" && failed.length > 0 && (
				<p>
					{t("results.noaplica.reason", {
						reqs: failed
							.map(
								(f) =>
									rs.requirements.find((r) => r.id === f.id)?.label ?? f.id,
							)
							.join("; "),
					})}
				</p>
			)}

			{!compact && (
				<>
					<ul className="req-list">
						{ev.requirements.map((r) => {
							const req = rs.requirements.find((x) => x.id === r.id);
							return (
								<li key={r.id} className={`req req--${r.status}`}>
									<span className="req-status">
										{r.status === "T"
											? `✓ ${t("req.t")}`
											: r.status === "F"
												? `✗ ${t("req.f")}`
												: `? ${t("req.u")}`}
										{!r.hard && " (no bloqueante)"}
									</span>{" "}
									{req?.label}
									{req && (
										<details className="cite">
											<summary>{t("req.source")}</summary>
											<blockquote lang="es">
												«{r.citation.excerpt}»
											</blockquote>
											<p className="cite-meta">
												{r.citation.locator} ·{" "}
												<a
													href={
														rs.sources.find(
															(s) => s.id === r.citation.sourceId,
														)?.url
													}
													rel="noopener noreferrer"
												>
													{t("card.gotoSource")} ↗
												</a>
											</p>
										</details>
									)}
								</li>
							);
						})}
						{ev.uncovered.map((u, i) => (
							<li key={`u-${i}`} className="req req--warn">
								<span className="req-status">⚠ {t("req.uncovered")}</span> {u}
							</li>
						))}
					</ul>

					<dl className="aid-meta">
						{ev.amount && (
							<div>
								<dt>{t("card.youGet")}</dt>
								<dd>
									{ev.amount.type === "variable"
										? "Variable (ver fuente)"
										: ev.amount.minEur === ev.amount.maxEur
											? `${ev.amount.minEur?.toLocaleString("es-ES")} €`
											: `${ev.amount.minEur?.toLocaleString("es-ES")}–${ev.amount.maxEur?.toLocaleString("es-ES")} €`}
								</dd>
							</div>
						)}
						<div>
							<dt>{t("card.deadline")}</dt>
							<dd>
								{ev.deadline.state === "ROLLING"
									? t("deadline.ROLLING")
									: ev.deadline.closesAt
										? t("deadline.closesAt", { date: ev.deadline.closesAt })
										: key(`deadline.${ev.deadline.state}`)}
							</dd>
						</div>
						{ev.documents.length > 0 && (
							<div>
								<dt>{t("card.docs")}</dt>
								<dd>{ev.documents.join("; ")}</dd>
							</div>
						)}
						{ev.effort && (
							<div>
								<dt>{t("card.effort")}</dt>
								<dd>
									{ev.effort.minMinutes}–{ev.effort.maxMinutes} min (estimación
									propia)
								</dd>
							</div>
						)}
						<div>
							<dt>{t("card.channel")}</dt>
							<dd>
								<a href={ev.channel.url} rel="noopener noreferrer">
									{ev.channel.managingBody} ↗
								</a>
							</dd>
						</div>
					</dl>

					<p className="card-actions">
						<a
							className="cta"
							href={ev.channel.url}
							rel="noopener noreferrer"
						>
							{t("card.gotoChannel")} ↗
						</a>{" "}
						<Link className="btn-quiet" href={`/ayudas/${ev.benefitSlug}`}>
							{t("card.fullDetail")}
						</Link>
					</p>
					<button
						type="button"
						className="btn-quiet"
						aria-expanded={open}
						onClick={() => setOpen((v) => !v)}
					>
						{t("req.why.title")}
					</button>
					{open && (
						<p className="why">
							{t("card.verifiedAt", { date: ev.verifiedAt })} ·{" "}
							{rs.sources
								.filter((s) => s.rank <= 2)
								.map((s) => domainBadge(s.url))
								.join(", ")}
						</p>
					)}
				</>
			)}

			<p className="card-foot">
				{rs.sources[0] ? domainBadge(rs.sources[0].url) : ""} ·{" "}
				{t("card.verifiedAt", { date: ev.verifiedAt })}
			</p>
			<p className="legal">{t("legal.notice")}</p>
		</article>
	);
}

function domainBadge(url: string): string {
	if (url.includes("boe.es")) return "BOE";
	if (url.includes("bocm.es")) return "BOCM";
	if (url.includes("comunidad.madrid")) return "Comunidad de Madrid";
	if (url.includes("renfe.com")) return "Renfe";
	if (url.includes("sepe.es")) return "SEPE";
	if (url.includes("seg-social.es")) return "Seguridad Social";
	if (url.includes("miteco")) return "MITECO";
	if (url.includes("gob.es")) return "Gobierno de España";
	return "Fuente oficial";
}

function DeadlinePill({ ev }: { ev: EvaluationResult }) {
	const cls = ev.deadline.urgent ? "pill pill--danger" : "pill pill--soft";
	return (
		<span className={cls}>
			{ev.deadline.urgent
				? t("deadline.urgent")
				: key(`deadline.${ev.deadline.state}`)}
		</span>
	);
}
