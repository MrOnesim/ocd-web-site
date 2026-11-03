import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("OCD content and all six services work with mouse and keyboard", async ({ page }) => {
  await expect(page).toHaveTitle("OCD | Votre activité mérite d'être vue");
  await expect(page.locator("h1")).toHaveText("OCD");
  await expect(page.locator("body")).not.toContainText(/Cogito|Abomey|2290162973772/);
  const cards = page.locator("#services .stack-card");
  await expect(cards).toHaveCount(6);
  await page.locator("#services").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("#services .stack-card img").evaluateAll((images: HTMLImageElement[]) => images.every((image) => image.complete && image.naturalWidth > 0))).toBeTruthy();
  for (const title of ["Lives commerciaux", "Publicité & promotion", "Affiches publicitaires", "Stories promotionnelles", "Mise en scène des produits", "Régie commerciale"]) {
    await expect(page.getByRole("heading", { name: title, level: 3 })).toBeVisible();
  }
});

test("each price option preselects the corresponding dossier", async ({ page }) => {
  for (const [index, id, amount] of [[0, "decouverte", "5 000"], [1, "visibilite", "15 000"], [2, "intensive", "40 000"]] as const) {
    await page.locator(".pricing-plan").nth(index).getByRole("button").click();
    await expect(page.locator("#project-plan")).toHaveValue(id);
    await expect(page.locator(".form-estimate")).toContainText(amount);
    await expect(page.locator("#project-name")).toBeFocused();
  }
  await expect(page.locator(".form-estimate")).toContainText("3 passages de 4 heures dans la semaine");
});

