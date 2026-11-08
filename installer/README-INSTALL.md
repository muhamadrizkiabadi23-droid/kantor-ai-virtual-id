# KANTOR AI ID — Panduan Instalasi

## Kebutuhan sistem
| Item | Minimum |
|---|---|
| OS | Windows 10 / 11 (64-bit) |
| RAM | 4 GB |
| Storage | 500 MB |
| Browser | Chrome / Edge versi baru (WebGL) |
| Node.js | 18+ (installer memasang otomatis bila belum ada) |
| AI backend | Hermes Agent CLI (opsional, tapi sangat disarankan) |

## Cara pemasangan sekali klik
1. Salin **seluruh folder** `kantor-ai-merah-putih` ke PC baru (USB / LAN / cloud).
2. Buka folder `installer`.
3. Klik dua kali **`install.bat`**.
4. Tunggu 5 langkah selesai (folder, salin berkas, Node.js, dependensi, pintasan).
5. Klik pintasan **KANTOR AI ID** di desktop, atau jalankan `start.bat`.

## Yang dipasang otomatis
- **Node.js LTS** — bila belum ada (via winget atau MSI senyap).
- **three.js** — pustaka 3D, dipasang dari npm saat `npm install`.
- **Pintasan desktop** — untuk membuka kantor langsung.
- **Browser** — memakai Chrome/Edge yang sudah ada di sistem.

## Menjalankan
```
installer\start.bat
```
Lalu browser terbuka di `http://127.0.0.1:4173`.

## Memindahkan ke PC lain
Cukup salin folder `kantor-ai-mvp` (aplikasi) — data tugas tersimpan di
`localStorage` browser, jadi pindahkan juga profil browser bila ingin membawa
data lama.

## Penanganan masalah
| Gejala | Solusi |
|---|---|
| Browser terbuka tapi kosong | Pastikan Chrome/Edge, bukan Internet Explorer |
| Port 4173 dipakai | Server otomatis pindah port; lihat alamat di jendela terminal |
| 3D tidak muncul | Cek `chrome://gpu` — aktifkan hardware acceleration |
| NPC tidak menjawab | Pastikan `hermes` CLI terpasang dan bisa dijalankan |

## Wujudkan AI sungguhan (bukan simulasi)
Kantor ini memanggil **Hermes Agent CLI** untuk menjawab perintah NPC.
Pastikan `hermes` ada di `PATH`:
```
hermes -z "tes"
```
Bila perintah di atas menjawab, NPC di kantor akan menjawab dengan AI nyata.
