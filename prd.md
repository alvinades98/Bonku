Berikut **Product Requirements Document (PRD)** lengkap untuk **Invoice Generator Micro-SaaS** sesuai tech stack yang kamu inginkan: **Next.js** (Frontend), **Golang** (Backend), **MySQL** (Database), dan deployment via **Docker Compose**.

---

# PRD: INVOICE GENERATOR MVP

**Versi:** 1.0  
**Status:** Draft  
**Target Launch:** 4–6 Minggu  

---

## 1. Executive Summary

Produk ini adalah Micro-SaaS generator invoice berbasis web yang ditujukan untuk freelancer dan UMKM di Indonesia. Pengguna dapat membuat invoice profesional dengan perhitungan pajak (PPN/PPh opsional), menyimpan data klien, mengunduh PDF, dan melacak status pembayaran.

### Ruang Lingkup MVP
| Fitur | Status MVP |
|-------|------------|
| Autentikasi JWT (Register/Login) | ✅ |
| Manajemen Data Bisnis & Logo | ✅ |
| Manajemen Klien (CRUD) | ✅ |
| Membuat Invoice + Multiple Items | ✅ |
| Generate & Download PDF | ✅ |
| Dashboard & Status Invoice | ✅ |
| Payment Gateway / e-Faktur | ❌ (Future) |

---

## 2. Persona & User Stories

**Persona:** Budi, Freelance Designer, mengelola 10–20 klien/bulan.  
- *Sebagai* pengguna, *saya ingin* membuat invoice dalam 2 menit, *agar* saya bisa langsung kirim ke klien via WhatsApp/Email.
- *Sebagai* pengguna, *saya ingin* invoice saya terhitung PPN 11% otomatis, *agar* saya tidak salah perhitungan pajak.

---

## 3. Functional Requirements (FR)

### FR-001: Autentikasi & Otorisasi
- Register dengan email & password (hash bcrypt).
- Login mengembalikan JWT Access Token (disimpan di `httpOnly cookie`).
- Middleware proteksi endpoint.
- Setiap user hanya bisa mengakses data miliknya (user-scoped).

### FR-002: Profil Bisnis
- User mengisi: Nama bisnis, alamat, NPWP (opsional), telepon, logo (upload ke storage lokal/volume Docker untuk MVP).
- Data ini muncul otomatis di header setiap invoice.

### FR-003: Manajemen Klien
- CRUD klien: Nama, email, telepon, alamat lengkap.
- Select klien saat membuat invoice (autocomplete).

### FR-004: Manajemen Invoice
- Field invoice:
  - Nomor Invoice (auto-generate: `INV-001`, editable)
  - Tanggal Terbit, Tanggal Jatuh Tempo
  - Pilihan Klien
  - Daftar Item (deskripsi, qty, harga satuan, jumlah)
  - Subtotal, Pajak (toggle on/off, persen editable default 11%), Total
  - Catatan/Keterangan
  - Status: `draft`, `sent`, `paid`, `cancelled`
- Soft delete untuk invoice.

### FR-005: Generate PDF
- Tombol "Preview" membuka halaman preview invoice.
- Tombol "Download PDF" memicu proses:
  1. Frontend request ke Backend.
  2. Backend mengambil data invoice + user + client.
  3. Backend render template HTML/CSS (Go template engine).
  4. Backend kirim HTML ke **Gotenberg** (PDF Service) via HTTP API.
  5. Backend menerima file PDF dan mengirimkannya ke Frontend.
  6. Frontend memicu unduhan file `.pdf`.

### FR-006: Dashboard
- Tabel list invoice dengan filter status.
- Statistik sederhana: Total invoice bulan ini, Outstanding (belum dibayar), Paid.

---

## 4. Non-Functional Requirements (NFR)

| ID | Kriteria | Target |
|----|----------|--------|
| NFR-001 | Deployment | 100% via Docker Compose (`docker compose up -d`) |
| NFR-002 | Response Time | API < 300ms (exclude PDF generation < 3s) |
| NFR-003 | Concurrency | Support hingga 100 concurrent users |
| NFR-004 | Storage | PDF temporary disimpan di memory/streaming, logo di volume Docker |
| NFR-005 | Code Quality | Strict TypeScript, Go mod tidy, GORM migration otomatis |

---

## 5. Technical Architecture

### Stack Detail

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| **Frontend** | Next.js 14+ (App Router) | TypeScript, Tailwind CSS, shadcn/ui |
| **State Management** | TanStack Query (React Query) | Server state & caching |
| **Form & Validasi** | React Hook Form + Zod | Client & server validation |
| **HTTP Client** | Axios / Fetch | WithCredentials untuk cookie |
| **Backend** | Go 1.22+ | Echo Framework (HTTP Router & Middleware) |
| **ORM** | GORM v2 | MySQL dialect, auto-migrate |
| **Auth** | golang-jwt | JWT HS256, stored in httpOnly cookie |
| **Validation** | go-playground/validator | Struct validation |
| **PDF Engine** | Gotenberg | Dockerized HTML-to-PDF service |
| **Database** | MySQL 8.0 | InnoDB, utf8mb4_unicode_ci |
| **Container** | Docker & Docker Compose | Multi-stage build |

