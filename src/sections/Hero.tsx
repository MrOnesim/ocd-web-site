import { useRef, type CSSProperties } from "react";
import { ArrowUpRight, Heart, MessageCircle, Play, ShoppingBag, Star, ThumbsUp } from "lucide-react";
import { ActionLink, Marquee, ParallaxImage, Reveal, SectionLabel, SplitTitle, StepEdge, useMagnetic } from "@/components/Primitives";
import { Logo } from "@/components/Logo";
import { mission } from "@/data/content";
import { clamp, prefersReducedMotion, useScrollFrame } from "@/lib/hooks";

const reactions = [Heart, ThumbsUp, ShoppingBag, MessageCircle, Heart, Star, Heart, ThumbsUp];

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  const cta = useMagnetic<HTMLAnchorElement>(0.3);

  useScrollFrame(() => {
    const el = hero.current;
    if (!el) return;
    const p = prefersReducedMotion() ? 0 : clamp(window.scrollY / window.innerHeight);
    el.style.setProperty("--hp", p.toFixed(4));
  });

  return <div className="hero-group">
    <section ref={hero} className="hero" aria-labelledby="hero-title">
      <ParallaxImage src="/images/ocd-live-hero.jpg" alt="Illustration d'une entrepreneuse mettant ses produits en lumière pendant un live commercial" className="hero-image" position="center" priority />
      <div className="hero-shade" aria-hidden="true" />

      <div className="reactions" aria-hidden="true">
        {reactions.map((Icon, index) => <span key={index} className={index % 3 === 0 ? "reaction-accent" : undefined}
          style={{ "--i": index, "--x": `${((index * 37) % 5 - 2) * 14}px` } as CSSProperties}><Icon size={17} /></span>)}
      </div>

      <div className="hero-content">
        <h1 id="hero-title" className="hero-brand"><span className="sr-only">OCD</span><Logo decorative className="logo-draw" /></h1>
        <SplitTitle as="h2" className="hero-headline" immediate delay={350} stagger={70}
          lines={["Votre activité", "mérite d'être vue."]} />
        <p className="hero-description">Donnez de la visibilité à votre activité et touchez de nouveaux clients grâce aux réseaux sociaux.</p>
        <div className="hero-actions">
          <a ref={cta} href="#formules" className="button button-accent press magnetic">Découvrir nos formules<ArrowUpRight size={18} aria-hidden="true" /></a>
          <a href="#apercu-live" className="hero-secondary">Voir la vidéo<Play size={16} aria-hidden="true" /></a>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true"><span /></div>
    </section>

    <section id="projet" className="project-section section-paper" aria-labelledby="project-title">
      <StepEdge />
      <SectionLabel label="Le projet" index="01" />
      <div className="section-container project-intro">
        <div className="project-heading">
          <Reveal><p className="eyebrow text-accent-deep">L'ambition OCD</p></Reveal>
          <SplitTitle id="project-title" tabIndex={-1} className="display-title"
            lines={["Derrière chaque activité,", "une histoire", ["à faire connaître.", "text-muted"]]} />
        </div>
        <Reveal delay={120}><p className="project-description"><strong>OCD rapproche les entrepreneurs des consommateurs.</strong> Un projet de promotion commerciale qui donne aux commerçants, artisans, prestataires et entreprises un espace pour présenter leur activité en direct sur les réseaux sociaux.</p></Reveal>
        <div className="project-columns">
          <Reveal><p className="small-label">01 / Notre vision</p><h3>Rendre la visibilité<br />plus accessible.</h3>
            <p>Faire du numérique un véritable levier de développement économique, notamment pour les petites et moyennes entreprises qui n'ont pas les moyens de mener de grandes campagnes publicitaires.</p>
            <p className="project-belief">Chaque entrepreneur mérite une véritable opportunité de présenter son activité au monde.</p>
          </Reveal>
          <Reveal delay={100}><p className="small-label">02 / Notre mission</p><h3>Créer des liens.<br />Ouvrir des possibilités.</h3>
            <ul className="mission-list">{mission.map((item, index) => <li key={item} style={{ "--i": index } as CSSProperties}>{item}</li>)}</ul>
          </Reveal>
        </div>
        <Reveal><div className="project-bottom"><p>Vous avez le savoir-faire.<br /><span className="text-muted">Donnons-lui la place qu'il mérite.</span></p><ActionLink href="#services">Découvrir notre accompagnement</ActionLink></div></Reveal>
      </div>
      <Marquee />
    </section>
  </div>;
}
