# Dokumentasi Backend — Invoice Generator

Selamat datang di dokumentasi backend Invoice Generator. Berikut adalah daftar dokumen yang tersedia:

---

## 📚 Daftar Dokumentasi

| Dokumen | Deskripsi | Untuk Siapa |
|---------|-----------|-------------|
| [Setup & Running](setup.md) | Panduan instalasi, setup environment, dan menjalankan project | **Pengembang baru** — mulai dari sini |
| [Teknologi](teknologi.md) | Stack teknologi, arsitektur, dan deployment overview | Arsitek, tech lead |
| [Pola Koding](pola-koding.md) | Konvensi koding, struktur folder, best practices | **Semua pengembang** |
| [API Guide](api-guide.md) | Spesifikasi REST API lengkap dengan request/response | Pengembang frontend, tester |

---

## 🚀 Quick Start untuk Pengembang Baru

1. **Baca [Setup & Running](setup.md)** — install Go, setup env, jalankan server
2. **Baca [Pola Koding](pola-koding.md)** — pahami struktur dan konvensi project
3. **Baca [API Guide](api-guide.md)** — pahami endpoint yang tersedia
4. **Mulai coding** — ikuti pola yang sudah ada

## 📖 Dokumentasi Terkait

- [PRD (Product Requirements Document)](../prd.md) — Spesifikasi produk lengkap
- [Frontend Documentation](../frontend/doc/) — Dokumentasi frontend Next.js

---

## 🗂️ Struktur Singkat

```
backend/
├── cmd/api/              # Entry point (main.go)
├── config/               # Config & database connection
├── internal/
│   ├── models/           # GORM models
│   ├── dto/              # Request/Response DTOs
│   ├── handlers/         # HTTP handlers (Echo)
│   ├── middleware/       # Auth JWT & CORS
│   ├── services/         # Business logic
│   └── repository/       # Database operations
├── templates/            # HTML templates untuk PDF
├── uploads/              # User uploaded files
├── doc/                  # Documentation (folder ini)
├── Dockerfile
├── .env.example
└── go.mod
```

---

## 📝 Changelog Dokumentasi

| Tanggal | Perubahan |
|---------|-----------|
| 2024-06-01 | Dokumentasi awal dibuat — setup, teknologi, pola koding, API guide |
