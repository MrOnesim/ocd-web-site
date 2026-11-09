import { siteConfig } from "@/config/site";
import { DEFAULT_PACKAGES } from "@/data/packages";

export const project = {
  name: siteConfig.name,
  tagline: siteConfig.tagline,
  domain: siteConfig.domain,
} as const;

export const navItems = [
  { n: "01", label: "Présentiel ou À distance", href: "#participation" },
  { n: "02", label: "Réserver un live", href: "#reservation" },
  { n: "03", label: "Les 6 forfaits", href: "#formules" },
  { n: "04", label: "Visibilité commerciale", href: "#services" },
  { n: "05", label: "Aperçu d'un live", href: "#apercu-live" },
  { n: "06", label: "Pour qui ?", href: "#pour-qui" },
  { n: "07", label: "Comment ça marche", href: "#fonctionnement" },
  { n: "08", label: "Écosystème & Assistantes", href: "#ecosysteme" },
  { n: "09", label: "Questions fréquentes", href: "#faq" },
] as const;

export const mission = [
  "Offrir une visibilité immédiate aux entrepreneurs d'Afrique et du monde sur House of Challenge.",
  "Présenter les produits, l'entreprise, le numéro de téléphone et l'adresse physique en direct.",
  "Accueillir les participants en présentiel chez Bovann Shop au Togo aux côtés de nos assistantes des lives OCD.",
  "Porter à l'écran les entrepreneurs du Cameroun, du Tchad, de Centrafrique et d'ailleurs grâce à une assistante des lives OCD dédiée au Togo.",
  "Valoriser les réseaux sociaux, les points de vente et les offres promotionnelles de chaque participant.",
  "Rendre le marketing digital et le live commercial accessibles à tous les budgets.",
] as const;

export const services = [
  {
    id: "lives",
    title: "Lives commerciaux en direct",
    short: "En présentiel au Togo ou à distance dans le monde.",
    description:
      "Diffusez votre activité sur le compte officiel House of Challenge. Sur place dans les locaux de Bovann Shop au Togo ou à distance, accompagné par une assistante des lives OCD qui met vos offres en valeur.",
    image: "/images/ocd-live-hero.jpg",
    alt: "Illustration d'une entrepreneuse présentant un produit devant une caméra",
    position: "74% 12%",
  },
  {
    id: "coordonnees",
    title: "Mise en avant entreprise & contacts",
    short: "Nom, téléphone, WhatsApp et adresse affichés.",
    description:
      "L'objectif dépasse la vente immédiate : faire connaître votre marque, diffuser votre numéro professionnel, votre localisation physique et vos réseaux sociaux pour attirer durablement des clients.",
    image: "/images/sector-artisan.jpg",
    alt: "Entrepreneuse dans son atelier de création textile, photographie d'illustration",
    position: "center 6%",
  },
  {
    id: "affiches",
    title: "Annonces préalables & affiches",
    short: "Préparez l'audience avant même le direct.",
    description:
      "Création de supports graphiques attractifs et annonce officielle préalable de votre passage pour les formules supérieures afin de mobiliser les spectateurs intéressés par votre secteur.",
    image: "/images/ocd-campaign.svg",
    alt: "Exemple de direction graphique OCD : à vous de briller",
    position: "center",
  },
  {
    id: "stories",
    title: "Publications & stories promo",
    short: "Prolongez votre visibilité avant et après le live.",
    description:
      "La diffusion de stories et publications promotionnelles permet de rappeler vos offres, vos numéros de contact et vos adresses bien au-delà du temps d'antenne en direct.",
    image: "/images/sector-services.jpg",
    alt: "Créatrice de contenu préparant une vidéo sur son téléphone, photographie d'illustration",
    position: "60% 8%",
  },
  {
    id: "produits",
    title: "Mise en scène & démonstration",
    short: "Vos produits sous leur meilleur jour.",
    description:
      "Préparation de votre espace chez Bovann Shop au Togo (ex. 30 à 45 portions pour un restaurateur, portants mode, cosmétiques) ou valorisation soignée de vos visuels envoyés à distance.",
    image: "/images/sector-beauty.jpg",
    alt: "Mise en scène de produits cosmétiques sur des supports minéraux",
    position: "center",
  },
  {
    id: "assistantes",
    title: "Assistantes des Lives OCD",
    short: "Votre ambassadrice commerciale à l'écran.",
    description:
      "Véritables alliées de votre passage, nos assistantes des lives OCD présentes au Togo préparent votre intervention, co-animent le direct, répondent aux spectateurs et relaient vos numéros et adresses — que vous soyez sur place ou connecté depuis le Cameroun, le Tchad, la Centrafrique ou l'international.",
    image: "/images/ocd-live-hero.jpg",
    alt: "Animatrice et assistante commerciale lors d'une diffusion en direct, photographie d'illustration",
    position: "68% 12%",
  },
] as const;

