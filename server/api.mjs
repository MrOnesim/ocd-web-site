import {
  checkLoginRateLimit,
  clearFailedLogin,
  clearSessionCookie,
  createSessionToken,
  getSessionFromRequest,
  recordFailedLogin,
  setSessionCookie,
} from "./auth.mjs";
import { openOcdStore } from "./db.mjs";
import { generateBookingIcs } from "./notifications.mjs";

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function readJsonBody(req, maxBytes = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(Object.assign(new Error("Requête trop volumineuse."), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("Corps JSON invalide."), { statusCode: 400 }));
      }
    });
    req.on("error", reject);
  });
}

export function createApiHandler(options = {}) {
  const store = openOcdStore(options.dbPath);

  async function handleApi(req, res) {
    const parsedUrl = new URL(req.url || "/", "http://localhost");
    const pathname = parsedUrl.pathname;
    const method = (req.method || "GET").toUpperCase();

    try {
      /* ===================================================== PUBLIC API === */
      if (method === "GET" && pathname === "/api/public/config") {
        const settings = store.getSettings();
        const packages = store.listPackages({ includeInactive: false });
        const upcomingLives = store.listPublicUpcomingLives();
        return sendJson(res, 200, {
          settings: {
            launchDate: settings.launchDate,
            openDays: settings.openDays,
            studioName: settings.studioName,
            studioAddress: settings.studioAddress,
            adminEmail: settings.adminEmail,
            whatsappNumber: settings.whatsappNumber,
            bookingHorizonMonths: settings.bookingHorizonMonths,
          },
          packages,
          upcomingLives,
        });
      }

      if (method === "GET" && pathname === "/api/public/availability") {
        const settings = store.getSettings();
        const month = parsedUrl.searchParams.get("month") || settings.launchDate.slice(0, 7);
        if (!/^\d{4}-\d{2}$/.test(month)) {
          return sendJson(res, 400, { error: "Format de mois invalide (attendu: YYYY-MM)." });
        }
        const packageId = parsedUrl.searchParams.get("packageId") || "business";
        const availability = store.getMonthAvailability(month, packageId);
        return sendJson(res, 200, availability);
      }

      if (method === "GET" && pathname === "/api/public/slots") {
        const date = parsedUrl.searchParams.get("date") || "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return sendJson(res, 400, { error: "Format de date invalide (attendu: YYYY-MM-DD)." });
        }
        const packageId = parsedUrl.searchParams.get("packageId") || "business";
        const pkg = store.getPackage(packageId);
        const duration = pkg ? pkg.durationMinutes : 90;
        const result = store.computeSlotsForDate(date, duration);
        return sendJson(res, 200, {
          date,
          packageId,
          durationMinutes: duration,
          open: result.open,
          note: result.note,
          slots: result.slots,
        });
      }

      if (method === "POST" && pathname === "/api/public/bookings") {
        const body = await readJsonBody(req);
        const result = await store.createBooking(body);
        return sendJson(res, 201, result);
      }

      if (method === "POST" && pathname === "/api/public/bookings/lookup") {
        const body = await readJsonBody(req);
        const found = store.lookupBookingPublic(body.reference, body.contact);
        if (!found) {
          return sendJson(res, 404, {
            error:
              "Aucune réservation trouvée avec cette référence et cet e-mail ou numéro de téléphone.",
          });
        }
        return sendJson(res, 200, { booking: found });
      }

      const icsMatch = pathname.match(/^\/api\/public\/bookings\/([A-Za-z0-9-]+)\/ics$/);
      if (method === "GET" && icsMatch) {
        const booking = store.getBookingByReference(icsMatch[1]);
        if (!booking) {
          return sendJson(res, 404, { error: "Réservation introuvable." });
        }
        const ics = generateBookingIcs(booking, store.getSettings());
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/calendar; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${booking.reference}.ics"`
        );
        res.end(ics);
        return;
      }

      /* ================================================= ADMIN AUTH API === */
      const secret = store.getSessionSecret();

      if (method === "POST" && pathname === "/api/admin/login") {
        const ip =
          String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
          req.socket?.remoteAddress ||
          "local";
        const rate = checkLoginRateLimit(ip);
        if (!rate.allowed) {
          return sendJson(res, 429, {
            error: `Trop de tentatives. Réessayez dans ${rate.retryAfterSeconds} secondes.`,
          });
        }
        const body = await readJsonBody(req);
        const user = store.authenticateAdmin(body.email, body.password);
        if (!user) {
          recordFailedLogin(ip);
          return sendJson(res, 401, { error: "Identifiants administrateur invalides." });
        }
        clearFailedLogin(ip);
        const token = createSessionToken({ email: user.email }, secret);
        setSessionCookie(res, token);
        return sendJson(res, 200, { authenticated: true, email: user.email });
      }

      if (method === "POST" && pathname === "/api/admin/logout") {
        clearSessionCookie(res);
        return sendJson(res, 200, { authenticated: false });
      }

      if (method === "GET" && pathname === "/api/admin/session") {
        const session = getSessionFromRequest(req, secret);
        if (!session) {
          return sendJson(res, 200, { authenticated: false });
        }
        return sendJson(res, 200, { authenticated: true, email: session.email });
      }

      /* =========================================== PROTECTED ADMIN API === */
      if (pathname.startsWith("/api/admin/")) {
        const session = getSessionFromRequest(req, secret);
        if (!session) {
          return sendJson(res, 401, { error: "Session administrateur expirée ou non connectée." });
        }

        if (method === "GET" && pathname === "/api/admin/overview") {
          return sendJson(res, 200, {
            stats: store.getDashboardStats(),
            settings: store.getSettings(),
            packages: store.listPackages({ includeInactive: true }),
            calendar: store.listCalendarAdmin(),
          });
        }

        if (method === "GET" && pathname === "/api/admin/bookings") {
          const bookings = store.listBookingsAdmin({
            status: parsedUrl.searchParams.get("status") || "all",
            mode: parsedUrl.searchParams.get("mode") || "all",
            paymentStatus: parsedUrl.searchParams.get("paymentStatus") || "all",
            country: parsedUrl.searchParams.get("country") || "all",
            search: parsedUrl.searchParams.get("search") || "",
          });
          return sendJson(res, 200, { bookings });
        }

        if (method === "GET" && pathname === "/api/admin/bookings/export.csv") {
          const csv = store.exportBookingsCsv();
          const dateTag = new Date().toISOString().slice(0, 10);
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/csv; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="OCD-Live-reservations-${dateTag}.csv"`
          );
          res.end(csv);
          return;
        }

        const bookingPatchMatch = pathname.match(/^\/api\/admin\/bookings\/(\d+)$/);
        if (method === "PATCH" && bookingPatchMatch) {
          const body = await readJsonBody(req);
          const updated = store.updateBookingAdmin(Number(bookingPatchMatch[1]), body);
          return sendJson(res, 200, { booking: updated, stats: store.getDashboardStats() });
        }

        const pkgMatch = pathname.match(/^\/api\/admin\/packages\/([a-z0-9-]+)$/);
        if (method === "PUT" && pkgMatch) {
          const body = await readJsonBody(req);
          const saved = store.savePackageAdmin({ ...body, id: pkgMatch[1] });
          return sendJson(res, 200, {
            package: saved,
            packages: store.listPackages({ includeInactive: true }),
          });
        }

        if (method === "PUT" && pathname === "/api/admin/settings") {
          const body = await readJsonBody(req);
          const settings = store.updateSettingsAdmin(body);
          return sendJson(res, 200, { settings });
        }

        if (method === "POST" && pathname === "/api/admin/calendar/override") {
          const body = await readJsonBody(req);
          const calendar = store.setDateOverrideAdmin(body);
          return sendJson(res, 200, { calendar });
        }

        if (method === "POST" && pathname === "/api/admin/calendar/block") {
          const body = await readJsonBody(req);
          const calendar = store.addBlockedSlotAdmin(body);
          return sendJson(res, 200, { calendar });
        }

        const blockDelMatch = pathname.match(/^\/api\/admin\/calendar\/block\/(\d+)$/);
        if (method === "DELETE" && blockDelMatch) {
          const calendar = store.removeBlockedSlotAdmin(Number(blockDelMatch[1]));
          return sendJson(res, 200, { calendar });
        }

        if (method === "GET" && pathname === "/api/admin/notifications") {
          return sendJson(res, 200, {
            notifications: store.listNotificationsAdmin(),
            unreadCount: store.getDashboardStats().unreadNotifications,
          });
        }

        if (method === "POST" && pathname === "/api/admin/notifications/read") {
          const body = await readJsonBody(req);
          store.markNotificationsReadAdmin(body.id || "all");
          return sendJson(res, 200, {
            notifications: store.listNotificationsAdmin(),
            unreadCount: store.getDashboardStats().unreadNotifications,
          });
        }

        if (method === "POST" && pathname === "/api/admin/password") {
          const body = await readJsonBody(req);
          store.updateAdminPassword(session.email, body.currentPassword, body.newPassword);
          return sendJson(res, 200, { ok: true });
        }

        if (method === "POST" && pathname === "/api/admin/demo/seed") {
          const result = store.seedDemoBookingsAdmin();
          return sendJson(res, 200, {
            ...result,
            stats: store.getDashboardStats(),
            bookings: store.listBookingsAdmin(),
            notifications: store.listNotificationsAdmin(),
          });
        }

        if (method === "DELETE" && pathname === "/api/admin/demo/clear") {
          const result = store.clearDemoBookingsAdmin();
          return sendJson(res, 200, {
            ...result,
            stats: store.getDashboardStats(),
            bookings: store.listBookingsAdmin(),
            notifications: store.listNotificationsAdmin(),
          });
        }
      }

      return sendJson(res, 404, { error: "Route API introuvable." });
    } catch (err) {
      const status = err.statusCode || 500;
      return sendJson(res, status, {
        error: err.message || "Erreur interne du serveur.",
        ...(err.fields ? { fields: err.fields } : {}),
      });
    }
  }

  return { handleApi, store };
}
