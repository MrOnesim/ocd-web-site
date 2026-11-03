import { useState } from "react";
import { SmartImage } from "@/components/SmartImage";
import { sectorPhotos, sectors, type SectorId } from "@/data/content";
import { track } from "@/lib/analytics";
import { cn } from "@/utils/cn";

type Filter = "all" | SectorId;

export function SectorGallery() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? sectorPhotos : sectorPhotos.filter((photo) => photo.sector === filter);
  const labelOf = (id: SectorId) => sectors.find((sector) => sector.id === id)?.label ?? id;

  return <div className="sector-block">
    <div className="sector-head">
      <div>
        <p className="eyebrow text-accent-deep">Univers</p>
        <h3>Chaque secteur a sa place.</h3>
      </div>
      <p>Mode, beauté, restauration, artisanat, technologie ou services : le dispositif se veut ouvert à toute activité qui souhaite se faire connaître.</p>
    </div>

    <div className="sector-filters" role="group" aria-label="Filtrer les univers par secteur">
      <button type="button" aria-pressed={filter === "all"} className={cn(filter === "all" && "is-active")}
        onClick={() => { setFilter("all"); track("sector_filter", { sector: "all" }); }}>
        Tous<span>{sectorPhotos.length}</span>
      </button>
      {sectors.map((sector) => {
        const total = sectorPhotos.filter((photo) => photo.sector === sector.id).length;
        if (!total) return null;
        return <button key={sector.id} type="button" aria-pressed={filter === sector.id} className={cn(filter === sector.id && "is-active")}
          onClick={() => { setFilter(sector.id); track("sector_filter", { sector: sector.id }); }}>
          {sector.label}<span>{total}</span>
        </button>;
      })}
    </div>

    <p className="sr-only" aria-live="polite">{visible.length} visuels affichés{filter === "all" ? "" : ` pour ${labelOf(filter)}`}.</p>

    <div className="sector-grid" key={filter}>
      {visible.map((photo, index) => <figure key={photo.src} className="sector-card" style={{ animationDelay: `${Math.min(index, 6) * 55}ms` }}>
        <SmartImage src={photo.src} alt={photo.alt} sizes="(min-width: 1000px) 25vw, (min-width: 600px) 50vw, 100vw" />
        <figcaption><span>{labelOf(photo.sector)}</span><p>{photo.caption}</p></figcaption>
      </figure>)}
    </div>
    <p className="image-note">Photographies d'illustration, non représentatives de clients ou de réalisations d'OCD.</p>
  </div>;
}
