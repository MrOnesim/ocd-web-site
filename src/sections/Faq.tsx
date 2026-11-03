import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { Reveal, SectionLabel, SplitTitle } from "@/components/Primitives";
import { faqs } from "@/data/content";
import { track } from "@/lib/analytics";
import { cn } from "@/utils/cn";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);


  return <section id="faq" className="faq-section" aria-labelledby="faq-title">
    <SectionLabel label="Questions fréquentes" index="11" />
    <div className="section-container faq-layout">
      <div className="faq-intro">
        <SplitTitle id="faq-title" className="display-title" lines={["Tout ce qu'il faut", ["savoir avant de vous lancer.", "text-muted"]]} />
        <Reveal delay={120}><p className="section-description">Une réponse manque ? Écrivez-nous : nous ajouterons les précisions nécessaires lorsque les coordonnées officielles seront disponibles.</p>
          <a href="#contact" className="text-link">Poser une autre question<ArrowUpRight size={17} aria-hidden="true" /></a></Reveal>
      </div>
      <div className="faq-list">
        {faqs.map((item, index) => {
          const isOpen = open === index;
          return <div key={item.q} className={cn("faq-item", isOpen && "is-open")}>
            <h3>
              <button type="button" id={`faq-question-${index}`} aria-expanded={isOpen} aria-controls={`faq-answer-${index}`}
                onClick={() => {
                  const next = isOpen ? null : index;
                  setOpen(next);
                  if (next !== null) track("faq_open", { question: item.q });
                }}>
                <span className="faq-number">0{index + 1}</span>
                <span>{item.q}</span>
                <Plus size={19} aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} className="faq-answer" aria-hidden={!isOpen}>
              <div><p>{item.a}</p></div>
            </div>
          </div>;
        })}
      </div>
    </div>
  </section>;
}
