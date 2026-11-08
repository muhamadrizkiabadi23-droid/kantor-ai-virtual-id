---
description: Identitas, tujuan, dan batasan utama project KANTOR AI ID
alwaysApply: true
---

# KANTOR AI ID — Identitas Project

Kantor virtual 3D full-screen untuk tim AI. Satu lantai 3x3 (±28x20 m) dengan
9 ruangan, 48 NPC agen, dan alur kerja konten yang bisa di-audit pemilik.

## Tujuan utama

1. **Full virtual, full screen** — pengguna tinggal membuka, melihat NPC, dan
   memberi perintah. Tanpa dasbor MVP, tanpa sidebar yang memakan layar.
2. **NPC hidup** — 48 agen beraktivitas (sholat, makan, ngopi, olahraga,
   renang, nonton, baca, diskusi, santai) saat menganggur, dan **kembali
   bekerja** saat ada tugas masuk.
3. **Perintah dijawab AI sungguhan** — lewat `/api/agent` (Hermes Agent CLI),
   bukan animasi palsu.
4. **Portabel** — folder bisa dipindah ke PC lain dan langsung jalan lewat
   `install.bat`. Tidak ada path absolut yang hardcoded.
5. **Ringan** — target 60 FPS. Draw call dijaga di bawah ~800.

## Batasan yang tidak boleh dilanggar

- **Tidak ada data palsu.** Kalau backend belum ada, sebutkan eksplisit di UI
  ("contoh lokal", "belum dikirim ke klien"). Jangan mengarang angka.
- **Tidak ada kredensial di repo.** API key, token, password wajib
  `[REDACTED]`. File `.env` tidak boleh dibaca, dicetak, atau dikirim.
- **1 tugas = 1 PIC.** Setiap tugas punya satu penanggung jawab (PIC) yang sama
  dari briefing sampai presentasi. PIC disimpan di `localStorage` kunci
  `kantor.owners.v1` dan tidak berubah saat revisi.
- **Aktivitas NPC hanya untuk yang menganggur.** Status `idle`/`resting` saja
  yang boleh diberi aktivitas dekoratif. Begitu tugas masuk, aktivitas berhenti.
- **Three.js dimuat lewat importmap relatif** (`./vendor/three/`). Jangan
  ganti ke CDN — aplikasi harus tetap jalan offline dan saat dipindah PC.

## Bahasa

- UI dan komentar untuk pengguna: **Bahasa Indonesia**.
- Nama teknik, variabel, dan commit: **Bahasa Inggris**.
