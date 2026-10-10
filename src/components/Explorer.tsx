"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Level2Item } from "../lib/check-data";
import { es, type I18nKey } from "../lib/i18n/es";

/** Entrada de nivel 1: tiene RuleSet propio, ficha interna y la marca
 *  «comprobada requisito a requisito» (F10-COMP). */
interface Level1Item extends Level2Item {
	fichaSlug: string;
}

type ExplorerItem = Level2Item | Level1Item;

const isL1 = (i: ExplorerItem): i is Level1Item => "fichaSlug" in i;

const key = (k: string): string => (k in es ? es[k as I18nKey] : k);

const THEMES: [string, string][] = [
	["familia_infancia", "Familia e infancia"],
	["educacion", "Educación"],
	["empleo", "Empleo"],
	["vivienda", "Vivienda"],
	["dependencia_discapacidad", "Discapacidad y dependencia"],
	["mayores", "Mayores"],
	["ingresos_minimos", "Ingresos mínimos"],
	["energia_suministros", "Energía y suministros"],
	["transporte", "Transporte"],
	["cultura_juventud", "Cultura y juventud"],
	["violencia_genero", "Violencia de género"],
	["salud", "Salud"],
];
const EVENTS: [string, string][] = [
	["tener_hijo", "Voy a tener un hijo"],
	["perder_empleo", "Me he quedado sin trabajo"],
	["estudiar", "Estudio o voy a estudiar"],
	["independizarse_vivienda", "Busco vivienda o me independizo"],
	["cuidar_familiar", "Cuido de un familiar"],
	["discapacidad", "Tengo una discapacidad"],
	["mayor_65", "Tengo 65 años o más"],
	["ingresos_bajos", "Me cuesta llegar a fin de mes"],
];
const SCOPES: [string, string][] = [
	["comunidad-madrid", "Comunidad de Madrid"],
	["municipal", "Municipal"],
	["estatal", "Estatal"],
];
const STATES: [string, string][] = [
	["OPEN", "Plazo abierto"],
	["ROLLING", "Plazo continuo"],
	["UPCOMING", "Próxima"],
	["CLOSED_RECURRING", "Se convoca cada año"],
	["CLOSED", "Cerrada"],
	["UNKNOWN", "Plazo por confirmar"],
];