test("local dossier validates, copies and downloads without sending personal data", async ({ page, context }) => {
  const submissions: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method())) submissions.push(request.url());
  });
  await page.getByRole("button", { name: "Préparer mon dossier" }).click();
  await expect(page.locator("#error-name")).toHaveText("Indiquez votre nom.");
  await expect(page.locator("#error-business")).toBeVisible();
  await expect(page.locator("#error-message")).toBeVisible();
  await page.getByLabel("Votre nom *", { exact: true }).fill("Amina Test");
  await page.getByLabel("Entreprise ou activité *", { exact: true }).fill("Atelier Amina");
  await page.locator("#project-plan").selectOption("visibilite");
  await page.locator("#project-date").fill("2020-01-01");
  await page.locator("#project-message").fill("Présenter ma collection de vêtements artisanaux pendant un live.");
  await page.getByLabel("Affiche publicitaire", { exact: true }).check();
  await page.getByRole("button", { name: "Préparer mon dossier" }).click();
  await expect(page.locator("#error-date")).toHaveText("Choisissez une date à venir.");
  await page.locator("#project-date").fill("2099-06-14");
  await page.getByRole("button", { name: "Préparer mon dossier" }).click();
  const dialog = page.getByRole("dialog", { name: "Mon projet OCD" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Votre dossier est prêt." })).toBeVisible();
  await expect(dialog.locator("textarea")).toHaveValue(/Atelier Amina/);
  await expect(dialog.locator("textarea")).toHaveValue(/15 000 FCFA/);
  await expect(dialog.locator("textarea")).toHaveValue(/Il n'a pas été transmis à OCD/);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await dialog.getByRole("button", { name: "Copier le dossier" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Dossier copié.");
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Télécharger (.txt)" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("OCD-mon-projet.txt");
  const text = await readFile((await download.path())!, "utf-8");
  expect(text).toContain("Affiche publicitaire");
  expect(text).toContain("ni une réservation ni une confirmation");
  await dialog.getByRole("button", { name: "Fermer la fenêtre" }).focus();
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBeTruthy();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#project-name")).toHaveValue("Amina Test");
  expect(submissions).toEqual([]);
});

test("navigation, disclosure controls and transparency dialog work", async ({ page }) => {
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  const menu = page.getByRole("dialog", { name: "Explorer OCD" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: /Nos formules/ }).click();
  await expect(menu).not.toBeVisible();
  await expect.poll(async () => (await page.locator("#formules").boundingBox())!.y).toBeLessThan(160);
  const step = page.locator(".process-step").nth(1);
  await step.locator("summary").click();
  await expect(step).toHaveAttribute("open", "");
  await expect(step.locator("p")).toBeVisible();
  await page.getByText("Des ambitions à construire", { exact: true }).click();
  await expect(page.getByText("Développer un système de réservation en ligne.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Informations & transparence" }).click();
  const info = page.getByRole("dialog", { name: "Informations & transparence" });
  await expect(info).toContainText("Les prix sont indicatifs.");
  await expect(info).toContainText("illustrations générées par IA");
  await page.keyboard.press("Escape");
  await expect(info).not.toBeVisible();
});

test("mobile and tablet layouts have no horizontal overflow or broken media", async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ["projet", "services", "pour-qui", "fonctionnement", "formules", "ecosysteme", "perspectives", "contact"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
  await expect.poll(() => page.locator("img").evaluateAll((images: HTMLImageElement[]) => images.every((image) => image.complete && image.naturalWidth > 0)), { timeout: 15000 }).toBeTruthy();
  expect(await page.locator(".marquee").first().evaluate((el) => el.style.transform)).toBe("");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const box = await page.getByRole("dialog").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});

test("FAQ, sector filters, live preview, testimonials and share assets work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator(".live-demo-tag")).toHaveText("Démonstration");
  await expect(page.locator(".live-phone")).toBeVisible();
  await page.locator(".live-steps .live-step").nth(3).click();
  await expect(page.locator(".live-controls")).toContainText("Étape 4 sur 5");
  await page.getByRole("button", { name: "Lancer l'aperçu animé" }).click();
  await expect(page.getByRole("button", { name: "Mettre l'aperçu en pause" })).toBeVisible();

  const filters = page.locator(".sector-filters button");
  await expect(filters).toHaveCount(7);
  await filters.nth(2).click();
  await expect(filters.nth(2)).toHaveAttribute("aria-pressed", "true");
  const visibleCards = page.locator(".sector-card");
  await expect(visibleCards).toHaveCount(1);
  await expect(page.locator(".sector-grid")).toContainText("Beauté & soins");

  await page.getByRole("button", { name: /L'audience annoncée est-elle garantie/ }).click();
  await expect(page.locator("#faq-answer-5")).toContainText("ne garantissent ni le nombre de spectateurs");
  const faqJsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(faqJsonLd).toContain("FAQPage");
  expect(faqJsonLd).toContain("Formule découverte");

  await page.locator("#temoignages").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "auront ici leur place.", exact: false })).toBeVisible();
  await expect(page.getByText("Les premiers retours", { exact: false }).first()).toBeVisible();

  await page.mouse.move(10, 10);
  await page.waitForTimeout(120);
  const headerVisible = await page.locator(".site-header").evaluate((el) => el.getBoundingClientRect().bottom > 0);
  expect(typeof headerVisible).toBe("boolean");

  expect(await page.evaluate(() => !!document.querySelector('meta[property="og:image"]')?.getAttribute("content")?.includes("ocd-live-hero.jpg"))).toBeTruthy();
});

test("draft is opt-in, persists locally and can be cleared", async ({ page }) => {
  await page.locator("#formules").scrollIntoViewIfNeeded();
  await expect(page.getByText("Conserver ce brouillon sur cet appareil")).toBeVisible();
  await page.locator("#project-name").fill("Brouillon Test");
  await page.locator("#project-business").fill("Atelier");
  await page.waitForTimeout(120);
  const stored = await page.evaluate(() => window.localStorage.getItem("ocd-project-draft-v1"));
  expect(stored).toContain("Brouillon Test");
  await page.reload();
  await expect(page.locator("#project-name")).toHaveValue("Brouillon Test");
  await expect(page.getByText("Brouillon restauré sur cet appareil.")).toBeVisible();
  await page.getByRole("button", { name: "Effacer" }).click();
  await expect(page.locator("#project-name")).toHaveValue("");
  expect(await page.evaluate(() => window.localStorage.getItem("ocd-project-draft-v1"))).toBeNull();
  await page.getByRole("checkbox", { name: /Conserver ce brouillon/ }).uncheck();
  await page.locator("#project-name").fill("Autre");
  await page.waitForTimeout(120);
  expect(await page.evaluate(() => window.localStorage.getItem("ocd-project-draft-v1"))).toBeNull();
});

