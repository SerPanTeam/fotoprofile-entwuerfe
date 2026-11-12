/**
 * Fotoprofile Katrin Bernhard — Richtung B: "Kontrast & Studio-Fokus"
 * Schlanke Interaktionslogik für mobile Navigation und Untermenüs.
 * Ohne JS bleibt die gesamte Navigation offen und benutzbar.
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

  if (burger && nav) {
    burger.addEventListener("click", function () {
      const isExpanded = burger.getAttribute("aria-expanded") === "true";
      const nextState = !isExpanded;
      burger.setAttribute("aria-expanded", String(nextState));
      burger.setAttribute("aria-label", nextState ? "Menü schließen" : "Menü öffnen");
      nav.classList.toggle("is-open", nextState);
      if (!nextState) {
        closeAllSubmenus(null);
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

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAllSubmenus(null);
      if (burger && nav && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Menü öffnen");
        burger.focus();
      }
    }
  });
})();
