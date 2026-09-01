---
paths:
  - routes/admin.php
---

# Routes

## Route admin wajib middleware auth + role:admin|staff
Semua route admin wajib menggunakan middleware(['auth', 'role:admin|staff']). Jangan gunakan middleware auth saja. Role dibuat dan diassign melalui RoleAndPermissionSeeder. Untuk test route admin yang mengembalikan Inertia response, hindari assertOk() tanpa build Vite — gunakan assertForbidden() untuk test block, atau test role assignment secara langsung via hasRole/hasAnyRole.
