const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  observer.observe(element);
});

document.getElementById('year').textContent = new Date().getFullYear();

const heroTrades = document.querySelector('.hero-kicker');
if (heroTrades && !heroTrades.textContent.includes('PINTORES')) {
  heroTrades.textContent = heroTrades.textContent.replace(' · REFORMAS', ' · PINTORES · REFORMAS');
}

const tradeList = document.querySelector('.trade-list');
if (tradeList && !tradeList.textContent.includes('Pintores')) {
  const painters = document.createElement('span');
  painters.textContent = 'Pintores';
  const maintenance = [...tradeList.children].find((item) => item.textContent === 'Mantenimiento');
  tradeList.insertBefore(painters, maintenance || null);
}

document.querySelectorAll('a[href="#demo"]').forEach((link) => {
  link.setAttribute('href', '#flujo');
});

const track = (eventName, parameters = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, { page_path: window.location.pathname, ...parameters });
  }
};

document.querySelectorAll('[data-analytics]').forEach((element) => {
  element.addEventListener('click', () => track(element.dataset.analytics, {
    link_text: element.textContent.trim(),
    link_url: element.getAttribute('href') || '',
  }));
});

document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach((element) => {
  element.addEventListener('click', () => track('click_whatsapp'));
});

const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const query = new URLSearchParams(window.location.search);
const storedAttribution = {};
utmKeys.forEach((key) => {
  const incomingValue = query.get(key);
  if (incomingValue) sessionStorage.setItem(key, incomingValue);
  storedAttribution[key] = incomingValue || sessionStorage.getItem(key) || '';
});

const efficientContactForm = document.getElementById('efficientContactForm');
const efficientContactStatus = document.getElementById('efficientContactStatus');
const EMAILJS_SERVICE_ID = 'jm2-limpio';
const EMAILJS_TEMPLATE_ID = 'template_8dl1y4o';
const EMAILJS_PUBLIC_KEY = 'LLIuQx-WZ1x6XBuDn';
let registrationStarted = false;

utmKeys.forEach((key) => {
  const field = efficientContactForm?.elements.namedItem(key);
  if (field) field.value = storedAttribution[key];
});

efficientContactForm?.addEventListener('focusin', () => {
  if (registrationStarted) return;
  registrationStarted = true;
  track('inicio_registro', storedAttribution);
}, { once: true });

if (window.emailjs) window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
else window.addEventListener('load', () => window.emailjs?.init({ publicKey: EMAILJS_PUBLIC_KEY }), { once: true });

efficientContactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(efficientContactForm);
  const nombre = String(formData.get('nombre') || '').trim();
  const actividad = String(formData.get('actividad') || '').trim();
  const formaContacto = String(formData.get('forma_de_contacto') || 'WhatsApp').trim();
  const contactoDetalle = String(formData.get('contacto_detalle') || '').trim();
  const tamanoEquipo = String(formData.get('tamano_equipo') || '').trim();
  const gestionActual = String(formData.get('gestion_actual') || '').trim();
  const necesidad = String(formData.get('necesidad') || '').trim();

  if (!nombre || !actividad || !contactoDetalle || !tamanoEquipo || !gestionActual) {
    efficientContactStatus.textContent = 'Completa los campos obligatorios antes de enviar.';
    return;
  }
  if (!window.emailjs) {
    efficientContactStatus.textContent = 'No se pudo cargar el formulario. Recarga la página e inténtalo de nuevo.';
    return;
  }

  const submitButton = efficientContactForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.innerHTML = 'ENVIANDO…';
  efficientContactStatus.textContent = 'Enviando tu solicitud…';
  const attributionText = utmKeys.map((key) => `${key}: ${storedAttribution[key] || 'No indicada'}`).join('\n');

  try {
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      nombre,
      email: 'No indicado',
      telefono: contactoDetalle,
      forma_de_contacto: formaContacto,
      mensaje: [`Oficio: ${actividad}`, `Personas: ${tamanoEquipo}`, `Gestión actual: ${gestionActual}`, `Necesidad: ${necesidad || 'No indicada'}`, attributionText].join('\n'),
      procedencia: 'elautonomoeficiente',
      referrer: document.referrer || 'Directo',
      timestamp: new Date().toISOString(),
      ...storedAttribution,
    }, { publicKey: EMAILJS_PUBLIC_KEY });

    efficientContactStatus.textContent = 'Solicitud enviada. Te contactaremos pronto para empezar la prueba.';
    track('registro_completado', { contact_method: formaContacto.toLowerCase(), ...storedAttribution });
    track('generate_lead', { contact_method: formaContacto.toLowerCase(), lead_source: storedAttribution.utm_source || 'elautonomoeficiente' });
    efficientContactForm.reset();
    utmKeys.forEach((key) => { const field = efficientContactForm.elements.namedItem(key); if (field) field.value = storedAttribution[key]; });
  } catch (error) {
    efficientContactStatus.textContent = 'No se pudo enviar. Inténtalo de nuevo en unos minutos.';
    console.error('Error al enviar el formulario:', error);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'PROBAR GRATIS 15 DÍAS <span>↗</span>';
  }
});
