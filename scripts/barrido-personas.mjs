// F10-RES-2 §5.1: 25 personas realistas por la ruta real del formulario.
// Captura grupos, tarjetas abiertas, «faltan datos» y relacionadas.
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:4399";
const OUT = "evidence/2026-10-09-F10/personas";
mkdirSync(OUT, { recursive: true });
const V = (v) => ({ state: "value", value: v });
const T = (m) => V({ ccaa: "13", province: "28", municipality: m });
const AGE = (n) => V({ min: n, max: n, maxExclusive: false });
const DEP = (...ages) =>
	V(ages.map((a) => ({ age: { min: a, max: a, maxExclusive: false } })));
const INC = (a, b) => V({ min: a, max: b });

const P = {
	"daniel": {
		territory: T("28002"), residenceSince: V({ year: 2026, month: 7 }),
		age: AGE(56), dependents: DEP(18), familyType: V("general"),
		employmentStatus: V("autonomo"), studentStatus: V("no"),
		incomeAnnual: V({ min: 25200, max: null }), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"jubilada-70-pension-baja": {
		territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(70), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("jubilado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"madre-sola-30-2hijos": {
		territory: T("28079"), residenceSince: V({ year: 2015, month: 1 }),
		age: AGE(30), dependents: DEP(3, 6), familyType: V("monoparental"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"joven-22-alquila": {
		territory: T("28079"), residenceSince: V({ year: 2022, month: 1 }),
		age: AGE(22), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"parado-45": {
		territory: T("28079"), residenceSince: V({ year: 2005, month: 1 }),
		age: AGE(45), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("desempleado"), studentStatus: V("no"),
		incomeAnnual: INC(0, 8400), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"estudiante-21": {
		territory: T("28079"), residenceSince: V({ year: 2005, month: 1 }),
		age: AGE(21), birthYear: V({min:2005,max:2005,maxExclusive:false}), dependents: DEP(),
		familyType: V("general"), employmentStatus: V("general"),
		studentStatus: V("si"), incomeAnnual: INC(0, 8400),
		disability: V("no"), dependency: V("no"), housingStatus: V("general"),
	},
	"discapacidad-45": {
		territory: T("28079"), residenceSince: V({ year: 2000, month: 1 }),
		age: AGE(45), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(16800, 25200), disability: V("gte33"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"cuidadora-60-coslada": {
		territory: T("28040"), residenceSince: V({ year: 2000, month: 1 }),
		age: AGE(60), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("general"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"fnumerosa-mostoles": {
		territory: T("28092"), residenceSince: V({ year: 2010, month: 1 }),
		age: AGE(45), dependents: DEP(7, 10, 14, 17), familyType: V("familia-numerosa"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(16800, 25200), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"autonoma-35": {
		territory: T("28079"), residenceSince: V({ year: 2018, month: 1 }),
		age: AGE(35), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("autonomo"), studentStatus: V("no"),
		incomeAnnual: INC(16800, 25200), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"pareja-40-bebe": {
		territory: T("28079"), residenceSince: V({ year: 2008, month: 1 }),
		age: AGE(40), dependents: DEP(0), familyType: V("general"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(16800, 25200), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"viudo-75": {
		territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(75), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("jubilado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"migrante-residencia-2a": {
		territory: T("28079"), residenceSince: V({ year: 2024, month: 6 }),
		age: AGE(33), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"docente-50": {
		territory: T("28079"), residenceSince: V({ year: 1998, month: 1 }),
		age: AGE(50), dependents: DEP(15), familyType: V("general"),
		employmentStatus: V("docente"), studentStatus: V("no"),
		incomeAnnual: INC(16800, 25200), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"parado-larga-54": {
		territory: T("28079"), residenceSince: V({ year: 1995, month: 1 }),
		age: AGE(54), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("desempleado"), studentStatus: V("no"),
		incomeAnnual: INC(0, 8400), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"pensionista-66-sin-cotizacion": {
		territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(66), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("general"), studentStatus: V("no"),
		incomeAnnual: INC(0, 8400), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"pareja-26-hijo": {
		territory: T("28092"), residenceSince: V({ year: 2020, month: 1 }),
		age: AGE(26), dependents: DEP(1), familyType: V("general"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"bico-19-universidad": {
		territory: T("28079"), residenceSince: V({ year: 2015, month: 1 }),
		age: AGE(19), birthYear: V({min:2007,max:2007,maxExclusive:false}), dependents: DEP(),
		familyType: V("general"), employmentStatus: V("general"),
		studentStatus: V("si"), incomeAnnual: INC(0, 8400),
		disability: V("no"), dependency: V("no"), housingStatus: V("general"),
	},
	"incapacidad-58": {
		territory: T("28079"), residenceSince: V({ year: 1998, month: 1 }),
		age: AGE(58), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("general"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("gte33"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"alquiler-vallecas-30": {
		territory: T("28079"), residenceSince: V({ year: 2019, month: 1 }),
		age: AGE(30), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(16800, 25200), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"viudo-65-hijos": {
		territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(65), dependents: DEP(17, 20), familyType: V("general"),
		employmentStatus: V("jubilado"), studentStatus: V("no"),
		incomeAnnual: INC(16800, 25200), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"empleada-publica-44": {
		territory: T("28079"), residenceSince: V({ year: 2005, month: 1 }),
		age: AGE(44), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("empleado-publico"), studentStatus: V("no"),
		incomeAnnual: INC(16800, 25200), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"joven-18-bono": {
		territory: T("28079"), residenceSince: V({ year: 2015, month: 1 }),
		age: AGE(18), birthYear: V({min:2008,max:2008,maxExclusive:false}), dependents: DEP(),
		familyType: V("general"), employmentStatus: V("general"),
		studentStatus: V("si"), incomeAnnual: INC(0, 8400),
		disability: V("no"), dependency: V("no"), housingStatus: V("general"),
	},
	"mayor-80-dependencia": {
		territory: T("28079"), residenceSince: V({ year: 1980, month: 1 }),
		age: AGE(80), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("jubilado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("reconocida"), housingStatus: V("propiedad"),
	},
	"familia-alquiler-3hijos": {
		territory: T("28065"), residenceSince: V({ year: 2012, month: 1 }),
		age: AGE(38), dependents: DEP(2, 5, 9), familyType: V("familia-numerosa"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
	"autonomo-62-baja": {
		territory: T("28079"), residenceSince: V({ year: 1990, month: 1 }),
		age: AGE(62), dependents: DEP(), familyType: V("general"),
		employmentStatus: V("autonomo"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("no"),
		dependency: V("no"), housingStatus: V("propiedad"),
	},
	"discap-33-alquiler": {
		territory: T("28092"), residenceSince: V({ year: 2010, month: 1 }),
		age: AGE(36), dependents: DEP(4), familyType: V("general"),
		employmentStatus: V("asalariado"), studentStatus: V("no"),
		incomeAnnual: INC(8400, 16800), disability: V("gte33"),
		dependency: V("no"), housingStatus: V("alquiler"),
	},
};

async function run(browser, name, answers, vp, takeShot) {
	const page = await browser.newPage({ viewport: vp });
	await page.addInitScript((p) => {
		sessionStorage.setItem("rr_check_handoff", JSON.stringify({
			answers: p, step: 0, savedAt: new Date().toISOString(),
		}));
	}, answers);
	await page.goto(`${BASE}/comprobar/`);
	await page.getByRole("button", { name: "Empezar", exact: true }).click();
	for (let i = 0; i < 18; i++) {
		if (await page.getByText("Revisa tus respuestas").count()) break;
		const before = await page.evaluate(
			() => document.querySelector("fieldset, .question")?.textContent ?? "",
		);
		const btn = page.getByRole("button", { name: "Siguiente", exact: true });
		if (!(await btn.count())) break;
		await btn.click();
		await page.waitForTimeout(180);
		const after = await page.evaluate(
			() => document.querySelector("fieldset, .question")?.textContent ?? "",
		);
		if (after === before) {
			// Paso que exige dato sin valor sembrado → salidas alternativas.
			const alt = page.getByRole("button", { name: "No lo sé", exact: true });
			const dec = page.getByRole("button", { name: "Prefiero no decirlo", exact: true });
			if (await alt.isVisible().catch(() => false)) await alt.click();
			else if (await dec.isVisible().catch(() => false)) await dec.click();
			await page.waitForTimeout(150);
		}
	}
	await page.getByRole("button", { name: "Ver mis resultados" }).click();
	await page.getByRole("heading", { name: "Tus resultados" }).waitFor({ timeout: 20000 });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(300);
	const data = await page.evaluate(() => {
		const groups = [...document.querySelectorAll("h2.results-group")].map((h) => h.textContent.trim());
		// Solo tarjetas realmente abiertas (fuera del <details> plegado).
		const open = [...document.querySelectorAll(".results-list > .aid-card")]
			.filter((c) => !c.closest("#no-descartar") && !c.closest(".nocumple"))
			.map((c) => c.querySelector("h2")?.textContent.trim());
		const missing = [...document.querySelectorAll(".missing-panel li")].map((l) => l.textContent.trim());
		const related = document.querySelectorAll(".level2-list li").length;
		return { groups, open, missing, related };
	});
	if (takeShot) {
		const tag = vp.width === 390 ? "_m" : "_d";
		await page.screenshot({ path: `${OUT}/${name}${tag}.png` });
	}
	await page.close();
	return data;
}

const browser = await chromium.launch();
const results = {};
for (const [name, answers] of Object.entries(P)) {
	try {
		const d = await run(browser, name, answers, { width: 1366, height: 900 }, true);
		const m = await run(browser, name, answers, { width: 390, height: 844 }, true);
		results[name] = { desktop: d, mobile: m };
		console.log(name, "| open:", d.open.length, "| related:", d.related, "| missing:", d.missing.length);
	} catch (e) {
		console.error("FALLO", name, String(e).slice(0, 120));
		results[name] = { error: String(e).slice(0, 200) };
	}
}
writeFileSync(`${OUT}/barrido.json`, JSON.stringify(results, null, 1));
await browser.close();