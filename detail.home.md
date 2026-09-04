# Detail Pengerjaan Landing Page Publik Dinamis

## 1. Tujuan

Membangun website publik Trip & Travel yang:

- Menampilkan identitas dan konten bisnis dari database.
- Menampilkan banner, paket wisata, dan testimoni yang dikelola melalui dashboard admin.
- Memiliki halaman daftar serta detail paket yang mudah digunakan di desktop dan perangkat mobile.
- Memungkinkan calon pelanggan membuat booking dari halaman detail paket.
- Memiliki struktur SEO, aksesibilitas, keamanan, dan performa yang layak untuk production.
- Tidak mengharuskan perubahan kode untuk memperbarui konten bisnis utama.

Dokumen ini menjadi checklist implementasi. Pengerjaan sebaiknya dilakukan secara bertahap dan setiap tahap harus memiliki test yang relevan sebelum dilanjutkan.

---

## 2. Kondisi Proyek Saat Ini

Fondasi yang sudah dapat digunakan:

- Laravel, Inertia v3, React 19, Tailwind CSS v4, dan Wayfinder sudah aktif.
- CRUD admin untuk `site_settings`, banner, package, dan testimonial sudah tersedia.
- Media banner, cover/gallery package, serta foto testimonial sudah dikelola melalui Spatie Media Library.
- Modul customer dan booking admin sudah tersedia.
- Route `/` masih menggunakan closure dan merender halaman starter `welcome`.
- Belum ada layout khusus halaman publik.
- Resolver layout di `resources/js/app.tsx` saat ini akan memberikan `AppLayout` kepada halaman baru secara default. Halaman publik harus dipetakan ke `PublicLayout` agar tidak memakai shell dashboard.

Gap konten yang perlu diselesaikan:

- `site_settings` belum memiliki konten Tentang Kami.
- Belum tersedia judul/deskripsi SEO yang dapat dikelola admin.
- Belum ada pengaturan label CTA dan teks section Home.
- Belum diputuskan apakah halaman Kontak hanya menampilkan kontak/WhatsApp atau menerima pesan melalui form.

Keputusan untuk rilis awal:

- Halaman Kontak cukup menampilkan informasi kontak dan CTA WhatsApp. Form pesan dapat menjadi pengembangan terpisah karena membutuhkan penyimpanan pesan, validasi, anti-spam, dan/atau pengiriman email.
- Registrasi akun tidak perlu dipromosikan di navigasi publik. Login dapat ditampilkan sebagai akses admin bila memang diperlukan.
- Data publik hanya boleh menampilkan record yang aktif.

---

## 3. Sitemap dan Route Publik

Route yang ditargetkan:

| Method | URL | Nama route | Halaman/Tindakan |
|---|---|---|---|
| GET | `/` | `home` | Home |
| GET | `/packages` | `packages.index` | Daftar paket aktif |
| GET | `/packages/{package:slug}` | `packages.show` | Detail paket berdasarkan slug |
| POST | `/packages/{package:slug}/bookings` | `packages.bookings.store` | Membuat booking publik |
| GET | `/about` | `about` | Tentang Kami |
| GET | `/contact` | `contact` | Kontak |

Ketentuan route:

- Gunakan named route.
- Gunakan scoped/implicit route model binding berdasarkan `slug` untuk package.
- Package nonaktif tidak boleh diakses dari halaman daftar maupun detail publik.
- Route booking harus memiliki rate limiter.
- Frontend harus menggunakan fungsi Wayfinder dari `@/routes` atau `@/actions`, bukan URL internal yang ditulis manual.
- URL eksternal seperti WhatsApp dan media sosial harus dinormalisasi dan divalidasi sebelum digunakan.

---

## 4. Sumber Data Dinamis

### 4.1 Site settings yang sudah tersedia

- `company_name`
- `company_tagline`
- `company_address`
- `company_phone`
- `company_email`
- `whatsapp_number`
- `facebook_url`
- `instagram_url`
- `youtube_url`
- `hero_title`
- `hero_subtitle`

### 4.2 Site settings yang disarankan untuk ditambahkan

Karena tabel bersifat key-value, penambahan konten berikut tidak memerlukan kolom baru. Namun whitelist validasi, nilai default, form admin, dan test Site Settings harus diperbarui.

