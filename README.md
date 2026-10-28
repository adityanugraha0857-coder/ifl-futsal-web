# IFL Event × Fafage Academy Pontianak

Website event futsal dengan tampilan hitam-emas mengikuti logo yang diberikan. Termasuk halaman publik, jadwal dan hasil pertandingan, kalender event, profil academy, tautan Instagram, kontak panitia yang dapat diubah, dan panel admin dengan autentikasi server.

## Persyaratan
- Node.js 20 atau lebih baru
- npm
- Supabase project untuk PostgreSQL production (opsional untuk mode SQLite lokal)
- VS Code (disarankan)

## Menjalankan di VS Code
1. Ekstrak ZIP, lalu buka folder `ifl-futsal-website` di VS Code.
2. Buka terminal pada folder proyek.
3. Install dependensi:
   ```bash
   npm install
   ```
4. Salin `.env.example` menjadi `.env`.
   - Windows CMD: `copy .env.example .env`
   - PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
5. Edit `.env`. Ganti `SESSION_SECRET` dengan string acak minimal 32 karakter. Isi `ADMIN_USERNAME` dan `ADMIN_PASSWORD` dengan akun milik Anda. Jangan gunakan password contoh atau membagikan file `.env`. Password harus minimal 12 karakter. Untuk tetap memakai SQLite lokal, biarkan `DATABASE_URL` kosong.
6. Siapkan akun admin:
   ```bash
   npm run init-admin
   ```
   Jika `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di `.env` telah diisi, skrip akan menggunakannya. Perintah ini membuat atau memperbarui hash password akun tersebut.
7. Jalankan server:
   ```bash
   npm start
   ```
8. Buka `http://localhost:3000` untuk website dan `http://localhost:3000/admin` untuk panel admin.

Tanpa `DATABASE_URL`, database SQLite lokal dibuat otomatis di folder `data/` dan sesi login hanya bertahan selama proses berjalan. Jika `DATABASE_URL` diisi, data aplikasi dan sesi login memakai Supabase PostgreSQL.

## Fitur panel admin
- Login menggunakan username dan password yang diverifikasi server dengan bcrypt.
- Membuat, mengedit, dan menghapus event.
- Membuat, mengedit, dan menghapus jadwal pertandingan.
- Mengisi atau mengosongkan skor; skor yang diisi akan tampil pada bagian hasil.
- Mengatur status pertandingan, babak/grup, lapangan, event terkait.
- Mengubah kontak WhatsApp, email, lokasi dan deskripsi.
- Mengganti password admin.
- Batas percobaan login, hash password bcrypt, cookie sesi HttpOnly/SameSite, validasi Origin pada permintaan perubahan data, dan sesi persisten di PostgreSQL saat memakai Supabase.
- Database disimpan di server; API penambahan, perubahan, dan penghapusan memerlukan sesi admin yang valid.

## Sebelum dipublikasikan ke internet
- Wajib gunakan HTTPS dan set `NODE_ENV=production`.
- Wajib ganti `SESSION_SECRET` dari contoh dengan nilai acak yang kuat.
- Gunakan password unik; jangan commit file `.env` atau folder `data/` ke Git.
- Atur backup rutin sesuai provider database. Untuk Supabase, tinjau jadwal dan retensi backup proyek; ekspor salinan terpisah secara berkala.
- Gunakan hosting yang mendukung Node.js. Hosting statis biasa tidak dapat menjalankan panel admin ini.
- Periksa kebijakan keamanan, backup, dan pemulihan sebelum menerima data penting.
- Production wajib menggunakan `DATABASE_URL`; aplikasi menolak memakai SQLite ephemeral di production.

## Catatan kontak
Nomor WhatsApp belum diisi karena belum diberikan. Login ke `/admin`, pilih **Kontak & Profil**, isi nomor dengan format internasional angka, misalnya `62812...` (tanpa spasi). Tautan Instagram IFL Event dan Fafage Academy sudah terpasang.

