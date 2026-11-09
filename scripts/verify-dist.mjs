/**
 * Vérifie que tous les fichiers référencés par dist/index.html et les bundles
 * JS/CSS de dist/assets/ existent bien dans dist/.
 * Objectif : éviter un déploiement incomplet qui laisserait les scripts,
 * la police, les photos, le logo ou la vidéo en 404.
 *
 * Usage : npm run build && node scripts/verify-dist.mjs
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const DIST = "dist";
const INDEX = path.join(DIST, "index.html");

let html;
try {
  html = await readFile(INDEX, "utf8");
} catch {
  console.error(`❌ ${INDEX} introuvable. Lancez npm run build.`);
  process.exit(1);
}

const sources = [html];
const assetsDir = path.join(DIST, "assets");
try {
  const assetFiles = await readdir(assetsDir);
  for (const name of assetFiles) {
    if (/\.(?:js|css)$/i.test(name)) {
      sources.push(await readFile(path.join(assetsDir, name), "utf8"));
    }
  }
} catch {
  /* pas de sous-dossier assets */
}

const combined = sources.join("\n");
const references = new Set();

for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|images|fonts|videos)\/[^"?#]+|\/ocd\.svg)"/g)) {
  references.add(match[1]);
}
for (const match of html.matchAll(/imagesrcset="([^"]+)"/g)) {
  for (const candidate of match[1].split(",")) {
    const url = candidate.trim().split(/\s+/)[0];
    if (url.startsWith("/")) references.add(url);
  }
}
for (const match of combined.matchAll(/["'(](\/(?:images|fonts|videos)\/[a-zA-Z0-9._-]+\.(?:webp|jpe?g|png|svg|woff2|mp4))["')]/g)) {
  references.add(match[1]);
}

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

const required = [
  "/ocd.svg",
  "/fonts/inter-tight.woff2",
  "/images/ocd-live-hero.jpg",
  "/images/ocd-live-hero.webp",
  "/images/ocd-live-hero-800w.webp",
  "/videos/live-commerce-demo.mp4",
  "/robots.txt",
  "/sitemap.xml",
];
for (const reference of required) {
  try {
    const info = await stat(path.join(DIST, reference.slice(1)));
    if (!info.isFile() || info.size === 0) missing.push(`${reference} (vide)`);
  } catch {
    missing.push(`${reference} (attendu)`);
  }
}

if (missing.length) {
  console.error("❌ Ressources manquantes dans dist :");
  for (const entry of new Set(missing)) console.error(`   - ${entry}`);
  console.error("\nDéployez le dossier dist/ complet, pas uniquement dist/index.html.");
  process.exit(1);
}

console.log(`✅ Déploiement complet : ${references.size} ressources vérifiées dans dist/.`);
