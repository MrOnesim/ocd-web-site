import { useCallback, useState } from "react";
import { Header, ScrollProgress, SiteMenu } from "@/components/Chrome";
import { type PlanId } from "@/data/content";
import { scrollToSection, useReducedMotion, useSmoothScroll } from "@/lib/hooks";
import { Contact } from "@/sections/Contact";
import { Footer } from "@/sections/Footer";
import { Hero } from "@/sections/Hero";
import { Services } from "@/sections/Services";
import { Audience } from "@/sections/Audience";
import { Process } from "@/sections/Process";
import { Pricing } from "@/sections/Pricing";
import { Ecosystem, Perspectives, Values } from "@/sections/Ecosystem";
import { LivePreview } from "@/sections/LivePreview";
import { Voices } from "@/sections/Voices";
import { Faq } from "@/sections/Faq";
import { StickyCta } from "@/components/StickyCta";
import { track } from "@/lib/analytics";
import { Cursor, Intro } from "@/components/Motion";
import { PinnedStage } from "@/components/Primitives";

export default function App() {
  const reducedMotion = useReducedMotion();
  useSmoothScroll(!reducedMotion);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("");

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const selectPlan = (plan: PlanId) => {
    setSelectedPlan(plan);
    track("plan_select", { plan: plan || "none" });
    requestAnimationFrame(() => scrollToSection("project-form", "project-name"));
  };

  return (
    <div id="top" className="bg-paper text-ink">
      <a href="#projet" className="skip-link" onClick={(event) => {
        event.preventDefault();
        scrollToSection("projet", "project-title");
      }}>Aller au contenu</a>
      <Intro />
      <Cursor />
      <ScrollProgress />
      <Header
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      <SiteMenu open={menuOpen} onClose={closeMenu} />

      <main>
      <Hero />
      <div className="stage-group">
        <PinnedStage src="/images/sector-tech.jpg" position="center 40%" eyebrow="En direct sur les réseaux sociaux"
          alt="Une vendeuse présente des chaussures en direct devant son téléphone, photographie d'illustration"
          lines={["Présentez.", "Échangez.", ["Développez.", "text-accent"]]} />
        <Services />
      </div>
      <LivePreview />
      <Audience />
      <Process />
      <div className="stage-group">
        <PinnedStage src="/images/ocd-live-hero.jpg" position="center" eyebrow="La régie s'occupe du reste"
          alt="Un opérateur derrière une caméra pendant une diffusion, photographie d'illustration"
          lines={["Votre moment", ["sous les projecteurs.", "text-accent"]]} />
        <Pricing selected={selectedPlan} onSelect={selectPlan} />
      </div>
      <Values />
      <Ecosystem />
      <Perspectives />
      <Voices />
      <Faq />
      <Contact selectedPlan={selectedPlan} onPlanChange={(plan) => { setSelectedPlan(plan); track("plan_form_select", { plan: plan || "none" }); }} />
      </main>
      <Footer />
      <StickyCta selectedPlan={selectedPlan} />
    </div>
  );
}