## Struktur
```text
ifl-futsal-website/
├── server.js
├── package.json
├── .env.example
├── scripts/
│   ├── create-admin.js
│   ├── migrate-sqlite-to-postgres.js
│   └── backup-db.js
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── styles.css
│   ├── app.js
│   ├── admin.js
│   └── assets/
│       ├── ifl-event-logo.jpeg
│       └── fafage-academy-logo.jpeg
└── data/                 # dibuat otomatis, jangan commit
```

## Penting tentang keamanan dan data
- Jangan publikasikan versi HTML yang menyimpan password admin di JavaScript; gunakan server ini untuk panel admin.
- Gunakan hosting Node.js dengan HTTPS dan database terkelola seperti Supabase.
- Jangan unggah `.env`, `data/`, atau backup database ke repositori publik.
- Backup di folder yang sama bukan perlindungan jika server/hosting hilang; unduh/salin backup secara rutin ke lokasi terpisah.

## Troubleshooting
- Jika port 3000 dipakai aplikasi lain, ubah `PORT` pada `.env`.
- Jika tidak bisa login, jalankan `npm run init-admin` setelah memastikan kredensial pada `.env` benar.
- Jika koneksi Supabase gagal, cek `DATABASE_URL` dari menu **Connect** Supabase (pilih Session pooler untuk server Node yang berjalan lama), pastikan password database sudah URL-encoded, dan jangan tempel connection string ke chat atau commit ke Git.
- Jika data tidak muncul, periksa terminal server dan pastikan membuka website melalui `http://localhost:3000`, bukan dengan membuka file HTML langsung.


## Folder `docs/` (mirror GitHub Pages)
Folder `docs/` adalah salinan statis untuk GitHub Pages (workflow `pages.yml`) dengan path relatif. Setelah mengubah `public/index.html`, `public/app.js`, atau `public/styles.css`, salin perubahannya ke `docs/` dan sesuaikan path absolut (`/...`) menjadi relatif. `docs/admin.html` sengaja hanya berisi halaman info — panel admin asli hanya berjalan di server Node.js (`/admin`).

## Menghubungkan Supabase dan deploy ke Render

1. Unggah isi folder proyek ini ke root repositori GitHub (jangan unggah `.env`, `data/`, atau `node_modules/`).
2. Buat **Web Service** dari repositori tersebut di Render. Build command: `npm install`; Start command: `npm start`.
3. Di Supabase, buka **Connect**, salin connection string PostgreSQL untuk **Session pooler**, lalu simpan sebagai secret `DATABASE_URL` di Render. Jangan gunakan `service_role` key: aplikasi terhubung langsung ke PostgreSQL.
4. Atur environment variables di Render: `NODE_ENV=production`, `DATABASE_URL`, `SESSION_SECRET` (acak minimal 32 karakter), `ADMIN_USERNAME`, dan `ADMIN_PASSWORD` (unik, minimal 12 karakter). Jangan menaruh secret di GitHub.
5. Deploy. Aplikasi membuat tabel `admins`, `events`, `matches`, `settings`, dan `sessions` saat startup. Website utama ada di `/` dan panel admin di `/admin`.

Sebelum menerima data penting, atur backup Supabase dan uji pemulihannya. GitHub Pages hanya menayangkan versi statis; login admin tidak berjalan di Pages.

### Migrasi data SQLite lokal yang sudah ada

Sebelum aplikasi production pertama kali membuat data di Supabase, isi `DATABASE_URL` secara lokal pada `.env`, lalu jalankan:

```bash
npm run migrate:postgres
```

Skrip menyalin admin, event, pertandingan, dan pengaturan dari `data/ifl-events.sqlite` ke tabel Supabase yang masih kosong; sesi login tidak dipindahkan. Migrasi dibatalkan bila tabel tujuan berisi data agar tidak menimpa data yang sudah ada. Setelah migrasi berhasil, set environment variables Render dan deploy aplikasi.
