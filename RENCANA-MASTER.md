# 🏢 KANTOR AI MERAH PUTIH
## RENCANA MASTER — v4.1 (Full Virtual · 1 Lantai)
### *"Kantor yang nggak pernah tidur, nggak pernah cuti, nggak pernah bolos."*

| | |
|---|---|
| **Status** | Prototype Full Virtual berjalan — NPC nyata, perintah AI nyata |
| **Versi** | v4.1 — kantor virtual 3D penuh, **satu lantai**, buka = full virtual |
| **Prinsip** | Semua pengaturan bisa diubah sendiri, kapan saja, tanpa admin |
| **Model biaya** | Gratis dulu → upgrade berbayar → siap produksi |
| **Arsitektur** | Hybrid: Lokal (utama) + Cloud (cadangan) |
| **AI** | Hermes Agent CLI (Mixture of Agents, 15 model cadangan) |

> **Revisi v4.1 (8 Nov 2026):** Kantor dirombak total menjadi **satu lantai luas
> (±28×20 m)** dengan tata letak **3×3 yang rapi**. Dasbor dihapus — buka server
> langsung **full virtual** dengan kamera atas (top-down) supaya NPC mudah diklik.
> Sembilan zona: Masjid, Ruang Rapat, Kedai Kopi, Studio Konten, Workspace 48 meja,
> Ruang Klien, Gym Mini, Lounge & Taman, Pantry & Dapur. 48 NPC melakukan aktivitas
> harian (sholat, makan, ngopi, olahraga, renang, nonton, baca, diskusi, santai) dan
> kembali bekerja bila ada tugas. Performa: ~768 draw call, ~8 ms JS per frame
> (InstancedMesh + rig NPC digabung + shadow di-throttle).

---

# 📑 DAFTAR ISI

| Bagian | Isi |
|---|---|
| **1. Gambaran Umum** | Konsep, visi, kelebihan, ringkasan |
| **2. Tim** | 48 karyawan AI, 9 divisi, struktur |
| **3. Arsitektur** | Sistem, lokal, hybrid, jarak jauh |
| **4. Tools & Aplikasi** | Peta tools, mesin AI |
| **5. Telegram** | Arsitektur, keamanan |
| **6. Fitur & Layanan** | Fitur, panel, modul UMKM |
| **7. Kantor Virtual 3D** | Full Virtual, NPC, perintah |
| **8. Panel CEO & Sosmed** | Shortcut, manajemen akun |
| **9. Hermes Teknisi** | Penjaga, cybersecurity |
| **10. Instalasi** | Installer sekali klik |
| **11. Bisnis** | Harga, proyek perdana |
| **12. Eksekusi** | Tahapan, anti-error, risiko |
| **13. Penutup** | Keputusan final, metrik |

---

# BAGIAN 1 — GAMBARAN UMUM

## 1. Apa itu Kantor AI Merah Putih?
Sebuah "kantor" berisi **48 karyawan AI** (4 pimpinan + 44 anggota divisi) yang mengerjakan **jasa marketing sungguhan** untuk UMKM. Semua jalan di mesin khusus, dan kamu pantau + kontrol penuh dari **browser / Telegram**.

Bedanya dengan konten "kantor AI" lain: **ini bukan animasi fiksi — NPC dijawab AI nyata.**

## 2. Visi, Misi, Prinsip

| | |
|---|---|
| **Visi** | Jadi penyedia jasa AI terbaik untuk UMKM se-Indonesia |
| **Misi** | "Palugada" — apa lu mau, gua ada |
| **Prinsip 1** | Semua pengaturan bisa diubah sendiri |
| **Prinsip 2** | Kamu (bos) yang pegang kendali & uang |
| **Prinsip 3** | Transparan — semua tercatat |
| **Prinsip 4** | Aman — data & akses terkontrol |
| **Prinsip 5** | Skalabel — bisa tambah karyawan kapan saja |

## 3. Kelebihan vs konten kantor AI lain

