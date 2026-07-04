/**
 * Analytics placeholders — activated by env vars.
 *   REACT_APP_GA_ID           — Google Analytics 4 measurement ID (G-XXXXXXX)
 *   REACT_APP_CLARITY_ID      — Microsoft Clarity project ID
 *   REACT_APP_META_PIXEL_ID   — Meta / Facebook Pixel ID
 *   REACT_APP_GTM_ID          — Google Tag Manager container ID (GTM-XXXXX)
 *
 * All are no-ops when the corresponding env var is not set — safe to ship as-is.
 */
export function loadTelemetry() {
  if (typeof window === "undefined") return;
  const GA = import.meta.env.VITE_GA_ID;
  const CLARITY = import.meta.env.VITE_CLARITY_ID;
  const META = import.meta.env.VITE_META_PIXEL_ID;
  const GTM = import.meta.env.VITE_GTM_ID;

  // Google Tag Manager
  if (GTM && !window.__gtm_loaded) {
    window.__gtm_loaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  }

  // Google Analytics 4
  if (GA && !window.__ga_loaded) {
    window.__ga_loaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA, { anonymize_ip: true });
  }

  // Microsoft Clarity
  if (CLARITY && !window.__clarity_loaded) {
    window.__clarity_loaded = true;
    /* eslint-disable */
    (function (c, l, a, r, i) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
      const t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      const y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY);
    /* eslint-enable */
  }

  // Meta Pixel
  if (META && !window.__meta_loaded) {
    window.__meta_loaded = true;
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META);
    window.fbq("track", "PageView");
    /* eslint-enable */
  }
}

/** Fire a custom event across all installed providers */
export function track(event, params = {}) {
  if (typeof window === "undefined") return;
  try {
    if (window.gtag) window.gtag("event", event, params);
    if (window.fbq) window.fbq("trackCustom", event, params);
    if (window.clarity) window.clarity("set", event, JSON.stringify(params));
    if (window.dataLayer) window.dataLayer.push({ event, ...params });
  } catch { /* no-op */ }
}

export function pageView(path) {
  track("page_view", { page_path: path });
}