### Arsitektur Container (Docker Compose)

```
┌─────────────────┐
│   Nginx (80)    │  <-- Reverse Proxy (Opsional)
│  / --> Next.js  │
│ /api --> Go     │
└────────┬────────┘
         │
    ┌────┴────┬────────────┐
    ▼         ▼            ▼
┌────────┐ ┌────────┐  ┌──────────┐
│ Next.js│ │  Go    │  │ MySQL 8  │
│ :3000  │ │ :8080  │  │ :3306    │
└────────┘ └───┬────┘  └──────────┘
               │
          ┌────┴────┐
          ▼         ▼
      ┌────────┐ ┌──────────┐
      │Gotenberg│ │  Volume  │
      │ :3000  │ │mysql_data│
      └────────┘ └──────────┘
```

---

## 6. Database Design (MySQL)

### ERD (Simplified)
```
users ||--o{ clients : has
users ||--o{ invoices : creates
clients ||--o{ invoices : receives
invoices ||--|{ invoice_items : contains
```

### Schema SQL

```sql
CREATE DATABASE IF NOT EXISTS invoice_app 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE invoice_app;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    company_address TEXT,
    company_phone VARCHAR(20),
    npwp VARCHAR(50),
    company_logo_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE clients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE invoices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    client_id BIGINT UNSIGNED NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft','sent','paid','cancelled') DEFAULT 'draft',
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    UNIQUE KEY uk_user_invoice_number (user_id, invoice_number)
) ENGINE=InnoDB;

CREATE TABLE invoice_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT UNSIGNED NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice_id (invoice_id)
) ENGINE=InnoDB;
```

---

## 7. API Specification (REST)

Base Path: `http://localhost:8080/api/v1`

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Body: `{email, password, name}` |
| POST | `/auth/login` | Body: `{email, password}`, Set cookie JWT |
| POST | `/auth/logout` | Hapus cookie |
| GET | `/auth/me` | Data user login saat ini |

### Clients
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/clients` | List klien milik user |
| GET | `/clients/:id` | Detail klien |
| POST | `/clients` | Buat klien baru |
| PUT | `/clients/:id` | Update klien |
| DELETE | `/clients/:id` | Hapus klien |

### Invoices
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/invoices` | Query params: `?status=&page=&limit=` |
| GET | `/invoices/:id` | Detail invoice dengan items |
| POST | `/invoices` | Buat invoice (include `items` array) |
| PUT | `/invoices/:id` | Update invoice & items |
| DELETE | `/invoices/:id` | Soft delete |
| GET | `/invoices/:id/pdf` | **Generate & download PDF** |

### Example Response: GET /invoices/:id
```json
{
  "id": 1,
  "invoice_number": "INV-001",
  "issue_date": "2024-05-20",
  "due_date": "2024-06-20",
  "status": "sent",
  "subtotal": 5000000,
  "tax_percent": 11,
  "tax_amount": 550000,
  "total": 5550000,
  "notes": "Pembayaran via transfer BCA",
  "user": { "company_name": "Budi Design", ... },
  "client": { "name": "PT Maju Jaya", ... },
  "items": [
    { "description": "Logo Design", "quantity": 1, "unit_price": 5000000, "amount": 5000000 }
  ]
}
```

---

## 8. Frontend Specification (Next.js)

### Routing (App Router)
| Path | Halaman |
|------|---------|
| `/login` | Form login |
| `/register` | Form register |
| `/dashboard` | Ringkasan statistik |
| `/dashboard/invoices` | List invoice |
| `/dashboard/invoices/new` | Form buat invoice |
| `/dashboard/invoices/[id]` | Edit invoice |
| `/dashboard/invoices/[id]/preview` | Preview invoice (UI mirip PDF) |
| `/dashboard/clients` | Manajemen klien |
| `/dashboard/settings` | Profil bisnis & upload logo |

### State & Logic
- **Autentikasi:** Context/Provider cek cookie `httpOnly`. Jika 401 di middleware, redirect ke `/login`.
- **Form Invoice:** Dynamic field items (tambah/hapus baris). Kalkulasi total real-time di client (untuk UX), tapi source of truth tetap dari backend saat save.
- **Download PDF:** `window.open('/backend-url/invoices/${id}/pdf', '_blank')` atau fetch blob lalu trigger download.

### UI/UX
- **Component Library:** shadcn/ui (Button, Input, Table, Dialog, Date Picker, Select).
- **Icon:** Lucide React.
- **Toast:** Sonner (notifikasi sukses/error).

---

## 9. Docker Compose Specification

### Project Structure
```
invoice-app/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── go.mod
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── next.config.js
│   └── ...
└── uploads/ (volume untuk logo)
```

### `docker-compose.yml`

