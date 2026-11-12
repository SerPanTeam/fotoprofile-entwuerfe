/**
 * Fotoprofile Katrin Bernhard — Progressive Enhancement Script
 * Mobile burger menu, accessible dropdowns, and subtle scroll reveals.
 */
(function () {
  'use strict';

  document.body.classList.add('js-enabled');

  var burger = document.querySelector('.site-header__burger');
  var nav = document.getElementById('site-nav');
  var submenuTriggers = document.querySelectorAll('.site-nav__trigger');

  function closeAllSubmenus(exceptTrigger) {
    submenuTriggers.forEach(function (btn) {
      if (btn !== exceptTrigger) {
        btn.setAttribute('aria-expanded', 'false');
        var parent = btn.closest('.site-nav__item--has-submenu');
        if (parent) {
          parent.classList.remove('is-open');
        }
      }
    });
  }

  function closeMobileNav() {
    if (!burger) return;
    document.body.classList.remove('is-nav-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
    closeAllSubmenus(null);
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var expanded = burger.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMobileNav();
      } else {
        document.body.classList.add('is-nav-open');
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', 'Menü schließen');
      }
    });

    nav.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (link && window.innerWidth < 1024) {
        closeMobileNav();
      }
    });
  }

  submenuTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAllSubmenus(trigger);
      var parent = trigger.closest('.site-nav__item--has-submenu');
      if (isOpen) {
        trigger.setAttribute('aria-expanded', 'false');
        if (parent) parent.classList.remove('is-open');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        if (parent) parent.classList.add('is-open');
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.site-nav__item--has-submenu')) {
      closeAllSubmenus(null);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllSubmenus(null);
      if (document.body.classList.contains('is-nav-open')) {
        closeMobileNav();
        if (burger) burger.focus();
      }
    }
  });

  if (
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    var targets = document.querySelectorAll(
      '.hero__content, .hero__media, .section__head, .intro__body, .service-card, .service-panel, .portfolio__item, .about__media, .about__content, .testimonials__summary, .area__studio, .area__region, .contact__cta, .contact__details'
    );

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    targets.forEach(function (el) {
      el.classList.add('reveal-item');
      observer.observe(el);
    });
  }
})();
