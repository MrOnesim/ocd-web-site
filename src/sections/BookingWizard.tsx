import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Globe2,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Tv,
} from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { Reveal, SectionLabel, SplitTitle, StepEdge } from "@/components/Primitives";
import { siteConfig } from "@/config/site";
import {
  BUSINESS_SECTORS,
  COUNTRIES,
  formatDualTimezoneSlot,
  formatEuroApprox,
  formatFcfa,
} from "@/data/packages";
import { downloadStoryPosterPng } from "@/lib/poster";
import {
  ApiError,
  fetchDateSlots,
  fetchMonthAvailability,
  lookupPublicBooking,
  submitPublicBooking,
} from "@/lib/api";
import { track } from "@/lib/analytics";
import { createWhatsAppUrl, downloadTextFile } from "@/lib/dossier";
import type {
  BookingRecord,
  CommercialPackage,
  DayAvailability,
  ParticipationMode,
  TimeSlotOption,
} from "@/types/booking";
import { cn } from "@/utils/cn";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const FRENCH_MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function formatHumanDate(dateStr: string): string {
  if (!dateStr) return "Non choisie";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return `${days[dt.getUTCDay()]} ${d === 1 ? "1er" : d} ${FRENCH_MONTH_NAMES[m - 1].toLowerCase()} ${y}`;
}

function addMonths(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
}

const STEP_LABELS = [
  { num: 1, title: "Type de live" },
  { num: 2, title: "Date" },
  { num: 3, title: "Horaire" },
  { num: 4, title: "Forfait" },
  { num: 5, title: "Informations" },
  { num: 6, title: "Confirmation" },
] as const;

const DRAFT_STORAGE_KEY = "ocd-live-booking-draft-v2";

