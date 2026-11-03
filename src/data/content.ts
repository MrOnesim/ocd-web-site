export const project = {
  name: "OCD",
  tagline: "Votre activité mérite d'être vue.",
  domain: "Promotion commerciale · Publicité · Visibilité numérique",
};

export const navItems = [
  { n: "01", label: "Le projet", href: "#projet" },
  { n: "02", label: "Nos services", href: "#services" },
  { n: "03", label: "Aperçu d'un live", href: "#apercu-live" },
  { n: "04", label: "Pour qui ?", href: "#pour-qui" },
  { n: "05", label: "Comment ça marche", href: "#fonctionnement" },
  { n: "06", label: "Nos formules", href: "#formules" },
  { n: "07", label: "Notre écosystème", href: "#ecosysteme" },
  { n: "08", label: "Questions fréquentes", href: "#faq" },
  { n: "09", label: "Rejoindre l'aventure", href: "#contact" },
];

export const mission = [
  "Donner de la visibilité aux entrepreneurs et aux commerçants.",
  "Faciliter la promotion des produits et des services.",
  "Permettre aux entreprises de présenter directement leurs activités.",
  "Favoriser les interactions entre vendeurs et consommateurs.",
  "Générer des opportunités commerciales et de nouveaux prospects.",
  "Rendre la publicité numérique plus accessible.",
];

export const services = [
  {
    id: "lives",
    title: "Lives commerciaux",
    short: "Votre activité, en direct.",
    description: "Présentez vos produits, vos services et votre savoir-faire lors d'émissions en direct sur les réseaux sociaux. Un espace pour raconter votre activité et échanger avec les internautes.",
    image: "/images/ocd-live-hero.jpg",
    alt: "Illustration d'une entrepreneuse présentant un produit devant une caméra",
    position: "76% center",
  },
  {
    id: "promotion",
    title: "Publicité & promotion",
    short: "Faites connaître votre univers.",
    description: "Mettez en avant votre entreprise, vos offres et vos points de vente pour renforcer votre visibilité et permettre à de nouveaux consommateurs de vous découvrir.",
    image: "/images/sector-artisan.jpg",
    alt: "Entrepreneuse dans son atelier de création textile, photographie d'illustration",
    position: "center 35%",
  },
  {
    id: "affiches",
    title: "Affiches publicitaires",
    short: "Une image qui vous ressemble.",
    description: "Des supports graphiques conçus pour présenter votre activité, vos produits et vos offres commerciales de façon claire et attractive.",
    image: "/images/ocd-campaign.svg",
    alt: "Exemple de direction graphique OCD : À vous de briller",
    position: "center",
  },
  {
    id: "stories",
    title: "Stories promotionnelles",
    short: "Prolongez votre présence.",
    description: "La diffusion de contenus promotionnels en stories permet de prolonger la visibilité de vos offres, avant et après votre présentation en direct.",
    image: "/images/sector-services.jpg",
    alt: "Créatrice de contenu préparant une vidéo sur son téléphone, photographie d'illustration",
    position: "60% center",
  },
  {
    id: "produits",
    title: "Mise en scène des produits",
    short: "Vos produits, sous leur meilleur jour.",
    description: "Préparation et décoration de l'espace de présentation pour créer un cadre adapté à votre univers et mettre vos produits en valeur.",
    image: "/images/sector-beauty.jpg",
    alt: "Mise en scène de produits cosmétiques sur des supports minéraux",
    position: "center",
  },
  {
    id: "regie",
    title: "Régie commerciale",
    short: "Concentrez-vous sur votre métier.",
    description: "L'organisation technique des diffusions et l'accompagnement pendant les présentations vous permettent de vous concentrer sur votre activité et vos échanges avec le public.",
    image: "/images/ocd-live-hero.jpg",
    alt: "Opérateur derrière une caméra de diffusion, photographie d'illustration",
    position: "38% center",
  },
];

export const audiences = [
  "Entrepreneurs & promoteurs d'entreprises",
  "Commerçants & distributeurs",
  "Boutiques de vêtements & accessoires",
  "Téléphones & produits électroniques",
  "Restaurants & établissements de restauration",
  "Artisans & créateurs",
  "Prestataires de services",
  "Petites, moyennes & grandes entreprises",
];

