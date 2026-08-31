# Setup Project Website Trip & Travel (Laravel + Inertia + React + MySQL)

## Deskripsi

Saya adalah seorang owner bisnis Trip & Travel liburan. Saya ingin membuat website yang mengiklankan dan memperkenalkan bisnis saya. Lalu saya juga ingin agar website tersebut tetap dinamis dan dapat diubah oleh admin memlaui dashboard manajemen website. Jadi seluruh konten mulai dari gambar, teks, dll dapat dikelola sendiri tanpa harus merubah code atau koding lagi. Selain itu, di dashboard tersebut saya juga ingin membuat list customer yang telah melakukan booking, membuat invoice, serta laporan periodic pemesanan yang dapat di export ke excel. Untuk framework yang saya gunakan saya ingin menggunakan laravel sebagai backend dan mysql untuk database. Untuk frontend landing page (publik) saya berencana menggunakan react. Gunakan laravel starter kit yang sudah menyediakan Inertia, authentication, Vite, Tailwind, dan struktur frontend yang diperlukan


## Status Progress Project — Update 31 Agustus 2026

> Bagian ini mencatat progres aktual yang sudah dikerjakan berdasarkan pengerjaan project sampai saat ini.

### Ringkasan Status

| Area | Status | Catatan |
|---|---|---|
| Setup project Laravel + React/Inertia | ✅ Sudah | Project `travel-app` sudah berjalan dan dapat menggunakan Artisan/Tinker |
| Konfigurasi database MySQL | ✅ Sudah | Migration dapat dijalankan dan database sudah dapat digunakan |
| Migration tabel inti | ✅ Sudah | `site_settings`, `banners`, `packages`, `testimonials`, `customers`, `bookings`, `invoices`, `payments` sudah dibuat |
| Model Eloquent | ✅ Sudah | 8 model inti sudah dibuat |
| Relationship Eloquent | ✅ Sudah | Relasi Customer → Booking → Package → Invoice → Payment sudah dibuat |
| Factory | ✅ Sudah | Factory untuk data dummy sudah dibuat dan diperbaiki |
| Seeder | ✅ Sudah | Seeder berhasil menghasilkan data dummy |
| Pengujian relationship | ✅ Sebagian sudah | `Customer::with('bookings')->first()` berhasil mengembalikan customer beserta booking |
| Struktur route publik/admin | ⏳ Belum diterapkan | Route lengkap sengaja ditunda dan akan ditambahkan satu per satu saat controller dibuat |
| Role & Permission Admin/Staff | ⏳ Belum | Akan dikerjakan sebelum CRUD dashboard |
| Spatie Media Library | ⏳ Belum dikonfigurasi | Diperlukan untuk banner, galeri package, dan foto testimonial |
| CRUD CMS | ⏳ Belum | Banner, Site Settings, Package, Testimonial |
| Customer & Booking module | ⏳ Belum | Controller, validation, UI, dan flow booking belum dibuat |
| Invoice + PDF | ⏳ Belum | Controller, view invoice, generate PDF belum dibuat |
| Laporan + Excel | ⏳ Belum | Filter laporan dan export Excel belum dibuat |
| Landing page publik dinamis | ⏳ Belum | Akan dibuat setelah modul CMS siap |
| Polish UI, SEO, deployment | ⏳ Belum | Tahap akhir |

### Struktur Database & Model yang Sudah Dibuat

```text
Customer
   │
   │ hasMany
   ▼
Booking ───── belongsTo ─────> Package
   │
   │ hasOne
   ▼
Invoice
   │
   │ hasMany
   ▼
Payment
```

Model yang sudah tersedia:

```text
app/Models/
├── SiteSetting.php
├── Banner.php
├── Package.php
├── Testimonial.php
├── Customer.php
├── Booking.php
├── Invoice.php
└── Payment.php
```

Factory/data dummy yang sudah disiapkan:

