import type { CSSProperties } from "react";
import { Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal, ScrubText, SectionLabel, SplitTitle } from "@/components/Primitives";
import { ambitions, metrics, pillars } from "@/data/content";

export function Values() {
  return <section id="valeurs" className="values-section" aria-labelledby="values-title">
    <SectionLabel label="Notre valeur ajoutée" index="07 · A" />
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
    <SectionLabel label="Notre écosystème de diffusion" index="07" light />
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
        <Reveal delay={80} className="ecosystem-copy"><p>OCD Live diffuse l&apos;ensemble des sessions sur le compte officiel de <strong>House of Challenge</strong>, annoncé comme rassemblant entre <strong>3 et 4 millions d&apos;abonnés</strong>, en synergie avec les locaux physiques de <strong>Bovann Shop au Togo</strong> et l&apos;accompagnement sur mesure de nos <strong>assistantes des lives OCD</strong>.</p>
          <p>En présentiel au Togo comme à distance depuis le Cameroun, le Tchad, la Centrafrique ou l&apos;international, chaque entrepreneur bénéficie de cette audience constituée pour faire connaître sa marque et diffuser ses coordonnées.</p>
          <div className="transparency-note"><p className="eyebrow">La transparence, avant tout</p><p>Le nombre d&apos;abonnés annoncé ne garantit pas un volume fixe de ventes pendant le live : OCD Live agit avant tout comme un puissant levier de notoriété, de communication et d&apos;opportunités commerciales.</p></div>
        </Reveal>
      </div>
    </div>
  </section>;
}

export function Perspectives() {
  return <section id="perspectives" className="perspectives-section" aria-labelledby="perspectives-title">
    <SectionLabel label="Objectifs & perspectives" index="07 · B" />
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