| Fitur | Konten lain | Kantor AI Merah Putih |
|---|---|---|
| Sistemnya | Animasi fiksi | **Sistem asli + AI nyata** |
| Kontrol | Tidak bisa diatur | **Kontrol penuh browser/Telegram** |
| NPC | Hiasan | **Bisa diklik & diperintah** |
| Pengaturan | Tidak bisa diubah | **Semua bisa diubah** |
| Model AI | Terkunci 1 | **15 model cadangan** |
| Transparansi | Tidak ada | **Semua tercatat** |
| Jumlah AI | 1-2 | **48 karyawan** |
| Approval | Tidak ada | **Setuju/Revisi/Batal** |
| Biaya | — | **Rp 0 (gratis)** |
| Perangkat | — | **Tanpa VPS** |

## 4. Ringkasan eksekutif

| Aspek | Keputusan |
|---|---|
| Konsep | 48 karyawan AI (4 pimpinan + 44 anggota divisi) |
| Arsitektur | Hybrid: Lokal (utama) + Cloud (cadangan) |
| Kontrol | Browser + Telegram |
| Data | localStorage + Google Sheets (fase 2) |
| Layanan | Jasa marketing untuk UMKM |
| Biaya Fase 1 | Rp 0 |
| Waktu | ± 3-4 minggu |

---

# BAGIAN 2 — TIM

## 5. Struktur Organisasi — 48 Karyawan AI

### 5.1 Pimpinan

| Nama | Peran |
|---|---|
| 👑 **Naga Hitam** | **CEO** — pengarah, ide, strategi, keputusan |
| Arif | Direktur AI — supervisi, QC, review |
| Raka | Direktur Strategi & Brand — positioning, kompetitor, kampanye |
| Kirana | Kepala Staf — koordinasi, antrian, rekap |

### 5.2 Sembilan Divisi (44 anggota)

| Divisi | Kepala | Anggota |
|---|---|---|
| Kreatif & Desain | Nadia | Andini, Rani, Fajar, Putri, Sinta |
| Video & Editing | Dimas | Rizky, Bimo, Teguh, Yanti, Wawan |
| Pemasaran Digital | Bima | Hendra, Bagas, Sekar, Taufik, Lestari |
| Konten & Copywriting | Dewi | Ayu, Joko, Wulan, Tania, Nia |
| Sosmed & Komunitas | Gilang | Dian, Agus, Reza, Nina, Tono |
| Data & Riset | Yoga | Laras, Roni, Yuda, Bagus |
| Keuangan & Legal | Bayu | Maya, Rina, Doni, Rian |
| Klien & CRM | Sari | Dedi, Eko, Fani |
| QA & Review | Arif | (patroli berkala) |

**Total: 48 karyawan AI** (4 pimpinan + 44 anggota divisi).

**Mode serba bisa:** tiap karyawan punya keahlian utama, tapi bisa mengerjakan tugas lain.

## 6. Peran HRD/Onboarding — Sari
1. Menerima UMKM baru
2. Menjelaskan **5 syarat wajib**
3. Cek kelengkapan data → **tanya balik kalau kurang**
4. Susun rencana kerja + estimasi
5. Awasi kepuasan klien

## 7. Mesin Hybrid (Hermes) — Sudah Terpasang & Teruji

**Status:** ✅ Aktif. Semua model di bawah **dites live satu per satu** dan benar-benar menjawab.

### Rantai fallback = 15 pemain cadangan

| # | Model | Provider |
|---|---|---|
| 1 | nvidia/nemotron-3-ultra-550b-a55b | NVIDIA |
| 2 | nvidia/nemotron-3-ultra-550b-a55b:free | OpenRouter |
| 3 | nvidia/nemotron-3.5-lightning:free | OpenRouter |
| 4 | recursive/flint-v1.0:free | OpenRouter |
| 5 | dots-studio/dots-3-note-preview:free | OpenRouter |
| 6 | nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | OpenRouter |
| 7 | liquid/lfm-2.5-2.6b:free | OpenRouter |
| 8 | cohere/north-mini-code:free | OpenRouter |
| 9 | stealth/crouton-alpha | OpenRouter |
| 10 | nvidia/nemotron-3.5-super-vl:free | OpenRouter |
| 11 | openrouter/free | OpenRouter |
| 12 | gemini-3.1-flash-lite | Gemini |
| 13 | gemini-3-flash-preview | Gemini |
| 14 | gemini-3.1-flash-lite-preview | Gemini |
| 15 | z-ai/glm-5.3-flash | NVIDIA |

