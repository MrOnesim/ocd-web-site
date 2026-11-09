import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { formatFcfa } from "@/data/packages";
import { scrollToSection, useScrollFrame } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import type { CommercialPackage } from "@/types/booking";

export function StickyCta({
  packages,
  selectedPackageId,
}: {
  packages: CommercialPackage[];
  selectedPackageId: string;
}) {
  const [visible, setVisible] = useState(false);
  const pkg = packages.find((item) => item.id === selectedPackageId);

  useScrollFrame(() => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const reservation = document.getElementById("reservation");
    const resRect = reservation?.getBoundingClientRect();
    const inReservation = resRect ? resRect.top < vh * 0.7 && resRect.bottom > vh * 0.3 : false;
    const next = y > vh * 0.65 && !inReservation;
    setVisible((current) => (current === next ? current : next));
  });

  if (!visible) return null;

  return (
    <div className="sticky-cta" role="region" aria-label="Réservation rapide">
      <div className="sticky-cta-copy">
        <small>{pkg ? pkg.name : "Présentiel Togo ou À distance"}</small>
        <b>
          {pkg
            ? `${formatFcfa(pkg.priceFcfa)} FCFA · ${pkg.durationLabel}`
            : "Réservez votre session OCD Live"}
        </b>
      </div>
      <button
        type="button"
        onClick={() => {
          track("sticky_cta_reservation", { pkg: pkg?.id || "none" });
          scrollToSection("reservation");
        }}
      >
        Réserver mon créneau
        <ArrowUpRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
