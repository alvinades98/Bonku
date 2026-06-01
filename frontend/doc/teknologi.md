# Teknologi Frontend — Invoice Generator

Ringkasan teknologi yang digunakan untuk frontend (MVP → production-ready):

## Core Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 14.2.x | Framework utama (App Router) |
| **React** | 18.3.x | UI library |
| **TypeScript** | 5.6.x | Type safety (strict mode) |
| **Tailwind CSS** | 3.4.x | Styling (utility-first) |

## State & Data

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Zustand** | 4.5.x | Global state (user, small caches) |
| **TanStack Query** | _planned_ | Server state & caching |

## Forms & Validation (Planned)

| Teknologi | Kegunaan |
|-----------|----------|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |

## UI & UX (Planned)

| Teknologi | Kegunaan |
|-----------|----------|
| **shadcn/ui** | Component system |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |

## Dev Tools

| Teknologi | Kegunaan |
|-----------|----------|
| **ESLint** + `eslint-config-next` | Linting |
| **Prettier** | Formatting |
| **Vitest** | Unit testing (planned) |
| **Playwright** | E2E testing (planned) |

## Container

| Teknologi | Kegunaan |
|-----------|----------|
| **Docker** + **Docker Compose** | Containerization |
| **Node.js** | 20 (Alpine) — runtime |

---

## Arsitektur Frontend

```
frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Route group: login, register
│   │   ├── layout.tsx          # AuthLayout wrapper
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # Route group: protected pages
│   │   ├── layout.tsx          # DashboardLayout wrapper
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard overview
│   │       ├── invoices/       # Invoice CRUD
│   │       ├── clients/        # Client management
│   │       └── settings/       # Business profile
│   ├── layout.tsx              # Root layout (metadata, fonts)
│   ├── page.tsx                # Landing page
│   └── globals.css             # Tailwind directives
├── components/
│   ├── layout/                 # Layout components
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── DashboardSidebar.tsx
│   └── ui/                     # Reusable UI components (shadcn)
├── lib/
│   ├── api.ts                  # Typed API client + API modules
│   ├── store.ts                # Zustand global store
│   ├── types.ts                # Shared TypeScript interfaces
│   └── utils.ts                # Helper functions
├── public/                     # Static assets
├── doc/                        # Documentation
├── Dockerfile                  # Multi-stage Node 20 build
├── docker-compose.yml          # Frontend service
├── next.config.js              # Next.js config (standalone output)
├── tailwind.config.cjs         # Tailwind configuration
├── postcss.config.cjs          # PostCSS plugins
├── tsconfig.json               # TypeScript config
└── package.json
```

## Environment Variables

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL backend API | `http://localhost:8080/api/v1` |

Copy `.env.example` ke `.env.local` untuk development:
```bash
cp .env.example .env.local
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Docker

```bash
# Build & run
docker compose up --build

# Run in background
docker compose up -d

# Stop
docker compose down
```

## Production Deployment

Dockerfile menggunakan **multi-stage build** dengan **standalone output**:
- Stage 1 (`deps`): Install dependencies
- Stage 2 (`builder`): Build Next.js app
- Stage 3 (`runner`): Minimal image dengan `node server.js`

Hasil build standalone ada di `.next/standalone/` — hanya butuh Node.js runtime, tidak perlu install dependencies.

## Catatan Penting

- **PDF generation**: Frontend mengakses endpoint backend `/invoices/:id/pdf` yang menangani proses Gotenberg
- **Auth**: JWT disimpan di `httpOnly cookie` oleh backend. Frontend mengirim cookie via `credentials: 'include'`
- **Route groups**: `(auth)` dan `(dashboard)` memisahkan layout — auth pages centered, dashboard pakai sidebar
- **Client vs Server components**: Gunakan `'use client'` hanya saat butuh interaktivitas (forms, state, hooks)
