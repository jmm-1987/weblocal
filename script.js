const menuBtn = document.getElementById('menuBtn');
const mobilePanel = document.getElementById('mobilePanel');
const backdrop = document.getElementById('backdrop');

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

backdrop.addEventListener('click', closeMenu);
mobilePanel.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
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
