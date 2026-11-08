---
description: Jebakan yang sudah pernah merusak project ini — jangan diulang
alwaysApply: true
---

# Jebakan yang Sudah Terjadi

Daftar ini dari kejadian nyata di project ini. Baca sebelum mengubah bagian
yang bersangkutan.

## Build & lingkungan

- **`ai-rules` v1.7.0 tidak bisa dibuild di Windows** — `src/utils/file_utils.rs`
  memakai `std::os::unix::fs` tanpa gate. Patch: beri `#[cfg(unix)]` /
  `#[cfg(windows)]`, dan di Windows coba `symlink_file`/`symlink_dir` lalu
  salin file kalau gagal. Crate ini **tidak ada di crates.io** — harus
  `git clone` + `cargo build --release`.
- **`cargo install` gagal** dengan "could not find ai-rules in registry".
- **`RUSTUP_TOOLCHAIN=stable`** dipakai saat build karena `rust-toolchain.toml`
  meminta 1.92.0 sedangkan yang terpasang 1.97.1.
- **Tidak ada WSL** di mesin ini — solusi Linux-only tidak bisa dipakai.

## Terminal Windows di git-bash

- `cmd //c` dan path slash-miring **gagal**. Pakai
  `cmd.exe /c "C:\path\panjang.bat"`.
- `start "Judul" /min cmd /c ...` gagal: "system cannot find file \\Judul\\".
- `nohup` lewat `terminal(background=true)` bisa exit -1; pakai
  `nohup ... > /tmp/tunnel.log 2>&1 &`.
- Jangan jalankan `sleep`/polling loop di background — jalankan di foreground.

## Server & tunnel

- **`node server.js` lewat `terminal(background=true)` exit code 1** dengan
  "stdin is not a tty". Pakai pembungkus `run-server.bat` via `cmd.exe /c`,
  atau `(PORT=4173 node server.js > /tmp/s.log 2>&1 &)`.
- **`/vendor/three/*` 404** — `server.js` harus punya route `/vendor/`.
- **`schtasks /Create` butuh admin** — pakai folder Startup untuk auto-start.
- **URL trycloudflare ephemeral** — berubah tiap run. Jangan hardcode.
- **Proses cloudflared menumpuk** — `taskkill` semua sebelum mulai baru.

## Browser headless

- **Chrome headless pakai SwiftShader** (software renderer) → scene 3D terlalu
  berat. `office3d.js` harus mendeteksi lewat `WEBGL_debug_renderer_info`
  (regex `/swiftshader|llvmpipe|softpipe|software|basic render/i`) lalu paksa
  `quality = "low"`. Parameter `?quality=low|auto|high` juga tersedia.
- **`resize` tidak otomatis menyala** saat `Emulation.setDeviceMetricsOverride`
  di Chrome headless — perlu `window.dispatchEvent(new Event("resize"))`.
- **`localStorage` lempar SecurityError** di `about:blank` /
  `chrome-error://` — selalu navigate dulu, baru akses `localStorage`.
- **`vision_analyze` sering 429** — verifikasi posisi elemen via
  `getBoundingClientRect()` dan cek overlap secara programatik, jangan
  bergantung ke vision.

## DOM & rendering

- **`getElementById` langsung tanpa null check** merusak semua handler setelahnya
  (error berantai). Semua akses DOM wajib null-safe.
- **`render()` pernah melempar error** karena `metric-total` tidak ada di
  halaman game-mode. Null guard wajib.
- **`roomTargets` kosong** — `Map` dideklarasikan tapi tidak diisi. Isi dari
  `ZONES[1]` di `officeWorld.js`.
- **Frustum kamera terlalu sempit** — pakai `(BUILDING.maxX-BUILDING.minX)/2 + 2`
  dan setara, bukan angka tetap 13.5.
- **Canvas tidak ikut resize** — `resize()` pakai `mount.clientWidth/clientHeight`.
- **`.kbd-hint` menindih legend** — posisikan `bottom: 46px` dan `nowrap`.

## Logika

- **Pencocokan kata kunci PIC** awalnya pakai `String.includes` — "ai" cocok
  dengan "santai"/"kedai". Pakai **batas kata** dengan regex
  `(^|[^a-z0-9])kata([^a-z0-9]|$)`.
- **`renderTaskBoard()` harus dipanggil dari `render()`** dan di akhir alur
  direktur, kalau tidak papan tugas tidak pernah ter-update.
- **Alur direktur awalnya relay sari→raka→dewi→arif** untuk semua tugas —
  membuat pekerjaan berpindah agen. Sekarang 1 tugas = 1 PIC yang tetap.
