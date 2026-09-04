# Progress Project Website Trip & Travel (Laravel + Inertia + React + MySQL)

## Deskripsi

Saya adalah seorang owner bisnis Trip & Travel liburan. Saya ingin membuat website yang mengiklankan dan memperkenalkan bisnis saya. Lalu saya juga ingin agar website tersebut tetap dinamis dan dapat diubah oleh admin melalui dashboard manajemen website. Jadi seluruh konten mulai dari gambar, teks, dll dapat dikelola sendiri tanpa harus merubah code atau koding lagi. Selain itu, di dashboard tersebut saya juga ingin membuat list customer yang telah melakukan booking, membuat invoice, serta laporan periodic pemesanan yang dapat di export ke excel. Untuk framework yang saya gunakan saya ingin menggunakan laravel sebagai backend dan mysql untuk database. Untuk frontend landing page (publik) saya berencana menggunakan react. Gunakan laravel starter kit yang sudah menyediakan Inertia, authentication, Vite, Tailwind, dan struktur frontend yang diperlukan.

---

## Status Progress — Update 3 September 2026

### Ringkasan Status

| Area | Status | Catatan |
|---|---|---|
| Setup project Laravel + React/Inertia | ✅ Selesai | Project berjalan, Artisan/Tinker aktif |
| Konfigurasi database MySQL | ✅ Selesai | Migration berjalan, koneksi aktif |
| Migration tabel inti | ✅ Selesai | 8 tabel inti + tabel permission & media |
| Model Eloquent | ✅ Selesai | 8 model inti tersedia |
| Relationship Eloquent | ✅ Selesai | Customer → Booking → Package → Invoice → Payment |
| Factory & Seeder | ✅ Selesai | Data dummy berhasil di-seed |
| Role & Permission (Spatie) | ✅ Selesai | Role admin & staff, 28 & 15 permissions |
| User admin & staff | ✅ Selesai | admin@travel.com & staff@travel.com |
| Middleware route admin | ✅ Selesai | `auth + role:admin\|staff` |
| Spatie Media Library | ✅ Selesai | Banner, Package, Testimonial dikonfigurasi |
| Wayfinder (typed routes) | ✅ Selesai | Actions & routes TypeScript ter-generate |
| Route publik & auth | ✅ Selesai | `/`, `/login`, `/register`, `/dashboard`, settings |
| Development & production build | ✅ Selesai | Vite dev server dan `npm run build` berjalan tanpa error |
| Site Settings CRUD | ✅ Selesai | Edit/update, permission admin, validasi, UI React, dan test tersedia |
| Banner CRUD | ✅ Selesai | CRUD, upload gambar, toggle aktif, dan drag-and-drop reorder tersedia |
| Package CRUD | ✅ Selesai | CRUD, cover/gallery, slug otomatis, toggle aktif/unggulan, dan test tersedia |
| Testimonial CRUD | ✅ Selesai | CRUD, foto opsional, rating bintang, toggle aktif, dan test tersedia |
| Customer & Booking module | 🟡 Sebagian selesai | Modul admin selesai dan halaman detail package tersedia; form booking publik belum dibuat |
| Invoice + Payment + PDF | ✅ Selesai | Generate invoice, histori pembayaran, status otomatis, dan PDF A4 |
| Laporan + Export Excel | ✅ Selesai | Filter periode, statistik, grafik Recharts, tabel detail, dan export XLSX |
| Landing page publik dinamis | 🟡 Sebagian selesai | Home serta daftar/detail paket selesai; booking publik, About, Contact, dan QA visual menunggu tahap berikutnya |
| Polish UI, SEO, deployment | ⏳ Belum | Tahap akhir |

---

## Yang Sudah Dikerjakan (Detail)

### 1. Setup Project & Infrastruktur

- Project Laravel 13 + starter kit React/Inertia sudah berjalan
- Stack: PHP 8.5, Laravel 13.29, Inertia v3, React 19, Tailwind v4, Vite 8, MySQL
- File `.env` dikonfigurasi untuk database MySQL
- `npm run dev` berjalan tanpa error setelah Wayfinder di-generate

