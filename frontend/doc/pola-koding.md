# Pola Koding & Konvensi — Frontend

Dokumen berisi pola koding dan konvensi untuk pengembangan frontend Invoice Generator.

---

## 1. Struktur Folder

```
app/                    # Route-level components (App Router)
├── (auth)/             #   Route group: login, register (no shared layout with dashboard)
├── (dashboard)/        #   Route group: protected pages dengan sidebar
│   └── dashboard/      #     URL path: /dashboard/*
components/
├── layout/             #   Layout components (AuthLayout, DashboardLayout, Sidebar)
└── ui/                 #   Reusable UI components (button, input, table, dll)
lib/
├── api.ts              #   API client + API modules (authApi, clientsApi, invoicesApi)
├── store.ts            #   Zustand global store
├── types.ts            #   Shared TypeScript interfaces
└── utils.ts            #   Helper functions (cn, formatCurrency, formatDate)
public/                 # Static assets (images, favicon)
doc/                    # Documentation
```

### Route Groups

- **`(auth)/`** — Halaman login & register. Layout: centered card, logo di atas.
- **`(dashboard)/`** — Halaman yang butuh authentication. Layout: sidebar kiri + konten utama.
- URL path tidak terpengaruh oleh route group — `(dashboard)/dashboard/` = `/dashboard/`

---

## 2. Komponen

### Aturan Umum

- Gunakan **TypeScript** dengan typing yang jelas (`interface Props { ... }`).
- Prefer **functional components** + hooks.
- Gunakan `'use client'` **hanya** saat butuh interaktivitas (state, hooks, event handlers).
- Komponen tanpa state/hooks = **Server Component** (default).

### Pola Komponen

```tsx
// ✅ Good: Props typing jelas
interface UserCardProps {
  name: string
  email: string
  avatarUrl?: string
}

export default function UserCard({ name, email, avatarUrl }: UserCardProps) {
  return (
    <div className="...">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  )
}
```

```tsx
// ✅ Good: Client component dengan 'use client'
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Naming Convention

- Komponen: **PascalCase** (`DashboardSidebar`, `UserCard`)
- File: **PascalCase** untuk komponen, **camelCase** untuk utilities
- Layout files: selalu `layout.tsx` (Next.js convention)
- Page files: selalu `page.tsx` (Next.js convention)

---

## 3. State Management

### Global State (Zustand)

Gunakan untuk data yang dibutuhkan di banyak komponen:

```ts
// lib/store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User } from './types'

interface AppState {
  user: User | null
  setUser: (u: User | null) => void
  clear: () => void
}

export const useStore = create<AppState>()(
  devtools((set) => ({
    user: null,
    setUser: (u) => set({ user: u }),
    clear: () => set({ user: null }),
  }))
)
```

**Kapan pakai Zustand:**
- User session/info
- UI state global (sidebar open/close, modal state)
- Small caches

**Kapan TIDAK pakai Zustand:**
- Data dari API → gunakan TanStack Query (planned)
- Form state → gunakan React Hook Form (planned)
- State lokal satu komponen → `useState`

---

## 4. Data Fetching

### API Client

Gunakan `lib/api.ts` yang sudah menyediakan typed API modules:

```ts
import { invoicesApi, authApi, ApiErrorClass } from '@/lib/api'

// List invoices
const invoices = await invoicesApi.list({ status: 'draft', page: 1, limit: 10 })

// Create invoice
const newInvoice = await invoicesApi.create({
  client_id: 1,
  items: [...],
})

// Login
const { user } = await authApi.login(email, password)

// Handle errors
try {
  await invoicesApi.get(123)
} catch (error) {
  if (error instanceof ApiErrorClass) {
    console.log(error.status)    // 401, 404, 500, dll
    console.log(error.message)   // User-friendly message
    console.log(error.errors)    // Field-level errors
  }
}
```

### API Modules yang Tersedia

| Module | Methods |
|--------|---------|
| `authApi` | `login`, `register`, `logout`, `me` |
| `clientsApi` | `list`, `get`, `create`, `update`, `delete` |
| `invoicesApi` | `list`, `get`, `create`, `update`, `delete`, `downloadPdf` |

### Kapan pakai fetch langsung?

Gunakan `apiFetch<T>()` langsung untuk endpoint yang belum ada module-nya:

```ts
const stats = await apiFetch<DashboardStats>('/dashboard/stats')
```

---

## 5. Forms & Validasi

### Current (Manual)

```tsx
'use client'

import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Call API
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {/* ... */}
    </form>
  )
}
```

### Planned (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

type LoginInput = z.infer<typeof loginSchema>

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginInput) => {
    await authApi.login(data.email, data.password)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      {/* ... */}
    </form>
  )
}
```

