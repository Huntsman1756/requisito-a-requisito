import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cómo lo comprobamos" };

const REPO = "https://github.com/Huntsman1756/requisito-a-requisito";

// B4.3 — la cadena verificable completa, con el enlace real de cada eslabón
// a la evidencia del repo. Nada de afirmaciones sin medida.
const PASOS = [
	{
		n: "1",
		t: "Fuente oficial",
		d: "Cada afirmación parte de un documento oficial (BOE, BOCM, ordenanza municipal o sede de la administración). El texto se descarga y se guarda con su huella.",
		ev: "data/eligibility/sources/ — snapshot + metadatos por fuente",
		url: `${REPO}/tree/main/data/eligibility/sources`,
	},
	{
		n: "2",
		t: "Extracto literal con huella",
		d: "La regla no resume la norma: cita el extracto literal y guarda su sha256. Si el texto oficial cambia y el extracto desaparece, la ayuda sale del listado hasta revisarla.",
		ev: "El bundle publicado: data/eligibility/bundle/eligibility-bundle.json",
		url: `${REPO}/blob/main/data/eligibility/bundle/eligibility-bundle.json`,
	},
	{
		n: "3",
		t: "La regla decide, no el texto",
		d: "El motor es determinista: la misma respuesta da siempre el mismo resultado. «No se puede saber» nunca se convierte en «no». Cada evaluación pasa sus invariantes en tu navegador antes de mostrarse.",
		ev: "src/lib/eligibility-engine/ + docs/07-motor-evaluacion.md",
		url: `${REPO}/blob/main/docs/07-motor-evaluacion.md`,
	},
	{
		n: "4",
		t: "Verificación independiente",
		d: "Quien verifica no es quien escribe: otro agente comprueba que cada extracto prueba lo que afirma su requisito (checklist en templates/verificador-checklist.md).",
		ev: "evidence/2026-10-08-F10/verificacion-ola-12.md y las anteriores",
		url: `${REPO}/tree/main/evidence`,
	},
	{
		n: "5",
		t: "Revisión humana por muestreo",
		d: "Antes de la versión para el jurado, una persona revisa hojas de muestreo: 2 de cada 5 reglas por ola, y si una falla se reabre la ola entera.",
		ev: "evidence/muestreo-indice.json — qué hoja aprueba cada regla",
		url: `${REPO}/blob/main/evidence/muestreo-indice.json`,
	},
	{
		n: "6",
		t: "Revalidación diaria",
		d: "Cada día se re-descargan las normas y se comprueba que los extractos citados siguen ahí. Las fuentes que el acceso automático no alcanza se revisan en otro ciclo periódico.",
		ev: ".github/workflows/freshness.yml + data/freshness/runs.jsonl",
		url: `${REPO}/blob/main/data/freshness/runs.jsonl`,
	},
	{
		n: "7",
		t: "Auditoría de falsos negativos",
		d: "Cada programa con regla propia se revisó uno a uno por verificadores nuevos preguntando: «¿puede la regla decirle que no a quien la norma admite?». Los hallazgos se corrigieron o declararon.",
		ev: "evidence/2026-10-08-F10/falsos-negativos/resumen.md",
		url: `${REPO}/blob/main/evidence/2026-10-08-F10/falsos-negativos/resumen.md`,
	},
];

export default function ComoVerificamos() {
	return (
		<section className="shell band" aria-labelledby="cv-title" style={{ borderTop: 0 }}>
			<h1 id="cv-title">Cómo lo comprobamos</h1>
			<p className="lede">
				Cada afirmación de esta web puede seguirse hasta su fuente oficial.
				Esta es la cadena completa, con la evidencia real enlazada en cada
				paso.
			</p>
			<ol className="verify-chain">
				{PASOS.map((p) => (
					<li key={p.n} className="verify-step">
						<h2>
							<span className="step-n" aria-hidden="true">{p.n}</span> {p.t}
						</h2>
						<p>{p.d}</p>
						<p className="note">
							Evidencia: <code>{p.ev}</code> —{" "}
							<a href={p.url} rel="noopener noreferrer">ver en el repositorio ↗</a>
						</p>
					</li>
				))}
			</ol>
			<p className="legal">
				Si algo de esto no cuadra, el fallo es nuestro y se corrige:{" "}
				<Link href="/datos/">los datos completos son abiertos</Link> y el
				proceso de corrección queda en el propio repositorio.
			</p>
		</section>
	);
}
