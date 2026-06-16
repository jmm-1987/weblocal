const menuBtn = document.getElementById('menuBtn');
const mobilePanel = document.getElementById('mobilePanel');
const backdrop = document.getElementById('backdrop');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const entryModal = document.querySelector('[data-entry-modal-root]');
const entryModalDialog = entryModal?.querySelector('.entry-modal-dialog');
const entryModalPanels = Array.from(document.querySelectorAll('[data-entry-modal-panel]'));
const entryModalButtons = Array.from(document.querySelectorAll('[data-entry-modal]'));
const entryModalCloseButtons = Array.from(document.querySelectorAll('[data-entry-modal-close]'));
const contactModal = document.getElementById('contactModal');
const contactModalDialog = contactModal?.querySelector('.contact-modal-dialog');
const contactModalOpenButtons = Array.from(document.querySelectorAll('[data-contact-modal-open]'));
const contactModalCloseButtons = Array.from(document.querySelectorAll('[data-contact-modal-close]'));
let activeEntryModalButton = null;
let activeContactModalButton = null;

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, {
    page_path: window.location.pathname,
    page_title: document.title,
    ...params,
  });
}

function reportContactConversion(url) {
  if (typeof window.gtag_report_conversion !== 'function') return;

  window.gtag_report_conversion(url);
}

function getLinkLabel(link) {
  const ariaLabel = link.getAttribute('aria-label');
  const text = link.textContent.trim().replace(/\s+/g, ' ');
  return ariaLabel || text || link.href;
}

function closeMenu() {
  mobilePanel.classList.remove('open');
  backdrop.classList.remove('show');
  menuBtn.setAttribute('aria-expanded', 'false');
  mobilePanel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openMenu() {
  mobilePanel.classList.add('open');
  backdrop.classList.add('show');
  menuBtn.setAttribute('aria-expanded', 'true');
  mobilePanel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

menuBtn.addEventListener('click', () => {
  const isOpen = mobilePanel.classList.contains('open');
  isOpen ? closeMenu() : openMenu();

  if (!isOpen) {
    trackEvent('menu_open', {
      menu_type: 'mobile',
    });
  }
});

closeMenuBtn?.addEventListener('click', closeMenu);
backdrop.addEventListener('click', closeMenu);
mobilePanel.querySelectorAll('a, button').forEach((item) => item.addEventListener('click', closeMenu));

document.querySelectorAll('a[href]').forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href') || '';
    const label = getLinkLabel(link);
    const linkArea = link.closest('header') ? 'header'
      : link.closest('footer') ? 'footer'
        : link.closest('.mobile-panel') ? 'mobile_menu'
          : 'content';

    if (href.includes('wa.me')) {
      reportContactConversion();
      trackEvent('generate_lead', {
        contact_method: 'whatsapp',
        link_text: label,
        link_area: linkArea,
      });
      trackEvent('whatsapp_click', {
        link_text: label,
        link_area: linkArea,
      });
      return;
    }

    if (href.includes('google.com/maps')) {
      trackEvent('maps_click', {
        link_text: label,
        link_area: linkArea,
      });
      return;
    }

    if (href.startsWith('#') || href.includes('.html#')) {
      trackEvent('section_nav_click', {
        link_text: label,
        link_area: linkArea,
        target_section: href.split('#')[1] || 'home',
      });
      return;
    }

    if (href.includes('sobremi.html')) {
      trackEvent('about_page_click', {
        link_text: label,
        link_area: linkArea,
      });
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobilePanel.classList.contains('open')) {
    closeMenu();
  }

  if (event.key === 'Escape' && entryModal?.classList.contains('is-open')) {
    closeEntryModal();
  }

  if (event.key === 'Escape' && contactModal?.classList.contains('is-open')) {
    closeContactModal();
  }
});

function closeContactModal() {
  if (!contactModal) return;

  contactModal.classList.remove('is-open');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeContactModalButton?.focus();
}

function openContactModal(trigger) {
  if (!contactModal) return;

  activeContactModalButton = trigger;
  contactModal.classList.add('is-open');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  contactModalDialog?.focus();

  trackEvent('contact_modal_open', {
    contact_method: 'contact_modal',
    lead_source: 'cta_button',
  });
  reportContactConversion();
}

contactModalOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openContactModal(button);
  });
});

contactModalCloseButtons.forEach((button) => {
  button.addEventListener('click', closeContactModal);
});

function closeEntryModal() {
  if (!entryModal) return;

  entryModal.classList.remove('is-open');
  entryModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeEntryModalButton?.focus();
}

function openEntryModal(modalName, trigger) {
  if (!entryModal || !entryModalPanels.length) return;

  entryModalPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.entryModalPanel === modalName);
  });

  activeEntryModalButton = trigger;
  entryModal.classList.add('is-open');
  entryModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  entryModalDialog?.focus();

  const activePanelTitle = entryModal.querySelector('.entry-modal-content.is-active h3')?.textContent.trim() || modalName;
  trackEvent('entry_offer_detail_open', {
    detail_name: activePanelTitle,
  });
}

entryModalButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openEntryModal(button.dataset.entryModal, button);
  });
});

entryModalCloseButtons.forEach((button) => {
  button.addEventListener('click', closeEntryModal);
});

const revealItems = document.querySelectorAll('.reveal-on-scroll');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.22,
    rootMargin: '0px 0px -10% 0px',
  });

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add('is-visible');
  });
}

const trackedSections = document.querySelectorAll(
  '#home, #entry-offer, #advanced-services, #software-propio, #contact, .about-hero, .about-story-section'
);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const sectionName = entry.target.id || entry.target.classList[0] || 'section';
      trackEvent('section_view', {
        section_name: sectionName,
      });
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.45,
  });

  trackedSections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

const scrollDepthMarks = [25, 50, 75, 90];
const trackedScrollDepths = new Set();

function trackScrollDepth() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return;

  const scrollPercent = Math.round((window.scrollY / scrollableHeight) * 100);
  scrollDepthMarks.forEach((mark) => {
    if (scrollPercent < mark || trackedScrollDepths.has(mark)) return;

    trackedScrollDepths.add(mark);
    trackEvent('scroll_depth', {
      percent_scrolled: mark,
    });
  });
}

window.addEventListener('scroll', trackScrollDepth, { passive: true });
trackScrollDepth();

const automationSlider = document.querySelector('.automation-slider');
const automationTrack = document.querySelector('[data-automation-track]');
let automationSlides = Array.from(document.querySelectorAll('.automation-slide'));
const automationControls = Array.from(document.querySelectorAll('[data-automation-slide]'));
let automationDragStartX = 0;
let automationDragStartY = 0;
let automationDragStartTranslate = 0;
let automationHasStartedDrag = false;
let automationActiveIndex = 0;
let automationPointerIsDown = false;

function getAutomationTranslateX() {
  if (!automationTrack) return 0;
  const transform = window.getComputedStyle(automationTrack).transform;
  if (transform === 'none') return 0;
  const matrix = new DOMMatrixReadOnly(transform);
  return matrix.m41;
}

function updateAutomationActiveState(nextIndex) {
  automationSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === nextIndex);
  });

  automationControls.forEach((control) => {
    const controlIndex = Number(control.dataset.automationSlide);
    control.classList.toggle('is-active', controlIndex === nextIndex);
    control.setAttribute('aria-pressed', String(controlIndex === nextIndex));
  });
}

function updateAutomationActiveFromPosition() {
  if (!automationTrack || !automationSlides.length) return;

  const sliderCenter = automationSlider.clientWidth / 2;
  const currentTranslate = getAutomationTranslateX();
  let closestIndex = automationActiveIndex;
  let closestDistance = Infinity;

  automationSlides.forEach((slide, slideIndex) => {
    const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2) + currentTranslate;
    const distance = Math.abs(slideCenter - sliderCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = slideIndex;
    }
  });

  automationActiveIndex = closestIndex;
  updateAutomationActiveState(closestIndex);
}

