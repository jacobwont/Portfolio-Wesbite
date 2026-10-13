(function () {
  "use strict";

  var gate = document.querySelector("[data-gate]");
  var target = document.querySelector("[data-gate-content]");
  if (!gate || !target) return;

  var KEY = "gate:" + location.pathname;
  var parts = gate.getAttribute("data-payload").split(".");
  var iterations = parseInt(gate.getAttribute("data-iter"), 10);
  var form = gate.querySelector("form");
  var input = gate.querySelector("input");
  var button = gate.querySelector("button");
  var error = gate.querySelector(".gate__error");

  function fromB64(str) {
    return Uint8Array.from(atob(str), function (c) {
      return c.charCodeAt(0);
    });
  }

  function decrypt(password) {
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: fromB64(parts[0]), iterations: iterations, hash: "SHA-256" },
          base,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );
      })
      .then(function (key) {
        return crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(parts[1]) }, key, fromB64(parts[2]));
      })
      .then(function (buf) {
        return new TextDecoder().decode(buf);
      });
  }

  function unlock(html) {
    target.innerHTML = html;
    target.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    window.removeEventListener("scroll", onScroll);
    gate.classList.remove("is-visible");
    document.documentElement.classList.remove("is-gated");
  }

  function onScroll() {
    var rect = gate.getBoundingClientRect();
    var centre = rect.top + rect.height / 2;
    gate.classList.toggle("is-visible", centre < window.innerHeight * 0.85);
  }

  document.documentElement.classList.add("is-gated");
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var saved = null;
  try {
    saved = sessionStorage.getItem(KEY);
  } catch (e) {}
  if (saved) {
    decrypt(saved).then(unlock, function () {});
  }

  input.addEventListener("input", function () {
    button.disabled = !input.value;
    gate.classList.remove("has-error");
    error.textContent = "";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!input.value) return;
    button.disabled = true;
    decrypt(input.value).then(
      function (html) {
        try {
          sessionStorage.setItem(KEY, input.value);
        } catch (e) {}
        unlock(html);
      },
      function () {
        button.disabled = false;
        gate.classList.add("has-error");
        error.textContent = "Incorrect password";
        input.select();
      }
    );
  });
})();
