# Invoice Generator

Micro-SaaS generator invoice berbasis web untuk freelancer dan UMKM di Indonesia. Buat invoice profesional, kelola klien, download PDF, dan lacak status pembayaran — semua dalam satu aplikasi.

**🌐 Demo:** [https://bonku.alvinade.studio/](https://bonku.alvinade.studio/)

---

## Features

- ✅ **Autentikasi** — Register/Login dengan JWT (httpOnly cookie)
- ✅ **Profil Bisnis** — Nama, alamat, NPWP, telepon, logo
- ✅ **Manajemen Klien** — CRUD data klien
- ✅ **Invoice** — Buat invoice dengan multiple items, auto-calculation subtotal/pajak/total
- ✅ **Status Tracking** — `draft`, `sent`, `paid`, `cancelled`
- ✅ **PDF Generation** — Generate & download invoice sebagai PDF via Gotenberg
- ✅ **Dashboard** — Statistik ringkas & filter invoice
- ✅ **Multi-user** — Setiap user hanya mengakses data miliknya

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, SweetAlert2 |
| **Backend** | Go 1.22+, Echo v4, GORM, go-playground/validator |
| **Database** | MySQL 8.0 |
| **PDF Engine** | Gotenberg (HTML-to-PDF) |
| **Auth** | JWT HS256 in httpOnly cookie |
| **Container** | Docker & Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────┐
│              Browser (Next.js)          │
│         Port 3000 (HTTPS/HTTP)          │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌────────────────┐   ┌──────────────────┐
│  Frontend      │   │  Go Backend      │
│  Next.js :3000 │   │  Echo :8080      │
└────────────────┘   └───────┬──────────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
          ┌───────────────┐    ┌──────────────┐
          │  MySQL 8      │    │  Gotenberg   │
          │  :3306        │    │  :3000       │
          └───────────────┘    └──────────────┘
```

---

## Local Installation

### Prerequisites

- Docker & Docker Compose v2+
- Node.js 20+ (untuk development frontend)
- Go 1.22+ (untuk development backend)

### Quick Start (Docker)

```bash
# 1. Clone repository
git clone <repository-url>
cd invoice_generator

# 2. Copy environment (optional, defaults provided)
cp backend/.env.example backend/.env

# 3. Start all services
docker compose up -d --build

# 4. Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

### Development (Without Docker)

**Backend:**
```bash
cd backend
GOTOOLCHAIN=local go run ./cmd/api/
# Server runs on :8080
```

**Frontend:**
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1 npm run dev
# Dev server runs on :3000
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Backend port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `rootpassword` | MySQL password |
| `DB_NAME` | `invoice_app` | Database name |
| `JWT_SECRET` | `dev-secret...` | JWT signing key |
| `GOTENBERG_URL` | `http://localhost:3001` | Gotenberg URL |
| `UPLOAD_DIR` | `./uploads` | Logo upload directory |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | API base URL |

---

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (sets JWT cookie) |
| POST | `/auth/logout` | Logout (clears cookie) |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/profile` | Update user profile |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List all clients |
| GET | `/clients/:id` | Get client detail |
| POST | `/clients` | Create client |
| PUT | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Delete client |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | List invoices (`?status=&page=&limit=`) |
| GET | `/invoices/:id` | Get invoice detail with items |
| POST | `/invoices` | Create invoice |
| PUT | `/invoices/:id` | Update invoice |
| DELETE | `/invoices/:id` | Soft delete invoice |
| GET | `/invoices/:id/pdf` | Download PDF |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |

---

## Project Structure

```
invoice_generator/
├── backend/
│   ├── cmd/api/           # Entry point (main.go)
│   ├── config/            # Database & config
│   ├── internal/
│   │   ├── handlers/      # HTTP handlers (Echo)
│   │   ├── services/      # Business logic (PDF, calculations)
│   │   ├── repository/    # Database operations (GORM)
│   │   ├── models/        # GORM models
│   │   ├── middleware/    # JWT auth middleware
│   │   └── dto/           # Request/Response structs
│   ├── templates/         # HTML template for PDF
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── app/
│   │   ├── (auth)/        # Login, Register
│   │   └── (dashboard)/   # Dashboard, Invoices, Clients, Settings
│   ├── lib/
│   │   ├── api.ts         # API client
│   │   ├── types.ts       # TypeScript types
│   │   ├── store.ts       # Zustand store
│   │   ├── utils.ts       # Helpers (formatCurrency, formatDate)
│   │   └── toast.ts       # SweetAlert2 wrapper
│   └── middleware.ts       # Auth guard
├── docker-compose.yml
└── prd.md
```

---

## Demo Credentials

Visit [https://bonku.alvinade.studio/](https://bonku.alvinade.studio/) and register a new account, or use the demo account if available.

---

## License

MIT
