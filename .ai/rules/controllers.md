---
paths:
    - app/Http/Controllers/PublicBookingController.php
---

# Controllers

## Booking publik adalah pengajuan tanpa verifikasi identitas

Booking publik tanpa login/OTP adalah pengajuan pending yang dikonfirmasi admin. Nomor telepon bukan bukti kepemilikan: jangan menimpa kontak customer lama dari form publik; gunakan kembali customer hanya jika seluruh kontak cocok, selain itu simpan customer terpisah. Batas publik 1–50 peserta, tanggal mulai hari ini menurut app.timezone. Token pengajuan harus tetap mencegah duplikasi walaupun sesi browser berubah.
