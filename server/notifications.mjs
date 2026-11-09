import nodemailer from "nodemailer";

const FRENCH_DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const FRENCH_MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function formatFrenchDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dayName = FRENCH_DAYS[dt.getUTCDay()];
  const monthName = FRENCH_MONTHS[dt.getUTCMonth()];
  return `${dayName} ${d === 1 ? "1er" : d} ${monthName} ${y}`;
}

export function formatAmountFcfa(n) {
  return `${Math.round(Number(n) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

export function paymentStatusLabel(status) {
  const map = {
    unpaid: "En attente de règlement",
    deposit: "Acompte reçu",
    paid: "Payé",
    refunded: "Remboursé",
  };
  return map[status] || status;
}

const COUNTRY_UTC_OFFSETS = {
  cameroun: 1,
  tchad: 1,
  centrafrique: 1,
  "bénin": 1,
  benin: 1,
  niger: 1,
  gabon: 1,
  congo: 1,
  "rd congo": 1,
  nigeria: 1,
  rwanda: 2,
  maroc: 1,
  france: 1,
  belgique: 1,
  canada: -5,
  "états-unis": -5,
};

function formatDualTimeForEmail(startTime, endTime, country) {
  const key = String(country || "").trim().toLowerCase();
  const offset = COUNTRY_UTC_OFFSETS[key] || 0;
  const base = `${startTime} à ${endTime} (heure du Togo / GMT)`;
  if (!offset) return base;
  const shift = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const total = (((h + offset) * 60 + m) % 1440 + 1440) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };
  const sign = offset > 0 ? `+${offset}h` : `${offset}h`;
  return `${base} — soit ${shift(startTime)} à ${shift(endTime)} en heure locale ${country} (GMT${sign})`;
}

export function bookingStatusLabel(status) {
  const map = {
    pending: "En attente de validation",
    confirmed: "Confirmée",
    cancelled: "Annulée",
    completed: "Réalisée",
  };
  return map[status] || status;
}

export function buildAdminNotification(booking) {
  const modeText =
    booking.participationMode === "presentiel"
      ? "en présentiel au Togo (locaux Bovann Shop, avec assistante des lives OCD)"
      : "à distance (accompagnée par une assistante des lives OCD au Togo)";
  const dateLabel = formatFrenchDate(booking.bookingDate);
  const amountLabel = formatAmountFcfa(booking.amountFcfa);

  // Format narratif exact demandé par Bovann
  const summary = `Nouvelle réservation OCD Live : une entreprise du secteur « ${booking.sector} » (${booking.companyName}) située à ${booking.city}, ${booking.country} a réservé une session ${modeText} le ${dateLabel}, de ${booking.startTime} à ${booking.endTime}, avec le forfait « ${booking.packageName} » (${amountLabel}) et ses coordonnées complètes.`;

  const subject = `[OCD Live] Nouvelle réservation ${booking.reference} — ${booking.companyName} (${booking.country})`;

  const bodyText = [
    "NOUVELLE RÉSERVATION — OCD LIVE",
    "================================================",
    "",
    summary,
    "",
    `Référence            : ${booking.reference}`,
    `Statut réservation   : ${bookingStatusLabel(booking.status)}`,
    `Statut du paiement   : ${paymentStatusLabel(booking.paymentStatus)}`,
    "",
    "1. PARTICIPATION & CRÉNEAU",
    `• Mode               : ${booking.participationMode === "presentiel" ? "Présentiel — Togo (Bovann Shop)" : "À distance — Assistante des lives OCD au Togo"}`,
    `• Date & Horaire     : ${dateLabel}, de ${booking.startTime} à ${booking.endTime} (${booking.durationMinutes} min)`,
    `• Forfait choisi     : ${booking.packageName}`,
    `• Montant            : ${amountLabel}`,
    `• Besoins spécifiques: ${booking.specialNeeds || "Aucun besoin particulier signalé"}`,
    "",
    "2. IDENTITÉ & COORDONNÉES DU PARTICIPANT",
    `• Participant        : ${booking.firstName} ${booking.lastName}`,
    `• Pays & Ville       : ${booking.city}, ${booking.country}`,
    `• Téléphone          : ${booking.phone}`,
    `• WhatsApp           : ${booking.whatsapp}`,
    `• E-mail             : ${booking.email}`,
    "",
    "3. ENTREPRISE & VISIBILITÉ COMMERCIALE",
    `• Entreprise         : ${booking.companyName}`,
    `• Secteur d'activité : ${booking.sector}`,
    `• Produits / Services: ${booking.productsServices}`,
    `• Description        : ${booking.companyDescription}`,
    `• Adresse physique   : ${booking.physicalAddress || "Non précisée"}`,
    `• Numéro pro         : ${booking.businessPhone || booking.phone}`,
    `• Réseaux sociaux    : ${booking.socialLinks || "Non renseignés"}`,
    `• Infos prépa live   : ${booking.livePrepNotes || "Aucune note complémentaire"}`,
    "",
    "Connectez-vous au tableau de bord OCD Live (/admin) pour valider la session et contacter le participant.",
  ].join("\n");

  return { subject, summary, bodyText };
}

