import { useRef, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { cn } from "@/utils/cn";
import { navItems } from "@/data/content";
import { scrollToSection, usePageProgress, useScrollFrame } from "@/lib/hooks";
import { Logo } from "./Logo";
import { Dialog } from "./Dialog";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  usePageProgress(ref);
  return <div ref={ref} className="scroll-progress" style={{ transform: "scaleX(0)" }} aria-hidden="true" />;
}

export function SiteMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <Dialog title="Explorer OCD" className="menu-dialog" onClose={onClose}>
    <nav aria-label="Navigation complète" id="site-menu">
      {navItems.map((item, index) => <a key={item.href} href={item.href} onClick={(event) => {
        event.preventDefault();
        onClose();
        requestAnimationFrame(() => scrollToSection(item.href.slice(1)));
      }} className="menu-link" style={{ animationDelay: `${index * 35}ms` }}>
        <span>{item.n}</span><span>{item.label}</span><ArrowUpRight size={18} aria-hidden="true" />
      </a>)}
    </nav>
    <p className="menu-note">Votre activité mérite d'être vue.</p>
  </Dialog>;
}

export function Header({ menuOpen, onToggleMenu }: { menuOpen: boolean; onToggleMenu: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useScrollFrame(() => setScrolled(window.scrollY > 70));
  return <header className={cn("site-header", scrolled && "header-scrolled")}>
    <a href="#top" className="brand-link" aria-label="OCD, accueil">
      <Logo /><span className="brand-description">Promotion commerciale<br />& visibilité numérique</span>
    </a>
    <nav className="desktop-nav" aria-label="Navigation principale">
      <a href="#projet">Le projet</a><a href="#services">Nos services</a><a href="#formules">Nos formules</a>
    </nav>
    <div className="header-actions">
      <a href="#contact" className="header-contact press">Parlons de votre activité<ArrowUpRight size={16} aria-hidden="true" /></a>
      <button className="menu-toggle round-button" type="button" onClick={onToggleMenu} aria-label="Ouvrir le menu" aria-expanded={menuOpen} aria-controls={menuOpen ? "site-menu" : undefined}><Menu size={20} /></button>
    </div>
  </header>;
}