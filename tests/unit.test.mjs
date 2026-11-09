import assert from "node:assert/strict";
import { mkdir, readFile, rm } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { createApiHandler } from "../server/api.mjs";
import { openOcdStore } from "../server/db.mjs";
import { generateBookingIcs } from "../server/notifications.mjs";

async function bundleAppForNode() {
  const outDir = path.resolve(".verification");
  await mkdir(outDir, { recursive: true });
  const outfile = path.join(outDir, "unit-bundle.mjs");

  try {
    await build({
      stdin: {
        contents: `
          import React from "react";
          import { renderToStaticMarkup } from "react-dom/server";
          import App from "./src/App";
          export { siteConfig } from "./src/config/site";
          export { faqs, navItems, services } from "./src/data/content";
          export {
            DEFAULT_PACKAGES,
            formatDualTimezoneSlot,
            formatEuroApprox,
          } from "./src/data/packages";
          export function renderApp() {
            return renderToStaticMarkup(React.createElement(App));
          }
        `,
        resolveDir: process.cwd(),
        loader: "tsx",
      },
      bundle: true,
      outfile,
      format: "esm",
      platform: "node",
      packages: "external",
      alias: { "@": path.resolve("src") },
    });

    return await import(pathToFileURL(outfile).href);
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}

const app = await bundleAppForNode();

test("SSR renders OCD Live dual participation modes, 6 packages, booking wizard and WebP imagery", () => {
  const html = app.renderApp();
  assert.match(html, /OCD Live/);
  assert.match(html, /Live en Présentiel — Togo/);
  assert.match(html, /Bovann Shop/);
  assert.match(html, /assistante des lives OCD/i);
  assert.match(html, /Live à Distance — International/);
  assert.match(html, /Cameroun/);
  assert.match(html, /Tchad/);
  assert.match(html, /Centrafrique/);
  assert.match(html, /id="programme"/);
  assert.match(html, /Annonces officielles des directs/);

  // Vérification conversion fuseau horaire Togo GMT vs Cameroun GMT+1 & parité Euro
  const tzCameroon = app.formatDualTimezoneSlot("10:00", "11:30", "Cameroun");
  assert.match(tzCameroon.togoLabel, /10:00 – 11:30/);
  assert.match(tzCameroon.localLabel, /11:00 – 12:30/);
  assert.equal(app.formatDualTimezoneSlot("10:00", "11:30", "Togo").localLabel, null);
  assert.match(app.formatEuroApprox(20000), /30 €/);

  for (const item of app.navItems) {
    const id = item.href.slice(1);
    assert.match(html, new RegExp(`id="${id}"`), `Missing section #${id}`);
  }

  assert.equal(app.DEFAULT_PACKAGES.length, 6, "Must offer 6 commercial packages");
  for (const pkg of app.DEFAULT_PACKAGES) {
    const escaped = pkg.name.replace(/&/g, "&amp;");
    assert.ok(html.includes(escaped), `Missing package ${pkg.name}`);
  }

  assert.match(
    html,
    /<picture class="smart-picture"><source type="image\/webp" srcset="\/images\/ocd-live-hero-800w\.webp 800w, \/images\/ocd-live-hero\.webp 1672w"/i
  );
});

test("SQLite booking engine enforces anti-double-booking, notifications, lookup, ICS and admin CRUD", async () => {
  const store = openOcdStore(":memory:");

  const pkgs = store.listPackages();
  assert.equal(pkgs.length, 6);

  // 1. Disponibilités décembre 2026
  const dec = store.getMonthAvailability("2026-12", "business");
  assert.equal(dec.month, "2026-12");
  const dec01 = dec.days.find((d) => d.date === "2026-12-01");
  assert.equal(dec01.state, "available");
  const dec03 = dec.days.find((d) => d.date === "2026-12-03");
  assert.equal(dec03.state, "booked"); // Journée spéciale pré-bloquée

  // 2. Réservation à distance depuis le Cameroun (10h/11h -> créneau 11:00-12:30)
  const created = await store.createBooking({
    participationMode: "distanciel",
    bookingDate: "2026-12-01",
    startTime: "11:00",
    packageId: "business",
    specialNeeds: "Présentation de plats camerounais en direct",
    firstName: "Clarisse",
    lastName: "Mbarga",
    phone: "+237 699 00 11 22",
    whatsapp: "+237 699 00 11 22",
    email: "clarisse@saveursdouala.cm",
    country: "Cameroun",
    city: "Douala",
    companyName: "Saveurs de Douala",
    sector: "Restauration, traiteur & agroalimentaire",
    companyDescription: "Traiteur événementiel et cuisine traditionnelle camerounaise.",
    productsServices: "Ndolé, poulet DG et jus naturels en livraison",
    physicalAddress: "Quartier Bonapriso, Douala",
    businessPhone: "+237 699 00 11 22",
    socialLinks: "@saveursdouala",
    livePrepNotes: "Offre découverte -15% pendant le direct",
  });

  assert.match(created.booking.reference, /^OCD-20261201-\d{4}$/);
  assert.equal(created.booking.endTime, "12:30");
  assert.equal(created.booking.amountFcfa, 20000);

  // 3. Anti-double-réservation : même créneau refusé (409)
  await assert.rejects(
    () =>
      store.createBooking({
        participationMode: "presentiel",
        bookingDate: "2026-12-01",
        startTime: "11:00",
        packageId: "decouverte",
        specialNeeds: "",
        firstName: "Koffi",
        lastName: "Mensah",
        phone: "+228 90 11 22 33",
        whatsapp: "+228 90 11 22 33",
        email: "koffi@lome.tg",
        country: "Togo",
        city: "Lomé",
        companyName: "Lomé Mode",
        sector: "Mode",
        companyDescription: "Prêt-à-porter",
        productsServices: "Chemises et ensembles",
        physicalAddress: "Lomé",
        businessPhone: "+228 90 11 22 33",
        socialLinks: "",
        livePrepNotes: "",
      }),
    (err) => err.statusCode === 409
  );

  // 4. Anti-double-réservation : créneau 4h (09:00-13:00) chevauchant 11:00-12:30 également refusé !
  await assert.rejects(
    () =>
      store.createBooking({
        participationMode: "presentiel",
        bookingDate: "2026-12-01",
        startTime: "09:00",
        packageId: "immersion-4h",
        specialNeeds: "",
        firstName: "Koffi",
        lastName: "Mensah",
        phone: "+228 90 11 22 33",
        whatsapp: "+228 90 11 22 33",
        email: "koffi@lome.tg",
        country: "Togo",
        city: "Lomé",
        companyName: "Lomé Mode",
        sector: "Mode",
        companyDescription: "Prêt-à-porter",
        productsServices: "Chemises et ensembles",
        physicalAddress: "Lomé",
        businessPhone: "+228 90 11 22 33",
        socialLinks: "",
        livePrepNotes: "",
      }),
    (err) => err.statusCode === 409
  );

  // 5. Notifications automatiques Admin + Participant générées
  const notifs = store.listNotificationsAdmin();
  assert.equal(notifs.length, 2);
  const adminNotif = notifs.find((n) => n.recipientType === "admin");
  assert.match(adminNotif.summary, /Nouvelle réservation OCD Live/);
  assert.match(adminNotif.summary, /Cameroun/);
  assert.match(adminNotif.summary, /à distance/);
  assert.match(adminNotif.summary, /11:00 à 12:30/);

  // 6. Lookup public & export ICS
  const found = store.lookupBookingPublic(created.booking.reference, "clarisse@saveursdouala.cm");
  assert.equal(found.companyName, "Saveurs de Douala");
  const notFound = store.lookupBookingPublic(created.booking.reference, "wrong@example.com");
  assert.equal(notFound, null);

  const ics = generateBookingIcs(found, store.getSettings());
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /Saveurs de Douala/);

  // 7. Opérations administrateur : auth, confirmation, paiement, édition forfait, export CSV et annulation
  assert.ok(store.authenticateAdmin("admin@ocdlive.org", "OcdLive2026!"));
  assert.equal(store.authenticateAdmin("admin@ocdlive.org", "badpass"), null);

  const updated = store.updateBookingAdmin(created.booking.id, {
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "Orange Money",
    assignedAssistant: "Afi (Assistante OCD Togo)",
  });
  assert.equal(updated.status, "confirmed");
  assert.equal(updated.paymentStatus, "paid");

  const stats = store.getDashboardStats();
  assert.equal(stats.confirmedBookings, 1);
  assert.equal(stats.paidRevenueFcfa, 20000);
  assert.equal(stats.distancielCount, 1);

  const updatedPkg = store.savePackageAdmin({
    ...pkgs[0],
    priceFcfa: 17500,
  });
  assert.equal(updatedPkg.priceFcfa, 17500);

  const csv = store.exportBookingsCsv();
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /Saveurs de Douala/);

  // Annuler libère immédiatement le créneau 11:00
  store.updateBookingAdmin(created.booking.id, { status: "cancelled" });
  const slotsAfterCancel = store.computeSlotsForDate("2026-12-01", 90);
  assert.equal(
    slotsAfterCancel.slots.find((s) => s.startTime === "11:00").available,
    true
  );
});

