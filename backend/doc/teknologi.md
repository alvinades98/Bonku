# Teknologi Backend — Invoice Generator

Ringkasan teknologi yang digunakan untuk backend (MVP → production-ready):

## Core Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Go** | 1.22+ | Language utama |
| **Echo** | v4.x | HTTP Router & Middleware framework |
| **GORM** | v2.x | ORM (Object Relational Mapper) |
| **MySQL** | 8.0 | Database utama |

## Auth & Security

| Teknologi | Kegunaan |
|-----------|----------|
| **golang-jwt/jwt** | JWT HS256 token generation & validation |
| **bcrypt** | Password hashing (golang.org/x/crypto) |

## Validation

| Teknologi | Kegunaan |
|-----------|----------|
| **go-playground/validator** | Struct validation dengan tag (`validate:"required,email"`) |

## PDF Generation

| Teknologi | Kegunaan |
|-----------|----------|
| **Gotenberg** | HTML-to-PDF conversion service (Dockerized) |
| **html/template** | Go template engine untuk render HTML invoice |

## Dev Tools

| Teknologi | Kegunaan |
|-----------|----------|
| **go mod** | Dependency management |
| **go vet** | Static code analysis |
| **go build** | Compiler |

## Container

| Teknologi | Kegunaan |
|-----------|----------|
| **Docker** + **Docker Compose** | Containerization & orchestration |
| **Alpine** | Base image (minimal footprint) |

---

## Arsitektur Backend

### Layer Architecture

```
┌─────────────────────────────────────────────────┐
│                  HTTP Layer                      │
│  Echo Router + Middleware (CORS, Logger, JWT)   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                Handler Layer                     │
│  auth_handler, client_handler, invoice_handler  │
└──────────────────────┬──────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Service   │ │   Service   │ │   Service   │
│   (Auth)    │ │ (Invoice)   │ │   (PDF)     │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       ▼               ▼               ▼
┌─────────────────────────────────────────────────┐
│              Repository Layer                    │
│  user_repo, client_repo, invoice_repo (GORM)    │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                Database Layer                    │
│                  MySQL 8.0                       │
└─────────────────────────────────────────────────┘
```

### Struktur Folder

```
backend/
├── cmd/api/                        # Entry point
│   └── main.go                     #   Bootstrap: config → DB → routes → start
├── config/                         # Configuration
│   ├── config.go                   #   Env loader
│   └── database.go                 #   GORM init & connection pool
├── internal/                       # Internal packages (tidak di-export)
│   ├── models/                     # GORM models (schema definition)
│   ├── dto/                        # Data Transfer Objects (request/response)
│   ├── handlers/                   # HTTP handlers (Echo context → JSON response)
│   ├── middleware/                 # HTTP middleware (JWT, CORS)
│   ├── services/                   # Business logic (calculation, PDF, auth)
│   └── repository/                 # Database operations (GORM queries)
├── templates/                      # HTML templates
│   └── invoice.html                #   Template untuk PDF generation
├── uploads/                        # Uploaded files (logos)
├── Dockerfile                      # Multi-stage Docker build
└── go.mod                          # Module definition & dependencies
```

---

## Dependency Graph

```
main.go
├── config (LoadConfig, InitDB)
├── models (AutoMigrate)
├── middleware (CORS, JWT)
├── repository (UserRepo, ClientRepo, InvoiceRepo)
├── services (AuthService, InvoiceService, PDFService)
└── handlers (AuthHandler, ClientHandler, InvoiceHandler)
```

---

## Environment Variables

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `PORT` | Server listening port | `8080` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `rootpassword` |
| `DB_NAME` | Database name | `invoice_app` |
| `JWT_SECRET` | JWT signing key | `dev-secret-change-in-production` |
| `GOTENBERG_URL` | Gotenberg service URL | `http://localhost:3001` |
| `UPLOAD_DIR` | Upload directory | `./uploads` |

---

## Database Schema

### ERD (Simplified)

```
users ||--o{ clients : has
users ||--o{ invoices : creates
clients ||--o{ invoices : receives
invoices ||--|{ invoice_items : contains
```

### Tables

| Table | Primary Key | Foreign Keys | Soft Delete |
|-------|-------------|--------------|-------------|
| `users` | `id` | — | No |
| `clients` | `id` | `user_id → users.id` (CASCADE) | No |
| `invoices` | `id` | `user_id → users.id` (CASCADE), `client_id → clients.id` (RESTRICT) | Yes (`deleted_at`) |
| `invoice_items` | `id` | `invoice_id → invoices.id` (CASCADE) | No |

---

## Authentication Flow

```
[Client] POST /auth/login {email, password}
    │
[Backend] Query user by email
    │
[Backend] Compare password (bcrypt)
    │
[Backend] Generate JWT (HS256, 24h expiry)
    │
[Backend] Set httpOnly cookie: jwt=<token>
    │
[Client] Cookie tersimpan otomatis
    │
[Client] Setiap request selanjutnya include cookie
    │
[Backend] JWT middleware extract & validate cookie
    │
[Backend] Inject user_id ke context → handler process
```

---

## PDF Generation Flow

```
[Client] GET /invoices/:id/pdf
    │
[Backend] Auth middleware (validate JWT)
    │
[Backend] Query Invoice + Client + Items + User
    │
[Backend] Render HTML template (html/template)
    │
[Backend] POST HTML ke Gotenberg API
    │
[Gotenberg] Convert HTML → PDF (Chromium)
    │
[Backend] Stream PDF bytes ke client
    │
[Client] Download file INV-XXX.pdf
```

---

## Development

```bash
# Install dependencies
go mod tidy

# Run dev server
go run cmd/api/main.go

# Build for production
go build ./cmd/api/

# Run vet
go vet ./...

# Run tests
go test ./...
```

## Docker

```bash
# Build image
docker build -t invoice-backend ./backend

# Run container
docker run -p 8080:8080 invoice-backend

# Full stack (dari root)
docker compose up -d
```

## Production Deployment

Dockerfile menggunakan **multi-stage build**:
- Stage 1 (`builder`): `golang:1.22-alpine` → compile binary
- Stage 2 (`runner`): `alpine:latest` → copy binary + templates

Hasil: Image minimal ~15MB, hanya butuh binary compiled, tidak perlu Go runtime.

## Catatan Penting

- **JWT di httpOnly Cookie**: XSS-proof, tidak accessible via JavaScript
- **CORS Strict**: Hanya allow `http://localhost:3000` di development
- **User-Scoped Data**: Setiap query dilengkapi `WHERE user_id = ?` — user tidak bisa akses data user lain
- **Soft Delete**: Invoice menggunakan `gorm.DeletedAt` — data tidak benar-benar hilang
- **Transaction**: Create/Update invoice menggunakan GORM transaction untuk atomicity
- **Auto-Migrate**: Schema otomatis dibuat/updated saat server start
- **Gotenberg Internal**: Di production, Gotenberg hanya accessible dari backend (Docker network internal)
