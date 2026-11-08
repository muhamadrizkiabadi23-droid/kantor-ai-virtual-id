/**
 * officeSupport.js — "Hermes Teknisi": session cyber-monitor + bug reporter.
 *
 * This is a page/session monitor, not an antivirus. It watches the 3D client
 * for JavaScript errors, failed resource loads, WebGL context loss, FPS drops
 * and unexpected script sources, then packages a diagnosis the user can send
 * to Hermes. If the page runs inside a Hermes widget surface, `window.hermes.send`
 * is used to hand the prompt straight to the agent; otherwise the report is
 * copied to the clipboard so it can be pasted into the Hermes chat.
 */

const SCRIPT_ALLOWLIST = [
  "/src/office3d.js",
  "/src/officeWorld.js",
  "/src/officeAgents.js",
  "/src/officeSupport.js",
  "/src/workflow.js",
  "/src/app.js",
  "/node_modules/three/build/three.module.js",
  "/node_modules/three/build/three.core.js",
  "/node_modules/three/examples/jsm/controls/OrbitControls.js",
  "/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js"
];

export function installErrorCapture(store) {
  window.addEventListener("error", (event) => {
    store.push({
      kind: "error",
      message: event.message || "Script error",
      source: event.filename ? `${event.filename.split("/").pop()}:${event.lineno}` : "unknown",
      at: new Date().toISOString()
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    store.push({
      kind: "rejection",
      message: event.reason?.message || String(event.reason || "Unhandled promise rejection"),
      source: "promise",
      at: new Date().toISOString()
    });
  });
  const originalError = console.error;
  console.error = function (...args) {
    store.push({
      kind: "console",
      message: args.map((arg) => (arg instanceof Error ? arg.message : String(arg))).join(" ").slice(0, 300),
      source: "console",
      at: new Date().toISOString()
    });
    originalError.apply(console, args);
  };
}

export function createSupportPanel(getDiagnostics) {
  const errors = [];
  const failedResources = [];
  let contextLost = 0;
  let lastScan = null;

  installErrorCapture(errors);
  window.HERMES_ERRORS = errors;
  window.HERMES_SKILLS = window.HERMES_SKILLS || [
    "hermes-agent", "threejs-data-driven-scene", "requesting-code-review",
    "systematic-debugging", "test-driven-development", "github", "dogfood",
    "grounded-citations", "humanizer", "archify"
  ];
  window.HERMES_PLUGINS = window.HERMES_PLUGINS || [
    "hermes-security-audit", "hermes-tripo", "hermes-genui", "meshy",
    "elevenlabs-music", "digital-marketing-pro", "adaptlypost", "agent-batch"
  ];

  document.addEventListener("securitypolicyviolation", (event) => {
    failedResources.push({ url: event.blockedURI || event.sourceFile, reason: "CSP blocked", at: new Date().toISOString() });
  });

  const fab = document.createElement("button");
  fab.className = "hermes-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Buka Hermes Teknisi — monitor bug dan keamanan sesi");
  fab.innerHTML = '<span class="hermes-fab-shield">🛡️</span><span class="hermes-fab-dot" id="hermes-fab-dot" hidden></span>';
  document.body.appendChild(fab);

  const panel = document.createElement("div");
  panel.className = "hermes-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Hermes Teknisi — monitor bug dan keamanan sesi");
  panel.innerHTML = `
    <div class="hermes-head">
      <div class="hermes-id">
        <span class="hermes-avatar">H</span>
        <div><strong>Hermes Teknisi</strong><small>Cyber monitor · tim teknisi</small></div>
      </div>
      <button class="hermes-close" type="button" aria-label="Tutup panel">×</button>
    </div>
    <div class="hermes-tabs" role="tablist">
      <button class="hermes-tab active" data-tab="status" type="button" role="tab">Status</button>
      <button class="hermes-tab" data-tab="report" type="button" role="tab">Laporkan bug</button>
      <button class="hermes-tab" data-tab="chat" type="button" role="tab">Live chat</button>
    </div>
    <div class="hermes-pane active" data-pane="status" role="tabpanel">
      <div class="hermes-scan-head">
        <strong>Pemindaian integritas sesi</strong>
        <button class="hermes-small-btn" id="hermes-scan" type="button">🔍 Pindai ulang</button>
      </div>
      <div class="hermes-scan-list" id="hermes-scan-list"></div>
      <div class="hermes-metrics" id="hermes-metrics"></div>
      <p class="hermes-note">Pemindaian ini memantau halaman ini saja (error, sumber daya gagal, hilangnya konteks WebGL, skrip tak dikenal). Ini bukan antivirus untuk seluruh PC — untuk itu gunakan antivirus sistem.</p>
    </div>
    <div class="hermes-pane" data-pane="report" role="tabpanel" hidden>
      <label class="hermes-field"><span>Apa yang tidak berfungsi?</span>
        <textarea id="hermes-report-text" rows="4" placeholder="Contoh: bubble agen tidak muncul saat tugas dibuat, atau kamera tidak bisa diputar"></textarea>
      </label>
      <div class="hermes-diag" id="hermes-diag"></div>
      <div class="hermes-actions">
        <button class="hermes-primary" id="hermes-send" type="button">Kirim ke Hermes</button>
        <button class="hermes-secondary" id="hermes-copy" type="button">Salin laporan</button>
      </div>
      <p class="hermes-note">Laporan berisi deskripsi, langkah reproduksi, dan diagnostik otomatis. Hermes merespons di jendela chat Hermes.</p>
    </div>
    <div class="hermes-pane" data-pane="chat" role="tabpanel" hidden>
      <div class="hermes-chat-log" id="hermes-chat-log"></div>
      <div class="hermes-chat-quick">
        <button type="button" data-hermes="Periksa error dan bug di kantor ini, laporkan apa yang perlu diperbaiki">Periksa bug</button>
        <button type="button" data-hermes="Audit keamanan kantor ini (virus, kerentanan, file mencurigakan)">Audit keamanan</button>
        <button type="button" data-hermes="Perbaiki UI yang menutupi NPC atau menghalangi klik">Perbaiki UI</button>
        <button type="button" data-hermes="Sebutkan skill dan plugin yang tersedia untuk membantu">Skill &amp; plugin</button>
      </div>
      <div class="hermes-chat-row">
        <input id="hermes-chat-input" type="text" placeholder="Tulis pesan untuk Hermes…" aria-label="Pesan untuk Hermes">
        <button class="hermes-primary" id="hermes-chat-send" type="button">Kirim</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  const tabs = [...panel.querySelectorAll(".hermes-tab")];
  const panes = [...panel.querySelectorAll(".hermes-pane")];
  const fabDot = fab.querySelector("#hermes-fab-dot");
  const chatLog = panel.querySelector("#hermes-chat-log");
  const chatInput = panel.querySelector("#hermes-chat-input");
  const reportText = panel.querySelector("#hermes-report-text");
  const diagBox = panel.querySelector("#hermes-diag");
  const scanList = panel.querySelector("#hermes-scan-list");
  const metricsBox = panel.querySelector("#hermes-metrics");

  function toggle(force) {
    const show = force !== undefined ? force : panel.hidden;
    panel.hidden = !show;
    if (show) {
      renderScan();
      renderMetrics();
      fabDot.hidden = true;
    }
  }

  fab.addEventListener("click", () => toggle());
  panel.querySelector(".hermes-close").addEventListener("click", () => toggle(false));
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    panes.forEach((pane) => {
      const active = pane.dataset.pane === tab.dataset.tab;
      pane.classList.toggle("active", active);
      pane.hidden = !active;
    });
  }));

  function scriptSources() {
    return [...document.querySelectorAll("script[src]")]
      .map((script) => script.getAttribute("src") || "")
      .filter(Boolean);
  }

  function runScan() {
    const checks = [];
    const diagnostics = getDiagnostics ? getDiagnostics() : {};

    checks.push({
      name: "Dukungan WebGL",
      ok: !!diagnostics.webgl,
      detail: diagnostics.webgl ? `${diagnostics.webgl.vendor} · ${diagnostics.webgl.renderer}` : "WebGL tidak tersedia di browser ini"
    });

    const unknownScripts = scriptSources().filter((src) => !SCRIPT_ALLOWLIST.some((allowed) => src.startsWith(allowed) || src === allowed));
    checks.push({
      name: "Skrip eksternal tak dikenal",
      ok: unknownScripts.length === 0,
      detail: unknownScripts.length ? `Ditemukan: ${unknownScripts.join(", ")}` : `${scriptSources().length} skrip terdaftar, semua dari sumber proyek`
    });

    const mixed = scriptSources().filter((src) => src.startsWith("http:") && location.protocol === "https:");
    checks.push({
      name: "Konten campuran (mixed content)",
      ok: mixed.length === 0,
      detail: mixed.length ? `Berbahaya: ${mixed.join(", ")}` : "Tidak ada sumber HTTP di halaman HTTPS"
    });

    const failed = failedResources.length;
    checks.push({
      name: "Sumber daya gagal dimuat",
      ok: failed === 0,
      detail: failed ? `${failed} kegagalan (lihat tab Status)` : "Semua sumber daya termuat"
    });

    checks.push({
      name: "Konteks WebGL hilang",
      ok: contextLost === 0,
      detail: contextLost ? `${contextLost} kali sejak halaman dibuka` : "Tidak ada kehilangan konteks"
    });

    checks.push({
      name: "Error JavaScript",
      ok: errors.length === 0,
      detail: errors.length ? `${errors.length} error tercatat sejak halaman dibuka` : "Tidak ada error tertangkap"
    });

    const storageKeys = Object.keys(localStorage).filter((key) => key.startsWith("kantor-ai"));
    checks.push({
      name: "Integritas data lokal",
      ok: storageKeys.length <= 3,
      detail: storageKeys.length ? `Kunci kantor-ai: ${storageKeys.join(", ")}` : "Tidak ada data kantor tersimpan"
    });

    lastScan = { checks, at: new Date().toISOString() };
    renderScan();
    renderMetrics();
    return lastScan;
  }

  function renderScan() {
    if (!lastScan) {
      runScan();
      return;
    }
    scanList.innerHTML = lastScan.checks.map((check) => `
      <div class="hermes-check ${check.ok ? "ok" : "bad"}">
        <span class="hermes-check-icon">${check.ok ? "✓" : "!"}</span>
        <div><strong>${escapeHtml(check.name)}</strong><small>${escapeHtml(check.detail)}</small></div>
      </div>
    `).join("");
  }

  function renderMetrics() {
    const diagnostics = getDiagnostics ? getDiagnostics() : {};
    const rows = [
      ["FPS", diagnostics.fps ? diagnostics.fps.toFixed(0) : "—"],
      ["Error", String(errors.length)],
      ["Sumber daya gagal", String(failedResources.length)],
      ["Agen aktif", String(diagnostics.agents ?? 0)],
      ["Lantai", String(diagnostics.floor ?? 1)],
      ["Mode", diagnostics.night ? "Malam" : "Siang"]
    ];
    metricsBox.innerHTML = rows.map(([label, value]) => `<div class="hermes-metric"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  }

  function buildReport(text) {
    const diagnostics = getDiagnostics ? getDiagnostics() : {};
    const scan = lastScan;
    const lines = [
      "LAPORAN BUG — Kantor AI Merah Putih (kantor 3D)",
      "",
      `Deskripsi: ${text || "(tidak diisi)"}`,
      `Waktu: ${new Date().toLocaleString("id-ID")}`,
      `URL: ${location.href}`,
      `User agent: ${navigator.userAgent}`,
      "",
      "DIAGNOSTIK OTOMATIS:",
      `- WebGL: ${diagnostics.webgl ? `${diagnostics.webgl.vendor} / ${diagnostics.webgl.renderer}` : "tidak tersedia"}`,
      `- FPS: ${diagnostics.fps ? diagnostics.fps.toFixed(1) : "?"}`,
      `- Error JavaScript: ${errors.length}`,
      `- Sumber daya gagal: ${failedResources.length}`,
      `- Konteks WebGL hilang: ${contextLost}`,
      `- Agen aktif: ${diagnostics.agents ?? "?"}`,
      `- Lantai: ${diagnostics.floor ?? "?"}`,
      `- Mode: ${diagnostics.night ? "malam" : "siang"}`,
      `- Status tugas: ${JSON.stringify(diagnostics.taskSummary ?? {})}`,
      ""
    ];
    if (scan) {
      lines.push("HASIL PEMINDAIAN:");
      for (const check of scan.checks) lines.push(`- [${check.ok ? "OK" : "MASALAH"}] ${check.name}: ${check.detail}`);
      lines.push("");
    }
    if (errors.length) {
      lines.push("ERROR TERAKHIR:");
      for (const error of errors.slice(-8)) lines.push(`- (${error.kind}) ${error.message} @ ${error.source}`);
      lines.push("");
    }
    if (failedResources.length) {
      lines.push("SUMBER DAYA GAGAL:");
      for (const resource of failedResources.slice(-8)) lines.push(`- ${resource.url} (${resource.reason})`);
      lines.push("");
    }
    lines.push("Mohon periksa penyebabnya, lalu usulkan atau terapkan perbaikan pada kantor 3D (src/office3d.js, src/officeWorld.js, src/officeAgents.js).");
    return lines.join("\n");
  }

  function send(text) {
    const report = buildReport(text);
    if (window.hermes && typeof window.hermes.send === "function") {
      window.hermes.send(report);
      appendChat("user", text || "(laporan otomatis)");
      appendChat("hermes", "Laporan terkirim ke Hermes. Tim teknisi akan merespons di jendela chat Hermes.");
      return "sent";
    }
    // Live chat AI sungguhan lewat server lokal (Hermes Agent CLI)
    appendChat("user", text);
    appendChat("hermes", "⏳ Hermes menganalisis…");
    const loading = chatLog.lastElementChild;
    fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent: "Hermes Teknisi",
        prompt: `Kamu Hermes Teknisi, penjaga kantor virtual ini. Tugasmu: memperbaiki UI, bug, error, dan ancaman keamanan (virus/malware). Permintaan bos: "${text}". Beri jawaban singkat, konkret, dan sebutkan langkah perbaikan yang bisa dilakukan.`,
        command: "technician"
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (loading) loading.remove();
        appendChat("hermes", data.reply || "Hermes tidak merespons.");
      })
      .catch((error) => {
        if (loading) loading.remove();
        appendChat("hermes", `Gagal menghubungi AI: ${error.message}. Coba lagi.`);
      });
    return "ai";
  }

  function appendChat(who, message) {
    const entry = document.createElement("div");
    entry.className = `hermes-msg ${who}`;
    entry.innerHTML = `<span class="hermes-msg-who">${who === "hermes" ? "Hermes" : "Anda"}</span><span class="hermes-msg-text"></span>`;
    entry.querySelector(".hermes-msg-text").textContent = message;
    chatLog.appendChild(entry);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  panel.querySelector("#hermes-scan").addEventListener("click", runScan);
  panel.querySelector("#hermes-send").addEventListener("click", () => {
    send(reportText.value.trim());
    reportText.value = "";
  });
  panel.querySelector("#hermes-copy").addEventListener("click", () => {
    navigator.clipboard?.writeText(buildReport(reportText.value.trim()));
    appendChat("hermes", "Laporan tersalin ke clipboard.");
  });
  panel.querySelector("#hermes-chat-send").addEventListener("click", () => {
    const text = chatInput.value.trim();
    if (!text) return;
    send(text);
    chatInput.value = "";
  });
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      panel.querySelector("#hermes-chat-send").click();
    }
  });
  panel.querySelectorAll("[data-hermes]").forEach((button) => {
    button.addEventListener("click", () => {
      send(button.dataset.hermes);
      chatInput.value = "";
    });
  });

  // surface errors on the floating button
  const originalPush = errors.push.bind(errors);
  errors.push = (...items) => {
    const result = originalPush(...items);
    fabDot.hidden = false;
    return result;
  };

  document.addEventListener("webglcontextlost", () => {
    contextLost += 1;
    fabDot.hidden = false;
  });

  appendChat("hermes", "Halo, saya tim teknisi Hermes. Panel ini memantau bug dan kesehatan halaman kantor 3D. Jika ada yang tidak berfungsi, buka tab Laporkan bug atau tulis di sini.");

  return {
    el: panel,
    fab,
    show: () => toggle(true),
    hide: () => toggle(false),
    runScan,
    buildReport,
    send,
    appendChat,
    get errors() { return errors; },
    get failedResources() { return failedResources; },
    markContextLost: () => { contextLost += 1; fabDot.hidden = false; }
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}
