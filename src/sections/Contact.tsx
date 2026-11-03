import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Download, FileText, Save, Trash2, MessageSquare } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { Reveal, SectionLabel, SplitTitle } from "@/components/Primitives";
import { extras, plans, type PlanId } from "@/data/content";
import { createDossier, downloadDossier, emptyProject, localToday, validateProject, type ProjectForm } from "@/lib/dossier";
import { siteConfig } from "@/config/site";
import { track } from "@/lib/analytics";

const DRAFT_KEY = "ocd-project-draft-v1";
const KEEP_KEY = "ocd-project-keep-v1";

function readDraft(): ProjectForm | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    const text = (value: unknown) => (typeof value === "string" ? value.slice(0, 4000) : "");
    return {
      name: text(data.name),
      business: text(data.business),
      contact: text(data.contact),
      date: text(data.date),
      message: text(data.message),
      extras: Array.isArray(data.extras) ? data.extras.filter((value): value is string => typeof value === "string" && extras.includes(value)) : [],
    };
  } catch {
    return null;
  }
}

export function Contact({ selectedPlan, onPlanChange }: { selectedPlan: PlanId; onPlanChange: (plan: PlanId) => void }) {
  const [values, setValues] = useState<ProjectForm>(emptyProject);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectForm, string>>>({});
  const [dossier, setDossier] = useState("");
  const [copyState, setCopyState] = useState("");
  const [keepDraft, setKeepDraft] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const plan = plans.find((item) => item.id === selectedPlan);
  const hasContent = Object.entries(values).some(([key, value]) => key === "extras" ? Array.isArray(value) && value.length > 0 : String(value).trim().length > 0);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEEP_KEY) === "0") setKeepDraft(false);
      else {
        const draft = readDraft();
        if (draft) { setValues(draft); setRestored(true); }
      }
    } finally { setHydrated(true); }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEEP_KEY, keepDraft ? "1" : "0");
      if (keepDraft && hasContent) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      else window.localStorage.removeItem(DRAFT_KEY);
    } catch { /* stockage indisponible ou plein */ }
  }, [values, keepDraft, hydrated, hasContent]);

  function update(key: keyof ProjectForm, value: string | string[]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function clearDraft() {
    try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* stockage indisponible */ }
    setValues(emptyProject);
    setErrors({});
    setRestored(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProject(values);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) { document.getElementById(`project-${firstError}`)?.focus(); return; }
    setCopyState("");
    setDossier(createDossier(values, selectedPlan));
    track("dossier_generated", { plan: selectedPlan || "none", extras: values.extras.length });
  }

  async function copyDossier() {
    try { await navigator.clipboard.writeText(dossier); setCopyState("Dossier copié."); track("dossier_copied"); }
    catch { setCopyState("Copie indisponible. Sélectionnez le texte ci-dessous ou téléchargez le dossier."); }
  }

  return <section id="contact" className="contact-section" aria-labelledby="contact-title">
    <SectionLabel label="Rejoindre l'aventure" index="12" />
    <div className="section-container contact-layout">
      <Reveal className="contact-copy"><p className="eyebrow text-accent-deep">Et si c'était votre tour ?</p><SplitTitle id="contact-title" className="display-title" lines={["Mettez votre activité", ["sous les projecteurs.", "text-accent-deep"]]} />
        <p className="section-description">Faites découvrir votre univers, présentez vos offres et donnez à votre entreprise l'occasion de rencontrer de nouveaux consommateurs.</p>
        <div className="contact-notice"><FileText size={23} aria-hidden="true" /><div><h3>La première étape : votre projet.</h3><p>Préparez un dossier à copier ou à télécharger. Vos informations restent sur votre appareil ; aucun envoi n'est effectué.</p></div></div>
        <p className="contact-pending">{siteConfig.contactPendingMessage}</p>
      </Reveal>
      <div className="contact-form-wrap"><form id="project-form" onSubmit={handleSubmit} noValidate className="contact-form">
        <div className="form-heading"><h3>Préparons votre prochaine étape.</h3><p>Les champs marqués d'un * sont nécessaires.</p></div>
        <div className="form-row"><label htmlFor="project-name"><span id="label-name">Votre nom *</span><input id="project-name" aria-labelledby="label-name" name="name" autoComplete="name" maxLength={120} required value={values.name} onChange={(e) => update("name", e.target.value)} placeholder="Prénom et nom" aria-invalid={!!errors.name} aria-describedby={errors.name ? "error-name" : undefined} />{errors.name && <span id="error-name" className="field-error">{errors.name}</span>}</label>
          <label htmlFor="project-business"><span id="label-business">Entreprise ou activité *</span><input id="project-business" aria-labelledby="label-business" name="business" autoComplete="organization" required maxLength={160} value={values.business} onChange={(e) => update("business", e.target.value)} placeholder="Le nom de votre activité" aria-invalid={!!errors.business} aria-describedby={errors.business ? "error-business" : undefined} />{errors.business && <span id="error-business" className="field-error">{errors.business}</span>}</label></div>
        <div className="form-row"><label htmlFor="project-plan">Formule envisagée<select id="project-plan" name="plan" value={selectedPlan} onChange={(e) => onPlanChange(e.target.value as PlanId)}><option value="">À définir ensemble</option>{plans.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.displayPrice} FCFA</option>)}</select></label>
          <label htmlFor="project-date">Date souhaitée <span className="optional">(facultatif)</span><input id="project-date" name="date" type="date" min={localToday()} value={values.date} onChange={(e) => update("date", e.target.value)} aria-invalid={!!errors.date} aria-describedby={errors.date ? "error-date" : undefined} />{errors.date && <span id="error-date" className="field-error">{errors.date}</span>}</label></div>
        <label htmlFor="project-contact">Votre contact <span className="optional">(facultatif)</span><input id="project-contact" name="contact" maxLength={200} autoComplete="off" value={values.contact} onChange={(e) => update("contact", e.target.value)} placeholder="Adresse e-mail ou téléphone à inclure dans le dossier" /></label>
        <fieldset className="extras-field"><legend>Des besoins complémentaires ? <span className="optional">(facultatif)</span></legend><div className="extras-options">{extras.map((extra) => <label key={extra}><input type="checkbox" checked={values.extras.includes(extra)} onChange={(e) => update("extras", e.target.checked ? [...values.extras, extra] : values.extras.filter((value) => value !== extra))} />{extra}</label>)}</div></fieldset>
        <label htmlFor="project-message"><span id="label-message">Parlez-nous de votre activité *</span><textarea id="project-message" aria-labelledby="label-message" name="message" required rows={4} maxLength={4000} value={values.message} onChange={(e) => update("message", e.target.value)} placeholder="Vos produits, vos services, ce que vous aimeriez faire découvrir..." aria-invalid={!!errors.message} aria-describedby={errors.message ? "error-message" : undefined} />{errors.message && <span id="error-message" className="field-error">{errors.message}</span>}</label>
        {plan && <div className="form-estimate" aria-live="polite"><span>{plan.fullName}<small>{plan.duration}{plan.id === "intensive" ? " dans la semaine" : ""}</small></span><strong>{plan.displayPrice} <span>FCFA</span></strong><p>Tarif indicatif, hors compléments, à confirmer officiellement.</p></div>}

        <div className="draft-tools">
          <label className="draft-toggle"><input type="checkbox" checked={keepDraft} onChange={(e) => setKeepDraft(e.target.checked)} /><Save size={14} aria-hidden="true" />Conserver ce brouillon sur cet appareil</label>
          {keepDraft && hasContent && <button type="button" onClick={clearDraft}><Trash2 size={13} aria-hidden="true" />Effacer</button>}
        </div>
        {restored && <p className="draft-restored" role="status"><Check size={13} aria-hidden="true" />Brouillon restauré sur cet appareil. Vous pouvez l'effacer à tout moment.</p>}

        <button type="submit" className="button button-dark form-submit press">Préparer mon dossier<ArrowUpRight size={19} aria-hidden="true" /></button>
        <p className="form-privacy">Aucun paiement, aucun envoi vers OCD. Le brouillon reste dans ce navigateur si l'option est activée ; il peut être effacé avec le bouton ci-dessus.</p>
      </form></div>
    </div>
    {dossier && <Dialog title="Mon projet OCD" onClose={() => setDossier("")}>
      <div className="dossier-title"><span className="dossier-icon"><Check size={24} /></span><h2>Votre dossier est prêt.</h2></div>
      <p className="dialog-description">Conservez-le pour le partager lorsque les coordonnées officielles seront disponibles. <strong>Aucun envoi ni aucune réservation n'a été effectué.</strong></p>
      <textarea className="dossier-preview" aria-label="Récapitulatif de votre projet" readOnly value={dossier} rows={13} />
      <div className="dialog-actions">
        <button type="button" onClick={() => { downloadDossier(dossier); track("dossier_downloaded"); }} className="button button-accent"><Download size={17} />Télécharger (.txt)</button>
        <button type="button" onClick={copyDossier} className="button button-outline"><Copy size={17} />Copier le dossier</button>
        {siteConfig.booking.enabled && siteConfig.booking.mode === "whatsapp" && siteConfig.contacts.whatsapp && (
          <a
            href={`https://wa.me/${siteConfig.contacts.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(dossier)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-outline"
            onClick={() => track("dossier_whatsapp")}
          >
            <MessageSquare size={17} />Envoyer par WhatsApp
          </a>
        )}
      </div>
      <p className="copy-status" role="status">{copyState}</p>
      <button type="button" className="text-link" onClick={() => setDossier("")}>Revenir à mon projet</button>
    </Dialog>}
  </section>;
}
