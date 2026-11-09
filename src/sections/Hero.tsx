import { useRef, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Globe2,
  Heart,
  MessageCircle,
  Play,
  Search,
  ShoppingBag,
  Star,
  ThumbsUp,
} from "lucide-react";
import {
  ActionLink,
  Marquee,
  ParallaxImage,
  Reveal,
  SectionLabel,
  SplitTitle,
  StepEdge,
  useMagnetic,
} from "@/components/Primitives";
import { Logo } from "@/components/Logo";
import { mission } from "@/data/content";
import { clamp, prefersReducedMotion, scrollToSection, useScrollFrame } from "@/lib/hooks";
import type { ParticipationMode } from "@/types/booking";
import { cn } from "@/utils/cn";

const reactions = [Heart, ThumbsUp, ShoppingBag, MessageCircle, Heart, Star, Heart, ThumbsUp];

export function Hero({
  selectedMode,
  onSelectMode,
  onOpenLookup,
}: {
  selectedMode: ParticipationMode;
  onSelectMode: (mode: ParticipationMode) => void;
  onOpenLookup: () => void;
}) {
  const hero = useRef<HTMLElement>(null);
  const cta = useMagnetic<HTMLAnchorElement>(0.3);

  useScrollFrame(() => {
    const el = hero.current;
    if (!el) return;
    const p = prefersReducedMotion() ? 0 : clamp(window.scrollY / window.innerHeight);
    el.style.setProperty("--hp", p.toFixed(4));
  });

  return (
    <div className="hero-group">
      <section ref={hero} className="hero" aria-labelledby="hero-title">
        <ParallaxImage
          src="/images/ocd-live-hero.jpg"
          alt="Illustration d'une entrepreneuse mettant ses produits en lumière pendant un live commercial"
          className="hero-image"
          position="72% 10%"
          priority
        />
        <div className="hero-shade" aria-hidden="true" />

        <div className="reactions" aria-hidden="true">
          {reactions.map((Icon, index) => (
            <span
              key={index}
              className={index % 3 === 0 ? "reaction-accent" : undefined}
              style={{ "--i": index, "--x": `${(((index * 37) % 5) - 2) * 14}px` } as CSSProperties}
            >
              <Icon size={17} />
            </span>
          ))}
        </div>

        <div className="hero-content">
          <h1 id="hero-title" className="hero-brand">
            <span className="sr-only">OCD Live</span>
            <Logo decorative className="logo-draw" />
          </h1>
          <SplitTitle
            as="h2"
            className="hero-headline"
            immediate
            delay={300}
            stagger={65}
            lines={["Votre activité", "mérite d'être vue."]}
          />
          <p className="hero-description">
            Présentez vos produits, faites connaître votre entreprise et diffusez vos numéros et adresses en direct auprès de millions d&apos;internautes — depuis le Togo, toute l&apos;Afrique ou l&apos;international.
          </p>
          <div className="hero-actions">
            <a
              ref={cta}
              href="#participation"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("participation");
              }}
              className="button button-accent press magnetic"
            >
              Choisir ma formule de live
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a
              href="#reservation"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("reservation");
              }}
              className="hero-secondary"
            >
              Réserver une date
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <button type="button" onClick={onOpenLookup} className="hero-secondary">
              Suivre ma réservation
              <Search size={15} aria-hidden="true" />
            </button>
            <a
              href="#apercu-live"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("apercu-live");
              }}
              className="hero-secondary"
            >
              Voir l&apos;aperçu
              <Play size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* CHOIX IMMÉDIAT DES DEUX CATÉGORIES DE PARTICIPATION */}
      <section
        id="participation"
        className="participation-section section-paper"
        aria-labelledby="participation-title"
      >
        <StepEdge />
        <SectionLabel label="Deux modes de participation" index="01" />
        <div className="section-container">
          <div className="participation-header">
            <div>
              <Reveal>
                <p className="eyebrow text-accent-deep">Dès maintenant · Togo, Afrique &amp; Monde</p>
              </Reveal>
              <SplitTitle
                id="participation-title"
                className="display-title"
                lines={["Comment souhaitez-vous", ["passer en direct ?", "text-muted"]]}
              />
            </div>
            <Reveal delay={100}>
              <p className="section-description">
                Que vous soyez installé au Togo ou situé au Cameroun, au Tchad, en Centrafrique ou ailleurs dans le monde, choisissez votre catégorie pour accéder directement au calendrier.
              </p>
            </Reveal>
          </div>

          <div className="participation-grid">
            {/* CATÉGORIE A : PRÉSENTIEL TOGO */}
            <article
              className={cn(
                "participation-card",
                selectedMode === "presentiel" && "is-selected"
              )}
            >
              <div className="participation-card-top">
                <p className="small-label">01 / Sur place au Togo</p>
                <span className="participation-icon" aria-hidden="true">
                  <Building2 size={22} />
                </span>
              </div>
              <h3>Live en Présentiel — Togo</h3>
              <p className="participation-loc">Dans les locaux officiels de Bovann Shop (Togo)</p>
              <p className="participation-lead">
                Vous vous déplacez physiquement chez <strong>Bovann Shop</strong> avec vos produits, accueilli et accompagné sur place par <strong>nos assistantes des lives OCD</strong> et notre équipe.
              </p>
              <ul className="participation-steps">
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Réservez votre date, votre créneau horaire et votre forfait en ligne.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Présentez-vous le jour convenu avec vos articles ou créations.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Mise en valeur en plateau avec nos assistantes et diffusion sur <strong>House of Challenge</strong>.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Présentez, vendez et diffusez vos numéros et votre adresse physique.</span>
                </li>
              </ul>
              <div className="participation-example">
                <strong>Exemple concret :</strong> un restaurateur prépare 30 à 45 portions, vient sur place chez Bovann Shop, présente ses plats aux côtés de l&apos;assistante des lives OCD et fait connaître durablement son établissement.
              </div>
              <button
                type="button"
                onClick={() => onSelectMode("presentiel")}
                className="button button-accent participation-cta press"
              >
                Réserver un Live en Présentiel (Togo)
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            </article>

            {/* CATÉGORIE B : À DISTANCE AFRIQUE & INTERNATIONAL */}
            <article
              className={cn(
                "participation-card participation-card-dark",
                selectedMode === "distanciel" && "is-selected"
              )}
            >
              <div className="participation-card-top">
                <p className="small-label text-accent">02 / Afrique &amp; International</p>
                <span className="participation-icon" aria-hidden="true">
                  <Globe2 size={22} />
                </span>
              </div>
              <h3>Live à Distance — International</h3>
              <p className="participation-loc">
                Cameroun · Tchad · Centrafrique · Afrique de l&apos;Ouest &amp; Monde
              </p>
              <p className="participation-lead">
                Participez sans vous déplacer au Togo : depuis votre boutique, votre atelier ou votre domicile, porté à l&apos;écran par <strong>votre assistante des lives OCD présente au Togo</strong>.
              </p>
              <ul className="participation-steps">
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Réservez votre session en ligne et transmettez les infos de votre entreprise.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Connectez-vous depuis votre lieu d&apos;activité le jour de votre passage.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Votre assistante des lives OCD co-anime, présente vos offres et relaie vos contacts.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Diffusion intégrale sur le compte officiel <strong>House of Challenge</strong>.</span>
                </li>
              </ul>
              <div className="participation-example is-dark">
                <strong>Zéro déplacement requis :</strong> vos coordonnées, numéros WhatsApp, adresse locale et réseaux sociaux sont mis en avant auprès de toute l&apos;audience africaine et de la diaspora.
              </div>
              <button
                type="button"
                onClick={() => onSelectMode("distanciel")}
                className="button button-accent participation-cta press"
              >
                Réserver un Live à Distance
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            </article>
          </div>
        </div>
      </section>

      <section id="projet" className="project-section section-paper" aria-labelledby="project-title">
        <SectionLabel label="Vision & visibilité" index="01B" />
        <div className="section-container project-intro">
          <div className="project-heading">
            <Reveal>
              <p className="eyebrow text-accent-deep">La vision OCD Live</p>
            </Reveal>
            <SplitTitle
              id="project-title"
              tabIndex={-1}
              className="display-title"
              lines={[
                "Bien plus qu'une vente,",
                "une vitrine durable",
                ["pour votre entreprise.", "text-muted"],
              ]}
            />
          </div>
          <Reveal delay={120}>
            <p className="project-description">
              <strong>OCD Live est votre levier de marketing, de communication et de visibilité commerciale.</strong>{" "}
              Au-delà des ventes réalisées pendant le direct, chaque émission fait connaître votre marque, présente vos produits et diffuse largement vos coordonnées, téléphones et adresses pour attirer durablement de nouveaux clients.
            </p>
          </Reveal>
          <div className="project-columns">
            <Reveal>
              <p className="small-label">01 / Notre vocation</p>
              <h3>
                Faire connaître votre nom,
                <br />
                vos produits et votre adresse.
              </h3>
              <p>
                Donner aux commerçants, restaurateurs, créateurs, PME et porteurs de projets d&apos;Afrique et d&apos;ailleurs une exposition directe devant une communauté active de plusieurs millions d&apos;abonnés.
              </p>
              <p className="project-belief">
                Chaque passage en direct transforme l&apos;attention numérique en contacts clients concrets.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <p className="small-label">02 / Ce que nous activons</p>
              <h3>
                Visibilité, co-animation
                <br />
                et accompagnement.
              </h3>
              <ul className="mission-list">
                {mission.map((item, index) => (
                  <li key={item} style={{ "--i": index } as CSSProperties}>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal>
            <div className="project-bottom">
              <p>
                Prêt à bloquer votre créneau de diffusion ?
                <br />
                <span className="text-muted">Consultez les dates disponibles dès le 1er décembre.</span>
              </p>
              <ActionLink href="#reservation">Accéder au calendrier de réservation</ActionLink>
            </div>
          </Reveal>
        </div>
        <Marquee />
      </section>
    </div>
  );
}
