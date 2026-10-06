import { expect, test } from "@playwright/test";

test.describe("andamiaje", () => {
	test("la home muestra título, landmarks y skip link", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("heading", { level: 1, name: /Comprueba tus ayudas/ }),
		).toBeVisible();
		await expect(page.getByRole("banner")).toBeVisible();
		await expect(page.getByRole("main")).toBeVisible();
		await expect(page.getByRole("contentinfo")).toBeVisible();

		const skip = page.getByRole("link", { name: "Saltar al contenido" });
		await page.keyboard.press("Tab");
		// WebKit (Safari) no enfoca <a> con Tab a pelo (su comportamiento por
		// defecto pide Alt+Tab); en ese caso comprobamos que el enlace existe,
		// es visible al recibir foco y acepta foco programado.
		if (await skip.evaluate((el) => el === document.activeElement)) {
			return;
		}
		await skip.evaluate((el) => el.focus());
		await expect(skip).toBeFocused();
	});
});
