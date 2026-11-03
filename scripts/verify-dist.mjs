/**
 * Vérifie que tous les fichiers référencés par dist/index.html existent bien
 * dans dist/. Objectif : éviter un déploiement du seul index.html qui
 * laisserait les photos, le logo et la police en 404.
 *
 * Usage : npm run build && node scripts/verify-dist.mjs
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const DIST = "dist";
const INDEX = path.join(DIST, "index.html");

let html;
try { html = await readFile(INDEX, "utf8"); }
catch { console.error(`❌ ${INDEX} introuvable. Lancez npm run build.`); process.exit(1); }

const references = new Set();
for (const match of html.matchAll(/(?:src|href)="(\/(?:images|fonts)\/[^"?#]+|\/ocd\.svg)"/g)) references.add(match[1]);
// Les variantes responsives et le manifeste sont des chaînes dans le JavaScript.
for (const match of html.matchAll(/["'](\/(?:images|fonts)\/[a-zA-Z0-9._-]+\.(?:webp|jpe?g|png|svg|woff2))["']/g)) references.add(match[1]);

const missing = [];
for (const reference of references) {
  const file = path.join(DIST, reference.slice(1));
  try {
    const info = await stat(file);
    if (!info.isFile() || info.size === 0) missing.push(`${reference} (fichier vide)`);
  } catch {
    missing.push(reference);
  }
}

const required = ["/ocd.svg", "/images/ocd-live-hero.jpg", "/videos/live-commerce-demo.mp4"];
for (const reference of required) {
  try { await stat(path.join(DIST, reference.slice(1))); }
  catch { missing.push(`${reference} (attendu)`); }
}

if (missing.length) {
  console.error("❌ Ressources manquantes dans dist :");
  for (const entry of new Set(missing)) console.error(`   - ${entry}`);
  console.error("\nDéployez le dossier dist/ complet, pas uniquement dist/index.html.");
  process.exit(1);
}

console.log(`✅ Déploiement complet : ${references.size} ressources locales présentes dans dist/.`);
