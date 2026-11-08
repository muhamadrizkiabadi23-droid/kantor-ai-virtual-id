---
description: Alat eksternal yang terpasang dan kapan boleh dipakai
alwaysApply: true
---

# Alat Eksternal

## Agent Reach — akses platform (read-only)

`agent-reach` memberi akses baca ke platform yang sulit dijangkau agent:
GitHub, YouTube (metadata + subtitle), Bilibili, V2EX, pencarian web, dan
dapat ditambah: X/Twitter, Reddit, Facebook, Instagram, 小红书, LinkedIn,
BOSS直聘, 雪球, 小宇宙.

```bash
agent-reach channels                        # daftar kanal + tindakan
agent-reach github search "query" --limit 5
agent-reach youtube subtitle <url>
agent-reach read <url>                      # pilih kanal dari URL
```

**Wajib dipatuhi:**

- **Read-only.** Tidak ada post, komentar, like, atau pesan. Kalau pengguna
  meminta menulis/kepada akun, jelaskan batasnya.
- **Jangan pernah login untuk pengguna** dan jangan minta password. Kalau
  `NEED_LOGIN`, suruh pengguna menjalankan `agent-reach login <channel>`
  sendiri di jendela yang dibuka alat.
- **Jangan retry berulang** saat `PLATFORM_BLOCKED`, `RATE_LIMITED`,
  `BUSY`, atau `NEED_LOGIN`. Beri tahu pengguna, hentikan percobaan.
- **Pakai alat bawaan dulu** untuk konten publik. Reach dipakai kalau
  alat bawaan gagal atau kurang lengkap.
- **Sebutkan sumber** (platform + URL) pada hasil, dan bedakan mana yang
  bacaan penuh vs ringkasan/snippet.
- **Jangan pakai untuk menyerang/mengganggu** pihak lain, menarik data pribadi
  yang tidak publik, atau menghindari verifikasi anti-bot.

## ai-rules.exe — aturan lintas-agent

`tools/ai-rules.exe` membangkitkan `AGENTS.md`/`CLAUDE.md`/`GEMINI.md` dari
`ai-rules/*.md`. Lihat `30-workflow.md`.

## cloudflared.exe — tunnel publik

`tools/cloudflared.exe tunnel --url http://127.0.0.1:4173`. Lihat `30-workflow.md`.
