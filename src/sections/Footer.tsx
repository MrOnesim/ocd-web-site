import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Dialog } from "@/components/Dialog";
import { navItems, project } from "@/data/content";
import { clamp, prefersReducedMotion, useScrollFrame } from "@/lib/hooks";

export function Footer() {
  const [showInfo, setShowInfo] = useState(false);
  const footer = useRef<HTMLElement>(null);
  useScrollFrame(() => {
    const el = footer.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = prefersReducedMotion() ? 1 : clamp((window.innerHeight - rect.top) / rect.height);
    el.style.setProperty("--fp", p.toFixed(4));
  });
  return <footer ref={footer} className="site-footer">
    <div className="section-container">
      <div className="footer-top"><a href="#top" aria-label="OCD, retour à l'accueil" className="footer-logo"><Logo /></a><p>Votre activité<br />mérite d'être vue<span className="text-accent">.</span></p><a href="#top" className="footer-up round-button" aria-label="Revenir en haut"><ArrowUpRight size={24} /></a></div>
      <div className="footer-links"><nav aria-label="Navigation de pied de page">{navItems.filter((item) => !["#apercu-live", "#pour-qui", "#ecosysteme"].includes(item.href)).map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav><button type="button" onClick={() => setShowInfo(true)}>Informations & transparence<ArrowUpRight size={14} aria-hidden="true" /></button></div>
      <div className="footer-mega" aria-hidden="true"><Logo decorative /></div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} OCD</p><p>{project.domain}</p><span>Portfolio de présentation du projet · Photographies d'illustration</span></div>
    </div>
    {showInfo && <Dialog title="Informations & transparence" onClose={() => setShowInfo(false)}>
      <div className="institutional-content"><h2>Le projet OCD</h2><dl>
        <div><dt>Nom du projet</dt><dd>OCD</dd></div><div><dt>Domaine</dt><dd>Promotion commerciale et publicité numérique</dd></div><div><dt>Public cible</dt><dd>Entrepreneurs, commerçants, artisans et entreprises</dd></div><div><dt>Canal de promotion</dt><dd>Réseaux sociaux et émissions en direct</dd></div><div><dt>Communauté envisagée</dt><dd>House of Challenge. Modalités de collaboration et audience à documenter.</dd></div><div><dt>Président</dt><dd>Panafricain dans l'âme, Président des OCD (Opportunité C'est Dehors) — <a href="mailto:contact@bovanngroup.com">contact@bovanngroup.com</a> · +225 05 86 86 86 19</dd></div><div><dt>Informations à compléter</dt><dd>Adresse physique, validation de l'identité visuelle.</dd></div>
      </dl><h3>Une présentation, pas une réservation</h3><p>Les prix sont indicatifs. Le formulaire génère un dossier local, sans transmission, paiement ou réservation. Aucune audience ni aucun résultat commercial n'est garanti. Les chiffres d'audience annoncés ne constituent pas une promesse de spectateurs.</p>
      <h3>Données & mesure d'audience</h3><p>Aucune donnée n'est envoyée par ce site. Le brouillon du formulaire reste dans votre navigateur uniquement si vous activez l'option, et peut être effacé à tout moment. Aucun outil de mesure tiers n'est chargé : les événements sont prêts à être transmis si un outil respectueux de la vie privée est installé ultérieurement.</p>
      <h3>À propos des visuels</h3><p>Les photographies illustrent le concept ; elles ne montrent pas des locaux, clients, équipes ou réalisations d'OCD. Les images des secteurs sont des illustrations générées par IA. L'affiche est une étude graphique. La vidéo du live est une vidéo d'illustration Pexels, pas une réalisation OCD ; le parcours animé est une simulation.</p>
      <p>Les images de l'accueil et des secteurs sont des illustrations du concept. Elles ne sont pas des photographies de clients OCD.</p>
      <p>Vidéo d'illustration : <a href="https://www.pexels.com/video/a-woman-fixing-smartphone-for-blogging-9384668/" target="_blank" rel="noreferrer">Sasha Kim, via Pexels</a>. Police Inter Tight distribuée sous licence SIL Open Font License 1.1.</p></div>
    </Dialog>}
  </footer>;
}