```text
database/factories/
├── SiteSettingFactory.php
├── BannerFactory.php
├── PackageFactory.php
├── TestimonialFactory.php
├── CustomerFactory.php
├── BookingFactory.php
├── InvoiceFactory.php
└── PaymentFactory.php
```

Pengujian yang sudah berhasil dilakukan melalui Tinker:

```php
use App\Models\Customer;

Customer::with('bookings')->first();
```

Hasil sudah mengembalikan object `Customer` beserta collection `bookings`, sehingga relasi `Customer hasMany Booking` sudah terverifikasi bekerja.

---

## 1. Arsitektur Ringkas

```
Laravel (Backend + API/Controller)
 ├─ Inertia.js  → jembatan antara Laravel & React (tanpa perlu bikin REST API terpisah)
 ├─ MySQL       → database
 └─ resources/js
     ├─ Pages/Public/   → landing page publik (Home, Paket, Tentang, Kontak, dst)
     ├─ Pages/Admin/    → dashboard admin (CMS, booking, invoice, laporan)
     ├─ Layouts/        → PublicLayout.jsx & AdminLayout.jsx
     └─ Components/     → komponen shared
```

Karena pakai Inertia, satu project Laravel ini sudah menghasilkan **dua "aplikasi"**:
- Halaman publik (landing page) — dirender dari data yang diatur admin (banner, paket wisata, testimoni, dll)
- Dashboard admin — CRUD konten, booking, invoice, laporan

Tidak perlu bikin backend API + frontend React terpisah. Semua satu repo, satu deploy.

---

## 2. Prasyarat

Install di komputer kamu (bukan di server dulu):
- PHP >= 8.2 + ekstensi umum (mbstring, openssl, pdo_mysql, gd/imagick untuk gambar)
- Composer
- Node.js >= 18 + npm
- MySQL 8
- Laravel Installer (opsional tapi memudahkan):
  ```bash
  composer global require laravel/installer
  ```

---

## 3. Membuat Project dengan Starter Kit React (Inertia)

Laravel 12 sudah menyediakan starter kit resmi berbasis React + Inertia + Tailwind + Vite + Auth. Ini yang kamu maksud.

```bash
laravel new travel-app
```

Saat proses instalasi interaktif, pilih:
- Starter kit: **React**
- Testing framework: bebas (Pest/PHPUnit)
- Ingin instal dependency & migrate langsung: **Yes** (nanti kita sesuaikan .env dulu sebelum migrate kalau mau aman)

Kalau mau non-interaktif:
```bash
laravel new travel-app --react
```

Starter kit ini sudah termasuk:
- Inertia + React + TypeScript-ready (opsional pakai .jsx biasa juga bisa)
- Tailwind CSS + Vite
- Autentikasi (login, register, reset password, verifikasi email) sudah jadi
- Struktur `resources/js/pages`, `resources/js/layouts`, `resources/js/components`

Masuk ke folder project:
```bash
cd travel-app
```

---

## 4. Konfigurasi Database (.env)

Buat database MySQL dulu:
```sql
CREATE DATABASE travel_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Edit `.env`:
```env
APP_NAME="Nama Travel Kamu"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=travel_app
DB_USERNAME=root
DB_PASSWORD=
```

Migrate:
```bash
php artisan migrate
```

Jalankan dev server (dua terminal):
```bash
php artisan serve
npm run dev
```

---

## 5. Package Tambahan yang Direkomendasikan

```bash
# Role & permission (Admin vs Staff)
composer require spatie/laravel-permission

# Manajemen gambar/media (upload banner, galeri paket, dll) tanpa perlu handle path manual
composer require spatie/laravel-medialibrary

# Export laporan ke Excel
composer require maatwebsite/excel

# Generate invoice PDF
composer require barryvdh/laravel-dompdf

