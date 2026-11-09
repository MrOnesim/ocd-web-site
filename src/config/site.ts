/**
 * Source de vérité unique pour la configuration globale d'OCD Live.
 * Les paramètres dynamiques (6 forfaits, calendrier, horaires) sont pilotables
 * en temps réel depuis le tableau de bord administrateur (/admin).
 */
export const siteConfig = {
  name: "OCD Live",
  shortBrand: "OCD",
  fullName: "Opportunité C'est Dehors — OCD Live",
  tagline: "Votre activité mérite d'être vue.",
  domain: "Promotion commerciale · Lives House of Challenge · Visibilité numérique",
  /** URL canonique publique utilisée pour le SEO, Open Graph et sitemap.xml. */
  url: "https://houseofchallenge.org/fr",
  locale: "fr_FR",
  studio: {
    name: "Bovann Shop — Togo",
    location: "Locaux Bovann Shop, Lomé, Togo",
  },
  contacts: {
    whatsapp: "+22879790229",
    whatsappDisplay: "+228 79 79 02 29",
    email: "contact@houseofchallenge.org",
    phone: "+228 79 79 02 29",
    address: "Bovann Shop, Lomé, Togo",
    instagram: "",
    facebook: "https://www.facebook.com/profile.php?id=61587685112077",
    tiktok: "",
  },
  governance: {
    title: "Président des OCD (Opportunité C'est Dehors)",
    note: "Panafricain dans l'âme",
    email: "contact@bovanngroup.com",
    phone: "+225 05 86 86 86 19",
  },
  booking: {
    enabled: true,
    mode: "online" as "online" | "whatsapp" | "mailto",
  },
  analytics: {
    provider: "none" as "none" | "umami" | "plausible" | "dataLayer",
    respectDoNotTrack: true,
    id: "",
    scriptUrl: "https://cloud.umami.is/script.js",
  },
  media: {
    note: "Photographies d'illustration générées par IA et vidéo d'illustration Pexels. Aucun média ne montre un client ou une réalisation OCD.",
  },
  contactPendingMessage:
    "Réservez directement votre créneau en ligne : choisissez Présentiel au Togo (Bovann Shop) ou À distance (Afrique & International) avec une assistante des lives OCD dédiée, puis sélectionnez votre date, votre horaire et votre forfait.",
} as const;
