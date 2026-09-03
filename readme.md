# ForTrip — Website Trip & Travel

Aplikasi website Trip & Travel berbasis Laravel, Inertia, dan React. Aplikasi ini dirancang sebagai satu repository untuk dua kebutuhan:

- website publik yang menampilkan informasi bisnis, paket wisata, banner, dan testimonial;
- dashboard admin untuk mengelola konten, customer, booking, invoice, pembayaran, dan laporan.

Konten website disimpan di database sehingga dapat dikelola melalui dashboard tanpa mengubah kode.

## Status Proyek

Update terakhir: **3 September 2026**.

| Area | Status | Catatan |
|---|---|---|
| Setup Laravel + React/Inertia | ✅ Selesai | Project dan development tooling berjalan |
| Database dan migration inti | ✅ Selesai | Tabel bisnis, permission, dan media tersedia |
| Model, relationship, factory, seeder | ✅ Selesai | Data dummy dapat di-seed |
| Role dan permission | ✅ Selesai | Role `admin` dan `staff` |
| Spatie Media Library | ✅ Selesai | Banner, Package, dan Testimonial |
| Wayfinder typed routes | ✅ Selesai | Actions dan routes TypeScript dihasilkan otomatis |
| Site Settings CRUD | ✅ Selesai | Pengaturan identitas, kontak, media sosial, dan hero |
| Banner CRUD | ✅ Selesai | Upload, toggle aktif, dan pengurutan |
| Package CRUD | ✅ Selesai | Cover, gallery, slug, status aktif, dan unggulan |
| Testimonial CRUD | ✅ Selesai | Foto opsional, rating, dan toggle aktif |
| Customer dan Booking | 🟡 Sebagian selesai | CRUD customer dan manajemen booking admin selesai; form publik menunggu halaman package |
| Invoice, Payment, dan PDF | ✅ Selesai | Invoice, histori pembayaran, status otomatis, dan PDF A4 |
| Laporan dan Export Excel | ✅ Selesai | Filter periode, statistik, grafik Recharts, tabel detail, dan XLSX |
| Landing page publik dinamis | ⏳ Belum | — |
| Finalisasi, SEO, dan deployment | ⏳ Belum | Tahap akhir |

Dokumentasi progres yang lebih terperinci tersedia di [`readme.progress.md`](readme.progress.md).

## Stack Teknologi

| Teknologi | Versi | Fungsi |
|---|---|---|
| PHP | 8.5 | Runtime backend |
| Laravel | 13.29 | Framework backend |
| Inertia Laravel | 3.3.1 | Jembatan Laravel dan React |
| React | 19.2.8 | Antarmuka pengguna |
| Tailwind CSS | 4.3.3 | Styling |
| Vite | 8 | Development server dan production build |
| Laravel Fortify | 1.39 | Autentikasi |
| Laravel Wayfinder | 0.1.21 | Typed routes untuk TypeScript |
| Spatie Permission | 8.3.0 | Role dan permission |
| Spatie Media Library | 11.23.5 | Upload dan pengelolaan media |
| Spatie Sluggable | 4.0.3 | Slug otomatis untuk package |
| Laravel DomPDF | 3.1.2 | Pembuatan invoice PDF |
| Laravel Excel | 4.0.2 | Export laporan Excel |
| Recharts | 3.10.1 | Stacked bar chart dan area chart laporan |
| Pest | 5.1.3 | Automated testing |

## Arsitektur

```text
Laravel
├── Controller + Form Request
├── Eloquent + MySQL
├── Inertia.js
│   └── React + TypeScript + Tailwind CSS
├── Spatie Permission
├── Spatie Media Library
├── DomPDF + Laravel Excel
├── Recharts
└── Wayfinder typed routes
```

Struktur frontend utama:

```text
resources/js/
├── actions/          # action controller hasil Wayfinder
├── routes/           # named routes hasil Wayfinder
├── components/       # komponen UI bersama
├── layouts/          # layout aplikasi, auth, dan settings
├── pages/
│   ├── admin/        # dashboard CMS
│   ├── auth/         # login, register, dan pemulihan akun
│   └── settings/     # profile, security, dan appearance
└── types/            # tipe TypeScript bersama
```

## Struktur Database