export const audiences = [
  "Restaurateurs, traiteurs & agroalimentaire",
  "Boutiques de prêt-à-porter, tissus & accessoires",
  "Cosmétiques, coiffure & soins de beauté",
  "Téléphones, électronique & équipements",
  "Artisans, créateurs & marques locales",
  "Prestataires de services & formations",
  "Commerçants au Togo (présentiel Bovann Shop)",
  "Entrepreneurs d'Afrique & de la diaspora (à distance)",
] as const;

export const steps = [
  {
    title: "Choisissez Présentiel (Togo) ou À distance",
    text: "Dès votre arrivée, sélectionnez une session physique chez Bovann Shop au Togo ou une participation à distance depuis votre pays aux côtés d'une assistante des lives OCD dédiée.",
  },
  {
    title: "Sélectionnez votre date dans le calendrier",
    text: "Consultez le calendrier mensuel interactif (ouvert dès le 1er décembre) pour visualiser immédiatement les jours disponibles et réserver votre date.",
  },
  {
    title: "Réservez votre créneau horaire garanti",
    text: "Choisissez un horaire libre adapté à la durée de votre live (1h30, 2h ou 4h). Le système verrouille automatiquement votre créneau contre toute double réservation.",
  },
  {
    title: "Choisissez parmi les 6 packages commerciaux",
    text: "Du Pack Découverte (1h30) jusqu'au Pack VIP avec annonce préalable ou au Pack Partenaire Mensuel, sélectionnez la formule adaptée à vos objectifs.",
  },
  {
    title: "Renseignez la fiche de visibilité de votre entreprise",
    text: "Indiquez vos produits, votre numéro de téléphone, votre adresse physique et vos réseaux sociaux afin que notre équipe les mette en avant pendant le direct.",
  },
  {
    title: "Recevez votre confirmation & passez en direct",
    text: "Votre inscription notifie instantanément l'administration OCD Live. Vous recevez votre référence officielle et passez en direct sur House of Challenge le jour J.",
  },
] as const;

export const plans = DEFAULT_PACKAGES.map((pkg) => ({
  id: pkg.id,
  name: pkg.name.replace(/^Formule\s+/i, ""),
  fullName: pkg.name,
  duration: pkg.durationLabel,
  price: pkg.priceFcfa,
  displayPrice: pkg.priceFcfa.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
  note: pkg.badge,
  detail: pkg.description,
}));

export type PlanId = string;

export const pillars = [
  {
    title: "Visibilité commerciale",
    description:
      "Faire connaître votre marque, votre téléphone et votre adresse physique bien au-delà des ventes immédiates du direct.",
  },
  {
    title: "Simplicité & rapidité",
    description:
      "Un parcours clair sur mobile comme sur ordinateur, accessible à tous les entrepreneurs sans complexité technique.",
  },
  {
    title: "Accompagnement humain dédié",
    description:
      "Accueil sur place chez Bovann Shop au Togo ou co-animation à distance partout en Afrique et dans le monde grâce à votre assistante des lives OCD.",
  },
  {
    title: "Opportunités économiques",
    description:
      "Connecter les entreprises à l'audience House of Challenge tout en créant des emplois et métiers du numérique pour les jeunes.",
  },
] as const;

export const metrics = [
  "Nombre d'entrepreneurs accompagnés en présentiel (Togo) et à distance (Afrique & monde).",
  "Volume d'appels, de messages WhatsApp et de visites générés grâce à l'affichage des coordonnées.",
  "Portée des diffusions et engagement pendant les directs sur House of Challenge.",
  "Taux de renouvellement des entreprises partenaires sur les formules mensuelles.",
] as const;

