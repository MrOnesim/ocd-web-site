/**
 * Génère des variantes WebP optimisées (pleine taille + variante mobile/grille)
 * à partir des photographies JPEG de public/images/.
 *
 * Usage : node scripts/optimize-images.mjs
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const IMAGES_DIR = path.resolve("public/images");

const files = (await readdir(IMAGES_DIR)).filter((name) => /\.jpe?g$/i.test(name));

let beforeBytes = 0;
let afterBytes = 0;

for (const file of files) {
  const inputPath = path.join(IMAGES_DIR, file);
  const base = file.replace(/\.jpe?g$/i, "");
  const isHero = base === "ocd-live-hero";

  const srcStat = await stat(inputPath);
  beforeBytes += srcStat.size;

  const meta = await sharp(inputPath).metadata();
  const fullOut = path.join(IMAGES_DIR, `${base}.webp`);
  const smallWidth = isHero ? 800 : 640;
  const smallOut = path.join(IMAGES_DIR, `${base}-${smallWidth}w.webp`);

  await sharp(inputPath)
    .webp({ quality: isHero ? 80 : 78, effort: 6 })
    .toFile(fullOut);

  if ((meta.width ?? 0) > smallWidth) {
    await sharp(inputPath)
      .resize({ width: smallWidth, withoutEnlargement: true })
      .webp({ quality: 76, effort: 6 })
      .toFile(smallOut);
  }

  const fullStat = await stat(fullOut);
  const smallStat = await stat(smallOut);
  afterBytes += fullStat.size;
  console.log(
    `✓ ${file.padEnd(22)} ${(srcStat.size / 1024).toFixed(0).padStart(4)} Ko → ${base}.webp (${(fullStat.size / 1024).toFixed(0)} Ko) + ${base}-${smallWidth}w.webp (${(smallStat.size / 1024).toFixed(0)} Ko)`
  );
}

const savedPct = Math.round((1 - afterBytes / beforeBytes) * 100);
console.log(
  `\n✅ ${files.length} images optimisées : ${(beforeBytes / 1024).toFixed(0)} Ko JPEG → ${(afterBytes / 1024).toFixed(0)} Ko WebP (-${savedPct}%).`
);
