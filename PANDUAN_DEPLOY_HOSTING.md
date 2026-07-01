# Panduan Deploy ke Hosting Biasa (Shared Hosting / cPanel) Tanpa Node.js
Aplikasi **MPLS SMKN 2 Baleendah** dapat dideploy ke hosting biasa (seperti cPanel, Niagahoster, Hostinger, Rumahweb, dll) yang menggunakan server Apache dan PHP. Anda tidak memerlukan server Node.js aktif di hosting Anda!

Kami telah membuat file **`api.php`** (sebagai pengganti backend Node.js) dan **`.htaccess`** (untuk menangani rute API dan rute navigasi React) agar aplikasi ini bisa berjalan 100% lancar di hosting biasa.

---

## Langkah-Langkah Deploy

### Langkah 1: Build Frontend React Anda
Jalankan perintah build di komputer lokal Anda atau di lingkungan tempat Anda mengerjakan kode untuk mengompilasi kode React menjadi file statis (HTML, CSS, JS):

```bash
npm run build
```

Setelah proses selesai, folder baru bernama **`dist`** akan terbentuk di proyek Anda. Folder `dist` ini berisi semua aset statis web yang siap diunggah.

---

### Langkah 2: Siapkan File Backend PHP
Kami telah menyediakan file **`api.php`** dan **`.htaccess`** di folder root proyek ini. Anda harus menggabungkan kedua file ini dengan hasil kompilasi React Anda:

1. Buka folder hasil kompilasi, yaitu **`dist`**.
2. Salin (copy) file **`api.php`** dari folder root proyek dan tempel (paste) ke dalam folder **`dist`**.
3. Salin (copy) file **`.htaccess`** dari folder root proyek dan tempel (paste) ke dalam folder **`dist`**.

Sekarang, di dalam folder **`dist`** Anda harus memiliki struktur seperti berikut:
```text
dist/
├── assets/ (berisi file js, css, gambar hasil build)
├── index.html
├── api.php
├── .htaccess
└── (file pendukung lainnya...)
```

---

### Langkah 3: Unggah ke Hosting (cPanel / File Manager)
1. Masuk ke cPanel atau panel kontrol hosting Anda.
2. Buka **File Manager** dan masuk ke direktori publik website Anda, biasanya bernama **`public_html`** atau folder subdomain Anda.
3. Unggah (upload) **seluruh isi** dari folder **`dist`** (bukan folder `dist`-nya, melainkan file/folder yang ada di *dalam* folder `dist`) ke direktori tersebut.

---

### Langkah 4: Atur Izin Akses Database (Chmod)
Aplikasi ini menyimpan data secara lokal pada file bernama **`db.json`** yang akan otomatis dibuat saat aplikasi diakses pertama kali melalui `api.php`.

Untuk memastikan server hosting dapat membaca dan menulis data ke file tersebut:
1. Di File Manager cPanel Anda, pastikan izin folder utama (`public_html` atau folder tempat file `api.php` berada) diatur ke **`755`**.
2. Jika file **`db.json`** sudah otomatis terbentuk setelah Anda membuka website, klik kanan pada file `db.json` di File Manager, pilih **Change Permissions**, lalu centang izin tulis (Write) untuk Group/World (atau atur nilainya menjadi **`644`** atau **`666`** jika diperlukan agar server web dapat menulis data).

---

## Keuntungan Metode PHP + .htaccess Ini:
1. **Dukungan Penuh Shared Hosting**: Dapat digunakan di paket hosting paling murah sekalipun karena hanya memerlukan PHP versi 7.4 ke atas (direkomendasikan PHP 8.x) yang sudah aktif secara bawaan.
2. **SPA Router Fallback**: File `.htaccess` dikonfigurasi untuk mencegah error 404 ketika pengguna me-refresh halaman seperti `/peserta` atau `/rekap`. Server akan otomatis mengarahkan ke halaman React utama secara mulus.
3. **Sinkronisasi Google Sheets Tetap Berjalan**: File `api.php` telah diprogram dengan CURL yang mampu menangani pengalihan (redirects) 302 milik Google Apps Script secara otomatis, sehingga fitur **Push/Pull/Sync otomatis** dari Spreadsheet Anda bekerja dengan sempurna!
