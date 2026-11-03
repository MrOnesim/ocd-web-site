import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { ClipReveal, Reveal, SectionLabel, SplitTitle } from "@/components/Primitives";
import { audiences } from "@/data/content";
import { SectorGallery } from "@/components/SectorGallery";
import { useInView } from "@/lib/hooks";
import { cn } from "@/utils/cn";

export function Audience() {
  const list = useInView<HTMLUListElement>(0.2);
  return <section id="pour-qui" className="audience-section" aria-labelledby="audience-title">
    <SectionLabel label="À qui s'adresse OCD ?" index="04" />
    <div className="section-container audience-layout">
      <ClipReveal className="audience-figure" src="/images/sector-artisan.jpg" position="center 40%"
        alt="Une entrepreneuse dans son atelier textile, photographie d'illustration"
        caption="Le savoir-faire mérite de rencontrer son public." />
      <div className="audience-copy">
        <SplitTitle id="audience-title" className="display-title"
          lines={["Votre métier.", "Votre savoir-faire.", ["Votre place ici.", "text-accent-deep"]]} />
        <Reveal delay={120}><p className="section-description">Une boutique, un atelier, une entreprise : toute activité qui souhaite se faire connaître peut trouver sa place dans l'aventure OCD.</p></Reveal>
        <ul ref={list.ref} className={cn("audience-list stagger-list", list.shown && "is-in")}>
          {audiences.map((audience, index) => <li key={audience} style={{ "--i": index } as CSSProperties}><span className="list-index">0{index + 1}</span>{audience}</li>)}
        </ul>
        <a href="#contact" className="text-link">Et si c'était votre tour ?<ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
    </div>
    <div className="section-container"><SectorGallery /></div>
  </section>;
}
