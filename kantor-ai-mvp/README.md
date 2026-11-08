# KANTOR AI ID — Virtual Workspace

Kantor virtual 3D **satu lantai** yang benar-benar berjalan: 48 karyawan AI,
NPC yang bisa diklik dan diperintah, dijawab **AI sungguhan** lewat Hermes
Agent CLI — bukan animasi hiasan.

Buka server → **langsung full virtual**. Tanpa dasbor, tanpa sidebar.
Kamera sudah mode atas (top-down) supaya NPC mudah diklik seperti game.

## Kebutuhan

| Item | Minimum |
|---|---|
| OS | Windows 10/11 64-bit |
| Node.js | 18+ |
| Browser | Chrome / Edge (WebGL) |
| AI backend | Hermes Agent CLI (opsional, otomatis dipakai bila ada) |

## Jalankan

```bash
npm install
npm start
```

Lalu buka `http://127.0.0.1:4173`.

Atau klik dua kali `start.bat` (memaksa Chrome/Edge, bukan IE).

**Mode publik (HP dari jaringan mana pun):** klik `start-publik.bat`,
salin URL `https://*.trycloudflare.com` yang muncul.

## Tata letak kantor (3×3, ±28×20 m)

| Baris | Zona |
|---|---|
| Utara | **Masjid & Musala** · **Ruang Rapat** · **Kedai Kopi** |
| Tengah | **Studio Konten** · **Workspace 48 Meja** · **Ruang Klien** |
| Selatan | **Gym Mini** · **Lounge & Taman** · **Pantry & Dapur** |
| Luar | taman, jalan, trotoar, pagar, gerbang, pohon, lampu jalan |

Detail fasilitas:
- **Masjid** — mihrab, minbar, kubah, 6 karpet sholat, tempat wudu
- **Kedai Kopi** — bar counter, mesin espresso, papan menu, bangku, 3 meja
- **Gym Mini** — 3 treadmill, bench press, barbel, dumbbell rack, cermin, matras
- **Lounge & Taman** — sofa, TV, meja coffee, taman indoor, kolam
- **Pantry & Dapur** — counter, kompor, sink, kulkas, rice cooker, galon, 3 meja makan
- **Studio Konten** — green screen, 2 kamera tripod, ring light, meja editing
- **Ruang Rapat** — meja oval + 10 kursi, layar, whiteboard
- **Ruang Klien** — meja presentasi, sofa, 2 rak display, layar
- **Workspace** — 48 workstation (4 blok × 12 meja + kursi + monitor)

## Cara pakai

### 1. Lihat kantor
- Buka server → langsung full virtual, kamera atas.
- **Seret** memutar, **scroll** zoom, **klik kanan / 2 jari** geser.
- Tombol **Atas/Perspektif** ganti sudut, **R** reset kamera.
- **Full** layar penuh, **Tur** tur otomatis, **Mode malam** pencahayaan malam.

### 2. Navigasi ruangan (dock)
9 tombol di bawah: **Masjid · Rapat · Kopi · Studio · Workspace · Klien · Gym · Lounge · Pantry**.
Klik → kamera terbang ke ruangan. Shortcut **1–9**.

### 3. Perintahkan NPC (karyawan AI)
1. **Klik NPC** mana pun → muncul kartu detail (nama, divisi, status).
2. Tulis perintah bebas, atau pakai tombol cepat:
   **Laporan · Kerjakan tugas · Istirahat · Rapat**.
3. NPC menjawab dengan **AI sungguhan** (Hermes Agent CLI).
4. Status NPC ikut berubah di kantor (bekerja / rapat / istirahat).

Atau ketik perintah di **command bar** bawah untuk seluruh tim.

### 4. Aktivitas NPC
NPC yang menganggur otomatis melakukan aktivitas harian:
🕌 sholat · 🍚 makan · ☕ ngopi · 🏋️ olahraga · 🏊 renang ·
📺 nonton · 📖 baca · 💬 diskusi · 🌴 santai.
Begitu ada tugas, mereka kembali bekerja.

