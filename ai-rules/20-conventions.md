---
description: Konvensi penulisan kode, penamaan, dan akses DOM yang aman
alwaysApply: true
---

# Konvensi Kode

## JavaScript

- IIFE + `"use strict"` di `app.js`. Jangan bikin skrip global.
- Satu gaya kutip: **double quote** untuk string, template literal untuk teks panjang.
- Semua akses DOM **wajib null-safe**. Pola:

```js
// BENAR
const el = document.getElementById("x");
if (el) el.textContent = "aman";

// SALAH — akan melempar error dan merusak handler lain
document.getElementById("x").textContent = "error";
```

- Fungsi yang dipanggil dari HTML/event wajib dicek `typeof` kalau definisinya
  ada di belakang: `if (typeof renderTaskBoard === "function") renderTaskBoard();`
- `localStorage` dibungkus `try/catch` — bisa gagal di `about:blank` atau
  saat izin ditolak.
- Event antar modul memakai `CustomEvent` di `document`
  (`office-state`, `office-area-selected`, `office-agent-arrived`).

## CSS

- Warna/font memakai variabel tema: `var(--foreground)`, `var(--accent)`, dst.
- Semua panel memakai `backdrop-filter: blur(...)`.
- Responsif: breakpoint `768px` untuk mobile. Elemen HUD **tidak boleh**
  meluber di layar 390px — dock 9 tombol harus tetap muat.
- `hidden` attribute harus punya aturan `[hidden] { display: none; }` sendiri
  karena `display` dari class bisa menimpanya.

## Penamaan

- File: `kebab-case` untuk berkas baru, pertahankan nama yang sudah ada.
- Fungsi: `camelCase`. Variabel moda: `UPPER_SNAKE_CASE`.
- Kunci localStorage: `kantor-ai-mvp.tasks.v1`, `kantor.owners.v1`.

## Komentar

- Komentar menjelaskan **kenapa**, bukan **apa**.
- Komentar non-obvious wajib ada di: deteksi software renderer, frustum kamera,
  throttling shadow map, dan sistem PIC.

## Data

- Jangan pernah menampilkan data hasil karangan. Kalau belum ada sumbernya,
  tulis label eksplisit: "contoh lokal", "belum dikonfirmasi", "—".
- `escapeHtml()` wajib dipakai sebelum memasukkan teks ke `innerHTML`.