Tabel utama:

```text
users               # akun admin dan staff
site_settings       # konten dan identitas website
banners             # slide hero homepage
packages            # paket wisata
testimonials        # ulasan pelanggan
customers           # data pelanggan
bookings            # pemesanan paket
invoices            # invoice booking
payments            # histori pembayaran
media               # file Spatie Media Library
roles/permissions   # role dan hak akses
```

Relationship bisnis utama:

```text
Customer hasMany Booking
Booking belongsTo Customer
Booking belongsTo Package
Package hasMany Booking
Booking hasOne Invoice
Invoice belongsTo Booking
Invoice hasMany Payment
Payment belongsTo Invoice
```

## Role dan Permission

### Admin

Admin memiliki akses penuh ke seluruh permission, termasuk:

- mengelola site settings;
- melihat, membuat, mengubah, dan menghapus banner;
- melihat, membuat, mengubah, dan menghapus package;
- melihat, membuat, mengubah, dan menghapus testimonial;
- mengelola customer, booking, invoice, pembayaran, dan laporan.

### Staff

Staff memiliki akses operasional:

- melihat banner, package, dan testimonial;
- melihat, membuat, dan mengubah customer, booking, serta invoice;
- mengunduh invoice dan melihat atau mengekspor laporan.

Staff tidak dapat mengubah konten CMS atau menghapus data.

Semua route admin dilindungi oleh middleware berikut:

```php
middleware(['auth', 'role:admin|staff'])
```

Setiap route resource juga menggunakan permission sesuai action-nya.

## Modul yang Sudah Tersedia

### Site Settings

- Mengelola nama perusahaan, deskripsi, alamat, telepon, dan email.
- Mengelola WhatsApp dan tautan media sosial.
- Mengelola judul dan subjudul hero.
- Hanya dapat diubah oleh admin.

### Banner

- CRUD banner.
- Upload dan penggantian gambar JPEG, PNG, atau WebP maksimal 5 MB.
- Preview gambar dan progres upload.
- Toggle aktif/nonaktif.
- Pengurutan menggunakan drag-and-drop atau tombol panah.
- Media collection `image` dengan thumbnail 400×225.

### Package

- CRUD paket wisata.
- Slug unik otomatis berdasarkan judul.
- Upload dan penggantian cover.
- Upload beberapa gambar gallery.
- Menghapus satu gambar gallery tanpa menghapus package.
- Toggle aktif/nonaktif dan unggulan/biasa.
- Package yang sudah mempunyai booking tidak dapat dihapus.
- Media collection `cover` dan `gallery` dengan konversi `thumb` dan `hero`.

### Testimonial

- CRUD testimonial.
- Foto pelanggan bersifat opsional.
- Preview, upload, dan penggantian foto.
- Rating bintang dengan rentang 1–5.
- Toggle aktif/nonaktif.
- Media collection `photo` dengan konversi avatar 120×120.

### Customer dan Booking

- CRUD customer dengan proteksi data yang sudah mempunyai booking.
- Manajemen booking admin: list, create, detail, edit booking pending, hapus, dan ubah status.
- Total harga dihitung di server berdasarkan harga package × jumlah peserta.
- Workflow status terbatas: `pending → confirmed → completed`, dengan pembatalan dari `pending` atau `confirmed`.
- Form booking publik tetap menunggu halaman detail package.

### Invoice, Payment, dan PDF

- Membuat invoice dari booking non-cancelled dengan nomor otomatis `INV-YYYYMMDD-XXXX`.
- Mencatat dan menghapus histori pembayaran tanpa boleh melebihi sisa tagihan.
- Status invoice otomatis: `unpaid`, `overdue`, atau `paid`.
- Download PDF A4 yang memuat identitas perusahaan, customer, paket, total, sisa tagihan, dan histori pembayaran.
- Invoice dengan histori pembayaran tidak dapat dihapus.

### Laporan dan Export Excel

- Filter periode berdasarkan tanggal mulai dan selesai, dengan default bulan berjalan.
- Statistik total booking, nilai booking non-cancelled, revenue pembayaran berhasil, dan booking per status.
- Stacked `BarChart` untuk tren booking per status dan `AreaChart` untuk tren revenue menggunakan Recharts.
- Granularitas grafik otomatis harian, mingguan, atau bulanan.
- Tabel detail booking dengan pagination dan tautan ke booking/invoice.
- Export XLSX dengan format tanggal/Rupiah, freeze header, auto-filter, dan perlindungan formula injection.

