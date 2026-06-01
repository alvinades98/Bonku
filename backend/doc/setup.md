# Setup & Running — Backend

Panduan lengkap untuk menjalankan backend Invoice Generator secara lokal.

---

## Prerequisites

| Software | Versi Minimum | Cara Install |
|----------|---------------|--------------|
| **Go** | 1.22.x | [golang.org/dl](https://golang.org/dl/) atau `brew install go` |
| **Docker** | 24.x | [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| **MySQL** | 8.0 | Via Docker (direkomendasikan) atau install lokal |

### Cek Versi

```bash
go version      # go1.22.x
docker --version # Docker version 24.x.x
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
go mod tidy
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=invoice_app
JWT_SECRET=dev-secret-change-in-production
GOTENBERG_URL=http://localhost:3001
UPLOAD_DIR=./uploads
```

### 3. Jalankan Database & Gotenberg

Menggunakan Docker Compose dari root project:

```bash
# Dari root project
docker compose up -d db gotenberg
```

Atau jalankan MySQL secara manual:

```bash
docker run -d \
  --name invoice_db \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=invoice_app \
  -p 3306:3306 \
  mysql:8.0
```

### 4. Jalankan Development Server

```bash
go run cmd/api/main.go
```

Server akan berjalan di **http://localhost:8080**

### 5. Test Server

```bash
# Health check
curl http://localhost:8080/health

# Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

---

## Scripts & Commands

| Command | Deskripsi |
|---------|-----------|
| `go mod tidy` | Install/update dependencies |
| `go run cmd/api/main.go` | Jalankan development server |
| `go build ./cmd/api/` | Build binary production |
| `go vet ./...` | Cek code quality |
| `go test ./...` | Jalankan unit tests |

---

## Docker

### Build Image

```bash
docker build -t invoice-backend ./backend
```

### Jalankan Container

```bash
docker run -d \
  --name invoice_backend \
  -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=root \
  -e DB_PASSWORD=rootpassword \
  -e DB_NAME=invoice_app \
  -e JWT_SECRET=dev-secret \
  -e GOTENBERG_URL=http://host.docker.internal:3001 \
  invoice-backend
```

### Docker Compose (Full Stack)

Dari root project:

```bash
# Jalankan semua service
docker compose up --build

# Background mode
docker compose up -d

# Lihat logs
docker compose logs -f backend

# Stop semua
docker compose down
```

---

## Development Workflow

### 1. Buat Branch Baru

```bash
git checkout -b feature/nama-fitur
```

### 2. Jalankan Vet Sebelum Commit

```bash
go vet ./...
```

### 3. Test Build

```bash
go build ./cmd/api/
```

Pastikan tidak ada error sebelum push.

### 4. Commit

```bash
git add .
git commit -m "feat: deskripsi perubahan"
git push origin feature/nama-fitur
```

---

## Troubleshooting

### Port 8080 Sudah Digunakan

```bash
# Cari proses yang pakai port 8080
lsof -i :8080

# Kill proses
kill -9 <PID>

# Atau pakai port lain
PORT=8081 go run cmd/api/main.go
```

### Database Connection Failed

```bash
# Cek MySQL berjalan
docker ps | grep invoice_db

# Cek koneksi
mysql -h localhost -u root -prootpassword -e "SHOW DATABASES;"

# Cek logs
docker compose logs db
```

### Module Not Found

```bash
# Clean module cache
go clean -modcache

# Reinstall
go mod tidy
```

### Migration Error

```bash
# Drop database dan recreate
mysql -h localhost -u root -prootpassword -e "DROP DATABASE invoice_app; CREATE DATABASE invoice_app;"

# Restart server (auto-migrate ulang)
go run cmd/api/main.go
```

### Gotenberg Connection Refused

```bash
# Cek Gotenberg berjalan
docker ps | grep gotenberg

# Test endpoint
curl http://localhost:3001/health
```

---

## Struktur Project

```
backend/
├── cmd/api/
│   └── main.go                 # Entry point — bootstrap & routing
├── config/
│   ├── config.go               # Environment config
│   └── database.go             # GORM connection & pool
├── internal/
│   ├── models/                 # GORM models
│   │   ├── user.go             #   User table
│   │   ├── client.go           #   Client table
│   │   ├── invoice.go          #   Invoice table
│   │   └── invoice_item.go     #   Invoice items table
│   ├── dto/                    # Request/Response structs
│   │   ├── auth_dto.go         #   Auth request/response
│   │   ├── client_dto.go       #   Client request/response
│   │   ├── invoice_dto.go      #   Invoice request/response
│   │   └── error_dto.go        #   Unified error format
│   ├── handlers/               # HTTP handlers (Echo controllers)
│   │   ├── auth_handler.go     #   Register, login, logout, me
│   │   ├── client_handler.go   #   Client CRUD
│   │   └── invoice_handler.go  #   Invoice CRUD + PDF + stats
│   ├── middleware/             # HTTP middleware
│   │   ├── auth.go             #   JWT validation from cookie
│   │   └── cors.go             #   CORS configuration
│   ├── services/               # Business logic
│   │   ├── auth_service.go     #   Password hash, JWT generation
│   │   ├── invoice_service.go  #   Calculation (subtotal, tax)
│   │   └── pdf_service.go      #   HTML template → Gotenberg → PDF
│   └── repository/             # Database operations
│       ├── user_repo.go        #   User queries
│       ├── client_repo.go      #   Client queries
│       └── invoice_repo.go     #   Invoice queries + stats
├── templates/
│   └── invoice.html            # HTML template untuk PDF generation
├── uploads/                    # Directory untuk logo uploads
├── doc/                        # Documentation
├── Dockerfile                  # Multi-stage Docker build
├── .env.example                # Environment variables template
├── .gitignore
├── go.mod
├── go.sum
└── README.md
```

---

## Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `PORT` | `8080` | Server listening port |
| `DB_HOST` | `localhost` | MySQL host address |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | `rootpassword` | MySQL password |
| `DB_NAME` | `invoice_app` | Database name |
| `JWT_SECRET` | `dev-secret-change-in-production` | JWT signing key (ganti di production!) |
| `GOTENBERG_URL` | `http://localhost:3001` | Gotenberg service URL |
| `UPLOAD_DIR` | `./uploads` | Directory untuk menyimpan uploaded files |

---

## Production Build

### Build Binary

```bash
# Build untuk Linux
CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Build untuk macOS
GOOS=darwin go build -o main ./cmd/api
```

### Docker Production

```bash
docker compose up -d
```

Dockerfile menggunakan **multi-stage build** — image yang dihasilkan minimal (~15MB) karena hanya mengandung binary compiled dan templates.

---

## Frontend Connection

Backend berjalan di `http://localhost:8080` dan melayani API di `/api/v1/*`.

### CORS

Backend mengizinkan origin `http://localhost:3000` (frontend Next.js). Konfigurasi CORS ada di `internal/middleware/cors.go`.

### Authentication

JWT disimpan di **httpOnly cookie** bernama `jwt`. Frontend mengirim cookie otomatis via `credentials: 'include'`.

---

## Dokumentasi Lainnya

- [Teknologi](teknologi.md) — Stack & arsitektur
- [Pola Koding](pola-koding.md) — Konvensi & best practices
- [API Guide](api-guide.md) — Spesifikasi REST API lengkap
- [PRD](../prd.md) — Product Requirements Document
