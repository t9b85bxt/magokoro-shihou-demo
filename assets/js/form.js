/* ==========================================================================
   form.js — contact.html バリデーション＋ダミー送信
   構成案 §7-12 フォームアクセシビリティ仕様準拠
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var errorSummary = document.getElementById("error-summary");
  var errorList = document.getElementById("error-summary-list");
  var formWrap = document.getElementById("contact-form-wrap");
  var completeWrap = document.getElementById("contact-complete");

  var rules = [
    {
      id: "field-name",
      required: true,
      label: "お名前",
      validate: function (v) { return v.trim().length > 0; },
      message: "お名前をご入力ください。"
    },
    {
      id: "field-tel",
      required: true,
      label: "電話番号",
      validate: function (v) {
        if (!v.trim()) return false;
        return /^[0-9\-]{9,14}$/.test(v.trim());
      },
      message: "電話番号を正しい形式（例：090-1234-5678）でご入力ください。"
    },
    {
      id: "field-category",
      required: true,
      label: "ご相談内容",
      validate: function (v) { return v.trim().length > 0; },
      message: "ご相談内容を選択してください。"
    },
    {
      id: "field-email",
      required: false,
      label: "メールアドレス",
      validate: function (v) {
        if (!v.trim()) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
      },
      message: "メールアドレスの形式が正しくありません。"
    },
    {
      id: "field-consent",
      required: true,
      label: "個人情報の取り扱いについての同意",
      isCheckbox: true,
      validate: function (checked) { return checked === true; },
      message: "個人情報の取り扱いについてご同意ください。"
    }
  ];

  function getFieldEl(rule) {
    return document.getElementById(rule.id);
  }

  function getValue(rule) {
    var el = getFieldEl(rule);
    if (!el) return "";
    if (rule.isCheckbox) return el.checked;
    return el.value || "";
  }

  function setError(rule, hasError) {
    var el = getFieldEl(rule);
    if (!el) return;
    var wrapper = el.closest(".field");
    var errorEl = document.getElementById(rule.id + "-error");
    if (wrapper) wrapper.classList.toggle("has-error", hasError);
    if (errorEl) {
      var textSpan = errorEl.querySelector("span");
      var text = hasError ? rule.message : "";
      if (textSpan) {
        textSpan.textContent = text;
      } else {
        errorEl.textContent = text;
      }
    }
    if (hasError) {
      el.setAttribute("aria-invalid", "true");
    } else {
      el.removeAttribute("aria-invalid");
    }
  }

  function validateAll() {
    var errors = [];
    rules.forEach(function (rule) {
      var value = getValue(rule);
      var valid = rule.validate(value);
      setError(rule, !valid);
      if (!valid) {
        errors.push(rule);
      }
    });
    return errors;
  }

  function showErrorSummary(errors) {
    if (!errorSummary || !errorList) return;
    errorList.innerHTML = "";
    errors.forEach(function (rule) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + rule.id;
      a.textContent = rule.label + "：" + rule.message;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var el = getFieldEl(rule);
        if (el) {
          el.focus();
        }
      });
      li.appendChild(a);
      errorList.appendChild(li);
    });
    var heading = document.getElementById("error-summary-heading");
    if (heading) {
      heading.textContent = "未入力・不備の項目が" + errors.length + "件あります";
    }
    errorSummary.classList.add("is-visible");
    errorSummary.setAttribute("tabindex", "-1");
    errorSummary.focus();
  }

  function hideErrorSummary() {
    if (!errorSummary) return;
    errorSummary.classList.remove("is-visible");
  }

  function showComplete() {
    if (!formWrap || !completeWrap) return;

    var finish = function () {
      formWrap.style.display = "none";
      completeWrap.style.display = "block";
      completeWrap.classList.add("is-visible");
      var heading = completeWrap.querySelector("h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    };

    if (window.gsap && document.documentElement.classList.contains("js-anim-ready")) {
      gsap.to(formWrap, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: function () {
          finish();
          gsap.fromTo(completeWrap, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
        }
      });
    } else {
      finish();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errors = validateAll();
    if (errors.length) {
      showErrorSummary(errors);
    } else {
      hideErrorSummary();
      /* ダミー送信：実際の送信処理は行わない */
      showComplete();
    }
  });

  /* 入力・変更時にその場でエラー解除（再入力時のフラストレーション軽減） */
  rules.forEach(function (rule) {
    var el = getFieldEl(rule);
    if (!el) return;
    var evt = rule.isCheckbox || el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, function () {
      var value = getValue(rule);
      var valid = rule.validate(value);
      if (valid) setError(rule, false);
    });
  });
})();
