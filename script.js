/*
  Mangalam HDPE Pipes — script.js
  Vanilla JS only, no dependencies.
  Sections: sticky nav, mobile drawer, hero carousel,
            FAQ accordion, app carousel, process tabs,
            testimonials, catalogue form, contact form.
*/

document.addEventListener('DOMContentLoaded', () => {


  /* ───────────────────────────────────────────────────────────
     STICKY HEADER
     We watch the bottom edge of #hero. Once it scrolls above
     the viewport (bottom <= 0), the hero is gone and we slide
     the fixed header in. Scroll back up and it hides again.
  ─────────────────────────────────────────────────────────── */
  const stickyHeader  = document.getElementById('stickyHeader');
  const heroSection   = document.getElementById('hero');
  const heroNav       = document.getElementById('heroNav'); // fallback if #hero doesn't exist

  function updateStickyHeader() {
    if (!stickyHeader) return;
    const sentinel  = heroSection || heroNav;
    if (!sentinel) return;
    const heroGone  = sentinel.getBoundingClientRect().bottom <= 0;
    stickyHeader.classList.toggle('visible', heroGone);
  }

  window.addEventListener('scroll', updateStickyHeader, { passive: true });
  updateStickyHeader(); // run once — handles reload-with-scroll-position


  /* ───────────────────────────────────────────────────────────
     MOBILE DRAWER
     Both hamburgers (#heroHamburger, #stickyHamburger) open
     the same drawer. Clicking the overlay or any drawer link
     closes it.
  ─────────────────────────────────────────────────────────── */
  const drawer          = document.getElementById('mobileDrawer');
  const overlay         = document.getElementById('mobileOverlay');
  const heroHamburger   = document.getElementById('heroHamburger');
  const stickyHamburger = document.getElementById('stickyHamburger');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('visible');
    heroHamburger   && heroHamburger.classList.add('open');
    stickyHamburger && stickyHamburger.classList.add('open');
    document.body.style.overflow = 'hidden'; // stop background scroll
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    heroHamburger   && heroHamburger.classList.remove('open');
    stickyHamburger && stickyHamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  const toggleDrawer = () => drawer.classList.contains('open') ? closeDrawer() : openDrawer();

  heroHamburger   && heroHamburger.addEventListener('click', toggleDrawer);
  stickyHamburger && stickyHamburger.addEventListener('click', toggleDrawer);
  overlay         && overlay.addEventListener('click', closeDrawer);

  drawer && drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));


  /* ───────────────────────────────────────────────────────────
     HERO IMAGE CAROUSEL
     Autoplay every 4s. Clicking prev/next or a thumbnail
     resets the timer so it doesn't immediately fire after
     a manual interaction.
  ─────────────────────────────────────────────────────────── */
  const slides  = document.querySelectorAll('.carousel-slide');
  const thumbs  = document.querySelectorAll('.thumb');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  let current   = 0;
  let timer     = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    thumbs[current] && thumbs[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    thumbs[current] && thumbs[current].classList.add('active');
  }

  const startAutoplay = () => { timer = setInterval(() => goTo(current + 1), 4000); };
  const resetAutoplay = () => { clearInterval(timer); startAutoplay(); };

  if (slides.length) {
    prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
    nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        goTo(parseInt(thumb.dataset.index));
        resetAutoplay();
      });
    });

    startAutoplay();
  }


  /* ───────────────────────────────────────────────────────────
     FAQ ACCORDION
     One open at a time. Clicking an open item closes it.
  ─────────────────────────────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn  = item.querySelector('.faq-question');
    const icon = item.querySelector('.faq-icon');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');

      // close everything first
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const ic = i.querySelector('.faq-icon');
        const b  = i.querySelector('.faq-question');
        if (ic) ic.textContent = '↓';
        if (b)  b.setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('open');
        icon && (icon.textContent = '↑');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ───────────────────────────────────────────────────────────
     APPLICATIONS CAROUSEL
     Number of visible cards changes at breakpoints, so we
     recalculate on every resize too.
  ─────────────────────────────────────────────────────────── */
  const appCarousel = document.getElementById('appCarousel');

  if (appCarousel) {
    const cards    = appCarousel.querySelectorAll('.app-card');
    const appPrev  = document.getElementById('appPrev');
    const appNext  = document.getElementById('appNext');
    let   appIndex = 0;

    function visibleCards() {
      if (window.innerWidth <= 600)  return 1;
      if (window.innerWidth <= 800)  return 2;
      if (window.innerWidth <= 1100) return 3;
      return 4;
    }

    function moveCarousel() {
      const visible   = visibleCards();
      const cardWidth = cards[0] ? cards[0].offsetWidth + 20 : 0;
      const maxIndex  = Math.max(0, cards.length - visible);
      appIndex = Math.min(appIndex, maxIndex);
      appCarousel.style.transform = `translateX(-${appIndex * cardWidth}px)`;
    }

    appPrev && appPrev.addEventListener('click', () => { appIndex = Math.max(0, appIndex - 1); moveCarousel(); });
    appNext && appNext.addEventListener('click', () => {
      appIndex = Math.min(cards.length - visibleCards(), appIndex + 1);
      moveCarousel();
    });

    window.addEventListener('resize', moveCarousel);
  }


  /* ───────────────────────────────────────────────────────────
     MANUFACTURING PROCESS TABS
     Desktop: click a tab to switch panels.
     Mobile: prev/next buttons step through steps instead.
     The panel-nav arrows inside the image do the same thing.
  ─────────────────────────────────────────────────────────── */
  const processTabs   = document.querySelectorAll('.process-tab');
  const processPanels = document.querySelectorAll('.process-panel');
  const stepBadge     = document.querySelector('#processStepMobile .step-badge');
  const stepNames     = ['Raw Material', 'Extrusion', 'Cooling', 'Sizing', 'Quality Control', 'Marking', 'Cutting', 'Packaging'];
  let   currentStep   = 0;

  function goToStep(step) {
    step = (step + processPanels.length) % processPanels.length;
    currentStep = step;

    processTabs.forEach((t, i) => {
      t.classList.toggle('active', i === step);
      t.setAttribute('aria-selected', i === step);
    });
    processPanels.forEach((p, i) => p.classList.toggle('active', i === step));

    if (stepBadge) {
      stepBadge.textContent = `Step ${step + 1}/${processPanels.length}: ${stepNames[step] || ''}`;
    }
  }

  processTabs.forEach((tab, i) => tab.addEventListener('click', () => goToStep(i)));

  // arrows inside the process panel image
  document.querySelectorAll('.panel-nav').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(btn.classList.contains('panel-nav--prev') ? currentStep - 1 : currentStep + 1);
    });
  });

  const prevMobile = document.getElementById('processPrevMobile');
  const nextMobile = document.getElementById('processNextMobile');
  prevMobile && prevMobile.addEventListener('click', () => goToStep(currentStep - 1));
  nextMobile && nextMobile.addEventListener('click', () => goToStep(currentStep + 1));


  /* ───────────────────────────────────────────────────────────
     TESTIMONIALS  (auto-scroll, no manual controls)
  ─────────────────────────────────────────────────────────── */
  const testimonialsEl = document.getElementById('testimonialsCarousel');

  if (testimonialsEl) {
    const tCards  = testimonialsEl.querySelectorAll('.testimonial-card');
    let   tIndex  = 0;

    function visibleTestimonials() {
      if (window.innerWidth <= 600)  return 1;
      if (window.innerWidth <= 800)  return 2;
      if (window.innerWidth <= 1100) return 3;
      return 4;
    }

    function scrollTestimonials() {
      const visible   = visibleTestimonials();
      const cardWidth = tCards[0] ? tCards[0].offsetWidth + 20 : 0;
      const maxIndex  = Math.max(0, tCards.length - visible);
      if (tIndex > maxIndex) tIndex = 0;
      testimonialsEl.style.transform = `translateX(-${tIndex * cardWidth}px)`;
    }

    setInterval(() => {
      tIndex = (tIndex + 1) % Math.max(1, tCards.length - visibleTestimonials() + 1);
      scrollTestimonials();
    }, 5000);

    window.addEventListener('resize', scrollTestimonials);
  }


  /* ───────────────────────────────────────────────────────────
     CATALOGUE FORM  (fake submit with success state)
  ─────────────────────────────────────────────────────────── */
  const catalogueForm = document.querySelector('.catalogue-box__form');
  if (catalogueForm) {
    const btn   = catalogueForm.querySelector('.btn');
    const input = catalogueForm.querySelector('input[type="email"]');

    btn && btn.addEventListener('click', () => {
      if (!input || !input.value.includes('@')) {
        input && input.focus();
        return;
      }
      btn.textContent = '✓ Sent!';
      btn.disabled    = true;
      setTimeout(() => {
        btn.textContent = 'Request Catalogue';
        btn.disabled    = false;
        input.value     = '';
      }, 3000);
    });
  }


  /* ───────────────────────────────────────────────────────────
     CONTACT FORM  (fake submit)
  ─────────────────────────────────────────────────────────── */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (!submitBtn) return;
      submitBtn.textContent = '✓ Request Sent!';
      submitBtn.disabled    = true;
      setTimeout(() => {
        submitBtn.textContent = 'Request Custom Quote';
        submitBtn.disabled    = false;
        contactForm.reset();
      }, 3000);
    });
  }


});
