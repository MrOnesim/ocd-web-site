import { useRef } from "react";
import { Plus } from "lucide-react";
import { ActionLink, Reveal, SectionLabel, SplitTitle } from "@/components/Primitives";
import { steps } from "@/data/content";
import { clamp, prefersReducedMotion, useScrollFrame } from "@/lib/hooks";

export function Process() {
  const list = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const el = list.current;
    if (!el) return;
    const vh = window.innerHeight;
    const reduced = prefersReducedMotion();
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--pp", reduced ? "1" : clamp((vh * 0.62 - rect.top) / rect.height).toFixed(4));
    el.querySelectorAll<HTMLElement>(".process-step").forEach((step) => {
      step.classList.toggle("is-past", reduced || step.getBoundingClientRect().top < vh * 0.62);
    });
  });

  return <section id="fonctionnement" className="process-section" aria-labelledby="process-title">
    <SectionLabel label="Comment ça fonctionne" index="05" />
    <div className="section-container process-layout">
      <div className="process-intro">
        <SplitTitle id="process-title" className="display-title" lines={["Du premier contact", ["au premier live.", "text-muted"]]} />
        <Reveal delay={120}><p className="section-description">Un parcours en six étapes, pour vous concentrer sur ce que vous faites le mieux.</p><ActionLink href="#formules">Faire le premier pas</ActionLink></Reveal>
      </div>
      <div ref={list} className="process-list">
        <span className="process-rail" aria-hidden="true"><i /></span>
        {steps.map((step, index) => <details key={step.title} className="process-step" open={index === 0 ? true : undefined}>
          <summary><span className="step-number">0{index + 1}</span><h3>{step.title}</h3><Plus size={20} aria-hidden="true" /></summary>
          <p>{step.text}</p>
        </details>)}
      </div>
    </div>
  </section>;
}
