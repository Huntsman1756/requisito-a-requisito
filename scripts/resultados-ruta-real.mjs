// 2.1 — medición por la ruta real: cada perfil responde TODAS las preguntas
// del formulario y se anota lo que ve la pantalla de resultados, en orden.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = "http://localhost:4399";
const fixtures = JSON.parse(execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/completeness-web-data.ts"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
const bySlug = (s) => fixtures.persons.find((p) => p.slug === s);

const V = (value) => ({ state: "value", value });
const T = (m) => V({ ccaa: "13", province: "28", municipality: m });
const RS = (y) => V({ year: y, month: 1 });
const AGE = (n) => V({ min: n, max: n, maxExclusive: false });
const DEP = (ages) => V(ages.map((a) => ({ age: { min: a, max: a, maxExclusive: false } })));
const INC = (a, b) => V({ min: a, max: b });

// Perfiles típicos (los de resultados-volumen) respondiendo TODAS las preguntas.
const TIPICOS = [
  ["familia-2-menores-getafe", { territory: T("28065"), residenceSince: RS(2013), age: AGE(35), dependents: DEP([5, 9]), familyType: V("general"), employmentStatus: V("asalariado"), studentStatus: V("no"), incomeAnnual: INC(8400, 16800), disability: V("no"), housingStatus: V("alquiler") }],
  ["mayor-65-pension-baja", { territory: T("28079"), residenceSince: RS(1995), age: AGE(68), dependents: DEP([]), familyType: V("general"), employmentStatus: V("jubilado"), studentStatus: V("no"), incomeAnnual: INC(8400, 16800), disability: V("no"), housingStatus: V("propiedad") }],
  ["joven-26-alquila", { territory: T("28079"), residenceSince: RS(2023), age: AGE(26), dependents: DEP([]), familyType: V("general"), employmentStatus: V("asalariado"), studentStatus: V("no"), incomeAnnual: INC(8400, 16800), disability: V("no"), housingStatus: V("alquiler") }],
  ["desempleado-larga-47", { territory: T("28079"), residenceSince: RS(2000), age: AGE(47), dependents: DEP([]), familyType: V("general"), employmentStatus: V("desempleado"), studentStatus: V("no"), incomeAnnual: INC(0, 8400), disability: V("no"), housingStatus: V("alquiler") }],
  ["discapacidad-40", { territory: T("28079"), residenceSince: RS(2010), age: AGE(40), dependents: DEP([]), familyType: V("general"), employmentStatus: V("asalariado"), studentStatus: V("no"), incomeAnnual: INC(8400, 16800), disability: V("gte33"), dependency: V("no"), housingStatus: V("propiedad") }],
  ["monoparental-38", { territory: T("28079"), residenceSince: RS(2015), age: AGE(38), dependents: DEP([4]), familyType: V("monoparental"), employmentStatus: V("asalariado"), studentStatus: V("no"), incomeAnnual: INC(8400, 16800), disability: V("no"), housingStatus: V("alquiler") }],
  ["estudiante-20", { territory: T("28079"), residenceSince: RS(2006), age: AGE(20), birthYear: V({ min: 2006, max: 2006, maxExclusive: false }), dependents: DEP([]), familyType: V("general"), employmentStatus: V("general"), studentStatus: V("si"), incomeAnnual: INC(0, 8400), disability: V("no"), housingStatus: V("general") }],
  ["autonomo-44", { territory: T("28079"), residenceSince: RS(2005), age: AGE(44), dependents: DEP([]), familyType: V("general"), employmentStatus: V("autonomo"), studentStatus: V("no"), incomeAnnual: INC(16800, 25200), disability: V("no"), housingStatus: V("propiedad") }],
  ["vg-34", { territory: T("28079"), residenceSince: RS(2010), age: AGE(34), dependents: DEP([2]), familyType: V("monoparental"), employmentStatus: V("desempleado"), studentStatus: V("no"), incomeAnnual: INC(0, 8400), disability: V("no"), housingStatus: V("general") }],
  ["sin-ingresos-33", { territory: T("28079"), residenceSince: RS(2015), age: AGE(33), dependents: DEP([]), familyType: V("general"), employmentStatus: V("desempleado"), studentStatus: V("no"), incomeAnnual: INC(0, 8400), disability: V("no"), housingStatus: V("general") }],
];

// 10 goldens variados: lo que fija la persona golden + valores neutros donde
// la golden deja unknown (una persona real responde todas las preguntas).
const GOLDEN_SLUGS = [
  "imv", "bono-cultural-joven", "pension-viudedad",
  "pension-jubilacion-contributiva", "subsidio-mayores-52",
  "madrid-titulo-familia-numerosa", "prestaciones-dependencia-saad",
  "becas-generales-mefp-2026-2027", "ayto-tarjeta-azul-discapacidad",
  "madrid-bono-alquiler-joven",
];
const NEUTRAL = {
  territory: T("28079"), residenceSince: RS(2010), age: AGE(40), dependents: DEP([]),
  familyType: V("general"), employmentStatus: V("general"), studentStatus: V("no"),
  incomeAnnual: INC(8400, 16800), disability: V("no"), dependency: V("no"),
  housingStatus: V("general"),
};
const golden = (slug) => {
  const p = bySlug(slug);
  const a = { ...p.answers };
  for (const [k, v] of Object.entries(NEUTRAL)) {
    if (!a[k] || a[k].state !== "value") a[k] = v;
  }
  // El formulario guarda birthYear como intervalo puntual {min,max};
  // las goldens lo llevan como entero suelto.
  if (a.birthYear?.state === "value" && typeof a.birthYear.value === "number")
    a.birthYear = V({ min: a.birthYear.value, max: a.birthYear.value, maxExclusive: false });
  if (a.age?.state === "value" && typeof a.age.value === "number")
    a.age = V({ min: a.age.value, max: a.age.value, maxExclusive: false });
  return { answers: a, today: p.today };
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();
const OUT = [];

async function runProfile(name, answers, today) {
  await page.clock.install({ time: new Date(`${today}T12:00:00Z`) });
  await page.addInitScript(({ a }) => sessionStorage.setItem("rr_check_handoff", JSON.stringify({ answers: a, step: 0, savedAt: new Date().toISOString() })), { a: answers });
  await page.goto(`${BASE}/comprobar/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Empezar", exact: true }).click();
  for (let i = 0; i < 16; i++) {
    if (await page.getByRole("button", { name: "Ver mis resultados", exact: true }).isVisible().catch(() => false)) break;
    const next = page.getByRole("button", { name: "Siguiente", exact: true });
    if (await next.isEnabled().catch(() => false)) { await next.click(); }
    else {
      const alt = page.getByRole("button", { name: "No lo sé", exact: true });
      const dec = page.getByRole("button", { name: "Prefiero no decirlo", exact: true });
      if (await alt.isVisible().catch(() => false)) await alt.click();
      else if (await dec.isVisible().catch(() => false)) await dec.click();
    }
    await page.waitForTimeout(200);
  }
  await page.getByRole("button", { name: "Ver mis resultados", exact: true }).click();
  await page.getByRole("heading", { name: "Tus resultados" }).waitFor({ timeout: 20000 });
  await page.waitForTimeout(400);
  const data = await page.evaluate(() => {
    const tally = [...document.querySelectorAll(".tally > div")].map((d) => d.textContent.trim().replace(/\s+/g, " "));
    const cards = [...document.querySelectorAll(".results-list .aid-card, .results-list > li")].map((c) => ({
      title: c.querySelector("h2")?.textContent.trim() ?? c.querySelector("summary, h3")?.textContent.trim() ?? "?",
      pill: c.querySelector(".pill")?.textContent.trim() ?? "",
      closed: !!c.closest("details:not([open])"),
    }));
    const collapsedHeaders = [...document.querySelectorAll(".results-list details > summary")].map((s) => s.textContent.trim());
    const missing = [...document.querySelectorAll(".missing-panel li")].map((l) => l.textContent.trim().slice(0, 80));
    return { tally, cards: cards.slice(0, 15), collapsedHeaders, missing };
  });
  OUT.push({ name, ...data });
  console.log(name, "|", data.tally.join(" | "));
}

for (const [name, a] of TIPICOS) await runProfile(`tipico:${name}`, a, "2026-10-09");
for (const s of GOLDEN_SLUGS) { const g = golden(s); await runProfile(`golden:${s}`, g.answers, g.today); }

writeFileSync("F:/Temp/datawardsmadrid-lh/ruta-real.json", JSON.stringify(OUT, null, 1));
await browser.close();
console.log("DONE");