test("HTTP API endpoints handle public booking and authenticated admin session over real HTTP", async () => {
  const { handleApi } = createApiHandler({ dbPath: ":memory:" });
  const server = http.createServer((req, res) => handleApi(req, res));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  try {
    const cfgRes = await fetch(`${base}/api/public/config`);
    assert.equal(cfgRes.status, 200);
    const cfg = await cfgRes.json();
    assert.equal(cfg.packages.length, 6);

    // Accès admin sans session -> 401
    const unauth = await fetch(`${base}/api/admin/overview`);
    assert.equal(unauth.status, 401);

    // Login admin -> cookie HttpOnly
    const loginRes = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@ocdlive.org", password: "OcdLive2026!" }),
    });
    assert.equal(loginRes.status, 200);
    const cookie = loginRes.headers.get("set-cookie");
    assert.match(cookie, /ocd_admin_session=.*HttpOnly/);

    const overviewRes = await fetch(`${base}/api/admin/overview`, {
      headers: { Cookie: cookie.split(";")[0] },
    });
    assert.equal(overviewRes.status, 200);
    const overview = await overviewRes.json();
    assert.equal(overview.packages.length, 6);

    // Mode Démo 1-clic : injection de 5 pays -> vitrine publique #programme -> nettoyage propre
    const seedRes = await fetch(`${base}/api/admin/demo/seed`, {
      method: "POST",
      headers: { Cookie: cookie.split(";")[0] },
    });
    assert.equal(seedRes.status, 200);
    const seeded = await seedRes.json();
    assert.equal(seeded.inserted, 5);

    const cfgAfterSeed = await fetch(`${base}/api/public/config`).then((r) => r.json());
    assert.equal(cfgAfterSeed.upcomingLives.length, 4); // 4 confirmés sur les 5 (1 en attente)

    const clearRes = await fetch(`${base}/api/admin/demo/clear`, {
      method: "DELETE",
      headers: { Cookie: cookie.split(";")[0] },
    });
    assert.equal(clearRes.status, 200);
    const cleared = await clearRes.json();
    assert.equal(cleared.deleted, 5);
    assert.equal(cleared.stats.totalBookings, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("SEO files (index.html, sitemap.xml, robots.txt) match siteConfig and FAQs", async () => {
  const html = await readFile("index.html", "utf8");
  const sitemap = await readFile("public/sitemap.xml", "utf8");
  const robots = await readFile("public/robots.txt", "utf8");

  assert.ok(html.includes(`<link rel="canonical" href="${app.siteConfig.url}" />`));
  assert.ok(html.includes('href="/fonts/inter-tight.woff2"'));
  assert.match(html, /meta property="og:image" content="https:\/\/[^"]+\/images\/ocd-live-hero\.jpg"/);

  const ldMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(ldMatch, "Missing JSON-LD script");
  const parsed = JSON.parse(ldMatch[1]);
  const faqNode = parsed["@graph"].find((entry) => entry["@type"] === "FAQPage");
  assert.equal(faqNode.mainEntity.length, app.faqs.length);

  assert.ok(!sitemap.includes("#"), "sitemap.xml must not contain URL fragments (#)");
  assert.ok(sitemap.includes(`<loc>${app.siteConfig.url}</loc>`));
  assert.match(robots, /Sitemap:\s*https:\/\/.+\/sitemap\.xml/);
});
