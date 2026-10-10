import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { aidTitle } from "../lib/aid-titles";
import { formatDateEs } from "../lib/format";
import { allRuleSets } from "../lib/rule-pages";

interface StatRule {
	benefitSlug: string;
	verifiedAt: string;
	requirements?: { label: string; citation?: { locator?: string } }[];
	uncoveredRequirements?: { label: string; citation?: { locator?: string } }[];
	sources?: { id: string }[];
}

function stats() {
	// Fuente única: el bundle (en --strict solo las reglas aprobadas, ADR-050).
	// Las ayudas se cuentan por benefitSlug, no por versión (R8-VIG).
	const rules = allRuleSets<StatRule>();
	const slugs = new Set(rules.map((r) => r.benefitSlug));
	let verified = "";
	for (const d of rules) {
		if (!verified || (d.verifiedAt ?? "") > verified)
			verified = d.verifiedAt ?? "";
	}
	const specimen =
		rules.find((r) => r.benefitSlug === "bono-cultural-joven") ?? rules[0];
	const n2 = JSON.parse(
		readFileSync(
			join(process.cwd(), "public/datos/elegibilidad/nivel-2.json"),
			"utf8",
		),
	);
	const byEvent = (n2.items as { lifeEvents?: string[] }[]).reduce<Record<string, number>>((acc, i) => {
		for (const e of i.lifeEvents ?? []) acc[e] = (acc[e] ?? 0) + 1;
		return acc;
	}, {});
	let freshRun = "";
	try {
		freshRun =
			(JSON.parse(
				readFileSync(
					join(process.cwd(), "public/datos/elegibilidad/frescura.json"),
					"utf8",
				),
			) as { lastAutoRunAt?: string | null }).lastAutoRunAt ?? "";
	} catch {
		freshRun = "";
	}
	return {
		specimenDomain: (specimen?.sources?.[0]?.id?.split("-")[0] ?? "boe").toUpperCase(),
		rules: slugs.size,
		level2: n2.items.length,
		verified,
		freshRun,
		specimen,
		byEvent,
	};
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
	tener_hijo: <><circle cx="9" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 5h3l2 9h10l2-7H7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></>,
	perder_empleo: <><rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M9 7V5h6v2M4 4l16 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
	estudiar: <path d="M3 8l9-4 9 4-9 4zM7 10v5c3 2 7 2 10 0v-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
	independizarse_vivienda: <path d="M4 11l8-7 8 7v9H4zM10 20v-5h4v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
	cuidar_familiar: <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
	discapacidad: <><circle cx="12" cy="4.5" r="1.8" fill="currentColor" /><path d="M12 7v6h5l2 6M12 10H8M9.5 13.5a5 5 0 105.4 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
	mayor_65: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
	ingresos_bajos: <path d="M17 7.5A6 6 0 107 15M4 10h9M4 13h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
};

const EVENTS: [string, string][] = [
	["tener_hijo", "Voy a tener un hijo o acabo de tenerlo"],
	["perder_empleo", "Me he quedado sin trabajo"],
	["estudiar", "Estudio o voy a estudiar"],
	["independizarse_vivienda", "Busco vivienda o me independizo"],
	["cuidar_familiar", "Cuido de un familiar"],
	["discapacidad", "Tengo una discapacidad"],
	["mayor_65", "Tengo 65 años o más"],
	["ingresos_bajos", "Me cuesta llegar a fin de mes"],
];

