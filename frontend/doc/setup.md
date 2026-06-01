# Setup & Running — Frontend

Panduan lengkap untuk menjalankan frontend Invoice Generator secara lokal.

---

## Prerequisites

| Software | Versi Minimum | Cara Install |
|----------|---------------|--------------|
| **Node.js** | 20.x | [nvm](https://github.com/nvm-sh/nvm) atau [official installer](https://nodejs.org) |
| **npm** | 10.x | Otomatis terinstall dengan Node.js |
| **Docker** (opsional) | 24.x | [Docker Desktop](https://www.docker.com/products/docker-desktop) |

### Cek Versi

```bash
node --version   # v20.x.x
npm --version    # 10.x.x
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` jika backend URL berbeda:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di **http://localhost:3000**

### 4. Buka di Browser

Buka **http://localhost:3000** — kamu akan melihat landing page.

---

## Scripts yang Tersedia

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan development server dengan hot reload |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server (setelah build) |
| `npm run lint` | Jalankan ESLint untuk cek code quality |

---

## Docker

### Jalankan dengan Docker Compose

```bash
docker compose up --build
```

### Jalankan di Background

```bash
docker compose up -d
```

### Lihat Logs

```bash
docker compose logs -f frontend
```

### Stop

```bash
docker compose down
```

### Rebuild (setelah perubahan)

```bash
docker compose up --build -d
```

---

## Development Workflow

### 1. Buat Branch Baru

```bash
git checkout -b feature/nama-fitur
```

### 2. Jalankan Linting Sebelum Commit

```bash
npm run lint
```

### 3. Test Build

```bash
npm run build
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

### Port 3000 Sudah Digunakan

```bash
# Cari proses yang pakai port 3000
lsof -i :3000

# Kill proses
kill -9 <PID>

# Atau pakai port lain
PORT=3001 npm run dev
```

### Build Error: Module Not Found

```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Error

```bash
# Cek TypeScript version
npx tsc --version

# Rebuild types
rm -rf .next
npm run build
```

### API Connection Refused

Pastikan backend sudah berjalan:

```bash
# Cek backend
curl http://localhost:8080/api/v1/auth/me

# Atau cek docker
docker ps | grep backend
```

---

## Struktur Project

```
frontend/
├── app/                    # Next.js App Router (pages & layouts)
│   ├── (auth)/             #   Login & register pages
│   ├── (dashboard)/        #   Protected pages dengan sidebar
│   ├── layout.tsx          #   Root layout
│   └── page.tsx            #   Landing page
├── components/
│   ├── layout/             #   Layout components
│   └── ui/                 #   Reusable UI components
├── lib/
│   ├── api.ts              #   API client
│   ├── store.ts            #   Zustand store
│   ├── types.ts            #   TypeScript types
│   └── utils.ts            #   Helper functions
├── public/                 # Static assets
├── doc/                    # Documentation
├── .env.example            # Environment variables template
├── Dockerfile              # Docker build config
├── docker-compose.yml      # Docker Compose service
└── package.json            # Dependencies & scripts
```

---

## Backend Connection

Frontend mengharapkan backend berjalan di `http://localhost:8080`.

### Backend Endpoints (yang digunakan frontend)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/auth/register` | POST | Register user baru |
| `/auth/login` | POST | Login & set JWT cookie |
| `/auth/logout` | POST | Logout & clear cookie |
| `/auth/me` | GET | Get current user data |
| `/clients` | GET | List semua klien |
| `/clients` | POST | Buat klien baru |
| `/clients/:id` | PUT | Update klien |
| `/clients/:id` | DELETE | Hapus klien |
| `/invoices` | GET | List semua invoice |
| `/invoices` | POST | Buat invoice baru |
| `/invoices/:id` | GET | Detail invoice |
| `/invoices/:id` | PUT | Update invoice |
| `/invoices/:id` | DELETE | Hapus invoice |
| `/invoices/:id/pdf` | GET | Download PDF invoice |

### CORS

Backend harus mengizinkan origin `http://localhost:3000`. Pastikan CORS config di backend sudah benar.

### Cookies

Backend menggunakan `httpOnly cookie` untuk JWT. Frontend mengirim cookie otomatis via `credentials: 'include'`.

---

## Production Build

### Local Production Build

```bash
# Build
npm run build

# Jalankan
npm run start
```

### Docker Production

```bash
docker compose up -d
```

Dockerfile menggunakan **multi-stage build** dan **standalone output** — image yang dihasilkan minimal dan efisien.

---

## Dokumentasi Lainnya

- [Teknologi](teknologi.md) — Stack & arsitektur
- [Pola Koding](pola-koding.md) — Konvensi & best practices
- [PRD](../prd.md) — Product Requirements Document
