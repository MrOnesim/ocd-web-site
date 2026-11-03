import type { CSSProperties } from "react";
import { Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal, ScrubText, SectionLabel, SplitTitle } from "@/components/Primitives";
import { ambitions, metrics, pillars } from "@/data/content";

export function Values() {
  return <section className="values-section" aria-labelledby="values-title">
    <SectionLabel label="Notre valeur ajoutée" index="07" />
    <div className="section-container">
      <ScrubText id="values-title" className="scrub-statement"
        text="Quatre piliers pour offrir à chaque entrepreneur plus de visibilité, plus de proximité, plus d'accessibilité et plus d'opportunités."
        highlight={["visibilité", "proximité", "d'accessibilité", "d'opportunités"]} />
      <div className="pillars">{pillars.map((pillar, index) => <Reveal key={pillar.title} delay={index * 90} className="pillar">
        <p className="pillar-index" aria-hidden="true">0{index + 1}</p><h3>{pillar.title}</h3><p>{pillar.description}</p>
      </Reveal>)}</div>
    </div>
  </section>;
}

const orbit = ["Entrepreneurs", "Lives", "Consommateurs", "Stories"];

export function Ecosystem() {
  return <section id="ecosysteme" className="ecosystem-section" aria-labelledby="ecosystem-title">
    <SectionLabel label="Notre écosystème de diffusion" index="08" light />
    <div className="section-container">
      <SplitTitle id="ecosystem-title" className="display-title" lines={["Une communauté.", ["De nouvelles rencontres.", "text-accent"]]} />
      <div className="ecosystem-layout">
        <div>
          <Reveal><p className="eyebrow">Communauté de diffusion envisagée</p><p className="community-name">House of<br />Challenge<span className="text-accent">.</span></p></Reveal>
          <div className="signal" aria-hidden="true">
            {[0, 1, 2, 3].map((ring) => <span key={ring} className="signal-ring" style={{ "--r": ring } as CSSProperties} />)}
            <div className="signal-core"><Logo decorative /></div>
            <div className="signal-orbit">
              {orbit.map((label, index) => <span key={label} style={{ "--a": `${index * 90}deg` } as CSSProperties}><b>{label}</b></span>)}
            </div>
          </div>
        </div>
        <Reveal delay={80} className="ecosystem-copy"><p>OCD envisage de s'appuyer sur la communauté numérique de <strong>House of Challenge</strong>, annoncée comme comptant entre <strong>3 et 4 millions d'abonnés</strong>.</p>
          <p>L'ambition : rapprocher les professionnels d'une audience déjà constituée, pour transformer cette audience potentielle en une opportunité de visibilité.</p>
          <div className="transparency-note"><p className="eyebrow">La transparence, avant tout</p><p>Le nombre d'abonnés annoncé ne garantit pas le nombre de spectateurs pendant les lives. Les statistiques d'audience et les modalités du partenariat restent à documenter.</p></div>
        </Reveal>
      </div>
    </div>
  </section>;
}

export function Perspectives() {
  return <section id="perspectives" className="perspectives-section" aria-labelledby="perspectives-title">
    <SectionLabel label="Objectifs & perspectives" index="09" />
    <div className="section-container perspectives-layout">
      <div>
        <SplitTitle id="perspectives-title" className="display-title" lines={["Grandir ensemble.", ["Mesurer le chemin.", "text-muted"]]} />
        <Reveal delay={120}><p className="section-description">Un projet qui veut progresser avec les entrepreneurs, en s'appuyant sur des résultats concrets et mesurables.</p><p className="image-note">Les indicateurs ci-contre sont des objectifs de suivi, et non des résultats déjà obtenus.</p></Reveal>
      </div>
      <Reveal delay={80} className="perspectives-details">
        <details open><summary><h3>Des résultats à mesurer</h3><Plus size={20} aria-hidden="true" /></summary><ul>{metrics.map((metric) => <li key={metric}>{metric}</li>)}</ul></details>
        <details><summary><h3>Des ambitions à construire</h3><Plus size={20} aria-hidden="true" /></summary><p>À moyen et long terme, OCD souhaite :</p><ul>{ambitions.map((ambition) => <li key={ambition}>{ambition}</li>)}</ul></details>
      </Reveal>
    </div>
  </section>;
}
