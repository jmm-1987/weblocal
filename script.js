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

closeMenuBtn.addEventListener('click', closeMenu);
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

  trackEvent('generate_lead', {
    contact_method: 'contact_modal',
    lead_source: 'cta_button',
  });
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
const footerContactMethodSelect = footerContactForm?.querySelector('select[name="forma_contacto"]');
const footerContactDetailLabel = document.getElementById('footerContactDetailLabel');
const footerContactDetailInput = document.getElementById('footerContactDetailInput');
const footerContactDayInput = footerContactForm?.querySelector('input[name="dia_llamada"]');
const footerContactHourInput = footerContactForm?.querySelector('input[name="hora_llamada"]');
const EMAILJS_SERVICE_ID = 'service_a1xi29i';
const EMAILJS_TEMPLATE_ID = 'template_8dl1y4o';
const EMAILJS_PUBLIC_KEY = 'topNg38j9LTlBzeSQ';

if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'TU_PUBLIC_KEY_EMAILJS') {
  window.emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY,
  });
}

if (footerContactForm) {
  function updateContactDetailField() {
    if (!footerContactMethodSelect || !footerContactDetailInput || !footerContactDetailLabel) return;

    const selectedMethod = footerContactMethodSelect.value;

    if (selectedMethod === 'Prefiere Email') {
      footerContactDetailLabel.textContent = 'Email';
      footerContactDetailInput.type = 'email';
      footerContactDetailInput.placeholder = 'tuemail@empresa.com';
      footerContactDetailInput.autocomplete = 'email';
      return;
    }

    if (selectedMethod === 'Prefiere WhatsApp') {
      footerContactDetailLabel.textContent = 'Numero de telefono';
      footerContactDetailInput.type = 'tel';
      footerContactDetailInput.placeholder = 'Tu numero de telefono';
      footerContactDetailInput.autocomplete = 'tel';
      return;
    }

    if (selectedMethod === 'Prefiere llamada') {
      footerContactDetailLabel.textContent = 'Numero de telefono';
      footerContactDetailInput.type = 'tel';
      footerContactDetailInput.placeholder = 'Tu numero de telefono';
      footerContactDetailInput.autocomplete = 'tel';
      return;
    }

    footerContactDetailLabel.textContent = 'Dato de contacto';
    footerContactDetailInput.type = 'text';
    footerContactDetailInput.placeholder = 'Selecciona primero la forma de contacto';
    footerContactDetailInput.autocomplete = 'off';
  }

  footerContactMethodSelect?.addEventListener('change', updateContactDetailField);
  updateContactDetailField();

  footerContactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(footerContactForm);
    const nombre = String(formData.get('nombre') || '').trim();
    const empresa = String(formData.get('empresa') || '').trim();
    const formaContacto = String(formData.get('forma_contacto') || '').trim();
    const contactoDetalle = String(formData.get('contacto_detalle') || '').trim();
    const diaLlamada = String(formData.get('dia_llamada') || '').trim();
    const horaLlamada = String(formData.get('hora_llamada') || '').trim();

    if (!nombre || !empresa || !formaContacto || !contactoDetalle || !diaLlamada || !horaLlamada) {
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
        email: contactoDetalle,
        empresa,
        forma_de_contacto: formaContacto,
        contacto_detalle: contactoDetalle,
        dia_llamada: diaLlamada,
        hora_llamada: horaLlamada,
        'forma de contacto': formaContacto,
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
      footerContactDayInput?.setAttribute('min', new Date().toISOString().split('T')[0]);
      footerContactHourInput?.setAttribute('step', '900');
      updateContactDetailField();
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
        submitButton.textContent = 'Enviar solicitud';
      }
    }
  });

  footerContactDayInput?.setAttribute('min', new Date().toISOString().split('T')[0]);
  footerContactHourInput?.setAttribute('step', '900');
}
