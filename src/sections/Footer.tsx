import { useState } from "react";
import { ArrowUp, Info, Lock } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/config/site";
import { navItems, project } from "@/data/content";
import { scrollToSection } from "@/lib/hooks";

export function Footer({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <footer className="site-footer">
      <div className="section-container">
        <div className="footer-top">
          <Logo decorative className="footer-logo" />
          <p>{project.tagline}</p>
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("top");
            }}
            className="round-button footer-up"
            aria-label="Haut de page"
          >
            <ArrowUp size={20} aria-hidden="true" />
          </a>
        </div>

        <div className="footer-links">
          <nav aria-label="Liens rapides pied de page">
            {navItems.slice(0, 6).map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href.slice(1));
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-5">
            <button type="button" onClick={() => setInfoOpen(true)}>
              <Info size={15} aria-hidden="true" />
              Informations &amp; transparence
            </button>
            <button type="button" onClick={onOpenAdmin}>
              <Lock size={14} aria-hidden="true" />
              Administration OCD Live
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {siteConfig.fullName}
          </span>
          <span>{project.domain}</span>
          <span>Togo (Bovann Shop) · Afrique &amp; International</span>
        </div>
      </div>

      {infoOpen && (
        <Dialog onClose={() => setInfoOpen(false)} title="Informations & transparence">
          <div className="institutional-content">
            <h2>OCD Live — Opportunité C&apos;est Dehors</h2>
            <dl>
              <div>
                <dt>Présentiel Togo</dt>
                <dd>{siteConfig.studio.location}</dd>
              </div>
              <div>
                <dt>À distance</dt>
                <dd>Afrique (Cameroun, Tchad, Centrafrique…) &amp; International avec assistante des lives OCD au Togo</dd>
              </div>
              <div>
                <dt>Diffusion</dt>
                <dd>Compte officiel House of Challenge (3 à 4 millions d&apos;abonnés annoncés)</dd>
              </div>
              <div>
                <dt>Contact OCD Live</dt>
                <dd>
                  <a href={`mailto:${siteConfig.contacts.email}`}>{siteConfig.contacts.email}</a> ·
                  WhatsApp{" "}
                  <a
                    href={`https://wa.me/${siteConfig.contacts.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {siteConfig.contacts.whatsappDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt>{siteConfig.governance.title}</dt>
                <dd>
                  {siteConfig.governance.note} ·{" "}
                  <a href={`mailto:${siteConfig.governance.email}`}>
                    {siteConfig.governance.email}
                  </a>{" "}
                  · {siteConfig.governance.phone}
                </dd>
              </div>
            </dl>
            <h3>Transparence sur l&apos;audience et les médias</h3>
            <p>
              Les chiffres d&apos;audience reflètent la communauté annoncée du compte House of Challenge et ne constituent pas une garantie contractuelle de ventes. Les photographies du site sont des illustrations générées par IA et la vidéo d&apos;aperçu provient de Pexels (Sasha Kim).
            </p>
          </div>
        </Dialog>
      )}
    </footer>
  );
}