- `about_title`
- `about_description`
- `home_packages_title`
- `home_packages_subtitle`
- `home_testimonials_title`
- `home_testimonials_subtitle`
- `home_cta_title`
- `home_cta_description`
- `home_cta_button_text`
- `seo_default_title`
- `seo_default_description`

Nilai default harus tetap tersedia agar halaman publik tidak rusak ketika admin belum mengisi suatu setting.

### 4.3 Aturan data Home

#### Banner

- Hanya `is_active = true`.
- Urutkan berdasarkan `order`, lalu `id` sebagai urutan stabil.
- Kirim hanya field yang dibutuhkan frontend.
- Sertakan URL gambar dan teks alternatif yang berasal dari judul banner.
- Jika tidak ada banner aktif, tampilkan hero fallback dari `hero_title` dan `hero_subtitle`.

#### Paket unggulan

- Hanya `is_active = true` dan `is_featured = true`.
- Batasi jumlah paket pada Home, misalnya 6 item.
- Sertakan `id`, `slug`, `title`, `destination`, `duration_days`, `price`, dan URL thumbnail cover.
- Jangan mengirim deskripsi lengkap apabila card hanya membutuhkan ringkasan.
- Sediakan empty state jika belum ada paket unggulan.

#### Testimoni

- Hanya `is_active = true`.
- Batasi jumlah yang ditampilkan pada Home.
- Sertakan `name`, `content`, `rating`, dan URL avatar jika tersedia.
- Tampilkan avatar fallback berupa inisial saat foto tidak tersedia.

#### Informasi perusahaan

- Ambil hanya key `site_settings` yang benar-benar digunakan halaman.
- Bentuk associative array di backend agar frontend tidak perlu memahami struktur key-value database.
- Nomor WhatsApp harus dikonversi menjadi URL `https://wa.me/...` dengan format digit internasional yang valid.

### 4.4 Kontrak data frontend

- Buat type TypeScript eksplisit untuk `PublicSiteSettings`, `PublicBanner`, `PublicPackageCard`, dan `PublicTestimonial`.
- Jangan meneruskan object model Eloquent mentah ke frontend.
- Format harga dapat dikirim sebagai nilai numerik/string baku, lalu ditampilkan dengan formatter Rupiah yang digunakan secara konsisten.
- Semua properti nullable harus tercermin dalam type TypeScript dan memiliki fallback UI.
- Jangan mengekspos timestamps, internal media metadata, permission, atau data admin yang tidak dipakai.

---

## 5. Struktur Backend

### 5.1 Controller publik

Controller yang disarankan:

- `HomeController`
  - Mengambil site settings, banner aktif, paket unggulan aktif, dan testimoni aktif.
  - Merender `public/home`.
- `PublicPackageController`
  - `index()` menampilkan daftar paket aktif dengan pagination.
  - `show()` menampilkan detail package aktif, cover, gallery, dan data yang diperlukan form booking.
- `AboutController`
  - Menampilkan konten Tentang Kami dari site settings.
- `ContactController`
  - Menampilkan alamat, telepon, email, WhatsApp, dan media sosial.
- `PublicBookingController`
  - Menangani booking dari pengunjung.

Nama controller dapat disesuaikan dengan konvensi proyek, tetapi controller publik harus dipisahkan dengan jelas dari controller admin.

### 5.2 Query dan transformasi data

- Gunakan query terpilih (`select`) untuk menghindari pengiriman data berlebih.
- Gunakan eager loading media bila pola Media Library dan kebutuhan query mendukungnya.
- Hindari N+1 ketika mengambil URL media untuk kumpulan package/testimonial.
- Gunakan pagination untuk daftar package; jangan mengambil seluruh package sekaligus.
- Pisahkan fungsi transformasi berulang ke method private atau Laravel Resource apabila mulai digunakan di lebih dari satu controller.
- Jangan membuat service/repository baru bila controller dan resource sederhana sudah cukup.

### 5.3 Booking publik

Buat Form Request khusus untuk booking publik dengan aturan minimal:

