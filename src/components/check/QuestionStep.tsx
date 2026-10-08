"use client";

import { useId, useState } from "react";
import type { CitizenProfile, QuestionCatalog } from "../../lib/eligibility-engine/schema";

type Question = QuestionCatalog["questions"][number];
export type Answer = CitizenProfile["answers"][string];
import { es, type I18nKey, t } from "../../lib/i18n/es";
import { MunicipalityCombobox } from "./MunicipalityCombobox";



const MAX_DEPENDENTS = 20;
const MAX_DEP_AGE = 130;

interface DepRow {
	age: string;
	declined: boolean;
}

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
	onOutsideMadrid?: () => void;
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
	onOutsideMadrid,
	inline,
}: Props) {
	const id = useId();
	const [error, setError] = useState<I18nKey | null>(null);
	const [draft, setDraft] = useState<string>(() => initialDraft(question, answer));
	const [depRows, setDepRows] = useState<DepRow[]>(() => initialDepRows(answer));
	const [ccaa, setCcaa] = useState<string>(() => initialCcaa(answer));
	const [muni, setMuni] = useState<string>(() => initialMuni(answer));
	const [showWhy, setShowWhy] = useState(false);

	const value = answer?.state === "value" ? answer.value : undefined;

	const depCount =
		question.type === "dependents"
			? Math.min(Math.max(0, Math.floor(Number(draft) || 0)), MAX_DEPENDENTS)
			: 0;

	const updateDep = (i: number, patch: Partial<DepRow>) => {
		setDepRows((prev) => {
			const next = [...prev];
			next[i] = { ...(next[i] ?? { age: "", declined: false }), ...patch };
			return next;
		});
		setError(null);
	};

	const commit = () => {
		if (question.type === "territory") {
			if (!muni) {
				setError("check.error.required");
				return;
			}
			onAnswer({
				state: "value",
				value: { ccaa: "13", province: "28", municipality: muni },
			});
		} else if (question.type === "age" || question.type === "integer") {
			const n = Number(draft);
			if (!Number.isFinite(n) || draft.trim() === "") {
				setError("check.error.required");
				return;
			}
			onAnswer({
				state: "value",
				value: { min: n, max: n, maxExclusive: false },
			});
		} else if (question.type === "dependents") {
			const n = Number(draft);
			if (
				!Number.isInteger(n) ||
				draft.trim() === "" ||
				n < 0 ||
				n > MAX_DEPENDENTS
			) {
				setError("check.error.range");
				return;
			}
			const orig =
				answer?.state === "value" && Array.isArray(answer.value)
					? (answer.value as { disability?: unknown }[])
					: [];
			const deps: {
				age: { min: number; max: number; maxExclusive: boolean };
				disability?: "yes" | "no" | "unknown" | "declined";
			}[] = [];
			for (let i = 0; i < n; i++) {
				const row = depRows[i];
				const dis = orig[i]?.disability;
				const keep: {
					disability?: "yes" | "no" | "unknown" | "declined";
				} =
					dis === "yes" || dis === "no" || dis === "unknown" || dis === "declined"
						? { disability: dis }
						: {};
				if (row?.declined) {
					// «Prefiero no decirlo» por persona: rango desconocido (UNKNOWN ≠ NO).
					deps.push({
						age: { min: 0, max: MAX_DEP_AGE, maxExclusive: false },
						...keep,
					});
					continue;
				}
				const a = Number(row?.age);
				if (
					!row ||
					row.age.trim() === "" ||
					!Number.isInteger(a) ||
					a < 0 ||
					a > MAX_DEP_AGE
				) {
					setError("check.error.dependentAge");
					return;
				}
				deps.push({
					age: { min: a, max: a, maxExclusive: false },
					...keep,
				});
			}
			onAnswer({ state: "value", value: deps });
		} else if (question.type === "money_band") {
			if (typeof value !== "object") {
				setError("check.error.required");
				return;
			}
			onAnswer(answer as Answer);
		} else if (question.type === "month_year") {
			if (!draft) {
				setError("check.error.required");
				return;
			}
			const [y, m] = draft.split("-").map(Number);
			onAnswer({ state: "value", value: { year: y, month: m } });
		} else {
			if (typeof value !== "string") {
				setError("check.error.required");
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
				<MunicipalityCombobox
					id={id}
					municipalities={municipalities}
					value={muni}
					onChange={(code) => {
						setMuni(code);
						setCcaa("13");
						setError(null);
					}}
					onOutsideMadrid={onOutsideMadrid}
				/>
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
							setError(null);
						}}
						aria-label={key(question.labelKey)}
					/>
				</div>
			)}

			{question.type === "dependents" && (
				<>
					<div className="field">
						<input
							type="number"
							inputMode="numeric"
							min={0}
							max={MAX_DEPENDENTS}
							value={draft}
							onChange={(e) => {
								setDraft(e.target.value);
								setError(null);
							}}
							aria-label={key(question.labelKey)}
						/>
					</div>
					{depCount > 0 && (
						<fieldset className="dep-ages">
							<legend className="dep-ages__legend">
								{key("q.dependents.ages")}
							</legend>
							<p className="dep-ages__help">{key("q.dependents.agesHelp")}</p>
							{Array.from({ length: depCount }, (_, i) => {
								const row = depRows[i] ?? { age: "", declined: false };
								return (
									<div className="dep-row" key={`${id}-dep-${i}`}>
										<label className="dep-row__age">
											{t("q.dependents.age", { n: i + 1 })}
											<input
												className="input"
												type="number"
												inputMode="numeric"
												min={0}
												max={MAX_DEP_AGE}
												value={row.age}
												disabled={row.declined}
												onChange={(e) =>
													updateDep(i, { age: e.target.value })
												}
											/>
										</label>
										<label className="dep-row__decline">
											<input
												type="checkbox"
												checked={row.declined}
												onChange={(e) =>
													updateDep(i, { declined: e.target.checked })
												}
											/>
											{t("check.decline")}
										</label>
									</div>
								);
							})}
						</fieldset>
					)}
				</>
			)}

			{question.type === "month_year" && (
				<div className="field">
					<input
						type="month"
						value={draft}
						onChange={(e) => {
							setDraft(e.target.value);
							setError(null);
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
								setError(null);
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
									setError(null);
								}}
							/>
							{optLabel(question, o.value)}
						</label>
					);
				})}

			{error && (
				<p className="field-error" role="alert" id={`${id}-error`}>
					{t(error)}
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

// Edades ya respondidas: una edad puntual se prefill; un rango (o ausencia)
// se muestra como «prefiero no decirlo» — nunca se inventa una edad.
function initialDepRows(a: Answer | undefined): DepRow[] {
	if (a?.state !== "value" || !Array.isArray(a.value)) return [];
	return (
		a.value as { age?: { min?: number; max?: number; maxExclusive?: boolean } }[]
	).map((d) => {
		const g = d?.age;
		if (
			g &&
			Number.isInteger(g.min) &&
			g.min === g.max &&
			g.maxExclusive === false
		)
			return { age: String(g.min), declined: false };
		return { age: "", declined: true };
	});
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
