import type { Metadata } from "next";
import Link from "next/link";
import { Explorer } from "../../components/Explorer";

export const metadata: Metadata = { title: "Explorar el catálogo" };

export default function Explorar() {
	return (
		<section className="shell" aria-labelledby="explorar-title">
			<h1 id="explorar-title">Explorar el catálogo</h1>
			<p className="lede">
				Todas las ayudas, becas y prestaciones que seguimos para un residente en
				la Comunidad de Madrid. Filtra por tema, evento vital o ámbito.
			</p>
			<noscript>
				<p>
					Para usar el buscador con filtros se necesita JavaScript (todo ocurre
					en tu navegador; nada se envía). Sin él puedes{" "}
					<Link href="/ayudas">ver las ayudas del piloto</Link>.
				</p>
			</noscript>
			<Explorer />
		</section>
	);
}