## Route Admin yang Sudah Aktif

```text
GET  /admin/dashboard

GET  /admin/site-settings
PUT  /admin/site-settings

GET/POST           /admin/banners
GET/PUT/DELETE     /admin/banners/{banner}
PATCH              /admin/banners/{banner}/toggle
PUT                /admin/banners/reorder

GET/POST           /admin/packages
GET/PUT/DELETE     /admin/packages/{package}
PATCH              /admin/packages/{package}/toggle-active
PATCH              /admin/packages/{package}/toggle-featured
DELETE             /admin/packages/{package}/gallery/{media}

GET/POST           /admin/testimonials
GET/PUT/DELETE     /admin/testimonials/{testimonial}
PATCH              /admin/testimonials/{testimonial}/toggle

GET/POST           /admin/customers
GET/PUT/DELETE     /admin/customers/{customer}

GET/POST           /admin/bookings
GET/PUT/DELETE     /admin/bookings/{booking}
PATCH              /admin/bookings/{booking}/status

GET                /admin/invoices
GET                /admin/invoices/create
POST               /admin/invoices
GET                /admin/invoices/{invoice}
DELETE             /admin/invoices/{invoice}
GET                /admin/invoices/{invoice}/download
POST               /admin/invoices/{invoice}/payments
DELETE             /admin/invoices/{invoice}/payments/{payment}

GET                /admin/reports
GET                /admin/reports/export
```

Route `create` dan `edit` untuk resource yang mendukung action tersebut juga tersedia.

## Instalasi

### Prasyarat

- PHP 8.5 dengan ekstensi yang dibutuhkan Laravel dan `gd` atau `imagick`;
- Composer;
- Node.js dan npm;
- MySQL 8.

### Menyiapkan project

```bash
git clone <repository-url>
cd fortrip-app

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Sesuaikan koneksi database di `.env`:

```env
APP_NAME="ForTrip"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fortrip
DB_USERNAME=root
DB_PASSWORD=
```

Kemudian siapkan database dan storage:

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan wayfinder:generate --with-form
```

## Menjalankan Development Server

Cara paling ringkas:

```bash
composer run dev
```

Atau jalankan backend dan frontend pada terminal terpisah:

```bash
php artisan serve
npm run dev
```

## Kredensial Development

| Role | Email | Password |
|---|---|---|
| Admin | `admin@travel.com` | `password` |
| Staff | `staff@travel.com` | `password` |

> Kredensial tersebut hanya untuk development. Ganti sebelum aplikasi digunakan di production.

## Quality Checks

```bash
# Seluruh test
php artisan test --compact

# TypeScript
npm run types:check

# Lint dan format frontend
npm run check

# Format PHP
vendor/bin/pint --dirty --format agent

# Production build
npm run build
```

Status verifikasi terakhir:

- 135 test dijalankan: 132 lulus dan 3 dilewati;
- 556 assertion;
- TypeScript, lint file terkait, Pint, dan production build berhasil;
- PHPStan masih terhambat error bootstrap Larastan `LARAVEL_VERSION` pada environment PHP 8.5.

## Roadmap

```text
Site Settings CRUD                    ✅
Banner CRUD                           ✅
Package CRUD                          ✅
Testimonial CRUD                      ✅
Customer + Booking Admin              ✅
Form Booking Publik                   menunggu halaman detail package
Invoice + Payment + PDF               ✅
Laporan + Export Excel + Grafik       ✅
Landing Page Publik Dinamis
Polish UI + SEO + Deployment
```

Tahap selanjutnya adalah membangun **Landing Page Publik Dinamis** dan menghubungkan form booking publik pada halaman detail package.

## Production

Sebelum deployment:

```bash
npm run build
php artisan optimize
```

Pastikan konfigurasi production menggunakan `APP_ENV=production`, `APP_DEBUG=false`, kredensial database yang aman, storage persisten, queue worker bila dibutuhkan, serta web server yang mengarah ke direktori `public`.
