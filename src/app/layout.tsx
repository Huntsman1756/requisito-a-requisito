import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data:",
	"connect-src 'self'",
	"object-src 'none'",
	"base-uri 'none'",
].join("; ");

export const metadata: Metadata = {
	title: {
		default: "Requisito a Requisito",
		template: "%s · Requisito a Requisito",
	},
	description:
		"Ayudas públicas en la Comunidad de Madrid, comprobadas con la fuente oficial. Cada afirmación enlaza al texto oficial.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="es">
			<head>
				<meta httpEquiv="Content-Security-Policy" content={CSP} />
			</head>
			<body>
				<a className="skip-link" href="#contenido">
					Saltar al contenido principal
				</a>
				<header className="site-header">
					<div className="site-header__inner shell">
						<Link className="brand" href="/">
							<span aria-hidden="true" className="brand-mark">
								✓
							</span>
							<span className="brand-name">
								Requisito&nbsp;a&nbsp;Requisito
							</span>
						</Link>
						<nav className="site-nav" aria-label="Principal">
							<Link href="/ayudas">Ayudas</Link>
							<Link href="/como-funciona">Cómo funciona</Link>
						</nav>
					</div>
				</header>
				<p className="pilot-banner" role="status">
					Versión piloto — catálogo en crecimiento. Tus respuestas no salen
					de tu navegador.
				</p>
				<main id="contenido">{children}</main>
				<footer className="site-footer">
					<p className="shell">
						No somos una administración pública. La información se basa en
						fuentes oficiales; la solicitud se hace siempre en la sede
						oficial.
					</p>
				</footer>
			</body>
		</html>
	);
}
