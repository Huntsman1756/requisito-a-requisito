import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckFlow } from "../../components/check/CheckFlow";

export const metadata: Metadata = {
	title: "Comprueba qué ayudas puedes pedir",
};

export default function Comprobar() {
	return (
		<>
			<noscript>
				<div className="shell">
					<p>
						Esta herramienta necesita JavaScript para evaluar tus respuestas
						en tu navegador. Mientras tanto, puedes{" "}
						<Link href="/ayudas">ver las ayudas y sus fuentes</Link>.
					</p>
				</div>
			</noscript>
			<Suspense>
				<CheckFlow />
			</Suspense>
		</>
	);
}
