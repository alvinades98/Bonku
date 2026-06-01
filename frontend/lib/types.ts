// Shared type definitions for the Invoice Generator app

export interface User {
  id: number
  email: string
  name: string
  company_name?: string
  company_address?: string
  company_phone?: string
  npwp?: string
  company_logo_path?: string
}

export interface Client {
  id: number
  user_id: number
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface InvoiceItem {
  id?: number
  invoice_id?: number
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled'

export interface Invoice {
  id: number
  user_id: number
  client_id: number
  invoice_number: string
  issue_date: string
  due_date: string
  status: InvoiceStatus
  subtotal: number
  tax_percent: number
  tax_amount: number
  total: number
  notes?: string
  client?: Client
  items: InvoiceItem[]
}

export interface DashboardStats {
  total_invoices: number
  outstanding: number
  paid: number
  month_total: number
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterData extends AuthCredentials {
  name: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