**Kapten (primary):** `hybrid` → `meituan/longcat-2.5:free` (Nous).

## 8. Cara Menambah Karyawan
1. Buka **Sheet PENGATURAN** → kolom "TIM"
2. Tambah nama + peran (atau `/tambah karyawan <nama> <peran>`)
3. Selesai — karyawan baru langsung bisa diminta tugas

---

# BAGIAN 3 — ARSITEKTUR

## 9. Arsitektur Sistem (Hybrid)

```
HP / Teman / Klien
      ↓
Bot Telegram
      ↓
Cloud (Apps Script) ← PINTU DEPAN
      ↓
Google Sheets ← DATABASE BERSAMA
      ↓
PC Lokal ← PELAKSANA (aktif 24/7)
      ↓
Hermes Agent CLI + Kantor Virtual 3D
```

## 10. Arsitektur Lokal (PC sebagai Server)

| Komponen | Fungsi |
|---|---|
| **Hermes Agent** | AI agent (otak kantor) |
| **Kantor Virtual 3D** | Antarmuka visual + kontrol NPC |
| **Web server** | Server lokal (port 4173) |
| **Telegram bot** | Kontrol & notifikasi jarak jauh |
| **Backup** | Sinkron ke Drive/GitHub |

**Fungsi PC nyala 24 jam:** menjaga AI agent, otomasi, dashboard, bot — semua tetap hidup.

## 11. Arsitektur Hybrid (Cloud = Cadangan)

- **Utama:** Lokal (PC 24 jam)
- **Cadangan:** Cloud (aktif kalau PC rusak)
- **Data:** Sinkron real-time

| Arah | Kapan |
|---|---|
| PC → Cloud | tiap ada perubahan |
| Cloud → PC | tiap menit |
| Heartbeat | tiap 1 menit |

**Failover:** PC mati → heartbeat berhenti → cloud aktif (5 menit).
**Biaya cloud:** **Rp 0** (standby).

## 12. Kontrol Jarak Jauh (dari HP)
1. Kamu kirim perintah dari HP
2. Cloud bot terima → tulis ke Sheets
3. PC baca Sheets → kerjakan
4. PC tulis hasil ke Sheets
5. Cloud bot kirim hasil ke Telegram

**Kecepatan:** ~1-2 menit. **Tanpa tunnel** (aman).

## 13. Multi-User & Konflik Akses

| Siapa | Akses |
|---|---|
| Kamu (Admin) | Penuh |
| Teman (Operator) | Kerja + monitoring |
| Klien (Viewer) | Lihat progress |

---

# BAGIAN 4 — TOOLS & APLIKASI

## 14. Peta Tools (Bisa Diganti)

| Divisi | Tool (gratis) | Tool (berbayar) |
|---|---|---|
| Kreatif & Desain | Canva, GIMP, Tripo 3D | ChatGPT Plus |
| Video & Editing | CapCut, Kling AI, DaVinci Resolve | Claude Remotion |
| Pemasaran Digital | Google Ads, Meta Ads, TikTok Ads | Google Ads Premium |
| Konten & Copywriting | Claude (free), Gemini (free) | Claude Pro |
| Sosmed & Komunitas | AdaptlyPost, Buffer, Canva | n8n Cloud |
| Data & Riset | Perplexity (free), Gemini (free) | Perplexity Pro |
| Keuangan & Legal | Gemini (free), Google Sheets | Gemini Ultra |
| Klien & CRM | Claude (free), WhatsApp Business | Claude Pro |

## 15. Mesin AI (Spesifikasi)

| Komponen | Minimum | Ideal |
|---|---|---|
| CPU | 6 core | 8+ core |
| RAM | 16GB | 32-64GB |
| GPU | GTX 1660 | RTX 3060/4060 |
| Storage | 512GB SSD | 1TB NVMe |
| UPS | — | **wajib** |

---

# BAGIAN 5 — TELEGRAM

## 16. Arsitektur Telegram

| Komponen | Fungsi |
|---|---|
| **Bot** | Pintu masuk |
| **Grup Kerja** | Tim (kamu + teman) |
| **Channel** | Notifikasi (read-only) |
| **Private chat** | Aksi sensitif |

