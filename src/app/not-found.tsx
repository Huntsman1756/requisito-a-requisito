import Link from "next/link";

export default function NotFound() {
	return (
		<section className="shell band" aria-labelledby="nf-title" style={{ borderTop: 0 }}>
			<h1 id="nf-title">Esta página no existe</h1>
			<p className="lede">
				Puede que la dirección esté mal escrita o que la página se haya
				movido. Nada de lo que escribas aquí sale de tu navegador.
			</p>
			<p>
				<Link href="/" className="cta">
					Volver al inicio
				</Link>{" "}
				<Link href="/ayudas" className="btn-quiet">
					Ver el catálogo de ayudas
				</Link>
			</p>
		</section>
	);
}
