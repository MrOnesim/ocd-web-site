import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword, verifyPassword } from "./auth.mjs";
import {
  bookingStatusLabel,
  buildAdminNotification,
  buildParticipantConfirmation,
  dispatchEmailIfConfigured,
  isSmtpConfigured,
  paymentStatusLabel,
} from "./notifications.mjs";

const INITIAL_PACKAGES = [
  {
    id: "decouverte",
    code: "PACK 01",
    name: "Formule Découverte",
    subtitle: "Premier direct clé en main",
    priceFcfa: 15000,
    durationMinutes: 90,
    durationLabel: "1h30 de direct",
    sessionsCount: 1,
    badge: "Essentiel",
    featured: false,
    active: true,
    sortOrder: 1,
    description:
      "Idéale pour tester OCD Live, présenter vos produits phares et diffuser vos coordonnées auprès de l'audience House of Challenge.",
    features: [
      "1 passage en direct de 1h30 sur House of Challenge",
      "Accompagnement par une assistante des lives OCD (chez Bovann Shop au Togo ou à distance)",
      "Présentation en direct de vos produits et services",
      "Affichage du nom de l'entreprise et du numéro de téléphone",
      "Rappel oral de votre localisation pendant le live",
    ],
    promoBenefits: ["Nom de l'entreprise affiché", "Numéro de téléphone diffusé"],
    modesAllowed: "both",
  },
  {
    id: "business",
    code: "PACK 02",
    name: "Formule Business",
    subtitle: "1h30 + visibilité commerciale enrichie",
    priceFcfa: 20000,
    durationMinutes: 90,
    durationLabel: "1h30 + pack contact",
    sessionsCount: 1,
    badge: "Recommandé",
    featured: true,
    active: true,
    sortOrder: 2,
    description:
      "Le format 1h30 complet pour maximiser les appels clients : coordonnées complètes à l'écran, adresse physique, réseaux sociaux et stories du jour.",
    features: [
      "1 passage en direct de 1h30 avec accompagnement commercial actif",
      "Bandeau complet : entreprise, téléphone, WhatsApp et adresse physique",
      "Mise en avant de vos pages et réseaux sociaux pendant le direct",
      "2 stories promotionnelles diffusées le jour du live",
      "Mise en scène de vos produits (sur place ou visuels envoyés à distance)",
    ],
    promoBenefits: [
      "Bandeau coordonnées complet",
      "Adresse physique & réseaux sociaux",
      "2 stories le jour J",
    ],
    modesAllowed: "both",
  },
  {
    id: "visibilite",
    code: "PACK 03",
    name: "Visibilité Renforcée",
    subtitle: "Direct prolongé + affiche & publication",
    priceFcfa: 35000,
    durationMinutes: 120,
    durationLabel: "2h00 + publication dédiée",
    sessionsCount: 1,
    badge: "Impact+",
    featured: false,
    active: true,
    sortOrder: 3,
    description:
      "Associe un direct de 2 heures à des supports visuels dédiés pour ancrer durablement votre marque avant et après l'émission.",
    features: [
      "1 passage en direct de 2h00 sur House of Challenge",
      "Création d'une affiche digitale officielle pour votre activité",
      "1 publication promotionnelle dédiée sur nos canaux",
      "4 stories promotionnelles (avant et après le direct)",
      "Diffusion prioritaire du numéro pro, WhatsApp, adresse et réseaux",
    ],
    promoBenefits: [
      "Affiche publicitaire incluse",
      "Publication dédiée",
      "4 stories avant/après",
    ],
    modesAllowed: "both",
  },
  {
    id: "immersion-4h",
    code: "PACK 04",
    name: "Immersion 4 Heures",
    subtitle: "Grand format marathon à tarif avantageux",
    priceFcfa: 45000,
    durationMinutes: 240,
    durationLabel: "4h00 de direct continu",
    sessionsCount: 1,
    badge: "Meilleur ratio durée/prix",
    featured: false,
    active: true,
    sortOrder: 4,
    description:
      "4 heures complètes pour démontrer toute une gamme, cuisiner ou vendre en volume (idéal restauration, prêt-à-porter, cosmétiques et électronique).",
    features: [
      "4h00 consécutives de diffusion en direct à tarif préférentiel",
      "Temps long pour démonstrations détaillées, dégustations ou essayages",
      "Relances régulières de vos offres, tarifs, adresse et numéros",
      "Co-animation dynamique par votre assistante des lives OCD tout au long des 4h",
      "3 stories fil rouge pendant le direct pour capter de nouveaux spectateurs",
    ],
    promoBenefits: [
      "4h de temps d'antenne",
      "Tarif horaire réduit",
      "Stories fil rouge en direct",
    ],
    modesAllowed: "both",
  },
  {
    id: "vip",
    code: "PACK 05",
    name: "Formule VIP Projecteur",
    subtitle: "Annonce préalable + teasing + grand live 4h",
    priceFcfa: 65000,
    durationMinutes: 240,
    durationLabel: "4h00 + annonce officielle J-2",
    sessionsCount: 1,
    badge: "Événement VIP",
    featured: true,
    active: true,
    sortOrder: 5,
    description:
      "Transformez votre passage en événement attendu : annonce officielle 48h avant le direct, affiche sur mesure, campagne stories et 4 heures d'antenne.",
    features: [
      "Annonce officielle du live 48h à l'avance auprès de l'audience",
      "Affiche publicitaire premium + visuel teaser J-2 et J-1",
      "4h00 de live commercial grand format avec co-animation dédiée",
      "Mise en avant complète : marque, catalogue, contacts, adresse & réseaux",
      "Publication récapitulative post-live avec vos coordonnées commerciales",
    ],
    promoBenefits: [
      "Annonce officielle 48h avant",
      "Campagne teasing + affiche VIP",
      "Récapitulatif post-live",
    ],
    modesAllowed: "both",
  },
  {
    id: "partenaire",
    code: "PACK 06",
    name: "Partenaire Mensuel",
    subtitle: "4 lives dans le mois + campagne 30 jours",
    priceFcfa: 150000,
    durationMinutes: 120,
    durationLabel: "4 lives × 2h00 / mois",
    sessionsCount: 4,
    badge: "Partenaire Officiel",
    featured: false,
    active: true,
    sortOrder: 6,
    description:
      "L'accompagnement continu pour installer votre entreprise dans les habitudes des consommateurs : 4 directs mensuels et visibilité récurrente.",
    features: [
      "4 sessions live de 2h00 réparties sur le mois (8h d'antenne cumulées)",
      "Choix prioritaire des meilleurs créneaux horaires du calendrier",
      "Pack communication mensuel : affiches, publications et stories hebdomadaires",
      "Annonce préalable avant chacune de vos diffusions",
      "Suivi commercial dédié avec l'équipe OCD Live & bilan de fin de mois",
    ],
    promoBenefits: [
      "4 directs mensuels garantis",
      "Campagne promo sur 30 jours",
      "Créneaux prioritaires",
    ],
    modesAllowed: "both",
  },
];