export const ambitions = [
  "Développer des émissions thématiques par secteur d'activité et par pays africain.",
  "Accompagner des centaines de commerçants, restaurateurs, artisans et PME chaque trimestre.",
  "Former et employer davantage de jeunes talents en animation de lives commerciaux, accompagnement client et communication digitale.",
  "Faire d'OCD Live la référence panafricaine de la promotion commerciale en direct.",
] as const;

export const comparison = {
  columns: ["Découverte", "Business", "Visibilité+", "Immersion 4h", "VIP Projecteur", "Partenaire"],
  rows: [
    { label: "Durée d'antenne", values: ["1h30", "1h30", "2h00", "4h00", "4h00", "4 × 2h / mois"] },
    { label: "Tarif de référence", values: ["15 000 FCFA", "20 000 FCFA", "35 000 FCFA", "45 000 FCFA", "65 000 FCFA", "150 000 FCFA"] },
    { label: "Présentiel Togo ou À distance", values: ["Les deux", "Les deux", "Les deux", "Les deux", "Les deux", "Les deux"] },
    { label: "Nom entreprise & téléphone diffusés", values: ["Inclus", "Inclus", "Inclus", "Inclus", "Inclus", "Inclus"] },
    { label: "Adresse physique & réseaux sociaux", values: ["En option", "Inclus", "Inclus", "Inclus", "Inclus", "Inclus"] },
    { label: "Stories promotionnelles", values: ["En option", "2 stories", "4 stories", "3 stories live", "Campagne J-2", "Hebdomadaires"] },
    { label: "Affiche & publication dédiée", values: ["En option", "En option", "Inclus", "En option", "Affiche VIP", "Pack mensuel"] },
    { label: "Annonce officielle avant le live", values: ["—", "—", "—", "—", "48h avant", "Avant chaque live"] },
  ],
  note: "Les tarifs, durées et prestations sont administrables par l'équipe OCD Live et confirmés lors de la validation de votre créneau.",
} as const;

export const sectors = [
  { id: "mode", label: "Mode & accessoires" },
  { id: "restauration", label: "Restauration" },
  { id: "beaute", label: "Beauté & soins" },
  { id: "artisanat", label: "Artisanat" },
  { id: "tech", label: "Tech & commerce" },
  { id: "services", label: "Services" },
] as const;

export type SectorId = (typeof sectors)[number]["id"];

export const sectorPhotos: readonly {
  src: string;
  sector: SectorId;
  alt: string;
  caption: string;
}[] = [
  {
    src: "/images/sector-fashion.jpg",
    sector: "mode",
    alt: "Présentation de tissus et vêtements colorés en boutique, photographie d'illustration",
    caption: "Boutiques de vêtements, tissus et créations : montrez vos coupes et diffusez votre adresse.",
  },
  {
    src: "/images/sector-food.jpg",
    sector: "restauration",
    alt: "Cheffe présentant des plats cuisinés, photographie d'illustration",
    caption: "Exemple présentiel : préparez 30 à 45 portions, venez chez Bovann Shop et faites découvrir votre carte avec nos assistantes.",
  },
  {
    src: "/images/sector-beauty.jpg",
    sector: "beaute",
    alt: "Gamme de soins cosmétiques disposée pour une démonstration, photographie d'illustration",
    caption: "Cosmétiques et soins : expliquez les usages et indiquez comment commander dans votre ville.",
  },
  {
    src: "/images/sector-artisan.jpg",
    sector: "artisanat",
    alt: "Artisane travaillant une pièce textile dans son atelier, photographie d'illustration",
    caption: "Créateurs et ateliers : valorisez votre savoir-faire et recevez des commandes sur WhatsApp.",
  },
  {
    src: "/images/sector-tech.jpg",
    sector: "tech",
    alt: "Démonstration d'un produit devant un smartphone sur trépied, photographie d'illustration",
    caption: "Téléphones et électronique : démontrez vos produits en direct et partagez vos garanties.",
  },
  {
    src: "/images/sector-services.jpg",
    sector: "services",
    alt: "Entrepreneuse présentant une offre de service en vidéo, photographie d'illustration",
    caption: "Idéal aussi à distance depuis toute l'Afrique : votre assistante des lives OCD au Togo porte votre voix à l'écran.",
  },
];

