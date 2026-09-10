(function () {
  'use strict';
  if (window.__jm2ClarityAnalytics) return;
  window.__jm2ClarityAnalytics = true;

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
    const href = element.getAttribute('href') || '';
    const position = element.closest('.site-header') ? 'header'
      : element.closest('.mobile-panel') ? 'mobile_menu'
      : element.closest('.hero') ? 'hero'
      : element.closest('.footer') ? 'footer' : 'content';
    if (element.hasAttribute('data-contact-modal-open')) {
      trackClarityEvent('contact_click');
      trackClarityEvent('contact_cta_' + position);
    } else if (element.matches('#footerContactForm button[type="submit"]')) {
      trackClarityEvent('contact_submit_click');
    } else if (element.hasAttribute('data-contact-modal-close')) {
      trackClarityEvent('contact_close_click');
    } else if (element.id === 'menuBtn') {
      trackClarityEvent('mobile_menu_click');
    } else if (element.matches('.nav-dropdown-trigger')) {
      trackClarityEvent('products_menu_click');
    } else if (/^https:\/\/(wa\.me|(?:www\.)?whatsapp\.com)\//i.test(href)) {
      trackClarityEvent('whatsapp_click');
    } else if (/^mailto:/i.test(href)) {
      trackClarityEvent('email_click');
    } else if (/^tel:/i.test(href)) {
      trackClarityEvent('phone_click');
    } else {
      const destinations = {
        '/': 'home_click', '/base-digital': 'base_digital_click',
        '/automatizacion-tareas': 'automation_click',
        '/presupuestos-facturacion-rapida': 'invoicing_click',
        '/digitalizar-documentos': 'documents_click',
        '/elautonomoeficiente/': 'autonomo_eficiente_click',
        '/sobre-mi': 'about_click', '/contacto': 'contact_click',
        '#contacto': 'contact_click', '#servicios': 'solutions_click', '#inicio': 'back_to_top_click'
      };
      if (Object.hasOwn(destinations, href)) trackClarityEvent(destinations[href]);
      else if (element.matches('.trust-logo-item')) trackClarityEvent('client_website_click');
    }
  }, { capture: true, passive: true });

  document.addEventListener('focusin', function (event) {
    if (event.target instanceof Element && event.target.closest('#footerContactForm')) once('contact_form_start');
  });
  document.addEventListener('submit', function (event) {
    if (event.target.id === 'footerContactForm') trackClarityEvent('contact_form_submit_attempt');
  }, { capture: true, passive: true });
  document.addEventListener('jm2:contact-success', function () { trackClarityEvent('contact_form_success'); });
  document.addEventListener('jm2:contact-error', function () { trackClarityEvent('contact_form_error'); });

  function observeSections() {
    if (typeof IntersectionObserver !== 'function') return;
    const sections = { '.hero': 'hero', '#servicios': 'services', '.trust-section': 'trust', '#contacto': 'contact', '.footer': 'footer' };
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const name = Object.keys(sections).find(function (selector) { return entry.target.matches(selector); });
        if (name) once('section_view_' + sections[name]);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    Object.keys(sections).forEach(function (selector) {
      const section = document.querySelector(selector);
      if (section) observer.observe(section);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeSections, { once: true });
  else observeSections();

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
