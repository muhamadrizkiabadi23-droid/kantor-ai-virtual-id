/* login.js — masuk & daftar prototype Kantor AI Virtual ID */
(function () {
  "use strict";

  var title = document.getElementById("login-title");
  var subtitle = document.getElementById("login-sub");
  var switchButton = document.getElementById("switch-button");
  var switchText = document.getElementById("switch-text");
  var form = document.getElementById("login-form");
  var inviteField = document.getElementById("invite-field");
  var submitButton = document.getElementById("login-submit");
  var submitLabel = submitButton.querySelector(".submit-label");
  var submitSpinner = submitButton.querySelector(".submit-spinner");
  var errorBox = document.getElementById("login-error");
  var nameInput = document.getElementById("login-name");
  var passwordInput = document.getElementById("login-password");
  var inviteInput = document.getElementById("register-invite");
  var forgotButton = document.getElementById("forgot-button");
  var card = document.getElementById("loginCard");

  var mode = "login";

  function applyMode() {
    var isRegister = mode === "register";
    title.textContent = isRegister ? "Daftar Akun" : "Selamat Datang";
    subtitle.textContent = isRegister
      ? "Buat akun untuk mulai memakai tim AI"
      : "Masuk untuk mengelola tim AI Anda";
    inviteField.hidden = !isRegister;
    submitLabel.textContent = isRegister ? "Buat Akun" : "Masuk";
    submitButton.classList.toggle("is-register", isRegister);
    switchText.textContent = isRegister ? "Sudah punya akun?" : "Belum punya akun?";
    switchButton.textContent = isRegister ? "Masuk" : "Daftar";
    forgotButton.style.display = isRegister ? "none" : "";
    hideError();
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    errorBox.classList.remove("is-visible");
    // picu ulang animasi
    void errorBox.offsetWidth;
    errorBox.classList.add("is-visible");
    card.classList.remove("is-shake");
    void card.offsetWidth;
    card.classList.add("is-shake");
  }

  function hideError() {
    errorBox.textContent = "";
    errorBox.hidden = true;
    errorBox.classList.remove("is-visible");
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitSpinner.hidden = !isLoading;
    submitLabel.textContent = isLoading
      ? (mode === "register" ? "Membuat akun..." : "Memeriksa...")
      : (mode === "register" ? "Buat Akun" : "Masuk");
  }

  async function postJson(pathname, payload) {
    var response = await fetch(pathname, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    var data = {};
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }
    return { ok: response.ok, status: response.status, data: data };
  }

  switchButton.addEventListener("click", function () {
    mode = mode === "login" ? "register" : "login";
    applyMode();
  });

  forgotButton.addEventListener("click", function () {
    showError("Fase prototype: minta sandi baru ke pemilik via WhatsApp.");
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideError();

    var name = nameInput.value.trim();
    var password = passwordInput.value;
    if (name.length < 3) {
      showError("Nama minimal 3 huruf.");
      return;
    }
    if (password.length < 6) {
      showError("Sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        var result = await postJson("./api/auth/register", {
          name: name,
          password: password,
          inviteCode: inviteInput.value.trim()
        });
        if (!result.ok) {
          showError(result.data.error || "Pendaftaran gagal.");
          setLoading(false);
          return;
        }
        var loginResult = await postJson("./api/auth/login", { name: name, password: password });
        if (!loginResult.ok) {
          showError("Akun dibuat, tapi gagal masuk otomatis. Klik Masuk.");
          setLoading(false);
          mode = "login";
          applyMode();
          return;
        }
      } else {
        var loginOnly = await postJson("./api/auth/login", { name: name, password: password });
        if (!loginOnly.ok) {
          showError(loginOnly.data.error || "Gagal masuk.");
          setLoading(false);
          return;
        }
      }

      try {
        window.localStorage.setItem("kantor.user", JSON.stringify({ name: name }));
      } catch (e) { /* abaikan */ }
      window.location.href = "./app";
    } catch (error) {
      showError("Tidak bisa terhubung ke server. Cek internet Anda.");
      setLoading(false);
    }
  });

  // Sudah masuk? Langsung ke dashboard.
  fetch("./api/auth/me", { credentials: "same-origin" })
    .then(function (response) {
      if (response.ok) window.location.href = "./app";
    })
    .catch(function () { /* biarkan di halaman login */ });

  // Animasi tilt kartu mengikuti kursor (ringan, GPU only)
  if (card && window.matchMedia("(pointer: fine)").matches) {
    var stage = document.querySelector(".login-stage");
    stage.addEventListener("mousemove", function (event) {
      var rect = card.getBoundingClientRect();
      var dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      var dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      card.style.transform =
        "perspective(1200px) rotateY(" + (dx * 5).toFixed(2) + "deg) rotateX(" + (-dy * 5).toFixed(2) + "deg)";
    });
    stage.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  }

  applyMode();
})();
