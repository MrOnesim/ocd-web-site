import { Fragment, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { ArrowUpRight, Asterisk } from "lucide-react";
import { cn } from "@/utils/cn";
import { clamp, getSmoothScroll, prefersReducedMotion, useInView, useScrollFrame } from "@/lib/hooks";
import { SmartImage, useImageFallback } from "./SmartImage";

/* ------------------------------------------------------------------ Reveal */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, shown } = useInView<HTMLDivElement>(0.08, "0px 0px -32px 0px");
  return <div ref={ref} className={cn("rise", shown && "rise-on", className)} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ------------------------------------------- Titre révélé mot par mot (masque) */
type Line = string | [string, string];

export function SplitTitle({ lines, as = "h2", className, id, tabIndex, delay = 0, immediate = false, stagger = 45 }: {
  lines: Line[]; as?: ElementType; className?: string; id?: string; tabIndex?: number; delay?: number; immediate?: boolean; stagger?: number;
}) {
  const { ref, shown } = useInView<HTMLElement>(0.2);
  const Tag = as;
  let index = 0;
  return <Tag ref={ref} id={id} tabIndex={tabIndex} className={cn("split-title", (shown || immediate) && "is-in", className)}>
    {lines.map((line, lineIndex) => {
      const [text, tone] = typeof line === "string" ? [line, ""] : line;
      const words = text.split(" ");
      return <span key={lineIndex} className={cn("split-line", tone)}>
        {words.map((word, wordIndex) => <Fragment key={wordIndex}>
          <span className="split-word"><span className="split-inner" style={{ "--d": `${delay + index++ * stagger}ms` } as CSSProperties}>{word}</span></span>
          {wordIndex < words.length - 1 ? " " : ""}
        </Fragment>)}
        {lineIndex < lines.length - 1 ? " " : ""}
      </span>;
    })}
  </Tag>;
}

/* ---------------------------------- Texte qui s'illumine au fil du défilement */
export function ScrubText({ text, highlight = [], className, id, as = "h2" }: {
  text: string; highlight?: string[]; className?: string; id?: string; as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");
  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { el.style.setProperty("--sp", "1"); return; }
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    el.style.setProperty("--sp", clamp((vh * 0.88 - rect.top) / (rect.height + vh * 0.42)).toFixed(4));
  });
  const Tag = as;
  return <Tag ref={ref} id={id} className={cn("scrub-text", className)} style={{ "--n": words.length } as CSSProperties}>
    {words.map((word, index) => <Fragment key={index}>
      <span className={cn("scrub-word", highlight.some((h) => word.toLowerCase().startsWith(h)) && "scrub-accent")} style={{ "--i": index } as CSSProperties}>{word}</span>
      {index < words.length - 1 ? " " : ""}
    </Fragment>)}
  </Tag>;
}

/* ------------------------------------------------------------ Compteur animé */
export function CountUp({ value, duration = 1600 }: { value: number; duration?: number }) {
  const { ref, shown } = useInView<HTMLSpanElement>(0.4);
  const [current, setCurrent] = useState(() => (prefersReducedMotion() ? value : 0));
  useEffect(() => {
    if (!shown) return;
    if (prefersReducedMotion()) { setCurrent(value); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = clamp((now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 4);
      setCurrent(k === 1 ? value : Math.round((value * eased) / 100) * 100);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shown, value, duration]);
  const format = (n: number) => n.toLocaleString("fr-FR").replace(/\s/g, "\u00a0");
  return <span ref={ref} className="count-up"><span aria-hidden="true">{format(current)}</span><span className="sr-only">{format(value)}</span></span>;
}

/* ---------------------------------------- Carte inclinable 3D + reflet lumineux */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.classList.remove("is-hover");
  };
  return <div ref={ref} className={cn("tilt", className)}
    onPointerMove={(event) => {
      const el = ref.current;
      if (!el || event.pointerType !== "mouse" || prefersReducedMotion()) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      el.style.setProperty("--rx", `${((0.5 - y) * 9).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - 0.5) * 11).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      el.classList.add("is-hover");
    }}
    onPointerLeave={reset}>
    {children}
  </div>;
}

/* --------------------------------------------------------- Effet magnétique */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.translate = `${(dx * strength).toFixed(1)}px ${(dy * strength).toFixed(1)}px`;
    };
    const leave = () => { el.style.translate = "0px 0px"; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [strength]);
  return ref;
}

/* ------------------------------------------- Image dévoilée par découpe (clip) */
export function ClipReveal({ src, alt, className, position = "center", caption }: {
  src: string; alt: string; className?: string; position?: string; caption?: string;
}) {
  const { ref, shown } = useInView<HTMLElement>(0.2);
  return <figure ref={ref} className={cn("clip-reveal", shown && "is-in", className)}>
    <div className="clip-frame"><SmartImage src={src} alt={alt} position={position} /></div>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

/* --------------------------------------------------------- Image en parallaxe */
export function ParallaxImage({ src, alt, className, position = "center", priority = false, amount = 38 }: {
  src: string; alt: string; className?: string; position?: string; priority?: boolean; amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const { current, failed, onError } = useImageFallback(src);
  useScrollFrame(() => {
    if (!ref.current || !image.current) return;
    if (prefersReducedMotion()) { image.current.style.transform = "none"; return; }
    const rect = ref.current.getBoundingClientRect();
    const height = window.innerHeight;
    if (rect.bottom < 0 || rect.top > height) return;
    const y = ((height - rect.top) / (height + rect.height) - 0.5) * amount;
    image.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(1.06)`;
  });
  return <div ref={ref} className={cn("parallax-image", failed && "smart-fallback", className)}>
    {!failed && <img ref={image} src={current} width={1600} height={1000} onError={onError} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ objectPosition: position }} />}
  </div>;
}

