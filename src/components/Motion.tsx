import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { prefersReducedMotion } from "@/lib/hooks";

const INTRO_KEY = "ocd-intro-seen";

function shouldPlayIntro() {
  if (typeof window === "undefined" || prefersReducedMotion()) return false;
  try { return !sessionStorage.getItem(INTRO_KEY); } catch { return true; }
}

/** Rideau d'introduction : le logo se dessine, puis le rideau se lève. Une fois par session. */
export function Intro() {
  const [play] = useState(shouldPlayIntro);
  const [done, setDone] = useState(!play);
  useLayoutEffect(() => {
    if (!play) return;
    document.documentElement.style.setProperty("--intro", "1.45s");
    try { sessionStorage.setItem(INTRO_KEY, "1"); } catch { /* stockage indisponible */ }
    const timer = window.setTimeout(() => setDone(true), 2500);
    return () => window.clearTimeout(timer);
  }, [play]);
  if (done) return null;
  return <div className="intro" aria-hidden="true">
    <div className="intro-inner">
      <Logo decorative className="logo-draw" />
      <p className="intro-tag">Votre activité mérite d'être vue.</p>
      <span className="intro-bar"><i /></span>
    </div>
  </div>;
}

/** Curseur suiveur (pointeur fin uniquement), agrandi sur les éléments interactifs. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    el.classList.add("is-active");
    let x = -100, y = -100, tx = -100, ty = -100, frame = 0;
    const move = (event: PointerEvent) => {
      tx = event.clientX; ty = event.clientY;
      const target = event.target as HTMLElement | null;
      el.classList.toggle("is-link", !!target?.closest("a, button, summary, select, label, input, textarea"));
      el.classList.toggle("is-media", !!target?.closest("[data-cursor='media']") && !target?.closest("a, button"));
      el.classList.remove("is-out");
    };
    const leave = () => el.classList.add("is-out");
    const loop = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <div ref={ref} className="cursor" aria-hidden="true"><span>Défiler</span></div>;
}
