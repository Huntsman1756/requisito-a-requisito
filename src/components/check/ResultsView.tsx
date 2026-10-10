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
import { aidTitle, humanizeSlugs } from "../../lib/aid-titles";
import type { CheckData } from "../../lib/check-data";
import { es, type I18nKey, t } from "../../lib/i18n/es";
import { formatDateEs, formatAmount } from "../../lib/format";
import { matchLevel2 } from "../../lib/level2";
import {
	notEvaluableNow,
	nextVersion,
	pickValidVersions,
} from "../../lib/eligibility-engine/versions";
import {
	cellReqs,
	DIMENSIONS,
	dimOf,
	uncoveredCount,
	worstOf,
} from "../../lib/matrix";
import {
	definingU,
	groupResults,
	incomeThresholdU,
	isEncaja as encaja,
	type ResultEntry,
	type SoloSiEntry,
} from "../../lib/results-order";
import {
	cardSummary,
	planDocuments,
	planEntries,
	planTotal,
} from "../../lib/results-plan";

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
	const condMap = data.condiciones;
	const isEncaja = ({ rs, ev }: ResultEntry) =>
		encaja(rs, ev, condMap[ev.benefitSlug]);
	const [showAllL2, setShowAllL2] = useState(false);
	const [showMatrix, setShowMatrix] = useState(false);
	const [copied, setCopied] = useState(false);
	const [cleared, setCleared] = useState(false);

	const evaluations = useMemo(() => {
		// R8-VIG: una sola versión por ayuda — la vigente en la fecha de
		// consulta. Las ayudas sin versión vigente (o con varias) no se
		// evalúan («No podemos evaluar», fail-closed).
		const { evaluable, unavailable } = pickValidVersions(
			data.bundle.rulesets,
			evalCtx.today,
		);
		const evs = evaluable.map((rs) => ({
			rs,
			ev: evaluateRuleSet(rs, profile, evalCtx),
		}));
		for (const { slug } of unavailable) {
			// para el enlace a la fuente usamos cualquier versión conocida
			const any = data.bundle.rulesets.find((r) => r.benefitSlug === slug);
			evs.push({ rs: any as never, ev: notEvaluableNow(slug, evalCtx.today) });
		}
		return evs;
	}, [data, profile, evalCtx]);

	const byVerdict = (v: string) =>
		evaluations.filter(
			({ ev }) => ev.verdict === v && ev.selfCheck.passed,
		);
	const notEvaluable = evaluations.filter(({ ev }) => !ev.selfCheck.passed);
	const closedCount = evaluations.filter(
		({ ev }) => ev.deadline.state === "CLOSED",
	).length;

	// F10-RES: orden por utilidad, no por letra del nombre — la agrupación
	// vive en lib/results-order.ts (test sobre datos reales del bundle).
	const groups = groupResults(evaluations, showClosed, condMap);
	const { encajas, soloSi, posiblesPocas, noDescartar, faltanDatos, noCumple } =
		groups;
	// Orden en pantalla (F10-RES-3 §2): 1) Encaja · 2) Podría encajar
	// (posibles sin definitoria en U: abiertas las de pocas incógnitas,
	// plegadas las «no se pueden descartar») · 3) Te faltan datos ·
	// 4) «Solo si…» (lista compacta) · 5) No parece aplicarte ·
	// 6) Relacionadas sin comprobar.
	const podria = posiblesPocas.length;
	const noDescartadas = noDescartar.length;
	const visible = [
		...encajas,
		...posiblesPocas,
		...noDescartar,
		...faltanDatos,
		...soloSi,
	];

	// F10-RES-2 §2: «Te faltan datos» nunca reabre una pregunta ya
	// respondida con las mismas opciones. incomeAnnual respondida en la
	// franja abierta sí puede resolver con una pregunta de precisión al
	// umbral real que queda en U.
	const incomeX = useMemo(
		() =>
			incomeThresholdU(evaluations, profile, evalCtx),
		[evaluations, profile, evalCtx],
	);
	const missing = useMemo(() => {
		const map = new Map<string, { field: string; questionId: string; unlocks: number }>();
		for (const { ev } of evaluations) {
			for (const m of ev.missing) {
				const cur = map.get(m.field);
				if (!cur || m.unlocks > cur.unlocks) map.set(m.field, m);
			}
		}
		return [...map.values()].filter((m) => {
			const a = profile.answers[m.field];
			if (a?.state !== "value") return true;
			// Ya respondida: solo se ofrece si hay precisión útil.
			return m.field === "incomeAnnual" && incomeX !== undefined;
		});
	}, [evaluations, profile, incomeX]);

	const missingAids = new Set(
		evaluations.flatMap(({ ev }) => ev.missing.map(() => ev.benefitSlug)),
	).size;

	const level2 = useMemo(
		() =>
			matchLevel2(
				data.level2,
				profile.answers,
				data.territory.municipalities,
				lifeEvent,
			),
		[data, profile, lifeEvent],
	);

	const probables = encajas.length;

	// Plan de acción (docs/15 D + F10-RES-3 §3): solo los grupos 1 y 2
	// (Encaja y Podría encajar) — nunca «Solo si…» ni «Faltan datos».
	// La suma y los documentos salen de lib/results-plan.ts (test sobre
	// el bundle real).
	const actionEvals = planEntries(groups);
	const totalRange = planTotal(actionEvals);
	const groupedDocs = planDocuments(
		actionEvals,
		profile,
		evalCtx.parameters,
		evalCtx.today,
	);
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
				({ rs, ev }) =>
					`• ${aidTitle(ev.benefitSlug)}: ${isEncaja({ rs, ev }) ? "Encaja" : key(`verdict.${ev.verdict}`)}`,
			),
			"",
			t("legal.notice"),
		];
		navigator.clipboard?.writeText(lines.join("\n"));
		setCopied(true);
	};

	// Resumen superior (F10-RES-3 §4): contadores = grupos nuevos y una
	// frase en lenguaje claro que dice lo mismo.
	const sentence = [
		probables > 0 && t("results.sentence.encaja", { n: probables }),
		podria > 0 && t("results.sentence.podria", { n: podria }),
		noDescartadas > 0 &&
			t("results.sentence.noDescartar", { n: noDescartadas }),
		soloSi.length > 0 && t("results.sentence.solosi", { n: soloSi.length }),
		missing.length > 0 && t("results.sentence.faltan", { n: missing.length }),
		level2.length > 0 &&
			t("results.sentence.relacionadas", { n: level2.length }),
	]
		.filter(Boolean)
		.join("; ");
	const nothing =
		probables === 0 &&
		podria === 0 &&
		soloSi.length === 0 &&
		faltanDatos.length === 0;

	return (
		<section aria-labelledby="results-title">
			<div className="res-head">
				<div>
					{exampleLabel && <p className="persona">Ejemplo · {exampleLabel}</p>}
					<h1 id="results-title">{t("results.title")}</h1>
				</div>
			</div>
			<div className="tally" role="status" aria-live="polite">
				{probables > 0 && <div className="ok"><b>{probables}</b><span>{key("tally.probables")}</span></div>}
				{podria > 0 && <div className="doubt"><b>{podria}</b><span>{key("tally.posibles")}</span></div>}
				{noDescartadas > 0 && <div className="doubt"><b>{noDescartadas}</b><span>{key("tally.noDescartar")}</span></div>}
				{soloSi.length > 0 && <div className="doubt"><b>{soloSi.length}</b><span>{key("tally.solosi")}</span></div>}
				{missing.length > 0 && (
					<div className="doubt"><b>{missing.length}</b><span>{key("tally.missing")}</span></div>
				)}
				{level2.length > 0 && <div className="seal-c"><b>{level2.length}</b><span>{key("tally.level2")}</span></div>}
				<p className="results-sentence">
					{nothing ? t("results.summary.none") : sentence}
				</p>
			</div>

			{/* 1) Encaja contigo */}
			{encajas.length > 0 && (
				<h2 className="results-group">{key("results.group.encaja")}</h2>
			)}
			<div className="results-list">
				{encajas.map(({ rs, ev }) => (
					<ResultCard key={ev.benefitSlug} rs={rs} ev={ev} condMap={condMap} fresh={data.freshness} />
				))}
			</div>

			{/* 2) Podría encajar: posible sin condición definitoria en U.
			       Las de pocas incógnitas van abiertas; las demás, plegadas
			       en filas de una línea dentro del mismo grupo. */}
			{podria > 0 && (
				<>
					<h2 className="results-group">{key("results.group.posible")}</h2>
					<p className="note">{key("results.group.posible.note")}</p>
				</>
			)}
			<div className="results-list">
				{posiblesPocas.map(({ rs, ev }) => (
					<ResultCard key={ev.benefitSlug} rs={rs} ev={ev} condMap={condMap} fresh={data.freshness} />
				))}
			</div>
			{noDescartar.length > 0 && (
				<details className="results-closed" id="no-descartar">
					<summary>
						<h2 className="results-group">
							{t("results.group.posible.more", { n: noDescartar.length })}
						</h2>
					</summary>
					<ul className="row-list no-descartar-list">
						{noDescartar.map(({ ev }) => (
							<CompactRow key={ev.benefitSlug} slug={ev.benefitSlug} />
						))}
					</ul>
				</details>
			)}

			{/* 3) Te faltan datos (las preguntas) + las ayudas que dependen
			       de ellas, una por línea con enlace a la ficha. */}
			{missing.length > 0 && (
				<MissingPanel
					missing={missing}
					missingAids={missingAids}
					questions={questions}
					profile={profile}
					incomeX={incomeX}
					inlineField={inlineField}
					setInlineField={setInlineField}
					municipalities={data.territory.municipalities}
					ccaaList={data.territory.ccaa}
					onSetAnswer={onSetAnswer}
					onAnnounce={onAnnounce}
				/>
			)}
			{faltanDatos.length > 0 && (
				<div className="faltan-block">
					{missing.length === 0 && (
						<h2 className="results-group">{t("results.missing.title")}</h2>
					)}
					<p className="note">{key("results.group.faltan.aids")}</p>
					<ul className="row-list faltan-list">
						{faltanDatos.map(({ ev }) => (
							<CompactRow key={ev.benefitSlug} slug={ev.benefitSlug} />
						))}
					</ul>
				</div>
			)}

			{/* 4) «Solo si…»: lista compacta de una línea por ayuda, con
			       enlace a la ficha; plegada a partir de la sexta. */}
			{soloSi.length > 0 && (
				<>
					<h2 className="results-group">{key("results.group.soloSi")}</h2>
					<p className="note">{key("results.group.soloSi.note")}</p>
					<ul className="row-list solosi-list">
						{soloSi.slice(0, 5).map((s) => (
							<SoloSiRow key={s.ev.benefitSlug} entry={s} />
						))}
					</ul>
					{soloSi.length > 5 && (
						<details className="results-closed results-closed--inline">
							<summary>
								{t("results.group.soloSi.more", { n: soloSi.length - 5 })}
							</summary>
							<ul className="row-list solosi-list">
								{soloSi.slice(5).map((s) => (
									<SoloSiRow key={s.ev.benefitSlug} entry={s} />
								))}
							</ul>
						</details>
					)}
				</>
			)}

			{noCumple.length > 0 && (
				<div className="nocumple">
					<button
						type="button"
						className="btn-quiet"
						aria-expanded={showNoCumple}
						onClick={() => setShowNoCumple((v) => !v)}
					>
						{t("results.noaplica.title", {
							n: noCumple.length,
						})} — ver por qué
					</button>
					{showNoCumple && (
						<ul className="results-list">
							{noCumple.map(({ rs, ev }) => (
								<li key={ev.benefitSlug}>
									<ResultCard rs={rs} ev={ev} condMap={condMap} fresh={data.freshness} compact />
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
				<RequirementMatrix evaluations={evaluations} condMap={condMap} />
			)}

			<section className="action-plan" aria-labelledby="plan-title">
				<h2 id="plan-title">Tu plan de acción</h2>
				{actionEvals.length === 0 ? (
					<p>{t("results.plan.empty")}</p>
				) : (
					<>
						{totalRange ? (
							<p className="plan-total">
								{t("results.plan.total", {
									max: totalRange.max.toLocaleString("es-ES"),
									n: totalRange.n,
								})}
							</p>
						) : (
							<p>{t("results.plan.noAmount")}</p>
						)}
						{groupedDocs.length > 0 && (
							<div className="plan-docs">
								<p>{t("results.plan.docs", { n: groupedDocs.length })}</p>
								<ul>
									{groupedDocs.slice(0, 5).map((d) => (
										<li key={d.label}>
											{d.label}
											<span className="mono"> · {d.count} {d.count === 1 ? "ayuda" : "ayudas"}</span>
										</li>
									))}
								</ul>
								{groupedDocs.length > 5 && (
									<details className="results-closed results-closed--inline">
										<summary>
											{t("results.plan.docs.more", { n: groupedDocs.length - 5 })}
										</summary>
										<ul>
											{groupedDocs.slice(5).map((d) => (
												<li key={d.label}>
													{d.label}
													<span className="mono"> · {d.count} {d.count === 1 ? "ayuda" : "ayudas"}</span>
												</li>
											))}
										</ul>
									</details>
								)}
							</div>
						)}
						{icsHref && (
							<p>
								<a className="btn-quiet" href={icsHref} download="plazos-ayudas.ics">
									{t("results.plan.ics")}
								</a>
							</p>
						)}
					</>
				)}
			</section>

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
			{/* Aviso legal una vez por página (docs/09 §3 LegalNotice «fijo»):
			    antes iba en cada tarjeta y multiplicaba la altura. */}
			<p className="legal">{t("legal.notice")}</p>
		</section>
	);
}
/** Fila compacta de una línea: título enlazado a la ficha + matiz
 *  (la condición «solo si…»). F10-RES-3 §1/§2: fuera de «Encaja» y
 *  «Podría encajar» abierto todo son filas, no tarjetas. */
function CompactRow({ slug, extra }: { slug: string; extra?: string }) {
	return (
		<li className="row-line">
			<Link href={`/ayudas/${slug}`}>{aidTitle(slug)}</Link>
			{extra ? ` — ${extra}` : ""}
		</li>
	);
}

function SoloSiRow({ entry }: { entry: SoloSiEntry }) {
	return (
		<CompactRow
			slug={entry.ev.benefitSlug}
			extra={entry.conds.map((c) => c.texto).join("; ")}
		/>
	);
}

type MissingItem = { field: string; questionId: string; unlocks: number };

/** Panel «Te faltan datos»: responde en línea y se recalcula. */
function MissingPanel({
	missing,
	missingAids,
	questions,
	profile,
	incomeX,
	inlineField,
	setInlineField,
	municipalities,
	ccaaList,
	onSetAnswer,
	onAnnounce,
}: {
	missing: MissingItem[];
	missingAids: number;
	questions: Question[];
	profile: CitizenProfile;
	incomeX: number | undefined;
	inlineField: string | null;
	setInlineField: (f: string | null) => void;
	municipalities: CheckData["territory"]["municipalities"];
	ccaaList: CheckData["territory"]["ccaa"];
	onSetAnswer: (field: string, a: Answer) => void;
	onAnnounce: (s: string) => void;
}) {
	return (
		<aside className="missing-panel" aria-labelledby="missing-title">
			<h2 id="missing-title">{t("results.missing.title")}</h2>
			<p>{t("results.missing.body", { n: missingAids })}</p>
			<ul className="missing-fields">
				{missing.map((m) => {
					const q = questions.find((x) => x.field === m.field);
					if (!q) return null;
					// §2.2: ingresos ya respondidos en la franja abierta →
					// pregunta de precisión al umbral real, no la misma
					// pregunta con las mismas opciones.
					const precision =
						m.field === "incomeAnnual" &&
						profile.answers[m.field]?.state === "value" &&
						incomeX !== undefined;
					return (
						<li key={m.field}>
							{precision ? (
								inlineField === m.field ? (
									<div className="precision-q">
										<p>
											{t("results.missing.incomePrecision", {
												x: `${incomeX.toLocaleString("es-ES")} €`,
											})}
										</p>
										<button
											type="button"
											className="cta"
											onClick={() => {
												onSetAnswer("incomeAnnual", {
													state: "value",
													value: { min: incomeX, max: null },
												});
												setInlineField(null);
												onAnnounce(t("results.missing.recalc"));
											}}
										>
											{t("results.missing.incomeGe", {
												x: `${incomeX.toLocaleString("es-ES")} €`,
											})}
										</button>{" "}
										<button
											type="button"
											className="btn-quiet"
											onClick={() => {
												const aInc = profile.answers.incomeAnnual;
												const cur = aInc?.state === "value" ? (aInc.value as { min?: number | null }) : undefined;
												onSetAnswer("incomeAnnual", {
													state: "value",
													value: { min: cur?.min ?? null, max: incomeX },
												});
												setInlineField(null);
												onAnnounce(t("results.missing.recalc"));
											}}
										>
											{t("results.missing.incomeLt", {
												x: `${incomeX.toLocaleString("es-ES")} €`,
											})}
										</button>{" "}
										<button
											type="button"
											className="btn-quiet"
											onClick={() => setInlineField(null)}
										>
											{key("check.decline")}
										</button>
									</div>
								) : (
									<>
										{t("results.missing.incomePrecision", {
											x: `${incomeX.toLocaleString("es-ES")} €`,
										})}{" "}
										<button
											type="button"
											className="btn-quiet"
											onClick={() => setInlineField(m.field)}
										>
											{t("results.missing.answer")}
										</button>
									</>
								)
							) : inlineField === m.field ? (
								<QuestionStep
									inline
									question={q}
									answer={profile.answers[m.field]}
									municipalities={municipalities}
									ccaaList={ccaaList}
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
	);
}

/** Tarjeta resumida (F10-RES-3 §1): visibles por defecto el título,
 *  hasta 3 ✓, hasta 3 ⚠, cuánto puedes recibir, plazo y dónde
 *  solicitar. El resto, plegado en «Ver todos los requisitos (N)». */
function ResultCard({
	rs,
	ev,
	compact,
	condMap,
	fresh,
}: {
	rs: RuleSet;
	ev: EvaluationResult;
	compact?: boolean;
	condMap: Record<string, { req: string; texto: string }[] | undefined>;
	fresh: Record<string, string>;
}) {
	const [open, setOpen] = useState(false);
	const failed = ev.requirements.filter((r) => r.status === "F" && r.hard);
	const pill = `pill pill--${ev.verdict}`;
	const defIds = new Set(
		definingU(rs, ev, condMap[ev.benefitSlug]).map((c) => c.req),
	);
	const summary = cardSummary(rs, ev, defIds);
	const nReqs = ev.requirements.length + ev.uncovered.length;

	return (
		<article className="aid-card">
			<p className="card-badges">
				{rs.benefitSlug.startsWith("madrid-") ? (
					<span className="badge badge--scope">Comunidad de Madrid</span>
				) : (
					<span className="badge badge--scope">Ámbito estatal</span>
				)}
				<DeadlinePill ev={ev} />
			</p>
			<h2>
				{aidTitle(ev.benefitSlug)}{" "}
				<span className={pill}>{encaja(rs, ev, condMap[ev.benefitSlug]) ? "Encaja" : key(`verdict.${ev.verdict}`)}</span>
			</h2>
			{rs.versionNote && (
				<p className="note version-note">
					{rs.versionNote}{" "}
					<Link href={`/ayudas/${ev.benefitSlug}`}>ver las dos versiones</Link>
				</p>
			)}
			{ev.futureEligibility && (
				<p className="future">
					{t("results.future", { date: formatDateEs(ev.futureEligibility.from) })}
				</p>
			)}

			{ev.verdict === "no_cumple" && failed.length > 0 && (
				<>
					<p>{t("results.noaplica.intro")}</p>
					<ul className="req-list">
						{failed.map((f) => {
							const req = rs.requirements.find((r) => r.id === f.id);
							return (
								<li key={f.id} className="req req--F">
									<span className="req-status">✗ {t("req.f")}</span>{" "}
									{req?.label ?? f.id}
									<details className="cite">
										<summary
											aria-label={`${t("req.source")}: ${req?.label ?? f.id}`}
										>
											{t("req.source")}
										</summary>
										<blockquote lang="es">
											«{f.citation.excerpt}»
										</blockquote>
										<p className="cite-meta">
											{f.citation.locator} ·{" "}
											<a
												href={
													rs.sources.find(
														(s) => s.id === f.citation.sourceId,
													)?.url
												}
												rel="noopener noreferrer"
											>
												{t("card.gotoSource")} ↗
											</a>
										</p>
									</details>
								</li>
							);
						})}
					</ul>
					<p className="note">{t("results.noaplica.checkSource")}</p>
					<p className="card-actions">
						<Link className="btn-quiet" href={`/ayudas/${ev.benefitSlug}`}>
							{t("card.fullDetail")}
						</Link>
					</p>
				</>
			)}

			{!compact && (
				<>
					{summary.cumple.length > 0 && (
						<>
							<h3>{t("card.meets")}</h3>
							<ul className="req-list req-mini">
								{summary.cumple.map((label, i) => (
									<li key={i} className="req req--T">
										<span className="req-status">✓ {t("req.t")}</span>{" "}
										{humanizeSlugs(label)}
									</li>
								))}
							</ul>
						</>
					)}
					{summary.falta.length > 0 && (
						<>
							<h3>{t("card.toCheck")}</h3>
							<ul className="req-list req-mini">
								{summary.falta.map((w, i) => (
									<li
										key={i}
										className={`req ${w.kind === "warn" ? "req--warn" : "req--U"}`}
									>
										<span className="req-status">
											{w.kind === "warn"
												? `⚠ ${t("req.uncovered")}`
												: `? ${t("req.u")}`}
										</span>{" "}
										{humanizeSlugs(w.label)}
									</li>
								))}
							</ul>
						</>
					)}

					<dl className="aid-meta aid-meta--compact">
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
									: (ev.deadline.state === "OPEN" ||
												ev.deadline.state === "UPCOMING") &&
										  ev.deadline.closesAt
										? t("deadline.closesAt", { date: formatDateEs(ev.deadline.closesAt) })
										: key(`deadline.${ev.deadline.state}`)}
							</dd>
						</div>
						<div className="clamp2">
							<dt>{t("card.channel")}</dt>
							<dd>
								<a href={ev.channel.url} rel="noopener noreferrer">
									{ev.channel.managingBody} ↗
								</a>
							</dd>
						</div>
					</dl>

					<details className="req-more">
						<summary>{t("card.allReqs", { n: nReqs })}</summary>
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
										{humanizeSlugs(req?.label ?? "")}
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
									<span className="req-status">⚠ {t("req.uncovered")}</span> {humanizeSlugs(u)}
								</li>
							))}
						</ul>
						{(ev.documents.length > 0 || ev.effort) && (
							<dl className="aid-meta">
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
							</dl>
						)}
						<p>
							<button
								type="button"
								className="btn-quiet"
								aria-expanded={open}
								onClick={() => setOpen((v) => !v)}
							>
								{t("req.why.title")}
							</button>
						</p>
						{open && (
							<p className="why">
								{t("card.verifiedAt", { date: formatDateEs(ev.verifiedAt) })}
								{rs.sources[0] && fresh[rs.sources[0].id] && (
									<>
										{" · "}
										{t("card.sourceCheckedAt", {
											date: formatDateEs(fresh[rs.sources[0].id]),
										})}
									</>
								)}{" "}
								·{" "}
								{rs.sources
									.filter((s) => s.rank <= 2)
									.map((s) => domainBadge(s.url))
									.join(", ")}
							</p>
						)}
					</details>

					<p className="card-actions">
						{rs.application.officialSimulator ? (
							<a className="cta" href={rs.application.officialSimulator.url} rel="noopener noreferrer">
								{t("card.gotoSimulator")} ↗
							</a>
						) : (
							<a className="cta" href={ev.channel.url} rel="noopener noreferrer">
								{t("card.gotoChannel")} ↗
							</a>
						)}
					</p>
				</>
			)}

			{/* compact: la variante no_cumple ya lleva su enlace a ficha en el
			    bloque de requisitos fallados; no lo dupliquemos (strict). */}
			{compact && ev.verdict !== "no_cumple" && (
				<p className="card-actions">
					<Link className="btn-quiet" href={`/ayudas/${ev.benefitSlug}`}>
						{t("card.fullDetail")}
					</Link>
				</p>
			)}

			<p className="card-foot">
				<span className="review-state">
					Comprobada con la fuente
					{rs.humanReview?.status === "approved" && " · revisada"}
					{rs.humanReview?.status !== "approved" &&
						rs.panelReview?.status === "approved" &&
						" · revisada por un panel independiente"}
					{rs.humanReview?.status !== "approved" &&
						rs.panelReview?.status !== "approved" &&
						" · revisión final pendiente"}{" "}
					· {rs.sources[0] ? domainBadge(rs.sources[0].url) : ""} ·{" "}
					{t("card.verifiedAt", { date: formatDateEs(ev.verifiedAt) })}
					{rs.sources[0] && fresh[rs.sources[0].id] && (
						<>
							{" · "}
							{t("card.sourceCheckedAt", {
								date: formatDateEs(fresh[rs.sources[0].id]),
							})}
						</>
					)}
					{!compact && (
						<>
							{" · "}
							<Link href={`/ayudas/${ev.benefitSlug}`}>
								{t("card.fullDetail")}
							</Link>
						</>
					)}
				</span>
			</p>
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
	condMap,
}: {
	evaluations: { rs: RuleSet; ev: EvaluationResult }[];
	condMap: Record<string, { req: string; texto: string }[] | undefined>;
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

	const verdictLabel = (rs: RuleSet, ev: EvaluationResult) =>
		encaja(rs, ev, condMap[ev.benefitSlug]) ? "Encaja" : ev.verdict === "posible" ? "Falta un dato" : ev.verdict === "insuficiente" ? "Le faltan datos" : "No te aplica";
	const verdictCls = (rs: RuleSet, ev: EvaluationResult) =>
		encaja(rs, ev, condMap[ev.benefitSlug]) ? "v-ok" : ev.verdict === "posible" || ev.verdict === "insuficiente" ? "v-doubt" : "v-no";

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
									<summary>{aidTitle(ev.benefitSlug)} — {verdictLabel(rs, ev)}</summary>
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
											<span className={`verdict ${verdictCls(rs, ev)}`}>
												{verdictLabel(rs, ev)}
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
							<ul className="cite-rows">
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
