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

// Home: the hero chart counts up, sample screens respond, and small bits of play.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  function fmt(n) { return n.toLocaleString("en-US"); }

  function countUp(el, dur) {
    var target = +el.getAttribute("data-count"), start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  // Square sparks that burst from an element, inside its sample screen.
  function burst(from) {
    if (reduce || !from || !from.animate) return;
    var mock = from.closest(".mock");
    if (!mock) return;
    var mr = mock.getBoundingClientRect(), br = from.getBoundingClientRect();
    var cx = br.left - mr.left + br.width / 2, cy = br.top - mr.top + br.height / 2;
    for (var i = 0; i < 10; i++) {
      var s = document.createElement("span");
      s.className = "mock-spark";
      s.style.left = (cx - 3) + "px";
      s.style.top = (cy - 3) + "px";
      mock.appendChild(s);
      var a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4, d = 26 + Math.random() * 26;
      s.animate(
        [{ transform: "translate(0,0) rotate(0)", opacity: 1 },
         { transform: "translate(" + Math.cos(a) * d + "px," + Math.sin(a) * d + "px) rotate(180deg) scale(.3)", opacity: 0 }],
        { duration: 650 + Math.random() * 250, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      ).onfinish = (function (el) { return function () { el.remove(); }; })(s);
    }
  }

  // Pause button on the over-target campaign (works with reduced motion too).
  document.querySelectorAll(".mock-pause").forEach(function (btn) {
    var row = btn.closest("tr"), toast = btn.closest(".mock").querySelector(".mock-toast");
    btn.addEventListener("click", function () {
      var paused = row.classList.toggle("is-paused");
      btn.textContent = paused ? "Resume" : "Pause";
      if (toast) toast.hidden = !paused;
      if (paused) burst(btn);
    });
  });

  if (reduce) return;

  // Hero numbers count up as the bars grow.
  document.querySelectorAll(".scene [data-count]").forEach(function (el) {
    if (!el.getClientRects().length) return; // the hidden layout
    setTimeout(function () { countUp(el, 1100); }, +el.getAttribute("data-delay") || 0);
  });

  if (finePointer) {
    // Floating marks drift away from the pointer.
    var hero = document.querySelector(".hero-band");
    if (hero) {
      var marks = hero.querySelectorAll(".sparkles span");
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        marks.forEach(function (m, i) {
          var k = 10 + (i % 3) * 8;
          m.style.setProperty("--mx", (-x * k) + "px");
          m.style.setProperty("--my", (-y * k) + "px");
        });
      });
    }
    // Sample screens tilt slightly toward the pointer.
    document.querySelectorAll(".mock").forEach(function (m) {
      m.addEventListener("pointermove", function (e) {
        var r = m.getBoundingClientRect();
        m.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 6) + "deg");
        m.style.setProperty("--rx", (-((e.clientY - r.top) / r.height - 0.5) * 5) + "deg");
      });
      m.addEventListener("pointerleave", function () { m.style.setProperty("--rx", "0deg"); m.style.setProperty("--ry", "0deg"); });
    });
  }

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".recon").forEach(function (r) { r.classList.add("in"); });
    return;
  }
  function once(el, fn, threshold) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: threshold || 0.3 });
    io.observe(el);
  }

  // Attribution sample: bars fill and the numbers count when it scrolls in.
  document.querySelectorAll(".recon").forEach(function (recon) {
    once(recon, function () {
      recon.classList.add("in");
      recon.querySelectorAll("[data-count]").forEach(function (v, i) { setTimeout(function () { countUp(v, 900); }, i * 120); });
    }, 0.4);
  });

  // Automation sample: the lead ticks through each step, then a small burst.
  document.querySelectorAll(".lead-steps").forEach(function (list) {
    if (list.getBoundingClientRect().top < window.innerHeight) return; // already on screen at load
    var items = list.querySelectorAll("li");
    list.classList.add("playing");
    items.forEach(function (li) { li.classList.remove("done"); });
    once(list, function () {
      items.forEach(function (li, i) {
        setTimeout(function () {
          li.classList.add("done");
          if (i === items.length - 1) { burst(li.querySelector(".lead-dot")); setTimeout(function () { list.classList.remove("playing"); }, 400); }
        }, 300 + i * 500);
      });
    }, 0.5);
  });
})();