function setAutomationSlide(index, shouldTrack = false) {
  if (!automationTrack || !automationSlides.length) return;

  const nextIndex = Math.max(0, Math.min(index, automationSlides.length - 1));
  const nextSlide = automationSlides[nextIndex];
  const maxTranslate = Math.min(0, automationSlider.clientWidth - automationTrack.scrollWidth);
  const nextTranslate = Math.max(maxTranslate, -nextSlide.offsetLeft);

  automationActiveIndex = nextIndex;
  automationTrack.style.transform = `translateX(${nextTranslate}px)`;
  updateAutomationActiveState(nextIndex);

  if (shouldTrack) {
    const activeTitle = nextSlide.querySelector('h4')?.textContent.trim() || `slide_${nextIndex + 1}`;
    trackEvent('automation_slide_select', {
      slide_index: nextIndex + 1,
      slide_title: activeTitle,
    });
  }
}

if (automationTrack && automationSlides.length) {
  automationControls.forEach((control) => {
    control.setAttribute('aria-pressed', String(control.classList.contains('is-active')));

    control.addEventListener('click', () => {
      setAutomationSlide(Number(control.dataset.automationSlide), true);
    });
  });

  automationSlider?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.automation-control')) return;

    automationDragStartX = event.clientX;
    automationDragStartY = event.clientY;
    automationDragStartTranslate = getAutomationTranslateX();
    automationHasStartedDrag = false;
    automationPointerIsDown = true;

    automationSlider.setPointerCapture(event.pointerId);
  });

  automationSlider?.addEventListener('pointermove', (event) => {
    if (!automationPointerIsDown) return;

    const deltaX = event.clientX - automationDragStartX;
    const deltaY = event.clientY - automationDragStartY;

    if (!automationHasStartedDrag) {
      if (Math.abs(deltaX) < 8 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      automationHasStartedDrag = true;
      automationSlider.classList.add('is-dragging');
      automationTrack.style.transform = `translateX(${automationDragStartTranslate}px)`;
    }

    const maxTranslate = -(automationTrack.scrollWidth - automationSlider.clientWidth);
    const nextTranslate = Math.min(0, Math.max(maxTranslate, automationDragStartTranslate + deltaX));
    automationTrack.style.transform = `translateX(${nextTranslate}px)`;
    updateAutomationActiveFromPosition();
  });

  automationSlider?.addEventListener('pointerup', (event) => {
    if (automationHasStartedDrag) {
      setAutomationSlide(automationActiveIndex, true);
      trackEvent('automation_slider_drag', {
        slider_name: 'automation_examples',
      });
    } else {
      setAutomationSlide(automationActiveIndex);
    }

    automationPointerIsDown = false;
    automationSlider.classList.remove('is-dragging');

    if (automationSlider.hasPointerCapture(event.pointerId)) {
      automationSlider.releasePointerCapture(event.pointerId);
    }
  });

  automationSlider?.addEventListener('pointercancel', (event) => {
    setAutomationSlide(automationActiveIndex);
    automationPointerIsDown = false;
    automationSlider.classList.remove('is-dragging');

    if (automationSlider.hasPointerCapture(event.pointerId)) {
      automationSlider.releasePointerCapture(event.pointerId);
    }
  });

  window.addEventListener('resize', () => {
    setAutomationSlide(automationActiveIndex);
  });

  setAutomationSlide(0);
}

const footerContactForm = document.getElementById('footerContactForm');
const footerContactStatus = document.getElementById('footerContactStatus');
const EMAILJS_SERVICE_ID = 'jm2-limpio';
const EMAILJS_TEMPLATE_ID = 'template_8dl1y4o';
const EMAILJS_PUBLIC_KEY = 'LLIuQx-WZ1x6XBuDn';

if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'TU_PUBLIC_KEY_EMAILJS') {
  window.emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY,
  });
}

