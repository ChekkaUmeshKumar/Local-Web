/**
 * generateJs — the entire exported behavior in ~30 lines of vanilla JS:
 *   1. Mobile nav toggle (paired with .lw-navbar__open rules in blocks.css)
 *   2. Smooth scrolling for anchor links that point at a real element
 *
 * No dependencies, no modules — must work when the site is opened
 * straight from a folder (file://). Kept under 1 KB.
 */

export function generateJs(): string {
  return `/* script.js — generated with LocalWeb */
(function () {
  "use strict";

  // Mobile navigation toggle
  var toggle = document.querySelector(".lw-navbar__toggle");
  var navbar = document.querySelector(".lw-navbar");
  if (toggle && navbar) {
    toggle.addEventListener("click", function () {
      var open = navbar.classList.toggle("lw-navbar__open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Smooth scroll for anchor links that point at a real element
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = null;
      try { target = document.querySelector(id); } catch (err) { /* bad selector */ }
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
})();
`;
}
