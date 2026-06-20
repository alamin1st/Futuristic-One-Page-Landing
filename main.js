/* ============================================================
   Aethelon — interaction layer (vanilla JS)
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: scroll state + mobile toggle ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");

  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animate readout bars when in view ---------- */
  var bars = document.querySelectorAll(".readout__bar");
  if ("IntersectionObserver" in window) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-on"); bio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    bars.forEach(function (b) { bio.observe(b); });
  } else {
    bars.forEach(function (b) { b.classList.add("is-on"); });
  }

  /* ---------- Pointer glow on cards ---------- */
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Subtle parallax on hero visual ---------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  if (!reduceMotion && parallaxEls.length) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        parallaxEls.forEach(function (el) {
          var f = parseFloat(el.getAttribute("data-parallax")) || 0.05;
          el.style.transform = "translate3d(0," + (y * f * -1) + "px,0)";
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Form validation ---------- */
  var form = document.getElementById("accessForm");
  if (form) {
    var note = document.getElementById("formNote");
    var input = document.getElementById("email");
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value.trim();
      if (!re.test(val)) {
        input.classList.add("invalid");
        note.style.color = "#ff9a9a";
        note.textContent = "Please enter a valid work email.";
        input.focus();
        return;
      }
      input.classList.remove("invalid");
      note.style.color = "var(--blue)";
      note.textContent = "Request received — our team will reach out shortly.";
      form.reset();
    });
    input.addEventListener("input", function () {
      input.classList.remove("invalid");
      if (note.textContent) note.textContent = "";
    });
  }

  /* ---------- Ambient star field (lightweight canvas) ---------- */
  var canvas = document.getElementById("starfield");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      build();
    }

    function build() {
      var count = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 11000));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (Math.random() * 1.1 + 0.25) * dpr,
          a: Math.random() * 0.6 + 0.15,
          tw: Math.random() * 0.015 + 0.003,
          dir: Math.random() > 0.5 ? 1 : -1,
          vy: (Math.random() * 0.12 + 0.02) * dpr
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.a += s.tw * s.dir;
        if (s.a > 0.85 || s.a < 0.12) s.dir *= -1;
        s.y += s.vy;
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        var hue = i % 7 === 0 ? "201, 184, 255" : "207, 224, 255";
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + hue + "," + s.a + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    tick();
  }
})();