if (footerContactForm) {
  footerContactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(footerContactForm);
    const nombre = String(formData.get('nombre') || '').trim();
    const formaContacto = String(formData.get('forma_de_contacto') || 'WhatsApp').trim();
    const contactoDetalle = String(formData.get('contacto_detalle') || '').trim();
    const procedencia = window.location.pathname || 'sobre-mi';
    const referrer = document.referrer || 'Directo';
    const timestamp = new Date().toISOString();

    if (!nombre || !contactoDetalle) {
      if (footerContactStatus) {
        footerContactStatus.textContent = 'Completa todos los campos antes de enviar.';
      }
      return;
    }

    if (!window.emailjs) {
      if (footerContactStatus) {
        footerContactStatus.textContent = 'No se pudo cargar EmailJS.';
      }
      return;
    }

    if (EMAILJS_PUBLIC_KEY === 'TU_PUBLIC_KEY_EMAILJS') {
      if (footerContactStatus) {
        footerContactStatus.textContent = 'Falta configurar la clave publica de EmailJS en script.js.';
      }
      return;
    }

    const submitButton = footerContactForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
    }

    if (footerContactStatus) {
      footerContactStatus.textContent = 'Enviando mensaje...';
    }

    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        nombre,
        email: 'No indicado',
        telefono: contactoDetalle,
        forma_de_contacto: formaContacto,
        procedencia,
        referrer,
        timestamp,
      }, {
        publicKey: EMAILJS_PUBLIC_KEY,
      });

      if (footerContactStatus) {
        footerContactStatus.textContent = 'Mensaje enviado correctamente. Te contactaremos pronto.';
      }

      trackEvent('generate_lead', {
        contact_method: formaContacto.toLowerCase(),
        lead_source: 'footer_form',
      });

      footerContactForm.reset();
      closeContactModal();
    } catch (error) {
      const errorText = typeof error === 'object' && error && 'text' in error
        ? String(error.text)
        : error instanceof Error
          ? error.message
          : 'error desconocido';

      if (footerContactStatus) {
        footerContactStatus.textContent = `No se pudo enviar (${errorText}). Revisa service ID, template ID y clave publica en EmailJS.`;
      }

      console.error('Error al enviar formulario con EmailJS:', error);
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.textContent = 'Quiero verlo en mi empresa';
      }
    }
  });

}

const projectsViewport = document.getElementById('projectsViewport');
const projectsSlider = document.getElementById('slider');
const projectImages = projectsSlider ? projectsSlider.querySelectorAll('img') : [];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let projectIndex = Math.min(5, Math.max(0, projectImages.length - 1));
let projectsFirstLayout = true;

const projectPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function scrollProjectIntoView(smooth) {
  if (!projectsViewport || !projectImages.length) return;
  const active = projectImages[projectIndex];
  if (!active) return;
  const left = active.offsetLeft - (projectsViewport.clientWidth - active.offsetWidth) / 2;
  const max = projectsViewport.scrollWidth - projectsViewport.clientWidth;
  const clamped = Math.max(0, Math.min(left, max));
  projectsViewport.scrollTo({
    left: clamped,
    behavior: smooth && !projectPrefersReducedMotion.matches ? 'smooth' : 'auto',
  });
}

function updateProjectsSlider() {
  projectImages.forEach((img, i) => {
    const isActive = i === projectIndex;
    img.classList.toggle('active', isActive);
    img.closest('.project-card')?.classList.toggle('active', isActive);
  });
  const delay = projectsFirstLayout ? 0 : 40;
  window.setTimeout(() => {
    scrollProjectIntoView(!projectsFirstLayout);
    projectsFirstLayout = false;
  }, delay);
}

if (prevBtn && nextBtn && projectImages.length) {
  prevBtn.addEventListener('click', () => {
    projectIndex = (projectIndex - 1 + projectImages.length) % projectImages.length;
    updateProjectsSlider();
  });

  nextBtn.addEventListener('click', () => {
    projectIndex = (projectIndex + 1) % projectImages.length;
    updateProjectsSlider();
  });

  window.addEventListener('load', () => {
    scrollProjectIntoView(false);
  });

  window.addEventListener('resize', () => {
    scrollProjectIntoView(false);
  });

  updateProjectsSlider();
}

