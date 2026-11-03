import { siteConfig } from "@/config/site";

type AnalyticsWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  umami?: { track: (event: string, data?: Record<string, unknown>) => void };
};

/**
 * File d'attente d'événements respectueuse de la vie privée.
 * Aucun script tiers n'est chargé : les événements sont transmis uniquement
 * si un outil (dataLayer / Umami) est installé sur la page.
 */
export function track(event: string, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (siteConfig.analytics.respectDoNotTrack && navigator.doNotTrack === "1") return;
  const payload = { event, ...data, page: window.location.pathname, at: new Date().toISOString() };
  const target = window as AnalyticsWindow & { __OCD_EVENTS?: unknown[] };
  target.__OCD_EVENTS = [...(target.__OCD_EVENTS ?? []), payload].slice(-100);
  if (siteConfig.analytics.provider === "dataLayer") target.dataLayer?.push(payload);
  if (siteConfig.analytics.provider === "umami") target.umami?.track(event, data);
  if (import.meta.env.DEV && siteConfig.analytics.provider === "none") console.debug("[analytics:aucun outil chargé]", payload);
}
