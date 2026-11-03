/**
 * Génère public/sitemap.xml à partir de SITE_URL.
 * Exemple : SITE_URL="https://ocd.example" node scripts/generate-sitemap.mjs
 * Tant que l'URL officielle n'est pas connue, aucun sitemap n'est généré.
 */
import { writeFile } from "node:fs/promises";

const url = process.env.SITE_URL;
if (!url) {
  console.error("SITE_URL manquant : impossible de générer un sitemap avec un domaine inventé.");
  process.exit(1);
}

const sections = ["", "#projet", "#services", "#apercu-live", "#pour-qui", "#fonctionnement", "#formules", "#ecosysteme", "#faq", "#contact"];
const today = new Date().toISOString().slice(0, 10);
const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sections
  .map((section) => `  <url><loc>${url.replace(/\/$/, "")}/${section}</loc><lastmod>${today}</lastmod><priority>${section === "" ? "1.0" : "0.7"}</priority></url>`)
  .join("\n")}\n</urlset>\n`;

await writeFile("public/sitemap.xml", body, "utf8");
console.log(`✅ public/sitemap.xml généré pour ${url}`);
