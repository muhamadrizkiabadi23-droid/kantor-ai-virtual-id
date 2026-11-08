# API Key & Kredensial — Kantor AI Merah Putih

> **Aturan utama:** jangan pernah menempelkan key asli ke chat, email, atau dokumen
> yang dibagikan. Simpan hanya di file `.env` lokal yang **tidak** masuk git.

## Key yang dipakai

| Key | Provider | Fungsi | Gratis? | Diambil dari |
|---|---|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter | Model AI cadangan (flash, flint, lightning, ultra) | Ya (free tier) | openrouter.ai/keys |
| `GEMINI_API_KEY` | Google AI Studio | Model Gemini (flash/preview) | Ya (free tier) | aistudio.google.com/apikey |
| `NVIDIA_API_KEY` | NVIDIA NIM | Model Nemotron (ultra/nano) | Ya (free tier) | build.nvidia.com |
| `GROQ_API_KEY` | Groq | Model cepat (cadangan) | Ya (free tier) | console.groq.com |
| `TRIPO_API_KEY` | Tripo 3D | Model 3D untuk aset kantor | Ya (free tier) | tripo3d.ai |
| `ELEVENLABS_API_KEY` | ElevenLabs | Musik & sound effect untuk video | Ya (free tier) | elevenlabs.io |
| `QWEN_API_KEY` | Alibaba DashScope | Video generation (HappyHorse) | Ya (free tier) | dashscope.aliyun.com |
| `BRAVE_API_KEY` | Brave Search | Pencarian web untuk riset | Ya (free tier) | brave.com/search/api |
| `TELEGRAM_BOT_TOKEN` | BotFather | Kontrol kantor via Telegram | Ya | @BotFather |

## Cara mengisi

### Opsi A — otomatis (bila Hermes Agent sudah terpasang)
Hermes Agent menyimpan key di `%LOCALAPPDATA%\hermes\.env`.
Instaler dan server membaca dari sana, jadi **tidak perlu mengetik ulang**.

### Opsi B — manual
1. Salin berkas `.env.example` menjadi `.env` di folder `kantor-ai-mvp`.
2. Isi key yang kamu punya:
   ```
   OPENROUTER_API_KEY=sk-or-...
   GEMINI_API_KEY=AIza...
   NVIDIA_API_KEY=...
   ```
3. Simpan. Server membaca otomatis saat restart.

## Keamanan
- `.env` sudah diabaikan git (lihat `.gitignore`).
- Jangan pernah menampilkan isi `.env` ke layar atau chat.
- Bila key bocor: revoked di halaman provider, buat key baru.
- Server hanya berjalan di `127.0.0.1` — tidak bisa diakses dari internet.

## Belum punya key?
Kantor tetap berjalan **tanpa key** untuk fitur lokal (tugas, workflow,
approval, sosmed, 3D). Yang memerlukan key hanya jawaban AI dan generate
media. Agen akan membalas dengan jawaban lokal bila backend AI tidak tersedia.
