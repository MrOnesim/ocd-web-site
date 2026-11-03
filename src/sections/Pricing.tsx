import { ArrowUpRight, Check, Plus } from "lucide-react";
import { CountUp, Reveal, SectionLabel, SplitTitle, StepEdge, TiltCard } from "@/components/Primitives";
import { comparison, plans, type PlanId } from "@/data/content";
import { cn } from "@/utils/cn";

export function Pricing({ selected, onSelect }: { selected: PlanId; onSelect: (id: PlanId) => void }) {
  return <section id="formules" className="pricing-section" aria-labelledby="pricing-title">
    <StepEdge />
    <SectionLabel label="Nos formules commerciales" index="06" />
    <div className="section-container">
      <div className="pricing-heading">
        <SplitTitle id="pricing-title" className="display-title" lines={["À chaque ambition,", ["sa formule.", "text-muted"]]} />
        <Reveal delay={120}><p className="section-description">Choisissez le temps de présentation qui correspond à votre activité et à votre budget.</p></Reveal>
      </div>
      <div className="pricing-grid">{plans.map((plan, index) => <Reveal key={plan.id} delay={index * 110} className="pricing-cell">
        <TiltCard className={cn(index === 1 && "plan-glow")}>
          <article className={cn("pricing-plan", index === 1 && "pricing-plan-dark", selected === plan.id && "pricing-plan-selected")}>
            <div className="plan-top"><p className="small-label">0{index + 1} / {plan.note}</p>{selected === plan.id && <Check size={18} aria-label="Formule sélectionnée" />}</div>
            <h3>{plan.name}</h3>
            <p className="plan-price"><CountUp value={plan.price} duration={1300 + index * 250} /><span>FCFA</span></p>
            <div className="plan-description"><p className="plan-duration">{plan.duration}{plan.id === "intensive" && <span>dans la semaine</span>}</p><p>{plan.detail}</p></div>
            <button type="button" onClick={() => onSelect(plan.id)} className="plan-button press">{selected === plan.id ? "Continuer avec cette formule" : "Choisir cette formule"}<ArrowUpRight size={18} aria-hidden="true" /></button>
          </article>
        </TiltCard>
      </Reveal>)}</div>

      <details className="compare" open>
        <summary>
          <span>Comparer les formules en détail</span>
          <span className="compare-summary-note">Durée, passages, options et tarifs<Plus size={18} aria-hidden="true" /></span>
        </summary>
        <div className="compare-scroll" tabIndex={0} role="region" aria-label="Tableau comparatif des formules" data-lenis-prevent>
          <table>
            <caption className="sr-only">Comparaison des trois formules OCD. Les inclusions et prestations complémentaires restent à confirmer.</caption>
            <thead><tr><th scope="col">Critère</th>{comparison.columns.map((column, index) => <th key={column} scope="col" className={cn(index === 1 && "is-featured")}>{column}</th>)}</tr></thead>
            <tbody>{comparison.rows.map((row) => <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((value, index) => <td key={index} className={cn(index === 1 && "is-featured")}>
                {value === "À confirmer" || value === "En option" ? <span className={cn("compare-pending", value === "En option" && "is-option")}>{value}</span> : value}
              </td>)}
            </tr>)}</tbody>
          </table>
        </div>
        <p className="compare-note">{comparison.note} <a href="#faq">Consulter la FAQ</a>.</p>
      </details>
    </div>
  </section>;
}
