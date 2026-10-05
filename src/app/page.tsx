import Link from "next/link";

export default function Home() {
	return (
		<section className="shell hero" aria-labelledby="titulo">
			<h1 id="titulo">Tus derechos, requisito a requisito</h1>
			<p className="lede">
				Ayudas públicas en la Comunidad de Madrid, comprobadas con la fuente
				oficial. Contesta a unas pocas preguntas y te decimos qué ayudas
				merece la pena comprobar, qué requisitos cumples, cuáles no y cuáles
				no se pueden saber — con cada afirmación enlazada al texto oficial.
			</p>
			<p>
				<Link className="cta" href="/comprobar">
					Descubre qué ayudas puedes pedir
				</Link>
			</p>
			<ul className="bullets">
				<li>Nada de lo que contestas sale de tu navegador.</li>
				<li>
					«No se puede saber» no es un no: te decimos qué te falta saber o
					documentar.
				</li>
				<li>Todo lo que te contamos enlaza a la norma o página oficial.</li>
			</ul>
		</section>
	);
}