- `name`: wajib, string, panjang maksimum yang wajar.
- `phone`: wajib, string, format/ukuran nomor telepon yang aman.
- `email`: opsional, email valid.
- `address`: opsional, string dengan batas maksimum.
- `departure_date`: wajib, tanggal hari ini atau setelahnya sesuai aturan bisnis.
- `participant_count`: wajib, integer, minimum 1 dan maksimum yang ditentukan bisnis.

Aturan proses:

- Pastikan package masih aktif saat request diproses.
- Abaikan harga, total, status, dan package lain yang dikirim browser.
- Hitung `total_price` di server dari harga package dikali jumlah peserta.
- Booking baru selalu berstatus `pending`.
- Buat atau gunakan customer sesuai strategi identifikasi yang dipilih. Rekomendasi awal: cari berdasarkan nomor telepon yang sudah dinormalisasi, lalu perbarui data kontak yang aman atau buat customer baru.
- Simpan customer dan booking dalam database transaction.
- Terapkan rate limiting.
- Tambahkan field honeypot sederhana bila diperlukan tanpa menambah dependency.
- Setelah berhasil, redirect kembali ke detail package dengan flash toast dan ringkasan bahwa admin akan menghubungi pelanggan.
- Jangan menampilkan ID internal, invoice, atau data customer lain pada response publik.

---

## 6. Fondasi Frontend Publik

### 6.1 Public layout

Buat `resources/js/layouts/public-layout.tsx` yang menangani:

- Header/navbar.
- Navigasi desktop dan mobile.
- Main content.
- Footer.
- Tombol WhatsApp mengambang jika nomor tersedia.
- State menu mobile dan penutupan menu setelah navigasi.
- Lebar container serta spacing yang konsisten.

Perbarui `resources/js/app.tsx` supaya semua page dengan prefix `public/` menggunakan `PublicLayout`. Halaman admin, auth, settings, dan dashboard harus tetap menggunakan layout masing-masing.

### 6.2 Shared props

Data yang dipakai di seluruh halaman publik dapat dibagikan melalui middleware Inertia, misalnya:

- Nama perusahaan.
- Tagline.
- Informasi kontak.
- Link media sosial.
- Nomor/URL WhatsApp.

Pertimbangkan lazy/shared closure agar query tidak dijalankan untuk request yang tidak memerlukan data publik. Jangan mengirim semua site settings ke semua halaman.

### 6.3 Komponen publik yang dapat digunakan ulang

Komponen minimum:

- `public-header.tsx`
- `public-mobile-navigation.tsx`
- `public-footer.tsx`
- `section-heading.tsx`
- `package-card.tsx`
- `testimonial-card.tsx`
- `whatsapp-button.tsx`
- `empty-state.tsx`
- `image-placeholder.tsx`
- `price.tsx` atau utility formatter Rupiah

Ketentuan komponen:

- Reuse komponen UI yang sudah tersedia jika sesuai.
- Gunakan `<Link>` dari Inertia untuk navigasi internal.
- Gunakan anchor biasa untuk WhatsApp dan media sosial, dengan `target="_blank"` serta `rel="noreferrer"` bila membuka tab baru.
- Hindari komponen terlalu generik sebelum ada penggunaan nyata.

### 6.4 Design system dan responsivitas

- Tentukan warna brand utama, warna aksen, typography, radius, dan shadow sebelum menyusun seluruh halaman.
- Simpan token brand pada konfigurasi CSS-first Tailwind v4 melalui `@theme` bila diperlukan.
- Gunakan mobile-first responsive classes.
- Gunakan `gap` untuk jarak antarelemen dalam flex/grid.
- Pastikan navbar, hero, grid package, gallery, form, dan footer nyaman pada lebar mobile, tablet, dan desktop.
- Ikuti dukungan dark mode yang sudah digunakan aplikasi atau putuskan secara eksplisit bahwa website publik menggunakan tema terang tetap. Jangan menghasilkan dark mode yang setengah selesai.

---

## 7. Detail Halaman Home

Home menjadi vertical slice pertama dan harus diselesaikan sebelum halaman publik lain.

### 7.1 Urutan section

1. Header/navigation.
2. Hero banner.
3. Intro atau Tentang Kami singkat.
4. Paket unggulan.
5. Alasan memilih perusahaan/keunggulan layanan.
6. Testimoni pelanggan.
7. CTA konsultasi atau booking melalui WhatsApp.
8. Footer.

