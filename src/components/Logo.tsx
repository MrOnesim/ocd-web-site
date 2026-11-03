import { cn } from "@/utils/cn";

export function Logo({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <svg viewBox="0 0 846 322" fill="currentColor" className={cn("ocd-logo", className)} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "OCD"} aria-hidden={decorative ? true : undefined}>
      <path pathLength={1} d="M160 0C239 0 283 54 314 127L335 178C355 224 389 247 436 247H487L518 218H615L508 319H446C354 319 310 272 278 200L250 137C233 98 206 72 161 72C110 72 72 109 72 160C72 211 111 249 161 249C210 249 246 214 252 169L286 242C257 291 214 321 160 321C71 321 0 249 0 161C0 71 71 0 160 0Z" />
      <path pathLength={1} d="M310 77C333 28 379 0 442 0H541L474 72H444C407 72 376 94 360 128L348 160Z" />
      <path pathLength={1} d="M570 0H682C774 0 846 70 846 160C846 250 774 320 682 320H539L616 248H680C731 248 771 210 771 160C771 110 733 72 682 72H594V102L505 190V65Z" />
    </svg>
  );
}