const DEFAULT_SETTINGS = {
  launchDate: "2026-12-01",
  openDays: [1, 2, 3, 4, 5, 6], // Lundi à Samedi ouverts
  slotTemplates: ["09:00", "11:00", "14:00", "16:00", "18:30"],
  studioName: "Bovann Shop — Lomé, Togo",
  studioAddress: "Locaux officiels Bovann Shop, Lomé, Togo",
  adminEmail: "contact@houseofchallenge.org",
  whatsappNumber: "+22879790229",
  bookingHorizonMonths: 6,
};

export function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function openOcdStore(customDbPath) {
  const resolvedPath =
    customDbPath || process.env.OCD_DB_PATH || path.resolve(process.cwd(), "data", "ocd-live.sqlite");
  if (resolvedPath !== ":memory:") {
    mkdirSync(path.dirname(resolvedPath), { recursive: true });
  }

  const db = new DatabaseSync(resolvedPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      email TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      price_fcfa INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL,
      duration_label TEXT NOT NULL,
      sessions_count INTEGER NOT NULL DEFAULT 1,
      badge TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 1,
      description TEXT NOT NULL DEFAULT '',
      features_json TEXT NOT NULL DEFAULT '[]',
      promo_benefits_json TEXT NOT NULL DEFAULT '[]',
      modes_allowed TEXT NOT NULL DEFAULT 'both'
    );

    CREATE TABLE IF NOT EXISTS date_overrides (
      date TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
      custom_slots_json TEXT NOT NULL DEFAULT '[]',
      note TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS blocked_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      participation_mode TEXT NOT NULL CHECK(participation_mode IN ('presentiel', 'distanciel')),
      booking_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      package_id TEXT NOT NULL,
      package_name TEXT NOT NULL,
      amount_fcfa INTEGER NOT NULL,
      special_needs TEXT NOT NULL DEFAULT '',

      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,

      company_name TEXT NOT NULL,
      sector TEXT NOT NULL,
      company_description TEXT NOT NULL,
      products_services TEXT NOT NULL,
      physical_address TEXT NOT NULL DEFAULT '',
      business_phone TEXT NOT NULL DEFAULT '',
      social_links TEXT NOT NULL DEFAULT '',
      live_prep_notes TEXT NOT NULL DEFAULT '',

      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
      payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'deposit', 'paid', 'refunded')),
      payment_method TEXT NOT NULL DEFAULT '',
      assigned_assistant TEXT NOT NULL DEFAULT '',
      admin_notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(booking_date, status);
    CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference);

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      booking_reference TEXT NOT NULL DEFAULT '',
      recipient_type TEXT NOT NULL CHECK(recipient_type IN ('admin', 'participant')),
      recipient_email TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL,
      summary TEXT NOT NULL,
      body_text TEXT NOT NULL,
      delivery_status TEXT NOT NULL DEFAULT 'logged',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  /* -------------------------------------------------------------- Seeding */
  const settingsCount = db.prepare("SELECT COUNT(*) as c FROM settings").get().c;
  if (settingsCount === 0) {
    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      insertSetting.run(k, JSON.stringify(v));
    }
    insertSetting.run("session_secret", JSON.stringify(crypto.randomBytes(32).toString("hex")));

    // Quelques créneaux studio pré-réservés sur décembre pour illustrer les états du calendrier
    const insertBlock = db.prepare(
      "INSERT INTO blocked_slots (date, start_time, end_time, reason) VALUES (?, ?, ?, ?)"
    );
    insertBlock.run("2026-12-03", "08:00", "23:00", "Émission spéciale ouverture OCD Live");
    insertBlock.run("2026-12-05", "11:00", "12:30", "Créneau réservé House of Challenge");
    insertBlock.run("2026-12-12", "14:00", "18:00", "Session partenaire programmée");
  }

  // Harmonisation automatique si une base SQLite existante contenait l'ancienne graphie "Boban Shop"
  db.exec(`
    UPDATE settings SET value = REPLACE(value, 'Boban Shop', 'Bovann Shop') WHERE value LIKE '%Boban Shop%';
    UPDATE packages SET features_json = REPLACE(features_json, 'Régie technique Boban Shop (Togo) ou assistante dédiée à distance', 'Accompagnement par une assistante des lives OCD (chez Bovann Shop au Togo ou à distance)') WHERE features_json LIKE '%Boban Shop%';
    UPDATE bookings SET assigned_assistant = REPLACE(assigned_assistant, 'Régie Studio Boban Shop', 'Assistante des Lives OCD (Bovann Shop)') WHERE assigned_assistant LIKE '%Boban Shop%';
    UPDATE bookings SET assigned_assistant = REPLACE(assigned_assistant, 'Boban Shop', 'Bovann Shop') WHERE assigned_assistant LIKE '%Boban Shop%';
    UPDATE notifications SET summary = REPLACE(summary, 'Boban Shop', 'Bovann Shop'), body_text = REPLACE(body_text, 'Boban Shop', 'Bovann Shop') WHERE summary LIKE '%Boban Shop%' OR body_text LIKE '%Boban Shop%';
  `);

  const pkgCount = db.prepare("SELECT COUNT(*) as c FROM packages").get().c;
  if (pkgCount === 0) {
    const insertPkg = db.prepare(`
      INSERT INTO packages (
        id, code, name, subtitle, price_fcfa, duration_minutes, duration_label,
        sessions_count, badge, featured, active, sort_order, description,
        features_json, promo_benefits_json, modes_allowed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of INITIAL_PACKAGES) {
      insertPkg.run(
        p.id,
        p.code,
        p.name,
        p.subtitle,
        p.priceFcfa,
        p.durationMinutes,
        p.durationLabel,
        p.sessionsCount,
        p.badge,
        p.featured ? 1 : 0,
        p.active ? 1 : 0,
        p.sortOrder,
        p.description,
        JSON.stringify(p.features),
        JSON.stringify(p.promoBenefits),
        p.modesAllowed
      );
    }
  }

  const adminCount = db.prepare("SELECT COUNT(*) as c FROM admin_users").get().c;
  if (adminCount === 0) {
    const defaultEmail = (process.env.ADMIN_EMAIL || "admin@ocdlive.org").toLowerCase().trim();
    const defaultPass = process.env.ADMIN_PASSWORD || "OcdLive2026!";
    db.prepare("INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)").run(
      defaultEmail,
      hashPassword(defaultPass),
      new Date().toISOString()
    );
  }

  /* --------------------------------------------------------------- Helpers */
  function getSettings() {
    const rows = db.prepare("SELECT key, value FROM settings").all();
    const map = {};
    for (const r of rows) {
      if (r.key === "session_secret") continue;
      try {
        map[r.key] = JSON.parse(r.value);
      } catch {
        map[r.key] = r.value;
      }
    }
    return {
      ...DEFAULT_SETTINGS,
      ...map,
      smtpConfigured: isSmtpConfigured(),
    };
  }

  function getSessionSecret() {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'session_secret'").get();
    return process.env.SESSION_SECRET || (row ? JSON.parse(row.value) : "ocd-default-secret");
  }

  function mapPackageRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      subtitle: row.subtitle,
      priceFcfa: row.price_fcfa,
      durationMinutes: row.duration_minutes,
      durationLabel: row.duration_label,
      sessionsCount: row.sessions_count,
      badge: row.badge,
      featured: Boolean(row.featured),
      active: Boolean(row.active),
      sortOrder: row.sort_order,
      description: row.description,
      features: JSON.parse(row.features_json || "[]"),
      promoBenefits: JSON.parse(row.promo_benefits_json || "[]"),
      modesAllowed: row.modes_allowed,
    };
  }

  function listPackages({ includeInactive = false } = {}) {
    const sql = includeInactive
      ? "SELECT * FROM packages ORDER BY sort_order ASC"
      : "SELECT * FROM packages WHERE active = 1 ORDER BY sort_order ASC";
    return db.prepare(sql).all().map(mapPackageRow);
  }

  function getPackage(id) {
    const row = db.prepare("SELECT * FROM packages WHERE id = ?").get(id);
    return mapPackageRow(row);
  }

  function mapBookingRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      reference: row.reference,
      participationMode: row.participation_mode,
      bookingDate: row.booking_date,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      packageId: row.package_id,
      packageName: row.package_name,
      amountFcfa: row.amount_fcfa,
      specialNeeds: row.special_needs,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      whatsapp: row.whatsapp,
      email: row.email,
      country: row.country,
      city: row.city,
      companyName: row.company_name,
      sector: row.sector,
      companyDescription: row.company_description,
      productsServices: row.products_services,
      physicalAddress: row.physical_address,
      businessPhone: row.business_phone,
      socialLinks: row.social_links,
      livePrepNotes: row.live_prep_notes,
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      assignedAssistant: row.assigned_assistant,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /* --------------------------------------------------- Availability Engine */
  function computeSlotsForDate(dateStr, durationMinutes = 90, excludeBookingId = null) {
    const settings = getSettings();
    const todayStr = new Date().toISOString().slice(0, 10);

    if (dateStr < settings.launchDate || dateStr < todayStr) {
      return { open: false, note: "Avant la date d'ouverture du calendrier", slots: [] };
    }

    const [y, m, d] = dateStr.split("-").map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

    const override = db.prepare("SELECT * FROM date_overrides WHERE date = ?").get(dateStr);
    if (override && override.status === "closed") {
      return { open: false, note: override.note || "Journée fermée", slots: [] };
    }

    const isNormallyOpen = settings.openDays.includes(weekday);
    if (!isNormallyOpen && (!override || override.status !== "open")) {
      return { open: false, note: "Jour de relâche hebdomadaire", slots: [] };
    }

    const customSlots = override ? JSON.parse(override.custom_slots_json || "[]") : [];
    const baseStarts = customSlots.length > 0 ? customSlots : settings.slotTemplates;

    const activeBookings = excludeBookingId
      ? db
          .prepare(
            "SELECT start_time, end_time FROM bookings WHERE booking_date = ? AND status != 'cancelled' AND id != ?"
          )
          .all(dateStr, excludeBookingId)
      : db
          .prepare("SELECT start_time, end_time FROM bookings WHERE booking_date = ? AND status != 'cancelled'")
          .all(dateStr);

    const blocks = db
      .prepare("SELECT start_time, end_time, reason FROM blocked_slots WHERE date = ?")
      .all(dateStr);

    const slots = [];
    for (const startTime of baseStarts) {
      const startMin = timeToMinutes(startTime);
      const endMin = startMin + durationMinutes;
      // Ne pas dépasser 23h00
      if (endMin > 23 * 60) continue;
      const endTime = minutesToTime(endMin);

      const hitsBooking = activeBookings.some((b) =>
        intervalsOverlap(startMin, endMin, timeToMinutes(b.start_time), timeToMinutes(b.end_time))
      );
      const hitsBlock = blocks.some((bl) =>
        intervalsOverlap(startMin, endMin, timeToMinutes(bl.start_time), timeToMinutes(bl.end_time))
      );

      if (hitsBooking) {
        slots.push({ startTime, endTime, durationMinutes, available: false, reason: "booked" });
      } else if (hitsBlock) {
        slots.push({ startTime, endTime, durationMinutes, available: false, reason: "booked" });
      } else {
        slots.push({ startTime, endTime, durationMinutes, available: true });
      }
    }

    return {
      open: slots.length > 0,
      note: override?.note || "",
      slots,
    };
  }

  function getMonthAvailability(monthStr, packageId = "business") {
    const pkg = getPackage(packageId) || INITIAL_PACKAGES[1];
    const durationMinutes = pkg.durationMinutes;
    const settings = getSettings();

    const [year, month] = monthStr.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const result = computeSlotsForDate(dateStr, durationMinutes);
      if (!result.open) {
        days.push({
          date: dateStr,
          state: "unavailable",
          totalSlots: 0,
          availableSlots: 0,
          bookedSlots: 0,
          note: result.note,
        });
        continue;
      }
      const totalSlots = result.slots.length;
      const availableSlots = result.slots.filter((s) => s.available).length;
      const bookedSlots = totalSlots - availableSlots;

      let state = "available";
      if (availableSlots === 0) state = "booked";
      else if (bookedSlots > 0) state = "partial";

      days.push({
        date: dateStr,
        state,
        totalSlots,
        availableSlots,
        bookedSlots,
        note: result.note,
      });
    }

    return {
      month: monthStr,
      launchDate: settings.launchDate,
      packageId: pkg.id,
      durationMinutes,
      days,
    };
  }

  /* ------------------------------------------ Transactional Booking Engine */
  function validateBookingPayload(input) {
    const errors = {};
    if (!["presentiel", "distanciel"].includes(input.participationMode)) {
      errors.participationMode = "Choisissez le mode de participation (Présentiel ou À distance).";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.bookingDate || "")) {
      errors.bookingDate = "Sélectionnez une date valide dans le calendrier.";
    }
    if (!/^\d{2}:\d{2}$/.test(input.startTime || "")) {
      errors.startTime = "Sélectionnez un créneau horaire.";
    }
    if (!input.packageId) {
      errors.packageId = "Sélectionnez un forfait commercial.";
    }
    if (!String(input.firstName || "").trim()) errors.firstName = "Indiquez votre prénom.";
    if (!String(input.lastName || "").trim()) errors.lastName = "Indiquez votre nom.";
    if (!String(input.phone || "").trim()) errors.phone = "Indiquez votre numéro de téléphone.";
    if (!String(input.whatsapp || "").trim()) errors.whatsapp = "Indiquez votre numéro WhatsApp.";
    const email = String(input.email || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Indiquez une adresse e-mail valide.";
    }
    if (!String(input.country || "").trim()) errors.country = "Sélectionnez votre pays.";
    if (!String(input.city || "").trim()) errors.city = "Indiquez votre ville.";
    if (!String(input.companyName || "").trim()) {
      errors.companyName = "Indiquez le nom de votre entreprise ou activité.";
    }
    if (!String(input.sector || "").trim()) errors.sector = "Sélectionnez votre secteur d'activité.";
    if (!String(input.companyDescription || "").trim()) {
      errors.companyDescription = "Présentez brièvement votre entreprise.";
    }
    if (!String(input.productsServices || "").trim()) {
      errors.productsServices = "Précisez les produits ou services à présenter pendant le live.";
    }
    return errors;
  }

  async function createBooking(input) {
    const errors = validateBookingPayload(input);
    if (Object.keys(errors).length > 0) {
      const err = new Error("Certains champs obligatoires sont manquants ou invalides.");
      err.statusCode = 400;
      err.fields = errors;
      throw err;
    }

    const pkg = getPackage(input.packageId);
    if (!pkg || !pkg.active) {
      const err = new Error("Le forfait sélectionné n'est plus disponible.");
      err.statusCode = 400;
      throw err;
    }
    if (pkg.modesAllowed !== "both" && pkg.modesAllowed !== input.participationMode) {
      const err = new Error("Ce forfait n'est pas compatible avec le mode de participation choisi.");
      err.statusCode = 400;
      throw err;
    }

    let createdBooking;
    const settings = getSettings();

    // Transaction atomique anti-double-réservation
    db.exec("BEGIN IMMEDIATE;");
    try {
      const dayCheck = computeSlotsForDate(input.bookingDate, pkg.durationMinutes);
      const matchingSlot = dayCheck.slots.find((s) => s.startTime === input.startTime);

      if (!dayCheck.open || !matchingSlot || !matchingSlot.available) {
        const conflict = new Error(
          "Ce créneau vient d'être réservé ou n'est plus disponible. Veuillez choisir un autre horaire."
        );
        conflict.statusCode = 409;
        throw conflict;
      }

      const compactDate = input.bookingDate.replace(/-/g, "");
      let reference = "";
      for (let attempt = 0; attempt < 8; attempt++) {
        const suffix = String(crypto.randomInt(1000, 9999));
        const candidate = `OCD-${compactDate}-${suffix}`;
        const exists = db.prepare("SELECT 1 FROM bookings WHERE reference = ?").get(candidate);
        if (!exists) {
          reference = candidate;
          break;
        }
      }

      const now = new Date().toISOString();
      const assignedAssistant =
        input.participationMode === "distanciel"
          ? "Assistante des Lives OCD dédiée (Togo)"
          : "Assistante des Lives OCD (Plateau Bovann Shop)";

      const stmt = db.prepare(`
        INSERT INTO bookings (
          reference, participation_mode, booking_date, start_time, end_time,
          duration_minutes, package_id, package_name, amount_fcfa, special_needs,
          first_name, last_name, phone, whatsapp, email, country, city,
          company_name, sector, company_description, products_services,
          physical_address, business_phone, social_links, live_prep_notes,
          status, payment_status, assigned_assistant, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          'pending', 'unpaid', ?, ?, ?
        )
      `);

      const info = stmt.run(
        reference,
        input.participationMode,
        input.bookingDate,
        matchingSlot.startTime,
        matchingSlot.endTime,
        pkg.durationMinutes,
        pkg.id,
        pkg.name,
        pkg.priceFcfa,
        String(input.specialNeeds || "").trim(),
        String(input.firstName).trim(),
        String(input.lastName).trim(),
        String(input.phone).trim(),
        String(input.whatsapp).trim(),
        String(input.email).trim().toLowerCase(),
        String(input.country).trim(),
        String(input.city).trim(),
        String(input.companyName).trim(),
        String(input.sector).trim(),
        String(input.companyDescription).trim(),
        String(input.productsServices).trim(),
        String(input.physicalAddress || "").trim(),
        String(input.businessPhone || "").trim(),
        String(input.socialLinks || "").trim(),
        String(input.livePrepNotes || "").trim(),
        assignedAssistant,
        now,
        now
      );

      const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(info.lastInsertRowid);
      createdBooking = mapBookingRow(row);
      db.exec("COMMIT;");
    } catch (e) {
      try {
        db.exec("ROLLBACK;");
      } catch {
        /* ignore */
      }
      throw e;
    }

    // Notifications automatiques Admin + Participant
    const adminNotif = buildAdminNotification(createdBooking);
    const participantNotif = buildParticipantConfirmation(createdBooking, settings);

    const [adminMailRes, participantMailRes] = await Promise.all([
      dispatchEmailIfConfigured({
        to: settings.adminEmail,
        subject: adminNotif.subject,
        text: adminNotif.bodyText,
      }),
      dispatchEmailIfConfigured({
        to: createdBooking.email,
        subject: participantNotif.subject,
        text: participantNotif.bodyText,
      }),
    ]);

    const insertNotif = db.prepare(`
      INSERT INTO notifications (
        booking_id, booking_reference, recipient_type, recipient_email,
        subject, summary, body_text, delivery_status, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);
    const now = new Date().toISOString();
    insertNotif.run(
      createdBooking.id,
      createdBooking.reference,
      "admin",
      settings.adminEmail,
      adminNotif.subject,
      adminNotif.summary,
      adminNotif.bodyText,
      adminMailRes.status,
      now
    );
    insertNotif.run(
      createdBooking.id,
      createdBooking.reference,
      "participant",
      createdBooking.email,
      participantNotif.subject,
      participantNotif.summary,
      participantNotif.bodyText,
      participantMailRes.status,
      now
    );

    return {
      booking: createdBooking,
      confirmationText: participantNotif.bodyText,
    };
  }

  function lookupBookingPublic(reference, contactCheck) {
    const ref = String(reference || "").trim().toUpperCase();
    const check = String(contactCheck || "").trim().toLowerCase();
    if (!ref || !check) return null;
    const row = db.prepare("SELECT * FROM bookings WHERE reference = ?").get(ref);
    if (!row) return null;
    const digits = (s) => String(s || "").replace(/\D/g, "");
    const emailMatches = row.email.toLowerCase() === check;
    const checkDigits = digits(check);
    const phoneMatches =
      checkDigits.length >= 6 &&
      (digits(row.phone).endsWith(checkDigits) || digits(row.whatsapp).endsWith(checkDigits));
    if (!emailMatches && !phoneMatches) return null;
    return mapBookingRow(row);
  }

  function getBookingByReference(reference) {
    const row = db
      .prepare("SELECT * FROM bookings WHERE reference = ?")
      .get(String(reference || "").trim().toUpperCase());
    return mapBookingRow(row);
  }

  /* ------------------------------------------------------- Admin Functions */
  function authenticateAdmin(email, password) {
    const normalized = String(email || "").trim().toLowerCase();
    const user = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(normalized);
    if (!user) return null;
    if (!verifyPassword(String(password || ""), user.password_hash)) return null;
    return { email: user.email };
  }

  function updateAdminPassword(email, currentPassword, newPassword) {
    const user = authenticateAdmin(email, currentPassword);
    if (!user) {
      const err = new Error("Mot de passe actuel incorrect.");
      err.statusCode = 400;
      throw err;
    }
    if (!newPassword || String(newPassword).length < 8) {
      const err = new Error("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      err.statusCode = 400;
      throw err;
    }
    db.prepare("UPDATE admin_users SET password_hash = ? WHERE email = ?").run(
      hashPassword(newPassword),
      user.email
    );
  }

  function listBookingsAdmin(filters = {}) {
    const clauses = [];
    const params = [];
    if (filters.status && filters.status !== "all") {
      clauses.push("status = ?");
      params.push(filters.status);
    }
    if (filters.mode && filters.mode !== "all") {
      clauses.push("participation_mode = ?");
      params.push(filters.mode);
    }
    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      clauses.push("payment_status = ?");
      params.push(filters.paymentStatus);
    }
    if (filters.country && filters.country !== "all") {
      clauses.push("country = ?");
      params.push(filters.country);
    }
    if (filters.search) {
      const q = `%${String(filters.search).trim()}%`;
      clauses.push(
        "(reference LIKE ? OR company_name LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ?)"
      );
      params.push(q, q, q, q, q, q, q);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = db
      .prepare(`SELECT * FROM bookings ${where} ORDER BY booking_date ASC, start_time ASC, id DESC`)
      .all(...params);
    return rows.map(mapBookingRow);
  }

  function updateBookingAdmin(id, patch) {
    const existingRow = db.prepare("SELECT * FROM bookings WHERE id = ?").get(Number(id));
    if (!existingRow) {
      const err = new Error("Réservation introuvable.");
      err.statusCode = 404;
      throw err;
    }
    const existing = mapBookingRow(existingRow);

    const nextDate = patch.bookingDate || existing.bookingDate;
    const nextStart = patch.startTime || existing.startTime;
    const nextStatus = patch.status || existing.status;

    let nextEnd = existing.endTime;
    // Si changement de date/heure ou réactivation d'une réservation annulée, vérifier les conflits
    if (
      nextStatus !== "cancelled" &&
      (nextDate !== existing.bookingDate ||
        nextStart !== existing.startTime ||
        existing.status === "cancelled")
    ) {
      const check = computeSlotsForDate(nextDate, existing.durationMinutes, existing.id);
      const startMin = timeToMinutes(nextStart);
      const endMin = startMin + existing.durationMinutes;
      nextEnd = minutesToTime(endMin);

      const otherBookings = db
        .prepare(
          "SELECT start_time, end_time FROM bookings WHERE booking_date = ? AND status != 'cancelled' AND id != ?"
        )
        .all(nextDate, existing.id);
      const conflict = otherBookings.some((b) =>
        intervalsOverlap(startMin, endMin, timeToMinutes(b.start_time), timeToMinutes(b.end_time))
      );
      if (conflict || !check.open) {
        const err = new Error("Conflit d'horaire : ce créneau est déjà occupé ou fermé.");
        err.statusCode = 409;
        throw err;
      }
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE bookings SET
        status = ?,
        payment_status = ?,
        payment_method = ?,
        assigned_assistant = ?,
        admin_notes = ?,
        booking_date = ?,
        start_time = ?,
        end_time = ?,
        amount_fcfa = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      nextStatus,
      patch.paymentStatus || existing.paymentStatus,
      patch.paymentMethod !== undefined ? String(patch.paymentMethod) : existing.paymentMethod,
      patch.assignedAssistant !== undefined ? String(patch.assignedAssistant) : existing.assignedAssistant,
      patch.adminNotes !== undefined ? String(patch.adminNotes) : existing.adminNotes,
      nextDate,
      nextStart,
      nextEnd,
      patch.amountFcfa !== undefined ? Number(patch.amountFcfa) : existing.amountFcfa,
      now,
      existing.id
    );

    return mapBookingRow(db.prepare("SELECT * FROM bookings WHERE id = ?").get(existing.id));
  }

  function savePackageAdmin(pkg) {
    const existing = getPackage(pkg.id);
    if (!existing) {
      const err = new Error("Forfait introuvable.");
      err.statusCode = 404;
      throw err;
    }
    db.prepare(`
      UPDATE packages SET
        name = ?,
        subtitle = ?,
        price_fcfa = ?,
        duration_minutes = ?,
        duration_label = ?,
        sessions_count = ?,
        badge = ?,
        featured = ?,
        active = ?,
        description = ?,
        features_json = ?,
        promo_benefits_json = ?,
        modes_allowed = ?
      WHERE id = ?
    `).run(
      String(pkg.name ?? existing.name).trim(),
      String(pkg.subtitle ?? existing.subtitle).trim(),
      Math.max(0, Number(pkg.priceFcfa ?? existing.priceFcfa)),
      Math.max(30, Number(pkg.durationMinutes ?? existing.durationMinutes)),
      String(pkg.durationLabel ?? existing.durationLabel).trim(),
      Math.max(1, Number(pkg.sessionsCount ?? existing.sessionsCount)),
      String(pkg.badge ?? existing.badge).trim(),
      (pkg.featured ?? existing.featured) ? 1 : 0,
      (pkg.active ?? existing.active) ? 1 : 0,
      String(pkg.description ?? existing.description).trim(),
      JSON.stringify(Array.isArray(pkg.features) ? pkg.features : existing.features),
      JSON.stringify(Array.isArray(pkg.promoBenefits) ? pkg.promoBenefits : existing.promoBenefits),
      pkg.modesAllowed ?? existing.modesAllowed,
      existing.id
    );
    return getPackage(existing.id);
  }

  function updateSettingsAdmin(patch) {
    const allowedKeys = [
      "launchDate",
      "openDays",
      "slotTemplates",
      "studioName",
      "studioAddress",
      "adminEmail",
      "whatsappNumber",
      "bookingHorizonMonths",
    ];
    const upsert = db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    for (const k of allowedKeys) {
      if (patch[k] !== undefined) {
        upsert.run(k, JSON.stringify(patch[k]));
      }
    }
    return getSettings();
  }

  function listCalendarAdmin() {
    const overrides = db
      .prepare("SELECT * FROM date_overrides ORDER BY date ASC")
      .all()
      .map((r) => ({
        date: r.date,
        status: r.status,
        customSlots: JSON.parse(r.custom_slots_json || "[]"),
        note: r.note,
      }));
    const blockedSlots = db
      .prepare("SELECT * FROM blocked_slots ORDER BY date ASC, start_time ASC")
      .all()
      .map((r) => ({
        id: r.id,
        date: r.date,
        startTime: r.start_time,
        endTime: r.end_time,
        reason: r.reason,
      }));
    return { overrides, blockedSlots };
  }

  function setDateOverrideAdmin({ date, status, customSlots = [], note = "" }) {
    if (!status || status === "default") {
      db.prepare("DELETE FROM date_overrides WHERE date = ?").run(date);
      return listCalendarAdmin();
    }
    db.prepare(`
      INSERT INTO date_overrides (date, status, custom_slots_json, note)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        status = excluded.status,
        custom_slots_json = excluded.custom_slots_json,
        note = excluded.note
    `).run(date, status, JSON.stringify(customSlots), String(note || ""));
    return listCalendarAdmin();
  }

  function addBlockedSlotAdmin({ date, startTime, endTime, reason = "" }) {
    db.prepare("INSERT INTO blocked_slots (date, start_time, end_time, reason) VALUES (?, ?, ?, ?)").run(
      date,
      startTime,
      endTime,
      String(reason || "Indisponibilité planning OCD Live")
    );
    return listCalendarAdmin();
  }

  function removeBlockedSlotAdmin(id) {
    db.prepare("DELETE FROM blocked_slots WHERE id = ?").run(Number(id));
    return listCalendarAdmin();
  }

  function listNotificationsAdmin() {
    return db
      .prepare("SELECT * FROM notifications ORDER BY id DESC LIMIT 150")
      .all()
      .map((r) => ({
        id: r.id,
        bookingId: r.booking_id,
        bookingReference: r.booking_reference,
        recipientType: r.recipient_type,
        recipientEmail: r.recipient_email,
        subject: r.subject,
        summary: r.summary,
        bodyText: r.body_text,
        deliveryStatus: r.delivery_status,
        isRead: Boolean(r.is_read),
        createdAt: r.created_at,
      }));
  }

  function markNotificationsReadAdmin(id) {
    if (id === "all") {
      db.prepare("UPDATE notifications SET is_read = 1 WHERE recipient_type = 'admin'").run();
    } else {
      db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(Number(id));
    }
  }

  function getDashboardStats() {
    const all = listBookingsAdmin();
    const active = all.filter((b) => b.status !== "cancelled");
    const todayStr = new Date().toISOString().slice(0, 10);

    const byCountryMap = new Map();
    const bySectorMap = new Map();
    const byPkgMap = new Map();

    let paidRevenueFcfa = 0;
    let expectedRevenueFcfa = 0;

    for (const b of active) {
      expectedRevenueFcfa += b.amountFcfa;
      if (b.paymentStatus === "paid") paidRevenueFcfa += b.amountFcfa;
      else if (b.paymentStatus === "deposit") paidRevenueFcfa += Math.round(b.amountFcfa * 0.5);

      byCountryMap.set(b.country, (byCountryMap.get(b.country) || 0) + 1);
      bySectorMap.set(b.sector, (bySectorMap.get(b.sector) || 0) + 1);
      byPkgMap.set(b.packageName, (byPkgMap.get(b.packageName) || 0) + 1);
    }

    const unreadNotifications = db
      .prepare("SELECT COUNT(*) as c FROM notifications WHERE recipient_type = 'admin' AND is_read = 0")
      .get().c;

    const upcomingLives = active
      .filter((b) => b.bookingDate >= todayStr && (b.status === "confirmed" || b.status === "pending"))
      .slice(0, 10);

    return {
      totalBookings: all.length,
      pendingBookings: all.filter((b) => b.status === "pending").length,
      confirmedBookings: all.filter((b) => b.status === "confirmed").length,
      cancelledBookings: all.filter((b) => b.status === "cancelled").length,
      completedBookings: all.filter((b) => b.status === "completed").length,
      presentielCount: active.filter((b) => b.participationMode === "presentiel").length,
      distancielCount: active.filter((b) => b.participationMode === "distanciel").length,
      paidRevenueFcfa,
      expectedRevenueFcfa,
      unreadNotifications,
      byCountry: [...byCountryMap.entries()]
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
      bySector: [...bySectorMap.entries()]
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count),
      byPackage: [...byPkgMap.entries()]
        .map(([packageName, count]) => ({ packageName, count }))
        .sort((a, b) => b.count - a.count),
      upcomingLives,
    };
  }

  function exportBookingsCsv() {
    const rows = listBookingsAdmin();
    const headers = [
      "Référence",
      "Date création",
      "Statut réservation",
      "Statut paiement",
      "Mode",
      "Date du live",
      "Début",
      "Fin",
      "Durée (min)",
      "Forfait",
      "Montant (FCFA)",
      "Prénom",
      "Nom",
      "Pays",
      "Ville",
      "Téléphone",
      "WhatsApp",
      "E-mail",
      "Entreprise",
      "Secteur",
      "Produits / Services",
      "Adresse physique",
      "Numéro pro",
      "Réseaux sociaux",
      "Assistante des Lives OCD",
      "Besoins particuliers",
      "Notes Admin",
    ];
    const esc = (val) => `"${String(val ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
    const lines = [headers.map(esc).join(";")];
    for (const b of rows) {
      lines.push(
        [
          b.reference,
          b.createdAt,
          bookingStatusLabel(b.status),
          paymentStatusLabel(b.paymentStatus),
          b.participationMode === "presentiel" ? "Présentiel Togo" : "À distance",
          b.bookingDate,
          b.startTime,
          b.endTime,
          b.durationMinutes,
          b.packageName,
          b.amountFcfa,
          b.firstName,
          b.lastName,
          b.country,
          b.city,
          b.phone,
          b.whatsapp,
          b.email,
          b.companyName,
          b.sector,
          b.productsServices,
          b.physicalAddress,
          b.businessPhone,
          b.socialLinks,
          b.assignedAssistant,
          b.specialNeeds,
          b.adminNotes,
        ]
          .map(esc)
          .join(";")
      );
    }
    // BOM UTF-8 + séparateur ";" pour ouverture directe parfaite dans Excel francophone
    return `\uFEFF${lines.join("\r\n")}`;
  }

  function listPublicUpcomingLives() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const rows = db
      .prepare(
        `SELECT * FROM bookings
         WHERE status = 'confirmed' AND booking_date >= ?
         ORDER BY booking_date ASC, start_time ASC
         LIMIT 8`
      )
      .all(todayStr);

    return rows.map((row) => ({
      reference: row.reference,
      participationMode: row.participation_mode,
      bookingDate: row.booking_date,
      startTime: row.start_time,
      endTime: row.end_time,
      packageName: row.package_name,
      country: row.country,
      city: row.city,
      companyName: row.company_name,
      sector: row.sector,
      productsServices: row.products_services,
      physicalAddress: row.physical_address,
      businessPhone: row.business_phone || row.phone,
      socialLinks: row.social_links,
    }));
  }

  function seedDemoBookingsAdmin() {
    const samples = [
      {
        reference: "OCD-DEMO-1202",
        participationMode: "presentiel",
        bookingDate: "2026-12-02",
        startTime: "11:00",
        endTime: "15:00",
        durationMinutes: 240,
        packageId: "immersion-4h",
        packageName: "Immersion 4 Heures",
        amountFcfa: 45000,
        specialNeeds: "Table de présentation chaude pour 40 portions",
        firstName: "Afi",
        lastName: "agbeko",
        phone: "+228 91 24 55 10",
        whatsapp: "+228 91 24 55 10",
        email: "afi@saveursdugolfe.tg",
        country: "Togo",
        city: "Lomé",
        companyName: "Saveurs du Golfe",
        sector: "Restauration, traiteur & agroalimentaire",
        companyDescription: "Restaurant et service traiteur spécialisé en grillades et plats togolais.",
        productsServices: "40 portions de poulet braisé, attiéké royal et jus de bissap maison",
        physicalAddress: "Boulevard du 13 Janvier, Lomé",
        businessPhone: "+228 91 24 55 10",
        socialLinks: "@saveursdugolfe",
        livePrepNotes: "Menu dégustation spécial direct à 3 500 FCFA",
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "Mixx by Yas (TMoney)",
        assignedAssistant: "Afi — Assistante des Lives OCD (Bovann Shop)",
      },
      {
        reference: "OCD-DEMO-1204",
        participationMode: "distanciel",
        bookingDate: "2026-12-04",
        startTime: "14:00",
        endTime: "18:00",
        durationMinutes: 240,
        packageId: "vip",
        packageName: "Formule VIP Projecteur",
        amountFcfa: 65000,
        specialNeeds: "Projection catalogue photos HD envoyées par WhatsApp",
        firstName: "Clarisse",
        lastName: "Ndjock",
        phone: "+237 699 42 18 05",
        whatsapp: "+237 699 42 18 05",
        email: "contact@maisonndjock.cm",
        country: "Cameroun",
        city: "Douala",
        companyName: "Maison Ndjock Couture",
        sector: "Mode, prêt-à-porter, tissus & accessoires",
        companyDescription: "Maison de création de tenues bazin brodé et ensembles de cérémonie avec expédition Afrique.",
        productsServices: "Collection fêtes de fin d'année : robes bazin riche, ensembles hommes et sacs",
        physicalAddress: "Rue des Palmiers, Bonapriso, Douala",
        businessPhone: "+237 699 42 18 05",
        socialLinks: "TikTok & Facebook : @maisonndjock",
        livePrepNotes: "Livraison DHL / bus sous 72h en Afrique centrale et de l'Ouest",
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "Orange Money",
        assignedAssistant: "Akouvi (Assistante OCD Togo)",
      },
      {
        reference: "OCD-DEMO-1207",
        participationMode: "distanciel",
        bookingDate: "2026-12-07",
        startTime: "16:00",
        endTime: "18:00",
        durationMinutes: 120,
        packageId: "visibilite",
        packageName: "Visibilité Renforcée",
        amountFcfa: 35000,
        specialNeeds: "Assistance pour montrer les avant/après clients",
        firstName: "Mahamat",
        lastName: "Saleh",
        phone: "+235 66 31 09 44",
        whatsapp: "+235 66 31 09 44",
        email: "direction@sahelkarite.td",
        country: "Tchad",
        city: "N'Djamena",
        companyName: "Sahel Cosmétiques Bio",
        sector: "Beauté, cosmétiques, coiffure & bien-être",
        companyDescription: "Gamme naturelle au beurre de karité pur et huiles précieuses du Tchad.",
        productsServices: "Coffrets soins capillaires, chantilly de karité et savons noirs",
        physicalAddress: "Avenue Charles de Gaulle, N'Djamena",
        businessPhone: "+235 66 31 09 44",
        socialLinks: "@sahelcosmetiques",
        livePrepNotes: "Recherche de distributeurs grossistes en Afrique de l'Ouest",
        status: "confirmed",
        paymentStatus: "deposit",
        paymentMethod: "Moov Money",
        assignedAssistant: "Essi — Assistante des Lives OCD (Togo)",
      },
      {
        reference: "OCD-DEMO-1209",
        participationMode: "distanciel",
        bookingDate: "2026-12-09",
        startTime: "09:00",
        endTime: "10:30",
        durationMinutes: 90,
        packageId: "business",
        packageName: "Formule Business",
        amountFcfa: 20000,
        specialNeeds: "Test audio 24h avant",
        firstName: "Thierry",
        lastName: "Koyamba",
        phone: "+236 75 50 81 20",
        whatsapp: "+236 75 50 81 20",
        email: "banguitech@exemple.cf",
        country: "Centrafrique",
        city: "Bangui",
        companyName: "Bangui Tech Store",
        sector: "Téléphones, informatique & électronique",
        companyDescription: "Boutique spécialisée smartphones neufs, accessoires solaires et ordinateurs.",
        productsServices: "Smartphones garantis 12 mois, kits powerbank solaires et écouteurs pro",
        physicalAddress: "Centre-ville PK0, Bangui",
        businessPhone: "+236 75 50 81 20",
        socialLinks: "Facebook : Bangui Tech Store",
        livePrepNotes: "Remise spéciale sur les kits solaires",
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: "",
        assignedAssistant: "Assistante des Lives OCD (à affecter)",
      },
      {
        reference: "OCD-DEMO-1211",
        participationMode: "distanciel",
        bookingDate: "2026-12-11",
        startTime: "14:00",
        endTime: "16:00",
        durationMinutes: 120,
        packageId: "partenaire",
        packageName: "Partenaire Mensuel",
        amountFcfa: 150000,
        specialNeeds: "1er passage sur les 4 lives mensuels",
        firstName: "Awa",
        lastName: "Kouassi",
        phone: "+225 07 48 12 90 33",
        whatsapp: "+225 07 48 12 90 33",
        email: "awa@atelierkente.ci",
        country: "Côte d'Ivoire",
        city: "Abidjan",
        companyName: "Atelier Kente & Cuir",
        sector: "Artisanat, décoration & mobilier",
        companyDescription: "Maroquinerie haut de gamme alliant cuir véritable et tissages traditionnels.",
        productsServices: "Sacs cabas, porte-documents professionnels et sandales artisanales",
        physicalAddress: "Cocody Angré 8e Tranche, Abidjan",
        businessPhone: "+225 07 48 12 90 33",
        socialLinks: "@atelierkentecuir",
        livePrepNotes: "Présentation des coffrets cadeaux d'entreprise",
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "Wave / Orange Money",
        assignedAssistant: "Akouvi (Assistante OCD Togo)",
      },
    ];

    const now = new Date().toISOString();
    const settings = getSettings();
    const insertBooking = db.prepare(`
      INSERT OR IGNORE INTO bookings (
        reference, participation_mode, booking_date, start_time, end_time,
        duration_minutes, package_id, package_name, amount_fcfa, special_needs,
        first_name, last_name, phone, whatsapp, email, country, city,
        company_name, sector, company_description, products_services,
        physical_address, business_phone, social_links, live_prep_notes,
        status, payment_status, payment_method, assigned_assistant, admin_notes,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, '[DEMO] Dossier exemple pour présentation',
        ?, ?
      )
    `);
    const insertNotif = db.prepare(`
      INSERT INTO notifications (
        booking_id, booking_reference, recipient_type, recipient_email,
        subject, summary, body_text, delivery_status, is_read, created_at
      ) VALUES (?, ?, 'admin', ?, ?, ?, ?, 'logged', 0, ?)
    `);

    let inserted = 0;
    for (const s of samples) {
      const res = insertBooking.run(
        s.reference,
        s.participationMode,
        s.bookingDate,
        s.startTime,
        s.endTime,
        s.durationMinutes,
        s.packageId,
        s.packageName,
        s.amountFcfa,
        s.specialNeeds,
        s.firstName,
        s.lastName[0].toUpperCase() + s.lastName.slice(1),
        s.phone,
        s.whatsapp,
        s.email,
        s.country,
        s.city,
        s.companyName,
        s.sector,
        s.companyDescription,
        s.productsServices,
        s.physicalAddress,
        s.businessPhone,
        s.socialLinks,
        s.livePrepNotes,
        s.status,
        s.paymentStatus,
        s.paymentMethod,
        s.assignedAssistant,
        now,
        now
      );
      if (res.changes > 0) {
        inserted += 1;
        const created = getBookingByReference(s.reference);
        const notif = buildAdminNotification(created);
        insertNotif.run(
          created.id,
          created.reference,
          settings.adminEmail,
          notif.subject,
          notif.summary,
          notif.bodyText,
          now
        );
      }
    }
    return { inserted };
  }

  function clearDemoBookingsAdmin() {
    db.prepare("DELETE FROM notifications WHERE booking_reference LIKE 'OCD-DEMO-%'").run();
    const res = db.prepare("DELETE FROM bookings WHERE reference LIKE 'OCD-DEMO-%'").run();
    return { deleted: res.changes };
  }

  return {
    db,
    getSettings,
    getSessionSecret,
    listPackages,
    getPackage,
    computeSlotsForDate,
    getMonthAvailability,
    createBooking,
    lookupBookingPublic,
    getBookingByReference,
    listPublicUpcomingLives,
    seedDemoBookingsAdmin,
    clearDemoBookingsAdmin,
    authenticateAdmin,
    updateAdminPassword,
    listBookingsAdmin,
    updateBookingAdmin,
    savePackageAdmin,
    updateSettingsAdmin,
    listCalendarAdmin,
    setDateOverrideAdmin,
    addBlockedSlotAdmin,
    removeBlockedSlotAdmin,
    listNotificationsAdmin,
    markNotificationsReadAdmin,
    getDashboardStats,
    exportBookingsCsv,
  };
}
