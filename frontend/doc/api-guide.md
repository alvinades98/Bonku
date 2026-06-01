# API Client Guide — Frontend

Panduan lengkap penggunaan API client di frontend Invoice Generator.

---

## Overview

API client ada di `lib/api.ts` dan menyediakan:

1. **`apiFetch<T>()`** — Fungsi fetch generic dengan type safety
2. **API Modules** — Kumpulan fungsi typed untuk setiap resource
3. **`ApiErrorClass`** — Custom error class dengan status code & field errors

---

## Import

```ts
// Import semua yang dibutuhkan dari satu file
import {
  apiFetch,
  authApi,
  clientsApi,
  invoicesApi,
  ApiErrorClass,
} from '@/lib/api'

// Import types
import type {
  User,
  Client,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  DashboardStats,
  ApiResponse,
  ApiError,
} from '@/lib/types'
```

---

## apiFetch<T>()

Fungsi fetch dasar dengan TypeScript generics dan error handling.

### Signature

```ts
async function apiFetch<T>(
  path: string,
  opts?: FetchOptions
): Promise<T>
```

### Parameters

| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `path` | `string` | ✅ | API path (tanpa base URL) |
| `opts` | `FetchOptions` | ❌ | Fetch options (method, body, headers) |

### Returns

- **Success**: Response JSON yang sudah di-parse sebagai type `T`
- **204 No Content**: Returns `undefined`
- **Error**: Throws `ApiErrorClass`

### Examples

```ts
// GET request
const clients = await apiFetch<Client[]>('/clients')

// POST request
const newClient = await apiFetch<Client>('/clients', {
  method: 'POST',
  body: JSON.stringify({
    name: 'PT Maju Jaya',
    email: 'info@majujaya.com',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 123',
  }),
})

// PUT request
const updatedClient = await apiFetch<Client>(`/clients/${id}`, {
  method: 'PUT',
  body: JSON.stringify({ name: 'PT Maju Jaya Baru' }),
})

// DELETE request
await apiFetch(`/clients/${id}`, { method: 'DELETE' })

// With query params (manual)
const invoices = await apiFetch<Invoice[]>('/invoices?status=draft&page=1')
```

---

## API Modules

### authApi

Autentikasi & user management.

```ts
import { authApi } from '@/lib/api'
```

| Method | Parameters | Returns | Deskripsi |
|--------|-----------|---------|-----------|
| `login` | `email: string`, `password: string` | `{ token, user }` | Login user |
| `register` | `name: string`, `email: string`, `password: string` | `{ user }` | Register user baru |
| `logout` | — | `void` | Logout user |
| `me` | — | `User` | Get current user data |

#### Contoh Penggunaan

```ts
// Login
try {
  const { user } = await authApi.login('user@example.com', 'password123')
  console.log('Logged in as:', user.name)
  // Redirect to dashboard
  router.push('/dashboard')
} catch (error) {
  if (error instanceof ApiErrorClass) {
    console.error('Login failed:', error.message)
  }
}

// Register
try {
  const { user } = await authApi.register(
    'John Doe',
    'john@example.com',
    'password123'
  )
  console.log('Registered:', user.name)
} catch (error) {
  if (error instanceof ApiErrorClass && error.status === 422) {
    console.log('Validation errors:', error.errors)
    // { email: ['Email already exists'] }
  }
}

// Get current user
try {
  const user = await authApi.me()
  console.log('Current user:', user.name)
} catch (error) {
  if (error instanceof ApiErrorClass && error.status === 401) {
    // Not authenticated
    router.push('/login')
  }
}

// Logout
await authApi.logout()
router.push('/login')
```

---

### clientsApi

Client management (CRUD).

```ts
import { clientsApi } from '@/lib/api'
```

