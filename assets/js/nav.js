/* ==========================================================================
   nav.js — ハンバーガーメニュー開閉・フォーカストラップ・スクロールヘッダー
   構成案 §2.3 / §2.4 / §2.4.1 準拠
   ========================================================================== */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var hamburger = document.querySelector(".hamburger");
  var nav = document.getElementById("global-nav");
  var overlay = document.querySelector(".nav-overlay");
  var closeBtn = document.querySelector(".global-nav__close");
  var lastFocused = null;

  /* ---------------- ハンバーガーメニュー ---------------- */

  function getFocusable() {
    if (!nav) return [];
    var selector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.prototype.slice.call(nav.querySelectorAll(selector)).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function openMenu() {
    if (!nav || !hamburger) return;
    lastFocused = document.activeElement;
    document.documentElement.classList.add("nav-open");
    hamburger.setAttribute("aria-expanded", "true");
    nav.classList.add("is-open");
    if (overlay) overlay.classList.add("is-open");
    nav.removeAttribute("hidden");

    if (window.gsap && document.documentElement.classList.contains("js-anim-ready")) {
      gsap.fromTo(
        nav,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.45, ease: "power3.out" }
      );
      var items = nav.querySelectorAll(".nav-list > li, .nav-cta, .nav-meta");
      gsap.fromTo(
        items,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.05, delay: 0.15 }
      );
    } else {
      nav.style.transform = "translateX(0)";
    }

    document.addEventListener("keydown", onKeydown, true);

    var focusables = getFocusable();
    var target = closeBtn || focusables[0];
    if (target) {
      window.setTimeout(function () {
        target.focus();
      }, 60);
    }
  }

  function closeMenu() {
    if (!nav || !hamburger) return;
    document.documentElement.classList.remove("nav-open");
    hamburger.setAttribute("aria-expanded", "false");
    if (overlay) overlay.classList.remove("is-open");

    if (window.gsap && document.documentElement.classList.contains("js-anim-ready")) {
      gsap.to(nav, {
        xPercent: 100,
        duration: 0.35,
        ease: "power2.in",
        onComplete: function () {
          nav.classList.remove("is-open");
          nav.setAttribute("hidden", "");
        }
      });
    } else {
      nav.style.transform = "translateX(100%)";
      nav.classList.remove("is-open");
      nav.setAttribute("hidden", "");
    }

    document.removeEventListener("keydown", onKeydown, true);

    if (lastFocused) {
      lastFocused.focus();
    } else {
      hamburger.focus();
    }
  }

  function isMenuOpen() {
    return hamburger && hamburger.getAttribute("aria-expanded") === "true";
  }

  function onKeydown(e) {
    if (!isMenuOpen()) return;

    if (e.key === "Escape" || e.key === "Esc") {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === "Tab") {
      var focusables = getFocusable();
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !nav.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !nav.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  /* ---------------- ナビ内アコーディオン（業務案内サブメニュー） ---------------- */
  var subToggles = document.querySelectorAll(".nav-subtoggle-btn");
  subToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".nav-item--has-sub");
      if (!item) return;
      var isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", isOpen ? "false" : "true");
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  /* ---------------- スクロール連動ヘッダー ---------------- */
  if (header) {
    var scrolled = false;
    var transitionTimer = null;
    var ticking = false;

    function updateHeader() {
      var shouldScroll = window.scrollY > 50;
      if (shouldScroll !== scrolled) {
        scrolled = shouldScroll;
        header.classList.toggle("is-scrolled", scrolled);
        header.classList.add("is-transitioning");
        window.clearTimeout(transitionTimer);
        transitionTimer = window.setTimeout(function () {
          header.classList.remove("is-transitioning");
        }, 400);
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateHeader();
  }

  /* ---------------- FAQ / 各種アコーディオン汎用 ---------------- */
  document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".accordion-item");
      if (!item) return;
      var isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", isOpen ? "false" : "true");
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  /* ---------------- FAQタブ（voice.html / faq.html） ---------------- */
  document.querySelectorAll("[data-tab-group]").forEach(function (group) {
    var groupName = group.getAttribute("data-tab-group");
    var tabs = group.querySelectorAll("[data-tab-target]");
    var panels = document.querySelectorAll('[data-tab-panel][data-tab-group-target="' + groupName + '"]');

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");

        var target = tab.getAttribute("data-tab-target");
        panels.forEach(function (panel) {
          var match = target === "all" || panel.getAttribute("data-tab-panel") === target;
          panel.hidden = !match;
          if (match && window.gsap && document.documentElement.classList.contains("js-anim-ready")) {
            gsap.fromTo(panel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
          }
        });
      });
    });
  });
})();
