import { useEffect, useState } from "react";
import { ArrowUpRight, Info, Pause, Play } from "lucide-react";
import { ActionLink, SectionLabel, SplitTitle } from "@/components/Primitives";
import { liveDemo } from "@/data/content";
import { prefersReducedMotion, useReducedMotion } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { cn } from "@/utils/cn";

const DURATION = 4400;
const LOCAL_VIDEO = "/videos/live-commerce-demo.mp4";
const BACKUP_VIDEO = "https://videos.pexels.com/video-files/9384668/9384668-sd_540_960_24fps.mp4";

export function LivePreview() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoSource, setVideoSource] = useState(LOCAL_VIDEO);

  useEffect(() => { setPlaying(!reduced && !prefersReducedMotion()); }, [reduced]);

  useEffect(() => {
    if (!playing || reduced) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % liveDemo.steps.length), DURATION);
    return () => window.clearTimeout(timer);
  }, [index, playing, reduced]);

  const step = liveDemo.steps[index];

  return <section id="apercu-live" className="live-section" aria-labelledby="live-title">
    <SectionLabel label="Aperçu d'un live" index="03" />
    <div className="section-container live-layout">
      <div className="live-visual">
        <div className="live-halo" aria-hidden="true" />
        <div className="live-phone">
          <div className="live-screen">
            {videoError ? <div className="video-unavailable">
              <p>La vidéo ne peut pas être lue ici.</p>
              <a href="https://www.pexels.com/video/a-woman-fixing-smartphone-for-blogging-9384668/" target="_blank" rel="noreferrer">Voir la vidéo source</a>
            </div> : <video
              key={videoSource}
              className="live-video"
              src={videoSource}
              controls
              playsInline
              muted
              preload="metadata"
              poster="/images/ocd-live-hero.jpg"
              aria-label="Vidéo d'illustration : préparation d'un téléphone pour créer du contenu en direct"
              onError={() => {
                if (videoSource === LOCAL_VIDEO) setVideoSource(BACKUP_VIDEO);
                else setVideoError(true);
              }}
            >
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>}
            <div className="live-top">
              <span className="live-badge">VIDÉO</span>
              <span className="live-demo-tag">Démonstration</span>
            </div>
          </div>
        </div>
        <p className="live-caption">Vidéo d'illustration (Pexels). Ce n'est pas un live ni une réalisation OCD.</p>
      </div>

      <div className="live-copy">
        <SplitTitle id="live-title" className="display-title" lines={["Un live, ça se prépare.", ["Et ça se vit.", "text-accent-deep"]]} />
        <p className="section-description">De la réservation aux échanges avec les consommateurs : voici comment OCD envisage le parcours d'un entrepreneur.</p>

        <ol className={cn("live-steps", !playing && "is-paused")}>
          {liveDemo.steps.map((item, i) => <li key={item.label}>
            <button type="button" className={cn("live-step", i === index && "is-active")} aria-current={i === index ? "step" : undefined}
              onClick={() => { setIndex(i); setPlaying(false); track("live_demo_step", { step: item.label }); }}>
              <span className="live-step-number">0{i + 1}</span>
              <span className="live-step-copy"><small>{item.label}</small><b>{item.title}</b><span>{item.text}</span></span>
              {i === index && playing && <span className="live-timer" style={{ animationDuration: `${DURATION}ms` }} aria-hidden="true" />}
            </button>
          </li>)}
        </ol>

        <div className="live-controls">
          <button type="button" className="round-button live-toggle" onClick={() => { setPlaying((value) => !value); track("live_demo_toggle", { playing: !playing }); }} aria-label={playing ? "Mettre l'aperçu en pause" : "Lancer l'aperçu animé"}>
            {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>
          <div><b>{playing ? "Aperçu en lecture" : "Aperçu en pause"}</b><span>Étape {index + 1} sur {liveDemo.steps.length} · {step.label}</span></div>
          <a className="live-cta" href="#formules">Voir les formules<ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>

        <p className="live-note"><Info size={15} aria-hidden="true" />L'animation des étapes est une simulation. La vidéo est un exemple de création de contenu, pas une diffusion OCD.</p>
        <ActionLink href="#contact">Préparer mon projet</ActionLink>
      </div>
    </div>
  </section>;
}
