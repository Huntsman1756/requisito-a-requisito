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
import { formatDateEs, formatAmount } from "../../lib/format";
import { matchLevel2 } from "../../lib/level2";
import {
	cellReqs,
	DIMENSIONS,
	dimOf,
	uncoveredCount,
	worstOf,
} from "../../lib/matrix";
/** «Encaja»: veredicto probable, o posible con todos los requisitos duros
 *  comprobables en T (el resto son condiciones del trámite, mostradas ⚠). */
function isEncaja({ ev }: { ev: EvaluationResult }): boolean {
	return (
		ev.verdict === "probable" ||
		(ev.verdict === "posible" &&
			ev.requirements.every((r) => !r.hard || r.status === "T") &&
			ev.requirements.some((r) => r.hard && r.status === "T"))
	);
}

const EVENT_LABELS: Record<string, string> = {
	tener_hijo: "Voy a tener un hijo",
	perder_empleo: "Me he quedado sin trabajo",
	estudiar: "Estudio o voy a estudiar",
	independizarse_vivienda: "Busco vivienda",
	cuidar_familiar: "Cuido de un familiar",
	discapacidad: "Tengo una discapacidad",
	mayor_65: "Tengo 65 años o más",
	ingresos_bajos: "Me cuesta llegar a fin de mes",
};
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
	lifeEvent?: string | null;
	exampleLabel?: string;
	onSetAnswer: (field: string, a: Answer) => void;
	onRestart: () => void;
	onAnnounce: (s: string) => void;
}