### 5. Papan Tugas (task board)
- Tombol **Tugas** di topbar (shortcut **B**).
- Tab: Semua · Berjalan · Review · Selesai.
- Aksi cepat per tugas: **Setujui · Revisi · Batal**.

### 6. Panel CEO
6 shortcut: Telegram, Tugas Baru, Setujui Semua, Laporan, Broadcast, Shift Malam.

### 7. Buat tugas
- Klik **Tugas Baru**, isi 5 kelompok brief (identitas usaha, produk, target, tujuan, brand).
- Alur: intake → strategi → konten → review → **Setuju / Revisi / Batal**.
- NPC berpindah ruang sesuai tahap tugas (data-driven, bukan animasi).

### 8. Akun sosmed
Tambah akun per konsumen (A, B, C, …) atau biarkan AI mendaftarkan akun baru.
8 platform: Instagram, TikTok, YouTube, Facebook, WhatsApp, X, Shopee, Tokopedia.

## Performa

| Metrik | Nilai |
|---|---|
| Draw calls | ~580–770 |
| Mesh | ~806 (85 instanced) |
| Segitiga | ~120k |
| JS per frame | ~8 ms |

Teknik: `InstancedMesh` untuk meja/kursi/tanaman/lampu/pohon, rig NPC digabung
11→6 mesh, shadow map di-throttle, shadow NPC dimatikan (blob shadow).
**Deteksi otomatis**: bila browser memakai software renderer (SwiftShader/llvmpipe),
kualitas otomatis diturunkan ke "Hemat" supaya tetap mulus. Bisa juga paksa
lewat URL `?quality=low|auto|high`.

## Struktur

```
kantor-ai-mvp/
├── index.html          # kerangka aplikasi (importmap Three.js, topbar, dock, task board)
├── login.html          # halaman masuk / daftar
├── styles.css          # HUD + mode game (fullscreen)
├── server.js           # server lokal + /api/agent + /api/auth + /health
├── vendor/three/       # Three.js lokal (portabel, tanpa CDN)
├── src/
│   ├── officeWorld.js  # gedung 1 lantai + 9 zona + eksterior + nav grid
│   ├── officeAgents.js # rig NPC, animasi, aktivitas, pathfinding
│   ├── office3d.js     # renderer, kamera, kualitas, tour, siang/malam
│   ├── officeSupport.js# panel Hermes Teknisi + live chat
│   ├── app.js          # workflow, panel CEO, sosmed, perintah NPC
│   └── workflow.js     # mesin status tugas
└── test/               # 6 pengujian otomatis
```

## Yang nyata, apa yang simulasi

**Nyata:**
- Workflow tugas & approval
- NPC bergerak sesuai status tugas (A* pathfinding)
- Aktivitas NPC harian (sholat, makan, ngopi, olahraga, dll)
- Perintah NPC dijawab AI sungguhan (bila `hermes` CLI ada)
- Panel CEO, Papan Tugas, laporan
- Auth lokal (masuk/daftar dengan kode undangan)

**Simulasi (menunggu integrasi):**
- Publikasi sosmed (belum tersambung ke API platform)
- Telegram (tombol membuka bot, belum ada webhook)
- Google Sheets (data masih di localStorage)
- Pembayaran / langganan (trial 7 hari belum ditegakkan)

## Pengujian

```bash
npm test
```

## Keamanan

- Server lokal only di `127.0.0.1` — tidak bisa diakses dari internet,
  kecuali lewat terowongan Cloudflare (`start-publik.bat`).
- Kredensial di `.env` (tidak masuk git).
- Jangan masukkan data klien asli ke prototype ini.

## Instal di komputer baru

Lihat `../installer/README-INSTALL.md` — copy folder, klik `install.bat`,
pintasan desktop dibuat otomatis.
