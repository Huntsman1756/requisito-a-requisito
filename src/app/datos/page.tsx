import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { formatDateEs } from "../../lib/format";

export const metadata: Metadata = { title: "Datos abiertos" };

const OUT = "public/datos/elegibilidad";

export default function Datos() {
	const indice = JSON.parse(
		readFileSync(join(process.cwd(), OUT, "indice.json"), "utf8"),
	) as {
		generatedAt: string;
		bundleDigest: string;
		license: string;
		files: { file: string; description: string; schema: string; bytes: number; sha256: string }[];
	};

	return (
		<section className="shell band" aria-labelledby="datos-title" style={{ borderTop: 0 }}>
			<h1 id="datos-title">Datos abiertos</h1>
			<p className="lede">
				Las reglas, el catálogo de preguntas, el registro de fuentes con sus
				huellas y el universo de ayudas de Madrid. Todo con la huella
				sha256 de cada fichero, para comprobar que es exactamente esto lo que
				ejecuta la web.
			</p>
			<p className="note">
				Generado el {formatDateEs(indice.generatedAt.slice(0, 10))} · digest del
				bundle <code>{indice.bundleDigest.slice(0, 16)}…</code>
			</p>

			<h2 style={{ marginTop: "2rem" }}>Ficheros</h2>
			<div className="log">
				<ul className="log-rows">
					{indice.files.map((f) => (
						<li key={f.file}>
							<span className="mono">
								{/* <a>, no Link: los .json son descargas estáticas; el
									prefetch RSC de Next pediría <file>.txt → 404. */}
								<a href={`/datos/elegibilidad/${f.file}`}>{f.file}</a>
							</span>
							<span className="label">
								{f.bytes.toLocaleString("es-ES")} B
							</span>
							<span>
								{f.description}
								<br />
								<span className="note">
									sha256 <code>{f.sha256.slice(0, 16)}…</code> · esquema:{" "}
									<code>{f.schema}</code>
								</span>
							</span>
						</li>
					))}
				</ul>
			</div>

			<h2 style={{ marginTop: "2rem" }}>Cómo reutilizarlo</h2>
			<p>
				Cada requisito del bundle cita la fuente oficial con un extracto
				literal y su huella: con <code>fuentes.json</code> y la huella puedes
				comprobar que el texto citado es el publicado por la administración.
				El motor de evaluación y los esquemas JSON están en el repositorio
				del proyecto.
			</p>
			<p className="note">{indice.license}</p>
		</section>
	);
}
