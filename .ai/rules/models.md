---
paths:
  - app/Models/User.php
  - 'app/Models/*.php'
---

# Models

## User model menggunakan HasRoles dari Spatie Permission
User model menggunakan trait HasRoles dari Spatie\Permission\Traits\HasRoles. Role yang tersedia: admin (28 permissions) dan staff (15 permissions). Middleware role, permission, dan role_or_permission sudah didaftarkan di bootstrap/app.php. Semua route admin dilindungi dengan middleware(['auth', 'role:admin|staff']).

## Media Library collections per model
Banner: collection 'image' (singleFile), konversi 'thumb' 400x225. Package: collection 'cover' (singleFile) + 'gallery' (multiple), konversi 'thumb' 600x400 dan 'hero' 1200x675. Testimonial: collection 'photo' (singleFile), konversi 'avatar' 120x120. Semua konversi pakai nonQueued(). Untuk upload media gunakan addMediaFromRequest() lalu toMediaCollection('nama_collection').
