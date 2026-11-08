---
description: Pedoman disiplin coding (Karpathy) — berlaku untuk semua perubahan kode
alwaysApply: true
---

# Pedoman Karpathy (Disiplin Coding)

Sumber: `skills/software-development/karpathy-guidelines` (MIT). Berlaku untuk
setiap penulisan, review, atau refactor kode di project ini.

## 1. Pikirkan Sebelum Coding

**Jangan asumsikan. Jangan sembunyikan kebingungan. Tampilkan tradeoff.**

Sebelum implementasi:
- Sebutkan asumsi secara eksplisit. Kalau ragu, tanya.
- Kalau ada beberapa interpretasi, tunjukkan semuanya — jangan pilih diam-diam.
- Kalau ada pendekatan lebih simpel, bilang. Tolak kalau perlu.
- Kalau bingung, berhenti. Sebut apa yang membingungkan. Tanya.

## 2. Kesederhanaan Dulu

**Kode minimum yang memecahkan masalah. Tidak spekulatif.**

- Tidak ada fitur di luar yang diminta.
- Tidak ada abstraksi untuk kode sekali pakai.
- Tidak ada "fleksibilitas" atau "konfigurabilitas" yang tidak diminta.
- Tidak ada error handling untuk skenario mustahil.
- Kalau tulis 200 baris tapi bisa 50, tulis ulang.

Tanya: "Apakah senior engineer bilang ini overcomplicated?" Kalau ya, sederhanakan.

## 3. Perubahan Bedah (Surgical)

**Sentuh hanya yang wajib. Bersihkan hanya kebocoran sendiri.**

Saat edit kode existing:
- Jangan "perbaiki" kode, komentar, atau formatting di sebelah.
- Jangan refactor yang tidak rusak.
- Ikuti gaya existing, walau beda dengan preferensi.
- Kalau lihat dead code tidak berkaitan, sebutkan — jangan hapus.

Saat perubahanmu bikin orphan:
- Hapus import/variabel/fungsi yang **perubahanmu** bikin tak terpakai.
- Jangan hapus dead code existing kecuali diminta.

Uji: Setiap baris berubah harus bisa ditelusuri ke permintaan user.

## 4. Eksekusi Berorientasi Tujuan

**Tetapkan kriteria sukses. Ulangi sampai terverifikasi.**

Ubah tugas imperatif jadi tujuan terverifikasi:
- "Tambah validasi" → "Tulis tes input invalid, lalu loloskan"
- "Perbaiki bug" → "Tulis tes reproduksi, lalu loloskan"
- "Refactor X" → "Pastikan tes lolos sebelum & sesudah"

Untuk multi-step, tulis rencana singkat:
```
1. [Langkah] → verifikasi: [cek]
2. [Langkah] → verifikasi: [cek]
3. [Langkah] → verifikasi: [cek]
```

Kriteria kuat = agent bisa loop mandiri. Kriteria lemah ("buat jalan") butuh clearifikasi terus.

---

**Catatan:** Pedoman ini condong ke **hati-hati daripada cepat**. Untuk tugas trivial
(typo, one-liner jelas), gunakan penilaian — tidak perlu full rigor.

Tujuan: mengurangi kesalahan mahal di kerja non-trivial, bukan memperlambat tugas simpel.