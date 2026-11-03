import { useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal, SectionLabel, SplitTitle, StepEdge } from "@/components/Primitives";
import { SmartImage } from "@/components/SmartImage";
import { services } from "@/data/content";
import { clamp, scrollToY, useReducedMotion, useScrollFrame } from "@/lib/hooks";
import { cn } from "@/utils/cn";

const ease = (x: number) => x * x * (3 - 2 * x);
const pad = (n: number) => String(n).padStart(2, "0");

function Card({ service, index, setRef }: { service: (typeof services)[number]; index: number; setRef?: (node: HTMLElement | null) => void }) {
  return <article ref={setRef} className="stack-card" data-cursor="media">
    <SmartImage src={service.image} alt={service.alt} position={service.position} />
    <div className="stack-caption">
      <p className="stack-count">{pad(index + 1)} / {pad(services.length)}</p>
      <h3>{service.title}</h3>
      <p className="stack-short">{service.short}</p>
      <p className="stack-desc">{service.description}</p>
    </div>
  </article>;
}

function Intro({ active, onPick }: { active: number; onPick?: (index: number) => void }) {
  return <div className="stack-intro">
    <SplitTitle id="services-title" className="display-title" lines={["Vous avez le talent.", ["Faisons-le savoir.", "text-muted"]]} />
    <Reveal delay={150}><p className="section-description">Du premier visuel au passage en direct, un accompagnement pour mettre votre activité en lumière.</p></Reveal>
    <ol className="stack-list" aria-label="Nos six services">
      {services.map((service, index) => <li key={service.id}>
        {onPick ? <button type="button" onClick={() => onPick(index)} aria-current={active === index ? "step" : undefined}
          className={cn(active === index && "is-active")}>
          <span>{pad(index + 1)}</span>{service.title}
        </button> : <><span>{pad(index + 1)}</span>{service.title}</>}
      </li>)}
    </ol>
    <a href="#formules" className="text-link stack-link">Trouver ma formule<ArrowRight size={16} aria-hidden="true" /></a>
  </div>;
}

function StackedServices() {
  const track = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const count = services.length;

  useScrollFrame(() => {
    const el = track.current;
    if (!el) return;
    const vh = window.innerHeight;
    const raw = clamp(-el.getBoundingClientRect().top / vh, 0, count - 1);
    const floor = Math.floor(raw);
    const progress = floor + ease(raw - floor);
    el.style.setProperty("--raw", raw.toFixed(4));

    cards.current.forEach((card, index) => {
      if (!card) return;
      const delta = progress - index;
      const image = card.querySelector("img");
      if (delta <= -1 || delta >= 1.02) { card.style.visibility = "hidden"; return; }
      card.style.visibility = "visible";
      if (delta < 0) {
        card.style.transform = `translate3d(0, ${(-delta * 100).toFixed(2)}%, 0)`;
        card.style.filter = "none";
        if (image) image.style.transform = `translate3d(0, ${(-delta * 18).toFixed(2)}%, 0) scale(1.12)`;
      } else {
        const k = Math.min(delta, 1);
        card.style.transform = `translate3d(0, ${(-k * 3).toFixed(2)}%, 0) scale(${(1 - k * 0.09).toFixed(4)})`;
        card.style.filter = `brightness(${(1 - k * 0.55).toFixed(3)})`;
        if (image) image.style.transform = "translate3d(0, 0, 0) scale(1.12)";
      }
      card.style.zIndex = String(index);
    });

    const next = Math.min(count - 1, Math.round(raw));
    if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
  }, [count]);

  const pick = (index: number) => {
    const el = track.current;
    if (!el) return;
    scrollToY(window.scrollY + el.getBoundingClientRect().top + index * window.innerHeight + 2);
  };

  return <div ref={track} className="stack-track" style={{ height: `${(count + 0.4) * 100}svh` }}>
    <div className="stack-sticky">
      <div className="section-container stack-grid">
        <Intro active={active} onPick={pick} />
        <div className="stack-cards">
          <div className="stack-progress" aria-hidden="true">
            {services.map((service, index) => <span key={service.id}><i style={{ "--i": index } as CSSProperties} /></span>)}
          </div>
          {services.map((service, index) => <Card key={service.id} service={service} index={index}
            setRef={(node) => { cards.current[index] = node; }} />)}
          <p className="stack-note">Visuels d'illustration, non représentatifs de réalisations OCD.</p>
        </div>
      </div>
    </div>
  </div>;
}

function StaticServices() {
  return <div className="section-container stack-static">
    <Intro active={-1} />
    <div className="stack-static-grid">
      {services.map((service, index) => <Card key={service.id} service={service} index={index} />)}
    </div>
    <p className="image-note">Visuels d'illustration, non représentatifs de réalisations OCD.</p>
  </div>;
}

export function Services() {
  const reduced = useReducedMotion();
  return <section id="services" className="services-section section-paper" aria-labelledby="services-title">
    <StepEdge />
    <SectionLabel label="Nos services" index="02" />
    {reduced ? <StaticServices /> : <StackedServices />}
  </section>;
}
