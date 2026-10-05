import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cómo funciona" };

export default function ComoFunciona() {
	return (
		<section className="shell" aria-labelledby="titulo">
			<h1 id="titulo">Cómo funciona</h1>
			<h2>Preguntas mínimas</h2>
			<p>
				Te hacemos pocas preguntas (como mucho 10) sobre tu situación: edad,
				donde estás empadronado, familia, trabajo, ingresos. Puedes responder
				«no lo sé» o «prefiero no decirlo».
			</p>
			<h2>Reglas, no opiniones</h2>
			<p>
				Cada ayuda tiene sus requisitos escritos como reglas deterministas,
				construidas leyendo la norma oficial. No hay ningún modelo de lenguaje
				ni puntuación inventada: una regla dice cumple, no cumple o no se
				puede saber.
			</p>
			<h2>Tres respuestas honestas</h2>
			<ul>
				<li>
					<strong>Cumples</strong> — el requisito está comprobado a tu favor.
				</li>
				<li>
					<strong>No cumples</strong> — la regla lo descarta con lo que has
					contado.
				</li>
				<li>
					<strong>No se puede saber</strong> — falta un dato o la norma pide
					algo que no te hemos preguntado; te decimos qué es.
				</li>
			</ul>
			<h2>Todo con fuente</h2>
			<p>
				Cada requisito, cuantía, plazo, documento y canal enlaza a su fuente
				oficial (BOE, BOCM, sedes electrónicas). Las cifras y los requisitos
				solo se toman de normas y convocatorias; las webs informativas se
				usan solo para saber dónde y cómo solicitar.
			</p>
			<h2>Privacidad</h2>
			<p>
				La web es estática: no hay servidor ni cuentas. Tus respuestas se
				quedan en tu navegador y no se envían a ningún sitio.
			</p>
			<p>
				<Link href="/ayudas">Ver las ayudas del piloto</Link>
			</p>
		</section>
	);
}
