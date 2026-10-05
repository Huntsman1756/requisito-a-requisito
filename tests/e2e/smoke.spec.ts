import { expect, test } from "@playwright/test";

test.describe("andamiaje", () => {
	test("la home muestra título, landmarks y skip link", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("heading", { level: 1, name: "Tus derechos, con fuente" }),
		).toBeVisible();
		await expect(page.getByRole("banner")).toBeVisible();
		await expect(page.getByRole("main")).toBeVisible();
		await expect(page.getByRole("contentinfo")).toBeVisible();

		const skip = page.getByRole("link", { name: "Saltar al contenido" });
		await page.keyboard.press("Tab");
		await expect(skip).toBeFocused();
	});
});