const projectsData = {
  1: {
    title: 'Sistema de facturación sencillo (taller)',
    images: ['img/1.png'],
    desc: 'Un sistema de facturación pensado para el ritmo real de un taller: crear presupuestos y facturas en minutos, tener un historial por cliente/vehículo y evitar perder tiempo buscando papeles. Mejora el control del trabajo (qué se ha hecho, cuándo y a quién), reduce errores al copiar/importar datos y deja la parte administrativa ordenada para cerrar mes sin estrés.',
  },
  2: {
    title: 'Seguimiento de fabricación y pedidos (fábrica de ropa)',
    images: ['img/2.png'],
    desc: 'Panel para controlar todo el ciclo del pedido: entrada, planificación, fabricación, preparación y envío. Permite trabajar por estados claros, registrar incidencias, automatizar cálculos de importes y márgenes, y enviar avisos por email al cliente cuando el pedido avanza. Resultado: menos llamadas de “¿cómo va lo mío?”, menos confusiones internas y más entregas a tiempo.',
  },
  3: {
    title: 'CRM (inmobiliaria)',
    images: ['img/3.png'],
    desc: 'CRM para no perder oportunidades: seguimiento de leads, registro de contactos y acciones (llamadas, visitas, notas), y pipeline comercial visible para todo el equipo. Integración con Google Calendar para citas/recordatorios y con Telegram para avisos rápidos. Mejora la coordinación, evita duplicidades y sube la conversión porque el cliente recibe respuesta y seguimiento a tiempo.',
  },
  4: {
    title: 'Gestión de citas (peluquería)',
    images: ['img/4.png'],
    desc: 'Agenda de citas diseñada para optimizar huecos y evitar solapes: vista diaria/semanal, duración por servicio, notas del cliente y control de disponibilidad real. Reduce llamadas, baja los “no me apuntaste” y mejora la ocupación del equipo. Además, ayuda a planificar picos de trabajo y a tener un histórico para fidelización.',
  },
  5: {
    title: 'Mantenimiento de flotas (taller/empresa)',
    images: ['img/5.png'],
    desc: 'Control de mantenimiento de flotas con visión 360º: visitas al taller, conceptos, tickets de gasoil, kilómetros, revisiones y vencimientos (ITV/seguros). Centraliza la información por vehículo, genera alertas antes de caducar y facilita reportes para dirección. Reduce averías por falta de control, minimiza paradas y elimina el caos de “cada uno lo apunta donde puede”.',
  },
  6: {
    title: 'Agenda personal con voz e imágenes (Telegram)',
    images: ['img/6.png'],
    desc: 'Captura ultra rápida desde Telegram: voz, fotos y textos que se convierten en notas/tareas y acaban en un panel para revisar y ejecutar. Ideal para trabajo en movimiento: no se pierden ideas, se etiqueta por temas y se consulta luego con contexto. Ahorra tiempo, evita olvidos y reduce el “lo tengo en un chat/nota/correo y no sé dónde”.',
  },
  7: {
    title: 'Control de sesiones y asistencias (gimnasio)',
    images: ['img/7.png'],
    desc: 'Sistema integral para un gimnasio: control de sesiones/asistencias, bonos, renovaciones, ingresos y comisiones de entrenadores. Incluye gestión de salas y reservas, y módulo de tienda/ventas si aplica. Da visibilidad diaria de la operación, reduce errores en cobros y mejora la rentabilidad al tener números claros (y no “en una libreta”).',
  },
  8: {
    title: 'Control de gastos de obra por fotos (IA + Telegram)',
    images: ['img/8.png'],
    desc: 'Control de gastos por obra sin fricción: se suben fotos por Telegram y la IA detecta y clasifica albaranes, facturas o partes de trabajo. Se asigna a obra/proveedor/concepto y queda todo trazado para revisar costes reales. Reduce horas administrativas, evita documentos perdidos y permite saber en qué se va el dinero antes de que sea tarde.',
  },
  9: {
    title: 'Gestión de flotas: consumos, ITV y seguros',
    images: ['img/9.png'],
    desc: 'Gestión y seguimiento continuo de flotas: consumos, mantenimientos, ITV, seguros y vencimientos con alertas automáticas. Ofrece una visión clara por vehículo y por periodos (coste/km, consumo, incidencias), lo que permite tomar decisiones con datos y recortar gastos. Evita multas y paradas por olvidos.',
  },
  10: {
    title: 'Software de entregas: tracking y albaranes',
    images: ['img/10.png'],
    desc: 'Software para operaciones de entrega: planificación, asignación, tracking, albaranes/firmas y control económico por ruta/cliente. Reduce incidencias (entregas fallidas, albaranes perdidos), mejora la comunicación con cliente y da control real de la operativa. Ideal para escalar sin depender de WhatsApps sueltos y Excel.',
  },
  11: {
    title: 'Citas privadas para peluquería (Telegram clientes)',
    images: ['img/11.png'],
    desc: 'Sistema de citas privado con soporte por Telegram para clientes: reservas, confirmaciones, cambios y recordatorios automáticos. Reduce llamadas y mensajes manuales, baja cancelaciones de última hora y mejora la experiencia del cliente. El negocio gana tiempo, orden y una agenda fiable incluso cuando el equipo está trabajando.',
  },
};

