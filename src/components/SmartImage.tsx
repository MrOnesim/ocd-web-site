import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/utils/cn";

const backup = "/images/ocd-live-hero.jpg";

/**
 * Retourne le srcSet WebP correspondant aux variantes générées par
 * scripts/optimize-images.mjs pour les photographies locales.
 */
export function getWebpSrcSet(src: string): string | undefined {
  if (!/^\/images\/[a-z0-9-]+\.jpe?g$/i.test(src)) return undefined;
  const base = src.replace(/\.jpe?g$/i, "");
  if (base === "/images/ocd-live-hero") {
    return `${base}-800w.webp 800w, ${base}.webp 1672w`;
  }
  return `${base}-640w.webp 640w, ${base}.webp 1122w`;
}

/** Gère le repli progressif : WebP → JPEG original → photo d'accueil → dégradé CSS. */
export function useImageFallback(src: string) {
  const [current, setCurrent] = useState(src);
  const [allowWebp, setAllowWebp] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(src);
    setAllowWebp(true);
    setFailed(false);
  }, [src]);

  const webpSrcSet = allowWebp ? getWebpSrcSet(current) : undefined;

  const onError = () => {
    if (allowWebp && getWebpSrcSet(current)) {
      setAllowWebp(false);
    } else if (current !== backup) {
      setCurrent(backup);
      setAllowWebp(true);
    } else {
      setFailed(true);
    }
  };

  return { current, webpSrcSet, failed, onError };
}

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  position?: string;
};

/** Utilise les variantes WebP locales avec repli automatique vers JPEG puis dégradé. */
export function SmartImage({
  src,
  alt,
  className,
  style,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  width,
  height,
  priority = false,
  position,
}: SmartImageProps) {
  const { current, webpSrcSet, failed, onError } = useImageFallback(src);

  if (failed) {
    return <div role="img" aria-label={alt} className={cn("smart-fallback", className)} style={style} />;
  }

  const isSvg = current.endsWith(".svg");
  const isHero = current === "/images/ocd-live-hero.jpg";
  const resolvedWidth = width ?? (isSvg ? 800 : isHero ? 1672 : 1122);
  const resolvedHeight = height ?? (isSvg ? 1000 : isHero ? 941 : 1402);

  const img = (
    <img
      src={current}
      alt={alt}
      className={cn("smart-img", className)}
      style={{ objectPosition: position, ...style }}
      width={resolvedWidth}
      height={resolvedHeight}
      sizes={webpSrcSet ? sizes : undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={onError}
    />
  );

  if (!webpSrcSet) return img;

  return (
    <picture className="smart-picture">
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      {img}
    </picture>
  );
}
