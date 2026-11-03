import { plans, type PlanId } from "@/data/content";

export type ProjectForm = {
  name: string;
  business: string;
  contact: string;
  date: string;
  message: string;
  extras: string[];
};

export const emptyProject: ProjectForm = { name: "", business: "", contact: "", date: "", message: "", extras: [] };

export function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function validateProject(values: ProjectForm) {
  const errors: Partial<Record<keyof ProjectForm, string>> = {};
  if (!values.name.trim()) errors.name = "Indiquez votre nom.";
  if (!values.business.trim()) errors.business = "Indiquez votre entreprise ou votre activité.";
  if (!values.message.trim()) errors.message = "Présentez votre projet en quelques mots.";
  if (values.date && values.date < localToday()) errors.date = "Choisissez une date à venir.";
  return errors;
}

export function createDossier(values: ProjectForm, selectedPlan: PlanId) {
  const plan = plans.find((item) => item.id === selectedPlan);
  return [
    "OCD | DOSSIER DE PRÉSENTATION DE MON PROJET",
    "Votre activité mérite d'être vue.",
    "",
    `Nom : ${values.name.trim()}`,
    `Entreprise / activité : ${values.business.trim()}`,
    `Contact : ${values.contact.trim() || "À compléter"}`,
    "",
    `Formule envisagée : ${plan?.fullName ?? "À définir ensemble"}`,
    `Durée : ${plan ? plan.duration + (plan.id === "intensive" ? " dans la semaine" : "") : "À définir"}`,
    `Tarif indicatif : ${plan ? plan.displayPrice + " FCFA" : "À préciser"}`,
    `Date souhaitée : ${values.date ? new Date(`${values.date}T12:00:00`).toLocaleDateString("fr-FR") : "À définir"}`,
    `Prestations complémentaires : ${values.extras.length ? values.extras.join(", ") : "Aucune précisée"}`,
    "",
    "MON PROJET",
    values.message.trim(),
    "",
    "INFORMATIONS IMPORTANTES",
    "Ce dossier est préparé localement. Il n'a pas été transmis à OCD et ne constitue ni une réservation ni une confirmation de prestation.",
    "Tarifs indicatifs à confirmer officiellement. Les prestations complémentaires ne sont pas chiffrées et ne sont pas incluses dans le tarif indiqué.",
    "La date, les conditions et les modalités de réservation devront être confirmées avec l'équipe.",
    "Les coordonnées officielles d'OCD restent à compléter.",
    "Aucune audience, aucun contact commercial et aucune vente ne sont garantis.",
  ].join("\n");
}

export function downloadDossier(text: string) {
  const url = URL.createObjectURL(new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "OCD-mon-projet.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}