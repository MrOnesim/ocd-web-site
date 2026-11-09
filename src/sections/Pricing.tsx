import { ArrowUpRight, Check, Plus, Sparkles } from "lucide-react";
import { CountUp, Reveal, SectionLabel, SplitTitle, StepEdge, TiltCard } from "@/components/Primitives";
import { comparison } from "@/data/content";
import { formatEuroApprox, formatFcfa } from "@/data/packages";
import type { CommercialPackage } from "@/types/booking";
import { cn } from "@/utils/cn";

export function Pricing({
  packages,
  selected,
  onSelect,
}: {
  packages: CommercialPackage[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section id="formules" className="pricing-section" aria-labelledby="pricing-title">
      <StepEdge />
      <SectionLabel label="Les 6 packages commerciaux" index="03" />
      <div className="section-container">
        <div className="pricing-heading">
          <SplitTitle
            id="pricing-title"
            className="display-title"
            lines={["Six formules créatives,", ["à la mesure de vos objectifs.", "text-muted"]]}
          />
          <Reveal delay={120}>
            <p className="section-description">
              Du premier direct Découverte de 1h30 jusqu&apos;au Pack VIP avec annonce officielle ou au Partenariat Mensuel : chaque forfait valorise votre entreprise en présentiel comme à distance.
            </p>
          </Reveal>
        </div>

        <div className="pricing-grid pricing-grid-six">
          {packages.map((pkg, index) => (
            <Reveal key={pkg.id} delay={(index % 3) * 90} className="pricing-cell">
              <TiltCard className={cn(pkg.featured && "plan-glow")}>
                <article
                  className={cn(
                    "pricing-plan",
                    pkg.featured && "pricing-plan-dark",
                    selected === pkg.id && "pricing-plan-selected"
                  )}
                >
                  <div className="plan-top">
                    <p className="small-label">
                      {pkg.code} {pkg.badge ? `· ${pkg.badge}` : ""}
                    </p>
                    {selected === pkg.id ? (
                      <Check size={18} aria-label="Forfait sélectionné" />
                    ) : pkg.featured ? (
                      <Sparkles size={16} aria-hidden="true" />
                    ) : null}
                  </div>
                  <h3>{pkg.name}</h3>
                  <p className="plan-subtitle">{pkg.subtitle}</p>
                  <p className="plan-price">
                    <CountUp value={pkg.priceFcfa} duration={1100 + index * 140} />
                    <span>FCFA · {formatEuroApprox(pkg.priceFcfa)}</span>
                  </p>
                  <div className="plan-description">
                    <p className="plan-duration">{pkg.durationLabel}</p>
                    <p>{pkg.description}</p>
                    <ul className="plan-features">
                      {pkg.features.map((feat) => (
                        <li key={feat}>
                          <Check size={15} aria-hidden="true" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelect(pkg.id)}
                    className="plan-button press"
                  >
                    {selected === pkg.id ? "Forfait sélectionné · Réserver" : `Réserver (${formatFcfa(pkg.priceFcfa)} FCFA)`}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </button>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <details className="compare">
          <summary>
            <span>Comparer les 6 packages commerciaux en un coup d&apos;œil</span>
            <span className="compare-summary-note">
              Durées, annonces, stories et visibilité
              <Plus size={18} aria-hidden="true" />
            </span>
          </summary>
          <div
            className="compare-scroll"
            tabIndex={0}
            role="region"
            aria-label="Tableau comparatif des 6 forfaits OCD Live"
            data-lenis-prevent
          >
            <table>
              <caption className="sr-only">
                Comparaison détaillée des six formules commerciales OCD Live.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Prestation</th>
                  {comparison.columns.map((column, index) => (
                    <th
                      key={column}
                      scope="col"
                      className={cn((index === 1 || index === 4) && "is-featured")}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value, index) => (
                      <td
                        key={index}
                        className={cn((index === 1 || index === 4) && "is-featured")}
                      >
                        {value === "En option" || value === "—" ? (
                          <span
                            className={cn(
                              "compare-pending",
                              value === "En option" && "is-option"
                            )}
                          >
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="compare-note">
            {comparison.note} <a href="#reservation">Choisir mon créneau maintenant</a>.
          </p>
        </details>
      </div>
    </section>
  );
}
