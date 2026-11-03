import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

let smoothScroll: Lenis | null = null;
export const getSmoothScroll = () => smoothScroll;

export function scrollToSection(id: string, focusId?: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const onComplete = () => {
    if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
  };
  if (smoothScroll) {
    smoothScroll.start();
    smoothScroll.scrollTo(target, { duration: 1.15, force: true, onComplete });
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth" });
    onComplete();
  }
}

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Passe à true (une seule fois) quand l'élément entre dans le viewport. */
export function useInView<T extends Element>(threshold = 0.15, rootMargin = "0px 0px -8% 0px") {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { setShown(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); observer.disconnect(); }
    }, { threshold, rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);
  return { ref, shown };
}

/** Défilement programmatique vers une position absolue (Lenis si actif). */
export function scrollToY(top: number) {
  if (smoothScroll) { smoothScroll.start(); smoothScroll.scrollTo(top, { duration: 1.1, force: true }); }
  else window.scrollTo({ top, behavior: prefersReducedMotion() ? "instant" : "smooth" });
}

/** L'utilisateur demande-t-il moins d'animations ? */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return reduced;
}

/** Version synchrone (pour les effets qui tournent dans un listener scroll). */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Écoute du scroll + resize, throttlée par requestAnimationFrame.
 * Les lectures du DOM sont limitees a une fois par image.
 */
export function useScrollFrame(cb: () => void, deps: unknown[] = []) {
  const saved = useRef(cb);
  saved.current = cb;

  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      saved.current();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };

    // Premier passage immédiat pour poser l'état initial.
    run();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Défilement lissé (Lenis) + navigation par ancres.
 * Désactivé si l'utilisateur préfère réduire les animations.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      anchors: false,
    });
    smoothScroll = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const link = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      requestAnimationFrame(() => {
        lenis.start();
        lenis.scrollTo(target as HTMLElement);
      });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      if (smoothScroll === lenis) smoothScroll = null;
    };
  }, [enabled]);
}

/** Progression verticale globale de la page (0 → 1), pour la barre de lecture. */
export function usePageProgress(ref: React.RefObject<HTMLElement | null>) {
  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    el.style.transform = `scaleX(${p.toFixed(4)})`;
  }, []);
}
