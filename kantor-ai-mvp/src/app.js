(function () {
  "use strict";

  const STORAGE_KEY = "kantor-ai-mvp.tasks.v1";
  const workflow = window.KantorWorkflow;
  const taskList = document.getElementById("task-list");
  const taskDialog = document.getElementById("task-dialog");
  const detailDialog = document.getElementById("detail-dialog");
  const setupDialog = document.getElementById("setup-dialog");
  let tasks = loadTasks();
  let activeFilter = "all";
  let selectedTaskId = null;
  let selectedOfficeArea = "studio";

  // --- Office director state (the local stand-in for the backend) ---
  const DIVISI = [
    { id: "pimpinan", label: "Pimpinan", head: "Naga Hitam", color: 0x8a2f3a },
    { id: "kreatif", label: "Kreatif & Desain", head: "Nadia", color: 0xb06a8a },
    { id: "video", label: "Video & Editing", head: "Dimas", color: 0x5a7fa8 },
    { id: "marketing", label: "Pemasaran Digital", head: "Bima", color: 0x4a8a6a },
    { id: "konten", label: "Konten & Copywriting", head: "Dewi", color: 0xd58e49 },
    { id: "sosmed", label: "Sosmed & Komunitas", head: "Gilang", color: 0x6a8ac8 },
    { id: "data", label: "Data & Riset", head: "Yoga", color: 0x7a6aa8 },
    { id: "keuangan", label: "Keuangan & Legal", head: "Bayu", color: 0x4a8a8a },
    { id: "klien", label: "Klien & CRM", head: "Sari", color: 0x567da7 }
  ];

  const AGENT_ROSTER = [
    // Pimpinan
    { id: "naga", name: "Naga Hitam", role: "CEO", divisi: "pimpinan", initials: "NH", color: 0x8a2f3a, area: "meeting", core: true },
    { id: "arif", name: "Arif", role: "Direktur AI", divisi: "pimpinan", initials: "AR", color: 0x56876a, area: "review", core: true },
    { id: "raka", name: "Raka", role: "Direktur Strategi & Brand", divisi: "pimpinan", initials: "RA", color: 0xc84445, area: "strategy", core: true },
    { id: "kirana", name: "Kirana", role: "Kepala Staf", divisi: "pimpinan", initials: "KI", color: 0xa85a7a, area: "meeting", core: true },
    // Kreatif & Desain
    { id: "nadia", name: "Nadia", role: "Kepala Divisi Kreatif", divisi: "kreatif", initials: "NA", color: 0xb06a8a, area: "studio", core: true },
    { id: "andini", name: "Andini", role: "Desainer Grafis", divisi: "kreatif", initials: "AN", color: 0xc07a9a, area: "studio" },
    { id: "rani", name: "Rani", role: "Desainer Grafis", divisi: "kreatif", initials: "RN", color: 0xc88aa8, area: "studio" },
    { id: "fajar", name: "Fajar", role: "Fotografer Produk", divisi: "kreatif", initials: "FA", color: 0xd09ab8, area: "studio" },
    { id: "putri", name: "Putri", role: "Ilustrator", divisi: "kreatif", initials: "PU", color: 0xd8aac8, area: "studio" },
    { id: "sinta", name: "Sinta", role: "Ilustrator", divisi: "kreatif", initials: "SI", color: 0xe0bbd8, area: "studio" },
    // Video & Editing
    { id: "dimas", name: "Dimas", role: "Kepala Divisi Video", divisi: "video", initials: "DI", color: 0x5a7fa8, area: "studio", core: true },
    { id: "rizky", name: "Rizky", role: "Video Editor", divisi: "video", initials: "RI", color: 0x6a8fb8, area: "studio" },
    { id: "bimo", name: "Bimo", role: "Video Editor", divisi: "video", initials: "BI", color: 0x7a9fc8, area: "studio" },
    { id: "teguh", name: "Teguh", role: "Video Editor", divisi: "video", initials: "TE", color: 0x8aaad8, area: "studio" },
    { id: "yanti", name: "Yanti", role: "Motion Graphic", divisi: "video", initials: "YA", color: 0x9ab5e8, area: "studio" },
    { id: "wawan", name: "Wawan", role: "Colorist", divisi: "video", initials: "WA", color: 0xaac0f0, area: "studio" },
    // Pemasaran Digital
    { id: "bima", name: "Bima", role: "Kepala Divisi Pemasaran", divisi: "marketing", initials: "BM", color: 0x4a8a6a, area: "strategy", core: true },
    { id: "hendra", name: "Hendra", role: "Google Ads", divisi: "marketing", initials: "HE", color: 0x5a9a7a, area: "strategy" },
    { id: "bagas", name: "Bagas", role: "Spesialis TikTok", divisi: "marketing", initials: "BG", color: 0x6aaa8a, area: "strategy" },
    { id: "sekar", name: "Sekar", role: "Spesialis Instagram", divisi: "marketing", initials: "SE", color: 0x7aba9a, area: "strategy" },
    { id: "taufik", name: "Taufik", role: "Spesialis YouTube", divisi: "marketing", initials: "TA", color: 0x8acaAA, area: "strategy" },
    { id: "lestari", name: "Lestari", role: "Email Marketing", divisi: "marketing", initials: "LE", color: 0x9adaBA, area: "strategy" },
    // Konten & Copywriting
    { id: "dewi", name: "Dewi", role: "Kepala Divisi Konten", divisi: "konten", initials: "DE", color: 0xd58e49, area: "studio", core: true },
    { id: "ayu", name: "Ayu", role: "Copywriter", divisi: "konten", initials: "AY", color: 0xe59e59, area: "studio" },
    { id: "joko", name: "Joko", role: "Copywriter", divisi: "konten", initials: "JO", color: 0xf5ae69, area: "studio" },
    { id: "wulan", name: "Wulan", role: "SEO Content", divisi: "konten", initials: "WU", color: 0xffbf79, area: "studio" },
    { id: "tania", name: "Tania", role: "WhatsApp Broadcast", divisi: "konten", initials: "TN", color: 0xffcf89, area: "studio" },
    { id: "nia", name: "Nia", role: "Content Researcher", divisi: "konten", initials: "NI", color: 0xffdf99, area: "studio" },
    // Sosmed & Komunitas
    { id: "gilang", name: "Gilang", role: "Kepala Divisi Sosmed", divisi: "sosmed", initials: "GI", color: 0x6a8ac8, area: "client", core: true },
    { id: "dian", name: "Dian", role: "Customer Service", divisi: "sosmed", initials: "DL", color: 0x7a9ad8, area: "client" },
    { id: "agus", name: "Agus", role: "Sales", divisi: "sosmed", initials: "AG", color: 0x8aaae8, area: "client" },
    { id: "reza", name: "Reza", role: "Influencer/KOL", divisi: "sosmed", initials: "RZ", color: 0x9abaf8, area: "client" },
    { id: "nina", name: "Nina", role: "Community Manager", divisi: "sosmed", initials: "NN", color: 0xaacaf0, area: "client" },
    { id: "tono", name: "Tono", role: "Moderator", divisi: "sosmed", initials: "TO", color: 0xbadaf0, area: "client" },
    // Data & Riset
    { id: "yoga", name: "Yoga", role: "Kepala Divisi Data", divisi: "data", initials: "YO", color: 0x7a6aa8, area: "review", core: true },
    { id: "laras", name: "Laras", role: "SEO Specialist", divisi: "data", initials: "LA", color: 0x8a7ab8, area: "review" },
    { id: "roni", name: "Roni", role: "Data Analyst", divisi: "data", initials: "RO", color: 0x9a8ac8, area: "review" },
    { id: "yuda", name: "Yuda", role: "Kompetitor Analyst", divisi: "data", initials: "YU", color: 0xaa9ad8, area: "review" },
    { id: "bagus", name: "Bagus", role: "Analis Sentimen", divisi: "data", initials: "BS", color: 0xbaaae8, area: "review" },
    // Keuangan & Legal
    { id: "bayu", name: "Bayu", role: "Kepala Divisi Keuangan", divisi: "keuangan", initials: "BY", color: 0x4a8a8a, area: "review", core: true },
    { id: "maya", name: "Maya", role: "Legal/Perizinan", divisi: "keuangan", initials: "MA", color: 0x5a9a9a, area: "review" },
    { id: "rina", name: "Rina", role: "Keuangan/Pajak", divisi: "keuangan", initials: "RI", color: 0x6aaaaa, area: "review" },
    { id: "doni", name: "Doni", role: "Admin & Data Entry", divisi: "keuangan", initials: "DO", color: 0x7ababa, area: "review" },
    { id: "rian", name: "Rian", role: "Bendahara", divisi: "keuangan", initials: "RN", color: 0x8acaca, area: "review" },
    // Klien & CRM
    { id: "sari", name: "Sari", role: "Kepala Divisi Klien (HRD)", divisi: "klien", initials: "SA", color: 0x567da7, area: "client", core: true },
    { id: "dedi", name: "Dedi", role: "Customer Service", divisi: "klien", initials: "DC", color: 0x668db7, area: "client" },
    { id: "eko", name: "Eko", role: "Akuisisi Klien", divisi: "klien", initials: "EK", color: 0x769dc7, area: "client" },
    { id: "fani", name: "Fani", role: "Retensi Klien", divisi: "klien", initials: "FN", color: 0x86add7, area: "client" }
  ];
  const TEAM = AGENT_ROSTER.filter((agent) => agent.core).map((agent) => agent.id);
  const CORE_ROSTER = AGENT_ROSTER.filter((agent) => agent.core);
  loadOwners();
  const officeAreas = {
    workspace: { label: "WORKSPACE", initials: "WS", name: "Workspace 48 Meja", role: "Ruang kerja utama", description: "48 workstation rapi untuk tim. Meja, kursi, dan monitor siap dipakai kapan saja.", status: "Siap digunakan" },
    meeting: { label: "RUANG RAPAT", initials: "RK", name: "Ruang rapat", role: "Kolaborasi tim", description: "Meja oval, 10 kursi, layar proyektor, dan whiteboard untuk briefing serta presentasi.", status: "Siap digunakan" },
    masjid: { label: "MASJID & MUSALA", initials: "م", name: "Masjid", role: "Ruang ibadah", description: "Mihrab, minbar, kubah, karpet sholat, dan tempat wudu untuk ibadah tim.", status: "Siap digunakan" },
    kopi: { label: "KEDAI KOPI", initials: "☕", name: "Kedai kopi", role: "Ngopi & santai", description: "Bar counter, mesin espresso, papan menu, meja, dan bangku untuk ngopi bareng.", status: "Siap digunakan" },
    studio: { label: "STUDIO KONTEN", initials: "DE", name: "Dewi", role: "Konten & copywriting", description: "Green screen, kamera tripod, ring light, dan meja editing untuk produksi konten.", status: "Siap digunakan" },
    client: { label: "RUANG KLIEN", initials: "SA", name: "Sari", role: "Intake klien", description: "Meja presentasi, sofa, rak display, dan layar untuk menerima klien.", status: "Siap digunakan" },
    gym: { label: "GYM MINI", initials: "＋", name: "Gym mini", role: "Area olahraga", description: "Treadmill, bench press, barbel, dumbbell rack, cermin, dan matras yoga.", status: "Siap digunakan" },
    lounge: { label: "LOUNGE & TAMAN", initials: "休", name: "Lounge", role: "Ruang istirahat", description: "Sofa, TV, meja coffee, taman indoor, dan kolam kecil untuk jeda tim.", status: "Siap digunakan" },
    pantry: { label: "PANTRY & DAPUR", initials: "🍚", name: "Pantry", role: "Makan & dapur", description: "Counter dapur, kompor, kulkas, rice cooker, galon, dan meja makan.", status: "Siap digunakan" }
  };

  const setupGuides = {
    telegram: {
      title: "Telegram Bot",
      description: "Untuk menerima perintah privat dan mengirim status tugas. Pembuatan bot dan pemasangan webhook dilakukan pada tahap integrasi backend.",
      steps: [
        "Buat bot melalui BotFather pada akun Telegram milik pemilik workspace.",
        "Catat bot token di password manager atau secret store; jangan masukkan ke chat, repo, Sheet, atau browser prototype.",
        "Ambil Telegram numeric user ID operator yang diizinkan. Jangan mengandalkan username saja untuk otorisasi.",
        "Siapkan URL deployment webhook HTTPS dan proses setWebhook setelah backend Apps Script dibangun.",
        "Uji bahwa operator terdaftar dapat memakai bot dan pengguna lain ditolak."
      ],
      security: "Token bot memberi kendali atas bot. Batasi daftar operator, jangan membagikan token, dan rotasi token jika terpapar."
    },
    sheets: {
      title: "Google Sheets",
      description: "Spreadsheet dapat dipakai untuk pilot kecil hanya setelah akses, konkurensi, backup, dan restore diuji.",
      steps: [
        "Gunakan akun Google khusus proyek yang dikuasai pemilik.",
        "Buat spreadsheet proyek dan tentukan tab/data yang memang diperlukan.",
        "Berikan akses hanya kepada akun layanan yang dibutuhkan; jangan aktifkan akses publik.",
        "Simpan spreadsheet ID sebagai konfigurasi backend, bukan sebagai klaim bahwa Sheet sudah aman atau siap produksi.",
        "Atur backup terjadwal, retensi, dan buktikan pemulihan sebelum data klien digunakan."
      ],
      security: "Jangan simpan API key, token, password, data pribadi pelanggan, atau brief sensitif yang tidak diperlukan di spreadsheet."
    },
    "apps-script": {
      title: "Google Apps Script",
      description: "Apps Script adalah kandidat backend webhook pada rencana produksi. Project dan deployment belum dibuat.",
      steps: [
        "Masuk dengan akun Google khusus proyek dan buat project Apps Script.",
        "Tambahkan sumber backend dan manifest dari versi produksi setelah implementasi dimulai.",
        "Masukkan rahasia melalui Project Settings → Script Properties atau secret store yang disetujui; jangan commit file rahasia.",
        "Terapkan akses least-privilege untuk bot dan spreadsheet, lalu deploy sebagai Web App HTTPS.",
        "Verifikasi otorisasi operator, validasi input, penanganan update berulang, log aman, dan cara rollback."
      ],
      security: "Jangan membuka Web App/Sheet untuk semua orang demi mempermudah setup. URL deployment tidak boleh dianggap sebagai satu-satunya kontrol akses."
    },
    ai: {
      title: "Provider AI",
      description: "Belum ada provider produksi yang dikonfirmasi. Pilih satu provider/model yang sesuai dengan anggaran dan kebijakan data sebelum integrasi.",
      steps: [
        "Tentukan provider dan model yang akan dipakai untuk tugas caption/ide konten pilot.",
        "Periksa harga, kuota, lokasi/pemrosesan data, retensi, syarat penggunaan, dan kemampuan menghapus data.",
        "Buat API key khusus proyek dengan hak dan batas pemakaian minimum yang tersedia.",
        "Simpan key di backend secret store. Browser dan Git repository tidak boleh menerima key.",
        "Uji kualitas draf, timeout, rate limit, error provider, batas biaya, dan penghentian aman dengan data dummy."
      ],
      security: "Draf AI perlu ditinjau manusia. Jangan kirim data klien ke provider sebelum penggunaan dan pemrosesan datanya disetujui."
    }
  };

  let officeSleep = false;
  let activeTaskId = null;
  let activeStage = null;
  let notice = "";
  let directorBusy = false;
  let ambienceTimer = null;
  let pendingApprovalId = null;
  let nightShift = false;
  const SOCIAL_KEY = "kantor-ai-mvp.social.v1";
  const PLATFORMS = [
    { id: "instagram", label: "Instagram", icon: "📷", color: "#c13584" },
    { id: "tiktok", label: "TikTok", icon: "🎵", color: "#111111" },
    { id: "youtube", label: "YouTube", icon: "▶️", color: "#ff0000" },
    { id: "facebook", label: "Facebook", icon: "👤", color: "#1877f2" },
    { id: "whatsapp", label: "WhatsApp", icon: "💬", color: "#25d366" },
    { id: "twitter", label: "X / Twitter", icon: "✖️", color: "#1da1f2" },
    { id: "shopee", label: "Shopee", icon: "🛒", color: "#ee4d2d" },
    { id: "tokopedia", label: "Tokopedia", icon: "🟢", color: "#03ac0e" }
  ];
  let socialAccounts = loadSocial();
  const taskQueue = [];
  const officeAgents = new Map();
  let lastSnapshot = null;

  function loadSocial() {
    try {
      const saved = JSON.parse(localStorage.getItem(SOCIAL_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveSocial() {
    try {
      localStorage.setItem(SOCIAL_KEY, JSON.stringify(socialAccounts));
      renderSocial();
    } catch (error) {
      showToast(`Gagal menyimpan akun: ${error.message}`, true);
    }
  }

  function platformById(id) {
    return PLATFORMS.find((platform) => platform.id === id) || { id, label: id, icon: "🔗", color: "#888" };
  }

  function renderSocial() {
    const tbody = document.getElementById("social-tbody");
    const empty = document.getElementById("social-empty");
    const table = document.getElementById("social-table");
    if (!tbody) return;
    if (socialAccounts.length === 0) {
      tbody.innerHTML = "";
      if (empty) empty.hidden = false;
      if (table) table.style.display = "none";
      return;
    }
    if (empty) empty.hidden = true;
    if (table) table.style.display = "";
    tbody.innerHTML = socialAccounts.map((account) => {
      const platform = platformById(account.platform);
      const statusLabel = { active: "Aktif", pending: "Pending", inactive: "Nonaktif" }[account.status] || account.status;
      return `<tr>
        <td>${escapeHtml(account.consumer)}</td>
        <td><span class="social-platform"><span class="social-platform-icon" style="background:${platform.color}">${platform.icon}</span>${escapeHtml(platform.label)}</span></td>
        <td><strong>${escapeHtml(account.username)}</strong></td>
        <td><span class="status-badge ${account.status === "active" ? "status-approved" : account.status === "pending" ? "status-review" : "status-cancelled"}">${statusLabel}</span></td>
        <td>${escapeHtml(account.createdBy || "Operator")}</td>
        <td><button class="button button-small button-secondary" type="button" data-social-remove="${escapeHtml(account.id)}" aria-label="Hapus ${escapeHtml(account.username)}">Hapus</button></td>
      </tr>`;
    }).join("");
  }

  function addSocialAccount(consumer, platformId, username, createdBy = "Operator") {
    const trimmedConsumer = consumer.trim();
    const trimmedUsername = username.trim();
    if (!trimmedConsumer || !trimmedUsername) {
      showToast("Nama konsumen dan username wajib diisi.", true);
      return;
    }
    const exists = socialAccounts.some((account) => account.consumer === trimmedConsumer && account.platform === platformId && account.username === trimmedUsername);
    if (exists) {
      showToast("Akun ini sudah terdaftar.", true);
      return;
    }
    const account = {
      id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      consumer: trimmedConsumer,
      platform: platformId,
      username: trimmedUsername,
      status: "active",
      createdBy,
      createdAt: new Date().toISOString()
    };
    socialAccounts.push(account);
    saveSocial();
    showToast(`Akun ${trimmedUsername} (${trimmedConsumer}) ditambahkan.`);
  }

  function aiRegisterSocialAccount() {
    const aiNames = ["Raka", "Dewi", "Gilang", "Bima", "Nadia", "Sari", "Yoga", "Bayu"];
    const ai = aiNames[Math.floor(Math.random() * aiNames.length)];
    const consumers = ["Konsumen A", "Konsumen B", "Konsumen C", "Konsumen D", "Konsumen E", "Konsumen F"];
    const consumer = consumers.find((name) => !socialAccounts.some((account) => account.consumer === name)) || `Konsumen ${String.fromCharCode(65 + socialAccounts.length)}`;
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
    const username = `@${consumer.toLowerCase().replace(/\s+/g, "")}${Math.floor(Math.random() * 900 + 100)}`;
    addSocialAccount(consumer, platform.id, username, `AI ${ai}`);
    // Visual: AI berjalan ke meja lalu "mengetik"
    setAgent(ai.toLowerCase(), { status: "working", message: `Membuat akun ${platform.label}` });
    notice = `AI ${ai}: mendaftarkan akun ${platform.label} untuk ${consumer}`;
    emitOfficeState();
    window.setTimeout(() => {
      setAgent(ai.toLowerCase(), { status: "idle", message: "" });
      notice = "Tim siap";
      emitOfficeState();
    }, 6000);
  }

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved) || saved.some((task) => !task || typeof task.id !== "string" || !workflow.STATUSES.includes(task.status))) {
        throw new Error("Format data tersimpan tidak valid.");
      }
      return saved;
    } catch (error) {
      showToast(`Data lokal tidak dapat dibaca: ${error.message}`, true);
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      render();
    } catch (error) {
      showToast(`Data gagal disimpan di browser: ${error.message}`, true);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function statusLabel(status) {
    return ({ review: "Review", approved: "Disetujui", revision: "Revisi", final: "Final", cancelled: "Dibatalkan" })[status];
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
      .format(new Date(value))
      .replace(".", ":");
  }

  function showToast(message, isError = false) {
    const region = document.getElementById("toast-region");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    if (isError) {
      toast.style.borderColor = "#efcaca";
      toast.style.color = "#8b3333";
    }
    region.append(toast);
    window.setTimeout(() => toast.remove(), 3500);
  }

  function showApprovalToast(task) {
    const toast = document.getElementById("approval-toast");
    if (!toast || !task) return;
    pendingApprovalId = task.id;
    document.getElementById("approval-title").textContent = task.title || "Draf siap ditinjau";
    document.getElementById("approval-body").textContent = `${task.business || ""} · ${task.product || ""} — draf sudah melewati QC Direktur AI. Keputusan akhir ada di tanganmu.`;
    toast.hidden = false;
    toast.classList.add("is-visible");
  }

  function hideApprovalToast() {
    const toast = document.getElementById("approval-toast");
    if (toast) {
      toast.classList.remove("is-visible");
      toast.hidden = true;
    }
    pendingApprovalId = null;
  }

  // --- Office director -----------------------------------------------------

  function agentName(id) {
    const agent = AGENT_ROSTER.find((item) => item.id === id);
    return agent ? agent.name : id;
  }

  function setAgent(id, patch) {
    officeAgents.set(id, { ...(officeAgents.get(id) || {}), ...patch });
  }

  function setAllIdle(ids) {
    ids.forEach((id) => setAgent(id, { status: "idle", message: "", partnerId: null, taskId: null, taskTitle: null, decorative: false, target: null }));
  }

  // --- Kepemilikan tugas: 1 tugas = 1 PIC --------------------------------
  // Setiap tugas punya satu penanggung jawab (PIC) yang sama dari awal sampai
  // selesai. PIC dipilih sekali saat tugas dibuat, disimpan di localStorage,
  // dan tidak berubah meski tugas direvisi. Ini menjaga pekerjaan tetap
  // "satu tujuan" dan tidak berpindah-pindah agen di tengah proses.
  const PIC_POOL = [
    { id: "sari", divisi: "klien", keywords: ["klien", "cs", "layanan", "pelanggan", "reservasi", "pesan", "tamu"] },
    { id: "kirana", divisi: "pimpinan", keywords: ["operasional", "koordinasi", "proses", "jadwal", "agenda", "rapat"] },
    { id: "raka", divisi: "pimpinan", keywords: ["strategi", "brand", "merek", "posisi", "visi", "tagline"] },
    { id: "arif", divisi: "pimpinan", keywords: ["kecerdasan buatan", "chatbot", "otomatis", "sistem", "teknologi", "aplikasi", "digital"] },
    { id: "nadia", divisi: "kreatif", keywords: ["desain", "grafis", "visual", "ilustrasi", "logo", "poster", "foto", "banner"] },
    { id: "dimas", divisi: "video", keywords: ["video", "editing", "motion", "animasi", "rekaman", "sinematik"] },
    { id: "dewi", divisi: "konten", keywords: ["konten", "caption", "copy", "tulisan", "artikel", "naskah", "skrip", "teks"] },
    { id: "bima", divisi: "marketing", keywords: ["ads", "iklan", "promosi", "penjualan", "campaign", "kampanye", "bursa"] },
    { id: "gilang", divisi: "sosmed", keywords: ["sosmed", "instagram", "tiktok", "facebook", "media sosial", "komunitas", "influencer"] },
    { id: "yoga", divisi: "data", keywords: ["data", "riset", "analisis", "laporan", "sentimen", "kompetitor", "survei"] },
    { id: "bayu", divisi: "keuangan", keywords: ["keuangan", "pajak", "legal", "biaya", "anggaran", "izin", "sni"] }
  ];

  const OWNER_KEY = "kantor.owners.v1";
  const taskOwners = new Map(); // taskId -> agentId
  const ownerLoad = new Map();  // agentId -> jumlah tugas aktif

  function loadOwners() {
    try {
      const raw = JSON.parse(localStorage.getItem(OWNER_KEY) || "{}");
      for (const [taskId, ownerId] of Object.entries(raw)) {
        if (AGENT_ROSTER.some((item) => item.id === ownerId)) taskOwners.set(taskId, ownerId);
      }
    } catch { /* localStorage tidak tersedia — lewati */ }
  }

  function persistOwners() {
    try { localStorage.setItem(OWNER_KEY, JSON.stringify(Object.fromEntries(taskOwners))); } catch { /* abaikan */ }
  }

  // Cocokkan kata kunci dengan batas kata, supaya "ai" tidak salah cocok
  // dengan "santai"/"kedai" dan "kol" tidak cocok dengan "bursa"/"sekolah".
  function picKeywordHit(pic, word, task) {
    const haystack = ` ${[task.category, task.product, task.audience, task.goal, task.brandDirection].join(" ").toLowerCase()} `;
    const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack);
  }

  function ownerFor(task) {
    const existing = taskOwners.get(task.id);
    if (existing && AGENT_ROSTER.some((item) => item.id === existing)) return existing;

    // Kata kunci yang lebih panjang dianggap lebih spesifik, sehingga
    // "Konten Instagram" jatuh ke sosmed (instagram), bukan ke konten (konten).
    const scored = PIC_POOL.map((pic) => {
      let score = 0;
      let bestLen = 0;
      for (const word of pic.keywords) {
        if (picKeywordHit(pic, word, task)) {
          score += 100;
          if (word.length > bestLen) bestLen = word.length;
        }
      }
      return { pic, score: score + bestLen - (ownerLoad.get(pic.id) || 0) * 10 };
    }).sort((a, b) => b.score - a.score);

    const chosen = scored[0].pic;
    taskOwners.set(task.id, chosen.id);
    ownerLoad.set(chosen.id, (ownerLoad.get(chosen.id) || 0) + 1);
    persistOwners();
    return chosen.id;
  }

  function releaseOwner(taskId) {
    const ownerId = taskOwners.get(taskId);
    if (!ownerId) return;
    const next = (ownerLoad.get(ownerId) || 1) - 1;
    if (next <= 0) ownerLoad.delete(ownerId); else ownerLoad.set(ownerId, next);
    taskOwners.delete(taskId);
    persistOwners();
  }

  function supportFor(picId, task) {
    const pic = PIC_POOL.find((item) => item.id === picId);
    if (!pic) return [];
    const mates = AGENT_ROSTER.filter((item) => item.divisi === pic.divisi && item.id !== picId && !item.core);
    if (!mates.length) return [];
    const seed = [...String(task.id)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const start = seed % mates.length;
    const picks = [];
    for (let step = 0; step < 2 && mates.length; step += 1) picks.push(mates[(start + step) % mates.length].id);
    return picks;
  }

  function picLabel(task) {
    const ownerId = taskOwners.get(task.id);
    if (!ownerId) return "";
    const def = AGENT_ROSTER.find((item) => item.id === ownerId);
    return def ? def.name : "";
  }

  function buildMeetings(agents) {
    const map = new Map();
    for (const agent of agents) {
      if (agent.status !== "meeting") continue;
      if (!map.has(agent.taskId)) map.set(agent.taskId, []);
      map.get(agent.taskId).push(agent.id);
    }
    return [...map.entries()].map(([taskId, agentIds]) => ({ taskId, agentIds, room: "meeting" }));
  }

  function emitOfficeState(overrides = {}) {
    const agents = AGENT_ROSTER.map((roster) => {
      const state = officeAgents.get(roster.id) || {};
      return {
        ...roster,
        status: state.status || "idle",
        message: state.message || "",
        taskId: state.taskId || null,
        taskTitle: state.taskTitle || null,
        partnerId: state.partnerId || null,
        decorative: !!state.decorative,
        target: state.target || null
      };
    });
    const snapshot = {
      revision: ((lastSnapshot && lastSnapshot.revision) || 0) + 1,
      mode: "day",
      floor: 1,
      agents,
      meetings: buildMeetings(agents),
      activeTaskId,
      activeStage,
      notice,
      taskSummary: workflow.summarize(tasks),
      ...overrides
    };
    lastSnapshot = snapshot;
    document.dispatchEvent(new CustomEvent("office-state", { detail: snapshot }));

    // Indikator PIC aktif — supaya terlihat siapa yang memegang tugas.
    const picChip = document.getElementById("office-pic-chip");
    const picNameEl = document.getElementById("office-pic-name");
    if (picChip && picNameEl) {
      const activeTask = activeTaskId ? tasks.find((item) => item.id === activeTaskId) : null;
      const name = activeTask ? picLabel(activeTask) : "";
      if (name) {
        picChip.hidden = false;
        picNameEl.textContent = name;
      } else {
        picChip.hidden = true;
      }
    }
    return snapshot;
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function waitForArrival(agentId, timeout = 6000) {
    return new Promise((resolve) => {
      let settled = false;
      const handler = (event) => {
        if (event.detail.agentId !== agentId) return;
        settled = true;
        document.removeEventListener("office-agent-arrived", handler);
        resolve(true);
      };
      document.addEventListener("office-agent-arrived", handler);
      window.setTimeout(() => {
        if (!settled) {
          document.removeEventListener("office-agent-arrived", handler);
          resolve(false);
        }
      }, timeout);
    });
  }

  function waitForArrivals(ids, timeout = 5000) {
    return new Promise((resolve) => {
      const pending = new Set(ids);
      const handler = (event) => {
        pending.delete(event.detail.agentId);
        if (pending.size === 0) {
          document.removeEventListener("office-agent-arrived", handler);
          resolve(true);
        }
      };
      document.addEventListener("office-agent-arrived", handler);
      window.setTimeout(() => {
        document.removeEventListener("office-agent-arrived", handler);
        resolve(pending.size === 0);
      }, timeout);
    });
  }

  async function handoff(from, to, task, message) {
    setAllIdle(TEAM);
    setAgent(from, { status: "walking", target: { agentId: to }, taskId: task.id, taskTitle: task.title, message: `Menuju ${agentName(to)}` });
    setAgent(to, { status: "idle", taskId: task.id, taskTitle: task.title, message: "Menunggu serah terima" });
    activeStage = "handoff";
    notice = `${agentName(from)} → ${agentName(to)}`;
    emitOfficeState();
    await waitForArrival(from, 7000);
    setAgent(from, { status: "collaborating", partnerId: to, message, target: null });
    setAgent(to, { status: "collaborating", partnerId: from, message: "Mendiskusikan" });
    notice = `${agentName(from)} dan ${agentName(to)} berdiskusi`;
    emitOfficeState();
    await wait(2400);
  }

  function meetingStep(task, message, stageLabel, holdMs = 1800) {
    TEAM.forEach((id) => setAgent(id, { status: "meeting", taskId: task.id, taskTitle: task.title, message, partnerId: null, decorative: false }));
    activeStage = stageLabel;
    notice = message;
    emitOfficeState();
    return waitForArrivals(TEAM, 5000).then(() => wait(holdMs));
  }

  function workStep(agentId, task, message, stageLabel, holdMs = 2200) {
    setAllIdle(TEAM);
    setAgent(agentId, { status: "working", taskId: task.id, taskTitle: task.title, message });
    activeStage = stageLabel;
    notice = `${agentName(agentId)}: ${message}`;
    emitOfficeState();
    return wait(holdMs);
  }

  // PIC tetap bekerja, dibantu 1-2 rekan satu divisi (tidak mengambil alih).
  async function collaborateStep(picId, supportIds, task, message, holdMs = 2000) {
    setAllIdle(TEAM);
    setAgent(picId, { status: "working", taskId: task.id, taskTitle: task.title, message });
    supportIds.forEach((id) => setAgent(id, {
      status: "collaborating", partnerId: picId, taskId: task.id, taskTitle: task.title, message: `Membantu ${agentName(picId)}`
    }));
    activeStage = "collaborate";
    notice = `${agentName(picId)} + ${supportIds.length} rekan: ${message}`;
    emitOfficeState();
    await wait(holdMs);
  }

  // Alur kerja: satu PIC memegang tugas dari briefing sampai presentasi.
  async function directTask(task) {
    activeTaskId = task.id;
    stopAmbience();
    const pic = ownerFor(task);
    const support = supportFor(pic, task);
    const picName = agentName(pic);

    await meetingStep(task, `Briefing ${task.title} — PIC ${picName}`, "briefing", 1600);
    await workStep(pic, task, `${picName} menyiapkan brief kerja`, "intake");
    await workStep(pic, task, `${picName} menyusun arah kerja`, "strategy");
    if (support.length) await collaborateStep(pic, support, task, "membahas pendekatan");
    await workStep(pic, task, `${picName} menyiapkan draf`, "studio");
    await workStep(pic, task, `${picName} memeriksa dan menyempurnakan draf`, "review");
    await meetingStep(task, `Presentasi ${task.title} — ${picName}`, "presentation", 2000);

    setAllIdle(TEAM);
    activeTaskId = null;
    activeStage = null;
    notice = `${picName} menyerahkan draf contoh untuk ditinjau operator`;
    emitOfficeState();
    if (typeof renderTaskBoard === "function") renderTaskBoard();
    startAmbience();
    showApprovalToast(task);
  }

  async function directRevision(task, note) {
    activeTaskId = task.id;
    stopAmbience();
    const pic = ownerFor(task);
    const support = supportFor(pic, task);
    const picName = agentName(pic);

    await workStep(pic, task, `${picName} mengevaluasi catatan revisi`, "review", 1800);
    if (support.length) await collaborateStep(pic, support, task, "berdiskusi soal revisi");
    await workStep(pic, task, `${picName} merevisi draf`, "studio");
    await workStep(pic, task, `${picName} me-review ulang hasil revisi`, "review", 2000);
    await meetingStep(task, `Hasil revisi — ${picName}`, "presentation", 2000);

    setAllIdle(TEAM);
    activeTaskId = null;
    activeStage = null;
    notice = `${picName} menyerahkan revisi untuk ditinjau operator`;
    emitOfficeState();
    if (typeof renderTaskBoard === "function") renderTaskBoard();
    startAmbience();
  }

  async function directApproval(task) {
    activeTaskId = task.id;
    stopAmbience();
    const pic = ownerFor(task);
    await meetingStep(task, `Draf disetujui 🎉 — ${agentName(pic)}`, "approved", 2200);
    releaseOwner(task.id);
    setAllIdle(TEAM);
    activeTaskId = null;
    activeStage = null;
    notice = `Tugas disetujui — ${agentName(pic)}`;
    emitOfficeState();
    if (typeof renderTaskBoard === "function") renderTaskBoard();
    startAmbience();
  }

  async function pumpQueue() {
    if (directorBusy) return;
    directorBusy = true;
    while (taskQueue.length) {
      const item = taskQueue.shift();
      try {
        if (item.kind === "create") await directTask(item.task);
        else if (item.kind === "revision") await directRevision(item.task, item.note);
        else if (item.kind === "approve") await directApproval(item.task);
        else if (item.kind === "cancel") {
          setAllIdle(TEAM);
          activeTaskId = null;
          activeStage = null;
          notice = "Tugas dibatalkan";
          emitOfficeState();
        }
      } catch (error) {
        showToast(`Visualisasi kantor gagal: ${error.message}`, true);
      }
    }
    directorBusy = false;
  }

  function queueDirection(item) {
    taskQueue.push(item);
    pumpQueue();
  }

  function startAmbience() {
    stopAmbience();
    let index = 0;
    let tick = 0;
    ambienceTimer = window.setInterval(() => {
      if (activeTaskId || officeSleep) return;
      tick += 1;
      setAllIdle(TEAM);
      // Patroli QC Direktur AI (Arif) — cek pekerjaan tertahan
      if (tick % 2 === 0) {
        setAgent("arif", { status: "walking", target: { area: "review" }, message: "Patroli QC" });
        notice = "Arif: Patroli QC · cek pekerjaan tertahan";
        emitOfficeState();
        window.setTimeout(() => {
          if (activeTaskId || officeSleep) return;
          setAgent("arif", { status: "idle", message: "" });
          notice = "Tim siap";
          emitOfficeState();
        }, 9000);
        return;
      }
      const id = TEAM[index % TEAM.length];
      index += 1;
      setAgent(id, { status: "resting", decorative: true, message: "Rehat sejenak" });
      notice = `${agentName(id)} rehat (dekorasi)`;
      emitOfficeState();
      window.setTimeout(() => {
        if (activeTaskId || officeSleep) return;
        setAgent(id, { status: "idle", message: "", decorative: false });
        notice = "Tim siap";
        emitOfficeState();
      }, 14000);
    }, 26000);
  }

  function stopAmbience() {
    if (ambienceTimer) {
      window.clearInterval(ambienceTimer);
      ambienceTimer = null;
    }
  }

  // --- UI rendering --------------------------------------------------------

  function updateSideCard(areaId) {
    const area = officeAreas[areaId];
    if (!area) return;
    selectedOfficeArea = areaId;
    document.querySelectorAll("[data-office-area]").forEach((item) => {
      const selected = item.dataset.officeArea === areaId;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    document.getElementById("office-area-label").textContent = area.label;
    document.getElementById("office-agent-avatar").textContent = area.initials;
    document.getElementById("office-agent-avatar").className = `office-agent-avatar agent-${areaId}`;
    document.getElementById("office-agent-name").textContent = area.name;
    document.getElementById("office-agent-role").textContent = area.role;
    document.getElementById("office-agent-description").textContent = area.description;
    document.getElementById("office-agent-status").textContent = lastSnapshot && lastSnapshot.activeTaskId
      ? `${lastSnapshot.activeStage || "proses"} · ${lastSnapshot.notice || ""}`
      : area.status;
  }

  function renderDivisi() {
    const grid = document.getElementById("divisi-grid");
    if (!grid) return;
    grid.innerHTML = DIVISI.map((divisi) => {
      const members = AGENT_ROSTER.filter((agent) => agent.divisi === divisi.id);
      const head = members.find((agent) => agent.core);
      return `<div class="divisi-card">
        <div class="divisi-card-head">
          <span class="divisi-dot" style="background:${hexToCss(divisi.color)}"></span>
          <strong>${escapeHtml(divisi.label)}</strong>
          <span class="divisi-count">${members.length}</span>
        </div>
        <div class="divisi-head">👑 ${escapeHtml(divisi.head)}${head && head.role ? ` · ${escapeHtml(head.role)}` : ""}</div>
        <div class="divisi-members">${members.map((member) => `<span class="divisi-member${member.core ? " core" : ""}" title="${escapeHtml(member.name)} — ${escapeHtml(member.role)}">${escapeHtml(member.name)}</span>`).join("")}</div>
      </div>`;
    }).join("");
  }

  function hexToCss(hex) {
    return `#${hex.toString(16).padStart(6, "0")}`;
  }

  function render() {
    renderDivisi();
    const counts = workflow.summarize(tasks);
    // Elemen metric lama mungkin tidak ada di layout baru — aman saja.
    ["metric-total", "metric-review", "metric-approved", "metric-revision", "nav-task-count"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = counts.total;
    });

    const filtered = tasks
      .filter((task) => activeFilter === "all" || task.status === activeFilter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (!taskList) { emitOfficeState(); return; }

    if (filtered.length === 0) {
      taskList.innerHTML = `<div class="empty-state"><div class="empty-icon" aria-hidden="true">＋</div><h3>${activeFilter === "all" ? "Belum ada tugas" : "Tidak ada tugas di filter ini"}</h3><p>${activeFilter === "all" ? "Buat satu draf contoh untuk mencoba alur kerja penuh." : "Pilih filter lain atau buat tugas baru."}</p>${activeFilter === "all" ? '<button class="button button-secondary" type="button" data-action="new">Buat tugas pertama</button>' : ""}</div>`;
    } else {
      taskList.innerHTML = filtered.map((task) => {
        const draftPreview = task.draft.split("\n").filter(Boolean).slice(1).join(" ");
        const actions = task.status === "review" || task.status === "revision"
          ? `<button class="button button-small button-revise" type="button" data-action="open" data-id="${escapeHtml(task.id)}">Baca &amp; tinjau</button>`
          : `<button class="button button-small button-secondary" type="button" data-action="open" data-id="${escapeHtml(task.id)}">Lihat draf</button>`;
        return `<article class="task-card">
          <div class="task-main">
            <div class="task-title-row"><h3 class="task-title">${escapeHtml(task.title)}</h3><span class="status-badge status-${escapeHtml(task.status)}">${statusLabel(task.status)}</span></div>
            <p class="task-client">${escapeHtml(task.business)} <span aria-hidden="true">·</span> ${escapeHtml(task.product)}</p>
            <p class="task-description">${escapeHtml(draftPreview)}</p>
            <div class="task-meta"><span><span aria-hidden="true">◷</span> ${formatDate(task.createdAt)}</span><span><span aria-hidden="true">✦</span> ${task.status === "review" || task.status === "revision" ? "Menunggu keputusan operator" : "Tersimpan lokal"}</span>${task.revisionCount ? `<span>Revisi ${task.revisionCount}/${workflow.REVISION_LIMIT}</span>` : ""}</div>
          </div>
          <div class="task-actions">${actions}</div>
        </article>`;
      }).join("");
    }

    emitOfficeState();
    if (typeof renderTaskBoard === "function") renderTaskBoard();
  }

  function openDetails(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    selectedTaskId = id;
    document.getElementById("detail-title").textContent = task.title;
    document.getElementById("detail-meta").innerHTML = [
      `<span>${escapeHtml(task.business)}</span>`,
      `<span>${escapeHtml(task.product)}</span>`,
      `<span>${formatDate(task.createdAt)}</span>`,
      `<span>${statusLabel(task.status)}</span>`
    ].join("");
    document.getElementById("detail-draft").textContent = task.draft;
    document.getElementById("revision-note").value = "";
    const canReview = task.status === "review" || task.status === "revision";
    document.getElementById("revision-field").hidden = !canReview;
    document.getElementById("revision-hint").textContent = canReview
      ? `Putaran revisi ${task.revisionCount}/${workflow.REVISION_LIMIT}. Batas ini usulan untuk pilot.`
      : "Draf yang disetujui tidak otomatis dikirim atau dipublikasikan.";
    const actions = document.getElementById("detail-actions");
    actions.innerHTML = canReview
      ? `<button class="button button-secondary" type="button" data-action="cancel" data-id="${escapeHtml(id)}">Batalkan tugas</button><div class="right-actions"><button class="button button-revise" type="button" data-action="revise" data-id="${escapeHtml(id)}">Minta revisi</button><button class="button button-primary" type="button" data-action="approve" data-id="${escapeHtml(id)}">Setujui draf</button></div>`
      : task.status === "approved"
        ? `<span></span><button class="button button-secondary" type="button" data-action="finalize" data-id="${escapeHtml(id)}">Tandai final</button>`
        : `<span></span><button class="button button-secondary" type="button" data-action="close">Tutup</button>`;
    detailDialog.showModal();
  }

  function updateTask(id, action, options = {}) {
    try {
      const index = tasks.findIndex((task) => task.id === id);
      if (index < 0) throw new Error("Tugas tidak ditemukan.");
      tasks[index] = workflow.transitionTask(tasks[index], action, options);
      persist();
      if (action === "approve") {
        showToast("Draf disetujui dan tersimpan lokal. Belum dikirim ke klien.");
        queueDirection({ kind: "approve", task: tasks[index] });
      }
      if (action === "revise") {
        showToast("Catatan revisi tersimpan. Draf contoh tidak dibuat ulang otomatis.");
        queueDirection({ kind: "revision", task: tasks[index], note: options.note });
      }
      if (action === "finalize") showToast("Status final dicatat secara lokal.");
      if (action === "cancel") {
        releaseOwner(tasks[index].id);
        showToast("Tugas dibatalkan.");
        queueDirection({ kind: "cancel" });
      }
      if (detailDialog.open) detailDialog.close();
    } catch (error) {
      showToast(error.message, true);
    }
  }

  function updateActiveNav() {
    const currentPage = ({
      "#kantor": ["Kantor virtual", "kantor"],
      "#tugas": ["Tugas", "tugas"],
      "#klien": ["Klien", "klien"],
      "#integrasi": ["Integrasi", "integrasi"],
      "#beranda": ["Beranda", "beranda"]
    })[window.location.hash] || ["Kantor virtual", "kantor"];

    document.querySelectorAll(".nav-link").forEach((link) => {
      const active = link.getAttribute("href") === `#${currentPage[1]}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const breadcrumb = document.getElementById("breadcrumb-current");
    if (breadcrumb) breadcrumb.textContent = currentPage[0];

    // Mode game: masuk kantor = layar penuh immersive
    const inOffice = currentPage[1] === "kantor";
    document.body.classList.toggle("game-mode", inOffice);
    if (inOffice && !document.body.classList.contains("office-fullscreen")) {
      const toggle = document.getElementById("office-fullscreen-toggle");
      if (toggle) toggle.click();
    }
  }

  // --- Event wiring --------------------------------------------------------

  document.getElementById("new-task-button").addEventListener("click", () => taskDialog.showModal());
  document.getElementById("cancel-button").addEventListener("click", () => taskDialog.close());
  document.getElementById("dialog-close").addEventListener("click", () => taskDialog.close());
  document.getElementById("detail-close").addEventListener("click", () => detailDialog.close());
  document.getElementById("setup-close").addEventListener("click", () => setupDialog.close());
  document.getElementById("setup-dismiss").addEventListener("click", () => setupDialog.close());
  document.getElementById("notice-close").addEventListener("click", (event) => event.currentTarget.closest(".notice").remove());
  document.getElementById("approval-close").addEventListener("click", hideApprovalToast);
  document.getElementById("approval-approve").addEventListener("click", () => {
    if (pendingApprovalId) {
      updateTask(pendingApprovalId, "approve");
      hideApprovalToast();
    }
  });
  document.getElementById("approval-open").addEventListener("click", () => {
    if (pendingApprovalId) {
      openDetails(pendingApprovalId);
      hideApprovalToast();
    }
  });

  // --- CEO panel shortcuts ---
  document.querySelectorAll("[data-ceo]").forEach((button) => button.addEventListener("click", () => {
    const action = button.dataset.ceo;
    if (action === "telegram") {
      const botName = "boss_rc_poster_bot";
      const url = `https://t.me/${botName}`;
      if (window.confirm(`Buka Telegram bot @${botName} di browser?\n\nPerintah yang tersedia:\n/start — mulai bot\n/status — cek status tugas\n/tugas — lihat tugas aktif\n/approve — setujui draf\n/report — laporan\n\n(Catatan: integrasi Telegram penuh butuh backend. Ini shortcut buka bot.`)) {
        window.open(url, "_blank", "noopener");
      }
    } else if (action === "new-task") {
      taskDialog.showModal();
    } else if (action === "approve-all") {
      const pending = tasks.filter((task) => task.status === "review" || task.status === "revision");
      if (pending.length === 0) {
        showToast("Tidak ada draf yang menunggu persetujuan.");
      } else {
        pending.forEach((task) => updateTask(task.id, "approve"));
        showToast(`${pending.length} draf disetujui.`);
      }
    } else if (action === "report") {
      const counts = workflow.summarize(tasks);
      const socialCount = socialAccounts.length;
      const agentCount = AGENT_ROSTER.length;
      const coreCount = TEAM.length;
      window.alert(`📊 LAPORAN KANTOR AI ID\n\n` +
        `Total tugas: ${counts.total}\n` +
        `Menunggu review: ${counts.review}\n` +
        `Disetujui: ${counts.approved}\n` +
        `Revisi: ${counts.revision}\n\n` +
        `Persona AI: ${agentCount}\n` +
        `Agen inti aktif: ${coreCount}\n` +
        `Akun media sosial: ${socialCount}\n\n` +
        `Mode: ${nightShift ? "Shift Malam 24/7" : "Normal"}\n` +
        `Lantai aktif: ${document.querySelector("[data-office-floor].selected")?.textContent || "1"}`);
    } else if (action === "broadcast") {
      const message = window.prompt("Pesan broadcast ke semua agen AI:", "Kerja dengan fokus, jaga kualitas.");
      if (!message) return;
      TEAM.forEach((id) => setAgent(id, { message, status: "idle" }));
      notice = `📢 Broadcast: ${message}`;
      emitOfficeState();
      showToast("Broadcast terkirim ke semua agen.");
    } else if (action === "night-shift") {
      nightShift = !nightShift;
      button.classList.toggle("selected", nightShift);
      document.dispatchEvent(new CustomEvent("office-night-shift", { detail: { active: nightShift } }));
      if (nightShift) {
        document.dispatchEvent(new CustomEvent("office-mode-changed", { detail: { night: true } }));
        notice = "Shift malam aktif — tim bekerja 24/7";
      } else {
        notice = "Mode normal";
      }
      emitOfficeState();
      showToast(nightShift ? "🌙 Shift malam aktif (24/7)" : "☀️ Mode normal");
    }
  }));

  // --- Social media management ---
  document.getElementById("add-social-btn").addEventListener("click", () => {
    const consumer = window.prompt("Nama konsumen (misal: Kedai Pagi, Toko Baju):");
    if (!consumer) return;
    const platformLabel = window.prompt(`Pilih platform (ketik nomor):\n${PLATFORMS.map((p, i) => `${i + 1}. ${p.label}`).join("\n")}`, "1");
    if (!platformLabel) return;
    const index = Number(platformLabel) - 1;
    const platform = PLATFORMS[index];
    if (!platform) {
      showToast("Platform tidak dikenali.", true);
      return;
    }
    const username = window.prompt(`Username ${platform.label} untuk ${consumer}:`, `@${consumer.toLowerCase().replace(/\s+/g, "")}`);
    if (!username) return;
    addSocialAccount(consumer, platform.id, username);
  });

  document.getElementById("ai-register-btn").addEventListener("click", aiRegisterSocialAccount);

  // --- Command bar (mode full screen) ---
  function runCommand(raw) {
    const text = String(raw || "").trim().toLowerCase();
    if (!text) return;
    const counts = workflow.summarize(tasks);
    if (text.includes("laporan") || text.includes("report")) {
      window.alert(`📊 LAPORAN\n\nTotal tugas: ${counts.total}\nReview: ${counts.review}\nDisetujui: ${counts.approved}\nRevisi: ${counts.revision}\nAkun sosmed: ${socialAccounts.length}\nPersona: ${AGENT_ROSTER.length}`);
      return;
    }
    if (text.includes("setuju") || text.includes("approve")) {
      const pending = tasks.filter((task) => task.status === "review" || task.status === "revision");
      if (!pending.length) {
        showToast("Tidak ada draf menunggu persetujuan.");
      } else {
        pending.forEach((task) => updateTask(task.id, "approve"));
        showToast(`${pending.length} draf disetujui.`);
      }
      return;
    }
    if (text.includes("revisi") || text.includes("revise")) {
      const pending = tasks.filter((task) => task.status === "review" || task.status === "revision");
      if (!pending.length) {
        showToast("Tidak ada draf untuk direvisi.");
      } else {
        showToast(`${pending.length} draf dikembalikan untuk revisi.`);
        pending.forEach((task) => updateTask(task.id, "revise", { note: "Revisi diminta via perintah suara/teks." }));
      }
      return;
    }
    if (text.includes("broadcast") || text.includes("umumkan")) {
      const message = window.prompt("Isi pesan broadcast:", "Kerja dengan fokus, jaga kualitas.");
      if (message) {
        TEAM.forEach((id) => setAgent(id, { message, status: "idle" }));
        notice = `📢 ${message}`;
        emitOfficeState();
        showToast("Broadcast terkirim.");
      }
      return;
    }
    if (text.includes("malam") || text.includes("shift")) {
      document.querySelector('[data-ceo="night-shift"]')?.click();
      return;
    }
    if (text.includes("siang") || text.includes("day")) {
      if (nightShift) document.querySelector('[data-ceo="night-shift"]')?.click();
      return;
    }
    if (text.includes("tugas baru") || text.includes("buat tugas") || text.includes("new task")) {
      taskDialog.showModal();
      return;
    }
    if (text.includes("daftar akun") || text.includes("akun baru") || text.includes("sosmed")) {
      aiRegisterSocialAccount();
      return;
    }
    if (text.includes("bantuan") || text.includes("help") || text === "?") {
      window.alert("PERINTAH YANG BISA DIPAKAI:\n\n• laporan / report — rekap tugas & akun\n• setujui semua / approve — setujui semua draf\n• revisi semua — kembalikan draf untuk revisi\n• broadcast <pesan> — pesan ke semua agen\n• shift malam / siang — ganti mode 24/7\n• tugas baru — buka formulir tugas\n• daftar akun / sosmed — AI buat akun baru\n\nKlik agen di 3D untuk detail, atau pakai tombol HUD.");
      return;
    }
    showToast(`Perintah tidak dikenali: "${raw}". Ketik "bantuan" untuk daftar perintah.`, true);
  }

  document.getElementById("command-send").addEventListener("click", () => {
    const input = document.getElementById("command-input");
    runCommand(input.value);
    input.value = "";
  });
  document.getElementById("command-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(event.currentTarget.value);
      event.currentTarget.value = "";
    }
  });
  document.getElementById("command-help").addEventListener("click", () => runCommand("bantuan"));

  // --- Perintah per agen (NPC yang diklik) ---
  async function runAgentCommand(agentId, raw) {
    const text = String(raw || "").trim().toLowerCase();
    const def = AGENT_ROSTER.find((item) => item.id === agentId);
    if (!def) return { ok: false, reply: "Agen tidak dikenali." };
    const name = def.name;
    if (!text) return { ok: false, reply: "Perintah masih kosong." };
    const counts = workflow.summarize(tasks);
    let localReply = "";
    if (text.includes("laporan") || text.includes("report") || text.includes("progress")) {
      localReply = `${name}: total ${counts.total} tugas, ${counts.review} dalam review, ${counts.approved} disetujui, ${counts.revision} revisi.`;
      setAgent(agentId, { status: "working", message: "Menyusun laporan" });
    } else if (text.includes("kerja") || text.includes("tugas") || text.includes("buat")) {
      localReply = `${name} siap mengerjakan tugas berikutnya.`;
      setAgent(agentId, { status: "working", message: "Mengerjakan tugas" });
    } else if (text.includes("istirahat") || text.includes("rest") || text.includes("stop")) {
      localReply = `${name} beristirahat sejenak.`;
      setAgent(agentId, { status: "idle", message: "Istirahat" });
    } else if (text.includes("rapat") || text.includes("meeting") || text.includes("diskusi")) {
      localReply = `${name} menuju ruang rapat.`;
      setAgent(agentId, { status: "meeting", message: "Rapat tim" });
    } else if (text.includes("bantuan") || text.includes("help") || text === "?") {
      localReply = `${name}: perintah yang tersedia — laporan, kerja, istirahat, rapat, atau tuliskan perintah bebas.`;
    } else {
      localReply = `${name} mencatat: “${String(raw).trim()}”.`;
      setAgent(agentId, { status: "working", message: String(raw).trim().slice(0, 42) });
    }
    emitOfficeState();

    // Panggil AI sungguhan lewat server lokal (Hermes Agent CLI)
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: name, prompt: String(raw || "").trim(), command: text })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data && typeof data.reply === "string") {
        return { ok: data.ok !== false, reply: data.reply, status: (officeAgents.get(agentId) || {}).status || "idle" };
      }
      return { ok: true, reply: localReply, status: (officeAgents.get(agentId) || {}).status || "idle" };
    } catch {
      return { ok: true, reply: localReply, status: (officeAgents.get(agentId) || {}).status || "idle" };
    }
  }

  window.kantorAI = {
    runAgentCommand,
    emitOfficeState,
    agents: AGENT_ROSTER,
    ownerFor,
    picLabel,
    supportFor,
    taskOwners,
    ownerLoad
  };

  document.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-social-remove]");
    if (removeButton) {
      const id = removeButton.dataset.socialRemove;
      const account = socialAccounts.find((item) => item.id === id);
      if (account && window.confirm(`Hapus akun ${account.username} (${account.consumer})?`)) {
        socialAccounts = socialAccounts.filter((item) => item.id !== id);
        saveSocial();
        showToast("Akun dihapus.");
      }
    }
  });

  document.getElementById("view-all-button").addEventListener("click", () => {
    activeFilter = "all";
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("selected", chip.dataset.filter === "all"));
    render();
    document.getElementById("tugas").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => chip.addEventListener("click", () => {
    activeFilter = chip.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach((item) => item.classList.toggle("selected", item === chip));
    render();
  }));

  document.getElementById("task-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input = Object.fromEntries(formData.entries());
    try {
      const task = workflow.createTask(input);
      ownerFor(task); // PIC dipilih sekali sejak tugas dibuat, lalu tidak berubah
      tasks.push(task);
      persist();
      event.currentTarget.reset();
      taskDialog.close();
      activeFilter = "all";
      document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("selected", chip.dataset.filter === "all"));
      render();
      queueDirection({ kind: "create", task });
      showToast("Visualisasi pekerjaan dimulai. Draf tetap contoh lokal dan perlu ditinjau.");
    } catch (error) {
      showToast(error.message, true);
    }
  });

  document.addEventListener("click", (event) => {
    const officeAreaButton = event.target.closest("[data-office-area]");
    if (officeAreaButton) {
      const floor = Number(officeAreaButton.dataset.officeFloor) || 1;
      updateSideCard(officeAreaButton.dataset.officeArea);
      document.dispatchEvent(new CustomEvent("office-area-selected", { detail: { area: officeAreaButton.dataset.officeArea, floor } }));
      return;
    }
    const setupButton = event.target.closest("[data-setup]");
    if (setupButton) {
      const guide = setupGuides[setupButton.dataset.setup];
      document.getElementById("setup-title").textContent = guide.title;
      document.getElementById("setup-description").textContent = guide.description;
      document.getElementById("setup-checklist").innerHTML = guide.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
      document.getElementById("setup-security").textContent = guide.security;
      setupDialog.showModal();
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === "new") taskDialog.showModal();
    else if (action === "open") openDetails(id);
    else if (action === "approve") updateTask(id, "approve");
    else if (action === "revise") {
      updateTask(id, "revise", { note: document.getElementById("revision-note").value });
    } else if (action === "cancel") updateTask(id, "cancel");
    else if (action === "finalize") updateTask(id, "finalize");
    else if (action === "close") detailDialog.close();
  });

  document.addEventListener("keydown", (event) => {
    const officeZone = event.target.closest(".office-zone, .office-agent");
    if (!officeZone || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    updateSideCard(officeZone.dataset.officeArea);
    document.dispatchEvent(new CustomEvent("office-area-selected", { detail: { area: officeZone.dataset.officeArea, floor: 1 } }));
  });

  window.addEventListener("hashchange", updateActiveNav);
  document.addEventListener("office-scene-ready", () => {
    emitOfficeState();
    startAmbience();
  });
  document.addEventListener("office-room-focused", (event) => updateSideCard(event.detail));
  document.addEventListener("office-agent-selected", (event) => {
    const agent = AGENT_ROSTER.find((item) => item.id === event.detail.agentId);
    if (agent) updateSideCard(agent.area);
  });
  document.addEventListener("office-sleep-request", (event) => {
    officeSleep = event.detail.sleep;
    stopAmbience();
    if (officeSleep) {
      setAllIdle(TEAM);
      TEAM.forEach((id) => setAgent(id, { status: "resting", decorative: true, message: "Istirahat malam" }));
      activeTaskId = null;
      activeStage = null;
      notice = "Tim istirahat (status dekoratif)";
      emitOfficeState();
    } else {
      setAllIdle(TEAM);
      notice = "Tim siap";
      emitOfficeState();
      startAmbience();
    }
  });

  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric"
  }).format(new Date()).toLocaleUpperCase("id-ID");
  const pageIntro = document.querySelector(".page-intro .eyebrow");
  if (pageIntro) pageIntro.textContent = `${dateLabel} · WORKSPACE PRIBADI`;
  updateSideCard("studio");
  updateActiveNav();

  document.getElementById("logout-button").addEventListener("click", async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      /* abaikan, tetap keluar */
    }
    window.localStorage.removeItem("kantor.user");
    window.location.href = "/login";
  });

  document.getElementById("export-button").addEventListener("click", () => {
    const backup = { format: "kantor-ai-mvp-backup", version: 1, exportedAt: new Date().toISOString(), tasks };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kantor-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Backup lokal diekspor. Simpan file dengan aman.");
  });

  document.getElementById("import-file").addEventListener("change", async (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (backup.format !== "kantor-ai-mvp-backup" || backup.version !== 1 || !Array.isArray(backup.tasks)) {
        throw new Error("Format backup tidak dikenali.");
      }
      if (backup.tasks.length > 500 || backup.tasks.some((task) => !task || typeof task.id !== "string" || !workflow.STATUSES.includes(task.status) || typeof task.draft !== "string" || typeof task.business !== "string")) {
        throw new Error("Isi backup tidak valid atau melewati batas 500 tugas.");
      }
      if (!window.confirm(`Impor ${backup.tasks.length} tugas dan ganti data lokal saat ini?`)) return;
      tasks = backup.tasks;
      persist();
      showToast("Backup berhasil dimuat di browser ini.");
    } catch (error) {
      showToast(`Backup gagal diimpor: ${error.message}`, true);
    } finally {
      event.currentTarget.value = "";
    }
  });

  // --- Dock Room Navigation (Mina-UI style) ---
  const dockButtons = document.querySelectorAll("#office-room-dock .dock-btn");
  dockButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const area = btn.dataset.dockArea;
      if (!area) return;
      dockButtons.forEach((b) => b.classList.toggle("active", b === btn));
      // Langsung fokus kamera ke ruangan (office3d.js mendengarkan event ini)
      document.dispatchEvent(new CustomEvent("office-area-selected", { detail: { area, floor: 1 } }));
      const label = btn.querySelector(".dock-label")?.textContent || area;
      showToast(`Melihat ${label}`);
    });
  });

  // --- Task Board Toggle (Bekraz style) ---
  const taskBoard = document.querySelector(".task-board");
  const taskBoardToggleBtn = document.createElement("button");
  taskBoardToggleBtn.className = "office-btn";
  taskBoardToggleBtn.type = "button";
  taskBoardToggleBtn.title = "Buka papan tugas (Running / Done / Waiting)";
  taskBoardToggleBtn.innerHTML = '📋 <span>Tugas</span>';
  taskBoardToggleBtn.addEventListener("click", () => {
    if (taskBoard) {
      taskBoard.classList.toggle("open");
      taskBoardToggleBtn.classList.toggle("selected", taskBoard.classList.contains("open"));
    }
  });
  const hudTr = document.querySelector(".office-hud-tr");
  if (hudTr) hudTr.insertBefore(taskBoardToggleBtn, hudTr.firstChild);

  // --- Keyboard Shortcuts (Video Shortcut style) ---
  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) || e.target.isContentEditable) return;
    const key = e.key.toLowerCase();
    if (key >= "1" && key <= "9") {
      const areas = ["masjid", "meeting", "kopi", "studio", "workspace", "client", "gym", "lounge", "pantry"];
      const idx = parseInt(key) - 1;
      if (areas[idx]) {
        const btn = document.querySelector(`#office-room-dock [data-dock-area="${areas[idx]}"]`);
        if (btn) btn.click();
      }
      return;
    }
    switch (key) {
      case "f": document.getElementById("office-fullscreen-toggle")?.click(); break;
      case "t": document.getElementById("office-top-toggle")?.click(); break;
      case "c": document.getElementById("command-input")?.focus(); break;
      case "b": taskBoardToggleBtn?.click(); break;
      case "escape":
        document.querySelectorAll("dialog[open]").forEach((d) => d.close());
        document.querySelectorAll(".task-board.open").forEach((b) => b.classList.remove("open"));
        break;
      case "d": document.getElementById("office-day-toggle")?.click(); break;
      case "r": document.getElementById("office-reset")?.click(); break;
    }
  });

  // --- Keyboard Hint (bottom-left) ---
  const kbdHint = document.createElement("div");
  kbdHint.className = "kbd-hint";
  kbdHint.innerHTML = `
    <span class="kbd-key"><kbd>1-9</kbd> Ruangan</span>
    <span class="kbd-key"><kbd>T</kbd> Top-down</span>
    <span class="kbd-key"><kbd>F</kbd> Fullscreen</span>
    <span class="kbd-key"><kbd>B</kbd> Papan Tugas</span>
    <span class="kbd-key"><kbd>C</kbd> Chat</span>
    <span class="kbd-key"><kbd>D</kbd> Siang/Malam</span>
    <span class="kbd-key"><kbd>Esc</kbd> Tutup</span>
  `;
  document.body.appendChild(kbdHint);
  setTimeout(() => { kbdHint.style.opacity = "0"; kbdHint.style.transition = "opacity 1s"; setTimeout(() => kbdHint.remove(), 1000); }, 15000);

  render();
  renderSocial();

  // --- Topbar: Task Board toggle ---
  const topbarTaskBtn = document.getElementById("topbar-task-toggle");
  const topbarCeoBtn = document.getElementById("topbar-ceo-toggle");
  const taskBoardEl = document.getElementById("task-board");
  const ceoPanelEl = document.getElementById("ceo-panel");
  const taskBoardClose = document.getElementById("task-board-close");
  const ceoPanelClose = document.getElementById("ceo-panel-close");

  if (topbarTaskBtn && taskBoardEl) {
    topbarTaskBtn.addEventListener("click", () => {
      taskBoardEl.classList.toggle("open");
      topbarTaskBtn.classList.toggle("selected", taskBoardEl.classList.contains("open"));
      if (taskBoardEl.classList.contains("open") && ceoPanelEl) {
        ceoPanelEl.classList.remove("open");
        if (topbarCeoBtn) topbarCeoBtn.classList.remove("selected");
      }
    });
  }
  if (taskBoardClose && taskBoardEl) {
    taskBoardClose.addEventListener("click", () => {
      taskBoardEl.classList.remove("open");
      if (topbarTaskBtn) topbarTaskBtn.classList.remove("selected");
    });
  }
  if (topbarCeoBtn && ceoPanelEl) {
    topbarCeoBtn.addEventListener("click", () => {
      ceoPanelEl.classList.toggle("open");
      topbarCeoBtn.classList.toggle("selected", ceoPanelEl.classList.contains("open"));
      if (ceoPanelEl.classList.contains("open") && taskBoardEl) {
        taskBoardEl.classList.remove("open");
        if (topbarTaskBtn) topbarTaskBtn.classList.remove("selected");
      }
    });
  }
  if (ceoPanelClose && ceoPanelEl) {
    ceoPanelClose.addEventListener("click", () => {
      ceoPanelEl.classList.remove("open");
      if (topbarCeoBtn) topbarCeoBtn.classList.remove("selected");
    });
  }

  // --- Task board tabs ---
  document.querySelectorAll(".task-board-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".task-board-tab").forEach((t) => t.classList.toggle("active", t === tab));
      activeFilter = tab.dataset.tab === "all" ? "all" : tab.dataset.tab;
      renderTaskBoard();
    });
  });

  // --- Task board list (render dari tasks) ---
  function renderTaskBoard() {
    const list = document.getElementById("task-board-list");
    if (!list) return;
    const counts = workflow.summarize(tasks);
    const filtered = tasks.filter((task) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "running") return task.status === "review" || task.status === "revision";
      if (activeFilter === "done") return task.status === "approved";
      return task.status === activeFilter;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (filtered.length === 0) {
      list.innerHTML = `<div class="task-item">
        <div class="task-item-head">
          <span class="task-item-title">Belum ada tugas</span>
          <span class="task-item-status task-status-done">Selesai</span>
        </div>
        <div class="task-item-meta">
          <span class="task-item-agent">PIC —</span>
          <span class="task-item-time">Buat tugas baru</span>
        </div>
      </div>`;
      return;
    }

    list.innerHTML = filtered.map((task) => {
      const statusLabel = { review: "Review", revision: "Revisi", approved: "Selesai", cancelled: "Batal" }[task.status] || task.status;
      const statusClass = { review: "task-status-running", revision: "task-status-waiting", approved: "task-status-done", cancelled: "task-status-waiting" }[task.status] || "task-status-done";
      const progress = task.status === "approved" ? 100 : task.status === "review" ? 60 : task.status === "revision" ? 40 : 20;
      const picName = picLabel(task);
      const picRole = picName ? (AGENT_ROSTER.find((item) => item.name === picName) || {}).role || "" : "";
      return `<div class="task-item" data-task-id="${escapeHtml(task.id)}">
        <div class="task-item-head">
          <span class="task-item-title">${escapeHtml(task.title)}</span>
          <span class="task-item-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="task-item-meta">
          <span class="task-item-agent" title="${escapeHtml(picRole)}">PIC: ${escapeHtml(picName || "—")}</span>
          <span class="task-item-time">${escapeHtml(task.business || "—")}</span>
        </div>
        <div class="task-item-progress"><div style="width:${progress}%"></div></div>
        ${task.status === "review" || task.status === "revision" ? `<div class="task-item-actions">
          <button class="task-act-btn task-act-approve" data-board-action="approve" data-id="${escapeHtml(task.id)}">Setujui</button>
          <button class="task-act-btn task-act-revise" data-board-action="revise" data-id="${escapeHtml(task.id)}">Revisi</button>
          <button class="task-act-btn task-act-reject" data-board-action="cancel" data-id="${escapeHtml(task.id)}">Batal</button>
        </div>` : ""}
      </div>`;
    }).join("");
  }

  // Delegate clicks on task board
  if (taskBoardEl) {
    taskBoardEl.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-board-action]");
      if (actionBtn) {
        const { boardAction, id } = actionBtn.dataset;
        if (boardAction === "approve") updateTask(id, "approve");
        else if (boardAction === "revise") updateTask(id, "revise", { note: "Revisi dari papan tugas." });
        else if (boardAction === "cancel") updateTask(id, "cancel");
        renderTaskBoard();
        return;
      }
      const item = event.target.closest(".task-item");
      if (item && item.dataset.taskId) {
        openDetails(item.dataset.taskId);
      }
    });
  }

  // Panggil renderTaskBoard setelah render
  renderTaskBoard();

  // --- Sinkronkan status topbar ---
  function syncTopbarStatus() {
    const el = document.getElementById("topbar-status-text");
    if (!el) return;
    const counts = workflow.summarize(tasks);
    if (activeTaskId) el.textContent = `${activeStage || "proses"} · ${notice || ""}`;
    else if (counts.review > 0) el.textContent = `${counts.review} menunggu review`;
    else el.textContent = "Tim siap";
  }
  const origEmit = emitOfficeState;
  emitOfficeState = function () { origEmit(); syncTopbarStatus(); };

  // --- Live Update Client (SSE) ---
  let liveClientVersion = 0;
  function initLiveUpdate() {
    const evtSource = new EventSource("/api/live");
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.version && data.version !== liveClientVersion) {
          if (liveClientVersion !== 0) {
            showLiveUpdateToast(data.version);
          }
          liveClientVersion = data.version;
        }
      } catch (e) { /* ignore parse error */ }
    };
    evtSource.onerror = () => {
      // Reconnect after 5s
      setTimeout(initLiveUpdate, 5000);
    };
  }
  function showLiveUpdateToast(version) {
    const toast = document.createElement("div");
    toast.className = "live-update-toast";
    toast.innerHTML = `
      <div class="toast-content">
        <strong>🔄 Update tersedia (v${version})</strong>
        <span>Klik untuk refresh halaman</span>
      </div>
    `;
    document.body.appendChild(toast);
    toast.addEventListener("click", () => { window.location.reload(); });
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 500); }, 10000);
  }
  // Start live update after scene ready
  document.addEventListener("office-scene-ready", initLiveUpdate, { once: true });

})();
