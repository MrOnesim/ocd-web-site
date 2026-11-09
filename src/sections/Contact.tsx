import { ArrowUpRight, Building2, Globe2, Mail, MessageCircle } from "lucide-react";
import { Reveal, SectionLabel, SplitTitle, StepEdge } from "@/components/Primitives";
import { siteConfig } from "@/config/site";
import { scrollToSection } from "@/lib/hooks";

export function Contact({ onOpenLookup }: { onOpenLookup: () => void }) {
  const whatsappClean = siteConfig.contacts.whatsapp.replace(/\D/g, "");

  return (
    <section
      id="contact"
      className="contact-section section-dark"
      aria-labelledby="contact-title"
    >
      <StepEdge />
      <SectionLabel label="Contact & accompagnement" index="10" light />
      <div className="section-container contact-grid">
        <div className="contact-intro">
          <Reveal>
            <p className="eyebrow text-accent">Togo · Afrique · International</p>
          </Reveal>
          <SplitTitle
            id="contact-title"
            className="display-title"
            lines={["Prêt à faire briller", ["votre entreprise ?", "text-accent"]]}
          />
          <Reveal delay={120}>
            <p className="section-description">
              Réservez votre créneau en ligne en moins de deux minutes ou contactez directement notre équipe pour toute question sur les sessions chez Bovann Shop (Togo) ou les directs accompagnés à distance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollToSection("reservation")}
                className="button button-accent press"
              >
                Ouvrir le calendrier de réservation
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenLookup}
                className="button button-outline-light"
              >
                Suivre ma réservation
              </button>
            </div>
          </Reveal>
        </div>

        <div className="contact-channels">
          <p className="small-label text-accent">Nos canaux officiels</p>
          <div className="contact-channel-list">
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel"
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>WhatsApp OCD Live · {siteConfig.contacts.whatsappDisplay}</span>
            </a>
            <a href={`mailto:${siteConfig.contacts.email}`} className="contact-channel">
              <Mail size={16} aria-hidden="true" />
              <span>{siteConfig.contacts.email}</span>
            </a>
            <a
              href={siteConfig.contacts.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel"
            >
              <Globe2 size={16} aria-hidden="true" />
              <span>Page Facebook officielle</span>
            </a>
          </div>

          <div className="contact-locations">
            <div>
              <h4>
                <Building2 size={16} aria-hidden="true" /> Live en Présentiel — Togo
              </h4>
              <p>
                Accueil des entrepreneurs et co-animation sur place dans les locaux de{" "}
                <strong>Bovann Shop (Lomé, Togo)</strong> avec nos assistantes des lives OCD.
              </p>
            </div>
            <div>
              <h4>
                <Globe2 size={16} aria-hidden="true" /> Live à Distance — Monde
              </h4>
              <p>
                Cameroun, Tchad, Centrafrique, Afrique &amp; diaspora : diffusion accompagnée par une{" "}
                <strong>assistante dédiée au Togo</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
