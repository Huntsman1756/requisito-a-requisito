import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { formatDateEs } from "../lib/format";

function stats() {
	const dir = join(process.cwd(), "data/eligibility/rules");
	const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
	let verified = "";
	for (const f of files) {
		const d = JSON.parse(readFileSync(join(dir, f), "utf8"));
		if (!verified || d.verifiedAt > verified) verified = d.verifiedAt;
	}
	const n2 = JSON.parse(
		readFileSync(
			join(process.cwd(), "public/datos/elegibilidad/nivel-2.json"),
			"utf8",
		),
	).items.length;
	return { rules: files.length, level2: n2, verified };
}

export default function Home() {
	const { rules, level2, verified } = stats();
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

			<h2 className="steps-title">Cómo funciona, en tres pasos</h2>
			<ol className="steps">
				<li>
					<strong>Respondes unas preguntas.</strong> Menos de diez, y puedes
					decir «no lo sé» o «prefiero no decirlo».
				</li>
				<li>
					<strong>Comprobamos reglas, no intuiciones.</strong> Cada ayuda tiene
					sus requisitos escritos a partir de la norma oficial. Nada sale de tu
					navegador.
				</li>
				<li>
					<strong>Te decimos qué falta.</strong> Qué cumples, qué no y qué no se
					puede saber — con el plazo, los documentos y dónde solicitar.
				</li>
			</ol>

			<section className="coverage" aria-labelledby="coverage-title">
				<h2 id="coverage-title">Qué cubrimos hoy</h2>
				<p>
					{rules} ayudas con requisitos comprobados y {level2} más del catálogo
					que pueden interesarte (sin comprobar). Última verificación:{" "}
					{formatDateEs(verified)}.
				</p>
			</section>
		</section>
	);
}