export const steps = [
  { title: "Réservez votre créneau", text: "Choisissez la formule adaptée à vos besoins. La disponibilité du créneau et les modalités de réservation devront être confirmées avec l'équipe OCD." },
  { title: "Préparez votre présentation", text: "Rassemblez vos produits, vos informations commerciales, vos offres et les coordonnées que vous souhaitez communiquer aux consommateurs." },
  { title: "Installez-vous, on s'occupe du cadre", text: "L'équipe prépare l'espace de présentation et les équipements nécessaires à votre diffusion." },
  { title: "À vous de prendre la parole", text: "Présentez votre activité pendant le live : racontez votre histoire, montrez vos produits et expliquez vos services." },
  { title: "Échangez avec les internautes", text: "Les internautes découvrent vos offres, posent leurs questions et peuvent vous contacter directement." },
  { title: "Transformez les rencontres en opportunités", text: "Reprenez contact avec les prospects obtenus et développez votre clientèle. Les contacts, commandes et ventes ne sont pas garantis." },
];

export const plans = [
  { id: "decouverte", name: "Découverte", fullName: "Formule découverte", price: 5000, displayPrice: "5 000", duration: "1 heure de live", detail: "Un premier rendez-vous pour faire découvrir votre activité.", note: "Pour faire le premier pas" },
  { id: "visibilite", name: "Visibilité", fullName: "Formule visibilité", price: 15000, displayPrice: "15 000", duration: "4 heures de live", detail: "Le temps de présenter votre univers et d'échanger avec le public.", note: "Pour prendre le temps" },
  { id: "intensive", name: "Intensive", fullName: "Formule intensive", price: 40000, displayPrice: "40 000", duration: "3 passages de 4 heures", detail: "Plusieurs rendez-vous dans la semaine pour renforcer votre présence.", note: "Pour multiplier les rendez-vous" },
] as const;

export type PlanId = (typeof plans)[number]["id"] | "";

export const extras = ["Affiche publicitaire", "Stories promotionnelles", "Décoration & mise en scène", "Accompagnement technique"];

export const pillars = [
  { title: "Visibilité", description: "Une possibilité supplémentaire de faire découvrir votre activité à une audience numérique importante." },
  { title: "Proximité", description: "Une présentation directe de votre univers et de vraies interactions avec les consommateurs." },
  { title: "Accessibilité", description: "Différentes formules de promotion pour tenir compte des capacités financières des professionnels." },
  { title: "Opportunités", description: "De nouveaux contacts commerciaux et des possibilités de vente à développer." },
];

export const metrics = [
  "Nombre d'entrepreneurs accompagnés",
  "Nombre de diffusions réalisées",
  "Nombre de spectateurs par live",
  "Niveau d'interaction des internautes",
  "Nombre de contacts commerciaux générés",
  "Commandes et ventes déclarées par les participants",
  "Taux de satisfaction et de fidélisation des entrepreneurs",
];

export const ambitions = [
  "Élargir le réseau d'entrepreneurs partenaires.",
  "Collaborer avec d'autres communautés numériques et influenceurs.",
  "Créer des émissions commerciales thématiques.",
  "Organiser des campagnes promotionnelles collectives.",
  "Développer un système de réservation en ligne.",
  "Étendre les activités à de nouvelles villes et de nouveaux marchés.",
];

/* ---------------------------------------------------------- Aperçu d'un live */
export const liveDemo = {
  note: "Vidéo d'illustration et parcours simulé : aucune diffusion OCD réelle n'est en cours.",
  steps: [
    { label: "Réservation", title: "Un créneau, une formule", text: "L'entrepreneur choisit sa formule et réserve son passage. La disponibilité et les modalités restent à confirmer avec l'équipe." },
    { label: "Installation", title: "Le décor prend forme", text: "L'espace est préparé et décoré pour mettre les produits en valeur, avec les équipements nécessaires à la diffusion." },
    { label: "Live", title: "Votre activité en direct", text: "L'entrepreneur présente son histoire, ses produits et ses services. La régie accompagne techniquement le direct." },
    { label: "Échanges", title: "Les questions arrivent", text: "Les internautes découvrent les offres, posent leurs questions et peuvent contacter directement le commerçant." },
    { label: "Contacts", title: "Les opportunités continuent", text: "Après le live, l'entrepreneur reprend contact avec les prospects. Aucun contact, ordre ou vente n'est garanti." },
  ],
  chat: [
    { author: "Awa", text: "Bonjour ! Je découvre votre univers." },
    { author: "Koffi", text: "Quelles sont les tailles disponibles ?" },
    { author: "Mariam", text: "Le coffret est-il encore en stock ?" },
    { author: "Ismaël", text: "Comment vous contacter après le live ?" },
    { author: "OCD", text: "Merci à toutes et à tous pour vos questions." },
  ],
};

/* ------------------------------------------------------------------- Secteurs */
export const sectors = [
  { id: "mode", label: "Mode & accessoires" },
  { id: "beaute", label: "Beauté & soins" },
  { id: "food", label: "Food & restauration" },
  { id: "craft", label: "Artisanat & création" },
  { id: "tech", label: "Tech & téléphones" },
  { id: "services", label: "Services & prestations" },
] as const;