/* ------------------------- Scène photo épinglée, recouverte par la section suivante */
export function PinnedStage({ src, alt, position, eyebrow, lines }: {
  src: string; alt: string; position?: string; eyebrow: string; lines: Line[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const el = ref.current;
    if (!el?.parentElement) return;
    if (prefersReducedMotion()) { el.style.setProperty("--sp", "0"); return; }
    const top = el.parentElement.getBoundingClientRect().top;
    el.style.setProperty("--sp", clamp(-top / window.innerHeight).toFixed(4));
  });
  return <div ref={ref} className="stage">
    <ParallaxImage src={src} alt={alt} position={position} className="stage-image" amount={60} />
    <div className="stage-shade" aria-hidden="true" />
    <div className="stage-caption">
      <p className="stage-eyebrow"><span className="live-dot" aria-hidden="true" />{eyebrow}</p>
      <SplitTitle as="p" lines={lines} className="stage-title" stagger={60} />
    </div>
  </div>;
}

/* ------------------------------------------------- Bordure en marches (step-edge) */
const steps = [0.36, 0.78, 0.5, 1, 0.64, 0.3, 0.9, 0.55, 0.82, 0.42, 0.7, 0.26, 0.94, 0.6];

export function StepEdge() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.parentElement?.getBoundingClientRect().top ?? window.innerHeight;
    const p = clamp((window.innerHeight - top) / (window.innerHeight * 0.72));
    el.style.setProperty("--p", prefersReducedMotion() ? "0" : p.toFixed(4));
  });
  return <div ref={ref} className="step-edge" aria-hidden="true">
    {steps.map((height, index) => <span key={index} className="step-bar" style={{ "--h": height } as CSSProperties} />)}
  </div>;
}

/* -------------------------------------------------------- En-tête de section */
export function SectionLabel({ label, index, light = false }: { label: string; index: string; light?: boolean }) {
  const { ref, shown } = useInView<HTMLDivElement>(0.5);
  return <div ref={ref} className={cn("section-label", light && "section-label-light", shown && "is-in")}>
    <span><i aria-hidden="true" />{label}</span>
    <span className="section-index">OCD / {index}</span>
    <span className="section-label-end">Votre activité. Notre engagement.</span>
  </div>;
}

/* ------------------------------------------------------------ Bouton / lien */
export function ActionLink({ children, href, onClick, className }: {
  children: ReactNode; href?: string; onClick?: () => void; className?: string;
}) {
  const content = <><span className="action-icon"><ArrowUpRight size={18} aria-hidden="true" /></span><span>{children}</span></>;
  return href ? <a className={cn("action-link press", className)} href={href} onClick={onClick}>{content}</a>
    : <button type="button" className={cn("action-link press", className)} onClick={onClick}>{content}</button>;
}

/* ----------------------- Bandeau défilant réactif à la vitesse du scroll (2 rangées) */
function MarqueeRow({ items, reverse = false, outline = false }: { items: string[]; reverse?: boolean; outline?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let frame = 0;
    let lastY = window.scrollY;
    let direction = 1;
    let boost = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(el);
    const loop = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (delta !== 0) direction = delta > 0 ? 1 : -1;
      const velocity = Math.abs(getSmoothScroll()?.velocity ?? delta);
      boost += (Math.min(velocity, 60) * 0.18 - boost) * 0.12;
      if (visible) {
        const half = el.scrollWidth / 2;
        x -= (0.55 + boost) * direction * (reverse ? -1 : 1);
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        el.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [reverse]);
  return <div ref={track} className={cn("marquee", outline && "marquee-outline")} aria-hidden="true">
    {[0, 1].map((copy) => <div key={copy} className="marquee-group">
      {items.map((item) => <span key={item}>{item}<Asterisk className="marquee-star" aria-hidden="true" /></span>)}
    </div>)}
  </div>;
}

export function Marquee() {
  const items = ["Entrepreneurs", "Commerçants", "Artisans", "Créateurs", "Entreprises"];
  const second = ["Lives commerciaux", "Publicité", "Affiches", "Stories", "Mise en scène", "Régie"];
  return <div className="marquee-window" role="img" aria-label={`${items.join(", ")}. ${second.join(", ")}.`}>
    <MarqueeRow items={items} />
    <MarqueeRow items={second} reverse outline />
  </div>;
}