export const liveDemo = {
  steps: [
    {
      label: "00:00 · Ouverture",
      title: "Présentation de votre entreprise",
      text: "Introduction de votre activité, de votre ville/pays et du thème du direct sur House of Challenge.",
    },
    {
      label: "00:15 · Produits",
      title: "Démonstration en direct",
      text: "Sur place chez Bovann Shop au Togo ou à distance avec votre assistante des lives OCD, vos offres sont mises en valeur.",
    },
    {
      label: "00:45 · Échanges",
      title: "Questions des spectateurs",
      text: "Votre assistante des lives OCD dynamise l'audience et relaie les questions sur vos tarifs, tailles, portions ou livraisons.",
    },
    {
      label: "01:10 · Visibilité",
      title: "Diffusion de vos numéros & adresse",
      text: "Mise en avant claire de votre téléphone pro, WhatsApp, adresse physique et réseaux sociaux.",
    },
    {
      label: "01:25 · Conversion",
      title: "Prise de contact directe",
      text: "Les internautes repartent avec toutes vos coordonnées pour commander pendant et après le live.",
    },
  ],
} as const;

export const faqs = [
  {
    q: "Quelle est la différence entre le Live en Présentiel et le Live à Distance ?",
    a: "En Présentiel, vous venez physiquement avec vos produits dans les locaux de Bovann Shop au Togo, accueilli par notre équipe et nos assistantes des lives OCD. À Distance (Cameroun, Tchad, Centrafrique, reste de l'Afrique et international), vous participez depuis votre boutique ou domicile tandis qu'une assistante des lives OCD présente au Togo vous accompagne, co-anime et porte votre activité tout au long du direct.",
  },
  {
    q: "Quel est le rôle exact de l'assistante des lives OCD ?",
    a: "Véritable ambassadrice commerciale de votre passage, votre assistante des lives OCD prépare votre intervention avant l'antenne, co-anime la présentation de vos produits, interagit avec les commentaires des internautes et rappelle régulièrement votre nom d'entreprise, vos numéros de téléphone et votre adresse physique — particulièrement précieux lorsque vous participez à distance depuis un autre pays.",
  },
  {
    q: "À partir de quelle date puis-je réserver un créneau ?",
    a: "Le calendrier interactif ouvre les réservations à partir du 1er décembre (selon le planning officiel administré par l'équipe OCD Live). Les dates disponibles, partiellement réservées ou complètes s'affichent en temps réel.",
  },
  {
    q: "Comment le système évite-t-il les doubles réservations ?",
    a: "Dès qu'un créneau horaire (1h30, 2h ou 4h) est réservé par un entrepreneur, il est immédiatement verrouillé dans notre base de données et ne peut plus être sélectionné par un autre participant sur la même plage horaire.",
  },
  {
    q: "L'objectif est-il uniquement de vendre pendant le direct ?",
    a: "Non : au-delà des ventes immédiates pendant le live, OCD Live est avant tout un outil puissant de communication et de visibilité commerciale pour faire connaître votre entreprise, présenter votre adresse physique, diffuser vos numéros de téléphone et attirer durablement de nouveaux clients.",
  },
  {
    q: "Quelles sont les 6 formules commerciales proposées ?",
    a: "OCD Live propose 6 packages progressifs : Formule Découverte (1h30), Formule Business (1h30 + pack visibilité contacts & stories), Visibilité Renforcée (2h + affiche & publication), Immersion 4 Heures (tarif avantageux), Formule VIP Projecteur (4h + annonce officielle 48h avant) et Partenaire Mensuel (4 lives dans le mois).",
  },
  {
    q: "Que se passe-t-il juste après la validation de ma réservation ?",
    a: "Vous obtenez immédiatement votre référence officielle de suivi (téléchargeable en .txt et ajoutable à votre agenda téléphone) et l'administration OCD Live reçoit instantanément votre notification complète pour valider votre passage et organiser le briefing.",
  },
  {
    q: "Comment suivre ou modifier ma réservation ?",
    a: "Vous pouvez consulter à tout moment le statut de votre dossier grâce au bouton « Suivre ma réservation » avec votre code de référence (ex. OCD-20261205-XXXX), ou contacter directement l'équipe sur WhatsApp au +228 79 79 02 29.",
  },
] as const;

export interface Testimonial {
  quote: string;
  author: string;
  business: string;
  sector: string;
}

export const testimonials: readonly Testimonial[] = [];