## 17. Keamanan & Peran

| Aturan | Penjelasan |
|---|---|
| Bot hanya respon chat ID terdaftar | Orang asing tidak bisa pakai |
| Perintah sensitif hanya admin | Teman tak bisa ganti API key/harga |
| Audit log | Semua aksi tercatat |
| Grup privat | Invite only |

**Shortcut CEO:** tombol Telegram di panel CEO membuka `t.me/boss_rc_poster_bot`.

---

# BAGIAN 6 — FITUR & LAYANAN

## 18. Fitur Fase 1 (gratis)
1. Dashboard web + mode Fullscreen
2. 48 karyawan AI
3. Approval flow (Setuju/Revisi/Batal)
4. Kalender konten
5. Log aktivitas
6. Respons komentar & DM
7. Laporan harian & mingguan
8. Mode 24/7
9. Multi-bisnis
10. Pencarian & arsip

## 19. Panel Pengaturan "Full Access"
Semua setting di 1 Sheet: API & Model · Telegram · Google · Brand · Kanal · Gaya · Jadwal · Anggaran · Notifikasi · Keamanan · Tim.

## 20. Modul Layanan UMKM
Ide konten · Caption · Kampanye · Respons komentar/pesan · Desain poster · Video pendek · Email/WA blast · Analisis kompetitor · Strategi harga · **custom request** (palugada).

## 21. Formulir Kebutuhan UMKM

**5 Syarat Wajib:**
1. Identitas usaha
2. Produk & harga
3. Target pasar
4. Tujuan & tenggat
5. Brand & penanggung jawab

**Alur:** isi form → AI cek → tanya balik → rencana → setuju → eksekusi → Setuju/Revisi/Batal.

## 22. Contoh Alur 1 Hari

| Jam | Kegiatan |
|---|---|
| 07:00 | Laporan pagi |
| 08:00 | Nadia ajukan 5 ide konten |
| 09:00 | Dewi bikin caption |
| 10:00 | Gilang siapin jadwal + respons |
| 11:00 | Bima ajukan rencana iklan |
| 14:00 | Dimas bikin konsep video |
| 16:00 | Yoga kirim analisis |
| 19:00 | Bayu kirim laporan keuangan |
| 21:00 | Kirana kirim rekap |
| 22:00 | Arif laporan akhir |

---

# BAGIAN 7 — KANTOR VIRTUAL 3D (FULL VIRTUAL)

## 23. Konsep
Kantor virtual 3D penuh, **bukan MVP**. Dua lantai + eksterior, gaya ruko Indonesia modern. Semua tekstur **prosedural** (tanpa berkas gambar besar) agar ringan.

## 24. Lantai 1 — Work & Play

| Zona | Isi |
|---|---|
| Ruang Strategi | 3 meja kerja + monitor + kursi |
| Ruang Rapat | Meja rapat, 8 kursi, whiteboard, TV, dinding kaca |
| Studio Konten | 3 meja kerja + monitor |
| Musholla | Mihrab, karpet, partisi kisi-kayu, rehal |
| Gym Mini | 2 treadmill, bench, matras yoga |
| Lounge | 2 sofa, meja TV, rak TV, rugs |
| Panggung & Karaoke | Panggung, mic, mesin arcade ×2, meja ping-pong, meja biliar |
| Pantry | Counter, gerobak bakso, sepeda kopi, galon |
| Ruang Klien | 2 meja kerja |
| Kolam Indoor | Kolam + tangga |
| Review Kualitas | 3 meja kerja |

## 25. Lantai 2 — Rest & Recharge

| Zona | Isi |
|---|---|
| Dorm | 8 kasur + lemari + AC |
| Taman Baca & Meditasi | 2 rak buku, 3 bantal lesehan |
| Rooftop Garden | 4 pohon, planter, bangku, string lights |
| Balkon Ruko | 2 kursi rotan, meja, hammock, jemuran, string lights |

## 26. Eksterior
Jalan aspal + garis, trotoar, taman + pohon, lampu jalan, tiang bendera Merah Putih, motor parkir, pagar.

