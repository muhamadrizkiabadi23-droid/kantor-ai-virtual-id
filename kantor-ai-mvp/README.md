# Kantor AI Merah Putih — Full Virtual

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

## Tata letak kantor (3×3, ±28×20 m)

| Baris | Zona |
|---|---|
| Utara | **Masjid & Musala** · **Ruang Rapat** · **Kedai Kopi** |
| Tengah | **Studio Konten** · **Workspace 48 Meja** · **Ruang Klien** |
| Selatan | **Gym Mini** · **Lounge & Taman** · **Pantry & Dapur** |
| Luar | taman, jalan, trotoar, pagar, gerbang, pohon, lampu jalan, bendera Merah Putih |

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

### 2. Perintahkan NPC (karyawan AI)
1. **Klik NPC** mana pun → muncul kartu detail (nama, divisi, status).
2. Tulis perintah bebas, atau pakai tombol cepat:
   **Laporan · Kerjakan tugas · Istirahat · Rapat**.
3. NPC menjawab dengan **AI sungguhan** (Hermes Agent CLI).
4. Status NPC ikut berubah di kantor (bekerja / rapat / istirahat).

### 3. Aktivitas NPC
NPC yang menganggur otomatis melakukan aktivitas harian:
🕌 sholat · 🍚 makan · ☕ ngopi · 🏋️ olahraga · 🏊 renang ·
📺 nonton · 📖 baca · 💬 diskusi · 🌴 santai.
Begitu ada tugas, mereka kembali bekerja.

### 4. Buat tugas
- Klik **Tugas Baru**, isi 5 kelompok brief (identitas usaha, produk, target, tujuan, brand).
- Alur: intake → strategi → konten → review → **Setuju / Revisi / Batal**.
- NPC berpindah ruang sesuai tahap tugas (data-driven, bukan animasi).

### 5. Panel CEO
6 shortcut: Telegram, Tugas Baru, Setujui Semua, Laporan, Broadcast, Shift Malam.

### 6. Akun sosmed
Tambah akun per konsumen (A, B, C, …) atau biarkan AI mendaftarkan akun baru.
8 platform: Instagram, TikTok, YouTube, Facebook, WhatsApp, X, Shopee, Tokopedia.

## Performa

| Metrik | Nilai |
|---|---|
| Draw calls | ~768 |
| Mesh | ~806 (85 instanced) |
| Segitiga | ~146k |
| JS per frame | ~8 ms |

Teknik: `InstancedMesh` untuk meja/kursi/tanaman/lampu/pohon, rig NPC digabung
11→6 mesh, shadow map di-throttle, shadow NPC dimatikan (blob shadow).

## Struktur

```
kantor-ai-mvp/
├── index.html          # kerangka aplikasi (importmap Three.js)
├── styles.css          # HUD + mode game (fullscreen)
├── server.js           # server lokal + endpoint /api/agent
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
- Panel CEO, sosmed, laporan

**Simulasi (menunggu integrasi):**
- Publikasi sosmed (belum tersambung ke API platform)
- Telegram (tombol membuka bot, belum ada webhook)
- Google Sheets (data masih di localStorage)

## Pengujian

```bash
npm test
```

## Keamanan

- Server hanya di `127.0.0.1` — tidak bisa diakses dari internet.
- API key disimpan di `.env` (tidak masuk git). Lihat `../API-KEYS.md`.
- Jangan masukkan data klien asli ke prototype ini.

## Instal di komputer baru

Lihat `../installer/README-INSTALL.md` — copy folder, klik `install.bat`,
pintasan desktop dibuat otomatis.
