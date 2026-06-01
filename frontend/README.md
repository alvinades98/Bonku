# Invoice Generator — Frontend

Frontend untuk Invoice Generator Micro-SaaS, dibangun dengan **Next.js 14 (App Router)**, **TypeScript**, dan **Tailwind CSS**.

---

## 📋 Fitur

- ✅ Authentication (Login/Register)
- ✅ Dashboard dengan statistik
- ✅ Invoice management (CRUD)
- ✅ Client management (CRUD)
- ✅ Business profile & settings
- ✅ Invoice preview
- ✅ PDF download (via backend)
- 🚧 React Hook Form + Zod validation (planned)
- 🚧 TanStack Query for caching (planned)
- 🚧 shadcn/ui components (planned)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x
- **npm** 10.x

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Run development server
npm run dev
```

Buka **http://localhost:3000** di browser.

### Docker

```bash
docker compose up --build
```

---

## 📚 Dokumentasi

Dokumentasi lengkap ada di folder `doc/`:

| Dokumen | Link |
|---------|------|
| **Index** | [doc/index.md](doc/index.md) |
| Setup & Running | [doc/setup.md](doc/setup.md) |
| Teknologi | [doc/teknologi.md](doc/teknologi.md) |
| Pola Koding | [doc/pola-koding.md](doc/pola-koding.md) |
| API Client Guide | [doc/api-guide.md](doc/api-guide.md) |

**Pengembang baru?** Mulai dari [doc/setup.md](doc/setup.md).

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript 5.6 (strict) |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4.5 |
| API | Custom fetch client (typed) |
| Container | Docker + Docker Compose |

---

## 📁 Struktur Project

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/             #   Login & register (route group)
│   ├── (dashboard)/        #   Protected pages (route group)
│   │   └── dashboard/      #     /dashboard/* pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── layout/             # Layout components
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── DashboardSidebar.tsx
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── api.ts              # Typed API client
│   ├── store.ts            # Zustand store
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helper functions
├── public/                 # Static assets
├── doc/                    # Documentation
├── Dockerfile              # Multi-stage Node 20 build
├── docker-compose.yml      # Docker service
└── package.json
```

---

## 📜 Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint check |

---

## 🔗 Links

- [PRD (Product Requirements Document)](../prd.md)
- [Backend Repository](../backend/) (jika ada)

---

## 📄 License

Private — Invoice Generator Micro-SaaS
