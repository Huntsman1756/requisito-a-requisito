"use client";

import { useMemo, useState } from "react";
import type { Level2Item } from "../lib/check-data";
import { es, type I18nKey } from "../lib/i18n/es";

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
	const [items, setItems] = useState<Level2Item[] | null>(null);
	const [theme, setTheme] = useState("");
	const [event, setEvent] = useState("");
	const [scope, setScope] = useState("");
	const [state, setState] = useState("");
	const [q, setQ] = useState("");

	useMemo(() => {
		fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/datos/elegibilidad/nivel-2.json`)
			.then((r) => r.json())
			.then((d) => setItems(d.items ?? []))
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
			// UNKNOWN al final (R3-UNK)
			.sort(
				(a, b) =>
					(order[a.accessState as keyof typeof order] ?? 3) -
					(order[b.accessState as keyof typeof order] ?? 3),
			);
	}, [items, theme, event, scope, state, q]);

	return (
		<>
			<form className="explorer-filters" aria-label="Filtros" onSubmit={(e) => e.preventDefault()}>
				<input
					type="search"
					placeholder="Buscar…"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					aria-label="Buscar por nombre"
				/>
				<Filter label="Tema" value={theme} options={THEMES} onChange={setTheme} />
				<Filter label="Evento vital" value={event} options={EVENTS} onChange={setEvent} />
				<Filter label="Ámbito" value={scope} options={SCOPES} onChange={setScope} />
				<Filter label="Estado" value={state} options={STATES} onChange={setState} />
			</form>
			<p role="status" className="explorer-count">
				{items === null
					? "Cargando…"
					: `${filtered.length} ayudas`}
			</p>
			<ul className="explorer-list">
				{filtered.slice(0, 200).map((i) => (
					<li key={i.slug} className="explorer-item">
						<a href={i.officialSourceUrl} rel="noopener noreferrer">
							{i.displayTitle}
						</a>
						<span className="explorer-meta">
							{key(`level2.state.${i.accessState ?? "UNKNOWN"}`)}
							{i.scope === "comunidad-madrid"
								? " · Comunidad de Madrid"
								: i.scope === "municipal"
									? " · Municipal"
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
