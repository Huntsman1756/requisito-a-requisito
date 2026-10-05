"use client";

import { useMemo, useRef, useState } from "react";
import { t } from "../../lib/i18n/es";

interface Props {
	id: string;
	municipalities: { code: string; name: string }[];
	value: string;
	onChange: (code: string) => void;
	onOutsideMadrid?: () => void;
}

const norm = (s: string) =>
	s
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "");

/** Combobox accesible de los 179 municipios de la CM + salida «vivo fuera». */
export function MunicipalityCombobox({
	id,
	municipalities,
	value,
	onChange,
	onOutsideMadrid,
}: Props) {
	const [query, setQuery] = useState(
		() => municipalities.find((m) => m.code === value)?.name ?? "",
	);
	const [open, setOpen] = useState(false);
	const [activeIdx, setActiveIdx] = useState(-1);
	const listRef = useRef<HTMLUListElement>(null);

	const filtered = useMemo(() => {
		const q = norm(query.trim());
		if (!q) return municipalities.slice(0, 40);
		return municipalities.filter((m) => norm(m.name).includes(q)).slice(0, 40);
	}, [query, municipalities]);

	const pick = (m: { code: string; name: string }) => {
		setQuery(m.name);
		setOpen(false);
		setActiveIdx(-1);
		onChange(m.code);
	};

	return (
		<div className="field combobox">
			<label htmlFor={`${id}-muni`}>{t("q.territory.municipality")}</label>
			<input
				id={`${id}-muni`}
				type="text"
				role="combobox"
				aria-expanded={open}
				aria-controls={`${id}-list`}
				aria-autocomplete="list"
				autoComplete="off"
				value={query}
				placeholder={t("q.territory.placeholder")}
				onChange={(e) => {
					setQuery(e.target.value);
					setOpen(true);
					setActiveIdx(-1);
					onChange("");
				}}
				onFocus={() => setOpen(true)}
				onKeyDown={(e) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						setActiveIdx((i) => Math.max(i - 1, 0));
					} else if (e.key === "Enter" && activeIdx >= 0) {
						e.preventDefault();
						pick(filtered[activeIdx]);
					} else if (e.key === "Escape") {
						setOpen(false);
					}
				}}
			/>
			{open && filtered.length > 0 && (
				<ul
					id={`${id}-list`}
					role="listbox"
					className="combobox__list"
					ref={listRef}
				>
					{filtered.map((m, i) => (
						<li key={m.code} role="option" aria-selected={m.code === value}>
							<button
								type="button"
								className={`combobox__option ${i === activeIdx ? "is-active" : ""}`}
								onMouseDown={(e) => {
									e.preventDefault();
									pick(m);
								}}
							>
								{m.name}
							</button>
						</li>
					))}
				</ul>
			)}
			{onOutsideMadrid && (
				<button
					type="button"
					className="btn-quiet combobox__outside"
					onClick={onOutsideMadrid}
				>
					{t("q.territory.outside")}
				</button>
			)}
		</div>
	);
}