| Method | Parameters | Returns | Deskripsi |
|--------|-----------|---------|-----------|
| `list` | — | `Client[]` | Get semua klien |
| `get` | `id: number` | `Client` | Get detail klien |
| `create` | `data: object` | `Client` | Buat klien baru |
| `update` | `id: number`, `data: object` | `Client` | Update klien |
| `delete` | `id: number` | `void` | Hapus klien |

#### Contoh Penggunaan

```ts
// List all clients
const clients = await clientsApi.list()
console.log('Total clients:', clients.length)

// Get client detail
const client = await clientsApi.get(1)
console.log('Client:', client.name)

// Create new client
const newClient = await clientsApi.create({
  name: 'PT Teknologi Indonesia',
  email: 'contact@tekindo.com',
  phone: '081234567890',
  address: 'Jl. Gatot Subroto No. 45, Jakarta',
})
console.log('Created client with ID:', newClient.id)

// Update client
const updated = await clientsApi.update(1, {
  name: 'PT Teknologi Indonesia Tbk',
  phone: '081987654321',
})

// Delete client
await clientsApi.delete(1)
```

---

### invoicesApi

Invoice management (CRUD + PDF).

```ts
import { invoicesApi } from '@/lib/api'
```

| Method | Parameters | Returns | Deskripsi |
|--------|-----------|---------|-----------|
| `list` | `params?` | `Invoice[]` | Get semua invoice |
| `get` | `id: number` | `Invoice` | Get detail invoice |
| `create` | `data: object` | `Invoice` | Buat invoice baru |
| `update` | `id: number`, `data: object` | `Invoice` | Update invoice |
| `delete` | `id: number` | `void` | Hapus invoice |
| `downloadPdf` | `id: number` | `string` | Get URL PDF download |

#### List Parameters

| Parameter | Type | Deskripsi |
|-----------|------|-----------|
| `status` | `string` | Filter by status (`draft`, `sent`, `paid`, `cancelled`) |
| `page` | `number` | Page number |
| `limit` | `number` | Items per page |

#### Contoh Penggunaan

```ts
// List all invoices
const invoices = await invoicesApi.list()

// List with filters
const draftInvoices = await invoicesApi.list({
  status: 'draft',
  page: 1,
  limit: 20,
})

// Get invoice detail (includes client & items)
const invoice = await invoicesApi.get(1)
console.log('Invoice:', invoice.invoice_number)
console.log('Client:', invoice.client?.name)
console.log('Items:', invoice.items.length)
console.log('Total:', invoice.total)

// Create new invoice
const newInvoice = await invoicesApi.create({
  client_id: 1,
  invoice_number: 'INV-001',
  issue_date: '2024-01-15',
  due_date: '2024-02-15',
  status: 'draft',
  items: [
    {
      description: 'Web Development',
      quantity: 1,
      unit_price: 5000000,
      amount: 5000000,
    },
    {
      description: 'UI/UX Design',
      quantity: 10,
      unit_price: 500000,
      amount: 5000000,
    },
  ],
  notes: 'Pembayaran via transfer BCA',
  tax_percent: 11,
})

// Update invoice
const updated = await invoicesApi.update(1, {
  status: 'sent',
  notes: 'Sudah dikirim via email',
})

// Delete invoice
await invoicesApi.delete(1)

// Download PDF
const pdfUrl = invoicesApi.downloadPdf(1)
window.open(pdfUrl, '_blank')
```

---

## Error Handling

### ApiErrorClass

Semua API errors throw `ApiErrorClass` yang memiliki:

| Property | Type | Deskripsi |
|----------|------|-----------|
| `status` | `number` | HTTP status code (400, 401, 404, 422, 500) |
| `message` | `string` | User-friendly error message |
| `errors` | `Record<string, string[]>` | Field-level validation errors (jika ada) |

### Pola Error Handling

