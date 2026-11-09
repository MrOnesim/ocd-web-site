import { formatDualTimezoneSlot } from "@/data/packages";

export interface StoryPosterInput {
  reference: string;
  companyName: string;
  sector: string;
  productsServices: string;
  bookingDateLabel: string;
  startTime: string;
  endTime: string;
  country: string;
  city: string;
  phone: string;
  physicalAddress?: string;
  participationMode: "presentiel" | "distanciel";
  packageName: string;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:\s]+$/, "")}…`;
  }
  return lines;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Génère et télécharge une affiche Story / Statut WhatsApp HD (1080 × 1920 PNG)
 * aux couleurs officielles OCD Live × House of Challenge.
 */
export function downloadStoryPosterPng(input: StoryPosterInput) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Fond charbon éditorial + halo orange signature OCD
  const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
  bg.addColorStop(0, "#171815");
  bg.addColorStop(0.55, "#1f201b");
  bg.addColorStop(1, "#121310");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  const glow = ctx.createRadialGradient(860, 280, 40, 860, 280, 620);
  glow.addColorStop(0, "rgba(247, 119, 0, 0.34)");
  glow.addColorStop(1, "rgba(247, 119, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1920);

  const bottomGlow = ctx.createRadialGradient(200, 1680, 30, 200, 1680, 560);
  bottomGlow.addColorStop(0, "rgba(247, 119, 0, 0.22)");
  bottomGlow.addColorStop(1, "rgba(247, 119, 0, 0)");
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, 0, 1080, 1920);

  // Bordure subtile
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 3;
  roundRectPath(ctx, 48, 48, 984, 1824, 44);
  ctx.stroke();

  // 2. En-tête éditorial épuré (sans badge capsule)
  ctx.fillStyle = "#F77700";
  ctx.font = '800 54px "Inter Tight", system-ui, sans-serif';
  ctx.fillText("OCD LIVE", 96, 156);

  ctx.fillStyle = "rgba(246, 246, 243, 0.65)";
  ctx.font = '600 24px "Inter Tight", system-ui, sans-serif';
  ctx.textAlign = "right";
  ctx.fillText("HOUSE OF CHALLENGE", 984, 148);
  ctx.textAlign = "left";

  // 3. Surtitre mode & localisation
  ctx.fillStyle = "#FF9D3B";
  ctx.font = '600 30px "Inter Tight", system-ui, sans-serif';
  const modeBanner =
    input.participationMode === "presentiel"
      ? "EN PRÉSENTIEL AU TOGO · ESPACE BOVANN SHOP"
      : `EN DIRECT DEPUIS ${input.country.toUpperCase()} · ASSISTANTE LIVE OCD`;
  ctx.fillText(modeBanner, 96, 275);

  // 4. Nom de l'entreprise (Héro)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = '700 84px "Inter Tight", system-ui, sans-serif';
  const titleLines = wrapCanvasText(ctx, input.companyName.toUpperCase(), 888, 3);
  let y = 385;
  for (const line of titleLines) {
    ctx.fillText(line, 96, y);
    y += 96;
  }

  // Secteur d'activité
  ctx.fillStyle = "rgba(246, 246, 243, 0.78)";
  ctx.font = '500 34px "Inter Tight", system-ui, sans-serif';
  ctx.fillText(input.sector, 96, y + 10);
  y += 82;

  // Ligne accent
  ctx.fillStyle = "#F77700";
  ctx.fillRect(96, y, 180, 8);
  y += 66;

  // 5. Bloc Produits & Offres présentés
  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  roundRectPath(ctx, 96, y, 888, 250, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(247, 119, 0, 0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#FF9D3B";
  ctx.font = '700 24px "Inter Tight", system-ui, sans-serif';
  ctx.fillText("À DÉCOUVRIR PENDANT LE DIRECT :", 136, y + 58);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = '500 36px "Inter Tight", system-ui, sans-serif';
  const prodLines = wrapCanvasText(ctx, input.productsServices, 808, 3);
  let py = y + 116;
  for (const pl of prodLines) {
    ctx.fillText(pl, 136, py);
    py += 48;
  }

  y += 300;

  // 6. Bloc Date & Créneau horaire (avec double fuseau si international)
  const tz = formatDualTimezoneSlot(input.startTime, input.endTime, input.country);
  ctx.fillStyle = "#F77700";
  roundRectPath(ctx, 96, y, 888, tz.localLabel ? 250 : 200, 28);
  ctx.fill();

  ctx.fillStyle = "#171815";
  ctx.font = '700 24px "Inter Tight", system-ui, sans-serif';
  ctx.fillText("RENDEZ-VOUS EN DIRECT", 136, y + 54);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = '800 46px "Inter Tight", system-ui, sans-serif';
  ctx.fillText(input.bookingDateLabel.toUpperCase(), 136, y + 114);

  ctx.font = '700 36px "Inter Tight", system-ui, sans-serif';
  ctx.fillText(tz.togoLabel, 136, y + 168);

  if (tz.localLabel) {
    ctx.fillStyle = "#171815";
    ctx.font = '700 30px "Inter Tight", system-ui, sans-serif';
    ctx.fillText(`• ${tz.localLabel}`, 136, y + 216);
  }

  y += (tz.localLabel ? 250 : 200) + 52;

  // 7. Coordonnées commerciales de l'entreprise
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  roundRectPath(ctx, 96, y, 888, 220, 28);
  ctx.fill();

  ctx.fillStyle = "#FF9D3B";
  ctx.font = '700 23px "Inter Tight", system-ui, sans-serif';
  ctx.fillText("CONTACTS & LOCALISATION DE L'ENTREPRISE", 136, y + 54);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = '700 42px "Inter Tight", system-ui, sans-serif';
  ctx.fillText(`Tél / WhatsApp : ${input.phone}`, 136, y + 116);

  ctx.fillStyle = "rgba(246, 246, 243, 0.85)";
  ctx.font = '500 31px "Inter Tight", system-ui, sans-serif';
  const locText = input.physicalAddress
    ? `${input.physicalAddress} — ${input.city}, ${input.country}`
    : `${input.city}, ${input.country}`;
  const locLine = wrapCanvasText(ctx, locText, 808, 1)[0] || locText;
  ctx.fillText(locLine, 136, y + 172);

  // 8. Pied d'affiche
  ctx.fillStyle = "rgba(246, 246, 243, 0.62)";
  ctx.font = '500 26px "Inter Tight", system-ui, sans-serif';
  ctx.fillText("Votre activité mérite d'être vue · Diffusion House of Challenge", 96, 1815);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = '600 22px monospace';
  ctx.fillText(input.reference, 984, 1815);
  ctx.textAlign = "left";

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${input.reference}-affiche-story.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
}
