# Invoice Generator — Backend

Backend API untuk Invoice Generator Micro-SaaS, dibangun dengan Go + Echo Framework.

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **Go 1.22+** | Language |
| **Echo v4** | HTTP Router & Middleware |
| **GORM** | ORM (MySQL) |
| **JWT (golang-jwt)** | Authentication via httpOnly cookie |
| **go-playground/validator** | Request validation |
| **Gotenberg** | HTML-to-PDF conversion |

## Struktur Folder

```
backend/
├── cmd/api/main.go           # Entry point
├── config/                   # Config & database connection
├── internal/
│   ├── models/               # GORM models
│   ├── dto/                  # Request/Response DTOs
│   ├── handlers/             # HTTP handlers
│   ├── middleware/           # JWT & CORS middleware
│   ├── services/             # Business logic (auth, invoice calc, PDF)
│   └── repository/           # Database operations
├── templates/                # HTML templates for PDF
├── uploads/                  # User uploaded files (logos)
├── Dockerfile
├── .env.example
└── go.mod
```

## Setup Lokal

### 1. Install Dependencies

```bash
go mod tidy
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env sesuai kebutuhan
```

### 3. Jalankan Database & Gotenberg

```bash
# Dari root project
docker compose up -d db gotenberg
```

### 4. Jalankan Server

```bash
go run cmd/api/main.go
```

Server akan berjalan di `http://localhost:8080`

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

### Auth (Public)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Register user baru |
| POST | `/auth/login` | Login & set JWT cookie |
| POST | `/auth/logout` | Logout & clear cookie |

### Auth (Protected)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/auth/me` | Get current user |

### Clients (Protected)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/clients` | List semua klien |
| GET | `/clients/:id` | Detail klien |
| POST | `/clients` | Buat klien baru |
| PUT | `/clients/:id` | Update klien |
| DELETE | `/clients/:id` | Hapus klien |

### Invoices (Protected)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/invoices` | List invoice (`?status=&page=&limit=`) |
| GET | `/invoices/:id` | Detail invoice + items + client |
| POST | `/invoices` | Buat invoice baru |
| PUT | `/invoices/:id` | Update invoice |
| DELETE | `/invoices/:id` | Soft delete |
| GET | `/invoices/:id/pdf` | Download PDF |

### Dashboard (Protected)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/dashboard/stats` | Statistik dashboard |

## Error Response Format

```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"]
  }
}
```

## Authentication

JWT disimpan di **httpOnly cookie** bernama `jwt`. Setiap request ke endpoint protected akan otomatis include cookie.

## Docker

### Build Image

```bash
docker build -t invoice-backend ./backend
```

### Run dengan Docker Compose (dari root)

```bash
docker compose up -d
```

## Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `PORT` | `8080` | Server port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `rootpassword` | MySQL password |
| `DB_NAME` | `invoice_app` | Database name |
| `JWT_SECRET` | `dev-secret-...` | JWT signing key |
| `GOTENBERG_URL` | `http://localhost:3001` | Gotenberg service URL |
| `UPLOAD_DIR` | `./uploads` | Directory untuk file uploads |
