import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "Ayudas Madrid · con fuente",
		template: "%s · Ayudas Madrid",
	},
	description:
		"Orientador de ayudas públicas de la Comunidad de Madrid. Cada afirmación enlaza a su fuente oficial.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="es">
			<body>
				<a className="skip-link" href="#contenido">
					Saltar al contenido principal
				</a>
				<header className="site-header">
					<div className="site-header__inner shell">
						<a className="brand" href="/">
							Ayudas Madrid · con fuente
						</a>
					</div>
				</header>
				<main id="contenido">{children}</main>
				<footer className="site-footer">
					<p>
						No somos una administración pública. La información se basa en
						fuentes oficiales; la solicitud se hace siempre en la sede oficial.
					</p>
				</footer>
			</body>
		</html>
	);
}
