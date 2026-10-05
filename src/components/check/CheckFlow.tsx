"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { evaluateRuleSet } from "../../lib/eligibility-engine/evaluate";
import { evalCondition } from "../../lib/eligibility-engine/operators";
import type {
	CitizenProfile,
	QuestionCatalog,
} from "../../lib/eligibility-engine/schema";

type Question = QuestionCatalog["questions"][number];
import { type CheckData, loadCheckData } from "../../lib/check-data";
import { BUNDLE_DIGEST } from "../../generated/bundle-digest";
import { es, type I18nKey, t } from "../../lib/i18n/es";
import {
	clearAll,
	readHandoff,
	writeHandoff,
} from "../../lib/profile-store";
import { usedFields } from "../../lib/used-fields";
import type { Answer } from "./QuestionStep";
import { QuestionStep } from "./QuestionStep";
import { ResultsView } from "./ResultsView";

type Phase = "loading" | "error" | "intro" | "questions" | "review" | "results";

const key = (k: string): string => (k in es ? es[k as I18nKey] : k);

export function CheckFlow() {
	const [phase, setPhase] = useState<Phase>("loading");
	const [data, setData] = useState<CheckData | null>(null);
	const [answers, setAnswers] = useState<CitizenProfile["answers"]>({});
	const [step, setStep] = useState(0);
	const [editReturn, setEditReturn] = useState<Phase | null>(null);
	const [announce, setAnnounce] = useState("");
	const mainRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		loadCheckData()
			.then((d) => {
				setData(d);
				const saved = readHandoff();
				if (saved) {
					setAnswers(saved.answers);
					setStep(saved.step);
				}
				setPhase("intro");
			})
			.catch(() => setPhase("error"));
	}, []);

	// Preguntas necesarias: solo campos que alguna regla usa.
	const questions = useMemo<Question[]>(() => {
		if (!data) return [];
		const fields = usedFields(data.bundle.rulesets);
		return data.questions.questions
			.filter((q) => fields.has(q.field))
			.sort((a, b) => a.order - b.order);
	}, [data]);

	const evalCtx = useMemo(
		() =>
			data
				? {
						parameters: data.bundle.parameters,
						catalog: data.questions,
						referenceDate: new Date().toISOString().slice(0, 10),
						today: new Date().toISOString().slice(0, 10),
						bundleDigest: data.manifestDigest,
						expectedBundleDigest: BUNDLE_DIGEST,
					}
				: null,
		[data],
	);

	// Paso visible según showIf sobre las respuestas actuales.
	const visibleQuestions = useMemo(() => {
		if (!evalCtx) return [];
		return questions.filter((q) => {
			if (!q.showIf) return true;
			const r = evalCondition(q.showIf, { answers }, evalCtx);
			return r.status !== "F";
		});
	}, [questions, answers, evalCtx]);

	const focusMain = () =>
		setTimeout(() => mainRef.current?.querySelector("h1")?.setAttribute("tabindex", "-1"), 0);

	const goTo = (p: Phase, nextStep?: number) => {
		if (nextStep !== undefined) setStep(nextStep);
		setPhase(p);
		if (data) {
			writeHandoff({
				step: nextStep ?? step,
				answers,
				savedAt: new Date().toISOString(),
			});
		}
		setAnnounce(t("check.progress", { n: (nextStep ?? step) + 1, total: visibleQuestions.length }));
	};

	const onAnswer = (field: string, a: Answer) => {
		setAnswers((prev) => ({ ...prev, [field]: a }));
	};

	const continueFromStep = () => {
		if (editReturn) {
			setEditReturn(null);
			goTo(editReturn);
			return;
		}
		if (step + 1 >= visibleQuestions.length) goTo("review");
		else goTo("questions", step + 1);
	};

	const backFromStep = () => {
		if (editReturn) {
			setEditReturn(null);
			goTo(editReturn);
			return;
		}
		if (step === 0) goTo("intro");
		else goTo("questions", step - 1);
	};

	const profile: CitizenProfile | null =
		data && evalCtx
			? { catalogVersion: data.questions.catalogVersion, answers }
			: null;

	if (phase === "loading")
		return (
			<div className="shell" aria-busy="true">
				<p>Cargando…</p>
			</div>
		);

	if (phase === "error" || !data || !evalCtx || !profile)
		return (
			<div className="shell">
				<h1>{t("error.title")}</h1>
				<p>{t("error.bundle")}</p>
			</div>
		);

	return (
		<div className="shell check" ref={mainRef}>
			<div aria-live="polite" className="sr-only">
				{announce}
			</div>

			{phase === "intro" && (
				<section aria-labelledby="intro-title">
					<h1 id="intro-title">{t("check.intro.title")}</h1>
					<p className="lede">
						Responde unas preguntas y te decimos qué ayudas merece la pena
						comprobar. No hace falta registrarse.
					</p>
					<p>
						<button type="button" className="cta" onClick={() => goTo("questions", 0)}>
							{t("check.intro.start")}
						</button>
					</p>
					<p className="privacy-note">{t("check.intro.privacy")}</p>
				</section>
			)}

			{phase === "questions" && visibleQuestions[step] && (
				<>
					<div
						className="progress"
						role="progressbar"
						aria-valuenow={step + 1}
						aria-valuemin={1}
						aria-valuemax={visibleQuestions.length}
					>
						<div
							className="progress__bar"
							style={{
								width: `${((step + 1) / visibleQuestions.length) * 100}%`,
							}}
						/>
						<p className="progress__label">
							{t("check.progress", {
								n: step + 1,
								total: visibleQuestions.length,
							})}
						</p>
					</div>
					<QuestionStep
						key={visibleQuestions[step].id + step}
						question={visibleQuestions[step]}
						answer={answers[visibleQuestions[step].field] as Answer | undefined}
						municipalities={data.territory.municipalities}
						ccaaList={data.territory.ccaa}
						onAnswer={(a) => onAnswer(visibleQuestions[step].field, a)}
						onContinue={continueFromStep}
						onBack={backFromStep}
					/>
				</>
			)}

			{phase === "review" && (
				<section aria-labelledby="review-title">
					<h1 id="review-title">{t("check.review.title")}</h1>
					<ul className="review-list">
						{visibleQuestions.map((q, i) => {
							const a = answers[q.field];
							return (
								<li key={q.id}>
									<span className="review-q">{key(q.labelKey)}</span>
									<span className="review-a">
								{describeAnswer(q, a, (code) => {
									const m = data.territory.municipalities.find(
										(x) => x.code === code,
									);
									return m?.name ?? code;
								})}
							</span>
									<button
										type="button"
										className="btn-quiet"
										onClick={() => {
											setEditReturn("review");
											goTo("questions", i);
										}}
									>
										{t("check.review.edit")}
									</button>
								</li>
							);
						})}
					</ul>
					<p>
						<button type="button" className="cta" onClick={() => goTo("results")}>
							{t("check.review.submit")}
						</button>
					</p>
				</section>
			)}

			{phase === "results" && (
				<ResultsView
					data={data}
					profile={profile}
					evalCtx={evalCtx}
					questions={questions}
					onSetAnswer={(field, a) =>
						setAnswers((prev) => ({ ...prev, [field]: a }))
					}
					onRestart={() => {
						clearAll();
						setAnswers({});
						setStep(0);
						goTo("intro");
					}}
					onAnnounce={setAnnounce}
				/>
			)}
		</div>
	);
}

function describeAnswer(
	q: Question,
	a: Answer | undefined,
	resolveMuni?: (code: string) => string,
): string {
	if (!a || a.state === "unasked") return "—";
	if (a.state === "unknown") return t("check.unknown");
	if (a.state === "declined") return t("check.decline");
	if (a.state !== "value") return "—";
	const v = a.value;
	if (q.type === "territory") {
		const tv = v as { municipality?: string; ccaa?: string };
		if (tv.municipality && resolveMuni)
			return `${resolveMuni(tv.municipality)} (${tv.municipality})`;
		return tv.municipality ?? tv.ccaa ?? "";
	}
	if (q.type === "age" || q.type === "integer") {
		return String((v as { min?: number }).min ?? "");
	}
	if (q.type === "dependents" && Array.isArray(v)) return String(v.length);
	if (q.type === "month_year") {
		const my = v as { year: number; month: number };
		return `${my.month}/${my.year}`;
	}
	if (q.type === "money_band" || q.type === "single") {
		const o = q.options?.find((x) =>
			q.type === "money_band"
				? x.interval?.[0] === (v as { min?: number }).min
				: x.value === v,
		);
		if (o) return key(o.labelKey);
	}
	return String(v);
}