```yaml
version: "3.8"

services:
  db:
    image: mysql:8.0
    container_name: invoice_db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: invoice_app
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass123
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - invoice-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  gotenberg:
    image: gotenberg/gotenberg:8
    container_name: invoice_gotenberg
    restart: unless-stopped
    ports:
      - "3001:3000"
    networks:
      - invoice-network
    command:
      - "gotenberg"
      - "--api-port=3000"
      - "--chromium-disable-javascript=true"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: invoice_backend
    restart: unless-stopped
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: appuser
      DB_PASSWORD: apppass123
      DB_NAME: invoice_app
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      GOTENBERG_URL: http://gotenberg:3000
    ports:
      - "8080:8080"
    volumes:
      - uploads:/app/uploads
    depends_on:
      db:
        condition: service_healthy
      gotenberg:
        condition: service_started
    networks:
      - invoice-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: invoice_frontend
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - invoice-network

volumes:
  mysql_data:
  uploads:

networks:
  invoice-network:
    driver: bridge
```

### `backend/Dockerfile` (Go Multi-stage)

```dockerfile
# Stage 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Stage 2: Run
FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/main .
RUN mkdir -p /app/uploads
EXPOSE 8080
CMD ["./main"]
```

### `frontend/Dockerfile` (Next.js Standalone)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

> **Catatan Next.js:** Pastikan di `next.config.mjs` sudah ada:
> ```js
> const nextConfig = {
>   output: 'standalone',
> }
> export default nextConfig
> ```

---

## 10. Alur Generate PDF (Detail)

```
[User] Klik Download
   │
[Next.js] Fetch GET /api/v1/invoices/123/pdf (withCredentials)
   │
[Go Echo] Auth Middleware
   │
[Go Handler] Query Invoice + Items + User + Client
   │
[Go Service] Render HTML menggunakan `html/template`
             Template: `/templates/invoice.html`
             Data: struct InvoiceData
   │
[Go HTTP Client] POST HTML ke Gotenberg 
                 Endpoint: /forms/chromium/convert/html
   │
[Gotenberg] Render HTML dengan Chromium → Output PDF bytes
   │
[Go Handler] c.Data(http.StatusOK, "application/pdf", pdfBytes)
   │
[Browser] Trigger download file `INV-001.pdf`
```

### Contoh Template Var (Go)
```go
type InvoicePDFData struct {
    Invoice      models.Invoice
    Items        []models.InvoiceItem
    User         models.User
    Client       models.Client
    SubtotalStr  string // format rupiah
    TaxAmountStr string
    TotalStr     string
}
```

---

## 11. Milestone & Roadmap

| Minggu | Deliverable |
|--------|-------------|
| **Week 1** | Setup Docker Compose, Koneksi DB, Backend Auth API (Register/Login), Middleware JWT |
| **Week 2** | Backend CRUD Clients & Invoices + Items, Auto-calculation logic, GORM Migration |
| **Week 3** | Integrasi Gotenberg PDF, HTML Template Invoice, Upload logo endpoint |
| **Week 4** | Frontend Next.js (Auth pages, Dashboard, Form Invoice), Integrasi API |
| **Week 5** | Preview Invoice UI, Download PDF flow, Polish UI/UX, Bug fixing |
| **Week 6** | Testing end-to-end, Deploy staging, Persiapan launch |

---

## 12. Pertimbangan Keamanan

1. **JWT di HttpOnly Cookie:** Hindari XSS dengan tidak menyimpan token di `localStorage`.
2. **CORS:** Konfigurasi strict di Echo, hanya allow origin frontend.
3. **SQL Injection:** GORM menggunakan parameterized query by default.
4. **File Upload:** Validasi tipe file logo (hanya JPG/PNG), batasi ukuran < 2MB, simpan dengan nama random (UUID).
5. **PDF Service:** Gotenberg di-internal network Docker, tidak di-expose ke publik langsung (hanya backend yang bisa akses via Docker network).

---

## 13. Catatan Implementation (Untuk Developer)

### Backend (Go) - Struktur Folder Direkomendasikan
```
backend/
├── cmd/api/          # Entry point main.go
├── config/           # DB, JWT config
├── internal/
│   ├── handlers/     # HTTP handlers (Echo)
│   ├── services/     # Business logic (PDF generation, calculation)
│   ├── repository/   # DB operations (GORM)
│   ├── models/       # Structs & DB models
│   ├── middleware/   # Auth JWT
│   └── dto/          # Request/Response structs
├── templates/        # HTML templates for PDF
├── uploads/          # User logos
├── go.mod
└── Dockerfile
```

### Frontend (Next.js) - Struktur Folder
```
frontend/
├── app/
│   ├── (auth)/       # login, register
│   ├── (dashboard)/  # layout dengan sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── invoices/
│   │   ├── clients/
│   │   └── settings/
│   └── api/          # (opsional) Route handlers Next.js
├── components/ui/    # shadcn components
├── lib/
│   ├── api.ts        # Axios instance withCredentials
│   └── utils.ts
├── hooks/
├── types/
└── ...
```

---

Apakah kamu ingin saya lanjutkan dengan **membuatkan boilerplate code** untuk backend Go-nya (main.go + config + auth) atau **frontend Next.js** sesuai PRD ini? Saya juga bisa buatkan **template HTML invoice** yang siap render ke Gotenberg.
