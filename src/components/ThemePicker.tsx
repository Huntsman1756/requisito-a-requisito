"use client";

import { useEffect, useState } from "react";

/**
 * ThemePicker — preferencia de vista claro / oscuro / automático.
 *
 * Se guarda en localStorage `rr_theme` como preferencia de VISTA (no es una
 * respuesta del perfil): nunca se envía — no hay red, telemetría ni URL que
 * la transporte (contrato de privacidad 4.6; las claves rr_* solo viven en
 * el navegador). «Borrar mis respuestas» no la toca: borra el perfil, no la
 * vista. Un script inline en <head> aplica la preferencia antes del primer
 * pintado (sin parpadeo; la CSP permite 'unsafe-inline' para script).
 */

type Theme = "light" | "dark" | "auto";
const KEY = "rr_theme";
const EVENT = "rr-theme-change";

const read = (): Theme => {
	try {
		const v = window.localStorage.getItem(KEY);
		return v === "light" || v === "dark" ? v : "auto";
	} catch {
		return "auto";
	}
};

const apply = (t: Theme) => {
	const el = document.documentElement;
	if (t === "auto") el.removeAttribute("data-theme");
	else el.setAttribute("data-theme", t);
};

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
	{ value: "light", label: "Claro", icon: "☀" },
	{ value: "dark", label: "Oscuro", icon: "☾" },
	{ value: "auto", label: "Automático", icon: "◐" },
];

export function ThemePicker() {
	const [theme, setTheme] = useState<Theme>("auto");

	useEffect(() => {
		setTheme(read());
		// Dos instancias visibles (cabecera y menú móvil): se mantienen
		// sincronizadas con un evento propio (storage no salta en la misma
		// pestaña).
		const onChange = (e: Event) =>
			setTheme((e as CustomEvent<Theme>).detail);
		window.addEventListener(EVENT, onChange);
		return () => window.removeEventListener(EVENT, onChange);
	}, []);

	const choose = (t: Theme) => {
		setTheme(t);
		apply(t);
		try {
			if (t === "auto") window.localStorage.removeItem(KEY);
			else window.localStorage.setItem(KEY, t);
		} catch {
			// Sin almacenamiento (modo estricto): el cambio vale para la sesión.
		}
		window.dispatchEvent(new CustomEvent(EVENT, { detail: t }));
	};

	return (
		<div className="theme-picker" role="group" aria-label="Tema de color">
			{OPTIONS.map((o) => (
				<button
					key={o.value}
					type="button"
					className="theme-opt"
					aria-pressed={theme === o.value}
					onClick={() => choose(o.value)}
				>
					<span aria-hidden="true">{o.icon}</span> {o.label}
				</button>
			))}
		</div>
	);
}