```ts
import { ApiErrorClass } from '@/lib/api'

async function loadData() {
  try {
    const invoices = await invoicesApi.list()
    // Success handling
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      switch (error.status) {
        case 401:
          // Unauthorized — redirect to login
          router.push('/login')
          break

        case 403:
          // Forbidden
          console.error('Access denied')
          break

        case 404:
          // Not found
          console.error('Resource not found')
          break

        case 422:
          // Validation error
          console.error('Validation failed:', error.errors)
          // error.errors = { email: ['Email already exists'] }
          break

        case 500:
          // Server error
          console.error('Server error:', error.message)
          break

        default:
          console.error('Unknown error:', error.message)
      }
    } else {
      // Non-API error (network, etc)
      console.error('Network error:', error)
    }
  }
}
```

### Error Handling di Component

```tsx
'use client'

import { useState } from 'react'
import { authApi, ApiErrorClass } from '@/lib/api'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    try {
      await authApi.login(email, password)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message)
        if (err.errors) {
          setFieldErrors(err.errors)
        }
      } else {
        setError('Terjadi kesalahan. Coba lagi.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label>Email</label>
        <input type="email" name="email" />
        {fieldErrors.email && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.email[0]}</p>
        )}
      </div>

      {/* ... */}
    </form>
  )
}
```

---

## Type Safety

### Menggunakan Types dari lib/types.ts

```ts
import type { Invoice, Client, InvoiceItem, InvoiceStatus } from '@/lib/types'

// Typed API response
const invoices = await invoicesApi.list()
// invoices: Invoice[] — autocomplete & type checking!

// Type guard untuk status
const status: InvoiceStatus = 'draft' // ✅ Valid
const invalid: InvoiceStatus = 'pending' // ❌ Type error
```

### Custom Types untuk Form Input

```ts
// Form input type (bisa berbeda dari API response type)
interface CreateInvoiceInput {
  client_id: number
  invoice_number: string
  issue_date: string
  due_date: string
  items: {
    description: string
    quantity: number
    unit_price: number
  }[]
  notes?: string
  tax_percent?: number
}

// Convert form data to API format
const handleSubmit = async (formData: CreateInvoiceInput) => {
  const apiData = {
    ...formData,
    items: formData.items.map(item => ({
      ...item,
      amount: item.quantity * item.unit_price,
    })),
  }

  const invoice = await invoicesApi.create(apiData)
}
```

---

## Best Practices

### 1. Selalu Handle Errors

```ts
// ❌ Bad: No error handling
const data = await invoicesApi.list()

// ✅ Good: With try-catch
try {
  const data = await invoicesApi.list()
} catch (error) {
  // Handle appropriately
}
```

### 2. Gunakan Type dari lib/types.ts

```ts
// ❌ Bad: No typing
const invoice = await invoicesApi.get(1)
console.log(invoice.total) // Could be anything

// ✅ Good: Typed
const invoice = await invoicesApi.get(1)
// invoice: Invoice — autocomplete works!
```

### 3. Loading State untuk UX

```tsx
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await invoicesApi.create(data)
  } finally {
    setIsLoading(false)
  }
}

// In JSX
<button disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>
```

### 4. Optimistic Updates (Planned dengan TanStack Query)

```ts
// Saat TanStack Query diimplementasi:
await queryClient.invalidateQueries({ queryKey: ['invoices'] })
```

---

## Environment

API URL diatur di environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Default fallback jika tidak diset: `http://localhost:8080/api/v1`

### Cek Current API URL

```ts
console.log(process.env.NEXT_PUBLIC_API_URL)
```

---

## Authentication Flow

```
1. User login di /login
   ↓
2. authApi.login(email, password) → POST /auth/login
   ↓
3. Backend set JWT di httpOnly cookie
   ↓
4. Redirect ke /dashboard
   ↓
5. Setiap request selanjutnya otomatis include cookie
   ↓
6. Jika 401 → redirect ke /login
```

### Proteksi Halaman (Planned)

```ts
// middleware.ts (Next.js Middleware)
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*',
}
```
