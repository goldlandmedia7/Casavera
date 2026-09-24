/* =========================================================
   Casavera Interiors — site script
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('progressBar');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ---------- Header solid state ---------- */
  const header = document.getElementById('siteHeader');
  function updateHeader() {
    if (header) header.classList.toggle('solid', window.scrollY > 40);
  }

  /* ---------- Back-to-top button ---------- */
  const toTop = document.getElementById('toTop');
  function updateToTop() {
    if (toTop) toTop.classList.toggle('show', window.scrollY > 700);
  }
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        updateHeader();
        updateToTop();
        ticking = false;
      });
      ticking = true;
    }
  });
  updateProgress();
  updateHeader();
  updateToTop();

  /* ---------- Mobile menu toggle ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const navLinksPanel = document.getElementById('navLinks');
  if (menuBtn && navLinksPanel) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinksPanel.classList.toggle('open');
      menuBtn.classList.toggle('open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });
    navLinksPanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinksPanel.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.primary-nav a[href^="#"]');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navAnchors.forEach((a) => {
              a.classList.toggle('active', a.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- GSAP animations ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if (!reduceMotion) {
      // Hero load-in — the one orchestrated motion moment on the page
      gsap.timeline({ delay: 0.15 })
        .to('#heroTitle .line span', { y: '0%', duration: 1.1, stagger: 0.12, ease: 'power4.out' })
        .to('.hero-sub', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
        .to('.hero-cta-row', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6');
    } else {
      document.querySelectorAll('#heroTitle .line span').forEach((el) => (el.style.transform = 'none'));
      document.querySelectorAll('.hero-sub, .hero-cta-row').forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
    }

    document.querySelectorAll('.reveal').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('in'),
        once: true
      });
    });
  } else {
    document.querySelectorAll('.reveal, .hero-sub, .hero-cta-row').forEach((el) => {
      el.classList.add('in');
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    document.querySelectorAll('#heroTitle .line span').forEach((el) => (el.style.transform = 'none'));
  }

  /* ---------- Gallery drag-to-scroll (desktop mouse) ---------- */
  const track = document.querySelector('.gallery-track');
  if (track) {
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX;
      scrollStart = track.scrollLeft;
    });
    window.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('dragging');
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const dx = e.pageX - startX;
      track.scrollLeft = scrollStart - dx;
    });
  }

  /* ---------- Contact form validation + fake submit ---------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  function setFieldError(field, message) {
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('error', Boolean(message));
    const msgEl = wrap.querySelector('.error-msg');
    if (msgEl) msgEl.textContent = message || '';
  }

  function validateForm(data) {
    let valid = true;

    if (!data.name.value.trim()) {
      setFieldError(data.name, 'Please enter your name.');
      valid = false;
    } else {
      setFieldError(data.name, '');
    }

    const phonePattern = /^[+\d][\d\s-]{6,}$/;
    if (!phonePattern.test(data.phone.value.trim())) {
      setFieldError(data.phone, 'Enter a valid phone number.');
      valid = false;
    } else {
      setFieldError(data.phone, '');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email.value.trim())) {
      setFieldError(data.email, 'Enter a valid email address.');
      valid = false;
    } else {
      setFieldError(data.email, '');
    }

    return valid;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = {
        name: form.querySelector('#cName'),
        phone: form.querySelector('#cPhone'),
        email: form.querySelector('#cEmail')
      };

      if (!validateForm(fields)) {
        if (formStatus) formStatus.textContent = 'Please fix the highlighted fields.';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.setAttribute('disabled', 'true');
      if (formStatus) formStatus.textContent = 'Sending your request…';

      // Placeholder for a real submission endpoint.
      // Replace this timeout with an actual fetch() call to your backend or form service.
      setTimeout(() => {
        if (formStatus) formStatus.textContent = 'Thank you — a design manager will contact you within one business day.';
        form.reset();
        if (submitBtn) submitBtn.removeAttribute('disabled');
      }, 900);
    });
  }
})();