# Slug otomatis untuk paket wisata (URL SEO friendly: /paket/bali-3d2n)
composer require spatie/laravel-sluggable
```

Publish config yang diperlukan:
```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-migrations"
php artisan migrate
```

---

## 6. Desain Database Inti ✅ SELESAI


### Status Implementasi Tahap 6

Tahap desain database inti sudah dilanjutkan sampai implementasi. Migration yang sudah dibuat dan dijalankan:

```text
site_settings
banners
packages
testimonials
customers
bookings
invoices
payments
```

Selain migration, model, relationship, factory, dan seeder untuk tabel-tabel inti tersebut juga sudah dibuat. Data dummy sudah berhasil di-seed ke database.

> Catatan: gambar untuk banner/package/testimonial tetap direncanakan menggunakan Spatie Media Library, sehingga tidak dibuat tabel `package_images` manual. Konfigurasi Media Library belum dikerjakan.

| Tabel | Fungsi |
|---|---|
| `users` | admin/staff login, dengan role via spatie/permission |
| `site_settings` | key-value: nama perusahaan, alamat, telp, email, sosmed, hero title/subtitle |
| `banners` | slide hero di homepage (gambar, judul, urutan, aktif/nonaktif) |
| `packages` | paket wisata (judul, slug, deskripsi, harga, durasi, destinasi, unggulan) |
| `package_images` atau media library | galeri foto tiap paket |
| `testimonials` | nama, foto, isi testimoni, rating |
| `customers` | data pelanggan yang booking |
| `bookings` | pemesanan: customer, paket, tanggal keberangkatan, jumlah peserta, status |
| `invoices` | invoice per booking: nomor invoice, jumlah, status bayar |
| `payments` (opsional) | histori pembayaran per invoice |

### Contoh Migration — `packages`

```php
Schema::create('packages', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('description');
    $table->string('destination');
    $table->unsignedInteger('duration_days');
    $table->decimal('price', 12, 2);
    $table->boolean('is_featured')->default(false);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### Contoh Migration — `bookings`

```php
Schema::create('bookings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
    $table->foreignId('package_id')->constrained();
    $table->date('departure_date');
    $table->unsignedInteger('participant_count');
    $table->decimal('total_price', 12, 2);
    $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
    $table->timestamps();
});
```

### Contoh Migration — `invoices`

```php
Schema::create('invoices', function (Blueprint $table) {
    $table->id();
    $table->string('invoice_number')->unique();
    $table->foreignId('booking_id')->constrained();
    $table->decimal('amount', 12, 2);
    $table->date('issued_date');
    $table->date('due_date')->nullable();
    $table->enum('status', ['unpaid', 'paid', 'overdue'])->default('unpaid');
    $table->timestamps();
});
```

---

## 7. Struktur Routing ⏳ BELUM DITERAPKAN


### Status Implementasi Tahap 7

Struktur routing lengkap **belum ditambahkan**. Keputusan saat ini adalah menambahkan route secara bertahap bersamaan dengan pembuatan controller agar setiap modul dapat langsung diuji dan lebih mudah di-debug.

Rencana penerapan:

```text
Buat Controller
   ↓
Tambahkan route modul terkait
   ↓
Jalankan php artisan route:list
   ↓
Tes route/controller
   ↓
Lanjut ke modul berikutnya
```

Contoh: setelah `BannerController` dibuat, barulah tambahkan `Route::resource('banners', BannerController::class)` di `routes/admin.php`. Pola yang sama akan digunakan untuk Package, Testimonial, Customer, Booking, Invoice, dan modul lainnya.

Pisahkan route publik dan admin agar rapi.

**`routes/web.php`** (publik):
```php
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PackageController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/paket', [PackageController::class, 'index'])->name('packages.index');
Route::get('/paket/{package:slug}', [PackageController::class, 'show'])->name('packages.show');
Route::get('/tentang-kami', [HomeController::class, 'about'])->name('about');
Route::get('/kontak', [HomeController::class, 'contact'])->name('contact');
Route::post('/kontak', [HomeController::class, 'sendContact'])->name('contact.send');
```

**`routes/admin.php`** (buat file baru, register di `bootstrap/app.php`):
```php
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin|staff'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('banners', BannerController::class);
    Route::resource('packages', PackageController::class);
    Route::resource('testimonials', TestimonialController::class);
    Route::get('/site-settings', [SiteSettingController::class, 'edit'])->name('settings.edit');
    Route::put('/site-settings', [SiteSettingController::class, 'update'])->name('settings.update');

    Route::resource('customers', CustomerController::class);
    Route::resource('bookings', BookingController::class);

    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf'])->name('invoices.pdf');
    Route::resource('invoices', InvoiceController::class);

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
});
```

Daftarkan di `bootstrap/app.php`:
```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    then: function () {
        Route::middleware('web')->group(base_path('routes/admin.php'));
    },
    // ...
)
```

---

## 8. Contoh: Export Laporan ke Excel

```bash
php artisan make:export BookingsExport --model=Booking
```

`app/Exports/BookingsExport.php`:
```php
namespace App\Exports;

use App\Models\Booking;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;

class BookingsExport implements FromQuery, WithHeadings
{
    use Exportable;

    public function __construct(protected ?string $from = null, protected ?string $to = null) {}

    public function query()
    {
        return Booking::query()
            ->with(['customer', 'package'])
            ->when($this->from, fn ($q) => $q->whereDate('departure_date', '>=', $this->from))
            ->when($this->to, fn ($q) => $q->whereDate('departure_date', '<=', $this->to));
    }

    public function headings(): array
    {
        return ['ID', 'Customer', 'Paket', 'Tanggal Berangkat', 'Jumlah Peserta', 'Total', 'Status'];
    }
}
```

Controller:
```php
public function export(Request $request)
{
    return (new BookingsExport($request->from, $request->to))
        ->download('laporan-booking-' . now()->format('Y-m-d') . '.xlsx');
}
```

---

## 9. Contoh: Generate Invoice PDF

```php
use Barryvdh\DomPDF\Facade\Pdf;

public function downloadPdf(Invoice $invoice)
{
    $invoice->load('booking.customer', 'booking.package');

    $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));

    return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
}
```

Buat view blade sederhana di `resources/views/invoices/pdf.blade.php` untuk layout invoice (logo, data customer, rincian paket, total, status bayar).

---

## 10. Konsep CMS (Konten Dikelola Tanpa Koding)

Prinsipnya: setiap bagian visual di landing page **ditarik dari database**, bukan hardcode di komponen React.

Contoh alur untuk Homepage:
```php
// HomeController@index
public function index()
{
    return Inertia::render('Public/Home', [
        'banners'   => Banner::active()->orderBy('order')->get(),
        'featured'  => Package::active()->where('is_featured', true)->get(),
        'testimonials' => Testimonial::latest()->take(6)->get(),
        'settings'  => SiteSetting::pluck('value', 'key'),
    ]);
}
```

Lalu di React (`resources/js/pages/Public/Home.jsx`) tinggal render `props.banners`, `props.featured`, dst. Admin cukup CRUD banner/paket/testimoni lewat dashboard → tampilan publik otomatis berubah, tanpa sentuh kode sama sekali.

Untuk gambar, pakai Spatie Media Library supaya admin tinggal upload file di form, dan sistem otomatis handle penyimpanan, resize/thumbnail, dsb:
```php
$banner->addMediaFromRequest('image')->toMediaCollection('banners');
```

---

## 11. Roadmap Pengerjaan dari Kondisi Saat Ini

### ✅ Sudah Diselesaikan

1. Setup project Laravel + starter kit React/Inertia.
2. Konfigurasi database dan menjalankan migration.
3. Membuat migration database inti:
   - `site_settings`
   - `banners`
   - `packages`
   - `testimonials`
   - `customers`
   - `bookings`
   - `invoices`
   - `payments`
4. Membuat Model Eloquent untuk seluruh tabel inti.
5. Membuat relationship utama:
   - Customer `hasMany` Booking
   - Booking `belongsTo` Customer
   - Booking `belongsTo` Package
   - Package `hasMany` Booking
   - Booking `hasOne` Invoice
   - Invoice `belongsTo` Booking
   - Invoice `hasMany` Payment
   - Payment `belongsTo` Invoice
6. Membuat Factory untuk data dummy.
7. Membuat dan menjalankan `DatabaseSeeder`.
8. Menguji relationship Customer → Booking melalui Laravel Tinker dan berhasil.

### ⏭️ Tahap Berikutnya

1. **Role & Permission Admin/Staff**
   - Konfigurasi Spatie Laravel Permission.
   - Tambahkan trait `HasRoles` pada model `User`.
   - Buat role `admin` dan `staff`.
   - Tentukan akses masing-masing role.
   - Buat/seeding user admin dan staff.

2. **Konfigurasi Spatie Media Library**
   - Publish migration/config bila belum dilakukan.
   - Hubungkan media ke Banner.
   - Hubungkan media ke Package untuk gallery.
   - Hubungkan media ke Testimonial untuk foto customer.

3. **Bangun CRUD CMS satu per satu**
   Urutan yang disarankan:
   ```text
   Site Settings
       ↓
   Banner
       ↓
   Package
       ↓
   Testimonial
   ```
   Untuk setiap modul:
   - buat controller,
   - tambahkan route admin,
   - buat validation/Form Request bila diperlukan,
   - buat halaman React/Inertia,
   - tes CRUD,
   - baru lanjut ke modul berikutnya.

4. **Modul Customer & Booking**
   - `CustomerController`.
   - `BookingController`.
   - Route admin untuk customer dan booking.
   - Form booking publik.
   - Validasi booking.
   - Perhitungan `total_price`.
   - Status booking: pending/confirmed/cancelled/completed.

5. **Modul Invoice & Payment**
   - `InvoiceController`.
   - Pembuatan nomor invoice.
   - Generate invoice dari booking.
   - Histori pembayaran.
   - Generate/download invoice PDF.

6. **Laporan & Export Excel**
   - `ReportController`.
   - Filter periode.
   - Rekap booking/customer/revenue sesuai kebutuhan.
   - Export Excel menggunakan Maatwebsite Excel.

7. **Landing Page Publik Dinamis**
   - Home.
   - Daftar Paket.
   - Detail Paket.
   - Tentang Kami.
   - Kontak.
   - Form Booking.
   - Seluruh konten mengambil data dari database/CMS.

8. **Finalisasi**
   - Polish UI.
   - Responsive testing.
   - Validation & authorization review.
   - SEO dengan Inertia Head.
   - Optimasi image/media.
   - Testing flow end-to-end.
   - Deployment.

### Urutan Kerja Terdekat

```text
POSISI SAAT INI
      │
      ▼
Role & Permission Admin/Staff
      │
      ▼
Spatie Media Library
      │
      ▼
Site Settings CRUD
      │
      ▼
Banner CRUD
      │
      ▼
Package CRUD
      │
      ▼
Testimonial CRUD
      │
      ▼
Customer + Booking
      │
      ▼
Invoice + Payment
      │
      ▼
Laporan + Excel
      │
      ▼
Landing Page Publik
      │
      ▼
Polish + Deploy
```

---

## 12. Deployment (nanti setelah dev selesai)

- Build frontend: `npm run build`
- Set `.env` production: `APP_ENV=production`, `APP_DEBUG=false`
- `php artisan config:cache && php artisan route:cache`
- Storage link untuk media: `php artisan storage:link`
- Hosting: VPS (Laravel Forge/manual Nginx+PHP-FPM) atau shared hosting yang support Laravel
