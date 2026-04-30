const menuBtn = document.getElementById('menuBtn');
const mobilePanel = document.getElementById('mobilePanel');
const backdrop = document.getElementById('backdrop');
const closeMenuBtn = document.getElementById('closeMenuBtn');

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
});

closeMenuBtn.addEventListener('click', closeMenu);
backdrop.addEventListener('click', closeMenu);
mobilePanel.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobilePanel.classList.contains('open')) {
    closeMenu();
  }
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

const automationSlider = document.querySelector('.automation-slider');
const automationTrack = document.querySelector('[data-automation-track]');
let automationSlides = Array.from(document.querySelectorAll('.automation-slide'));
let automationDragStartX = 0;
let automationDragStartY = 0;
let automationDragStartTranslate = 0;
let automationHasStartedDrag = false;

function getAutomationTranslateX() {
  if (!automationTrack) return 0;
  const transform = window.getComputedStyle(automationTrack).transform;
  if (transform === 'none') return 0;
  const matrix = new DOMMatrixReadOnly(transform);
  return matrix.m41;
}

function normalizeAutomationTranslate(value) {
  if (!automationTrack) return value;
  const loopWidth = automationTrack.scrollWidth / 2;
  if (!loopWidth) return value;

  let nextValue = value;
  while (nextValue > 0) nextValue -= loopWidth;
  while (nextValue < -loopWidth) nextValue += loopWidth;
  return nextValue;
}

if (automationTrack && automationSlides.length) {
  automationSlides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    automationTrack.appendChild(clone);
  });

  automationSlider?.addEventListener('pointerdown', (event) => {
    automationDragStartX = event.clientX;
    automationDragStartY = event.clientY;
    automationDragStartTranslate = getAutomationTranslateX();
    automationHasStartedDrag = false;

    automationSlider.setPointerCapture(event.pointerId);
  });

  automationSlider?.addEventListener('pointermove', (event) => {
    const deltaX = event.clientX - automationDragStartX;
    const deltaY = event.clientY - automationDragStartY;

    if (!automationHasStartedDrag) {
      if (Math.abs(deltaX) < 8 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      automationHasStartedDrag = true;
      automationSlider.classList.add('is-paused', 'is-dragging');
      automationTrack.style.transform = `translateX(${automationDragStartTranslate}px)`;
    }

    const nextTranslate = normalizeAutomationTranslate(automationDragStartTranslate + deltaX);
    automationTrack.style.transform = `translateX(${nextTranslate}px)`;
  });

  automationSlider?.addEventListener('pointerup', (event) => {
    automationSlider.classList.remove('is-dragging');
    if (automationSlider.hasPointerCapture(event.pointerId)) {
      automationSlider.releasePointerCapture(event.pointerId);
    }
  });

  automationSlider?.addEventListener('pointercancel', (event) => {
    automationSlider.classList.remove('is-dragging');
    if (automationSlider.hasPointerCapture(event.pointerId)) {
      automationSlider.releasePointerCapture(event.pointerId);
    }
  });
}