### 2. Database & Migration

Semua tabel berikut sudah di-migrate ke database:

```
users               — admin/staff login
site_settings       — key-value konten dinamis
banners             — slide hero homepage
packages            — paket wisata
testimonials        — testimoni pelanggan
customers           — data pelanggan
bookings            — pemesanan paket
invoices            — invoice per booking
payments            — histori pembayaran
media               — Spatie Media Library (gambar upload)
roles / permissions — Spatie Permission (role & akses)
```

### 3. Model Eloquent & Relationship

Model yang tersedia di `app/Models/`:

```
User.php          — dengan trait HasRoles (Spatie Permission)
SiteSetting.php
Banner.php        — dengan HasMedia (Spatie Media Library)
Package.php       — dengan HasMedia
Testimonial.php   — dengan HasMedia
Customer.php
Booking.php
Invoice.php
Payment.php
```

Relasi yang sudah dibuat:

```
Customer  hasMany   Booking
Booking   belongsTo Customer
Booking   belongsTo Package
Package   hasMany   Booking
Booking   hasOne    Invoice
Invoice   belongsTo Booking
Invoice   hasMany   Payment
Payment   belongsTo Invoice
```

### 4. Role & Permission (Spatie Laravel Permission v8)

Dua role sudah dibuat dan di-seed:

**admin** — 28 permissions (akses penuh):
- manage site settings
- view/create/edit/delete: banners, packages, testimonials, customers, bookings, invoices
- download invoices, view/export reports

**staff** — 15 permissions (akses operasional):
- view banners, packages, testimonials
- view/create/edit: customers, bookings, invoices
- download invoices, view/export reports
- Tidak bisa: manage site settings, delete data apapun, create/edit packages/banners/testimonials

User yang sudah dibuat via `RoleAndPermissionSeeder`:

| Email | Password | Role |
|---|---|---|
| admin@travel.com | password | admin |
| staff@travel.com | password | staff |

Middleware yang sudah didaftarkan di `bootstrap/app.php`:

```php
'role'               => RoleMiddleware::class
'permission'         => PermissionMiddleware::class
'role_or_permission' => RoleOrPermissionMiddleware::class
```

Semua route admin dilindungi dengan `middleware(['auth', 'role:admin|staff'])`.

### 5. Spatie Media Library (v11)

Tiga model sudah dikonfigurasi dengan media collections dan konversi otomatis:

| Model | Collection | Type | Konversi |
|---|---|---|---|
| Banner | `image` | single file | `thumb` — 400×225 px |
| Package | `cover` | single file | `thumb` — 600×400 px, `hero` — 1200×675 px |
| Package | `gallery` | multiple files | `thumb` — 600×400 px |
| Testimonial | `photo` | single file | `avatar` — 120×120 px |

Cara upload di controller nanti:

```php
// Upload
$banner->addMediaFromRequest('image')->toMediaCollection('image');

// Ambil URL
$banner->getFirstMediaUrl('image');          // original
$banner->getFirstMediaUrl('image', 'thumb'); // thumbnail
```

Storage link sudah dibuat: `public/storage` → `storage/app/public`

### 6. Routing

Route yang sudah aktif:

