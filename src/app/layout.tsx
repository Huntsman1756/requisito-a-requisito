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

// Las @font-face van inline para respetar el basePath del export: en Pages
// las fuentes viven bajo /<repo>/ y en el espejo (requisito.h1756.es) en la
// raíz — la ruta absoluta fija rompía el mirror. CSP permite style inline.
const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const FONTS_CSS = [
	'"Atkinson Hyperlegible Next",400,"ahn-r.woff2"',
	'"Atkinson Hyperlegible Next",500,"ahn-Medium.woff2"',
	'"Atkinson Hyperlegible Next",700,"ahn-b.woff2"',
	'"Atkinson Hyperlegible Next",800,"ahn-ExtraBold.woff2"',
	'"Atkinson Hyperlegible Mono",400,"ahm-r.woff2"',
	'"IBM Plex Sans Condensed",500,"IBMPlexSansCondensed-Medium.woff2"',
	'"IBM Plex Sans Condensed",600,"IBMPlexSansCondensed-SemiBold.woff2"',
	'"IBM Plex Mono",400,"ibm-plex-mono-400.woff2"',
	'"IBM Plex Mono",500,"ibm-plex-mono-500.woff2"',
	'"IBM Plex Mono",600,"ibm-plex-mono-600.woff2"',
]
	.map((s) => {
		// family y file van entrecomillados en los datos; el archivo NO debe
		// llevar las comillas dentro de url("…") — si no, el src queda
		// url("/fonts/"ahn-r.woff2"") y el @font-face entero se descarta.
		const [family, weight, file] = s.split(",");
		return `@font-face{font-family:${family};font-weight:${weight};font-display:swap;src:url("${BP}/fonts/${file.replaceAll('"', "")}") format("woff2")}`;
	})
	.join("\n");

function NavLinks() {
	return (
		<>
			<Link href="/comprobar">Comprobar</Link>
			<Link href="/ayudas">Ayudas</Link>
			<Link href="/explorar">Explorar</Link>
			<Link href="/observatorio">Observatorio</Link>
			<Link href="/datos">Datos</Link>
			<Link href="/como-verificamos">Cómo lo comprobamos</Link>
			<Link href="/como-funciona">Cómo funciona</Link>
		</>
	);
}

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
				{/* F10-PERF: precarga de las fuentes del primer pintado — con
					font-display:swap el LCP del texto saltaba a ~3,4 s cuando
					llegaba el woff2 (Lighthouse móvil). */}
				{["ahn-r.woff2", "ahn-b.woff2", "ahn-ExtraBold.woff2"].map((f) => (
					<link
						key={f}
						rel="preload"
						href={`${BP}/fonts/${f}`}
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>
				))}
				<style dangerouslySetInnerHTML={{ __html: FONTS_CSS }} />
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
						{/* Nav duplicada: inline en escritorio, <details> en móvil.
							El <details> cerrado no se puede reabrir por CSS y dejaba la
							nav de escritorio con ancho 0 solapando el banner. */}
						<nav className="site-nav site-nav--wide" aria-label="Principal">
							<NavLinks />
						</nav>
						<details className="nav-menu">
							<summary>Menú</summary>
							<nav className="site-nav" aria-label="Principal">
								<NavLinks />
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