Section keunggulan hanya boleh disebut dinamis apabila kontennya benar-benar dapat diedit admin. Untuk rilis pertama, section dapat menggunakan konten site settings tambahan atau ditunda agar tidak menanam banyak copy bisnis langsung di JSX.

### 7.2 Hero banner

- Gunakan banner aktif dari database.
- Tampilkan satu banner secara baik terlebih dahulu; carousel hanya dibuat jika benar-benar dibutuhkan.
- Jika membuat carousel, dukung tombol sebelumnya/berikutnya, indikator slide, keyboard, pause ketika pointer berada di area carousel, dan preferensi `prefers-reduced-motion`.
- Jangan menjalankan autoplay agresif.
- Pastikan teks tetap terbaca melalui overlay dengan kontras yang memadai.
- Tombol banner menggunakan `button_text` dan `button_url` hanya jika keduanya tersedia.
- URL internal diarahkan melalui Inertia; URL eksternal diperlakukan sebagai external link.
- Gambar pertama harus diprioritaskan untuk memperbaiki Largest Contentful Paint, sedangkan gambar lain dapat lazy-load.

### 7.3 Paket unggulan

- Grid responsif 1 kolom pada mobile, kemudian 2–3 kolom sesuai lebar layar.
- Card menampilkan cover, tujuan, judul, durasi, harga per orang, dan tombol detail.
- Seluruh card atau tombol harus menuju route detail berdasarkan slug.
- Gambar menggunakan ukuran/rasio konsisten dan `object-cover`.
- Tambahkan link “Lihat Semua Paket” menuju halaman daftar package.

### 7.4 Testimoni

- Tampilkan rating dengan label yang dapat dibaca screen reader.
- Konten tidak boleh terpotong sampai kehilangan makna; batasi secara visual hanya bila tersedia cara membaca isi lengkap.
- Gunakan inisial bila avatar tidak tersedia.
- Carousel testimoni bersifat opsional; grid sederhana lebih mudah, cepat, dan aksesibel untuk rilis awal.

### 7.5 CTA WhatsApp

- Gunakan nomor dari site settings.
- Pesan awal dapat berisi sapaan umum pada Home.
- Pada detail package, pesan awal sebaiknya menyebut nama package.
- Tombol tidak dirender bila nomor belum dikonfigurasi.

### 7.6 Empty dan failure state

- Hero memiliki fallback meskipun tidak ada banner aktif.
- Paket unggulan menampilkan pesan dan CTA kontak bila data kosong.
- Testimoni dapat menyembunyikan seluruh section bila tidak ada record aktif.
- Gambar rusak atau kosong harus memiliki placeholder yang tidak merusak layout.

---

## 8. Halaman Daftar Paket

Fitur rilis awal:

- Judul dan intro halaman.
- Grid package aktif.
- Pagination yang mempertahankan query string.
- Empty state.
- SEO title dan description.

Pencarian/filter dapat ditambahkan setelah versi dasar stabil:

- Pencarian berdasarkan judul atau tujuan.
- Filter rentang harga.
- Filter durasi.
- Sorting harga atau terbaru.

Jika filter dibuat, nilai filter harus divalidasi di backend dan disimpan pada URL agar hasil dapat dibagikan serta tombol kembali browser bekerja dengan baik.

---

## 9. Halaman Detail Paket

Konten minimum:

- Breadcrumb.
- Cover hero.
- Judul dan tujuan.
- Durasi.
- Harga per orang.
- Deskripsi lengkap dengan output yang aman.
- Gallery.
- CTA WhatsApp.
- Form booking publik.
- Rekomendasi package aktif lain bila dibutuhkan.

Ketentuan gallery:

- Gunakan thumbnail untuk preview dan gambar yang sesuai untuk tampilan besar.
- Seluruh gambar memiliki alt text yang bermakna.
- Lightbox bersifat opsional dan sebaiknya tidak menambah dependency sebelum disetujui.

Ketentuan description:

- Jika data disimpan sebagai plain text, render sebagai text/paragraph dan pertahankan line break secara aman.
- Jangan menggunakan `dangerouslySetInnerHTML` kecuali ada proses sanitasi HTML yang jelas.