## 27. Dekorasi Khas Indonesia
- Bendera Merah Putih (berkibar, animasi)
- Gerobak bakso
- Sepeda kopi keliling
- Unit AC split dinding
- Panel LED langit-langit
- Kisi-kayu & rak tanaman sebagai partisi

## 28. NPC — Bisa Diklik & Diperintah

| Fitur | Keterangan |
|---|---|
| **Klik NPC** | Muncul kartu detail (avatar, nama, peran, status, tugas) |
| **Perintah teks** | Tulis perintah bebas ke agen terpilih |
| **Tombol cepat** | Laporan · Kerjakan tugas · Istirahat · Rapat |
| **Riwayat chat** | Percakapan tersimpan di kartu |
| **AI nyata** | Dijawab Hermes Agent CLI, bukan skrip |

## 29. Data-Driven (Integritas Status)
Animasi NPC **hanya** muncul bila didukung state tugas nyata:
- `working` → NPC di meja, gelembung "Mengerjakan tugas"
- `thinking` → animasi berpikir
- `meeting` → NPC berjalan ke ruang rapat
- `idle` → NPC di area santai (lounge/pantry/kolam)
- `resting` → NPC di lantai 2 (dorm/balkon)

## 30. Navigasi & Performa

| Fitur | Detail |
|---|---|
| Motion control | Drag putar, scroll zoom, klik kanan/2 jari geser |
| Tombol layar | Reset view, ganti lantai, Tur, Auto, Full, Mode malam |
| Anti-lag | Instanced mesh, frustum culling, DPR limit, merge geometry |
| Kualitas | Auto (turun otomatis bila FPS rendah), Hemat, Maks |
| Tour mode | Kamera berputar otomatis mengelilingi kantor |
| Siklus siang/malam | Lampu & string lights menyala otomatis |

---

# BAGIAN 8 — PANEL CEO & SOSMED

## 31. Panel CEO (6 Shortcut)

| Tombol | Fungsi |
|---|---|
| 📱 Telegram | Buka bot Telegram untuk kontrol jarak jauh |
| ➕ Tugas Baru | Buka formulir tugas |
| ✅ Setujui Semua | Setujui semua draf menunggu |
| 📊 Laporan | Rekap tugas & akun |
| 📢 Broadcast | Pesan ke semua agen |
| 🌙 Shift Malam | Mode 24/7 (lampu malam menyala) |

## 32. Manajemen Akun Sosial

| Platform | Support |
|---|---|
| Instagram, TikTok, YouTube, Facebook, WhatsApp, X, Shopee, Tokopedia | ✅ |

- Tambah akun manual per konsumen (A, B, C, dst)
- AI mendaftarkan akun baru (simulasi + siap API)
- Data tersimpan di localStorage
- Hapus akun dengan konfirmasi

---

# BAGIAN 9 — HERMES TEKNISI (PENJAGA)

## 33. Peran
Hermes Teknisi adalah panel penjaga di dalam kantor virtual:

| Kemampuan | Detail |
|---|---|
| **Diagnosa** | Menangkap error JS, kegagalan muat, kehilangan WebGL |
| **Sumber Daya** | FPS, jumlah agen, lantai aktif, mode malam |
| **Integritas** | Cek hash skrip (deteksi perubahan kode) |
| **Live chat** | Kirim laporan ke Hermes Agent (`window.hermes.send`) |
| **Cybersecurity** | Audit keamanan lokal (hermes-security-audit) |

---

# BAGIAN 10 — INSTALASI

## 34. Installer Sekali Klik

```
kantor-ai-merah-putih\
├── installer\
│   ├── install.bat      ← klik dua kali di PC baru
│   ├── start.bat        ← menjalankan kantor
│   ├── uninstall.bat
│   └── README-INSTALL.md
├── kantor-ai-mvp\       ← aplikasi
├── arsip\               ← data lama (tidak dipakai app)
├── API-KEYS.md
└── RENCANA-MASTER.md
```

**Yang dipasang otomatis:** Node.js LTS (bila belum ada), three.js, pintasan desktop.

---

# BAGIAN 11 — BISNIS

## 35. Model Bisnis & Harga
- **Harga ditentukan BOS**, bukan AI
- Model: paket bulanan · per project · per deliverable · retainer

