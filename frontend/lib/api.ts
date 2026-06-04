import type {
  User,
  Client,
  Invoice,
  DashboardStats,
  ApiError,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export function getUploadUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = API_URL.replace(/\/api\/v1\/?$/, '')
  return `${base}${path}`
}

export class ApiErrorClass extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { headers = {}, ...restOpts } = opts

  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOpts,
  })

  if (!res.ok) {
    let errorBody: ApiError | null = null
    try {
      errorBody = await res.json()
    } catch {
      // Ignore if response is not JSON
    }

    throw new ApiErrorClass(
      res.status,
      errorBody?.message || `API error: ${res.status} ${res.statusText}`,
      errorBody?.errors
    )
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiFetch<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),

  me: () => apiFetch<User>('/auth/me'),

  updateProfile: (data: {
    name: string
    company_name?: string
    company_address?: string
    company_phone?: string
    npwp?: string
    company_logo_path?: string
  }) => apiFetch<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  uploadLogo: async (file: File): Promise<{ path: string }> => {
    const formData = new FormData()
    formData.append('logo', file)
    const res = await fetch(`${API_URL}/auth/upload-logo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    if (!res.ok) {
      let errorBody: ApiError | null = null
      try {
        errorBody = await res.json()
      } catch {
        // ignore
      }
      throw new ApiErrorClass(
        res.status,
        errorBody?.message || `Upload failed: ${res.status}`,
        errorBody?.errors
      )
    }
    return res.json()
  },
}

// Clients API
export const clientsApi = {
  list: () => apiFetch<Client[]>('/clients'),
  get: (id: number) => apiFetch<Client>(`/clients/${id}`),
  create: (data: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
    apiFetch<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) =>
    apiFetch<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<void>(`/clients/${id}`, { method: 'DELETE' }),
}

// Invoices API
export const invoicesApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return apiFetch<Invoice[]>(`/invoices${qs ? `?${qs}` : ''}`)
  },
  get: (id: number) => apiFetch<Invoice>(`/invoices/${id}`),
  create: (data: {
    client_id: number
    invoice_number: string
    issue_date: string
    due_date: string
    status?: string
    items: { description: string; quantity: number; unit_price: number; amount: number }[]
    notes?: string
    tax_percent: number
  }) => apiFetch<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{
    client_id: number
    invoice_number: string
    issue_date: string
    due_date: string
    status: string
    items: { description: string; quantity: number; unit_price: number; amount: number }[]
    notes: string
    tax_percent: number
  }>) => apiFetch<Invoice>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<void>(`/invoices/${id}`, { method: 'DELETE' }),
  downloadPdf: (id: number) => `${API_URL}/invoices/${id}/pdf`,
}

// Dashboard API
export const dashboardApi = {
  stats: () => apiFetch<DashboardStats>('/dashboard/stats'),
}

export default apiFetch