---

## 10. Halaman Tentang dan Kontak

### Tentang Kami

- Judul.
- Deskripsi perusahaan dari site settings.
- Nilai/keunggulan bisnis jika sudah dibuat dinamis.
- CTA melihat package atau menghubungi WhatsApp.
- SEO metadata.

### Kontak

- Alamat.
- Nomor telepon.
- Email.
- WhatsApp.
- Media sosial.
- Peta hanya ditambahkan jika tersedia URL/embed yang dikelola admin dan kebijakan privasi/performa sudah dipertimbangkan.
- Jangan tampilkan elemen kosong untuk setting yang belum diisi.

---

## 11. SEO dan Metadata

Setiap halaman menggunakan `<Head>` Inertia.

Minimum metadata:

- Title unik.
- Meta description.
- Canonical URL.
- Open Graph title, description, type, URL, dan image bila tersedia.
- Twitter card bila diperlukan.

Aturan title:

- Home menggunakan `seo_default_title` atau nama perusahaan.
- Daftar package menggunakan judul halaman ditambah nama perusahaan.
- Detail package menggunakan judul package ditambah nama perusahaan.
- About dan Contact memiliki title masing-masing.

Pekerjaan SEO tambahan:

- Tambahkan `robots.txt` yang sesuai environment.
- Buat sitemap untuk route publik dan package aktif.
- Pastikan package nonaktif tidak masuk sitemap.
- Tambahkan JSON-LD organisasi/travel agency dan produk/offers hanya setelah struktur datanya benar.
- Jangan mengandalkan meta keywords.
- Pastikan heading hanya memiliki satu konteks `h1` utama per halaman.

---

## 12. Accessibility

- Seluruh fungsi dapat digunakan dengan keyboard.
- Ada visible focus state pada link, tombol, menu, dan input.
- Mobile navigation mempunyai label, `aria-expanded`, dan focus management yang benar.
- Setiap input booking mempunyai label yang terhubung.
- Error validasi ditampilkan dekat field dan dapat dipahami screen reader.
- Warna teks dan tombol memiliki kontras yang memadai.
- Gambar dekoratif menggunakan alt kosong; gambar informatif menggunakan alt bermakna.
- Icon-only button harus mempunyai accessible label.
- Animasi menghormati `prefers-reduced-motion`.
- Jangan menyampaikan status hanya melalui warna.

---

## 13. Keamanan dan Privasi

- Semua validasi booking dilakukan di server.
- Jangan mempercayai package ID, harga, total, atau status dari frontend.
- Gunakan CSRF protection bawaan Laravel/Inertia.
- Terapkan rate limit pada submit booking.
- Hanya package aktif yang dapat dipesan.
- Hindari menampilkan stack trace atau detail internal kepada pengunjung.
- Normalisasi nomor telepon dan WhatsApp.
- Validasi URL eksternal agar hanya memakai skema yang aman.
- Jangan merender HTML dari admin tanpa sanitasi.
- Tampilkan pemberitahuan singkat bahwa data kontak digunakan untuk memproses permintaan booking.
- Pertimbangkan CAPTCHA hanya jika spam nyata terjadi; jangan menambah dependency sebelum diperlukan dan disetujui.

---

## 14. Performa

- Gunakan konversi media `thumb` untuk card dan `hero` untuk cover detail.
- Hindari mengirim original image berukuran besar pada listing.
- Tambahkan `loading="lazy"` pada gambar di bawah fold.
- Prioritaskan gambar hero pertama.
- Tetapkan width/height atau aspect ratio agar layout tidak bergeser.
- Pagination wajib pada daftar package.
- Hindari JavaScript carousel jika solusi statis sudah memenuhi kebutuhan.
- Pastikan query tidak mengalami N+1.
- Pertimbangkan cache untuk site settings setelah perilaku update/invalidation ditentukan.
- Jalankan production build dan periksa ukuran bundle sebelum finalisasi.

---

## 15. Error Handling