## 36. Proyek Perdana
- **Gratis/diskon** dengan syarat: testimoni + portofolio + data
- Tujuan: bukti & referensi

## 37. Jalan Upgrade

| Fase | AI | Biaya |
|---|---|---|
| Uji coba | gratis | Rp 0 |
| Semi | + Gemini Pro | ~Rp 100-300rb/bln |
| Pro | model terbaik | sesuai pemakaian |

**Upgrade = ganti config, bukan rebuild.**

## 38. Strategi Biaya (Free Unlimited)

| Opsi | Biaya | Unlimited? | Kualitas |
|---|---|---|---|
| Free tier cloud | Rp 0 | ❌ kuota | tinggi |
| Model lokal (Ollama) | Rp 0 (+listrik) | ✅ | sedang |
| Berbayar | ~Rp 100-300rb/bln | ✅ | tertinggi |

---

# BAGIAN 12 — EKSEKUSI

## 39. Rencana Tahapan

| Tahap | Isi | Estimasi |
|---|---|---|
| 0 | Persiapan (akun, bot, API key) | 1-2 hari |
| 1 | Fondasi (server + config) | 2-3 hari |
| 2 | 48 karyawan + approval flow | 3-5 hari |
| 3 | Fitur marketing | 5-7 hari |
| 4 | Panel pengaturan | 3-5 hari |
| 5 | Monitoring & laporan | 2-3 hari |
| 6 | Konten TikTok | lanjutan |
| 7 | Uji coba & publikasi | 2-3 hari |

**Total ± 3-4 minggu.**

## 40. Anti-Error & QA

| Error | Solusi |
|---|---|
| Rate limit | provider berikutnya |
| API down | fallback + retry |
| Respons invalid | validasi + retry |
| Timeout | batas waktu + fallback |
| Kuota habis | lapor + pindah provider |

**Checklist:** router fallback · validasi input/output · log · approval · mode tes · monitoring · backup.

## 41. Biaya & Risiko

### Biaya

| Item | Biaya |
|---|---|
| Server lokal, Telegram, Sheets, Drive | Rp 0 |
| VPS | Tidak ada |
| **Total Fase 1** | **Rp 0** |
| Mesin AI (listrik) | ~Rp 250-400rb/bln |
| Internet | ~Rp 250-350rb/bln |

### Risiko & solusi

| Risiko | Solusi |
|---|---|
| Kuota harian | tugas dibagi |
| API key bocor | simpan di .env |
| AI salah info | approval bos |
| Bot mati | monitoring |
| Karakter AI berubah | persona di config |

## 42. Delegasi Akses
- **Peran:** Admin (kamu) · Operator (teman) · Viewer
- **Mode "Sakit":** `/sakit` → notifikasi dialihkan ke operator
- **Audit log:** semua aksi tercatat
- **Keamanan:** admin bisa cabut akses kapan saja

---

# BAGIAN 13 — PENUTUP

## 43. Keputusan Final

| Aspek | Keputusan |
|---|---|
| Konsep | 48 karyawan AI |
| CEO | Naga Hitam |
| Arsitektur | Hybrid (lokal + cloud) |
| Kontrol | Browser + Telegram |
| NPC | Bisa diklik & diperintah (AI nyata) |
| Data | Google Sheets |
| Layanan | Jasa marketing UMKM |
| Formulir | Google Form + 5 syarat wajib |
| Harga | Bos yang tentukan |
| Proyek perdana | Gratis/diskon |
| Biaya Fase 1 | Rp 0 |
| Waktu | ± 3-4 minggu |

## 44. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| Karyawan AI aktif | 48 |
| Uptime | 24/7 |
| Tugas selesai/hari | ≥ 10 |
| Kepuasan klien | ≥ 90% |
| UMKM pertama | 1-2 minggu setelah siap |

## 45. Langkah Berikutnya
1. Mulai **Fase 0** (persiapan)
2. Susun **usulan daftar harga**
3. Rancang **Google Form → AI kerjakan**
4. Pilih **5 UMKM calon proyek perdana**
5. Matangkan **konten TikTok**

---

*Dokumen ini adalah rencana matang. Semua keputusan sudah dikunci. Siap dieksekusi kapan pun.*
