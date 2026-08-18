/* ==========================================================================
   animations.js — GSAP / ScrollTrigger 初期化、カウントアップ
   構成案 §4.6（CDNフェイルセーフ）/ §4.7（初期化タイミング）準拠
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* GSAPが読み込めていない場合は js-anim-ready を付与せず、
       CSS側の .js-anim-ready スコープにより .reveal 等は通常表示のまま残る */
    if (typeof window.gsap === "undefined") {
      return;
    }

    document.documentElement.classList.add("js-anim-ready");

    var hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
    if (hasScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (reduceMotion) {
      gsap.defaults({ duration: 0.001 });
    }

    /* ---------------- フェード&ライズ（reveal） ---------------- */
    var revealEls = gsap.utils.toArray(".reveal");
    if (revealEls.length) {
      revealEls.forEach(function (el) {
        var groupSelector = el.getAttribute("data-reveal-group");
        var animConf = {
          opacity: 1,
          y: 0,
          duration: reduceMotion ? 0.001 : 0.8,
          ease: "power3.out"
        };

        if (hasScrollTrigger) {
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: function () {
              el.classList.add("is-revealed");
            }
          });
        } else {
          el.classList.add("is-revealed");
        }
      });

      /* stagger群：data-reveal-stagger を持つ親要素の直下の .reveal を連続出現させる */
      document.querySelectorAll("[data-reveal-stagger]").forEach(function (parent) {
        var children = parent.querySelectorAll(".reveal");
        if (!children.length) return;
        if (hasScrollTrigger) {
          ScrollTrigger.create({
            trigger: parent,
            start: "top 85%",
            once: true,
            onEnter: function () {
              children.forEach(function (child, i) {
                window.setTimeout(function () {
                  child.classList.add("is-revealed");
                }, reduceMotion ? 0 : i * 120);
              });
            }
          });
        }
      });
    }

    /* ---------------- ヒーロー見出し：行ごとフェードイン（即時実行） ---------------- */
    var heroLines = gsap.utils.toArray(".hero-line");
    if (heroLines.length) {
      gsap.to(heroLines, {
        opacity: 1,
        y: 0,
        duration: reduceMotion ? 0.001 : 0.9,
        ease: "power3.out",
        stagger: reduceMotion ? 0 : 0.14,
        delay: 0.2
      });
    }

    /* ---------------- 装飾線ドローイン ---------------- */
    var drawLines = gsap.utils.toArray(".draw-line");
    if (drawLines.length && hasScrollTrigger) {
      drawLines.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: function () {
            el.classList.add("is-drawn");
          }
        });
      });
    }

    /* ---------------- 数値カウントアップ ---------------- */
    var counters = gsap.utils.toArray("[data-count-to]");
    if (counters.length) {
      counters.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-count-to"));
        if (isNaN(target)) return;
        var decimals = el.getAttribute("data-count-decimals") ? parseInt(el.getAttribute("data-count-decimals"), 10) : 0;

        var run = function () {
          var obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: reduceMotion ? 0.001 : 1.6,
            ease: "power1.out",
            onUpdate: function () {
              var v = decimals ? obj.val.toFixed(decimals) : Math.floor(obj.val);
              el.textContent = Number(v).toLocaleString("ja-JP", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
              });
            }
          });
        };

        if (hasScrollTrigger) {
          ScrollTrigger.create({
            trigger: el,
            start: "top 90%",
            once: true,
            onEnter: run
          });
        } else {
          run();
        }
      });
    }

    /* ---------------- ScrollTrigger 初期化タイミング（フォント確定後） ---------------- */
    if (hasScrollTrigger && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        document.documentElement.classList.add("fonts-loaded");
        ScrollTrigger.refresh();
      });
    }
  });
})();