export function buildParticipantConfirmation(booking, settings) {
  const dateLabel = formatFrenchDate(booking.bookingDate);
  const amountLabel = formatAmountFcfa(booking.amountFcfa);
  const subject = `Confirmation de votre demande OCD Live — Réf. ${booking.reference}`;

  const modeInstructions =
    booking.participationMode === "presentiel"
      ? [
          "CONSIGNES — LIVE EN PRÉSENTIEL AU TOGO :",
          `• Lieu : ${settings.studioName}${settings.studioAddress ? ` (${settings.studioAddress})` : ""}.`,
          "• Présentez-vous 30 minutes avant votre créneau avec vos produits et supports.",
          "• Sur place chez Bovann Shop au Togo, notre équipe et votre assistante des lives OCD vous accueillent et co-animent votre passage sur House of Challenge.",
        ]
      : [
          "CONSIGNES — LIVE À DISTANCE (AFRIQUE & INTERNATIONAL) :",
          "• Vous participez directement depuis votre boutique, atelier, restaurant ou domicile.",
          "• Votre assistante des lives OCD dédiée, présente au Togo, co-anime toute la diffusion pour valoriser vos offres, interagir avec les spectateurs et relayer vos coordonnées.",
          "• Un court test de connexion et de cadrage sera organisé avec vous sur WhatsApp avant le direct.",
        ];

  const summary = `Confirmation envoyée à ${booking.firstName} ${booking.lastName} (${booking.email}) pour la session du ${dateLabel} (${booking.startTime}–${booking.endTime}).`;

  const bodyText = [
    `Bonjour ${booking.firstName} ${booking.lastName},`,
    "",
    "Nous avons bien enregistré votre réservation sur OCD Live. Voici le récapitulatif complet de votre dossier :",
    "",
    `• Référence de suivi : ${booking.reference}`,
    `• Entreprise         : ${booking.companyName} (${booking.sector})`,
    `• Formule choisie    : ${booking.packageName} — ${amountLabel}`,
    `• Mode               : ${booking.participationMode === "presentiel" ? "Live en présentiel au Togo (Bovann Shop)" : "Live à distance — Assistante des lives OCD au Togo"}`,
    `• Date retenue       : ${dateLabel}`,
    `• Créneau horaire    : ${formatDualTimeForEmail(booking.startTime, booking.endTime, booking.country)}`,
    `• Statut actuel      : ${bookingStatusLabel(booking.status)}`,
    "",
    ...modeInstructions,
    "",
    "COORDONNÉES QUI SERONT MISES EN AVANT PENDANT VOTRE LIVE :",
    `• Nom commercial     : ${booking.companyName}`,
    `• Numéro client      : ${booking.businessPhone || booking.phone}`,
    `• Adresse / Ville    : ${booking.physicalAddress ? `${booking.physicalAddress}, ` : ""}${booking.city}, ${booking.country}`,
    ...(booking.socialLinks ? [`• Réseaux sociaux    : ${booking.socialLinks}`] : []),
    "",
    "PROCHAINE ÉTAPE :",
    `L'équipe OCD Live prend contact avec vous très rapidement sur WhatsApp (${booking.whatsapp}) ou par téléphone pour finaliser la validation et préparer votre passage sur House of Challenge.`,
    "",
    `Contact officiel OCD Live : WhatsApp ${settings.whatsappNumber} · ${settings.adminEmail}`,
    "OCD Live — Votre activité mérite d'être vue.",
  ].join("\n");

  return { subject, summary, bodyText };
}

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function dispatchEmailIfConfigured({ to, subject, text }) {
  if (!isSmtpConfigured() || !to) {
    return { status: "logged" };
  }
  try {
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"OCD Live" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    return { status: "sent" };
  } catch (err) {
    console.error("[OCD Live SMTP Error]", err);
    return { status: "failed" };
  }
}

export function generateBookingIcs(booking, settings) {
  const [y, m, d] = booking.bookingDate.split("-");
  const [sh, sm] = booking.startTime.split(":");
  const [eh, em] = booking.endTime.split(":");
  const dtStart = `${y}${m}${d}T${sh}${sm}00Z`;
  const dtEnd = `${y}${m}${d}T${eh}${em}00Z`;
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const location =
    booking.participationMode === "presentiel"
      ? `${settings.studioName}${settings.studioAddress ? ` - ${settings.studioAddress}` : ""}`
      : "En ligne (Live à distance avec assistante OCD au Togo)";

  const esc = (s = "") => String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, "\\$&");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OCD Live//House of Challenge//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@ocdlive.org`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${esc(`OCD Live — ${booking.companyName} (${booking.packageName})`)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(`Référence: ${booking.reference}\nMode: ${booking.participationMode === "presentiel" ? "Présentiel Togo" : "À distance"}\nContact OCD Live: ${settings.whatsappNumber}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
