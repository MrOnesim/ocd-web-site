import { siteConfig } from "@/config/site";

type AnalyticsWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
};

function isDoNotTrackEnabled() {
  if (typeof navigator === "undefined") return false;
  return siteConfig.analytics.respectDoNotTrack && navigator.doNotTrack === "1";
}

/**
 * Initialise optionnellement le script d'audience uniquement si un provider
 * et un identifiant explicite sont renseignés dans siteConfig.analytics.
 */
export function initAnalytics() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (isDoNotTrackEnabled()) return;
  const { provider, id, scriptUrl } = siteConfig.analytics;
  if (!id || provider === "none") return;

  if (provider === "umami" && !document.querySelector('script[data-ocd-analytics="umami"]')) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = scriptUrl || "https://cloud.umami.is/script.js";
    script.dataset.websiteId = id;
    script.dataset.ocdAnalytics = "umami";
    document.head.appendChild(script);
  }
}

/**
 * File d'attente d'événements respectueuse de la vie privée.
 * Aucun script tiers n'est chargé par défaut : les événements restent locaux
 * tant qu'aucun outil (dataLayer / Umami / Plausible) n'est activé.
 */
export function track(event: string, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (isDoNotTrackEnabled()) return;

  const payload = { event, ...data, page: window.location.pathname, at: new Date().toISOString() };
  const target = window as AnalyticsWindow & { __OCD_EVENTS?: unknown[] };
  target.__OCD_EVENTS = [...(target.__OCD_EVENTS ?? []), payload].slice(-100);

  const { provider, id } = siteConfig.analytics;
  if (provider === "dataLayer") target.dataLayer?.push(payload);
  if (provider === "umami") target.umami?.track(event, data);
  if (provider === "plausible") target.plausible?.(event, { props: data });

  if (import.meta.env.DEV && (provider === "none" || !id)) {
    console.debug("[analytics:local]", payload);
  }
}
