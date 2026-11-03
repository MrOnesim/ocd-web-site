/**
 * Configuration centrale d'OCD.
 * Les champs inconnus restent explicitement vides : ne pas inventer de
 * coordonnées, d'audience ou de résultats.
 */
export const siteConfig = {
  name: "OCD",
  tagline: "Votre activité mérite d'être vue.",
  domain: "Promotion commerciale · Publicité · Visibilité numérique",
  /** À renseigner avant la mise en ligne : URL canonique et sitemap. */
  url: "https://houseofchallenge.org/fr",
  locale: "fr_FR",
  contacts: {
    whatsapp: "+22879790229",
    email: "contact@houseofchallenge.org",
    phone: "+228 79 79 02 29",
    address: "",
    instagram: "",
    facebook: "https://www.facebook.com/profile.php?id=61587685112077",
    tiktok: "",
  },
  booking: {
    /** Passer à true lorsque la réservation réelle sera branchée et vérifiée. */
    enabled: true,
    mode: "whatsapp" as "dossier-local" | "whatsapp" | "formulaire-externe",
  },
  analytics: {
    /** Aucun outil n'est chargé par défaut. Brancher dataLayer ou Umami si validé. */
    provider: "umami" as "none" | "umami" | "plausible" | "dataLayer",
    respectDoNotTrack: true,
    /** ID Umami ou dataLayer (ex: "umami-website-id" ou "GTM-XXXXXXX"). À renseigner. */
    id: "",
  },
  media: {
    note: "Photographies d'illustration ; l'image d'accueil est générée par IA. Aucune image ne montre un client ou une réalisation OCD.",
  },
  contactPendingMessage:
    "Coordonnées officielles renseignées. Le formulaire prépare un dossier local (copier/télécharger) — aucune réservation n'est confirmée automatiquement.",
};

export type SiteConfig = typeof siteConfig;