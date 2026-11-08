---
description: Struktur kode, pembagian modul, dan aturan portabilitas
alwaysApply: true
---

# Struktur Kode

Root git: `kantor-ai-merah-putih/`. Aplikasi ada di `kantor-ai-merah-putih/kantor-ai-mvp/`.

## Peta modul

| File | Tanggung jawab | Aturan |
|------|----------------|--------|
| `src/workflow.js` | State machine tugas (review → approved → revision → final). Murni, tanpa DOM. | UMD wrapper. Wajib tetap bisa diuji tanpa browser. |
| `src/officeWorld.js` | Geometri dunia: ruangan, meja, dekorasi, `ZONES`, `roomTargets`, `BUILDING`. | Satu-satunya tempat konstanta ukuran fisik. |
| `src/officeAgents.js` | Rig NPC, animasi, pathfinding, gelembung status, sistem aktivitas. | Rig NPC maksimal 6 mesh setelah merge. |
| `src/office3d.js` | Orkestrasi scene Three.js, kamera, kualitas render, `kantorDebug`. | Jangan akses DOM di luar `wireControls`. |
| `src/officeSupport.js` | Panel Hermes Teknisi: tangkap error JS, chat `/api/agent`. | Nol dependency ke modul lain. |
| `src/app.js` | UI workflow, 48 persona, PIC, panel CEO, sosmed, task board. | Semua akses DOM wajib null-safe. |
| `server.js` | Static server + `/api/agent` + `/api/auth` + `/health`. | Wajib bind `127.0.0.1` di lokal, `0.0.0.0` di cloud. |
| `index.html` | Shell app + HUD + importmap. | Importmap menunjuk `./vendor/three/`. |
| `styles.css` | Semua styling. | Variabel tema pakai `var(--…)`. |

## Aturan portabilitas (wajib)

- **Tidak ada path absolut** di kode. Pakai path relatif atau importmap.
- **`node_modules/` dan `vendor/` ikut disalin** saat pindah PC — jangan
  andalkan `npm install` ulang di mesin baru.
- **`node_modules/` tidak boleh di-commit** (sudah di `.gitignore`). `vendor/`
  **wajib di-commit** karena dipakai offline.
- File `.bat` harus jalan lewat `cmd.exe /c "C:\path\panjang.bat"` — di
  git-bash, `cmd //c` dan path slash-miring gagal.

## Importmap (jangan diubah)

```json
{
  "imports": {
    "three": "./vendor/three/three.module.js",
    "three/addons/": "./vendor/three/addons/"
  }
}
```

## Titik masuk

- `login.html` → `login.js` → redirect `/app`
- `index.html` → `src/app.js` (IIFE) → `office-scene-ready`
