# KANTOR AI ID

Kantor virtual 3D untuk tim AI. Repository ini berisi aplikasi, aturan AI
lintas-agent, dan alat bantu deploy.

## Isi repository

| Path | Fungsi |
|------|--------|
| `kantor-ai-mvp/` | Aplikasi utama (Three.js + Node server). Disininya `README.md` lengkap. |
| `ai-rules/` | **Aturan AI lintas-agent** — sumber kebenaran untuk Claude, Cursor, Codex, Gemini, Copilot, AMP, Cline, Roo, Kilocode, Goose, Firebender. |
| `installer/` | Pemasang sekali klik untuk PC baru (`install.bat`). |
| `tools/` | `cloudflared.exe` (tunnel publik) dan `ai-rules.exe` (pembangkit aturan). |
| `RENCANA-MASTER.md` / `.pdf` | Rencana master project. |

## Aturan AI (ai-rules)

Aturan ditulis **satu kali** di `ai-rules/*.md`, lalu dibangkan ke file yang
dipakai tiap agent (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).

```bash
# membangkitkan ulang file aturan setelah mengubah ai-rules/*.md
tools/ai-rules.exe generate

# memeriksa apakah semua file sudah sinkron
tools/ai-rules.exe status
```

- **Jangan mengubah `AGENTS.md`/`CLAUDE.md`/`GEMINI.md` langsung** — ubah
  `ai-rules/*.md` lalu jalankan `generate`.
- File hasil generate **ikut ter-commit** supaya aturan langsung ada di mesin
  mana pun, tanpa harus menjalankan `ai-rules` dulu.
- `ai-rules/.generated-ai-rules/` adalah folder perantara dan diabaikan git.

### Daftar aturan

| File | Isi |
|------|-----|
| `00-project.md` | Identitas, tujuan, batasan utama |
| `10-architecture.md` | Struktur kode, pembagian modul, portabilitas |
| `20-conventions.md` | Konvensi penulisan kode dan akses DOM |
| `30-workflow.md` | Git, commit, push, deploy |
| `40-testing.md` | Cara menjalankan dan menambah tes |
| `50-pitfalls.md` | Jebakan yang sudah pernah terjadi — jangan diulang |

## Menjalankan

```bash
cd kantor-ai-mvp
node server.js          # http://127.0.0.1:4173
```

HP satu WiFi: `start-lan.bat` · HP jaringan lain: `start-publik.bat`
