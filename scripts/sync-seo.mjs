/**
 * Synchronise automatiquement :
 * - index.html (URL canonique, Open Graph / Twitter absolus, JSON-LD Organization + Service + FAQPage)
 * - public/sitemap.xml (sans fragments #, conforme au protocole Sitemaps)
 * - public/robots.txt (avec déclaration Sitemap)
 * à partir des sources de vérité src/config/site.ts et src/data/content.ts.
 *
 * Usage : node scripts/sync-seo.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

async function loadProjectData() {
  const result = await build({
    stdin: {
      contents: `
        export { siteConfig } from "./src/config/site";
        export { faqs, plans, services } from "./src/data/content";
      `,
      resolveDir: process.cwd(),
      loader: "ts",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "neutral",
    alias: { "@": path.resolve("src") },
  });

  const code = result.outputFiles[0].text;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  return import(dataUrl);
}

const { siteConfig, faqs, plans, services } = await loadProjectData();

const rawUrl = (process.env.SITE_URL || siteConfig.url || "").trim();
const canonicalUrl = rawUrl ? rawUrl.replace(/\/$/, "") : "";
const origin = canonicalUrl ? new URL(canonicalUrl).origin : "";
const ogImageUrl = origin ? `${origin}/images/ocd-live-hero.jpg` : "/images/ocd-live-hero.jpg";

/* ----------------------------------------------------- 1. JSON-LD & index.html */
const sameAs = [
  siteConfig.contacts.facebook,
  siteConfig.contacts.instagram,
  siteConfig.contacts.tiktok,
].filter(Boolean);

const organization = {
  "@type": "Organization",
  name: siteConfig.name,
  alternateName: siteConfig.fullName,
  ...(canonicalUrl ? { url: canonicalUrl } : {}),
  slogan: siteConfig.tagline,
  description:
    "Projet de promotion commerciale et de visibilité numérique : lives commerciaux, publicité, affiches, stories et accompagnement des entrepreneurs.",
  ...(siteConfig.contacts.email ? { email: siteConfig.contacts.email } : {}),
  ...(siteConfig.contacts.phone ? { telephone: siteConfig.contacts.phone } : {}),
  ...(sameAs.length ? { sameAs } : {}),
  knowsAbout: services.map((service) => service.title),
};

const serviceSchema = {
  "@type": "Service",
  name: "Accompagnement OCD en promotion commerciale",
  description:
    "Présentation et promotion d'activités lors de lives sur les réseaux sociaux, avec accompagnement technique. Tarification indicative à confirmer officiellement.",
  provider: { "@type": "Organization", name: siteConfig.name },
  offers: plans.map((plan) => ({
    "@type": "Offer",
    name: plan.fullName,
    price: String(plan.price),
    priceCurrency: "XOF",
    description: `${plan.duration}${plan.id === "intensive" ? " dans la semaine" : ""}. Tarif indicatif à confirmer.`,
  })),
};

const faqSchema = {
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const jsonLd = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@graph": [organization, serviceSchema, faqSchema],
  },
  null,
  2
)
  .split("\n")
  .map((line, index) => (index === 0 ? line : `      ${line}`))
  .join("\n");

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OCD | Votre activité mérite d'être vue</title>
    <meta
      name="description"
      content="OCD, un projet de promotion commerciale et de visibilité numérique. Lives commerciaux, publicité et accompagnement pour les entrepreneurs, commerçants et artisans."
    />
    <meta name="theme-color" content="#171815" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="OCD" />${canonicalUrl ? `\n    <link rel="canonical" href="${canonicalUrl}" />` : ""}
    <meta property="og:site_name" content="OCD" />
    <meta property="og:title" content="OCD | Votre activité mérite d'être vue" />
    <meta
      property="og:description"
      content="Promotion commerciale, publicité et visibilité numérique. Découvrez le projet OCD et ses formules de présentation en direct."
    />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${siteConfig.locale}" />${canonicalUrl ? `\n    <meta property="og:url" content="${canonicalUrl}" />` : ""}
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1672" />
    <meta property="og:image:height" content="941" />
    <meta property="og:image:alt" content="OCD — Votre activité mérite d'être vue. Présentation d'un live commercial." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="OCD | Votre activité mérite d'être vue" />
    <meta name="twitter:description" content="Promotion commerciale, publicité et visibilité numérique. Découvrez le projet OCD et ses formules de présentation en direct." />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <link rel="icon" type="image/svg+xml" href="/ocd.svg" />
    <link rel="preload" href="/fonts/inter-tight.woff2" as="font" type="font/woff2" crossorigin />
    <link
      rel="preload"
      as="image"
      type="image/webp"
      href="/images/ocd-live-hero.webp"
      imagesrcset="/images/ocd-live-hero-800w.webp 800w, /images/ocd-live-hero.webp 1672w"
      imagesizes="100vw"
      fetchpriority="high"
    />
    <script type="application/ld+json">
      ${jsonLd}
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const prevHtml = await readFile("index.html", "utf8").catch(() => "");
if (prevHtml !== html) {
  await writeFile("index.html", html, "utf8");
}

/* ------------------------------------------- 2. sitemap.xml & robots.txt */
if (canonicalUrl) {
  const sitemapUrl = `${origin}/sitemap.xml`;
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  await writeFile("public/sitemap.xml", sitemap, "utf8");

  const robots = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
  await writeFile("public/robots.txt", robots, "utf8");
  console.log(`✅ SEO synchronisé (canonical: ${canonicalUrl}, sitemap: ${sitemapUrl}).`);
} else {
  console.log("✅ SEO synchronisé (aucune URL canonique configurée).");
}