```
GET  /                      → home (Welcome page)
GET  /dashboard             → dashboard (auth)
GET  /login                 → Fortify login
POST /login
POST /logout
GET  /register              → Fortify register
POST /register
GET  /forgot-password
POST /forgot-password
GET  /reset-password/{token}
GET  /email/verify
GET  /settings/profile      → profile.edit (auth)
PATCH /settings/profile
DELETE /settings/profile
GET  /settings/security     → security.edit (auth + verified)
PUT  /settings/password
GET  /settings/appearance
GET  /admin/dashboard       → admin.dashboard (auth + role:admin|staff)
GET  /admin/site-settings   → admin.site-settings.edit (admin + permission)
PUT  /admin/site-settings   → admin.site-settings.update (admin + permission)
GET  /admin/banners         → admin.banners.index (admin/staff + permission)
POST /admin/banners         → admin.banners.store (admin + permission)
PUT  /admin/banners/reorder → admin.banners.reorder (admin + permission)
PATCH /admin/banners/{id}/toggle → admin.banners.toggle (admin + permission)
GET/PUT/DELETE /admin/banners/{id} → edit/update/destroy sesuai permission
GET  /admin/packages        → admin.packages.index (admin/staff + permission)
POST /admin/packages        → admin.packages.store (admin + permission)
PATCH /admin/packages/{id}/toggle-active   → toggle status aktif
PATCH /admin/packages/{id}/toggle-featured → toggle paket unggulan
DELETE /admin/packages/{id}/gallery/{media} → hapus satu gambar gallery
GET/PUT/DELETE /admin/packages/{id} → edit/update/destroy sesuai permission
GET  /admin/testimonials        → admin.testimonials.index (admin/staff + permission)
POST /admin/testimonials        → admin.testimonials.store (admin + permission)
PATCH /admin/testimonials/{id}/toggle → toggle status aktif
GET/PUT/DELETE /admin/testimonials/{id} → edit/update/destroy sesuai permission
GET/POST           /admin/customers
GET/PUT/DELETE     /admin/customers/{id}
GET/POST           /admin/bookings
GET/PUT/DELETE     /admin/bookings/{id}
PATCH              /admin/bookings/{id}/status
GET/POST           /admin/invoices
GET                /admin/invoices/create
GET/DELETE         /admin/invoices/{invoice}
GET                /admin/invoices/{invoice}/download
POST               /admin/invoices/{invoice}/payments
DELETE             /admin/invoices/{invoice}/payments/{payment}
GET                /admin/reports
GET                /admin/reports/export
```

---

## Yang Belum Dikerjakan — Roadmap Selanjutnya

### Urutan Pengerjaan yang Disarankan

```
① Site Settings CRUD ✅
      │
      ▼
② Banner CRUD (dengan upload gambar) ✅
      │
      ▼
③ Package CRUD (dengan upload cover & gallery) ✅
      │
      ▼
④ Testimonial CRUD (dengan upload foto) ✅
      │
      ▼
⑤ Customer + Booking module (admin) ✅
      │
      ▼
⑥ Invoice + Payment + Generate PDF ✅
      │
      ▼
⑦ Laporan + Export Excel + Grafik Recharts ✅
      │
      ▼
POSISI SAAT INI
      │
      ▼
⑧ Landing Page Publik Dinamis
      │
      ▼
⑨ Polish UI + SEO + Deploy
```

---

### ① Site Settings CRUD

Halaman admin untuk mengelola pengaturan situs secara key-value sudah selesai.

Yang sudah dibuat:
- `SiteSettingController` dengan action `edit` dan `update`
- Route `GET/PUT /admin/site-settings` dengan permission `manage site settings`
- Form Request untuk authorization dan validasi whitelist field
- Halaman React `resources/js/pages/admin/site-settings.tsx`
- Pengelolaan identitas perusahaan, kontak, media sosial, serta hero title/subtitle
- Navigasi admin berbasis permission, flash toast, Wayfinder typed actions, dan feature test

### ② Banner CRUD

Kelola slide hero homepage sudah selesai.

Yang sudah dibuat:
- `BannerController` resource untuk index, create, store, edit, update, dan destroy
- Route resource `/admin/banners` dengan permission per action
- Upload dan replacement gambar melalui Spatie Media Library collection `image`
- Halaman React index, create, edit, preview upload, serta upload progress
- Toggle aktif/nonaktif dan pengurutan global dengan drag-and-drop atau tombol panah
- Validasi JPEG/PNG/WebP maksimal 5 MB, URL tombol aman, authorization, dan feature test

### ③ Package CRUD

Kelola paket wisata sudah selesai.

