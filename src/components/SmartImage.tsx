import { useState, type CSSProperties } from "react";
import { cn } from "@/utils/cn";

const backup = "/images/ocd-live-hero.jpg";

/** Media paths do not depend on generated image variants. */
export function useImageFallback(src: string) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);
  const onError = () => {
    if (current !== backup) setCurrent(backup);
    else setFailed(true);
  };
  return { current, failed, onError };
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

/** Uses local assets directly and falls back to the durable hero photograph. */
export function SmartImage({ src, alt, className, style, width, height, priority = false, position }: SmartImageProps) {
  const { current, failed, onError } = useImageFallback(src);

  if (failed) {
    return <div role="img" aria-label={alt} className={cn("smart-fallback", className)} style={style} />;
  }

  return <img
      src={current}
      alt={alt}
      className={cn("smart-img", className)}
      style={{ objectPosition: position, ...style }}
      width={width ?? (src.endsWith(".svg") ? 800 : 1200)}
      height={height ?? (src.endsWith(".svg") ? 1000 : 900)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={onError}
    />
}
