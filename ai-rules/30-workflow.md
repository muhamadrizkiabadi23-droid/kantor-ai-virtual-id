---
description: Alur kerja git, commit, push, dan deploy yang aman
alwaysApply: true
---

# Alur Kerja Git & Deploy

## Branch

- Kerja di branch `main` (project ini tunggal pengguna).
- Commit atomic: satu fitur/perbaikan per commit.
- Format pesan commit: `<tipo>: <deskripsi singkat>` — `feat:`, `fix:`,
  `chore:`, `docs:`, `refactor:`.

## Sebelum commit (wajib)

1. `node --check src/*.js server.js` — semua harus lolos.
2. `npm test` — harus 6/6 pass.
3. `git status` — pastikan tidak ada file kredensial atau data pribadi.
4. Jangan commit: `.env`, `users.json`, `API-KEYS.md`, `tunnel.log`,
   `node_modules/`, `vid/`, `hasil/`.

## Remote

- `https://github.com/muhamadrizkiabadi23-droid/kantor-ai-virtual-id.git`
- Push: `git push origin main`.

## Menjalankan & menguji

```bash
cd kantor-ai-merah-putih/kantor-ai-mvp
node server.js          # port 4173
```

- Lokal: `http://127.0.0.1:4173/`
- HP satu WiFi: `start-lan.bat`
- Publik (HP jaringan lain): `start-publik.bat` atau `tunnel-only.bat`

## Tunnel publik

- `tools/cloudflared.exe tunnel --url http://127.0.0.1:4173`
- URL `*.trycloudflare.com` **ephemeral** — berubah tiap proses dijalankan.
  Jangan hardcode URL lama di dokumen; selalu ambil dari log.
- Hanya jalankan **satu** proses cloudflared. Proses menumpuk merusak tunnel.
- Jalankan lewat `terminal(background=true)` atau `nohup ... > /tmp/tunnel.log 2>&1 &`.
  Di git-bash, `start "nama" /min cmd /c ...` gagal dengan
  "system cannot find file \\nama\\".

## Deploy Railway

- `Procfile`: `web: node server.js`
- `railway.json`: healthcheck `/health`, timeout 30.
- Domain gratis: Settings → Networking → Generate Domain
  (`*.up.railway.app`). Domain kustom berbayar tapi opsional.