const norm = (s: string) =>
	s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function Explorer() {
	const [items, setItems] = useState<ExplorerItem[] | null>(null);
	const [theme, setTheme] = useState("");
	const [event, setEvent] = useState("");
	const [scope, setScope] = useState("");
	const [state, setState] = useState("");
	const [q, setQ] = useState("");
	// En escritorio los filtros van abiertos; en móvil quedan plegados en
	// «Filtrar (N activos)». El estado se fija tras hidratar para que el
	// HTML exportado (open) coincida y en móvil se cierre solo.
	const [filtersOpen, setFiltersOpen] = useState(true);

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 861px)");
		const apply = () => setFiltersOpen(mq.matches);
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, []);

	useMemo(() => {
		const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
		Promise.all([
			fetch(`${base}/datos/elegibilidad/nivel-1.json`).then((r) => r.json()),
			fetch(`${base}/datos/elegibilidad/nivel-2.json`).then((r) => r.json()),
		])
			.then(([l1, l2]) =>
				setItems([
					// Nivel 1: la entrada enlaza a su ficha, no duplica la de nivel 2.
					...(l1.items ?? []).map(
						(i: Level2Item): Level1Item => ({ ...i, fichaSlug: i.slug }),
					),
					...(l2.items ?? []),
				]),
			)
			.catch(() => setItems([]));
	}, []);

	const filtered = useMemo(() => {
		if (!items) return [];
		const nq = norm(q);
		const order = { OPEN: 0, ROLLING: 1, UPCOMING: 2, UNKNOWN: 3, CLOSED: 4, CLOSED_RECURRING: 4 } as const;
		return items
			.filter((i) => {
			if (theme && !(i.themes ?? []).includes(theme)) return false;
			if (event && !(i.lifeEvents ?? []).includes(event)) return false;
			if (scope && i.scope !== scope) return false;
			if (state && (i.accessState ?? "UNKNOWN") !== state) return false;
			if (nq && !norm(i.displayTitle).includes(nq)) return false;
			return true;
		})
			// UNKNOWN al final (R3-UNK); a igual estado, primero las del nivel 1.
			.sort(
				(a, b) =>
					(order[a.accessState as keyof typeof order] ?? 3) -
						(order[b.accessState as keyof typeof order] ?? 3) ||
					Number(isL1(b)) - Number(isL1(a)),
			);
	}, [items, theme, event, scope, state, q]);

	const activeFilters =
		(theme ? 1 : 0) +
		(event ? 1 : 0) +
		(scope ? 1 : 0) +
		(state ? 1 : 0) +
		(q.trim() ? 1 : 0);
	const clearFilters = () => {
		setTheme("");
		setEvent("");
		setScope("");
		setState("");
		setQ("");
	};

	return (
		<>
			<form className="explorer-filters" aria-label="Filtros" onSubmit={(e) => e.preventDefault()}>
				<label className="explorer-filter explorer-search">
					Buscar por nombre o palabra
					<span className="explorer-search__box">
						<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
							<circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
							<path d="M13 13l4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						</svg>
						<input
							type="search"
							placeholder="p. ej. alquiler, beca, familia numerosa"
							value={q}
							onChange={(e) => setQ(e.target.value)}
						/>
					</span>
				</label>
				<details
					className="explorer-advanced"
					open={filtersOpen}
					onToggle={(e) => setFiltersOpen(e.currentTarget.open)}
				>
					<summary>
						Filtrar
						{activeFilters > 0 &&
							` (${activeFilters} ${activeFilters === 1 ? "activo" : "activos"})`}
					</summary>
					<div className="explorer-advanced__grid">
						<Filter label="Tema" value={theme} options={THEMES} onChange={setTheme} />
						<Filter label="Evento vital" value={event} options={EVENTS} onChange={setEvent} />
						<Filter label="Ámbito" value={scope} options={SCOPES} onChange={setScope} />
						<Filter label="Estado" value={state} options={STATES} onChange={setState} />
					</div>
				</details>
				{activeFilters > 0 && (
					<button
						type="button"
						className="btn-quiet explorer-clear"
						onClick={clearFilters}
					>
						Limpiar filtros
					</button>
				)}
			</form>
			<p role="status" className="explorer-count">
				{items === null
					? "Cargando…"
					: `${filtered.length} ayudas`}
			</p>
			<ul className="explorer-list">
				{filtered.slice(0, 200).map((i) => (
					<li
						key={`${isL1(i) ? "l1" : "l2"}-${i.slug}`}
						className="explorer-item"
					>
						<span className="explorer-main">
							{isL1(i) ? (
								<>
									<Link href={`/ayudas/${i.fichaSlug}/`}>
										{i.displayTitle}
									</Link>{" "}
									<span className="explorer-badge">
										{key("explorer.badge.l1")}
									</span>
								</>
							) : (
								<a href={i.officialSourceUrl} rel="noopener noreferrer">
									{i.displayTitle}
								</a>
							)}
						</span>
						<span className="explorer-meta">
							{key(`level2.state.${i.accessState ?? "UNKNOWN"}`)}
							{i.scope === "comunidad-madrid"
								? " · Comunidad de Madrid"
								: i.scope === "municipal"
									? ` · ${i.municipality ?? "Municipal"}`
									: " · Estatal"}
						</span>
					</li>
				))}
			</ul>
		</>
	);
}

function Filter({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: [string, string][];
	onChange: (v: string) => void;
}) {
	return (
		<label className="explorer-filter">
			{label}
			<select value={value} onChange={(e) => onChange(e.target.value)}>
				<option value="">Todas</option>
				{options.map(([v, l]) => (
					<option key={v} value={v}>
						{l}
					</option>
				))}
			</select>
		</label>
	);
}