export type SectorId = (typeof sectors)[number]["id"];

export const sectorPhotos: { src: string; alt: string; sector: SectorId; caption: string }[] = [
  { src: "/images/sector-fashion.jpg", alt: "Entrepreneuse dans sa boutique de vêtements, visuel d'illustration", sector: "mode", caption: "Mode & accessoires" },
  { src: "/images/sector-beauty.jpg", alt: "Créatrice présentant ses soins en boutique, visuel d'illustration", sector: "beaute", caption: "Beauté & soins" },
  { src: "/images/sector-food.jpg", alt: "Chef dressant un plat dans sa cuisine, visuel d'illustration", sector: "food", caption: "Food & restauration" },
  { src: "/images/sector-artisan.jpg", alt: "Artisane créant des bijoux dans son atelier, visuel d'illustration", sector: "craft", caption: "Artisanat & création" },
  { src: "/images/sector-tech.jpg", alt: "Commerçant montrant un téléphone dans sa boutique, visuel d'illustration", sector: "tech", caption: "Tech & téléphones" },
  { src: "/images/sector-services.jpg", alt: "Créatrice de contenu dans son studio, visuel d'illustration", sector: "services", caption: "Services & prestations" },
];

/* ------------------------------------------------------ Détail des formules */
export const comparison = {
  columns: ["Découverte", "Visibilité", "Intensive"],
  rows: [
    { label: "Durée de diffusion", values: ["1 heure", "4 heures", "3 passages de 4 heures"] },
    { label: "Nombre de passages", values: ["1", "1", "3 dans la semaine"] },
    { label: "Présentation par l'entrepreneur", values: ["Oui", "Oui", "Oui"] },
    { label: "Accompagnement technique", values: ["À confirmer", "À confirmer", "À confirmer"] },
    { label: "Affiche, stories, décoration", values: ["En option", "En option", "En option"] },
    { label: "Tarif indicatif", values: ["5 000 FCFA", "15 000 FCFA", "40 000 FCFA"] },
  ],
  note: "Les inclusions, les prestations complémentaires et leurs tarifs restent à confirmer officiellement. Seules les durées et les prix annoncés lors de la présentation initiale sont repris ici.",
};

/* ---------------------------------------------------------------- FAQ */
export const faqs = [
  { q: "Qui présente mon activité pendant le live ?", a: "C'est vous, l'entrepreneur, qui présentez directement votre activité, vos produits et vos services. OCD prépare le cadre, assure la régie et vous accompagne techniquement pendant la diffusion." },
  { q: "Combien de temps dure une présentation ?", a: "Selon la formule choisie : 1 heure, 4 heures, ou 3 passages de 4 heures dans la semaine. Ces durées reprennent les tarifs annoncés lors de la présentation initiale du projet et restent à confirmer officiellement." },
  { q: "Les tarifs affichés sont-ils définitifs ?", a: "Non. Les 5 000, 15 000 et 40 000 FCFA sont des tarifs indicatifs annoncés lors de la présentation du projet. Ils doivent être confirmés, ainsi que les conditions de réservation et de paiement." },
  { q: "Que dois-je préparer avant mon passage ?", a: "Vos produits, vos informations commerciales (prix, offres, disponibilités), votre présentation et les coordonnées que vous souhaitez rendre visibles. L'équipe s'occupe de l'espace et des équipements." },
  { q: "Puis-je ajouter une affiche ou des stories ?", a: "Oui. Des prestations complémentaires — affiches, stories promotionnelles, décoration, accompagnement technique — peuvent être proposées selon vos besoins. Leurs conditions et leurs tarifs restent à préciser." },
  { q: "L'audience annoncée est-elle garantie ?", a: "Non. House of Challenge est annoncée comme comptant entre 3 et 4 millions d'abonnés, mais ces chiffres ne garantissent ni le nombre de spectateurs pendant un live, ni les contacts, commandes ou ventes. Les statistiques d'audience et les modalités du partenariat restent à documenter." },
  { q: "Comment réserver un créneau ?", a: "Les coordonnées officielles et les modalités de réservation sont encore à compléter. En attendant, le formulaire de cette page prépare un dossier de présentation de votre projet, que vous pouvez copier ou télécharger. Il ne s'agit pas d'une réservation." },
  { q: "Mes informations sont-elles envoyées ou conservées ?", a: "Non : aucune donnée n'est envoyée depuis ce site. Si vous activez la conservation du brouillon, vos réponses restent uniquement dans votre navigateur et peuvent être effacées à tout moment avec le bouton prévu." },
];

