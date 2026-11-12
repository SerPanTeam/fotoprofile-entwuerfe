/**
 * Fotoprofile Katrin Bernhard — Richtung C: "Farbe und Licht"
 * Interaktive Steuerung: Mobile Navigation, Bereichs-Filter & Portfolio-Lightbox.
 * Ohne JS bleiben alle Inhalte und Menüs vollständig zugänglich.
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  const burger = document.querySelector(".site-header__burger");
  const nav = document.getElementById("site-nav");
  const submenuTriggers = document.querySelectorAll(".site-nav__trigger");

  function closeAllSubmenus(exceptItem) {
    submenuTriggers.forEach(function (trigger) {
      const parentItem = trigger.closest(".site-nav__item--has-submenu");
      if (parentItem && parentItem !== exceptItem) {
        parentItem.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  const root = document.documentElement;

  function closeMobileNav() {
    if (!burger) return;
    root.classList.remove("is-nav-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
    closeAllSubmenus(null);
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      if (burger.getAttribute("aria-expanded") === "true") {
        closeMobileNav();
      } else {
        root.classList.add("is-nav-open");
        burger.setAttribute("aria-expanded", "true");
        burger.setAttribute("aria-label", "Menü schließen");
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMobileNav();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1200 && root.classList.contains("is-nav-open")) {
        closeMobileNav();
      }
    });
  }

  submenuTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.stopPropagation();
      const parentItem = trigger.closest(".site-nav__item--has-submenu");
      if (!parentItem) return;
      const isOpen = parentItem.classList.contains("is-open");
      closeAllSubmenus(parentItem);
      parentItem.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".site-nav__item--has-submenu")) {
      closeAllSubmenus(null);
    }
  });

  // Bereichs-Filter (Alle / Privat / Business)
  const filterButtons = document.querySelectorAll(".filter-pill");
  const filterableItems = document.querySelectorAll("[data-category]");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const filter = btn.getAttribute("data-filter");
      filterButtons.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      filterableItems.forEach(function (item) {
        const cat = item.getAttribute("data-category");
        const shouldShow = filter === "all" || cat === filter;
        item.classList.toggle("is-filtered-out", !shouldShow);
      });
    });
  });

  // Portfolio-Lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxStage = document.getElementById("lightbox-stage");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.querySelector(".lightbox__close");
  const portfolioItems = document.querySelectorAll(".portfolio__item");

  let lastOpener = null;

  portfolioItems.forEach(function (item) {
    // per Tastatur erreichbar: Enter oder Leertaste öffnet die Großansicht
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        item.click();
      }
    });
    item.addEventListener("click", function () {
      const img = item.querySelector("img");
      if (!img || !lightbox || !lightboxStage) return;
      lastOpener = item;
      lightboxStage.innerHTML = "";
      const preview = document.createElement("img");
      preview.className = "lightbox__image";
      preview.src = img.getAttribute("src");
      preview.alt = img.getAttribute("alt") || "";
      lightboxStage.appendChild(preview);
      if (lightboxCaption) {
        lightboxCaption.textContent = img.getAttribute("alt") || "";
      }
      lightbox.hidden = false;
      if (lightboxClose) lightboxClose.focus();
    });
  });

  function closeLightbox() {
    if (lightbox && !lightbox.hidden) {
      lightbox.hidden = true;
      if (lightboxStage) lightboxStage.innerHTML = "";
      if (lastOpener) lastOpener.focus();
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeLightbox();
      closeAllSubmenus(null);
      if (root.classList.contains("is-nav-open")) {
        closeMobileNav();
        burger.focus();
      }
    }
  });
})();