- Package slug yang tidak ada menghasilkan halaman 404.
- Package nonaktif diperlakukan sebagai tidak tersedia untuk publik.
- Sediakan halaman 403, 404, 419, 429, dan 500 yang sesuai identitas website.
- Booking gagal validasi tetap mempertahankan input yang aman.
- Booking yang terkena rate limit menampilkan pesan yang mudah dipahami.
- Kegagalan gambar memakai placeholder.
- Halaman tetap dapat dirender ketika site settings opsional belum terisi.

---

## 16. Pengujian

### 16.1 Feature test Home

- Pengunjung dapat membuka Home tanpa login.
- Home merender component Inertia yang benar.
- Hanya banner aktif yang ditampilkan dan urutannya benar.
- Hanya package aktif serta featured yang ditampilkan.
- Hanya testimonial aktif yang ditampilkan.
- Media URL dan site settings yang diperlukan tersedia pada props.
- Data sensitif/internal tidak ikut terkirim.
- Fallback bekerja ketika banner atau data opsional kosong.

### 16.2 Feature test daftar dan detail package

- Daftar hanya berisi package aktif.
- Pagination bekerja.
- Detail dapat dibuka dengan slug package aktif.
- Package nonaktif dan slug tidak valid menghasilkan 404.
- Cover dan gallery dikirim dengan struktur yang benar.

### 16.3 Feature test booking publik

- Pengunjung dapat membuat booking valid.
- Customer dan booking dibuat dalam kondisi yang benar.
- Total dihitung oleh server.
- Status awal selalu `pending`.
- Package nonaktif tidak dapat dipesan.
- Tanggal lampau ditolak.
- Jumlah peserta tidak valid ditolak.
- Harga/status palsu dari request tidak dipercaya.
- Submit berulang terkena rate limiter sesuai konfigurasi.
- Kegagalan transaksi tidak meninggalkan data parsial.

### 16.4 Test site settings

- Key baru dapat diperbarui admin.
- User tanpa permission tidak dapat memperbarui setting.
- Validasi panjang teks dan URL tetap berjalan.
- Nilai default tersedia saat key belum tersimpan.

### 16.5 Verifikasi frontend

- TypeScript check/lint lolos.
- Production build lolos.
- Tidak ada error console pada halaman publik.
- Navigasi Inertia bekerja tanpa full reload untuk route internal.
- Layout diuji pada mobile, tablet, dan desktop.
- Form diuji dengan keyboard.

---

## 17. Urutan Implementasi

### Fase 1 — Fondasi dan Home

- [x] Tentukan visual direction: warna brand, typography, spacing, dan gaya gambar.
- [x] Tambahkan key site settings untuk konten Home dan SEO.
- [x] Perbarui form admin Site Settings beserta test.
- [x] Buat `HomeController`.
- [x] Ubah route `/` dari closure menjadi controller.
- [x] Buat kontrak/type data publik.
- [x] Buat `PublicLayout`, header, mobile navigation, dan footer.
- [x] Perbarui resolver layout pada `resources/js/app.tsx`.
- [x] Buat komponen shared publik.
- [x] Buat halaman `resources/js/pages/public/home.tsx`.
- [x] Implementasikan hero, paket unggulan, about ringkas, testimoni, dan CTA.
- [x] Tambahkan metadata Home.
- [x] Tambahkan feature test Home.
- [x] Jalankan production build.
- [ ] Uji responsivitas dan accessibility dasar.

### Fase 2 — Daftar dan Detail Paket

- [x] Tambahkan route dan controller package publik.
- [x] Buat halaman daftar package dengan pagination.
- [x] Buat halaman detail berdasarkan slug.
- [x] Buat gallery dan CTA WhatsApp package.
- [x] Tambahkan SEO package.
- [x] Tambahkan feature test daftar/detail package.

### Fase 3 — Booking Publik

- [ ] Tetapkan strategi pencocokan customer.
- [ ] Buat Form Request booking publik.
- [ ] Buat controller dan route submit booking.
- [ ] Terapkan transaction dan kalkulasi total di server.
- [ ] Terapkan rate limiter.
- [ ] Buat form React dengan state processing, error, dan success.
- [ ] Tambahkan pemberitahuan privasi singkat.
- [ ] Tambahkan feature test booking dan failure modes.

### Fase 4 — About, Contact, dan SEO Teknis