export function BookingWizard({
  packages,
  launchDate,
  studioName,
  whatsappNumber,
  selectedMode,
  onModeChange,
  selectedPackageId,
  onPackageChange,
  lookupOpen,
  onCloseLookup,
  onOpenLookup,
}: {
  packages: CommercialPackage[];
  launchDate: string;
  studioName: string;
  whatsappNumber: string;
  selectedMode: ParticipationMode;
  onModeChange: (mode: ParticipationMode) => void;
  selectedPackageId: string;
  onPackageChange: (id: string) => void;
  lookupOpen: boolean;
  onCloseLookup: () => void;
  onOpenLookup: () => void;
}) {
  const initialMonth = (launchDate || "2026-12-01").slice(0, 7);
  const [step, setStep] = useState<number>(1);
  const [currentMonth, setCurrentMonth] = useState<string>(initialMonth);
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const [bookingDate, setBookingDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startTime, setStartTime] = useState<string>("");

  // Participant & Business fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("Togo");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("+228 ");
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [whatsapp, setWhatsapp] = useState("+228 ");
  const [email, setEmail] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState<string>(BUSINESS_SECTORS[0]);
  const [companyDescription, setCompanyDescription] = useState("");
  const [productsServices, setProductsServices] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [livePrepNotes, setLivePrepNotes] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [confirmedResult, setConfirmedResult] = useState<{
    booking: BookingRecord;
    confirmationText: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Lookup state
  const [lookupRef, setLookupRef] = useState("");
  const [lookupContact, setLookupContact] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupBooking, setLookupBooking] = useState<BookingRecord | null>(null);

  const activePackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) || packages[1] || packages[0],
    [packages, selectedPackageId]
  );

  // Sync launchDate month when config arrives
  useEffect(() => {
    const minMonth = (launchDate || "2026-12-01").slice(0, 7);
    if (currentMonth < minMonth) {
      setCurrentMonth(minMonth);
    }
  }, [launchDate, currentMonth]);

  // Restore lightweight draft for convenience
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      const d = JSON.parse(saved);
      if (d.firstName) setFirstName(d.firstName);
      if (d.lastName) setLastName(d.lastName);
      if (d.country) setCountry(d.country);
      if (d.city) setCity(d.city);
      if (d.phone) setPhone(d.phone);
      if (d.whatsapp) setWhatsapp(d.whatsapp);
      if (typeof d.sameWhatsapp === "boolean") setSameWhatsapp(d.sameWhatsapp);
      if (d.email) setEmail(d.email);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.sector) setSector(d.sector);
      if (d.companyDescription) setCompanyDescription(d.companyDescription);
      if (d.productsServices) setProductsServices(d.productsServices);
      if (d.physicalAddress) setPhysicalAddress(d.physicalAddress);
      if (d.businessPhone) setBusinessPhone(d.businessPhone);
      if (d.socialLinks) setSocialLinks(d.socialLinks);
      if (d.livePrepNotes) setLivePrepNotes(d.livePrepNotes);
      if (d.specialNeeds) setSpecialNeeds(d.specialNeeds);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          firstName,
          lastName,
          country,
          city,
          phone,
          whatsapp: sameWhatsapp ? phone : whatsapp,
          sameWhatsapp,
          email,
          companyName,
          sector,
          companyDescription,
          productsServices,
          physicalAddress,
          businessPhone,
          socialLinks,
          livePrepNotes,
          specialNeeds,
        })
      );
    } catch {
      /* ignore */
    }
  }, [
    firstName,
    lastName,
    country,
    city,
    phone,
    whatsapp,
    sameWhatsapp,
    email,
    companyName,
    sector,
    companyDescription,
    productsServices,
    physicalAddress,
    businessPhone,
    socialLinks,
    livePrepNotes,
    specialNeeds,
  ]);

  // Adjust default country smoothly when switching mode if untouched
  const handleSelectMode = (mode: ParticipationMode) => {
    onModeChange(mode);
    if (mode === "presentiel") {
      setCountry("Togo");
      if (phone.trim() === "" || phone.trim() === "+237") {
        setPhone("+228 ");
      }
    } else if (country === "Togo") {
      setCountry("Cameroun");
      if (phone.trim() === "+228" || phone.trim() === "") {
        setPhone("+237 ");
      }
    }
    setGlobalError("");
  };

  const handleCountryChange = (nextCountry: string) => {
    setCountry(nextCountry);
    const found = COUNTRIES.find((c) => c.name === nextCountry);
    if (found && found.dialCode !== "+") {
      const cleaned = phone.trim();
      if (!cleaned || /^\+\d{1,3}$/.test(cleaned)) {
        setPhone(`${found.dialCode} `);
      }
    }
  };

  // Load monthly calendar availability
  useEffect(() => {
    let cancelled = false;
    setLoadingCalendar(true);
    fetchMonthAvailability(currentMonth, activePackage?.id || "business")
      .then((res) => {
        if (cancelled) return;
        setMonthDays(res.days);
      })
      .catch(() => {
        if (cancelled) return;
        setMonthDays([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCalendar(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentMonth, activePackage?.id]);

  // Load slots whenever bookingDate or activePackage changes
  useEffect(() => {
    if (!bookingDate) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    fetchDateSlots(bookingDate, activePackage?.id || "business")
      .then((res) => {
        if (cancelled) return;
        setSlots(res.slots);
        // Si le créneau précédemment choisi n'est plus disponible (ex: passage d'un forfait 1h30 à 4h)
        if (startTime) {
          const stillOk = res.slots.find((s) => s.startTime === startTime && s.available);
          if (!stillOk) {
            setStartTime("");
          }
        }
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingDate, activePackage?.id, startTime]);

  const calendarCells = useMemo(() => {
    const [y, m] = currentMonth.split("-").map(Number);
    const firstWeekdayUtc = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    // Lundi = 0 ... Dimanche = 6
    const leadingBlanks = (firstWeekdayUtc + 6) % 7;
    const cells: (DayAvailability | null)[] = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push(null);
    const daysCount = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const found = monthDays.find((item) => item.date === dateStr);
      cells.push(
        found || {
          date: dateStr,
          state: dateStr >= launchDate ? "available" : "unavailable",
          totalSlots: 5,
          availableSlots: dateStr >= launchDate ? 5 : 0,
          bookedSlots: 0,
        }
      );
    }
    return cells;
  }, [currentMonth, monthDays, launchDate]);

  const selectedSlotObj = useMemo(
    () => slots.find((s) => s.startTime === startTime),
    [slots, startTime]
  );

  const validateStep5 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Indiquez votre prénom.";
    if (!lastName.trim()) errs.lastName = "Indiquez votre nom.";
    if (!country.trim()) errs.country = "Choisissez votre pays.";
    if (!city.trim()) errs.city = "Indiquez votre ville.";
    if (phone.replace(/\D/g, "").length < 6) errs.phone = "Indiquez un numéro valide.";
    const effectiveWa = sameWhatsapp ? phone : whatsapp;
    if (effectiveWa.replace(/\D/g, "").length < 6) {
      errs.whatsapp = "Indiquez votre numéro WhatsApp.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Indiquez une adresse e-mail valide.";
    }
    if (!companyName.trim()) errs.companyName = "Indiquez le nom de votre entreprise.";
    if (!sector.trim()) errs.sector = "Choisissez votre secteur d'activité.";
    if (!productsServices.trim()) {
      errs.productsServices = "Précisez les produits ou services que vous présenterez.";
    }
    if (!companyDescription.trim()) {
      errs.companyDescription = "Décrivez brièvement votre activité.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const canGoToStep = (target: number): boolean => {
    if (target <= 1) return true;
    if (target === 2) return Boolean(selectedMode);
    if (target === 3) return Boolean(selectedMode && bookingDate);
    if (target === 4) return Boolean(selectedMode && bookingDate && startTime);
    if (target === 5) return Boolean(selectedMode && bookingDate && startTime && activePackage);
    if (target === 6) {
      return Boolean(
        selectedMode &&
          bookingDate &&
          startTime &&
          activePackage &&
          firstName.trim() &&
          lastName.trim() &&
          companyName.trim()
      );
    }
    return false;
  };

  const handleConfirmBooking = async () => {
    if (!activePackage) return;
    setGlobalError("");
    setSubmitting(true);
    try {
      const effectiveWa = sameWhatsapp ? phone.trim() : whatsapp.trim();
      const result = await submitPublicBooking({
        participationMode: selectedMode,
        bookingDate,
        startTime,
        packageId: activePackage.id,
        specialNeeds: specialNeeds.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        whatsapp: effectiveWa,
        email: email.trim(),
        country: country.trim(),
        city: city.trim(),
        companyName: companyName.trim(),
        sector: sector.trim(),
        companyDescription: companyDescription.trim(),
        productsServices: productsServices.trim(),
        physicalAddress: physicalAddress.trim(),
        businessPhone: businessPhone.trim() || phone.trim(),
        socialLinks: socialLinks.trim(),
        livePrepNotes: livePrepNotes.trim(),
      });
      setConfirmedResult(result);
      track("booking_confirmed", {
        mode: selectedMode,
        packageId: activePackage.id,
        country: country.trim(),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setGlobalError(err.message);
          setStartTime("");
          setStep(3);
        } else if (err.fields) {
          setFieldErrors(err.fields);
          setGlobalError(err.message);
          setStep(5);
        } else {
          setGlobalError(err.message);
        }
      } else {
        setGlobalError("Impossible d'enregistrer la réservation pour le moment. Vérifiez votre connexion.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLookupBooking(null);
    if (!lookupRef.trim() || !lookupContact.trim()) {
      setLookupError("Saisissez votre référence OCD et votre e-mail ou téléphone.");
      return;
    }
    setLookupLoading(true);
    try {
      const res = await lookupPublicBooking(lookupRef.trim(), lookupContact.trim());
      setLookupBooking(res.booking);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Réservation introuvable.");
    } finally {
      setLookupLoading(false);
    }
  };

  const resetForNewBooking = () => {
    setConfirmedResult(null);
    setBookingDate("");
    setStartTime("");
    setStep(1);
    // Recharger les disponibilités du mois courant
    fetchMonthAvailability(currentMonth, activePackage?.id || "business")
      .then((res) => setMonthDays(res.days))
      .catch(() => {});
  };

  const [monthYear, monthNum] = currentMonth.split("-").map(Number);
  const minMonth = (launchDate || "2026-12-01").slice(0, 7);

  return (
    <section
      id="reservation"
      className="booking-section section-dark"
      aria-labelledby="booking-title"
    >
      <StepEdge />
      <SectionLabel label="Réservation en ligne" index="02" light />

      <div className="section-container">
        <div className="booking-header">
          <div>
            <Reveal>
              <p className="eyebrow text-accent">Calendrier officiel dès le {formatHumanDate(launchDate)}</p>
            </Reveal>
            <SplitTitle
              id="booking-title"
              className="display-title"
              lines={["Réservez votre", ["session OCD Live.", "text-accent"]]}
            />
          </div>
          <div className="booking-header-side">
            <p className="section-description">
              Un parcours guidé en 6 étapes simples : choisissez votre mode, votre date, votre créneau garanti sans double réservation et votre forfait.
            </p>
            <div className="booking-quick-links">
              <button type="button" onClick={onOpenLookup} className="booking-lookup-btn">
                <Search size={16} aria-hidden="true" />
                Suivre une réservation existante
              </button>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="booking-lookup-btn"
              >
                <MessageCircle size={16} aria-hidden="true" />
                Assistance WhatsApp ({siteConfig.contacts.whatsappDisplay})
              </a>
            </div>
          </div>
        </div>

        {/* ÉCRAN DE CONFIRMATION OFFICIELLE APRÈS ENREGISTREMENT */}
        {confirmedResult ? (
          <div className="booking-confirmed-card" role="status" aria-live="polite">
            <div className="confirmed-badge-row">
              <p className="small-label text-accent">
                Réservation enregistrée · Équipe OCD Live notifiée
              </p>
              <span className="confirmed-ref">Réf. {confirmedResult.booking.reference}</span>
            </div>

            <h3>Merci {confirmedResult.booking.firstName}, votre créneau est réservé !</h3>
            <p className="confirmed-lead">
              Votre demande pour <strong>{confirmedResult.booking.companyName}</strong> a été transmise automatiquement à l&apos;administration OCD Live. Votre créneau du{" "}
              <strong>{formatHumanDate(confirmedResult.booking.bookingDate)}</strong> de{" "}
              <strong>
                {confirmedResult.booking.startTime} à {confirmedResult.booking.endTime}
              </strong>{" "}
              est bloqué à votre nom.
            </p>

            <div className="confirmed-summary-grid">
              <div>
                <span className="small-label">Mode de participation</span>
                <strong>
                  {confirmedResult.booking.participationMode === "presentiel"
                    ? `Présentiel — ${studioName}`
                    : "À distance — Assistante OCD dédiée au Togo"}
                </strong>
              </div>
              <div>
                <span className="small-label">Date &amp; Horaire</span>
                <strong>
                  {formatHumanDate(confirmedResult.booking.bookingDate)} ·{" "}
                  {confirmedResult.booking.startTime}–{confirmedResult.booking.endTime}
                </strong>
              </div>
              <div>
                <span className="small-label">Forfait sélectionné</span>
                <strong>
                  {confirmedResult.booking.packageName} ({formatFcfa(confirmedResult.booking.amountFcfa)} FCFA)
                </strong>
              </div>
              <div>
                <span className="small-label">Localisation entreprise</span>
                <strong>
                  {confirmedResult.booking.city}, {confirmedResult.booking.country}
                </strong>
              </div>
            </div>

            <div className="confirmed-actions">
              <button
                type="button"
                onClick={() =>
                  downloadStoryPosterPng({
                    reference: confirmedResult.booking.reference,
                    companyName: confirmedResult.booking.companyName,
                    sector: confirmedResult.booking.sector,
                    productsServices: confirmedResult.booking.productsServices,
                    bookingDateLabel: formatHumanDate(confirmedResult.booking.bookingDate),
                    startTime: confirmedResult.booking.startTime,
                    endTime: confirmedResult.booking.endTime,
                    country: confirmedResult.booking.country,
                    city: confirmedResult.booking.city,
                    phone:
                      confirmedResult.booking.businessPhone || confirmedResult.booking.phone,
                    physicalAddress: confirmedResult.booking.physicalAddress,
                    participationMode: confirmedResult.booking.participationMode,
                    packageName: confirmedResult.booking.packageName,
                  })
                }
                className="button button-accent press"
              >
                <ImageIcon size={18} aria-hidden="true" />
                Télécharger mon affiche Story (.png)
              </button>
              <a
                href={createWhatsAppUrl(
                  whatsappNumber,
                  `Bonjour OCD Live, je viens d'enregistrer ma réservation ${confirmedResult.booking.reference} pour ${confirmedResult.booking.companyName} (${confirmedResult.booking.participationMode === "presentiel" ? "Présentiel Togo" : "À distance"}) le ${confirmedResult.booking.bookingDate} à ${confirmedResult.booking.startTime}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-outline-light"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Confirmer sur WhatsApp
              </a>
              <a
                href={`/api/public/bookings/${encodeURIComponent(confirmedResult.booking.reference)}/ics`}
                download={`${confirmedResult.booking.reference}.ics`}
                className="button button-outline-light"
              >
                <CalendarIcon size={17} aria-hidden="true" />
                Ajouter à mon agenda (.ics)
              </a>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    confirmedResult.confirmationText,
                    `${confirmedResult.booking.reference}-confirmation.txt`
                  )
                }
                className="button button-outline-light"
              >
                <Download size={17} aria-hidden="true" />
                Télécharger la confirmation (.txt)
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(confirmedResult.booking.reference);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2500);
                  } catch {
                    /* ignore */
                  }
                }}
                className="button button-outline-light"
              >
                <Copy size={17} aria-hidden="true" />
                {copiedRef ? "Référence copiée !" : "Copier ma référence"}
              </button>
            </div>

            <div className="confirmed-next-steps">
              <p className="small-label">Prochaines étapes pour réussir votre live</p>
              {confirmedResult.booking.participationMode === "presentiel" ? (
                <ul>
                  <li>
                    Notre équipe valide votre dossier et vous confirme les modalités d&apos;accueil chez{" "}
                    <strong>{studioName}</strong>.
                  </li>
                  <li>
                    Préparez vos produits, échantillons ou portions à présenter et arrivez 30 minutes avant votre direct.
                  </li>
                </ul>
              ) : (
                <ul>
                  <li>
                    Votre <strong>assistante dédiée au Togo</strong> prendra contact avec vous sur WhatsApp ({confirmedResult.booking.whatsapp}) pour un rapide test vidéo et préparer la présentation de vos produits.
                  </li>
                  <li>
                    Vous pourrez envoyer vos photos/vidéos produits à l&apos;avance afin d&apos;enrichir le direct sur House of Challenge.
                  </li>
                </ul>
              )}
              <button type="button" onClick={resetForNewBooking} className="text-link-light">
                Effectuer une autre réservation
              </button>
            </div>
          </div>
        ) : (
          <div className="wizard-shell">
            {/* BARRE D'ÉTAPES 1 À 6 */}
            <nav className="wizard-stepper" aria-label="Étapes de réservation">
              {STEP_LABELS.map((item) => {
                const reachable = canGoToStep(item.num);
                const isCurrent = step === item.num;
                const isDone = step > item.num;
                return (
                  <button
                    key={item.num}
                    type="button"
                    disabled={!reachable}
                    onClick={() => reachable && setStep(item.num)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "wizard-step-tab",
                      isCurrent && "is-current",
                      isDone && "is-done"
                    )}
                  >
                    <span className="wizard-step-num">
                      {isDone ? <Check size={14} aria-hidden="true" /> : `0${item.num}`}
                    </span>
                    <span className="wizard-step-label">{item.title}</span>
                  </button>
                );
              })}
            </nav>

            {globalError && (
              <div className="wizard-alert" role="alert">
                {globalError}
              </div>
            )}

            {/* ÉTAPE 1 : CHOISIR LE TYPE DE LIVE */}
            {step === 1 && (
              <div className="wizard-panel">
                <div className="wizard-panel-head">
                  <p className="small-label text-accent">Étape 1 sur 6</p>
                  <h3>Choisissez votre mode de participation</h3>
                  <p>
                    Sélectionnez si vous vous déplacez dans nos locaux au Togo ou si vous participez à distance depuis votre pays.
                  </p>
                </div>

                <div className="wizard-mode-grid">
                  <button
                    type="button"
                    onClick={() => handleSelectMode("presentiel")}
                    aria-pressed={selectedMode === "presentiel"}
                    className={cn(
                      "wizard-mode-option",
                      selectedMode === "presentiel" && "is-active"
                    )}
                  >
                    <div className="wizard-mode-top">
                      <Building2 size={24} aria-hidden="true" />
                      <span className="small-label">01 / Togo · Sur place</span>
                    </div>
                    <h4>Live en Présentiel — Togo</h4>
                    <p>
                      Déplacement physique avec vos produits chez <strong>{studioName}</strong>. Accueil et co-animation sur place avec nos assistantes des lives OCD, diffusés sur House of Challenge.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMode("distanciel")}
                    aria-pressed={selectedMode === "distanciel"}
                    className={cn(
                      "wizard-mode-option",
                      selectedMode === "distanciel" && "is-active"
                    )}
                  >
                    <div className="wizard-mode-top">
                      <Globe2 size={24} aria-hidden="true" />
                      <span className="small-label">02 / Afrique &amp; International</span>
                    </div>
                    <h4>Live à Distance — Sans déplacement</h4>
                    <p>
                      Depuis le Cameroun, le Tchad, la Centrafrique ou tout autre pays : participez depuis votre boutique, accompagné à l&apos;écran par <strong>votre assistante des lives OCD présente au Togo</strong>.
                    </p>
                  </button>
                </div>

                <div className="wizard-footer">
                  <div className="wizard-selection-hint">
                    Sélection actuelle :{" "}
                    <strong>
                      {selectedMode === "presentiel"
                        ? "Présentiel au Togo (Bovann Shop)"
                        : "À distance (Assistante des lives OCD au Togo)"}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="button button-accent press"
                  >
                    Continuer vers le calendrier
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : CHOISIR UNE DATE (CALENDRIER MENSUEL INTERACTIF) */}
            {step === 2 && (
              <div className="wizard-panel">
                <div className="wizard-panel-head">
                  <p className="small-label text-accent">Étape 2 sur 6</p>
                  <h3>Choisissez la date de votre diffusion</h3>
                  <p>
                    Calendrier en temps réel (forfait de référence : <strong>{activePackage?.name}</strong> · {activePackage?.durationLabel}). Sélectionnez un jour disponible.
                  </p>
                </div>

                <div className="calendar-box">
                  <div className="calendar-toolbar">
                    <button
                      type="button"
                      onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
                      disabled={currentMonth <= minMonth}
                      className="calendar-nav-btn"
                      aria-label="Mois précédent"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <h4 className="calendar-month-title" aria-live="polite">
                      {FRENCH_MONTH_NAMES[monthNum - 1]} {monthYear}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                      className="calendar-nav-btn"
                      aria-label="Mois suivant"
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="calendar-legend" aria-label="Légende du calendrier">
                    <span>
                      <i className="dot-available" aria-hidden="true" /> Disponible
                    </span>
                    <span>
                      <i className="dot-partial" aria-hidden="true" /> Créneaux réservés
                    </span>
                    <span>
                      <i className="dot-booked" aria-hidden="true" /> Déjà réservé (Complet)
                    </span>
                    <span>
                      <i className="dot-unavailable" aria-hidden="true" /> Indisponible
                    </span>
                  </div>

                  <div className="calendar-weekdays" aria-hidden="true">
                    {WEEKDAYS.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div
                    className={cn("calendar-grid", loadingCalendar && "is-loading")}
                    role="grid"
                    aria-label={`Calendrier ${FRENCH_MONTH_NAMES[monthNum - 1]} ${monthYear}`}
                  >
                    {calendarCells.map((cell, idx) => {
                      if (!cell) {
                        return <span key={`empty-${idx}`} className="calendar-empty" aria-hidden="true" />;
                      }
                      const dayNum = Number(cell.date.slice(-2));
                      const selectable = cell.state === "available" || cell.state === "partial";
                      const isSelected = bookingDate === cell.date;
                      const statusText =
                        cell.state === "available"
                          ? `${cell.availableSlots} créneaux libres`
                          : cell.state === "partial"
                            ? `${cell.availableSlots} libre${cell.availableSlots > 1 ? "s" : ""}`
                            : cell.state === "booked"
                              ? "Complet"
                              : "Fermé";

                      return (
                        <button
                          key={cell.date}
                          type="button"
                          disabled={!selectable}
                          onClick={() => {
                            setBookingDate(cell.date);
                            setStartTime("");
                            setStep(3);
                          }}
                          aria-pressed={isSelected}
                          aria-label={`${formatHumanDate(cell.date)} — ${statusText}`}
                          className={cn(
                            "calendar-day",
                            `state-${cell.state}`,
                            isSelected && "is-selected"
                          )}
                        >
                          <span className="calendar-day-num">{dayNum}</span>
                          <span className="calendar-day-meta">{statusText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="wizard-footer">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="button button-outline-light"
                  >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Retour
                  </button>
                  <button
                    type="button"
                    disabled={!bookingDate}
                    onClick={() => bookingDate && setStep(3)}
                    className="button button-accent press"
                  >
                    Choisir l&apos;horaire
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : CHOISIR UN HORAIRE */}
            {step === 3 && (
              <div className="wizard-panel">
                <div className="wizard-panel-head">
                  <p className="small-label text-accent">Étape 3 sur 6</p>
                  <h3>Choisissez votre créneau horaire</h3>
                  <p>
                    Date sélectionnée : <strong>{formatHumanDate(bookingDate)}</strong> · Durée du forfait actuel :{" "}
                    <strong>{activePackage?.durationLabel}</strong> (heure du Togo / GMT).
                  </p>
                </div>

                {loadingSlots ? (
                  <p className="slots-loading">Vérification des créneaux disponibles en temps réel…</p>
                ) : slots.length === 0 ? (
                  <div className="slots-empty">
                    <p>Aucun créneau disponible à cette date pour cette durée.</p>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="button button-outline-light"
                    >
                      Choisir une autre date
                    </button>
                  </div>
                ) : (
                  <div className="slots-grid" role="radiogroup" aria-label="Créneaux horaires">
                    {slots.map((slot) => {
                      const isSelected = startTime === slot.startTime && slot.available;
                      const tz = formatDualTimezoneSlot(slot.startTime, slot.endTime, country);
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setStartTime(slot.startTime)}
                          aria-pressed={isSelected}
                          className={cn(
                            "slot-card",
                            !slot.available && "is-booked",
                            isSelected && "is-selected"
                          )}
                        >
                          <div className="slot-card-time">
                            <Clock size={17} aria-hidden="true" />
                            <strong>
                              {slot.startTime} – {slot.endTime}
                            </strong>
                            <small className="text-xs opacity-75">Togo GMT</small>
                          </div>
                          {tz.localLabel && (
                            <span className="slot-card-local">{tz.localLabel}</span>
                          )}
                          <span className="slot-card-status">
                            {slot.available ? "Disponible" : "Déjà réservé"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="wizard-footer">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="button button-outline-light"
                  >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Changer la date
                  </button>
                  <button
                    type="button"
                    disabled={!startTime}
                    onClick={() => startTime && setStep(4)}
                    className="button button-accent press"
                  >
                    Choisir mon forfait
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 : CHOISIR UN FORFAIT (LES 6 PACKAGES COMMERCIAUX) */}
            {step === 4 && (
              <div className="wizard-panel">
                <div className="wizard-panel-head">
                  <p className="small-label text-accent">Étape 4 sur 6</p>
                  <h3>Sélectionnez l&apos;un des 6 packages commerciaux</h3>
                  <p>
                    Chaque package inclut la diffusion en direct sur House of Challenge et des avantages progressifs de visibilité commerciale.
                  </p>
                </div>

                <div className="wizard-packages-grid">
                  {packages.map((pkg) => {
                    const isSelected = activePackage?.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => onPackageChange(pkg.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "wizard-pkg-card",
                          pkg.featured && "is-featured",
                          isSelected && "is-selected"
                        )}
                      >
                        <div className="wizard-pkg-top">
                          <span className="wizard-pkg-code">
                            {pkg.code} {pkg.badge ? `· ${pkg.badge}` : ""}
                          </span>
                          {isSelected && <Check size={17} aria-hidden="true" />}
                        </div>
                        <h4>{pkg.name}</h4>
                        <p className="wizard-pkg-price">
                          <strong>{formatFcfa(pkg.priceFcfa)}</strong> FCFA · {pkg.durationLabel}
                        </p>
                        <p className="wizard-pkg-desc">{pkg.subtitle}</p>
                        <ul className="wizard-pkg-benefits">
                          {pkg.promoBenefits.map((b) => (
                            <li key={b}>
                              <Sparkles size={13} aria-hidden="true" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                {!startTime && bookingDate && (
                  <div className="wizard-alert">
                    La durée de ce nouveau forfait nécessite de reconfirmer votre horaire du{" "}
                    {formatHumanDate(bookingDate)}.{" "}
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="underline font-semibold"
                    >
                      Choisir un horaire disponible
                    </button>
                  </div>
                )}

                <div className="wizard-footer">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="button button-outline-light"
                  >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Retour à l&apos;horaire
                  </button>
                  <button
                    type="button"
                    disabled={!startTime}
                    onClick={() => startTime && setStep(5)}
                    className="button button-accent press"
                  >
                    Renseigner mes informations
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 5 : RENSEIGNER LES INFORMATIONS PERSONNELLES & PROFESSIONNELLES */}
            {step === 5 && (
              <div className="wizard-panel">
                <div className="wizard-panel-head">
                  <p className="small-label text-accent">Étape 5 sur 6</p>
                  <h3>Vos coordonnées &amp; la fiche de votre entreprise</h3>
                  <p>
                    Ces informations permettent à notre équipe de vous contacter et d&apos;afficher clairement vos coordonnées commerciales pendant le direct.
                  </p>
                </div>

                <div className="wizard-step5-layout">
                  <div className="wizard-fields-col">
                    <fieldset className="wizard-fieldset">
                      <legend>1. Informations personnelles</legend>
                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="bk-firstName">Prénom *</label>
                          <input
                            id="bk-firstName"
                            type="text"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            aria-invalid={!!fieldErrors.firstName}
                            placeholder="Ex. Amina"
                          />
                          {fieldErrors.firstName && (
                            <p className="field-error">{fieldErrors.firstName}</p>
                          )}
                        </div>
                        <div className="field">
                          <label htmlFor="bk-lastName">Nom *</label>
                          <input
                            id="bk-lastName"
                            type="text"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            aria-invalid={!!fieldErrors.lastName}
                            placeholder="Ex. Kossi"
                          />
                          {fieldErrors.lastName && (
                            <p className="field-error">{fieldErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="bk-country">Pays *</label>
                          <select
                            id="bk-country"
                            value={country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name} ({c.dialCode})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label htmlFor="bk-city">Ville *</label>
                          <input
                            id="bk-city"
                            type="text"
                            autoComplete="address-level2"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            aria-invalid={!!fieldErrors.city}
                            placeholder={
                              country === "Togo" ? "Ex. Lomé, Kara…" : "Ex. Douala, N'Djamena, Bangui…"
                            }
                          />
                          {fieldErrors.city && <p className="field-error">{fieldErrors.city}</p>}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="bk-phone">Numéro de téléphone *</label>
                          <input
                            id="bk-phone"
                            type="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            aria-invalid={!!fieldErrors.phone}
                            placeholder="+228 90 00 00 00"
                          />
                          {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                        </div>
                        <div className="field">
                          <label htmlFor="bk-email">Adresse e-mail *</label>
                          <input
                            id="bk-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-invalid={!!fieldErrors.email}
                            placeholder="contact@entreprise.com"
                          />
                          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                        </div>
                      </div>

                      <div className="field">
                        <label className="inline-check">
                          <input
                            type="checkbox"
                            checked={sameWhatsapp}
                            onChange={(e) => setSameWhatsapp(e.target.checked)}
                          />
                          <span>Mon numéro WhatsApp est identique à mon numéro de téléphone</span>
                        </label>
                      </div>

                      {!sameWhatsapp && (
                        <div className="field">
                          <label htmlFor="bk-whatsapp">Numéro WhatsApp *</label>
                          <input
                            id="bk-whatsapp"
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            aria-invalid={!!fieldErrors.whatsapp}
                            placeholder="+228 90 00 00 00"
                          />
                          {fieldErrors.whatsapp && (
                            <p className="field-error">{fieldErrors.whatsapp}</p>
                          )}
                        </div>
                      )}
                    </fieldset>

                    <fieldset className="wizard-fieldset">
                      <legend>2. Informations sur votre entreprise &amp; visibilité</legend>
                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="bk-company">Nom de l&apos;entreprise ou activité *</label>
                          <input
                            id="bk-company"
                            type="text"
                            autoComplete="organization"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            aria-invalid={!!fieldErrors.companyName}
                            placeholder="Ex. Saveurs du Golfe / Maison Amina"
                          />
                          {fieldErrors.companyName && (
                            <p className="field-error">{fieldErrors.companyName}</p>
                          )}
                        </div>
                        <div className="field">
                          <label htmlFor="bk-sector">Secteur d&apos;activité *</label>
                          <select
                            id="bk-sector"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                          >
                            {BUSINESS_SECTORS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="bk-products">Produits ou services à présenter pendant le live *</label>
                        <textarea
                          id="bk-products"
                          rows={2}
                          value={productsServices}
                          onChange={(e) => setProductsServices(e.target.value)}
                          aria-invalid={!!fieldErrors.productsServices}
                          placeholder="Ex. 35 portions de plats grillés + jus naturels / Collection de robes bazin et sacs…"
                        />
                        {fieldErrors.productsServices && (
                          <p className="field-error">{fieldErrors.productsServices}</p>
                        )}
                      </div>

                      <div className="field">
                        <label htmlFor="bk-desc">Présentation rapide de votre entreprise *</label>
                        <textarea
                          id="bk-desc"
                          rows={2}
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          aria-invalid={!!fieldErrors.companyDescription}
                          placeholder="Ce qui fait votre particularité, votre clientèle cible, vos modes de livraison…"
                        />
                        {fieldErrors.companyDescription && (
                          <p className="field-error">{fieldErrors.companyDescription}</p>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="bk-address">Adresse physique / localisation boutique</label>
                          <input
                            id="bk-address"
                            type="text"
                            value={physicalAddress}
                            onChange={(e) => setPhysicalAddress(e.target.value)}
                            placeholder="Ex. Quartier Adidogomé, face pharmacie…"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="bk-bizphone">Numéro professionnel à afficher au public</label>
                          <input
                            id="bk-bizphone"
                            type="tel"
                            value={businessPhone}
                            onChange={(e) => setBusinessPhone(e.target.value)}
                            placeholder={phone || "+228 …"}
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="bk-socials">Liens vers vos réseaux sociaux (Facebook, TikTok, Instagram, site)</label>
                        <input
                          id="bk-socials"
                          type="text"
                          value={socialLinks}
                          onChange={(e) => setSocialLinks(e.target.value)}
                          placeholder="Ex. @maisonamina sur TikTok & Facebook"
                        />
                      </div>

                      <div className="form-row">
                        <div className="field">
                          <label htmlFor="bk-prep">Informations utiles pour préparer le live</label>
                          <input
                            id="bk-prep"
                            type="text"
                            value={livePrepNotes}
                            onChange={(e) => setLivePrepNotes(e.target.value)}
                            placeholder="Offre promo spéciale pendant le direct, prix phares…"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="bk-needs">Besoins particuliers (logistique / technique)</label>
                          <input
                            id="bk-needs"
                            type="text"
                            value={specialNeeds}
                            onChange={(e) => setSpecialNeeds(e.target.value)}
                            placeholder="Ex. Table de dégustation, portant vêtements, photos HD…"
                          />
                        </div>
                      </div>
                    </fieldset>
                  </div>

                  {/* APERÇU CRÉATIF DU BANDEAU DE VISIBILITÉ LIVE */}
                  <aside className="live-banner-preview" aria-label="Aperçu de votre bandeau de visibilité en direct">
                    <div className="banner-preview-head">
                      <Tv size={17} aria-hidden="true" />
                      <span>Aperçu de votre mise en avant en direct</span>
                    </div>
                    <div className="banner-preview-screen">
                      <div className="banner-screen-top">
                        <span className="small-label text-white/75">Aperçu à l&apos;écran</span>
                        <span className="small-label text-accent">
                          {selectedMode === "presentiel" ? "Bovann Shop · Togo" : `Direct · ${country}`}
                        </span>
                      </div>
                      <div className="banner-lower-third">
                        <p className="banner-sector">{sector}</p>
                        <h4>{companyName.trim() || "Nom de votre entreprise"}</h4>
                        <p className="banner-products">
                          {productsServices.trim() || "Vos produits & services mis en avant ici"}
                        </p>
                        <div className="banner-contacts">
                          <span>
                            <Phone size={13} aria-hidden="true" />
                            {businessPhone.trim() || phone.trim() || "Votre numéro client"}
                          </span>
                          <span>
                            <MapPin size={13} aria-hidden="true" />
                            {physicalAddress.trim()
                              ? `${physicalAddress.trim()}, ${city.trim() || country}`
                              : `${city.trim() || "Votre ville"}, ${country}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="banner-preview-caption">
                      OCD Live diffuse clairement votre nom, vos offres, votre téléphone et votre localisation pour générer des appels et visites même après le direct.
                    </p>
                  </aside>
                </div>

                <div className="wizard-footer">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="button button-outline-light"
                  >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Retour au forfait
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep5()) {
                        setGlobalError("");
                        setStep(6);
                      }
                    }}
                    className="button button-accent press"
                  >
                    Vérifier mon récapitulatif
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 6 : RÉCAPITULATIF COMPLET & VALIDATION */}
            {step === 6 && activePackage && (
              <div className="wizard-panel">
                <div className="wizard-panel-head">
                  <p className="small-label text-accent">Étape 6 sur 6</p>
                  <h3>Récapitulatif complet avant confirmation</h3>
                  <p>
                    Vérifiez les informations de votre session. Dès validation, votre créneau est bloqué et l&apos;équipe OCD Live reçoit instantanément votre dossier complet.
                  </p>
                </div>

                <div className="recap-grid">
                  <div className="recap-card">
                    <div className="recap-card-head">
                      <h4>Session &amp; Forfait</h4>
                      <button type="button" onClick={() => setStep(2)}>
                        Modifier
                      </button>
                    </div>
                    <dl className="recap-list">
                      <div>
                        <dt>Catégorie</dt>
                        <dd>
                          {selectedMode === "presentiel"
                            ? `Live en Présentiel — ${studioName}`
                            : "Live à Distance — Afrique & International (avec assistante au Togo)"}
                        </dd>
                      </div>
                      <div>
                        <dt>Date &amp; Horaire</dt>
                        <dd>
                          {formatHumanDate(bookingDate)} ·{" "}
                          {selectedSlotObj
                            ? (() => {
                                const tz = formatDualTimezoneSlot(
                                  selectedSlotObj.startTime,
                                  selectedSlotObj.endTime,
                                  country
                                );
                                return tz.localLabel
                                  ? `${tz.togoLabel} (${tz.localLabel})`
                                  : tz.togoLabel;
                              })()
                            : startTime}
                        </dd>
                      </div>
                      <div>
                        <dt>Forfait choisi</dt>
                        <dd>
                          {activePackage.name} ({activePackage.durationLabel})
                        </dd>
                      </div>
                      <div>
                        <dt>Montant du forfait</dt>
                        <dd className="recap-amount">
                          {formatFcfa(activePackage.priceFcfa)} FCFA{" "}
                          <span className="text-xs font-normal opacity-80">
                            ({formatEuroApprox(activePackage.priceFcfa)})
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="recap-card">
                    <div className="recap-card-head">
                      <h4>Participant &amp; Entreprise</h4>
                      <button type="button" onClick={() => setStep(5)}>
                        Modifier
                      </button>
                    </div>
                    <dl className="recap-list">
                      <div>
                        <dt>Responsable</dt>
                        <dd>
                          {firstName} {lastName} ({city}, {country})
                        </dd>
                      </div>
                      <div>
                        <dt>Contacts</dt>
                        <dd>
                          Tél : {phone} · WhatsApp : {sameWhatsapp ? phone : whatsapp} · {email}
                        </dd>
                      </div>
                      <div>
                        <dt>Entreprise</dt>
                        <dd>
                          {companyName} ({sector})
                        </dd>
                      </div>
                      <div>
                        <dt>Produits / Services</dt>
                        <dd>{productsServices}</dd>
                      </div>
                      {physicalAddress && (
                        <div>
                          <dt>Adresse affichée</dt>
                          <dd>{physicalAddress}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div className="wizard-footer">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="button button-outline-light"
                  >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Modifier mes informations
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirmBooking}
                    className="button button-accent press"
                  >
                    {submitting
                      ? "Enregistrement sécurisé en cours…"
                      : "Confirmer ma réservation OCD Live"}
                    <CheckCircle2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALE DE SUIVI D'UNE RÉSERVATION EXISTANTE */}
      {lookupOpen && (
        <Dialog onClose={onCloseLookup} title="Suivre ma réservation OCD Live">
          <p className="dialog-description">
            Entrez votre numéro de référence reçu lors de l&apos;inscription (ex.{" "}
            <strong>OCD-20261205-4821</strong>) ainsi que votre e-mail ou numéro de téléphone.
          </p>
          <form onSubmit={handleLookupSubmit} className="lookup-form mt-5">
            <div className="form-row">
              <div className="field">
                <label htmlFor="lookup-ref" className="!text-ink text-xs font-medium">
                  Référence de réservation *
                </label>
                <input
                  id="lookup-ref"
                  type="text"
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value)}
                  placeholder="OCD-20261205-XXXX"
                  className="mt-1.5 block w-full rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-sm text-ink"
                />
              </div>
              <div className="field">
                <label htmlFor="lookup-contact" className="!text-ink text-xs font-medium">
                  Votre e-mail ou téléphone *
                </label>
                <input
                  id="lookup-contact"
                  type="text"
                  value={lookupContact}
                  onChange={(e) => setLookupContact(e.target.value)}
                  placeholder="contact@exemple.com ou +228..."
                  className="mt-1.5 block w-full rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-sm text-ink"
                />
              </div>
            </div>
            {lookupError && (
              <p className="field-error" role="alert">
                {lookupError}
              </p>
            )}
            <div className="dialog-actions">
              <button
                type="submit"
                disabled={lookupLoading}
                className="button button-accent press"
              >
                <Search size={16} aria-hidden="true" />
                {lookupLoading ? "Recherche…" : "Rechercher mon dossier"}
              </button>
            </div>
          </form>

          {lookupBooking && (
            <div className="lookup-result" role="status">
              <div className="lookup-result-top">
                <strong>{lookupBooking.reference}</strong>
                <span className={cn("status-pill", `is-${lookupBooking.status}`)}>
                  {lookupBooking.status === "confirmed"
                    ? "Confirmée"
                    : lookupBooking.status === "cancelled"
                      ? "Annulée"
                      : lookupBooking.status === "completed"
                        ? "Réalisée"
                        : "En attente de validation"}
                </span>
              </div>
              <p>
                <strong>{lookupBooking.companyName}</strong> ({lookupBooking.city},{" "}
                {lookupBooking.country})
              </p>
              <p>
                {lookupBooking.participationMode === "presentiel"
                  ? `Live en Présentiel — ${studioName}`
                  : "Live à Distance — Assistante dédiée au Togo"}
              </p>
              <p>
                Date : <strong>{formatHumanDate(lookupBooking.bookingDate)}</strong> de{" "}
                <strong>
                  {lookupBooking.startTime} à {lookupBooking.endTime}
                </strong>
              </p>
              <p>
                Forfait : <strong>{lookupBooking.packageName}</strong> (
                {formatFcfa(lookupBooking.amountFcfa)} FCFA) · Paiement :{" "}
                <strong>
                  {lookupBooking.paymentStatus === "paid"
                    ? "Payé"
                    : lookupBooking.paymentStatus === "deposit"
                      ? "Acompte reçu"
                      : "En attente"}
                </strong>
              </p>
            </div>
          )}
        </Dialog>
      )}
    </section>
  );
}
