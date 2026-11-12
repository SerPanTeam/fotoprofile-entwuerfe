const navigation = document.querySelector("#navigation");
const toggle = document.querySelector(".header__toggle");
const compact = matchMedia("(max-width:1199px)");
const groups = [...navigation.querySelectorAll("details")];

function setMenu(open) {
  navigation.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  if (!open) groups.forEach(group => { group.open = false; });
}
function setLayout() {
  toggle.hidden = !compact.matches;
  setMenu(false);
}
document.documentElement.classList.add("js");
setLayout();
compact.addEventListener("change", setLayout);
toggle.addEventListener("click", () => {
  const opening = toggle.getAttribute("aria-expanded") === "false";
  setMenu(opening);
  if (opening) groups[0].querySelector("summary").focus();
});
groups.forEach(group => {
  group.addEventListener("toggle", () => {
    if (group.open) groups.filter(other => other !== group).forEach(other => { other.open = false; });
  });
});
navigation.addEventListener("keydown", event => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const group = event.target.closest("details");
  if (!group) return;

  const links = [...group.querySelectorAll("a")];
  const current = links.indexOf(event.target);
  const next = event.key === "ArrowDown"
    ? (current + 1) % links.length
    : (current < 1 ? links.length - 1 : current - 1);

  event.preventDefault();
  group.open = true;
  links[next].focus();
});

navigation.addEventListener("click", event => {
  const servicesLink = event.target.closest('a[href="#services"]');
  if (!servicesLink) return;
  setMenu(false);
  document.getElementById("services").focus({ preventScroll: true });
});

document.addEventListener("click", event => {
  if (toggle.contains(event.target) || navigation.contains(event.target)) return;
  setMenu(false);
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  const openGroup = groups.find(group => group.open);
  const menuOpen = navigation.classList.contains("is-open");
  if (!openGroup && !menuOpen) return;

  if (!event.target.closest(".header")) {
    setMenu(false);
    return;
  }
  if (openGroup) {
    openGroup.open = false;
    openGroup.querySelector("summary").focus();
  } else if (menuOpen) {
    setMenu(false);
    toggle.focus();
  }
});

if (matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -32px" });
  document.querySelectorAll("main > section:not(.hero, .trust)").forEach(section => {
    if (section.getBoundingClientRect().top < innerHeight) return;
    section.classList.add("will-reveal");
    observer.observe(section);
  });
}





