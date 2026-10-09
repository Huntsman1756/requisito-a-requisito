/**
 * caso-daniel.spec.ts — el perfil real de Daniel por la ruta real del
 * formulario (F10-RES-2). Reproduce lo que Daniel vio el 09/10:
 *
 *   - «Pensión de jubilación contributiva» salía ENCAJA a los 56 años
 *     (su única dura comprobable es ≥52; la edad ordinaria y la cotización
 *     quedan en ⚠). Una condición definitoria en U nunca puede ser «Encaja».
 *   - «Prestación por cuidado de menores con enfermedad grave» ENCAJA sin
 *     saber si el hijo está enfermo — misma clase de defecto.
 *   - «Pensión de orfandad» POSIBLE sin ningún fallecimiento declarado.
 *   - «Bono Cultural Joven» en «Faltan datos» a los 56 años — la edad
 *     respondida ya resuelve el requisito por año de nacimiento.
 *   - El panel «Te faltan datos» volvía a ofrecer preguntas ya respondidas
 *     (personas a cargo, año de nacimiento, ingresos).
 *
 * Perfil (tal como lo respondió Daniel): Ajalvir, empadronado 07/2026,
 * 56 años, 1 persona a cargo de 18, «otra situación», cuenta propia,
 * no estudia, ingresos >25.200 €, sin discapacidad, alquiler.
 */
import { expect, test } from "@playwright/test";
import { completarCasoDaniel } from "./helpers";

// El flujo real de 10 pasos tarda ~45 s en esta máquina; margen x2
test.setTimeout(90_000);

test("caso Daniel: jubilación y cuidado de menores NO salen en «Encaja»", async ({
	page,
}) => {
	await completarCasoDaniel(page);
	// Con este perfil no queda ninguna ayuda «Encaja»: el grupo ni siquiera
	// se pinta (o no contiene estas dos tarjetas).
	const encHeading = page.getByRole("heading", {
		name: "Encajan contigo",
		exact: true,
	});
	if ((await encHeading.count()) > 0) {
		const encajas = encHeading.locator("xpath=following-sibling::div[1]");
		await expect(encajas).not.toContainText("Pensión de jubilación");
		await expect(encajas).not.toContainText("enfermedad grave");
	}
	// Deben aparecer en «Solo si…» como fila compacta con la condición
	// definitoria (F10-RES-3 §2.4: lista de una línea, no tarjeta).
	await expect(
		page.getByRole("heading", { name: /Solo si se da lo que define/ }),
	).toBeVisible();
	await expect(
		page.locator(".row-line", {
			hasText: "Pensión de jubilación contributiva",
		}),
	).toContainText(/cuando alcances la edad ordinaria/);
	await expect(
		page.locator(".row-line", {
			hasText: "cuidado de menores",
		}),
	).toContainText(/si tu hijo o hija tiene cáncer u otra enfermedad/);
	// Y ninguna tarjeta puede llamar «condiciones del trámite» a una
	// condición definitoria.
	await expect(page.getByText(/condiciones del trámite/i)).toHaveCount(0);
});

test("caso Daniel: orfandad solo sale como «solo si ha fallecido…»", async ({
	page,
}) => {
	await completarCasoDaniel(page);
	// Nadie ha declarado un fallecimiento: orfandad no puede estar abierta
	// como posible a secas — su condición definitoria es el titular.
	await expect(
		page.locator(".row-line", { hasText: "orfandad" }),
	).toContainText(/si ha fallecido tu padre o tu madre/);
});

test("caso Daniel: el Bono Cultural Joven no puede pedir «faltan datos» a los 56", async ({
	page,
}) => {
	await completarCasoDaniel(page);
	// La edad respondida (56) ya resuelve el requisito por año de
	// nacimiento: el bono debe estar en «No parece aplicarte» (plegado),
	// nunca en «Faltan datos» ni abierto.
	await expect(
		page.locator(".aid-card", { hasText: "Bono Cultural Joven" }),
	).toHaveCount(0);
	await page.getByRole("button", { name: /No parece aplicarte/ }).click();
	await expect(
		page.locator(".nocumple .aid-card", { hasText: "Bono Cultural Joven" }),
	).toBeVisible();
});

test("caso Daniel: «Te faltan datos» no repite preguntas ya respondidas", async ({
	page,
}) => {
	await completarCasoDaniel(page);
	const items = page.locator(".missing-panel li");
	// Respondidas ya: personas a cargo, año de nacimiento (derivado de la
	// edad) e ingresos — con la banda abierta solo cabe la pregunta de
	// precisión, que NO repite las mismas opciones.
	await expect(items.filter({ hasText: "a tu cargo" })).toHaveCount(0);
	await expect(items.filter({ hasText: "año naciste" })).toHaveCount(0);
	await expect(
		items.filter({ hasText: "Cuántos ingresos anuales" }),
	).toHaveCount(0);
});
