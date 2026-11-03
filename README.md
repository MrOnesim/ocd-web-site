# OCD

Site de présentation d'OCD : promotion commerciale, lives et visibilité numérique pour les entrepreneurs.
Réalisé avec React, TypeScript, Vite et Tailwind CSS. L'entrée est `src/App.tsx`.

## Démarrage

```bash
npm install
npm run dev
npm run build
node scripts/verify-dist.mjs
```

> **Déploiement :** publier le dossier `dist/` entier, pas uniquement `dist/index.html`.
> Les photos, la vidéo et le logo sont des fichiers séparés ; `verify-dist.mjs` échoue
> explicitement si l'un d'eux manque.

## Contenu et configuration

- `src/config/site.ts` : coordonnées, réservation et mesure d'audience. Les champs inconnus
  restent vides — ne pas inventer d'adresse, d'audience ni de résultat.
- `src/data/content.ts` : services, secteurs, formules, FAQ, ambitions, témoignages à venir.
- `src/index.css`, `motion.css`, `features.css` : identité orange, animations, modules récents.
- `public/` : images du projet, vidéo MP4 locale, fichier de licence de la police et logo.

### Coordonnées officielles

Renseigner WhatsApp, e-mail, téléphone, adresse, réseaux sociaux et URL canonique dans
`siteConfig`. Mettre `booking.enabled` à `true` uniquement après avoir branché et testé une
réservation réelle. Aujourd'hui, le formulaire prépare un dossier **local** : aucun envoi,
paiement ou créneau confirmé.

### Mesure d'audience

Aucun outil ni script tiers n'est chargé. Les événements sont mis en file dans
`window.__OCD_EVENTS` (100 derniers) et transmis à Umami ou au `dataLayer` **seulement** si
`siteConfig.analytics.provider` est configuré. `track()` respecte Do Not Track. Événements :
`plan_select`, `plan_form_select`, `dossier_generated`, `dossier_copied`, `dossier_downloaded`,
`sector_filter`, `live_demo_step`, `live_demo_toggle`, `faq_open`, `voice_cta_click`.

## Données et transparence

- Les tarifs (5 000, 15 000, 40 000 FCFA) sont **indicatifs** et à confirmer officiellement.
- L'audience de House of Challenge est **annoncée** (3 à 4 millions d'abonnés) et ne garantit
  ni spectateurs, ni contacts, ni ventes.
- Les images sont des illustrations ; elles ne montrent ni clients, ni locaux, ni réalisations
  OCD. Elles sont générées par IA. La vidéo est un extrait Pexels montrant une préparation de tournage, et non un vrai live OCD. Les crédits sont dans la fenêtre
  « Informations & transparence ».
- Aucun témoignage n'est publié avant d'avoir été recueilli avec accord ; l'emplacement est
  actuellement un espace explicite « retours à venir ».
- Le brouillon du formulaire est **optionnel**, stocké dans `localStorage` et effaçable.
  Il n'est jamais envoyé.

## Images et vidéo

`src/data/content.ts` référence exclusivement des images présentes dans `public/images/`.
`<SmartImage>` utilise directement ces fichiers et se replie sur l'image d'accueil puis sur un dégradé si une image ne répond pas.
`public/videos/live-commerce-demo.mp4` est une vidéo locale accessible par le lecteur natif dans « Aperçu d'un live ». Un second `<source>` Pexels est proposé en secours.

## SEO et partage

- Métadonnées Open Graph/Twitter avec l'image réelle `public/images/ocd-live-hero.jpg`.
- Données structurées `Organization`, `Service` et `FAQPage` dans `index.html`.
- `public/sitemap.xml` n'est pas généré tant que le domaine est inconnu :

```bash
SITE_URL="https://votre-domaine.tld" node scripts/generate-sitemap.mjs
```

Déclarer ensuite le sitemap dans `robots.txt` et l'URL canonique dans `siteConfig.url`.

## Vérification

```bash
npx tsc --noEmit
npx playwright install --with-deps chromium
npx playwright test
```

12 tests couvrent : contenu, six services, formules et présélection, génération/copie/téléchargement
du dossier, brouillon local, aperçu de live, filtres par secteur, FAQ, témoignages, navigation
animée, modales, responsive, images locales, lecture vidéo et accessibilité axe-core (A/AA).

Les tests tournent avec `prefers-reduced-motion: reduce` par défaut ; deux tests dédiés réactivent
les animations. Un audit automatisé ne remplace pas une évaluation humaine.

## Performance en production

```bash
npx @lhci/cli autorun
```

`lighthouserc.json` définit des budgets (accessibilité, LCP, CLS, poids total) sur `dist/`.
Installer Lighthouse CI est volontairement laissé à la CI pour ne pas alourdir l'application.