const projectModal = document.getElementById('projectModal');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalImg = document.getElementById('projectModalImg');
const projectModalDesc = document.getElementById('projectModalDesc');
const projectModalPrev = document.getElementById('projectModalPrev');
const projectModalNext = document.getElementById('projectModalNext');

let modalProjectId = null;
let modalImageIndex = 0;
let lastFocusedEl = null;

function setProjectModalOpen(isOpen) {
  if (!projectModal) return;
  projectModal.classList.toggle('open', isOpen);
  projectModal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function renderProjectModal() {
  const data = modalProjectId ? projectsData[modalProjectId] : null;
  if (!data) return;

  const imgs = data.images || [];
  modalImageIndex = Math.max(0, Math.min(modalImageIndex, imgs.length - 1));

  projectModalTitle.textContent = data.title || `Proyecto ${modalProjectId}`;
  projectModalDesc.textContent = data.desc || '';
  projectModalImg.src = imgs[modalImageIndex] || '';
  projectModalImg.alt = data.title || `Proyecto ${modalProjectId}`;

  const hasMany = imgs.length > 1;
  projectModalPrev.disabled = !hasMany || modalImageIndex === 0;
  projectModalNext.disabled = !hasMany || modalImageIndex === imgs.length - 1;
  projectModalPrev.style.display = hasMany ? '' : 'none';
  projectModalNext.style.display = hasMany ? '' : 'none';
}

function openProjectModal(id) {
  const data = projectsData[id];
  if (!data) return;
  lastFocusedEl = document.activeElement;
  modalProjectId = id;
  modalImageIndex = 0;
  renderProjectModal();
  setProjectModalOpen(true);
  const closeBtn = projectModal.querySelector('.project-modal__close');
  if (closeBtn) closeBtn.focus();
}

function closeProjectModal() {
  setProjectModalOpen(false);
  modalProjectId = null;
  modalImageIndex = 0;
  if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
  lastFocusedEl = null;
}

function nextModalImage(delta) {
  const data = modalProjectId ? projectsData[modalProjectId] : null;
  if (!data || !data.images || data.images.length <= 1) return;
  modalImageIndex = Math.max(0, Math.min(modalImageIndex + delta, data.images.length - 1));
  renderProjectModal();
}

document.querySelectorAll('.project-card').forEach((card) => {
  const img = card.querySelector('.project-thumb');
  const projectLabel = img?.getAttribute('alt') || 'proyecto';

  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Abrir ${projectLabel}`);

  card.addEventListener('click', () => {
    const id = Number(card.dataset.projectCard);
    openProjectModal(id);
  });

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const id = Number(card.dataset.projectCard);
      openProjectModal(id);
    }
  });
});

if (projectModal) {
  projectModal.addEventListener('click', (event) => {
    const target = event.target;
    if (target && target.getAttribute && target.getAttribute('data-close') === 'true') {
      closeProjectModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!projectModal.classList.contains('open')) return;
    if (event.key === 'Escape') closeProjectModal();
    if (event.key === 'ArrowLeft') nextModalImage(-1);
    if (event.key === 'ArrowRight') nextModalImage(1);
  });
}

if (projectModalPrev) projectModalPrev.addEventListener('click', () => nextModalImage(-1));
if (projectModalNext) projectModalNext.addEventListener('click', () => nextModalImage(1));