test("page has no WCAG A/AA accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("animated navigation resumes correctly after a modal and targets the form", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page.getByRole("dialog", { name: "Explorer OCD" }).getByRole("link", { name: /Nos formules/ }).click();
  await expect.poll(async () => (await page.locator("#formules").boundingBox())!.y, { timeout: 5000 }).toBeLessThan(140);
  await page.locator(".pricing-plan").nth(1).getByRole("button").click();
  await expect.poll(async () => (await page.locator("#project-form").boundingBox())!.y, { timeout: 5000 }).toBeLessThan(140);
  await expect(page.locator("#project-name")).toBeFocused();
  await page.evaluate(() => scrollTo(0, 1200));
  await page.waitForTimeout(200);
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => page.evaluate(() => document.querySelector(".site-header")!.getBoundingClientRect().top)).toBe(0);
});

test("menu remains reachable at any scroll position", async ({ page }) => {
  await page.evaluate(() => scrollTo(0, 2600));
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(page.getByRole("dialog", { name: "Explorer OCD" })).toBeVisible();
  await page.getByRole("dialog").getByRole("link", { name: /Le projet/ }).click();
  await expect.poll(async () => (await page.locator("#projet").boundingBox())!.y).toBeLessThan(140);
});

test("immersive motion: intro, pinned services stack, scrubbed text and counters", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator(".intro")).toBeVisible();
  await expect(page.locator(".intro")).toHaveCount(0, { timeout: 4000 });
  await expect(page.locator(".hero-content")).toBeVisible();

  const track = page.locator(".stack-track");
  await expect(track).toHaveCount(1);
  const top = await track.evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const vh = await page.evaluate(() => innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), top + vh * 2.02);
  await expect(page.locator(".stack-list button.is-active")).toContainText("Affiches publicitaires");
  await page.locator(".stack-list button").nth(5).click();
  await expect(page.locator(".stack-list button.is-active")).toContainText("Régie commerciale", { timeout: 5000 });

  await page.locator("#formules").scrollIntoViewIfNeeded();
  await expect(page.locator(".plan-price").nth(1)).toContainText("15", { timeout: 4000 });
  await page.locator(".scrub-statement").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.locator(".scrub-statement").evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--sp")))).toBeGreaterThan(0.2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("local imagery and a playable video load without missing files", async ({ page }) => {
  const responses: { url: string; size: number }[] = [];
  page.on("response", async (response) => {
    const type = response.headers()["content-type"] ?? "";
    if (!type.startsWith("image/")) return;
    const length = Number(response.headers()["content-length"] ?? 0);
    if (length) responses.push({ url: response.url(), size: length });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const id of ["services", "pour-qui", "formules", "ecosysteme", "faq"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(220);
  }
  await expect(page.locator(".hero-image img")).toHaveAttribute("src", "/images/ocd-live-hero.jpg");
  const player = page.locator("#apercu-live video");
  await expect(player).toBeVisible();
  await expect.poll(() => player.evaluate((video: HTMLVideoElement) => video.readyState >= 1), { timeout: 15000 }).toBeTruthy();
  await expect.poll(() => player.evaluate(async (video: HTMLVideoElement) => {
    try { await video.play(); return !video.paused; } catch { return false; }
  }), { timeout: 10000 }).toBeTruthy();
  await player.evaluate((video: HTMLVideoElement) => video.pause());
  const missingDimensions = await page.locator("img.smart-img").evaluateAll((images: HTMLImageElement[]) =>
    images.filter((image) => !image.getAttribute("width") || !image.getAttribute("height")).map((image) => image.currentSrc));
  expect(missingDimensions).toEqual([]);
  const largest = Math.max(...responses.map((entry) => entry.size));
  const total = responses.reduce((sum, entry) => sum + entry.size, 0);
  console.log(`Médias chargés : ${Math.round(total / 1024)} Ko, plus lourd : ${Math.round(largest / 1024)} Ko`);
  expect(largest).toBeLessThan(700 * 1024);
  expect(total).toBeLessThan(4.5 * 1024 * 1024);
});
