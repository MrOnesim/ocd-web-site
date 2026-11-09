import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Globe2,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageCircle,
  Package,
  Printer,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { Logo } from "@/components/Logo";
import { formatDualTimezoneSlot, formatFcfa } from "@/data/packages";
import {
  addAdminBlockedSlot,
  changeAdminPassword,
  clearAdminDemoBookings,
  deleteAdminBlockedSlot,
  fetchAdminBookings,
  fetchAdminNotifications,
  fetchAdminOverview,
  fetchAdminSession,
  loginAdmin,
  logoutAdmin,
  markAdminNotificationsRead,
  patchAdminBooking,
  saveAdminDateOverride,
  saveAdminPackage,
  saveAdminSettings,
  seedAdminDemoBookings,
} from "@/lib/api";
import { createWhatsAppUrl } from "@/lib/dossier";
import { downloadStoryPosterPng } from "@/lib/poster";
import type {
  BlockedSlotRecord,
  BookingRecord,
  BookingStatus,
  CommercialPackage,
  DashboardStats,
  DateOverrideRecord,
  NotificationRecord,
  PaymentStatus,
  PlatformSettings,
} from "@/types/booking";
import { cn } from "@/utils/cn";

type AdminTab =
  | "dashboard"
  | "bookings"
  | "schedule"
  | "calendar"
  | "packages"
  | "notifications"
  | "settings";

const DAY_LABELS = [
  { day: 1, label: "Lun" },
  { day: 2, label: "Mar" },
  { day: 3, label: "Mer" },
  { day: 4, label: "Jeu" },
  { day: 5, label: "Ven" },
  { day: 6, label: "Sam" },
  { day: 0, label: "Dim" },
];

function statusLabel(s: BookingStatus): string {
  switch (s) {
    case "confirmed":
      return "Confirmée";
    case "cancelled":
      return "Annulée";
    case "completed":
      return "Réalisée";
    default:
      return "En attente";
  }
}

function paymentLabel(p: PaymentStatus): string {
  switch (p) {
    case "paid":
      return "Payé";
    case "deposit":
      return "Acompte";
    case "refunded":
      return "Remboursé";
    default:
      return "En attente";
  }
}

