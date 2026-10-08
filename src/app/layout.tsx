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
				<header className="top">
					<div className="shell site-header__inner">
						<Link className="brand" href="/" aria-label="Requisito a Requisito, inicio">
							<svg className="brand-mark" viewBox="0 0 30 30" aria-hidden="true">
								<rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2.4" />
								<path d="M4.8 8.2l2.6 2.6 4.6-5.4" fill="none" stroke="var(--seal)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
								<rect x="16" y="16" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2.4" />
								<path d="M18.8 22.2l2.6 2.6 4.6-5.4" fill="none" stroke="var(--seal)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M16 8h7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
								<path d="M7 16v7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
							</svg>
							<span className="brand-name">Requisito a Requisito</span>
						</Link>
						<details className="nav-menu">
							<summary>Menú</summary>
							<nav className="site-nav" aria-label="Principal">
								<Link href="/comprobar">Comprobar</Link>
								<Link href="/ayudas">Ayudas</Link>
								<Link href="/explorar">Explorar</Link>
								<Link href="/observatorio">Observatorio</Link>
								<Link href="/datos">Datos</Link>
								<Link href="/como-verificamos">Cómo lo comprobamos</Link>
								<Link href="/como-funciona">Cómo funciona</Link>
							</nav>
						</details>
					</div>
					<p className="pilot-banner" role="status">
						Demostración — versión preliminar; el catálogo crece cada semana.
						Tus respuestas no salen de tu navegador. ·{" "}
						<a
							href="https://github.com/Huntsman1756/requisito-a-requisito"
							rel="noopener noreferrer"
						>
							Código y reglas abiertos
						</a>{" "}
						· <Link href="/como-funciona">Cómo funciona</Link>
					</p>
				</header>
				<main id="contenido">{children}</main>
				<footer className="site-footer">
					<div className="shell">
						<span>
							Requisito a Requisito · proyecto ciudadano independiente · código
							y reglas abiertos
						</span>
						<span>No somos una administración pública.</span>
					</div>
				</footer>
			</body>
		</html>
	);
}