export default function Home() {
	const { rules, level2, verified, freshRun, specimen, byEvent, specimenDomain } = stats();
	const sReq = [
		...(specimen?.requirements ?? []).map((r: { label: string; citation?: { locator?: string } }) => ({ label: r.label, locator: r.citation?.locator, tick: "ok", mark: "✓", al: "Requisito comprobado" })),
		...(specimen?.uncoveredRequirements ?? []).slice(0, 1).map((r: { label: string; citation?: { locator?: string } }) => ({ label: r.label, locator: r.citation?.locator, tick: "na", mark: "⚠", al: "No comprobable aquí" })),
	].slice(0, 3);
	return (
		<>
			<section className="shell hero" aria-labelledby="titulo">
				<div>
					<p className="label">
						Comunidad de Madrid · ayudas del Estado, la Comunidad y tu
						ayuntamiento
					</p>
					<h1 id="titulo" style={{ marginTop: ".6rem" }}>
						Comprueba tus ayudas <em>requisito a requisito</em>, con el texto
						oficial delante.
					</h1>
					<p className="lede">
						Contesta unas pocas preguntas. Te decimos qué ayudas encajan
						contigo, qué requisitos cumples, cuáles no y qué te falta saber
						para comprobar el resto.
					</p>
					<div className="cta">
						<Link className="btn primary" href="/comprobar">
							Empezar · 3 minutos
						</Link>
						<Link className="btn ghost" href="/explorar">
							Explorar el catálogo
						</Link>
					</div>
					<ul className="promises">
						<li>
							<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
							Tus respuestas no salen de este dispositivo. Sin registro.
						</li>
						<li>
							<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z M15 3v4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
							Cada requisito enlaza al artículo de la norma que lo exige.
						</li>
						<li>
							<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2M12 17h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
							«No se puede saber» no es un no: te decimos qué dato o documento
							falta.
						</li>
					</ul>
				</div>

				{specimen && (
				<div className="specimen" aria-label="Ejemplo de comprobación de una ayuda">
					<div className="head">
						<h2>{aidTitle(specimen.benefitSlug)}</h2>
						<span className="lvl estado">Estado</span>
					</div>
					{sReq.map((r, i) => (
						<div className="box" key={i}>
							<span className="n">{String(i + 1).padStart(2, "0")}</span>
							<span className={`tick ${r.tick}`} aria-label={r.al}>{r.mark}</span>
							<p>
								{r.label}
								{r.locator && <span className="src">{r.locator}</span>}
							</p>
						</div>
					))}
					<div className="seal" aria-hidden="true">
						Comprobado con la fuente
						<small>
							{specimenDomain} ·{" "}
							{formatDateEs(specimen.verifiedAt)}
						</small>
					</div>
				</div>
				)}
			</section>

			<section className="band shell" aria-labelledby="h-eventos">
				<h2 id="h-eventos">¿Qué te está pasando?</h2>
				<p className="sub">
					Empieza por tu situación. Solo te preguntaremos lo necesario para
					esas ayudas.
				</p>
				<ul className="events">
					{EVENTS.map(([ev, label]) => (
						<li key={ev}>
							<Link href={`/comprobar?evento=${ev}`}>
								<span className="ev-i">
									<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
										{EVENT_ICONS[ev]}
									</svg>
								</span>
								<span className="ev-t">{label}</span>
								<span className="ev-c">
									{byEvent[ev] ? `${byEvent[ev]} ayudas` : "varias"}
								</span>
							</Link>
						</li>
					))}
				</ul>
				<p className="label" style={{ marginTop: "1.8rem" }}>
					O mira un caso de ejemplo
				</p>
				<div className="examples" role="group" aria-label="Casos de ejemplo">
					<Link className="chip" href="/comprobar?ejemplo=familia-getafe">
						Madre sola con un bebé · Getafe
					</Link>
					<Link className="chip" href="/comprobar?ejemplo=estudiante-alcala">
						Estudiante de 18 años · Alcalá de Henares
					</Link>
					<Link className="chip" href="/comprobar?ejemplo=mayor-55-vallecas">
						55 años y en paro · Puente de Vallecas
					</Link>
				</div>
			</section>

			<section className="band shell" aria-labelledby="h-como">
				<h2 id="h-como">Cómo lo comprobamos</h2>
				<ol className="steps">
					<li>
						<h3>Leemos la norma</h3>
						<p className="note">
							Cada requisito sale del BOE, el BOCM o el boletín de tu
							ayuntamiento, y guardamos el párrafo exacto.
						</p>
					</li>
					<li>
						<h3>Lo convertimos en reglas</h3>
						<p className="note">
							Las reglas comparan tus respuestas con cada requisito. Si falta
							un dato, lo decimos; nunca adivinamos.
						</p>
					</li>
					<li>
						<h3>Revisamos las normas cada día</h3>
						<p className="note">
							Si una fuente cambia, esa ayuda se retira hasta revisarla. Las
							páginas de las sedes se revisan periódicamente. Puedes ver el
							registro en el Observatorio.
						</p>
					</li>
				</ol>
				<p className="note" style={{ marginTop: "1.4rem" }}>
					{rules} ayudas comprobadas requisito a requisito y {level2} del
					catálogo con fuente oficial. Regla verificada con la fuente:{" "}
					{formatDateEs(verified)}
					{freshRun && (
						<>
							{" "}
							· Última revisión automática de fuentes:{" "}
							{formatDateEs(freshRun)}
						</>
					)}
					. <Link href="/observatorio">Observatorio</Link>
				</p>
			</section>
		</>
	);
}