- [ ] Buat halaman About.
- [ ] Buat halaman Contact.
- [ ] Tambahkan canonical, Open Graph, dan metadata konsisten.
- [ ] Tambahkan sitemap package aktif dan robots configuration.
- [ ] Tambahkan error pages publik.

### Fase 5 — Finalisasi

- [ ] Audit query dan N+1.
- [ ] Audit ukuran/resolusi gambar.
- [ ] Audit accessibility.
- [ ] Audit keamanan booking.
- [ ] Uji browser dan ukuran layar utama.
- [x] Jalankan affected tests.
- [x] Jalankan test suite lengkap: 140 passed, 3 skipped, 712 assertions.
- [x] Jalankan formatter PHP untuk file PHP yang berubah.
- [x] Jalankan lint/type check frontend.
- [x] Jalankan `npm run build`.
- [x] Perbarui `readme.progress.md` setelah milestone selesai.

---

## 18. Rencana File

Perkiraan file baru atau berubah:

```text
app/Http/Controllers/HomeController.php
app/Http/Controllers/PublicPackageController.php
app/Http/Controllers/PublicBookingController.php
app/Http/Controllers/AboutController.php
app/Http/Controllers/ContactController.php
app/Http/Requests/StorePublicBookingRequest.php
app/Http/Controllers/Admin/SiteSettingController.php
app/Http/Requests/Admin/UpdateSiteSettingsRequest.php
routes/web.php
resources/js/app.tsx
resources/js/layouts/public-layout.tsx
resources/js/components/public/public-header.tsx
resources/js/components/public/public-mobile-navigation.tsx
resources/js/components/public/public-footer.tsx
resources/js/components/public/package-card.tsx
resources/js/components/public/testimonial-card.tsx
resources/js/components/public/section-heading.tsx
resources/js/components/public/whatsapp-button.tsx
resources/js/pages/public/home.tsx
resources/js/pages/public/packages/index.tsx
resources/js/pages/public/packages/show.tsx
resources/js/pages/public/about.tsx
resources/js/pages/public/contact.tsx
resources/js/types/public.ts
tests/Feature/Public/HomeTest.php
tests/Feature/Public/PackageTest.php
tests/Feature/Public/BookingTest.php
```

Daftar tersebut adalah rancangan, bukan kewajiban membuat seluruh file sekaligus. Gunakan struktur serta penamaan sibling file yang sudah ada ketika implementasi dimulai.

---

## 19. Definition of Done Landing Page Publik

Landing page publik dianggap selesai ketika:

- Semua route publik dapat digunakan tanpa login.
- Home, daftar package, detail package, About, dan Contact menggunakan layout publik yang konsisten.
- Konten bisnis utama berasal dari database dan dapat diperbarui admin.
- Hanya banner, package, dan testimonial aktif yang terlihat publik.
- Package nonaktif tidak dapat dibuka atau dipesan.
- Pengunjung dapat membuat booking valid dari detail package.
- Total booking dihitung server dan status awal selalu `pending`.
- Seluruh halaman memiliki title dan meta description yang tepat.
- Tampilan responsif dan fungsi utama dapat digunakan dengan keyboard.
- Tidak ada error console atau request gagal pada alur utama.
- Query utama bebas N+1 dan gambar memakai ukuran yang sesuai.
- Affected tests, lint/type check, dan production build berhasil.
- Empty state, validation state, rate-limit state, dan 404 state telah diuji.

---

## 20. Milestone Pertama yang Harus Dikerjakan

Fokus pertama adalah menyelesaikan Home sebagai vertical slice:

1. Perluas site settings untuk konten Home dan SEO.
2. Buat `PublicLayout` dan mapping layout publik.
3. Buat `HomeController` dengan query data aktif.
4. Ganti halaman starter `welcome` dengan `public/home`.
5. Implementasikan header, hero, paket unggulan, about ringkas, testimoni, CTA WhatsApp, dan footer.
6. Tambahkan feature test Home.
7. Verifikasi tampilan mobile/desktop dan jalankan production build.

Setelah milestone ini stabil, lanjutkan ke daftar package, detail package, lalu booking publik. Urutan ini mengurangi pekerjaan ulang karena layout, pola data, card, navigasi, formatter harga, media, dan metadata sudah tervalidasi terlebih dahulu di Home.
