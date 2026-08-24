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

const efficientContactForm = document.getElementById('efficientContactForm');
const efficientContactStatus = document.getElementById('efficientContactStatus');
const EMAILJS_SERVICE_ID = 'jm2-limpio';
const EMAILJS_TEMPLATE_ID = 'template_8dl1y4o';
const EMAILJS_PUBLIC_KEY = 'LLIuQx-WZ1x6XBuDn';

if (window.emailjs) {
  window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

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
  const mensaje = [
    `Oficio o actividad: ${actividad}`,
    `Personas que usarían la aplicación: ${tamanoEquipo}`,
    `Gestión actual: ${gestionActual}`,
    `Necesidad principal: ${necesidad || 'No indicada'}`,
  ].join('\n');
  const procedencia = 'elautonomoeficiente';

  if (!nombre || !actividad || !contactoDetalle || !tamanoEquipo || !gestionActual) {
    efficientContactStatus.textContent = 'Completa los campos obligatorios antes de enviar.';
    return;
  }

  if (!window.emailjs) {
    efficientContactStatus.textContent = 'No se pudo cargar el formulario. Puedes contactarme por WhatsApp.';
    return;
  }

  const submitButton = efficientContactForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.innerHTML = 'ENVIANDO…';
  efficientContactStatus.textContent = 'Enviando tu consulta…';

  try {
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      nombre,
      email: 'No indicado',
      telefono: contactoDetalle,
      forma_de_contacto: formaContacto,
      mensaje: mensaje || 'No indicado',
      procedencia,
      referrer: document.referrer || 'Directo',
      timestamp: new Date().toISOString(),
    }, { publicKey: EMAILJS_PUBLIC_KEY });

    efficientContactStatus.textContent = 'Mensaje enviado correctamente. Te contactaré pronto.';
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        contact_method: formaContacto.toLowerCase(),
        lead_source: procedencia,
        page_path: window.location.pathname,
      });
    }
    efficientContactForm.reset();
  } catch (error) {
    efficientContactStatus.textContent = 'No se pudo enviar. Inténtalo de nuevo o escríbeme por WhatsApp.';
    console.error('Error al enviar el formulario:', error);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'SOLICITAR ACCESO <span>↗</span>';
  }
});
