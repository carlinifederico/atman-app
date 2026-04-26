import { test, expect } from "@playwright/test";

test.describe("ATMAN demo flow", () => {
  test("landing renders with hero copy", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Herencia Digital/i).first()).toBeVisible();
  });

  test("can navigate to panel and see demo wallets", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByText(/Total Billeteras/i)).toBeVisible();
    await expect(page.getByText(/Total Herederos/i)).toBeVisible();
    await expect(page.getByText(/Estado del Plan/i)).toBeVisible();
  });

  test("billeteras page shows demo wallets", async ({ page }) => {
    await page.goto("/billeteras");
    await expect(page.getByText("Bitcoin Principal")).toBeVisible();
    await expect(page.getByText("Ethereum DeFi")).toBeVisible();
    await expect(page.getByText("Solana Trading")).toBeVisible();
  });

  test("herederos page shows demo heirs", async ({ page }) => {
    await page.goto("/herederos");
    await expect(page.getByText("Maria Rivera")).toBeVisible();
    await expect(page.getByText("Lucas Rivera")).toBeVisible();
    await expect(page.getByText("Sofia Rivera")).toBeVisible();
  });

  test("distribucion page allows selecting wallet", async ({ page }) => {
    await page.goto("/distribucion");
    await expect(page.getByText(/Seleccionar billetera/i)).toBeVisible();
  });

  test("legal pages render with draft banner", async ({ page }) => {
    for (const path of ["/terminos", "/privacidad", "/disclaimer-cripto"]) {
      await page.goto(path);
      await expect(page.getByText(/Borrador.*pendiente de revisión legal/i)).toBeVisible();
    }
  });

  test("vault: empty state shows trust banner and crypto details", async ({ page }) => {
    await page.goto("/vault");
    await expect(page.getByText(/AES-GCM-256/i)).toBeVisible();
    await expect(page.getByText(/PBKDF2-SHA256/i)).toBeVisible();
    await expect(page.getByText(/Todavía no tenés instrucciones cifradas/i)).toBeVisible();
  });

  test("vault: encrypt and decrypt round-trip", async ({ page }) => {
    await page.goto("/vault");
    await page.getByRole("button", { name: /Nueva Instrucción/i }).click();

    // Pick first heir from select
    await page.getByText("Seleccionar heredero").click();
    await page.getByRole("option").first().click();

    await page.getByLabel("Etiqueta").fill("test entry");
    await page.getByLabel("Instrucciones (texto plano)").fill("Mensaje secreto para test");
    await page.getByLabel(/Passphrase del vault/i).fill("contraseña-segura-test-123");

    await page.getByRole("button", { name: /Cifrar y guardar/i }).click();
    await expect(page.getByText("test entry")).toBeVisible();

    // Decrypt round-trip
    await page.getByRole("button", { name: "Ver" }).click();
    await page.getByLabel("Passphrase").fill("contraseña-segura-test-123");
    await page.getByRole("button", { name: "Descifrar" }).click();
    await expect(page.getByText("Mensaje secreto para test")).toBeVisible();
  });
});
