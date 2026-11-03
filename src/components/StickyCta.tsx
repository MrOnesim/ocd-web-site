import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { plans, type PlanId } from "@/data/content";
import { scrollToSection, useScrollFrame } from "@/lib/hooks";
import { track } from "@/lib/analytics";

/** Barre d'action mobile : apparaît au défilement, disparaît à l'approche du contact. */
export function StickyCta({ selectedPlan }: { selectedPlan: PlanId }) {
  const [visible, setVisible] = useState(false);
  const plan = plans.find((item) => item.id === selectedPlan);

  useScrollFrame(() => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const contact = document.getElementById("contact");
    const contactTop = contact ? contact.getBoundingClientRect().top + y : Number.POSITIVE_INFINITY;
    const next = y > vh * 0.85 && y + vh * 0.9 < contactTop;
    setVisible((current) => (current === next ? current : next));
  });

  if (!visible) return null;

  return <div className="sticky-cta" role="region" aria-label="Action rapide">
    <div className="sticky-cta-copy">
      <small>{plan ? `Formule ${plan.name}` : "Votre activité mérite d'être vue"}</small>
      <b>{plan ? `${plan.displayPrice} FCFA · ${plan.duration}` : "Préparez votre projet"}</b>
    </div>
    <button type="button" onClick={() => {
      if (plan) { track("sticky_cta_dossier", { plan: plan.id }); scrollToSection("project-form", "project-name"); }
      else { track("sticky_cta_formules"); scrollToSection("formules"); }
    }}>
      {plan ? "Finaliser mon dossier" : "Choisir ma formule"}
      <ArrowUpRight size={16} aria-hidden="true" />
    </button>
  </div>;
}