export function AdminApp({ onBackToSite }: { onBackToSite: () => void }) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  // Login form
  const [loginEmail, setLoginEmail] = useState("admin@ocdlive.org");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [packages, setPackages] = useState<CommercialPackage[]>([]);
  const [overrides, setOverrides] = useState<DateOverrideRecord[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlotRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [runSheetBooking, setRunSheetBooking] = useState<BookingRecord | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");

  // Feedback banner
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Calendar forms
  const [ovDate, setOvDate] = useState("2026-12-25");
  const [ovStatus, setOvStatus] = useState<"open" | "closed" | "default">("closed");
  const [ovNote, setOvNote] = useState("");

  const [blkDate, setBlkDate] = useState("2026-12-10");
  const [blkStart, setBlkStart] = useState("09:00");
  const [blkEnd, setBlkEnd] = useState("10:30");
  const [blkReason, setBlkReason] = useState("Maintenance / briefing studio");

  // Settings edit state
  const [slotsText, setSlotsText] = useState("");

  // Password form
  const [currPwd, setCurrPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");

  const loadAllAdminData = useCallback(async () => {
    const [overview, bkRes, notifRes] = await Promise.all([
      fetchAdminOverview(),
      fetchAdminBookings(),
      fetchAdminNotifications(),
    ]);
    setStats(overview.stats);
    setSettings(overview.settings);
    setSlotsText(overview.settings.slotTemplates.join(", "));
    setPackages(overview.packages);
    setOverrides(overview.calendar.overrides);
    setBlockedSlots(overview.calendar.blockedSlots);
    setBookings(bkRes.bookings);
    setNotifications(notifRes.notifications);
  }, []);

  useEffect(() => {
    fetchAdminSession()
      .then((s) => {
        setAuthenticated(s.authenticated);
        if (s.email) setAdminEmail(s.email);
        if (s.authenticated) {
          return loadAllAdminData();
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, [loadAllAdminData]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await loginAdmin(loginEmail, loginPass);
      setAuthenticated(true);
      setAdminEmail(res.email);
      setLoginPass("");
      await loadAllAdminData();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Échec de connexion.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthenticated(false);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      if (filterMode !== "all" && b.participationMode !== filterMode) return false;
      if (filterPayment !== "all" && b.paymentStatus !== filterPayment) return false;
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const hay = `${b.reference} ${b.companyName} ${b.firstName} ${b.lastName} ${b.country} ${b.city} ${b.phone} ${b.email} ${b.sector}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, filterStatus, filterMode, filterPayment, filterSearch]);

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedBookingId) || null,
    [bookings, selectedBookingId]
  );

  const handleQuickBookingUpdate = async (id: number, patch: Partial<BookingRecord>) => {
    try {
      const res = await patchAdminBooking(id, patch);
      setBookings((prev) => prev.map((b) => (b.id === id ? res.booking : b)));
      setStats(res.stats);
      showToast(`Réservation ${res.booking.reference} mise à jour.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    }
  };

  const handleSavePackage = async (pkg: CommercialPackage) => {
    try {
      const res = await saveAdminPackage(pkg);
      setPackages(res.packages);
      showToast(`Forfait « ${res.package.name} » enregistré.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur sauvegarde forfait.");
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const parsedSlots = slotsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d{2}:\d{2}$/.test(s));
    if (parsedSlots.length === 0) {
      showToast("Indiquez au moins un créneau valide au format HH:MM (ex: 09:00, 14:00).");
      return;
    }
    try {
      const res = await saveAdminSettings({
        ...settings,
        slotTemplates: parsedSlots,
      });
      setSettings(res.settings);
      setSlotsText(res.settings.slotTemplates.join(", "));
      showToast("Paramètres globaux enregistrés.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur sauvegarde paramètres.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="admin-loading">
        <p>Chargement de l&apos;espace d&apos;administration OCD Live…</p>
      </div>
    );
  }

  /* ========================================================= LOGIN SCREEN */
  if (!authenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <button type="button" onClick={onBackToSite} className="admin-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Retour au site public OCD Live
          </button>
          <div className="admin-login-brand">
            <Logo decorative className="admin-logo" />
            <div>
              <h1>Administration OCD Live</h1>
              <p>Gestion des réservations, disponibilités, forfaits et notifications</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="field">
              <label htmlFor="adm-email" className="!text-ink">
                E-mail administrateur
              </label>
              <input
                id="adm-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="!border-line-strong !bg-paper !text-ink"
              />
            </div>
            <div className="field">
              <label htmlFor="adm-pass" className="!text-ink">
                Mot de passe
              </label>
              <input
                id="adm-pass"
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••••••"
                className="!border-line-strong !bg-paper !text-ink"
              />
            </div>
            {loginError && (
              <p className="field-error" role="alert">
                {loginError}
              </p>
            )}
            <button type="submit" disabled={loggingIn} className="button button-accent w-full">
              <Lock size={17} aria-hidden="true" />
              {loggingIn ? "Connexion…" : "Accéder au tableau de bord"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* =================================================== AUTHENTICATED SHELL */
  const unreadCount = stats?.unreadNotifications || 0;
  const hasDemoData = bookings.some((b) => b.reference.startsWith("OCD-DEMO-"));
  const scheduledLives = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const pastParticipants = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <Logo decorative className="admin-topbar-logo" />
          <div>
            <strong>OCD Live · Back-Office</strong>
            <span>{adminEmail}</span>
          </div>
        </div>
        <div className="admin-topbar-actions">
          {!hasDemoData ? (
            <button
              type="button"
              onClick={async () => {
                const res = await seedAdminDemoBookings();
                setStats(res.stats);
                setBookings(res.bookings);
                setNotifications(res.notifications);
                showToast(`${res.inserted} réservations de démonstration chargées.`);
              }}
              className="admin-btn-secondary"
            >
              <Sparkles size={15} aria-hidden="true" />
              Charger démo (5 pays)
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                const res = await clearAdminDemoBookings();
                setStats(res.stats);
                setBookings(res.bookings);
                setNotifications(res.notifications);
                setSelectedBookingId(null);
                showToast(`${res.deleted} dossiers de démonstration retirés.`);
              }}
              className="admin-btn-secondary"
            >
              <Trash2 size={15} aria-hidden="true" />
              Vider la démo
            </button>
          )}
          <button
            type="button"
            onClick={() => loadAllAdminData().then(() => showToast("Données actualisées."))}
            className="admin-btn-secondary"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Actualiser
          </button>
          <a href="/api/admin/bookings/export.csv" className="admin-btn-secondary">
            <Download size={15} aria-hidden="true" />
            Exporter CSV
          </a>
          <button type="button" onClick={onBackToSite} className="admin-btn-secondary">
            <ArrowLeft size={15} aria-hidden="true" />
            Voir le site
          </button>
          <button type="button" onClick={handleLogout} className="admin-btn-secondary">
            <LogOut size={15} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </header>

      {toast && (
        <div className="admin-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <div className="admin-body">
        <nav className="admin-nav" aria-label="Rubriques administration">
          {(
            [
              { id: "dashboard", label: "Vue générale", icon: LayoutDashboard },
              { id: "bookings", label: `Réservations (${bookings.length})`, icon: Users },
              { id: "schedule", label: "Lives & Historique", icon: Clock },
              { id: "calendar", label: "Dates & Disponibilités", icon: Calendar },
              { id: "packages", label: "Les 6 Forfaits", icon: Package },
              {
                id: "notifications",
                label: "Notifications",
                icon: Bell,
                badge: unreadCount,
              },
              { id: "settings", label: "Paramètres & Sécurité", icon: Settings },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn("admin-nav-item", activeTab === item.id && "is-active")}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{item.label}</span>
                {"badge" in item && item.badge ? (
                  <b className="admin-badge">{item.badge}</b>
                ) : null}
              </button>
            );
          })}
        </nav>

        <main className="admin-main">
          {/* 1. VUE GÉNÉRALE */}
          {activeTab === "dashboard" && stats && (
            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Tableau de bord général</h2>
                <p>Suivi en temps réel de l&apos;activité OCD Live (Togo, Afrique &amp; International).</p>
              </div>

              <div className="admin-kpi-grid">
                <div className="admin-kpi">
                  <span>Total réservations</span>
                  <strong>{stats.totalBookings}</strong>
                  <small>
                    {stats.pendingBookings} en attente · {stats.confirmedBookings} confirmées
                  </small>
                </div>
                <div className="admin-kpi">
                  <span>Modes de participation</span>
                  <strong>
                    {stats.presentielCount} Togo / {stats.distancielCount} Distance
                  </strong>
                  <small>Présentiel Bovann Shop vs À distance</small>
                </div>
                <div className="admin-kpi">
                  <span>Chiffre d&apos;affaires prévisionnel</span>
                  <strong>{formatFcfa(stats.expectedRevenueFcfa)} FCFA</strong>
                  <small>Encaissé : {formatFcfa(stats.paidRevenueFcfa)} FCFA</small>
                </div>
                <div className="admin-kpi">
                  <span>Notifications non lues</span>
                  <strong>{stats.unreadNotifications}</strong>
                  <small>Alertes inscriptions &amp; confirmations</small>
                </div>
              </div>

              <div className="admin-two-cols">
                <div className="admin-card">
                  <h3>Prochains lives programmés</h3>
                  {stats.upcomingLives.length === 0 ? (
                    <p className="admin-empty">Aucun live programmé pour le moment.</p>
                  ) : (
                    <ul className="admin-compact-list">
                      {stats.upcomingLives.map((b) => (
                        <li key={b.id}>
                          <div>
                            <strong>
                              {b.bookingDate} · {b.startTime}–{b.endTime}
                            </strong>
                            <span>
                              {b.companyName} ({b.city}, {b.country}) — {b.packageName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingId(b.id);
                              setActiveTab("bookings");
                            }}
                            className="admin-link-btn"
                          >
                            Ouvrir
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="admin-card">
                  <h3>Répartition par pays &amp; forfaits</h3>
                  {stats.byCountry.length === 0 ? (
                    <p className="admin-empty">Les statistiques par pays s&apos;afficheront dès les premières réservations.</p>
                  ) : (
                    <div className="admin-breakdown">
                      <div>
                        <h4>Pays représentés</h4>
                        <ul>
                          {stats.byCountry.map((c) => (
                            <li key={c.country}>
                              <span>{c.country}</span>
                              <strong>{c.count}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4>Forfaits choisis</h4>
                        <ul>
                          {stats.byPackage.map((p) => (
                            <li key={p.packageName}>
                              <span>{p.packageName}</span>
                              <strong>{p.count}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. GESTION DES RÉSERVATIONS & PARTICIPANTS */}
          {activeTab === "bookings" && (
            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Liste des réservations &amp; participants</h2>
                <p>Validez les créneaux, suivez les paiements et consultez les dossiers complets des entreprises.</p>
              </div>

              <div className="admin-filters">
                <div className="admin-search">
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="search"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Rechercher référence, entreprise, participant, pays, ville…"
                  />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="completed">Réalisées</option>
                  <option value="cancelled">Annulées</option>
                </select>
                <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
                  <option value="all">Présentiel &amp; Distance</option>
                  <option value="presentiel">Présentiel (Togo)</option>
                  <option value="distanciel">À distance (International)</option>
                </select>
                <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
                  <option value="all">Tous paiements</option>
                  <option value="unpaid">Non réglé</option>
                  <option value="deposit">Acompte reçu</option>
                  <option value="paid">Payé</option>
                </select>
              </div>

              <div className="admin-bookings-layout">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Réf. &amp; Date</th>
                        <th>Entreprise &amp; Participant</th>
                        <th>Pays / Mode</th>
                        <th>Forfait &amp; Paiement</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="admin-empty">
                            Aucune réservation ne correspond à ces critères.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr
                            key={b.id}
                            onClick={() => setSelectedBookingId(b.id)}
                            className={cn(selectedBookingId === b.id && "is-selected")}
                          >
                            <td>
                              <strong>{b.reference}</strong>
                              <small>
                                {b.bookingDate} · {b.startTime}–{b.endTime}
                              </small>
                            </td>
                            <td>
                              <strong>{b.companyName}</strong>
                              <small>
                                {b.firstName} {b.lastName} · {b.phone}
                              </small>
                            </td>
                            <td>
                              <strong>
                                {b.city}, {b.country}
                              </strong>
                              <small>
                                {b.participationMode === "presentiel" ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Building2 size={12} /> Présentiel Togo
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <Globe2 size={12} /> À distance
                                  </span>
                                )}
                              </small>
                            </td>
                            <td>
                              <strong>{formatFcfa(b.amountFcfa)} FCFA</strong>
                              <small>
                                {b.packageName} · {paymentLabel(b.paymentStatus)}
                              </small>
                            </td>
                            <td>
                              <span className={cn("status-pill", `is-${b.status}`)}>
                                {statusLabel(b.status)}
                              </span>
                            </td>
                            <td>
                              <div className="admin-row-btns" onClick={(e) => e.stopPropagation()}>
                                {b.status === "pending" && (
                                  <button
                                    type="button"
                                    title="Valider la réservation"
                                    onClick={() =>
                                      handleQuickBookingUpdate(b.id, { status: "confirmed" })
                                    }
                                    className="admin-icon-btn is-ok"
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                )}
                                {b.status !== "cancelled" && (
                                  <button
                                    type="button"
                                    title="Annuler et libérer le créneau"
                                    onClick={() =>
                                      handleQuickBookingUpdate(b.id, { status: "cancelled" })
                                    }
                                    className="admin-icon-btn is-danger"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {selectedBooking && (
                  <aside className="admin-detail-card">
                    <div className="admin-detail-head">
                      <div>
                        <span className="small-label">{selectedBooking.reference}</span>
                        <h3>{selectedBooking.companyName}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setRunSheetBooking(selectedBooking)}
                          className="admin-btn-secondary !py-1.5 !px-3 !text-xs"
                        >
                          <FileText size={14} aria-hidden="true" />
                          Fiche Direct
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadStoryPosterPng({
                              reference: selectedBooking.reference,
                              companyName: selectedBooking.companyName,
                              sector: selectedBooking.sector,
                              productsServices: selectedBooking.productsServices,
                              bookingDateLabel: selectedBooking.bookingDate,
                              startTime: selectedBooking.startTime,
                              endTime: selectedBooking.endTime,
                              country: selectedBooking.country,
                              city: selectedBooking.city,
                              phone: selectedBooking.businessPhone || selectedBooking.phone,
                              physicalAddress: selectedBooking.physicalAddress,
                              participationMode: selectedBooking.participationMode,
                              packageName: selectedBooking.packageName,
                            })
                          }
                          className="admin-btn-secondary !py-1.5 !px-3 !text-xs"
                        >
                          <ImageIcon size={14} aria-hidden="true" />
                          Story PNG
                        </button>
                        <a
                          href={createWhatsAppUrl(
                            selectedBooking.whatsapp || selectedBooking.phone,
                            `Bonjour ${selectedBooking.firstName}, ici l'équipe OCD Live concernant votre réservation ${selectedBooking.reference} (${selectedBooking.companyName}) du ${selectedBooking.bookingDate} de ${selectedBooking.startTime} à ${selectedBooking.endTime}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button-accent !py-1.5 !px-3 !text-xs"
                        >
                          <MessageCircle size={14} aria-hidden="true" />
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="admin-detail-controls">
                      <label>
                        Statut réservation
                        <select
                          value={selectedBooking.status}
                          onChange={(e) =>
                            handleQuickBookingUpdate(selectedBooking.id, {
                              status: e.target.value as BookingStatus,
                            })
                          }
                        >
                          <option value="pending">En attente de validation</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="completed">Réalisée (Historique)</option>
                          <option value="cancelled">Annulée (créneau libéré)</option>
                        </select>
                      </label>

                      <label>
                        Suivi du paiement
                        <select
                          value={selectedBooking.paymentStatus}
                          onChange={(e) =>
                            handleQuickBookingUpdate(selectedBooking.id, {
                              paymentStatus: e.target.value as PaymentStatus,
                            })
                          }
                        >
                          <option value="unpaid">En attente de règlement</option>
                          <option value="deposit">Acompte reçu</option>
                          <option value="paid">Payé intégralement</option>
                          <option value="refunded">Remboursé</option>
                        </select>
                      </label>

                      <label>
                        Mode de paiement
                        <input
                          type="text"
                          defaultValue={selectedBooking.paymentMethod}
                          placeholder="TMoney, Flooz, Orange Money, Espèces…"
                          onBlur={(e) =>
                            handleQuickBookingUpdate(selectedBooking.id, {
                              paymentMethod: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        Assistante des lives OCD attitrée
                        <input
                          type="text"
                          defaultValue={selectedBooking.assignedAssistant}
                          onBlur={(e) =>
                            handleQuickBookingUpdate(selectedBooking.id, {
                              assignedAssistant: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        Notes internes administration
                        <textarea
                          rows={2}
                          defaultValue={selectedBooking.adminNotes}
                          placeholder="Suivi briefing, acompte, particularités…"
                          onBlur={(e) =>
                            handleQuickBookingUpdate(selectedBooking.id, {
                              adminNotes: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>

                    <dl className="admin-detail-dl">
                      <div>
                        <dt>Participant</dt>
                        <dd>
                          {selectedBooking.firstName} {selectedBooking.lastName}
                        </dd>
                      </div>
                      <div>
                        <dt>Pays &amp; Ville</dt>
                        <dd>
                          {selectedBooking.city}, {selectedBooking.country}
                        </dd>
                      </div>
                      <div>
                        <dt>Téléphone / WhatsApp</dt>
                        <dd>
                          {selectedBooking.phone} / {selectedBooking.whatsapp}
                        </dd>
                      </div>
                      <div>
                        <dt>E-mail</dt>
                        <dd>{selectedBooking.email}</dd>
                      </div>
                      <div>
                        <dt>Secteur</dt>
                        <dd>{selectedBooking.sector}</dd>
                      </div>
                      <div>
                        <dt>Produits / Services</dt>
                        <dd>{selectedBooking.productsServices}</dd>
                      </div>
                      <div>
                        <dt>Description entreprise</dt>
                        <dd>{selectedBooking.companyDescription}</dd>
                      </div>
                      <div>
                        <dt>Adresse physique</dt>
                        <dd>{selectedBooking.physicalAddress || "—"}</dd>
                      </div>
                      <div>
                        <dt>Numéro pro à diffuser</dt>
                        <dd>{selectedBooking.businessPhone || selectedBooking.phone}</dd>
                      </div>
                      <div>
                        <dt>Réseaux sociaux</dt>
                        <dd>{selectedBooking.socialLinks || "—"}</dd>
                      </div>
                      <div>
                        <dt>Préparation &amp; besoins</dt>
                        <dd>
                          {selectedBooking.livePrepNotes || "—"} /{" "}
                          {selectedBooking.specialNeeds || "—"}
                        </dd>
                      </div>
                    </dl>
                  </aside>
                )}
              </div>
            </div>
          )}

          {/* 3. LIVES PROGRAMMÉS & HISTORIQUE */}
          {activeTab === "schedule" && (
            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Planning des lives programmés &amp; historique</h2>
                <p>Vue opérationnelle pour les assistantes des lives OCD (sur place chez Bovann Shop au Togo et en co-animation à distance).</p>
              </div>

              <div className="admin-two-cols">
                <div className="admin-card">
                  <h3>Lives à venir ({scheduledLives.length})</h3>
                  {scheduledLives.length === 0 ? (
                    <p className="admin-empty">Aucun live programmé.</p>
                  ) : (
                    <ul className="admin-compact-list">
                      {scheduledLives.map((b) => (
                        <li key={b.id}>
                          <div>
                            <strong>
                              {b.bookingDate} · {b.startTime}–{b.endTime} ({b.packageName})
                            </strong>
                            <span>
                              {b.companyName} — {b.firstName} {b.lastName} ({b.city}, {b.country})
                            </span>
                            <small>
                              {b.participationMode === "presentiel"
                                ? "Plateau Bovann Shop Togo"
                                : `À distance · ${b.assignedAssistant}`}
                            </small>
                          </div>
                          <span className={cn("status-pill", `is-${b.status}`)}>
                            {statusLabel(b.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="admin-card">
                  <h3>Historique &amp; annulations ({pastParticipants.length})</h3>
                  {pastParticipants.length === 0 ? (
                    <p className="admin-empty">Aucun historique archivé pour le moment.</p>
                  ) : (
                    <ul className="admin-compact-list">
                      {pastParticipants.map((b) => (
                        <li key={b.id}>
                          <div>
                            <strong>
                              {b.bookingDate} — {b.companyName} ({b.country})
                            </strong>
                            <span>
                              {b.firstName} {b.lastName} · {formatFcfa(b.amountFcfa)} FCFA
                            </span>
                          </div>
                          <span className={cn("status-pill", `is-${b.status}`)}>
                            {statusLabel(b.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. GESTION DES DATES, HORAIRES & DISPONIBILITÉS */}
          {activeTab === "calendar" && settings && (
            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Gestion du calendrier, des dates et des horaires</h2>
                <p>Pilotez l&apos;ouverture du calendrier (1er décembre), les horaires types, les jours fériés et les blocages de créneaux.</p>
              </div>

              <div className="admin-two-cols">
                <form onSubmit={handleSaveSettings} className="admin-card admin-form-stack">
                  <h3>Ouverture générale &amp; créneaux types</h3>
                  <label>
                    Date officielle d&apos;ouverture des réservations
                    <input
                      type="date"
                      value={settings.launchDate}
                      onChange={(e) => setSettings({ ...settings, launchDate: e.target.value })}
                    />
                  </label>

                  <div>
                    <span className="admin-label">Jours ouverts chaque semaine</span>
                    <div className="admin-days-row">
                      {DAY_LABELS.map((d) => {
                        const checked = settings.openDays.includes(d.day);
                        return (
                          <button
                            key={d.day}
                            type="button"
                            onClick={() => {
                              const next = checked
                                ? settings.openDays.filter((x) => x !== d.day)
                                : [...settings.openDays, d.day];
                              setSettings({ ...settings, openDays: next });
                            }}
                            className={cn("admin-day-chip", checked && "is-on")}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label>
                    Heures de début proposées (séparées par une virgule)
                    <input
                      type="text"
                      value={slotsText}
                      onChange={(e) => setSlotsText(e.target.value)}
                      placeholder="09:00, 11:00, 14:00, 16:00, 18:30"
                    />
                  </label>

                  <button type="submit" className="button button-accent">
                    Enregistrer la grille horaire
                  </button>
                </form>

                <div className="admin-card admin-form-stack">
                  <h3>Bloquer un créneau horaire spécifique</h3>
                  <div className="form-row">
                    <label>
                      Date
                      <input
                        type="date"
                        value={blkDate}
                        onChange={(e) => setBlkDate(e.target.value)}
                      />
                    </label>
                    <label>
                      Début
                      <input
                        type="time"
                        value={blkStart}
                        onChange={(e) => setBlkStart(e.target.value)}
                      />
                    </label>
                    <label>
                      Fin
                      <input
                        type="time"
                        value={blkEnd}
                        onChange={(e) => setBlkEnd(e.target.value)}
                      />
                    </label>
                  </div>
                  <label>
                    Motif
                    <input
                      type="text"
                      value={blkReason}
                      onChange={(e) => setBlkReason(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await addAdminBlockedSlot({
                        date: blkDate,
                        startTime: blkStart,
                        endTime: blkEnd,
                        reason: blkReason,
                      });
                      setBlockedSlots(res.calendar.blockedSlots);
                      showToast("Créneau verrouillé dans le calendrier.");
                    }}
                    className="admin-btn-secondary"
                  >
                    Bloquer ce créneau
                  </button>

                  <h4>Créneaux verrouillés ({blockedSlots.length})</h4>
                  <ul className="admin-compact-list">
                    {blockedSlots.map((b) => (
                      <li key={b.id}>
                        <span>
                          <strong>{b.date}</strong> · {b.startTime}–{b.endTime} ({b.reason})
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await deleteAdminBlockedSlot(b.id);
                            setBlockedSlots(res.calendar.blockedSlots);
                            showToast("Créneau libéré.");
                          }}
                          className="admin-icon-btn is-danger"
                          title="Libérer ce créneau"
                        >
                          <Trash2 size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="admin-card admin-form-stack">
                <h3>Ouvrir ou fermer une date exceptionnelle</h3>
                <div className="form-row">
                  <label>
                    Date
                    <input
                      type="date"
                      value={ovDate}
                      onChange={(e) => setOvDate(e.target.value)}
                    />
                  </label>
                  <label>
                    Statut exceptionnel
                    <select
                      value={ovStatus}
                      onChange={(e) =>
                        setOvStatus(e.target.value as "open" | "closed" | "default")
                      }
                    >
                      <option value="closed">Journée fermée / indisponible</option>
                      <option value="open">Journée exceptionnellement ouverte</option>
                      <option value="default">Rétablir la règle normale</option>
                    </select>
                  </label>
                  <label>
                    Note interne / publique
                    <input
                      type="text"
                      value={ovNote}
                      onChange={(e) => setOvNote(e.target.value)}
                      placeholder="Ex. Jour férié / Spécial Noël"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await saveAdminDateOverride({
                      date: ovDate,
                      status: ovStatus,
                      note: ovNote,
                    });
                    setOverrides(res.calendar.overrides);
                    showToast("Exception de calendrier enregistrée.");
                  }}
                  className="admin-btn-secondary"
                >
                  Appliquer sur cette date
                </button>
                {overrides.length > 0 && (
                  <ul className="admin-compact-list">
                    {overrides.map((o) => (
                      <li key={o.date}>
                        <span>
                          <strong>{o.date}</strong> —{" "}
                          {o.status === "closed" ? "Fermée" : "Ouverte"} {o.note ? `(${o.note})` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 5. GESTION DES 6 FORFAITS COMMERCIAUX */}
          {activeTab === "packages" && (
            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Administration des 6 packages commerciaux</h2>
                <p>Modifiez librement les tarifs, durées, intitulés et avantages : les changements s&apos;appliquent instantanément sur le site.</p>
              </div>

              <div className="admin-packages-grid">
                {packages.map((pkg) => (
                  <PackageEditorCard key={pkg.id} pkg={pkg} onSave={handleSavePackage} />
                ))}
              </div>
            </div>
          )}

          {/* 6. CENTRE DE NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="admin-section">
              <div className="admin-section-head">
                <div>
                  <h2>Journal des notifications automatiques</h2>
                  <p>Toutes les alertes envoyées à l&apos;administration OCD Live et les confirmations participants.</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await markAdminNotificationsRead("all");
                      setNotifications(res.notifications);
                      if (stats) setStats({ ...stats, unreadNotifications: res.unreadCount });
                    }}
                    className="admin-btn-secondary"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="admin-empty">Aucune notification générée pour le moment.</p>
              ) : (
                <div className="admin-notif-list">
                  {notifications.map((n) => (
                    <details
                      key={n.id}
                      className={cn(
                        "admin-notif-item",
                        n.recipientType === "admin" && !n.isRead && "is-unread"
                      )}
                      onToggle={async (e) => {
                        if ((e.currentTarget as HTMLDetailsElement).open && !n.isRead) {
                          const res = await markAdminNotificationsRead(n.id);
                          setNotifications(res.notifications);
                          if (stats) setStats({ ...stats, unreadNotifications: res.unreadCount });
                        }
                      }}
                    >
                      <summary>
                        <div>
                          <span className="admin-notif-tag">
                            {n.recipientType === "admin" ? "ALERTE ADMIN" : "CONFIRMATION PARTICIPANT"} ·{" "}
                            {n.bookingReference}
                          </span>
                          <strong>{n.summary}</strong>
                        </div>
                        <small>{new Date(n.createdAt).toLocaleString("fr-FR")}</small>
                      </summary>
                      <pre className="admin-notif-body">{n.bodyText}</pre>
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. PARAMÈTRES STUDIO & SÉCURITÉ */}
          {activeTab === "settings" && settings && (
            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Paramètres officiels &amp; sécurité</h2>
                <p>Coordonnées de l&apos;espace Bovann Shop, e-mail de réception des notifications et mot de passe administrateur.</p>
              </div>

              <div className="admin-two-cols">
                <form onSubmit={handleSaveSettings} className="admin-card admin-form-stack">
                  <h3>Coordonnées OCD Live &amp; Bovann Shop</h3>
                  <label>
                    Nom du studio présentiel (Togo)
                    <input
                      type="text"
                      value={settings.studioName}
                      onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                    />
                  </label>
                  <label>
                    Adresse complète du studio
                    <input
                      type="text"
                      value={settings.studioAddress}
                      onChange={(e) => setSettings({ ...settings, studioAddress: e.target.value })}
                    />
                  </label>
                  <label>
                    E-mail de notification administration
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    />
                  </label>
                  <label>
                    Numéro WhatsApp officiel
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    />
                  </label>
                  <p className="text-xs text-muted">
                    Statut serveur e-mail SMTP :{" "}
                    <strong>
                      {settings.smtpConfigured
                        ? "Actif (envoi e-mail automatique + journal intégré)"
                        : "Journal intégré actif (configurez SMTP_HOST pour l'envoi e-mail externe)"}
                    </strong>
                  </p>
                  <button type="submit" className="button button-accent">
                    Enregistrer les coordonnées
                  </button>
                </form>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPwdMessage("");
                    try {
                      await changeAdminPassword(currPwd, newPwd);
                      setCurrPwd("");
                      setNewPwd("");
                      setPwdMessage("Mot de passe administrateur mis à jour avec succès.");
                    } catch (err) {
                      setPwdMessage(err instanceof Error ? err.message : "Erreur.");
                    }
                  }}
                  className="admin-card admin-form-stack"
                >
                  <h3>Modifier le mot de passe administrateur</h3>
                  <label>
                    Mot de passe actuel
                    <input
                      type="password"
                      required
                      value={currPwd}
                      onChange={(e) => setCurrPwd(e.target.value)}
                    />
                  </label>
                  <label>
                    Nouveau mot de passe (min. 8 caractères)
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                    />
                  </label>
                  {pwdMessage && <p className="text-sm font-medium">{pwdMessage}</p>}
                  <button type="submit" className="admin-btn-secondary">
                    Mettre à jour le mot de passe
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALE FEUILLE DE ROUTE — ASSISTANTE DES LIVES OCD */}
      {runSheetBooking && (
        <Dialog
          onClose={() => setRunSheetBooking(null)}
          title={`Feuille de route Assistante Live OCD · ${runSheetBooking.reference}`}
        >
          <div className="runsheet-sheet">
            <div className="runsheet-header">
              <div>
                <p className="small-label text-accent-deep">
                  {runSheetBooking.participationMode === "presentiel"
                    ? "PRÉSENTIEL CHEZ BOVANN SHOP — TOGO"
                    : `DIRECT À DISTANCE (${runSheetBooking.country.toUpperCase()}) + ASSISTANTE DES LIVES OCD AU TOGO`}
                </p>
                <h3>{runSheetBooking.companyName}</h3>
                <p className="text-xs text-muted">{runSheetBooking.sector}</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="button button-accent !py-2 !px-4 !text-xs"
              >
                <Printer size={15} aria-hidden="true" />
                Imprimer la fiche
              </button>
            </div>

            {(() => {
              const tz = formatDualTimezoneSlot(
                runSheetBooking.startTime,
                runSheetBooking.endTime,
                runSheetBooking.country
              );
              return (
                <div className="runsheet-slot-bar">
                  <strong>Date : {runSheetBooking.bookingDate}</strong>
                  <span>{tz.togoLabel}</span>
                  {tz.localLabel && <span>• {tz.localLabel}</span>}
                  <span>Forfait : {runSheetBooking.packageName}</span>
                </div>
              );
            })()}

            <div className="runsheet-box">
              <h4>1. Pitch d&apos;ouverture prêt à lire à l&apos;antenne</h4>
              <p>
                « Bienvenue en direct sur <strong>House of Challenge</strong> ! Aujourd&apos;hui sur{" "}
                <strong>OCD Live</strong>, nous mettons sous les projecteurs{" "}
                <strong>{runSheetBooking.companyName}</strong>, située à{" "}
                <strong>
                  {runSheetBooking.city} ({runSheetBooking.country})
                </strong>
                , représentée par{" "}
                <strong>
                  {runSheetBooking.firstName} {runSheetBooking.lastName}
                </strong>
                . Restez connectés pour découvrir ses offres et noter toutes ses coordonnées ! »
              </p>
            </div>

            <div className="runsheet-box is-highlight">
              <h4>2. Coordonnées commerciales à lire &amp; épingler en commentaire</h4>
              <ul>
                <li>
                  <strong>Entreprise :</strong> {runSheetBooking.companyName}
                </li>
                <li>
                  <strong>Numéro à appeler / WhatsApp :</strong>{" "}
                  {runSheetBooking.businessPhone || runSheetBooking.phone} (WhatsApp :{" "}
                  {runSheetBooking.whatsapp})
                </li>
                <li>
                  <strong>Adresse / Ville :</strong>{" "}
                  {runSheetBooking.physicalAddress
                    ? `${runSheetBooking.physicalAddress}, `
                    : ""}
                  {runSheetBooking.city}, {runSheetBooking.country}
                </li>
                {runSheetBooking.socialLinks && (
                  <li>
                    <strong>Réseaux sociaux :</strong> {runSheetBooking.socialLinks}
                  </li>
                )}
              </ul>
            </div>

            <div className="runsheet-box">
              <h4>3. Produits, services &amp; arguments clés à présenter</h4>
              <p>
                <strong>Offres du direct :</strong> {runSheetBooking.productsServices}
              </p>
              <p className="mt-1">
                <strong>Présentation :</strong> {runSheetBooking.companyDescription}
              </p>
              {(runSheetBooking.livePrepNotes || runSheetBooking.specialNeeds) && (
                <p className="mt-1">
                  <strong>Notes prépa / besoins :</strong> {runSheetBooking.livePrepNotes || "—"} ·{" "}
                  {runSheetBooking.specialNeeds || "—"}
                </p>
              )}
            </div>

            <div className="runsheet-box">
              <h4>4. Assistante des lives OCD &amp; suivi</h4>
              <p>
                <strong>Assistante attitrée :</strong>{" "}
                {runSheetBooking.assignedAssistant || "À affecter"} ·{" "}
                <strong>Statut paiement :</strong> {paymentLabel(runSheetBooking.paymentStatus)}
              </p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function PackageEditorCard({
  pkg,
  onSave,
}: {
  pkg: CommercialPackage;
  onSave: (updated: CommercialPackage) => void;
}) {
  const [name, setName] = useState(pkg.name);
  const [subtitle, setSubtitle] = useState(pkg.subtitle);
  const [priceFcfa, setPriceFcfa] = useState(pkg.priceFcfa);
  const [durationMinutes, setDurationMinutes] = useState(pkg.durationMinutes);
  const [durationLabel, setDurationLabel] = useState(pkg.durationLabel);
  const [badge, setBadge] = useState(pkg.badge);
  const [active, setActive] = useState(pkg.active);
  const [featured, setFeatured] = useState(pkg.featured);
  const [featuresText, setFeaturesText] = useState(pkg.features.join("\n"));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...pkg,
          name,
          subtitle,
          priceFcfa: Number(priceFcfa),
          durationMinutes: Number(durationMinutes),
          durationLabel,
          badge,
          active,
          featured,
          features: featuresText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        });
      }}
      className="admin-card admin-form-stack"
    >
      <div className="flex items-center justify-between">
        <span className="small-label">{pkg.code}</span>
        <label className="inline-flex items-center gap-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Actif sur le site
        </label>
      </div>
      <label>
        Nom du forfait
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Sous-titre
        <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </label>
      <div className="form-row">
        <label>
          Tarif (FCFA)
          <input
            type="number"
            min={0}
            step={500}
            value={priceFcfa}
            onChange={(e) => setPriceFcfa(Number(e.target.value))}
          />
        </label>
        <label>
          Durée (min)
          <input
            type="number"
            min={30}
            step={30}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Libellé durée affiché
          <input
            type="text"
            value={durationLabel}
            onChange={(e) => setDurationLabel(e.target.value)}
          />
        </label>
        <label>
          Badge commercial
          <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} />
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-xs font-semibold">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        Mettre en avant (carte sombre recommandée)
      </label>
      <label>
        Prestations incluses (1 par ligne)
        <textarea
          rows={4}
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
        />
      </label>
      <button type="submit" className="button button-accent !py-2.5">
        Enregistrer ce forfait
      </button>
    </form>
  );
}
