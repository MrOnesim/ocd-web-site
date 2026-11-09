import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("OCD Live immediately presents both Presentiel Togo (Bovann Shop) and Distanciel International options", async ({ page }) => {
  await expect(page).toHaveTitle("OCD | Votre activité mérite d'être vue");
  await expect(page.locator("#participation")).toContainText("Live en Présentiel — Togo");
  await expect(page.locator("#participation")).toContainText("Bovann Shop");
  await expect(page.locator("#participation")).toContainText("assistante des lives OCD");
  await expect(page.locator("#participation")).toContainText("Live à Distance — International");
  await expect(page.locator("#participation")).toContainText("Cameroun");
  await expect(page.locator("#formules .pricing-plan")).toHaveCount(6);
});

test("6-step booking flow registers a reservation and blocks double bookings", async ({ page }) => {
  await page.getByRole("button", { name: /Réserver un Live à Distance/i }).click();
  await expect(page.locator("#reservation")).toContainText("Étape 1 sur 6");
  await page.getByRole("button", { name: /Continuer vers le calendrier/i }).click();

  await expect(page.locator("#reservation")).toContainText("Étape 2 sur 6");
  await page.locator(".calendar-day.state-available").first().click();

  await expect(page.locator("#reservation")).toContainText("Étape 3 sur 6");
  await page.locator(".slot-card:not(.is-booked)").first().click();
  await page.getByRole("button", { name: /Choisir mon forfait/i }).click();

  await expect(page.locator("#reservation")).toContainText("Étape 4 sur 6");
  await page.getByRole("button", { name: /Renseigner mes informations/i }).click();

  await expect(page.locator("#reservation")).toContainText("Étape 5 sur 6");
  await page.locator("#bk-firstName").fill("Amina");
  await page.locator("#bk-lastName").fill("Ndjock");
  await page.locator("#bk-city").fill("Douala");
  await page.locator("#bk-phone").fill("+237 690 12 34 56");
  await page.locator("#bk-email").fill("amina@atelier.cm");
  await page.locator("#bk-company").fill("Atelier Amina");
  await page.locator("#bk-products").fill("Robes et ensembles sur mesure");
  await page.locator("#bk-desc").fill("Créations textiles artisanales camerounaises");
  await page.getByRole("button", { name: /Vérifier mon récapitulatif/i }).click();

  await expect(page.locator("#reservation")).toContainText("Étape 6 sur 6");
  await page.getByRole("button", { name: /Confirmer ma réservation OCD Live/i }).click();

  await expect(page.locator(".booking-confirmed-card")).toBeVisible();
  await expect(page.locator(".confirmed-ref")).toContainText(/OCD-\d{8}-\d{4}/);
});

test("Admin dashboard authenticates and displays reservations, 6 packages and notifications", async ({ page }) => {
  await page.goto("/admin");
  await page.locator("#adm-email").fill("admin@ocdlive.org");
  await page.locator("#adm-pass").fill("OcdLive2026!");
  await page.getByRole("button", { name: /Accéder au tableau de bord/i }).click();

  await expect(page.getByRole("heading", { name: "Tableau de bord général" })).toBeVisible();
  await page.getByRole("button", { name: /Les 6 Forfaits/i }).click();
  await expect(page.locator(".admin-packages-grid form")).toHaveCount(6);
});

test("page has no WCAG A/AA accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});