---

## 6. Error Handling

### API Errors

```ts
try {
  const invoice = await invoicesApi.get(id)
} catch (error) {
  if (error instanceof ApiErrorClass) {
    switch (error.status) {
      case 401:
        // Redirect to login
        router.push('/login')
        break
      case 404:
        // Not found
        break
      case 422:
        // Validation errors
        console.log(error.errors) // { email: ['Email already exists'] }
        break
      default:
        // Server error
    }
  }
}
```

### UI Error Handling

- Tampilkan pesan yang **user-friendly**
- Log detail error di console untuk debugging
- Gunakan **toast notifications** (Sonner — planned) untuk success/error feedback

---

## 7. Typing & Models

Semua type definitions ada di `lib/types.ts`:

```ts
// ✅ Good: Gunakan interface dari types.ts
import type { Invoice, Client, InvoiceItem } from '@/lib/types'

// ✅ Good: Generic API response
const data = await apiFetch<ApiResponse<Invoice>>('/invoices/1')

// ❌ Bad: Hindari 'any'
const data: any = await fetch('/invoices/1') // NO

// ✅ Good: Gunakan 'unknown' lalu validasi
const data: unknown = await fetch('/invoices/1')
if (isInvoice(data)) { /* safe to use */ }
```

### Type yang Tersedia

| Type | Deskripsi |
|------|-----------|
| `User` | Data user/bisnis |
| `Client` | Data klien |
| `Invoice` | Data invoice lengkap |
| `InvoiceItem` | Item dalam invoice |
| `InvoiceStatus` | `'draft' \| 'sent' \| 'paid' \| 'cancelled'` |
| `DashboardStats` | Statistik dashboard |
| `ApiResponse<T>` | Wrapper response API |
| `ApiError` | Error response dari API |

---

## 8. Styling

### Tailwind CSS

Gunakan utility classes langsung di JSX:

```tsx
// ✅ Good: Konsisten dengan design tokens
<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  <h2 className="text-base font-medium text-slate-800">Title</h2>
  <p className="text-sm text-slate-500 mt-1">Description</p>
</div>
```

### Utility Helper

```ts
// lib/utils.ts
import { cn } from '@/lib/utils'

// Conditional classes
<div className={cn(
  'px-4 py-2 rounded',
  isActive && 'bg-indigo-600 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)} />
```

### Format Helpers

```ts
import { formatCurrency, formatDate } from '@/lib/utils'

formatCurrency(5000000)  // "Rp 5.000.000"
formatDate('2024-01-15') // "15 Januari 2024"
```

---

## 9. Link & Navigation

### Gunakan Next.js Link

```tsx
// ✅ Good: Client-side navigation
import Link from 'next/link'

<Link href="/dashboard/invoices" className="...">
  Invoices
</Link>

// ❌ Bad: Full page reload
<a href="/dashboard/invoices">Invoices</a>
```

### Programmatic Navigation

```tsx
'use client'

import { useRouter } from 'next/navigation'

const router = useRouter()

// After login
router.push('/dashboard')

// Go back
router.back()
```

---

## 10. Testing & Quality

### Linting

```bash
npm run lint  # ESLint + eslint-config-next
```

### Planned

- **Unit tests**: Vitest untuk utility functions
- **Component tests**: Testing Library
- **E2E tests**: Playwright untuk critical flows (login, create invoice)

### Pre-commit (Planned)

- Husky + lint-staged untuk auto-lint sebelum commit

---

## 11. Git & Workflow

- **Branch per fitur**: `feature/invoice-form`, `fix/auth-redirect`
- **Commit messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **PR review**: Minimal 1 approval sebelum merge

---

## 12. Accessibility

- Gunakan **semantic HTML** (`<main>`, `<nav>`, `<form>`, `<button>`)
- **Label** pada semua form inputs
- **Focus management** untuk modals dan navigasi
- **Color contrast** yang memadai (Tailwind default sudah bagus)

---

## 13. Notes untuk Pengembang Baru

1. **Setup**: Lihat `doc/setup.md` untuk panduan lengkap
2. **Environment**: Copy `.env.example` ke `.env.local`
3. **API Client**: Cek `lib/api.ts` untuk semua endpoint yang tersedia
4. **Types**: Semua interface ada di `lib/types.ts`
5. **Layout**: Auth pages pakai `(auth)/layout.tsx`, dashboard pakai `(dashboard)/layout.tsx`
6. **Styling**: Gunakan Tailwind classes, konsisten dengan pattern yang ada
7. **Backend**: API spec ada di `../prd.md` bagian API Specification
