(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Theme: follow the system unless the visitor picks one. Picking the same
  // theme as the system clears the override, so later system changes apply.
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  var toggles = document.querySelectorAll(".theme-toggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function currentTheme() {
    return root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light");
  }
  function syncThemeUI() {
    var dark = currentTheme() === "dark";
    toggles.forEach(function (b) { b.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode"); });
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#081a33" : "#071d3e");
  }
  function setTheme(next) {
    var system = systemDark.matches ? "dark" : "light";
    try {
      if (next === system) { root.removeAttribute("data-theme"); localStorage.removeItem("theme"); }
      else { root.setAttribute("data-theme", next); localStorage.setItem("theme", next); }
    } catch (e) { root.setAttribute("data-theme", next); }
    syncThemeUI();
  }
  var pendingTheme = null; // a quick second click flips from the theme still being applied
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = (pendingTheme || currentTheme()) === "dark" ? "light" : "dark";
      if (!document.startViewTransition || reduceMotion.matches) { setTheme(next); return; }
      pendingTheme = next;
      // Circle wipe outward from the toggle.
      var r = btn.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add("theme-switching");
      var t = document.startViewTransition(function () { setTheme(next); pendingTheme = null; });
      t.ready.then(function () {
        root.animate(
          { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
          { duration: 600, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      });
      t.finished.finally(function () { root.classList.remove("theme-switching"); });
    });
  });
  systemDark.addEventListener("change", syncThemeUI);
  syncThemeUI();

  // Services menu: opens on click, closes on Escape, outside clicks, or tabbing away.
  document.querySelectorAll(".nav-menu").forEach(function (menu) {
    var btn = menu.querySelector(".nav-menu-btn");
    if (!btn) return;
    function setOpen(open) {
      menu.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function () { setOpen(!menu.classList.contains("open")); });
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) { setOpen(false); btn.focus(); }
    });
    // Only keyboard moves set relatedTarget; mouse clicks are handled by the document listener.
    menu.addEventListener("focusout", function (e) {
      if (e.relatedTarget && !menu.contains(e.relatedTarget)) setOpen(false);
    });
    document.addEventListener("click", function (e) { if (!menu.contains(e.target)) setOpen(false); });
  });

  // Header compacts after the page scrolls a little.
  var header = document.querySelector(".site-header");
  if (header) {
    // Two thresholds, further apart than the 12px the header shrinks, so compacting
    // can't nudge the scroll position back across the line and make it flicker.
    var compact = false;
    var onScroll = function () {
      var y = window.scrollY;
      if (!compact && y > 64) compact = true;
      else if (compact && y < 4) compact = false;
      header.classList.toggle("is-scrolled", compact);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Charts, headlines, and dividers animate as they scroll into view.
  var targets = document.querySelectorAll(".bars, .card, .cta, .section-head, .rule, .steps, .overcount");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.3, rootMargin: "0px 0px -8% 0px" });
  targets.forEach(function (el) { io.observe(el); });
})();
