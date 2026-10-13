(function () {
  'use strict';
  if (window.__efficientClarityAnalytics) return;
  window.__efficientClarityAnalytics = true;

  function trackClarityEvent(nombre) {
    try {
      if (!nombre || typeof window.clarity !== 'function') return;
      window.clarity('event', nombre);
    } catch (e) {}
  }

  function setClarityTag(nombre, valor) {
    try {
      if (!nombre || !valor || typeof window.clarity !== 'function') return;
      window.clarity('set', nombre, valor);
    } catch (e) {}
  }

  const sent = new Set();
  function once(name) {
    if (sent.has(name)) return;
    sent.add(name);
    trackClarityEvent(name);
  }

  once('landing_view');
  window.addEventListener('error', function (event) {
    if (event instanceof ErrorEvent) trackClarityEvent('js_error');
  });
  window.addEventListener('unhandledrejection', function () {
    trackClarityEvent('unhandled_promise_rejection');
  });

  // Only fixed categories leave the page, never referrer URLs or the full UA.
  const ua = navigator.userAgent || '';
  const browser = /Instagram(?:App)?/i.test(ua) ? 'instagram'
    : /FBAN|FBAV/i.test(ua) ? 'facebook'
    : /TikTok|musical_ly|BytedanceWebview/i.test(ua) ? 'tiktok'
    : /; wv\)|WebView|Line\/|MicroMessenger|Snapchat|Twitter/i.test(ua) ? 'other' : 'no';
  setClarityTag('in_app_browser', browser);
  setClarityTag('device_type', /Mobi|Android|iPhone|iPad|iPod/i.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'mobile' : 'desktop');

  const params = new URLSearchParams(window.location.search);
  const sources = { instagram: 'instagram', ig: 'instagram', facebook: 'facebook', fb: 'facebook',
    tiktok: 'tiktok', google: 'google', direct: 'direct' };
  const source = (params.get('utm_source') || '').toLowerCase();
  let traffic = source ? (sources[source] || 'other') : 'direct';
  if (!source && document.referrer) {
    traffic = 'other';
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (/(^|\.)instagram\.com$/.test(host)) traffic = 'instagram';
      else if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(host)) traffic = 'facebook';
      else if (/(^|\.)tiktok\.com$/.test(host)) traffic = 'tiktok';
      else if (/(^|\.)google\.(com|es|cat|co\.uk|de|fr|it|pt|com\.au|co\.in)$/.test(host)) traffic = 'google';
    } catch (e) {}
  }
  setClarityTag('traffic_source', traffic);
  // Extend only with reviewed, non-personal marketing identifiers. Arbitrary
  // query values can contain names or other personal data even when slug-shaped.
  const approvedUtm = {
    utm_source: Object.keys(sources).concat(['newsletter', 'linkedin', 'youtube', 'bing']),
    utm_medium: ['cpc', 'ppc', 'paid', 'paid_social', 'social', 'organic', 'email', 'referral', 'display'],
    utm_campaign: []
  };
  Object.keys(approvedUtm).forEach(function (key) {
    if (!params.has(key)) return;
    const value = (params.get(key) || '').toLowerCase();
    setClarityTag(key, approvedUtm[key].includes(value) ? value : 'redacted');
  });

  document.addEventListener('click', function (event) {
    const element = event.target instanceof Element ? event.target.closest('a, button') : null;
    if (!element) return;
    const action = element.getAttribute('data-analytics');
    if (action === 'click_probar_15_dias') {
      trackClarityEvent('trial_cta_click');
      const position = element.closest('.site-header') ? 'header'
        : element.closest('#inicio') ? 'hero'
        : element.closest('#precios') ? 'pricing'
        : element.closest('#contacto') ? 'final' : 'middle';
      trackClarityEvent('trial_cta_' + position);
      if (position === 'final') trackClarityEvent('contact_click');
    } else if (action === 'click_ver_demo') trackClarityEvent('demo_click');
    else if (action === 'click_pricing') trackClarityEvent('pricing_click');
  }, { capture: true, passive: true });

  const interactionTypes = ['click', 'pointerdown', 'touchstart', 'keydown'];
  function firstInteraction(event) {
    if (!event.isTrusted) return;
    once('first_interaction');
    interactionTypes.forEach(function (type) { document.removeEventListener(type, firstInteraction, true); });
  }
  interactionTypes.forEach(function (type) {
    document.addEventListener(type, firstInteraction, { capture: true, passive: true });
  });

  function checkScroll() {
    const root = document.scrollingElement || document.documentElement;
    const distance = root.scrollHeight - root.clientHeight;
    if (distance <= 0) return;
    const percent = Math.max(0, root.scrollTop) / distance * 100;
    [25, 50, 75, 90].forEach(function (threshold) {
      if (percent >= threshold) once('scroll_' + threshold);
    });
  }
  window.addEventListener('scroll', checkScroll, { passive: true });
  window.addEventListener('resize', checkScroll, { passive: true });
  window.addEventListener('load', checkScroll, { once: true });

  let activeMs = 0;
  let visibleSince = document.visibilityState === 'visible' ? performance.now() : null;
  let timer = null;
  function accountTime() {
    if (visibleSince === null) return;
    const now = performance.now();
    activeMs += Math.max(0, now - visibleSince);
    visibleSince = now;
    [5, 10, 20, 30, 60].forEach(function (seconds) {
      if (activeMs >= seconds * 1000) once('page_active_' + seconds + 's');
    });
  }
  function pause() {
    accountTime();
    visibleSince = null;
    window.clearInterval(timer);
    timer = null;
  }
  function resume() {
    if (document.visibilityState !== 'visible') return;
    if (visibleSince === null) visibleSince = performance.now();
    if (timer === null && !sent.has('page_active_60s')) {
      timer = window.setInterval(function () {
        if (document.visibilityState !== 'visible') return;
        accountTime();
        if (sent.has('page_active_60s')) {
          window.clearInterval(timer);
          timer = null;
        }
      }, 250);
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      resume();
      trackClarityEvent('page_visible');
    } else {
      pause();
      trackClarityEvent('page_hidden');
    }
  });
  window.addEventListener('pagehide', function () { pause(); trackClarityEvent('pagehide_detected'); });
  window.addEventListener('pageshow', function () { resume(); trackClarityEvent('pageshow_detected'); checkScroll(); });
  resume();
}());
