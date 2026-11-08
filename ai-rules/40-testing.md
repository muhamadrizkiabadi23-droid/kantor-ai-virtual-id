---
description: Cara menjalankan, menambah, dan menjaga tes tetap hijau
alwaysApply: true
---

# Tes

## Menjalankan

```bash
cd kantor-ai-merah-putih/kantor-ai-mvp
npm test
```

Harus `pass 6 / fail 0`. Kalau gagal, perbaiki **sebelum** lanjut coding.

## Yang diuji

`test/workflow.test.js` — state machine `workflow.js`:
pembuatan tugas, transisi status (approve/revise/finalize/cancel),
batas 2 putaran revisi, dan validasi kolom wajib.

## Menambah tes

- Ikut pola yang ada: `test("nama", () => { ... })` dengan `assert`.
- Satu rantai assertions per perilaku. Jangan menguji detail implementasi internal.
- Tes harus jalan **tanpa browser** dan **tanpa network**.

## Uji manual yang wajib dilakukan setelah mengubah UI

1. Buka lewat tunnel publik, login, pastikan `canvas` tampil dan 48 agen ada.
2. Cek `window.kantorAI` terpasang (`typeof window.kantorAI.picLabel === "function"`).
3. Buat tugas dari panel CEO → pastikan papan tugas menampilkan `PIC: <nama>`
   dan chip PIC di kanan atas menyala.
4. Uji di viewport 390x844 — tidak boleh ada overflow horizontal
   (`document.documentElement.scrollWidth === clientWidth`).
5. Pastikan `node --check` lolos untuk semua file yang diubah.

## Alat bantu

- `window.kantorDebug` (dari `office3d.js`): `sceneStats()`, `rendererInfo()`,
  `fps()`, `agentSystem()`, `world()`, `camera()` — pakai ini untuk verifikasi,
  bukan menebak.
