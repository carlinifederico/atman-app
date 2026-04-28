import { test, expect } from "@playwright/test";

test.describe("Per-user identity flow", () => {
  test("dashboard redirects to /welcome without identity", async ({ page }) => {
    // No init script — fresh storage
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.getByText(/Bienvenido a ATMAN/i)).toBeVisible();
  });

  test("can sign in as demo user via name input", async ({ page }) => {
    await page.goto("/welcome");
    await page.getByLabel("Tu nombre").fill("Federico");
    await page.getByRole("button", { name: /Entrar al demo/i }).click();
    await expect(page).toHaveURL(/\/panel/);
    await expect(page.getByText(/Total Billeteras/i)).toBeVisible();
  });

  test("two users see isolated data", async ({ browser }) => {
    // First user creates a wallet
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();
    await page1.goto("/welcome");
    await page1.getByLabel("Tu nombre").fill("Alice");
    await page1.getByRole("button", { name: /Entrar al demo/i }).click();
    await page1.waitForURL(/\/panel/);

    // Second user (separate context = separate localStorage)
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto("/welcome");
    await page2.getByLabel("Tu nombre").fill("Bob");
    await page2.getByRole("button", { name: /Entrar al demo/i }).click();
    await page2.waitForURL(/\/panel/);

    // Both see the same seeded demo data initially (e.g. 3 wallets each)
    await page1.goto("/billeteras");
    await page2.goto("/billeteras");
    await expect(page1.getByText("Bitcoin Principal")).toBeVisible();
    await expect(page2.getByText("Bitcoin Principal")).toBeVisible();

    await ctx1.close();
    await ctx2.close();
  });
});
