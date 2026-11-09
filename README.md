# OCD Live — Plateforme Commerciale & Réservation de Lives (House of Challenge / Bovann Shop)

Plateforme complète de promotion commerciale, de visibilité numérique et de réservation de diffusions en direct sur le compte officiel **House of Challenge**, conçue selon la vision de **Bovann** pour les entrepreneurs du **Togo**, d'**Afrique** et de l'**International**.

## Démarrage rapide

```bash
npm install
npm run dev      # Développement (Front React + API Node + Base SQLite sur le même port)
npm run check    # Typecheck + Tests unitaires/API/SSR + Build SEO + Vérification dist/
```

### Déploiement en production

```bash
npm run build
npm start        # Serveur Node complet (sert dist/ + /api/* + SPA /admin sur 0.0.0.0:3000)
```

---

## Fonctionnalités clés de la plateforme

### 1. Deux modes de participation dès l'arrivée (`#participation`)
- **Catégorie A — Live en Présentiel (Togo · Locaux Bovann Shop)** : l'entrepreneur se déplace physiquement à Lomé avec ses produits (ex. restaurateur avec 30 à 45 portions), accueilli et co-animé sur place avec nos **assistantes des lives OCD**.
- **Catégorie B — Live à Distance (Afrique & International)** : conçu pour les entrepreneurs situés au **Cameroun, Tchad, Centrafrique**, en Afrique de l'Ouest/Centrale et dans la diaspora, portés à l'écran par **une assistante des lives OCD dédiée présente au Togo**.

### 2. Système de réservation interactif en 6 étapes (`#reservation`)
1. **Choix du mode de live** (*Présentiel Togo* ou *À distance International*).
2. **Calendrier mensuel interactif** (ouvert à partir du **1er décembre**, pilotable par l'admin) affichant clairement les dates *Disponibles*, *Partiellement réservées*, *Déjà réservées (Complet)* et *Indisponibles*.
3. **Sélection du créneau horaire** adapté à la durée du forfait (`1h30`, `2h00`, `4h00`) avec **verrouillage transactionnel anti-double-réservation** (`BEGIN IMMEDIATE` SQLite + détection de chevauchement d'horaires).
4. **Sélection parmi les 6 packages commerciaux**.
5. **Fiche complète participant & entreprise** (identité, téléphone, WhatsApp, e-mail, pays avec indicatif auto, ville, entreprise, secteur, produits/services, adresse physique, numéro pro, réseaux sociaux, préparation) + **Aperçu temps réel du Bandeau TV de visibilité en direct**.
6. **Récapitulatif & Confirmation officielle** : attribution d'une référence unique (`OCD-YYYYMMDD-XXXX`), téléchargement `.txt`, invitation calendrier `.ics` (*Ajouter à mon agenda*), passerelle WhatsApp directe et suivi ultérieur via **« Suivre ma réservation »**.

### 3. Les 6 Packages Commerciaux administrables (`#formules` & `/admin`)
1. **Formule Découverte** — `15 000 FCFA` (`1h30`)
2. **Formule Business** — `20 000 FCFA` (`1h30` + bandeau complet coordonnées/adresse + 2 stories)
3. **Visibilité Renforcée** — `35 000 FCFA` (`2h00` + affiche digitale + publication dédiée + 4 stories)
4. **Immersion 4 Heures** — `45 000 FCFA` (`4h00` consécutives à tarif préférentiel)
5. **Formule VIP Projecteur** — `65 000 FCFA` (`4h00` + annonce officielle 48h avant + campagne teasing)
6. **Partenaire Mensuel** — `150 000 FCFA` (`4 lives × 2h00 / mois` + campagne 30 jours)

Tous les prix, durées, intitulés, badges et avantages sont modifiables à chaud depuis l'espace administrateur.

### 4. Tableau de bord administratif sécurisé (`/admin`)
Accessible via `/admin` (ou le bouton *Admin* dans l'en-tête / pied de page) :
- **Identifiants initiaux par défaut** :
  - E-mail : `admin@ocdlive.org` (modifiable via `ADMIN_EMAIL`)
  - Mot de passe : `OcdLive2026!` (modifiable depuis l'onglet *Paramètres & Sécurité* ou via `ADMIN_PASSWORD`)
- **Rubriques incluses** :
  - **Vue générale** : KPIs réservations, répartition Présentiel/Distanciel, répartition par Pays & Forfaits, CA prévisionnel & encaissé, prochains lives.
  - **Réservations & Participants** : filtres multicritères, fiche complète, validation/annulation en un clic, suivi des paiements (*Mobile Money, Flooz, TMoney, Orange Money, Espèces…*), affectation de l'assistante, contact WhatsApp client en 1 clic et **Export CSV/Excel**.
  - **Lives programmés & Historique**.
  - **Dates & Disponibilités** : date de lancement, jours d'ouverture, grille horaire, exceptions de dates et blocage de créneaux.
  - **Les 6 Forfaits** : édition complète en temps réel.
  - **Notifications** : centre d'alertes intégré enregistrant automatiquement chaque notification administration (au format narratif exact souhaité par Bovann) et chaque confirmation participant, doublé d'un envoi e-mail automatique dès que `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` et `SMTP_PASS` sont renseignés.
