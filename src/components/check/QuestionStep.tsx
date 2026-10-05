"use client";

import { useId, useState } from "react";
import type { CitizenProfile, QuestionCatalog } from "../../lib/eligibility-engine/schema";

type Question = QuestionCatalog["questions"][number];
export type Answer = CitizenProfile["answers"][string];
import { es, type I18nKey, t } from "../../lib/i18n/es";



const optLabel = (q: Question, v: string): string => {
	const o = q.options?.find((x) => x.value === v);
	if (!o) return v;
	const k = o.labelKey as I18nKey;
	return k in es ? es[k] : v;
};

const key = (k: string): string => (k in es ? es[k as I18nKey] : k);

interface Props {
	question: Question;
	answer: Answer | undefined;
	municipalities: { code: string; name: string }[];
	ccaaList: { code: string; name: string }[];
	onAnswer: (a: Answer) => void;
	onContinue: () => void;
	onBack: () => void;
	inline?: boolean;
}

export function QuestionStep({
	question,
	answer,
	municipalities,
	ccaaList,
	onAnswer,
	onContinue,
	onBack,
	inline,
}: Props) {
	const id = useId();
	const [error, setError] = useState(false);
	const [draft, setDraft] = useState<string>(() => initialDraft(question, answer));
	const [ccaa, setCcaa] = useState<string>(() => initialCcaa(answer));
	const [muni, setMuni] = useState<string>(() => initialMuni(answer));
	const [showWhy, setShowWhy] = useState(false);

	const value = answer?.state === "value" ? answer.value : undefined;

	const commit = () => {
		if (question.type === "territory") {
			if (!ccaa) {
				setError(true);
				return;
			}
			onAnswer({
				state: "value",
				value:
					ccaa === "13" && muni
						? { ccaa: "13", province: "28", municipality: muni }
						: { ccaa },
			});
		} else if (question.type === "age" || question.type === "integer") {
			const n = Number(draft);
			if (!Number.isFinite(n) || draft.trim() === "") {
				setError(true);
				return;
			}
			onAnswer({
				state: "value",
				value: { min: n, max: n, maxExclusive: false },
			});
		} else if (question.type === "dependents") {
			const n = Number(draft);
			if (!Number.isFinite(n) || draft.trim() === "" || n < 0) {
				setError(true);
				return;
			}
			const deps = Array.from({ length: n }, () => ({
				age: { min: 0, max: 130, maxExclusive: false },
			}));
			onAnswer({ state: "value", value: deps });
		} else if (question.type === "money_band") {
			if (typeof value !== "object") {
				setError(true);
				return;
			}
			onAnswer(answer as Answer);
		} else if (question.type === "month_year") {
			if (!draft) {
				setError(true);
				return;
			}
			const [y, m] = draft.split("-").map(Number);
			onAnswer({ state: "value", value: { year: y, month: m } });
		} else {
			if (typeof value !== "string") {
				setError(true);
				return;
			}
			onAnswer(answer as Answer);
		}
		onContinue();
	};

	return (
		<fieldset className="question" aria-describedby={`${id}-help`}>
			<legend>
				<h1 className="question__title">{key(question.labelKey)}</h1>
			</legend>
			<p id={`${id}-help`} className="question__help">
				{key(question.helpKey ?? "")}
			</p>
			<button
				type="button"
				className="question__why"
				aria-expanded={showWhy}
				onClick={() => setShowWhy((v) => !v)}
			>
				{t("check.why")}
			</button>
			{showWhy && <p className="question__whyText">{key(question.whyKey)}</p>}

			{question.type === "territory" && (
				<div className="field">
					<label htmlFor={`${id}-ccaa`}>{t("q.territory.ccaa")}</label>
					<select
						id={`${id}-ccaa`}
						value={ccaa}
						onChange={(e) => {
							setCcaa(e.target.value);
							setError(false);
						}}
					>
						<option value="">—</option>
						{ccaaList.map((c) => (
							<option key={c.code} value={c.code}>
								{c.name}
							</option>
						))}
					</select>
					{ccaa === "13" && (
						<>
							<label htmlFor={`${id}-muni`}>{t("q.territory.municipality")}</label>
							<select
								id={`${id}-muni`}
								value={muni}
								onChange={(e) => setMuni(e.target.value)}
							>
								<option value="">—</option>
								{municipalities.map((m) => (
									<option key={m.code} value={m.code}>
										{m.name}
									</option>
								))}
							</select>
						</>
					)}
				</div>
			)}

			{(question.type === "age" || question.type === "integer") && (
				<div className="field">
					<input
						type="number"
						inputMode="numeric"
						value={draft}
						min={question.min}
						max={question.max}
						onChange={(e) => {
							setDraft(e.target.value);
							setError(false);
						}}
						aria-label={key(question.labelKey)}
					/>
				</div>
			)}

			{question.type === "dependents" && (
				<div className="field">
					<input
						type="number"
						inputMode="numeric"
						min={0}
						value={draft}
						onChange={(e) => {
							setDraft(e.target.value);
							setError(false);
						}}
						aria-label={key(question.labelKey)}
					/>
				</div>
			)}

			{question.type === "month_year" && (
				<div className="field">
					<input
						type="month"
						value={draft}
						onChange={(e) => {
							setDraft(e.target.value);
							setError(false);
						}}
						aria-label={key(question.labelKey)}
					/>
				</div>
			)}

			{question.type === "single" &&
				(question.options ?? []).map((o) => (
					<label key={o.value} className="option">
						<input
							type="radio"
							name={id}
							checked={value === o.value}
							onChange={() => {
								onAnswer({ state: "value", value: o.value });
								setError(false);
							}}
						/>
						{optLabel(question, o.value)}
					</label>
				))}

			{question.type === "money_band" &&
				(question.options ?? []).map((o) => {
					const [lo, hi] = o.interval ?? [null, null];
					const checked =
						typeof value === "object" &&
						value !== null &&
						(value as { min?: number }).min === lo;
					return (
						<label key={o.value} className="option">
							<input
								type="radio"
								name={id}
								checked={checked}
								onChange={() => {
									onAnswer({
										state: "value",
										value: { min: lo, max: hi, maxExclusive: hi !== null },
									});
									setError(false);
								}}
							/>
							{optLabel(question, o.value)}
						</label>
					);
				})}

			{error && (
				<p className="field-error" role="alert" id={`${id}-error`}>
					{t("check.error.required")}
				</p>
			)}

			<div className="question__alt">
				{question.allowUnknown && (
					<button
						type="button"
						className="btn-quiet"
						onClick={() => {
							onAnswer({ state: "unknown" });
							onContinue();
						}}
					>
						{t("check.unknown")}
					</button>
				)}
				{question.allowDecline && (
					<button
						type="button"
						className="btn-quiet"
						onClick={() => {
							onAnswer({ state: "declined" });
							onContinue();
						}}
					>
						{t("check.decline")}
					</button>
				)}
			</div>

			<div className="question__actions">
				{!inline && (
					<button type="button" className="btn-quiet" onClick={onBack}>
						{t("check.back")}
					</button>
				)}
				<button type="button" className="cta" onClick={commit}>
					{t(inline ? "results.missing.answer" : "check.next")}
				</button>
			</div>
		</fieldset>
	);
}

function initialDraft(q: Question, a: Answer | undefined): string {
	if (a?.state !== "value") return "";
	const v = a.value;
	if (q.type === "age" || q.type === "integer") {
		const i = v as { min?: number };
		return i?.min !== undefined ? String(i.min) : "";
	}
	if (q.type === "dependents" && Array.isArray(v)) return String(v.length);
	if (q.type === "month_year") {
		const my = v as { year?: number; month?: number };
		return my.year !== undefined && my.month !== undefined
			? `${my.year}-${String(my.month).padStart(2, "0")}`
			: "";
	}
	return "";
}

function initialCcaa(a: Answer | undefined): string {
	if (a?.state !== "value") return "";
	const v = a.value as { ccaa?: string };
	return v?.ccaa ?? "";
}

function initialMuni(a: Answer | undefined): string {
	if (a?.state !== "value") return "";
	const v = a.value as { municipality?: string };
	return v?.municipality ?? "";
}
