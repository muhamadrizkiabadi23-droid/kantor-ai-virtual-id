/* login.js — daftar & masuk prototype Kantor AI Virtual ID */
(function () {
  "use strict";

  const title = document.getElementById("login-title");
  const subtitle = document.getElementById("login-sub");
  const switchButton = document.getElementById("switch-button");
  const switchText = document.getElementById("switch-text");
  const form = document.getElementById("login-form");
  const inviteField = document.getElementById("invite-field");
  const submitButton = document.getElementById("login-submit");
  const errorBox = document.getElementById("login-error");
  const nameInput = document.getElementById("login-name");
  const passwordInput = document.getElementById("login-password");
  const inviteInput = document.getElementById("register-invite");
  const forgotButton = document.getElementById("forgot-button");

  let mode = "login";

  function applyMode() {
    const isRegister = mode === "register";
    title.textContent = isRegister ? "Sign Up" : "Welcome";
    subtitle.textContent = isRegister
      ? "Create an account to get started"
      : "Sign in to get started";
    inviteField.hidden = !isRegister;
    submitButton.textContent = isRegister ? "Create Account" : "Sign In";
    submitButton.classList.toggle("is-register", isRegister);
    switchText.textContent = isRegister ? "Sudah punya akun?" : "Belum punya akun?";
    switchButton.textContent = isRegister ? "Sign In" : "Sign Up";
    forgotButton.style.display = isRegister ? "none" : "";
    hideError();
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  async function postJson(pathname, payload) {
    const response = await fetch(pathname, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    return { ok: response.ok, status: response.status, data };
  }

  switchButton.addEventListener("click", () => {
    mode = mode === "login" ? "register" : "login";
    applyMode();
  });

  forgotButton.addEventListener("click", () => {
    showError("Fase prototype: minta sandi baru ke pemilik via WhatsApp.");
  });

  document.querySelectorAll(".social-button").forEach((button) => {
    button.addEventListener("click", () => {
      const social = button.getAttribute("data-social");
      showError(`Masuk lewat ${social} tersedia setelah integrasi. Daftar pakai nama + sandi dulu.`);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const name = nameInput.value.trim();
    const password = passwordInput.value;
    if (name.length < 3) {
      showError("Nama minimal 3 huruf.");
      return;
    }
    if (password.length < 6) {
      showError("Sandi minimal 6 karakter.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = mode === "register" ? "Membuat akun..." : "Memeriksa...";

    try {
      if (mode === "register") {
        const result = await postJson("/api/auth/register", {
          name,
          password,
          inviteCode: inviteInput.value.trim()
        });
        if (!result.ok) {
          showError(result.data.error || "Pendaftaran gagal.");
          submitButton.disabled = false;
          applyMode();
          return;
        }
        const loginResult = await postJson("/api/auth/login", { name, password });
        if (!loginResult.ok) {
          showError("Akun dibuat, tapi gagal masuk otomatis. Klik Sign In.");
          submitButton.disabled = false;
          mode = "login";
          applyMode();
          return;
        }
      } else {
        const result = await postJson("/api/auth/login", { name, password });
        if (!result.ok) {
          showError(result.data.error || "Gagal masuk.");
          submitButton.disabled = false;
          applyMode();
          return;
        }
      }

      window.localStorage.setItem("kantor.user", JSON.stringify({ name }));
      window.location.href = "/app";
    } catch (error) {
      showError("Tidak bisa terhubung ke server. Cek internet Anda.");
      submitButton.disabled = false;
      applyMode();
    }
  });

  // Sudah masuk? Langsung ke dashboard.
  fetch("/api/auth/me", { credentials: "same-origin" })
    .then((response) => {
      if (response.ok) window.location.href = "/app";
    })
    .catch(() => { /* biarkan di halaman login */ });

  applyMode();
})();
