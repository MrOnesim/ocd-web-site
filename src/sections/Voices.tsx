import { ActionLink, SectionLabel, SplitTitle } from "@/components/Primitives";
import { track } from "@/lib/analytics";

const topics = [
  { label: "L'accompagnement", text: "Comment votre assistante des lives OCD a préparé et porté votre passage à l'écran." },
  { label: "Les échanges", text: "Ce que les questions du public ont permis de clarifier ou d'améliorer." },
  { label: "Les rendez-vous", text: "Les contacts obtenus, les retours constatés et les limites à garder en tête." },
];

export function Voices() {
  return <section id="temoignages" className="voices-section" aria-labelledby="voices-title">
    <SectionLabel label="La parole aux entrepreneurs" index="08" light />
    <div className="section-container voices-layout">
      <div className="voices-mark" aria-hidden="true">“</div>
      <div className="voices-copy">
        <SplitTitle id="voices-title" className="display-title" lines={["Les premiers retours", ["auront ici leur place.", "text-muted"]]} />
        <p className="section-description">Aucun témoignage n'est publié avant d'avoir été recueilli avec l'accord de l'entrepreneur. Les retours seront partagés après les premiers lives, avec leurs résultats déclarés et leurs limites.</p>
        <div className="voices-topics">
          {topics.map((topic, index) => <div key={topic.label}>
            <p className="small-label">0{index + 1}</p>
            <h3>{topic.label}</h3>
            <p>{topic.text}</p>
            <span aria-hidden="true">Retour à venir</span>
          </div>)}
        </div>
        <ActionLink href="#contact" onClick={() => track("voice_cta_click")}>Partager mon expérience</ActionLink>
      </div>
    </div>
  </section>;
}