Yang sudah dibuat:
- `PackageController` resource untuk index, create, store, edit, update, dan destroy
- Route resource `/admin/packages` dengan permission per action
- Upload/replacement cover dan multiple gallery melalui Spatie Media Library
- Penghapusan satu gambar gallery tanpa menghapus package
- Slug unik otomatis dari judul melalui Spatie Sluggable
- Halaman React index berbentuk card, create/edit form, preview gambar, dan upload progress
- Toggle aktif/nonaktif serta unggulan/biasa
- Validasi data dan JPEG/PNG/WebP maksimal 5 MB, authorization, dan feature test
- Package yang sudah mempunyai booking dilindungi agar tidak terhapus

### ④ Testimonial CRUD

Kelola testimoni pelanggan sudah selesai.

Yang sudah dibuat:
- `TestimonialController` resource untuk index, create, store, edit, update, dan destroy
- Route resource `/admin/testimonials` dengan permission per action
- Upload foto opsional dan replacement melalui Spatie Media Library collection `photo`
- Konversi avatar 120×120 px untuk tampilan card
- Halaman React index, create/edit form, preview foto, dan upload progress
- Input rating bintang interaktif dengan validasi 1–5
- Toggle aktif/nonaktif, authorization admin/staff, dan feature test

### ⑤ Customer & Booking Module

Yang sudah dibuat:
- `CustomerController` dengan CRUD data pelanggan dan proteksi customer yang sudah mempunyai booking
- `BookingController` dengan list, create, detail, edit booking pending, hapus, dan ubah status
- Form Request dengan authorization berbasis permission serta validasi tanggal keberangkatan dan jumlah peserta
- Perhitungan `total_price` di server berdasarkan harga package × jumlah peserta; nilai total/status dari request tidak dipercaya
- Alur status terbatas: `pending → confirmed → completed`, dengan pembatalan dari `pending` atau `confirmed`
- Halaman React admin untuk customer dan booking, navigasi berbasis permission, serta Wayfinder typed routes
- Feature test untuk akses admin/staff, validasi, kalkulasi harga, transisi status, dan perlindungan penghapusan

Yang masih perlu dibuat:
- Form booking publik di halaman detail package (dikerjakan bersama landing page publik dinamis)
- Notifikasi email saat booking dikonfirmasi (opsional)

### ⑥ Invoice + Payment + PDF

Fitur invoice, pembayaran, dan PDF sudah selesai.

Yang sudah dibuat:
- `InvoiceController` untuk daftar, membuat, melihat, menghapus, dan mengunduh invoice
- Nomor invoice otomatis dengan format `INV-YYYYMMDD-XXXX`
- `PaymentController` untuk mencatat dan menghapus histori pembayaran
- Validasi pembayaran agar tidak melebihi sisa tagihan
- Status invoice otomatis: `unpaid`, `overdue`, dan `paid`
- Generate dan download PDF A4 menggunakan `barryvdh/laravel-dompdf`
- Blade view `resources/views/pdf/invoice.blade.php` untuk identitas perusahaan, customer, paket, total, dan histori pembayaran
- Transaksi dan `lockForUpdate()` untuk mencegah duplikasi invoice dan race condition pembayaran
- Halaman React daftar, create, dan detail invoice
- Feature test untuk authorization, validasi, pembayaran, status invoice, dan PDF

### ⑦ Laporan & Export Excel

Fitur laporan dan export Excel sudah selesai.

Yang sudah dibuat:
- `ReportController` untuk halaman ringkasan dan download laporan
- Filter tanggal mulai dan selesai dengan default bulan berjalan
- Statistik total booking, nilai booking non-cancelled, total revenue pembayaran `paid`, dan booking per status
- Tabel detail booking dengan pagination serta tautan ke booking dan invoice
- Stacked `BarChart` untuk tren booking per status dan `AreaChart` untuk tren revenue menggunakan Recharts
- Granularitas grafik otomatis: harian untuk maksimal 31 hari, mingguan untuk 32–180 hari, dan bulanan untuk periode lebih panjang
- `BookingsExport` dengan filter periode, format tanggal/Rupiah, freeze header, auto-filter, dan perlindungan formula injection
- Permission terpisah `view reports` dan `export reports`
- Feature test untuk filter, statistik, grafik, authorization, dan workbook XLSX nyata

### ⑧ Landing Page Publik Dinamis