export function ResultsView({
	data,
	profile,
	evalCtx,
	questions,
	lifeEvent,
	exampleLabel,
	onSetAnswer,
	onRestart,
	onAnnounce,
}: Props) {
	const [showClosed, setShowClosed] = useState(false);
	const [showNoCumple, setShowNoCumple] = useState(false);
	const [inlineField, setInlineField] = useState<string | null>(null);
	const [showAllL2, setShowAllL2] = useState(false);
	const [showMatrix, setShowMatrix] = useState(false);
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

	const probables = evaluations.filter(isEncaja).length;
	const posibles = evaluations.filter(
		({ ev }) => ev.verdict === "posible" && !isEncaja({ ev }),
	).length + evaluations.filter(({ ev }) => ev.verdict === "insuficiente").length;

	// Plan de acción (docs/15 D): valor, documentos agrupados, calendario.
	const actionEvals = useMemo(
		() =>
			evaluations.filter(
				({ ev }) => ev.verdict === "probable" || ev.verdict === "posible",
			),
		[evaluations],
	);
	const totalRange = useMemo(() => {
		let min = 0, max = 0, n = 0;
		for (const { ev: e } of actionEvals) {
			const a = e.amount;
			if (!a || a.type === "variable") continue;
			if (a.minEur !== undefined && a.maxEur !== undefined) {
				min += a.minEur;
				max += a.maxEur;
				n++;
			}
		}
		return n ? { min, max, n } : null;
	}, [actionEvals]);
	const groupedDocs = useMemo(() => {
		const byLabel = new Map<string, string[]>();
		for (const { ev: e } of actionEvals) {
			for (const label of e.documents ?? []) {
				const arr = byLabel.get(label) ?? [];
				arr.push(e.benefitSlug);
				byLabel.set(label, arr);
			}
		}
		return [...byLabel.entries()].map(([label, slugs]) => ({
			label,
			count: slugs.length,
			slugs: [...new Set(slugs)],
		}));
	}, [actionEvals]);
		const icsHref = useMemo(() => {
		const events = actionEvals
			.filter(({ ev }) => ev.deadline.closesAt)
			.map(({ ev: e }) => {
				const d = e.deadline.closesAt!.replaceAll("-", "");
				return [
					"BEGIN:VEVENT",
					`UID:${e.benefitSlug}@requisito-a-requisito`,
					`DTSTART;VALUE=DATE:${d}`,
					`DTEND;VALUE=DATE:${d}`,
					`SUMMARY:Ultimo dia - ${aidTitle(e.benefitSlug)}`,
					`DESCRIPTION:Solicitar en ${e.channel.url}`,
					"END:VEVENT",
				].join("\r\n");
			});
		if (!events.length) return null;
		const ics = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"PRODID:-//Requisito a Requisito//ES",
			...events,
			"END:VCALENDAR",
		].join("\r\n");
		return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
	}, [actionEvals]);

	const copySummary = () => {
		const lines = [
			`${t("app.name")} — ${t("results.title")}`,
			"",
			...visible.map(
				({ ev }) =>
					`• ${aidTitle(ev.benefitSlug)}: ${isEncaja({ ev }) ? "Encaja" : key(`verdict.${ev.verdict}`)}`,
			),
			"",
			t("legal.notice"),
		];
		navigator.clipboard?.writeText(lines.join("\n"));
		setCopied(true);
	};

	return (
		<section aria-labelledby="results-title">
			<div className="res-head">
				<div>
					{exampleLabel && <p className="persona">Ejemplo · {exampleLabel}</p>}
					<h1 id="results-title">{t("results.title")}</h1>
				</div>
			</div>
			<div className="tally" role="status" aria-live="polite">
				<div className="ok"><b>{probables}</b><span>{key("tally.probables")}</span></div>
				<div className="doubt"><b>{posibles}</b><span>{key("tally.posibles")}</span></div>
				{missing.length > 0 && (
					<div className="doubt"><b>{missing.length}</b><span>{key("tally.missing")}</span></div>
				)}
				<div className="seal-c"><b>{level2.length}</b><span>{key("tally.level2")}</span></div>
			</div>
			<p className="sr-only">
				{visible.length === 0 && notEvaluable.length === 0
					? t("results.summary.none")
					: t("results.summary", { probables, posibles, missing: missing.length, missingAids })}
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

			{evaluations.length > 1 && (
				<RequirementMatrix evaluations={evaluations} />
			)}

			{actionEvals.length > 0 && (
				<section className="action-plan" aria-labelledby="plan-title">
					<h2 id="plan-title">Tu plan de acción</h2>
					{totalRange && (
						<p className="plan-total">
							{t("results.plan.total", {
								max: totalRange.max.toLocaleString("es-ES"),
								n: totalRange.n,
							})}
						</p>
					)}
					{groupedDocs.length > 0 && (
						<div className="plan-docs">
							<p>{t("results.plan.docs", { n: groupedDocs.length })}</p>
							<ul>
								{groupedDocs.map((d) => (
									<li key={d.label}>
										{d.label}
										<span className="mono"> · {d.count} {d.count === 1 ? "ayuda" : "ayudas"}</span>
									</li>
								))}
							</ul>
						</div>
					)}
					{icsHref && (
						<p>
							<a className="btn-quiet" href={icsHref} download="plazos-ayudas.ics">
								{t("results.plan.ics")}
							</a>
						</p>
					)}
				</section>
			)}

			{lifeEvent && (
				<aside className="life-event-block" aria-labelledby="le-title">
					<h2 id="le-title">Para tu situación</h2>
					<p>
						Elegiste «{EVENT_LABELS[lifeEvent] ?? lifeEvent}». De todo el
						catálogo, estas responden más a ese momento:
					</p>
					<ul>
						{level2
							.filter(({ item }) => item.lifeEvents?.includes(lifeEvent))
							.slice(0, 6)
							.map(({ item }) => (
								<li key={item.slug}>
									<a href={item.officialSourceUrl} rel="noopener noreferrer">
										{item.displayTitle}
									</a>
								</li>
							))}
					</ul>
				</aside>
			)}
			{level2.length > 0 && (
				<aside aria-labelledby="level2-title">
					<h2 id="level2-title">{t("results.level2.title")}</h2>
					<p className="level2-note">{t("results.level2.note")}</p>
					<ul className="level2-list">
						{level2.slice(0, showAllL2 ? level2.length : 10).map(({ item }) => (
							<li key={item.slug}>
								<a href={item.officialSourceUrl} rel="noopener noreferrer">
									{item.displayTitle}
								</a>
								{item.managingBody && ` — ${item.managingBody}`}
							</li>
						))}
					</ul>
					{level2.length > 10 && !showAllL2 && (
						<button
							type="button"
							className="btn-quiet"
							onClick={() => setShowAllL2(true)}
						>
							Ver las {level2.length - 10} restantes
						</button>
					)}
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
			<p className="card-badges">
				{rs.sources.slice(0, 1).map((s) => (
					<span key={s.id} className="badge">
						{domainBadge(s.url)}
					</span>
				))}
				{rs.benefitSlug.startsWith("madrid-") ? (
					<span className="badge badge--scope">Comunidad de Madrid</span>
				) : (
					<span className="badge badge--scope">Ámbito estatal</span>
				)}
				<DeadlinePill ev={ev} />
			</p>
			<h2>
				{aidTitle(ev.benefitSlug)}{" "}
				<span className={pill}>{isEncaja({ ev }) ? "Encaja" : key(`verdict.${ev.verdict}`)}</span>
			</h2>
			<p className="review-state note">
				Comprobada con la fuente
				{rs.humanReview?.status === "approved" && " · revisada"}
				{rs.humanReview?.status !== "approved" &&
					rs.panelReview?.status === "approved" &&
					" · revisada por un panel independiente"}
				{rs.humanReview?.status !== "approved" &&
					rs.panelReview?.status !== "approved" &&
					" · revisión final pendiente"}
			</p>
			<p className="verdict-line">
						{isEncaja({ ev }) && ev.verdict !== "probable"
							? "Cumples todo lo comprobable; quedan condiciones del trámite por verificar"
							: key(`verdict.line.${ev.verdict}`)}
					</p>

			{ev.futureEligibility && (
				<p className="future">
					{t("results.future", { date: formatDateEs(ev.futureEligibility.from) })}
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
											: !r.hard
												? `⚠ ${t("req.warn")}`
												: r.status === "F"
													? `✗ ${t("req.f")}`
													: `? ${t("req.u")}`}
									</span>{" "}
									{req?.label}
									{req && (
										<details className="cite">
											<summary aria-label={`${t("req.source")}: ${req.label}`}>{t("req.source")}</summary>
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
									{formatAmount(ev.amount)}
								</dd>
							</div>
						)}
						<div>
							<dt>{t("card.deadline")}</dt>
							<dd>
								{ev.deadline.state === "ROLLING"
									? t("deadline.ROLLING")
									: ev.deadline.closesAt
										? t("deadline.closesAt", { date: formatDateEs(ev.deadline.closesAt) })
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
									{ev.effort.minMinutes}–{ev.effort.maxMinutes} min{" "}
									<Link href="/como-funciona">(estimación propia)</Link>
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
						{rs.application.officialSimulator ? (
							<a className="cta" href={rs.application.officialSimulator.url} rel="noopener noreferrer">
								{t("card.gotoSimulator")} ↗
							</a>
						) : (
							<a className="cta" href={ev.channel.url} rel="noopener noreferrer">
								{t("card.gotoChannel")} ↗
							</a>
						)}{" "}
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
							{t("card.verifiedAt", { date: formatDateEs(ev.verifiedAt) })} ·{" "}
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
				{t("card.verifiedAt", { date: formatDateEs(ev.verifiedAt) })}
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


/** Matriz requisito a requisito por dimensiones del perfil (R2-MAT). */
function RequirementMatrix({
	evaluations,
}: {
	evaluations: { rs: RuleSet; ev: EvaluationResult }[];
}) {
	const [open, setOpen] = useState(false);
	const [cell, setCell] = useState<{ aid: string; dim: string } | null>(null);
	const shown = evaluations.filter(({ ev }) => ev.verdict !== "no_cumple");



	const tickFor = (st: string) =>
		st === "T" ? { cls: "ok", sym: "✓", txt: "Cumples" }
		: st === "F" ? { cls: "no", sym: "✕", txt: "No cumples" }
		: st === "U" ? { cls: "doubt", sym: "?", txt: "Falta un dato" }
		: st === "W" ? { cls: "na", sym: "⚠", txt: "No comprobable aquí" }
		: { cls: "na", sym: "–", txt: "No aplica" };

	const verdictLabel = (ev: EvaluationResult) =>
		isEncaja({ ev }) ? "Encaja" : ev.verdict === "posible" ? "Falta un dato" : ev.verdict === "insuficiente" ? "Le faltan datos" : "No te aplica";
	const verdictCls = (ev: EvaluationResult) =>
		isEncaja({ ev }) ? "v-ok" : ev.verdict === "posible" || ev.verdict === "insuficiente" ? "v-doubt" : "v-no";

	return (
		<>
			<div className="matrix-toggle">
				<button
					type="button"
					className="btn-quiet"
					aria-expanded={open}
					onClick={() => setOpen((v) => !v)}
				>
					{open ? "Ocultar" : "Ver"} la tabla requisito a requisito
				</button>
			</div>
			{open && (
				<>
					<div className="matrix-wrap" role="region" aria-label="Tabla de requisitos por ayuda" tabIndex={0}>
						<div className="matrix-mobile" aria-hidden="true">
							{shown.map(({ rs, ev }) => (
								<details key={ev.benefitSlug}>
									<summary>{aidTitle(ev.benefitSlug)} — {verdictLabel(ev)}</summary>
									<ul>
										{ev.requirements.map((r) => {
											const t = tickFor(r.status);
											return <li key={r.id}><span className={`tick ${t.cls}`}>{t.sym}</span> {rs.requirements.find((x) => x.id === r.id)?.label ?? r.id}</li>;
										})}
									</ul>
								</details>
							))}
						</div>
						<table className="matrix" aria-describedby="m-legend">
							<caption className="label">
								Matriz de requisitos · pulsa una casilla para ver el texto oficial
							</caption>
							<thead>
								<tr>
									<th scope="col">Ayuda</th>
									{DIMENSIONS.map((d) => (
										<th key={d.id} scope="col">{d.label}</th>
									))}
									<th scope="col">Plazo</th>
									<th scope="col">Resultado</th>
								</tr>
							</thead>
							<tbody>
								{shown.map(({ rs, ev }) => (
									<tr key={ev.benefitSlug}>
										<th scope="row">
											{aidTitle(ev.benefitSlug)}
											
										</th>
										{DIMENSIONS.map((d) => {
											const reqs = cellReqs(rs, ev, d.id);
											const st = worstOf(reqs.map((r) => r.status));
											// dim "otros" sin requisitos: ⚠ si hay no comprobables
											const hasUnc = d.id === "otros" && !reqs.length && uncoveredCount(rs) > 0;
											const tick = hasUnc ? tickFor("W") : tickFor(st);
											return (
												<td key={d.id} className="c">
													{reqs.length || hasUnc ? (
														<button
															type="button"
															aria-label={`${aidTitle(ev.benefitSlug)} · ${d.label}: ${tick.txt}`}
															onClick={() => setCell({ aid: ev.benefitSlug, dim: d.id })}
														>
															<span className={`tick ${tick.cls}`} aria-hidden="true">{tick.sym}</span>
														</button>
													) : (
														<span className="tick na" aria-label="No aplica">–</span>
													)}
												</td>
											);
										})}
										<td className="c">
											{ev.deadline.state === "CLOSED_RECURRING" ? (
												<span className="tick doubt" aria-label="Se convoca cada año">↻</span>
											) : ev.deadline.state === "CLOSED" ? (
												<span className="tick no" aria-label="Cerrada">✕</span>
											) : ev.deadline.state === "UNKNOWN" ? (
												<span className="tick doubt" aria-label="Plazo por confirmar">?</span>
											) : (
												<span className="tick ok" aria-label="Plazo abierto">✓</span>
											)}
										</td>
										<td>
											<span className={`verdict ${verdictCls(ev)}`}>
												{verdictLabel(ev)}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="legend" id="m-legend">
						<span><i className="tick ok">✓</i>Cumples</span>
						<span><i className="tick doubt">?</i>Falta un dato</span>
						<span><i className="tick no">✕</i>No cumples</span>
						<span><i className="tick na">–</i>No aplica</span>
						<span><i className="tick na">⚠</i>No comprobable aquí</span>
						<span><i className="tick doubt">↻</i>Se convoca cada año</span>
					</div>
					{cell && (
						<div className="cite-panel" role="status">
							<p className="label">
								{aidTitle(cell.aid)} · {DIMENSIONS.find((d) => d.id === cell.dim)?.label}
							</p>
							<ul>
								{(() => {
									const row = evaluations.find(({ ev }) => ev.benefitSlug === cell.aid);
									if (!row) return null;
									return cellReqs(row.rs, row.ev, cell.dim).map((r) => (
										<li key={r.id}>
											{tickFor(r.status).sym} {row.rs.requirements.find((x) => x.id === r.id)?.label ?? r.id}
											<span className="mono"> · {r.citation.locator}</span>
										</li>
									));
								})()}
							</ul>
						</div>
					)}
				</>
			)}
		</>
	);
}
