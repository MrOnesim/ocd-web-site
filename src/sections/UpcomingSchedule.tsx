import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { Reveal, SectionLabel, SplitTitle, StepEdge } from "@/components/Primitives";
import { formatDualTimezoneSlot } from "@/data/packages";
import { scrollToSection } from "@/lib/hooks";
import type { PublicUpcomingLive } from "@/types/booking";

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d === 1 ? "1er" : d} ${MONTHS[m - 1]} ${y}`;
}

export function UpcomingSchedule({
  upcomingLives,
  studioName,
}: {
  upcomingLives: PublicUpcomingLive[];
  studioName: string;
}) {
  return (
    <section
      id="programme"
      className="upcoming-section section-paper"
      aria-labelledby="upcoming-title"
    >
      <StepEdge />
      <SectionLabel label="À l'affiche sur House of Challenge" index="02B" />
      <div className="section-container">
        <div className="participation-header">
          <div>
            <Reveal>
              <p className="eyebrow text-accent-deep">Annonces officielles des directs</p>
            </Reveal>
            <SplitTitle
              id="upcoming-title"
              className="display-title"
              lines={["Prochaines entreprises", ["en direct.", "text-muted"]]}
            />
          </div>
          <Reveal delay={100}>
            <p className="section-description">
              Dès validation par l&apos;équipe OCD Live, votre session s&apos;affiche ici avec vos produits et vos coordonnées pour mobiliser les spectateurs avant même le début du direct.
            </p>
          </Reveal>
        </div>

        {upcomingLives.length === 0 ? (
          <div className="upcoming-empty-banner">
            <div className="upcoming-empty-copy">
              <p className="small-label text-accent-deep">Programmation dès décembre</p>
              <h3>Votre entreprise bientôt annoncée à l&apos;affiche.</h3>
              <p>
                Réservez votre créneau en présentiel chez <strong>{studioName}</strong> ou à distance depuis toute l&apos;Afrique : une fois validé par l&apos;administration, votre direct est promu ici auprès des visiteurs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection("reservation")}
              className="button button-accent press"
            >
              Réserver ma place à l&apos;affiche
              <ArrowUpRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="upcoming-grid">
            {upcomingLives.map((live) => {
              const tz = formatDualTimezoneSlot(live.startTime, live.endTime, live.country);
              return (
                <article key={live.reference} className="upcoming-card">
                  <div className="upcoming-card-head">
                    <span className="small-label">{formatDateShort(live.bookingDate)}</span>
                    <span className="small-label text-accent-deep">
                      {live.participationMode === "presentiel"
                        ? "Présentiel Togo"
                        : `Direct ${live.country}`}
                    </span>
                  </div>

                  <p className="upcoming-sector">{live.sector}</p>
                  <h3>{live.companyName}</h3>
                  <p className="upcoming-products">{live.productsServices}</p>

                  <div className="upcoming-meta">
                    <p className="upcoming-time">
                      <strong>{tz.togoLabel}</strong>
                      {tz.localLabel && <small>{tz.localLabel}</small>}
                    </p>
                    <p>
                      <MapPin size={14} aria-hidden="true" />
                      <span>
                        {live.physicalAddress ? `${live.physicalAddress}, ` : ""}
                        {live.city}, {live.country}
                      </span>
                    </p>
                    {live.businessPhone && (
                      <p>
                        <Phone size={14} aria-hidden="true" />
                        <span>Contact : {live.businessPhone}</span>
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
