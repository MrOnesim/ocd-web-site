import type { CommercialPackage } from "@/types/booking";

export const DEFAULT_PACKAGES: CommercialPackage[] = [
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

export interface CountryOption {
  name: string;
  dialCode: string;
  region: "togo" | "cemac" | "uemoa" | "afrique" | "international";
  /** Décalage horaire par rapport à Lomé (GMT / UTC+0). */
  utcOffsetHours: number;
}

export const COUNTRIES: CountryOption[] = [
  { name: "Togo", dialCode: "+228", region: "togo", utcOffsetHours: 0 },
  { name: "Cameroun", dialCode: "+237", region: "cemac", utcOffsetHours: 1 },
  { name: "Tchad", dialCode: "+235", region: "cemac", utcOffsetHours: 1 },
  { name: "Centrafrique", dialCode: "+236", region: "cemac", utcOffsetHours: 1 },
  { name: "Bénin", dialCode: "+229", region: "uemoa", utcOffsetHours: 1 },
  { name: "Côte d'Ivoire", dialCode: "+225", region: "uemoa", utcOffsetHours: 0 },
  { name: "Sénégal", dialCode: "+221", region: "uemoa", utcOffsetHours: 0 },
  { name: "Burkina Faso", dialCode: "+226", region: "uemoa", utcOffsetHours: 0 },
  { name: "Mali", dialCode: "+223", region: "uemoa", utcOffsetHours: 0 },
  { name: "Niger", dialCode: "+227", region: "uemoa", utcOffsetHours: 1 },
  { name: "Gabon", dialCode: "+241", region: "cemac", utcOffsetHours: 1 },
  { name: "Congo", dialCode: "+242", region: "cemac", utcOffsetHours: 1 },
  { name: "RD Congo", dialCode: "+243", region: "afrique", utcOffsetHours: 1 },
  { name: "Guinée", dialCode: "+224", region: "afrique", utcOffsetHours: 0 },
  { name: "Ghana", dialCode: "+233", region: "afrique", utcOffsetHours: 0 },
  { name: "Nigeria", dialCode: "+234", region: "afrique", utcOffsetHours: 1 },
  { name: "Rwanda", dialCode: "+250", region: "afrique", utcOffsetHours: 2 },
  { name: "Maroc", dialCode: "+212", region: "afrique", utcOffsetHours: 1 },
  { name: "France", dialCode: "+33", region: "international", utcOffsetHours: 1 },
  { name: "Belgique", dialCode: "+32", region: "international", utcOffsetHours: 1 },
  { name: "Canada", dialCode: "+1", region: "international", utcOffsetHours: -5 },
  { name: "États-Unis", dialCode: "+1", region: "international", utcOffsetHours: -5 },
  { name: "Autre pays", dialCode: "+", region: "international", utcOffsetHours: 0 },
];

export const BUSINESS_SECTORS = [
  "Restauration, traiteur & agroalimentaire",
  "Mode, prêt-à-porter, tissus & accessoires",
  "Beauté, cosmétiques, coiffure & bien-être",
  "Téléphones, informatique & électronique",
  "Artisanat, décoration & mobilier",
  "Commerce général & distribution",
  "Services aux entreprises & particuliers",
  "Immobilier, auto & équipements",
  "Formation, événementiel & culture",
  "Autre secteur d'activité",
] as const;

export function formatFcfa(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Parité fixe Franc CFA : 1 € = 655,957 FCFA */
export function formatEuroApprox(amountFcfa: number): string {
  const euros = Math.round(amountFcfa / 655.957);
  return `~${euros} €`;
}

export function getCountryOffset(countryName: string): number {
  const found = COUNTRIES.find((c) => c.name.toLowerCase() === countryName.trim().toLowerCase());
  return found ? found.utcOffsetHours : 0;
}

export function shiftTimeByHours(hhmm: string, offsetHours: number): string {
  if (!hhmm || !hhmm.includes(":")) return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  const shifted = (((h + offsetHours) * 60 + m) % 1440 + 1440) % 1440;
  const nh = Math.floor(shifted / 60);
  const nm = shifted % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function formatDualTimezoneSlot(
  startTime: string,
  endTime: string,
  countryName: string
): { togoLabel: string; localLabel: string | null } {
  const offset = getCountryOffset(countryName);
  const togoLabel = `${startTime} – ${endTime} (heure Togo GMT)`;
  if (offset === 0) {
    return { togoLabel, localLabel: null };
  }
  const localStart = shiftTimeByHours(startTime, offset);
  const localEnd = shiftTimeByHours(endTime, offset);
  const sign = offset > 0 ? `+${offset}h` : `${offset}h`;
  return {
    togoLabel,
    localLabel: `${localStart} – ${localEnd} en heure locale ${countryName} (GMT${sign})`,
  };
}