Semua konten diambil dari database (dikelola admin via CMS).

Yang sudah dibuat:
- `HomeController` publik dengan site settings, banner aktif, paket unggulan aktif, dan testimoni aktif
- `PublicLayout` dengan navbar responsif, mobile navigation, footer, kontak, media sosial, dan CTA WhatsApp
- Home dinamis dengan hero carousel, fallback hero, Tentang Kami, paket unggulan, testimoni, CTA, dan empty state
- Pengaturan copy Home serta SEO ditambahkan ke Site Settings admin
- TypeScript contract untuk data publik dan Wayfinder route Home
- SEO Home menggunakan `<Head>` Inertia dengan title, description, dan Open Graph dasar
- Feature test Home dan Site Settings, lint/type check frontend, PHPStan terarah, serta production build berhasil
- Backend paket publik dengan pagination, detail berdasarkan slug, media gallery, SEO props, dan proteksi paket nonaktif
- Feature test backend daftar/detail paket dan helper route Wayfinder telah tersedia
- Halaman React daftar paket dengan grid responsif, pagination, empty state, dan metadata SEO
- Halaman React detail paket dengan cover hero, deskripsi aman, galeri, CTA WhatsApp, dan metadata SEO
- Setiap kartu paket terhubung ke halaman detail melalui route Wayfinder
- Full test suite berhasil: 140 test lolos, 3 dilewati, dan 712 assertion

Yang masih perlu dibuat:
- Form booking publik pada halaman detail paket
- Halaman Tentang Kami dan Kontak mandiri
- SEO teknis lanjutan, error pages, serta QA visual lintas perangkat/browser

### ⑨ Finalisasi

- Polish UI & responsive testing
- Validasi & authorization review menyeluruh
- Error handling (404, 403, 500)
- Optimasi query (eager loading, pagination)
- Build production: `npm run build`
- Deploy ke server / Laravel Cloud

---

## Arsitektur Ringkas

```
Laravel (Backend + Controller)
 ├─ Inertia.js  → jembatan Laravel & React (tanpa REST API terpisah)
 ├─ MySQL       → database
 └─ resources/js
     ├─ pages/auth/        → halaman login, register, reset password
     ├─ pages/settings/    → profile, security, appearance
     ├─ pages/admin/       → dashboard CMS, customer, booking, invoice, dan laporan
     ├─ pages/             → welcome, dashboard
     ├─ layouts/           → auth layout, app layout, settings layout
     └─ components/        → komponen UI shared
```

---

## Package yang Digunakan

| Package | Versi | Fungsi |
|---|---|---|
| laravel/framework | 13.29 | Backend utama |
| inertiajs/inertia-laravel | 3.3.1 | Jembatan Laravel-React |
| @inertiajs/react | 3.7.0 | Inertia client React |
| laravel/fortify | 1.39 | Autentikasi (login, register, 2FA) |
| spatie/laravel-permission | 8.3.0 | Role & permission |
| spatie/laravel-medialibrary | 11.23.5 | Upload & manajemen file/gambar |
| spatie/laravel-sluggable | 4.0.3 | Slug otomatis untuk paket wisata |
| barryvdh/laravel-dompdf | 3.1.2 | Generate PDF invoice |
| maatwebsite/excel | 4.0.2 | Export laporan ke Excel |
| react | 19.2.8 | Frontend UI |
| recharts | 3.10.1 | Grafik laporan booking dan revenue |
| tailwindcss | 4.3.3 | Styling |
| laravel/wayfinder | 0.1.21 | TypeScript typed routes |

---

## Kredensial Development

| Akses | Email | Password |
|---|---|---|
| Admin | admin@travel.com | password |
| Staff | staff@travel.com | password |

> **Catatan:** Kredensial ini hanya untuk environment development. Ganti sebelum deploy ke production.

---

## Menjalankan Project

```bash
# Clone & install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate
php artisan db:seed

# Generate Wayfinder routes
php artisan wayfinder:generate

# Jalankan dev server (dua terminal)
php artisan serve
npm run dev
```
