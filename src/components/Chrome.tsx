import { useRef, useState, type MouseEvent } from "react";
import { ArrowUpRight, Lock, Menu, Search } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { Logo } from "@/components/Logo";
import { navItems, project } from "@/data/content";
import { clamp, scrollToSection, useScrollFrame } from "@/lib/hooks";
import { cn } from "@/utils/cn";

function goToHash(href: string, event: MouseEvent, after?: () => void) {
  if (!href.startsWith("#")) return;
  event.preventDefault();
  const id = href.slice(1);
  if (after) {
    after();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (id === "top") scrollToSection("top");
        else scrollToSection(id);
      })
    );
  } else {
    scrollToSection(id);
  }
}

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const el = bar.current;
    if (!el) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    el.style.transform = `scaleX(${max > 0 ? clamp(window.scrollY / max) : 0})`;
  });
  return (
    <div
      ref={bar}
      className="scroll-progress"
      style={{ transform: "scaleX(0)" }}
      aria-hidden="true"
    />
  );
}

export function Header({
  menuOpen,
  onToggleMenu,
  onOpenLookup,
  onOpenAdmin,
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useScrollFrame(() => {
    const y = window.scrollY;
    const nextScrolled = y > 48;
    setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
  });

  return (
    <header className={cn("site-header", scrolled && "header-solid")}>
      <a
        href="#top"
        onClick={(e) => goToHash("#top", e)}
        className="brand-link"
        aria-label={`${project.name}, accueil`}
      >
        <Logo />
        <span className="brand-description">
          OCD Live · Togo
          <br />
          Afrique &amp; International
        </span>
      </a>
      <nav className="desktop-nav" aria-label="Navigation principale">
        <a href="#participation" onClick={(e) => goToHash("#participation", e)}>
          Présentiel / Distance
        </a>
        <a href="#reservation" onClick={(e) => goToHash("#reservation", e)}>
          Calendrier
        </a>
        <a href="#formules" onClick={(e) => goToHash("#formules", e)}>
          Les 6 forfaits
        </a>
        <a href="#services" onClick={(e) => goToHash("#services", e)}>
          Visibilité
        </a>
        <a href="#faq" onClick={(e) => goToHash("#faq", e)}>
          FAQ
        </a>
      </nav>
      <div className="header-actions">
        <button
          type="button"
          onClick={onOpenLookup}
          className="header-lookup-btn"
          title="Suivre ma réservation"
        >
          <Search size={15} aria-hidden="true" />
          <span>Suivi</span>
        </button>
        <button
          type="button"
          onClick={onOpenAdmin}
          className="header-lookup-btn"
          title="Administration OCD Live"
        >
          <Lock size={14} aria-hidden="true" />
          <span>Admin</span>
        </button>
        <a
          href="#reservation"
          onClick={(e) => goToHash("#reservation", e)}
          className="header-contact press"
        >
          Réserver mon live
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <button
          className="menu-toggle round-button"
          type="button"
          onClick={onToggleMenu}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export function SiteMenu({
  open,
  onClose,
  onOpenLookup,
  onOpenAdmin,
}: {
  open: boolean;
  onClose: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
}) {
  if (!open) return null;
  return (
    <Dialog onClose={onClose} title="Explorer OCD Live" className="menu-dialog">
      <nav aria-label="Sections du site">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => goToHash(item.href, event, onClose)}
            className="menu-link"
          >
            <span>{item.n}</span>
            <span>{item.label}</span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        ))}
      </nav>
      <div className="menu-note">
        <p>{project.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLookup();
            }}
            className="header-lookup-btn !inline-flex !border-line-strong !text-ink"
          >
            <Search size={15} aria-hidden="true" />
            Suivre ma réservation
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="header-lookup-btn !inline-flex !border-line-strong !text-ink"
          >
            <Lock size={14} aria-hidden="true" />
            Espace Admin
          </button>
        </div>
      </div>
    </Dialog>
  );
}
