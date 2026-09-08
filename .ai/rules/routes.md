---
paths:
  - routes/admin.php
  - routes/web.php
---

# Routes

## Route admin wajib middleware auth + role:admin|staff
Semua route admin wajib menggunakan middleware(['auth', 'role:admin|staff']). Jangan gunakan middleware auth saja. Role dibuat dan diassign melalui RoleAndPermissionSeeder. Untuk test route admin yang mengembalikan Inertia response, hindari assertOk() tanpa build Vite — gunakan assertForbidden() untuk test block, atau test role assignment secara langsung via hasRole/hasAnyRole.

## Robots publik dinamis dan URL SEO
robots.txt dilayani route Laravel agar mengikuti config seo.indexable; jangan membuat kembali public/robots.txt karena file statis akan melewati route. Canonical dan sitemap memakai APP_URL, bukan host request; pagination mempertahankan page tetapi membuang parameter pelacakan. Metadata HTML fallback memakai data-inertia yang sama dengan head-key React agar tidak duplikat saat navigasi.
